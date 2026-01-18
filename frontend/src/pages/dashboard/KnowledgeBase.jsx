import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faGlobe, faFile, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { toast } from '../../components/Toast';
import { aiAPI } from '../../services/api';

const KnowledgeBase = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [storageUsed, setStorageUsed] = useState(5.0); // MB
  const [storageLimit] = useState(10.0); // MB

  // Mock uploaded files - replace with real API call later
  const files = uploadedFiles;

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
          const newFile = {
            id: response.data.data.file_id,
            name: file.name,
            size: response.data.data.size,
            uploadedAt: new Date().toISOString(),
            status: 'processed'
          };
          setUploadedFiles(prev => [...prev, newFile]);
          setStorageUsed(prev => prev + parseFloat(newFile.size));
          toast.success(`${file.name} uploaded successfully!`);
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
      const response = await aiAPI.addWebsite(websiteUrl);
      const newFile = {
        id: response.data.data.file_id,
        name: websiteUrl,
        size: response.data.data.size,
        uploadedAt: new Date().toISOString(),
        status: 'processed',
        type: 'website'
      };
      setUploadedFiles(prev => [...prev, newFile]);
      setStorageUsed(prev => prev + 0.5);
      setWebsiteUrl('');
      toast.success('Website content added to knowledge base!');
    } catch (error) {
      toast.error('Failed to add website content');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await aiAPI.deleteKnowledgeFile(fileId);
      const file = uploadedFiles.find(f => f.id === fileId);
      if (file) {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        setStorageUsed(prev => prev - parseFloat(file.size));
        toast.success('File removed from knowledge base');
      }
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <DashboardLayout>
      <div style={{ padding: 'clamp(16px, 4vw, 40px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '600' }}>
            Knowledge Base
          </h1>
          <p style={{ color: '#999', fontSize: '16px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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
          </div>

          {/* Uploaded Files */}
          <div className="glass" style={{ padding: '20px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Uploaded Files</h3>
            
            {files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                <FontAwesomeIcon icon={faFile} style={{ fontSize: '32px', marginBottom: '10px' }} />
                <p style={{ fontSize: '14px' }}>No files uploaded yet</p>
                <p style={{ fontSize: '12px' }}>Upload files to get started</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {files.map((file) => (
                  <div key={file.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FontAwesomeIcon 
                        icon={file.type === 'website' ? faGlobe : faFile} 
                        style={{ color: '#667eea', fontSize: '20px' }} 
                      />
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {file.size} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBase;