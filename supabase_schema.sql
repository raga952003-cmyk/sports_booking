-- TCS PlaySmart - Supabase PostgreSQL Schema DDL

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    department TEXT NOT NULL,
    business_unit TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('employee', 'security', 'admin')),
    password TEXT DEFAULT 'password',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on employee_id for faster foreign-key joins
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- 2. FACILITIES TABLE
CREATE TABLE IF NOT EXISTS facilities (
    facility_id TEXT PRIMARY KEY,
    sport TEXT NOT NULL,
    court_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'maintenance')) DEFAULT 'active'
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    booking_id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(employee_id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    facility_id TEXT NOT NULL REFERENCES facilities(facility_id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    court_name TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    booking_source TEXT NOT NULL CHECK (booking_source IN ('online', 'security')),
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'checked_in', 'no_show', 'cancelled')) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. WAITLIST TABLE
CREATE TABLE IF NOT EXISTS waitlist (
    waitlist_id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(employee_id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    facility_id TEXT NOT NULL REFERENCES facilities(facility_id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    court_name TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(employee_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SIMULATED SMTP EMAILS OUTBOX
CREATE TABLE IF NOT EXISTS simulated_emails (
    id TEXT PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SIMULATED TIME CONFIG
CREATE TABLE IF NOT EXISTS simulated_time (
    key TEXT PRIMARY KEY,
    hour INTEGER NOT NULL,
    minute INTEGER NOT NULL
);

-- Seed initial facilities data
INSERT INTO facilities (facility_id, sport, court_name, status) VALUES
('badminton_c1', 'Badminton', 'Court 1', 'active'),
('badminton_c2', 'Badminton', 'Court 2', 'active'),
('badminton_c3', 'Badminton', 'Court 3', 'active'),
('basketball_c1', 'Basketball', 'Court 1', 'active'),
('basketball_c2', 'Basketball', 'Court 2', 'active'),
('volleyball_c1', 'Volleyball', 'Court 1', 'active'),
('volleyball_c2', 'Volleyball', 'Court 2', 'active'),
('tt_t1', 'Table Tennis', 'Table 1', 'active'),
('tt_t2', 'Table Tennis', 'Table 2', 'active'),
('carrom_b1', 'Carrom', 'Board 1', 'active'),
('carrom_b2', 'Carrom', 'Board 2', 'active'),
('carrom_b3', 'Carrom', 'Board 3', 'active'),
('carrom_b4', 'Carrom', 'Board 4', 'active'),
('carrom_b5', 'Carrom', 'Board 5', 'active'),
('cricket_g1', 'Box Cricket', 'Ground 1', 'active')
ON CONFLICT (facility_id) DO NOTHING;

-- Seed default simulated time
INSERT INTO simulated_time (key, hour, minute) VALUES ('current_time', 9, 0)
ON CONFLICT (key) DO NOTHING;
