import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faChartBar, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { aiAPI } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7');
  const [selectedBot, setSelectedBot] = useState('all');
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [assistants, setAssistants] = useState([]);
  const lastCallTimeRef = useRef(null);

  // Fetch full analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getAnalytics(dateRange, selectedBot);
      setAnalyticsData(response.data);
      lastCallTimeRef.current = response.data.chartData?.[response.data.chartData.length - 1]?.date || null;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all assistants once on mount
  const fetchAllAssistants = async () => {
    try {
      const response = await aiAPI.getAnalytics(365, 'all');
      if (response.data.assistants) {
        setAssistants(response.data.assistants);
      }
    } catch (error) {
      console.error('Failed to fetch assistants:', error);
    }
  };

  // Lightweight check for new calls
  const checkForNewCalls = async () => {
    try {
      const response = await aiAPI.getLastCallTime();
      const newLastCallTime = response.data.lastCallTime;
      
      // Store new timestamp but don't auto-refresh
      if (newLastCallTime && newLastCallTime !== lastCallTimeRef.current) {
        lastCallTimeRef.current = newLastCallTime;
        // Data changed but NOT fetching - user stays on current view
      }
    } catch (error) {
      console.error('Failed to check for new calls:', error);
    }
  };

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Initial fetch when component mounts or filters change
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedBot]);

  // Fetch all assistants once on mount
  useEffect(() => {
    fetchAllAssistants();
  }, []);

  // Smart polling - only when tab is visible
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(checkForNewCalls, 30000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Manual refresh when user changes filters
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const days = parseInt(range);
    setStartDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
  };

  const handleBotChange = (bot) => {
    setSelectedBot(bot);
  };

  const dateRangeText = () => {
    if (!startDate || !endDate) return 'Select dates';
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

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
      <div className="glass" style={{ padding: '30px', marginBottom: '30px', position: 'relative', zIndex: 10, overflow: 'visible' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`btn ${dateRange === '7' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleDateRangeChange('7')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Last 7 days
            </button>
            <button 
              className={`btn ${dateRange === '30' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleDateRangeChange('30')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Last 30 days
            </button>
            <button 
              className={`btn ${dateRange === '90' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleDateRangeChange('90')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Last 90 days
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1000 }}>
            <DatePicker
              selected={startDate}
              onChange={(dates) => {
                const [start, end] = dates;
                setStartDate(start);
                setEndDate(end);
                if (start && end) {
                  setDateRange('custom');
                }
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              monthsShown={2}
              openToDate={startDate}
              popperPlacement="bottom-start"
              popperClassName="datepicker-popper"
              customInput={
                <button style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#999',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FontAwesomeIcon icon={faCalendar} /> {dateRangeText()}
                </button>
              }
            />
          </div>
          
          <select 
            className="input" 
            value={selectedBot}
            onChange={(e) => handleBotChange(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="all">All Assistants</option>
            {assistants.map(bot => (
              <option key={bot} value={bot}>{bot}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="glass" style={{ padding: '0', marginBottom: '30px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button style={{
            padding: '20px 30px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            borderBottom: '2px solid #667eea',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Phone Call Analytics
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          Loading analytics...
        </div>
      ) : (
        <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 'clamp(15px, 3vw, 20px)',
        marginBottom: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', marginBottom: '8px', color: '#667eea' }}>
            {analyticsData?.totalCalls || 0}
          </h3>
          <p style={{ color: '#999', fontSize: '14px' }}>Total Calls Count</p>
        </div>
        
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', marginBottom: '8px', color: '#667eea' }}>
            {analyticsData?.totalDuration || '0'} min
          </h3>
          <p style={{ color: '#999', fontSize: '14px' }}>Total call duration</p>
        </div>
        
        <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', marginBottom: '8px', color: '#667eea' }}>
            {analyticsData?.avgDuration || '0'} min
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
        <div className="glass" style={{ padding: 'clamp(20px, 4vw, 40px)', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Call Volume Over Time</h3>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '30px' }}>
            Number of calls per day in the selected period
          </p>
          
          {analyticsData?.chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <LineChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#999" fontSize={12} />
                <YAxis stroke="#999" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="calls" stroke="#667eea" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
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
                <p>No call data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Call Duration Chart */}
        <div className="glass" style={{ padding: 'clamp(20px, 4vw, 40px)', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Average Call Duration</h3>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '30px' }}>
            Average duration of calls per day in minutes
          </p>
          
          {analyticsData?.chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <BarChart data={analyticsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#999" fontSize={12} />
                <YAxis stroke="#999" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                />
                <Bar dataKey="avgDuration" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
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
                <p>No duration data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;