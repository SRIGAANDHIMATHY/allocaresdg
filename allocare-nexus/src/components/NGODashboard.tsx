import React, { useState } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import {
    Users, ShieldCheck, Heart, BarChart3, Plus,
    Search, AlertCircle, TrendingDown, Activity,
    Layers, Briefcase, Zap, DollarSign, ArrowUpRight,
    MapPin, CheckCircle2, XCircle
} from 'lucide-react';
import NetworkStabilityGraph from './NetworkStabilityGraph';
import PovertyPulseMonitor from './PovertyPulseMonitor';

const NGODashboard: React.FC = () => {
    const {
        households, emergencyFundBalance, fundEmergencyPool,
        systemLogs, cycle, totalPovertyReduction
    } = useAllocareStore();

    const [activeSection, setActiveSection] = useState<'onboarding' | 'funding' | 'monitoring' | 'resources'>('monitoring');
    const [fundAmount, setFundAmount] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const renderOnboarding = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>Community Onboarding</h2>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Register and verify institutional-grade household data.</p>
                    </div>
                    <button className="btn btn-primary btn-sm">
                        <Plus size={16} /> Register New Household
                    </button>
                </div>

                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or region..."
                        className="glass-input"
                        style={{ paddingLeft: '48px', width: '100%', borderRadius: '12px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    {households.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase())).map((h, i) => (
                        <div key={h.id} style={{
                            padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#818cf8'
                            }}>
                                {h.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{h.name}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Verified: 12 Jan 2026 · <MapPin size={10} /> Cluster A-4</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: h.povertyIndex > 0.6 ? '#fb7185' : '#34d399' }}>
                                    Index: {h.povertyIndex.toFixed(3)}
                                </div>
                                <div style={{ fontSize: '10px', color: '#475569' }}>Validated by NGO Team</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                                    <CheckCircle2 size={16} />
                                </button>
                                <button style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                                    <XCircle size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFunding = () => (
        <div className="space-y-6 animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="glass-card p-6 flex flex-col justify-between">
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '8px' }}>Emergency Stabilization Pool</h2>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>This pool automates relief when households cross critical poverty thresholds.</p>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
                            <span style={{ fontSize: '48px', fontWeight: 800, color: '#34d399', fontFamily: "'Space Grotesk', sans-serif" }}>
                                {emergencyFundBalance.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '16px', color: '#64748b', fontWeight: 600 }}>CREDITS AVAILABLE</span>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <DollarSign size={16} /> Refill Funding Pool
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="number"
                                placeholder="Amount to add..."
                                className="glass-input"
                                style={{ flex: 1, borderRadius: '12px' }}
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                            />
                            <button
                                className="btn btn-success"
                                style={{ borderRadius: '12px' }}
                                onClick={() => {
                                    if (fundAmount) {
                                        fundEmergencyPool(parseInt(fundAmount));
                                        setFundAmount('');
                                    }
                                }}
                            >
                                <Plus size={16} /> Fund Pool
                            </button>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>Payout Governance</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Auto-Stabilization Floor', value: '50 Credits', icon: Zap, color: '#c084fc' },
                            { label: 'Maximum Single Payout', value: '250 Credits', icon: ArrowUpRight, color: '#38bdf8' },
                            { label: 'Approval Required >', value: '150 Credits', icon: ShieldCheck, color: '#fbbf24' },
                        ].map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p.icon size={16} style={{ color: p.color }} />
                                </div>
                                <div style={{ flex: 1, fontSize: '13px', color: '#94a3b8' }}>{p.label}</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{p.value}</div>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '24px' }}>
                        Modify Governance Rules
                    </button>
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>Recent Stabilization Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {systemLogs.filter(l => l.type === 'stabilization').slice(0, 5).map((log, i) => (
                        <div key={i} style={{
                            padding: '12px 16px', borderRadius: '10px', background: 'rgba(52,211,153,0.04)',
                            border: '1px solid rgba(52,211,153,0.1)', fontSize: '13px', color: '#34d399',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Zap size={14} />
                                {log.message}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.6 }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </div>
                    ))}
                    {systemLogs.filter(l => l.type === 'stabilization').length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#475569', fontSize: '14px' }}>
                            No emergency payouts triggered recently.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderMonitoring = () => (
        <div className="space-y-6 animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Community Resilience', value: '78%', icon: ShieldCheck, color: '#34d399' },
                    { label: 'Household Risk Clusters', value: '2 High', icon: AlertCircle, color: '#fb7185' },
                    { label: 'Allocation Fairness', value: '94.2%', icon: BarChart3, color: '#c084fc' },
                    { label: 'Active Cycle', value: `#${cycle}`, icon: Activity, color: '#38bdf8' },
                ].map((s, i) => (
                    <div key={i} className="glass-card p-4">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.icon size={18} style={{ color: s.color }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9' }}>{s.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                <div className="glass-card p-6">
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>Risk Cluster Map</h3>
                    <div style={{ height: '350px', position: 'relative' }}>
                        <NetworkStabilityGraph />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>Real-time Poverty Pulse</h3>
                    <PovertyPulseMonitor />
                </div>
            </div>
        </div>
    );

    const renderResources = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>Resource Integration</h2>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Connect local opportunities and donor grants to the system.</p>
                    </div>
                    <button className="btn btn-purple btn-sm">
                        <Plus size={16} /> Add Market Resource
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {[
                        { title: 'Vocational Skill Program', type: 'Skill Task', value: '400 Credits', slots: '15/20', color: '#818cf8', icon: Briefcase },
                        { title: 'Community Infrastructure', type: 'Donation Pool', value: '12,000 CR', slots: '65% Funded', color: '#34d399', icon: Layers },
                        { title: 'Medical Support Grant', type: 'Grant', value: '150 CR/HH', slots: '10 Available', color: '#f43f5e', icon: Heart },
                        { title: 'Urban Farming Initiative', type: 'Market Task', value: '600 Credits', slots: 'Unlimited', color: '#fbbf24', icon: Zap }
                    ].map((card, i) => (
                        <div key={i} style={{
                            padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)',
                            border: `1px solid ${card.color}20`, position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: `${card.color}08`, borderRadius: '50%' }} />

                            <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <card.icon size={20} style={{ color: card.color }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: card.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.type}</div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{card.title}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>{card.value}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{card.slots}</div>
                            </div>

                            <button className="btn btn-ghost btn-xs" style={{ width: '100%', marginTop: '16px', fontSize: '11px' }}>
                                Manage Resource
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* NGO Header */}
            <div className="glass-card overflow-hidden">
                <div style={{
                    height: '140px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                    display: 'flex', alignItems: 'flex-end', padding: '24px'
                }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '24px',
                            background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                        }}>
                            <ShieldCheck size={40} style={{ color: '#818cf8' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>
                                Global Relief Alliance <CheckCircle2 size={18} style={{ color: '#38bdf8', marginLeft: '4px' }} />
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                Verified Governance Node · Community Stabilization Authority
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-navigation */}
                <div style={{
                    display: 'flex', gap: '8px', padding: '20px 24px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'rgba(255,255,255,0.01)'
                }}>
                    {[
                        { id: 'monitoring', label: 'Monitoring & Oversight', icon: BarChart3 },
                        { id: 'onboarding', label: 'Onboarding & Verification', icon: Users },
                        { id: 'funding', label: 'Emergency Fund Pool', icon: Heart },
                        { id: 'resources', label: 'Resource Integration', icon: Layers }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-tab ${activeSection === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(tab.id as any)}
                            style={{ padding: '8px 16px', borderRadius: '10px' }}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Content */}
            <div style={{ flex: 1 }}>
                {activeSection === 'onboarding' && renderOnboarding()}
                {activeSection === 'funding' && renderFunding()}
                {activeSection === 'monitoring' && renderMonitoring()}
                {activeSection === 'resources' && renderResources()}
            </div>
        </div>
    );
};

export default NGODashboard;
