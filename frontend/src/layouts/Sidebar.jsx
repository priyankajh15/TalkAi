import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRobot,
    faBook,
    faPhone,
    faBullhorn,
    faClipboardList,
    faChartBar,
    faCreditCard,
    faKey,
    faCog,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from '../hooks/useMediaQuery';

const Sidebar = ({ isOpen, onClose, onHover }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isHovered, setIsHovered] = useState(false);

    // Determine effective open state for desktop (collapsed vs expanded)
    const showFullSidebar = isMobile ? isOpen : isHovered;

    const handleMouseEnter = () => {
        if (!isMobile) {
            setIsHovered(true);
            if (onHover) onHover(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            setIsHovered(false);
            if (onHover) onHover(false);
        }
    };

    const menuItems = [
        {
            section: 'Voice AI Setup',
            items: [
                { path: '/voice-ai-assistants', icon: faRobot, label: 'Voice AI Assistants' },
                { path: '/knowledge', icon: faBook, label: 'Knowledge Base' }
            ]
        },
        {
            section: 'Operations & Monitoring',
            items: [
                { path: '/phone-numbers', icon: faPhone, label: 'Phone Numbers' },
                { path: '/bulk-campaigns', icon: faBullhorn, label: 'Bulk Campaigns' },
                { path: '/call-logs', icon: faClipboardList, label: 'Call Logs' },
                { path: '/analytics', icon: faChartBar, label: 'Analytics' }
            ]
        },
        {
            section: 'Account & Billing',
            items: [
                { path: '/balance-plans', icon: faCreditCard, label: 'Balance & Plans' },
                { path: '/api-access', icon: faKey, label: 'API Access' }
            ]
        }
    ];

    return (
        <>
            <style>
                {`
          .sidebar-scroll-container::-webkit-scrollbar {
            display: none;
          }
          .sidebar-scroll-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
            </style>

            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 99
                    }}
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    width: isMobile ? '280px' : (isHovered ? '280px' : '70px'),
                    height: '100vh',
                    background: 'rgba(0,0,0,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    left: isMobile ? (isOpen ? 0 : '-280px') : 0,
                    top: 0,
                    zIndex: 100,
                    transition: 'width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), left 0.3s ease',
                    overflowX: 'hidden',
                    whiteSpace: 'nowrap'
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: '0 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px', // Reduced height
                    justifyContent: 'flex-start',
                    paddingLeft: (isMobile || showFullSidebar) ? '20px' : '23px',
                    transition: 'padding-left 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    flexShrink: 0
                }}>
                    <Link to="/voice-ai-assistants" style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'white',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}>
                        {(!isMobile && !showFullSidebar) ? (
                            <span style={{ width: '24px', textAlign: 'center' }}>T</span>
                        ) : (
                            <span>TalkAi</span>
                        )}
                    </Link>
                </div>

                {/* Menu Items Container */}
                <div
                    className="sidebar-scroll-container"
                    style={{
                        flex: 1,
                        padding: '10px 0',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                    }}>
                    {menuItems.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            {/* Divider - Show for all except first, or always? User requested dividers logic. */}
                            {/* Let's show divider for indices > 0 to separate sections */}
                            {sectionIndex > 0 && (
                                <div style={{
                                    height: '1px',
                                    background: 'rgba(255,255,255,0.1)',
                                    margin: '8px 20px',
                                }} />
                            )}

                            {/* Section Header - Only visible when expanded */}
                            <div style={{
                                padding: '0 20px 8px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#666',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                opacity: (isMobile || showFullSidebar) ? 1 : 0,
                                // height: animate height to avoid gaps in collapsed mode if we want tight packing
                                height: (isMobile || showFullSidebar) ? 'auto' : '0px',
                                overflow: 'hidden',
                                transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                whiteSpace: 'nowrap'
                            }}>
                                {section.section}
                            </div>

                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        if (isMobile) onClose();
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '40px', // Compact item height
                                        paddingRight: '15px', // Reduced since we have margin
                                        paddingLeft: (isMobile || showFullSidebar) ? '15px' : '15px', // Consistent padding inside rounded box
                                        margin: '0 8px', // Curved from edge: float with margin
                                        borderRadius: '10px', // Curved corners
                                        color: location.pathname === item.path ? 'white' : '#999',
                                        textDecoration: 'none',
                                        background: location.pathname === item.path ? 'rgba(255,255,255,0.12)' : 'transparent',
                                        // borderRight removed as we use rounded background for selection
                                        transition: 'all 0.3s ease',
                                        justifyContent: 'flex-start'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (location.pathname !== item.path) {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                            e.currentTarget.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (location.pathname !== item.path) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#999';
                                        }
                                    }}
                                >
                                    <span style={{
                                        marginRight: '12px',
                                        fontSize: '16px',
                                        width: '24px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FontAwesomeIcon icon={item.icon} />
                                    </span>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        opacity: (isMobile || showFullSidebar) ? 1 : 0,
                                        maxWidth: (isMobile || showFullSidebar) ? '200px' : '0px',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
                                    }}>
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ))}

                    {/* Spacer - Reduced */}
                    <div style={{ height: '20px' }} />

                    {/* Bottom Divider */}
                    <div style={{
                        height: '1px',
                        background: 'rgba(255,255,255,0.1)',
                        margin: '8px 20px',
                    }} />

                    {/* Settings */}
                    <div>
                        <Link
                            to="/settings"
                            onClick={() => {
                                if (isMobile) onClose();
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                height: '40px',
                                paddingRight: '15px',
                                paddingLeft: (isMobile || showFullSidebar) ? '15px' : '15px',
                                margin: '0 8px',
                                borderRadius: '10px',
                                color: location.pathname === '/settings' ? 'white' : '#999',
                                textDecoration: 'none',
                                background: location.pathname === '/settings' ? 'rgba(255,255,255,0.12)' : 'transparent',
                                transition: 'all 0.3s ease',
                                justifyContent: 'flex-start'
                            }}
                            onMouseEnter={(e) => {
                                if (location.pathname !== '/settings') {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (location.pathname !== '/settings') {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#999';
                                }
                            }}
                        >
                            <span style={{
                                marginRight: '12px',
                                fontSize: '16px',
                                width: '24px',
                                textAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <FontAwesomeIcon icon={faCog} />
                            </span>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                opacity: (isMobile || showFullSidebar) ? 1 : 0,
                                maxWidth: (isMobile || showFullSidebar) ? '200px' : '0px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
                            }}>Settings</span>
                        </Link>
                    </div>

                    {/* Logout */}
                    <div>
                        <button
                            onClick={logout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: 'auto', // Auto width to respect margins
                                height: '40px',
                                paddingRight: '15px',
                                paddingLeft: (isMobile || showFullSidebar) ? '15px' : '15px',
                                margin: '0 8px',
                                borderRadius: '10px',
                                background: 'transparent',
                                border: 'none',
                                color: '#999',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'left',
                                justifyContent: 'flex-start'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#999';
                            }}
                        >
                            <span style={{
                                marginRight: '12px',
                                fontSize: '16px',
                                width: '24px',
                                textAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <FontAwesomeIcon icon={faSignOutAlt} />
                            </span>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                opacity: (isMobile || showFullSidebar) ? 1 : 0,
                                maxWidth: (isMobile || showFullSidebar) ? '200px' : '0px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
                            }}>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
