import React, { useState, useCallback } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import './LeadModals.css';

const LeadModals = ({
  modals,
  onCloseModal,
  onLeadUpdate,
  allCallStatuses,
  budgetList,
  unitList,
  tlUsers
}) => {
  const [editForm, setEditForm] = useState({
    FirstName: '',
    LastName: '',
    EmailId: '',
    ContactNumber: '',
    callstatus: '',
    remarks: '',
    followup: '',
    productname: '',
    unittype: '',
    budget: '',
    assignedTo: ''
  });

  const [updating, setUpdating] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const currentLead = modals.editLead.lead;
    if (!currentLead) return;

    try {
      setUpdating(true);
      await onLeadUpdate(currentLead.id, editForm);
      onCloseModal('editLead');
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setUpdating(false);
    }
  }, [editForm, modals.editLead.lead, onLeadUpdate, onCloseModal]);

  const handleClose = useCallback((modalType) => {
    setEditForm({
      FirstName: '',
      LastName: '',
      EmailId: '',
      ContactNumber: '',
      callstatus: '',
      remarks: '',
      followup: '',
      productname: '',
      unittype: '',
      budget: '',
      assignedTo: ''
    });
    onCloseModal(modalType);
  }, [onCloseModal]);

  // Update form when modal opens with lead data
  React.useEffect(() => {
    if (modals.editLead.isOpen && modals.editLead.lead) {
      const lead = modals.editLead.lead;
      setEditForm({
        FirstName: lead.FirstName || '',
        LastName: lead.LastName || '',
        EmailId: lead.EmailId || '',
        ContactNumber: lead.ContactNumber || '',
        callstatus: lead.callstatus || '',
        remarks: lead.remarks || '',
        followup: lead.followup || '',
        productname: lead.productname || '',
        unittype: lead.unittype || '',
        budget: lead.budget || '',
        assignedTo: lead.assignedTo || ''
      });
    }
  }, [modals.editLead.isOpen, modals.editLead.lead]);

  return (
    <>
      {/* Edit Lead Modal */}
      <Modal
        isOpen={modals.editLead.isOpen}
        onClose={() => handleClose('editLead')}
        title="Edit Lead"
        size="large"
      >
        {modals.editLead.lead && (
          <form onSubmit={handleSubmit} className="edit-lead-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <Input
                  label="First Name"
                  value={editForm.FirstName}
                  onChange={(e) => handleInputChange('FirstName', e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={editForm.LastName}
                  onChange={(e) => handleInputChange('LastName', e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <Input
                  label="Email"
                  type="email"
                  value={editForm.EmailId}
                  onChange={(e) => handleInputChange('EmailId', e.target.value)}
                />
                <Input
                  label="Contact Number"
                  value={editForm.ContactNumber}
                  onChange={(e) => handleInputChange('ContactNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Lead Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Call Status</label>
                  <select
                    value={editForm.callstatus}
                    onChange={(e) => handleInputChange('callstatus', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Select Status</option>
                    {allCallStatuses.map((status, index) => (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Assigned To</label>
                  <select
                    value={editForm.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Select User</option>
                    {tlUsers.map((user, index) => (
                      <option key={index} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <Input
                  label="Product Name"
                  value={editForm.productname}
                  onChange={(e) => handleInputChange('productname', e.target.value)}
                />
                <div className="form-group">
                  <label className="input-label">Unit Type</label>
                  <select
                    value={editForm.unittype}
                    onChange={(e) => handleInputChange('unittype', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Select Unit Type</option>
                    {unitList.map((unit, index) => (
                      <option key={index} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Budget</label>
                  <select
                    value={editForm.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Select Budget</option>
                    {budgetList.map((budget, index) => (
                      <option key={index} value={budget}>
                        ₹{budget.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Follow Up Date"
                  type="date"
                  value={editForm.followup}
                  onChange={(e) => handleInputChange('followup', e.target.value)}
                />
              </div>
              <div className="form-row">
                <Input
                  label="Remarks"
                  value={editForm.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  multiline
                />
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleClose('editLead')}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={updating}
              >
                Update Lead
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Lead Modal */}
      <Modal
        isOpen={modals.viewLead.isOpen}
        onClose={() => handleClose('viewLead')}
        title="Lead Details"
        size="medium"
      >
        {modals.viewLead.lead && (
          <div className="lead-details">
            <div className="detail-section">
              <h3>Basic Information</h3>
              <div className="detail-row">
                <strong>Name:</strong>
                <span>{modals.viewLead.lead.FirstName} {modals.viewLead.lead.LastName}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{modals.viewLead.lead.EmailId || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Contact:</strong>
                <span>{modals.viewLead.lead.ContactNumber || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Lead Information</h3>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge status-${modals.viewLead.lead.callstatus?.toLowerCase()}`}>
                  {modals.viewLead.lead.callstatus || 'New'}
                </span>
              </div>
              <div className="detail-row">
                <strong>Product:</strong>
                <span>{modals.viewLead.lead.productname || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Unit Type:</strong>
                <span>{modals.viewLead.lead.unittype || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Budget:</strong>
                <span>{modals.viewLead.lead.budget ? `₹${modals.viewLead.lead.budget.toLocaleString()}` : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Assigned To:</strong>
                <span>{modals.viewLead.lead.assignedTo || 'Unassigned'}</span>
              </div>
              <div className="detail-row">
                <strong>Follow Up:</strong>
                <span>{modals.viewLead.lead.followup ? new Date(modals.viewLead.lead.followup).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Remarks:</strong>
                <span>{modals.viewLead.lead.remarks || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Timestamps</h3>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{modals.viewLead.lead.createdAt ? new Date(modals.viewLead.lead.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Last Updated:</strong>
                <span>{modals.viewLead.lead.updatedAt ? new Date(modals.viewLead.lead.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default LeadModals;
