import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { fadeIn } from '../../utils/animations';
import { SkeletonStats } from '../../components/Skeleton';
import { Card, Button } from '../../components';

const Dashboard = () => {
  const { user } = useAuth();
  const [loadingMessage, setLoadingMessage] = useState('Loading dashboard...');

  // ✅ USEQUERY: Get real-time knowledge count
  const { data: knowledgeStats, isLoading } = useQuery({
    queryKey: ['knowledge-stats'],
    queryFn: async () => {
      const response = await api.get('/knowledge');
      return {
        totalArticles: response.data.data?.length || 0
      };
    }
  });

  // Handle slow server message
  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setLoadingMessage('Waking up server, please wait (15-20s)...');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 30px)', ...fadeIn }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard</h1>
          {isLoading && (
            <p style={{ color: '#667eea', fontSize: '14px', animate: 'pulse 2s infinite' }}>
              {loadingMessage}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <SkeletonStats />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: 'clamp(15px, 3vw, 20px)',
            marginBottom: '30px'
          }}>
            <Card hover style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#667eea' }}>0</h3>
              <p style={{ color: '#999' }}>Total Calls</p>
            </Card>

            <Card hover style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#667eea' }}>
                {knowledgeStats?.totalArticles || 0}
              </h3>
              <p style={{ color: '#999' }}>Knowledge Articles</p>
            </Card>

            <Card hover style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#10b981' }}>Active</h3>
              <p style={{ color: '#999' }}>System Status</p>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Quick Actions</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 'clamp(10px, 2vw, 15px)'
          }}>
            <Button size="large">
              View Call Logs
            </Button>

            <Button variant="secondary" size="large">
              Manage Knowledge
            </Button>

            <Button variant="secondary" size="large">
              Analytics
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;