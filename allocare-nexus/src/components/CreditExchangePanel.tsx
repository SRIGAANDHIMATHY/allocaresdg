import React, { useState } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import { EQUITY_OVERRIDE_THRESHOLD } from '../utils/povertyEngine';
import { ArrowRightLeft, Bot, TrendingUp, AlertTriangle, CheckCircle, Send, Sparkles } from 'lucide-react';

const CreditExchangePanel: React.FC = () => {
    const { households, transfers, transferCredits, getAISuggestion } = useAllocareStore();
    const [fromId, setFromId] = useState('');
    const [toId, setToId] = useState('');
    const [amount, setAmount] = useState(10);
    const [feedback, setFeedback] = useState('');
    const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'ai'>('success');

    const aiSuggestion = getAISuggestion();
    const fromHousehold = households.find(h => h.id === fromId);
    const toHousehold = households.find(h => h.id === toId);

    const handleTransfer = (fId = fromId, tId = toId, amt = amount, ai = false) => {
        if (!fId || !tId || fId === tId || amt <= 0) {
            setFeedback('Please select different households and a valid amount.');
            setFeedbackType('error');
            return;
        }
        const from = households.find(h => h.id === fId);
        if (!from || from.credits < amt) {
            setFeedback(`Insufficient credits. ${from?.name} has ${Math.round(from?.credits || 0)} credits.`);
            setFeedbackType('error');
            return;
        }
        transferCredits(fId, tId, amt, ai);
        const toH = households.find(h => h.id === tId);
        setFeedback(ai
            ? `🤖 AI Redistribution: ${from.name} → ${toH?.name}: ${amt} credits. Redistribution prevents cascade poverty.`
            : `✅ Transfer complete: ${from.name} → ${toH?.name}: ${amt} credits`
        );
        setFeedbackType(ai ? 'ai' : 'success');
        setTimeout(() => setFeedback(''), 4000);
    };

    const handleAISuggestion = () => {
        if (!aiSuggestion) return;
        handleTransfer(aiSuggestion.fromId, aiSuggestion.toId, aiSuggestion.amount, true);
    };

    const highPovertyHouseholds = households.filter(h => h.povertyIndex > EQUITY_OVERRIDE_THRESHOLD);

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
                        background: 'rgba(34,211,238,0.1)',
                        border: '1px solid rgba(34,211,238,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(34,211,238,0.06)',
                    }}>
                        <ArrowRightLeft size={20} style={{ color: '#22d3ee' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>Peer-to-Peer Credit Exchange</h2>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>AI-guided redistribution · Cascade poverty prevention</p>
                    </div>
                </div>
            </div>

            {/* AI Suggestion Banner */}
            {aiSuggestion && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(192,132,252,0.08), rgba(99,179,237,0.04))',
                    border: '1px solid rgba(192,132,252,0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-glow-purple)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(192,132,252,0.15)',
                            border: '1px solid rgba(192,132,252,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }} className="animate-pulse-glow">
                            <Bot size={16} style={{ color: '#c084fc' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <span style={{ color: '#d8b4fe', fontWeight: 600, fontSize: '14px' }}>AI Redistribution Suggestion</span>
                                <span style={{ fontSize: '11px', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: '6px' }}>Cascade prevention active</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px', lineHeight: 1.6 }}>
                                Transfer <strong style={{ color: '#f8fafc' }}>{aiSuggestion.amount} credits</strong> from{' '}
                                <strong style={{ color: '#34d399' }}>{households.find(h => h.id === aiSuggestion.fromId)?.name}</strong>{' '}
                                (lowest poverty) to{' '}
                                <strong style={{ color: '#fb7185' }}>{households.find(h => h.id === aiSuggestion.toId)?.name}</strong>{' '}
                                (highest poverty). <em style={{ color: '#475569' }}>Redistribution prevents cascade poverty.</em>
                            </p>
                            <button className="btn btn-purple btn-sm" onClick={handleAISuggestion}>
                                <Sparkles size={12} /> Apply AI Suggestion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* High Poverty Alert */}
            {highPovertyHouseholds.length > 0 && (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(251,113,133,0.15)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px 22px',
                    boxShadow: 'var(--shadow-card)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <AlertTriangle size={14} style={{ color: '#fb7185' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#fda4af' }}>High Poverty Alert</span>
                    </div>
                    <div className="space-y-2">
                        {highPovertyHouseholds.map(h => (
                            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                                <span style={{ color: '#fb7185', fontWeight: 600 }}>{h.name}</span>
                                <span style={{ color: '#64748b' }}>Poverty Index: {h.povertyIndex.toFixed(3)}</span>
                                <span style={{ color: '#64748b' }}>Credits: {Math.round(h.credits)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Manual Transfer */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
                boxShadow: 'var(--shadow-card)',
            }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#cbd5e1', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={14} style={{ color: '#63b3ed' }} /> Manual Credit Transfer
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: 500 }}>From Household</label>
                        <select className="input-field" value={fromId} onChange={e => setFromId(e.target.value)}>
                            <option value="">Select sender</option>
                            {households.map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.name} ({Math.round(h.credits)} credits)
                                </option>
                            ))}
                        </select>
                        {fromHousehold && (
                            <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                                PI: <span style={{ color: '#63b3ed', fontWeight: 600 }}>{fromHousehold.povertyIndex.toFixed(3)}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: 500 }}>To Household</label>
                        <select className="input-field" value={toId} onChange={e => setToId(e.target.value)}>
                            <option value="">Select receiver</option>
                            {households.filter(h => h.id !== fromId).map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.name} ({Math.round(h.credits)} credits)
                                </option>
                            ))}
                        </select>
                        {toHousehold && (
                            <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                                PI: <span style={{ color: '#fb7185', fontWeight: 600 }}>{toHousehold.povertyIndex.toFixed(3)}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Amount (Credits)</label>
                        <input
                            type="number"
                            min={1}
                            max={fromHousehold ? Math.floor(fromHousehold.credits) : 999}
                            value={amount}
                            onChange={e => setAmount(parseInt(e.target.value) || 1)}
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Preview */}
                {fromHousehold && toHousehold && amount > 0 && (
                    <div style={{
                        marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(99,179,237,0.04)', border: '1px solid rgba(99,179,237,0.1)',
                        fontSize: '12px', display: 'flex', alignItems: 'center', gap: '16px',
                    }}>
                        <span style={{ color: '#64748b' }}>After transfer:</span>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>{fromHousehold.name}: {Math.round(fromHousehold.credits - amount)} credits</span>
                        <span style={{ color: '#475569' }}>→</span>
                        <span style={{ color: '#63b3ed', fontWeight: 600 }}>{toHousehold.name}: {Math.round(toHousehold.credits + amount)} credits</span>
                    </div>
                )}

                <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '12px' }} onClick={() => handleTransfer()}>
                    <ArrowRightLeft size={14} /> Execute Transfer
                </button>

                {feedback && (
                    <div className="animate-slide-up" style={{
                        marginTop: '14px', padding: '12px 16px', borderRadius: '12px',
                        fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px',
                        ...(feedbackType === 'error'
                            ? { background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fda4af' }
                            : feedbackType === 'ai'
                                ? { background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', color: '#d8b4fe' }
                                : { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#6ee7b7' })
                    }}>
                        {feedbackType === 'error' ? <AlertTriangle size={14} /> : feedbackType === 'ai' ? <Bot size={14} style={{ color: '#c084fc' }} /> : <CheckCircle size={14} />}
                        {feedback}
                    </div>
                )}
            </div>

            {/* Transfer History */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
                boxShadow: 'var(--shadow-card)',
            }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#cbd5e1', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={14} style={{ color: '#63b3ed' }} /> Transfer History
                </h3>
                {transfers.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center', padding: '20px' }}>No transfers yet. Use manual transfer or AI suggestion above.</p>
                ) : (
                    <div className="space-y-2" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                        {transfers.map((t, i) => {
                            const from = households.find(h => h.id === t.fromId);
                            const to = households.find(h => h.id === t.toId);
                            return (
                                <div key={i} className="animate-slide-in" style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 14px', borderRadius: '10px',
                                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)',
                                    fontSize: '12px',
                                }}>
                                    {t.aiSuggested && <Bot size={12} style={{ color: '#c084fc', flexShrink: 0 }} />}
                                    <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{from?.name}</span>
                                    <ArrowRightLeft size={10} style={{ color: '#475569' }} />
                                    <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{to?.name}</span>
                                    <span style={{ color: '#63b3ed', fontWeight: 600, marginLeft: '4px' }}>{t.amount} credits</span>
                                    {t.aiSuggested && <span style={{ color: '#c084fc', fontSize: '10px', fontWeight: 600 }}>AI</span>}
                                    <span style={{ marginLeft: 'auto', color: '#475569', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>{new Date(t.timestamp).toLocaleTimeString()}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreditExchangePanel;
