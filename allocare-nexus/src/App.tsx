import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { useAllocareStore } from './store/allocareStore';
import DashboardOverview from './components/DashboardOverview';
import PovertyIntelligencePanel from './components/PovertyIntelligencePanel';
import TaskMarketplace from './components/TaskMarketplace';
import CreditExchangePanel from './components/CreditExchangePanel';
import NetworkStabilityGraph from './components/NetworkStabilityGraph';
import ShockSimulationControls from './components/ShockSimulationControls';
import PovertyTrendAnalytics from './components/PovertyTrendAnalytics';
import SystemActivityLog from './components/SystemActivityLog';
import PovertyPulseMonitor from './components/PovertyPulseMonitor';
import NGOLogin from './components/NGOLogin';
import NGODashboard from './components/NGODashboard';
import AreaPovertyDetectionLayer from './components/AreaPovertyDetectionLayer';
import CommunityEngagementSystem from './components/CommunityEngagementSystem';
import {
  LayoutDashboard, Brain, ShoppingBag, ArrowRightLeft,
  Network, Zap, TrendingDown, Menu, X, Globe, Activity,
  Heart, Database, ChevronRight, Sparkles, LogOut, ScrollText, Shield, Users,
  Layers, Gift
} from 'lucide-react';

type TabId = 'dashboard' | 'pulse' | 'intelligence' | 'marketplace' | 'exchange' | 'network' | 'simulation' | 'analytics';

const tabs: { id: TabId; label: string; icon: React.ReactNode; description: string; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, description: 'Overview' },
  { id: 'pulse', label: 'Poverty Pulse', icon: <Heart size={16} />, description: 'Live AI Monitor', badge: 'NEW' },
  { id: 'intelligence', label: 'Intelligence', icon: <Brain size={16} />, description: 'Detection Engine' },
  { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag size={16} />, description: 'AI Allocation' },
  { id: 'exchange', label: 'Credit Exchange', icon: <ArrowRightLeft size={16} />, description: 'P2P Trading' },
  { id: 'network', label: 'Network Graph', icon: <Network size={16} />, description: 'Stability Map' },
  { id: 'simulation', label: 'Simulation', icon: <Zap size={16} />, description: 'Shock Controls' },
  { id: 'analytics', label: 'Analytics', icon: <TrendingDown size={16} />, description: 'Trend Data' },
];

function App() {
  const { households, runCycle, currentUserRole, login, logout, emergencyFundBalance } = useAllocareStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUserRole === 'household') runCycle();
  }, [currentUserRole]);

  // Animated background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    const colors = ['rgba(99,179,237,', 'rgba(192,132,252,', 'rgba(52,211,153,'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.35 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.fill();
      });
      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99,179,237,${0.035 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, [currentUserRole]);

  // Set default tab on role login
  useEffect(() => {
    if (currentUserRole === 'ngo') setActiveTab('ngo-dashboard');
    if (currentUserRole === 'household') setActiveTab('dashboard');
  }, [currentUserRole]);

  // Role Selection / Landing Page UI
  if (!currentUserRole) {
    const isNGOPortal = window.location.hash === '#ngo';
    if (isNGOPortal) return <NGOLogin />;

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
        <div className="app-bg">
          <div className="app-bg-grid" />
          <div className="app-bg-orb1" />
          <div className="app-bg-orb2" />
        </div>
        <div className="animate-fade-in" style={{ zIndex: 1, maxWidth: '600px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Shield size={32} style={{ color: '#38bdf8' }} />
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-1.5px', marginBottom: '16px' }}>
            AlloCare <span className="text-gradient-purple">Nexus</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px' }}>AI-Driven Poverty Intelligence & Community Stabilization Platform</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
            <button className="glass-card p-6 btn-hover-effect" onClick={() => login('household')} style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', background: 'rgba(255,255,255,0.03)' }}>
              <Users size={32} style={{ color: '#38bdf8', marginBottom: '16px' }} />
              <div style={{ color: '#f1f5f9', fontWeight: 700 }}>Household Entry</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>Access community resources</div>
            </button>
            <button className="glass-card p-6 btn-hover-effect" onClick={() => window.location.hash = 'ngo'} style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', background: 'rgba(255,255,255,0.03)' }}>
              <Shield size={32} style={{ color: '#a78bfa', marginBottom: '16px' }} />
              <div style={{ color: '#f1f5f9', fontWeight: 700 }}>NGO Portal</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>Governance & Oversight</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const povertyRate = households.length > 0
    ? Math.round((households.filter(h => h.povertyIndex > 0.6).length / households.length) * 100)
    : 0;

  const householdTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, description: 'Overview' },
    { id: 'pulse', label: 'Poverty Pulse', icon: <Heart size={16} />, description: 'Live Monitor' },
    { id: 'intelligence', label: 'Intelligence', icon: <Brain size={16} />, description: 'AI Engine' },
    { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag size={16} />, description: 'Labor Exchange' },
    { id: 'exchange', label: 'Credit Exchange', icon: <ArrowRightLeft size={16} />, description: 'Transfers' },
    { id: 'network', label: 'Network Graph', icon: <Network size={16} />, description: 'Stability Map' },
    { id: 'simulation', label: 'Simulation', icon: <Zap size={16} />, description: 'Shock Tests' },
    { id: 'analytics', label: 'Analytics', icon: <TrendingDown size={16} />, description: 'Trends' },
  ];

  const ngoTabs = [
    { id: 'ngo-dashboard', label: 'NGO Governance', icon: <Shield size={16} />, description: 'System Oversight' },
    { id: 'area-detection', label: 'Area Detection', icon: <Layers size={16} />, description: 'Sector Intelligence' },
    { id: 'community-jobs', label: 'Community Jobs', icon: <Gift size={16} />, description: 'Stabilization Programs' },
    { id: 'system-logs', label: 'Audit Logs', icon: <ScrollText size={16} />, description: 'Full System History' },
    { id: 'analytics', label: 'Global Analytics', icon: <TrendingDown size={16} />, description: 'Impact Trends' },
  ];

  const tabsToRender = currentUserRole === 'ngo' ? ngoTabs : householdTabs;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'pulse': return <PovertyPulseMonitor />;
      case 'intelligence': return <PovertyIntelligencePanel />;
      case 'marketplace': return <TaskMarketplace />;
      case 'exchange': return <CreditExchangePanel />;
      case 'network': return <NetworkStabilityGraph />;
      case 'simulation': return <ShockSimulationControls />;
      case 'analytics': return <PovertyTrendAnalytics />;
      case 'ngo-dashboard': return <NGODashboard />;
      case 'area-detection': return <AreaPovertyDetectionLayer />;
      case 'community-jobs': return <CommunityEngagementSystem />;
      case 'system-logs': return <div className="glass-card p-6"><SystemActivityLog /></div>;
      default: return currentUserRole === 'ngo' ? <NGODashboard /> : <DashboardOverview />;
    }
  };

  const currentTab = tabsToRender.find(t => t.id === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', background: 'var(--bg-void)' }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Animated background orbs */}
      <div className="app-bg" style={{ zIndex: 0 }}>
        <div className="app-bg-grid" />
        <div className="app-bg-orb3" />
      </div>

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Top Navigation Bar ── */}
        <header style={{
          background: 'rgba(3, 7, 18, 0.88)',
          borderBottom: '1px solid rgba(99,179,237,0.08)',
          backdropFilter: 'blur(36px) saturate(180%)',
          position: 'sticky',
          top: 0,
          zIndex: 200,
          padding: '0 24px',
          height: '62px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(99,179,237,0.06)',
              border: '1px solid rgba(99,179,237,0.1)',
              borderRadius: '10px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.25s',
            }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <Sparkles size={18} style={{ color: '#3182ce' }} />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif" }}>AlloCare Nexus</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>SESSION HUB</div>
              <div style={{ color: currentUserRole === 'ngo' ? '#a78bfa' : '#38bdf8', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentUserRole === 'ngo' ? '#a78bfa' : '#38bdf8' }} className="animate-pulse" />
                {currentUserRole?.toUpperCase()}
              </div>
            </div>
            {currentUserRole === 'ngo' && (
              <div style={{ textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>STABILIZATION POOL</div>
                <div style={{ color: '#34d399', fontSize: '11px', fontWeight: 700 }}>{emergencyFundBalance.toLocaleString()} CR</div>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>LOCAL TIME</div>
              <div style={{ color: '#f8fafc', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{time.toLocaleTimeString()}</div>
            </div>
            <button onClick={() => { logout(); window.location.hash = ''; }} style={{ background: 'rgba(244,63,94,0.1)', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' }}>
              <LogOut size={16} /> EXIT
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <aside style={{ width: sidebarOpen ? '260px' : '0', opacity: sidebarOpen ? 1 : 0, transition: 'all 0.3s ease', background: 'rgba(3,7,18,0.3)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: sidebarOpen ? '24px 12px' : '24px 0' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tabsToRender.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s', color: activeTab === tab.id ? '#f8fafc' : '#64748b', fontWeight: 600 }}
                >
                  {tab.icon}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px' }}>{tab.label}</div>
                    <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 400 }}>{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>

            <div className="glass-card" style={{ padding: '16px', marginTop: 'auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} className="animate-pulse" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '1px' }}>SYSTEMS NOMINAL</span>
              </div>
              <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.5 }}>
                Last Sync: {new Date().toLocaleDateString()}<br />
                Data: Persistence Active
              </div>
            </div>
          </aside>

          <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentTab?.label}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>
                    {currentTab?.description} · Tracking {households.length} community nodes.
                  </p>
                </div>
              </div>

              <div key={activeTab} className="animate-fade-in">
                {renderContent()}
              </div>

              {/* Footer */}
              <footer style={{
                marginTop: '64px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: '#475569', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px'
              }}>
                <div>&copy; 2026 ALLOCARE NEXUS PROTOCOL</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <span>PRISMA CORE ACTIVATED</span>
                  <span>AI GOVERNANCE VERIFIED</span>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
