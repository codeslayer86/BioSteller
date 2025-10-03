import React, { useState, useEffect } from 'react';
import { AiSearchResult, AiHypothesisResult } from '../types';
import { getAiHypothesis } from '../services/aiService';
import { CloseIcon } from './icons/CloseIcon';
import { LoadingIcon } from './icons/LoadingIcon';
import ErrorMessage from './ErrorMessage';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { ThoughtBubbleIcon } from './icons/ThoughtBubbleIcon';
import { BeakerIcon } from './icons/BeakerIcon';


interface HypothesisModalProps {
  searchResult: AiSearchResult;
  onClose: () => void;
}

const HypothesisModal: React.FC<HypothesisModalProps> = ({ searchResult, onClose }) => {
  const [result, setResult] = useState<AiHypothesisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHypothesis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const hypothesisResult = await getAiHypothesis(searchResult);
        setResult(hypothesisResult);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while generating the hypothesis.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHypothesis();
  }, [searchResult]);

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
      aria-labelledby="hypothesis-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-ivory-bg dark:bg-charcoal-deep w-full max-w-3xl h-auto max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-space-blue/50 flex-shrink-0">
          <h2 id="hypothesis-modal-title" className="text-xl font-bold font-display text-gray-900 dark:text-white">
            AI-Generated Hypothesis
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-space-blue/50" aria-label="Close hypothesis">
            <CloseIcon className="w-6 h-6 text-gray-600 dark:text-space-text-dim" />
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-space-dark/20">
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-full min-h-[300px]">
              <LoadingIcon className="h-10 w-10 text-space-light-blue" />
              <p className="mt-4 text-lg text-gray-700 dark:text-space-text">Synthesizing a new research direction...</p>
            </div>
          )}
          {error && !isLoading && (
            <ErrorMessage title="Hypothesis Generation Failed" message={error} type="error" />
          )}
          {result && !isLoading && (
            <div className="space-y-8">
              <section className="bg-gradient-to-br from-emerald-primary/10 to-transparent dark:from-emerald-accent-bright/10 dark:to-transparent p-6 rounded-lg border border-emerald-primary/30">
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0 text-emerald-primary dark:text-emerald-accent-bright">
                        <LightbulbIcon className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-ivory-text">Hypothesis Statement</h3>
                </div>
                <blockquote className="ml-4 pl-4 border-l-4 border-emerald-primary/50">
                    <p className="text-lg font-semibold italic text-gray-800 dark:text-ivory-text leading-relaxed">
                        "{result.hypothesis_statement}"
                    </p>
                </blockquote>
              </section>

              <div className="w-full h-px bg-gray-200 dark:bg-space-blue/30"></div>

              <section>
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0 text-gray-500 dark:text-ivory-text-dim">
                        <ThoughtBubbleIcon className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-ivory-text">Rationale</h3>
                </div>
                <p className="text-base text-gray-700 dark:text-ivory-text leading-relaxed whitespace-pre-wrap ml-12">
                    {result.rationale}
                </p>
              </section>
              
              <section>
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0 text-gray-500 dark:text-ivory-text-dim">
                        <BeakerIcon className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-ivory-text">Suggested Next Steps</h3>
                </div>
                <p className="text-base text-gray-700 dark:text-ivory-text leading-relaxed whitespace-pre-wrap ml-12">
                    {result.suggested_next_steps}
                </p>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HypothesisModal;
