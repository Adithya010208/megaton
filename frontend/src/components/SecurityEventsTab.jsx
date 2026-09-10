import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, RefreshCw, ArrowRight, Clock, ShieldCheck, Database } from 'lucide-react';
import { api } from '../api/client';

export default function SecurityEventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const res = await api.listSecurityEvents(100);
      setEvents(res.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const renderActionBadge = (action) => {
    const a = action?.toUpperCase();
    if (a.includes('BLOCK')) return <span className="badge badge-blocked">BLOCK</span>;
    if (a.includes('QUARANTINE')) return <span className="badge badge-quarantined">QUARANTINE</span>;
    if (a.includes('DEMOTE')) return <span className="badge badge-demoted">DEMOTE</span>;
    if (a.includes('ALLOW') || a.includes('SAFE')) return <span className="badge badge-allowed">ALLOW</span>;
    return <span className="badge badge-pending">{action}</span>;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Phase 6 & 7: Security Audit Events & Closed-Loop Lineage</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Auditable log of every detection: <strong>Attack → Matched Evidence → Mitigation Action</strong>, tracing chunk compromises back to originating documents.
          </p>
        </div>
        <button onClick={loadEvents} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Feed
        </button>
      </div>

      {/* Closed-Loop Concept Diagram */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #111827, #0B1528)', border: '1px solid #1E3A8A' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#93C5FD', marginBottom: '10px' }}>
          The Closed-Loop Feedback Flow (Primary Innovation)
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <strong>1. Ingestion / Retrieval</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Chunks processed</div>
          </div>
          <ArrowRight size={16} color="#3B82F6" />
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <strong>2. Detection Trigger</strong>
            <div style={{ color: '#F87171', fontSize: '0.7rem' }}>Malicious echo or flag caught</div>
          </div>
          <ArrowRight size={16} color="#3B82F6" />
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '6px', border: '1px solid #6366F1' }}>
            <strong>3. Lineage Resolver</strong>
            <div style={{ color: '#A5B4FC', fontSize: '0.7rem' }}>chunk_id → document_id</div>
          </div>
          <ArrowRight size={16} color="#3B82F6" />
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '6px', border: '1px solid #10B981' }}>
            <strong>4. SQLite Demotion</strong>
            <div style={{ color: '#34D399', fontSize: '0.7rem' }}>trust_state = quarantined</div>
          </div>
          <ArrowRight size={16} color="#3B82F6" />
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <strong>5. Future Exclusion</strong>
            <div style={{ color: '#60A5FA', fontSize: '0.7rem' }}>Purged from candidate pools</div>
          </div>
        </div>
      </div>

      {/* Events Feed Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 12px' }}>Event ID / Time</th>
              <th style={{ padding: '10px 12px' }}>Attack Type</th>
              <th style={{ padding: '10px 12px' }}>Action</th>
              <th style={{ padding: '10px 12px' }}>Evidence Snippet</th>
              <th style={{ padding: '10px 12px' }}>Lineage (Doc / Chunk)</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt) => (
              <tr key={evt.event_id} style={{ borderBottom: '1px solid #1E293B' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>{evt.event_id}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{evt.timestamp?.slice(0, 19).replace('T', ' ')}</div>
                </td>
                <td style={{ padding: '12px', fontWeight: 600 }}>
                  {evt.attack_type}
                </td>
                <td style={{ padding: '12px' }}>
                  {renderActionBadge(evt.action)}
                </td>
                <td style={{ padding: '12px', maxWidth: '380px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#E2E8F0', background: '#0F172A', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1E293B', wordBreak: 'break-word' }}>
                    {evt.evidence}
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <div>Doc: <span style={{ color: '#FBBF24' }}>{evt.source_document_id || 'N/A'}</span></div>
                  <div>Chunk: <span style={{ color: '#A78BFA' }}>{evt.source_chunk_id || 'N/A'}</span></div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No security events recorded yet. Run the Killer Demo or upload a poisoned document to generate events.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

