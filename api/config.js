// ============================================================
// ULTRA BOMBER — CENTRAL CONFIG
// ============================================================
// Yahan par saare upstream API URLs aur keys hain.
// Agar upstream server/API change karna ho, to SIRF ye file
// edit karo — baaki koi file touch karne ki zarurat nahi.
// ============================================================

// ---- Upstream server base ----
const UPSTREAM_BASE = "http://51.75.118.79:20039";

// ---- Individual upstream endpoints (TOTAL 4 APIs) ----
export const UPSTREAM_URLS = {
  // API 1 — OFFLINE CALL — post a number
  post: (text) => `${UPSTREAM_BASE}/api/post?text=${encodeURIComponent(text)}`,

  // API 2 — WHATSAPP MSG — number without "+"
  whatsapp: (numberNoPlus) => `${UPSTREAM_BASE}/api/text?number=${encodeURIComponent(numberNoPlus)}`,

  // API 3 — ALL IN ONE
  allinone: (text) => `${UPSTREAM_BASE}/api/num?enter=${encodeURIComponent(text)}`,

  // API 4 — STOP / DELETE (shared by all 3 services above)
  dlt: (session) => `${UPSTREAM_BASE}/api/dlt?session=${encodeURIComponent(session)}`
};

// ---- API keys (key -> expiry date "YYYY-MM-DD") ----
export const API_KEYS = {
  "bunny009": "2026-12-31",
  "sayan": "2026-08-15",
  "demo": "2026-07-25"
};

// ---- Rate limit settings (per key) ----
export const RATE_LIMIT = {
  MAX_POSTS: 10,
  WINDOW_MS: 12 * 60 * 60 * 1000 // 12 hours
};

// ---- Branding ----
export const CREATOR_TAG = "@th3bunny | BUNNY M";
