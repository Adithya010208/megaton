import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Send,
  Shield,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  GitGraph,
  Sparkles,
  Layers,
  FileText,
  RotateCcw
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function RAGAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Hello! I am your enterprise RAG assistant guarded by the Three-Stage RAG Integrity Shield. Every response is dynamically verified against authorized source chunks and inspected for indirect prompt injection or instruction echoes. How can I help you today?',
      security: {
        status: 'SAFE',
        groundedClaims: '1/1',
        authorizedContext: 'Active'
      }
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [securityMode, setSecurityMode] = useState('ON');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSendMessage = async (textToSend) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || loading) return;

    const userMsgId = 'msg-' + Date.now();
    const newMessages = [...messages, { id: userMsgId, role: 'user', content: q }];
    setMessages(newMessages);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.queryRAG({
        query: q,
        user_id: 'tenantA_user',
        tenant_id: 'tenant_a',
        role: 'analyst',
        authorized_scope: 'internal_policy',
        security_mode: securityMode,
        top_k: 4
      });

      const isBlocked = res.status === 'BLOCKED' || res.inspection_result?.status === 'BLOCK/REFUSE';
      const claimsCount = res.claims?.length || 0;
      const supportedCount = res.claims?.filter((c) => c.inspection_status === 'SUPPORTED').length || 0;

      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: res.answer,
        status: res.status,
        isBlocked,
        retrievedChunks: res.retrieved_chunks,
        claims: res.claims,
        inspectionResult: res.inspection_result,
        securityEvents: res.security_events,
        security: {
          status: isBlocked ? 'BLOCKED' : res.status === 'INSUFFICIENT_CONTEXT' ? 'RESTRICTED' : 'SAFE',
          groundedClaims: `${supportedCount}/${claimsCount || 1}`,
          authorizedContext: `${res.retrieved_chunks?.length || 0} chunks`
        }
      };

      setMessages([...newMessages, aiMsg]);
      if (isBlocked) {
        toast.error('Output blocked: Instruction echo intercepted by Stage 3!');
      } else {
        toast.success('Response delivered and grounded in authorized evidence.');
      }
    } catch (err) {
      toast.error('Chat error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      
      {/* Header with Mode Toggle */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#2563EB22', color: '#60A5FA', padding: '8px', borderRadius: '8px' }}>
            <Bot size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Guarded RAG Assistant</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Stage 3 Output Inspection & Claim Grounding Active
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shield:</span>
          <button
            onClick={() => setSecurityMode(securityMode === 'ON' ? 'OFF' : 'ON')}
            style={{
              padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: securityMode === 'ON' ? '#10B981' : '#EF4444', color: '#FFF'
            }}
          >
            {securityMode === 'ON' ? 'SECURITY ON' : 'SECURITY OFF (DEMO)'}
          </button>
        </div>
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: 'var(--bg-main)' }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: m.role === 'user' ? '80%' : '90%'
            }}
          >
            {m.role === 'assistant' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: m.isBlocked ? '#EF444422' : '#2563EB22', color: m.isBlocked ? '#F87171' : '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {m.isBlocked ? <ShieldAlert size={18} /> : <Bot size={18} />}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Message Bubble */}
              <div
                style={{
                  background: m.role === 'user' ? '#1E293B' : m.isBlocked ? '#2E1010' : '#111827',
                  border: `1px solid ${m.isBlocked ? '#991B1B' : m.role === 'user' ? '#334155' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  color: m.isBlocked ? '#FECACA' : 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6'
                }}
              >
                {/* Intercepted Output Special State (Req #17) */}
                {m.isBlocked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontWeight: 800, fontSize: '0.85rem' }}>
                      <AlertTriangle size={16} /> ⚠ OUTPUT INSPECTION FAILED — RESPONSE INTERCEPTED
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#FCA5A5' }}>
                      <strong>Reason:</strong> Instruction echo detected in generated answer.
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#FCA5A5' }}>
                      <strong>Evidence:</strong> {m.inspectionResult?.evidence}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#FCA5A5' }}>
                      <strong>Action:</strong> RESPONSE BLOCKED • Closed-Loop Quarantine Triggered
                    </div>
                    <div>
                      <Link to="/evidence/closed-loop" className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '6px 12px', textDecoration: 'none', display: 'inline-flex' }}>
                        <GitGraph size={14} /> TRACE SOURCE & QUARANTINE
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>{m.content}</div>
                )}
              </div>

              {/* Security Context Metrics */}
              {m.security && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.security.status === 'SAFE' ? '#10B981' : '#EF4444' }} />
                    Output: <strong style={{ color: m.security.status === 'SAFE' ? '#34D399' : '#F87171' }}>{m.security.status}</strong>
                  </span>
                  <span>|</span>
                  <span>Grounded Claims: <strong style={{ color: '#93C5FD' }}>{m.security.groundedClaims}</strong></span>
                  <span>|</span>
                  <span>Context: <strong style={{ color: '#CBD5E1' }}>{m.security.authorizedContext}</strong></span>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', color: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Bot size={18} className="animate-spin" /> Guarding & inspecting answer...
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => handleSendMessage('What is the policy on customer refunds and payouts?')}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
        >
          ⚡ Attack: Customer Refund Injection
        </button>
        <button
          onClick={() => handleSendMessage('What are the requirements for merchandise refunds and receipts?')}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
        >
          🛡️ Legit: Refund & Receipt Rules
        </button>
        <button
          onClick={() => handleSendMessage('What is the APEX-CRYPTO-512 quantum algorithm?')}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
        >
          🔒 Cross-Tenant: Access Secret IP
        </button>
      </div>

      {/* Input Box */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{
            flex: 1, padding: '12px 16px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem'
          }}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputQuery.trim()}
          className="btn btn-primary"
          style={{ padding: '0 20px' }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
}

