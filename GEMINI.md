# PROJECT SPECIFICATION: PMI Competition App (PMR Madya Level)

## 1. Project Overview
Membangun web application untuk manajemen pendaftaran lomba Palang Merah Indonesia (PMI) tingkat Madya (SMP). Aplikasi ini memungkinkan sekolah untuk mendaftar, mengelola banyak tim untuk berbagai mata lomba, dan melakukan pembayaran otomatis.

## 2. Tech Stack Requirements (Google Ecosystem Focus)
- **Frontend:** React (Vite) + TypeScript.
- **Styling:** Tailwind CSS (Theme: Red & White / PMI Colors).
- **Backend/BaaS:** Google Firebase.
  - *Auth:* Email/Password (untuk akun Sekolah/Pembina).
  - *Firestore:* Database NoSQL.
  - *Functions:* Node.js (untuk memproses Token Midtrans & Webhook).
- **Payment Gateway:** Midtrans (Snap API).

## 3. Core Business Logic & Rules

### A. Target Audience
- **Level:** PMR Madya (Tingkat SMP).
- **User Unit:** Akun berbasis "Sekolah" atau "Pangkalan" (Bukan individu peserta). Satu akun mewakili satu sekolah (Pembina).

### B. Competition Categories (Mata Lomba)
Terdapat 5 mata lomba yang tersedia:
1. **Tandu Darurat** (Fokus: Ketangkasan & Kecepatan).
2. **Pertolongan Pertama Halang Rintang** (Fokus: Simulasi lapangan).
3. **Perawatan Keluarga** (PK).
4. **Penyuluhan** (Edukasi Kesehatan).
5. **A Si Can (Ayo Siaga Bencana)**.

### C. Registration Structure (One-to-Many)
- **Logika Pendaftaran:** Kolektif.
- Satu akun Sekolah (User) bisa mendaftarkan **banyak tim** untuk satu mata lomba.
- *Contoh Kasus:* "SMP Negeri 1" login, lalu mendaftarkan:
  - 3 Tim untuk Tandu Darurat.
  - 1 Tim untuk PK.
  - 2 Tim untuk A Si Can.
- Total tagihan dihitung berdasarkan jumlah tim yang didaftarkan.

### D. Payment Flow (Midtrans)
1. User menambahkan tim-tim yang ingin didaftarkan ke dalam "Keranjang" (Draft).
2. User melakukan "Checkout".
3. Sistem memanggil API Midtrans untuk mendapatkan `Snap Token`.
4. User membayar (QRIS/VA/E-Wallet).
5. Midtrans mengirim Webhook ke Firebase Functions -> Status tim berubah menjadi `PAID`.

## 4. Data Structure (Firestore Schema Suggestion)

### Collection: `users` (Schools)
```json
{
  "uid": "auth_user_id",
  "email": "pembina@smp1.com",
  "schoolName": "SMP Negeri 1 Bandung",
  "picName": "Budi Santoso",
  "phone": "08123456789",
  "createdAt": "timestamp"
}

### Collection: `teams` (Schools)
```json
{
  "id": "auto_id",
  "userId": "auth_user_id", // Link ke sekolah
  "schoolName": "SMP Negeri 1 Bandung",
  "competitionType": "TANDU_DARURAT", // Enum: TANDU, PP, PK, PENYULUHAN, ASICAN
  "teamName": "Tim Tandu A",
  "members": [
    { "name": "Siswa 1", "kelas": "8A" },
    { "name": "Siswa 2", "kelas": "8B" }
  ],
  "price": 150000,
  "paymentStatus": "PAID", // PENDING, PAID, FAILED
  "orderId": "midtrans_order_id" // Terisi setelah checkout
}

### Collection: `transaction` (Schools)
```json
{
  "orderId": "unique_order_id",
  "userId": "auth_user_id",
  "totalAmount": 450000,
  "items": ["team_id_1", "team_id_2", "team_id_3"],
  "status": "settlement",
  "paymentMethod": "gopay",
  "timestamp": "timestamp"
}