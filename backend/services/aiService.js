const { GoogleGenAI, Type } = require("@google/genai");

// --- AI Configuration ---

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("FATAL: API_KEY environment variable is not set in aiService.");
    // In a real app, you might want a more robust way to handle this, 
    // but for this context, exiting is a clear indicator.
    process.exit(1); 
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

// --- System Instructions & AI Schemas ---

const GENERAL_SYSTEM_INSTRUCTION = `You are an expert AI research assistant for NASA's Space Biology data. Your primary function is to synthesize information from NASA's public data archives.

**CRITICAL DATA SOURCE CONSTRAINT:**
- You MUST derive all information EXCLUSIVELY from the following official NASA and public data portals. Do not use any other websites or your general knowledge.
- Primary Sources:
  - NASA Open Data Portal: https://data.nasa.gov/
  - NASA GeneLab: https://genelab.nasa.gov/
  - NASA Space Life Science Data Archive: https://lsda.jsc.nasa.gov/
- When providing a 'source_url', it MUST be a deep link to a specific dataset, publication, or experiment within these domains.

**Core Directives:**
1.  **Comprehensive Summaries:** For the user's query, generate a broad and informative overview based *only* on the allowed sources, highlighting key findings and the general time span of the research.
2.  **Data Source Integrity:** For every item in the \`detailed_report\`, you MUST provide a direct, valid \`source_url\` from one of the domains listed above. If a link cannot be found within those sources, you MUST return \`null\` for its \`source_url\`. NEVER fabricate URLs or use links from other domains.
3.  **Output Schema Adherence:** Your entire response MUST be a single, valid JSON object that strictly conforms to the provided schema. Do not include any text, explanations, or markdown outside of the JSON structure.
`;

const STRICT_SYSTEM_INSTRUCTION_BASE = `You are a precision AI research assistant for NASA's Space Biology data. Your primary function is to act as a strict data filter and synthesizer.

**CRITICAL DATA SOURCE CONSTRAINT:**
- You MUST derive all information EXCLUSIVELY from the following official NASA and public data portals. Do not use any other websites or your general knowledge.
- Primary Sources:
  - NASA Open Data Portal: https://data.nasa.gov/
  - NASA GeneLab: https://genelab.nasa.gov/
  - NASA Space Life Science Data Archive: https://lsda.jsc.nasa.gov/
- When providing a 'source_url', it MUST be a deep link to a specific dataset, publication, or experiment within these domains.

**Core Directives:**
1.  **Strict Filtering is Paramount:** You MUST follow all rules in the "CRITICAL SEARCH CRITERIA" section below. These criteria are ABSOLUTE and NON-NEGOTIABLE. You MUST reject any research item that does not perfectly match EVERY SINGLE criterion. There are no exceptions. Do not include "related" or "similar" items. If no results match all criteria, return an empty \`detailed_report\`.
2.  **Data Source Integrity:** For every item in the \`detailed_report\`, you MUST provide a direct, valid \`source_url\` from one of the domains listed above. If a link cannot be found within those sources, you MUST return \`null\` for its \`source_url\`. NEVER fabricate URLs or use links from other domains.
3.  **Output Schema Adherence:** Your entire response MUST be a single, valid JSON object that strictly conforms to the provided schema. Do not include any text, explanations, or markdown outside of the JSON structure.
`;

const areFiltersActive = (filters) => {
    if (!filters) return false;
    const defaultMinYear = 1960;
    const defaultMaxYear = new Date().getFullYear();
    
    return (
        (filters.yearRange && (filters.yearRange[0] !== defaultMinYear || filters.yearRange[1] !== defaultMaxYear)) ||
        (filters.organisms && filters.organisms.length > 0) ||
        (filters.missions && filters.missions.length > 0) ||
        (filters.researchAreas && filters.researchAreas.length > 0) ||
        (filters.publicationTypes && filters.publicationTypes.length > 0)
    );
};

const buildDynamicSystemInstruction = (filters) => {
    if (!areFiltersActive(filters)) {
        return GENERAL_SYSTEM_INSTRUCTION;
    }

    let instruction = STRICT_SYSTEM_INSTRUCTION_BASE;
    const filterParts = [];

    if (filters.yearRange) {
        filterParts.push(`- The publication year MUST be between ${filters.yearRange[0]} and ${filters.yearRange[1]} (inclusive).`);
    }
    if (filters.organisms && filters.organisms.length > 0) {
        filterParts.push(`- The research MUST involve one or more of the following organism(s): ${filters.organisms.join(', ')}.`);
    }
    if (filters.missions && filters.missions.length > 0) {
        filterParts.push(`- The research MUST be related to one of the following mission(s) or platform(s): ${filters.missions.join(', ')}.`);
    }
    if (filters.researchAreas && filters.researchAreas.length > 0) {
        filterParts.push(`- The research MUST fall under one of the following area(s): ${filters.researchAreas.join(', ')}.`);
    }
    if (filters.publicationTypes && filters.publicationTypes.length > 0) {
        filterParts.push(`- The result MUST be one of the following publication type(s): ${filters.publicationTypes.join(', ')}.`);
    }

    if (filterParts.length > 0) {
        instruction += `\n**CRITICAL SEARCH CRITERIA FOR THIS REQUEST:**\n${filterParts.join('\n')}`;
    }

    return instruction;
};

const responseSchema = { type: Type.OBJECT, properties: { summary: { type: Type.OBJECT, properties: { overview: { type: Type.STRING }, years_range: { type: Type.STRING }, highlight_points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ['point', 'explanation'] } } }, required: ['overview', 'years_range', 'highlight_points'] }, detailed_report: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, year: { type: Type.INTEGER }, organism: { type: Type.STRING }, mission_or_experiment: { type: Type.STRING }, main_findings: { type: Type.STRING }, source_url: { type: Type.STRING, nullable: true }, publication_type: { type: Type.STRING } }, required: ['title', 'year', 'organism', 'mission_or_experiment', 'main_findings', 'source_url', 'publication_type'] } }, graph: { type: Type.OBJECT, properties: { nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING } }, required: ['id', 'type'] } }, links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, label: { type: Type.STRING } }, required: ['source', 'target', 'label'] } } }, required: ['nodes', 'links'] } }, required: ['summary', 'detailed_report', 'graph'] };
const timelineAnalysisSchema = { type: Type.OBJECT, properties: { mission_effectiveness: { type: Type.STRING }, future_potential: { type: Type.STRING }, real_world_impact: { type: Type.STRING } }, required: ['mission_effectiveness', 'future_potential', 'real_world_impact'] };
const comparisonResponseSchema = { type: Type.OBJECT, properties: { comparison_summary: { type: Type.STRING }, key_comparison_points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { aspect: { type: Type.STRING }, details: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { report_title: { type: Type.STRING }, value: { type: Type.STRING } }, required: ['report_title', 'value'] } }, synthesis: { type: Type.STRING } }, required: ['aspect', 'details', 'synthesis'] } } }, required: ['comparison_summary', 'key_comparison_points'] };
const hypothesisResponseSchema = { type: Type.OBJECT, properties: { hypothesis_statement: { type: Type.STRING }, rationale: { type: Type.STRING }, suggested_next_steps: { type: Type.STRING } }, required: ['hypothesis_statement', 'rationale', 'suggested_next_steps'] };
const glossaryTermSchema = { type: Type.OBJECT, properties: { term: { type: Type.STRING }, definition: { type: Type.STRING }, relevance: { type: Type.STRING } }, required: ['term', 'definition', 'relevance'] };


// --- AI Service Functions ---

async function getSummary(query, filters) {
    const systemInstruction = buildDynamicSystemInstruction(filters);
    const userQuery = query || 'general space biology research';
    const response = await ai.models.generateContent({ model, contents: userQuery, config: { systemInstruction, responseMimeType: 'application/json', responseSchema } });
    return JSON.parse(response.text);
};

async function getExtendedSummary(query, existingResult, filters) {
    const systemInstruction = buildDynamicSystemInstruction(filters);
    const extendedUserPrompt = `The user is searching for "${query}". They previously received the report below. Your task is to find *new* and *distinct* research items that were not in the original report, while still strictly adhering to all filter criteria defined in the system instruction. Then, generate a new, comprehensive response that integrates both the old and new findings. The final 'detailed_report' should contain all original items plus the new ones, without duplicates. The 'summary' and 'graph' should be updated to reflect the combined knowledge.

Here is the original report to avoid duplicating:
---
${JSON.stringify(existingResult.detailed_report, null, 2)}
---

Generate the complete, updated JSON response based on the combined data.`;
    const response = await ai.models.generateContent({ model, contents: extendedUserPrompt, config: { systemInstruction, responseMimeType: 'application/json', responseSchema } });
    return JSON.parse(response.text);
};

async function getTimelineAnalysis(searchResult) {
    const systemInstruction = `You are an expert analyst for NASA's Space Biology program. Your task is to analyze the provided research data and generate a concise, insightful impact analysis. Focus on three key areas: mission effectiveness, future potential, and real-world impact. Your tone should be professional and informative. Your entire response MUST be a single, valid JSON object that strictly conforms to the provided schema.`;
    const userPrompt = `Based on the following search result data, please generate the impact analysis.\n\n**Search Result Data:**\n---\n${JSON.stringify(searchResult, null, 2)}\n---`;
    const response = await ai.models.generateContent({ model, contents: userPrompt, config: { systemInstruction, responseMimeType: 'application/json', responseSchema: timelineAnalysisSchema } });
    return JSON.parse(response.text);
};

async function getComparison(items) {
    const systemInstruction = `You are a sophisticated AI research analyst. Your task is to conduct a detailed comparative analysis of the provided research items. Identify key aspects for comparison (e.g., Organism, Mission, Key Findings, Methodology), present the information for each report side-by-side for that aspect, and then provide a concise 'synthesis' that explains the significance of the similarities or differences. Your entire response MUST be a single, valid JSON object that strictly conforms to the provided schema.`;
    const userPrompt = `Please perform a comparative analysis of the following research reports:\n\n**Reports to Compare:**\n---\n${JSON.stringify(items, null, 2)}\n---`;
    const response = await ai.models.generateContent({ model, contents: userPrompt, config: { systemInstruction, responseMimeType: 'application/json', responseSchema: comparisonResponseSchema } });
    return JSON.parse(response.text);
};

async function getHypothesis(searchResult) {
    const systemInstruction = `You are a brilliant research scientist specializing in space biology. Based on the provided data, your task is to synthesize the information and formulate a novel, testable scientific hypothesis. The hypothesis should be grounded in the data, identify a gap in knowledge or an interesting correlation, and propose a clear, falsifiable statement. Your entire response MUST be a single, valid JSON object that strictly conforms to the provided schema.`;
    const userPrompt = `Based on the following search result data, please generate a scientific hypothesis.\n\n**Search Result Data:**\n---\n${JSON.stringify(searchResult, null, 2)}\n---`;
    const response = await ai.models.generateContent({ model, contents: userPrompt, config: { systemInstruction, responseMimeType: 'application/json', responseSchema: hypothesisResponseSchema } });
    return JSON.parse(response.text);
};

async function getGlossaryTerm(term) {
    const systemInstruction = `You are an expert science communicator for NASA. Your task is to provide a clear and simple definition for a given space biology term, and then briefly explain its relevance to NASA's research. The tone should be accessible to a student or enthusiast. Your entire response MUST be a single, valid JSON object that strictly conforms to the provided schema.`;
    const userPrompt = `Please provide a simple definition and the space biology relevance for the following term: "${term}"`;
    const response = await ai.models.generateContent({ model, contents: userPrompt, config: { systemInstruction, responseMimeType: 'application/json', responseSchema: glossaryTermSchema } });
    return JSON.parse(response.text);
};

async function getChatStream(query, searchResultContext, initialSearchQuery, history) {
    const summaryContext = `Overview: ${searchResultContext.summary.overview}. Highlight Points: ${searchResultContext.summary.highlight_points.map(p => `- ${p.point}: ${p.explanation}`).join('\n')}`;
    const detailedReportContext = JSON.stringify(searchResultContext.detailed_report, null, 2);
    const systemInstruction = `You are an expert AI research assistant for the BioSteller application, specializing in NASA's Space Biology data. The user has just searched for: "${initialSearchQuery}".

Your task is to answer follow-up questions based *strictly* on the provided search result data below. You are a highly capable assistant that can analyze, compare, and provide deep insights from the given context.

**Core Capabilities & Rules:**
1.  **Comprehensive Analysis:** Answer questions about specific details, summarize findings, and explain complex topics in simple terms.
2.  **Comparative Analysis:** You can compare and contrast findings between different experiments, missions, or organisms mentioned in the report. For example, "Compare the effects of microgravity on plants vs. mice."
3.  **Strictly Data-Driven:** Base your answers *only* on the provided 'Summary' and 'Detailed Report'. Reference specific studies by title if relevant.
4.  **Acknowledge Limits:** If the user's question cannot be answered from the provided data, you *must* state that clearly. For example, say "That information is not available in the current search results." Do not guess, infer, or use external knowledge.

---
**Provided Search Data Context:**

**Summary:**
${summaryContext}

**Detailed Report:**
${detailedReportContext}
---
`;
    const chat = ai.chats.create({
        model,
        config: { systemInstruction },
        history: history || []
    });
    return await chat.sendMessageStream({ message: query });
};


module.exports = {
    getSummary,
    getExtendedSummary,
    getTimelineAnalysis,
    getComparison,
    getHypothesis,
    getGlossaryTerm,
    getChatStream,
};