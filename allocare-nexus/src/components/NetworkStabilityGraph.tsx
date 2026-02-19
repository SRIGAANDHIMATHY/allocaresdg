import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useAllocareStore } from '../store/allocareStore';
import { getPovertyColor, computeResilienceScore, getNetworkEdges } from '../utils/povertyEngine';
import { Network, Shield, Info } from 'lucide-react';

const NetworkStabilityGraph: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { households } = useAllocareStore();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; household: typeof households[0] } | null>(null);
    const resilienceScore = computeResilienceScore(households);
    const edges = getNetworkEdges(households);

    useEffect(() => {
        if (!svgRef.current || households.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth || 700;
        const height = 420;

        svg.selectAll('*').remove();

        // Defs: glow filter
        const defs = svg.append('defs');
        ['green', 'yellow', 'red', 'blue'].forEach(c => {
            const filter = defs.append('filter').attr('id', `glow-${c}`);
            filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
            const feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode').attr('in', 'coloredBlur');
            feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
        });

        // Background grid
        const gridGroup = svg.append('g').attr('class', 'grid');
        for (let x = 0; x < width; x += 50) {
            gridGroup.append('line').attr('x1', x).attr('y1', 0).attr('x2', x).attr('y2', height)
                .attr('stroke', 'rgba(56,189,248,0.04)').attr('stroke-width', 1);
        }
        for (let y = 0; y < height; y += 50) {
            gridGroup.append('line').attr('x1', 0).attr('y1', y).attr('x2', width).attr('y2', y)
                .attr('stroke', 'rgba(56,189,248,0.04)').attr('stroke-width', 1);
        }

        // Nodes data
        const nodeData = households.map(h => ({
            id: h.id,
            name: h.name,
            povertyIndex: h.povertyIndex,
            credits: h.credits,
            color: getPovertyColor(h.povertyIndex),
            radius: 18 + h.povertyIndex * 28,
            lastShocked: h.lastShocked,
        }));

        // Force simulation
        const simulation = d3.forceSimulation(nodeData as any)
            .force('link', d3.forceLink(
                edges.map(e => ({ source: e.source, target: e.target }))
            ).id((d: any) => d.id).distance(130).strength(0.3))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius((d: any) => d.radius + 15));

        // Edges
        const linkGroup = svg.append('g');
        const links = linkGroup.selectAll('line')
            .data(edges)
            .enter()
            .append('line')
            .attr('stroke', 'rgba(56,189,248,0.2)')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,4');

        // Node groups
        const nodeGroup = svg.append('g');
        const nodes = nodeGroup.selectAll('g')
            .data(nodeData)
            .enter()
            .append('g')
            .attr('class', 'network-node')
            .style('cursor', 'pointer');

        // Outer pulse ring for shocked nodes
        nodes.append('circle')
            .attr('r', (d: any) => d.radius + 8)
            .attr('fill', 'none')
            .attr('stroke', (d: any) => d.lastShocked ? '#ef4444' : 'transparent')
            .attr('stroke-width', 2)
            .attr('opacity', 0.5)
            .attr('class', (d: any) => d.lastShocked ? 'animate-pulse-glow' : '');

        // Main node circle
        nodes.append('circle')
            .attr('r', (d: any) => d.radius)
            .attr('fill', (d: any) => `${d.color}25`)
            .attr('stroke', (d: any) => d.color)
            .attr('stroke-width', 2)
            .attr('filter', (d: any) => d.povertyIndex > 0.6 ? 'url(#glow-red)' : d.povertyIndex < 0.3 ? 'url(#glow-green)' : 'url(#glow-yellow)')
            .on('mouseover', function (event: any, d: any) {
                const household = households.find(h => h.id === d.id);
                if (household) {
                    setTooltip({ x: event.offsetX, y: event.offsetY, household });
                }
                d3.select(this).attr('stroke-width', 3).attr('r', d.radius + 3);
            })
            .on('mouseout', function (_: any, d: any) {
                setTooltip(null);
                d3.select(this).attr('stroke-width', 2).attr('r', d.radius);
            });

        // Inner glow
        nodes.append('circle')
            .attr('r', (d: any) => d.radius * 0.5)
            .attr('fill', (d: any) => `${d.color}15`)
            .attr('stroke', 'none');

        // Label
        nodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', 'white')
            .attr('font-size', '10px')
            .attr('font-weight', '600')
            .attr('font-family', 'Inter, sans-serif')
            .attr('pointer-events', 'none')
            .text((d: any) => d.name.split(' ')[0]);

        // Credits label below
        nodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', (d: any) => d.radius + 16)
            .attr('fill', '#94a3b8')
            .attr('font-size', '9px')
            .attr('font-family', 'Inter, sans-serif')
            .attr('pointer-events', 'none')
            .text((d: any) => `${Math.round(d.credits)}cr`);

        // Drag behavior
        const drag = d3.drag<any, any>()
            .on('start', (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x; d.fy = d.y;
            })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null; d.fy = null;
            });

        nodes.call(drag);

        simulation.on('tick', () => {
            links
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });

        return () => { simulation.stop(); };
    }, [households]);

    const resilienceColor = resilienceScore > 70 ? '#10b981' : resilienceScore > 40 ? '#f59e0b' : '#ef4444';

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <Network size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Network Stability Graph</h2>
                            <p className="text-xs text-slate-500">Node size = poverty level · Color = stability · Edges = dependencies</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold" style={{ color: resilienceColor }}>{resilienceScore}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1"><Shield size={10} /> Resilience Score</div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                    {[
                        { color: '#10b981', label: 'Stable (PI < 0.3)' },
                        { color: '#f59e0b', label: 'Vulnerable (0.3–0.6)' },
                        { color: '#ef4444', label: 'High Risk / Extreme (> 0.6)' },
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-2 text-xs text-slate-400">
                            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                            {l.label}
                        </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-6 h-0.5 border-t border-dashed border-blue-400/40" />
                        Dependency edge
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Info size={10} /> Larger node = higher poverty
                    </div>
                </div>
            </div>

            {/* SVG Graph */}
            <div className="glass-card p-4 relative overflow-hidden" style={{ minHeight: 460 }}>
                <svg
                    ref={svgRef}
                    width="100%"
                    height="420"
                    style={{ display: 'block' }}
                />

                {/* Tooltip */}
                {tooltip && (
                    <div
                        className="absolute glass-card-dark p-3 text-xs pointer-events-none z-10 min-w-48 animate-slide-up"
                        style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
                    >
                        <div className="font-bold text-white mb-2">{tooltip.household.name}</div>
                        <div className="space-y-1">
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Poverty Index</span>
                                <span style={{ color: getPovertyColor(tooltip.household.povertyIndex) }} className="font-bold">
                                    {tooltip.household.povertyIndex.toFixed(3)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Credits</span>
                                <span className="text-blue-400 font-bold">{Math.round(tooltip.household.credits)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Centrality</span>
                                <span className="text-cyan-400">{tooltip.household.centralityScore.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Shock Risk</span>
                                <span className="text-red-400">{tooltip.household.shockExposureRisk.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Household Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {households.map(h => {
                    const color = getPovertyColor(h.povertyIndex);
                    return (
                        <div key={h.id} className="glass-card-dark p-3 text-center" style={{ borderColor: `${color}25` }}>
                            <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold"
                                style={{ background: `${color}20`, border: `2px solid ${color}50`, color }}>
                                {h.name.charAt(0)}
                            </div>
                            <div className="text-xs font-semibold text-slate-300 truncate">{h.name.split(' ')[0]}</div>
                            <div className="text-sm font-bold mt-1" style={{ color }}>{h.povertyIndex.toFixed(2)}</div>
                            <div className="text-xs text-slate-500">{Math.round(h.credits)} cr</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NetworkStabilityGraph;
