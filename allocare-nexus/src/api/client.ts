const API_BASE = 'http://localhost:4000/api';

// Generic fetch wrapper with error handling
async function apiFetch(endpoint: string, options?: RequestInit) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        if (!res.ok) {
            console.warn(`API ${endpoint} returned ${res.status}`);
            return null;
        }
        return await res.json();
    } catch (err) {
        // Server might not be running — fail silently so app still works in-memory
        console.warn(`API call to ${endpoint} failed:`, err);
        return null;
    }
}

// ── Households ─────────────────────────────────────────────────
export async function syncHouseholds(households: any[]) {
    return apiFetch('/households/bulk-sync', {
        method: 'POST',
        body: JSON.stringify({
            households: households.map(h => ({
                id: h.id,
                name: h.name,
                credits: h.credits,
                povertyIndex: h.povertyIndex,
                laborHours: h.laborHours,
                centralityScore: h.centralityScore,
                shockExposureRisk: h.shockExposureRisk,
                creditDeficitRatio: h.creditDeficitRatio,
            })),
        }),
    });
}

// ── Bids ───────────────────────────────────────────────────────
export async function saveBid(data: {
    taskId: string;
    householdId: string;
    amount: number;
    allocationScore: number;
    taskTitle?: string;
    baseCreditRequirement?: number;
    category?: string;
    householdName?: string;
    equityOverride?: boolean;
}) {
    return apiFetch('/bids', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ── Transfers ──────────────────────────────────────────────────
export async function saveTransfer(data: {
    fromId: string;
    toId: string;
    amount: number;
    aiSuggested?: boolean;
    fromName?: string;
    toName?: string;
}) {
    return apiFetch('/transfers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ── System Logs ────────────────────────────────────────────────
export async function saveLog(data: {
    type: string;
    message: string;
    householdId?: string;
}) {
    return apiFetch('/logs', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ── Trend Points ───────────────────────────────────────────────
export async function saveTrendPoint(data: {
    cycle: number;
    povertyRate: number;
    extremePovertyCount: number;
    resilienceScore: number;
    avgPovertyIndex: number;
}) {
    return apiFetch('/trends', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ── Shock Events ───────────────────────────────────────────────
export async function saveShock(data: {
    householdId: string;
    creditLoss: number;
    newCredits: number;
    newShockRisk: number;
    newPovertyIndex: number;
}) {
    return apiFetch('/shock', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ── Labor Tokenization ────────────────────────────────────────
export async function saveTokenization(data: {
    householdId: string;
    hours: number;
    creditsEarned: number;
    newCredits: number;
    newLaborHours: number;
    newPovertyIndex: number;
    newCreditDeficit: number;
}) {
    return apiFetch('/tokenize', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
