import DashboardLayout from './DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';

const BulkCampaigns = () => {
  return (
    <DashboardLayout>
      <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '40px' 
      }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
            Bulk Call Campaigns
          </h1>
          <p style={{ color: '#999', fontSize: '16px' }}>
            Manage and monitor your bulk call campaigns.
          </p>
          <p style={{ color: '#667eea', fontSize: '14px', marginTop: '10px' }}>
            Total Concurrent Limit: 1
          </p>
        </div>
        <button className="btn btn-primary">
          Create New Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr 1.5fr',
          gap: '20px',
          padding: '20px 30px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          fontSize: '14px',
          fontWeight: '600',
          color: '#999'
        }}>
          <div>Name</div>
          <div>Status</div>
          <div>Bot</div>
          <div>From Number</div>
          <div>Progress</div>
          <div>Concurrent Calls</div>
          <div>Created Date</div>
        </div>

        {/* Empty State */}
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#666' }}>
            <FontAwesomeIcon icon={faBullhorn} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#999' }}>
            No bulk call campaigns found.
          </h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Try creating a new campaign to get started.
          </p>
          <button className="btn btn-primary">
            Create New Campaign
          </button>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default BulkCampaigns;