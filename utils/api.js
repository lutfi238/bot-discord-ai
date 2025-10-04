'use strict';

const axios = require('axios');
const readline = require('readline');
const { rateLimiter } = require('./groqRateLimit');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call chat completions API with retries and backoff.
 * Optimized for Groq API with rate limiting
 */
async function callChatCompletion({ baseUrl, apiKey, model, messages, timeoutMs = 60000, maxRetries = 3, onRetry, onGiveUp, onRateLimit }) {
  // Estimate token usage (rough estimate: ~4 chars per token)
  const estimatedTokens = JSON.stringify(messages).length / 4 + 500; // +500 for response
  
  // Check rate limit before making request
  const rateLimitCheck = rateLimiter.canMakeRequest(estimatedTokens);
  if (!rateLimitCheck.allowed) {
    const error = new Error('Rate limit exceeded');
    error.rateLimitInfo = rateLimitCheck;
    if (onRateLimit) {
      try { await onRateLimit(rateLimitCheck); } catch (_) { /* ignore */ }
    }
    throw error;
  }

  let attempt = 0;
  let lastError;
  while (attempt <= maxRetries) {
    try {
      const requestBody = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048, // Reduced for Groq API
      };
      
      const res = await axios.post(
        `${baseUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: timeoutMs,
        }
      );

      // Update rate limiter with response headers
      rateLimiter.updateFromHeaders(res.headers);
      
      // Record successful request with actual token usage
      const tokensUsed = res.data?.usage?.total_tokens || estimatedTokens;
      rateLimiter.recordRequest(tokensUsed);
      
      const text = res.data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('Empty response from model');
      return text;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      
      // Handle rate limit errors (429)
      if (status === 429) {
        rateLimiter.updateFromHeaders(error?.response?.headers);
        if (onRateLimit) {
          const retryAfter = error?.response?.headers?.['retry-after'] || 60;
          try { 
            await onRateLimit({ 
              allowed: false, 
              reason: 'api_rate_limit',
              resetIn: parseInt(retryAfter),
            }); 
          } catch (_) { /* ignore */ }
        }
      }
      
      const isRetryable =
        status === 429 ||
        (status >= 500 && status < 600) ||
        ['ECONNRESET', 'ETIMEDOUT', 'ENETUNREACH', 'EAI_AGAIN'].includes(error?.code);

      if (!isRetryable || attempt === maxRetries) {
        // Re-throw with a cleaner message
        const detail = error?.response?.data?.error?.message || error?.message || 'Unknown error';
        const err = new Error(`Chat API error${status ? ` (${status})` : ''}: ${detail}`);
        err.status = status;
        err.rateLimitInfo = error.rateLimitInfo;
        if (onGiveUp) {
          try { await onGiveUp(err); } catch (_) { /* ignore */ }
        }
        throw err;
      }

      // Backoff with jitter or use Retry-After
      let delay = Math.max(1000, 1000 * Math.pow(2, attempt)); // 1s, 2s, 4s, 8s
      const retryAfter = error?.response?.headers?.['retry-after'];
      if (retryAfter) {
        const parsed = Number(retryAfter);
        if (!Number.isNaN(parsed)) delay = Math.max(delay, parsed * 1000);
      }
      delay += Math.floor(Math.random() * 300); // Add some jitter
      if (onRetry) {
        try {
          await onRetry(attempt + 1, delay, { status, code: error?.code });
        } catch (_) { /* ignore */ }
      }
      await sleep(delay);
      attempt += 1;
    }
  }

  // Should not reach here
  throw lastError || new Error('Chat API unknown failure');
}

/**
 * Stream chat completions (SSE) and emit incremental content.
 * Returns the full text when finished.
 */
async function callChatCompletionStream({ baseUrl, apiKey, model, messages, timeoutMs = 60000, onDelta, onRateLimit }) {
  // Estimate token usage
  const estimatedTokens = JSON.stringify(messages).length / 4 + 500;
  
  // Check rate limit before making request
  const rateLimitCheck = rateLimiter.canMakeRequest(estimatedTokens);
  if (!rateLimitCheck.allowed) {
    const error = new Error('Rate limit exceeded');
    error.rateLimitInfo = rateLimitCheck;
    if (onRateLimit) {
      try { await onRateLimit(rateLimitCheck); } catch (_) { /* ignore */ }
    }
    throw error;
  }

  const url = `${baseUrl}/chat/completions`;
  const res = await axios.post(
    url,
    {
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048, // Reduced for Groq API
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: timeoutMs,
      responseType: 'stream',
    }
  );

  return new Promise((resolve, reject) => {
    let accumulated = '';
    const rl = readline.createInterface({ input: res.data });

    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (!trimmed.startsWith('data:')) return;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') {
        // Completed
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const delta = parsed?.choices?.[0]?.delta?.content || '';
        if (delta) {
          accumulated += delta;
          if (onDelta) onDelta(delta, accumulated);
        }
      } catch (e) {
        // ignore parse errors for non-JSON keepalive chunks
      }
    });

    rl.on('close', () => {
      // Record request after streaming completes
      rateLimiter.recordRequest(estimatedTokens);
      resolve(accumulated);
    });

    rl.on('error', (err) => reject(err));
    res.data.on('error', (err) => reject(err));
  });
}

module.exports = { callChatCompletion, callChatCompletionStream };


 