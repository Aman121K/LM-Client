import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import AdminHeaderSection from '../components/AdminHeaderSection';
import './OperatorReport.css';

const OperatorReport = () => {
  const [selectedOperator, setSelectedOperator] = useState('');
  const [operators, setOperators] = useState([]);
  const [reportData, setReportData] = useState({
    database: {
      totalData: 0,
      callingDone: 0,
      pending: 0
    },
    callingStatus: [],
    callingDoneByDate: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOperators();
  }, []);

  useEffect(() => {
    if (selectedOperator) {
      fetchReportData(selectedOperator);
    }
  }, [selectedOperator]);

  const fetchOperators = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/allUserList`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOperators(data.data);
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  };

  const fetchReportData = async (operator) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/reports/${operator}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        setError(data.message || 'Failed to fetch report data');
      }
    } catch (error) {
      setError('An error occurred while fetching report data');
    } finally {
      setLoading(false);
    }
  };

  const handleOperatorChange = (e) => {
    setSelectedOperator(e.target.value);
  };

  return (
    <div className="operator-report-container">
      <AdminHeaderSection />
      
      <div className="operator-report-content">
        <div className="report-header">
          <h3>Operator wise Report</h3>
        </div>

        <div className="operator-selector">
          <select 
            className="operator-select"
            value={selectedOperator}
            onChange={handleOperatorChange}
          >
            <option value="" disabled>---Call by----</option>
            {operators.map(operator => (
              <option key={operator.id} value={operator.name}>
                {operator.FullName}
              </option>
            ))}
          </select>
        </div>

        {selectedOperator && (
          <div className="operator-name">
            <h3>Call by: {selectedOperator}</h3>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading report data...</div>
        ) : (
          <div className="report-tables">
            <div className="report-table">
              <h4>Database</h4>
              <table className="table-bordered">
                <tbody>
                  <tr>
                    <td>Total Data</td>
                    <td className="text-center">{reportData.database.totalData}</td>
                  </tr>
                  <tr>
                    <td>Calling Done</td>
                    <td className="text-center">{reportData.database.callingDone}</td>
                  </tr>
                  <tr>
                    <td>Pending</td>
                    <td className="text-center">{reportData.database.pending}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="report-table">
              <h4>Calling Status</h4>
              <table className="table-bordered">
                <tbody>
                  {reportData.callingStatus.map((status, index) => (
                    <tr key={index}>
                      <td>{status.callstatus}</td>
                      <td className="text-center">{status.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="report-table">
              <h4>Calling Done</h4>
              <table className="table-bordered">
                <tbody>
                  {reportData.callingDoneByDate.map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.submiton).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit'
                      })}</td>
                      <td className="text-center">{item.sbcount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorReport; 