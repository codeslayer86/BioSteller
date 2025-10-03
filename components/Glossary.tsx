import React, { useState, FormEvent } from 'react';
import { getAiGlossaryTerm } from '../services/aiService';
import { AiGlossaryTermResult } from '../types';
import { LoadingIcon } from './icons/LoadingIcon';
import { SearchIcon } from './icons/SearchIcon';
import ErrorMessage from './ErrorMessage';
import { BookOpenIcon } from './icons/BookOpenIcon';

const SUGGESTED_TERMS = ["Microgravity", "Cosmic Radiation", "Gene Expression", "Hydroponics"];

const Glossary: React.FC = () => {
    const [term, setTerm] = useState('');
    const [result, setResult] = useState<AiGlossaryTermResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const definition = await getAiGlossaryTerm(searchTerm);
            setResult(definition);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch definition.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSearch(term);
    };

    return (
        <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30">
            <div className="flex items-center gap-4 mb-4">
                <BookOpenIcon className="w-8 h-8 text-emerald-primary dark:text-emerald-accent-bright" />
                <div>
                    <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white">AI-Powered Glossary</h3>
                    <p className="text-md text-gray-600 dark:text-space-text-dim">Look up complex terms in space biology.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="e.g., 'Microgravity'"
                    className="flex-grow bg-white dark:bg-space-dark border border-gray-300 dark:border-space-blue/50 rounded-lg py-2 px-4 focus:ring-2 focus:ring-space-light-blue focus:outline-none"
                    disabled={isLoading}
                />
                <button type="submit" className="flex-shrink-0 px-4 py-2 bg-space-blue text-white rounded-lg hover:bg-space-light-blue disabled:bg-gray-400" disabled={isLoading || !term.trim()}>
                    {isLoading ? <LoadingIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
                </button>
            </form>
            
            <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-sm font-semibold text-gray-600 dark:text-space-text-dim mr-2">Try:</span>
                {SUGGESTED_TERMS.map(suggestedTerm => (
                    <button key={suggestedTerm} onClick={() => { setTerm(suggestedTerm); handleSearch(suggestedTerm); }} className="px-3 py-1 text-sm rounded-full bg-emerald-primary/10 text-emerald-dark dark:bg-emerald-accent-bright/20 dark:text-emerald-accent-bright hover:bg-emerald-primary/20 transition-colors" disabled={isLoading}>
                        {suggestedTerm}
                    </button>
                ))}
            </div>

            {isLoading && (
                 <div className="flex items-center justify-center p-4">
                    <LoadingIcon className="w-6 h-6 text-space-light-blue" />
                    <span className="ml-3 text-gray-700 dark:text-space-text">Defining term...</span>
                 </div>
            )}
            {error && <ErrorMessage type="error" title="Could not fetch definition" message={error} />}
            {result && !isLoading && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-space-dark/20 rounded-lg border border-gray-200 dark:border-space-blue/30 animate-fade-in-up">
                    <h4 className="text-xl font-bold text-space-light-blue">{result.term}</h4>
                    <p className="mt-2 text-gray-700 dark:text-ivory-text whitespace-pre-wrap">{result.definition}</p>
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-space-blue/30">
                        <h5 className="font-semibold text-sm text-gray-800 dark:text-ivory-text">Relevance to Space Biology:</h5>
                        <p className="mt-1 text-sm text-gray-600 dark:text-ivory-text-dim whitespace-pre-wrap">{result.relevance}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Glossary;
