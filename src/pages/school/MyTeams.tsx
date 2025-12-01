import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { TeamCard } from '@/components/TeamCard';
import { Team, PaymentStatus } from '@/types';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ShoppingCart, CreditCard } from 'lucide-react';

export const MyTeams: React.FC = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
    }, [userProfile]);

    const fetchTeams = async () => {
        if (!userProfile) return;

        try {
            const teamsRef = collection(db, 'teams');
            const q = query(teamsRef, where('userId', '==', userProfile.uid));
            const snapshot = await getDocs(q);

            const teamsData: Team[] = [];
            snapshot.forEach((doc) => {
                teamsData.push({ id: doc.id, ...doc.data() } as Team);
            });

            // Sort: pending first, then by date
            teamsData.sort((a, b) => {
                if (a.paymentStatus === PaymentStatus.PENDING && b.paymentStatus !== PaymentStatus.PENDING) return -1;
                if (a.paymentStatus !== PaymentStatus.PENDING && b.paymentStatus === PaymentStatus.PENDING) return 1;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });

            setTeams(teamsData);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (teamId: string) => {
        if (!confirm('Yakin ingin menghapus tim ini?')) return;

        try {
            await deleteDoc(doc(db, 'teams', teamId));
            setTeams(teams.filter(t => t.id !== teamId));
            alert('Tim berhasil dihapus');
        } catch (error) {
            console.error('Error deleting team:', error);
            alert('Gagal menghapus tim');
        }
    };

    const pendingTeams = teams.filter(t => t.paymentStatus === PaymentStatus.PENDING);
    const paidTeams = teams.filter(t => t.paymentStatus === PaymentStatus.PAID);

    const totalPending = pendingTeams.reduce((sum, t) => sum + t.price, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tim Saya</h1>
                    <p className="text-gray-600">Kelola semua tim yang telah didaftarkan</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Pending Teams Section */}
                        {pendingTeams.length > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Tim Belum Dibayar ({pendingTeams.length})
                                    </h2>
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <CreditCard size={20} />
                                        <span>Bayar Sekarang (Rp {totalPending.toLocaleString('id-ID')})</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingTeams.map((team) => (
                                        <TeamCard
                                            key={team.id}
                                            team={team}
                                            onDelete={handleDelete}
                                            showActions={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Paid Teams Section */}
                        {paidTeams.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Tim Sudah Lunas ({paidTeams.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paidTeams.map((team) => (
                                        <TeamCard
                                            key={team.id}
                                            team={team}
                                            showActions={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {teams.length === 0 && (
                            <div className="text-center py-20">
                                <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Tim</h3>
                                <p className="text-gray-600 mb-6">Silakan daftar tim baru untuk mulai berpartisipasi</p>
                                <button
                                    onClick={() => navigate('/register-team')}
                                    className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                                >
                                    Daftar Tim Baru
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
