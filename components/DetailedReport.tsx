import React, { useState } from 'react';
import { DetailedReportItem } from '../types';
import { LinkIcon } from './icons/LinkIcon';
import { LoadingIcon } from './icons/LoadingIcon';
import { SearchIcon } from './icons/SearchIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ScaleIcon } from './icons/ScaleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { CheckIcon } from './icons/CheckIcon';

interface DetailedReportProps {
  report: DetailedReportItem[];
  onExtendSearch: () => void;
  isExtending: boolean;
  onCancelExtendSearch: () => void;
  selectedReports: DetailedReportItem[];
  onSelectedReportsChange: (items: DetailedReportItem[]) => void;
  onStartComparison: () => void;
  onStartHypothesisGeneration: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col sm:flex-row">
            <dt className="font-semibold text-gray-800 dark:text-space-text w-full sm:w-40 flex-shrink-0">{label}</dt>
            <dd className="text-gray-600 dark:text-space-text-dim mt-1 sm:mt-0">{value}</dd>
        </div>
    );
};


const DetailedReport: React.FC<DetailedReportProps> = ({ 
    report, 
    onExtendSearch, 
    isExtending, 
    onCancelExtendSearch, 
    selectedReports,
    onSelectedReportsChange,
    onStartComparison,
    onStartHypothesisGeneration
}) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_ITEMS_TO_SHOW = 5;

  if (!report || report.length === 0) {
    return null;
  }
  
  const itemsToShow = showAll ? report : report.slice(0, INITIAL_ITEMS_TO_SHOW);
  const hasMoreItems = report.length > INITIAL_ITEMS_TO_SHOW;

  const handleToggleSelect = (itemToToggle: DetailedReportItem) => {
    const isSelected = selectedReports.some(item => item.title === itemToToggle.title && item.year === itemToToggle.year);
    if (isSelected) {
        onSelectedReportsChange(selectedReports.filter(item => !(item.title === itemToToggle.title && item.year === itemToToggle.year)));
    } else {
        onSelectedReportsChange([...selectedReports, itemToToggle]);
    }
  };

  const handleExport = () => {
    if (!report || report.length === 0) {
      return;
    }

    const headers: (keyof DetailedReportItem)[] = ['title', 'year', 'organism', 'mission_or_experiment', 'publication_type', 'main_findings', 'source_url'];
    
    const escapeCSV = (value: any): string => {
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(','),
      ...report.map(item => 
        headers.map(header => escapeCSV(item[header])).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'biosteller-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30">
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        <h3 className="text-xl font-bold font-display text-space-light-blue">Detailed Report</h3>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50 transition-all"
            disabled={!report || report.length === 0}
            aria-label="Export report data as CSV"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            <span>Export CSV</span>
          </button>
          {isExtending ? (
            <>
              <div className="flex items-center text-sm font-medium text-gray-700 dark:text-space-text-dim">
                <LoadingIcon className="h-4 w-4 mr-2" />
                <span>Finding More...</span>
              </div>
              <button
                onClick={onCancelExtendSearch}
                className="px-4 py-2 border border-gray-300 dark:border-space-blue/50 text-sm font-medium rounded-md text-gray-700 dark:text-space-text-dim bg-white dark:bg-space-dark hover:bg-gray-100 dark:hover:bg-space-blue/50 transition-colors"
                aria-label="Cancel finding more sources"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onExtendSearch}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-space-accent hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              <span>Find More Sources</span>
            </button>
          )}
          <button
            onClick={onStartComparison}
            disabled={selectedReports.length < 2}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-primary hover:bg-emerald-light disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            aria-label="Compare selected reports"
          >
            <ScaleIcon className="h-4 w-4 mr-2" />
            <span>Compare ({selectedReports.length})</span>
          </button>
          <button
            onClick={onStartHypothesisGeneration}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 transition-all"
            aria-label="Generate a new research hypothesis"
          >
            <LightbulbIcon className="h-4 w-4 mr-2" />
            <span>Generate Hypothesis</span>
          </button>
        </div>
      </div>
      <div id="detailed-report-items" className="space-y-4">
        {itemsToShow.map((item, index) => {
          const isSelected = selectedReports.some(selectedItem => selectedItem.title === item.title && selectedItem.year === item.year);
          return (
            <div
              key={index}
              id={`report-item-${index}`}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleToggleSelect(item)}
              onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggleSelect(item);
                  }
              }}
              className={`rounded-xl p-4 transition-all duration-200 cursor-pointer border-2 ${
                  isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-primary'
                      : 'bg-white dark:bg-space-dark/50 border-gray-200 dark:border-space-blue/30 hover:bg-gray-50 dark:hover:bg-space-dark hover:border-emerald-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                    <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${
                            isSelected
                                ? 'bg-emerald-primary border-emerald-primary'
                                : 'bg-gray-100 dark:bg-space-dark border-gray-300 dark:border-space-blue/50'
                        }`}
                        aria-hidden="true"
                    >
                        {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                </div>
                <div className="flex-grow">
                    <h4 id={`report-item-title-${index}`} className="font-bold text-lg text-gray-900 dark:text-space-text mb-3">{item.title}</h4>
                    <dl className="space-y-2 text-sm">
                      <DetailItem label="Year" value={item.year} />
                      <DetailItem label="Organism" value={item.organism} />
                      <DetailItem label="Mission/Experiment" value={item.mission_or_experiment} />
                      <DetailItem label="Publication Type" value={item.publication_type} />
                      <DetailItem label="Main Findings" value={item.main_findings} />
                    </dl>
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-space-light-blue hover:bg-blue-600 transition-colors"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        View Source at NASA
                      </a>
                    )}
                    {!item.source_url && (
                        <p className="mt-4 text-xs text-gray-500 dark:text-space-text-dim italic">(no NASA reference found)</p>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMoreItems && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-space-blue/30 text-center">
            <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 dark:border-space-blue/50 text-base font-medium rounded-md text-gray-700 dark:text-space-text-dim bg-white dark:bg-space-dark hover:bg-gray-100 dark:hover:bg-space-blue/50 disabled:cursor-not-allowed transition-colors"
                aria-live="polite"
                aria-expanded={showAll}
                aria-controls="detailed-report-items"
            >
                {showAll ? 'Show Less' : `Show ${report.length - INITIAL_ITEMS_TO_SHOW} More Sources`}
                {showAll ? <ChevronUpIcon className="ml-2 h-5 w-5" /> : <ChevronDownIcon className="ml-2 h-5 w-5" />}
            </button>
        </div>
      )}
    </div>
  );
};

export default DetailedReport;