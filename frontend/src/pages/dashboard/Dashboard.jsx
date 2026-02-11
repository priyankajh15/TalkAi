import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api, { aiAPI } from '../../services/api';
import { fadeIn } from '../../utils/animations';
import { SkeletonStats } from '../../components/Skeleton';
import { Card, Button } from '../../components';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingMessage, setLoadingMessage] = useState('Loading dashboard...');

  // Single API call for all dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      // Parallel API calls
      const [callLogsRes, knowledgeRes] = await Promise.all([
        aiAPI.getCallLogs(1, 5),
        api.get('/knowledge')
      ]);

      const callLogs = callLogsRes.data.data?.callLogs || callLogsRes.data.data || [];
      const knowledge = knowledgeRes.data.data || [];

      // Calculate stats
      const today = new Date().toDateString();
      const todayCalls = callLogs.filter(call => 
        new Date(call.startTime).toDateString() === today
      ).length;

      const successRate = callLogs.length > 0
        ? Math.round((callLogs.filter(c => c.status === 'completed').length / callLogs.length) * 100)
        : 0;

      const activeBots = [
        { name: 'Priyanshu', status: 'active', calls: callLogs.filter(c => c.botName === 'Priyanshu').length },
        { name: 'Tanmay', status: 'active', calls: callLogs.filter(c => c.botName === 'Tanmay').length },
        { name: 'Ekta', status: 'active', calls: callLogs.filter(c => c.botName === 'Ekta').length },
        { name: 'Priyanka', status: 'active', calls: callLogs.filter(c => c.botName === 'Priyanka').length }
      ];

      return {
        callLogs,
        todayCalls,
        successRate,
        totalArticles: knowledge.length,
        activeBots
      };
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

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
            <p style={{ color: '#667eea', fontSize: '14px' }}>
              {loadingMessage}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <SkeletonStats />
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: 'clamp(15px, 3vw, 20px)',
              marginBottom: '30px'
            }}>
              <Card hover style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#667eea' }}>{dashboardData?.todayCalls || 0}</h3>
                <p style={{ color: '#999' }}>Today's Calls</p>
              </Card>

              <Card hover style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#10b981' }}>{dashboardData?.successRate || 0}%</h3>
                <p style={{ color: '#999' }}>Success Rate</p>
              </Card>

              <Card hover style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#667eea' }}>
                  {dashboardData?.totalArticles || 0}
                </h3>
                <p style={{ color: '#999' }}>Knowledge Base</p>
              </Card>
            </div>

            {/* Main Content - 2 Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Left: Recent Activity */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px' }}>Recent Calls</h2>
                  <button
                    onClick={() => navigate('/call-logs')}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                  >
                    View All
                  </button>
                </div>
                {dashboardData?.callLogs?.length > 0 ? (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {dashboardData.callLogs.slice(0, 5).map(call => (
                      <div key={call._id} style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontWeight: '500', color: '#fff' }}>{call.botName}</span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: call.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: call.status === 'completed' ? '#10b981' : '#ef4444'
                          }}>
                            {call.status}
                          </span>
                        </div>
                        <div style={{ color: '#999', fontSize: '13px' }}>
                          {new Date(call.startTime).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>No calls yet</p>
                )}
              </Card>

              {/* Right: Active Bots + Quick Actions */}
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Active Bots */}
                <Card>
                  <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Active Bots</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {dashboardData?.activeBots.map(bot => (
                      <div key={bot.name} style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontWeight: '500', marginBottom: '5px', color: '#fff' }}>{bot.name}</div>
                        <div style={{ color: '#10b981', fontSize: '12px' }}>● {bot.calls} calls</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Quick Actions</h2>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <Button size="large" onClick={() => navigate('/voice-ai-assistants')}>
                      Make Call
                    </Button>
                    <Button variant="secondary" size="large" onClick={() => navigate('/analytics')}>
                      View Analytics
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;