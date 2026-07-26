-- ============================================================
--  Coonoor Club — Members Portal & Admin  (MySQL 8)
--  Run once:  mysql -u <user> -p < db/schema.sql
-- ============================================================
CREATE DATABASE IF NOT EXISTS coonoor_club
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coonoor_club;

-- ----- Admins -------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----- Membership plans --------------------------------------
CREATE TABLE IF NOT EXISTS membership_types (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80) NOT NULL,
  description VARCHAR(255),
  joining_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  annual_fee  DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1
);

-- ----- Members ------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  member_no          VARCHAR(20) UNIQUE,
  name               VARCHAR(120) NOT NULL,
  email              VARCHAR(160) NOT NULL UNIQUE,
  phone              VARCHAR(30),
  password_hash      VARCHAR(255) NOT NULL,
  membership_type_id INT,
  status             ENUM('pending','active','suspended','rejected') NOT NULL DEFAULT 'pending',
  wallet_balance     DECIMAL(12,2) NOT NULL DEFAULT 0,
  joined_at          DATE,
  approved_by        INT,
  approved_at        TIMESTAMP NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_member_type  FOREIGN KEY (membership_type_id) REFERENCES membership_types(id),
  CONSTRAINT fk_member_admin FOREIGN KEY (approved_by)        REFERENCES admins(id)
);

-- ----- Wallet ledger (every credit/debit) --------------------
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id      INT NOT NULL,
  type           ENUM('credit','debit') NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  balance_after  DECIMAL(12,2) NOT NULL,
  reason         VARCHAR(200),
  reference_type VARCHAR(40),          -- 'room_booking','table_booking','play_booking','charge','topup'
  reference_id   BIGINT,
  created_by     INT,                  -- admin id when applicable
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wtx_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_wtx_member (member_id, created_at)
);

-- ----- Rooms / Stay ------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  room_type       VARCHAR(60),
  description     VARCHAR(400),
  price_per_night DECIMAL(10,2) NOT NULL,
  capacity        INT DEFAULT 2,
  image_url       VARCHAR(300),
  is_active       TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS room_bookings (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id    INT NOT NULL,
  room_id      INT NOT NULL,
  check_in     DATE NOT NULL,
  check_out    DATE NOT NULL,
  guests       INT DEFAULT 1,
  nights       INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status       ENUM('confirmed','cancelled','completed') NOT NULL DEFAULT 'confirmed',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rb_member FOREIGN KEY (member_id) REFERENCES members(id),
  CONSTRAINT fk_rb_room   FOREIGN KEY (room_id)   REFERENCES rooms(id),
  INDEX idx_rb_dates (room_id, check_in, check_out),
  INDEX idx_rb_member (member_id)
);

-- ----- Dining / Bar menu (menu, liquor, cost changes) --------
CREATE TABLE IF NOT EXISTS menu_categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  venue ENUM('planters','veranda','rajbar') NOT NULL,
  name  VARCHAR(80) NOT NULL,
  sort  INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  category_id  INT NOT NULL,
  name         VARCHAR(120) NOT NULL,
  description  VARCHAR(255),
  price        DECIMAL(10,2) NOT NULL,
  is_liquor    TINYINT(1) NOT NULL DEFAULT 0,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mi_cat FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

-- ----- Table (dining) reservations ---------------------------
CREATE TABLE IF NOT EXISTS table_bookings (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id    INT NOT NULL,
  venue        ENUM('planters','veranda','rajbar') NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  party_size   INT NOT NULL DEFAULT 2,
  status       ENUM('confirmed','cancelled','completed') NOT NULL DEFAULT 'confirmed',
  note         VARCHAR(255),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tb_member FOREIGN KEY (member_id) REFERENCES members(id),
  INDEX idx_tb_date (booking_date)
);

-- ----- Play areas (tennis, badminton, squash, billiards, cards)
CREATE TABLE IF NOT EXISTS play_areas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80) NOT NULL,
  description VARCHAR(300),
  charge      DECIMAL(10,2) NOT NULL DEFAULT 0,   -- charge per slot/hour
  charge_unit VARCHAR(30) DEFAULT 'per hour',
  image_url   VARCHAR(300),
  is_active   TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS play_bookings (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL,
  play_area_id  INT NOT NULL,
  booking_date  DATE NOT NULL,
  start_time    TIME NOT NULL,
  duration_mins INT NOT NULL DEFAULT 60,
  charge_amount DECIMAL(10,2) NOT NULL,
  status        ENUM('confirmed','cancelled','completed') NOT NULL DEFAULT 'confirmed',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pb_member FOREIGN KEY (member_id)    REFERENCES members(id),
  CONSTRAINT fk_pb_area   FOREIGN KEY (play_area_id) REFERENCES play_areas(id),
  INDEX idx_pb_date (booking_date)
);

-- ----- Ad-hoc charges an admin can raise on a member ----------
CREATE TABLE IF NOT EXISTS charges (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id   INT NOT NULL,
  category    VARCHAR(60),
  description VARCHAR(255),
  amount      DECIMAL(10,2) NOT NULL,
  status      ENUM('unpaid','paid','waived') NOT NULL DEFAULT 'unpaid',
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ch_member FOREIGN KEY (member_id) REFERENCES members(id),
  CONSTRAINT fk_ch_admin  FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- ----- Gallery & Events (admin managed) ----------------------
CREATE TABLE IF NOT EXISTS gallery_images (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(160),
  image_url  VARCHAR(300) NOT NULL,
  category   VARCHAR(60),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gi_admin FOREIGN KEY (created_by) REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS events (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(180) NOT NULL,
  description  TEXT,
  event_date   DATE,
  image_url    VARCHAR(300),
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_by   INT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ev_admin FOREIGN KEY (created_by) REFERENCES admins(id)
);
