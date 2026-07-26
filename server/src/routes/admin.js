import { Router } from 'express'
import { pool } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { creditWallet, debitWallet, ah } from '../lib/wallet.js'
import { extractYouTubeId } from '../lib/youtube.js'

const router = Router()
router.use(authenticate, requireRole('admin'))

/* ───────── Dashboard ───────── */
router.get('/stats', ah(async (req, res) => {
  const [[s]] = await pool.query(`SELECT
      (SELECT COUNT(*) FROM members WHERE status='active')  AS active_members,
      (SELECT COUNT(*) FROM members WHERE status='pending') AS pending_members,
      (SELECT COALESCE(SUM(wallet_balance),0) FROM members) AS total_wallet,
      (SELECT COUNT(*) FROM room_bookings  WHERE status='confirmed' AND check_out >= CURDATE()) AS upcoming_stays,
      (SELECT COUNT(*) FROM table_bookings WHERE booking_date = CURDATE()) AS tables_today,
      (SELECT COUNT(*) FROM play_bookings  WHERE booking_date = CURDATE()) AS play_today`)
  res.json(s)
}))

/* ───────── Members ───────── */
router.get('/members', ah(async (req, res) => {
  const { status } = req.query
  const params = []
  let sql = `SELECT m.id, m.member_no, m.name, m.email, m.phone, m.status, m.wallet_balance,
                    m.joined_at, mt.name AS membership_type, m.created_at
               FROM members m LEFT JOIN membership_types mt ON mt.id = m.membership_type_id`
  if (status) { sql += ' WHERE m.status = ?'; params.push(status) }
  sql += ' ORDER BY m.created_at DESC'
  const [rows] = await pool.query(sql, params)
  res.json(rows)
}))

router.get('/members/:id', ah(async (req, res) => {
  const [[m]] = await pool.query(
    `SELECT m.*, mt.name AS membership_type FROM members m
       LEFT JOIN membership_types mt ON mt.id = m.membership_type_id WHERE m.id = ?`, [req.params.id])
  if (!m) return res.status(404).json({ error: 'Member not found' })
  delete m.password_hash
  const [tx] = await pool.query(
    'SELECT id, type, amount, balance_after, reason, created_at FROM wallet_transactions WHERE member_id = ? ORDER BY id DESC LIMIT 30', [req.params.id])
  res.json({ member: m, transactions: tx })
}))

/* Approve → active, assign member number + plan */
router.post('/members/:id/approve', ah(async (req, res) => {
  const { membership_type_id } = req.body || {}
  const [[m]] = await pool.query('SELECT id, status FROM members WHERE id = ?', [req.params.id])
  if (!m) return res.status(404).json({ error: 'Member not found' })
  const memberNo = 'CC-' + String(m.id).padStart(4, '0')
  await pool.query(
    `UPDATE members SET status='active', member_no = COALESCE(member_no, ?),
        membership_type_id = ?, joined_at = COALESCE(joined_at, CURDATE()),
        approved_by = ?, approved_at = NOW() WHERE id = ?`,
    [memberNo, membership_type_id || null, req.user.id, req.params.id])
  res.json({ id: m.id, status: 'active', member_no: memberNo })
}))

router.post('/members/:id/reject', ah(async (req, res) => {
  await pool.query("UPDATE members SET status='rejected' WHERE id = ?", [req.params.id])
  res.json({ id: Number(req.params.id), status: 'rejected' })
}))

router.post('/members/:id/status', ah(async (req, res) => {
  const { status } = req.body || {}
  if (!['active', 'suspended'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  await pool.query('UPDATE members SET status = ? WHERE id = ?', [status, req.params.id])
  res.json({ id: Number(req.params.id), status })
}))

/* Wallet top-up (credit) */
router.post('/members/:id/wallet/topup', ah(async (req, res) => {
  const { amount, reason } = req.body || {}
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const balance = await creditWallet(conn, req.params.id, amount,
      { reason: reason || 'Wallet top-up', refType: 'topup', createdBy: req.user.id })
    await conn.commit()
    res.json({ member_id: Number(req.params.id), wallet_balance: balance })
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
}))

/* Raise a charge on a member. deduct=true also debits the wallet now. */
router.post('/members/:id/charge', ah(async (req, res) => {
  const { amount, description, category, deduct } = req.body || {}
  if (!(Number(amount) > 0)) return res.status(400).json({ error: 'A positive amount is required' })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [ins] = await conn.query(
      'INSERT INTO charges (member_id, category, description, amount, status, created_by) VALUES (?,?,?,?,?,?)',
      [req.params.id, category || null, description || null, amount, deduct ? 'paid' : 'unpaid', req.user.id])
    let balance
    if (deduct)
      balance = await debitWallet(conn, req.params.id, amount,
        { reason: description || `Charge: ${category || 'misc'}`, refType: 'charge', refId: ins.insertId, createdBy: req.user.id })
    await conn.commit()
    res.status(201).json({ id: ins.insertId, wallet_balance: balance })
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
}))

router.get('/membership-types', ah(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM membership_types WHERE is_active = 1 ORDER BY id')
  res.json(rows)
}))

/* ───────── Bookings ───────── */
router.get('/bookings/rooms', ah(async (req, res) => {
  const date = req.query.date // rooms occupied on this date
  const params = []
  let sql = `SELECT rb.id, r.name AS room, m.name AS member, m.member_no,
                    rb.check_in, rb.check_out, rb.nights, rb.guests, rb.total_amount, rb.status
               FROM room_bookings rb JOIN rooms r ON r.id = rb.room_id JOIN members m ON m.id = rb.member_id`
  if (date) { sql += ` WHERE rb.status='confirmed' AND ? >= rb.check_in AND ? < rb.check_out`; params.push(date, date) }
  sql += ' ORDER BY rb.check_in DESC LIMIT 200'
  const [rows] = await pool.query(sql, params)
  res.json(rows)
}))

router.get('/bookings', ah(async (req, res) => {
  const [tables] = await pool.query(
    `SELECT tb.id, tb.venue, m.name AS member, tb.booking_date, tb.booking_time, tb.party_size, tb.status
       FROM table_bookings tb JOIN members m ON m.id = tb.member_id ORDER BY tb.id DESC LIMIT 100`)
  const [play] = await pool.query(
    `SELECT pb.id, pa.name AS area, m.name AS member, pb.booking_date, pb.start_time, pb.charge_amount, pb.status
       FROM play_bookings pb JOIN play_areas pa ON pa.id = pb.play_area_id JOIN members m ON m.id = pb.member_id
      ORDER BY pb.id DESC LIMIT 100`)
  res.json({ tables, play })
}))

/* ───────── Generic CRUD helper ───────── */
function crud(path, table, fields) {
  router.get(path, ah(async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`)
    res.json(rows)
  }))
  router.post(path, ah(async (req, res) => {
    const cols = fields.filter(f => req.body[f] !== undefined)
    if (!cols.length) return res.status(400).json({ error: 'No fields provided' })
    const [r] = await pool.query(
      `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
      cols.map(f => req.body[f]))
    res.status(201).json({ id: r.insertId })
  }))
  router.put(`${path}/:id`, ah(async (req, res) => {
    const cols = fields.filter(f => req.body[f] !== undefined)
    if (!cols.length) return res.status(400).json({ error: 'No fields to update' })
    await pool.query(
      `UPDATE ${table} SET ${cols.map(c => `${c}=?`).join(',')} WHERE id = ?`,
      [...cols.map(f => req.body[f]), req.params.id])
    res.json({ id: Number(req.params.id) })
  }))
  router.delete(`${path}/:id`, ah(async (req, res) => {
    await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id])
    res.json({ deleted: Number(req.params.id) })
  }))
}

/* Rooms, play areas, gallery, events — full CRUD (admin can add / edit price / remove) */
crud('/rooms', 'rooms', ['name', 'room_type', 'description', 'price_per_night', 'capacity', 'image_url', 'is_active'])
crud('/play-areas', 'play_areas', ['name', 'description', 'charge', 'charge_unit', 'image_url', 'is_active'])
crud('/gallery', 'gallery_images', ['title', 'image_url', 'category'])
crud('/events', 'events', ['title', 'description', 'event_date', 'image_url', 'is_published'])

/* ───────── YouTube videos (admin adds a link; id is auto-extracted) ───────── */
router.get('/videos', ah(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM videos ORDER BY sort ASC, id ASC')
  res.json(rows)
}))
router.post('/videos', ah(async (req, res) => {
  const { title, youtube_url, sort } = req.body || {}
  const yid = extractYouTubeId(youtube_url)
  if (!title || !yid) return res.status(400).json({ error: 'A title and a valid YouTube link are required' })
  const [r] = await pool.query(
    'INSERT INTO videos (title, youtube_id, youtube_url, sort, created_by) VALUES (?,?,?,?,?)',
    [title, yid, youtube_url, sort || 0, req.user.id])
  res.status(201).json({ id: r.insertId, youtube_id: yid })
}))
router.put('/videos/:id', ah(async (req, res) => {
  const { title, youtube_url, sort, is_published } = req.body || {}
  const sets = [], vals = []
  if (title !== undefined) { sets.push('title=?'); vals.push(title) }
  if (youtube_url !== undefined) {
    const yid = extractYouTubeId(youtube_url)
    if (!yid) return res.status(400).json({ error: 'Invalid YouTube link' })
    sets.push('youtube_url=?', 'youtube_id=?'); vals.push(youtube_url, yid)
  }
  if (sort !== undefined) { sets.push('sort=?'); vals.push(sort) }
  if (is_published !== undefined) { sets.push('is_published=?'); vals.push(is_published ? 1 : 0) }
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' })
  vals.push(req.params.id)
  await pool.query(`UPDATE videos SET ${sets.join(',')} WHERE id = ?`, vals)
  res.json({ id: Number(req.params.id) })
}))
router.delete('/videos/:id', ah(async (req, res) => {
  await pool.query('DELETE FROM videos WHERE id = ?', [req.params.id])
  res.json({ deleted: Number(req.params.id) })
}))

/* ───────── Menu (menu / liquor / price changes) ───────── */
router.get('/menu', ah(async (req, res) => {
  const [items] = await pool.query(
    `SELECT mi.*, mc.venue, mc.name AS category FROM menu_items mi
       JOIN menu_categories mc ON mc.id = mi.category_id ORDER BY mc.venue, mc.name, mi.name`)
  const [cats] = await pool.query('SELECT * FROM menu_categories ORDER BY venue, name')
  res.json({ items, categories: cats })
}))
router.post('/menu/category', ah(async (req, res) => {
  const { venue, name } = req.body || {}
  if (!venue || !name) return res.status(400).json({ error: 'venue and name are required' })
  const [r] = await pool.query('INSERT INTO menu_categories (venue, name) VALUES (?,?)', [venue, name])
  res.status(201).json({ id: r.insertId })
}))
router.post('/menu', ah(async (req, res) => {
  const { category_id, name, description, price, is_liquor, is_available } = req.body || {}
  if (!category_id || !name || price === undefined) return res.status(400).json({ error: 'category, name and price are required' })
  const [r] = await pool.query(
    'INSERT INTO menu_items (category_id, name, description, price, is_liquor, is_available) VALUES (?,?,?,?,?,?)',
    [category_id, name, description || null, price, is_liquor ? 1 : 0, is_available === undefined ? 1 : (is_available ? 1 : 0)])
  res.status(201).json({ id: r.insertId })
}))
router.put('/menu/:id', ah(async (req, res) => {
  const fields = ['name', 'description', 'price', 'is_liquor', 'is_available', 'category_id']
  const cols = fields.filter(f => req.body[f] !== undefined)
  if (!cols.length) return res.status(400).json({ error: 'No fields to update' })
  await pool.query(`UPDATE menu_items SET ${cols.map(c => `${c}=?`).join(',')} WHERE id = ?`,
    [...cols.map(f => req.body[f]), req.params.id])
  res.json({ id: Number(req.params.id) })
}))
router.delete('/menu/:id', ah(async (req, res) => {
  await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id])
  res.json({ deleted: Number(req.params.id) })
}))

export default router
