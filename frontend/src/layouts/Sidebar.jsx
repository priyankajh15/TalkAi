import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faPhone, 
  faBullhorn, 
  faClipboardList, 
  faChartBar, 
  faCreditCard, 
  faKey, 
  faCog, 
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from '../hooks/useMediaQuery';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const menuItems = [
    {
      section: 'Voice AI Setup',
      items: [
        { path: '/knowledge', icon: faBook, label: 'Knowledge Base' }
      ]
    },
    {
      section: 'Operations & Monitoring',
      items: [
        { path: '/phone-numbers', icon: faPhone, label: 'Phone Numbers' },
        { path: '/bulk-campaigns', icon: faBullhorn, label: 'Bulk Campaigns' },
        { path: '/call-logs', icon: faClipboardList, label: 'Call Logs' },
        { path: '/analytics', icon: faChartBar, label: 'Analytics' }
      ]
    },
    {
      section: 'Account & Billing',
      items: [
        { path: '/balance-plans', icon: faCreditCard, label: 'Balance & Plans' },
        { path: '/api-access', icon: faKey, label: 'API Access' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        style={{
          width: '280px',
          height: '100vh',
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: isMobile ? (isOpen ? 0 : '-280px') : (isOpen ? 0 : '-280px'),
          top: 0,
          zIndex: 100,
          transition: 'left 0.3s ease'
        }}
      >
      {/* Logo */}
      <div style={{
        padding: '30px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Link to="/dashboard" style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'white',
          textDecoration: 'none'
        }}>
          TalkAi
        </Link>
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, padding: '20px 0' }}>
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '15px' }}>
            <div style={{
              padding: '0 20px 8px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {section.section}
            </div>
            
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobile) onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  color: location.pathname === item.path ? 'white' : '#999',
                  textDecoration: 'none',
                  background: location.pathname === item.path ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderRight: location.pathname === item.path ? '3px solid #667eea' : 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.background = 'rgba(255,255,255,0.08)';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#999';
                  }
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '16px', width: '16px', textAlign: 'center' }}>
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        ))}

        {/* Settings */}
        <div>
          <Link
            to="/settings"
            onClick={() => {
              if (isMobile) onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              color: location.pathname === '/settings' ? 'white' : '#999',
              textDecoration: 'none',
              background: location.pathname === '/settings' ? 'rgba(255,255,255,0.12)' : 'transparent',
              borderRight: location.pathname === '/settings' ? '3px solid #667eea' : 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/settings') {
                e.target.style.background = 'rgba(255,255,255,0.08)';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/settings') {
                e.target.style.background = 'transparent';
                e.target.style.color = '#999';
              }
            }}
          >
            <span style={{ marginRight: '12px', fontSize: '16px', width: '16px', textAlign: 'center' }}>
              <FontAwesomeIcon icon={faCog} />
            </span>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Settings</span>
          </Link>
        </div>

        {/* Logout */}
        <div>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.08)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#999';
            }}
          >
            <span style={{ marginRight: '12px', fontSize: '16px', width: '16px', textAlign: 'center' }}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </span>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Logout</span>
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Sidebar;