const LoadingScreen = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000'
    }}>
      <div className="glass" style={{
        padding: '40px 60px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#999', fontSize: '14px' }}>Loading...</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
