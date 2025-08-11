import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  showPageInfo = true,
  maxVisiblePages = 5 
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Previous button
  pages.push(
    <button
      key="prev"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="pagination-btn pagination-btn-prev"
      aria-label="Previous page"
    >
      ← Previous
    </button>
  );

  // First page
  if (startPage > 1) {
    pages.push(
      <button
        key="1"
        onClick={() => onPageChange(1)}
        className="pagination-btn"
      >
        1
      </button>
    );
    if (startPage > 2) {
      pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`pagination-btn ${currentPage === i ? 'pagination-btn-active' : ''}`}
      >
        {i}
      </button>
    );
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
    }
    pages.push(
      <button
        key={totalPages}
        onClick={() => onPageChange(totalPages)}
        className="pagination-btn"
      >
        {totalPages}
      </button>
    );
  }

  // Next button
  pages.push(
    <button
      key="next"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="pagination-btn pagination-btn-next"
      aria-label="Next page"
    >
      Next →
    </button>
  );

  return (
    <div className="pagination-container">
      {showPageInfo && (
        <div className="pagination-info">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
      )}
      <div className="pagination-controls">
        {pages}
      </div>
    </div>
  );
};

export default Pagination;
