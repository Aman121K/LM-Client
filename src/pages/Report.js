import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';
import UserHeaderSection from '../components/UserHeaderSection';
import './Report.css';

const Report = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    databaseSummary: {
      totalData: 0,
      callingDone: 0,
      pending: 0,
      callStatusDistribution: []
    },
    callingDoneByDate: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/leads/user-reports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          callBy: user
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch report data');
      }
    } catch (err) {
      setError('Failed to load report data');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <UserHeaderSection />
        <div className="loading">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <UserHeaderSection />
        <div className="error-message">{error}</div>
      </>
    );
  }

  return (
    <>
      <UserHeaderSection />
      <div className="report-container">
        <div className="report-header">
          <h3>Report Summary</h3>
        </div>

        <div className="report-grid">
          {/* Database Summary */}
          <div className="report-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th colSpan="2" className="table-header">Database</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Data</td>
                  <td className="text-center">{reportData.databaseSummary.totalData}</td>
                </tr>
                <tr>
                  <td>Calling Done</td>
                  <td className="text-center">{reportData.databaseSummary.callingDone}</td>
                </tr>
                <tr>
                  <td>Pending</td>
                  <td className="text-center">{reportData.databaseSummary.pending}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calling Status */}
          <div className="report-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th colSpan="2" className="table-header">Calling Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.databaseSummary.callStatusDistribution.map((status, index) => (
                  <tr key={index}>
                    <td>{status.callstatus}</td>
                    <td className="text-center">{status.tcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calling Done */}
          <div className="report-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th colSpan="2" className="table-header">Calling Done</th>
                </tr>
              </thead>
              <tbody>
                {reportData.callingDoneByDate.map((item, index) => (
                  <tr key={index}>
                    <td>{item.submiton}</td>
                    <td className="text-center">{item.sbcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Report; 