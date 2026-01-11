import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { SkeletonTable } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';

const CallLogs = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Simulate call logs query with debounced search
  const { data: callLogs = [], isLoading } = useQuery({
    queryKey: ['call-logs', debouncedSearch],
    queryFn: async () => {
      // Simulate API call with search parameter
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [];
    }
  });
  
  const handleViewDemo = () => {
    console.log('View demo calls');
  };

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
          Call Logs
        </h1>
        <p style={{ color: '#999', fontSize: '16px' }}>
          View and analyze your call history
        </p>
      </div>

      {/* Filters Section */}
      <div className="glass" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: showFilters ? '30px' : '0',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>Filters</h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <FontAwesomeIcon 
              icon={faSearch} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#999',
                fontSize: '14px'
              }} 
            />
            <input
              type="text"
              placeholder="Search call logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '40px', width: '100%' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select className="input" style={{ width: '80px', padding: '8px' }}>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <button className="btn btn-secondary">CSV</button>
          </div>
        </div>

        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 'clamp(15px, 3vw, 20px)'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                Call Status
              </label>
              <select className="input">
                <option>All Statuses</option>
                <option>Completed</option>
                <option>Failed</option>
                <option>In Progress</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                Channel Type
              </label>
              <select className="input">
                <option>All Channels</option>
                <option>Inbound</option>
                <option>Outbound</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                Call Transferred
              </label>
              <select className="input">
                <option>All</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                Duration (Min)
              </label>
              <input type="number" placeholder="Min" className="input" />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                Duration (Max)
              </label>
              <input type="number" placeholder="Max" className="input" />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                Start Date
              </label>
              <input type="date" className="input" />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                End Date
              </label>
              <input type="date" className="input" />
            </div>
          </div>
        )}
      </div>

      {/* Call Logs Table */}
      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : (
        <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
          <h2 style={{ padding: '30px 30px 20px', fontSize: '24px', margin: 0 }}>
            Call Logs
          </h2>
          
          {!isMobile ? (
            // Desktop Table View
            <>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr',
                gap: '15px',
                padding: '15px 30px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px',
                fontWeight: '600',
                color: '#999'
              }}>
                <div>Call Date</div>
                <div>Bot Name</div>
                <div>From Number</div>
                <div>To Number</div>
                <div>Duration</div>
                <div>Call Type</div>
                <div>Status</div>
                <div>Cost</div>
                <div>Recording</div>
              </div>
            </>
          ) : null}

          {/* Empty State */}
          <EmptyState
            icon={faClipboardList}
            title="No call logs yet"
            description="Your call history will appear here once you start making calls with your AI agents. Track performance, duration, and outcomes."
            actionText="View Demo Calls"
            onAction={handleViewDemo}
          />
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default CallLogs;