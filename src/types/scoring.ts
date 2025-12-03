// Scoring System Types
import { CompetitionType } from './index';

export enum ScoreMethod {
    MANUAL = 'MANUAL',
    OCR_UPLOAD = 'OCR_UPLOAD'
}

export enum ScoreStatus {
    DRAFT = 'DRAFT',
    FINAL = 'FINAL',
    PENDING_APPROVAL = 'PENDING_APPROVAL'
}

export interface ScoringCriterion {
    id: string;
    name: string;
    weight: number;
}

export interface ScoringCriteria {
    id: string;
    name: string;
    criteria: ScoringCriterion[];
    scoreRange: {
        min: number;
        max: number;
    };
    calculationMethod: 'average' | 'weighted' | 'sum';
}

export interface ScoreValues {
    [criteriaId: string]: number;
}

export interface TeamScore {
    id: string;
    teamId: string;
    teamName: string;
    competitionType: CompetitionType;
    schoolName: string;
    scores: ScoreValues;
    totalScore: number;
    rank?: number;
    scoredBy: string;
    scoredByName?: string;
    scoredAt: Date;
    method: ScoreMethod;
    attachments?: string[];
    status: ScoreStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CompetitionBreakdown {
    teams: number;
    totalScore: number;
    avgScore: number;
    bestScore?: number;
    bestTeam?: string;
}

export interface OverallRanking {
    id: string;
    schoolName: string;
    totalPoints: number;
    avgScore: number;
    competitionsParticipated: number;
    teamsCount: number;
    breakdown: {
        [key in CompetitionType]?: CompetitionBreakdown;
    };
    rank: number;
    medals?: {
        gold: number;
        silver: number;
        bronze: number;
    };
    updatedAt: Date;
}

export interface CompetitionRanking {
    competitionType: CompetitionType;
    rankings: TeamScore[];
    totalParticipants: number;
    avgScore: number;
    highestScore: number;
    updatedAt: Date;
}

// Chart data types
export interface ChartDataPoint {
    name: string;
    value: number;
    label?: string;
}

export interface RankingChartData {
    competitions: ChartDataPoint[];
    schools: ChartDataPoint[];
    scoreDistribution: ChartDataPoint[];
}

// n8n Webhook types
export interface N8nScorePayload {
    teamId: string;
    scores: ScoreValues;
    attachmentUrl?: string;
    scoredBy: string;
    notes?: string;
    method: ScoreMethod;
}

export interface N8nWebhookResponse {
    success: boolean;
    scoreId?: string;
    totalScore?: number;
    message: string;
    error?: string;
}
