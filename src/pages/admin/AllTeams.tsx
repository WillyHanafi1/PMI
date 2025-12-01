import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Team, PaymentStatus, CompetitionType, COMPETITIONS } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { exportTeamsToExcel, exportTeamsToCSV } from '@/utils/exportToExcel';
import { Download, FileSpreadsheet, Search, Filter } from 'lucide-react';

export const AllTeams: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');
    const [filterCompetition, setFilterCompetition] = useState<CompetitionType | 'ALL'>('ALL');

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [teams, searchTerm, filterStatus, filterCompetition]);

    const fetchTeams = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'teams'));
            const teamsData: Team[] = [];

            snapshot.forEach((doc) => {
                teamsData.push({ id: doc.id, ...doc.data() } as Team);
            });

            teamsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setTeams(teamsData);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...teams];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (team) =>
                    team.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter((team) => team.paymentStatus === filterStatus);
        }

        // Competition filter
        if (filterCompetition !== 'ALL') {
            filtered = filtered.filter((team) => team.competitionType === filterCompetition);
        }

        setFilteredTeams(filtered);
    };

    const handleExportExcel = () => {
        exportTeamsToExcel(filteredTeams);
    };

    const handleExportCSV = () => {
        exportTeamsToCSV(filteredTeams);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Tim Terdaftar</h1>
                    <p className="text-gray-600">Kelola dan export data pendaftaran</p>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Search className="inline mr-2" size={16} />
                                Cari Sekolah / Tim
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Ketik nama sekolah atau tim..."
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Filter className="inline mr-2" size={16} />
                                Status Pembayaran
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'ALL')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value={PaymentStatus.PAID}>Lunas</option>
                                <option value={PaymentStatus.PENDING}>Pending</option>
                                <option value={PaymentStatus.FAILED}>Gagal</option>
                            </select>
                        </div>

                        {/* Competition Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jenis Lomba
                            </label>
                            <select
                                value={filterCompetition}
                                onChange={(e) => setFilterCompetition(e.target.value as CompetitionType | 'ALL')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="ALL">Semua Lomba</option>
                                {COMPETITIONS.map((comp) => (
                                    <option key={comp.type} value={comp.type}>
                                        {comp.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                            <FileSpreadsheet size={18} />
                            <span>Export Excel</span>
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                            <Download size={18} />
                            <span>Export CSV</span>
                        </button>
                        <div className="flex-1"></div>
                        <div className="text-sm text-gray-600 self-center">
                            Menampilkan <span className="font-bold">{filteredTeams.length}</span> dari{' '}
                            <span className="font-bold">{teams.length}</span> tim
                        </div>
                    </div>
                </div>

                {/* Teams Table */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sekolah</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tim</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lomba</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Anggota</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTeams.map((team, index) => {
                                        const competition = COMPETITIONS.find(c => c.type === team.competitionType);
                                        return (
                                            <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{team.schoolName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{team.teamName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{competition?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {team.members.length} orang
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${team.paymentStatus === PaymentStatus.PAID
                                                                ? 'bg-green-100 text-green-800'
                                                                : team.paymentStatus === PaymentStatus.PENDING
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {team.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    Rp {team.price.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
