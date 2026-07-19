export default async function handler(req, res) {
  const { session } = req.query;

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
