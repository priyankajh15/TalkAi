import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './Landing';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import KnowledgeBase from './KnowledgeBase';
import PhoneNumbers from './PhoneNumbers';
import BulkCampaigns from './BulkCampaigns';
import CallLogs from './CallLogs';
import Analytics from './Analytics';
import BalancePlans from './BalancePlans';
import ApiAccess from './ApiAccess';
import Settings from './Settings';
import Documentation from './Documentation';

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
  
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
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
            <Route path="/documentation" element={
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
