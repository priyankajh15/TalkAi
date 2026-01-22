import { useState } from 'react';
import Sidebar from './Sidebar';
import HamburgerButton from './HamburgerButton';
import { useMediaQuery } from '../hooks/useMediaQuery';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHover={setDesktopSidebarExpanded}
      />
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : (desktopSidebarExpanded ? '280px' : '70px'),
        background: '#000000',
        minHeight: '100vh',
        transition: 'margin-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)', // Slower, smooth push
      }}>
        {/* Header with Hamburger - Mobile Only */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          alignItems: 'center',
          height: '80px',
          display: isMobile ? 'flex' : 'none' // Hide completely on desktop
        }}>
          <HamburgerButton
            isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;