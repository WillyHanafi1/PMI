# 🚀 DEPLOY FIREBASE FUNCTIONS - QUICK GUIDE

## Prerequisites Check
✅ Midtrans credentials di `.env`
✅ Firebase credentials di `.env`
✅ Functions code ready di `functions/` folder

---

## 🔥 STEP-BY-STEP (Copy-Paste Commands)

### Step 1: Install Firebase CLI (if not installed)
```powershell
npm install -g firebase-tools
```

### Step 2: Login Firebase (⚠️ HUMAN REQUIRED)
```powershell
firebase login
```
**Action:** Browser akan buka → Login dengan Google account Anda → Authorize

### Step 3: Select Firebase Project (⚠️ HUMAN REQUIRED)
```powershell
cd d:\Project\PMI
firebase use --add
```
**Action:** Pilih project Firebase Anda dari list

### Step 4: Install Functions Dependencies
```powershell
cd functions
npm install
cd ..
```

### Step 5: Set Midtrans Config
**⚠️ GANTI dengan Server & Client Key Anda dari `.env`!**

```powershell
firebase functions:config:set midtrans.server_key="YOUR_SERVER_KEY_HERE"
firebase functions:config:set midtrans.client_key="YOUR_CLIENT_KEY_HERE"
firebase functions:config:set app.url="http://localhost:5173"
```

**Verify:**
```powershell
firebase functions:config:get
```

### Step 6: Deploy Functions 🚀
```powershell
firebase deploy --only functions
```

**Output akan memberikan URL seperti:**
```
https://REGION-PROJECT.cloudfunctions.net/midtransWebhook
```
**☝️ COPY URL INI!**

### Step 7: Set Webhook di Midtrans (⚠️ HUMAN REQUIRED)
1. Login [dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Switch ke **Sandbox**
3. Settings → Configuration
4. Payment Notification URL: **PASTE URL dari Step 6**
5. Save

---

## ✅ Verify Deployment

```powershell
# Check deployed functions
firebase functions:list

# Check logs
firebase functions:log --limit 10
```

---

## 🧪 Test Payment

1. Buka app: http://localhost:5173
2. Register tim
3. Bayar dengan test card:
   ```
   Card: 4811 1111 1111 1114
   CVV: 123
   Expiry: 01/30
   OTP: 112233
   ```
4. Check Firestore → teams → paymentStatus should be "PAID"

---

**🎯 Quick Command Checklist:**
```powershell
# 1. Login (manual)
firebase login

# 2. Select project (manual)
firebase use --add

# 3. Install deps
cd functions && npm install && cd ..

# 4. Set config (ganti YOUR_XXX dengan keys dari .env!)
firebase functions:config:set midtrans.server_key="YOUR_SERVER_KEY"
firebase functions:config:set midtrans.client_key="YOUR_CLIENT_KEY"
firebase functions:config:set app.url="http://localhost:5173"

# 5. Deploy!
firebase deploy --only functions

# 6. Set webhook URL di Midtrans dashboard (manual)
```

**Total Time: ~10 minutes**
