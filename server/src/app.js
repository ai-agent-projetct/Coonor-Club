import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import { ping } from './db.js'

export const app = express()

const origins = (process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)
app.use(cors({ origin: origins.length ? origins : true, credentials: true }))
app.use(express.json())

/* Health check — reports whether the DB is reachable (never crashes the app). */
app.get('/api/health', async (req, res) => {
  try {
    await ping()
    res.json({ ok: true, db: 'connected' })
  } catch (e) {
    res.status(200).json({ ok: true, db: 'unavailable', hint: 'Check server/.env and that MySQL is running + schema loaded.' })
  }
})

app.use('/api/auth', authRoutes)

// Later phases mount here: /api/member/* (bookings, wallet) and /api/admin/* (approvals, CRUD)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})
