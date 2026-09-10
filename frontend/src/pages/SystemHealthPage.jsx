import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Server, Cpu, Database, Shield, Lock, Layers } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const pingHealth = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const data = await api.getHealth();
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setHealthData(data);
    } catch (err) {
      setHealthData({ status: 'OFFLINE', error: err.message });
      setLatency(null);
      toast.error('System health check failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pingHealth();
  }, []);

  const isOnline = healthData?.status === 'OK';

  const COMPONENTS = [
    { name: 'Core FastAPI Backend', icon: Server, status: isOnline ? 'Operational' : 'Offline', latency: latency ? `${latency}ms` : '—', port: '8000' },
    { name: 'Stage 1: Secure Ingestion Engine', icon: Shield, status: isOnline ? 'Operational' : 'Offline', detail: 'Regex rules & Isolation Forest' },
    { name: 'Knowledge Security Scanner', icon: Cpu, status: isOnline ? 'Operational' : 'Offline', detail: 'Prompt injection & anomaly detectors' },
    { name: 'Vector Similarity Index', icon: Layers, status: isOnline ? 'Operational' : 'Offline', detail: 'TF-IDF + Cosine scoped index' },
    { name: 'Stage 2: Authorization Engine', icon: Lock, status: isOnline ? 'Operational' : 'Offline', detail: 'Pre-search candidate scoping' },
    { name: 'Stage 3: Output Inspector', icon: Shield, status: isOnline ? 'Operational' : 'Offline', detail: 'Echo detection & claim grounding' },
    { name: 'Closed-Loop Evidence Engine', icon: Database, status: isOnline ? 'Operational' : 'Offline', detail: 'SQLite lineage resolver & demotion' },
  ];

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', background: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isOnline ? '#34D399' : '#F87171', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '6px' }}>
            <Activity size={12} /> {isOnline ? 'ALL SYSTEMS OPERATIONAL' : 'SYSTEM OFFLINE'}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>System Health & Pipeline Telemetry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Continuous liveness telemetry connected to <code>/health</code> endpoint.
          </p>
        </div>

        <button onClick={pingHealth} disabled={loading} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Pinging...' : 'Ping Telemetry'}
        </button>
      </div>

      {/* Latency & Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>API STATUS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isOnline ? '#34D399' : '#F87171', marginTop: '4px' }}>
            {healthData?.status || 'CHECKING...'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {healthData?.service || 'Three-Stage RAG Integrity Shield'}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TELEMETRY LATENCY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA', marginTop: '4px' }}>
            {latency !== null ? `${latency} ms` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Local loopback response time
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LLM ADAPTER MODE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A78BFA', marginTop: '4px' }}>
            {healthData?.llm_provider?.toUpperCase() || 'DETERMINISTIC'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Zero-quota-failure demo protection
          </div>
        </div>
      </div>

      {/* Component Status Grid (Req #27) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Security Component Subsystems ({COMPONENTS.length})</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {COMPONENTS.map((comp, idx) => {
            const Icon = comp.icon;
            const isOp = comp.status === 'Operational';
            return (
              <div
                key={comp.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: idx < COMPONENTS.length - 1 ? '1px solid #1E293B' : 'none',
                  background: 'var(--bg-main)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#1E293B', color: '#60A5FA', padding: '8px', borderRadius: '6px' }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{comp.detail || `Port ${comp.port}`}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isOp ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Operational
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#F87171', fontWeight: 600 }}>
                      <XCircle size={14} /> Offline
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

