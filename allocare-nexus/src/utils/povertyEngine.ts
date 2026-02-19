import type { Household, Task, SystemLog, NetworkEdge } from '../types';

export const MINIMUM_SURVIVAL_THRESHOLD = 100;
export const MINIMUM_CREDIT_FLOOR = 60;
export const EXTREME_POVERTY_THRESHOLD = 0.75;
export const HIGH_POVERTY_THRESHOLD = 0.6;
export const EQUITY_OVERRIDE_THRESHOLD = 0.7;

export function computePovertyIndex(household: Omit<Household, 'povertyIndex' | 'creditDeficitRatio'>): { povertyIndex: number; creditDeficitRatio: number } {
    const creditDeficitRatio = Math.max(0, MINIMUM_SURVIVAL_THRESHOLD - household.credits) / MINIMUM_SURVIVAL_THRESHOLD;
    const povertyIndex =
        0.4 * creditDeficitRatio +
        0.2 * household.incomeInstabilityScore +
        0.2 * household.dependencyRatio +
        0.2 * household.shockExposureRisk;
    return {
        povertyIndex: Math.min(1, Math.max(0, povertyIndex)),
        creditDeficitRatio,
    };
}

export function computeResilienceScore(households: Household[]): number {
    if (households.length === 0) return 100;
    const avgPovertyIndex = households.reduce((sum, h) => sum + h.povertyIndex, 0) / households.length;
    return Math.max(0, Math.round(100 - avgPovertyIndex * 100));
}

export function computeAllocationScore(bid: number, centralityScore: number, povertyIndex: number): number {
    const normalizedBid = Math.min(1, bid / 200);
    return 0.4 * normalizedBid + 0.2 * centralityScore + 0.4 * povertyIndex;
}

export function computeTimeToExitPoverty(household: Household): string {
    if (household.povertyIndex < 0.3) return 'Already stable';
    const creditsNeeded = Math.max(0, MINIMUM_SURVIVAL_THRESHOLD - household.credits);
    const weeksAtCurrentRate = creditsNeeded > 0 ? Math.ceil(creditsNeeded / 10) : 0;
    if (weeksAtCurrentRate === 0) return '< 1 week';
    if (weeksAtCurrentRate <= 4) return `${weeksAtCurrentRate} week${weeksAtCurrentRate > 1 ? 's' : ''}`;
    return `${Math.ceil(weeksAtCurrentRate / 4)} month${Math.ceil(weeksAtCurrentRate / 4) > 1 ? 's' : ''}`;
}

export function getPovertyColor(povertyIndex: number): string {
    if (povertyIndex < 0.3) return '#10b981'; // green
    if (povertyIndex < 0.6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
}

export function getPovertyLabel(povertyIndex: number): string {
    if (povertyIndex < 0.3) return 'Stable';
    if (povertyIndex < 0.6) return 'Vulnerable';
    if (povertyIndex < 0.75) return 'High Risk';
    return 'Extreme Poverty';
}

export const INITIAL_HOUSEHOLDS: Household[] = [
    {
        id: 'h1',
        name: 'Priya Sharma',
        credits: 45,
        laborHours: 12,
        incomeInstabilityScore: 0.8,
        dependencyRatio: 0.7,
        shockExposureRisk: 0.75,
        centralityScore: 0.6,
        connections: ['h2', 'h3'],
        povertyIndex: 0,
        creditDeficitRatio: 0,
        sector: 'Sector-A1',
    },
    {
        id: 'h2',
        name: 'Rajan Kumar',
        credits: 120,
        laborHours: 5,
        incomeInstabilityScore: 0.3,
        dependencyRatio: 0.2,
        shockExposureRisk: 0.25,
        centralityScore: 0.8,
        connections: ['h1', 'h4', 'h5'],
        povertyIndex: 0,
        creditDeficitRatio: 0,
        sector: 'Sector-A2',
    },
    {
        id: 'h3',
        name: 'Meena Devi',
        credits: 30,
        laborHours: 20,
        incomeInstabilityScore: 0.9,
        dependencyRatio: 0.85,
        shockExposureRisk: 0.8,
        centralityScore: 0.4,
        connections: ['h1', 'h5'],
        povertyIndex: 0,
        creditDeficitRatio: 0,
        sector: 'Sector-B1',
    },
    {
        id: 'h4',
        name: 'Arjun Patel',
        credits: 85,
        laborHours: 8,
        incomeInstabilityScore: 0.5,
        dependencyRatio: 0.45,
        shockExposureRisk: 0.4,
        centralityScore: 0.65,
        connections: ['h2', 'h5'],
        povertyIndex: 0,
        creditDeficitRatio: 0,
        sector: 'Sector-B2',
    },
    {
        id: 'h5',
        name: 'Fatima Begum',
        credits: 15,
        laborHours: 25,
        incomeInstabilityScore: 0.95,
        dependencyRatio: 0.9,
        shockExposureRisk: 0.85,
        centralityScore: 0.35,
        connections: ['h2', 'h3', 'h4'],
        povertyIndex: 0,
        creditDeficitRatio: 0,
        sector: 'Sector-A1',
    },
];

export const INITIAL_TASKS: Task[] = [
    {
        id: 't1',
        title: 'Community Water Distribution',
        description: 'Coordinate water supply logistics for 50 households in the eastern zone.',
        baseCreditRequirement: 30,
        stabilityImpact: 0.8,
        difficulty: 'Medium',
        category: 'Infrastructure',
        bids: [],
        status: 'open',
    },
    {
        id: 't2',
        title: 'Mobile Health Camp Support',
        description: 'Assist medical team with patient registration and logistics for 2-day health camp.',
        baseCreditRequirement: 20,
        stabilityImpact: 0.9,
        difficulty: 'Low',
        category: 'Healthcare',
        bids: [],
        status: 'open',
    },
    {
        id: 't3',
        title: 'Digital Literacy Workshop',
        description: 'Teach basic smartphone and internet skills to 20 community members.',
        baseCreditRequirement: 40,
        stabilityImpact: 0.7,
        difficulty: 'High',
        category: 'Education',
        bids: [],
        status: 'open',
    },
];

export function initializeHouseholds(households: Household[]): Household[] {
    return households.map(h => {
        const { povertyIndex, creditDeficitRatio } = computePovertyIndex(h);
        return { ...h, povertyIndex, creditDeficitRatio };
    });
}

export function getNetworkEdges(households: Household[]): NetworkEdge[] {
    const edges: NetworkEdge[] = [];
    const seen = new Set<string>();
    households.forEach(h => {
        h.connections.forEach(targetId => {
            const key = [h.id, targetId].sort().join('-');
            if (!seen.has(key)) {
                seen.add(key);
                edges.push({ source: h.id, target: targetId, strength: 0.5 });
            }
        });
    });
    return edges;
}

export function generateSystemLog(
    type: SystemLog['type'],
    message: string,
    householdId?: string
): SystemLog {
    return {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type,
        message,
        householdId,
    };
}
