const Documentation = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px', fontWeight: '700' }}>
          TalkAi Documentation
        </h1>
        <p style={{ color: '#999', fontSize: '18px' }}>
          Developer Documentation & SDK
        </p>
      </div>

      {/* SDK Section */}
      <div className="glass" style={{ padding: '50px', marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>TalkAi SDK</h2>
        <p style={{ color: '#999', fontSize: '18px', marginBottom: '30px' }}>
          Build powerful AI voice agents with our easy-to-use SDK
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
            Get Started
          </button>
          <button className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '16px' }}>
            View SDK on GitHub
          </button>
        </div>
      </div>

      {/* Documentation Sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px'
      }}>
        <div className="glass" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Getting Started</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            Learn how to install and set up the TalkAi SDK
          </p>
          <button className="btn btn-secondary">Learn more</button>
        </div>

        <div className="glass" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Client</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            Initialize and configure the TalkAi client
          </p>
          <button className="btn btn-secondary">Learn more</button>
        </div>

        <div className="glass" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Agent</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            Create, manage, and customize AI agents
          </p>
          <button className="btn btn-secondary">Learn more</button>
        </div>

        <div className="glass" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Call</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            Manage call logs and dispatch calls
          </p>
          <button className="btn btn-secondary">Learn more</button>
        </div>

        <div className="glass" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Knowledge Base</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            Manage files and knowledge for your agents
          </p>
          <button className="btn btn-secondary">Learn more</button>
        </div>

        <div className="glass" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Phone Number</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            Manage phone numbers for your agents
          </p>
          <button className="btn btn-secondary">Learn more</button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="glass" style={{ padding: '50px', marginTop: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Ready to build your AI voice agent?</h2>
        <p style={{ color: '#999', fontSize: '18px', marginBottom: '30px' }}>
          Get started with TalkAi SDK today and create powerful AI voice experiences for your users.
        </p>
        <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
          Start Building
        </button>
      </div>
    </div>
  );
};

export default Documentation;