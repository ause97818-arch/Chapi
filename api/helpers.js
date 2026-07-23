// ============================================================
// ULTRA BOMBER — SHARED HELPERS
// ============================================================
// Common functions used by post/whatsapp/allinone endpoints.
// Uses settings from config.js — don't hardcode values here.
// ============================================================

import { API_KEYS, RATE_LIMIT } from "./config.js";

// In-memory rate limit stores — one per service so limits don't clash
export function getRateLimitStore(namespace) {
  const key = `__bomberRateLimit_${namespace}`;
  return globalThis[key] || (globalThis[key] = {});
}

export function formatDate(d) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function formatTime(d) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

// Validates key + expiry. Returns { ok: true, expiryDate } or { ok: false, response }
export function validateKey(key) {
  if (!key || !(key in API_KEYS)) {
    return { ok: false, status: 401, body: { status: false, message: "Invalid or missing key ❌" } };
  }
  const expiryDate = new Date(API_KEYS[key] + "T23:59:59");
  const now = new Date();
  if (now > expiryDate) {
    return {
      ok: false,
      status: 401,
      body: { status: false, message: `Key expired ❌ (was valid till ${formatDate(expiryDate)})` }
    };
  }
  return { ok: true, expiryDate };
}

// Normalizes and validates a mobile number. Returns { ok: true, text } or { ok: false, response }
export function validatePhoneText(rawText) {
  if (!rawText) {
    return { ok: false, status: 400, body: { status: false, message: "text parameter required" } };
  }
  let text = rawText.trim();
  if (/^\d{7,15}$/.test(text)) text = "+" + text;

  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  if (!phoneRegex.test(text)) {
    return {
      ok: false,
      status: 400,
      body: {
        status: false,
        message: "Only mobile number allowed ❌ (format: +countrycode number, e.g. +919876543210)"
      }
    };
  }
  return { ok: true, text };
}

// Checks + increments the per-key rate limit. Returns { ok: true, record } or { ok: false, response }
export function checkRateLimit(store, key) {
  const now = Date.now();
  let record = store[key];

  if (record) {
    const windowEnd = record.firstPost + RATE_LIMIT.WINDOW_MS;
    if (now >= windowEnd) record = null;
  }
  if (!record) {
    record = { count: 0, firstPost: now };
    store[key] = record;
  }
  if (record.count >= RATE_LIMIT.MAX_POSTS) {
    const resetTime = new Date(record.firstPost + RATE_LIMIT.WINDOW_MS);
    return {
      ok: false,
      status: 429,
      body: {
        status: false,
        message: `You Are Now Out Of limit , Your Limit Is Reset In ${formatTime(resetTime)}`
      }
    };
  }
  record.count += 1;
  return { ok: true, record };
}
