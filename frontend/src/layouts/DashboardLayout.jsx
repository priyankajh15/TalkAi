import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import HamburgerButton from './HamburgerButton';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faCreditCard, faSignOutAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh'
    }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHover={setDesktopSidebarExpanded}
      />

      {/* Fixed Top Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isMobile ? 0 : (desktopSidebarExpanded ? '280px' : '70px'),
        right: 0,
        height: scrolled ? '50px' : '60px',
        background: scrolled ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
      }}>
        {/* Mobile Hamburger */}
        {isMobile && (
          <HamburgerButton
            isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Spacer for desktop */}
        {!isMobile && <div />}

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff'
            }}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '200px',
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {user?.email || 'user@example.com'}
                </div>
              </div>

              <div style={{ padding: '8px 0' }}>
                <button
                  onClick={() => {
                    navigate('/voice-ai-assistants');
                    setShowProfileDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <FontAwesomeIcon icon={faUser} style={{ width: '16px' }} />
                  Profile
                </button>

                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfileDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <FontAwesomeIcon icon={faCog} style={{ width: '16px' }} />
                  Settings
                </button>

                <button
                  onClick={() => {
                    navigate('/balance-plans');
                    setShowProfileDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <FontAwesomeIcon icon={faCreditCard} style={{ width: '16px' }} />
                  Billing
                </button>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

                <button
                  onClick={logout}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} style={{ width: '16px' }} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : (desktopSidebarExpanded ? '280px' : '70px'),
        background: '#000000',
        minHeight: '100vh',
        transition: 'margin-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
        width: isMobile ? '100%' : 'auto',
        paddingTop: scrolled ? '50px' : '60px',
        overflow: 'hidden' // Prevent content from going under sidebar
      }}>
        {/* Header with Hamburger - Mobile Only */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          alignItems: 'center',
          height: '60px',
          display: 'none', // Hidden since we have fixed top bar
          position: 'sticky',
          top: 0,
          background: '#000000',
          zIndex: 10
        }}>
          <HamburgerButton
            isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <div style={{ padding: '0 20px' }}>
          {children}
        </div>

        {/* Click outside to close dropdown */}
        {showProfileDropdown && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40
            }}
            onClick={() => setShowProfileDropdown(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;