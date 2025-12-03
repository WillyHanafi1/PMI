# 🚀 PMI Competition - Payment Flow Setup Guide

## 📋 Overview
Panduan ini menjelaskan cara setup lengkap payment flow menggunakan Midtrans Sandbox dan Firebase Cloud Functions untuk development dan testing.

---

## 1️⃣ Setup Midtrans Sandbox

### A. Daftar Midtrans
1. Buka [https://midtrans.com](https://midtrans.com)
2. Klik "Sign Up" → Daftar dengan email Anda
3. Verify email
4. Login ke [Dashboard Midtrans](https://dashboard.midtrans.com)

### B. Get Sandbox Credentials  
1. **Switch ke Sandbox Mode:**
   - Di dashboard, toggle ke "**Sandbox**" (kanan atas)
   
2. **Get Access Keys:**
   - Go to: **Settings** → **Access Keys**
   - Copy:
     - **Server Key** (starts with `SB-Mid-server-`)
     - **Client Key** (starts with `SB-Mid-client-`)

3. **Masukkan ke `.env`:**
```env
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_KEY_HERE
VITE_MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_KEY_HERE
VITE_MIDTRANS_IS_PRODUCTION=false
```

---

## 2️⃣ Setup Firebase Cloud Functions

### A. Install Firebase CLI
```powershell
npm install -g firebase-tools
```

Jika error quota (seperti sebelumnya), coba:
```powershell
# Gunakan proxy atau tunggu beberapa saat lalu coba lagi
npm install -g firebase-tools --registry=https://registry.npmjs.org/
```

### B. Login ke Firebase
```powershell
firebase login
```

### C. Initialize Firebase Project
```powershell
cd d:\Project\PMI
firebase init
```

**Pilihan saat init:**
- ✅ Functions
- ✅ Hosting
- Select your Firebase project
- Language: **JavaScript**
- ESLint: **No** (optional)
- Install dependencies: **Yes**

### D. Configure Functions Environment
Set Midtrans credentials untuk Cloud Functions:
```powershell
firebase functions:config:set midtrans.server_key="YOUR_MIDTRANS_SERVER_KEY"
firebase functions:config:set midtrans.client_key="YOUR_MIDTRANS_CLIENT_KEY"
firebase functions:config:set app.url="http://localhost:5173"
```

**Note:** Ganti `http://localhost:5173` dengan URL production Anda nanti.

### E. Install Functions Dependencies
```powershell
cd functions
npm install
```

### F. Deploy Firebase Functions
```powershell
firebase deploy --only functions
```

Setelah deploy, Anda akan mendapat 3 URLs:
- `createTransaction`
- `midtransWebhook`
- `checkPaymentStatus`

---

## 3️⃣ Configure Midtrans Webhook

### A. Get Webhook URL
Setelah deploy functions, copy URL webhook:
```
https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/midtransWebhook
```

### B. Set di Midtrans Dashboard
1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com)
2. **Switch ke Sandbox**
3. Go to: **Settings** → **Configuration**
4. **Payment Notification URL:**
   - Paste webhook URL Anda
5. **Finish Redirect URL:** (optional)
   - `https://your-app-url.com/payment/success`
6. Save

---

## 4️⃣ Test Payment Flow

### Test Cards (Sandbox)

#### ✅ Success Payment
```
Card Number: 4811 1111 1111 1114
CVV: 123
Expiry: 01/30
3D Secure OTP: 112233
```

#### ❌ Failed Payment
```
Card Number: 4911 1111 1111 1113
```

####  Pending Payment
```
Card Number: 4611 1111 1111 1113
```

### Testing Steps:
1. **Register tim** di aplikasi
2. Go to "**Tim Saya**"
3. Click "**Bayar Sekarang**"
4. Di Checkout, click "**Bayar Sekarang**"
5. **Midtrans Snap popup** akan muncul
6. Pilih metode payment (Credit Card/QRIS/VA/etc.)
7. Gunakan test card di atas
8. Complete payment

### Expected Results:
- ✅ Redirectto `/payment/success`
- ✅ Payment status updated to "PAID" di Firestore
- ✅ Tim status berubah jadi "Lunas"
- ✅ Webhook received di Firebase Functions

---

## 5️⃣ Verify Implementation

### Check Firestore:
1. Open Firebase Console → Firestore
2. Check `transactions` collection:
   - Should have new document with `orderId`
   - `status` should be "PAID"
3. Check `teams` collection:
   - `paymentStatus` should be "PAID"
   - `orderId` field populated

### Check Functions Logs:
```powershell
firebase functions:log
```

Look for:
- "Transaction notification received"
- "Payment status updated to PAID"

---

## 6️⃣ Production Deployment

### Before Going Production:

#### A. Switch to Production Midtrans
1. Get Production credentials from Midtrans
2. Update `.env`:
```env
VITE_MIDTRANS_CLIENT_KEY=Mid-client-PRODUCTION_KEY
VITE_MIDTRANS_SERVER_KEY=Mid-server-PRODUCTION_KEY
VITE_MIDTRANS_IS_PRODUCTION=true
```

#### B. Update Functions Config
```powershell
firebase functions:config:set midtrans.server_key="PRODUCTION_SERVER_KEY"
firebase functions:config:set midtrans.client_key="PRODUCTION_CLIENT_KEY"
firebase functions:config:set app.url="https://your-production-url.com"
```

#### C. Build & Deploy
```powershell
# Build frontend
npm run build

# Deploy everything
firebase deploy
```

---

## 7️⃣ Troubleshooting

### Midtrans Snap not loading?
- Check `.env` has correct `VITE_MIDTRANS_CLIENT_KEY`
- Check browser console for errors
- Verify Midtrans script loaded:
  ```js
  console.log(window.snap) // Should not be undefined
  ```

### Payment not updating status?
- Check Firebase Functions logs: `firebase functions:log`
- Verify webhook URL is correct in Midtrans dashboard
- Check Firestore rules allow writes

### Functions deployment fails?
- Make sure you're logged in: `firebase login`
- Check you selected correct project: `firebase use --add`
- Verify `functions/package.json` exists

---

## 📝 File Structure After Setup

```
PMI/
├── functions/
│   ├── index.js           # Firebase Cloud Functions
│   └── package.json      # Functions dependencies
├── firebase.json          # Firebase config
├── .firebaseignore
└── src/
    ├── pages/school/
    │   ├── Checkout.tsx
    │   ├── PaymentSuccess.tsx
    │   ├── PaymentPending.tsx
    │   └── PaymentError.tsx
    └── config/
        └── midtrans.ts
```

---

##  Development Checklist

Before testing:
- [ ] Midtrans Sandbox credentials in `.env`
- [ ] Firebase CLI installed
- [ ] Firebase project initialized
- [ ] Functions deployed
- [ ] Webhook URL configured in Midtrans
- [ ] Test cards ready

---

**Happy Testing! 🎉**
