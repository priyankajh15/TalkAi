import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const Settings = () => {
  const [timezone, setTimezone] = useState('America/Los_Angeles');

  const timezones = [
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (GMT+8)' },
    { value: 'Asia/Kolkata', label: 'Mumbai (GMT+5:30)' },
    { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' }
  ];

  const handleSave = () => {
    // Handle save settings
    console.log('Settings saved:', { timezone });
  };

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
          Settings
        </h1>
        <p style={{ color: '#999', fontSize: '16px' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <div className="glass" style={{ padding: '40px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>General</h2>
        <p style={{ color: '#999', marginBottom: '30px', fontSize: '14px' }}>
          Manage settings for your timezone
        </p>
        
        <div style={{ maxWidth: '400px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontSize: '16px', 
            fontWeight: '500' 
          }}>
            Timezone
          </label>
          
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="input"
            style={{ width: '100%', marginBottom: '15px' }}
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          
          <p style={{ 
            color: '#666', 
            fontSize: '14px', 
            lineHeight: '1.5',
            marginBottom: '30px'
          }}>
            This will be used for displaying dates and times throughout the application.
          </p>
          
          <button 
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="glass" style={{ padding: '40px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Account</h2>
        <p style={{ color: '#999', marginBottom: '30px', fontSize: '14px' }}>
          Manage your account information
        </p>
        
        <div style={{ display: 'grid', gap: '20px', maxWidth: '400px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Company Name
            </label>
            <input
              type="text"
              placeholder="Your Company Name"
              className="input"
              disabled
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="input"
              disabled
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />
          </div>
          
          <button className="btn btn-secondary" style={{ width: 'fit-content' }}>
            Change Password
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass" style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Notifications</h2>
        <p style={{ color: '#999', marginBottom: '30px', fontSize: '14px' }}>
          Configure how you receive notifications
        </p>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <input type="checkbox" id="email-notifications" defaultChecked />
            <label htmlFor="email-notifications" style={{ fontSize: '14px' }}>
              Email notifications for important updates
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <input type="checkbox" id="call-alerts" defaultChecked />
            <label htmlFor="call-alerts" style={{ fontSize: '14px' }}>
              Alert me when calls fail or need attention
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <input type="checkbox" id="weekly-reports" />
            <label htmlFor="weekly-reports" style={{ fontSize: '14px' }}>
              Weekly performance reports
            </label>
          </div>
          
          <button 
            className="btn btn-primary"
            style={{ width: 'fit-content', marginTop: '20px' }}
          >
            Save Notification Settings
          </button>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;