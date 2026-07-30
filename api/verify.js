import { isAuthed, json } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  json(res, 200, { authenticated: isAuthed(req) });
}
