import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── HOUSEHOLDS ─────────────────────────────────────────────────

// Get all households
app.get('/api/households', async (_req, res) => {
    try {
        const households = await prisma.household.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(households);
    } catch (error) {
        console.error('Error fetching households:', error);
        res.status(500).json({ error: 'Failed to fetch households' });
    }
});

// Upsert a household (create or update)
app.post('/api/households/sync', async (req, res) => {
    try {
        const household = req.body;
        const result = await prisma.household.upsert({
            where: { id: household.id },
            update: {
                name: household.name,
                credits: household.credits,
                povertyIndex: household.povertyIndex,
                laborHours: household.laborHours,
                centralityScore: household.centralityScore,
                shockExposureRisk: household.shockExposureRisk,
                creditDeficitRatio: household.creditDeficitRatio,
            },
            create: {
                id: household.id,
                name: household.name,
                credits: household.credits ?? 100,
                povertyIndex: household.povertyIndex ?? 0.5,
                laborHours: household.laborHours ?? 0,
                centralityScore: household.centralityScore ?? 0.5,
                shockExposureRisk: household.shockExposureRisk ?? 0.3,
                creditDeficitRatio: household.creditDeficitRatio ?? 0,
            },
        });
        res.json(result);
    } catch (error) {
        console.error('Error syncing household:', error);
        res.status(500).json({ error: 'Failed to sync household' });
    }
});

// Bulk sync households
app.post('/api/households/bulk-sync', async (req, res) => {
    try {
        const { households } = req.body;
        const results = await Promise.all(
            households.map((h: any) =>
                prisma.household.upsert({
                    where: { id: h.id },
                    update: {
                        name: h.name,
                        credits: h.credits,
                        povertyIndex: h.povertyIndex,
                        laborHours: h.laborHours,
                        centralityScore: h.centralityScore,
                        shockExposureRisk: h.shockExposureRisk,
                        creditDeficitRatio: h.creditDeficitRatio,
                    },
                    create: {
                        id: h.id,
                        name: h.name,
                        credits: h.credits ?? 100,
                        povertyIndex: h.povertyIndex ?? 0.5,
                        laborHours: h.laborHours ?? 0,
                        centralityScore: h.centralityScore ?? 0.5,
                        shockExposureRisk: h.shockExposureRisk ?? 0.3,
                        creditDeficitRatio: h.creditDeficitRatio ?? 0,
                    },
                })
            )
        );
        res.json({ synced: results.length });
    } catch (error) {
        console.error('Error bulk syncing households:', error);
        res.status(500).json({ error: 'Failed to bulk sync households' });
    }
});

// ── TASKS ──────────────────────────────────────────────────────

// Get all tasks
app.get('/api/tasks', async (_req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: { bids: true },
        });
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Save a bid
app.post('/api/bids', async (req, res) => {
    try {
        const { taskId, householdId, amount, allocationScore } = req.body;

        // Ensure the task exists in DB
        await prisma.task.upsert({
            where: { id: taskId },
            update: {},
            create: {
                id: taskId,
                title: req.body.taskTitle || 'Unknown Task',
                reward: req.body.baseCreditRequirement || 0,
                category: req.body.category || 'General',
                status: 'open',
            },
        });

        // Ensure the household exists in DB
        await prisma.household.upsert({
            where: { id: householdId },
            update: {},
            create: {
                id: householdId,
                name: req.body.householdName || 'Unknown',
                credits: 100,
            },
        });

        const bid = await prisma.bid.create({
            data: {
                amount,
                allocationScore: allocationScore ?? 0,
                taskId,
                householdId,
            },
        });

        // Update task status if equity override
        if (req.body.equityOverride) {
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'allocated',
                    allocated: householdId,
                },
            });
        }

        res.json(bid);
    } catch (error) {
        console.error('Error creating bid:', error);
        res.status(500).json({ error: 'Failed to create bid' });
    }
});

// ── TRANSFERS ──────────────────────────────────────────────────

app.post('/api/transfers', async (req, res) => {
    try {
        const { fromId, toId, amount, aiSuggested } = req.body;

        // Ensure households exist
        for (const id of [fromId, toId]) {
            await prisma.household.upsert({
                where: { id },
                update: {},
                create: { id, name: req.body[`${id === fromId ? 'from' : 'to'}Name`] || 'Unknown', credits: 100 },
            });
        }

        const transfer = await prisma.transfer.create({
            data: {
                fromId,
                toId,
                amount,
                aiSuggested: aiSuggested ?? false,
            },
        });

        // Update household credits in DB
        await prisma.household.update({
            where: { id: fromId },
            data: { credits: { decrement: amount } },
        });
        await prisma.household.update({
            where: { id: toId },
            data: { credits: { increment: amount } },
        });

        res.json(transfer);
    } catch (error) {
        console.error('Error creating transfer:', error);
        res.status(500).json({ error: 'Failed to create transfer' });
    }
});

// Get transfers
app.get('/api/transfers', async (_req, res) => {
    try {
        const transfers = await prisma.transfer.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: { from: true, to: true },
        });
        res.json(transfers);
    } catch (error) {
        console.error('Error fetching transfers:', error);
        res.status(500).json({ error: 'Failed to fetch transfers' });
    }
});

// ── SYSTEM LOGS ────────────────────────────────────────────────

app.post('/api/logs', async (req, res) => {
    try {
        const { type, message, householdId } = req.body;

        // Handle optional householdId - only include if household exists
        let data: any = { type, message };
        if (householdId) {
            const household = await prisma.household.findUnique({ where: { id: householdId } });
            if (household) {
                data.householdId = householdId;
            }
        }

        const log = await prisma.systemLog.create({ data });
        res.json(log);
    } catch (error) {
        console.error('Error creating log:', error);
        res.status(500).json({ error: 'Failed to create log' });
    }
});

app.get('/api/logs', async (_req, res) => {
    try {
        const logs = await prisma.systemLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100,
            include: { household: true },
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// ── POVERTY TREND POINTS ───────────────────────────────────────

app.post('/api/trends', async (req, res) => {
    try {
        const { cycle, povertyRate, extremePovertyCount, resilienceScore, avgPovertyIndex } = req.body;
        const point = await prisma.povertyTrendPoint.create({
            data: { cycle, povertyRate, extremePovertyCount, resilienceScore, avgPovertyIndex },
        });
        res.json(point);
    } catch (error) {
        console.error('Error creating trend point:', error);
        res.status(500).json({ error: 'Failed to create trend point' });
    }
});

app.get('/api/trends', async (_req, res) => {
    try {
        const trends = await prisma.povertyTrendPoint.findMany({
            orderBy: { cycle: 'asc' },
            take: 20,
        });
        res.json(trends);
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
});

// ── SHOCK EVENT ────────────────────────────────────────────────

app.post('/api/shock', async (req, res) => {
    try {
        const { householdId, creditLoss, newCredits, newShockRisk, newPovertyIndex } = req.body;

        await prisma.household.update({
            where: { id: householdId },
            data: {
                credits: newCredits,
                shockExposureRisk: newShockRisk,
                povertyIndex: newPovertyIndex,
            },
        });

        await prisma.systemLog.create({
            data: {
                type: 'shock',
                message: `Economic Shock: Lost ${creditLoss} credits`,
                householdId,
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error processing shock:', error);
        res.status(500).json({ error: 'Failed to process shock' });
    }
});

// ── LABOR TOKENIZATION ─────────────────────────────────────────

app.post('/api/tokenize', async (req, res) => {
    try {
        const { householdId, hours, creditsEarned, newCredits, newLaborHours, newPovertyIndex, newCreditDeficit } = req.body;

        const updated = await prisma.household.update({
            where: { id: householdId },
            data: {
                credits: newCredits,
                laborHours: newLaborHours,
                povertyIndex: newPovertyIndex,
                creditDeficitRatio: newCreditDeficit,
            },
        });

        await prisma.systemLog.create({
            data: {
                type: 'labor',
                message: `Tokenized ${hours}h labor → +${creditsEarned} credits`,
                householdId,
            },
        });

        res.json(updated);
    } catch (error) {
        console.error('Error tokenizing labor:', error);
        res.status(500).json({ error: 'Failed to tokenize labor' });
    }
});

// ── START SERVER ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 AlloCare API Server running on http://localhost:${PORT}`);
    console.log(`📊 Database connected via Prisma`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
});
