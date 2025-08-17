import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/apiService';
import AdminHeaderSection from '../components/AdminHeaderSection';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './Upload.css';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await uploadAPI.getUploadHistory();
      setUploadHistory(response.data.history);
    } catch (error) {
      console.error('Error fetching upload history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        setError('Please select a valid Excel or CSV file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      setSuccess('');
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setSuccess('');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const previewFile = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/upload/preview', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setPreviewData(data.preview);
      setShowPreview(true);
    } catch (error) {
      setError('Failed to preview file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      setSuccess('');

      await uploadAPI.uploadLeads(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setSuccess('File uploaded successfully!');
      setSelectedFile(null);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh upload history
      fetchUploadHistory();
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (window.confirm('Are you sure you want to delete this upload?')) {
      try {
        await uploadAPI.deleteUpload(uploadId);
        fetchUploadHistory();
      } catch (error) {
        setError('Failed to delete upload');
      }
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['FirstName', 'LastName', 'EmailId', 'ContactNumber', 'ProductName', 'UnitType', 'Budget', 'Remarks'],
      ['John', 'Doe', 'john@example.com', '1234567890', 'Apartment', '2BHK', '500000', 'Interested in 2BHK'],
      ['Jane', 'Smith', 'jane@example.com', '0987654321', 'Villa', '3BHK', '1000000', 'Looking for villa']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="upload-container">
      <AdminHeaderSection />
      
      <div className="upload-content">
        <div className="page-header">
          <div className="page-title">
            <h1>Upload Leads</h1>
            <p>Import leads from Excel or CSV files</p>
          </div>
          <Button
            variant="secondary"
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
        </div>

        <div className="upload-section">
          <div className="upload-area">
            <div
              className={`file-drop-zone ${selectedFile ? 'has-file' : ''}`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="file-input"
              />
              
              {selectedFile ? (
                <div className="selected-file">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <h3>{selectedFile.name}</h3>
                    <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📁</div>
                  <h3>Drop your file here</h3>
                  <p>or click to browse</p>
                  <p className="upload-hint">
                    Supports .xlsx, .xls, .csv files (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="upload-actions">
                <Button
                  variant="secondary"
                  onClick={previewFile}
                  disabled={uploading}
                >
                  Preview
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!selectedFile}
                >
                  Upload Leads
                </Button>
              </div>
            )}

            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p>{uploadProgress}% uploaded</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                {success}
              </div>
            )}
          </div>
        </div>

        {/* Upload History */}
        <div className="upload-history">
          <h2>Upload History</h2>
          
          {loadingHistory ? (
            <LoadingSkeleton type="table" rows={5} />
          ) : (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th>Records</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadHistory.length > 0 ? (
                    uploadHistory.map((upload, index) => (
                      <tr key={index}>
                        <td>{upload.fileName}</td>
                        <td>{new Date(upload.uploadDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${upload.status}`}>
                            {upload.status}
                          </span>
                        </td>
                        <td>{upload.recordCount}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleDeleteUpload(upload.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No upload history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="File Preview"
        size="large"
      >
        <div className="preview-content">
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  {previewData.length > 0 && previewData[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(1, 6).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewData.length > 6 && (
            <p className="preview-note">
              Showing first 5 rows of {previewData.length - 1} total rows
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Upload; 