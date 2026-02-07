import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faSearch, faEye, faRobot, faUser, faDownload, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { SkeletonTable } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { aiAPI } from '../../services/api';
import { Modal } from '../../components/Modal';

const CallLogs = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCall, setSelectedCall] = useState(null);
  const [showCallDetails, setShowCallDetails] = useState(false);
  const [playingAudio, setPlayingAudio] = useState({});
  const [pageSize, setPageSize] = useState(25);
  const [loadingMessage, setLoadingMessage] = useState('Fetching call logs...');
  const [filters, setFilters] = useState({
    status: 'all',
    channelType: 'all',
    transferred: 'all',
    minDuration: '',
    maxDuration: '',
    startDate: '',
    endDate: ''
  });
  const isMobile = useMediaQuery('(max-width: 768px)');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Fetch real call logs from AI backend
  const { data: callLogsData, isLoading, error } = useQuery({
    queryKey: ['ai-call-logs', debouncedSearch],
    queryFn: async () => {
      const response = await aiAPI.getCallLogs(1, 50);
      console.log('API Response:', response.data); // Debug log
      return response.data;
    }
  });

  // Handle slow server message
  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setLoadingMessage('Waking up server, please wait (15-20s)...');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const callLogs = callLogsData?.data?.callLogs || [];

  // Apply filters to call logs
  const filteredCallLogs = callLogs.filter(call => {
    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch =
        call.callId?.toLowerCase().includes(searchLower) ||
        call.receiverNumber?.toLowerCase().includes(searchLower) ||
        call.botName?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter (AI/Human)
    if (filters.status !== 'all') {
      if (filters.status === 'ai' && call.handledBy !== 'AI') return false;
      if (filters.status === 'human' && call.handledBy !== 'Human') return false;
    }

    // Duration filters
    if (filters.minDuration && call.duration < parseInt(filters.minDuration)) return false;
    if (filters.maxDuration && call.duration > parseInt(filters.maxDuration)) return false;

    // Date filters
    if (filters.startDate) {
      const callDate = new Date(call.createdAt).toDateString();
      const startDate = new Date(filters.startDate).toDateString();
      if (callDate < startDate) return false;
    }
    if (filters.endDate) {
      const callDate = new Date(call.createdAt).toDateString();
      const endDate = new Date(filters.endDate).toDateString();
      if (callDate > endDate) return false;
    }

    return true;
  });

  // Apply pagination
  const paginatedCallLogs = filteredCallLogs.slice(0, pageSize);

  const handleViewCall = (call) => {
    setSelectedCall(call);
    setShowCallDetails(true);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const exportToCSV = () => {
    const csvData = filteredCallLogs.map(call => ({
      'Call Date': formatDate(call.createdAt),
      'Bot Name': call.handledBy === 'AI' ? (call.botName || 'TalkAI Agent') : 'Human Agent',
      'From Number': call.callerNumber || '+18648104203',
      'To Number': call.receiverNumber || 'N/A',
      'Duration': formatDuration(call.duration),
      'Call Type': 'Call',
      'Status': 'completed',
      'Cost': `$${(call.duration * 0.01).toFixed(2) || '0.00'}`
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `call-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const downloadRecording = async (callId) => {
    const call = callLogs.find(c => c._id === callId);
    if (!call?.recordingUrl) {
      console.log('No recording available for this call');
      return;
    }

    try {
      const response = await aiAPI.getRecording(callId);
      const recordingUrl = response.data.data.recording_url;

      const link = document.createElement('a');
      link.href = recordingUrl;
      link.download = `call-recording-${callId}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log('Recording download failed - no recording available');
    }
  };

  const toggleAudio = (callId) => {
    const audioElement = document.getElementById(`audio-${callId}`);
    if (audioElement && audioElement.src) {
      if (playingAudio[callId]) {
        audioElement.pause();
        setPlayingAudio(prev => ({ ...prev, [callId]: false }));
      } else {
        audioElement.play().catch(() => {
          console.log('Audio playback failed - no recording available');
        });
        setPlayingAudio(prev => ({ ...prev, [callId]: true }));
      }
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
            Call Logs
          </h1>
          {isLoading ? (
            <p style={{ color: '#667eea', fontSize: '14px' }}>
              {loadingMessage}
            </p>
          ) : (
            <p style={{ color: '#999', fontSize: '16px' }}>
              View and analyze your call history
            </p>
          )}
        </div>

        {/* Filters Section */}
        <div className="glass" style={{ padding: '30px', marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: showFilters ? '30px' : '0',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <h3 style={{ fontSize: '18px' }}>Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {showFilters ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <FontAwesomeIcon
                icon={faSearch}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder="Search call logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <select
                className="input"
                style={{ width: '80px', padding: '8px' }}
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <button className="btn btn-secondary" onClick={exportToCSV}>CSV</button>
            </div>
          </div>

          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: 'clamp(15px, 3vw, 20px)'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                  Call Status
                </label>
                <select
                  className="input"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Statuses</option>
                  <option value="ai">AI Handled</option>
                  <option value="human">Human Handled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                  Channel Type
                </label>
                <select
                  className="input"
                  value={filters.channelType}
                  onChange={(e) => setFilters({ ...filters, channelType: e.target.value })}
                >
                  <option value="all">All Channels</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                  Call Transferred
                </label>
                <select
                  className="input"
                  value={filters.transferred}
                  onChange={(e) => setFilters({ ...filters, transferred: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                  Duration (Min)
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  className="input"
                  value={filters.minDuration}
                  onChange={(e) => setFilters({ ...filters, minDuration: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                  Duration (Max)
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  className="input"
                  value={filters.maxDuration}
                  onChange={(e) => setFilters({ ...filters, maxDuration: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
                  End Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Call Logs Table */}
        {isLoading ? (
          <SkeletonTable rows={8} />
        ) : (
          <div className="glass" style={{ padding: '0', overflow: 'hidden' }}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={(e) => e.stopPropagation()}>
            <h2 style={{ padding: '30px 30px 20px', fontSize: '24px', margin: 0 }}>
              Call Logs
            </h2>

            {/* Horizontal scroll container */}
            <div style={{
              overflowX: 'auto',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch'
            }}
            className="custom-scrollbar">

              {/* Minimum width wrapper for horizontal scroll */}
              <div style={{ minWidth: '1200px' }}>

              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr',
                gap: '15px',
                padding: '15px 30px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px',
                fontWeight: '600',
                color: '#999'
              }}>
                <div>Call Date</div>
                <div>Bot Name</div>
                <div>From Number</div>
                <div>To Number</div>
                <div>Duration</div>
                <div>Call Type</div>
                <div>Status</div>
                <div>Cost</div>
                <div>Recording</div>
              </div>

              {/* Empty State or Call Logs */}
              {paginatedCallLogs.length === 0 ? (
                <EmptyState
                  icon={faClipboardList}
                  title="No call logs yet"
                  description="Your AI call history will appear here once you start calling customers. Track AI performance, transcripts, and outcomes."
                  actionText="Make Voice Call"
                  onAction={() => navigate('/voice-ai-assistants')}
                />
              ) : (
                /* Call Logs List */
                paginatedCallLogs.map((call) => (
                  <div key={call._id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr',
                    gap: '15px',
                    padding: '20px 30px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '14px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                    <div style={{ marginBottom: '0' }}>
                      <div style={{ color: '#fff', fontWeight: '500' }}>
                        {formatDate(call.createdAt)}
                      </div>
                    </div>

                    <div style={{ marginBottom: '0' }}>
                      <div style={{ color: '#60a5fa', fontWeight: '500' }}>
                        {call.handledBy === 'AI' ? (call.botName || 'TalkAI Agent') : 'Human Agent'}
                      </div>
                    </div>

                    <div style={{ marginBottom: '0' }}>
                      <div style={{ color: '#999', fontFamily: 'monospace' }}>
                        {call.callerNumber || '+18648104203'}
                      </div>
                    </div>

                    <div style={{ marginBottom: '0' }}>
                      <div style={{ color: '#999', fontFamily: 'monospace' }}>
                        {call.receiverNumber || 'N/A'}
                      </div>
                    </div>

                    <div style={{ marginBottom: '0' }}>
                      <div style={{ color: '#fff' }}>
                        {formatDuration(call.duration)}
                      </div>
                    </div>

                    <div style={{ marginBottom: '0' }}>
                      <div style={{ color: '#999' }}>
                        Call
                      </div>
                    </div>

                    <div style={{ marginBottom: '0' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#60a5fa'
                      }}>
                        completed
                      </span>
                    </div>

                    <div style={{ marginBottom: '0' }}>
                      <div style={{ color: '#4ade80' }}>
                        ${(call.duration * 0.01).toFixed(2) || '0.00'}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <audio
                          id={`audio-${call._id}`}
                          style={{ display: 'none' }}
                          onEnded={() => setPlayingAudio(prev => ({ ...prev, [call._id]: false }))}
                          onError={() => console.log('Audio failed to load')}
                        >
                          {call.recordingUrl && (
                            <source src={call.recordingUrl} type="audio/wav" />
                          )}
                        </audio>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          backgroundColor: '#2d2d2d',
                          borderRadius: '20px',
                          padding: '8px 12px',
                          minWidth: '120px'
                        }}>
                          <button
                            onClick={() => toggleAudio(call._id)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              border: 'none',
                              backgroundColor: 'rgb(96, 165, 250)',
                              color: '#fff',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FontAwesomeIcon icon={playingAudio[call._id] ? faPause : faPlay} />
                          </button>

                          <div style={{
                            flex: 1,
                            height: '4px',
                            backgroundColor: '#404040',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              backgroundColor: 'rgb(96, 165, 250)',
                              width: '0%',
                              borderRadius: '2px'
                            }} />
                          </div>

                          <span style={{
                            color: '#9ca3af',
                            fontSize: '11px',
                            fontFamily: 'monospace'
                          }}>
                            {formatDuration(call.duration)}
                          </span>
                        </div>

                        <button
                          onClick={() => downloadRecording(call._id)}
                          style={{
                            padding: '8px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backgroundColor: 'transparent',
                            color: '#60a5fa',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Details Modal */}
      {showCallDetails && selectedCall && (
        <Modal
          isOpen={showCallDetails}
          onClose={() => setShowCallDetails(false)}
          title="Call Details"
        >
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>Call Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Call ID</label>
                  <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '14px' }}>{selectedCall.callId}</div>
                </div>
                <div>
                  <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Date & Time</label>
                  <div style={{ color: '#fff', fontSize: '14px' }}>{formatDate(selectedCall.createdAt)}</div>
                </div>
                <div>
                  <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Duration</label>
                  <div style={{ color: '#fff', fontSize: '14px' }}>{formatDuration(selectedCall.duration)}</div>
                </div>
                <div>
                  <label style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Handled By</label>
                  <div style={{
                    color: selectedCall.handledBy === 'AI' ? '#4ade80' : '#f59e0b',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FontAwesomeIcon icon={selectedCall.handledBy === 'AI' ? faRobot : faUser} size="sm" />
                    {selectedCall.handledBy}
                  </div>
                </div>
              </div>
            </div>

            {selectedCall.transcript && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', marginBottom: '10px' }}>Transcript</h3>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '15px',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {selectedCall.transcript}
                </div>
              </div>
            )}

            {selectedCall.escalationReason && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', marginBottom: '10px' }}>Escalation Reason</h3>
                <div style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  padding: '15px',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '14px'
                }}>
                  {selectedCall.escalationReason}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default CallLogs;