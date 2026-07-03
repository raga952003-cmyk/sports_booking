# 📧 Quick Guide: Enable Gmail Email Sending

Currently, emails are only stored in a simulated outbox (you can view them at http://localhost:8000/api/emails). To send real emails to Gmail addresses:

---

## 🚀 3-Step Setup (5 minutes)

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Scroll down to **App passwords** → Click it
4. Select **Mail** and **Other (Custom name)** → Type "PlaySmart"
5. Click **Generate**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update .env File

Open `.env` file and add these lines (or uncomment if they exist):

```env
# Enable Real Emails
ENABLE_REAL_EMAILS=true

# Your Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=your.email@gmail.com
SMTP_FROM_NAME=TCS PlaySmart
```

**Replace:**
- `your.email@gmail.com` with your Gmail address
- `abcdefghijklmnop` with your 16-char app password (no spaces!)

### Step 3: Test It

The backend will auto-reload. Test the email:

```bash
cd backend
python test_email.py
```

You should see:
```
✅ SUCCESS! Test email sent.
Check your inbox at: your.email@gmail.com
```

---

## ✅ Verify It's Working

### Option 1: Test Email Script
```bash
cd backend
python test_email.py
```

### Option 2: Book a Slot
1. Go to http://localhost:3000
2. Register/Login
3. Book a sports facility
4. **Check your Gmail inbox!** 📬

---

## 📨 Emails You'll Receive

After enabling, you'll receive real Gmail notifications for:

✅ **Booking Confirmations** - When you book a slot  
✅ **Booking Cancellations** - When bookings are cancelled  
✅ **Maintenance Alerts** - When facilities go under maintenance  
✅ **Waitlist Promotions** - When waitlist gets promoted  

---

## 🐛 Troubleshooting

### Email test fails with "Authentication error"
- Double-check your Gmail address and app password
- Make sure 2-Step Verification is enabled
- App password should be 16 characters with no spaces

### No email received (but no error)
- Check your **spam folder**
- Mark first email as "Not Spam"
- Wait 1-2 minutes (sometimes delayed)

### "SMTP credentials not configured" error
- Make sure `SMTP_USER` and `SMTP_PASSWORD` are in `.env`
- Restart the backend server

---

## 🔄 To Disable Real Emails

Set in `.env`:
```env
ENABLE_REAL_EMAILS=false
```

Emails will only be stored in the database (simulated mode).

---

## 📖 More Information

- **Full Setup Guide**: See `EMAIL_SETUP.md`
- **View Sent Emails**: http://localhost:8000/api/emails
- **Test Configuration**: `python backend/test_email.py`

---

**That's it! Your emails will now be sent to real Gmail addresses! 🎉**
