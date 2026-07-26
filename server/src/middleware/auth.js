import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

/* Verifies the Bearer token and puts the decoded payload on req.user */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

/* Guards a route to one or more roles ('member' | 'admin') */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ error: 'You do not have access to this resource' })
    next()
  }
}
