import DashboardLayout from '../../layouts/DashboardLayout';

const BalancePlans = () => {
  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
          Balance & Plans
        </h1>
        <p style={{ color: '#999', fontSize: '16px' }}>
          View your balance and choose right plan
        </p>
      </div>

      {/* Current Plan & Balance */}
      <div className="glass" style={{ padding: '40px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 'clamp(20px, 4vw, 30px)' }}>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Active Plan</h3>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#667eea', marginBottom: '10px' }}>Free</div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              <p>Basic Model Cost: <strong>$0.1 / min</strong></p>
              <p>Premium Model Cost: <strong>$0.13 / min</strong></p>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Current Balance</h3>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#10b981', marginBottom: '10px' }}>$0.275</div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              <p>2.75 Minutes left per Basic Model</p>
              <p>2.12 Minutes left per Premium Model</p>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>KB Usage</h3>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#667eea', marginBottom: '10px' }}>0 used / 5 MB</div>
            <button className="btn btn-primary" style={{ marginTop: '10px' }}>
              Top Up Credits
            </button>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>(UPI Available)</p>
          </div>
        </div>
      </div>

      {/* Voice AI Pricing */}
      <div className="glass" style={{ padding: '40px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Voice AI Pricing</h2>
        <p style={{ color: '#999', fontSize: '14px', marginBottom: '30px' }}>Billed monthly</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(15px, 3vw, 20px)' }}>
          {/* Starter */}
          <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Starter</h3>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>$5</div>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>per month</p>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>Great for quick experimentation.</p>
            
            <div style={{ marginBottom: '20px', fontSize: '14px' }}>
              <p>Basic: ~50 minutes</p>
              <p>Premium: ~38 minutes</p>
              <p style={{ color: '#999', fontSize: '12px' }}>Additional: +$0.004/min</p>
              <p style={{ color: '#999', fontSize: '12px' }}>Knowledge base: 5 MB</p>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%' }}>Upgrade</button>
          </div>

          {/* Jump Starter */}
          <div className="glass" style={{ padding: '30px', textAlign: 'center', border: '2px solid #667eea' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Jump Starter</h3>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>$20</div>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>per month</p>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>Best for building and sharing voice AI demos.</p>
            
            <div style={{ marginBottom: '20px', fontSize: '14px' }}>
              <p>Basic: ~222 minutes</p>
              <p>Premium: ~167 minutes</p>
              <p style={{ color: '#999', fontSize: '12px' }}>Additional: +$0.005/min</p>
              <p style={{ color: '#999', fontSize: '12px' }}>Knowledge base: 10 MB</p>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%' }}>Upgrade</button>
          </div>

          {/* Early Deployers */}
          <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Early Deployers</h3>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>$40</div>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>per month</p>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>Best for users doing a POC with a live voice AI agent.</p>
            
            <div style={{ marginBottom: '20px', fontSize: '14px' }}>
              <p>Basic: ~500 minutes</p>
              <p>Premium: ~364 minutes</p>
              <p style={{ color: '#999', fontSize: '12px' }}>Additional: +$0.007/min</p>
              <p style={{ color: '#999', fontSize: '12px' }}>Knowledge base: 50 MB</p>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%' }}>Upgrade</button>
          </div>

          {/* Growth */}
          <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Growth</h3>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>$200</div>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>per month</p>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>Best for users scaling post-POC voice AI usage.</p>
            
            <div style={{ marginBottom: '20px', fontSize: '14px' }}>
              <p>Basic: ~3077 minutes</p>
              <p>Premium: ~2174 minutes</p>
              <p style={{ color: '#999', fontSize: '12px' }}>Additional: +$0.009/min</p>
              <p style={{ color: '#999', fontSize: '12px' }}>Knowledge base: 100 MB</p>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%' }}>Upgrade</button>
          </div>

          {/* Enterprise */}
          <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Enterprise</h3>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>Custom</div>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>pricing</p>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>Launch at scale with volume-based discounts.</p>
            
            <div style={{ marginBottom: '20px', fontSize: '14px' }}>
              <p>Agent Training from Recording</p>
              <p>TalkAi CRM</p>
              <p>Dedicated support</p>
              <p>100+ concurrent calls</p>
            </div>
            
            <button className="btn btn-secondary" style={{ width: '100%' }}>Contact Us</button>
          </div>
        </div>
      </div>

      {/* Chatbot Pricing */}
      <div className="glass" style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Chatbot Pricing</h2>
        <p style={{ color: '#999', fontSize: '14px', marginBottom: '30px' }}>Simple per-message pricing for all plans</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(15px, 3vw, 20px)' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>Basic</h4>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>$0.006 / message</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>Premium</h4>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>$0.017 / message</p>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default BalancePlans;