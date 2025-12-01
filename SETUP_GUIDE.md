# 🔧 PMI Competition App - Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Configuration](#firebase-configuration)
3. [Midtrans Configuration](#midtrans-configuration)
4. [Environment Variables](#environment-variables)
5. [Business Rules to Finalize](#business-rules-to-finalize)
6. [Installation Steps](#installation-steps)
7. [Running the Application](#running-the-application)
8. [Admin Setup](#admin-setup)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before starting, make sure you have:
- [ ] Node.js v16+ installed
- [ ] npm or yarn package manager
- [ ] Gmail account (for Firebase)
- [ ] Code editor (VS Code recommended)

---

## 🔥 Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `pmi-competition` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

### Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create Database"
3. Select **Start in test mode** (for development)
4. Choose location closest to your users
5. Click "Enable"

**⚠️ IMPORTANT**: Update Firestore rules before production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teams collection
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
    }
  }
}
```

### Step 4: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Scroll down to "Your apps"
3. Click **Web** icon `</>`
4. Register app with nickname "PMI Competition Web"
5. Copy the `firebaseConfig` object
6. Save these values for the `.env` file

Example config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "pmi-competition.firebaseapp.com",
  projectId: "pmi-competition",
  storageBucket: "pmi-competition.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 5: Create Admin User

Since Firebase Auth doesn't allow direct admin role assignment through console, you have two options:

**Option A: Use the App (Recommended)**
1. Run the app locally
2. Register a new account using the email you want as admin
3. Go to Firebase Console → Firestore Database
4. Find the user document in `users` collection
5. Edit the document and change `role` field from `SCHOOL` to `ADMIN`

**Option B: Firebase Console**
1. Go to Firebase Console → Authentication
2. Add a new user manually
3. Then add document in Firestore `users` collection with:
```json
{
  "uid": "firebase_auth_uid",
  "email": "admin@pmi.com",
  "role": "ADMIN",
  "schoolName": "Admin",
  "picName": "Administrator",
  "phone": "081234567890",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 💳 Midtrans Configuration

### Step 1: Create Midtrans Account

1. Go to [Midtrans](https://midtrans.com/)
2. Click "Sign Up" and complete registration
3. Verify your email

### Step 2: Get Sandbox Credentials

1. Login to [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Switch to **Sandbox** environment (toggle on top right)
3. Go to **Settings** → **Access Keys**
4. Copy:
   - **Server Key** (starts with `SB-Mid-server-`)
   - **Client Key** (starts with `SB-Mid-client-`)
5. Save these for `.env` file

### Step 3: Configure Webhook (Later - After Deployment)

For payment notifications, you'll need to:
1. Deploy Firebase Functions (see `functions/index.js`)
2. Get the Cloud Function URL
3. Add webhook URL in Midtrans Dashboard → **Settings** → **Configuration**
4. Set notification URL to: `https://your-region-project-id.cloudfunctions.net/midtransWebhook`

**⚠️ Note**: This is advanced setup. For now, focus on getting the app running.

---

## 🔐 Environment Variables

Create a `.env` file in project root:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=pmi-competition.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pmi-competition
VITE_FIREBASE_STORAGE_BUCKET=pmi-competition.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Midtrans Configuration
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXXXXXXXXX
VITE_MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXXXXXXXXXXXXX
VITE_MIDTRANS_IS_PRODUCTION=false

# Admin Credentials (Optional - for reference)
VITE_ADMIN_EMAIL=admin@pmi.com
VITE_ADMIN_PASSWORD=admin123
```

---

## 📝 Business Rules to Finalize

Before going to production, you need to decide on:

### 1. Competition Prices
Currently all set to **Rp 150,000/team**. Update in `src/types/index.ts`:
```typescript
export const COMPETITIONS: CompetitionInfo[] = [
  {
    type: CompetitionType.TANDU_DARURAT,
    name: 'Tandu Darurat',
    price: 150000, // ← Update this
    maxMembers: 4,
    minMembers: 2,
  },
  // ... update others
];
```

### 2. Team Member Limits
Review min/max members for each competition type (currently configured as per GEMINI.md specifications).

### 3. Registration Deadline
Add deadline feature:
- Create `registrationDeadline` field in competition config
- Add UI to show countdown
- Block registration after deadline

### 4. Email Notifications
Implement actual email service:
- Options: SendGrid, Mailgun, Firebase Extensions
- Update `src/utils/emailService.ts`
- Send emails on:
  - Successful payment
  - Payment failure
  - Team registration confirmation

### 5. Payment Flow Completion
Currently payment integration is placeholder. To complete:
- Deploy Firebase Cloud Functions (`functions/index.js`)
- Configure Midtrans webhook
- Test sandbox payments

### 6. Participant Cards & Invoices
Implement PDF generation:
- Update `src/components/PrintCard.tsx`
- Add school logo
- Add QR code for verification
- Style invoice template

---

## 🚀 Installation Steps

1. **Navigate to project directory**:
```bash
cd d:\Project\PMI
```

2. **Install dependencies**:
```bash
npm install
```

3. **Setup environment variables** (see above section)

4. **Run development server**:
```bash
npm run dev
```

5. **Open browser** at `http://localhost:3000`

---

## ▶️ Running the Application

### Development Mode
```bash
npm run dev
```
Server will run at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

---

## 👤 Admin Setup

After first run:

1. **Create School Account** (for testing):
   - Go to `/register`
   - Fill school information
   - Register

2. **Create Admin Account**:
   - Option 1: Register as school, then manually change role in Firestore to `ADMIN`
   - Option 2: Create user in Firebase Auth console, then add document in Firestore

3. **Test Admin Access**:
   - Login with admin credentials
   - You should see `/admin` dashboard
   - Test viewing all teams
   - Test export functionality

---

## 🌐 Production Deployment

### Checklist Before Deployment

- [ ] Update Firebase Firestore rules (security)
- [ ] Change admin credentials
- [ ] Switch Midtrans to Production mode
- [ ] Setup custom domain
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Setup monitoring & analytics
- [ ] Test payment flow end-to-end
- [ ] Backup database regularly

### Recommended Hosting

**Option 1: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

**Option 2: Vercel/Netlify**
- Connect GitHub repository
- Auto-deploy on push
- Add environment variables in platform settings

---

## 🔧 Troubleshooting

### Issue: Firebase Auth not working
**Solution**: 
- Check if Email/Password is enabled in Firebase Console
- Verify `.env` variables are correct
- Clear browser cache and try again

### Issue: Midtrans payment not loading
**Solution**:
- Verify Midtrans client key is correct
- Check browser console for errors
- Ensure you're using Sandbox mode for testing

### Issue: Teams not saving to Firestore
**Solution**:
- Check Firestore rules allow write operations
- Verify user is authenticated
- Check browser console for permission errors

### Issue: npm install fails
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📞 Need Help?

- Review code comments in source files
- Check Firebase documentation
- Check Midtrans documentation
- Contact development team

---

## ✨ Next Steps

Once basic setup is complete:

1. ✅ Test school registration flow
2. ✅ Test team creation
3. ✅ Test admin dashboard
4. ✅ Configure Firebase security rules
5. ⏭️ Implement payment flow (Midtrans integration)
6. ⏭️ Setup email notifications
7. ⏭️ Implement participant card printing
8. ⏭️ Deploy to production

---

**Good luck! 🎉**
