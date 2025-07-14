import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AdminHeaderSection from '../components/AdminHeaderSection';
import './AdminDashboard.css';
import { BASE_URL } from '../config';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tlData, setTlData] = useState([]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${BASE_URL}/users/tls-users-report`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch report');
        const data = await response.json();
        setTlData(data.data || []);
      } catch (err) {
        setError(err.message || 'Error fetching report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <div className="admin-dashboard">
      <AdminHeaderSection />
      <main className="admin-content">
        <h1 className="dashboard-title">Team Leads & Users Report</h1>
        {loading ? (
          <div className="modern-loader" aria-busy="true" aria-label="Loading">
            <div className="spinner"></div>
            <span>Loading data...</span>
          </div>
        ) : error ? (
          <div className="error-message">
            <span role="img" aria-label="Error">🚫</span>
            <div style={{marginTop: '0.5rem'}}>Something went wrong.<br/>{error}</div>
          </div>
        ) : tlData.length === 0 ? (
          <div className="no-data">
            <span role="img" aria-label="No data" style={{fontSize: '2.5rem'}}>📭</span>
            <div style={{marginTop: '1rem', fontWeight: 500}}>No data available.</div>
            <div style={{color: '#aaa', fontSize: '1rem', marginTop: '0.5rem'}}>All team leads and users will appear here when available.</div>
          </div>
        ) : (
          <section className="tl-cards-grid">
            {tlData.map((tl, idx) => {
              // Calculate summary for this TL
              const totalData = tl.users?.reduce((sum, u) => sum + (u.totalData || 0), 0);
              const totalDone = tl.users?.reduce((sum, u) => sum + (u.totalCallsDone || 0), 0);
              const totalPending = tl.users?.reduce((sum, u) => sum + (u.totalCallsPending || 0), 0);
              return (
                <section key={tl.tlName || idx} className="tl-card">
                  <div className="tl-accent-bar"></div>
                  <header className="tl-card-header">
                    <span className="tl-avatar" aria-label="Team Lead">👤</span>
                    <h2 className="tl-name">{tl.tlName}</h2>
                  </header>
                  <div className="tl-users-table-container">
                    <table className="users-table modern-table">
                      <thead>
                        <tr>
                          <th>User Name</th>
                          <th>Total Data</th>
                          <th>Total Calls Done</th>
                          <th>Total Calls Pending</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tl.users && tl.users.length > 0 ? (
                          <>
                            {tl.users.map((user, uidx) => (
                              <tr key={user.userName || uidx}>
                                <td style={{fontWeight: 500}}>{user.userName}</td>
                                <td>{user.totalData}</td>
                                <td><span className="badge badge-done">{user.totalCallsDone}</span></td>
                                <td><span className="badge badge-pending">{user.totalCallsPending}</span></td>
                              </tr>
                            ))}
                            <tr className="summary-row">
                              <td style={{fontWeight: 700}}>Total</td>
                              <td style={{fontWeight: 700}}>{totalData}</td>
                              <td style={{fontWeight: 700}}><span className="badge badge-done">{totalDone}</span></td>
                              <td style={{fontWeight: 700}}><span className="badge badge-pending">{totalPending}</span></td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>No users under this TL</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard; 