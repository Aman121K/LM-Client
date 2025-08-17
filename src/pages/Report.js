import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportAPI } from '../services/apiService';
import UserHeaderSection from '../components/UserHeaderSection';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './Report.css';

const Report = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    callStatus: 'all',
    assignedTo: 'all'
  });
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    followUpLeads: 0,
    interestedLeads: 0,
    closedLeads: 0
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getLeadReports({
        startDate: filters.startDate,
        endDate: filters.endDate,
        callStatus: filters.callStatus !== 'all' ? filters.callStatus : undefined,
        assignedTo: filters.assignedTo !== 'all' ? filters.assignedTo : undefined,
        userId: user.role === 'user' ? user.id : undefined
      });
      
      setReports(response.data.reports);
      setStats(response.data.stats);
    } catch (error) {
      setError('Failed to fetch reports');
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async () => {
    try {
      const response = await reportAPI.exportReport('leads', filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Failed to export report');
      console.error('Error exporting report:', error);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (filters.callStatus !== 'all' && report.callstatus !== filters.callStatus) {
        return false;
      }
      if (filters.assignedTo !== 'all' && report.assignedTo !== filters.assignedTo) {
        return false;
      }
      return true;
    });
  }, [reports, filters]);

  const statsCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      color: 'blue',
      icon: '📊'
    },
    {
      title: 'New Leads',
      value: stats.newLeads,
      color: 'green',
      icon: '🆕'
    },
    {
      title: 'Follow Up',
      value: stats.followUpLeads,
      color: 'yellow',
      icon: '📞'
    },
    {
      title: 'Interested',
      value: stats.interestedLeads,
      color: 'purple',
      icon: '✅'
    },
    {
      title: 'Closed',
      value: stats.closedLeads,
      color: 'red',
      icon: '🔒'
    }
  ];

  return (
    <div className="report-container">
      <UserHeaderSection />
      
      <div className="report-content">
        <div className="page-header">
          <div className="page-title">
            <h1>Lead Reports</h1>
            <p>View and analyze your lead performance</p>
          </div>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={loading}
          >
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {statsCards.map((stat, index) => (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Call Status</label>
              <select
                value={filters.callStatus}
                onChange={(e) => handleFilterChange('callStatus', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="follow-up">Follow Up</option>
                <option value="interested">Interested</option>
                <option value="not-interested">Not Interested</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            {user.role !== 'user' && (
              <div className="filter-group">
                <label className="filter-label">Assigned To</label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Users</option>
                  <option value="me">Me</option>
                  <option value="team">My Team</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Reports Table */}
        <div className="reports-table-container">
          {loading ? (
            <LoadingSkeleton type="table" rows={10} />
          ) : (
            <div className="reports-table">
              <table>
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created Date</th>
                    <th>Last Follow Up</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report, index) => (
                      <tr key={index}>
                        <td>
                          <div className="lead-name">
                            {report.FirstName} {report.LastName}
                          </div>
                        </td>
                        <td>
                          <div className="lead-contact">
                            <div>{report.EmailId}</div>
                            <div>{report.ContactNumber}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${report.callstatus}`}>
                            {report.callstatus}
                          </span>
                        </td>
                        <td>{report.assignedTo || 'Unassigned'}</td>
                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td>
                          {report.followup ? 
                            new Date(report.followup).toLocaleDateString() : 
                            'No follow up'
                          }
                        </td>
                        <td>
                          <div className="remarks">
                            {report.remarks || 'No remarks'}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        <div className="empty-state-content">
                          <div className="empty-state-icon">📊</div>
                          <h3>No reports found</h3>
                          <p>Try adjusting your filters or date range</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report; 