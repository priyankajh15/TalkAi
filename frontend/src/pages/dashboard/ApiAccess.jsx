import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { fadeIn } from '../../utils/animations';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Card, Button, Modal, Input } from '../../components';

const ApiAccess = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteKeyId, setDeleteKeyId] = useState(null);
  const [apiKeyName, setApiKeyName] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleCreateKey = () => {
    // Handle API key creation
    console.log('Creating API key:', apiKeyName);
    setShowCreateModal(false);
    setApiKeyName('');
  };

  const handleDeleteKey = (keyId) => {
    setDeleteKeyId(keyId);
  };

  const confirmDeleteKey = () => {
    // Handle API key deletion
    console.log('Deleting API key:', deleteKeyId);
    setDeleteKeyId(null);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(8px, 2vw, 16px)', maxHeight: '90vh', overflowY: 'auto', ...fadeIn }}>
      {/* Header */}
      <div style={{ marginBottom: '15px' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '2px', fontWeight: '600' }}>
          API Access
        </h1>
        <p style={{ color: '#999', fontSize: '12px' }}>
          Manage your API keys and integrate with TalkAi
        </p>
      </div>

      {/* API Keys Section */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: '15px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '10px' : '0'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '2px' }}>API Keys</h2>
            <p style={{ color: '#999', fontSize: '11px' }}>
              Create and manage API keys
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Add New Key
          </Button>
        </div>

        {/* API Keys Table */}
        <div style={{ overflowX: 'auto' }}>
          {!isMobile ? (
            // Desktop Table View
            <>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 3fr 1.5fr 1fr',
                gap: '20px',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontSize: '13px',
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
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '13px' }}>TalkAi API Key</div>
                <div style={{ 
                  fontSize: '13px', 
                  fontFamily: 'monospace',
                  color: '#999'
                }}>
                  •••••••••••••••••••••••••••••••••••••••••••
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>4 days ago</div>
                <div>
                  <Button 
                    variant="secondary"
                    size="small"
                    onClick={() => handleDeleteKey('sample-key-id')}
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      color: '#ef4444'
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Mobile Card View
            <Card style={{ padding: '12px', margin: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>TalkAi API Key</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>Created 4 days ago</div>
                </div>
                <Button 
                  variant="secondary"
                  size="small"
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                  }}
                >
                  Delete
                </Button>
              </div>
              <div style={{ 
                fontSize: '13px', 
                fontFamily: 'monospace',
                color: '#999',
                background: 'rgba(255,255,255,0.05)',
                padding: '8px',
                borderRadius: '4px'
              }}>
                •••••••••••••••••••••••••••••••••••••••••••
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* API Documentation */}
      <Card>
        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>API Documentation</h2>
        <p style={{ color: '#999', marginBottom: '15px', lineHeight: '1.4', fontSize: '12px' }}>
          Learn how to integrate with our API.
        </p>
        
        <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 15px)', flexWrap: 'wrap' }}>
          <Button onClick={() => window.open('/docs', '_blank')}>
            Visit Docs
          </Button>
          <Button variant="secondary" onClick={() => window.open('https://github.com/talkai/sdk', '_blank')}>
            Visit SDK on Github
          </Button>
        </div>
      </Card>

      {/* Create API Key Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New API Key"
      >
        <p style={{ color: '#999', marginBottom: '30px', lineHeight: '1.6' }}>
          Give your API key a descriptive name to help you identify its purpose.
        </p>
        
        <Input
          placeholder="e.g., Production Integration, Mobile App, etc."
          value={apiKeyName}
          onChange={(e) => setApiKeyName(e.target.value)}
          style={{ marginBottom: '30px' }}
        />
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateKey} disabled={!apiKeyName.trim()}>
            Create API Key
          </Button>
        </div>
      </Modal>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteKeyId}
        onClose={() => setDeleteKeyId(null)}
        onConfirm={confirmDeleteKey}
        title="Delete API Key"
        message="Are you sure you want to delete this API key? This action cannot be undone and will immediately revoke access for any applications using this key."
        confirmText="Delete Key"
        isDestructive
      />
      </div>
    </DashboardLayout>
  );
};

export default ApiAccess;