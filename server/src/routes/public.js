import { Router } from 'express'
import { pool } from '../db.js'
import { ah } from '../lib/wallet.js'

/* No-auth endpoints consumed by the public marketing site (Events page). */
const router = Router()

router.get('/events', ah(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, description, event_date, image_url
       FROM events
      WHERE is_published = 1
      ORDER BY (event_date IS NULL) ASC, event_date DESC, id DESC
      LIMIT 50`)
  res.json(rows)
}))

router.get('/videos', ah(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, youtube_id, youtube_url
       FROM videos
      WHERE is_published = 1
      ORDER BY sort ASC, id ASC`)
  res.json(rows)
}))

export default router
