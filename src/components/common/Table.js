import React, { useState, useMemo } from 'react';
import './Table.css';

const Table = ({
  columns,
  data,
  emptyMessage = 'No data available',
  onSort,
  sortConfig = {},
  loading = false,
  selectable = false,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  className = ''
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (columnKey) => {
    if (onSort && columns.find(col => col.key === columnKey)?.sortable) {
      onSort(columnKey);
    }
  };

  const handleRowSelect = (rowId) => {
    if (onRowSelect) {
      onRowSelect(rowId);
    }
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      const allIds = data.map(row => row.id);
      const isAllSelected = selectedRows.length === data.length;
      onSelectAll(isAllSelected ? [] : allIds);
    }
  };

  const getSortIcon = (columnKey) => {
    const currentSort = sortConfig[columnKey];
    if (!currentSort) return '↕️';
    return currentSort === 'asc' ? '↑' : '↓';
  };

  const renderCell = (column, row, rowIndex) => {
    if (column.render) {
      return column.render(row[column.key], row, rowIndex);
    }
    return row[column.key] || '-';
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <div className="empty-icon">📭</div>
        <h3>No data found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {selectable && (
                <th className="table-header select-header">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="select-checkbox"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`table-header ${column.sortable ? 'sortable' : ''}`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="header-content">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="sort-icon">{getSortIcon(column.key)}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`table-row ${hoveredRow === rowIndex ? 'hovered' : ''} ${
                  selectedRows.includes(row.id) ? 'selected' : ''
                }`}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {selectable && (
                  <td className="table-cell select-cell">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleRowSelect(row.id)}
                      className="select-checkbox"
                    />
                  </td>
                )}
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key || colIndex}
                    className={`table-cell ${column.className || ''}`}
                  >
                    {renderCell(column, row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
