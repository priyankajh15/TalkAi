export const Skeleton = ({ height = '20px', width = '100%', borderRadius = '4px', style = {} }) => (
  <div style={{
    height,
    width,
    borderRadius,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style
  }} />
);

export const SkeletonCard = () => (
  <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
    <Skeleton width="60%" height="24px" />
    <Skeleton width="100%" height="60px" style={{ marginTop: '10px' }} />
    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
      <Skeleton width="80px" height="32px" borderRadius="6px" />
      <Skeleton width="80px" height="32px" borderRadius="6px" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="glass" style={{ padding: '20px' }}>
    <Skeleton width="40%" height="24px" style={{ marginBottom: '20px' }} />
    {[...Array(rows)].map((_, i) => (
      <div key={i} style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr 1fr 1fr', 
        gap: '20px', 
        padding: '15px 0',
        borderBottom: i < rows - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
      }}>
        <Skeleton height="16px" />
        <Skeleton height="16px" />
        <Skeleton height="16px" />
        <Skeleton height="16px" />
      </div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
    gap: 'clamp(15px, 3vw, 20px)',
    marginBottom: '30px'
  }}>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="glass" style={{ padding: '24px', textAlign: 'center' }}>
        <Skeleton width="80px" height="32px" style={{ margin: '0 auto 8px' }} />
        <Skeleton width="120px" height="16px" style={{ margin: '0 auto' }} />
      </div>
    ))}
  </div>
);