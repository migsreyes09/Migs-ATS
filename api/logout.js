import { clearSessionCookie, json } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  res.setHeader("Set-Cookie", clearSessionCookie());
  json(res, 200, { ok: true });
}
