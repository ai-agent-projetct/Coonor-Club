/* Extract the 11-char video id from any YouTube URL (watch, youtu.be, embed,
   shorts) or accept a bare id. Returns null if none found. */
export function extractYouTubeId(input) {
  if (!input) return null
  const s = String(input).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  const m = s.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/|\/v\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}
