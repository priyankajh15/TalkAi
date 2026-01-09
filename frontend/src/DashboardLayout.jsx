import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: '280px',
        background: '#000000',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;