import { Skeleton } from './Skeleton';

export const SkeletonTestimonial = () => (
  <div className="glass" style={{ padding: 'clamp(30px, 6vw, 40px)' }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
      <Skeleton width="60px" height="60px" borderRadius="50%" style={{ marginRight: '15px' }} />
      <div style={{ flex: 1 }}>
        <Skeleton width="40%" height="20px" style={{ marginBottom: '8px' }} />
        <Skeleton width="60%" height="16px" />
      </div>
    </div>
    <Skeleton width="100%" height="80px" />
  </div>
);

export const SkeletonPricing = () => (
  <div className="glass" style={{ padding: 'clamp(30px, 6vw, 40px)', textAlign: 'center' }}>
    <Skeleton width="60%" height="24px" style={{ margin: '0 auto 20px' }} />
    <Skeleton width="80px" height="48px" style={{ margin: '0 auto 20px' }} />
    <Skeleton width="100%" height="60px" style={{ marginBottom: '20px' }} />
    <Skeleton width="120px" height="40px" borderRadius="8px" style={{ margin: '0 auto' }} />
  </div>
);

export const SkeletonBlogPost = () => (
  <div className="glass" style={{ padding: 'clamp(20px, 4vw, 30px)' }}>
    <Skeleton width="100%" height="200px" borderRadius="8px" style={{ marginBottom: '15px' }} />
    <Skeleton width="80%" height="20px" style={{ marginBottom: '10px' }} />
    <Skeleton width="100%" height="60px" style={{ marginBottom: '15px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width="100px" height="16px" />
      <Skeleton width="80px" height="32px" borderRadius="6px" />
    </div>
  </div>
);