# PMI Competition App

![PMI Logo](https://img.shields.io/badge/PMI-Competition-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.7-orange?style=for-the-badge&logo=firebase)

## 📋 Description

Web application untuk manajemen pendaftaran lomba Palang Merah Indonesia (PMI) tingkat PMR Madya (SMP). Aplikasi ini memungkinkan sekolah untuk mendaftar dan mengelola banyak tim untuk berbagai mata lomba dengan sistem pembayaran otomatis.

## 🎯 Features

### For Schools
- ✅ Multi-team registration system
- ✅ 5 competition categories (Tandu Darurat, PP Halang Rintang, PK, Penyuluhan, A Si Can)
- ✅ Real-time payment status tracking
- ✅ Team management dashboard
- 🔄 Online payment via Midtrans (Sandbox ready)

### For Admins
- ✅ Comprehensive dashboard with statistics
- ✅ View all registered teams
- ✅ Advanced filtering & search
- ✅ Export data to Excel/CSV
- 🔄 Payment monitoring

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (PMI Red & White theme)
- **Backend**: Firebase (Auth, Firestore)
- **Payment**: Midtrans Snap API
- **Export**: XLSX.js
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project (see SETUP_GUIDE.md)
- Midtrans account (see SETUP_GUIDE.md)

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd PMI
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your Firebase and Midtrans credentials (see `SETUP_GUIDE.md`).

4. Run development server:
```bash
npm run dev
```

5. Open browser at `http://localhost:3000`

## 🔧 Configuration

### Firebase Setup
See `SETUP_GUIDE.md` for detailed Firebase configuration steps.

### Midtrans Setup
See `SETUP_GUIDE.md` for Midtrans integration guide.

## 📁 Project Structure

```
PMI/
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/           # Firebase & Midtrans config
│   ├── contexts/         # React contexts (Auth)
│   ├── pages/            # Page components
│   │   ├── auth/         # Login, Register
│   │   ├── school/       # School dashboard, teams
│   │   └── admin/        # Admin dashboard
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── functions/            # Firebase Cloud Functions
├── public/               # Static assets
└── package.json
```

## 🎨 Design System

- **Primary Color**: PMI Red (#dc2626)
- **Typography**: Inter (Google Fonts)
- **Components**: Modern cards with hover effects
- **Animations**: Fade-in, slide-up, scale-in

## 🚀 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 📊 Competition Types

1. **Tandu Darurat** - Rp 150,000/team (2-4 members)
2. **PP Halang Rintang** - Rp 150,000/team (3-5 members)
3. **Perawatan Keluarga (PK)** - Rp 150,000/team (2-3 members)
4. **Penyuluhan** - Rp 150,000/team (2-4 members)
5. **A Si Can** - Rp 150,000/team (3-5 members)

## 🔐 Default Admin Credentials

For testing purposes:
- Email: `admin@pmi.com`
- Password: `admin123`

**⚠️ IMPORTANT**: Change these credentials before deploying to production!

## 📝 TODO / Known Issues

See `SETUP_GUIDE.md` for list of items that need configuration before production deployment.

## 📄 License

This project is created for PMI competition management purposes.

## 👥 Support

For questions or issues, please refer to `SETUP_GUIDE.md` or contact the development team.

---

**Built with ❤️ for Palang Merah Indonesia**
