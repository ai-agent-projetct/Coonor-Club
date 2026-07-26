import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, money, getRole, isAuthed, clearSession } from './api'
import './portal.css'

export default function MemberDashboard() {
  const nav = useNavigate()
  const [me, setMe] = useState(null)
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] })
  const [catalog, setCatalog] = useState({ rooms: [], areas: [], venues: [] })
  const [bookings, setBookings] = useState({ rooms: [], tables: [], play: [] })
  const [tab, setTab] = useState('stay')
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!isAuthed() || getRole() !== 'member') { nav('/login'); return }
    loadAll()
  }, [])

  async function loadAll() {
    try {
      const [meR, w, cat, bk] = await Promise.all([
        api('/auth/me'), api('/member/wallet'), api('/member/catalog'), api('/member/bookings'),
      ])
      setMe(meR.user); setWallet(w); setCatalog(cat); setBookings(bk)
    } catch (e) {
      if (/session|token|Authentication/i.test(e.message)) { clearSession(); nav('/login') }
      else setErr(e.message)
    }
  }
  async function refresh() { const [w, bk] = await Promise.all([api('/member/wallet'), api('/member/bookings')]); setWallet(w); setBookings(bk) }
  function logout() { clearSession(); nav('/login') }
  const flash = (t, ok = true) => { ok ? setMsg(t) : setErr(t); setTimeout(() => { setMsg(null); setErr(null) }, 4000) }

  async function book(path, body, label) {
    setErr(null); setMsg(null)
    try { const r = await api(path, { method: 'POST', body }); await refresh(); flash(`${label} confirmed.${r.wallet_balance !== undefined ? ' New balance ' + money(r.wallet_balance) : ''}`) }
    catch (e) { flash(e.message, false) }
  }
  async function cancel(type, id) {
    try { await api(`/member/bookings/${type}/${id}/cancel`, { method: 'POST' }); await refresh(); flash('Booking cancelled.') }
    catch (e) { flash(e.message, false) }
  }

  if (!me) return <div className="pt"><div className="pt-wrap"><p className="pt-muted">Loading…</p></div></div>

  return (
    <div className="pt">
      <div className="pt-top">
        <div className="pt-top-brand">
          <img src="/images/coonoor-logo.png" alt="" />
          <strong>Coonoor Club</strong>
        </div>
        <div className="pt-top-right">
          <span>{me.name}{me.member_no ? ` · ${me.member_no}` : ''}</span>
          <span className="pt-wallet-pill">Wallet {money(wallet.balance)}</span>
          <button className="pt-btn pt-btn--ghost pt-btn--sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} onClick={logout}>Sign out</button>
        </div>
      </div>

      <div className="pt-wrap">
        {msg && <div className="pt-msg pt-msg--ok">{msg}</div>}
        {err && <div className="pt-msg pt-msg--err">{err}</div>}

        <div className="pt-grid pt-grid--2">
          {/* ── Make a booking ── */}
          <div className="pt-panel">
            <h2>Make a Booking</h2>
            <div className="pt-admin-tabs">
              <button className={tab === 'stay' ? 'active' : ''} onClick={() => setTab('stay')}>Stay</button>
              <button className={tab === 'table' ? 'active' : ''} onClick={() => setTab('table')}>Table</button>
              <button className={tab === 'play' ? 'active' : ''} onClick={() => setTab('play')}>Play Area</button>
            </div>
            {tab === 'stay' && <RoomForm rooms={catalog.rooms} onBook={book} />}
            {tab === 'table' && <TableForm venues={catalog.venues} onBook={book} />}
            {tab === 'play' && <PlayForm areas={catalog.areas} onBook={book} />}
          </div>

          {/* ── Wallet ── */}
          <div className="pt-panel">
            <h2>Wallet</h2>
            <div className="pt-stat" style={{ marginBottom: '1rem' }}>
              <div className="n">{money(wallet.balance)}</div>
              <div className="l">Available balance</div>
            </div>
            <p className="pt-muted">Top-ups are added by the club office. Bookings are deducted automatically.</p>
            <h3>Recent transactions</h3>
            <div className="pt-scroll">
              <table className="pt-table">
                <thead><tr><th>Date</th><th>Detail</th><th>Type</th><th className="pt-right">Amount</th><th className="pt-right">Balance</th></tr></thead>
                <tbody>
                  {wallet.transactions.length === 0 && <tr><td colSpan="5" className="pt-empty">No transactions yet.</td></tr>}
                  {wallet.transactions.map(t => (
                    <tr key={t.id}>
                      <td>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      <td>{t.reason || t.reference_type}</td>
                      <td><span className={`pt-badge ${t.type}`}>{t.type}</span></td>
                      <td className="pt-right">{t.type === 'debit' ? '−' : '+'}{money(t.amount)}</td>
                      <td className="pt-right">{money(t.balance_after)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── My bookings ── */}
        <div className="pt-panel" style={{ marginTop: '1.4rem' }}>
          <h2>My Bookings</h2>
          <h3>Stays</h3>
          <BookingTable
            cols={['Room', 'Check-in', 'Check-out', 'Nights', 'Amount', 'Status', '']}
            rows={bookings.rooms} render={(b) => [b.room, b.check_in, b.check_out, b.nights, money(b.total_amount),
              <span className={`pt-badge ${b.status}`}>{b.status}</span>,
              b.status === 'confirmed' ? <button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => cancel('room', b.id)}>Cancel</button> : '']} />
          <h3>Table Reservations</h3>
          <BookingTable
            cols={['Venue', 'Date', 'Time', 'Party', 'Status', '']}
            rows={bookings.tables} render={(b) => [b.venue, b.booking_date, b.booking_time, b.party_size,
              <span className={`pt-badge ${b.status}`}>{b.status}</span>,
              b.status === 'confirmed' ? <button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => cancel('table', b.id)}>Cancel</button> : '']} />
          <h3>Play Area</h3>
          <BookingTable
            cols={['Area', 'Date', 'Time', 'Mins', 'Charge', 'Status', '']}
            rows={bookings.play} render={(b) => [b.area, b.booking_date, b.start_time, b.duration_mins, money(b.charge_amount),
              <span className={`pt-badge ${b.status}`}>{b.status}</span>,
              b.status === 'confirmed' ? <button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => cancel('play', b.id)}>Cancel</button> : '']} />
        </div>
      </div>
    </div>
  )
}

function BookingTable({ cols, rows, render }) {
  return (
    <div className="pt-scroll">
      <table className="pt-table">
        <thead><tr>{cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length} className="pt-empty">Nothing here yet.</td></tr>}
          {rows.map(r => <tr key={r.id}>{render(r).map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  )
}

function RoomForm({ rooms, onBook }) {
  const [f, setF] = useState({ room_id: '', check_in: '', check_out: '', guests: 2 })
  const room = rooms.find(r => String(r.id) === String(f.room_id))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onBook('/member/book/room', f, 'Stay') }}>
      <div className="pt-field"><label>Room</label>
        <select value={f.room_id} onChange={e => setF({ ...f, room_id: e.target.value })} required>
          <option value="">Choose a room…</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name} — {money(r.price_per_night)}/night</option>)}
        </select>
      </div>
      <div className="pt-row">
        <div className="pt-field"><label>Check-in</label><input type="date" value={f.check_in} onChange={e => setF({ ...f, check_in: e.target.value })} required /></div>
        <div className="pt-field"><label>Check-out</label><input type="date" value={f.check_out} onChange={e => setF({ ...f, check_out: e.target.value })} required /></div>
        <div className="pt-field"><label>Guests</label><input type="number" min="1" value={f.guests} onChange={e => setF({ ...f, guests: e.target.value })} /></div>
      </div>
      {room && <p className="pt-muted">{money(room.price_per_night)} × night — charged to your wallet on booking.</p>}
      <button className="pt-btn pt-btn--block" style={{ marginTop: '0.6rem' }}>Book Stay</button>
    </form>
  )
}

function TableForm({ venues, onBook }) {
  const [f, setF] = useState({ venue: '', booking_date: '', booking_time: '', party_size: 2, note: '' })
  return (
    <form onSubmit={(e) => { e.preventDefault(); onBook('/member/book/table', f, 'Table') }}>
      <div className="pt-field"><label>Venue</label>
        <select value={f.venue} onChange={e => setF({ ...f, venue: e.target.value })} required>
          <option value="">Choose a venue…</option>
          {venues.map(v => <option key={v.key} value={v.key}>{v.name}</option>)}
        </select>
      </div>
      <div className="pt-row">
        <div className="pt-field"><label>Date</label><input type="date" value={f.booking_date} onChange={e => setF({ ...f, booking_date: e.target.value })} required /></div>
        <div className="pt-field"><label>Time</label><input type="time" value={f.booking_time} onChange={e => setF({ ...f, booking_time: e.target.value })} required /></div>
        <div className="pt-field"><label>Party</label><input type="number" min="1" value={f.party_size} onChange={e => setF({ ...f, party_size: e.target.value })} /></div>
      </div>
      <div className="pt-field"><label>Note (optional)</label><input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="Any special request" /></div>
      <p className="pt-muted">Table reservations are complimentary — food &amp; drinks are billed to your account.</p>
      <button className="pt-btn pt-btn--block" style={{ marginTop: '0.6rem' }}>Reserve Table</button>
    </form>
  )
}

function PlayForm({ areas, onBook }) {
  const [f, setF] = useState({ play_area_id: '', booking_date: '', start_time: '', duration_mins: 60 })
  const area = areas.find(a => String(a.id) === String(f.play_area_id))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onBook('/member/book/play', f, 'Play area') }}>
      <div className="pt-field"><label>Play area</label>
        <select value={f.play_area_id} onChange={e => setF({ ...f, play_area_id: e.target.value })} required>
          <option value="">Choose…</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.name} — {money(a.charge)} {a.charge_unit}</option>)}
        </select>
      </div>
      <div className="pt-row">
        <div className="pt-field"><label>Date</label><input type="date" value={f.booking_date} onChange={e => setF({ ...f, booking_date: e.target.value })} required /></div>
        <div className="pt-field"><label>Start</label><input type="time" value={f.start_time} onChange={e => setF({ ...f, start_time: e.target.value })} required /></div>
        <div className="pt-field"><label>Minutes</label><input type="number" min="30" step="30" value={f.duration_mins} onChange={e => setF({ ...f, duration_mins: e.target.value })} /></div>
      </div>
      {area && <p className="pt-muted">Charge: {money(/hour/i.test(area.charge_unit) ? area.charge * (f.duration_mins / 60) : area.charge)} — deducted from wallet.</p>}
      <button className="pt-btn pt-btn--block" style={{ marginTop: '0.6rem' }}>Book Slot</button>
    </form>
  )
}
