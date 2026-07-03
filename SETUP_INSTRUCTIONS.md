# 🚀 Complete Setup Instructions - TCS PlaySmart

## Current Status

✅ Code issues fixed (3 bugs resolved)
✅ Project structure verified
⚠️ Using publishable key (need service role key)
⚠️ Database tables not created yet

## Step-by-Step Setup

### Step 1: Get Your Service Role Key ⚠️ CRITICAL

Your backend needs the **SERVICE ROLE KEY**, not the publishable key.

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/kmcecytuzizhiokvwnlq/settings/api

2. Find the **API Settings** section

3. You'll see TWO keys:
   - `anon` / `public` key (starts with `eyJ...` but labeled "anon")
   - `service_role` key (starts with `eyJ...` but labeled "service_role") ← **USE THIS ONE**

4. Copy the **service_role** key

5. Update your `.env` file:
```env
SUPABASE_URL=https://kmcecytuzizhiokvwnlq.supabase.co
SUPABASE_KEY=<paste_service_role_key_here>
```

### Step 2: Create Database Tables

You need to run the SQL schema to create all tables.

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to: https://supabase.com/dashboard/project/kmcecytuzizhiokvwnlq/editor
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the ENTIRE contents of `supabase_schema.sql` file
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see: ✅ "Success. No rows returned"

**Option B: Using psql Command Line**

```bash
# Windows
psql "postgresql://postgres:[S@chinCHITRA12]@db.kmcecytuzizhiokvwnlq.supabase.co:5432/postgres" -f supabase_schema.sql

# Or if psql is not installed, install PostgreSQL tools first
```

### Step 3: Verify Database Setup

After running the schema, verify tables exist:

1. Go to: https://supabase.com/dashboard/project/kmcecytuzizhiokvwnlq/editor
2. Click **Table Editor** in the left sidebar
3. You should see these tables:
   - ✓ users
   - ✓ facilities (should have 15 sports facilities)
   - ✓ bookings
   - ✓ waitlist
   - ✓ notifications
   - ✓ simulated_emails
   - ✓ simulated_time

### Step 4: Test Connection

```bash
python test_supabase_connection.py
```

**Expected output:**
```
✓ Using SERVICE ROLE KEY (correct for backend)
✓ Supabase client created successfully
✓ Query successful! Found 1 facility record(s)
✅ CONNECTION TEST PASSED!
```

### Step 5: Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 6: Start the Application

**Option A: Using Docker (Recommended)**

```bash
# Make sure Docker Desktop is running
docker-compose up --build
```

Wait for:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

**Option B: Manual Start**

Terminal 1 (Backend):
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Step 7: Create Admin Account

1. Open browser: http://localhost:3000
2. Click **"First Time Admin Setup"** button
3. Fill in admin details:
   - Employee ID: ADMIN001
   - Name: Your Name
   - Email: your.email@tcs.com
   - Password: (your choice)
4. Click **Initialize System Admin**
5. Login with your admin credentials

### Step 8: Explore the Application

**As Admin, you can:**
- View all bookings and users
- Mark facilities for maintenance
- View analytics dashboard
- Control simulated time
- Check email notifications

**Test Employee Flow:**
1. Logout from admin
2. Register as employee (Employee ID: EMP001)
3. Login and book a sports slot
4. Check notifications

**Test Security Flow:**
1. Register as security (Employee ID: SEC001, role: security)
2. Login and verify bookings
3. Check-in employees

## Troubleshooting

### Issue: "Could not find the table 'public.facilities'"

**Solution:** You haven't run the database schema yet.
- Go to Supabase SQL Editor
- Run `supabase_schema.sql`

### Issue: "Permission denied" / "JWT expired"

**Solution:** Wrong key type.
- Make sure you're using SERVICE ROLE key
- Not the publishable/anon key

### Issue: Backend won't start - "ModuleNotFoundError"

**Solution:** Install Python dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Issue: Frontend won't connect - "Failed to fetch"

**Solution:** 
1. Check backend is running: http://localhost:8000
2. Check CORS settings in `backend/main.py`
3. Verify frontend is using correct API URL

### Issue: Docker fails to start

**Solution:**
1. Check Docker Desktop is running
2. Check ports 8000 and 3000 are not in use:
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000
```

## Quick Command Reference

```bash
# Test Supabase connection
python test_supabase_connection.py

# Start with Docker
docker-compose up --build

# Start backend only
cd backend && uvicorn main:app --reload

# Start frontend only  
cd frontend && npm run dev

# View Docker logs
docker-compose logs -f

# Stop Docker
docker-compose down

# Clean everything
docker-compose down -v
```

## Security Checklist Before Production

- [ ] Replace publishable key with service role key
- [ ] Add password hashing (bcrypt/argon2)
- [ ] Update CORS to specific origins
- [ ] Use environment variables for all secrets
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Add rate limiting
- [ ] Set up proper authentication tokens
- [ ] Review and test all API endpoints

## Next Steps

1. ✅ Get service role key from Supabase
2. ✅ Run database schema
3. ✅ Test connection
4. ✅ Start application
5. ✅ Create admin account
6. ✅ Test all features

## Need Help?

- Check the detailed guide: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- Review the main [README.md](README.md)
- Test connection: `python test_supabase_connection.py`
- Check logs: `docker-compose logs -f`
