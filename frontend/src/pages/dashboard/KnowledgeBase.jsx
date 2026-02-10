import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faGlobe, faFile, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { toast } from '../../components/Toast';
import { aiAPI } from '../../services/api';

const KnowledgeBase = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0); // MB
  const [storageLimit] = useState(10.0); // MB
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const files = uploadedFiles;

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await aiAPI.getKnowledgeFiles();
      const files = response.data.data
        .filter(file => !file.extractionFailed)
        .map(file => ({
          id: file._id,
          name: file.title,
          size: file.fileSize ? (file.fileSize / 1024 / 1024).toFixed(2) + ' MB' : '0.00 MB',
          uploadedAt: file.createdAt,
          status: 'processed',
          type: file.category === 'website' ? 'website' : 'pdf',
          useInCalls: file.useInCalls !== undefined ? file.useInCalls : true
        }));
      setUploadedFiles(files);
      
      // Calculate storage used
      const totalSize = files.reduce((sum, file) => sum + parseFloat(file.size), 0);
      setStorageUsed(totalSize);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast.error('Failed to load knowledge base files');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    for (const file of files) {
      if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
        try {
          const response = await aiAPI.uploadPDF(file);
          
          if (response.data.extractionFailed) {
            toast.error(response.data.message);
          } else {
            toast.success(response.data.message);
          }
          
          // Reload files to get updated list
          await loadFiles();
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
        }
      } else {
        toast.error(`${file.name} is not a valid PDF or exceeds 10MB limit`);
      }
    }
  };

  const handleWebsiteAdd = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL');
      return;
    }
    
    try {
      await aiAPI.addWebsite(websiteUrl);
      setWebsiteUrl('');
      toast.success('Website content added to knowledge base!');
      // Reload files to get updated list
      await loadFiles();
    } catch (error) {
      toast.error('Failed to add website content');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await aiAPI.deleteKnowledgeFile(fileId);
      toast.success('File removed from knowledge base');
      setDeleteConfirm(null);
      // Reload files to get updated list
      await loadFiles();
    } catch (error) {
      toast.error('Failed to delete file');
      setDeleteConfirm(null);
    }
  };

  const confirmDelete = (file) => {
    setDeleteConfirm(file);
  };

  const handleToggleUseInCalls = async (file) => {
    try {
      const newValue = !file.useInCalls;
      const response = await aiAPI.toggleUseInCalls(file.id, newValue);
      
      if (newValue) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
      
      await loadFiles();
      
      // Check if all PDFs are now unchecked
      const updatedFiles = await aiAPI.getKnowledgeFiles();
      const activePDFs = updatedFiles.data.data.filter(f => f.useInCalls);
      
      if (activePDFs.length === 0 && updatedFiles.data.data.length > 0) {
        toast.error('No PDFs active. AI won\'t use company-specific knowledge.');
      }
    } catch (error) {
      toast.error('Failed to update voice call settings');
    }
  };

  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            
            @media (max-width: 640px) {
              .file-item {
                flex-direction: column !important;
                align-items: stretch !important;
              }
              .file-actions {
                justify-content: space-between !important;
                width: 100% !important;
              }
            }
          `}
        </style>
        {/* Header */}
        <div style={{ marginBottom: 'clamp(20px, 5vw, 40px)' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px', fontWeight: '600' }}>
            Knowledge Base
          </h1>
          <p style={{ color: '#999', fontSize: 'clamp(14px, 3vw, 16px)' }}>
            Upload PDFs and add website content to enhance your AI assistant's knowledge
          </p>
        </div>

        {/* Storage Warning */}
        {storagePercentage > 80 && (
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#f59e0b' }} />
            <div>
              <strong style={{ color: '#f59e0b' }}>Low Storage Space Warning</strong>
              <p style={{ color: '#999', fontSize: '14px', margin: '4px 0 0 0' }}>
                You only have {(storageLimit - storageUsed).toFixed(1)} MB of knowledge base storage remaining. Consider upgrading your account to avoid upload restrictions.
              </p>
            </div>
            <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
              Upgrade
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 'clamp(12px, 3vw, 20px)' }}>
          {/* PDF Upload Section */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Upload PDFs</h3>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>
              Add PDF files to your assistant's knowledge base
            </p>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? '#667eea' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: dragActive ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <FontAwesomeIcon 
                icon={faUpload} 
                style={{ fontSize: '24px', color: '#667eea', marginBottom: '8px' }} 
              />
              <p style={{ fontSize: '12px', marginBottom: '4px' }}>
                {dragActive ? 'Drop files here' : 'Drag and drop a file here, or click to select'}
              </p>
              <p style={{ color: '#999', fontSize: '10px' }}>
                Supported formats: PDF (max 10MB)
              </p>
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Website Knowledge Base */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Website Knowledge Base</h3>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>
              Add website content to your assistant's knowledge base
            </p>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#999' }}>
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="input"
                style={{ width: '100%', marginBottom: '10px' }}
              />
            </div>
            <button 
              onClick={handleWebsiteAdd}
              className="btn btn-primary"
              disabled={!websiteUrl}
              style={{ width: '100%', fontSize: '12px' }}
            >
              <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '6px' }} />
              Add to Knowledge Base
            </button>
          </div>

          {/* Storage Usage */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Storage Usage</h3>
            {loading ? (
              <div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
                <div style={{
                  width: '60%',
                  height: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              </div>
            ) : (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>Used Storage</span>
                  <span style={{ fontSize: '12px', color: '#fff' }}>
                    {storageUsed.toFixed(1)} MB / {storageLimit} MB
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(storagePercentage, 100)}%`,
                    height: '100%',
                    backgroundColor: storagePercentage > 80 ? '#f59e0b' : '#667eea',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Files */}
          <div className="glass" style={{ padding: '20px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Uploaded Files</h3>
            
            {loading ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }} />
                      <div>
                        <div style={{
                          width: '120px',
                          height: '16px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          marginBottom: '4px',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                        <div style={{
                          width: '80px',
                          height: '12px',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderRadius: '4px',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                      </div>
                    </div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                  </div>
                ))}
              </div>
            ) : files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                <FontAwesomeIcon icon={faFile} style={{ fontSize: '32px', marginBottom: '10px' }} />
                <p style={{ fontSize: '14px' }}>No files uploaded yet</p>
                <p style={{ fontSize: '12px' }}>Upload files to get started</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {files.map((file) => (
                  <div key={file.id} className="file-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'clamp(12px, 3vw, 15px)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <FontAwesomeIcon 
                        icon={file.type === 'website' ? faGlobe : faFile} 
                        style={{ color: '#667eea', fontSize: '20px', flexShrink: 0 }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.size} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="file-actions" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', flexShrink: 0 }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: 'clamp(12px, 2.5vw, 13px)',
                        color: file.useInCalls ? '#10b981' : '#999',
                        padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
                        borderRadius: '6px',
                        backgroundColor: file.useInCalls ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${file.useInCalls ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}>
                        <input
                          type="checkbox"
                          checked={file.useInCalls}
                          onChange={() => handleToggleUseInCalls(file)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>Use in calls</span>
                      </label>
                      <button
                        onClick={() => confirmDelete(file)}
                        style={{
                          padding: '8px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                        title="Delete file"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <FontAwesomeIcon 
                  icon={faExclamationTriangle} 
                  style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '15px' }} 
                />
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Delete File</h3>
                <p style={{ color: '#999', fontSize: '14px' }}>
                  Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteFile(deleteConfirm.id)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBase;