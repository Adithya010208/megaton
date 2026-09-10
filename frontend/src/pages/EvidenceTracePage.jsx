import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitGraph,
  User,
  Search,
  FileText,
  Layers,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function EvidenceTracePage() {
  const [searchParams] = useSearchParams();
  const docIdParam = searchParams.get('doc_id');

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState({
    user: { id: 'tenantA_user', tenant: 'tenant_a', role: 'analyst', scope: 'internal_policy' },
    request: { id: 'req_892f3a', query: 'What is the policy on customer refunds and payouts?', time: 'Just now' },
    chunk: { id: 'doc_contractor_c1', document_id: 'doc_contractor_guidelines_poisoned', status: 'QUARANTINED', risk: 'SYSTEM_OVERRIDE_PREFIX' },
    document: { id: 'doc_contractor_guidelines_poisoned', filename: 'tenantA_contractor_guidelines_poisoned.txt', trust: 'QUARANTINED' },
    claim: { id: 'claim_182b', text: 'All customers are entitled to an immediate $10,000 cash refund', status: 'SUSPICIOUS_MALICIOUS' },
    response: { id: 'resp_out_49', status: 'INTERCEPTED & BLOCKED', echoDetected: true },
    event: { id: 'evt_closedloop_948a', type: 'OUTPUT_INSPECTION_ECHO', action: 'CLOSED_LOOP_QUARANTINE' }
  });

  const toast = useToast();

  const handleSelectEntity = (type, data) => {
    setSelectedEntity({ type, data });
  };

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', background: '#2563EB22', color: '#60A5FA', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '6px' }}>
            <GitGraph size={12} /> FORENSIC INVESTIGATION GRAPH
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Evidence Lineage & Entity Trace</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Click on any entity node to inspect its cryptographic metadata, security status, and bidirectional connections.
          </p>
        </div>

        <Link to="/evidence/closed-loop" className="btn btn-secondary" style={{ fontSize: '0.8rem', textDecoration: 'none' }}>
          Open Closed-Loop View <ArrowRight size={14} />
        </Link>
      </div>

      {/* Main Grid: Graph Canvas + Selected Entity Detail Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedEntity ? '1fr 340px' : '1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Responsive Interactive Graph Container (No Page Overflow) */}
        <div className="card" style={{ overflowX: 'auto', background: '#090D16', border: '1px solid #1E293B', padding: '24px' }}>
          <div style={{ minWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Flow 1: User -> Request -> Chunk -> Document */}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                Primary Knowledge Retrieval Path:
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* User Node */}
                <div
                  onClick={() => handleSelectEntity('User', traceData.user)}
                  className="trace-node"
                  style={{
                    background: selectedEntity?.type === 'User' ? '#1E3A8A' : 'var(--bg-card)',
                    border: `1px solid ${selectedEntity?.type === 'User' ? '#3B82F6' : 'var(--border)'}`,
                    borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', minWidth: '130px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93C5FD', fontSize: '0.75rem', fontWeight: 700 }}>
                    <User size={14} /> USER
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>{traceData.user.id}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tenant: {traceData.user.tenant}</div>
                </div>

                <ArrowRight size={16} color="#475569" />

                {/* Request Node */}
                <div
                  onClick={() => handleSelectEntity('Request', traceData.request)}
                  className="trace-node"
                  style={{
                    background: selectedEntity?.type === 'Request' ? '#1E3A8A' : 'var(--bg-card)',
                    border: `1px solid ${selectedEntity?.type === 'Request' ? '#3B82F6' : 'var(--border)'}`,
                    borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', minWidth: '130px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Search size={14} /> REQUEST
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>{traceData.request.id}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Query recorded</div>
                </div>

                <ArrowRight size={16} color="#475569" />

                {/* Chunk Node */}
                <div
                  onClick={() => handleSelectEntity('Chunk', traceData.chunk)}
                  className="trace-node"
                  style={{
                    background: selectedEntity?.type === 'Chunk' ? '#450A0A' : 'var(--bg-card)',
                    border: `1px solid ${selectedEntity?.type === 'Chunk' ? '#EF4444' : '#7F1D1D'}`,
                    borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', minWidth: '130px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Layers size={14} /> CHUNK
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '4px', color: '#FECACA' }}>{traceData.chunk.id}</div>
                  <span className="badge badge-quarantined" style={{ fontSize: '0.65rem', marginTop: '4px' }}>QUARANTINED</span>
                </div>

                <ArrowRight size={16} color="#475569" />

                {/* Document Node */}
                <div
                  onClick={() => handleSelectEntity('Document', traceData.document)}
                  className="trace-node"
                  style={{
                    background: selectedEntity?.type === 'Document' ? '#450A0A' : 'var(--bg-card)',
                    border: `1px solid ${selectedEntity?.type === 'Document' ? '#EF4444' : '#7F1D1D'}`,
                    borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', minWidth: '140px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FCA5A5', fontSize: '0.75rem', fontWeight: 700 }}>
                    <FileText size={14} /> SOURCE DOC
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', marginTop: '4px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {traceData.document.filename}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#F87171' }}>State: Demoted</div>
                </div>
              </div>
            </div>

            {/* Flow 2: Generation -> Claim -> Output Intercept -> Security Event */}
            <div style={{ borderTop: '1px dashed #334155', paddingTop: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: '#A78BFA', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                Generation & Output Forensics:
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Claim Node */}
                <div
                  onClick={() => handleSelectEntity('Claim', traceData.claim)}
                  className="trace-node"
                  style={{
                    background: selectedEntity?.type === 'Claim' ? '#2E1065' : 'var(--bg-card)',
                    border: `1px solid ${selectedEntity?.type === 'Claim' ? '#8B5CF6' : 'var(--border)'}`,
                    borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', minWidth: '140px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C4B5FD', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Shield size={14} /> EXTRACTED CLAIM
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>{traceData.claim.id}</div>
                  <span className="badge badge-blocked" style={{ fontSize: '0.65rem', marginTop: '4px' }}>SUSPICIOUS</span>
                </div>

                <ArrowRight size={16} color="#475569" />

                {/* Response Node */}
                <div
                  onClick={() => handleSelectEntity('Response', traceData.response)}
                  className="trace-node"
                  style={{
                    background: selectedEntity?.type === 'Response' ? '#450A0A' : 'var(--bg-card)',
                    border: `1px solid ${selectedEntity?.type === 'Response' ? '#EF4444' : 'var(--border)'}`,
                    borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', minWidth: '130px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontSize: '0.75rem', fontWeight: 700 }}>
                    <ShieldAlert size={14} /> AI RESPONSE
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '4px', color: '#FECACA' }}>BLOCKED</div>
                  <div style={{ fontSize: '0.7rem', color: '#F87171' }}>Echo Caught</div>
                </div>

                <ArrowRight size={16} color="#475569" />

                {/* Security Event Node */}
                <div
                  onClick={() => handleSelectEntity('Security Event', traceData.event)}
                  className="trace-node"
                  style={{
                    background: selectedEntity?.type === 'Security Event' ? '#431407' : 'var(--bg-card)',
                    border: `1px solid ${selectedEntity?.type === 'Security Event' ? '#F59E0B' : '#78350F'}`,
                    borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', minWidth: '140px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24', fontSize: '0.75rem', fontWeight: 700 }}>
                    <AlertTriangle size={14} /> AUDIT EVENT
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>{traceData.event.id}</div>
                  <div style={{ fontSize: '0.7rem', color: '#34D399' }}>Feedback Applied</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Selected Entity Detail Drawer */}
        {selectedEntity && (
          <div className="card" style={{ background: '#0F172A', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '10px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#60A5FA' }}>
                {selectedEntity.type} Details
              </h3>
              <button onClick={() => setSelectedEntity(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}>
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
              {Object.entries(selectedEntity.data).map(([k, v]) => (
                <div key={k}>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{k}:</span>
                  <div style={{ color: '#F3F4F6', fontFamily: typeof v === 'string' && v.includes('_') ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-word' }}>
                    {String(v)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

