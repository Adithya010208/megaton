import React from 'react';
import { Shield, PlayCircle, BarChart3, SplitSquareVertical, FileText, Search, AlertTriangle, RotateCcw } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onReset, isResetting, health }) {
  const navItems = [
    { id: 'killer-demo', label: 'Killer Demo (4-Min Flow)', icon: PlayCircle, badge: 'Judge Ready' },
    { id: 'dashboard', label: 'Dashboard & Score', icon: BarChart3 },
    { id: 'compare', label: 'Security OFF vs ON', icon: SplitSquareVertical },
    { id: 'documents', label: 'Documents & Stage 1', icon: FileText },
    { id: 'retrieval', label: 'Retrieval & RAG (Stage 2 & 3)', icon: Search },
    { id: 'events', label: 'Security Events & Loop', icon: AlertTriangle },
  ];

  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'rgba(11, 15, 25, 0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              THREE-STAGE RAG INTEGRITY SHIELD
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#1E293B', borderRadius: '4px', color: '#60A5FA', border: '1px solid #2563EB44' }}>
                v1.0 Hackathon Prototype
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Closed-Loop Retroactive Quarantine & Authorization-Scoped Knowledge Protection
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Status indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: health?.status === 'OK' ? '#10B981' : '#EF4444', display: 'inline-block' }}></span>
            <span>API {health?.status === 'OK' ? 'Connected' : 'Connecting...'}</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: '#34D399', fontWeight: 600 }}>Stage 1/2/3 Active</span>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onReset}
            disabled={isResetting}
            className="btn btn-secondary"
            title="Reset database to deterministic seed state for new rehearsal"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <RotateCcw size={14} className={isResetting ? 'animate-spin' : ''} />
            {isResetting ? 'Resetting...' : 'Reset Demo'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '4px', padding: '0 24px', overflowX: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #3B82F6' : '2px solid transparent',
                color: isActive ? '#60A5FA' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? '#60A5FA' : 'var(--text-muted)'} />
              {item.label}
              {item.badge && (
                <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#93C5FD', fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

