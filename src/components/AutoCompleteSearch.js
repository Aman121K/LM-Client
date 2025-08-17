import React, { useState, useEffect, useRef } from 'react';
import './AutoCompleteSearch.css';

const AutoCompleteSearch = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Search users...",
  suggestions = [],
  loading = false 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else {
          onSearch(value);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="highlight">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="autocomplete-container" ref={inputRef}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(value.length > 0)}
          placeholder={placeholder}
          className="autocomplete-input"
        />
        {loading && <div className="search-spinner">⏳</div>}
        {value && (
          <button 
            className="clear-search-btn"
            onClick={() => {
              onChange('');
              setShowSuggestions(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="suggestions-container" ref={suggestionsRef}>
          {suggestions.length > 0 ? (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {highlightMatch(suggestion, value)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-suggestions">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteSearch;
