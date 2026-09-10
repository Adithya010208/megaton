import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Search,
  Bot,
  AlertTriangle,
  GitGraph,
  FlaskConical,
  Award,
  Activity,
  RotateCcw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/retrieval', label: 'Retrieval Security', icon: Search },
  { path: '/assistant', label: 'RAG Assistant', icon: Bot },
  { path: '/security-events', label: 'Security Events', icon: AlertTriangle },
  { path: '/evidence', label: 'Evidence Trace', icon: GitGraph },
  { path: '/demo', label: 'Demo Lab', icon: FlaskConical },
  { path: '/security-score', label: 'Security Score', icon: Award },
  { path: '/system-health', label: 'System Health', icon: Activity },
];

export default function Sidebar({ onNavigate, onResetDemo, isResetting, isOnline }) {
  return (
    <aside
      className="sidebar-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0B0F19',
        borderRight: '1px solid var(--border)',
        padding: '16px 12px',
        overflowY: 'auto',
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px 20px', borderBottom: '1px solid #1E293B' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
          <Shield size={20} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#F8FAFC' }}>
            RAG INTEGRITY SHIELD
          </div>
          <div style={{ fontSize: '0.65rem', color: '#60A5FA', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Enterprise Defense
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : '#94A3B8',
                background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Status & Reset Action */}
      <div style={{ borderTop: '1px solid #1E293B', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10B981' : '#38BDF8' }} />
            <span style={{ color: isOnline ? '#34D399' : '#38BDF8', fontWeight: 600 }}>
              {isOnline ? 'System Online' : 'Cloud Sandbox'}
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{isOnline ? 'Port 8000' : 'Demo Mode'}</span>
        </div>

        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="btn btn-secondary"
          style={{ width: '100%', fontSize: '0.75rem', padding: '8px 12px', justifyContent: 'center' }}
          title="Reset database to deterministic demo state"
        >
          <RotateCcw size={13} className={isResetting ? 'animate-spin' : ''} />
          {isResetting ? 'Resetting DB...' : 'Reset Demo Lab'}
        </button>
      </div>
    </aside>
  );
}

