import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import { Heart, Activity, AlertTriangle, TrendingUp, Zap, Shield, Brain, Radio, Wifi } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────
interface PulsePoint { time: number; value: number; label?: string; }
interface VitalSign { id: string; label: string; value: number; unit: string; status: 'critical' | 'warning' | 'normal' | 'optimal'; min: number; max: number; color: string; }

// ── Waveform Canvas ────────────────────────────────────────────
const WaveformCanvas: React.FC<{ data: PulsePoint[]; color: string; height?: number; label: string }> = ({
    data, color, height = 80, label
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const offsetRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.offsetWidth;
        const H = height;
        canvas.width = W;
        canvas.height = H;

        const draw = () => {
            ctx.clearRect(0, 0, W, H);

            // Background grid
            ctx.strokeStyle = 'rgba(56,189,248,0.05)';
            ctx.lineWidth = 0.5;
            for (let x = 0; x < W; x += 40) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            for (let y = 0; y < H; y += 20) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }

            if (data.length < 2) { animRef.current = requestAnimationFrame(draw); return; }

            offsetRef.current = (offsetRef.current + 0.5) % W;

            // Glow gradient
            const gradient = ctx.createLinearGradient(0, 0, W, 0);
            gradient.addColorStop(0, color + '00');
            gradient.addColorStop(0.3, color + 'aa');
            gradient.addColorStop(0.7, color + 'ff');
            gradient.addColorStop(1, color + '00');

            // Fill area
            const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
            fillGrad.addColorStop(0, color + '20');
            fillGrad.addColorStop(1, color + '00');

            ctx.beginPath();
            const step = W / (data.length - 1);
            const vals = data.map(d => d.value);
            const minV = Math.min(...vals);
            const maxV = Math.max(...vals);
            const range = maxV - minV || 1;

            data.forEach((pt, i) => {
                const x = (i * step - offsetRef.current + W) % W;
                const y = H - ((pt.value - minV) / range) * (H - 16) - 8;
                if (i === 0) ctx.moveTo(x, y);
                else {
                    const prevX = ((i - 1) * step - offsetRef.current + W) % W;
                    const prevY = H - ((data[i - 1].value - minV) / range) * (H - 16) - 8;
                    const cpX = (prevX + x) / 2;
                    ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
                }
            });

            // Fill
            ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
            ctx.fillStyle = fillGrad;
            ctx.fill();

            // Line
            ctx.beginPath();
            data.forEach((pt, i) => {
                const x = (i * step - offsetRef.current + W) % W;
                const y = H - ((pt.value - minV) / range) * (H - 16) - 8;
                if (i === 0) ctx.moveTo(x, y);
                else {
                    const prevX = ((i - 1) * step - offsetRef.current + W) % W;
                    const prevY = H - ((data[i - 1].value - minV) / range) * (H - 16) - 8;
                    const cpX = (prevX + x) / 2;
                    ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
                }
            });
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Moving dot at end
            const lastPt = data[data.length - 1];
            const dotX = (W - offsetRef.current + W) % W;
            const dotY = H - ((lastPt.value - minV) / range) * (H - 16) - 8;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            animRef.current = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animRef.current);
    }, [data, color, height]);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '10px', color: '#475569', fontFamily: "'JetBrains Mono', monospace", marginBottom: '6px', letterSpacing: '0.5px' }}>
                {label}
            </div>
            <canvas ref={canvasRef} style={{ width: '100%', height: `${height}px`, display: 'block', borderRadius: '8px' }} />
        </div>
    );
};

// ── Vital Sign Card ────────────────────────────────────────────
const VitalCard: React.FC<{ vital: VitalSign }> = ({ vital }) => {
    const pct = Math.min(100, Math.max(0, ((vital.value - vital.min) / (vital.max - vital.min)) * 100));
    const statusColors = {
        critical: '#f43f5e',
        warning: '#fbbf24',
        normal: '#38bdf8',
        optimal: '#10b981',
    };
    const statusLabels = { critical: '⚠ CRITICAL', warning: '⚡ WARNING', normal: '● NORMAL', optimal: '✓ OPTIMAL' };
    const sc = statusColors[vital.status];

    return (
        <div style={{
            background: 'rgba(10,20,40,0.8)',
            border: `1px solid ${sc}25`,
            borderRadius: '12px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s',
        }}>
            {/* Top glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${sc}, transparent)` }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {vital.label}
                </div>
                <div style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
                    color: sc, background: sc + '15',
                    padding: '2px 7px', borderRadius: '6px',
                    border: `1px solid ${sc}30`,
                }}>
                    {statusLabels[vital.status]}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                <span style={{
                    fontSize: '32px', fontWeight: 900, color: sc,
                    fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1,
                    textShadow: `0 0 20px ${sc}50`,
                }}>
                    {typeof vital.value === 'number' ? vital.value.toFixed(vital.value < 10 ? 2 : 0) : vital.value}
                </span>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>{vital.unit}</span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${pct}%`,
                    background: `linear-gradient(90deg, ${sc}80, ${sc})`,
                    borderRadius: '2px',
                    transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: `0 0 8px ${sc}60`,
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#334155', marginTop: '4px' }}>
                <span>{vital.min}</span>
                <span>{vital.max}</span>
            </div>
        </div>
    );
};

// ── AI Insight Card ────────────────────────────────────────────
const AIInsightCard: React.FC<{ insight: { type: string; message: string; severity: 'info' | 'warning' | 'critical' | 'success'; timestamp: string } }> = ({ insight }) => {
    const colors = { info: '#38bdf8', warning: '#fbbf24', critical: '#f43f5e', success: '#10b981' };
    const icons = { info: Brain, warning: AlertTriangle, critical: Zap, success: Shield };
    const c = colors[insight.type as keyof typeof colors] || colors.info;
    const Icon = icons[insight.type as keyof typeof icons] || Brain;

    return (
        <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            padding: '10px 12px',
            background: `${c}08`,
            border: `1px solid ${c}20`,
            borderLeft: `3px solid ${c}`,
            borderRadius: '0 8px 8px 0',
            animation: 'slide-in-right 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}>
            <Icon size={14} style={{ color: c, flexShrink: 0, marginTop: '1px' }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>{insight.message}</div>
                <div style={{ fontSize: '10px', color: '#334155', marginTop: '3px', fontFamily: "'JetBrains Mono', monospace" }}>{insight.timestamp}</div>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────
const PovertyPulseMonitor: React.FC = () => {
    const { households, runCycle, simulateShock } = useAllocareStore();
    const [pulseData, setPulseData] = useState<PulsePoint[]>([]);
    const [creditData, setCreditData] = useState<PulsePoint[]>([]);
    const [stabilityData, setStabilityData] = useState<PulsePoint[]>([]);
    const [isLive, setIsLive] = useState(true);
    const [bpm, setBpm] = useState(72);
    const [insights, setInsights] = useState<{ type: string; message: string; severity: 'info' | 'warning' | 'critical' | 'success'; timestamp: string }[]>([]);
    const [alertLevel, setAlertLevel] = useState<'green' | 'yellow' | 'red'>('green');
    const [scanActive, setScanActive] = useState(false);
    const tickRef = useRef(0);

    const generateInsight = useCallback((hh: typeof households) => {
        const avgPoverty = hh.reduce((s, h) => s + h.povertyIndex, 0) / hh.length;
        const extremeCount = hh.filter(h => h.povertyIndex > 0.75).length;
        const avgCredits = hh.reduce((s, h) => s + h.credits, 0) / hh.length;
        const now = new Date().toLocaleTimeString();

        const pool = [
            avgPoverty > 0.6 ? { type: 'critical', message: `🚨 Community poverty index critical at ${(avgPoverty * 100).toFixed(1)}% — immediate intervention required`, severity: 'critical' as const, timestamp: now } : null,
            extremeCount > 1 ? { type: 'warning', message: `⚡ ${extremeCount} households in extreme poverty — equity override protocols activating`, severity: 'warning' as const, timestamp: now } : null,
            avgCredits < 80 ? { type: 'warning', message: `💰 Average community credits low (${avgCredits.toFixed(0)}) — labor tokenization recommended`, severity: 'warning' as const, timestamp: now } : null,
            avgPoverty < 0.4 ? { type: 'success', message: `✅ Community resilience strong — poverty index ${(avgPoverty * 100).toFixed(1)}%, maintaining stability`, severity: 'success' as const, timestamp: now } : null,
            { type: 'info', message: `🤖 AI scanning ${hh.length} households — ${hh.filter(h => h.povertyIndex < 0.3).length} stable, ${hh.filter(h => h.povertyIndex > 0.6).length} at risk`, severity: 'info' as const, timestamp: now },
            { type: 'info', message: `📊 Centrality analysis: avg network score ${(hh.reduce((s, h) => s + h.centralityScore, 0) / hh.length).toFixed(2)} — redistribution pathways optimal`, severity: 'info' as const, timestamp: now },
        ].filter(Boolean) as typeof insights;

        if (pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            setInsights(prev => [pick, ...prev].slice(0, 8));
        }
    }, []);

    useEffect(() => {
        if (!isLive) return;
        const interval = setInterval(() => {
            tickRef.current += 1;
            const t = tickRef.current;

            if (households.length === 0) return;

            const avgPoverty = households.reduce((s, h) => s + h.povertyIndex, 0) / households.length;
            const avgCredits = households.reduce((s, h) => s + h.credits, 0) / households.length;
            const stability = Math.max(0, 100 - avgPoverty * 100);

            // Simulate ECG-like heartbeat for poverty pulse
            const phase = (t % 20) / 20;
            let ecgVal = 0;
            if (phase < 0.1) ecgVal = Math.sin(phase * Math.PI * 10) * 0.3;
            else if (phase < 0.15) ecgVal = Math.sin((phase - 0.1) * Math.PI * 20) * 1.0;
            else if (phase < 0.2) ecgVal = -Math.sin((phase - 0.15) * Math.PI * 20) * 0.5;
            else if (phase < 0.25) ecgVal = Math.sin((phase - 0.2) * Math.PI * 20) * 0.7;
            else ecgVal = Math.sin(phase * Math.PI * 2) * 0.05;

            const povertyPulse = 50 + ecgVal * 40 + (avgPoverty - 0.5) * 20 + (Math.random() - 0.5) * 5;

            setPulseData(prev => [...prev, { time: t, value: Math.max(0, Math.min(100, povertyPulse)) }].slice(-80));
            setCreditData(prev => [...prev, { time: t, value: avgCredits + (Math.random() - 0.5) * 3 }].slice(-80));
            setStabilityData(prev => [...prev, { time: t, value: stability + (Math.random() - 0.5) * 2 }].slice(-80));

            // BPM based on poverty level
            const targetBpm = Math.round(60 + avgPoverty * 80);
            setBpm(prev => Math.round(prev * 0.9 + targetBpm * 0.1));

            // Alert level
            if (avgPoverty > 0.65) setAlertLevel('red');
            else if (avgPoverty > 0.4) setAlertLevel('yellow');
            else setAlertLevel('green');

            // Generate insight every 5 ticks
            if (t % 5 === 0) generateInsight(households);

            // Run cycle every 15 ticks
            if (t % 15 === 0) runCycle();
        }, 300);

        return () => clearInterval(interval);
    }, [isLive, households, generateInsight, runCycle]);

    const avgPoverty = households.length > 0
        ? households.reduce((s, h) => s + h.povertyIndex, 0) / households.length
        : 0;
    const avgCredits = households.length > 0
        ? households.reduce((s, h) => s + h.credits, 0) / households.length
        : 0;
    const resilienceScore = Math.max(0, Math.round(100 - avgPoverty * 100));

    const vitals: VitalSign[] = [
        {
            id: 'poverty', label: 'Poverty Index', value: avgPoverty * 100,
            unit: '%', min: 0, max: 100, color: '#f43f5e',
            status: avgPoverty > 0.65 ? 'critical' : avgPoverty > 0.4 ? 'warning' : avgPoverty > 0.2 ? 'normal' : 'optimal',
        },
        {
            id: 'credits', label: 'Avg Credits', value: avgCredits,
            unit: 'cr', min: 0, max: 200, color: '#38bdf8',
            status: avgCredits < 60 ? 'critical' : avgCredits < 80 ? 'warning' : avgCredits < 120 ? 'normal' : 'optimal',
        },
        {
            id: 'resilience', label: 'Resilience Score', value: resilienceScore,
            unit: '/100', min: 0, max: 100, color: '#10b981',
            status: resilienceScore < 35 ? 'critical' : resilienceScore < 55 ? 'warning' : resilienceScore < 75 ? 'normal' : 'optimal',
        },
        {
            id: 'extreme', label: 'Extreme Poverty', value: households.filter(h => h.povertyIndex > 0.75).length,
            unit: 'HH', min: 0, max: households.length, color: '#f97316',
            status: households.filter(h => h.povertyIndex > 0.75).length > 2 ? 'critical' : households.filter(h => h.povertyIndex > 0.75).length > 0 ? 'warning' : 'optimal',
        },
    ];

    const alertColors = { green: '#10b981', yellow: '#fbbf24', red: '#f43f5e' };
    const alertColor = alertColors[alertLevel];

    const handleAIScan = () => {
        setScanActive(true);
        generateInsight(households);
        setTimeout(() => setScanActive(false), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Header Banner ── */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(10,20,40,0.9), rgba(6,12,26,0.95))',
                border: `1px solid ${alertColor}30`,
                borderRadius: '16px',
                padding: '20px 24px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 0 40px ${alertColor}10`,
            }}>
                {/* Scan line */}
                {scanActive && (
                    <div style={{
                        position: 'absolute', left: 0, right: 0, height: '2px',
                        background: `linear-gradient(90deg, transparent, ${alertColor}, transparent)`,
                        animation: 'scan-line 1s linear',
                        zIndex: 2,
                    }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Heartbeat icon */}
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            background: `${alertColor}15`,
                            border: `1px solid ${alertColor}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 0 20px ${alertColor}20`,
                        }}>
                            <Heart size={26} style={{ color: alertColor }} className="animate-heartbeat" />
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <h2 style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: '20px', fontWeight: 800, color: '#f1f5f9',
                                    letterSpacing: '-0.3px',
                                }}>
                                    AI Poverty Pulse Monitor
                                </h2>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    background: isLive ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                                    border: `1px solid ${isLive ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}`,
                                    borderRadius: '20px', padding: '3px 10px',
                                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px',
                                    color: isLive ? '#10b981' : '#64748b',
                                }}>
                                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: isLive ? '#10b981' : '#64748b' }} className={isLive ? 'animate-pulse-glow' : ''} />
                                    {isLive ? 'LIVE MONITORING' : 'PAUSED'}
                                </div>
                            </div>
                            <p style={{ fontSize: '13px', color: '#475569' }}>
                                Real-time community health vitals · AI-driven poverty detection · Predictive intervention signals
                            </p>
                        </div>
                    </div>

                    {/* BPM Display */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Radio size={14} style={{ color: alertColor }} className="animate-pulse-glow" />
                            <span style={{ fontSize: '10px', color: '#475569', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Poverty BPM</span>
                        </div>
                        <div style={{
                            fontSize: '48px', fontWeight: 900,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: alertColor,
                            textShadow: `0 0 30px ${alertColor}60`,
                            lineHeight: 1,
                        }}>
                            {bpm}
                        </div>
                        <div style={{ fontSize: '10px', color: '#334155', marginTop: '2px' }}>
                            {bpm < 80 ? 'STABLE' : bpm < 110 ? 'ELEVATED' : 'CRITICAL'}
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setIsLive(l => !l)}
                        >
                            {isLive ? '⏸ Pause' : '▶ Resume'}
                        </button>
                        <button
                            className="btn btn-sm"
                            style={{ background: `${alertColor}20`, border: `1px solid ${alertColor}40`, color: alertColor }}
                            onClick={handleAIScan}
                            disabled={scanActive}
                        >
                            <Brain size={12} />
                            {scanActive ? 'Scanning...' : 'AI Scan'}
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={simulateShock}
                        >
                            <Zap size={12} />
                            Shock
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Vital Signs Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {vitals.map(v => <VitalCard key={v.id} vital={v} />)}
            </div>

            {/* ── Waveform Monitors ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Main ECG */}
                <div style={{
                    gridColumn: '1 / -1',
                    background: 'rgba(6,12,26,0.95)',
                    border: '1px solid rgba(56,189,248,0.12)',
                    borderRadius: '16px',
                    padding: '20px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={16} style={{ color: '#38bdf8' }} />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1' }}>Community Poverty ECG</span>
                            <span style={{ fontSize: '10px', color: '#334155', fontFamily: "'JetBrains Mono', monospace" }}>
                                REAL-TIME · 300ms INTERVAL
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                            {[
                                { label: 'POVERTY', color: '#f43f5e' },
                                { label: 'CREDITS', color: '#38bdf8' },
                                { label: 'STABILITY', color: '#10b981' },
                            ].map(l => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569' }}>
                                    <div style={{ width: '20px', height: '2px', background: l.color, borderRadius: '1px' }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <WaveformCanvas data={pulseData} color="#f43f5e" height={100} label="POVERTY INDEX WAVEFORM" />
                </div>

                {/* Credit Flow */}
                <div style={{
                    background: 'rgba(6,12,26,0.95)',
                    border: '1px solid rgba(56,189,248,0.1)',
                    borderRadius: '14px',
                    padding: '18px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <TrendingUp size={14} style={{ color: '#38bdf8' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Credit Flow Monitor</span>
                    </div>
                    <WaveformCanvas data={creditData} color="#38bdf8" height={80} label="AVG COMMUNITY CREDITS" />
                </div>

                {/* Stability */}
                <div style={{
                    background: 'rgba(6,12,26,0.95)',
                    border: '1px solid rgba(16,185,129,0.1)',
                    borderRadius: '14px',
                    padding: '18px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Shield size={14} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Stability Index</span>
                    </div>
                    <WaveformCanvas data={stabilityData} color="#10b981" height={80} label="COMMUNITY RESILIENCE SCORE" />
                </div>
            </div>

            {/* ── Household Vitals Table ── */}
            <div style={{
                background: 'rgba(10,20,40,0.8)',
                border: '1px solid rgba(56,189,248,0.1)',
                borderRadius: '16px',
                padding: '20px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Wifi size={16} style={{ color: '#a78bfa' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1' }}>Household Vital Signs</span>
                    <span style={{ fontSize: '10px', color: '#334155', fontFamily: "'JetBrains Mono', monospace" }}>
                        {households.length} NODES MONITORED
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {households.map((h, i) => {
                        const pct = h.povertyIndex * 100;
                        const hColor = h.povertyIndex > 0.75 ? '#f43f5e' : h.povertyIndex > 0.6 ? '#f97316' : h.povertyIndex > 0.3 ? '#fbbf24' : '#10b981';
                        return (
                            <div key={h.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '140px 1fr 80px 80px 80px 100px',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                background: 'rgba(6,12,26,0.6)',
                                borderRadius: '10px',
                                border: `1px solid ${hColor}15`,
                                animation: `slide-in-up 0.4s cubic-bezier(0.16,1,0.3,1)`,
                                animationDelay: `${i * 60}ms`,
                                animationFillMode: 'both',
                            }}>
                                {/* Name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hColor, boxShadow: `0 0 8px ${hColor}` }} className="animate-pulse-glow" />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>{h.name}</span>
                                </div>

                                {/* Poverty bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#334155', marginBottom: '3px' }}>
                                        <span>Poverty Index</span>
                                        <span style={{ color: hColor }}>{pct.toFixed(1)}%</span>
                                    </div>
                                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: `${pct}%`,
                                            background: `linear-gradient(90deg, ${hColor}80, ${hColor})`,
                                            borderRadius: '3px',
                                            boxShadow: `0 0 6px ${hColor}60`,
                                            transition: 'width 0.6s ease',
                                        }} />
                                    </div>
                                </div>

                                {/* Credits */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#334155', marginBottom: '2px' }}>Credits</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>
                                        {Math.round(h.credits)}
                                    </div>
                                </div>

                                {/* Labor */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#334155', marginBottom: '2px' }}>Labor hrs</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#a78bfa', fontFamily: "'JetBrains Mono', monospace" }}>
                                        {h.laborHours.toFixed(0)}
                                    </div>
                                </div>

                                {/* Shock risk */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#334155', marginBottom: '2px' }}>Shock Risk</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>
                                        {(h.shockExposureRisk * 100).toFixed(0)}%
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
                                        color: hColor, background: hColor + '15',
                                        padding: '3px 8px', borderRadius: '6px',
                                        border: `1px solid ${hColor}30`,
                                        textTransform: 'uppercase',
                                    }}>
                                        {h.povertyIndex > 0.75 ? '⚠ Extreme' : h.povertyIndex > 0.6 ? '⚡ High Risk' : h.povertyIndex > 0.3 ? '● Vulnerable' : '✓ Stable'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── AI Insights Feed ── */}
            <div style={{
                background: 'rgba(10,20,40,0.8)',
                border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: '16px',
                padding: '20px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Brain size={16} style={{ color: '#a78bfa' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1' }}>AI Intelligence Feed</span>
                        <span style={{
                            fontSize: '9px', fontWeight: 700,
                            background: 'rgba(139,92,246,0.15)',
                            color: '#a78bfa', padding: '2px 8px', borderRadius: '6px',
                            border: '1px solid rgba(139,92,246,0.3)',
                        }}>
                            LIVE
                        </span>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setInsights([])}>Clear</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                    {insights.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#334155', fontSize: '13px' }}>
                            <Brain size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                            <div>AI scanning... insights will appear here</div>
                        </div>
                    ) : (
                        insights.map((ins, i) => <AIInsightCard key={i} insight={ins} />)
                    )}
                </div>
            </div>
        </div>
    );
};

export default PovertyPulseMonitor;
