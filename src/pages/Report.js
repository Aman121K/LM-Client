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
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateStatus, setSelectedDateStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDateStatus(selectedDate);
    }
  }, [selectedDate]);

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

  const fetchDateStatus = async (date) => {
    try {
      setLoading(true);
      // Convert date from "11-May-25" to "2025-05-11"
      const [day, month, year] = date.split('-');
      const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const formattedDate = `20${year}-${months[month]}-${day.padStart(2, '0')}`;

      const response = await fetch(`${BASE_URL}/leads/date-range/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: formattedDate,
          callBy: user
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch date status');
      }

      const result = await response.json();
      if (result.success) {
        // Convert statusCounts object to array format
        const statusArray = Object.entries(result.data.statusCounts).map(([callstatus, count]) => ({
          callstatus,
          count
        }));
        setSelectedDateStatus(statusArray);
      } else {
        throw new Error(result.message || 'Failed to fetch date status');
      }
    } catch (err) {
      setError('Failed to load date status');
      console.error('Error fetching date status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
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

          {/* Overall Calling Status */}
          <div className="report-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th colSpan="2" className="table-header">Overall Calling Status</th>
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

          {/* Date-wise Calling Status */}
          <div className="report-card date-status-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th colSpan="2" className="table-header">Date-wise Calling Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.callingDoneByDate.map((item, index) => (
                  <tr 
                    key={index}
                    className={`date-row ${selectedDate === item.submiton ? 'selected' : ''}`}
                    onClick={() => handleDateClick(item.submiton)}
                  >
                    <td>{item.submiton}</td>
                    <td className="text-center">{item.sbcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Date Status */}
          {selectedDate && (
            <div className="report-card selected-date-status">
              <table className="report-table">
                <thead>
                  <tr>
                    <th colSpan="2" className="table-header">
                      Status for {selectedDate}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDateStatus.length > 0 ? (
                    selectedDateStatus.map((status, index) => (
                      <tr key={index}>
                        <td>{status.callstatus}</td>
                        <td className="text-center">{status.count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Report; 