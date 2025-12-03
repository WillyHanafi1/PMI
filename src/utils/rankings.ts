import { db } from '@/config/firebase';
import { collection, query, where, getDocs, orderBy, doc, setDoc, Timestamp } from 'firebase/firestore';
import { TeamScore, OverallRanking, CompetitionRanking } from '@/types/scoring';
import { CompetitionType } from '@/types';
import { assignRanks } from './scoreCalculation';

/**
 * Calculate rankings for a specific competition
 */
export const calculateCompetitionRankings = async (
    competitionType: CompetitionType
): Promise<CompetitionRanking> => {
    try {
        const scoresRef = collection(db, 'scores');
        const q = query(
            scoresRef,
            where('competitionType', '==', competitionType),
            where('status', '==', 'FINAL'),
            orderBy('totalScore', 'desc')
        );

        const snapshot = await getDocs(q);
        const scores: TeamScore[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            scoredAt: doc.data().scoredAt?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
        } as TeamScore));

        // Assign ranks
        const rankedScores = assignRanks(scores);

        // Calculate stats
        const totalParticipants = scores.length;
        const avgScore = scores.length > 0
            ? scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length
            : 0;
        const highestScore = scores.length > 0 ? scores[0].totalScore : 0;

        return {
            competitionType,
            rankings: rankedScores,
            totalParticipants,
            avgScore,
            highestScore,
            updatedAt: new Date()
        };
    } catch (error) {
        console.error('Error calculating competition rankings:', error);
        throw error;
    }
};

/**
 * Calculate overall rankings (juara umum)
 */
export const calculateOverallRankings = async (): Promise<OverallRanking[]> => {
    try {
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, where('status', '==', 'FINAL'));
        const snapshot = await getDocs(q);

        // Group by school
        const schoolScores: { [schoolName: string]: TeamScore[] } = {};

        snapshot.docs.forEach(doc => {
            const score = {
                id: doc.id,
                ...doc.data(),
                scoredAt: doc.data().scoredAt?.toDate(),
                createdAt: doc.data().scoredAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            } as TeamScore;

            if (!schoolScores[score.schoolName]) {
                schoolScores[score.schoolName] = [];
            }
            schoolScores[score.schoolName].push(score);
        });

        // Calculate overall rankings
        const rankings: OverallRanking[] = Object.entries(schoolScores).map(([schoolName, scores]) => {
            const totalPoints = scores.reduce((sum, s) => sum + s.totalScore, 0);
            const avgScore = totalPoints / scores.length;
            const teamsCount = scores.length;

            // Group by competition
            const breakdown: OverallRanking['breakdown'] = {};
            const competitionTypes = new Set(scores.map(s => s.competitionType));

            competitionTypes.forEach(compType => {
                const compScores = scores.filter(s => s.competitionType === compType);
                const compTotal = compScores.reduce((sum, s) => sum + s.totalScore, 0);
                const compAvg = compTotal / compScores.length;
                const best = Math.max(...compScores.map(s => s.totalScore));
                const bestTeam = compScores.find(s => s.totalScore === best)?.teamName;

                breakdown[compType] = {
                    teams: compScores.length,
                    totalScore: compTotal,
                    avgScore: compAvg,
                    bestScore: best,
                    bestTeam
                };
            });

            // Count medals
            const gold = 0, silver = 0, bronze = 0;

            return {
                id: schoolName.replace(/\s+/g, '_').toLowerCase(),
                schoolName,
                totalPoints,
                avgScore,
                competitionsParticipated: competitionTypes.size,
                teamsCount,
                breakdown,
                rank: 0, // Will be assigned later
                medals: { gold, silver, bronze },
                updatedAt: new Date()
            };
        });

        // Assign ranks based on totalPoints
        const rankedSchools = rankings.sort((a, b) => b.totalPoints - a.totalPoints).map((school, index) => ({
            ...school,
            rank: index + 1
        }));

        return rankedSchools;
    } catch (error) {
        console.error('Error calculating overall rankings:', error);
        throw error;
    }
};

/**
 * Save or update overall rankings to Firestore
 */
export const saveOverallRankings = async (rankings: OverallRanking[]): Promise<void> => {
    try {
        const batch = rankings.map(async (ranking) => {
            const rankingRef = doc(db, 'overallRankings', ranking.id);
            await setDoc(rankingRef, {
                ...ranking,
                updatedAt: Timestamp.now()
            });
        });

        await Promise.all(batch);
    } catch (error) {
        console.error('Error saving overall rankings:', error);
        throw error;
    }
};

/**
 * Get overall rankings from Firestore
 */
export const getOverallRankings = async (): Promise<OverallRanking[]> => {
    try {
        const rankingsRef = collection(db, 'overallRankings');
        const q = query(rankingsRef, orderBy('totalPoints', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            updatedAt: doc.data().updatedAt?.toDate()
        } as OverallRanking));
    } catch (error) {
        console.error('Error getting overall rankings:', error);
        throw error;
    }
};

/**
 * Recalculate all rankings (both competition and overall)
 */
export const recalculateAllRankings = async (): Promise<void> => {
    try {
        // Calculate and save overall rankings
        const overallRankings = await calculateOverallRankings();
        await saveOverallRankings(overallRankings);

        console.log('All rankings recalculated successfully');
    } catch (error) {
        console.error('Error recalculating all rankings:', error);
        throw error;
    }
};
