# Struktur Data Penilaian PMI Competition

## 📋 Lokasi File Konfigurasi

### **1. Tipe Data Scoring**
File: `src/types/scoring.ts`

### **2. Kriteria Penilaian**
File: `src/pages/admin/ScoreInput.tsx` (baris 12-23)

---

## 🎯 Struktur Data Penilaian Saat Ini

### **DEFAULT_CRITERIA** (5 Kriteria Standar)

```typescript
const DEFAULT_CRITERIA: ScoringCriteria = {
    id: 'default',
    name: 'Standard PMR Scoring',
    criteria: [
        { id: 'speed', name: 'Kecepatan', weight: 1 },
        { id: 'technique', name: 'Teknik', weight: 1 },
        { id: 'accuracy', name: 'Akurasi', weight: 1 },
        { id: 'teamwork', name: 'Kerjasama Tim', weight: 1 },
        { id: 'tidiness', name: 'Kerapihan', weight: 1 }
    ],
    scoreRange: { min: 0, max: 10 },
    calculationMethod: 'average' as const
};
```

### **Penjelasan Field:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | string | Unique identifier untuk kriteria |
| `name` | string | Nama label kriteria (untuk UI) |
| `weight` | number | Bobot nilai (1 = sama berat) |
| `scoreRange` | object | Range nilai min/max |
| `calculationMethod` | string | Metode hitung: 'average', 'weighted', 'sum' |

---

## 🔧 Cara Mengubah Struktur Penilaian

### **Opsi 1: Ubah Kriteria Existing**

Edit file: `src/pages/admin/ScoreInput.tsx`

```typescript
const DEFAULT_CRITERIA: ScoringCriteria = {
    id: 'default',
    name: 'PMR Madya Scoring 2025',
    criteria: [
        { id: 'speed', name: 'Kecepatan', weight: 2 },        // Bobot 2x
        { id: 'technique', name: 'Teknik', weight: 2 },      // Bobot 2x
        { id: 'accuracy', name: 'Akurasi', weight: 1 },      // Bobot 1x
        { id: 'teamwork', name: 'Kerjasama Tim', weight: 1 }, // Bobot 1x
        { id: 'tidiness', name: 'Kerapihan', weight: 1 }     // Bobot 1x
    ],
    scoreRange: { min: 0, max: 10 },
    calculationMethod: 'weighted' // Ganti ke weighted
};
```

### **Opsi 2: Tambah Kriteria Baru**

```typescript
const DEFAULT_CRITERIA: ScoringCriteria = {
    id: 'default',
    name: 'PMR Scoring Extended',
    criteria: [
        { id: 'speed', name: 'Kecepatan', weight: 1 },
        { id: 'technique', name: 'Teknik', weight: 1 },
        { id: 'accuracy', name: 'Akurasi', weight: 1 },
        { id: 'teamwork', name: 'Kerjasama Tim', weight: 1 },
        { id: 'tidiness', name: 'Kerapihan', weight: 1 },
        { id: 'creativity', name: 'Kreativitas', weight: 1 },  // BARU
        { id: 'safety', name: 'Keselamatan', weight: 1 }       // BARU
    ],
    scoreRange: { min: 0, max: 10 },
    calculationMethod: 'average'
};
```

### **Opsi 3: Kriteria Berbeda Per Lomba**

Buat file baru: `src/config/scoringCriteria.ts`

```typescript
import { CompetitionType } from '@/types';
import { ScoringCriteria } from '@/types/scoring';

export const SCORING_CRITERIA_BY_COMPETITION: Record<CompetitionType, ScoringCriteria> = {
    [CompetitionType.TANDU_DARURAT]: {
        id: 'tandu',
        name: 'Tandu Darurat Scoring',
        criteria: [
            { id: 'speed', name: 'Kecepatan', weight: 3 },    // Fokus speed
            { id: 'technique', name: 'Teknik', weight: 2 },
            { id: 'teamwork', name: 'Kerjasama', weight: 1 }
        ],
        scoreRange: { min: 0, max: 10 },
        calculationMethod: 'weighted'
    },
    
    [CompetitionType.PP_HALANG_RINTANG]: {
        id: 'pp',
        name: 'PP Halang Rintang Scoring',
        criteria: [
            { id: 'speed', name: 'Kecepatan', weight: 2 },
            { id: 'accuracy', name: 'Akurasi PP', weight: 3 }, // Fokus accuracy
            { id: 'technique', name: 'Teknik', weight: 1 }
        ],
        scoreRange: { min: 0, max: 10 },
        calculationMethod: 'weighted'
    },
    
    [CompetitionType.PERAWATAN_KELUARGA]: {
        id: 'pk',
        name: 'Perawatan Keluarga Scoring',
        criteria: [
            { id: 'knowledge', name: 'Pengetahuan', weight: 2 },
            { id: 'practice', name: 'Praktik', weight: 2 },
            { id: 'communication', name: 'Komunikasi', weight: 1 }
        ],
        scoreRange: { min: 0, max: 10 },
        calculationMethod: 'weighted'
    },
    
    [CompetitionType.PENYULUHAN]: {
        id: 'penyuluhan',
        name: 'Penyuluhan Scoring',
        criteria: [
            { id: 'content', name: 'Materi', weight: 2 },
            { id: 'delivery', name: 'Penyampaian', weight: 2 },
            { id: 'creativity', name: 'Kreativitas', weight: 1 },
            { id: 'qa', name: 'Tanya Jawab', weight: 1 }
        ],
        scoreRange: { min: 0, max: 10 },
        calculationMethod: 'weighted'
    },
    
    [CompetitionType.A_SI_CAN]: {
        id: 'asican',
        name: 'A Si Can Scoring',
        criteria: [
            { id: 'simulation', name: 'Simulasi Bencana', weight: 2 },
            { id: 'response', name: 'Kecepatan Respons', weight: 2 },
            { id: 'procedure', name: 'Prosedur', weight: 1 }
        ],
        scoreRange: { min: 0, max: 10 },
        calculationMethod: 'weighted'
    }
};
```

---

## 📊 Metode Perhitungan

### **1. Average (Rata-rata)**
```
Total Score = (Score1 + Score2 + ... + ScoreN) / N
```
Contoh: `(8 + 9 + 7 + 8.5 + 9) / 5 = 8.3`

### **2. Weighted (Berbobot)**
```
Total Score = (Score1×Weight1 + Score2×Weight2 + ...) / Total Weight
```
Contoh dengan weight [2,2,1,1,1]:
```
(8×2 + 9×2 + 7×1 + 8.5×1 + 9×1) / 7 = 8.36
```

### **3. Sum (Penjumlahan)**
```
Total Score = Score1 + Score2 + ... + ScoreN
```
Contoh: `8 + 9 + 7 + 8.5 + 9 = 41.5`

---

## 🛠️ Langkah Implementasi Custom Scoring

### **Step 1: Edit Kriteria**
Edit `src/pages/admin/ScoreInput.tsx`:
- Ubah `DEFAULT_CRITERIA`
- Sesuaikan kriteria & bobot

### **Step 2: Test di UI**
1. Run: `npm run dev`
2. Login sebagai Admin
3. Buka `/admin/score-input`
4. Cek form input nilai

### **Step 3: Adjust n8n Payload**
Update format JSON di n8n untuk match dengan kriteria baru:
```json
{
  "teamId": "team_123",
  "scores": {
    "speed": 8.5,
    "technique": 9.0,
    "accuracy": 8.0,
    "creativity": 7.5,  // Jika ada kriteria baru
    "safety": 9.0       // Jika ada kriteria baru
  }
}
```

---

## 📝 Contoh Use Case

### **Skenario: Tandu Darurat - Weight Kecepatan 2x**

```typescript
const TANDU_CRITERIA: ScoringCriteria = {
    id: 'tandu',
    name: 'Tandu Darurat Scoring',
    criteria: [
        { id: 'speed', name: 'Kecepatan', weight: 2 },        // 2x
        { id: 'technique', name: 'Teknik Angkat', weight: 1 },
        { id: 'teamwork', name: 'Kerjasama', weight: 1 }
    ],
    scoreRange: { min: 0, max: 10 },
    calculationMethod: 'weighted'
};
```

**Perhitungan:**
- Kecepatan: 9.0 × 2 = 18
- Teknik: 8.0 × 1 = 8
- Kerjasama: 8.5 × 1 = 8.5
- **Total**: (18 + 8 + 8.5) / 4 = **8.625**

---

## 🔐 Firestore Schema

Data disimpan di collection `scores`:

```javascript
{
  teamId: "team_123",
  teamName: "Tim Tandu A",
  competitionType: "TANDU_DARURAT",
  schoolName: "SMP Negeri 1",
  scores: {
    speed: 8.5,
    technique: 9.0,
    accuracy: 8.0,
    teamwork: 9.5,
    tidiness: 8.8
  },
  totalScore: 8.76,  // Hasil kalkulasi
  rank: 1,
  status: "FINAL"
}
```

---

## 💡 Tips

1. **Konsisten**: Pastikan kriteria sama untuk semua tim dalam satu lomba
2. **Weight**: Total weight tidak harus 100%, sistem auto-normalize
3. **Backup**: Save kriteria lama sebelum ubah
4. **Test**: Test dengan sample data sebelum production
5. **Documentation**: Update guide ini jika ada perubahan

---

**File Terkait:**
- `src/types/scoring.ts` - TypeScript types
- `src/pages/admin/ScoreInput.tsx` - Form input & kriteria
- `src/utils/scoreCalculation.ts` - Logic perhitungan
- `functions/index.js` - n8n webhook handler
