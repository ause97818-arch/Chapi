export default async function handler(req, res) {
  const { key, text } = req.query;

  // ===== KEY SYSTEM =====
  const validKeys = (process.env.API_KEYS || "Sayan").split(",").map(k => k.trim());

  if (!key || !validKeys.includes(key)) {
    return res.status(401).json({
      status: false,
      message: "Invalid or missing key ❌"
    });
  }

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "text parameter required"
    });
  }

  // ===== MOBILE NUMBER ONLY VALIDATION =====
  // Must start with + followed by 7 to 15 digits (E.164 format, any country)
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

