import React from 'react';
import { useAllocareStore } from '../store/allocareStore';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { TrendingDown, BarChart2, Activity, Target } from 'lucide-react';
import { getPovertyColor } from '../utils/povertyEngine';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card-dark p-3 text-xs border border-blue-500/20">
                <p className="text-slate-400 mb-2">Cycle {label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        <span className="text-slate-400">{p.name}:</span>
                        <span className="font-bold" style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed ? p.value.toFixed(2) : p.value : p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const PovertyTrendAnalytics: React.FC = () => {
    const { trendData, households, cycle } = useAllocareStore();


    // Household bar data
    const householdBarData = [...households]
        .sort((a, b) => b.povertyIndex - a.povertyIndex)
        .map(h => ({
            name: h.name.split(' ')[0],
            'Poverty Index': Math.round(h.povertyIndex * 100) / 100,
            Credits: Math.round(h.credits),
            fill: getPovertyColor(h.povertyIndex),
        }));

    const hasData = trendData.length > 0;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                        <TrendingDown size={20} className="text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Poverty Trend Analytics</h2>
                        <p className="text-xs text-slate-500">Real-time poverty eradication tracking · Run cycles to generate data</p>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-2xl font-bold text-blue-400">{cycle - 1}</div>
                        <div className="text-xs text-slate-500">Cycles Run</div>
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="glass-card p-12 text-center">
                    <BarChart2 size={48} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">No trend data yet</p>
                    <p className="text-xs text-slate-600">Run system cycles from the Shock & Simulation panel to generate analytics</p>
                </div>
            ) : (
                <>
                    {/* Poverty Rate Trend */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <TrendingDown size={14} className="text-red-400" /> Poverty Rate Trend Line
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="povertyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="resilienceGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="cycle" label={{ value: 'Cycle', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                                <Area type="monotone" dataKey="povertyRate" name="Poverty Rate %" stroke="#ef4444" fill="url(#povertyGrad)" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                                <Area type="monotone" dataKey="resilienceScore" name="Resilience Score" stroke="#10b981" fill="url(#resilienceGrad)" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Extreme Poverty + Avg Index */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Activity size={14} className="text-yellow-400" /> Extreme Poverty Count
                            </h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="cycle" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="extremePovertyCount" name="Extreme Poverty" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Target size={14} className="text-blue-400" /> Avg Poverty Index Over Time
                            </h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="cycle" />
                                    <YAxis domain={[0, 1]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="avgPovertyIndex" name="Avg Poverty Index" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* Current Household Poverty Comparison */}
            <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <BarChart2 size={14} className="text-purple-400" /> Household Poverty Index Comparison
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={householdBarData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 1]} />
                        <YAxis type="category" dataKey="name" width={60} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Poverty Index" radius={[0, 4, 4, 0]}>
                            {householdBarData.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-cyan-400" /> Multidimensional Deprivation Radar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {households.slice(0, 4).map(h => {
                        const color = getPovertyColor(h.povertyIndex);
                        const data = [
                            { subject: 'Credit Deficit', value: Math.round(h.creditDeficitRatio * 100) },
                            { subject: 'Instability', value: Math.round(h.incomeInstabilityScore * 100) },
                            { subject: 'Dependency', value: Math.round(h.dependencyRatio * 100) },
                            { subject: 'Shock Risk', value: Math.round(h.shockExposureRisk * 100) },
                            { subject: 'Centrality', value: Math.round(h.centralityScore * 100) },
                        ];
                        return (
                            <div key={h.id} className="glass-card-dark p-3">
                                <div className="text-xs font-semibold mb-2" style={{ color }}>{h.name}</div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <RadarChart data={data}>
                                        <PolarGrid stroke="rgba(56,189,248,0.1)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name={h.name} dataKey="value" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={1.5} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PovertyTrendAnalytics;
