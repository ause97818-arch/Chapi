export default async function handler(req, res) {
  const { key } = req.query;
  let text = req.query.text;

  // ===================================================
  // ===== MULTI API KEY SYSTEM (with expiry dates) =====
  // ===================================================
  // Format: "keyname": "YYYY-MM-DD"  → key valid till end of that day
  // Add as many keys as you want here
  const API_KEYS = {
    "bunny": "2026-12-31",
    "svo": "2026-08-21",
    "sayan": "2026-09-19"
  };

  function formatDate(d) {
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  if (!key || !(key in API_KEYS)) {
    return res.status(401).json({
      status: false,
      message: "Invalid or missing key ❌"
    });
  }

  const expiryDate = new Date(API_KEYS[key] + "T23:59:59");
  const now = new Date();

  if (now > expiryDate) {
    return res.status(401).json({
      status: false,
      message: `Key expired ❌ (was valid till ${formatDate(expiryDate)})`
    });
  }

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "text parameter required"
    });
  }

  // "+" in query strings often gets decoded as a space (e.g. +919876543210 -> " 919876543210")
  text = text.trim();
  if (/^\d{7,15}$/.test(text)) {
    text = "+" + text;
  }

  // ===== MOBILE NUMBER ONLY VALIDATION =====
  const phoneRegex = /^\+[1-9]\d{6,14}$/;

  if (!phoneRegex.test(text)) {
    return res.status(400).json({
      status: false,
      message: "Only mobile number allowed ❌ (format: +countrycode number, e.g. +919876543210)"
    });
  }

  try {
    const upstreamUrl = `http://45.13.226.96:9009/api/post?text=${encodeURIComponent(text)}`;
    const upstream = await fetch(upstreamUrl);
    const data = await upstream.json();

    const response = {
      status: data.status,
      message: "Successfully Send",
      session: data.session,
      text: data.text,
      auto_delete_minutes: data.auto_delete_minutes,
      key_expiry: formatDate(expiryDate),
      creator: "@th3bunny | BUNNY M"
    };

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(response, null, 2));
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Upstream error",
      error: err.message
    });
  }
}
