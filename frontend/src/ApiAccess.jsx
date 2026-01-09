import { useState } from 'react';
import DashboardLayout from './DashboardLayout';

const ApiAccess = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('');

  const handleCreateKey = () => {
    // Handle API key creation
    setShowCreateModal(false);
    setApiKeyName('');
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
          API Access
        </h1>
        <p style={{ color: '#999', fontSize: '16px' }}>
          Manage your API keys and integrate with TalkAi
        </p>
      </div>

      {/* API Keys Section */}
      <div className="glass" style={{ padding: '40px', marginBottom: '30px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px' 
        }}>
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>API Keys</h2>
            <p style={{ color: '#999', fontSize: '14px' }}>
              Create and manage API keys for different integrations
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Add New Key
          </button>
        </div>

        {/* API Keys Table */}
        <div style={{ overflowX: 'auto' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 3fr 1.5fr 1fr',
            gap: '20px',
            padding: '15px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            fontSize: '14px',
            fontWeight: '600',
            color: '#999'
          }}>
            <div>Name</div>
            <div>API Key</div>
            <div>Created</div>
            <div>Actions</div>
          </div>

          {/* Sample API Key Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 3fr 1.5fr 1fr',
            gap: '20px',
            padding: '20px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '14px' }}>TalkAi API Key</div>
            <div style={{ 
              fontSize: '14px', 
              fontFamily: 'monospace',
              color: '#999'
            }}>
              •••••••••••••••••••••••••••••••••••••••••••
            </div>
            <div style={{ fontSize: '14px', color: '#999' }}>4 days ago</div>
            <div>
              <button 
                className="btn btn-secondary"
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div className="glass" style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>API Documentation</h2>
        <p style={{ color: '#999', marginBottom: '30px', lineHeight: '1.6' }}>
          Learn how to integrate with our API. Our API allows you to programmatically create and manage voice AI agents, access call logs, and more.
        </p>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => window.open('/docs', '_blank')}
          >
            Visit Docs
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.open('https://github.com/talkai/sdk', '_blank')}
          >
            Visit SDK on Github
          </button>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass" style={{ 
            padding: '40px', 
            maxWidth: '500px', 
            width: '90%',
            margin: '20px'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>
              Create New API Key
            </h3>
            <p style={{ color: '#999', marginBottom: '30px', lineHeight: '1.6' }}>
              Give your API key a descriptive name to help you identify its purpose.
            </p>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}>
                API Key Name
              </label>
              <input
                type="text"
                placeholder="e.g., Production Integration, Mobile App, etc."
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateKey}
                disabled={!apiKeyName.trim()}
              >
                Create API Key
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default ApiAccess;