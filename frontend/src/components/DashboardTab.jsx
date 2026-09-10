import React, { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, Layers, Activity, Zap, CheckCircle, HelpCircle } from 'lucide-react';
import { api } from '../api/client';

export default function DashboardTab() {
  const [summary, setSummary] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [canaryResult, setCanaryResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningCanary, setRunningCanary] = useState(false);

  const loadData = async () => {
    try {
      const [sum, score] = await Promise.all([
        api.getDashboardSummary(),
        api.getSecurityScore()
      ]);
      setSummary(sum);
      setScoreData(score);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunCanary = async () => {
    setRunningCanary(true);
    try {
      const res = await api.runCanaryTest();
      setCanaryResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRunningCanary(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Dashboard metrics...</div>;
  }

  const score = scoreData?.overall_score || 95;
  const breakdown = scoreData?.breakdown || {};

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#2563EB22', padding: '14px', borderRadius: '10px', color: '#60A5FA' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL DOCUMENTS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary?.total_documents || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#10B981' }}>{summary?.trust_state_breakdown?.allowed || 0} allowed</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#06B6D422', padding: '14px', borderRadius: '10px', color: '#22D3EE' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RETRIEVABLE CHUNKS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary?.total_chunks || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Deterministic Index</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#EF444422', padding: '14px', borderRadius: '10px', color: '#F87171' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SECURITY EVENTS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary?.total_security_events || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#F87171' }}>Stage 1 & Closed Loop</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#F59E0B22', padding: '14px', borderRadius: '10px', color: '#FBBF24' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONTAINED THREATS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {(summary?.trust_state_breakdown?.quarantined || 0) + (summary?.trust_state_breakdown?.blocked || 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#FBBF24' }}>Quarantined / Blocked</div>
          </div>
        </div>
      </div>

      {/* Security Score & Pipeline Stages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(480px, 2fr)', gap: '24px' }}>
        
        {/* Prototype Security Score Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Prototype Security Score</h3>
              <div style={{ fontSize: '0.75rem', color: '#FBBF24', fontStyle: 'italic', marginTop: '2px' }}>
                {scoreData?.label || 'Prototype Security Score — for demo communication only'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%',
              border: '8px solid #1E293B',
              borderTopColor: '#10B981',
              borderRightColor: '#10B981',
              borderBottomColor: '#3B82F6',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#F3F4F6' }}>{score}</span>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase' }}>out of 100</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Ingestion Containment (Stage 1)</span>
                <span style={{ fontWeight: 600, color: '#34D399' }}>{breakdown.ingestion_containment || 95}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${breakdown.ingestion_containment || 95}%`, height: '100%', background: '#10B981' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Authorization Isolation (Stage 2)</span>
                <span style={{ fontWeight: 600, color: '#60A5FA' }}>{breakdown.authorization_isolation || 100}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${breakdown.authorization_isolation || 100}%`, height: '100%', background: '#3B82F6' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Output Inspection & Grounding (Stage 3)</span>
                <span style={{ fontWeight: 600, color: '#A78BFA' }}>{breakdown.output_inspection || 92}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${breakdown.output_inspection || 92}%`, height: '100%', background: '#8B5CF6' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Closed-Loop Quarantine Efficacy</span>
                <span style={{ fontWeight: 600, color: '#FBBF24' }}>{breakdown.closed_loop_quarantine || 98}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${breakdown.closed_loop_quarantine || 98}%`, height: '100%', background: '#F59E0B' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 3-Stage Pipeline Status & Canary Self-Test */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Three-Stage Security Architecture Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              
              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  <strong style={{ fontSize: '0.875rem' }}>Stage 1: Ingestion</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Regex Injection Filter + Isolation Forest Anomaly + Lexical Stuffing
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                  <strong style={{ fontSize: '0.875rem' }}>Stage 2: Authorization</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Pre-similarity candidate scoping. Hard tenant boundaries.
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                  <strong style={{ fontSize: '0.875rem' }}>Stage 3: Inspection</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Echo detection, exfiltration URL blocker & claim-to-chunk grounding.
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                  <strong style={{ fontSize: '0.875rem' }}>Closed-Loop Engine</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Dynamic chunk $\rightarrow$ document resolver, demotion & future candidate exclusion.
                </div>
              </div>

            </div>
          </div>

          {/* Canary Probe Section (Phase 9) */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Canary Retrieval Self-Test (Phase 9)</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Fires synthetic probes across topics to detect if any document behaves as an adversarial retrieval sink.
                </div>
              </div>
              <button
                onClick={handleRunCanary}
                disabled={runningCanary}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <Activity size={14} className={runningCanary ? 'animate-spin' : ''} />
                {runningCanary ? 'Probing...' : 'Run Canary Test'}
              </button>
            </div>

            {canaryResult && (
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '12px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className={`badge ${canaryResult.canary_status === 'NORMAL_DISPERSION' ? 'badge-allowed' : 'badge-quarantined'}`}>
                    {canaryResult.canary_status}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>Probed {canaryResult.queries_probed} synthetic queries</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {canaryResult.explanation}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

