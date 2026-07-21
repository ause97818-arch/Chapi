const rateLimitStore = globalThis.__bomberRateLimitAIO || (globalThis.__bomberRateLimitAIO = {});
const MAX_POSTS = 10;
const WINDOW_MS = 12 * 60 * 60 * 1000;

function formatTime(d) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

export default async function handler(req, res) {
  const { key } = req.query;
  let text = req.query.text;

  const API_KEYS = {
    "bunny": "2026-12-31",
    "sayan": "2026-08-15",
    "demo": "2026-07-25"
  };

  function formatDate(d) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  if (!key || !(key in API_KEYS)) {
    return res.status(401).json({ status: false, message: "Invalid or missing key ❌" });
  }

  const expiryDate = new Date(API_KEYS[key] + "T23:59:59");
  const now = new Date();

  if (now > expiryDate) {
    return res.status(401).json({ status: false, message: `Key expired ❌ (was valid till ${formatDate(expiryDate)})` });
  }

  if (!text) {
    return res.status(400).json({ status: false, message: "text parameter required" });
  }

  text = text.trim();
  if (/^\d{7,15}$/.test(text)) text = "+" + text;

  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  if (!phoneRegex.test(text)) {
    return res.status(400).json({
      status: false,
      message: "Only mobile number allowed ❌ (format: +countrycode number, e.g. +919876543210)"
    });
  }

  let record = rateLimitStore[key];
  if (record) {
    const windowEnd = new Date(record.firstPost + WINDOW_MS);
    if (now >= windowEnd) record = null;
  }
  if (!record) {
    record = { count: 0, firstPost: now.getTime() };
    rateLimitStore[key] = record;
  }
  if (record.count >= MAX_POSTS) {
    const resetTime = new Date(record.firstPost + WINDOW_MS);
    return res.status(429).json({
      status: false,
      message: `You Are Now Out Of limit , Your Limit Is Reset In ${formatTime(resetTime)}`
    });
  }
  record.count += 1;

  try {
    const upstreamUrl = `http://45.134.39.212:4065/api/num?enter=${encodeURIComponent(text)}`;
    const upstream = await fetch(upstreamUrl);
    const data = await upstream.json();

    const response = {
      status: data.status,
      message: "Successfully Send",
      session: data.session,
      text: text,
      auto_delete_minutes: data.auto_delete_minutes,
      key_expiry: formatDate(expiryDate),
      posts_left: MAX_POSTS - record.count,
      creator: "@th3bunny | BUNNY M"
    };

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(response, null, 2));
  } catch (err) {
    return res.status(500).json({ status: false, message: "Upstream error", error: err.message });
  }
}
