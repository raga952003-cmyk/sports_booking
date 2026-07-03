# 📧 Real Email Setup for TCS PlaySmart

By default, emails are stored in a **simulated outbox** for testing. To send real emails to Gmail, follow these steps:

---

## 🚀 Quick Setup (Gmail)

### Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **App passwords**
5. Select:
   - **App**: Mail
   - **Device**: Other (Custom name) → "TCS PlaySmart"
6. Click **Generate**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update .env File

Add these lines to your `.env` file:

```env
# Enable Real Email Sending
ENABLE_REAL_EMAILS=true

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_password_here
SMTP_FROM_EMAIL=your.email@gmail.com
SMTP_FROM_NAME=TCS PlaySmart
```

**Replace**:
- `your.email@gmail.com` with your Gmail address
- `your_app_password_here` with the 16-character app password (remove spaces)

### Step 3: Restart Backend Server

The backend will auto-reload, or manually restart:
```bash
# Stop the current backend (Ctrl+C)
# Then restart
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Test Email Sending

```bash
# Run test script
python backend/test_email.py
```

Or test via API:
```bash
curl -X POST http://localhost:8000/api/test-email
```

---

## 📨 How It Works

### Current Behavior (Default)
- ✅ Emails are stored in database table `simulated_emails`
- ✅ View emails at: http://localhost:8000/api/emails
- ✅ No actual emails sent (safe for testing)

### With Real Emails Enabled
- ✅ Emails still stored in database (for logging)
- ✅ **PLUS** real emails sent via SMTP to actual Gmail addresses
- ✅ Users receive emails in their Gmail inbox

---

## 🔧 Supported Email Providers

### Gmail (Recommended)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your.email@outlook.com
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your.email@yahoo.com
```

### Custom SMTP Server
```env
SMTP_HOST=your.smtp.server.com
SMTP_PORT=587
SMTP_USER=your.username
```

---

## 📬 Emails Sent by the System

### 1. Booking Confirmation
**When**: After successful booking  
**To**: Employee who booked  
**Subject**: "TCS PlaySmart - Slot Booking Confirmed [booking_id]"

### 2. Booking Cancellation
**When**: Booking cancelled (by user or admin)  
**To**: Employee whose booking was cancelled  
**Subject**: "TCS PlaySmart - Booking Cancelled [booking_id]"

### 3. Maintenance Alert
**When**: Facility marked for maintenance  
**To**: All employees with bookings on that facility  
**Subject**: "TCS PlaySmart - Booking Cancelled due to Facility Maintenance"

### 4. Waitlist Promotion
**When**: Waitlist user promoted to confirmed booking  
**To**: Employee who was on waitlist  
**Subject**: "TCS PlaySmart - Waitlist Promoted to Confirmed Booking"

---

## 🧪 Testing Email Configuration

### Test Script
Create a test file `backend/test_email.py`:

```python
from email_service import test_email_configuration

result = test_email_configuration()
if result["success"]:
    print("✅ Email sent successfully!")
    print(result["message"])
else:
    print("❌ Email failed:")
    print(result["error"])
```

Run it:
```bash
cd backend
python test_email.py
```

### Manual Test via Booking
1. Register a user with your real Gmail address
2. Book a sports facility
3. Check your Gmail inbox for confirmation email

---

## 🔒 Security Best Practices

### ⚠️ NEVER Commit .env to Git
Your `.env` file contains sensitive credentials. It's already in `.gitignore`, but double-check:

```bash
# Verify .env is ignored
git status
# .env should NOT appear in the list
```

### 🔐 Use App Passwords, Not Regular Password
- Never use your actual Gmail password
- Always use App Passwords for applications
- App passwords are 16 characters (e.g., `abcdefghijklmnop`)

### 🛡️ Rotate Credentials Regularly
- Generate new app password every few months
- Revoke old app passwords you're not using

---

## 🐛 Troubleshooting

### Error: "SMTP authentication failed"
**Cause**: Wrong email or app password  
**Fix**: 
1. Double-check SMTP_USER is your full Gmail address
2. Verify app password is correct (16 chars, no spaces)
3. Make sure 2-Step Verification is enabled

### Error: "SMTP credentials not configured"
**Cause**: Missing SMTP_USER or SMTP_PASSWORD in .env  
**Fix**: Add both variables to .env file

### Emails not sending (no error)
**Cause**: ENABLE_REAL_EMAILS not set to true  
**Fix**: Set `ENABLE_REAL_EMAILS=true` in .env

### Error: "Connection refused"
**Cause**: Wrong SMTP host or port  
**Fix**: 
- Gmail: Use `smtp.gmail.com` port `587`
- Check firewall isn't blocking port 587

### Emails in spam folder
**Cause**: Gmail's spam filters  
**Fix**: 
1. Mark first email as "Not Spam"
2. Add sender to contacts
3. Create filter to never send to spam

---

## 📊 Viewing Sent Emails

### Via API
```bash
# Get all emails
curl http://localhost:8000/api/emails

# Get latest 5 emails
curl http://localhost:8000/api/emails | head -n 50
```

### Via Admin Dashboard
1. Login as admin
2. Go to Admin Dashboard
3. View **Simulated Email Outbox**
4. See all sent emails with full content

### Via Database (SQLite)
```bash
cd backend
sqlite3 playsmart_sandbox.db
SELECT * FROM simulated_emails ORDER BY sent_at DESC LIMIT 5;
.quit
```

---

## 🔄 Toggle Between Real and Simulated Emails

### Disable Real Emails (Testing Mode)
```env
ENABLE_REAL_EMAILS=false
```
- Emails stored in database only
- No actual emails sent
- Safe for testing

### Enable Real Emails (Production Mode)
```env
ENABLE_REAL_EMAILS=true
```
- Emails sent to actual addresses
- Still logged in database
- Requires SMTP configuration

---

## 📝 Example .env Configuration

```env
# Database (commented out for SQLite mode)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your_service_role_key

# Email Configuration (Real Gmail)
ENABLE_REAL_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=playsmart.noreply@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=playsmart.noreply@gmail.com
SMTP_FROM_NAME=TCS PlaySmart
```

---

## ✅ Verification Checklist

Before going live with real emails:

- [ ] Gmail App Password generated
- [ ] SMTP credentials added to .env
- [ ] ENABLE_REAL_EMAILS set to true
- [ ] Backend restarted
- [ ] Test email sent successfully
- [ ] Booking confirmation email received
- [ ] Email not in spam folder
- [ ] .env file NOT committed to git

---

## 🎯 Quick Test

```bash
# 1. Update .env with your Gmail credentials
# 2. Restart backend
# 3. Run this:
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "TEST001",
    "email": "your.real.email@gmail.com",
    "facilityId": "badminton_c1",
    "slotTime": "10-11 AM",
    "bookingSource": "online"
  }'

# 4. Check your Gmail inbox!
```

---

**Your emails will now be sent to real Gmail addresses! 📧✨**
