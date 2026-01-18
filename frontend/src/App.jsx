import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/Toast';
import { LoadingScreen } from './components';

// Lazy load all pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const VoiceAIAssistants = lazy(() => import('./pages/dashboard/VoiceAIAssistants'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const KnowledgeBase = lazy(() => import('./pages/dashboard/KnowledgeBase'));
const PhoneNumbers = lazy(() => import('./pages/dashboard/PhoneNumbers'));
const BulkCampaigns = lazy(() => import('./pages/dashboard/BulkCampaigns'));
const CallLogs = lazy(() => import('./pages/dashboard/CallLogs'));
const Analytics = lazy(() => import('./pages/dashboard/Analytics'));
const BalancePlans = lazy(() => import('./pages/dashboard/BalancePlans'));
const ApiAccess = lazy(() => import('./pages/dashboard/ApiAccess'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const Documentation = lazy(() => import('./pages/dashboard/Documentation'));

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
    return <LoadingScreen />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Suspense fallback={<LoadingScreen />}>
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
                <Navigate to="/voice-ai-assistants" />
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
          </Suspense>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
