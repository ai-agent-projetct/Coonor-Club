import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import memberRoutes from './routes/member.js'
import adminRoutes from './routes/admin.js'
import publicRoutes from './routes/public.js'
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
app.use('/api/public', publicRoutes)
app.use('/api/member', memberRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status >= 500 ? 'Server error' : err.message })
})
