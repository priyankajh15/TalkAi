import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import DashboardLayout from './DashboardLayout';
import api from './api';

const Dashboard = () => {
  const { user } = useAuth();

  // ✅ USEQUERY: Get real-time knowledge count
  const { data: knowledgeStats } = useQuery({
    queryKey: ['knowledge-stats'],
    queryFn: async () => {
      const response = await api.get('/knowledge');
      return {
        totalArticles: response.data.data?.length || 0
      };
    }
  });

  return (
    <DashboardLayout>
      <div style={{ padding: '30px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ color: '#999', fontSize: '16px' }}>Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#667eea' }}>0</h3>
            <p style={{ color: '#999' }}>Total Calls</p>
          </div>
          
          <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#667eea' }}>
              {knowledgeStats?.totalArticles || 0}
            </h3>
            <p style={{ color: '#999' }}>Knowledge Articles</p>
          </div>
          
          <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#10b981' }}>Active</h3>
            <p style={{ color: '#999' }}>System Status</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass" style={{ padding: '30px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Quick Actions</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <button className="btn btn-primary" style={{ padding: '20px' }}>
              View Call Logs
            </button>
            
            <button className="btn btn-secondary" style={{ padding: '20px' }}>
              Manage Knowledge
            </button>
            
            <button className="btn btn-secondary" style={{ padding: '20px' }}>
              Analytics
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;