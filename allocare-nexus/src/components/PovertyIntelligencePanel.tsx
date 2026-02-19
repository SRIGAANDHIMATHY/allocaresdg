import React, { useState } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import { getPovertyColor, getPovertyLabel, HIGH_POVERTY_THRESHOLD } from '../utils/povertyEngine';
import { Brain, Coins, Activity, Shield, TrendingUp, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const PovertyIntelligencePanel: React.FC = () => {
    const { households, tokenizeLabor } = useAllocareStore();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [laborFeedback, setLaborFeedback] = useState<Record<string, string>>({});

    const sorted = [...households].sort((a, b) => b.povertyIndex - a.povertyIndex);

    const handleTokenize = (householdId: string) => {
        tokenizeLabor(householdId);
        const h = households.find(h => h.id === householdId);
        setLaborFeedback(prev => ({ ...prev, [householdId]: `🪙 Invisible labor tokenized! +10 credits for ${h?.name || 'household'}` }));
        setTimeout(() => setLaborFeedback(prev => { const n = { ...prev }; delete n[householdId]; return n; }), 3000);
    };

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '14px',
                        background: 'rgba(192,132,252,0.1)',
                        border: '1px solid rgba(192,132,252,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(192,132,252,0.06)',
                    }}>
                        <Brain size={20} style={{ color: '#c084fc' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>Poverty Intelligence Engine</h2>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>Multidimensional deprivation analysis · Labor monetization</p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#c084fc', fontFamily: "'Space Grotesk', sans-serif" }}>{households.length}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Households Monitored</div>
                    </div>
                </div>
            </div>

            {/* Household Cards */}
            <div className="space-y-3">
                {sorted.map((h, idx) => {
                    const color = getPovertyColor(h.povertyIndex);
                    const label = getPovertyLabel(h.povertyIndex);
                    const expanded = expandedId === h.id;
                    const pct = h.povertyIndex * 100;
                    const feedback = laborFeedback[h.id];

                    const metricsData = [
                        { label: 'Credit Deficit Ratio', value: h.creditDeficitRatio, icon: Coins, barColor: '#fb7185' },
                        { label: 'Income Instability', value: h.incomeInstabilityScore, icon: Activity, barColor: '#fbbf24' },
                        { label: 'Dependency Ratio', value: h.dependencyRatio, icon: TrendingUp, barColor: '#fb923c' },
                        { label: 'Shock Exposure', value: h.shockExposureRisk, icon: AlertCircle, barColor: '#f472b6' },
                        { label: 'Centrality Score', value: h.centralityScore, icon: Shield, barColor: '#34d399' },
                    ];

                    return (
                        <div key={h.id} className="animate-slide-up" style={{
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(28px)',
                            border: `1px solid ${color}18`,
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-card)',
                            overflow: 'hidden',
                            animationDelay: `${idx * 60}ms`,
                            animationFillMode: 'both',
                            transition: 'border-color 0.3s',
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}35`; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}18`; }}
                        >
                            {/* Main row */}
                            <div style={{
                                padding: '18px 22px',
                                display: 'flex', alignItems: 'center', gap: '16px',
                                cursor: 'pointer',
                            }} onClick={() => setExpandedId(expanded ? null : h.id)}>
                                {/* Status indicator */}
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: color, boxShadow: `0 0 12px ${color}`,
                                    flexShrink: 0,
                                }} className="animate-pulse-glow" />

                                {/* Name & Label */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>{h.name}</span>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                                            background: `${color}15`,
                                            color: color,
                                            border: `1px solid ${color}30`,
                                            letterSpacing: '0.5px', textTransform: 'uppercase',
                                        }}>{label}</span>
                                        {h.povertyIndex > HIGH_POVERTY_THRESHOLD && (
                                            <AlertCircle size={12} style={{ color: '#fb7185' }} />
                                        )}
                                    </div>
                                    {/* Progress bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', width: `${pct}%`,
                                                background: `linear-gradient(90deg, ${color}80, ${color})`,
                                                borderRadius: '2px',
                                                transition: 'width 0.8s ease',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{pct.toFixed(1)}%</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '24px', fontWeight: 900, color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1, letterSpacing: '-1px' }}>
                                        {h.povertyIndex.toFixed(3)}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Poverty Index</div>
                                </div>

                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#63b3ed', fontFamily: "'Space Grotesk', sans-serif" }}>
                                        {Math.round(h.credits)}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>Credits</div>
                                </div>

                                <div style={{ padding: '4px', flexShrink: 0, color: '#475569' }}>
                                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {/* Expanded details */}
                            {expanded && (
                                <div style={{
                                    padding: '0 22px 22px',
                                    borderTop: '1px solid rgba(99,179,237,0.06)',
                                    paddingTop: '18px',
                                }}>
                                    {/* Metric bars */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                                        {metricsData.map((m) => (
                                            <div key={m.label} style={{
                                                background: 'rgba(6,12,26,0.6)',
                                                borderRadius: '12px', padding: '14px',
                                                border: '1px solid rgba(99,179,237,0.05)',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
                                                        <m.icon size={11} style={{ color: m.barColor }} />
                                                        {m.label}
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: m.barColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                                                        {(m.value * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{
                                                        width: `${m.value * 100}%`,
                                                        background: `linear-gradient(90deg, ${m.barColor}80, ${m.barColor})`,
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tokenize Labor */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '14px 18px', borderRadius: '12px',
                                        background: 'rgba(52,211,153,0.05)',
                                        border: '1px solid rgba(52,211,153,0.15)',
                                    }}>
                                        <Sparkles size={16} style={{ color: '#34d399' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', color: '#6ee7b7', fontWeight: 600, marginBottom: '2px' }}>Tokenize Invisible Labor</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>Converts caregiving, community work, and unpaid labor into credits (+10)</div>
                                        </div>
                                        <button className="btn btn-success btn-sm" onClick={() => handleTokenize(h.id)}>
                                            <Coins size={12} /> Tokenize
                                        </button>
                                    </div>

                                    {feedback && (
                                        <div className="animate-slide-up" style={{
                                            marginTop: '10px', padding: '10px 14px', borderRadius: '10px',
                                            background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)',
                                            color: '#6ee7b7', fontSize: '12px', fontWeight: 500,
                                        }}>
                                            {feedback}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PovertyIntelligencePanel;
