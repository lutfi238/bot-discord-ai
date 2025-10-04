'use strict';

const axios = require('axios');
const readline = require('readline');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call chat completions API with retries and backoff.
 * Optimized for OpenRouter API
 */
async function callChatCompletion({ baseUrl, apiKey, model, messages, timeoutMs = 60000, maxRetries = 3, onRetry, onGiveUp }) {
  let attempt = 0;
  let lastError;
  while (attempt <= maxRetries) {
    try {
      const requestBody = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      };
      
      // Debug logging
      console.log('API Request URL:', `${baseUrl}/chat/completions`);
      console.log('API Request Body:', JSON.stringify(requestBody, null, 2));
      
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

      const text = res.data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('Empty response from model');
      return text;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const isRetryable =
        status === 429 ||
        (status >= 500 && status < 600) ||
        ['ECONNRESET', 'ETIMEDOUT', 'ENETUNREACH', 'EAI_AGAIN'].includes(error?.code);

      if (!isRetryable || attempt === maxRetries) {
        // Re-throw with a cleaner message
        const detail = error?.response?.data?.error?.message || error?.message || 'Unknown error';
        const err = new Error(`Chat API error${status ? ` (${status})` : ''}: ${detail}`);
        err.status = status;
        if (onGiveUp) {
          try { await onGiveUp(err); } catch (_) { /* ignore */ }
        }
        throw err;
      }

      // Backoff with jitter or use Retry-After
      // Conservative delays for OpenRouter API
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
async function callChatCompletionStream({ baseUrl, apiKey, model, messages, timeoutMs = 60000, onDelta }) {
  const url = `${baseUrl}/chat/completions`;
  const res = await axios.post(
    url,
    {
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
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
      resolve(accumulated);
    });

    rl.on('error', (err) => reject(err));
    res.data.on('error', (err) => reject(err));
  });
}

module.exports = { callChatCompletion, callChatCompletionStream };


 