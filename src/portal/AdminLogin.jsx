import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, setSession } from './api'
import './portal.css'

export default function AdminLogin() {
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      const r = await api('/auth/admin/login', { method: 'POST', body: form })
      setSession(r.token, 'admin', r.admin)
      nav('/admin')
    } catch (err) { setMsg(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="pt">
      <div className="pt-auth">
        <div className="pt-card">
          <div className="pt-brand">
            <img src="/images/coonoor-logo.png" alt="Coonoor Club" />
            <h1>Administration</h1>
            <p>Coonoor Club · Staff Only</p>
          </div>
          {msg && <div className="pt-msg pt-msg--err">{msg}</div>}
          <form onSubmit={submit}>
            <div className="pt-field"><label>Admin Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="pt-field"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
            <button className="pt-btn pt-btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
            <Link className="pt-link" to="/login">Member login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
