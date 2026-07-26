/* Tiny API client for the members portal & admin panel.
   Backend base URL is configurable for production via VITE_API_URL. */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const token = () => localStorage.getItem('cc_token') || ''

export function setSession(tok, role, user) {
  localStorage.setItem('cc_token', tok)
  localStorage.setItem('cc_role', role)
  localStorage.setItem('cc_user', JSON.stringify(user || null))
}
export function clearSession() {
  localStorage.removeItem('cc_token')
  localStorage.removeItem('cc_role')
  localStorage.removeItem('cc_user')
}
export const getRole = () => localStorage.getItem('cc_role')
export const isAuthed = () => !!token()
export function getUser() {
  try { return JSON.parse(localStorage.getItem('cc_user')) } catch { return null }
}

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw new Error('Cannot reach the server. Is the API running on ' + BASE + '?')
  }
  let data = null
  try { data = await res.json() } catch { /* no body */ }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`)
  return data
}

export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
