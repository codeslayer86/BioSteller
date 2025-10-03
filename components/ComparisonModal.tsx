import React, { useState, useEffect } from 'react';
import { DetailedReportItem, AiComparisonResult } from '../types';
import { getAiComparison } from '../services/aiService';
import { CloseIcon } from './icons/CloseIcon';
import { LoadingIcon } from './icons/LoadingIcon';
import ErrorMessage from './ErrorMessage';
import { BotIcon } from './icons/BotIcon';

interface ComparisonModalProps {
  items: DetailedReportItem[];
  onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ items, onClose }) => {
  const [result, setResult] = useState<AiComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      if (items.length < 2) {
        setError("At least two items must be selected for comparison.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const comparisonResult = await getAiComparison(items);
        setResult(comparisonResult);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while generating the comparison.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComparison();
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4 animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-ivory-bg dark:bg-charcoal-deep w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-space-blue/50 flex-shrink-0">
          <h2 id="comparison-modal-title" className="text-xl font-bold font-display text-gray-900 dark:text-white">
            Comparative Analysis
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-space-blue/50" aria-label="Close comparison">
            <CloseIcon className="w-6 h-6 text-gray-600 dark:text-space-text-dim" />
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-space-dark/20">
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-full">
              <LoadingIcon className="h-10 w-10 text-space-light-blue" />
              <p className="mt-4 text-lg text-gray-700 dark:text-space-text">AI is analyzing the reports...</p>
            </div>
          )}
          {error && !isLoading && (
            <ErrorMessage title="Analysis Failed" message={error} type="error" />
          )}
          {result && !isLoading && (
            <div className="space-y-10">
              <section>
                <h3 className="text-2xl font-bold font-display text-emerald-primary dark:text-emerald-accent-bright mb-3">Comparison Summary</h3>
                <p className="text-lg text-gray-700 dark:text-ivory-text leading-relaxed whitespace-pre-wrap bg-white dark:bg-space-dark/30 p-4 rounded-lg border border-gray-200 dark:border-space-blue/30">{result.comparison_summary}</p>
              </section>

              <div className="space-y-8">
                {result.key_comparison_points.map((point, index) => (
                  <section key={index} className="p-6 rounded-lg bg-white dark:bg-space-dark/50 border border-gray-200 dark:border-space-blue/30">
                    <h4 className="text-xl font-bold font-display text-gray-900 dark:text-ivory-text mb-6 pb-3 border-b border-gray-200 dark:border-space-blue/30">{point.aspect}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {point.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="bg-gray-100 dark:bg-space-dark p-4 rounded-lg h-full flex flex-col">
                              <p className="text-sm font-semibold text-gray-600 dark:text-ivory-text-dim truncate flex-shrink-0" title={detail.report_title}>{detail.report_title}</p>
                              <p className="text-base text-gray-800 dark:text-ivory-text mt-2 flex-grow">{detail.value}</p>
                          </div>
                      ))}
                    </div>

                    <div className="mt-6">
                        <div className="flex items-start gap-4 bg-emerald-primary/10 dark:bg-emerald-accent-bright/10 p-4 rounded-lg">
                            <div className="flex-shrink-0 text-emerald-primary dark:text-emerald-accent-bright mt-1">
                                <BotIcon className="w-6 h-6" /> 
                            </div>
                            <div>
                                <h5 className="font-bold text-emerald-dark dark:text-emerald-accent-bright">AI Synthesis</h5>
                                <p className="text-base text-emerald-dark/90 dark:text-ivory-text leading-relaxed mt-1">{point.synthesis}</p>
                            </div>
                        </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ComparisonModal;
