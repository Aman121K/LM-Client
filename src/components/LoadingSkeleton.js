import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ type = 'table', rows = 10 }) => {
  const renderTableSkeleton = () => (
    <div className="skeleton-table">
      <div className="skeleton-header">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-header-cell"></div>
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton-row">
          {[...Array(6)].map((_, j) => (
            <div key={j} className="skeleton-cell"></div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-text-group">
          <div className="skeleton-text skeleton-text-title"></div>
          <div className="skeleton-text skeleton-text-subtitle"></div>
        </div>
      </div>
      <div className="skeleton-card-body">
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text skeleton-text-short"></div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="skeleton-list">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton-avatar-small"></div>
          <div className="skeleton-text-group">
            <div className="skeleton-text"></div>
            <div className="skeleton-text skeleton-text-short"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="skeleton-form">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-form-group">
          <div className="skeleton-label"></div>
          <div className="skeleton-input"></div>
        </div>
      ))}
      <div className="skeleton-button-group">
        <div className="skeleton-button"></div>
        <div className="skeleton-button skeleton-button-secondary"></div>
      </div>
    </div>
  );

  const renderStatsSkeleton = () => (
    <div className="skeleton-stats">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton-stat-card">
          <div className="skeleton-stat-icon"></div>
          <div className="skeleton-stat-content">
            <div className="skeleton-stat-value"></div>
            <div className="skeleton-stat-label"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'table':
        return renderTableSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'form':
        return renderFormSkeleton();
      case 'stats':
        return renderStatsSkeleton();
      default:
        return renderTableSkeleton();
    }
  };

  return (
    <div className="loading-skeleton">
      {renderContent()}
    </div>
  );
};

export default LoadingSkeleton;
