/* Atomic wallet operations. Always call inside a transaction connection so the
   member row is locked (FOR UPDATE) while balance is read, checked and updated. */

export async function debitWallet(conn, memberId, amount, meta = {}) {
  amount = Number(amount)
  if (!(amount > 0)) throw Object.assign(new Error('Amount must be positive'), { status: 400 })
  const [[m]] = await conn.query('SELECT wallet_balance FROM members WHERE id = ? FOR UPDATE', [memberId])
  if (!m) throw Object.assign(new Error('Member not found'), { status: 404 })
  const balance = Number(m.wallet_balance)
  if (balance < amount)
    throw Object.assign(new Error('Insufficient wallet balance — please top up at the club office.'), { status: 402 })
  const after = +(balance - amount).toFixed(2)
  await conn.query('UPDATE members SET wallet_balance = ? WHERE id = ?', [after, memberId])
  await conn.query(
    `INSERT INTO wallet_transactions
       (member_id, type, amount, balance_after, reason, reference_type, reference_id, created_by)
     VALUES (?, 'debit', ?, ?, ?, ?, ?, ?)`,
    [memberId, amount, after, meta.reason || null, meta.refType || null, meta.refId || null, meta.createdBy || null]
  )
  return after
}

export async function creditWallet(conn, memberId, amount, meta = {}) {
  amount = Number(amount)
  if (!(amount > 0)) throw Object.assign(new Error('Amount must be positive'), { status: 400 })
  const [[m]] = await conn.query('SELECT wallet_balance FROM members WHERE id = ? FOR UPDATE', [memberId])
  if (!m) throw Object.assign(new Error('Member not found'), { status: 404 })
  const after = +(Number(m.wallet_balance) + amount).toFixed(2)
  await conn.query('UPDATE members SET wallet_balance = ? WHERE id = ?', [after, memberId])
  await conn.query(
    `INSERT INTO wallet_transactions
       (member_id, type, amount, balance_after, reason, reference_type, reference_id, created_by)
     VALUES (?, 'credit', ?, ?, ?, ?, ?, ?)`,
    [memberId, amount, after, meta.reason || null, meta.refType || null, meta.refId || null, meta.createdBy || null]
  )
  return after
}

/* Small helper: wrap an async route so thrown errors reach the error middleware. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
