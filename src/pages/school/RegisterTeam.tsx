import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { CompetitionType, COMPETITIONS, TeamMember, PaymentStatus } from '@/types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PlusCircle, MinusCircle, Save, ArrowLeft } from 'lucide-react';

export const RegisterTeam: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const [selectedCompetition, setSelectedCompetition] = useState<CompetitionType>(
        location.state?.competitionType || CompetitionType.TANDU_DARURAT
    );
    const [teamName, setTeamName] = useState('');
    const [members, setMembers] = useState<TeamMember[]>([{ name: '', kelas: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const competition = COMPETITIONS.find(c => c.type === selectedCompetition);

    const addMember = () => {
        if (competition && members.length < competition.maxMembers) {
            setMembers([...members, { name: '', kelas: '' }]);
        }
    };

    const removeMember = (index: number) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, field: keyof TeamMember, value: string) => {
        const updated = [...members];
        updated[index] = { ...updated[index], [field]: value };
        setMembers(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!userProfile || !competition) return;

        // Validation
        if (members.length < competition.minMembers) {
            setError(`Minimal ${competition.minMembers} anggota diperlukan`);
            return;
        }

        const validMembers = members.filter(m => m.name.trim() && m.kelas.trim());
        if (validMembers.length < competition.minMembers) {
            setError('Semua anggota harus memiliki nama dan kelas');
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, 'teams'), {
                userId: userProfile.uid,
                schoolName: userProfile.schoolName,
                competitionType: selectedCompetition,
                teamName: teamName.trim(),
                members: validMembers,
                price: competition.price,
                paymentStatus: PaymentStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            alert('Tim berhasil didaftarkan!');
            navigate('/teams');
        } catch (err) {
            console.error('Error creating team:', err);
            setError('Gagal mendaftarkan tim. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-primary-600 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Kembali
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Daftar Tim Baru</h1>
                    <p className="text-gray-600 mt-2">Lengkapi form di bawah untuk mendaftarkan tim</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Competition Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Pilih Mata Lomba <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCompetition}
                                onChange={(e) => setSelectedCompetition(e.target.value as CompetitionType)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                {COMPETITIONS.map((comp) => (
                                    <option key={comp.type} value={comp.type}>
                                        {comp.name} - Rp {comp.price.toLocaleString('id-ID')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Team Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Tim <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Contoh: Tim Tandu A"
                                required
                            />
                        </div>

                        {/* Members */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Anggota Tim <span className="text-red-500">*</span>
                                </label>
                                <span className="text-sm text-gray-600">
                                    {members.length} / {competition?.maxMembers} anggota
                                </span>
                            </div>

                            <div className="space-y-3">
                                {members.map((member, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center font-semibold text-gray-600">
                                            {index + 1}.
                                        </span>
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Nama lengkap"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={member.kelas}
                                            onChange={(e) => updateMember(index, 'kelas', e.target.value)}
                                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Kelas"
                                            required
                                        />
                                        {members.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMember(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <MinusCircle size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {competition && members.length < competition.maxMembers && (
                                <button
                                    type="button"
                                    onClick={addMember}
                                    className="mt-3 flex items-center text-primary-600 hover:text-primary-700 font-semibold"
                                >
                                    <PlusCircle size={20} className="mr-2" />
                                    Tambah Anggota
                                </button>
                            )}

                            <p className="mt-2 text-sm text-gray-500">
                                Minimal {competition?.minMembers} anggota, maksimal {competition?.maxMembers} anggota
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Price Display */}
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Total Biaya:</span>
                                <span className="text-2xl font-bold text-primary-600">
                                    Rp {competition?.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Simpan Tim</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
