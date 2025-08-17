import React, { useState } from 'react';
import './BulkActions.css';

const BulkActions = ({ 
  selectedCount, 
  totalCount, 
  onBulkUpdate, 
  onBulkDelete,
  teamLeads 
}) => {
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState({
    usertype: '',
    tl_name: '',
    loginstatus: ''
  });

  const handleBulkUpdate = () => {
    const updates = {};
    Object.entries(bulkUpdates).forEach(([key, value]) => {
      if (value !== '') {
        updates[key] = value;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      onBulkUpdate(updates);
      setShowBulkForm(false);
      setBulkUpdates({ usertype: '', tl_name: '', loginstatus: '' });
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="bulk-actions">
      <div className="bulk-info">
        <span>{selectedCount} of {totalCount} users selected</span>
      </div>
      
      <div className="bulk-controls">
        <button 
          className="bulk-btn bulk-edit-btn"
          onClick={() => setShowBulkForm(!showBulkForm)}
        >
          Bulk Edit ({selectedCount})
        </button>
        
        <button 
          className="bulk-btn bulk-delete-btn"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete ${selectedCount} users?`)) {
              onBulkDelete();
            }
          }}
        >
          Bulk Delete ({selectedCount})
        </button>
      </div>

      {showBulkForm && (
        <div className="bulk-form">
          <h4>Bulk Update {selectedCount} Users</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>User Role</label>
              <select
                value={bulkUpdates.usertype}
                onChange={(e) => setBulkUpdates(prev => ({ ...prev, usertype: e.target.value }))}
              >
                <option value="">Keep Current</option>
                <option value="admin">Admin</option>
                <option value="tl">Team Lead</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="form-group">
              <label>Team Lead</label>
              <select
                value={bulkUpdates.tl_name}
                onChange={(e) => setBulkUpdates(prev => ({ ...prev, tl_name: e.target.value }))}
              >
                <option value="">Keep Current</option>
                {teamLeads.map(tl => (
                  <option key={tl.id} value={tl.Username}>
                    {tl.FullName} ({tl.Username})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Login Status</label>
              <select
                value={bulkUpdates.loginstatus}
                onChange={(e) => setBulkUpdates(prev => ({ ...prev, loginstatus: e.target.value }))}
              >
                <option value="">Keep Current</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="apply-btn"
              onClick={handleBulkUpdate}
            >
              Apply Changes
            </button>
            <button 
              className="cancel-btn"
              onClick={() => setShowBulkForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
