import { useState } from 'react';
import Sidebar from './Sidebar';
import HamburgerButton from './HamburgerButton';
import { useMediaQuery } from '../hooks/useMediaQuery';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : (sidebarOpen ? '280px' : '0px'),
        background: '#000000',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header with Hamburger */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center'
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