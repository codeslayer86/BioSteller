import { AiSearchResult, AdvancedFilters, TimelineAnalysisData, AiComparisonResult, DetailedReportItem, AiHypothesisResult, AiGlossaryTermResult, ChatHistoryItem } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * A helper function to handle POST requests to the backend API.
 * It centralizes fetch logic, JSON handling, and error reporting.
 * @param endpoint The API endpoint to call (e.g., 'search').
 * @param body The JSON body for the POST request.
 * @returns The parsed JSON response from the backend.
 */
async function postToBackend<T>(endpoint: string, body: object): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            // Try to parse a structured error from the backend, otherwise create a generic one.
            const errorData = await response.json().catch(() => ({ 
                error: 'Failed to parse error response from backend.' 
            }));
            throw new Error(errorData.details || errorData.error || `Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching from backend endpoint /${endpoint}:`, error);
        // Improve network error message for the user.
        if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
             throw new Error('Network Error: Could not connect to the backend service. Please ensure the backend server is running and accessible.');
        }
        // Re-throw other errors to be caught by the UI.
        throw error;
    }
}


interface AiSummaryParams {
  query: string;
  filters: AdvancedFilters;
}

interface AiExtendSummaryParams {
  query: string;
  existingResult: AiSearchResult;
  filters: AdvancedFilters;
}

interface AiChatParams {
  query: string;
  initialSearchQuery: string;
  searchResultContext: AiSearchResult;
  history: ChatHistoryItem[];
}

export const getAiSummary = async ({ query, filters }: AiSummaryParams): Promise<AiSearchResult> => {
  return postToBackend<AiSearchResult>('search', { query, filters });
};

export const getExtendedAiSummary = async ({ query, existingResult, filters }: AiExtendSummaryParams): Promise<AiSearchResult> => {
  return postToBackend<AiSearchResult>('extend-search', { query, existingResult, filters });
};

export const getTimelineAnalysis = async (searchResult: AiSearchResult): Promise<TimelineAnalysisData> => {
  return postToBackend<TimelineAnalysisData>('timeline-analysis', { searchResult });
};

export const getAiComparison = async (items: DetailedReportItem[]): Promise<AiComparisonResult> => {
  return postToBackend<AiComparisonResult>('comparison', { items });
};

export const getAiHypothesis = async (searchResult: AiSearchResult): Promise<AiHypothesisResult> => {
  return postToBackend<AiHypothesisResult>('hypothesis', { searchResult });
};

export const getAiGlossaryTerm = async (term: string): Promise<AiGlossaryTermResult> => {
  return postToBackend<AiGlossaryTermResult>('glossary', { term });
};

export const getAiChatResponseStream = async ({ query, initialSearchQuery, searchResultContext, history }: AiChatParams): Promise<ReadableStream<Uint8Array> | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, initialSearchQuery, searchResultContext, history }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Request failed with status ${response.status}`);
        }
        
        return response.body;

    } catch (error) {
        console.error(`Error fetching from backend endpoint /chat:`, error);
        if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
             throw new Error('Network Error: Could not connect to the backend service. Please ensure the backend server is running and accessible.');
        }
        throw error;
    }
};