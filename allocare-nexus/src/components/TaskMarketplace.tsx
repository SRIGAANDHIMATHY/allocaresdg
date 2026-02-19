import React, { useState } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import { computeAllocationScore, EQUITY_OVERRIDE_THRESHOLD } from '../utils/povertyEngine';
import { ShoppingBag, Zap, Star, AlertCircle, CheckCircle, Clock, Sparkles } from 'lucide-react';

const difficultyColor: Record<string, string> = {
    Low: '#34d399',
    Medium: '#fbbf24',
    High: '#fb7185',
};

const categoryColor: Record<string, string> = {
    Infrastructure: '#63b3ed',
    Healthcare: '#34d399',
    Education: '#c084fc',
};

const TaskMarketplace: React.FC = () => {
    const { tasks, households, submitBid } = useAllocareStore();
    const [selectedHousehold, setSelectedHousehold] = useState<Record<string, string>>({});
    const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});
    const [bidFeedback, setBidFeedback] = useState<Record<string, string>>({});

    const handleBid = (taskId: string) => {
        const householdId = selectedHousehold[taskId];
        const amount = bidAmounts[taskId] || 0;
        if (!householdId || amount <= 0) {
            setBidFeedback(prev => ({ ...prev, [taskId]: 'Select a household and enter a bid amount.' }));
            return;
        }
        const household = households.find(h => h.id === householdId);
        if (!household) return;
        if (household.credits < amount) {
            setBidFeedback(prev => ({ ...prev, [taskId]: `Insufficient credits. ${household.name} has ${Math.round(household.credits)} credits.` }));
            return;
        }

        submitBid(taskId, householdId, amount);

        const isEquityOverride = household.povertyIndex > EQUITY_OVERRIDE_THRESHOLD;
        setBidFeedback(prev => ({
            ...prev,
            [taskId]: isEquityOverride
                ? `⚡ Equity Override Triggered – Poverty Prioritized for ${household.name}`
                : `✅ Bid submitted! Allocation Score: ${computeAllocationScore(amount, household.centralityScore, household.povertyIndex).toFixed(3)}`,
        }));
        setTimeout(() => setBidFeedback(prev => { const n = { ...prev }; delete n[taskId]; return n; }), 4000);
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
                        background: 'rgba(99,179,237,0.1)',
                        border: '1px solid rgba(99,179,237,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(99,179,237,0.06)',
                    }}>
                        <ShoppingBag size={20} style={{ color: '#63b3ed' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>AI Task Marketplace</h2>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>Equity-driven allocation · Poverty-first bidding</p>
                    </div>
                </div>
                <div style={{
                    background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '12px 16px',
                    border: '1px solid rgba(99,179,237,0.06)', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px', color: '#94a3b8', marginTop: '14px',
                }}>
                    <span style={{ color: '#63b3ed' }}>Allocation Score</span> = (0.4 × Bid) + (0.2 × Centrality) + (0.4 × Poverty Index) &nbsp;|&nbsp;
                    <span style={{ color: '#c084fc' }}>Equity Override</span> if Poverty Index &gt; 0.7
                </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-4">
                {tasks.map(task => {
                    const hId = selectedHousehold[task.id];
                    const household = households.find(h => h.id === hId);
                    const bidAmt = bidAmounts[task.id] || 0;
                    const allocScore = household ? computeAllocationScore(bidAmt, household.centralityScore, household.povertyIndex) : 0;
                    const wouldTriggerOverride = household && household.povertyIndex > EQUITY_OVERRIDE_THRESHOLD;
                    const feedback = bidFeedback[task.id];
                    const isEquityFeedback = feedback?.includes('Equity Override');

                    const borderColor = task.status === 'allocated' ? 'rgba(52,211,153,0.2)' : task.equityOverride ? 'rgba(192,132,252,0.2)' : 'rgba(99,179,237,0.08)';

                    return (
                        <div key={task.id} style={{
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(28px)',
                            border: `1px solid ${borderColor}`,
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-card)',
                            overflow: 'hidden',
                        }}>
                            <div style={{ padding: '22px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '15px' }}>{task.title}</span>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                                                background: `${categoryColor[task.category] || '#63b3ed'}15`,
                                                color: categoryColor[task.category] || '#63b3ed',
                                                border: `1px solid ${categoryColor[task.category] || '#63b3ed'}25`,
                                            }}>{task.category}</span>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                                                background: `${difficultyColor[task.difficulty]}15`,
                                                color: difficultyColor[task.difficulty],
                                                border: `1px solid ${difficultyColor[task.difficulty]}25`,
                                            }}>{task.difficulty}</span>
                                            {task.status === 'allocated' && (
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                                                    background: 'rgba(52,211,153,0.12)', color: '#34d399',
                                                    border: '1px solid rgba(52,211,153,0.25)',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                }}><CheckCircle size={10} /> Allocated</span>
                                            )}
                                            {task.equityOverride && (
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                                                    background: 'rgba(192,132,252,0.12)', color: '#c084fc',
                                                    border: '1px solid rgba(192,132,252,0.25)',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                }}><Zap size={10} /> Equity Override</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{task.description}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#63b3ed', fontFamily: "'Space Grotesk', sans-serif" }}>{task.baseCreditRequirement}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>Base Credits</div>
                                    </div>
                                </div>

                                {/* Task metrics */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ background: 'rgba(6,12,26,0.6)', borderRadius: '12px', padding: '14px', textAlign: 'center', border: '1px solid rgba(99,179,237,0.05)' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '5px' }}>Stability Impact</div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#34d399', fontFamily: "'Space Grotesk', sans-serif" }}>{(task.stabilityImpact * 100).toFixed(0)}%</div>
                                        <div className="progress-bar" style={{ marginTop: '6px' }}>
                                            <div className="progress-fill" style={{ width: `${task.stabilityImpact * 100}%`, background: 'linear-gradient(90deg, #34d399, #059669)' }} />
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(6,12,26,0.6)', borderRadius: '12px', padding: '14px', textAlign: 'center', border: '1px solid rgba(99,179,237,0.05)' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '5px' }}>Total Bids</div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#63b3ed', fontFamily: "'Space Grotesk', sans-serif" }}>{task.bids.length}</div>
                                    </div>
                                    <div style={{ background: 'rgba(6,12,26,0.6)', borderRadius: '12px', padding: '14px', textAlign: 'center', border: '1px solid rgba(99,179,237,0.05)' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '5px' }}>Status</div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: task.status === 'open' ? '#fbbf24' : '#34d399', fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {task.status === 'open' ? 'Open' : 'Allocated'}
                                        </div>
                                    </div>
                                </div>

                                {/* Allocated to */}
                                {task.allocated && (
                                    <div style={{
                                        marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
                                        background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}>
                                        <CheckCircle size={14} style={{ color: '#34d399' }} />
                                        <span style={{ fontSize: '13px', color: '#6ee7b7' }}>
                                            Allocated to: <strong>{households.find(h => h.id === task.allocated)?.name || task.allocated}</strong>
                                            {task.equityOverride && ' (Equity Override – Poverty Prioritized)'}
                                        </span>
                                    </div>
                                )}

                                {/* Bid section */}
                                {task.status === 'open' && (
                                    <div className="space-y-3">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <select
                                                className="input-field"
                                                style={{ flex: 1, minWidth: '160px' }}
                                                value={selectedHousehold[task.id] || ''}
                                                onChange={e => setSelectedHousehold(prev => ({ ...prev, [task.id]: e.target.value }))}
                                            >
                                                <option value="">Select Household</option>
                                                {households.map(h => (
                                                    <option key={h.id} value={h.id}>
                                                        {h.name} ({Math.round(h.credits)} credits, PI: {h.povertyIndex.toFixed(2)})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min={task.baseCreditRequirement}
                                                max={household ? Math.floor(household.credits) : 999}
                                                value={bidAmounts[task.id] || task.baseCreditRequirement}
                                                onChange={e => setBidAmounts(prev => ({ ...prev, [task.id]: parseInt(e.target.value) || 0 }))}
                                                className="input-field"
                                                style={{ width: '112px' }}
                                                placeholder="Bid"
                                            />
                                            <button
                                                className={`btn ${wouldTriggerOverride ? 'btn-purple' : 'btn-primary'}`}
                                                onClick={() => handleBid(task.id)}
                                            >
                                                {wouldTriggerOverride ? <><Zap size={12} /> Override Bid</> : 'Submit Bid'}
                                            </button>
                                        </div>

                                        {/* Allocation score preview */}
                                        {household && bidAmt > 0 && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                                                borderRadius: '10px', background: 'rgba(99,179,237,0.04)', border: '1px solid rgba(99,179,237,0.08)',
                                                fontSize: '12px',
                                            }}>
                                                <Star size={12} style={{ color: '#63b3ed' }} />
                                                <span style={{ color: '#94a3b8' }}>Allocation Score:</span>
                                                <span style={{ fontWeight: 700, color: '#63b3ed' }}>{allocScore.toFixed(4)}</span>
                                                {wouldTriggerOverride && (
                                                    <span style={{ marginLeft: '8px', color: '#c084fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Zap size={10} /> Equity Override will activate
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        {feedback && (
                                            <div className="animate-slide-up" style={{
                                                padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 500,
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                ...(isEquityFeedback
                                                    ? { background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', color: '#d8b4fe' }
                                                    : { background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)', color: '#6ee7b7' })
                                            }}>
                                                {isEquityFeedback ? <Zap size={14} style={{ color: '#c084fc' }} /> : <CheckCircle size={14} style={{ color: '#34d399' }} />}
                                                {feedback}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Existing bids */}
                                {task.bids.length > 0 && (
                                    <div style={{ marginTop: '18px' }} className="space-y-2">
                                        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Current Bids</div>
                                        {task.bids.map((bid, i) => {
                                            const bidder = households.find(h => h.id === bid.householdId);
                                            return (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '10px 14px', borderRadius: '10px',
                                                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)',
                                                    fontSize: '12px',
                                                }}>
                                                    <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{bidder?.name}</span>
                                                    <span style={{ color: '#63b3ed', fontWeight: 600 }}>{bid.amount} credits</span>
                                                    <span style={{ color: '#64748b' }}>Score: {bid.allocationScore.toFixed(3)}</span>
                                                    <span style={{ marginLeft: 'auto', color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>{new Date(bid.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskMarketplace;
