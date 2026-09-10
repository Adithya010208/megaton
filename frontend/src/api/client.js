// Comprehensive API Service Client for Three-Stage RAG Integrity Shield

let isBackendOnline = true;
const listeners = new Set();

export function subscribeBackendStatus(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function updateBackendStatus(online) {
  if (isBackendOnline !== online) {
    isBackendOnline = online;
    listeners.forEach((cb) => cb(online));
  }
}

export function getIsBackendOnline() {
  return isBackendOnline;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Accept': 'application/json',
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorDetail = 'API request failed';
      try {
        const err = await response.json();
        errorDetail = err.detail || err.message || errorDetail;
      } catch (_) {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail);
    }

    updateBackendStatus(true);
    return await response.json();
  } catch (error) {
    if (
      error.name === 'TypeError' &&
      (error.message.includes('fetch') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError'))
    ) {
      updateBackendStatus(false);
      error.isNetworkError = true;
    }
    throw error;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Dashboard & Metrics
  getDashboardSummary: () => request('/api/dashboard/summary'),
  getSecurityScore: () => request('/api/dashboard/security-score'),
  runCanaryTest: () => request('/api/dashboard/canary-test'),

  // Documents
  listDocuments: (tenantId) =>
    request(`/api/documents${tenantId ? `?tenant_id=${tenantId}` : ''}`),
  getDocument: (docId) => request(`/api/documents/${docId}`),
  rescanDocument: (docId) =>
    request(`/api/documents/${docId}/rescan`, { method: 'POST' }),
  uploadDocument: (formData) =>
    request('/api/documents/upload', {
      method: 'POST',
      body: formData,
    }),

  // Retrieval Security
  searchRetrieval: (payload) =>
    request('/api/retrieval/search', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // RAG Pipeline
  queryRAG: (payload) =>
    request('/api/rag/query', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRetrievalTrace: (requestId) =>
    request(`/api/requests/${requestId}/trace`),

  // Security Events & Actions
  listSecurityEvents: (limit = 100) =>
    request(`/api/security/events?limit=${limit}`),
  getSecurityEvent: (eventId) => request(`/api/security/events/${eventId}`),
  quarantineDocument: (docId) =>
    request(`/api/security/quarantine/${docId}`, { method: 'POST' }),
  restoreDocument: (docId) =>
    request(`/api/security/restore/${docId}`, { method: 'POST' }),

  // Demo Lab & Execution
  resetDemo: () => request('/api/demo/reset', { method: 'POST' }),
  runKillerDemo: (mode = 'full') =>
    request('/api/demo/run', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),
};
