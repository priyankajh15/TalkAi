import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/Toast';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import VoiceAIAssistants from './pages/dashboard/VoiceAIAssistants';
import KnowledgeBase from './pages/dashboard/KnowledgeBase';
import PhoneNumbers from './pages/dashboard/PhoneNumbers';
import BulkCampaigns from './pages/dashboard/BulkCampaigns';
import CallLogs from './pages/dashboard/CallLogs';
import Analytics from './pages/dashboard/Analytics';
import BalancePlans from './pages/dashboard/BalancePlans';
import ApiAccess from './pages/dashboard/ApiAccess';
import Settings from './pages/dashboard/Settings';
import Documentation from './pages/dashboard/Documentation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="glass" style={{ padding: '40px' }}>
          Loading...
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="glass" style={{ padding: '40px' }}>
          Loading...
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password/:token" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/voice-ai-assistants" element={
              <ProtectedRoute>
                <VoiceAIAssistants />
              </ProtectedRoute>
            } />
            <Route path="/knowledge" element={
              <ProtectedRoute>
                <KnowledgeBase />
              </ProtectedRoute>
            } />
            <Route path="/phone-numbers" element={
              <ProtectedRoute>
                <PhoneNumbers />
              </ProtectedRoute>
            } />
            <Route path="/bulk-campaigns" element={
              <ProtectedRoute>
                <BulkCampaigns />
              </ProtectedRoute>
            } />
            <Route path="/call-logs" element={
              <ProtectedRoute>
                <CallLogs />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/balance-plans" element={
              <ProtectedRoute>
                <BalancePlans />
              </ProtectedRoute>
            } />
            <Route path="/api-access" element={
              <ProtectedRoute>
                <ApiAccess />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/docs" element={
              <ProtectedRoute>
                <Documentation />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
