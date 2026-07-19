export default async function handler(req, res) {
  const { key, text } = req.query;

  // ===== KEY SYSTEM =====
  // Valid keys env var me comma se separate rakho (Vercel dashboard > Settings > Environment Variables)
  // Agar env set nahi hai to default "bunny" use hoga
  const validKeys = (process.env.API_KEYS || "bunny").split(",").map(k => k.trim());

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

    // Pretty print JSON
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
