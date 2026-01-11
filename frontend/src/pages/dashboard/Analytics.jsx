import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faChartBar } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7');
  const [selectedBot, setSelectedBot] = useState('all');

  // ✅ Auto-refresh analytics every 60 seconds
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', dateRange, selectedBot],
    queryFn: async () => {
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        totalCalls: 6,
        totalDuration: '6.1 min',
        avgDuration: '1.02 min',
        totalAssistants: 0
      };
    },
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    staleTime: 30000 // Consider fresh for 30 seconds
  });

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
          Analytics
        </h1>
        <p style={{ color: '#999', fontSize: '16px' }}>
          View and analyze your call and chat performance metrics
        </p>
      </div>

      {/* Date Range & Bot Selection */}
      <div className="glass" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`btn ${dateRange === '7' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDateRange('7')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Last 7 days
            </button>
            <button 
              className={`btn ${dateRange === '30' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDateRange('30')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Last 30 days
            </button>
            <button 
              className={`btn ${dateRange === '90' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDateRange('90')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Last 90 days
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#999', fontSize: '14px' }}>Jan 02, 2026 - Jan 09, 2026</span>
          </div>
          
          <select 
            className="input" 
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="all">All Assistants</option>
            <option value="bot1">Customer Support Bot</option>
            <option value="bot2">Sales Bot</option>
          </select>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="glass" style={{ padding: '0', marginBottom: '30px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button style={{
            padding: '20px 30px',
            background: '#333',
            border: 'none',
            color: 'white',
            borderBottom: '2px solid #667eea',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Phone Call Analytics
          </button>
          <button style={{
            padding: '20px 30px',
            background: 'transparent',
            border: 'none',
            color: '#999',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Website Chatbot Analytics
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 'clamp(15px, 3vw, 20px)',
        marginBottom: '40px'
      }}>
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', marginBottom: '8px', color: '#667eea' }}>
            {analyticsData?.totalCalls || 6}
          </h3>
          <p style={{ color: '#999', fontSize: '14px' }}>Total Calls Count</p>
        </div>
        
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', marginBottom: '8px', color: '#667eea' }}>
            {analyticsData?.totalDuration || '6.1 min'}
          </h3>
          <p style={{ color: '#999', fontSize: '14px' }}>Total call duration</p>
        </div>
        
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', marginBottom: '8px', color: '#667eea' }}>
            {analyticsData?.avgDuration || '1.02 min'}
          </h3>
          <p style={{ color: '#999', fontSize: '14px' }}>Avg. Duration</p>
        </div>
        
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', marginBottom: '8px', color: '#667eea' }}>
            {analyticsData?.totalAssistants || 0}
          </h3>
          <p style={{ color: '#999', fontSize: '14px' }}>Total Assistants</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gap: '30px' }}>
        {/* Call Volume Chart */}
        <div className="glass" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Call Volume Over Time</h3>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '30px' }}>
            Number of calls per day in the selected period
          </p>
          
          <div style={{
            height: '300px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <p>Call Volume Chart</p>
              <p style={{ fontSize: '12px' }}>Chart will display real data when available</p>
            </div>
          </div>
        </div>

        {/* Call Duration Chart */}
        <div className="glass" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Average Call Duration</h3>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '30px' }}>
            Average duration of calls per day in minutes
          </p>
          
          <div style={{
            height: '300px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                <FontAwesomeIcon icon={faChartBar} />
              </div>
              <p>Call Duration Chart</p>
              <p style={{ fontSize: '12px' }}>Chart will display real data when available</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;