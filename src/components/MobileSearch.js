import React, { useState, useRef, useEffect } from 'react';
import './MobileSearch.css';

const MobileSearch = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  suggestions = [],
  loading = false,
  showSuggestions = true,
  minSearchLength = 2,
  debounceMs = 300
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestionsList(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    setFocusedIndex(-1);

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      if (onChange) {
        onChange(newValue);
      }
      if (onSearch && newValue.length >= minSearchLength) {
        onSearch(newValue);
      }
    }, debounceMs);

    // Show suggestions if there are any and search has minimum length
    if (showSuggestions && suggestions.length > 0 && newValue.length >= minSearchLength) {
      setShowSuggestionsList(true);
    } else {
      setShowSuggestionsList(false);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (showSuggestions && suggestions.length > 0 && searchValue.length >= minSearchLength) {
      setShowSuggestionsList(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestionsList(false);
      setFocusedIndex(-1);
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion);
    setShowSuggestionsList(false);
    setFocusedIndex(-1);
    
    if (onChange) {
      onChange(suggestion);
    }
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestionsList || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[focusedIndex]);
        } else if (onSearch) {
          onSearch(searchValue);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setFocusedIndex(-1);
        searchRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setShowSuggestionsList(false);
    setFocusedIndex(-1);
    
    if (onChange) {
      onChange('');
    }
    if (onSearch) {
      onSearch('');
    }
    
    // Focus back to input
    searchRef.current?.focus();
  };

  const renderSuggestions = () => {
    if (!showSuggestionsList || suggestions.length === 0) return null;

    return (
      <div className="search-suggestions" ref={suggestionsRef}>
        <div className="suggestions-header">
          <span className="suggestions-title">Suggestions</span>
          <span className="suggestions-count">{suggestions.length} results</span>
        </div>
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${index === focusedIndex ? 'focused' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <span className="suggestion-icon">🔍</span>
              <span className="suggestion-text">{suggestion}</span>
              <span className="suggestion-action">Tap to select</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mobile-search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <div className="search-icon-wrapper">
          {loading ? (
            <div className="search-loading-spinner"></div>
          ) : (
            <span className="search-icon">🔍</span>
          )}
        </div>
        
        <input
          type="text"
          className={`search-input ${isFocused ? 'focused' : ''}`}
          value={searchValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        
        {searchValue && (
          <button
            className="clear-search-btn"
            onClick={handleClearSearch}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
        
        <button
          className="search-submit-btn"
          onClick={() => onSearch && onSearch(searchValue)}
          disabled={!searchValue || searchValue.length < minSearchLength}
          aria-label="Submit search"
          type="button"
        >
          Search
        </button>
      </div>
      
      {renderSuggestions()}
      
      {/* Search Status */}
      {searchValue && (
        <div className="search-status">
          {loading ? (
            <span className="status-loading">🔄 Searching...</span>
          ) : searchValue.length < minSearchLength ? (
            <span className="status-hint">💡 Type at least {minSearchLength} characters</span>
          ) : suggestions.length > 0 ? (
            <span className="status-results">✅ {suggestions.length} results found</span>
          ) : (
            <span className="status-no-results">❌ No results found</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileSearch;
