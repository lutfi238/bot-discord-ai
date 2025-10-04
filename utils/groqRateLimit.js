// Groq API Rate Limiter
// Handles rate limits: 30 RPM, 1000 RPD, 12K TPM, 100K TPD

class GroqRateLimiter {
    constructor() {
        // Rate limit tracking
        this.requestsPerMinute = [];
        this.requestsPerDay = [];
        this.tokensPerMinute = [];
        this.tokensPerDay = [];
        
        // Limits from Groq API (free tier)
        this.limits = {
            requestsPerMinute: 30,
            requestsPerDay: 1000,
            tokensPerMinute: 12000,
            tokensPerDay: 100000,
        };
        
        // Store rate limit info from headers
        this.lastRateLimitInfo = null;
    }

    // Update rate limit info from response headers
    updateFromHeaders(headers) {
        if (!headers) return;
        
        this.lastRateLimitInfo = {
            remainingRequests: parseInt(headers['x-ratelimit-remaining-requests']) || null,
            remainingTokens: parseInt(headers['x-ratelimit-remaining-tokens']) || null,
            limitRequests: parseInt(headers['x-ratelimit-limit-requests']) || null,
            limitTokens: parseInt(headers['x-ratelimit-limit-tokens']) || null,
            resetRequests: headers['x-ratelimit-reset-requests'] || null,
            resetTokens: headers['x-ratelimit-reset-tokens'] || null,
            retryAfter: parseInt(headers['retry-after']) || null,
        };
    }

    // Clean old entries
    cleanOldEntries() {
        const now = Date.now();
        const oneMinuteAgo = now - 60 * 1000;
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        this.requestsPerMinute = this.requestsPerMinute.filter(t => t > oneMinuteAgo);
        this.requestsPerDay = this.requestsPerDay.filter(t => t > oneDayAgo);
        this.tokensPerMinute = this.tokensPerMinute.filter(t => t.timestamp > oneMinuteAgo);
        this.tokensPerDay = this.tokensPerDay.filter(t => t.timestamp > oneDayAgo);
    }

    // Check if request can be made
    canMakeRequest(estimatedTokens = 1000) {
        this.cleanOldEntries();

        // Check requests per minute
        if (this.requestsPerMinute.length >= this.limits.requestsPerMinute) {
            return {
                allowed: false,
                reason: 'requests_per_minute',
                limit: this.limits.requestsPerMinute,
                current: this.requestsPerMinute.length,
                resetIn: this.getResetTime(this.requestsPerMinute[0], 60),
            };
        }

        // Check requests per day
        if (this.requestsPerDay.length >= this.limits.requestsPerDay) {
            return {
                allowed: false,
                reason: 'requests_per_day',
                limit: this.limits.requestsPerDay,
                current: this.requestsPerDay.length,
                resetIn: this.getResetTime(this.requestsPerDay[0], 24 * 60),
            };
        }

        // Check tokens per minute
        const tokensThisMinute = this.tokensPerMinute.reduce((sum, t) => sum + t.tokens, 0);
        if (tokensThisMinute + estimatedTokens > this.limits.tokensPerMinute) {
            return {
                allowed: false,
                reason: 'tokens_per_minute',
                limit: this.limits.tokensPerMinute,
                current: tokensThisMinute,
                resetIn: this.getResetTime(this.tokensPerMinute[0]?.timestamp, 60),
            };
        }

        // Check tokens per day
        const tokensThisDay = this.tokensPerDay.reduce((sum, t) => sum + t.tokens, 0);
        if (tokensThisDay + estimatedTokens > this.limits.tokensPerDay) {
            return {
                allowed: false,
                reason: 'tokens_per_day',
                limit: this.limits.tokensPerDay,
                current: tokensThisDay,
                resetIn: this.getResetTime(this.tokensPerDay[0]?.timestamp, 24 * 60),
            };
        }

        return { allowed: true };
    }

    // Record a request
    recordRequest(tokensUsed = 1000) {
        const now = Date.now();
        
        this.requestsPerMinute.push(now);
        this.requestsPerDay.push(now);
        this.tokensPerMinute.push({ timestamp: now, tokens: tokensUsed });
        this.tokensPerDay.push({ timestamp: now, tokens: tokensUsed });
        
        this.cleanOldEntries();
    }

    // Get time until reset in seconds
    getResetTime(oldestTimestamp, windowMinutes) {
        if (!oldestTimestamp) return 0;
        const now = Date.now();
        const windowMs = windowMinutes * 60 * 1000;
        const resetTime = oldestTimestamp + windowMs;
        return Math.max(0, Math.ceil((resetTime - now) / 1000));
    }

    // Get current usage stats
    getStats() {
        this.cleanOldEntries();
        
        const tokensThisMinute = this.tokensPerMinute.reduce((sum, t) => sum + t.tokens, 0);
        const tokensThisDay = this.tokensPerDay.reduce((sum, t) => sum + t.tokens, 0);

        return {
            requestsPerMinute: {
                current: this.requestsPerMinute.length,
                limit: this.limits.requestsPerMinute,
                percentage: Math.round((this.requestsPerMinute.length / this.limits.requestsPerMinute) * 100),
            },
            requestsPerDay: {
                current: this.requestsPerDay.length,
                limit: this.limits.requestsPerDay,
                percentage: Math.round((this.requestsPerDay.length / this.limits.requestsPerDay) * 100),
            },
            tokensPerMinute: {
                current: tokensThisMinute,
                limit: this.limits.tokensPerMinute,
                percentage: Math.round((tokensThisMinute / this.limits.tokensPerMinute) * 100),
            },
            tokensPerDay: {
                current: tokensThisDay,
                limit: this.limits.tokensPerDay,
                percentage: Math.round((tokensThisDay / this.limits.tokensPerDay) * 100),
            },
            lastRateLimitInfo: this.lastRateLimitInfo,
        };
    }

    // Format rate limit error message for Discord
    getRateLimitMessage(checkResult) {
        const { reason, limit, current, resetIn } = checkResult;
        
        const minutes = Math.floor(resetIn / 60);
        const seconds = resetIn % 60;
        const timeStr = minutes > 0 
            ? `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`
            : `${seconds} second${seconds !== 1 ? 's' : ''}`;

        const reasonMap = {
            'requests_per_minute': `⏱️ **Rate Limit: Requests Per Minute**\nReached limit of **${limit} requests/minute**. Current: ${current}/${limit}`,
            'requests_per_day': `📅 **Rate Limit: Requests Per Day**\nReached limit of **${limit} requests/day**. Current: ${current}/${limit}`,
            'tokens_per_minute': `🎯 **Rate Limit: Tokens Per Minute**\nReached limit of **${limit.toLocaleString()} tokens/minute**. Current: ${current.toLocaleString()}/${limit.toLocaleString()}`,
            'tokens_per_day': `📊 **Rate Limit: Tokens Per Day**\nReached limit of **${limit.toLocaleString()} tokens/day**. Current: ${current.toLocaleString()}/${limit.toLocaleString()}`,
        };

        const message = reasonMap[reason] || '⚠️ Rate limit reached';
        return `${message}\n\n⏰ **Please try again in:** ${timeStr}`;
    }
}

// Singleton instance
const rateLimiter = new GroqRateLimiter();

module.exports = { rateLimiter };
