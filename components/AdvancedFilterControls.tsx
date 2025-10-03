import React, { useState, useEffect, useRef } from 'react';
import { AdvancedFilters } from '../types';
import { FilterIcon } from './icons/FilterIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ClearIcon } from './icons/ClearIcon';
import RangeSlider from './RangeSlider';
import { SearchIcon } from './icons/SearchIcon';

interface AdvancedFilterControlsProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onReset: () => void;
  onSearch: () => void;
  isSearchDisabled: boolean;
  organismOptions: string[];
  missionOptions: string[];
  researchAreaOptions: string[];
  publicationTypeOptions: string[];
}

const MultiSelectDropdown: React.FC<{
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}> = ({ options, selectedOptions, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAll = () => onChange(options);
  const handleClear = () => onChange([]);
  const handleOptionToggle = (option: string) => {
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter(o => o !== option)
      : [...selectedOptions, option];
    onChange(newSelected);
  };

  const buttonText = selectedOptions.length === 0
    ? `All ${placeholder}`
    : selectedOptions.length === options.length
      ? `All ${placeholder}`
      : `${selectedOptions.length} ${placeholder} Selected`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left bg-white dark:bg-space-dark border border-gray-300 dark:border-space-blue/50 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-space-light-blue"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{buttonText}</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-charcoal-deep border border-gray-300 dark:border-space-blue/50 rounded-md shadow-lg max-h-60 overflow-auto select-none">
          <div className="p-2 flex justify-between border-b border-gray-200 dark:border-space-blue/50">
            <button onClick={handleSelectAll} className="text-xs text-space-light-blue hover:underline">Select All</button>
            <button onClick={handleClear} className="text-xs text-space-light-blue hover:underline">Clear</button>
          </div>
          <ul role="listbox">
            {options.map(option => (
              <li key={option} className="px-3 py-2 text-sm text-charcoal-text dark:text-ivory-text hover:bg-emerald-primary hover:text-white dark:hover:bg-emerald-primary dark:hover:text-white cursor-pointer select-none">
                <label className="flex items-center w-full cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={() => handleOptionToggle(option)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-space-light-blue focus:ring-space-light-blue bg-gray-100 dark:bg-gray-700"
                  />
                  <span className="ml-3 truncate">{option}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const AdvancedFilterControls: React.FC<AdvancedFilterControlsProps> = ({ filters, onFiltersChange, onReset, onSearch, isSearchDisabled, organismOptions, missionOptions, researchAreaOptions, publicationTypeOptions }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/50 dark:bg-space-dark/30 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-space-blue/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-lg font-bold font-display text-gray-900 dark:text-white"
        aria-expanded={isExpanded}
        aria-controls="advanced-filters-panel"
      >
        <span className="flex items-center">
            <FilterIcon className="w-5 h-5 mr-3 text-space-light-blue" />
            Advanced Search Filters
        </span>
        <ChevronDownIcon className={`w-6 h-6 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div id="advanced-filters-panel" className="mt-4 pt-4 border-t border-gray-200 dark:border-space-blue/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-space-text-dim mb-1">Year Range</label>
              <RangeSlider 
                min={1960}
                max={new Date().getFullYear()}
                value={filters.yearRange}
                onChange={(newRange) => onFiltersChange({...filters, yearRange: newRange})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-space-text-dim mb-1">Organisms</label>
              <MultiSelectDropdown
                options={organismOptions}
                selectedOptions={filters.organisms}
                onChange={(selected) => onFiltersChange({ ...filters, organisms: selected })}
                placeholder="Organisms"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-space-text-dim mb-1">Missions / Platforms</label>
              <MultiSelectDropdown
                options={missionOptions}
                selectedOptions={filters.missions}
                onChange={(selected) => onFiltersChange({ ...filters, missions: selected })}
                placeholder="Missions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-space-text-dim mb-1">Research Area</label>
              <MultiSelectDropdown
                options={researchAreaOptions}
                selectedOptions={filters.researchAreas}
                onChange={(selected) => onFiltersChange({ ...filters, researchAreas: selected })}
                placeholder="Areas"
              />
            </div>
            
            <div className="md:col-span-2 lg:col-span-3">
               <label className="block text-sm font-medium text-gray-700 dark:text-space-text-dim mb-1">Publication Type</label>
              <MultiSelectDropdown
                options={publicationTypeOptions}
                selectedOptions={filters.publicationTypes}
                onChange={(selected) => onFiltersChange({ ...filters, publicationTypes: selected })}
                placeholder="Types"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-x-4">
            <button
                onClick={onReset}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-space-blue/50 text-sm font-medium rounded-md text-gray-700 dark:text-space-text-dim bg-white dark:bg-space-dark hover:bg-gray-100 dark:hover:bg-space-blue/50 transition-colors"
            >
                <ClearIcon className="w-4 h-4 mr-2" />
                Reset Filters
            </button>
            <button
                onClick={onSearch}
                disabled={isSearchDisabled}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-space-blue to-space-light-blue hover:from-blue-600 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <SearchIcon className="w-4 h-4 mr-2" />
                Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterControls;