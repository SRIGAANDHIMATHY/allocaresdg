import React from 'react';
import { useAllocareStore } from '../store/allocareStore';
import {
    computeResilienceScore,
    HIGH_POVERTY_THRESHOLD,
    EXTREME_POVERTY_THRESHOLD,
} from '../utils/povertyEngine';
import {
    Activity, Users, Zap, TrendingDown, Shield, AlertTriangle, Target, Globe,
    ArrowRight, Heart, Brain, Sparkles, ChevronRight
} from 'lucide-react';

// ── Animated Counter ───────────────────────────────────────────
const AnimatedNumber: React.FC<{ value: number | string; color: string }> = ({ value, color }) => {
    return (
        <div style={{
            fontSize: '32px', fontWeight: 900,
            fontFamily: "'Space Grotesk', sans-serif",
            color,
            textShadow: `0 0 24px ${color}35`,
            lineHeight: 1,
            letterSpacing: '-1.5px',
        }}>
            {value}
        </div>
    );
};

// ── Stat Card ──────────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string | number;
    sub: string;
    icon: React.ElementType;
    color: string;
    delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, color, delay = 0 }) => {
    return (
        <div
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both', position: 'relative', overflow: 'hidden' }}
        >
            {/* Corner accent gradient */}
            <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '80px', height: '80px',
                background: `radial-gradient(circle at top right, ${color}10, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: `${color}12`,
                    border: `1px solid ${color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 16px ${color}08`,
                }}>
                    <Icon size={18} style={{ color }} />
                </div>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 10px ${color}`,
                }} className="animate-pulse-glow" />
            </div>

            <AnimatedNumber value={value} color={color} />

            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginTop: '8px', marginBottom: '3px' }}>
                {label}
            </div>
            <div style={{ fontSize: '11px', color: '#475569' }}>{sub}</div>

            {/* Bottom accent line */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, transparent, ${color}35, transparent)`,
                opacity: 0,
                transition: 'opacity 0.4s',
            }} className="card-accent-line" />
        </div>
    );
};

// ── Loop Step ──────────────────────────────────────────────────
const LoopStep: React.FC<{ step: string; index: number; isLast: boolean }> = ({ step, index, isLast }) => {
    const colors = ['#63b3ed', '#c084fc', '#34d399', '#fbbf24', '#fb923c'];
    const c = colors[index % colors.length];

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: `${c}0a`,
                border: `1px solid ${c}20`,
                transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'default',
            }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = `${c}15`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${c}45`;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${c}12`;
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = `${c}0a`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${c}20`;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
            >
                <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: `${c}18`,
                    border: `1px solid ${c}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 800, color: c,
                }}>
                    {index + 1}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: c }}>{step}</span>
            </div>
            {!isLast && (
                <ChevronRight size={14} style={{ color: '#334155', flexShrink: 0 }} />
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────
const DashboardOverview: React.FC = () => {
    const { households, cycle, householdsExitedThisCycle, totalPovertyReduction, emergencyFundActive, runCycle } = useAllocareStore();

    const povertyRate = households.length > 0
        ? Math.round((households.filter(h => h.povertyIndex > HIGH_POVERTY_THRESHOLD).length / households.length) * 100)
        : 0;
    const extremeCount = households.filter(h => h.povertyIndex > EXTREME_POVERTY_THRESHOLD).length;
    const resilienceScore = computeResilienceScore(households);
    const avgPovertyIndex = households.length > 0
        ? (households.reduce((s, h) => s + h.povertyIndex, 0) / households.length).toFixed(3)
        : '0.000';

    const stats: StatCardProps[] = [
        {
            label: 'Community Poverty Rate',
            value: `${povertyRate}%`,
            sub: 'Households above 0.6 index',
            icon: TrendingDown,
            color: povertyRate > 60 ? '#fb7185' : povertyRate > 30 ? '#fbbf24' : '#34d399',
        },
        {
            label: 'Extreme Poverty Count',
            value: extremeCount,
            sub: 'Households above 0.75 index',
            icon: AlertTriangle,
            color: extremeCount > 2 ? '#fb7185' : extremeCount > 0 ? '#fbbf24' : '#34d399',
        },
        {
            label: 'Resilience Score',
            value: resilienceScore,
            sub: '100 − (Avg Poverty × 100)',
            icon: Shield,
            color: resilienceScore > 70 ? '#34d399' : resilienceScore > 40 ? '#fbbf24' : '#fb7185',
        },
        {
            label: 'Avg Poverty Index',
            value: avgPovertyIndex,
            sub: 'Community-wide average',
            icon: Activity,
            color: '#63b3ed',
        },
        {
            label: 'Households Monitored',
            value: households.length,
            sub: 'Active in network',
            icon: Users,
            color: '#c084fc',
        },
        {
            label: 'System Cycle',
            value: cycle,
            sub: 'Detect→Prioritize→Allocate',
            icon: Zap,
            color: '#22d3ee',
        },
        {
            label: 'Exited Poverty (Cycle)',
            value: householdsExitedThisCycle,
            sub: 'This intervention cycle',
            icon: Target,
            color: '#34d399',
        },
        {
            label: 'Poverty Reduction',
            value: `${totalPovertyReduction.toFixed(1)}%`,
            sub: 'Cumulative reduction',
            icon: Globe,
            color: '#fbbf24',
        },
    ];

    return (
        <div className="space-y-6">

            {/* ── Hero Banner ── */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(13,21,38,0.95) 0%, rgba(6,12,26,0.98) 100%)',
                border: '1px solid rgba(99,179,237,0.12)',
                borderRadius: '22px',
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 24px 72px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute', top: '-50px', right: '-50px',
                    width: '250px', height: '250px',
                    background: 'radial-gradient(circle, rgba(99,179,237,0.05) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-30px', left: '25%',
                    width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(192,132,252,0.04) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '22px', position: 'relative' }}>
                    {/* Icon */}
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '18px', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(99,179,237,0.12), rgba(192,132,252,0.12))',
                        border: '1px solid rgba(99,179,237,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 36px rgba(99,179,237,0.08)',
                    }}>
                        <Globe size={30} style={{ color: '#63b3ed' }} className="animate-float" />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <span className="sdg-badge">SDG 1 · No Poverty</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: '#475569' }}>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1.5px' }}>SYSTEM ACTIVE</span>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} className="animate-pulse-glow" />
                            </div>
                        </div>

                        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.75', maxWidth: '720px' }}>
                            <span style={{
                                fontWeight: 700, fontSize: '16px',
                                background: 'linear-gradient(135deg, #63b3ed, #c084fc)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>AlloCare Nexus</span>
                            {' '}is an adaptive poverty intelligence system that detects multidimensional deprivation in real time, prioritizes equity-driven allocation, stabilizes community networks, and systematically drives households toward sustainable economic exit.
                        </p>

                        {/* Quick action buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary btn-sm" onClick={runCycle} style={{ borderRadius: '10px' }}>
                                <Zap size={13} /> Run Cycle
                            </button>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '7px 14px',
                                background: 'rgba(52,211,153,0.06)',
                                border: '1px solid rgba(52,211,153,0.18)',
                                borderRadius: '10px',
                                fontSize: '12px', color: '#34d399', fontWeight: 600,
                            }}>
                                <Heart size={13} className="animate-heartbeat" />
                                Pulse: {100 - povertyRate}% Healthy
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '7px 14px',
                                background: 'rgba(192,132,252,0.06)',
                                border: '1px solid rgba(192,132,252,0.18)',
                                borderRadius: '10px',
                                fontSize: '12px', color: '#c084fc', fontWeight: 600,
                            }}>
                                <Brain size={13} />
                                AI Cycle #{cycle}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Emergency Alert ── */}
            {emergencyFundActive && (
                <div className="equity-override-banner" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'rgba(251,191,36,0.12)',
                        border: '1px solid rgba(251,191,36,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <AlertTriangle size={19} style={{ color: '#fbbf24' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fcd34d', marginBottom: '3px' }}>
                            Emergency Stabilization Fund Active
                        </div>
                        <div style={{ fontSize: '12px', color: '#b45309' }}>
                            Credits below minimum floor (60) detected and corrected across affected households
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stats Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} delay={i * 60} />
                ))}
            </div>

            {/* ── Core System Loop ── */}
            <div style={{
                background: 'rgba(13,21,38,0.8)',
                border: '1px solid rgba(99,179,237,0.08)',
                borderRadius: '18px',
                padding: '26px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Sparkles size={16} style={{ color: '#63b3ed' }} />
                    <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Core System Loop
                    </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {['Detect', 'Prioritize', 'Allocate', 'Stabilize', 'Recalculate'].map((step, i) => (
                        <LoopStep key={step} step={step} index={i} isLast={i === 4} />
                    ))}
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'rgba(99,179,237,0.08)',
                        border: '1px solid rgba(99,179,237,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', color: '#63b3ed',
                    }} className="animate-spin-slow">
                        ↺
                    </div>
                </div>

                {/* Progress indicator */}
                <div style={{ marginTop: '18px', display: 'flex', gap: '5px' }}>
                    {['Detect', 'Prioritize', 'Allocate', 'Stabilize', 'Recalculate'].map((step, i) => (
                        <div key={step} style={{
                            flex: 1, height: '3px', borderRadius: '2px',
                            background: `linear-gradient(90deg, ${['#63b3ed', '#c084fc', '#34d399', '#fbbf24', '#fb923c'][i]}, ${['#63b3ed', '#c084fc', '#34d399', '#fbbf24', '#fb923c'][i]}70)`,
                            opacity: 0.55,
                        }} />
                    ))}
                </div>
            </div>

            {/* ── Household Quick View ── */}
            <div style={{
                background: 'rgba(13,21,38,0.8)',
                border: '1px solid rgba(99,179,237,0.08)',
                borderRadius: '18px',
                padding: '26px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <Users size={16} style={{ color: '#c084fc' }} />
                    <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Household Status Overview
                    </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                    {households.map((h, i) => {
                        const pct = h.povertyIndex * 100;
                        const hColor = h.povertyIndex > 0.75 ? '#fb7185' : h.povertyIndex > 0.6 ? '#fb923c' : h.povertyIndex > 0.3 ? '#fbbf24' : '#34d399';
                        return (
                            <div key={h.id} style={{
                                background: 'rgba(6,12,26,0.65)',
                                border: `1px solid ${hColor}18`,
                                borderRadius: '14px',
                                padding: '16px',
                                animation: `slide-in-up 0.4s cubic-bezier(0.16,1,0.3,1)`,
                                animationDelay: `${i * 80}ms`,
                                animationFillMode: 'both',
                                transition: 'all 0.35s',
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${hColor}35`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${hColor}18`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: hColor, boxShadow: `0 0 10px ${hColor}`,
                                    }} className="animate-pulse-glow" />
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{h.name}</span>
                                </div>

                                <div style={{ fontSize: '24px', fontWeight: 900, color: hColor, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '4px', letterSpacing: '-1px' }}>
                                    {pct.toFixed(1)}%
                                </div>
                                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '10px' }}>Poverty Index</div>

                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
                                    <div style={{
                                        height: '100%', width: `${pct}%`,
                                        background: `linear-gradient(90deg, ${hColor}70, ${hColor})`,
                                        borderRadius: '2px',
                                        transition: 'width 0.8s ease',
                                    }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                    <span style={{ color: '#475569' }}>Credits</span>
                                    <span style={{ color: '#63b3ed', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{Math.round(h.credits)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
