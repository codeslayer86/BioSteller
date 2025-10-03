import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import InteractiveTimeline from '../components/InteractiveTimeline';
import { getTimelineAnalysis } from '../services/aiService';
import { TimelineAnalysisData } from '../types';
import { LoadingIcon } from '../components/icons/LoadingIcon';
import { RocketIcon } from '../components/icons/RocketIcon';
import { GlobeIcon } from '../components/icons/GlobeIcon';
import { TelescopeIcon } from '../components/icons/TelescopeIcon';
import Glossary from '../components/Glossary';
import LearningPaths from '../components/LearningPaths';

const AnalysisCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 flex flex-col items-start h-full">
    <div className="flex items-center gap-4 mb-3">
      <div className="flex-shrink-0 bg-emerald-primary/10 dark:bg-emerald-accent-bright/20 p-3 rounded-full text-emerald-primary dark:text-emerald-accent-bright">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-ivory-text text-base leading-relaxed whitespace-pre-wrap">{children}</p>
  </div>
);

const TimelineAnalysis: React.FC<{ analysis: TimelineAnalysisData }> = ({ analysis }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-4 text-center">AI-Powered Impact Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnalysisCard title="Mission Application" icon={<RocketIcon className="w-8 h-8" />}>
                {analysis.mission_effectiveness}
            </AnalysisCard>
            <AnalysisCard title="Future Potential" icon={<TelescopeIcon className="w-8 h-8" />}>
                {analysis.future_potential}
            </AnalysisCard>
            <AnalysisCard title="Real-World Impact" icon={<GlobeIcon className="w-8 h-8" />}>
                {analysis.real_world_impact}
            </AnalysisCard>
        </div>
    </div>
);


const TimelinePage: React.FC = () => {
  const { searchResult, timelineAnalysis, setTimelineAnalysis } = useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect handles fetching the AI-powered timeline analysis.
    // It prevents unnecessary re-fetching by only running if:
    // 1. A search result exists with data to analyze.
    // 2. An analysis for the *current* search result has not already been generated
    //    and stored in the context (`!timelineAnalysis`).
    // The `SearchContext` handles marking the analysis as "outdated" by setting it to `null`
    // whenever a new search is performed, which correctly triggers this hook to re-fetch.
    if (searchResult && searchResult.detailed_report.length > 0 && !timelineAnalysis) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await getTimelineAnalysis(searchResult);
          setTimelineAnalysis(result);
        } catch (err: any) {
          setError(err.message || 'Failed to generate analysis.');
          // Clear any potentially stale analysis on error
          setTimelineAnalysis(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnalysis();
    } else {
      // If there's no search result or analysis is already loaded, ensure loading is false.
      setIsLoading(false);
      setError(null);
    }
  }, [searchResult, timelineAnalysis, setTimelineAnalysis]);

  const timelineData = searchResult?.detailed_report;

  return (
    <div className="animate-fade-in-up space-y-12">
      <div className="text-center">
          <h1 className="text-4xl font-bold font-display text-gray-900 dark:text-white mb-2">Timeline & Learning Hub</h1>
          <p className="text-lg text-gray-600 dark:text-space-text-dim">
            Visualize research progression, analyze its impact, and access educational tools to deepen your understanding.
          </p>
      </div>

      {searchResult ? (
        <div className="space-y-12">
          <section>
            {isLoading && (
              <div role="status" className="flex flex-col justify-center items-center mt-8 bg-white dark:bg-space-dark/50 rounded-lg p-8 min-h-[300px] border border-gray-200 dark:border-space-blue/30">
                <LoadingIcon className="h-10 w-10 text-space-light-blue" />
                <p className="mt-4 text-lg text-gray-700 dark:text-space-text">Generating Impact Analysis...</p>
                <p className="text-sm text-gray-500 dark:text-space-text-dim">The AI is synthesizing the data, please wait.</p>
              </div>
            )}
            {error && <p role="alert" className="mt-4 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/50 p-4 rounded-md">{error}</p>}
            {timelineAnalysis && !isLoading && <TimelineAnalysis analysis={timelineAnalysis} />}
          </section>

          <div className="w-full h-px bg-gray-300 dark:bg-space-blue/30"></div>

          <section>
            <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2 text-center">Chronological View</h2>
            <p className="text-md text-gray-600 dark:text-space-text-dim mb-6 text-center">
              Explore a chronological view of the research. Use the slider below to focus on a specific time range.
            </p>
            {timelineData && timelineData.length > 0 ? (
              <InteractiveTimeline data={timelineData} />
            ) : (
              <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 text-center py-12 text-gray-500 dark:text-space-text-dim">
                  <p className="mb-4">The search result contains no specific reports to build a timeline.</p>
              </div>
            )}
          </section>
          
          <div className="w-full h-px bg-gray-300 dark:bg-space-blue/30"></div>

          <section id="educational-tools" className="space-y-12">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">Educational Tools</h2>
                <p className="text-md text-gray-600 dark:text-space-text-dim">
                  Use these tools to learn more about key concepts in space biology.
                </p>
            </div>
            <Glossary />
            <LearningPaths />
          </section>
        </div>
      ) : (
        <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 text-center py-12 text-gray-500 dark:text-space-text-dim">
          <p className="mb-4">The timeline and impact analysis require search data. Please perform a search first.</p>
          <Link 
            to="/explore"
            className="inline-block px-6 py-3 border border-space-accent text-base font-medium rounded-md text-space-accent bg-transparent hover:bg-space-accent/10 dark:hover:bg-space-accent/20 transition-colors"
          >
            Perform a Search
          </Link>
          <div className="w-full h-px bg-gray-300 dark:bg-space-blue/30 my-8"></div>
          <div className="space-y-12 text-left">
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4 text-center">Or, start your journey with our educational tools:</h2>
            <Glossary />
            <LearningPaths />
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;