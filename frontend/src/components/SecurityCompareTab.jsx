import React, { useState } from 'react';
import { SplitSquareVertical, AlertTriangle, CheckCircle, ArrowRight, Play, FileCode } from 'lucide-react';
import { api } from '../api/client';

export default function SecurityCompareTab() {
  const [query, setQuery] = useState('What is the policy on customer refunds and payouts?');
  const [loading, setLoading] = useState(false);
  const [offResult, setOffResult] = useState(null);
  const [onResult, setOnResult] = useState(null);

  const handleRunComparison = async () => {
    setLoading(true);
    try {
      // 1. Run in Security OFF mode
      const off = await api.queryRAG({
        query,
        user_id: 'tenantA_user',
        tenant_id: 'tenant_a',
        role: 'analyst',
        authorized_scope: 'internal_policy',
        security_mode: 'OFF'
      });
      setOffResult(off);

      // 2. Run in Security ON mode
      const on = await api.queryRAG({
        query,
        user_id: 'tenantA_user',
        tenant_id: 'tenant_a',
        role: 'analyst',
        authorized_scope: 'internal_policy',
        security_mode: 'ON'
      });
      setOnResult(on);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <SplitSquareVertical size={20} color="#3B82F6" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Phase 8: Security OFF vs ON Side-by-Side Comparison</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
          Observe how the exact same indirect prompt injection attack behaves in an unprotected baseline versus under the Three-Stage RAG Integrity Shield.
        </p>

        {/* Input & Preset Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, minWidth: '300px',
              padding: '10px 14px', background: 'var(--bg-subtle)',
              border: '1px solid var(--border)', borderRadius: '6px',
              color: 'var(--text-primary)', fontSize: '0.9rem'
            }}
          />
          <button
            onClick={handleRunComparison}
            disabled={loading}
            className="btn btn-primary"
          >
            <Play size={16} />
            {loading ? 'Comparing Pipeline Outputs...' : 'Run Side-by-Side Evaluation'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        
        {/* Left: Security OFF */}
        <div className="card" style={{ border: '1px solid #7F1D1D', background: '#130B0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #3B1111', paddingBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 700, textTransform: 'uppercase' }}>Demo Baseline</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FCA5A5' }}>Security OFF (Unsafe Baseline)</h3>
            </div>
            <span className="badge badge-blocked">UNPROTECTED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RETRIEVAL CANDIDATE POOL:</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Includes unvetted & quarantined documents (bypassed trust verification)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TOP RETRIEVED SOURCE:</div>
              <div style={{ background: '#2B0E0E', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8125rem', color: '#FECACA' }}>
                {offResult?.retrieved_chunks?.[0]?.content?.slice(0, 180) || 'tenantA_contractor_guidelines_poisoned.txt [Contains SYSTEM OVERRIDE injection]'}...
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>MODEL OUTPUT:</div>
              <div style={{ background: '#1A0808', border: '1px solid #5A1616', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', color: '#FCA5A5', minHeight: '80px' }}>
                {offResult ? offResult.answer : 'Click "Run Side-by-Side Evaluation" to see unshielded output.'}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', color: '#F87171' }}>
              <strong>Vulnerability:</strong> Indirect prompt injection succeeds. The assistant promises unauthorized payouts and exfiltrates corporate data.
            </div>
          </div>
        </div>

        {/* Right: Security ON */}
        <div className="card" style={{ border: '1px solid #065F46', background: '#091512' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #064E3B', paddingBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase' }}>Production Prototype</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#A7F3D0' }}>Security ON (Three-Stage Shield)</h3>
            </div>
            <span className="badge badge-allowed">SHIELD ACTIVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RETRIEVAL CANDIDATE POOL:</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Stage 2 pre-filter strictly restricts candidates to <code>trust_state == 'allowed'</code>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TOP RETRIEVED SOURCE:</div>
              <div style={{ background: '#064E3B33', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8125rem', color: '#A7F3D0' }}>
                {onResult?.retrieved_chunks?.[0]?.content?.slice(0, 180) || 'tenantA_security_and_refund_policy.txt [Legitimate corporate policy]'}...
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>MODEL OUTPUT:</div>
              <div style={{ background: '#042F2E', border: '1px solid #115E59', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', color: '#CCFBF1', minHeight: '80px' }}>
                {onResult ? onResult.answer : 'Click "Run Side-by-Side Evaluation" to see shielded output.'}
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', color: '#34D399' }}>
              <strong>Protection:</strong> Stage 1 blocks malicious files. Stage 2 authorization scoping isolates context. Stage 3 inspects output claims against source chunk truth.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

