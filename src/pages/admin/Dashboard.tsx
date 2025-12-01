import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Team, PaymentStatus, COMPETITIONS } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Users, School, DollarSign, CheckCircle2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalSchools: 0,
        totalTeams: 0,
        paidTeams: 0,
        totalRevenue: 0,
    });
    const [recentTeams, setRecentTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalSchools = usersSnapshot.size;

            // Fetch teams
            const teamsSnapshot = await getDocs(collection(db, 'teams'));
            const teams: Team[] = [];
            let paidCount = 0;
            let revenue = 0;

            teamsSnapshot.forEach((doc) => {
                const team = { id: doc.id, ...doc.data() } as Team;
                teams.push(team);

                if (team.paymentStatus === PaymentStatus.PAID) {
                    paidCount++;
                    revenue += team.price;
                }
            });

            // Sort by created date
            teams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            setStats({
                totalSchools,
                totalTeams: teams.length,
                paidTeams: paidCount,
                totalRevenue: revenue,
            });

            setRecentTeams(teams.slice(0, 10));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Overview pendaftaran lomba PMR Madya</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Sekolah</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSchools}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <School className="text-blue-600" size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Tim</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTeams}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Users className="text-purple-600" size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Tim Lunas</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.paidTeams}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle2 className="text-green-600" size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Pendapatan</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="text-primary-600" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Teams Table */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Pendaftaran Terbaru</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Sekolah
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Nama Tim
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Lomba
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Anggota
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Harga
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentTeams.map((team) => {
                                            const competition = COMPETITIONS.find(c => c.type === team.competitionType);
                                            return (
                                                <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {team.schoolName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {team.teamName}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        {competition?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {team.members.length} orang
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${team.paymentStatus === PaymentStatus.PAID
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {team.paymentStatus === PaymentStatus.PAID ? 'Lunas' : 'Pending'}
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
                    </>
                )}
            </div>
        </div>
    );
};
