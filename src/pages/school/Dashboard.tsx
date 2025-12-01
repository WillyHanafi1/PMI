import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { CompetitionCard } from '@/components/CompetitionCard';
import { COMPETITIONS, CompetitionType, Team, PaymentStatus } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PlusCircle, Users, CheckCircle2, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalTeams: 0,
        paidTeams: 0,
        pendingTeams: 0,
        totalCost: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!userProfile) return;

            try {
                const teamsRef = collection(db, 'teams');
                const q = query(teamsRef, where('userId', '==', userProfile.uid));
                const snapshot = await getDocs(q);

                let paid = 0;
                let pending = 0;
                let total = 0;

                snapshot.forEach((doc) => {
                    const team = doc.data() as Team;
                    total += team.price;
                    if (team.paymentStatus === PaymentStatus.PAID) {
                        paid++;
                    } else if (team.paymentStatus === PaymentStatus.PENDING) {
                        pending++;
                    }
                });

                setStats({
                    totalTeams: snapshot.size,
                    paidTeams: paid,
                    pendingTeams: pending,
                    totalCost: total,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [userProfile]);

    const handleRegister = (type: CompetitionType) => {
        navigate('/register-team', { state: { competitionType: type } });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 mb-8 text-white animate-fade-in">
                    <h1 className="text-3xl font-bold mb-2">
                        Selamat Datang, {userProfile?.schoolName}!
                    </h1>
                    <p className="text-primary-100">
                        Kelola pendaftaran tim lomba PMR Madya Anda di sini
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Tim</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTeams}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="text-blue-600" size={24} />
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

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tim Pending</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingTeams}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="text-yellow-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Biaya</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    Rp {stats.totalCost.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <PlusCircle className="text-primary-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Competition Selection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Pilih Mata Lomba</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {COMPETITIONS.map((competition) => (
                            <CompetitionCard
                                key={competition.type}
                                competitionType={competition.type}
                                onRegister={handleRegister}
                            />
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/teams')}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg hover:from-primary-100 hover:to-primary-200 transition-all group"
                        >
                            <span className="font-semibold text-gray-900">Lihat Tim Saya</span>
                            <Users className="text-primary-600 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/register-team')}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group"
                        >
                            <span className="font-semibold text-gray-900">Daftar Tim Baru</span>
                            <PlusCircle className="text-green-600 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
