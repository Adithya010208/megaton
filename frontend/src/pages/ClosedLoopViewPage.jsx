import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Database,
  Lock,
  Unlock,
  Layers,
  FileText,
  Play
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ClosedLoopViewPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(6);
  const toast = useToast();

  const STEPS = [
    { num: 1, title: 'Document Uploaded', desc: 'Contractor guidelines ingested with hidden prompt injection payload.' },
    { num: 2, title: 'Document Allowed', desc: 'Unvetted / initial trust state marks document retrievable.' },
    { num: 3, title: 'Document Retrieved', desc: 'Employee query on refunds retrieves poisoned contractor guidelines chunk.' },
    { num: 4, title: 'AI Generated Answer', desc: 'LLM echoes injection: promises $10,000 cash refund + phishing URL.' },
    { num: 5, title: 'Suspicious Echo Detected', desc: 'Stage 3 Output Inspector intercepts echo and blocks response.' },
    { num: 6, title: 'Source Traced', desc: 'Lineage resolver traces malicious chunk_id -> source_document_id.' },
    { num: 7, title: 'Document Quarantined', desc: 'Parent document trust_state flipped to QUARANTINED in SQLite.' },
    { num: 8, title: 'Retrieval Index Updated', desc: 'All associated chunks invalidated from pre-filtered candidate pool.' },
    { num: 9, title: 'Future Retrieval Blocked', desc: 'Subsequent queries for refunds only return legitimate $50 policy.' },
  ];

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: '1px solid #4338CA' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px' }}>
          PRIMARY INNOVATION SPOTLIGHT
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
          Closed-Loop Retroactive Quarantine
        </h1>
        <p style={{ color: '#C7D2FE', fontSize: '0.9rem', maxWidth: '760px', marginTop: '4px' }}>
          When malicious behavior is detected during generation, our system does not just block the single chat output; it traces back to the originating knowledge source, revokes its trust, and immunizes all future retrievals.
        </p>
      </div>

      {/* Requirement #22: BEFORE / AFTER QUARANTINE PANELS */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Immediate System State Impact (Requirement #22):
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          
          {/* BEFORE Panel */}
          <div className="card" style={{ background: '#130B0B', border: '1px solid #7F1D1D' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3E1313', paddingBottom: '10px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FCA5A5' }}>BEFORE QUARANTINE</h3>
              <span className="badge badge-blocked">VULNERABLE STATE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <strong style={{ color: '#F87171' }}>ALLOWED (UNVETTED)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Retrieval Availability:</span>
                <strong style={{ color: '#F87171' }}>AVAILABLE IN CANDIDATE POOL</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Affected Requests:</span>
                <strong style={{ color: '#FCA5A5' }}>3 Recent Queries Exposed</strong>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', color: '#FECACA', marginTop: '6px' }}>
                Poisoned chunk actively ranks top-1 and injects unauthorized commands into employee responses.
              </div>
            </div>
          </div>

          {/* AFTER Panel */}
          <div className="card" style={{ background: '#064E3B22', border: '1px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #047857', paddingBottom: '10px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#A7F3D0' }}>AFTER QUARANTINE</h3>
              <span className="badge badge-allowed">CONTAINED & IMMUNIZED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <strong style={{ color: '#34D399' }}>QUARANTINED (DEMOTED)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Retrieval Availability:</span>
                <strong style={{ color: '#34D399' }}>BLOCKED FROM ALL CANDIDATES</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Future Retrieval:</span>
                <strong style={{ color: '#A7F3D0' }}>PERMANENTLY PREVENTED</strong>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', color: '#A7F3D0', marginTop: '6px' }}>
                Subsequent queries cannot retrieve this source. Legitimate refund policy ($50 limit) takes over cleanly.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 9-Step Interactive Closed-Loop Sequence */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              The 9-Step Closed-Loop Execution Flow
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Click on any step below to step through the automated containment cycle.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveStepIndex((prev) => (prev % 9) + 1);
              toast.info(`Inspecting Step ${activeStepIndex}`);
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <Play size={14} /> Step Through Cycle
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {STEPS.map((step) => {
            const isSelected = activeStepIndex === step.num;
            const isCompleted = activeStepIndex > step.num;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStepIndex(step.num)}
                style={{
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-main)',
                  border: `1px solid ${isSelected ? '#3B82F6' : isCompleted ? '#059669' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: isSelected ? '#2563EB' : isCompleted ? '#059669' : '#334155',
                      color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700
                    }}
                  >
                    {step.num}
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: isSelected ? '#93C5FD' : '#F1F5F9' }}>
                    {step.title}
                  </strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

