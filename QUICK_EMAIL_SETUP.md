# 🚀 Quick Email Setup (5 Minutes)

Currently emails are **NOT being sent** to Gmail. They're only stored in the database.

## ⚡ Enable Real Gmail Sending

### Step 1: Get Gmail App Password (2 min)

1. Visit: **https://myaccount.google.com/apppasswords**
2. Sign in to your Gmail account
3. Click **Select app** → Choose **Mail**
4. Click **Select device** → Choose **Other** → Type "PlaySmart"
5. Click **Generate**
6. **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

### Step 2: Edit .env File (2 min)

Open the `.env` file in your project root and:

**Find this section:**
```env
# Enable real email sending (set to true to send actual emails)
ENABLE_REAL_EMAILS=false

# Your Gmail SMTP configuration
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your.email@gmail.com
# SMTP_PASSWORD=your_16_char_app_password_here
# SMTP_FROM_EMAIL=your.email@gmail.com
# SMTP_FROM_NAME=TCS PlaySmart
```

**Change it to** (remove all `#` and fill in your details):
```env
# Enable real email sending
ENABLE_REAL_EMAILS=true

# Your Gmail SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=john.doe@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=john.doe@gmail.com
SMTP_FROM_NAME=TCS PlaySmart
```

**⚠️ Important:**
- Replace `john.doe@gmail.com` with YOUR Gmail address
- Replace `abcdefghijklmnop` with YOUR app password (remove spaces!)
- Change `ENABLE_REAL_EMAILS=false` to `ENABLE_REAL_EMAILS=true`

**Save the file!**

### Step 3: Backend Auto-Reloads (10 sec)

Wait 10 seconds. The backend will automatically reload with new settings.

You should see in the backend console:
```
✅ Real email sent to user@example.com
```

### Step 4: Test It! (1 min)

**Option A - Test Script:**
```bash
cd backend
python test_email.py
```

Expected output:
```
✅ SUCCESS! Test email sent.
Check your inbox at: your.email@gmail.com
```

**Option B - Book a Facility:**
1. Go to http://localhost:3000
2. Register/Login
3. Book any sports facility
4. **Check your Gmail inbox!** 📬

---

## 🎯 What You Get

After setup, every booking will send:

✅ **Real Gmail notification** to the user's email address  
✅ **Stored in database** for logging (http://localhost:8000/api/emails)  
✅ **Booking confirmation** with all details  
✅ **QR code pass** information  

---

## ❌ Troubleshooting

### "Authentication failed"
- Double-check your Gmail address
- Verify app password is correct (16 characters, no spaces)
- Ensure 2-Step Verification is enabled on your Google account

### "Credentials not configured"
- Make sure you removed `#` from ALL SMTP lines
- Check `SMTP_USER` and `SMTP_PASSWORD` are filled in
- Verify `ENABLE_REAL_EMAILS=true` (not false)

### No email received
- Check spam/junk folder
- Wait 1-2 minutes (sometimes delayed)
- Try test script: `python backend/test_email.py`

### Backend not reloading
- Stop backend (Ctrl+C)
- Restart: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

---

## 📧 Current Status

**Before setup:**
```
Emails → Database only ❌
Real Gmail → Not sent ❌
```

**After setup:**
```
Emails → Database ✅
Real Gmail → Sent to inbox ✅
```

---

## 📝 Quick Checklist

- [ ] Got Gmail App Password
- [ ] Edited `.env` file
- [ ] Removed `#` from SMTP lines
- [ ] Added my Gmail address
- [ ] Added my app password
- [ ] Set `ENABLE_REAL_EMAILS=true`
- [ ] Saved `.env` file
- [ ] Waited for backend reload
- [ ] Tested with `python backend/test_email.py`
- [ ] Received test email in Gmail ✉️

---

**That's it! Your emails will now be sent to real Gmail addresses!** 🎉

See `HOW_TO_ENABLE_REAL_EMAILS.txt` for detailed instructions.
