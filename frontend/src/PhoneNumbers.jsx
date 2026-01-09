import DashboardLayout from './DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

const PhoneNumbers = () => {
  return (
    <DashboardLayout>
      <div style={{ padding: '40px' }}>
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
      <div className="glass" style={{ padding: '40px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Get Your Phone Number
        </h2>
        <p style={{ color: '#999', marginBottom: '30px', lineHeight: '1.6' }}>
          Purchase a phone number to enable voice capabilities for your agents. With a dedicated phone number, you can:
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
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

        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-primary">
            Import from Twilio
          </button>
          <button className="btn btn-secondary">
            Import from Exotel (Indian +91)
          </button>
        </div>
      </div>

      {/* Phone Numbers List */}
      <div className="glass" style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>
          Your Phone Numbers
        </h2>
        
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#666' }}>
            <FontAwesomeIcon icon={faPhone} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#999' }}>
            No phone numbers yet
          </h3>
          <p style={{ color: '#666' }}>
            Purchase your first phone number to get started
          </p>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default PhoneNumbers;