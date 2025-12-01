// TypeScript interfaces and types for PMI Competition App

export enum CompetitionType {
    TANDU_DARURAT = 'TANDU_DARURAT',
    PP_HALANG_RINTANG = 'PP_HALANG_RINTANG',
    PERAWATAN_KELUARGA = 'PERAWATAN_KELUARGA',
    PENYULUHAN = 'PENYULUHAN',
    A_SI_CAN = 'A_SI_CAN',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    EXPIRED = 'EXPIRED',
}

export enum UserRole {
    SCHOOL = 'SCHOOL',
    ADMIN = 'ADMIN',
}

export interface User {
    uid: string;
    email: string;
    role: UserRole;
    schoolName: string;
    picName: string; // Person in Charge
    phone: string;
    createdAt: Date;
}

export interface TeamMember {
    name: string;
    kelas: string;
    nisn?: string;
}

export interface Team {
    id: string;
    userId: string;
    schoolName: string;
    competitionType: CompetitionType;
    teamName: string;
    members: TeamMember[];
    price: number;
    paymentStatus: PaymentStatus;
    orderId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction {
    orderId: string;
    userId: string;
    schoolName: string;
    totalAmount: number;
    items: string[]; // Array of team IDs
    status: PaymentStatus;
    paymentMethod?: string;
    snapToken?: string;
    timestamp: Date;
}

export interface CompetitionInfo {
    type: CompetitionType;
    name: string;
    description: string;
    price: number;
    maxMembers: number;
    minMembers: number;
}

export interface CartItem {
    team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>;
    tempId: string;
}

// Competition details configuration
export const COMPETITIONS: CompetitionInfo[] = [
    {
        type: CompetitionType.TANDU_DARURAT,
        name: 'Tandu Darurat',
        description: 'Lomba ketangkasan dan kecepatan menggunakan tandu darurat',
        price: 150000,
        maxMembers: 4,
        minMembers: 2,
    },
    {
        type: CompetitionType.PP_HALANG_RINTANG,
        name: 'Pertolongan Pertama Halang Rintang',
        description: 'Simulasi pertolongan pertama dengan rintangan lapangan',
        price: 150000,
        maxMembers: 5,
        minMembers: 3,
    },
    {
        type: CompetitionType.PERAWATAN_KELUARGA,
        name: 'Perawatan Keluarga (PK)',
        description: 'Lomba perawatan kesehatan keluarga',
        price: 150000,
        maxMembers: 3,
        minMembers: 2,
    },
    {
        type: CompetitionType.PENYULUHAN,
        name: 'Penyuluhan',
        description: 'Lomba penyuluhan edukasi kesehatan',
        price: 150000,
        maxMembers: 4,
        minMembers: 2,
    },
    {
        type: CompetitionType.A_SI_CAN,
        name: 'A Si Can (Ayo Siaga Bencana)',
        description: 'Lomba kesiapsiagaan menghadapi bencana',
        price: 150000,
        maxMembers: 5,
        minMembers: 3,
    },
];
