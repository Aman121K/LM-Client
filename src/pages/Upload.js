import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import './Upload.css';
import AdminHeaderSection from '../components/AdminHeaderSection';

const sampleCsvHeaders = [
  'FirstName',
  'LastName',
  'EmailId',
  'ContactNumber',
  'callstatus',
  'remarks',
  'PostingDate',
  'callby',
  'submiton',
  'productName'
];

function downloadSampleCsv() {
  const csvContent = sampleCsvHeaders.join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_leads.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const Upload = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    // Check if user is admin
    if (userType?.toLowerCase() !== 'admin') {
      navigate('/dashboard');
    }
  }, [userType, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      'text/csv',
      'application/csv',
      'text/x-csv',
      'application/x-csv',
      'text/comma-separated-values',
      'text/x-comma-separated-values'
    ];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid CSV file');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('importfile', file);

    try {
      const response = await fetch(`${BASE_URL}/leads/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`File uploaded successfully! ${result.data.importedCount} leads imported.`);
        setRecentLeads(result.data.recentLeads);
        setFile(null);
        // Reset file input
        e.target.reset();
      } else {
        setError(result.message || 'Failed to upload file');
      }
    } catch (err) {
      setError('An error occurred while uploading the file');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If not admin, don't render the component
  if (userType?.toLowerCase() !== 'admin') {
    return null;
  }

  return (
    <>
      <AdminHeaderSection />
      <div className="upload-container">
        <div className="upload-content">
          <h2>Upload Lead Data (Admin Only)</h2>
          <button
            type="button"
            className="upload-button"
            style={{ marginBottom: '1rem', background: '#007bff' }}
            onClick={downloadSampleCsv}
          >
            Download Sample CSV
          </button>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-container">
              <label htmlFor="file" className="file-label">
                Choose CSV File
              </label>
              <input
                type="file"
                id="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
              />
              {file && (
                <div className="selected-file">
                  Selected file: {file.name}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="upload-button"
              disabled={loading || !file}
            >
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>

          <div className="upload-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Only CSV files are accepted</li>
              <li>File should contain the following columns:
                <ul>
                  <li>FirstName</li>
                  <li>LastName</li>
                  <li>EmailId</li>
                  <li>ContactNumber</li>
                  <li>callstatus</li>
                  <li>remarks</li>
                  <li>PostingDate</li>
                  <li>callby</li>
                  <li>submiton</li>
                </ul>
              </li>
              <li>This feature is only available to administrators</li>
            </ul>
          </div>

          {recentLeads.length > 0 && (
            <div className="recent-leads">
              <h3>Recently Imported Leads</h3>
              <div className="leads-table-container">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Remarks</th>
                      <th>Posted On</th>
                      <th>Called By</th>
                      <th>Submitted On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead, index) => (
                      <tr key={index}>
                        <td>{`${lead.FirstName} ${lead.LastName}`}</td>
                        <td>{lead.EmailId}</td>
                        <td>{lead.ContactNumber}</td>
                        <td>{lead.callstatus}</td>
                        <td>{lead.remarks}</td>
                        <td>{lead.PostingDate}</td>
                        <td>{lead.callby}</td>
                        <td>{lead.submiton}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Upload; 