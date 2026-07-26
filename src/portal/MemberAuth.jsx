import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, setSession } from './api'
import './portal.css'

export default function MemberAuth() {
  const nav = useNavigate()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function login(e) {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      const r = await api('/auth/member/login', { method: 'POST', body: { email: form.email, password: form.password } })
      setSession(r.token, 'member', r.member)
      nav('/members')
    } catch (err) { setMsg({ type: 'err', text: err.message }) } finally { setBusy(false) }
  }

  async function register(e) {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      const r = await api('/auth/member/register', { method: 'POST', body: form })
      setMsg({ type: 'ok', text: r.message || 'Registration received — awaiting approval.' })
      setTab('login')
    } catch (err) { setMsg({ type: 'err', text: err.message }) } finally { setBusy(false) }
  }

  return (
    <div className="pt">
      <div className="pt-auth">
        <div className="pt-card">
          <div className="pt-brand">
            <img src="/images/coonoor-logo.png" alt="Coonoor Club" />
            <h1>Coonoor Club</h1>
            <p>Members' Portal</p>
          </div>

          <div className="pt-tabs">
            <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setMsg(null) }}>Sign In</button>
            <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setMsg(null) }}>Register</button>
          </div>

          {msg && <div className={`pt-msg pt-msg--${msg.type}`}>{msg.text}</div>}

          {tab === 'login' ? (
            <form onSubmit={login}>
              <div className="pt-field"><label>Email</label><input type="email" value={form.email} onChange={set('email')} required /></div>
              <div className="pt-field"><label>Password</label><input type="password" value={form.password} onChange={set('password')} required /></div>
              <button className="pt-btn pt-btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
            </form>
          ) : (
            <form onSubmit={register}>
              <div className="pt-field"><label>Full Name</label><input value={form.name} onChange={set('name')} required /></div>
              <div className="pt-field"><label>Email</label><input type="email" value={form.email} onChange={set('email')} required /></div>
              <div className="pt-field"><label>Phone</label><input value={form.phone} onChange={set('phone')} /></div>
              <div className="pt-field"><label>Password</label><input type="password" value={form.password} onChange={set('password')} required minLength={6} /></div>
              <button className="pt-btn pt-btn--block pt-btn--brass" disabled={busy}>{busy ? 'Submitting…' : 'Request Membership'}</button>
              <p className="pt-muted" style={{ marginTop: '0.8rem' }}>New registrations are reviewed and approved by the club administrator before you can sign in.</p>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
            <Link className="pt-link" to="/">← Back to website</Link>
            <span style={{ margin: '0 0.5rem', color: '#ccc' }}>·</span>
            <Link className="pt-link" to="/admin/login">Admin login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
