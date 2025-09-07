import React from 'react';
import './Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showPageInfo = true,
  showPageSize = false,
  pageSizeOptions = [10, 25, 50, 100],
  currentPageSize = 10,
  onPageSizeChange
}) => {
  const startItem = (currentPage - 1) * currentPageSize + 1;
  const endItem = Math.min(currentPage * currentPageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In middle
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      {/* Page Info */}
      {showPageInfo && (
        <div className="pagination-info">
          <span className="page-info-text">
            Showing {startItem} to {endItem} of {totalItems} items
          </span>
        </div>
      )}

      {/* Page Size Selector */}
      {showPageSize && onPageSizeChange && (
        <div className="page-size-selector">
          <label htmlFor="page-size" className="page-size-label">
            Show:
          </label>
          <select
            id="page-size"
            className="page-size-select"
            value={currentPageSize}
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination-controls">
        {/* First Page */}
        <button
          className={`pagination-btn first-page ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          <span className="btn-icon">⏮️</span>
          <span className="btn-text hidden-mobile">First</span>
        </button>

        {/* Previous Page */}
        <button
          className={`pagination-btn prev-page ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <span className="btn-icon">◀️</span>
          <span className="btn-text hidden-mobile">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="page-numbers">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="page-ellipsis" aria-label="More pages">...</span>
              ) : (
                <button
                  className={`pagination-btn page-number ${page === currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Page */}
        <button
          className={`pagination-btn next-page ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <span className="btn-text hidden-mobile">Next</span>
          <span className="btn-icon">▶️</span>
        </button>

        {/* Last Page */}
        <button
          className={`pagination-btn last-page ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          <span className="btn-text hidden-mobile">Last</span>
          <span className="btn-icon">⏭️</span>
        </button>
      </div>

      {/* Mobile Quick Navigation */}
      <div className="mobile-quick-nav hidden-desktop">
        <button
          className="quick-nav-btn"
          onClick={() => handlePageChange(Math.max(1, currentPage - 5))}
          disabled={currentPage <= 5}
        >
          -5
        </button>
        <button
          className="quick-nav-btn"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          -1
        </button>
        <span className="current-page-display">
          {currentPage} / {totalPages}
        </span>
        <button
          className="quick-nav-btn"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          +1
        </button>
        <button
          className="quick-nav-btn"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 5))}
          disabled={currentPage >= totalPages - 4}
        >
          +5
        </button>
      </div>
    </div>
  );
};

export default Pagination;
