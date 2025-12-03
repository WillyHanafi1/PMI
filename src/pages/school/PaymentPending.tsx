import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Clock, Home, RefreshCw } from 'lucide-react';

export const PaymentPending: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId } = location.state as { orderId?: string } || {};

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-16">
                <div className="glass-card rounded-2xl p-8 text-center">
                    {/* Pending Icon */}
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="text-yellow-600" size={48} />
                    </div>

                    {/* Pending Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Pembayaran Pending</h1>
                    <p className="text-gray-600 mb-6">
                        Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran sesuai instruksi.
                    </p>

                    {orderId && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Order ID:</p>
                            <p className="font-mono text-sm font-semibold text-gray-900">{orderId}</p>
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
                        <h3 className="font-semibold text-yellow-900 mb-2">Informasi:</h3>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Selesaikan pembayaran sesuai metode yang dipilih</li>
                            <li>• Status akan otomatis terupdate setelah pembayaran berhasil</li>
                            <li>• Cek email Anda untuk instruksi pembayaran</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all shadow-md"
                        >
                            <Home size={20} />
                            <span>Kembali ke Dashboard</span>
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all border border-gray-300"
                        >
                            <RefreshCw size={20} />
                            <span>Refresh Status</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
