import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Team, PaymentStatus, COMPETITIONS } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadMidtransScript, openMidtransSnap } from '@/config/midtrans';
import { CreditCard, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';

export const Checkout: React.FC = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingTeams();
        loadMidtransScript();
    }, [userProfile]);

    const fetchPendingTeams = async () => {
        if (!userProfile) return;

        try {
            const teamsRef = collection(db, 'teams');
            const q = query(
                teamsRef,
                where('userId', '==', userProfile.uid),
                where('paymentStatus', '==', PaymentStatus.PENDING)
            );
            const snapshot = await getDocs(q);

            const teamsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Team));

            setTeams(teamsData);
        } catch (err) {
            console.error('Error fetching teams:', err);
            setError('Gagal memuat data tim');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!teams || teams.length === 0) {
            setError('Tidak ada tim untuk dibayar');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const functions = getFunctions();
            const createTransaction = httpsCallable(functions, 'createTransaction');

            const teamIds = teams.map(t => t.id);
            const result = await createTransaction({ teamIds });

            const { snapToken, orderId } = result.data as { snapToken: string; orderId: string };

            // Open Midtrans Snap popup
            openMidtransSnap(snapToken, {
                onSuccess: (result) => {
                    console.log('Payment success:', result);
                    navigate('/payment/success', { state: { orderId } });
                },
                onPending: (result) => {
                    console.log('Payment pending:', result);
                    navigate('/payment/pending', { state: { orderId } });
                },
                onError: (result) => {
                    console.error('Payment error:', result);
                    setError('Pembayaran gagal. Silakan coba lagi.');
                    setProcessing(false);
                },
                onClose: () => {
                    console.log('Payment popup closed');
                    setProcessing(false);
                }
            });

        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || 'Gagal memproses pembayaran');
            setProcessing(false);
        }
    };

    const totalAmount = teams?.reduce((sum, team) => sum + team.price, 0) || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary-600" size={48} />
                </div>
            </div>
        );
    }

    if (!teams || teams.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="glass-card rounded-xl p-8 text-center">
                        <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ada Tim untuk Dibayar</h2>
                        <p className="text-gray-600 mb-6">Semua tim Anda sudah lunas atau tidak ada tim yang terdaftar.</p>
                        <button
                            onClick={() => navigate('/register-team')}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Daftar Tim Baru
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout Pembayaran</h1>
                    <p className="text-gray-600">Review dan bayar biaya pendaftaran tim Anda</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Teams List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tim yang Akan Dibayar ({teams.length})</h2>

                        {teams.map((team) => {
                            const competition = COMPETITIONS.find(c => c.type === team.competitionType);

                            return (
                                <div key={team.id} className="glass-card rounded-lg p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{team.teamName}</h3>
                                            <p className="text-sm text-gray-600">{competition?.name}</p>
                                        </div>
                                        <span className="text-lg font-bold text-primary-600">
                                            Rp {team.price.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p className="mb-1">{team.members.length} Anggota:</p>
                                        <ul className="ml-4 space-y-0.5">
                                            {team.members.map((member, idx) => (
                                                <li key={idx}>• {member.name} ({member.kelas})</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Payment Summary */}
                    <div className="lg:col-span-1">
                        <div className="glass-strong rounded-xl p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Pembayaran</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Jumlah Tim:</span>
                                    <span className="font-semibold">{teams.length} tim</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-primary-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        <span>Bayar Sekarang</span>
                                    </>
                                )}
                            </button>

                            <div className="mt-4 text-xs text-gray-500 text-center">
                                <p>Pembayaran aman melalui Midtrans</p>
                                <p className="mt-1">Mendukung: Transfer Bank, E-wallet, QRIS</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
