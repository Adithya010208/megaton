import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  ShieldAlert,
  Search,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function OverviewPage() {
  const [summary, setSummary] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, score, evtList] = await Promise.all([
        api.getDashboardSummary(),
        api.getSecurityScore(),
        api.listSecurityEvents(6)
      ]);
      setSummary(sum);
      setScoreData(score);
      setEvents(evtList.events || []);
    } catch (err) {
      setError('Unable to load security metrics from backend.');
      toast.error('Could not fetch overview metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const totalQuarantined = summary?.trust_state_breakdown?.quarantined || 0;
  const totalBlocked = summary?.trust_state_breakdown?.blocked || 0;
  const totalAllowed = summary?.trust_state_breakdown?.allowed || 0;
  const totalDocs = summary?.total_documents || 0;
  const totalEvents = summary?.total_security_events || 0;
  const securityScore = scoreData?.overall_score || 95;

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Hero Header */}
      <div className="card hero-card" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', border: '1px solid #312E81', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366F1', borderRadius: '20px', color: '#A5B4FC', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
              <Sparkles size={14} /> ENTERPRISE RAG DEFENSE CONSOLE
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Security Overview
            </h1>
            <p style={{ color: '#C7D2FE', maxWidth: '780px', fontSize: '0.95rem', fontStyle: 'italic', fontWeight: 500 }}>
              "Secure What AI Learns From — Not Just What Users Ask."
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/demo" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <ShieldCheck size={16} />
              Open Demo Lab
            </Link>
            <button onClick={loadOverview} className="btn btn-secondary" title="Refresh metrics" aria-label="Refresh metrics">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={loadOverview} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Retry</button>
        </div>
      )}

      {/* 6 KPI Cards Grid (Responsive: 1-col on tiny mobile, 2-col on mobile, 3-col on tablet, 6-col on desktop) */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        
        {/* KPI 1: Documents Protected */}
        <div className="card kpi-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Documents Protected</span>
            <div style={{ background: '#2563EB22', color: '#60A5FA', padding: '6px', borderRadius: '6px' }}>
              <FileCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{loading ? '—' : totalDocs}</div>
          <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '4px' }}>{totalAllowed} Active & Allowed</div>
        </div>

        {/* KPI 2: Quarantined */}
        <div className="card kpi-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Quarantined</span>
            <div style={{ background: '#F59E0B22', color: '#FBBF24', padding: '6px', borderRadius: '6px' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24' }}>{loading ? '—' : totalQuarantined}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Purged from Retrieval</div>
        </div>

        {/* KPI 3: Blocked */}
        <div className="card kpi-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Blocked</span>
            <div style={{ background: '#EF444422', color: '#F87171', padding: '6px', borderRadius: '6px' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F87171' }}>{loading ? '—' : totalBlocked}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Stage 1 Ingestion Intercepts</div>
        </div>

        {/* KPI 4: Retrieval Requests */}
        <div className="card kpi-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Retrieval Requests</span>
            <div style={{ background: '#06B6D422', color: '#22D3EE', padding: '6px', borderRadius: '6px' }}>
              <Search size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{loading ? '—' : (summary?.total_chunks || 0)}</div>
          <div style={{ fontSize: '0.7rem', color: '#38BDF8', marginTop: '4px' }}>Pre-Scoped Chunks Indexed</div>
        </div>

        {/* KPI 5: Unsafe Outputs Prevented */}
        <div className="card kpi-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Unsafe Interceptions</span>
            <div style={{ background: '#8B5CF622', color: '#A78BFA', padding: '6px', borderRadius: '6px' }}>
              <Shield size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#A78BFA' }}>{loading ? '—' : totalEvents}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Audit Events Recorded</div>
        </div>

        {/* KPI 6: Security Score */}
        <div className="card kpi-card" style={{ padding: '16px', border: '1px solid #10B98144' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600, textTransform: 'uppercase' }}>Security Score</span>
            <div style={{ background: '#10B98122', color: '#34D399', padding: '6px', borderRadius: '6px' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399' }}>{loading ? '—' : `${securityScore}/100`}</div>
          <Link to="/security-score" style={{ fontSize: '0.7rem', color: '#60A5FA', marginTop: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
            View formula <ArrowRight size={10} />
          </Link>
        </div>

      </div>

      {/* Three-Stage Security Pipeline Story */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
          Three-Stage Knowledge Defense Pipeline
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Continuous protection across the entire retrieval-generation lifecycle, backed by closed-loop feedback.
        </p>

        <div className="pipeline-flow-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Stage 1 */}
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10B98122', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Secure Ingestion</h3>
              <span className="badge badge-allowed" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>ACTIVE</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
              Scans PDFs & text for indirect prompt injections, AI override patterns, lexical stuffing, and domain anomalies before chunks enter the vector pool.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Policy: <code>ALLOW</code> / <code>QUARANTINE</code> / <code>BLOCK</code>
            </div>
          </div>

          {/* Stage 2 */}
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563EB22', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>2</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Authorized Retrieval</h3>
              <span className="badge badge-allowed" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>ACTIVE</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
              Constructs candidate set strictly by tenant ID and authorized scope <em>before</em> similarity search. Zero broad retrieval; strict cross-tenant isolation.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Pre-filter: <code>tenant_id</code> + <code>role</code> + <code>trust_state='allowed'</code>
            </div>
          </div>

          {/* Stage 3 */}
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#8B5CF622', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>3</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Output Inspection</h3>
              <span className="badge badge-allowed" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>ACTIVE</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
              Inspects generated AI answers for instruction echoes, exfiltration links, and maps every factual claim directly back to supporting chunk citations.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Action: <code>SAFE</code> / <code>REVIEW</code> / <code>BLOCK/REFUSE</code>
            </div>
          </div>

        </div>
      </div>

      {/* Closed-Loop Story Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: '1px solid #4338CA' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', marginBottom: '4px' }}>
              Primary Innovation
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              Closed-Loop Retroactive Quarantine
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#C7D2FE', maxWidth: '680px', marginTop: '4px' }}>
              When a later stage detects a malicious signal from a retrieved chunk, the system traces the chunk back to its source document in SQLite, applies persistent quarantine, and excludes the source from all future retrieval.
            </p>
          </div>

          <Link to="/evidence/closed-loop" className="btn btn-primary" style={{ background: '#4F46E5', textDecoration: 'none' }}>
            Inspect Closed-Loop Trace <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Security Events Feed */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent Security Audit Events</h3>
          <Link to="/security-events" style={{ fontSize: '0.8rem', color: '#60A5FA', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all events <ArrowRight size={12} />
          </Link>
        </div>

        {/* Responsive Table / Card Container */}
        <div className="table-responsive-wrapper">
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 12px' }}>Event ID</th>
                <th style={{ padding: '8px 12px' }}>Attack Type</th>
                <th style={{ padding: '8px 12px' }}>Action</th>
                <th style={{ padding: '8px 12px' }}>Matched Evidence</th>
                <th style={{ padding: '8px 12px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.event_id} style={{ borderBottom: '1px solid #1E293B' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: '#60A5FA', fontSize: '0.8rem' }}>
                    <Link to={`/security-events/${e.event_id}`} style={{ color: '#60A5FA', textDecoration: 'none' }}>
                      {e.event_id}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{e.attack_type}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${e.action?.includes('BLOCK') ? 'badge-blocked' : e.action?.includes('QUARANTINE') ? 'badge-quarantined' : 'badge-allowed'}`}>
                      {e.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    {e.evidence}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {e.timestamp?.slice(11, 19)}
                  </td>
                </tr>
              ))}
              {events.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No security events recorded yet. Run the Demo Lab to simulate attacks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

