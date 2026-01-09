import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset, faClipboardList, faHandshake, faShield, faBrain, faDatabase, faChartLine, faComments, faCode, faLock } from '@fortawesome/free-solid-svg-icons';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const { user, logout } = useAuth();

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Professional Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100
      }}>
        <div style={{ fontSize: '24px', fontWeight: '700' }}>TalkAi</div>
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#features" style={{ color: '#999', textDecoration: 'none' }}>Features</a>
          <a href="#use-cases" style={{ color: '#999', textDecoration: 'none' }}>Use Cases</a>
          <a href="#pricing" style={{ color: '#999', textDecoration: 'none' }}>Pricing</a>
          <a href="#faq" style={{ color: '#999', textDecoration: 'none' }}>FAQ</a>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
              <Link to="/" onClick={(e) => { e.preventDefault(); logout(); }} className="btn btn-primary">Logout</Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#999', textDecoration: 'none' }}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 40px 60px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '20px',
          lineHeight: '1.1',
          background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Enterprise AI Communication Platform
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#999',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.5'
        }}>
          Build, deploy, and manage intelligent AI agents that handle customer interactions, support queries, and business communications with enterprise-grade security and scalability.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '50px' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" style={{
        padding: '80px 40px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            textAlign: 'center',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Built for Every Business Need
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '18px',
            marginBottom: '80px',
            maxWidth: '600px',
            margin: '0 auto 80px'
          }}>
            From customer support to sales automation, TalkAi adapts to your specific business requirements.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            <div className="glass" style={{ padding: '50px 40px' }}>
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #333 0%, #555 100%)',
                borderRadius: '16px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white'
              }}>
                <FontAwesomeIcon icon={faHeadset} />
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Customer Support</h3>
              <p style={{ color: '#999', lineHeight: '1.6', marginBottom: '20px' }}>
                Handle customer inquiries 24/7 with AI agents trained on your knowledge base. Reduce response times and improve satisfaction.
              </p>
              <ul style={{ color: '#ccc', lineHeight: '1.8' }}>
                <li>Instant query resolution</li>
                <li>Escalation to human agents</li>
                <li>Multi-language support</li>
              </ul>
            </div>

            <div className="glass" style={{ padding: '50px 40px' }}>
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #333 0%, #555 100%)',
                borderRadius: '16px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white'
              }}>
                <FontAwesomeIcon icon={faClipboardList} />
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Lead Generation</h3>
              <p style={{ color: '#999', lineHeight: '1.6', marginBottom: '20px' }}>
                Qualify leads automatically through intelligent conversations. Capture contact information and schedule appointments.
              </p>
              <ul style={{ color: '#ccc', lineHeight: '1.8' }}>
                <li>Automated lead qualification</li>
                <li>CRM integration</li>
                <li>Appointment scheduling</li>
              </ul>
            </div>

            <div className="glass" style={{ padding: '50px 40px' }}>
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #333 0%, #555 100%)',
                borderRadius: '16px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white'
              }}>
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Sales Automation</h3>
              <p style={{ color: '#999', lineHeight: '1.6', marginBottom: '20px' }}>
                Automate sales calls, follow-ups, and product demonstrations. Increase conversion rates with personalized interactions.
              </p>
              <ul style={{ color: '#ccc', lineHeight: '1.8' }}>
                <li>Automated outbound calls</li>
                <li>Product demonstrations</li>
                <li>Follow-up sequences</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" style={{
        padding: '100px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '42px',
          textAlign: 'center',
          marginBottom: '20px',
          fontWeight: '600'
        }}>
          Enterprise-Grade AI Platform
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#999',
          fontSize: '18px',
          marginBottom: '80px',
          maxWidth: '600px',
          margin: '0 auto 80px'
        }}>
          Powerful features designed for enterprise deployment and scalability.
        </p>
        
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
          }}>
          <div className="glass" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <FontAwesomeIcon icon={faShield} style={{ marginRight: '12px', fontSize: '18px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '20px' }}>Multi-Tenant Architecture</h3>
            </div>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              Complete company isolation with role-based access control. Each organization gets their own secure environment.
            </p>
          </div>

          <div className="glass" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <FontAwesomeIcon icon={faDatabase} style={{ marginRight: '12px', fontSize: '18px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '20px' }}>Advanced Knowledge Base</h3>
            </div>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              Dynamic knowledge management with real-time updates. Train your AI agents with company-specific information.
            </p>
          </div>

          <div className="glass" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '12px', fontSize: '18px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '20px' }}>Call Analytics & Logging</h3>
            </div>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              Comprehensive call tracking, performance metrics, and detailed analytics for continuous improvement.
            </p>
          </div>

          <div className="glass" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <FontAwesomeIcon icon={faComments} style={{ marginRight: '12px', fontSize: '18px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '20px' }}>Voice & Text Integration</h3>
            </div>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              Seamless speech-to-text and text-to-speech capabilities with natural language processing.
            </p>
          </div>

          <div className="glass" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <FontAwesomeIcon icon={faCode} style={{ marginRight: '12px', fontSize: '18px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '20px' }}>API-First Design</h3>
            </div>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              RESTful APIs for easy integration with existing systems, CRMs, and business tools.
            </p>
          </div>

          <div className="glass" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <FontAwesomeIcon icon={faLock} style={{ marginRight: '12px', fontSize: '18px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '20px' }}>Enterprise Security</h3>
            </div>
            <p style={{ color: '#999', lineHeight: '1.6' }}>
              JWT authentication, data encryption, and compliance with enterprise security standards.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '100px 40px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            textAlign: 'center',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            Simple Setup Process
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '18px',
            marginBottom: '80px'
          }}>
            Get your AI communication system running in minutes, not months.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '50px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #333 0%, #555 100%)',
                borderRadius: '50%',
                margin: '0 auto 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: '700',
                color: 'white'
              }}>1</div>
              <h3 style={{ marginBottom: '20px', fontSize: '22px' }}>Create Account</h3>
              <p style={{ color: '#999', lineHeight: '1.6' }}>
                Sign up and set up your company profile. Configure user roles and permissions for your team.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #333 0%, #555 100%)',
                borderRadius: '50%',
                margin: '0 auto 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: '700',
                color: 'white'
              }}>2</div>
              <h3 style={{ marginBottom: '20px', fontSize: '22px' }}>Build Knowledge Base</h3>
              <p style={{ color: '#999', lineHeight: '1.6' }}>
                Upload your business information, FAQs, and procedures. Train your AI agents with company-specific data.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #333 0%, #555 100%)',
                borderRadius: '50%',
                margin: '0 auto 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: '700',
                color: 'white'
              }}>3</div>
              <h3 style={{ marginBottom: '20px', fontSize: '22px' }}>Deploy & Monitor</h3>
              <p style={{ color: '#999', lineHeight: '1.6' }}>
                Launch your AI agents and monitor performance with real-time analytics and detailed reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{
        padding: '100px 40px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            textAlign: 'center',
            marginBottom: '60px',
            fontWeight: '600'
          }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleFaq(0)}
                style={{
                  padding: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: openFaq === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <h3 style={{ fontSize: '18px', margin: 0 }}>How quickly can I deploy TalkAi?</h3>
                <div style={{
                  transform: openFaq === 0 ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  fontSize: '20px'
                }}>▼</div>
              </div>
              {openFaq === 0 && (
                <div style={{ padding: '0 30px 30px', color: '#999', lineHeight: '1.6' }}>
                  Most customers are up and running within 24 hours. The setup process involves creating your account, uploading your knowledge base, and configuring your AI agents.
                </div>
              )}
            </div>

            <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleFaq(1)}
                style={{
                  padding: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: openFaq === 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <h3 style={{ fontSize: '18px', margin: 0 }}>Do I need technical knowledge to use TalkAi?</h3>
                <div style={{
                  transform: openFaq === 1 ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  fontSize: '20px'
                }}>▼</div>
              </div>
              {openFaq === 1 && (
                <div style={{ padding: '0 30px 30px', color: '#999', lineHeight: '1.6' }}>
                  No technical expertise required. Our intuitive dashboard allows you to manage knowledge bases, monitor calls, and configure settings through a user-friendly interface.
                </div>
              )}
            </div>

            <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleFaq(2)}
                style={{
                  padding: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: openFaq === 2 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <h3 style={{ fontSize: '18px', margin: 0 }}>Can TalkAi integrate with my existing systems?</h3>
                <div style={{
                  transform: openFaq === 2 ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  fontSize: '20px'
                }}>▼</div>
              </div>
              {openFaq === 2 && (
                <div style={{ padding: '0 30px 30px', color: '#999', lineHeight: '1.6' }}>
                  Yes, TalkAi provides RESTful APIs for seamless integration with CRMs, helpdesk systems, and other business tools. We also offer custom integration support for enterprise clients.
                </div>
              )}
            </div>

            <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleFaq(3)}
                style={{
                  padding: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: openFaq === 3 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <h3 style={{ fontSize: '18px', margin: 0 }}>What kind of security measures are in place?</h3>
                <div style={{
                  transform: openFaq === 3 ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  fontSize: '20px'
                }}>▼</div>
              </div>
              {openFaq === 3 && (
                <div style={{ padding: '0 30px 30px', color: '#999', lineHeight: '1.6' }}>
                  TalkAi implements enterprise-grade security including JWT authentication, data encryption, multi-tenant isolation, and compliance with industry security standards.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '42px',
          marginBottom: '24px',
          fontWeight: '600'
        }}>
          Ready to Transform Your Business Communications?
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#999',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Join forward-thinking companies using TalkAi to automate and enhance their customer interactions with enterprise-grade AI technology.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '18px 36px', fontSize: '18px' }}>
            Get Started Today
          </Link>
          <button className="btn btn-secondary" style={{ padding: '18px 36px', fontSize: '18px' }}>
            Contact Sales
          </button>
        </div>
      </section>

      {/* Professional Footer */}
      <footer style={{
        padding: '60px 40px 40px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>TalkAi</div>
              <p style={{ color: '#999', lineHeight: '1.6' }}>
                Enterprise AI Communication Platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '20px', fontSize: '16px' }}>Product</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                <a href="#features" style={{ color: '#999', textDecoration: 'none' }}>Features</a>
                <a href="#pricing" style={{ color: '#999', textDecoration: 'none' }}>Pricing</a>
                <a href="#use-cases" style={{ color: '#999', textDecoration: 'none' }}>Use Cases</a>
              </div>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '20px', fontSize: '16px' }}>Company</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                <a href="#" style={{ color: '#999', textDecoration: 'none' }}>About</a>
                <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Contact</a>
                <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Support</a>
              </div>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '20px', fontSize: '16px' }}>Legal</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Terms of Service</a>
                <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Security</a>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '30px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            © 2024 TalkAi. All rights reserved. Enterprise AI Communication Platform.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;