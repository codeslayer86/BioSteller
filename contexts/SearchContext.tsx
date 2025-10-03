import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { AiSearchResult, TimelineAnalysisData } from '../types';

interface SearchContextType {
  searchResult: AiSearchResult | null;
  setSearchResult: (result: AiSearchResult | null) => void;
  timelineAnalysis: TimelineAnalysisData | null;
  setTimelineAnalysis: React.Dispatch<React.SetStateAction<TimelineAnalysisData | null>>;
  currentQuery: string;
  setCurrentQuery: React.Dispatch<React.SetStateAction<string>>;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchResult, setSearchResultState] = useState<AiSearchResult | null>(null);
  const [timelineAnalysis, setTimelineAnalysis] = useState<TimelineAnalysisData | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');

  const setSearchResult = useCallback((result: AiSearchResult | null) => {
    setSearchResultState(result);
    setTimelineAnalysis(null); // Clear timeline analysis when new search is made
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResultState(null);
    setTimelineAnalysis(null);
    setCurrentQuery('');
  }, []);


  return (
    <SearchContext.Provider value={{ searchResult, setSearchResult, timelineAnalysis, setTimelineAnalysis, currentQuery, setCurrentQuery, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};