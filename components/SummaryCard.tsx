import React, { useState, useCallback } from 'react';
import { AiSearchSummary, DetailedReportItem } from '../types';
import { CopyIcon } from './icons/CopyIcon';

interface SummaryCardProps {
  summary: AiSearchSummary;
  detailed_report: DetailedReportItem[];
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary, detailed_report }) => {
  const { overview, years_range, highlight_points } = summary;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const reportText = detailed_report.map(item => 
      `Title: ${item.title}\n` +
      `Year: ${item.year}\n` +
      `Organism: ${item.organism}\n` +
      `Mission/Experiment: ${item.mission_or_experiment}\n` +
      `Main Findings: ${item.main_findings}\n` +
      `Source: ${item.source_url || 'N/A'}`
    ).join('\n\n---\n\n');
    
    const highlightText = highlight_points.map(item => 
      `- ${item.point}:\n  ${item.explanation}`
    ).join('\n\n');

    const fullText = 
      `AI-Generated Summary (${years_range})\n` +
      `=========================\n\n` +
      `${overview}\n\n` +
      `Highlight Points:\n` +
      `${highlightText}\n\n` +
      `Detailed Report\n` +
      `===============\n\n` +
      `${reportText}`;
      
    navigator.clipboard.writeText(fullText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }, [summary, detailed_report, years_range, overview, highlight_points]);


  return (
    <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 h-full">
      <div className="flex justify-between items-start mb-3 gap-4">
        <h3 className="text-xl font-bold font-display text-space-light-blue">AI-Generated Summary</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-white bg-space-accent px-2.5 py-1 rounded-full">{years_range}</span>
          <button 
            onClick={handleCopy}
            className="flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-space-light-blue hover:bg-blue-600 disabled:bg-blue-400 transition-colors"
            aria-label="Copy results"
            disabled={isCopied}
          >
            <CopyIcon className="h-4 w-4 mr-1.5" />
            <span aria-live="polite">{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <p className="text-gray-600 dark:text-space-text-dim mb-4 leading-relaxed whitespace-pre-wrap">
        {overview}
      </p>
      
      <div className="border-t border-gray-200 dark:border-space-blue/30 pt-4">
        <h4 className="font-semibold text-gray-800 dark:text-space-text mb-3">Highlight Points</h4>
        <ul className="space-y-3">
          {highlight_points.map((item, index) => (
            <li key={index}>
              <div className="flex items-start">
                <span className="text-space-accent mr-2 mt-1" aria-hidden="true">&#10148;</span>
                <span className="font-semibold text-gray-800 dark:text-space-text text-sm">{item.point}</span>
              </div>
              <p className="ml-6 text-gray-600 dark:text-space-text-dim text-sm mt-1">{item.explanation}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SummaryCard;