import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div className="glass" style={{
        padding: '20px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>TalkAi Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Welcome back, {user?.name}</p>
        </div>
        <button 
          onClick={logout}
          className="btn btn-secondary"
        >
          Logout
        </button>
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
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Total Calls</p>
        </div>
        
        <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#667eea' }}>0</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Knowledge Articles</p>
        </div>
        
        <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '32px', marginBottom: '8px', color: '#667eea' }}>Active</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>System Status</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <Link to="/knowledge" className="btn btn-primary" style={{
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
            padding: '20px'
          }}>
            Manage Knowledge Base
          </Link>
          
          <button className="btn btn-secondary" style={{ padding: '20px' }}>
            View Call Logs
          </button>
          
          <button className="btn btn-secondary" style={{ padding: '20px' }}>
            AI Settings
          </button>
        </div>
      </div>

      {/* Company Info */}
      <div className="glass" style={{ padding: '30px', marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Company Information</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <p><strong>Company:</strong> {user?.companyId || 'Not specified'}</p>
          <p><strong>Role:</strong> {user?.role || 'company_admin'}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Status:</strong> <span style={{ color: '#10b981' }}>Active</span></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;