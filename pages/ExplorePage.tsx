import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getAiSummary, getExtendedAiSummary } from '../services/aiService';
import { useSearch } from '../contexts/SearchContext';
import SearchBar from '../components/SearchBar';
import SummaryCard from '../components/SummaryCard';
import KnowledgeGraph, { type ExportHandles } from '../components/KnowledgeGraph';
import DataDashboard from '../components/DataDashboard';
import DetailedReport from '../components/DetailedReport';
import { LoadingIcon } from '../components/icons/LoadingIcon';
import SuggestedTopics from '../components/SuggestedTopics';
import { ClearIcon } from '../components/icons/ClearIcon';
import { allTopics, ORGANISM_TYPES, MISSION_PLATFORMS, RESEARCH_AREAS, PUBLICATION_TYPES } from '../constants';
import GraphFilterControls from '../components/GraphFilterControls';
import GraphPhysicsControls from '../components/GraphPhysicsControls';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import AdvancedFilterControls from '../components/AdvancedFilterControls';
import { AdvancedFilters, DetailedReportItem, AiSearchResult } from '../types';
import ErrorMessage from '../components/ErrorMessage';
import ActiveSearchInfo from '../components/ActiveSearchInfo';
import ComparisonModal from '../components/ComparisonModal';
import HypothesisModal from '../components/HypothesisModal';

const GraphExportControls: React.FC<{
  onExportSvg: () => void;
  onExportPng: () => void;
}> = ({ onExportSvg, onExportPng }) => {
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

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-space-blue/50 shadow-sm px-4 py-2 bg-white dark:bg-space-dark text-sm font-medium text-gray-700 dark:text-space-text hover:bg-gray-50 dark:hover:bg-space-blue/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-space-dark focus:ring-space-light-blue"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <DownloadIcon className="-ml-1 mr-2 h-5 w-5" />
          Export
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-space-dark ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => { onExportPng(); setIsOpen(false); }}
              className="w-full text-left text-gray-700 dark:text-space-text-dim block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-space-blue/50"
              role="menuitem"
            >
              Export as PNG
            </button>
            <button
              onClick={() => { onExportSvg(); setIsOpen(false); }}
              className="w-full text-left text-gray-700 dark:text-space-text-dim block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-space-blue/50"
              role="menuitem"
            >
              Export as SVG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const defaultFilters: AdvancedFilters = {
  yearRange: [1960, new Date().getFullYear()],
  organisms: [],
  missions: [],
  researchAreas: [],
  publicationTypes: [],
};

const ExplorePage: React.FC = () => {
  const { searchResult, setSearchResult, currentQuery, setCurrentQuery, clearSearch } = useSearch();
  const [queryText, setQueryText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [nodeTypes, setNodeTypes] = useState<string[]>([]);
  const [activeGraphFilters, setActiveGraphFilters] = useState<{ [key: string]: boolean }>({});
  const [forceParams, setForceParams] = useState({
    charge: -450,
    linkDistance: 150,
    collisionRadius: 40,
  });
  
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(defaultFilters);
  const [selectedReports, setSelectedReports] = useState<DetailedReportItem[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isHypothesisModalOpen, setIsHypothesisModalOpen] = useState(false);

  const prevIsLoading = useRef<boolean>(isLoading);
  const resultsSectionRef = useRef<HTMLElement>(null);
  const graphRef = useRef<ExportHandles>(null);

  useEffect(() => {
    if (prevIsLoading.current && !isLoading && (searchResult || noResults || error)) {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevIsLoading.current = isLoading;
  }, [isLoading, searchResult, noResults, error]);
  
  useEffect(() => {
    if (searchResult) {
      setIsLoading(false);
      if (searchResult.graph?.nodes) {
        const types = Array.from(new Set(searchResult.graph.nodes.map(n => n.type)));
        setNodeTypes(types);
        setActiveGraphFilters(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));
      }
    }
  }, [searchResult]);

  const filtersAreActive =
    advancedFilters.organisms.length > 0 ||
    advancedFilters.missions.length > 0 ||
    advancedFilters.researchAreas.length > 0 ||
    advancedFilters.publicationTypes.length > 0 ||
    advancedFilters.yearRange[0] !== defaultFilters.yearRange[0] ||
    advancedFilters.yearRange[1] !== defaultFilters.yearRange[1];

  const handleSearch = useCallback(async (queryOverride?: string) => {
    const currentSearchText = typeof queryOverride === 'string' ? queryOverride : queryText;
    if (isLoading || (!currentSearchText.trim() && !filtersAreActive)) return;
    
    setIsLoading(true);
    setError(null);
    setNoResults(false);
    setCurrentQuery(currentSearchText);
    
    try {
      const result = await getAiSummary({ query: currentSearchText, filters: advancedFilters });
      if (result.detailed_report.length === 0) {
        setNoResults(true);
      }
      setSearchResult(result);
    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred. The AI service may be unavailable or experiencing issues.';
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('failed to fetch')) {
            errorMessage = 'Network Error: Could not connect to the AI service. Please check your internet connection and ensure the backend is running if required.';
        } else if (err.message.includes('API_KEY')) {
            errorMessage = 'Configuration Error: The AI API key is missing or invalid. Please ensure it is set up correctly.';
        } else {
            errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [setSearchResult, setCurrentQuery, advancedFilters, queryText, isLoading, filtersAreActive]);

  useEffect(() => {
    // This effect runs once on mount to check for a URL query from the Learning Paths feature.
    const hash = window.location.hash;
    const queryParamIndex = hash.indexOf('?query=');
    if (queryParamIndex > -1) {
      const searchParams = new URLSearchParams(hash.slice(queryParamIndex));
      const queryFromUrl = searchParams.get('query');

      if (queryFromUrl) {
        setQueryText(queryFromUrl);
        handleSearch(queryFromUrl);
        // Clean the URL to prevent re-search on refresh
        window.history.replaceState(null, '', hash.split('?')[0]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount.
  
  const handleTopicSearch = (topic: string) => {
    setQueryText(topic);
    handleSearch(topic);
  };

  const handleExtendSearch = useCallback(async () => {
    if (!currentQuery || !searchResult) return;
    setIsExtending(true);
    setError(null);
    try {
      const extendedResult = await getExtendedAiSummary({ query: currentQuery, existingResult: searchResult, filters: advancedFilters });
      setSearchResult(extendedResult);
    } catch (err: any) {
      setError(err.message || 'Failed to extend the search. The backend may not be running.');
    } finally {
      setIsExtending(false);
    }
  }, [currentQuery, searchResult, setSearchResult, advancedFilters]);

  const handleCancelExtendSearch = useCallback(() => {
    setIsExtending(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    clearSearch();
    setError(null);
    setNoResults(false);
    setQueryText('');
    setNodeTypes([]);
    setActiveGraphFilters({});
    setAdvancedFilters(defaultFilters);
    setSelectedReports([]);
    setIsHypothesisModalOpen(false);
  }, [clearSearch]);
  
  const handleResetFilters = useCallback(() => {
    setAdvancedFilters(defaultFilters);
  }, []);

  const isSearchDisabled = isLoading || (!queryText.trim() && !filtersAreActive);

  const showResults = searchResult && !isLoading && !noResults;

  return (
    <>
      <div className="space-y-12 animate-fade-in-up">
        <section id="ai-search" aria-labelledby="ai-search-heading">
          <h1 id="ai-search-heading" className="text-4xl font-bold font-display text-gray-900 dark:text-white mb-2">AI Knowledge Search</h1>
          <p className="text-lg text-gray-600 dark:text-ivory-text-dim mb-6 text-center">Enter a topic, apply filters, and visualize NASA Space Biology research.</p>

          <div className="space-y-4">
            {!searchResult && !isLoading && !error && !noResults && (
               <div className="relative z-20">
                  <SuggestedTopics onTopicClick={handleTopicSearch} />
               </div>
            )}

            <div className="relative z-10 flex items-start gap-2">
                <SearchBar
                  query={queryText}
                  onQueryChange={setQueryText}
                  onSearch={() => handleSearch()}
                  isLoading={isLoading}
                  isDisabled={isSearchDisabled}
                  suggestions={allTopics}
                />
                {(searchResult || error || noResults) && !isLoading && (
                     <button
                     onClick={handleClearSearch}
                     className="flex-shrink-0 flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-space-blue/50 text-base font-medium rounded-md text-gray-700 dark:text-space-text-dim bg-white dark:bg-space-dark hover:bg-gray-100 dark:hover:bg-space-blue/50 disabled:cursor-not-allowed transition-colors"
                     disabled={isLoading}
                     aria-label="Clear search results"
                   >
                     <ClearIcon className="h-5 w-5 md:mr-2" />
                     <span className="hidden md:inline">Clear</span>
                   </button>
                )}
            </div>
            
            <AdvancedFilterControls
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
                onReset={handleResetFilters}
                onSearch={() => handleSearch()}
                isSearchDisabled={isSearchDisabled}
                organismOptions={ORGANISM_TYPES}
                missionOptions={MISSION_PLATFORMS}
                researchAreaOptions={RESEARCH_AREAS}
                publicationTypeOptions={PUBLICATION_TYPES}
            />
          </div>

          <section ref={resultsSectionRef}>
            {isLoading && (
              <div role="status" className="flex justify-center items-center mt-8 bg-gray-200 dark:bg-space-dark/50 rounded-lg p-8">
                 <LoadingIcon className="h-8 w-8 text-space-light-blue" />
                <p className="ml-4 text-lg text-gray-700 dark:text-space-text">Synthesizing knowledge from the cosmos...</p>
              </div>
            )}
            
            {error && !isLoading && (
                <ErrorMessage 
                    type="error"
                    title="Search Failed"
                    message={error}
                />
            )}

            {(showResults || noResults) && !isLoading && !error && (
                <ActiveSearchInfo query={currentQuery} filters={advancedFilters} />
            )}
            
            {noResults && !isLoading && !error && (
                <ErrorMessage
                    type="info"
                    title="No Results Found"
                    message="Try adjusting your search query or loosening your filter criteria."
                />
            )}

            {showResults && (
              <div className="mt-8 space-y-8">
                <SummaryCard 
                    summary={searchResult.summary} 
                    detailed_report={searchResult.detailed_report} 
                />
                <DetailedReport
                  report={searchResult.detailed_report}
                  onExtendSearch={handleExtendSearch}
                  isExtending={isExtending}
                  onCancelExtendSearch={handleCancelExtendSearch}
                  selectedReports={selectedReports}
                  onSelectedReportsChange={setSelectedReports}
                  onStartComparison={() => setIsComparisonModalOpen(true)}
                  onStartHypothesisGeneration={() => setIsHypothesisModalOpen(true)}
                />
              </div>
            )}
          </section>
        </section>

        <div className="w-full h-px bg-gray-300 dark:bg-space-blue/30 my-12"></div>

        <section id="knowledge-graph" aria-labelledby="knowledge-graph-heading">
          <h2 id="knowledge-graph-heading" className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">Interactive Knowledge Graph</h2>
          <p className="text-gray-600 dark:text-ivory-text mb-6">
            {!searchResult ? "Perform a search to generate and visualize connections between experiments, organisms, and findings." : "Visualize connections from your search results. Filter, zoom, pan, and hover over nodes to explore."}
          </p>
          {showResults && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                  <GraphFilterControls
                    nodeTypes={nodeTypes}
                    activeFilters={activeGraphFilters}
                    onFilterChange={setActiveGraphFilters}
                  />
                  <GraphExportControls
                    onExportSvg={() => graphRef.current?.exportAsSvg('biosteller-knowledge-graph')}
                    onExportPng={() => graphRef.current?.exportAsPng('bionovax-knowledge-graph')}
                  />
              </div>
              <GraphPhysicsControls
                params={forceParams}
                onParamsChange={setForceParams}
              />
            </>
          )}
          <div className="bg-white dark:bg-space-dark/50 rounded-lg shadow-md dark:shadow-lg h-[850px] w-full border border-gray-200 dark:border-space-blue/30 overflow-hidden">
            {showResults ? (
              <KnowledgeGraph ref={graphRef} data={searchResult.graph} filters={activeGraphFilters} forceParams={forceParams} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-space-text-dim">
                <p>{isLoading || isExtending ? 'Generating graph...' : 'Your knowledge graph will appear here.'}</p>
              </div>
            )}
          </div>
        </section>

        <div className="w-full h-px bg-gray-300 dark:bg-space-blue/30 my-12"></div>
        
        <section id="data-dashboard" aria-labelledby="data-dashboard-heading">
          <h2 id="data-dashboard-heading" className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">Data Visualization Dashboard</h2>
          <p className="text-gray-600 dark:text-ivory-text mb-6">
            {searchResult ? "Explore trends from your search results." : "Perform a search to generate a data dashboard from the findings."}
          </p>
          {showResults && searchResult.detailed_report ? (
              <DataDashboard data={searchResult.detailed_report} />
          ) : (
              <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 text-center py-12 text-gray-500 dark:text-space-text-dim">
                  <p>{isLoading || isExtending ? 'Generating dashboard...' : 'Your data dashboard will appear here after a search.'}</p>
              </div>
          )}
        </section>
      </div>
      {isComparisonModalOpen && selectedReports.length > 0 && (
          <ComparisonModal
              items={selectedReports}
              onClose={() => setIsComparisonModalOpen(false)}
          />
      )}
      {isHypothesisModalOpen && searchResult && (
          <HypothesisModal
              searchResult={searchResult}
              onClose={() => setIsHypothesisModalOpen(false)}
          />
      )}
    </>
  );
};

export default ExplorePage;