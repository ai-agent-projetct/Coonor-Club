/* Seeds a default admin plus starter membership plans, rooms, play areas and menu.
   Run AFTER loading schema.sql:  npm run seed
   Safe to re-run — uses INSERT ... ON DUPLICATE / existence checks. */
import dotenv from 'dotenv'
dotenv.config()
import bcrypt from 'bcryptjs'
import { pool } from '../src/db.js'

async function seed() {
  // --- Default admin ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@coonoorclub.com'
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe!123'
  const adminName = process.env.SEED_ADMIN_NAME || 'Club Administrator'
  const [a] = await pool.query('SELECT id FROM admins WHERE email = ?', [adminEmail])
  if (!a.length) {
    const hash = await bcrypt.hash(adminPass, 10)
    await pool.query('INSERT INTO admins (name, email, password_hash) VALUES (?,?,?)', [adminName, adminEmail, hash])
    console.log(`✓ admin created: ${adminEmail} (password from SEED_ADMIN_PASSWORD)`)
  } else {
    console.log('• admin already exists, skipping')
  }

  // --- Membership plans ---
  const plans = [
    ['Permanent', 'Full permanent membership with voting rights', 50000, 6000],
    ['Temporary', 'Time-bound membership for residents', 5000, 3000],
    ['Affiliated', 'Reciprocal member from an affiliated club', 0, 0],
  ]
  for (const [name, desc, jf, af] of plans) {
    const [r] = await pool.query('SELECT id FROM membership_types WHERE name = ?', [name])
    if (!r.length) await pool.query(
      'INSERT INTO membership_types (name, description, joining_fee, annual_fee) VALUES (?,?,?,?)',
      [name, desc, jf, af])
  }

  // --- Rooms / Stay ---
  const rooms = [
    ['Heritage Suite', 'Suite', 'Teak four-poster suite with fireplace and hill views', 4500, 2, '/images/guest-room.jpg'],
    ['Garden Cottage Room', 'Cottage', 'Cosy cottage room opening to the gardens', 3200, 2, '/images/real-cottage.jpg'],
    ['Colonial Twin', 'Standard', 'Classic twin room in the main building', 2800, 2, '/images/club-hall2.jpg'],
  ]
  for (const [name, type, desc, price, cap, img] of rooms) {
    const [r] = await pool.query('SELECT id FROM rooms WHERE name = ?', [name])
    if (!r.length) await pool.query(
      'INSERT INTO rooms (name, room_type, description, price_per_night, capacity, image_url) VALUES (?,?,?,?,?,?)',
      [name, type, desc, price, cap, img])
  }

  // --- Play areas ---
  const areas = [
    ['Lawn Tennis', 'Grass & hard courts', 150, 'per hour', '/images/club-tenniscourt.jpg'],
    ['Badminton Hall', 'Heritage indoor timber court', 120, 'per hour', '/images/club-indoorstadium.jpg'],
    ['Squash Court', 'Indoor racquets court', 120, 'per hour', '/images/squash.jpg'],
    ['Billiards & Snooker', 'Full-size vintage tables', 100, 'per hour', '/images/billiards.jpg'],
    ['Card Room', 'Bridge, rummy & card play', 50, 'per session', '/images/club-hall2.jpg'],
  ]
  for (const [name, desc, charge, unit, img] of areas) {
    const [r] = await pool.query('SELECT id FROM play_areas WHERE name = ?', [name])
    if (!r.length) await pool.query(
      'INSERT INTO play_areas (name, description, charge, charge_unit, image_url) VALUES (?,?,?,?,?)',
      [name, desc, charge, unit, img])
  }

  // --- Menu (a small real sample per venue) ---
  const cats = {
    planters: 'Main Course', veranda: 'Teas & Coffee', rajbar: 'Bar',
  }
  for (const [venue, catName] of Object.entries(cats)) {
    let [c] = await pool.query('SELECT id FROM menu_categories WHERE venue = ? AND name = ?', [venue, catName])
    let catId = c.length ? c[0].id : (await pool.query('INSERT INTO menu_categories (venue, name) VALUES (?,?)', [venue, catName]))[0].insertId
    const items = {
      planters: [['Butter Chicken Masala', 180, 0], ['Steaks & Grills', 220, 0], ['Fish & Chips', 190, 0]],
      veranda: [['Orthodox Green Tea', 35, 0], ['Cappuccino', 55, 0], ['Hot Chocolate', 150, 0]],
      rajbar: [['Single Malt Whisky', 450, 1], ['Kingfisher Beer', 180, 1], ['Gin & Tonic', 260, 1]],
    }[venue]
    for (const [name, price, liquor] of items) {
      const [ex] = await pool.query('SELECT id FROM menu_items WHERE category_id = ? AND name = ?', [catId, name])
      if (!ex.length) await pool.query(
        'INSERT INTO menu_items (category_id, name, price, is_liquor) VALUES (?,?,?,?)',
        [catId, name, price, liquor])
    }
  }

  console.log('✓ seed complete')
  await pool.end()
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1) })
