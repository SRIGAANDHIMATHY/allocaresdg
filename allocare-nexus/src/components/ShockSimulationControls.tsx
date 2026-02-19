import React, { useState, useEffect, useRef } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import {
    Zap, Play, RotateCcw, TrendingDown, AlertTriangle,
    Activity, Shield, Brain, Sparkles, Timer, Radio
} from 'lucide-react';

const ShockSimulationControls: React.FC = () => {
    const {
        households, cycle, runCycle, triggerShock,
        totalPovertyReduction, householdsExitedThisCycle,
        enableAIRedistribution, aiRedistributionEnabled,
    } = useAllocareStore();

    const [simulating, setSimulating] = useState(false);
    const [pilotMode, setPilotMode] = useState(false);
    const [pilotStep, setPilotStep] = useState(0);
    const pilotTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleShock = () => {
        triggerShock();
    };

    const handleRunCycle = () => {
        setSimulating(true);
        setTimeout(() => {
            runCycle();
            setSimulating(false);
        }, 800);
    };

    const startPilot = () => {
        setPilotMode(true);
        setPilotStep(0);
        pilotTimer.current = setInterval(() => {
            setPilotStep(prev => {
                if (prev >= 9) {
                    if (pilotTimer.current) clearInterval(pilotTimer.current);
                    return prev;
                }
                runCycle();
                return prev + 1;
            });
        }, 1500);
    };

    const stopPilot = () => {
        if (pilotTimer.current) clearInterval(pilotTimer.current);
        setPilotMode(false);
        setPilotStep(0);
    };

    useEffect(() => {
        return () => { if (pilotTimer.current) clearInterval(pilotTimer.current); };
    }, []);

    const povertyRate = households.length > 0
        ? Math.round((households.filter(h => h.povertyIndex > 0.6).length / households.length) * 100)
        : 0;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(28px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '22px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '14px',
                        background: 'rgba(251,191,36,0.1)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(251,191,36,0.06)',
                    }}>
                        <Zap size={20} style={{ color: '#fbbf24' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>Shock & Simulation Controls</h2>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>Adversarial testing · AI redistribution · Pilot demonstration</p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#22d3ee', fontFamily: "'Space Grotesk', sans-serif" }}>{cycle}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Current Cycle</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {[
                    { label: 'Poverty Rate', value: `${povertyRate}%`, color: povertyRate > 50 ? '#fb7185' : '#34d399', icon: TrendingDown },
                    { label: 'Cumulative Reduction', value: `${totalPovertyReduction.toFixed(1)}%`, color: '#34d399', icon: Activity },
                    { label: 'Exited (This Cycle)', value: householdsExitedThisCycle, color: '#63b3ed', icon: Shield },
                    { label: 'AI Redistribution', value: aiRedistributionEnabled ? 'ON' : 'OFF', color: aiRedistributionEnabled ? '#34d399' : '#fb7185', icon: Brain },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: 'rgba(6,12,26,0.65)',
                        border: '1px solid rgba(99,179,237,0.06)',
                        borderRadius: '14px',
                        padding: '16px',
                        textAlign: 'center',
                    }}>
                        <s.icon size={16} style={{ color: s.color, marginBottom: '8px' }} />
                        <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px' }}>
                            {s.value}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Control Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {/* Shock Control */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(251,113,133,0.12)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '22px',
                    boxShadow: 'var(--shadow-card)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <AlertTriangle size={14} style={{ color: '#fb7185' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fda4af' }}>Economic Shock</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
                        Simulate an economic shock that reduces all household credits by 20-50% and increases poverty indices.
                    </p>
                    <button className="btn btn-danger" style={{ width: '100%', borderRadius: '12px' }} onClick={handleShock}>
                        <AlertTriangle size={13} /> Trigger Shock
                    </button>
                </div>

                {/* Run Cycle */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(99,179,237,0.12)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '22px',
                    boxShadow: 'var(--shadow-card)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Play size={14} style={{ color: '#63b3ed' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd' }}>System Cycle</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
                        Execute one full Detect → Prioritize → Allocate → Stabilize → Recalculate loop.
                    </p>
                    <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }} disabled={simulating} onClick={handleRunCycle}>
                        {simulating ? (
                            <><RotateCcw size={13} className="animate-spin" /> Processing...</>
                        ) : (
                            <><Play size={13} /> Run Cycle #{cycle}</>
                        )}
                    </button>
                </div>

                {/* AI Redistribution */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(192,132,252,0.12)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '22px',
                    boxShadow: 'var(--shadow-card)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Brain size={14} style={{ color: '#c084fc' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#d8b4fe' }}>AI Redistribution</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
                        Enable AI redistribution engine for automatic cascade poverty prevention across cycles.
                    </p>

                    {/* Toggle */}
                    <button
                        onClick={enableAIRedistribution}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: `1px solid ${aiRedistributionEnabled ? 'rgba(52,211,153,0.3)' : 'rgba(192,132,252,0.2)'}`,
                            background: aiRedistributionEnabled ? 'rgba(52,211,153,0.08)' : 'rgba(192,132,252,0.06)',
                            color: aiRedistributionEnabled ? '#34d399' : '#c084fc',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        <div style={{
                            width: '36px', height: '20px', borderRadius: '10px', position: 'relative',
                            background: aiRedistributionEnabled ? 'rgba(52,211,153,0.4)' : 'rgba(99,179,237,0.15)',
                            transition: 'all 0.3s',
                        }}>
                            <div style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: aiRedistributionEnabled ? '#34d399' : '#64748b',
                                position: 'absolute', top: '2px',
                                left: aiRedistributionEnabled ? '18px' : '2px',
                                transition: 'all 0.3s',
                                boxShadow: aiRedistributionEnabled ? '0 0 8px #34d399' : 'none',
                            }} />
                        </div>
                        {aiRedistributionEnabled ? 'Redistribution Active' : 'Enable Redistribution'}
                    </button>
                </div>
            </div>

            {/* Pilot Simulation */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(13,21,38,0.95), rgba(6,12,26,0.98))',
                border: '1px solid rgba(52,211,153,0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '26px',
                boxShadow: 'var(--shadow-card), 0 0 40px rgba(52,211,153,0.04)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background accent */}
                <div style={{
                    position: 'absolute', top: '-40px', right: '-40px',
                    width: '180px', height: '180px',
                    background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', position: 'relative' }}>
                    <Radio size={16} style={{ color: '#34d399' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#6ee7b7', fontFamily: "'Space Grotesk', sans-serif" }}>Pilot Simulation Mode</h3>
                    <span style={{
                        fontSize: '9px', fontWeight: 800, letterSpacing: '1px',
                        background: 'rgba(52,211,153,0.12)', color: '#34d399',
                        padding: '3px 10px', borderRadius: '8px',
                        border: '1px solid rgba(52,211,153,0.25)',
                    }}>DEMO</span>
                </div>

                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '18px', position: 'relative', maxWidth: '650px' }}>
                    Runs 10 automated cycles to demonstrate the system's poverty reduction capabilities. Observe how each cycle detects,
                    prioritizes, allocates resources, and stabilizes the network.
                </p>

                {pilotMode && (
                    <div style={{ marginBottom: '16px', position: 'relative' }}>
                        {/* Progress indicator */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Timer size={12} style={{ color: '#22d3ee' }} />
                                Cycle {pilotStep + 1} of 10
                            </span>
                            <span style={{ color: '#34d399', fontWeight: 600 }}>{((pilotStep + 1) / 10 * 100).toFixed(0)}%</span>
                        </div>
                        <div className="progress-bar" style={{ height: '6px' }}>
                            <div className="progress-fill" style={{
                                width: `${(pilotStep + 1) * 10}%`,
                                background: 'linear-gradient(90deg, #34d399, #22d3ee)',
                                height: '100%',
                            }} />
                        </div>

                        {/* Step indicators */}
                        <div style={{ display: 'flex', gap: '5px', marginTop: '12px' }}>
                            {Array.from({ length: 10 }, (_, i) => (
                                <div key={i} style={{
                                    flex: 1, height: '4px', borderRadius: '2px',
                                    background: i <= pilotStep
                                        ? 'linear-gradient(90deg, #34d399, #22d3ee)'
                                        : 'rgba(255,255,255,0.05)',
                                    transition: 'all 0.6s ease',
                                }} />
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    {!pilotMode ? (
                        <button className="btn btn-success" style={{ borderRadius: '12px' }} onClick={startPilot}>
                            <Sparkles size={13} /> Start Pilot Simulation
                        </button>
                    ) : (
                        <button className="btn btn-danger" style={{ borderRadius: '12px' }} onClick={stopPilot}>
                            <Zap size={13} /> Stop Simulation
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShockSimulationControls;
