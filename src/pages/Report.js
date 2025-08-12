import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';
import UserHeaderSection from '../components/UserHeaderSection';
import './Report.css';
import Pagination from '../components/Pagination';

const Report = () => {
  const { user, userType } = useAuth();
  console.log("user type is>>", userType)
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
  const [usersUnderTL, setUsersUnderTL] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    if (userType === 'tl') {
      fetchUsersUnderTL();
    }
  }, [userType, user]);

  useEffect(() => {
    fetchReportData();
  }, [selectedUser, user, currentPage]);

  useEffect(() => {
    if (selectedDate) {
      fetchDateStatus(selectedDate);
    }
  }, [selectedDate, selectedUser]);

  const fetchUsersUnderTL = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/under-tl/${user}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsersUnderTL(data.data);
      }
    } catch (error) {
      setError('Failed to fetch users under TL');
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const callBy = userType === 'tl' && selectedUser ? selectedUser : user;
      const response = await fetch(`${BASE_URL}/leads/user-reports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          callBy,
          page: currentPage,
          limit: itemsPerPage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
        setTotalPages(Math.ceil((result.total || 0) / itemsPerPage));
        setTotalItems(result.total || 0);
      } else {
        throw new Error(result.message || 'Failed to fetch report data');
      }
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDateStatus = async (date) => {
    try {
      setLoading(true);
      const [day, month, year] = date.split('-');
      const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const formattedDate = `20${year}-${months[month]}-${day.padStart(2, '0')}`;
      const callBy = userType === 'tl' && selectedUser ? selectedUser : user;
      const response = await fetch(`${BASE_URL}/leads/date-range/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: formattedDate,
          callBy
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch date status');
      }

      const result = await response.json();
      if (result.success) {
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
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    setSelectedDate(null); // Reset date selection on user change
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
      <div className="report-container" style={{ position: 'relative' }}>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <div className="loading-text">Loading...</div>
          </div>
        )}
        <div className="report-header">
          <h3>Report Summary</h3>
        </div>

        {userType === 'tl' && (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="userDropdown">Select Your User to check report: </label>
            <select
              id="userDropdown"
              value={selectedUser}
              onChange={handleUserChange}
              style={{ padding: '0.5rem', minWidth: 200 }}
            >
              <option value="">-- Your User --</option>
              {usersUnderTL.map(u => (
                <option key={u.Username} value={u.Username}>
                  {u.FullName} ({u.Username})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="report-grid">
          {/* Database Summary */}
          <div className="report-card">
            <table className="report-table">
              <thead>
                <tr>
                  <th colSpan="2" className="table-header">Database Full Records</th>
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
                  <th colSpan="2" className="table-header">Overall Calling Status Current Month</th>
                </tr>
              </thead>
              <tbody>
                {reportData.databaseSummary.callStatusDistribution
                  .filter(status => ![
                    'Not Qualified',
                    'Interested But Out Of Budget',
                    'Booking Done',
                    'Number Not Answered - 3rd call'
                  ].includes(status.callstatus))
                  .map((status, index) => (
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
                  <th colSpan="2" className="table-header">Date-wise Calling Status Current Month</th>
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
                    selectedDateStatus
                      .filter(status => ![
                        // 'Not Qualified',
                        // 'Interested But Out Of Budget',
                        // 'Booking Done',
                        // 'Number Not Answered - 3rd call'
                      ].includes(status.callstatus))
                      .map((status, index) => (
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
        {reportData.databaseSummary.totalData > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
    </>
  );
};

export default Report; 