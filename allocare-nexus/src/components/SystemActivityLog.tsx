import React from 'react';
import { useAllocareStore } from '../store/allocareStore';
import { Clock, Zap, Bot, ArrowRightLeft, ShoppingBag, AlertTriangle, Info, Terminal } from 'lucide-react';

const logTypeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    equity_override: { color: '#c084fc', icon: <Zap size={11} /> },
    shock: { color: '#fb7185', icon: <AlertTriangle size={11} /> },
    redistribution: { color: '#22d3ee', icon: <Bot size={11} /> },
    labor: { color: '#34d399', icon: <Zap size={11} /> },
    bid: { color: '#63b3ed', icon: <ShoppingBag size={11} /> },
    transfer: { color: '#fbbf24', icon: <ArrowRightLeft size={11} /> },
    stabilization: { color: '#fbbf24', icon: <AlertTriangle size={11} /> },
    info: { color: '#64748b', icon: <Info size={11} /> },
};

const SystemActivityLog: React.FC = () => {
    const { systemLogs } = useAllocareStore();

    return (
        <div style={{
            background: 'rgba(6,12,26,0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99,179,237,0.06)',
            borderRadius: '16px',
            padding: '18px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'rgba(99,179,237,0.08)',
                    border: '1px solid rgba(99,179,237,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Terminal size={13} style={{ color: '#63b3ed' }} />
                </div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    System Activity Log
                </h3>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} className="animate-pulse-glow" />
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#475569', fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: '6px' }}>
                    {systemLogs.length} events
                </span>
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {systemLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#475569', fontSize: '12px' }}>
                        No activity yet
                    </div>
                ) : (
                    systemLogs.map(log => {
                        const config = logTypeConfig[log.type] || logTypeConfig.info;
                        return (
                            <div
                                key={log.id}
                                className="log-entry animate-slide-in"
                                style={{
                                    borderLeftColor: config.color,
                                    background: `${config.color}06`,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <span style={{ color: config.color, flexShrink: 0, marginTop: '2px' }}>
                                        {config.icon}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ color: '#94a3b8', fontSize: '11px', lineHeight: '1.55' }}>
                                            {log.message}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                                            <Clock size={9} style={{ color: '#475569' }} />
                                            <span style={{ color: '#475569', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SystemActivityLog;
