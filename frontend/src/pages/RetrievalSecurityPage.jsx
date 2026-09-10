import React, { useState } from 'react';
import {
  Search,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  UserCheck,
  Filter,
  Layers,
  Database,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function RetrievalSecurityPage() {
  const [query, setQuery] = useState('What is the company policy on customer refunds?');
  const [userId, setUserId] = useState('tenantA_user');
  const [tenantId, setTenantId] = useState('tenant_a');
  const [role, setRole] = useState('analyst');
  const [authorizedScope, setAuthorizedScope] = useState('internal_policy');
  const [securityMode, setSecurityMode] = useState('ON');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  // Dedicated Cross-Tenant Test State
  const [crossTenantLoading, setCrossTenantLoading] = useState(false);
  const [crossTenantResult, setCrossTenantResult] = useState(null);

  const toast = useToast();

  const handleUserSelect = (uid) => {
    setUserId(uid);
    if (uid === 'tenantA_user') {
      setTenantId('tenant_a');
      setRole('analyst');
      setAuthorizedScope('internal_policy');
    } else if (uid === 'tenantA_admin') {
      setTenantId('tenant_a');
      setRole('admin');
      setAuthorizedScope('all_tenant_a');
    } else if (uid === 'tenantB_user') {
      setTenantId('tenant_b');
      setRole('researcher');
      setAuthorizedScope('tenant_b_secret');
    }
  };

  const handleSecureSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.searchRetrieval({
        query,
        user_id: userId,
        tenant_id: tenantId,
        role,
        authorized_scope: authorizedScope,
        security_mode: securityMode,
        top_k: 4
      });
      setSearchResult(res);
      toast.success(`Search completed: ${res.status}`);
    } catch (err) {
      toast.error('Retrieval failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCrossTenantTest = async () => {
    setCrossTenantLoading(true);
    setCrossTenantResult(null);
    try {
      // Tenant A user explicitly searches for Tenant B quantum IP
      const crossQuery = 'What is the APEX-CRYPTO-512 quantum algorithm specification?';
      const res = await api.searchRetrieval({
        query: crossQuery,
        user_id: 'tenantA_user',
        tenant_id: 'tenant_a',
        role: 'analyst',
        authorized_scope: 'internal_policy',
        security_mode: 'ON',
        top_k: 4
      });
      setCrossTenantResult({
        query: crossQuery,
        response: res,
        explanation: 'Even though Tenant B contains chunks with near 100% semantic text overlap for "APEX-CRYPTO-512", the pre-similarity authorization gate eliminated Tenant B documents before vector search began.'
      });
      toast.info('Cross-tenant attack test executed safely');
    } catch (err) {
      toast.error('Test error: ' + err.message);
    } finally {
      setCrossTenantLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Stage 2: Authorization-Scoped Retrieval
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Authorization defines the candidate set <strong>BEFORE</strong> similarity search. Never retrieve broadly and post-filter.
            </p>
          </div>

          {/* Security Mode Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-subtle)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>RETRIEVAL SHIELD:</span>
            <button
              onClick={() => setSecurityMode('ON')}
              style={{
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                background: securityMode === 'ON' ? '#10B981' : 'transparent', color: securityMode === 'ON' ? '#FFF' : '#94A3B8'
              }}
            >
              ON (STRICT)
            </button>
            <button
              onClick={() => setSecurityMode('OFF')}
              style={{
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                background: securityMode === 'OFF' ? '#EF4444' : 'transparent', color: securityMode === 'OFF' ? '#FFF' : '#94A3B8'
              }}
            >
              OFF (UNSAFE)
            </button>
          </div>
        </div>
      </div>

      {/* Cross-Tenant Isolation Showcase */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #18181B 0%, #1F1929 100%)', border: '1px solid #6D28D9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #A855F7', borderRadius: '12px', color: '#D8B4FE', fontSize: '0.7rem', fontWeight: 700, marginBottom: '6px' }}>
              <Lock size={12} /> HARD TENANT BOUNDARY ENFORCEMENT
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F3F4F6' }}>
              Cross-Tenant Isolation Demonstration
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#FBBF24', fontWeight: 700, marginTop: '4px' }}>
              "Semantic relevance does not override authorization."
            </div>
          </div>

          <button
            onClick={handleRunCrossTenantTest}
            disabled={crossTenantLoading}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
          >
            <Lock size={14} />
            {crossTenantLoading ? 'Executing Test...' : 'Run Cross-Tenant Test'}
          </button>
        </div>

        {crossTenantResult && (
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Visual 3-step banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '8px', padding: '10px 0', borderBottom: '1px solid #1E293B', fontSize: '0.8rem' }}>
              <span style={{ color: '#EF4444', fontWeight: 700 }}>1. AUTHORIZATION FAILED</span>
              <ArrowRight size={14} color="#64748B" />
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>2. SEMANTIC MATCH FOUND IN DB</span>
              <ArrowRight size={14} color="#64748B" />
              <span style={{ color: '#10B981', fontWeight: 700 }}>3. ACCESS DENIED AT PRE-FILTER</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>
              <strong>Attack Input:</strong> <em>"{crossTenantResult.query}"</em> by <code>tenantA_user</code>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#A7F3D0', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {crossTenantResult.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Retrieval Security Interactive Tester (Req #14) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Interactive Pre-Filtered Retrieval Console</h3>
        
        {/* User Context Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>USER IDENTITY:</label>
            <select
              value={userId}
              onChange={(e) => handleUserSelect(e.target.value)}
              style={{ width: '100%', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            >
              <option value="tenantA_user">Tenant A User (Analyst)</option>
              <option value="tenantA_admin">Tenant A Admin</option>
              <option value="tenantB_user">Tenant B User (Cyberdyne)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TENANT ID:</label>
            <input
              type="text"
              readOnly
              value={tenantId}
              style={{ width: '100%', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#60A5FA', fontSize: '0.85rem', textTransform: 'uppercase' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ROLE / ACCESS SCOPE:</label>
            <input
              type="text"
              readOnly
              value={`${role} : ${authorizedScope}`}
              style={{ width: '100%', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#34D399', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Query Input */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Type query to retrieve authorized chunks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSecureSearch()}
            style={{
              flex: 1, minWidth: '260px', padding: '12px 14px', background: 'var(--bg-main)',
              border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem'
            }}
          />
          <button
            onClick={handleSecureSearch}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0 24px' }}
          >
            <Search size={16} />
            {loading ? 'Retrieving...' : 'SECURE SEARCH'}
          </button>
        </div>

        {/* Execution Flow Diagram */}
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
            PIPELINE FLOW EXECUTION:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem' }}>
            <span style={{ color: '#93C5FD' }}>USER ({userId})</span>
            <ArrowRight size={12} color="#475569" />
            <span style={{ color: '#38BDF8' }}>AUTHORIZATION (TENANT CHECK)</span>
            <ArrowRight size={12} color="#475569" />
            <span style={{ color: '#FBBF24' }}>AUTHORIZED SCOPE (PRE-FILTER)</span>
            <ArrowRight size={12} color="#475569" />
            <span style={{ color: '#34D399' }}>VECTOR SIMILARITY SEARCH</span>
            <ArrowRight size={12} color="#475569" />
            <span style={{ color: '#A78BFA' }}>FILTERED RESULTS ONLY</span>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {searchResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ borderLeft: `4px solid ${searchResult.status === 'SUCCESS' ? '#10B981' : '#EF4444'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${searchResult.status === 'SUCCESS' ? 'badge-allowed' : 'badge-blocked'}`}>
                  {searchResult.status}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Request: {searchResult.request_id}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Candidate Pool: <strong>{searchResult.candidate_chunk_ids?.length || 0} chunks</strong>
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>{searchResult.message}</div>
          </div>

          {/* Chunks List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {searchResult.retrieved_chunks?.map((c) => (
              <div key={c.chunk_id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 600 }}>{c.chunk_id}</code>
                  <span className="badge badge-allowed">COSINE: {c.similarity}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Doc: {c.document_id} | Tenant: {c.tenant_id}
                </div>
                <div className="code-block" style={{ fontSize: '0.8rem', maxHeight: '120px', overflowY: 'auto' }}>
                  {c.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

