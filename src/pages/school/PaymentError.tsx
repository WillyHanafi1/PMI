import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { XCircle, Home, HelpCircle } from 'lucide-react';

export const PaymentError: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-16">
                <div className="glass-card rounded-2xl p-8 text-center">
                    {/* Error Icon */}
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="text-red-600" size={48} />
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Pembayaran Gagal</h1>
                    <p className="text-gray-600 mb-6">
                        Maaf, terjadi kesalahan saat memproses pembayaran Anda.
                    </p>

                    {/* Info */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
                        <h3 className="font-semibold text-red-900 mb-2">Kemungkinan Penyebab:</h3>
                        <ul className="text-sm text-red-800 space-y-1">
                            <li>• Pembayaran dibatalkan</li>
                            <li>• Saldo tidak mencukupi</li>
                            <li>• Transaksi ditolak oleh bank</li>
                            <li>• Koneksi internet terputus</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all shadow-md"
                        >
                            <span>Coba Lagi</span>
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all border border-gray-300"
                        >
                            <Home size={20} />
                            <span>Kembali ke Dashboard</span>
                        </button>
                    </div>

                    {/* Help Link */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => navigate('/contact')}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center space-x-1 mx-auto"
                        >
                            <HelpCircle size={16} />
                            <span>Butuh Bantuan?</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
