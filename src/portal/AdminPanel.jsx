import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, money, getRole, isAuthed, clearSession, getUser } from './api'
import './portal.css'

const TABS = [
  ['dashboard', 'Dashboard'], ['approvals', 'Approvals'], ['members', 'Members'],
  ['bookings', 'Bookings'], ['rooms', 'Rooms'], ['play', 'Play Areas'],
  ['menu', 'Menu & Bar'], ['gallery', 'Gallery'], ['events', 'Events'], ['videos', 'Videos'],
]

export default function AdminPanel() {
  const nav = useNavigate()
  const [tab, setTab] = useState('dashboard')
  useEffect(() => { if (!isAuthed() || getRole() !== 'admin') nav('/admin/login') }, [])
  function logout() { clearSession(); nav('/admin/login') }

  return (
    <div className="pt">
      <div className="pt-top">
        <div className="pt-top-brand"><img src="/images/coonoor-logo.png" alt="" /><strong>Coonoor Club — Admin</strong></div>
        <div className="pt-top-right">
          <span>{getUser()?.name || 'Administrator'}</span>
          <button className="pt-btn pt-btn--ghost pt-btn--sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} onClick={logout}>Sign out</button>
        </div>
      </div>
      <div className="pt-wrap">
        <div className="pt-admin-tabs">
          {TABS.map(([k, l]) => <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'approvals' && <Approvals />}
        {tab === 'members' && <Members />}
        {tab === 'bookings' && <Bookings />}
        {tab === 'rooms' && <Crud endpoint="rooms" title="Rooms"
          fields={[['name', 'Name'], ['room_type', 'Type'], ['price_per_night', 'Price / night', 'number'], ['capacity', 'Capacity', 'number'], ['image_url', 'Image URL'], ['description', 'Description']]}
          columns={[['name', 'Name'], ['room_type', 'Type'], ['price_per_night', 'Price', money], ['capacity', 'Cap']]} />}
        {tab === 'play' && <Crud endpoint="play-areas" title="Play Areas"
          fields={[['name', 'Name'], ['charge', 'Charge', 'number'], ['charge_unit', 'Unit'], ['image_url', 'Image URL'], ['description', 'Description']]}
          columns={[['name', 'Name'], ['charge', 'Charge', money], ['charge_unit', 'Unit']]} />}
        {tab === 'menu' && <Menu />}
        {tab === 'gallery' && <Crud endpoint="gallery" title="Gallery"
          fields={[['title', 'Title'], ['image_url', 'Image URL'], ['category', 'Category']]}
          columns={[['title', 'Title'], ['category', 'Category'], ['image_url', 'Image']]} />}
        {tab === 'events' && <Crud endpoint="events" title="Events — add & edit upcoming events (shown on the public Events page)"
          fields={[['title', 'Title'], ['event_date', 'Date', 'date'], ['image_url', 'Image URL'], ['description', 'Description']]}
          columns={[['title', 'Title'], ['event_date', 'Date'], ['is_published', 'Live']]} />}
        {tab === 'videos' && <Videos />}
      </div>
    </div>
  )
}

function useErr() { const [err, setErr] = useState(null); return [err, (e) => { setErr(e); setTimeout(() => setErr(null), 4000) }] }

function Dashboard() {
  const [s, setS] = useState(null); const [err, flash] = useErr()
  useEffect(() => { api('/admin/stats').then(setS).catch(e => flash(e.message)) }, [])
  if (err) return <div className="pt-msg pt-msg--err">{err}</div>
  if (!s) return <p className="pt-muted">Loading…</p>
  const cells = [
    ['Active members', s.active_members], ['Pending approvals', s.pending_members],
    ['Total wallet held', money(s.total_wallet)], ['Upcoming stays', s.upcoming_stays],
    ['Tables today', s.tables_today], ['Play bookings today', s.play_today],
  ]
  return <div className="pt-stat-row">{cells.map(([l, n]) => <div className="pt-stat" key={l}><div className="n">{n}</div><div className="l">{l}</div></div>)}</div>
}

function Approvals() {
  const [rows, setRows] = useState([]); const [types, setTypes] = useState([]); const [err, flash] = useErr()
  const load = () => Promise.all([api('/admin/members?status=pending'), api('/admin/membership-types')])
    .then(([m, t]) => { setRows(m); setTypes(t) }).catch(e => flash(e.message))
  useEffect(() => { load() }, [])
  const approve = async (id, membership_type_id) => { try { await api(`/admin/members/${id}/approve`, { method: 'POST', body: { membership_type_id } }); load() } catch (e) { flash(e.message) } }
  const reject = async (id) => { if (!confirm('Reject this applicant?')) return; try { await api(`/admin/members/${id}/reject`, { method: 'POST' }); load() } catch (e) { flash(e.message) } }
  return (
    <div className="pt-panel">
      <h2>Pending Membership Requests</h2>
      {err && <div className="pt-msg pt-msg--err">{err}</div>}
      <div className="pt-scroll"><table className="pt-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Requested</th><th></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan="6" className="pt-empty">No pending requests.</td></tr>}
          {rows.map(m => <ApprovalRow key={m.id} m={m} types={types} onApprove={approve} onReject={reject} />)}
        </tbody>
      </table></div>
    </div>
  )
}
function ApprovalRow({ m, types, onApprove, onReject }) {
  const [type, setType] = useState('')
  return (
    <tr>
      <td>{m.name}</td><td>{m.email}</td><td>{m.phone || '—'}</td>
      <td><select value={type} onChange={e => setType(e.target.value)} style={{ padding: '0.3rem' }}>
        <option value="">— plan —</option>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select></td>
      <td>{new Date(m.created_at).toLocaleDateString('en-IN')}</td>
      <td style={{ whiteSpace: 'nowrap' }}>
        <button className="pt-btn pt-btn--sm" onClick={() => onApprove(m.id, type)}>Approve</button>{' '}
        <button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => onReject(m.id)}>Reject</button>
      </td>
    </tr>
  )
}

function Members() {
  const [rows, setRows] = useState([]); const [sel, setSel] = useState(null); const [q, setQ] = useState(''); const [err, flash] = useErr()
  const load = () => api('/admin/members').then(setRows).catch(e => flash(e.message))
  useEffect(() => { load() }, [])
  const filtered = rows.filter(m => !q || `${m.name} ${m.email} ${m.member_no || ''} ${m.phone || ''}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="pt-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        <h2 style={{ margin: 0 }}>Members <span className="pt-muted" style={{ fontSize: '0.9rem' }}>({rows.length} total)</span></h2>
        <input className="pt-search" placeholder="Search name / email / no." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {err && <div className="pt-msg pt-msg--err">{err}</div>}
      <p className="pt-muted" style={{ margin: '0.4rem 0 0.8rem' }}>Click any member to open their full profile, documents and wallet.</p>
      <div className="pt-scroll"><table className="pt-table">
        <thead><tr><th>No.</th><th>Name</th><th>Phone</th><th>Plan</th><th>Status</th><th className="pt-right">Wallet</th><th></th></tr></thead>
        <tbody>
          {filtered.map(m => <tr key={m.id} className="pt-clickrow" onClick={() => setSel(m.id)}>
            <td>{m.member_no || '—'}</td><td>{m.name}</td><td>{m.phone || '—'}</td><td>{m.membership_type || '—'}</td>
            <td><span className={`pt-badge ${m.status}`}>{m.status}</span></td>
            <td className="pt-right">{money(m.wallet_balance)}</td>
            <td><button className="pt-btn pt-btn--sm pt-btn--ghost" onClick={(e) => { e.stopPropagation(); setSel(m.id) }}>Open</button></td>
          </tr>)}
        </tbody>
      </table></div>
      {sel && <MemberDrawer id={sel} onClose={() => setSel(null)} onChange={load} />}
    </div>
  )
}

function MemberDrawer({ id, onClose, onChange }) {
  const [data, setData] = useState(null); const [profile, setProfile] = useState({})
  const [amt, setAmt] = useState(''); const [chg, setChg] = useState({ amount: '', description: '', deduct: true })
  const [doc, setDoc] = useState({ doc_type: 'Aadhaar', reference: '', file_url: '' })
  const [err, flash] = useErr(); const [ok, setOk] = useState(null)
  const load = () => api('/admin/members/' + id).then(d => {
    setData(d)
    setProfile({
      name: d.member.name || '', phone: d.member.phone || '', aadhaar: d.member.aadhaar || '', pan: d.member.pan || '',
      address: d.member.address || '', occupation: d.member.occupation || '', joined_at: (d.member.joined_at || '').slice(0, 10),
    })
  }).catch(e => flash(e.message))
  useEffect(() => { load() }, [id])
  const done = (t) => { setOk(t); onChange && onChange(); setTimeout(() => setOk(null), 3000) }
  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.value })
  const saveProfile = async () => { try { await api(`/admin/members/${id}/profile`, { method: 'PUT', body: profile }); done('Profile saved.'); load() } catch (e) { flash(e.message) } }
  const topup = async (a) => { try { const r = await api(`/admin/members/${id}/wallet/topup`, { method: 'POST', body: { amount: Number(a) } }); setAmt(''); done('Wallet credited — balance ' + money(r.wallet_balance)); load() } catch (e) { flash(e.message) } }
  const charge = async () => { try { await api(`/admin/members/${id}/charge`, { method: 'POST', body: { ...chg, amount: Number(chg.amount) } }); setChg({ amount: '', description: '', deduct: true }); done('Charge recorded.'); load() } catch (e) { flash(e.message) } }
  const setStatus = async (status) => { try { await api(`/admin/members/${id}/status`, { method: 'POST', body: { status } }); done('Status updated.'); load() } catch (e) { flash(e.message) } }
  const addDoc = async () => { if (!doc.doc_type) return; try { await api(`/admin/members/${id}/documents`, { method: 'POST', body: doc }); setDoc({ doc_type: 'Aadhaar', reference: '', file_url: '' }); done('Document added.'); load() } catch (e) { flash(e.message) } }
  const delDoc = async (docId) => { try { await api(`/admin/members/${id}/documents/${docId}`, { method: 'DELETE' }); load() } catch (e) { flash(e.message) } }

  const close = (e) => { if (e.target.classList.contains('pt-drawer')) onClose() }
  const m = data?.member

  return (
    <div className="pt-drawer" onClick={close}>
      <div className="pt-drawer-card">
        {!data ? <p className="pt-muted">Loading…</p> : <>
          <div className="pt-drawer-head">
            <div>
              <h3>{m.name} {m.member_no && <span className="pt-muted">· {m.member_no}</span>}</h3>
              <span className={`pt-badge ${m.status}`}>{m.status}</span> <span className="pt-muted">{m.email}</span>
              <div className="pt-muted" style={{ marginTop: '0.2rem' }}>{m.membership_type || 'No plan'} · joined {m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-IN') : '—'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="pt-drawer-bal">{money(m.wallet_balance)}</div>
              <div className="pt-muted" style={{ fontSize: '0.75rem' }}>wallet balance</div>
              <button className="pt-link" style={{ marginTop: '0.4rem' }} onClick={onClose}>Close ✕</button>
            </div>
          </div>
          {err && <div className="pt-msg pt-msg--err">{err}</div>}
          {ok && <div className="pt-msg pt-msg--ok">{ok}</div>}

          <h4 className="pt-drawer-h">Profile &amp; KYC</h4>
          <div className="pt-row">
            <div className="pt-field"><label>Name</label><input value={profile.name} onChange={set('name')} /></div>
            <div className="pt-field"><label>Phone</label><input value={profile.phone} onChange={set('phone')} /></div>
            <div className="pt-field"><label>Occupation</label><input value={profile.occupation} onChange={set('occupation')} /></div>
          </div>
          <div className="pt-row">
            <div className="pt-field"><label>Aadhaar no.</label><input value={profile.aadhaar} onChange={set('aadhaar')} /></div>
            <div className="pt-field"><label>PAN no.</label><input value={profile.pan} onChange={set('pan')} /></div>
            <div className="pt-field"><label>Joined date</label><input type="date" value={profile.joined_at} onChange={set('joined_at')} /></div>
          </div>
          <div className="pt-field"><label>Address</label><input value={profile.address} onChange={set('address')} /></div>
          <button className="pt-btn pt-btn--sm" onClick={saveProfile}>Save profile</button>

          <h4 className="pt-drawer-h">Documents</h4>
          <div className="pt-scroll"><table className="pt-table">
            <thead><tr><th>Type</th><th>Reference</th><th>File</th><th></th></tr></thead>
            <tbody>
              {data.documents.length === 0 && <tr><td colSpan="4" className="pt-empty">No documents yet.</td></tr>}
              {data.documents.map(d => <tr key={d.id}>
                <td>{d.doc_type}</td><td>{d.reference || '—'}</td>
                <td>{d.file_url ? <a href={d.file_url} target="_blank" rel="noreferrer" className="pt-link">View</a> : '—'}</td>
                <td><button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => delDoc(d.id)}>✕</button></td>
              </tr>)}
            </tbody>
          </table></div>
          <div className="pt-row" style={{ marginTop: '0.6rem' }}>
            <div className="pt-field"><label>Type</label>
              <select value={doc.doc_type} onChange={e => setDoc({ ...doc, doc_type: e.target.value })}>
                {['Aadhaar', 'PAN', 'Photo', 'Address Proof', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div className="pt-field"><label>Reference / number</label><input value={doc.reference} onChange={e => setDoc({ ...doc, reference: e.target.value })} /></div>
            <div className="pt-field" style={{ flex: 2 }}><label>File link (optional)</label><input value={doc.file_url} onChange={e => setDoc({ ...doc, file_url: e.target.value })} placeholder="https://…" /></div>
            <button className="pt-btn pt-btn--sm" onClick={addDoc}>Add document</button>
          </div>

          <h4 className="pt-drawer-h">Wallet</h4>
          <div className="pt-row">
            <button className="pt-btn pt-btn--brass pt-btn--sm" onClick={() => topup(20000)}>Recharge ₹20,000</button>
            <div className="pt-field" style={{ maxWidth: 160 }}><label>Custom credit (₹)</label><input type="number" value={amt} onChange={e => setAmt(e.target.value)} /></div>
            <button className="pt-btn pt-btn--sm" onClick={() => amt && topup(amt)}>Add credit</button>
          </div>
          <div className="pt-row" style={{ marginTop: '0.5rem' }}>
            <div className="pt-field"><label>Charge amount (₹)</label><input type="number" value={chg.amount} onChange={e => setChg({ ...chg, amount: e.target.value })} /></div>
            <div className="pt-field" style={{ flex: 2 }}><label>Charge for</label><input value={chg.description} onChange={e => setChg({ ...chg, description: e.target.value })} placeholder="e.g. Bar tab, dinner, breakfast" /></div>
            <label className="pt-muted" style={{ alignSelf: 'center' }}><input type="checkbox" checked={chg.deduct} onChange={e => setChg({ ...chg, deduct: e.target.checked })} /> deduct now</label>
            <button className="pt-btn pt-btn--sm" onClick={charge}>Add charge</button>
          </div>
          <h4 className="pt-drawer-h" style={{ fontSize: '0.92rem' }}>Recent transactions</h4>
          <div className="pt-scroll"><table className="pt-table">
            <thead><tr><th>Date</th><th>Detail</th><th>Type</th><th className="pt-right">Amount</th><th className="pt-right">Balance</th></tr></thead>
            <tbody>
              {data.transactions.length === 0 && <tr><td colSpan="5" className="pt-empty">No transactions.</td></tr>}
              {data.transactions.map(t => <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleDateString('en-IN')}</td><td>{t.reason || '—'}</td>
                <td><span className={`pt-badge ${t.type}`}>{t.type}</span></td>
                <td className="pt-right">{t.type === 'debit' ? '−' : '+'}{money(t.amount)}</td>
                <td className="pt-right">{money(t.balance_after)}</td>
              </tr>)}
            </tbody>
          </table></div>

          <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
            {m.status === 'active'
              ? <button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => setStatus('suspended')}>Suspend member</button>
              : <button className="pt-btn pt-btn--sm" onClick={() => setStatus('active')}>Re-activate member</button>}
          </div>
        </>}
      </div>
    </div>
  )
}

function Bookings() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [rooms, setRooms] = useState([]); const [other, setOther] = useState({ tables: [], play: [] }); const [err, flash] = useErr()
  const load = () => Promise.all([api('/admin/bookings/rooms?date=' + date), api('/admin/bookings')])
    .then(([r, o]) => { setRooms(r); setOther(o) }).catch(e => flash(e.message))
  useEffect(() => { load() }, [date])
  return (
    <div className="pt-panel">
      <h2>Bookings</h2>
      {err && <div className="pt-msg pt-msg--err">{err}</div>}
      <div className="pt-row" style={{ marginBottom: '1rem' }}>
        <div className="pt-field" style={{ maxWidth: 220 }}><label>Rooms occupied on</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      </div>
      <div className="pt-scroll"><table className="pt-table">
        <thead><tr><th>Room</th><th>Member</th><th>No.</th><th>Check-in</th><th>Check-out</th><th className="pt-right">Amount</th></tr></thead>
        <tbody>
          {rooms.length === 0 && <tr><td colSpan="6" className="pt-empty">No rooms occupied on this date.</td></tr>}
          {rooms.map(b => <tr key={b.id}><td>{b.room}</td><td>{b.member}</td><td>{b.member_no}</td><td>{b.check_in}</td><td>{b.check_out}</td><td className="pt-right">{money(b.total_amount)}</td></tr>)}
        </tbody>
      </table></div>
      <h3>Recent table reservations</h3>
      <div className="pt-scroll"><table className="pt-table">
        <thead><tr><th>Venue</th><th>Member</th><th>Date</th><th>Time</th><th>Party</th></tr></thead>
        <tbody>{other.tables.map(t => <tr key={t.id}><td>{t.venue}</td><td>{t.member}</td><td>{t.booking_date}</td><td>{t.booking_time}</td><td>{t.party_size}</td></tr>)}</tbody>
      </table></div>
    </div>
  )
}

function Menu() {
  const [data, setData] = useState({ items: [], categories: [] }); const [err, flash] = useErr()
  const [f, setF] = useState({ category_id: '', name: '', price: '', is_liquor: false })
  const load = () => api('/admin/menu').then(setData).catch(e => flash(e.message))
  useEffect(() => { load() }, [])
  const add = async (e) => { e.preventDefault(); try { await api('/admin/menu', { method: 'POST', body: { ...f, price: Number(f.price) } }); setF({ category_id: '', name: '', price: '', is_liquor: false }); load() } catch (e) { flash(e.message) } }
  const savePrice = async (id, price) => { try { await api('/admin/menu/' + id, { method: 'PUT', body: { price: Number(price) } }); load() } catch (e) { flash(e.message) } }
  const del = async (id) => { if (!confirm('Delete item?')) return; await api('/admin/menu/' + id, { method: 'DELETE' }); load() }
  return (
    <div className="pt-panel">
      <h2>Menu, Liquor &amp; Prices</h2>
      {err && <div className="pt-msg pt-msg--err">{err}</div>}
      <form className="pt-row" onSubmit={add} style={{ marginBottom: '1rem' }}>
        <div className="pt-field"><label>Category</label>
          <select value={f.category_id} onChange={e => setF({ ...f, category_id: e.target.value })} required>
            <option value="">— category —</option>
            {data.categories.map(c => <option key={c.id} value={c.id}>{c.venue} · {c.name}</option>)}
          </select></div>
        <div className="pt-field"><label>Item</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /></div>
        <div className="pt-field" style={{ maxWidth: 120 }}><label>Price (₹)</label><input type="number" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} required /></div>
        <label className="pt-muted" style={{ alignSelf: 'center' }}><input type="checkbox" checked={f.is_liquor} onChange={e => setF({ ...f, is_liquor: e.target.checked })} /> Liquor</label>
        <button className="pt-btn">Add item</button>
      </form>
      <div className="pt-scroll"><table className="pt-table">
        <thead><tr><th>Venue</th><th>Category</th><th>Item</th><th>Type</th><th className="pt-right">Price</th><th></th></tr></thead>
        <tbody>
          {data.items.length === 0 && <tr><td colSpan="6" className="pt-empty">No menu items yet.</td></tr>}
          {data.items.map(it => <tr key={it.id}>
            <td>{it.venue}</td><td>{it.category}</td><td>{it.name}</td>
            <td>{it.is_liquor ? <span className="pt-badge unpaid">liquor</span> : 'food'}</td>
            <td className="pt-right"><input type="number" defaultValue={it.price} style={{ width: 90, padding: '0.3rem' }} onBlur={e => e.target.value != it.price && savePrice(it.id, e.target.value)} /></td>
            <td><button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => del(it.id)}>✕</button></td>
          </tr>)}
        </tbody>
      </table></div>
      <p className="pt-muted" style={{ marginTop: '0.6rem' }}>Edit a price and click away to save. Categories are seeded per venue (Planters', Veranda, Raj Bar).</p>
    </div>
  )
}

/* YouTube video manager — admin pastes a link, the id is extracted server-side */
function Videos() {
  const [rows, setRows] = useState([]); const [f, setF] = useState({ title: '', youtube_url: '' }); const [err, flash] = useErr()
  const load = () => api('/admin/videos').then(setRows).catch(e => flash(e.message))
  useEffect(() => { load() }, [])
  const add = async (e) => { e.preventDefault(); try { await api('/admin/videos', { method: 'POST', body: f }); setF({ title: '', youtube_url: '' }); load() } catch (e) { flash(e.message) } }
  const del = async (id) => { if (!confirm('Remove this video?')) return; try { await api('/admin/videos/' + id, { method: 'DELETE' }); load() } catch (e) { flash(e.message) } }
  return (
    <div className="pt-panel">
      <h2>YouTube Videos</h2>
      {err && <div className="pt-msg pt-msg--err">{err}</div>}
      <form className="pt-row" onSubmit={add} style={{ marginBottom: '1.2rem' }}>
        <div className="pt-field"><label>Title</label><input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required /></div>
        <div className="pt-field" style={{ flex: 2 }}><label>YouTube link</label>
          <input value={f.youtube_url} onChange={e => setF({ ...f, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." required /></div>
        <button className="pt-btn">Add video</button>
      </form>
      <div className="pt-scroll"><table className="pt-table">
        <thead><tr><th>Preview</th><th>Title</th><th>Video ID</th><th></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan="4" className="pt-empty">No videos yet.</td></tr>}
          {rows.map(v => (
            <tr key={v.id}>
              <td><img src={`https://img.youtube.com/vi/${v.youtube_id}/default.jpg`} alt="" style={{ width: 84, borderRadius: 4, display: 'block' }} /></td>
              <td>{v.title}</td><td>{v.youtube_id}</td>
              <td><button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => del(v.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <p className="pt-muted" style={{ marginTop: '0.6rem' }}>These appear in the Videos section on the public Events page — click to play, double-click to open on YouTube.</p>
    </div>
  )
}

/* Generic add / edit-price / delete manager for rooms, play areas, gallery, events */
function Crud({ endpoint, title, fields, columns }) {
  const [rows, setRows] = useState([]); const [form, setForm] = useState({}); const [editing, setEditing] = useState(null); const [err, flash] = useErr()
  const load = () => api('/admin/' + endpoint).then(setRows).catch(e => flash(e.message))
  useEffect(() => { load(); setForm({}); setEditing(null) }, [endpoint])
  const save = async (e) => {
    e.preventDefault()
    try {
      if (editing) await api(`/admin/${endpoint}/${editing}`, { method: 'PUT', body: form })
      else await api('/admin/' + endpoint, { method: 'POST', body: form })
      setForm({}); setEditing(null); load()
    } catch (e) { flash(e.message) }
  }
  const del = async (id) => { if (!confirm('Delete this item?')) return; try { await api(`/admin/${endpoint}/${id}`, { method: 'DELETE' }); load() } catch (e) { flash(e.message) } }
  const edit = (r) => { setEditing(r.id); setForm(r) }
  return (
    <div className="pt-panel">
      <h2>{title}</h2>
      {err && <div className="pt-msg pt-msg--err">{err}</div>}
      <form className="pt-row" onSubmit={save} style={{ marginBottom: '1.2rem' }}>
        {fields.map(([name, label, type]) => (
          <div className="pt-field" key={name}><label>{label}</label>
            <input type={type || 'text'} value={form[name] ?? ''} onChange={e => setForm({ ...form, [name]: e.target.value })} required={name === 'name' || name === 'title'} />
          </div>
        ))}
        <button className="pt-btn">{editing ? 'Save' : 'Add'}</button>
        {editing && <button type="button" className="pt-btn pt-btn--ghost" onClick={() => { setEditing(null); setForm({}) }}>Cancel</button>}
      </form>
      <div className="pt-scroll"><table className="pt-table">
        <thead><tr>{columns.map(([, l]) => <th key={l}>{l}</th>)}<th></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="pt-empty">Nothing yet.</td></tr>}
          {rows.map(r => <tr key={r.id}>
            {columns.map(([key, , fmt]) => <td key={key}>{fmt ? fmt(r[key]) : String(r[key] ?? '—').slice(0, 60)}</td>)}
            <td style={{ whiteSpace: 'nowrap' }}>
              <button className="pt-btn pt-btn--sm pt-btn--ghost" onClick={() => edit(r)}>Edit</button>{' '}
              <button className="pt-btn pt-btn--sm pt-btn--danger" onClick={() => del(r.id)}>✕</button>
            </td>
          </tr>)}
        </tbody>
      </table></div>
    </div>
  )
}
