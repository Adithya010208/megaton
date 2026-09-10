import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ArrowRight, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../api/client';

export default function KillerDemoTab({ onRefreshData }) {
  const [isRunning, setIsRunning] = useState(false);
  const [demoResults, setDemoResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  const handleRunFullDemo = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await api.runKillerDemo('full');
      setDemoResults(data);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setError(err.message || 'Failed to execute killer demo');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Pitch Hero */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #111827 0%, #1E1B4B 100%)', border: '1px solid #3730A3' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366F1', borderRadius: '20px', color: '#A5B4FC', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px' }}>
              <Cpu size={14} /> PHASE 11: REHEARSABLE KILLER DEMO
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              The 4-Minute Judge Demonstration
            </h1>
            <p style={{ color: '#C7D2FE', maxWidth: '780px', fontSize: '0.925rem' }}>
              Witness how a RAG assistant is compromised through an indirect prompt injection in its knowledge documents, and how the <strong>Three-Stage RAG Integrity Shield</strong> detects, blocks, and permanently quarantines the threat via <strong>Closed-Loop Retroactive Demotion</strong>.
            </p>
          </div>

          <button
            onClick={handleRunFullDemo}
            disabled={isRunning}
            className="btn btn-primary"
            style={{ fontSize: '1rem', padding: '12px 24px', background: 'linear-gradient(135deg, #4F46E5, #2563EB)' }}
          >
            <Play size={18} className={isRunning ? 'animate-spin' : ''} />
            {isRunning ? 'Running 4-Minute Flow...' : 'Execute Full Killer Demo'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', borderRadius: '6px', color: '#FCA5A5', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* USP Hero Banner */}
      <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid #334155', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: '#2563EB22', padding: '10px', borderRadius: '50%', color: '#60A5FA' }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93C5FD' }}>
            Core Proposition / USP
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F3F4F6', fontStyle: 'italic', marginTop: '2px' }}>
            "{demoResults?.usp_banner || 'We don\'t just secure what the user asks. We secure what the AI is allowed to learn from — and if a malicious source is discovered later, our system traces it back and removes its trust.'}"
          </div>
        </div>
      </div>

      {/* 4 Demo Steps Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))', gap: '20px' }}>
        
        {/* Step A: Security OFF */}
        <div className="card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#EF444422', color: '#F87171', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>
                PART A
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security OFF: Unsafe Baseline</h3>
            </div>
            {demoResults?.part_a_security_off && (
              <span className="badge badge-blocked">
                <ShieldAlert size={12} /> VULNERABILITY EXPOSED
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            <strong>Attack Query:</strong> <em>"What is the policy on customer refunds and payouts?"</em>
          </div>

          {demoResults?.part_a_security_off ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#1C1917', border: '1px solid #7F1D1D', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 600, marginBottom: '4px' }}>
                  AI RESPONSE (COMPROMISED):
                </div>
                <div style={{ fontSize: '0.875rem', color: '#FECACA' }}>
                  {demoResults.part_a_security_off.answer}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                <span style={{ color: '#FBBF24', fontWeight: 600 }}>What Happened? </span>
                {demoResults.part_a_security_off.explanation}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', padding: '16px 0' }}>
              Click "Execute Full Killer Demo" above to run this step.
            </div>
          )}
        </div>

        {/* Step B: Security ON */}
        <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#10B98122', color: '#34D399', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>
                PART B
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security ON: 3-Stage Protection</h3>
            </div>
            {demoResults?.part_b_security_on && (
              <span className="badge badge-allowed">
                <CheckCircle2 size={12} /> SHIELD ACTIVE
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            <strong>Same Query:</strong> <em>"What is the policy on customer refunds and payouts?"</em>
          </div>

          {demoResults?.part_b_security_on ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#064E3B22', border: '1px solid #047857', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600, marginBottom: '4px' }}>
                  AI RESPONSE (GROUNDED & SECURED):
                </div>
                <div style={{ fontSize: '0.875rem', color: '#A7F3D0' }}>
                  {demoResults.part_b_security_on.answer}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                <span style={{ color: '#34D399', fontWeight: 600 }}>What Happened? </span>
                {demoResults.part_b_security_on.explanation}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', padding: '16px 0' }}>
              Click "Execute Full Killer Demo" above to run this step.
            </div>
          )}
        </div>

        {/* Step C: Closed-Loop Quarantine */}
        <div className="card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#8B5CF622', color: '#A78BFA', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>
                PART C
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Closed-Loop Retroactive Quarantine</h3>
            </div>
            {demoResults?.part_c_closed_loop && (
              <span className="badge badge-demoted">
                <RefreshCw size={12} /> CLOSED LOOP EXECUTED
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            <strong>Innovation Flow:</strong> <code>Malicious Chunk → Trace to Source Doc → Demote/Quarantine → Purge from Future Retrieval</code>
          </div>

          {demoResults?.part_c_closed_loop ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#2E106522', border: '1px solid #6D28D9', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#C4B5FD', fontWeight: 600, marginBottom: '4px' }}>
                  AUDIT LINEAGE TRACE:
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#E9D5FF', fontFamily: 'var(--font-mono)' }}>
                  Trigger Chunk: {demoResults.part_c_closed_loop.trigger_chunk}<br/>
                  Source Document: {demoResults.part_c_closed_loop.source_document}<br/>
                  Action: {demoResults.part_c_closed_loop.quarantine_result?.action} (quarantined in SQLite)
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                <span style={{ color: '#A78BFA', fontWeight: 600 }}>What Happened? </span>
                {demoResults.part_c_closed_loop.explanation}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', padding: '16px 0' }}>
              Click "Execute Full Killer Demo" above to run this step.
            </div>
          )}
        </div>

        {/* Step D: Control & Cross-Tenant */}
        <div className="card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#3B82F622', color: '#60A5FA', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>
                PART D
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Control: Legitimate & Cross-Tenant Test</h3>
            </div>
            {demoResults?.part_d_control && (
              <span className="badge badge-allowed">
                <CheckCircle2 size={12} /> ISOLATION VERIFIED
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            <strong>Queries Tested:</strong> Legitimate Refund Policy & Cross-Tenant Cyberdyne Secret
          </div>

          {demoResults?.part_d_control ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#1E293B', border: '1px solid #334155', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 600, marginBottom: '2px' }}>
                  LEGITIMATE QUERY RESPONSE:
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#E2E8F0', marginBottom: '8px' }}>
                  {demoResults.part_d_control.legitimate_answer}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 600, marginBottom: '2px' }}>
                  CROSS-TENANT ACCESS ATTEMPT RESULT:
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#FECACA' }}>
                  {demoResults.part_d_control.cross_tenant_result}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                <span style={{ color: '#60A5FA', fontWeight: 600 }}>What Happened? </span>
                {demoResults.part_d_control.explanation}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', padding: '16px 0' }}>
              Click "Execute Full Killer Demo" above to run this step.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

