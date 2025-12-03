import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Team, COMPETITIONS } from '@/types';
import { TeamScore, ScoreValues, ScoreMethod, ScoreStatus, ScoringCriteria } from '@/types/scoring';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { calculateTotalScore, validateScores } from '@/utils/scoreCalculation';
import { calculateOverallRankings, saveOverallRankings } from '@/utils/rankings';
import { Search, Save, AlertCircle, CheckCircle } from 'lucide-react';

const DEFAULT_CRITERIA: ScoringCriteria = {
    id: 'default',
    name: 'Standard PMR Scoring',
    criteria: [
        { id: 'speed', name: 'Kecepatan', weight: 1 },
        { id: 'technique', name: 'Teknik', weight: 1 },
        { id: 'accuracy', name: 'Akurasi', weight: 1 },
        { id: 'teamwork', name: 'Kerjasama Tim', weight: 1 },
        { id: 'tidiness', name: 'Kerapihan', weight: 1 }
    ],
    scoreRange: { min: 0, max: 10 },
    calculationMethod: 'average' as const
};

export const ScoreInput: React.FC = () => {
    const { userProfile } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [scores, setScores] = useState<ScoreValues>({});
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search teams
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setError('Masukkan nama tim atau sekolah untuk mencari');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const teamsRef = collection(db, 'teams');
            const q = query(
                teamsRef,
                where('paymentStatus', '==', 'PAID')
            );
            const snapshot = await getDocs(q);

            const allTeams = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Team));

            // Filter by search term (team name or school name)
            const filtered = allTeams.filter(team =>
                team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setTeams(filtered);

            if (filtered.length === 0) {
                setError('Tidak ada tim yang ditemukan');
            }
        } catch (err) {
            console.error('Error searching teams:', err);
            setError('Gagal mencari tim');
        } finally {
            setLoading(false);
        }
    };

    // Select team
    const handleSelectTeam = (team: Team) => {
        setSelectedTeam(team);
        setScores({});
        setNotes('');
        setSuccess(false);
        setError(null);
    };

    // Update score
    const handleScoreChange = (criteriaId: string, value: string) => {
        const numValue = parseFloat(value);
        setScores(prev => ({
            ...prev,
            [criteriaId]: isNaN(numValue) ? 0 : numValue
        }));
    };

    // Calculate total
    const totalScore = selectedTeam
        ? calculateTotalScore(scores, DEFAULT_CRITERIA)
        : 0;

    // Submit score
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTeam || !userProfile) return;

        // Validate
        const validation = validateScores(scores, DEFAULT_CRITERIA);
        if (!validation.valid) {
            setError(validation.errors.join(', '));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const scoreData: Omit<TeamScore, 'id'> = {
                teamId: selectedTeam.id!,
                teamName: selectedTeam.teamName,
                competitionType: selectedTeam.competitionType,
                schoolName: selectedTeam.schoolName,
                scores,
                totalScore,
                scoredBy: userProfile.uid,
                scoredByName: userProfile.picName || userProfile.email,
                scoredAt: new Date(),
                method: ScoreMethod.MANUAL,
                status: ScoreStatus.FINAL,
                notes,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await addDoc(collection(db, 'scores'), {
                ...scoreData,
                scoredAt: Timestamp.now(),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Recalculate rankings
            const rankings = await calculateOverallRankings();
            await saveOverallRankings(rankings);

            setSuccess(true);
            setSelectedTeam(null);
            setScores({});
            setNotes('');

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving score:', err);
            setError('Gagal menyimpan nilai');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Input Nilai</h1>
                    <p className="text-gray-600">Input nilai untuk tim peserta lomba</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-scale-in">
                        <CheckCircle className="text-green-600 mr-3" size={24} />
                        <p className="text-green-800 font-semibold">Nilai berhasil disimpan!</p>
                    </div>
                )}

                {/* Search Section */}
                <div className="glass-card rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Cari Tim</h2>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Nama tim atau sekolah..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Search size={20} />
                            <span>Cari</span>
                        </button>
                    </div>

                    {/* Search Results */}
                    {teams.length > 0 && (
                        <div className="mt-6 space-y-2">
                            <p className="text-sm text-gray-600 font-semibold">{teams.length} tim ditemukan:</p>
                            {teams.map(team => {
                                const competition = COMPETITIONS.find(c => c.type === team.competitionType);
                                return (
                                    <button
                                        key={team.id}
                                        onClick={() => handleSelectTeam(team)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedTeam?.id === team.id
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900">{team.teamName}</p>
                                                <p className="text-sm text-gray-600">{team.schoolName}</p>
                                            </div>
                                            <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                                                {competition?.name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Score Input Form */}
                {selectedTeam && (
                    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6">
                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Input Nilai: {selectedTeam.teamName}</h2>
                            <p className="text-sm text-gray-600">{selectedTeam.schoolName} - {COMPETITIONS.find(c => c.type === selectedTeam.competitionType)?.name}</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                                <AlertCircle className="text-red-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Score Inputs */}
                        <div className="grid gap-4 mb-6">
                            {DEFAULT_CRITERIA.criteria.map(criterion => (
                                <div key={criterion.id}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {criterion.name}
                                        <span className="text-gray-500 font-normal ml-2">(0-10)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={scores[criterion.id] || ''}
                                        onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan (Opsional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Tambahkan catatan jika ada..."
                            />
                        </div>

                        {/* Total Score */}
                        <div className="mb-6 p-6 bg-primary-50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">Total Nilai (Rata-rata):</span>
                                <span className="text-3xl font-bold text-primary-600">{totalScore.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Simpan Nilai</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
