// Fix: Import d3 to provide types for graph interfaces.
// FIX: Use namespace import for d3 to resolve module errors.
import * as d3 from 'd3';

// OLD TYPE - Will be replaced by new detailed schema
// export interface AiSearchResult {
//   summary: string;
//   publications: string[];
// }


// --- NEW AI SEARCH RESULT SCHEMA ---

export interface AiSearchSummary {
    overview: string;
    years_range: string;
    highlight_points: {
        point: string;
        explanation: string;
    }[];
}

export interface DetailedReportItem {
    title: string;
    year: number;
    organism: string;
    mission_or_experiment: string;
    main_findings: string;
    source_url: string | null;
    publication_type: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface AiSearchResult {
    summary: AiSearchSummary;
    detailed_report: DetailedReportItem[];
    graph: KnowledgeGraphData;
}

export interface AdvancedFilters {
  yearRange: [number, number];
  organisms: string[];
  missions: string[];
  researchAreas: string[];
  publicationTypes: string[];
}

export interface TimelineAnalysisData {
  mission_effectiveness: string;
  future_potential: string;
  real_world_impact: string;
}

// --- AI COMPARISON RESULT SCHEMA ---

export interface ComparisonDetail {
  report_title: string;
  value: string;
}

export interface ComparisonPoint {
  aspect: string;
  details: ComparisonDetail[];
  synthesis: string;
}

export interface AiComparisonResult {
  comparison_summary: string;
  key_comparison_points: ComparisonPoint[];
}

// --- AI HYPOTHESIS RESULT SCHEMA ---
export interface AiHypothesisResult {
  hypothesis_statement: string;
  rationale: string;
  suggested_next_steps: string;
}

// --- AI GLOSSARY TERM RESULT SCHEMA ---
export interface AiGlossaryTermResult {
  term: string;
  definition: string;
  relevance: string;
}

// --- AI CHAT TYPES ---
export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}


// --- GRAPH TYPES (UPDATED) ---

// FIX: Extend from imported d3.SimulationNodeDatum type directly.
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: string;
  isPinned?: boolean;
}

// FIX: Extend from imported d3.SimulationLinkDatum type directly.
export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  // FIX: D3 force simulation replaces string IDs with node objects after initialization.
  // The type must reflect that `source` and `target` can be either a string or a GraphNode.
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
}