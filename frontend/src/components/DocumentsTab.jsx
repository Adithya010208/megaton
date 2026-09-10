import React, { useState, useEffect } from 'react';
import { FileText, Upload, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, Eye, Lock, Unlock } from 'lucide-react';
import { api } from '../api/client';

export default function DocumentsTab() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docChunks, setDocChunks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [scanningDocId, setScanningDocId] = useState(null);
  const [tenantFilter, setTenantFilter] = useState('');

  const loadDocuments = async () => {
    try {
      const res = await api.listDocuments(tenantFilter);
      setDocuments(res.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [tenantFilter]);

  const handleInspectDoc = async (docId) => {
    try {
      const res = await api.getDocument(docId);
      setSelectedDoc(res.document);
      setDocChunks(res.chunks || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRescan = async (docId) => {
    setScanningDocId(docId);
    try {
      await api.rescanDocument(docId);
      await loadDocuments();
      if (selectedDoc?.document_id === docId) {
        handleInspectDoc(docId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningDocId(null);
    }
  };

  const handleToggleQuarantine = async (doc) => {
    try {
      if (doc.trust_state === 'quarantined') {
        await api.restoreDocument(doc.document_id);
      } else {
        await api.quarantineDocument(doc.document_id);
      }
      await loadDocuments();
      if (selectedDoc?.document_id === doc.document_id) {
        handleInspectDoc(doc.document_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', tenantFilter || 'tenant_a');
    formData.append('provenance', 'user_upload');
    formData.append('auto_scan', 'true');

    setUploading(true);
    try {
      await api.uploadDocument(formData);
      await loadDocuments();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const renderBadge = (state) => {
    const s = state?.toLowerCase();
    if (s === 'allowed') return <span className="badge badge-allowed"><CheckCircle size={10} /> ALLOWED</span>;
    if (s === 'quarantined') return <span className="badge badge-quarantined"><AlertTriangle size={10} /> QUARANTINED</span>;
    if (s === 'blocked') return <span className="badge badge-blocked"><ShieldAlert size={10} /> BLOCKED</span>;
    if (s === 'demoted') return <span className="badge badge-demoted"><AlertTriangle size={10} /> DEMOTED</span>;
    return <span className="badge badge-pending">PENDING</span>;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Action Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Stage 1: Document Ingestion & Provenance</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Inspect ingested documents, provenance metadata, deterministic chunks, and Stage 1 security scan results.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            style={{ padding: '8px 12px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          >
            <option value="">All Tenants</option>
            <option value="tenant_a">Tenant A (Acme Corp)</option>
            <option value="tenant_b">Tenant B (Cyberdyne)</option>
          </select>

          <label className="btn btn-primary" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
            <Upload size={14} />
            {uploading ? 'Uploading & Scanning...' : 'Upload PDF / Text'}
            <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Main Grid: Document List + Chunk Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDoc ? '1fr 1fr' : '1fr', gap: '20px' }}>
        
        {/* Document Table */}
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Document / File</th>
                <th style={{ padding: '10px 12px' }}>Tenant</th>
                <th style={{ padding: '10px 12px' }}>Trust State</th>
                <th style={{ padding: '10px 12px' }}>Ingestion Score</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.document_id}
                  style={{
                    borderBottom: '1px solid #1E293B',
                    background: selectedDoc?.document_id === doc.document_id ? '#1E293B44' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.filename}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{doc.document_id}</div>
                  </td>
                  <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {doc.tenant_id}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {renderBadge(doc.trust_state)}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: doc.ingestion_score > 0.5 ? '#F87171' : '#34D399' }}>
                    {doc.ingestion_score ? doc.ingestion_score.toFixed(2) : '0.00'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleInspectDoc(doc.document_id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="Inspect Chunks"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleRescan(doc.document_id)}
                        disabled={scanningDocId === doc.document_id}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="Rescan Stage 1"
                      >
                        <RefreshCw size={12} className={scanningDocId === doc.document_id ? 'animate-spin' : ''} />
                      </button>
                      <button
                        onClick={() => handleToggleQuarantine(doc)}
                        className={`btn ${doc.trust_state === 'quarantined' ? 'btn-accent' : 'btn-danger'}`}
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title={doc.trust_state === 'quarantined' ? 'Restore Document' : 'Quarantine Document'}
                      >
                        {doc.trust_state === 'quarantined' ? <Unlock size={12} /> : <Lock size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Document Details & Chunks Inspector */}
        {selectedDoc && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '750px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedDoc.filename}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Provenance: {selectedDoc.provenance} | Chunks: {docChunks.length}
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                ×
              </button>
            </div>

            {/* Chunks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {docChunks.map((c) => (
                <div key={c.chunk_id} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#60A5FA' }}>
                      {c.chunk_id} (Page {c.page_number})
                    </span>
                    {renderBadge(c.trust_state)}
                  </div>

                  {c.risk_flags && c.risk_flags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {c.risk_flags.map((flag, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#EF444422', border: '1px solid #EF444455', color: '#F87171', borderRadius: '4px', fontWeight: 600 }}>
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="code-block" style={{ fontSize: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {c.content}
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

