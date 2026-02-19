import React, { useState } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import { Shield, Lock, Mail, ChevronRight, Globe, Users, Heart, BarChart3 } from 'lucide-react';

const NGOLogin: React.FC = () => {
    const { login } = useAllocareStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            login('ngo');
            setLoading(false);
        }, 1500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            background: 'var(--bg-void)',
            overflow: 'hidden',
        }}>
            {/* Background elements */}
            <div className="app-bg" style={{ opacity: 0.6 }}>
                <div className="app-bg-grid" />
                <div className="app-bg-orb1" />
                <div className="app-bg-orb3" />
            </div>

            <div className="animate-fade-in" style={{
                width: '100%',
                maxWidth: '1000px',
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(32px)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                zIndex: 1,
            }}>
                {/* Left Side: Info */}
                <div style={{
                    padding: '48px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                    borderRight: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '40px',
                }}>
                    <div>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: 'rgba(99,102,241,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px',
                        }}>
                            <Shield size={24} style={{ color: '#818cf8' }} />
                        </div>
                        <h1 style={{
                            fontSize: '32px', fontWeight: 800, color: '#f8fafc',
                            fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2,
                            marginBottom: '16px'
                        }}>
                            NGO Governance <span className="text-gradient-purple">Nexus</span>
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6 }}>
                            Empowering organizations to validate, monitor, and stabilize community prosperity through AI-driven intelligence.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {[
                            { icon: Users, title: 'Identity Verification', text: 'Onboard and validate socioeconomic data.' },
                            { icon: Heart, title: 'Emergency Funding', text: 'Provider of the community stabilization pool.' },
                            { icon: BarChart3, title: 'System Oversight', text: 'Monitor fairness and cascade vulnerabilities.' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <item.icon size={18} style={{ color: '#a78bfa' }} />
                                </div>
                                <div>
                                    <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                                    <div style={{ color: '#64748b', fontSize: '12px' }}>{item.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                            <Globe size={14} /> Global Impact Program
                        </div>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>Joined by 240+ verified organizations worldwide.</div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Verified NGO Access</h2>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Please enter your credentials to access the governance dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginLeft: '4px' }}>Institutional Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@organization.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="glass-input"
                                    style={{ paddingLeft: '48px', width: '100%', borderRadius: '14px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '4px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginLeft: '4px' }}>Secure Password</label>
                                <a href="#" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none' }}>Forgot?</a>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="glass-input"
                                    style={{ paddingLeft: '48px', width: '100%', borderRadius: '14px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                            <input type="checkbox" id="remember" style={{ accentColor: '#818cf8' }} />
                            <label htmlFor="remember" style={{ fontSize: '13px', color: '#64748b' }}>Trust this device for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                width: '100%', height: '54px', borderRadius: '16px', fontSize: '16px', fontWeight: 700,
                                marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            {loading ? (
                                <div className="animate-spin" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                            ) : (
                                <>Verify Identity <ChevronRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)',
                        textAlign: 'center', fontSize: '13px', color: '#64748b'
                    }}>
                        Not a verified partner? <a href="#" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Apply for onboarding</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NGOLogin;
