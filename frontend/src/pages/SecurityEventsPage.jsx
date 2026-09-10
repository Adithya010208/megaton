import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  FileText
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function SecurityEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const toast = useToast();

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.listSecurityEvents(100);
      setEvents(res.events || []);
    } catch (err) {
      toast.error('Failed to load security events: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Compute severity heuristically if not present in schema
  const getEventSeverity = (evt) => {
    const act = evt.action?.toUpperCase() || '';
    const type = evt.attack_type?.toUpperCase() || '';
    if (act.includes('BLOCK') || type.includes('INJECTION') || act.includes('CLOSED_LOOP')) return 'CRITICAL';
    if (act.includes('QUARANTINE')) return 'HIGH';
    if (act.includes('REVIEW') || type.includes('ANOMALY')) return 'MEDIUM';
    return 'LOW';
  };

  const getEventStage = (evt) => {
    const type = evt.attack_type?.toUpperCase() || '';
    const act = evt.action?.toUpperCase() || '';
    if (act.includes('CLOSED_LOOP')) return 'QUARANTINE';
    if (type.includes('OUTPUT') || type.includes('ECHO')) return 'OUTPUT';
    if (type.includes('CROSS_TENANT') || type.includes('RETRIEVAL')) return 'RETRIEVAL';
    return 'INGESTION';
  };

  const filteredEvents = events.filter((e) => {
    const sev = getEventSeverity(e);
    const stg = getEventStage(e);

    const matchesSearch = e.event_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.attack_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.evidence?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = !severityFilter || sev === severityFilter;
    const matchesStage = !stageFilter || stg === stageFilter;

    return matchesSearch && matchesSev && matchesStage;
  });

  const renderSeverityBadge = (sev) => {
    if (sev === 'CRITICAL') return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#7F1D1D', color: '#FECACA', fontSize: '0.7rem', fontWeight: 700 }}>CRITICAL</span>;
    if (sev === 'HIGH') return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#78350F', color: '#FDE68A', fontSize: '0.7rem', fontWeight: 700 }}>HIGH</span>;
    if (sev === 'MEDIUM') return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#1E3A8A', color: '#BFDBFE', fontSize: '0.7rem', fontWeight: 700 }}>MEDIUM</span>;
    return <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#334155', color: '#CBD5E1', fontSize: '0.7rem', fontWeight: 700 }}>LOW</span>;
  };

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Security Event Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            Real-time audit log of knowledge base tampering, prompt injections, and closed-loop containment actions.
          </p>
        </div>

        <button onClick={loadEvents} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Feed
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 10px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by event ID, attack type, or evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          />
        </div>

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          aria-label="Filter by severity"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          aria-label="Filter by security stage"
        >
          <option value="">All Stages</option>
          <option value="INGESTION">Stage 1: Ingestion</option>
          <option value="RETRIEVAL">Stage 2: Retrieval</option>
          <option value="OUTPUT">Stage 3: Output</option>
          <option value="QUARANTINE">Closed Loop Quarantine</option>
        </select>
      </div>

      {/* Events Table (Desktop) & Cards (Mobile) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
          <table className="responsive-table desktop-only-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Event ID / Time</th>
                <th style={{ padding: '12px 16px' }}>Severity</th>
                <th style={{ padding: '12px 16px' }}>Attack Type</th>
                <th style={{ padding: '12px 16px' }}>Action Taken</th>
                <th style={{ padding: '12px 16px' }}>Evidence Snippet</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Lineage</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => (
                <tr key={evt.event_id} style={{ borderBottom: '1px solid #1E293B' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <Link to={`/security-events/${evt.event_id}`} style={{ fontWeight: 600, color: '#60A5FA', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
                      {evt.event_id}
                    </Link>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {evt.timestamp?.slice(0, 19).replace('T', ' ')}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {renderSeverityBadge(getEventSeverity(evt))}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {evt.attack_type}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${evt.action?.includes('BLOCK') ? 'badge-blocked' : evt.action?.includes('QUARANTINE') ? 'badge-quarantined' : 'badge-allowed'}`}>
                      {evt.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', maxWidth: '320px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {evt.evidence}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <Link to={`/security-events/${evt.event_id}`} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}>
                      Details <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No security events found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Stacked Cards */}
        <div className="mobile-cards-container" style={{ display: 'none', padding: '12px', gap: '12px' }}>
          {filteredEvents.map((evt) => (
            <div key={evt.event_id} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#60A5FA', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {evt.event_id}
                </span>
                {renderSeverityBadge(getEventSeverity(evt))}
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{evt.attack_type}</div>
              
              <div style={{ fontSize: '0.75rem', color: '#CBD5E1', background: '#0F172A', padding: '8px', borderRadius: '4px', border: '1px solid #1E293B' }}>
                {evt.evidence}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span className={`badge ${evt.action?.includes('BLOCK') ? 'badge-blocked' : 'badge-quarantined'}`}>
                  {evt.action}
                </span>
                <Link to={`/security-events/${evt.event_id}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', textDecoration: 'none' }}>
                  Full Trace <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

