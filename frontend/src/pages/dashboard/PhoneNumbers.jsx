import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '../../components/EmptyState';
import { Card, Button } from '../../components';
import { toast } from '../../components/Toast';

const PhoneNumbers = () => {
  const handleImportTwilio = () => {
    toast.info('Twilio integration coming soon!');
  };
  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
          Phone Numbers
        </h1>
        <p style={{ color: '#999', fontSize: '16px' }}>
          Manage your phone numbers and attached bots
        </p>
      </div>

      {/* Get Phone Number Section */}
      <Card style={{ padding: '40px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Get Your Phone Number
        </h2>
        <p style={{ color: '#999', marginBottom: '30px', lineHeight: '1.6' }}>
          Purchase a phone number to enable voice capabilities for your agents. With a dedicated phone number, you can:
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', 
          gap: 'clamp(15px, 3vw, 20px)',
          marginBottom: '30px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Connect with Agents</h3>
            <p style={{ color: '#999', fontSize: '14px' }}>
              Assign phone numbers to your AI agents for voice interactions
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Bulk Call Campaigns</h3>
            <p style={{ color: '#999', fontSize: '14px' }}>
              Use your numbers for outbound call campaigns at scale
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 15px)', flexWrap: 'wrap' }}>
          <Button onClick={() => toast.info('Twilio integration coming soon!')}>
            Import from Twilio
          </Button>
          <Button variant="secondary" onClick={() => toast.info('Exotel integration coming soon!')}>
            Import from Exotel (Indian +91)
          </Button>
        </div>
      </Card>

      {/* Phone Numbers List */}
      <Card style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>
          Your Phone Numbers
        </h2>
        
        <EmptyState
          icon={faPhone}
          title="No phone numbers yet"
          description="Import your first phone number from Twilio or Exotel to enable voice capabilities and start making AI-powered calls."
          actionText="Import from Twilio"
          onAction={handleImportTwilio}
        />
      </Card>
      </div>
    </DashboardLayout>
  );
};

export default PhoneNumbers;