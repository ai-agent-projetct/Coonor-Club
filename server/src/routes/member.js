import { Router } from 'express'
import { pool } from '../db.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { debitWallet, creditWallet, ah } from '../lib/wallet.js'

const router = Router()
router.use(authenticate, requireRole('member'))

const VENUES = [
  { key: 'planters', name: "The Planters' Table" },
  { key: 'veranda', name: 'The Veranda Tearoom' },
  { key: 'rajbar', name: 'The Raj Bar' },
]

/* Wallet balance + recent ledger */
router.get('/wallet', ah(async (req, res) => {
  const [[m]] = await pool.query('SELECT wallet_balance FROM members WHERE id = ?', [req.user.id])
  const [tx] = await pool.query(
    `SELECT id, type, amount, balance_after, reason, reference_type, created_at
       FROM wallet_transactions WHERE member_id = ? ORDER BY id DESC LIMIT 50`, [req.user.id])
  res.json({ balance: m ? m.wallet_balance : 0, transactions: tx })
}))

/* What a member can book */
router.get('/catalog', ah(async (req, res) => {
  const [rooms] = await pool.query(
    'SELECT id, name, room_type, description, price_per_night, capacity, image_url FROM rooms WHERE is_active = 1 ORDER BY price_per_night')
  const [areas] = await pool.query(
    'SELECT id, name, description, charge, charge_unit, image_url FROM play_areas WHERE is_active = 1 ORDER BY name')
  res.json({ rooms, areas, venues: VENUES })
}))

/* All of my bookings */
router.get('/bookings', ah(async (req, res) => {
  const id = req.user.id
  const [rooms] = await pool.query(
    `SELECT rb.id, r.name AS room, rb.check_in, rb.check_out, rb.nights, rb.guests,
            rb.total_amount, rb.status, rb.created_at
       FROM room_bookings rb JOIN rooms r ON r.id = rb.room_id
      WHERE rb.member_id = ? ORDER BY rb.id DESC`, [id])
  const [tables] = await pool.query(
    `SELECT id, venue, booking_date, booking_time, party_size, status, note, created_at
       FROM table_bookings WHERE member_id = ? ORDER BY id DESC`, [id])
  const [play] = await pool.query(
    `SELECT pb.id, pa.name AS area, pb.booking_date, pb.start_time, pb.duration_mins,
            pb.charge_amount, pb.status, pb.created_at
       FROM play_bookings pb JOIN play_areas pa ON pa.id = pb.play_area_id
      WHERE pb.member_id = ? ORDER BY pb.id DESC`, [id])
  res.json({ rooms, tables, play })
}))

/* Book a room (stay) — charges the wallet, checks date overlap */
router.post('/book/room', ah(async (req, res) => {
  const { room_id, check_in, check_out, guests } = req.body || {}
  if (!room_id || !check_in || !check_out)
    return res.status(400).json({ error: 'Room, check-in and check-out are required' })
  const nights = Math.round((new Date(check_out) - new Date(check_in)) / 86400000)
  if (!(nights > 0)) return res.status(400).json({ error: 'Check-out must be after check-in' })

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [[room]] = await conn.query('SELECT * FROM rooms WHERE id = ? AND is_active = 1', [room_id])
    if (!room) throw Object.assign(new Error('Room not available'), { status: 404 })
    const [clash] = await conn.query(
      `SELECT id FROM room_bookings
        WHERE room_id = ? AND status = 'confirmed' AND NOT (check_out <= ? OR check_in >= ?)`,
      [room_id, check_in, check_out])
    if (clash.length) throw Object.assign(new Error('Those dates are already booked for this room'), { status: 409 })
    const total = +(Number(room.price_per_night) * nights).toFixed(2)
    const [ins] = await conn.query(
      'INSERT INTO room_bookings (member_id, room_id, check_in, check_out, guests, nights, total_amount) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, room_id, check_in, check_out, guests || 1, nights, total])
    const balance = await debitWallet(conn, req.user.id, total,
      { reason: `Stay: ${room.name} (${nights} night${nights > 1 ? 's' : ''})`, refType: 'room_booking', refId: ins.insertId })
    await conn.commit()
    res.status(201).json({ id: ins.insertId, nights, total, wallet_balance: balance })
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
}))

/* Reserve a table (dining / bar) — no charge, just a reservation */
router.post('/book/table', ah(async (req, res) => {
  const { venue, booking_date, booking_time, party_size, note } = req.body || {}
  if (!venue || !booking_date || !booking_time)
    return res.status(400).json({ error: 'Venue, date and time are required' })
  if (!VENUES.some(v => v.key === venue)) return res.status(400).json({ error: 'Unknown venue' })
  const [ins] = await pool.query(
    'INSERT INTO table_bookings (member_id, venue, booking_date, booking_time, party_size, note) VALUES (?,?,?,?,?,?)',
    [req.user.id, venue, booking_date, booking_time, party_size || 2, note || null])
  res.status(201).json({ id: ins.insertId, message: 'Table reserved' })
}))

/* Book a play area slot — charges the wallet */
router.post('/book/play', ah(async (req, res) => {
  const { play_area_id, booking_date, start_time, duration_mins } = req.body || {}
  if (!play_area_id || !booking_date || !start_time)
    return res.status(400).json({ error: 'Play area, date and time are required' })
  const dur = Number(duration_mins || 60)
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [[area]] = await conn.query('SELECT * FROM play_areas WHERE id = ? AND is_active = 1', [play_area_id])
    if (!area) throw Object.assign(new Error('Play area not available'), { status: 404 })
    let charge = Number(area.charge)
    if (/hour/i.test(area.charge_unit)) charge = +(charge * (dur / 60)).toFixed(2)
    const [ins] = await conn.query(
      'INSERT INTO play_bookings (member_id, play_area_id, booking_date, start_time, duration_mins, charge_amount) VALUES (?,?,?,?,?,?)',
      [req.user.id, play_area_id, booking_date, start_time, dur, charge])
    const balance = charge > 0
      ? await debitWallet(conn, req.user.id, charge, { reason: `Play: ${area.name}`, refType: 'play_booking', refId: ins.insertId })
      : (await conn.query('SELECT wallet_balance FROM members WHERE id = ?', [req.user.id]))[0][0].wallet_balance
    await conn.commit()
    res.status(201).json({ id: ins.insertId, charge, wallet_balance: balance })
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
}))

/* Cancel with refund for room/play; table just cancels */
async function cancelBooking({ table, col, refType, req, res }) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [[b]] = await conn.query(`SELECT * FROM ${table} WHERE id = ? AND member_id = ? FOR UPDATE`, [req.params.id, req.user.id])
    if (!b) throw Object.assign(new Error('Booking not found'), { status: 404 })
    if (b.status !== 'confirmed') throw Object.assign(new Error('This booking cannot be cancelled'), { status: 400 })
    await conn.query(`UPDATE ${table} SET status = 'cancelled' WHERE id = ?`, [b.id])
    let balance
    if (col && Number(b[col]) > 0)
      balance = await creditWallet(conn, req.user.id, b[col], { reason: `Refund: ${refType} #${b.id}`, refType, refId: b.id })
    await conn.commit()
    res.json({ cancelled: b.id, refunded: col ? b[col] : 0, wallet_balance: balance })
  } catch (e) { await conn.rollback(); throw e } finally { conn.release() }
}
router.post('/bookings/room/:id/cancel', ah((req, res) => cancelBooking({ table: 'room_bookings', col: 'total_amount', refType: 'room_booking', req, res })))
router.post('/bookings/play/:id/cancel', ah((req, res) => cancelBooking({ table: 'play_bookings', col: 'charge_amount', refType: 'play_booking', req, res })))
router.post('/bookings/table/:id/cancel', ah((req, res) => cancelBooking({ table: 'table_bookings', col: null, refType: 'table_booking', req, res })))

export default router
