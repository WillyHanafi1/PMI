import { ScoreValues, ScoringCriteria } from '@/types/scoring';

/**
 * Calculate total score based on scoring criteria
 * @param scores - Individual criterion scores
 * @param criteria - Scoring criteria configuration
 * @returns Total calculated score
 */
export const calculateTotalScore = (
    scores: ScoreValues,
    criteria: ScoringCriteria
): number => {
    const criteriaIds = criteria.criteria.map(c => c.id);
    const validScores = criteriaIds
        .map(id => scores[id])
        .filter(score => typeof score === 'number' && !isNaN(score));

    if (validScores.length === 0) return 0;

    switch (criteria.calculationMethod) {
        case 'average':
            return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;

        case 'weighted':
            const weightedSum = criteria.criteria.reduce((sum, criterion) => {
                const score = scores[criterion.id] || 0;
                return sum + (score * criterion.weight);
            }, 0);
            const totalWeight = criteria.criteria.reduce((sum, c) => sum + c.weight, 0);
            return weightedSum / totalWeight;

        case 'sum':
            return validScores.reduce((sum, score) => sum + score, 0);

        default:
            return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    }
};

/**
 * Validate score values against criteria
 * @param scores - Score values to validate
 * @param criteria - Scoring criteria
 * @returns Validation result with errors
 */
export const validateScores = (
    scores: ScoreValues,
    criteria: ScoringCriteria
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const { min, max } = criteria.scoreRange;

    criteria.criteria.forEach(criterion => {
        const score = scores[criterion.id];

        if (score === undefined || score === null) {
            errors.push(`${criterion.name} is required`);
            return;
        }

        if (typeof score !== 'number' || isNaN(score)) {
            errors.push(`${criterion.name} must be a valid number`);
            return;
        }

        if (score < min || score > max) {
            errors.push(`${criterion.name} must be between ${min} and ${max}`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Format score for display
 * @param score - Raw score number
 * @param decimals - Number of decimal places
 * @returns Formatted score string
 */
export const formatScore = (score: number, decimals: number = 2): string => {
    return score.toFixed(decimals);
};

/**
 * Get medal based on rank
 * @param rank - Team rank
 * @returns Medal type or null
 */
export const getMedal = (rank: number): 'gold' | 'silver' | 'bronze' | null => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return null;
};

/**
 * Sort scores and assign ranks
 * Handles ties by assigning same rank to same scores
 * @param scores - Array of scores
 * @returns Array with ranks assigned
 */
export const assignRanks = <T extends { totalScore: number; rank?: number }>(
    scores: T[]
): T[] => {
    // Sort by totalScore descending
    const sorted = [...scores].sort((a, b) => b.totalScore - a.totalScore);

    let currentRank = 1;
    let previousScore: number | null = null;
    let rankIncrement = 0;

    return sorted.map((score) => {
        if (previousScore !== null && score.totalScore < previousScore) {
            currentRank += rankIncrement;
            rankIncrement = 1;
        } else if (previousScore !== null && score.totalScore === previousScore) {
            rankIncrement++;
        } else {
            rankIncrement = 1;
        }

        previousScore = score.totalScore;

        return {
            ...score,
            rank: currentRank
        };
    });
};
