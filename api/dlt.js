import { UPSTREAM_URLS, CREATOR_TAG } from "./config.js";

export default async function handler(req, res) {
  const { session } = req.query;

  if (!session) {
    return res.status(400).json({ status: false, message: "session parameter required" });
  }

  try {
    const upstream = await fetch(UPSTREAM_URLS.dlt(session));
    const data = await upstream.json();

    const response = {
      ...data,
      creator: CREATOR_TAG
    };

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(response, null, 2));
  } catch (err) {
    return res.status(500).json({ status: false, message: "Upstream error", error: err.message });
  }
}
