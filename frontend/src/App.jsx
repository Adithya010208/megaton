import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import OverviewPage from './pages/OverviewPage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import RetrievalSecurityPage from './pages/RetrievalSecurityPage';
import RAGAssistantPage from './pages/RAGAssistantPage';
import SecurityEventsPage from './pages/SecurityEventsPage';
import SecurityEventDetailPage from './pages/SecurityEventDetailPage';
import EvidenceTracePage from './pages/EvidenceTracePage';
import ClosedLoopViewPage from './pages/ClosedLoopViewPage';
import DemoLabPage from './pages/DemoLabPage';
import SecurityScorePage from './pages/SecurityScorePage';
import SystemHealthPage from './pages/SystemHealthPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* Index redirects to overview */}
            <Route index element={<Navigate to="/overview" replace />} />
            
            {/* 12 Specified Page Routes */}
            <Route path="overview" element={<OverviewPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />
            <Route path="retrieval" element={<RetrievalSecurityPage />} />
            <Route path="assistant" element={<RAGAssistantPage />} />
            <Route path="security-events" element={<SecurityEventsPage />} />
            <Route path="security-events/:id" element={<SecurityEventDetailPage />} />
            <Route path="evidence" element={<EvidenceTracePage />} />
            <Route path="evidence/closed-loop" element={<ClosedLoopViewPage />} />
            <Route path="demo" element={<DemoLabPage />} />
            <Route path="security-score" element={<SecurityScorePage />} />
            <Route path="system-health" element={<SystemHealthPage />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
