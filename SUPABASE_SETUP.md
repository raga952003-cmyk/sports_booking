# Supabase Setup Guide for TCS PlaySmart

## Your Supabase Project Details
- **Project URL**: https://kmcecytuzizhiokvwnlq.supabase.co
- **Project Reference**: kmcecytuzizhiokvwnlq
- **Database**: PostgreSQL

## ⚠️ CRITICAL SECURITY ISSUE

Your backend is currently using the **publishable key** (`sb_publishable_*`), which is meant for frontend/client-side use only.

**For backend API operations, you MUST use the SERVICE ROLE KEY (anon/secret key).**

### How to Get Your Service Role Key:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/kmcecytuzizhiokvwnlq
2. Navigate to: **Settings** → **API**
3. Under **Project API keys**, find:
   - `anon` key (public) - for frontend
   - `service_role` key (secret) - **USE THIS FOR BACKEND**

## Setup Instructions

### 1. Install Supabase CLI (if not installed)

**Windows (PowerShell):**
```powershell
# Using Scoop
scoop install supabase

# OR using npm
npm install -g supabase
```

### 2. Login to Supabase CLI

```bash
supabase login
```

### 3. Initialize Supabase in Your Project

```bash
supabase init
```

### 4. Link to Your Project

```bash
supabase link --project-ref kmcecytuzizhiokvwnlq
```

### 5. Update Environment Variables

Update your `.env` file with the correct keys:

```env
# Backend should use SERVICE ROLE KEY
SUPABASE_URL=https://kmcecytuzizhiokvwnlq.supabase.co
SUPABASE_KEY=<YOUR_SERVICE_ROLE_KEY_HERE>

# Database connection (for migrations/direct access)
DATABASE_URL=postgresql://postgres:[S@chinCHITRA12]@db.kmcecytuzizhiokvwnlq.supabase.co:5432/postgres
```

### 6. Push Database Schema

Run the SQL schema to set up your tables:

```bash
# Option 1: Using Supabase Dashboard SQL Editor
# Copy content from supabase_schema.sql and run in SQL Editor

# Option 2: Using psql (if installed)
psql "postgresql://postgres:[S@chinCHITRA12]@db.kmcecytuzizhiokvwnlq.supabase.co:5432/postgres" -f supabase_schema.sql
```

## Current Configuration Issues

### ❌ What's Wrong:
- Using `sb_publishable_f_BsjElwcIyK4YeGD6Ck3g_5AZb-CZe` (publishable key) in backend
- This key has limited permissions and shouldn't be used server-side

### ✅ What You Need:
- Service role key (starts with `eyJ...`) for backend operations
- This key has full database access and bypasses Row Level Security (RLS)

## Testing Your Setup

### Test Backend Connection:
```bash
cd backend
python -c "from database import db_mgr; print('Connected to:', 'Supabase' if db_mgr else 'SQLite')"
```

### Test API:
```bash
# Start backend
cd backend
uvicorn main:app --reload

# In another terminal, test the API
curl http://localhost:8000/
curl http://localhost:8000/api/facilities
```

## Security Best Practices

1. **Never commit your service role key to Git**
2. Add `.env` to `.gitignore` (already done)
3. Use environment variables in production
4. Enable Row Level Security (RLS) on Supabase tables for additional protection
5. For frontend, use the anon/publishable key
6. For backend, use the service role key

## Frontend vs Backend Keys

| Location | Key Type | Purpose |
|----------|----------|---------|
| Frontend (React) | anon/publishable | Limited client-side access |
| Backend (FastAPI) | service_role | Full server-side access |

## Next Steps

1. ✅ Get your service role key from Supabase dashboard
2. ✅ Update `.env` with the correct key
3. ✅ Run the database schema setup
4. ✅ Test the connection
5. ✅ Start both backend and frontend

## Troubleshooting

### Error: "permission denied"
- Check if you're using the service role key, not publishable key
- Verify your Supabase project is active

### Error: "connection refused"
- Check if SUPABASE_URL is correct
- Verify your internet connection
- Check Supabase project status

### Tables not found
- Run the `supabase_schema.sql` in your Supabase SQL Editor
- Verify tables exist in Supabase Dashboard → Table Editor
