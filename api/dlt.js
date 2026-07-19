export default async function handler(req, res) {
  const { key, session } = req.query;

  // Same multi-key system as api/index.js — keep both files in sync
  const API_KEYS = {
    "bunny": "2026-12-31",
    "sayan": "2026-08-15",
    "demo": "2026-07-25"
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
  if (new Date() > expiryDate) {
    return res.status(401).json({
      status: false,
      message: `Key expired ❌ (was valid till ${formatDate(expiryDate)})`
    });
  }

  if (!session) {
    return res.status(400).json({
      status: false,
      message: "session parameter required"
    });
  }

  try {
    const upstreamUrl = `http://45.13.226.96:9009/api/dlt?session=${encodeURIComponent(session)}`;
    const upstream = await fetch(upstreamUrl);
    const data = await upstream.json();

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(data, null, 2));
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Upstream error",
      error: err.message
    });
  }
}
