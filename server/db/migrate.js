/* Idempotent migration — safe to run on a fresh OR already-created database.
   Adds the member KYC columns and the documents / notifications / videos
   tables if they are missing.  Run:  npm run migrate  */
import dotenv from 'dotenv'
dotenv.config()
import { pool } from '../src/db.js'

async function hasColumn(table, col) {
  const [r] = await pool.query(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`, [table, col])
  return r.length > 0
}
async function addColumn(table, col, ddl) {
  if (await hasColumn(table, col)) { console.log(`• ${table}.${col} already present`); return }
  await pool.query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
  console.log(`✓ added column ${table}.${col}`)
}

async function migrate() {
  await addColumn('members', 'aadhaar', 'aadhaar VARCHAR(20) AFTER wallet_balance')
  await addColumn('members', 'pan', 'pan VARCHAR(15) AFTER aadhaar')
  await addColumn('members', 'address', 'address VARCHAR(300) AFTER pan')
  await addColumn('members', 'occupation', 'occupation VARCHAR(120) AFTER address')

  await pool.query(`CREATE TABLE IF NOT EXISTS member_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    doc_type VARCHAR(60) NOT NULL,
    reference VARCHAR(120),
    file_url VARCHAR(400),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_doc_member (member_id))`)
  console.log('✓ member_documents ready')

  await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    message VARCHAR(300) NOT NULL,
    kind VARCHAR(40) DEFAULT 'info',
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_notif_member (member_id, is_read))`)
  console.log('✓ notifications ready')

  await pool.query(`CREATE TABLE IF NOT EXISTS videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    youtube_id VARCHAR(20) NOT NULL,
    youtube_url VARCHAR(300) NOT NULL,
    sort INT DEFAULT 0,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
  console.log('✓ videos ready')

  console.log('✓ migration complete')
  await pool.end()
}

migrate().catch(e => { console.error('Migration failed:', e.message); process.exit(1) })
