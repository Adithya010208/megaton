import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  ArrowDown,
  GitGraph,
  RefreshCw,
  Database,
  Lock
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function SecurityEventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const res = await api.getSecurityEvent(id);
        setEvent(res);
      } catch (err) {
        toast.error('Could not load security event: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <div>Loading security audit record...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ marginBottom: '8px' }}>Security Event Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Event ID {id} does not exist in the audit log.</p>
        <Link to="/security-events" className="btn btn-secondary">Back to Event Feed</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/security-events" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Events
        </Link>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Security Events / <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{event.event_id}</span>
        </div>
      </div>

      {/* Title & Overview Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #130B0B 0%, #1A1325 100%)', border: '1px solid #7F1D1D' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', background: '#EF444422', border: '1px solid #EF4444', borderRadius: '4px', color: '#FCA5A5', fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px' }}>
              SECURITY INCIDENT AUDIT TRAIL
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
              {event.attack_type}
            </h1>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              <span>Event ID: <code style={{ color: '#93C5FD' }}>{event.event_id}</code></span>
              <span>Timestamp: <strong>{event.timestamp?.replace('T', ' ')}</strong></span>
            </div>
          </div>

          <span className="badge badge-blocked" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            ACTION: {event.action}
          </span>
        </div>
      </div>

      {/* Flagship Visual Flow: ATTACK -> EVIDENCE -> ACTION -> IMPACT -> PREVENTION */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#F8FAFC' }}>
          ATTACK → EVIDENCE → ACTION → IMPACT → PREVENTION
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Trace how the threat was caught and how closed-loop remediation permanently protected future queries.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          
          {/* Node 1: ATTACK */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid #EF4444', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldAlert size={18} color="#EF4444" />
              <strong style={{ color: '#F87171', fontSize: '0.9rem' }}>1. ATTACK INJECTION DETECTED</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
              Attack Type: <strong>{event.attack_type}</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Target Document: <code>{event.source_document_id || 'Embedded Knowledge Source'}</code> • Chunk: <code>{event.source_chunk_id || 'c1'}</code>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={18} color="#64748B" />
          </div>

          {/* Node 2: EVIDENCE */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid #F59E0B', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <AlertTriangle size={18} color="#F59E0B" />
              <strong style={{ color: '#FBBF24', fontSize: '0.9rem' }}>2. FORENSIC EVIDENCE</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#FEF3C7', background: '#1E1B18', padding: '10px 12px', borderRadius: '6px', border: '1px solid #78350F' }}>
              {event.evidence}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={18} color="#64748B" />
          </div>

          {/* Node 3: ACTION */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid #3B82F6', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Lock size={18} color="#3B82F6" />
              <strong style={{ color: '#60A5FA', fontSize: '0.9rem' }}>3. SYSTEM ACTION TAKEN</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
              Action Executed: <strong>{event.action}</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Lineage resolved to parent document in persistent SQLite database. Trust state demoted.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={18} color="#64748B" />
          </div>

          {/* Node 4: IMPACT */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid #8B5CF6', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Layers size={18} color="#8B5CF6" />
              <strong style={{ color: '#A78BFA', fontSize: '0.9rem' }}>4. ENTERPRISE IMPACT CONTAINMENT</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
              All retrieval candidate pools recalculated. No unauthorized exfiltration or false instructions delivered to downstream employees.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowDown size={18} color="#64748B" />
          </div>

          {/* Node 5: PREVENTION */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid #10B981', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle size={18} color="#10B981" />
              <strong style={{ color: '#34D399', fontSize: '0.9rem' }}>5. FUTURE RETRIEVAL PERMANENTLY BLOCKED</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#D1FAE5' }}>
              Any subsequent queries matching this document's text will exclude its chunks at candidate pre-filter time. The AI self-healed its knowledge path.
            </div>
          </div>

        </div>

        {/* Navigation Action Links */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          {event.source_document_id && (
            <Link to={`/documents/${event.source_document_id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', textDecoration: 'none' }}>
              <FileText size={14} /> View Source Document
            </Link>
          )}
          <Link to="/evidence/closed-loop" className="btn btn-primary" style={{ fontSize: '0.8rem', textDecoration: 'none' }}>
            <GitGraph size={14} /> Open Closed-Loop View
          </Link>
        </div>

      </div>

    </div>
  );
}

