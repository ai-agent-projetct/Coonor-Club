import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'
import { sign, authenticate } from '../middleware/auth.js'

const router = Router()

/* Member self-registration → status 'pending' (an admin must approve). */
router.post('/member/register', async (req, res) => {
  const { name, email, phone, password } = req.body || {}
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' })
  if (String(password).length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  try {
    const [dupe] = await pool.query('SELECT id FROM members WHERE email = ?', [email])
    if (dupe.length) return res.status(409).json({ error: 'That email is already registered' })
    const hash = await bcrypt.hash(password, 10)
    const [r] = await pool.query(
      'INSERT INTO members (name, email, phone, password_hash, status) VALUES (?,?,?,?,?)',
      [name, email, phone || null, hash, 'pending']
    )
    res.status(201).json({
      id: r.insertId,
      status: 'pending',
      message: 'Registration received. An administrator will review and approve your membership.',
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

/* Member login — only 'active' members may sign in. */
router.post('/member/login', async (req, res) => {
  const { email, password } = req.body || {}
  try {
    const [rows] = await pool.query('SELECT * FROM members WHERE email = ?', [email])
    const m = rows[0]
    if (!m || !(await bcrypt.compare(password || '', m.password_hash)))
      return res.status(401).json({ error: 'Invalid email or password' })
    if (m.status !== 'active')
      return res.status(403).json({ error: `Your membership is ${m.status}. Please contact the club office.` })
    const token = sign({ id: m.id, role: 'member', name: m.name })
    res.json({
      token,
      member: {
        id: m.id, name: m.name, email: m.email, member_no: m.member_no,
        wallet_balance: m.wallet_balance, status: m.status,
      },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

/* Admin login. */
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body || {}
  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email])
    const a = rows[0]
    if (!a || !(await bcrypt.compare(password || '', a.password_hash)))
      return res.status(401).json({ error: 'Invalid email or password' })
    const token = sign({ id: a.id, role: 'admin', name: a.name })
    res.json({ token, admin: { id: a.id, name: a.name, email: a.email } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

/* Returns the current user from their token (member or admin). */
router.get('/me', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT id, name, email FROM admins WHERE id = ?', [req.user.id])
      return res.json({ role: 'admin', user: rows[0] || null })
    }
    const [rows] = await pool.query(
      'SELECT id, member_no, name, email, phone, status, wallet_balance FROM members WHERE id = ?',
      [req.user.id]
    )
    res.json({ role: 'member', user: rows[0] || null })
  } catch (e) {
    res.status(500).json({ error: 'Could not load profile' })
  }
})

export default router
