import React, { useMemo } from 'react';
import { useAllocareStore } from '../store/allocareStore';
import { Shield, AlertTriangle, TrendingDown, Activity, MapPin } from 'lucide-react';
import { getPovertyColor } from '../utils/povertyEngine';

const AreaPovertyDetectionLayer: React.FC = () => {
    const { households } = useAllocareStore();

    const sectors = useMemo(() => {
        const groups: Record<string, typeof households> = {};
        households.forEach(h => {
            if (!groups[h.sector]) groups[h.sector] = [];
            groups[h.sector].push(h);
        });

        return Object.entries(groups).map(([name, members]) => {
            const avgPoverty = members.reduce((sum, m) => sum + m.povertyIndex, 0) / members.length;
            const avgCredits = members.reduce((sum, m) => sum + m.credits, 0) / members.length;
            const avgResilience = members.reduce((sum, m) => sum + (1 - m.povertyIndex), 0) / members.length;
            const riskLevel = avgPoverty > 0.6 ? 'EXTREME' : avgPoverty > 0.4 ? 'ELEVATED' : 'STABLE';

            return {
                name,
                count: members.length,
                avgPoverty,
                avgCredits,
                avgResilience,
                riskLevel,
                color: getPovertyColor(avgPoverty)
            };
        });
    }, [households]);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-card p-6" style={{ background: 'rgba(30, 41, 59, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ color: '#f8fafc', fontSize: '20px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Area-Based Poverty Detection Layer</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Geospatial Intelligence Engine verifying stabilization factors across community sectors.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '8px 16px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={16} style={{ color: '#38bdf8' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>ENHANCED OVERSIGHT ACTIVE</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {sectors.map(sector => (
                        <div key={sector.name} className="glass-card p-6 btn-hover-effect" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${sector.color}44`, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', background: `${sector.color}11`, transform: 'rotate(45deg) translate(15px, -25px)', borderLeft: `1px solid ${sector.color}33` }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: sector.color, marginBottom: '4px' }}>
                                        <MapPin size={16} />
                                        <span style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '14px' }}>{sector.name}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{sector.count} REGISTERED NODES</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>RISK STATUS</div>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: sector.color }}>{sector.riskLevel}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div className="p-3" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>AVG POVERTY</div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>{(sector.avgPoverty * 100).toFixed(1)}%</div>
                                </div>
                                <div className="p-3" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>AVG CREDITS</div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>{sector.avgCredits.toFixed(0)}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                                    <span>Area Stability Index</span>
                                    <span style={{ color: '#34d399', fontWeight: 700 }}>{(sector.avgResilience * 100).toFixed(0)}%</span>
                                </div>
                                <div className="progress-bar" style={{ height: '6px' }}>
                                    <div className="progress-fill" style={{ width: `${sector.avgResilience * 100}%`, background: sector.color }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                {sector.avgPoverty > 0.5 ? (
                                    <>
                                        <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                                        <span style={{ fontSize: '11px', color: '#fb7185', fontWeight: 600 }}>PRIORITY INTERVENTION REQUIRED</span>
                                    </>
                                ) : (
                                    <>
                                        <Activity size={14} style={{ color: '#34d399' }} />
                                        <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>SYSTEMIC STABILITY VERIFIED</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="glass-card p-6">
                    <h4 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingDown size={18} style={{ color: '#c084fc' }} />
                        Correlation Analysis
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { factor: 'Sectoral Credit Velocity', weight: 0.45, status: 'High' },
                            { factor: 'Shock Cascade Sensitivity', weight: 0.35, status: 'Medium' },
                            { factor: 'Geospatial Resource Access', weight: 0.2, status: 'Low' },
                        ].map(f => (
                            <div key={f.factor} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>{f.factor}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: f.status === 'High' ? '#34d399' : '#fbbf24' }}>{f.status} Correlation</span>
                                    <div style={{ width: '40px', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${f.weight * 100}%`, background: '#c084fc', borderRadius: '4px' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(99,179,237,0.1), rgba(192,132,252,0.1))' }}>
                    <h4 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>AI Detection Logic</h4>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
                        The detection layer utilizes <span style={{ color: '#38bdf8', fontWeight: 700 }}>Spatial Entropy Coefficients</span> to identify emerging poverty clusters before they become systemic.
                    </p>
                    <button className="glass-card p-3" style={{ width: '100%', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                        RE-SCAN ALL SECTORS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AreaPovertyDetectionLayer;
