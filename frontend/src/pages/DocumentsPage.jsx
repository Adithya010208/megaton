import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Eye,
  Lock,
  Unlock,
  X,
  FileCheck,
  Cpu
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');
  const [trustFilter, setTrustFilter] = useState('');
  
  // Upload modal & progression state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTenant, setUploadTenant] = useState('tenant_a');
  const [uploadStep, setUploadStep] = useState('IDLE'); // IDLE, UPLOADING, PARSING, CHUNKING, SCANNING, DECISION
  const [uploadDecision, setUploadDecision] = useState(null);
  
  const toast = useToast();

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.listDocuments(tenantFilter);
      setDocuments(res.documents || []);
    } catch (err) {
      toast.error('Failed to load documents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [tenantFilter]);

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.document_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrust = !trustFilter || doc.trust_state?.toLowerCase() === trustFilter.toLowerCase();
    return matchesSearch && matchesTrust;
  });

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const executeUploadProgression = async () => {
    if (!selectedFile) return;

    try {
      // Step 1: Uploading
      setUploadStep('UPLOADING');
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Parsing
      setUploadStep('PARSING');
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Chunking
      setUploadStep('CHUNKING');
      await new Promise((r) => setTimeout(r, 600));

      // Step 4: Scanning Stage 1
      setUploadStep('SCANNING');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('tenant_id', uploadTenant);
      formData.append('provenance', 'user_upload');
      formData.append('auto_scan', 'true');

      const res = await api.uploadDocument(formData);
      await new Promise((r) => setTimeout(r, 800));

      // Step 5: Final Decision
      setUploadStep('DECISION');
      setUploadDecision(res.stage1_scan || { action: 'ALLOW', trust_state: 'allowed' });
      toast.success(`Document uploaded & evaluated: ${res.stage1_scan?.action || 'ALLOW'}`);
      loadDocuments();
    } catch (err) {
      setUploadStep('IDLE');
      toast.error('Upload failed: ' + err.message);
    }
  };

  const resetUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
    setUploadStep('IDLE');
    setUploadDecision(null);
  };

  const handleToggleQuarantine = async (doc) => {
    try {
      if (doc.trust_state === 'quarantined') {
        await api.restoreDocument(doc.document_id);
        toast.success(`Restored ${doc.filename} to allowed`);
      } else {
        await api.quarantineDocument(doc.document_id);
        toast.warning(`Quarantined ${doc.filename}`);
      }
      loadDocuments();
    } catch (err) {
      toast.error('Action failed: ' + err.message);
    }
  };

  const renderBadge = (state) => {
    const s = state?.toLowerCase();
    if (s === 'allowed') return <span className="badge badge-allowed"><CheckCircle size={10} /> ALLOW</span>;
    if (s === 'quarantined') return <span className="badge badge-quarantined"><AlertTriangle size={10} /> QUARANTINE</span>;
    if (s === 'blocked') return <span className="badge badge-blocked"><ShieldAlert size={10} /> BLOCK</span>;
    if (s === 'demoted') return <span className="badge badge-demoted"><AlertTriangle size={10} /> DEMOTED</span>;
    return <span className="badge badge-pending">PENDING</span>;
  };

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Document Security Registry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            Manage ingested corporate documents, Stage 1 security states, and provenance metadata.
          </p>
        </div>

        <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
          <Upload size={16} />
          Upload & Secure Ingest
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 10px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by filename or document ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          />
        </div>

        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          aria-label="Filter by tenant"
        >
          <option value="">All Tenants</option>
          <option value="tenant_a">Tenant A (Acme Corp)</option>
          <option value="tenant_b">Tenant B (Cyberdyne)</option>
        </select>

        <select
          value={trustFilter}
          onChange={(e) => setTrustFilter(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          aria-label="Filter by trust state"
        >
          <option value="">All Trust States</option>
          <option value="allowed">ALLOW</option>
          <option value="quarantined">QUARANTINE</option>
          <option value="blocked">BLOCK</option>
          <option value="demoted">DEMOTED</option>
        </select>

        <button onClick={loadDocuments} className="btn btn-secondary" style={{ padding: '8px 12px' }} title="Refresh list" aria-label="Refresh document list">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Responsive Documents Table & Mobile Cards */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Desktop View Table */}
        <div className="table-responsive-wrapper">
          <table className="responsive-table desktop-only-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Document Name / ID</th>
                <th style={{ padding: '12px 16px' }}>Tenant</th>
                <th style={{ padding: '12px 16px' }}>Trust State</th>
                <th style={{ padding: '12px 16px' }}>Risk Score</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.document_id} style={{ borderBottom: '1px solid #1E293B' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.filename}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{doc.document_id}</div>
                  </td>
                  <td style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {doc.tenant_id}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {renderBadge(doc.trust_state)}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: doc.ingestion_score > 0.5 ? '#F87171' : '#34D399' }}>
                    {doc.ingestion_score?.toFixed(2) || '0.00'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link to={`/documents/${doc.document_id}`} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem', textDecoration: 'none' }}>
                        <Eye size={12} /> Inspect
                      </Link>
                      <button
                        onClick={() => handleToggleQuarantine(doc)}
                        className={`btn ${doc.trust_state === 'quarantined' ? 'btn-accent' : 'btn-danger'}`}
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      >
                        {doc.trust_state === 'quarantined' ? <Unlock size={12} /> : <Lock size={12} />}
                        {doc.trust_state === 'quarantined' ? 'Restore' : 'Quarantine'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No documents found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile-Only Stacked Cards (Auto displayed on mobile via CSS) */}
        <div className="mobile-cards-container" style={{ display: 'none', padding: '12px', gap: '12px' }}>
          {filteredDocs.map((doc) => (
            <div key={doc.document_id} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{doc.filename}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{doc.document_id}</div>
                </div>
                {renderBadge(doc.trust_state)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Tenant: <strong style={{ color: '#60A5FA', textTransform: 'uppercase' }}>{doc.tenant_id}</strong></span>
                <span>Risk Score: <strong style={{ color: doc.ingestion_score > 0.5 ? '#F87171' : '#34D399', fontFamily: 'var(--font-mono)' }}>{doc.ingestion_score?.toFixed(2) || '0.00'}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <Link to={`/documents/${doc.document_id}`} className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem', textDecoration: 'none', justifyContent: 'center' }}>
                  <Eye size={12} /> Inspect
                </Link>
                <button
                  onClick={() => handleToggleQuarantine(doc)}
                  className={`btn ${doc.trust_state === 'quarantined' ? 'btn-accent' : 'btn-danger'}`}
                  style={{ flex: 1, padding: '6px', fontSize: '0.75rem', justifyContent: 'center' }}
                >
                  {doc.trust_state === 'quarantined' ? 'Restore' : 'Quarantine'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Upload Modal with Animated Progression */}
      {uploadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', background: '#0F172A', border: '1px solid #334155', position: 'relative' }}>
            <button onClick={resetUploadModal} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} aria-label="Close upload modal">
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              Secure Document Ingestion
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Stage 1 analyzes provenance, regex instruction patterns, domain anomalies, and lexical stuffing before allowing chunks into the retrievable pool.
            </p>

            {uploadStep === 'IDLE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ASSIGN TENANT ACCESS:</label>
                  <select
                    value={uploadTenant}
                    onChange={(e) => setUploadTenant(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}
                  >
                    <option value="tenant_a">Tenant A (Acme Corp)</option>
                    <option value="tenant_b">Tenant B (Cyberdyne Systems)</option>
                  </select>
                </div>

                {/* Drag and drop zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragActive ? '#3B82F6' : '#334155'}`,
                    background: dragActive ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-main)',
                    borderRadius: '8px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('file-upload-input').click()}
                >
                  <Upload size={32} color="#60A5FA" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                    {selectedFile ? selectedFile.name : 'Drag & Drop PDF or Text file here'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports .pdf, .txt, .md files (Max 10MB)
                  </div>
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button onClick={resetUploadModal} className="btn btn-secondary">Cancel</button>
                  <button onClick={executeUploadProgression} disabled={!selectedFile} className="btn btn-primary">
                    Start Secure Ingest
                  </button>
                </div>
              </div>
            )}

            {/* Progression Animation: UPLOAD -> PARSE -> CHUNK -> SCAN -> DECISION */}
            {uploadStep !== 'IDLE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {['UPLOADING', 'PARSING', 'CHUNKING', 'SCANNING', 'DECISION'].map((step, idx) => {
                    const steps = ['UPLOADING', 'PARSING', 'CHUNKING', 'SCANNING', 'DECISION'];
                    const currentIdx = steps.indexOf(uploadStep);
                    const stepIdx = steps.indexOf(step);
                    const isDone = currentIdx > stepIdx || (uploadStep === 'DECISION' && step === 'DECISION');
                    const isCurrent = uploadStep === step;

                    return (
                      <div
                        key={step}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          background: isCurrent ? '#1E293B' : 'var(--bg-main)',
                          border: `1px solid ${isCurrent ? '#3B82F6' : '#1E293B'}`,
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isDone ? (
                            <CheckCircle size={16} color="#34D399" />
                          ) : isCurrent ? (
                            <RefreshCw size={14} color="#60A5FA" className="animate-spin" />
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{idx + 1}</span>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: isCurrent ? 700 : 500, color: isDone ? '#E2E8F0' : isCurrent ? '#60A5FA' : '#64748B' }}>
                            {step === 'UPLOADING' && '1. Uploading Document Content'}
                            {step === 'PARSING' && '2. Extracting Text & Page Metadata'}
                            {step === 'CHUNKING' && '3. Deterministic Overlapping Chunking'}
                            {step === 'SCANNING' && '4. Stage 1 Scanner (Injections & Anomaly)'}
                            {step === 'DECISION' && '5. Final Security Decision'}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                </div>

                {uploadStep === 'DECISION' && uploadDecision && (
                  <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '16px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SECURITY ACTION</span>
                      <span className={`badge ${uploadDecision.action === 'ALLOW' ? 'badge-allowed' : uploadDecision.action === 'BLOCK' ? 'badge-blocked' : 'badge-quarantined'}`}>
                        {uploadDecision.action}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#E2E8F0', marginBottom: '8px' }}>
                      {uploadDecision.evidence}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button onClick={resetUploadModal} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

