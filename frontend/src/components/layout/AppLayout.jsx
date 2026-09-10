import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, AlertTriangle, RefreshCw, ServerOff } from 'lucide-react';
import Sidebar from './Sidebar';
import { api, subscribeBackendStatus, getIsBackendOnline } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AppLayout() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(getIsBackendOnline());
  const [isResetting, setIsResetting] = useState(false);
  const [retryingConnection, setRetryingConnection] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeBackendStatus((online) => {
      setIsOnline(online);
    });

    // Check initial health
    api.getHealth()
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false));

    return () => unsubscribe();
  }, []);

  const handleRetryConnection = async () => {
    setRetryingConnection(true);
    try {
      await api.getHealth();
      setIsOnline(true);
      toast.success('Connection restored to backend API!');
    } catch (e) {
      setIsOnline(false);
      toast.error('Could not reach backend API at http://localhost:8000');
    } finally {
      setRetryingConnection(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset demo database to clean deterministic seed state?')) return;
    setIsResetting(true);
    try {
      await api.resetDemo();
      toast.success('Demo database reset to clean deterministic seed state!');
      // Navigate to overview to refresh state
      navigate('/overview');
    } catch (err) {
      toast.error('Failed to reset demo: ' + err.message);
    } finally {
      setIsResetting(false);
      setMobileDrawerOpen(false);
    }
  };

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Desktop Persistent Sidebar (Hidden on mobile via CSS) */}
      <div className="desktop-sidebar" style={{ width: '260px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar
          onNavigate={() => {}}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          isOnline={isOnline}
        />
      </div>

      {/* Mobile Header Bar */}
      <header className="mobile-header" style={{ display: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            style={{ background: 'none', border: 'none', color: '#F8FAFC', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', padding: '5px', borderRadius: '6px', display: 'flex' }}>
              <Shield size={16} color="#FFFFFF" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>
              RAG INTEGRITY SHIELD
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOnline ? '#10B981' : '#38BDF8' }} />
          <span style={{ fontSize: '0.7rem', color: isOnline ? '#34D399' : '#38BDF8', fontWeight: 600 }}>
            {isOnline ? 'Online' : 'Sandbox'}
          </span>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              width: '280px',
              background: '#0B0F19',
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001,
              animation: 'slideInLeft 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 14px' }}>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Sidebar
                onNavigate={() => setMobileDrawerOpen(false)}
                onResetDemo={handleResetDemo}
                isResetting={isResetting}
                isOnline={isOnline}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Cloud Sandbox / Status Banner */}
        {!isOnline && (
          <div
            style={{
              background: 'linear-gradient(90deg, #0F172A, #1E1B4B)',
              color: '#93C5FD',
              padding: '10px 18px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              borderBottom: '1px solid #1E3A8A',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="#38BDF8" />
              <span>
                <strong>⚡ CLOUD DEMO SANDBOX:</strong> Interactive simulation with deterministic security telemetry. For live local FastAPI execution, run <code>run.bat</code>.
              </span>
            </div>
            <button
              onClick={handleRetryConnection}
              disabled={retryingConnection}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                border: '1px solid #38BDF8',
                borderRadius: '4px',
                padding: '4px 10px',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={12} className={retryingConnection ? 'animate-spin' : ''} />
              {retryingConnection ? 'Testing API...' : 'Check Live API'}
            </button>
          </div>
        )}

        {/* Dynamic Route View */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
          Three-Stage RAG Integrity Shield • Enterprise Cybersecurity Console • Closed-Loop Retroactive Demotion Architecture
        </footer>
      </div>

    </div>
  );
}

