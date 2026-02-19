import { create } from 'zustand';
import type {
    Household,
    Task,
    Bid,
    Transfer,
    PovertyTrendPoint,
    SystemLog,
    CECSJob,
} from '../types';
import {
    computePovertyIndex,
    computeAllocationScore,
    EQUITY_OVERRIDE_THRESHOLD,
    MINIMUM_CREDIT_FLOOR,
    HIGH_POVERTY_THRESHOLD,
    EXTREME_POVERTY_THRESHOLD,
    INITIAL_HOUSEHOLDS,
    INITIAL_TASKS,
    initializeHouseholds,
    generateSystemLog,
} from '../utils/povertyEngine';
import {
    syncHouseholds,
    saveBid,
    saveTransfer,
    saveLog,
    saveTrendPoint,
    saveShock,
    saveTokenization,
} from '../api/client';

interface AllocareState {
    households: Household[];
    tasks: Task[];
    transfers: Transfer[];
    trendData: PovertyTrendPoint[];
    systemLogs: SystemLog[];
    cycle: number;
    pilotMode: boolean;
    pilotRunning: boolean;
    emergencyFundActive: boolean;
    householdsExitedThisCycle: number;
    totalPovertyReduction: number;
    aiRedistributionEnabled: boolean;
    currentUserRole: 'household' | 'ngo' | null;

    // Actions
    login: (role: 'household' | 'ngo') => void;
    logout: () => void;
    tokenizeLabor: (householdId: string, hours?: number) => void;
    submitBid: (taskId: string, householdId: string, amount: number) => void;
    transferCredits: (fromId: string, toId: string, amount: number, aiSuggested?: boolean) => void;
    triggerShock: () => void;
    simulateShock: () => void;
    enableAIRedistribution: () => void;
    runPilotSimulation: () => void;
    togglePilotMode: () => void;
    addLog: (log: SystemLog) => void;
    recalculateAll: () => void;
    runCycle: () => void;
    getAISuggestion: () => { fromId: string; toId: string; amount: number } | null;
    fundEmergencyPool: (amount: number) => void;
    emergencyFundBalance: number;

    // CECS Actions
    cecsJobs: CECSJob[];
    activateProgram: (sector: string) => void;
    submitJobProof: (jobId: string, householdId: string, proof: string) => void;
    verifyJob: (jobId: string) => void;
}

function recalcHouseholds(households: Household[]): Household[] {
    return households.map(h => {
        const { povertyIndex, creditDeficitRatio } = computePovertyIndex(h);
        return { ...h, povertyIndex, creditDeficitRatio };
    });
}

function applyEmergencyFloor(households: Household[], logs: SystemLog[]): { households: Household[]; logs: SystemLog[]; activated: boolean } {
    let activated = false;
    const updated = households.map(h => {
        if (h.credits < MINIMUM_CREDIT_FLOOR) {
            const boost = MINIMUM_CREDIT_FLOOR - h.credits;
            activated = true;
            const log = generateSystemLog('stabilization', `Emergency Stabilization Fund activated for ${h.name}: +${boost.toFixed(0)} credits`, h.id);
            logs.push(log);
            // Persist emergency log to DB
            saveLog({ type: 'stabilization', message: log.message, householdId: h.id });
            return { ...h, credits: MINIMUM_CREDIT_FLOOR };
        }
        return h;
    });
    return { households: updated, logs, activated };
}

export const useAllocareStore = create<AllocareState>((set, get) => {
    // Initialize households and sync to DB on startup
    const initialHouseholds = initializeHouseholds(INITIAL_HOUSEHOLDS);

    // Sync initial data to DB (fire-and-forget)
    setTimeout(() => {
        syncHouseholds(initialHouseholds);
        saveLog({ type: 'info', message: 'AlloCare Nexus initialized. Poverty Intelligence Engine active.' });
        saveLog({ type: 'info', message: 'Monitoring 5 households across community network.' });
    }, 1000);

    return {
        households: initialHouseholds,
        tasks: INITIAL_TASKS,
        transfers: [],
        trendData: [],
        systemLogs: [
            generateSystemLog('info', 'AlloCare Nexus initialized. Poverty Intelligence Engine active.'),
            generateSystemLog('info', 'Monitoring 5 households across community network.'),
        ],
        cycle: 1,
        pilotMode: false,
        pilotRunning: false,
        emergencyFundActive: false,
        householdsExitedThisCycle: 0,
        totalPovertyReduction: 0,
        aiRedistributionEnabled: false,
        currentUserRole: null,
        emergencyFundBalance: 50000,
        cecsJobs: [],

        activateProgram: (sector) => {
            const templates: Omit<CECSJob, 'id' | 'sector'>[] = [
                { title: 'Waste Segregation Drive', category: 'Sanitation', description: 'Monthly segregation of community waste.', credits: 25, cashPayment: 15, coupons: ['GROCERY-5'], status: 'pending', proofRequired: 'photo' },
                { title: 'Public Sanitation Cleaning', category: 'Sanitation', description: 'Cleaning of community common areas.', credits: 30, cashPayment: 20, coupons: ['GEN-10'], status: 'pending', proofRequired: 'gps' },
                { title: 'Recycling Sorting Initiative', category: 'Environment', description: 'Sorting recyclable materials for processing.', credits: 20, cashPayment: 10, coupons: ['GREEN-5'], status: 'pending', proofRequired: 'photo' },
                { title: 'Tree Plantation Program', category: 'Environment', description: 'Planting and nurturing local saplings.', credits: 40, cashPayment: 25, coupons: ['ECO-15'], status: 'pending', proofRequired: 'photo' },
                { title: 'Local Survey Assistance', category: 'Social', description: 'Aiding in household data collection.', credits: 15, cashPayment: 30, coupons: ['SOCIAL-5'], status: 'pending', proofRequired: 'attendance' },
            ];

            const newJobs: CECSJob[] = templates.map(t => ({
                ...t,
                id: `cecs-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                sector,
                status: 'active'
            } as CECSJob));

            set(state => ({
                cecsJobs: [...state.cecsJobs, ...newJobs],
                systemLogs: [
                    generateSystemLog('info', `AI flagged ${sector} as critical. NGO activated Community Engagement Program (CECS).`),
                    ...state.systemLogs
                ]
            }));
            saveLog({ type: 'info', message: `CECS Program activated for ${sector} with ${newJobs.length} jobs.` });
        },

        submitJobProof: (jobId, householdId, proof) => {
            set(state => ({
                cecsJobs: state.cecsJobs.map(j =>
                    j.id === jobId ? { ...j, status: 'verified', assignedTo: householdId, submissionProof: proof } : j
                )
            }));
            const household = get().households.find(h => h.id === householdId);
            saveLog({ type: 'info', message: `${household?.name} submitted proof for job ${jobId}.`, householdId });
        },

        verifyJob: (jobId) => {
            const job = get().cecsJobs.find(j => j.id === jobId);
            if (!job || !job.assignedTo) return;

            set(state => {
                const updatedHouseholds = state.households.map(h => {
                    if (h.id === job.assignedTo) {
                        return { ...h, credits: h.credits + job.credits };
                    }
                    return h;
                });

                return {
                    households: recalcHouseholds(updatedHouseholds),
                    cecsJobs: state.cecsJobs.map(j => j.id === jobId ? { ...j, status: 'completed' } : j),
                    systemLogs: [
                        generateSystemLog('stabilization', `Job "${job.title}" verified for ${job.assignedTo}. Payout: ${job.credits} Credits + ₹${job.cashPayment} Cash.`),
                        ...state.systemLogs
                    ]
                };
            });
            saveLog({ type: 'stabilization', message: `CECS Job "${job.title}" completed. Rewards distributed.` });
        },

        login: (role) => {
            set({ currentUserRole: role });
            saveLog({ type: 'info', message: `${role.toUpperCase()} logged into the platform.` });
        },

        logout: () => {
            set({ currentUserRole: null });
        },

        fundEmergencyPool: (amount) => {
            set(state => ({
                emergencyFundBalance: state.emergencyFundBalance + amount,
                systemLogs: [
                    generateSystemLog('stabilization', `NGO added ${amount} credits to the Emergency Pool`),
                    ...state.systemLogs
                ]
            }));
            saveLog({ type: 'stabilization', message: `NGO added ${amount} credits to the Emergency Pool` });
        },

        addLog: (log) => {
            set(state => ({ systemLogs: [log, ...state.systemLogs].slice(0, 100) }));
            // Persist to DB
            saveLog({ type: log.type, message: log.message, householdId: log.householdId });
        },

        recalculateAll: () => {
            set(state => {
                const recalculated = recalcHouseholds(state.households);
                // Sync to DB
                syncHouseholds(recalculated);
                return { households: recalculated };
            });
        },

        tokenizeLabor: (householdId, hours = 1) => {
            set(state => {
                const creditsEarned = hours * 10;
                let newLogs: SystemLog[] = [];
                let households = state.households.map(h => {
                    if (h.id === householdId) {
                        const newCredits = h.credits + creditsEarned;
                        const wasExtreme = h.povertyIndex > EXTREME_POVERTY_THRESHOLD;
                        const updated = { ...h, credits: newCredits, laborHours: Math.max(0, h.laborHours - hours) };
                        const { povertyIndex, creditDeficitRatio } = computePovertyIndex(updated);
                        const isNowStable = povertyIndex < HIGH_POVERTY_THRESHOLD;
                        const log = generateSystemLog('labor', `${h.name} tokenized ${hours}h labor → +${creditsEarned} credits`, h.id);
                        newLogs.push(log);

                        // ★ Persist tokenization to DB
                        saveTokenization({
                            householdId: h.id,
                            hours,
                            creditsEarned,
                            newCredits,
                            newLaborHours: updated.laborHours,
                            newPovertyIndex: povertyIndex,
                            newCreditDeficit: creditDeficitRatio,
                        });

                        if (wasExtreme && povertyIndex <= EXTREME_POVERTY_THRESHOLD) {
                            newLogs.push(generateSystemLog('info', `🎉 ${h.name} moved out of extreme poverty!`, h.id));
                        }
                        return { ...updated, povertyIndex, creditDeficitRatio, exitedPovertyThisCycle: wasExtreme && isNowStable };
                    }
                    return h;
                });

                const { households: floored, logs: floorLogs } = applyEmergencyFloor(households, []);
                households = recalcHouseholds(floored);

                return {
                    households,
                    systemLogs: [...newLogs, ...floorLogs, ...state.systemLogs].slice(0, 100),
                };
            });
        },

        submitBid: (taskId, householdId, amount) => {
            set(state => {
                const household = state.households.find(h => h.id === householdId);
                const task = state.tasks.find(t => t.id === taskId);
                if (!household || !task || task.status !== 'open') return state;
                if (household.credits < amount) return state;

                const allocationScore = computeAllocationScore(amount, household.centralityScore, household.povertyIndex);
                const newBid: Bid = { householdId, amount, allocationScore, timestamp: Date.now() };

                let newLogs: SystemLog[] = [];
                let updatedTask = { ...task, bids: [...task.bids.filter(b => b.householdId !== householdId), newBid] };

                const isEquityOverride = household.povertyIndex > EQUITY_OVERRIDE_THRESHOLD;

                // Equity Override
                if (isEquityOverride) {
                    updatedTask = {
                        ...updatedTask,
                        status: 'allocated' as const,
                        allocated: householdId,
                        equityOverride: true,
                    };
                    newLogs.push(generateSystemLog('equity_override', `⚡ Equity Override Triggered – ${household.name} auto-allocated "${task.title}" (Poverty Index: ${household.povertyIndex.toFixed(2)})`, householdId));
                } else {
                    newLogs.push(generateSystemLog('bid', `${household.name} bid ${amount} credits on "${task.title}" (Score: ${allocationScore.toFixed(2)})`, householdId));
                }

                // ★ Persist bid to DB
                saveBid({
                    taskId,
                    householdId,
                    amount,
                    allocationScore,
                    taskTitle: task.title,
                    baseCreditRequirement: task.baseCreditRequirement,
                    category: task.category,
                    householdName: household.name,
                    equityOverride: isEquityOverride,
                });

                // ★ Persist logs to DB
                newLogs.forEach(log => saveLog({ type: log.type, message: log.message, householdId: log.householdId }));

                const tasks = state.tasks.map(t => t.id === taskId ? updatedTask : t);
                return {
                    tasks,
                    systemLogs: [...newLogs, ...state.systemLogs].slice(0, 100),
                };
            });
        },

        transferCredits: (fromId, toId, amount, aiSuggested = false) => {
            set(state => {
                const from = state.households.find(h => h.id === fromId);
                const to = state.households.find(h => h.id === toId);
                if (!from || !to || from.credits < amount) return state;

                let households = state.households.map(h => {
                    if (h.id === fromId) return { ...h, credits: h.credits - amount };
                    if (h.id === toId) return { ...h, credits: h.credits + amount };
                    return h;
                });

                const { households: floored, logs: floorLogs } = applyEmergencyFloor(households, []);
                households = recalcHouseholds(floored);

                const newTransfer: Transfer = { fromId, toId, amount, timestamp: Date.now(), aiSuggested };
                const newLogs: SystemLog[] = [
                    generateSystemLog('transfer', `${aiSuggested ? '🤖 AI-Suggested: ' : ''}${from.name} → ${to.name}: ${amount} credits transferred${aiSuggested ? ' (Redistribution prevents cascade poverty)' : ''}`, toId),
                    ...floorLogs,
                ];

                // ★ Persist transfer to DB
                saveTransfer({
                    fromId,
                    toId,
                    amount,
                    aiSuggested,
                    fromName: from.name,
                    toName: to.name,
                });

                // ★ Sync updated households to DB
                syncHouseholds(households);

                // ★ Persist logs
                newLogs.forEach(log => saveLog({ type: log.type, message: log.message, householdId: log.householdId }));

                return {
                    households,
                    transfers: [newTransfer, ...state.transfers].slice(0, 50),
                    systemLogs: [...newLogs, ...state.systemLogs].slice(0, 100),
                };
            });
        },

        // triggerShock is an alias for simulateShock for component compatibility
        triggerShock: () => {
            get().simulateShock();
        },

        simulateShock: () => {
            set(state => {
                // Find most vulnerable household
                const vulnerable = [...state.households]
                    .filter(h => h.povertyIndex > 0.3)
                    .sort((a, b) => b.shockExposureRisk - a.shockExposureRisk);

                if (vulnerable.length === 0) return state;
                const target = vulnerable[0];
                const creditLoss = Math.floor(target.credits * 0.3);

                let households: Household[] = state.households.map(h => {
                    if (h.id === target.id) {
                        return { ...h, credits: Math.max(0, h.credits - creditLoss), lastShocked: true as boolean, shockExposureRisk: Math.min(1, h.shockExposureRisk + 0.1) };
                    }
                    return { ...h, lastShocked: false as boolean };
                });

                const { households: floored, logs: floorLogs, activated } = applyEmergencyFloor(households, []);
                households = recalcHouseholds(floored);

                // AI Redistribution - auto apply if enabled
                const aiRedistributionEnabled = state.aiRedistributionEnabled;
                let transfers = state.transfers;
                const newLogs: SystemLog[] = [
                    generateSystemLog('shock', `⚡ Economic Shock: ${target.name} lost ${creditLoss} credits (30% reduction)`, target.id),
                    ...floorLogs,
                ];

                // ★ Persist shock to DB
                const shockedH = households.find(h => h.id === target.id);
                if (shockedH) {
                    saveShock({
                        householdId: target.id,
                        creditLoss,
                        newCredits: shockedH.credits,
                        newShockRisk: shockedH.shockExposureRisk,
                        newPovertyIndex: shockedH.povertyIndex,
                    });
                }

                // If AI redistribution is on, auto-transfer credits to affected household
                if (aiRedistributionEnabled) {
                    const donors = households
                        .filter(h => h.id !== target.id && h.povertyIndex < 0.4 && h.credits > 50)
                        .sort((a, b) => b.credits - a.credits);

                    if (donors.length > 0) {
                        const donor = donors[0];
                        const amount = Math.min(30, Math.floor(donor.credits * 0.2));
                        if (amount > 0) {
                            households = households.map(h => {
                                if (h.id === donor.id) return { ...h, credits: h.credits - amount };
                                if (h.id === target.id) return { ...h, credits: h.credits + amount };
                                return h;
                            });
                            households = recalcHouseholds(households);
                            const newTransfer: Transfer = { fromId: donor.id, toId: target.id, amount, timestamp: Date.now(), aiSuggested: true };
                            transfers = [newTransfer, ...transfers].slice(0, 50);
                            newLogs.push(generateSystemLog('redistribution', `🤖 AI Auto-Redistribution: ${donor.name} → ${target.name}: ${amount} credits to prevent cascade poverty`, target.id));

                            // ★ Persist AI transfer to DB
                            saveTransfer({
                                fromId: donor.id,
                                toId: target.id,
                                amount,
                                aiSuggested: true,
                                fromName: donor.name,
                                toName: target.name,
                            });
                        }
                    }
                } else {
                    // Just suggest
                    const aiSuggestion = get().getAISuggestion();
                    if (aiSuggestion) {
                        const fromH = state.households.find(h => h.id === aiSuggestion.fromId);
                        const toH = state.households.find(h => h.id === aiSuggestion.toId);
                        if (fromH && toH) {
                            newLogs.push(generateSystemLog('redistribution', `🤖 AI Recommends: Transfer ${aiSuggestion.amount} credits from ${fromH.name} to ${toH.name} to prevent cascade poverty`, aiSuggestion.toId));
                        }
                    }
                }

                // ★ Sync all households to DB
                syncHouseholds(households);

                // ★ Persist logs to DB
                newLogs.forEach(log => saveLog({ type: log.type, message: log.message, householdId: log.householdId }));

                return {
                    households,
                    transfers,
                    systemLogs: [...newLogs, ...state.systemLogs].slice(0, 100),
                    emergencyFundActive: activated,
                };
            });
        },

        enableAIRedistribution: () => {
            set(state => {
                const newVal = !state.aiRedistributionEnabled;
                const log = generateSystemLog('info', newVal ? '🤖 AI Redistribution Engine ENABLED – Automatic cascade prevention active' : '🤖 AI Redistribution Engine DISABLED');
                saveLog({ type: 'info', message: log.message });
                return {
                    aiRedistributionEnabled: newVal,
                    systemLogs: [log, ...state.systemLogs].slice(0, 100),
                };
            });
        },

        getAISuggestion: () => {
            const { households } = get();
            const highPoverty = households.filter(h => h.povertyIndex > EQUITY_OVERRIDE_THRESHOLD);
            if (highPoverty.length === 0) return null;

            const target = highPoverty.sort((a, b) => b.povertyIndex - a.povertyIndex)[0];
            const donors = households
                .filter(h => h.id !== target.id && h.povertyIndex < 0.4 && h.credits > 50)
                .sort((a, b) => b.credits - a.credits);

            if (donors.length === 0) return null;
            const donor = donors[0];
            const amount = Math.min(30, Math.floor(donor.credits * 0.2));

            return { fromId: donor.id, toId: target.id, amount };
        },

        runCycle: () => {
            set(state => {
                // Apply AI redistribution during cycles if enabled
                let households = state.households;
                let transfers = state.transfers;
                let newLogs: SystemLog[] = [];

                if (state.aiRedistributionEnabled) {
                    const highPoverty = households.filter(h => h.povertyIndex > EQUITY_OVERRIDE_THRESHOLD);
                    if (highPoverty.length > 0) {
                        const target = highPoverty.sort((a, b) => b.povertyIndex - a.povertyIndex)[0];
                        const donors = households
                            .filter(h => h.id !== target.id && h.povertyIndex < 0.4 && h.credits > 50)
                            .sort((a, b) => b.credits - a.credits);

                        if (donors.length > 0) {
                            const donor = donors[0];
                            const amount = Math.min(25, Math.floor(donor.credits * 0.15));
                            if (amount > 0) {
                                households = households.map(h => {
                                    if (h.id === donor.id) return { ...h, credits: h.credits - amount };
                                    if (h.id === target.id) return { ...h, credits: h.credits + amount };
                                    return h;
                                });
                                const newTransfer: Transfer = { fromId: donor.id, toId: target.id, amount, timestamp: Date.now(), aiSuggested: true };
                                transfers = [newTransfer, ...transfers].slice(0, 50);
                                newLogs.push(generateSystemLog('redistribution', `🤖 Cycle ${state.cycle}: AI redistributed ${amount} credits from ${donor.name} to ${target.name}`, target.id));

                                // ★ Persist AI transfer to DB
                                saveTransfer({
                                    fromId: donor.id,
                                    toId: target.id,
                                    amount,
                                    aiSuggested: true,
                                    fromName: donor.name,
                                    toName: target.name,
                                });
                            }
                        }
                    }
                }

                // Random boost: simulate small income from tasks being completed each cycle
                households = households.map(h => {
                    const incomeBump = Math.random() * 8 + 2; // 2-10 credits
                    const laborDecay = Math.min(h.laborHours, Math.random() * 2);
                    return {
                        ...h,
                        credits: h.credits + incomeBump,
                        laborHours: h.laborHours + laborDecay + Math.random() * 3,
                        incomeInstabilityScore: Math.max(0, h.incomeInstabilityScore + (Math.random() - 0.55) * 0.05),
                    };
                });

                households = recalcHouseholds(households);

                const povertyRate = (households.filter(h => h.povertyIndex > HIGH_POVERTY_THRESHOLD).length / households.length) * 100;
                const extremeCount = households.filter(h => h.povertyIndex > EXTREME_POVERTY_THRESHOLD).length;
                const avgPoverty = households.reduce((s, h) => s + h.povertyIndex, 0) / households.length;
                const resilienceScore = Math.max(0, Math.round(100 - avgPoverty * 100));

                const newPoint: PovertyTrendPoint = {
                    cycle: state.cycle,
                    povertyRate: Math.round(povertyRate),
                    extremePovertyCount: extremeCount,
                    resilienceScore,
                    avgPovertyIndex: Math.round(avgPoverty * 100) / 100,
                };

                const prevRate = state.trendData.length > 0 ? state.trendData[state.trendData.length - 1].povertyRate : povertyRate;
                const reduction = Math.max(0, prevRate - povertyRate);

                const cycleLog = generateSystemLog('info', `🔄 Cycle ${state.cycle} complete: Poverty Rate: ${Math.round(povertyRate)}% | Resilience: ${resilienceScore} | Extreme: ${extremeCount}`);
                newLogs.push(cycleLog);

                // ★ Persist to DB: households, trend point, logs
                syncHouseholds(households);
                saveTrendPoint(newPoint);
                newLogs.forEach(log => saveLog({ type: log.type, message: log.message, householdId: log.householdId }));

                return {
                    households,
                    transfers,
                    trendData: [...state.trendData, newPoint].slice(-20),
                    cycle: state.cycle + 1,
                    householdsExitedThisCycle: households.filter(h => h.exitedPovertyThisCycle).length,
                    totalPovertyReduction: state.totalPovertyReduction + reduction,
                    systemLogs: [...newLogs, ...state.systemLogs].slice(0, 100),
                };
            });
        },

        togglePilotMode: () => {
            set(state => ({ pilotMode: !state.pilotMode }));
        },

        runPilotSimulation: async () => {
            set({ pilotRunning: true });
            const { tokenizeLabor, submitBid, transferCredits, simulateShock, runCycle, addLog } = get();

            addLog(generateSystemLog('info', '🚀 Pilot Simulation Started – 3 cycles of automated intervention'));

            // Cycle 1: Labor tokenization
            await new Promise(r => setTimeout(r, 800));
            tokenizeLabor('h3', 8);
            tokenizeLabor('h5', 10);
            runCycle();
            addLog(generateSystemLog('info', 'Cycle 1: Labor tokenization complete'));

            // Cycle 2: Bidding + equity override
            await new Promise(r => setTimeout(r, 800));
            submitBid('t2', 'h3', 20);
            submitBid('t1', 'h5', 30);
            submitBid('t3', 'h2', 40);
            runCycle();
            addLog(generateSystemLog('info', 'Cycle 2: Task bidding and equity override applied'));

            // Cycle 3: Redistribution + shock + recovery
            await new Promise(r => setTimeout(r, 800));
            transferCredits('h2', 'h1', 25, true);
            simulateShock();
            await new Promise(r => setTimeout(r, 400));
            tokenizeLabor('h1', 5);
            runCycle();
            addLog(generateSystemLog('info', '✅ Cycle 3 complete: 30% reduction in extreme poverty achieved'));
            addLog(generateSystemLog('info', '🎯 Pilot Simulation Complete – Community resilience improved'));

            set({ pilotRunning: false });
        },
    };
});
