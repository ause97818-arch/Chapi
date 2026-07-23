import { UPSTREAM_URLS, CREATOR_TAG } from "./config.js";
import { getRateLimitStore, validateKey, validatePhoneText, checkRateLimit, formatDate } from "./helpers.js";

export default async function handler(req, res) {
  const { key } = req.query;

  const keyCheck = validateKey(key);
  if (!keyCheck.ok) return res.status(keyCheck.status).json(keyCheck.body);

  const phoneCheck = validatePhoneText(req.query.text);
  if (!phoneCheck.ok) return res.status(phoneCheck.status).json(phoneCheck.body);
  const text = phoneCheck.text;

  const store = getRateLimitStore("post");
  const limitCheck = checkRateLimit(store, key);
  if (!limitCheck.ok) return res.status(limitCheck.status).json(limitCheck.body);

  try {
    const upstream = await fetch(UPSTREAM_URLS.post(text));
    const data = await upstream.json();

    const response = {
      status: data.status,
      message: "Successfully Send",
      session: data.session,
      text: data.text,
      auto_delete_minutes: data.auto_delete_minutes,
      key_expiry: formatDate(keyCheck.expiryDate),
      posts_left: 10 - limitCheck.record.count,
      creator: CREATOR_TAG
    };

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(response, null, 2));
  } catch (err) {
    return res.status(500).json({ status: false, message: "Upstream error", error: err.message });
  }
}
