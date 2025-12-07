'use strict';

// Centralized configuration for the Discord AI Bot

module.exports = {
    // Server
    PORT: process.env.PORT || 3000,

    // Memory Management
    MEMORY: {
        MAX_HEAP_MB: 450,           // Threshold for 500MB limit
        SWEEPER_INTERVAL: 300,      // 5 minutes (seconds)
        MESSAGE_LIFETIME: 180,      // 3 minutes (seconds)
        USER_SWEEPER_INTERVAL: 3600 // 1 hour (seconds)
    },

    // Conversation Settings
    CONVERSATION: {
        MAX_STORED: 50,             // Max conversations in memory
        EXPIRY_MS: 30 * 60 * 1000,  // 30 minutes
        CLEANUP_INTERVAL_MS: 10 * 60 * 1000, // 10 minutes
        MAX_MESSAGES: 6,            // Max messages per conversation (3 exchanges)
        MAX_QUESTION_LENGTH: 1000,  // Truncate questions longer than this
        MAX_RESPONSE_LENGTH: 4000   // Truncate responses longer than this
    },

    // API Settings
    API: {
        TIMEOUT_MS: 60000,          // 60 seconds
        MAX_RETRIES: 3,
        MAX_TOKENS: 2048,
        TEMPERATURE: 0.7
    },

    // Discord Settings
    DISCORD: {
        MAX_MESSAGE_LENGTH: 1990,   // Discord limit is 2000, leave buffer
        STREAM_THROTTLE_MS: 400     // Throttle stream updates
    },

    // Rate Limits (Groq Free Tier)
    RATE_LIMITS: {
        REQUESTS_PER_MINUTE: 30,
        REQUESTS_PER_DAY: 14400,
        TOKENS_PER_MINUTE: 30000,
        TOKENS_PER_DAY: 100000
    }
};
