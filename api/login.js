import {
  createSessionToken,
  getPassword,
  getSessionSecret,
  json,
  safeEqual,
  sessionCookie,
} from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  const configuredPassword = getPassword();
  if (!configuredPassword) {
    json(res, 503, { error: "Password not configured. Set ATS_PASSWORD in Vercel environment variables." });
    return;
  }

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    json(res, 400, { error: "Invalid request body" });
    return;
  }

  const { password } = body;
  if (!password || !safeEqual(password, configuredPassword)) {
    json(res, 401, { error: "Incorrect password" });
    return;
  }

  const token = createSessionToken(getSessionSecret());
  res.setHeader("Set-Cookie", sessionCookie(token));
  json(res, 200, { ok: true });
}
