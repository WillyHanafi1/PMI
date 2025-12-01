import * as XLSX from 'xlsx';
import { Team, COMPETITIONS } from '@/types';

export const exportTeamsToExcel = (teams: Team[], filename: string = 'PMI_Competition_Teams') => {
    // Prepare data for export
    const data = teams.map((team, index) => {
        const competition = COMPETITIONS.find(c => c.type === team.competitionType);

        return {
            'No': index + 1,
            'Sekolah': team.schoolName,
            'Nama Tim': team.teamName,
            'Lomba': competition?.name || team.competitionType,
            'Jumlah Anggota': team.members.length,
            'Anggota': team.members.map(m => `${m.name} (${m.kelas})`).join(', '),
            'Status Pembayaran': team.paymentStatus,
            'Harga': team.price,
            'Order ID': team.orderId || '-',
        };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },  // No
        { wch: 30 }, // Sekolah
        { wch: 20 }, // Nama Tim
        { wch: 35 }, // Lomba
        { wch: 15 }, // Jumlah Anggota
        { wch: 50 }, // Anggota
        { wch: 18 }, // Status
        { wch: 12 }, // Harga
        { wch: 25 }, // Order ID
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Teams');

    // Export file
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
};

export const exportTeamsToCSV = (teams: Team[], filename: string = 'PMI_Competition_Teams') => {
    // Prepare data for export
    const data = teams.map((team, index) => {
        const competition = COMPETITIONS.find(c => c.type === team.competitionType);

        return {
            'No': index + 1,
            'Sekolah': team.schoolName,
            'Nama Tim': team.teamName,
            'Lomba': competition?.name || team.competitionType,
            'Jumlah Anggota': team.members.length,
            'Anggota': team.members.map(m => `${m.name} (${m.kelas})`).join('; '),
            'Status Pembayaran': team.paymentStatus,
            'Harga': team.price,
            'Order ID': team.orderId || '-',
        };
    });

    // Create workbook for CSV
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Teams');

    // Export as CSV
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}_${timestamp}.csv`, { bookType: 'csv' });
};
