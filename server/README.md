# Coonoor Club — Members & Admin API (Node.js + MySQL)

Backend for the members portal (booking table / stay / bar / play-area, wallet)
and the separate admin panel (approve members, balances, bookings, gallery,
events, menu & price management).

## Stack
Node.js + Express · MySQL 8 (`mysql2`) · JWT auth (`bcryptjs` + `jsonwebtoken`)

## Setup

1. **Configure**
   ```bash
   cd server
   cp .env.example .env
   # edit .env — set your real DB_USER / DB_PASSWORD and a long JWT_SECRET
   ```

2. **Create the database & tables** (uses your MySQL login — I never see your password)
   ```bash
   mysql -u root -p < db/schema.sql
   ```
   *(or open `db/schema.sql` in MySQL Workbench and run it)*

3. **Install & seed a default admin + sample data**
   ```bash
   npm install
   npm run seed
   ```

4. **Run**
   ```bash
   npm run dev     # or: npm start
   ```
   API on `http://localhost:4000`. Check `GET /api/health`.

## Auth endpoints (live now)
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/member/register` | Member self-registration → **pending** approval |
| POST | `/api/auth/member/login` | Member login (only **active** members) |
| POST | `/api/auth/admin/login` | Admin login |
| GET  | `/api/auth/me` | Current user from token |

Default admin (from `.env` seed vars): `admin@coonoorclub.com` — **change the password after first login.**

## Roadmap (next phases)
- `/api/member/*` — room/table/bar/play-area bookings, wallet balance & history
- `/api/admin/*` — approve/suspend members, wallet top-ups, bookings by date,
  gallery & events CRUD, menu/liquor/room/play-area price management, charges
- React member dashboard + admin panel in the frontend

## Notes
- **Wallet** is an internal prepaid credit ledger (admin tops up, bookings deduct).
  Real card/UPI top-ups need a payment gateway (Razorpay/Stripe) with your keys —
  a clean integration hook is left for that; no real payment data is handled here.
- `.env` is git-ignored — never commit real credentials.
