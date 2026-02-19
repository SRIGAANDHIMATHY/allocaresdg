import React, { useState } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import {
    Briefcase, CheckCircle, Clock, Zap, Target,
    Trash2, TreePine, Recycle, Search, Camera,
    Navigation, UserCheck, CreditCard, Tag
} from 'lucide-react';
import { getPovertyColor } from '../utils/povertyEngine';

const CommunityEngagementSystem: React.FC = () => {
    const {
        households, cecsJobs, activateProgram,
        submitJobProof, verifyJob
    } = useAllocareStore();

    const [submittingFor, setSubmittingFor] = useState<string | null>(null);

    const sectors = Array.from(new Set(households.map(h => h.sector)));
    const getSectorStats = (sector: string) => {
        const hInSector = households.filter(h => h.sector === sector);
        const avgPoverty = hInSector.reduce((sum, h) => sum + h.povertyIndex, 0) / hInSector.length;
        return { avgPoverty, count: hInSector.length };
    };

    const activeJobs = cecsJobs.filter(j => j.status === 'active');
    const verificationQueue = cecsJobs.filter(j => j.status === 'verified');
    const completedJobs = cecsJobs.filter(j => j.status === 'completed');

    const renderJobIcon = (category: string) => {
        switch (category) {
            case 'Sanitation': return <Trash2 size={18} />;
            case 'Environment': return <TreePine size={18} />;
            case 'Social': return <Search size={18} />;
            default: return <Briefcase size={18} />;
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Header Section */}
            <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(192,132,252,0.1))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px', fontFamily: "'Space Grotesk', sans-serif" }}>
                            Community Engagement & Credit System (CECS)
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                            Step-by-step poverty stabilization through direct community job activation.
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                {/* Step 1: Region Identification */}
                <div className="glass-card p-6">
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Target size={18} style={{ color: '#ef4444' }} />
                        Step 1: Region Identification
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {sectors.map(sector => {
                            const stats = getSectorStats(sector);
                            const isCritical = stats.avgPoverty > 0.5;
                            const hasActive = cecsJobs.some(j => j.sector === sector && j.status === 'active');

                            return (
                                <div key={sector} className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px' }}>{sector}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{(stats.avgPoverty * 100).toFixed(1)}% AI-poverty weight</div>
                                        </div>
                                        <div style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, background: isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', color: isCritical ? '#ef4444' : '#34d399' }}>
                                            {isCritical ? 'CRITICAL' : 'ELEVATED'}
                                        </div>
                                    </div>

                                    {!hasActive ? (
                                        <button
                                            onClick={() => activateProgram(sector)}
                                            style={{ width: '100%', background: '#38bdf8', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                            className="btn-hover-effect"
                                        >
                                            ACTIVATE JOB PROGRAM
                                        </button>
                                    ) : (
                                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#34d399', fontWeight: 700, padding: '10px', background: 'rgba(52,211,153,0.05)', borderRadius: '8px' }}>
                                            PROGRAM ACTIVE
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step 2 & 3: Jobs & Verification */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Active Jobs List */}
                    <div className="glass-card p-6">
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Zap size={18} style={{ color: '#fbbf24' }} />
                            Step 2: Active Job Listings
                        </h3>
                        {activeJobs.length === 0 ? (
                            <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '40px' }}>No active programs. Identify a region to start.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                                {activeJobs.map(job => (
                                    <div key={job.id} className="p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <div style={{ padding: '8px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderRadius: '8px' }}>
                                                {renderJobIcon(job.category)}
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{job.title}</div>
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>{job.description}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#34d399', fontWeight: 800, marginBottom: '16px' }}>
                                            <span>{job.credits} CR</span>
                                            <span style={{ color: '#a78bfa' }}>₹{job.cashPayment} CASH</span>
                                        </div>

                                        <button
                                            onClick={() => setSubmittingFor(job.id)}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            SIMULATE SUBMISSION
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Verification Queue */}
                    <div className="glass-card p-6">
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserCheck size={18} style={{ color: '#38bdf8' }} />
                            Step 3: NGO Review Queue
                        </h3>
                        {verificationQueue.length === 0 ? (
                            <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '40px' }}>Waiting for community submissions...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {verificationQueue.map(job => {
                                    const household = households.find(h => h.id === job.assignedTo);
                                    return (
                                        <div key={job.id} className="p-4" style={{ background: 'rgba(56,189,248,0.02)', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {job.proofRequired === 'photo' && <Camera size={20} style={{ color: '#94a3b8' }} />}
                                                    {job.proofRequired === 'gps' && <Navigation size={20} style={{ color: '#94a3b8' }} />}
                                                    {job.proofRequired === 'attendance' && <CheckCircle size={20} style={{ color: '#94a3b8' }} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{job.title}</div>
                                                    <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>Submitted by {household?.name}</div>
                                                    <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>PROOF ID: {job.submissionProof}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => verifyJob(job.id)}
                                                style={{ background: '#34d399', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                                                className="btn-hover-effect"
                                            >
                                                VERIFY & ALLOCATE
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 4: Credit Allocation & Redemption */}
            <div className="glass-card p-6">
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={18} style={{ color: '#a78bfa' }} />
                    Step 4: Credit Allocation & Structural Redemption
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>TOTAL CREDITS DISTRIBUTED</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>
                            {completedJobs.reduce((sum, j) => sum + j.credits, 0)}
                        </div>
                    </div>
                    <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>CASH PAYOUTS COMMITTED</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399' }}>
                            ₹{completedJobs.reduce((sum, j) => sum + j.cashPayment, 0)}
                        </div>
                    </div>
                    <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>COUPONS REDEEMED</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#a78bfa' }}>
                            {completedJobs.reduce((sum, j) => sum + j.coupons.length, 0)}
                        </div>
                    </div>
                    <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>ACTIVE JOB PARTICIPANTS</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc' }}>
                            {new Set(completedJobs.map(j => j.assignedTo)).size}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    {[
                        { title: 'Direct Cash Conversion', icon: <CreditCard size={20} />, text: 'Redeem credits for direct bank transfers.' },
                        { title: 'Grocery Smart-Vouchers', icon: <Tag size={20} />, text: 'Convert to QR-vouchers for local markets.' },
                        { title: 'Utility Bill Settlement', icon: <Zap size={20} />, text: 'Apply credits to subsidized power/water.' }
                    ].map(card => (
                        <div key={card.title} style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ color: '#38bdf8', marginBottom: '12px' }}>{card.icon}</div>
                            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{card.title}</div>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>{card.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Simulation Modal */}
            {submittingFor && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card p-8" style={{ width: '400px' }}>
                        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Simulate Worker Submission</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Select a household to perform this community task.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }}>
                            {households.map(h => (
                                <button
                                    key={h.id}
                                    onClick={() => {
                                        submitJobProof(submittingFor, h.id, `PROOF-${Date.now().toString().slice(-6)}`);
                                        setSubmittingFor(null);
                                    }}
                                    style={{ textAlign: 'left', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', cursor: 'pointer' }}
                                >
                                    {h.name} (Sector: {h.sector})
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setSubmittingFor(null)}
                            style={{ width: '100%', padding: '12px', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityEngagementSystem;
