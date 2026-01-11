import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { EmptyState } from '../../components/EmptyState';
import { Card, Button } from '../../components';
import { toast } from '../../components/Toast';

const BulkCampaigns = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleCreateCampaign = () => {
    toast.info('Campaign creation feature coming soon!');
  };
  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'flex-start',
        marginBottom: 'clamp(20px, 4vw, 40px)',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '20px' : '0'
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
        <Button onClick={handleCreateCampaign}>
          Create New Campaign
        </Button>
      </div>

      {/* Campaigns Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        {!isMobile ? (
          // Desktop Table View
          <>
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
          </>
        ) : null}

        {/* Empty State */}
        <EmptyState
          icon={faBullhorn}
          title="No campaigns yet"
          description="Create your first bulk call campaign to reach hundreds of customers automatically with AI-powered conversations."
          actionText="Create Your First Campaign"
          onAction={handleCreateCampaign}
        />
      </Card>
      </div>
    </DashboardLayout>
  );
};

export default BulkCampaigns;