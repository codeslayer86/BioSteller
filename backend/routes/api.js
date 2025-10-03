const express = require('express');
const db = require('../database/db');
const Joi = require('joi');
const aiService = require('../services/aiService'); // Import the new service
const router = express.Router();

// --- Joi Validation Schemas ---
const searchSchema = Joi.object({
    query: Joi.string().allow('').max(500).trim(),
    filters: Joi.object({
        yearRange: Joi.array().items(Joi.number().integer()).length(2).required(),
        organisms: Joi.array().items(Joi.string()).required(),
        missions: Joi.array().items(Joi.string()).required(),
        researchAreas: Joi.array().items(Joi.string()).required(),
        publicationTypes: Joi.array().items(Joi.string()).required()
    }).required()
});

const extendSearchSchema = Joi.object({
    query: Joi.string().required().max(500).trim(),
    existingResult: Joi.object().required(),
    filters: Joi.object().required()
});

const timelineAnalysisValidationSchema = Joi.object({
    searchResult: Joi.object().required()
});

const comparisonSchema = Joi.object({
    items: Joi.array().items(Joi.object()).min(2).required()
});

const hypothesisSchema = Joi.object({
    searchResult: Joi.object().required()
});

const glossarySchema = Joi.object({
    term: Joi.string().required().max(100).trim()
});

const chatSchema = Joi.object({
    query: Joi.string().required().max(2000),
    initialSearchQuery: Joi.string().required(),
    searchResultContext: Joi.object().required(),
    history: Joi.array().items(Joi.object({
        role: Joi.string().valid('user', 'model').required(),
        parts: Joi.array().items(Joi.object({
            text: Joi.string().required()
        })).required()
    })).required()
});

// --- Validation Middleware ---
const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            error: 'Invalid request data provided.',
            details: error.details.map(d => d.message).join(', '),
        });
    }
    next();
};

// --- Generic Request Handler ---
async function handleAiRequest(req, res, logic, logMessage) {
    try {
        console.log(logMessage);
        const result = await logic(req.body);
        res.json(result);
    } catch (error) {
        console.error(`Error processing request: ${logMessage}`, error);
        res.status(500).json({ error: 'Failed to process request with AI provider.', details: error.message });
    }
}

// --- API Endpoints ---

router.post('/search', validateRequest(searchSchema), async (req, res) => {
    const { query, filters } = req.body;
    const cacheKey = JSON.stringify({ query, filters });

    try {
        const cachedResult = await db('searches').where('query', cacheKey).orderBy('created_at', 'desc').first();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        if (cachedResult && new Date(cachedResult.created_at) > oneDayAgo) {
            console.log(`Cache hit for query: "${cacheKey}"`);
            return res.json(JSON.parse(cachedResult.result));
        }

        console.log(`Cache miss. Calling AI provider for query: "${cacheKey}"`);
        const result = await aiService.getSummary(query, filters);
        await db('searches').insert({ query: cacheKey, result: JSON.stringify(result) });
        console.log(`Successfully cached result for query: "${cacheKey}"`);
        res.json(result);
    } catch (error) {
        console.error(`Error in /search for query: ${cacheKey}`, error);
        res.status(500).json({ error: 'Failed to fetch data from AI provider.', details: error.message });
    }
});

router.post('/extend-search', validateRequest(extendSearchSchema), (req, res) => {
    const { query } = req.body;
    handleAiRequest(req, res,
        (body) => aiService.getExtendedSummary(body.query, body.existingResult, body.filters),
        `Handling /extend-search for query: "${query}"`
    );
});

router.post('/timeline-analysis', validateRequest(timelineAnalysisValidationSchema), (req, res) => {
    handleAiRequest(req, res,
        (body) => aiService.getTimelineAnalysis(body.searchResult),
        `Handling /timeline-analysis`
    );
});

router.post('/comparison', validateRequest(comparisonSchema), (req, res) => {
    handleAiRequest(req, res,
        (body) => aiService.getComparison(body.items),
        `Handling /comparison for ${req.body.items?.length || 0} items`
    );
});

router.post('/hypothesis', validateRequest(hypothesisSchema), (req, res) => {
    handleAiRequest(req, res,
        (body) => aiService.getHypothesis(body.searchResult),
        `Handling /hypothesis generation`
    );
});

router.post('/glossary', validateRequest(glossarySchema), (req, res) => {
    const { term } = req.body;
    handleAiRequest(req, res,
        (body) => aiService.getGlossaryTerm(body.term),
        `Handling /glossary request for term: "${term}"`
    );
});

router.post('/chat', validateRequest(chatSchema), async (req, res) => {
    try {
        const { query, searchResultContext, initialSearchQuery, history } = req.body;
        
        console.log(`Handling /chat stream request for query: "${query}"`);
        
        // Setting headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const stream = await aiService.getChatStream(query, searchResultContext, initialSearchQuery, history);
        
        for await (const chunk of stream) {
            res.write(chunk.text);
        }
        res.end();

    } catch (error) {
        console.error(`Error in /chat stream`, error);
        res.status(500).send('Failed to process chat request with AI provider.');
    }
});

module.exports = router;