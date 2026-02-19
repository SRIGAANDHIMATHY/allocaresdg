export interface Household {
    id: string;
    name: string;
    credits: number;
    laborHours: number;
    incomeInstabilityScore: number;
    dependencyRatio: number;
    shockExposureRisk: number;
    centralityScore: number;
    povertyIndex: number;
    creditDeficitRatio: number;
    connections: string[];
    sector: string; // e.g., 'Sector-A1'
    lastShocked?: boolean;
    exitedPovertyThisCycle?: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    baseCreditRequirement: number;
    stabilityImpact: number;
    difficulty: 'Low' | 'Medium' | 'High';
    category: string;
    bids: Bid[];
    allocated?: string; // household id
    equityOverride?: boolean;
    status: 'open' | 'allocated' | 'completed';
}

export interface Bid {
    householdId: string;
    amount: number;
    allocationScore: number;
    timestamp: number;
}

export interface Transfer {
    fromId: string;
    toId: string;
    amount: number;
    timestamp: number;
    aiSuggested?: boolean;
}

export interface PovertyTrendPoint {
    cycle: number;
    povertyRate: number;
    extremePovertyCount: number;
    resilienceScore: number;
    avgPovertyIndex: number;
}

export interface SystemLog {
    id: string;
    timestamp: number;
    type: 'equity_override' | 'shock' | 'redistribution' | 'labor' | 'bid' | 'transfer' | 'stabilization' | 'info';
    message: string;
    householdId?: string;
}

export interface NetworkEdge {
    source: string;
    target: string;
    strength: number;
}

export interface CECSJob {
    id: string;
    title: string;
    category: 'Environment' | 'Sanitation' | 'Social' | 'Infrastructure';
    description: string;
    credits: number;
    cashPayment: number;
    coupons: string[];
    sector: string;
    status: 'pending' | 'active' | 'verified' | 'completed';
    proofRequired?: 'photo' | 'gps' | 'attendance';
    assignedTo?: string; // Household ID
    submissionProof?: string;
}

export interface CommunityProgram {
    id: string;
    regionId: string;
    status: 'critical' | 'active' | 'stabilized';
    activeJobs: CECSJob[];
}
