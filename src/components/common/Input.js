import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const baseClass = 'input-wrapper';
  const sizeClass = `input-${size}`;
  const widthClass = fullWidth ? 'input-full-width' : '';
  const errorClass = error ? 'input-error' : '';
  const disabledClass = disabled || loading ? 'input-disabled' : '';
  const iconClass = icon ? `input-with-icon input-icon-${iconPosition}` : '';

  const wrapperClasses = [
    baseClass,
    sizeClass,
    widthClass,
    errorClass,
    disabledClass,
    iconClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-container">
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left">{icon}</span>
        )}
        
        <input
          ref={ref}
          className="input-field"
          disabled={disabled || loading}
          required={required}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon-right">{icon}</span>
        )}
        
        {loading && (
          <span className="input-loading">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
          </span>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="input-message">
          {error && <span className="input-error-text">{error}</span>}
          {helperText && !error && <span className="input-helper-text">{helperText}</span>}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
