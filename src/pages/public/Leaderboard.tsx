import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CompetitionType, COMPETITIONS } from '@/types';
import { TeamScore, OverallRanking } from '@/types/scoring';
import { calculateCompetitionRankings, getOverallRankings } from '@/utils/rankings';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed'];

export const Leaderboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CompetitionType | 'overall'>(CompetitionType.TANDU_DARURAT);
    const [competitionRankings, setCompetitionRankings] = useState<{ [key: string]: TeamScore[] }>({});
    const [overallRankings, setOverallRankings] = useState<OverallRanking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRankings();
    }, []);

    const loadRankings = async () => {
        setLoading(true);
        try {
            // Load competition rankings
            const rankingsPromises = Object.values(CompetitionType).map(async (type) => {
                const ranking = await calculateCompetitionRankings(type);
                return { type, rankings: ranking.rankings };
            });

            const results = await Promise.all(rankingsPromises);
            const rankingsMap: { [key: string]: TeamScore[] } = {};
            results.forEach(({ type, rankings }) => {
                rankingsMap[type] = rankings;
            });
            setCompetitionRankings(rankingsMap);

            // Load overall rankings
            const overall = await getOverallRankings();
            setOverallRankings(overall);
        } catch (error) {
            console.error('Error loading rankings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMedalIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
        if (rank === 2) return <Medal className="text-gray-400" size={24} />;
        if (rank === 3) return <Award className="text-amber-600" size={24} />;
        return null;
    };

    const renderCompetitionRanking = (type: CompetitionType) => {
        const rankings = competitionRankings[type] || [];

        if (rankings.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-500">Belum ada data penilaian untuk lomba ini</p>
                </div>
            );
        }

        // Prepare chart data (top 10)
        const chartData = rankings.slice(0, 10).map(team => ({
            name: team.teamName.length > 15 ? team.teamName.substring(0, 15) + '...' : team.teamName,
            score: parseFloat(team.totalScore.toFixed(2)),
            fullName: team.teamName
        }));

        return (
            <div className="space-y-8">
                {/* Top 3 Podium */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {rankings.slice(0, 3).map((team, idx) => (
                        <div
                            key={team.id}
                            className={`glass-card rounded-xl p-6 text-center ${idx === 0 ? 'transform scale-105 border-2 border-yellow-400' : ''
                                }`}
                        >
                            <div className="flex justify-center mb-3">
                                {getMedalIcon(team.rank!)}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{team.teamName}</h3>
                            <p className="text-sm text-gray-600 mb-2">{team.schoolName}</p>
                            <div className="text-3xl font-bold text-primary-600">{team.totalScore.toFixed(2)}</div>
                            <p className="text-xs text-gray-500 mt-1">Peringkat {team.rank}</p>
                        </div>
                    ))}
                </div>

                {/* Bar Chart */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Tim</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Bar dataKey="score" fill="#dc2626" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Full Table */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Peringkat</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Tim</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Sekolah</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold">Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rankings.map((team) => (
                                    <tr
                                        key={team.id}
                                        className={`hover:bg-gray-50 transition-colors ${team.rank && team.rank <= 3 ? 'bg-yellow-50' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {getMedalIcon(team.rank!)}
                                                <span className="font-bold text-gray-900">{team.rank}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{team.teamName}</td>
                                        <td className="px-6 py-4 text-gray-600">{team.schoolName}</td>
                                        <td className="px-6 py-4 text-right font-bold text-primary-600">
                                            {team.totalScore.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderOverallRanking = () => {
        if (overallRankings.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-500">Belum ada data penilaian</p>
                </div>
            );
        }

        // Pie chart data
        const pieData = overallRankings.slice(0, 6).map((school) => ({
            name: school.schoolName.length > 20 ? school.schoolName.substring(0, 20) + '...' : school.schoolName,
            value: parseFloat(school.totalPoints.toFixed(2))
        }));

        return (
            <div className="space-y-8">
                {/* Top 3 Schools */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {overallRankings.slice(0, 3).map((school, idx) => (
                        <div
                            key={school.id}
                            className={`glass-card rounded-xl p-6 ${idx === 0 ? 'border-2 border-yellow-400 transform scale-105' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getMedalIcon(school.rank)}
                                    <span className="text-2xl font-bold text-gray-900">#{school.rank}</span>
                                </div>
                                <TrendingUp className="text-primary-600" size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{school.schoolName}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Poin:</span>
                                    <span className="font-bold text-primary-600">{school.totalPoints.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rata-rata:</span>
                                    <span className="font-semibold">{school.avgScore.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tim:</span>
                                    <span className="font-semibold">{school.teamsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lomba:</span>
                                    <span className="font-semibold">{school.competitionsParticipated}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pie Chart */}
                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Distribusi Poin (Top 6)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Full Table */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Peringkat</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Sekolah</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">Tim</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">Lomba</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold">Total Poin</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold">Rata-rata</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {overallRankings.map((school) => (
                                    <tr
                                        key={school.id}
                                        className={`hover:bg-gray-50 transition-colors ${school.rank <= 3 ? 'bg-yellow-50' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {getMedalIcon(school.rank)}
                                                <span className="font-bold text-gray-900">{school.rank}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{school.schoolName}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{school.teamsCount}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{school.competitionsParticipated}</td>
                                        <td className="px-6 py-4 text-right font-bold text-primary-600">
                                            {school.totalPoints.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                            {school.avgScore.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
                    <p className="text-gray-600">Peringkat tim dan juara umum lomba PMI</p>
                </div>

                {/* Tabs */}
                <div className="mb-8 flex flex-wrap gap-2 justify-center">
                    <button
                        onClick={() => setActiveTab('overall')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'overall'
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Juara Umum
                    </button>
                    {COMPETITIONS.map(comp => (
                        <button
                            key={comp.type}
                            onClick={() => setActiveTab(comp.type)}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === comp.type
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {comp.name}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'overall' ? renderOverallRanking() : renderCompetitionRanking(activeTab as CompetitionType)}
                    </div>
                )}
            </div>
        </div>
    );
};
