'use strict';

const { USER_RATE_LIMITS } = require('./config');

// User-based rate limiter to prevent spam/abuse
// Tracks requests per user per minute and per hour

class UserRateLimiter {
    constructor() {
        // Map<userId, { minute: timestamp[], hour: timestamp[] }>
        this.userRequests = new Map();
        
        // Auto-cleanup old entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    cleanup() {
        const now = Date.now();
        for (const [userId, data] of this.userRequests.entries()) {
            data.minute = data.minute.filter(t => now - t < USER_RATE_LIMITS.WINDOW_MINUTE_MS);
            data.hour = data.hour.filter(t => now - t < USER_RATE_LIMITS.WINDOW_HOUR_MS);
            
            // Remove user if no recent requests
            if (data.minute.length === 0 && data.hour.length === 0) {
                this.userRequests.delete(userId);
            }
        }
    }

    checkLimit(userId) {
        const now = Date.now();
        const userData = this.userRequests.get(userId) || { minute: [], hour: [] };
        
        // Clean old timestamps
        userData.minute = userData.minute.filter(t => now - t < USER_RATE_LIMITS.WINDOW_MINUTE_MS);
        userData.hour = userData.hour.filter(t => now - t < USER_RATE_LIMITS.WINDOW_HOUR_MS);
        
        // Check limits
        if (userData.minute.length >= USER_RATE_LIMITS.REQUESTS_PER_MINUTE) {
            const oldestMinute = userData.minute[0];
            const resetIn = Math.ceil((oldestMinute + USER_RATE_LIMITS.WINDOW_MINUTE_MS - now) / 1000);
            return {
                allowed: false,
                reason: 'per_minute',
                limit: USER_RATE_LIMITS.REQUESTS_PER_MINUTE,
                current: userData.minute.length,
                resetIn
            };
        }
        
        if (userData.hour.length >= USER_RATE_LIMITS.REQUESTS_PER_HOUR) {
            const oldestHour = userData.hour[0];
            const resetIn = Math.ceil((oldestHour + USER_RATE_LIMITS.WINDOW_HOUR_MS - now) / 1000);
            return {
                allowed: false,
                reason: 'per_hour',
                limit: USER_RATE_LIMITS.REQUESTS_PER_HOUR,
                current: userData.hour.length,
                resetIn
            };
        }
        
        return { allowed: true };
    }

    recordRequest(userId) {
        const now = Date.now();
        const userData = this.userRequests.get(userId) || { minute: [], hour: [] };
        
        userData.minute.push(now);
        userData.hour.push(now);
        
        this.userRequests.set(userId, userData);
    }

    getStats(userId) {
        const now = Date.now();
        const userData = this.userRequests.get(userId) || { minute: [], hour: [] };
        
        // Clean old timestamps
        userData.minute = userData.minute.filter(t => now - t < USER_RATE_LIMITS.WINDOW_MINUTE_MS);
        userData.hour = userData.hour.filter(t => now - t < USER_RATE_LIMITS.WINDOW_HOUR_MS);
        
        return {
            minute: {
                current: userData.minute.length,
                limit: USER_RATE_LIMITS.REQUESTS_PER_MINUTE,
                percentage: Math.round((userData.minute.length / USER_RATE_LIMITS.REQUESTS_PER_MINUTE) * 100)
            },
            hour: {
                current: userData.hour.length,
                limit: USER_RATE_LIMITS.REQUESTS_PER_HOUR,
                percentage: Math.round((userData.hour.length / USER_RATE_LIMITS.REQUESTS_PER_HOUR) * 100)
            }
        };
    }
}

const rateLimiter = new UserRateLimiter();

// Legacy function for compatibility
function isAllowed(userId) {
    const check = rateLimiter.checkLimit(userId);
    if (check.allowed) {
        rateLimiter.recordRequest(userId);
        return true;
    }
    return false;
}

module.exports = { isAllowed, rateLimiter };


