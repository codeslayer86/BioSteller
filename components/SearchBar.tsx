import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  suggestions: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, onSearch, isLoading, isDisabled, suggestions: allSuggestions }) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    onQueryChange(userInput);
    setActiveSuggestionIndex(-1);

    if (userInput) {
      const newFilteredSuggestions = allSuggestions
        .filter(suggestion => suggestion.toLowerCase().includes(userInput.toLowerCase()))
        .slice(0, 7); // Limit suggestions for clarity
      setFilteredSuggestions(newFilteredSuggestions);
      setShowSuggestions(newFilteredSuggestions.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const handleFocus = () => {
      if (query && filteredSuggestions.length > 0) {
          setShowSuggestions(true);
      }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prevIndex =>
        prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex > -1 && filteredSuggestions[activeSuggestionIndex]) {
        e.preventDefault();
        handleSuggestionClick(filteredSuggestions[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setShowSuggestions(false);
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-grow transition-transform duration-300 ease-in-out hover:scale-[1.02]" ref={searchContainerRef}>
      <div className="relative flex-grow">
        <label htmlFor="main-search-input" className="sr-only">AI Knowledge Search</label>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400 dark:text-space-text-dim" />
        </div>
        <input
          id="main-search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="e.g., 'plants in microgravity'"
          className="w-full bg-white dark:bg-space-dark border border-gray-300 dark:border-space-blue/50 rounded-lg py-4 pl-12 pr-4 focus:ring-2 focus:ring-space-light-blue focus:outline-none text-base sm:text-lg text-gray-900 dark:text-space-text placeholder-gray-500 dark:placeholder-space-text-dim transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isLoading}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul 
            id="suggestions-list"
            className="absolute z-20 w-full mt-1 bg-white dark:bg-space-dark border border-gray-300 dark:border-space-blue/50 rounded-lg shadow-lg overflow-y-auto max-h-80"
            role="listbox"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-3 cursor-pointer text-gray-700 dark:text-space-text-dim transition-colors ${
                  index === activeSuggestionIndex
                    ? 'bg-space-light-blue text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-space-blue/50'
                }`}
                role="option"
                aria-selected={index === activeSuggestionIndex}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="submit"
        className="flex-shrink-0 flex items-center justify-center px-6 py-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-space-blue to-space-light-blue hover:from-blue-600 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100"
        disabled={isDisabled}
        aria-label="Submit search"
      >
        <SearchIcon className="h-5 w-5 md:mr-2" />
        <span className="hidden md:inline">Search</span>
      </button>
    </form>
  );
};

export default SearchBar;