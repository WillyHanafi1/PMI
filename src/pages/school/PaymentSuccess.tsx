import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { CheckCircle, Home, FileText } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orderId, setOrderId] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const { orderId: orderIdFromState } = location.state as { orderId?: string } || {};

        if (orderIdFromState) {
            setOrderId(orderIdFromState);
            verifyPayment(orderIdFromState);
        } else {
            setVerifying(false);
        }
    }, [location]);

    const verifyPayment = async (orderId: string) => {
        try {
            const functions = getFunctions();
            const checkPaymentStatus = httpsCallable(functions, 'checkPaymentStatus');
            await checkPaymentStatus({ orderId });
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-16">
                <div className="glass-card rounded-2xl p-8 text-center animate-scale-in">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Pembayaran Berhasil!</h1>
                    <p className="text-gray-600 mb-6">
                        Terima kasih! Pembayaran Anda telah berhasil diproses.
                    </p>

                    {orderId && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Order ID:</p>
                            <p className="font-mono text-sm font-semibold text-gray-900">{orderId}</p>
                        </div>
                    )}

                    {verifying && (
                        <div className="text-sm text-gray-500 mb-6">
                            Memverifikasi pembayaran...
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
                        <h3 className="font-semibold text-blue-900 mb-2">Langkah Selanjutnya:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>✓ Status tim Anda sudah diupdate menjadi "Lunas"</li>
                            <li>✓ Anda akan menerima email konfirmasi</li>
                            <li>✓ Tim Anda terdaftar dalam kompetisi</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                            <Home size={20} />
                            <span>Kembali ke Dashboard</span>
                        </button>

                        <button
                            onClick={() => navigate('/teams')}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all border border-gray-300 shadow-sm hover:shadow-md"
                        >
                            <FileText size={20} />
                            <span>Lihat Tim Saya</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
