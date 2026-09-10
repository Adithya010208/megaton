import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Lock,
  Unlock,
  GitGraph,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);
  const toast = useToast();

  const loadDocument = async () => {
    setLoading(true);
    try {
      const res = await api.getDocument(id);
      setDocument(res.document);
      setChunks(res.chunks || []);
    } catch (err) {
      toast.error('Could not load document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [id]);

  const handleRescan = async () => {
    setRescanning(true);
    try {
      const res = await api.rescanDocument(id);
      setDocument(res.document);
      toast.success(`Rescan completed: ${res.stage1_scan?.action || 'UPDATED'}`);
      loadDocument();
    } catch (err) {
      toast.error('Rescan failed: ' + err.message);
    } finally {
      setRescanning(false);
    }
  };

  const handleToggleQuarantine = async () => {
    try {
      if (document.trust_state === 'quarantined') {
        await api.restoreDocument(id);
        toast.success('Document restored to allowed');
      } else {
        await api.quarantineDocument(id);
        toast.warning('Document quarantined');
      }
      loadDocument();
    } catch (err) {
      toast.error('Quarantine action failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <div>Loading document details...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ marginBottom: '8px' }}>Document Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>The requested document ID does not exist.</p>
        <Link to="/documents" className="btn btn-secondary">Back to Documents</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Back Link & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/documents" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Documents / <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{document.document_id}</span>
        </div>
      </div>

      {/* Document Overview Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ background: '#2563EB22', color: '#60A5FA', padding: '16px', borderRadius: '10px' }}>
            <FileText size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{document.filename}</h1>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>ID: <code style={{ color: '#93C5FD' }}>{document.document_id}</code></span>
              <span>Tenant: <strong style={{ color: '#60A5FA', textTransform: 'uppercase' }}>{document.tenant_id}</strong></span>
              <span>Provenance: <strong>{document.provenance}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleRescan} disabled={rescanning} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} className={rescanning ? 'animate-spin' : ''} />
            {rescanning ? 'Scanning...' : 'Rescan Stage 1'}
          </button>
          <button
            onClick={handleToggleQuarantine}
            className={`btn ${document.trust_state === 'quarantined' ? 'btn-accent' : 'btn-danger'}`}
            style={{ fontSize: '0.8rem' }}
          >
            {document.trust_state === 'quarantined' ? <Unlock size={14} /> : <Lock size={14} />}
            {document.trust_state === 'quarantined' ? 'Restore Allowed' : 'Quarantine Document'}
          </button>
          <Link to={`/evidence?doc_id=${document.document_id}`} className="btn btn-primary" style={{ fontSize: '0.8rem', textDecoration: 'none' }}>
            <GitGraph size={14} /> Trace Source
          </Link>
        </div>
      </div>

      {/* Metadata & Risk Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>TRUST STATE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${document.trust_state === 'allowed' ? 'badge-allowed' : document.trust_state === 'blocked' ? 'badge-blocked' : 'badge-quarantined'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
              {document.trust_state?.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {document.trust_state === 'allowed' ? 'Available for authorized retrieval scoping.' : 'Excluded from all similarity search candidate sets.'}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>INGESTION RISK SCORE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: document.ingestion_score > 0.5 ? '#F87171' : '#34D399' }}>
            {document.ingestion_score?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-signal composite (Injection, Anomaly, Stuffing)
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>INDEXED CHUNKS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60A5FA' }}>
            {chunks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Deterministic chunks preserving section headers
          </div>
        </div>

      </div>

      {/* Chunks Inspector */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Layers size={18} color="#60A5FA" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Indexed Document Chunks ({chunks.length})</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {chunks.map((c) => (
            <div key={c.chunk_id} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <code style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 600 }}>{c.chunk_id}</code>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Page {c.page_number}</span>
                  {c.section_title && (
                    <span style={{ fontSize: '0.75rem', color: '#CBD5E1', background: '#1E293B', padding: '2px 8px', borderRadius: '4px' }}>
                      {c.section_title}
                    </span>
                  )}
                </div>
                <span className={`badge ${c.trust_state === 'allowed' ? 'badge-allowed' : c.trust_state === 'blocked' ? 'badge-blocked' : 'badge-quarantined'}`}>
                  {c.trust_state?.toUpperCase()}
                </span>
              </div>

              {/* Risk flags */}
              {c.risk_flags && c.risk_flags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {c.risk_flags.map((flag, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#F87171', borderRadius: '4px', fontWeight: 600 }}>
                      ⚠ {flag}
                    </span>
                  ))}
                </div>
              )}

              <div className="code-block" style={{ fontSize: '0.8rem', maxHeight: '160px', overflowY: 'auto' }}>
                {c.content}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

