import {
  createSessionToken,
  getPassword,
  getSessionSecret,
  isAuthed,
  json,
  safeEqual,
  sessionCookie,
} from "./_lib/auth.js";

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function updateVercelPassword(newPassword) {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return { updated: false, reason: "missing_vercel_config" };
  }

  const teamQuery = teamId ? `?teamId=${teamId}` : "";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const listRes = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env${teamQuery}`,
    { headers }
  );

  if (!listRes.ok) {
    throw new Error(`Failed to list env vars (${listRes.status})`);
  }

  const { envs = [] } = await listRes.json();
  const targets = ["production", "preview", "development"];
  const existing = envs.find((env) => env.key === "ATS_PASSWORD");

  if (existing) {
    const patchRes = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}${teamQuery}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ value: newPassword, target: targets }),
      }
    );
    if (!patchRes.ok) {
      throw new Error(`Failed to update password env var (${patchRes.status})`);
    }
  } else {
    const createRes = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/env${teamQuery}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          key: "ATS_PASSWORD",
          value: newPassword,
          type: "encrypted",
          target: targets,
        }),
      }
    );
    if (!createRes.ok) {
      throw new Error(`Failed to create password env var (${createRes.status})`);
    }
  }

  const latestRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1&target=production${teamId ? `&teamId=${teamId}` : ""}`,
    { headers }
  );

  if (!latestRes.ok) {
    throw new Error(`Password updated but could not find deployment (${latestRes.status})`);
  }

  const { deployments = [] } = await latestRes.json();
  const latest = deployments[0];
  if (!latest?.uid) {
    throw new Error("Password updated but no production deployment was found to redeploy.");
  }

  const deployRes = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      deploymentId: latest.uid,
      target: "production",
    }),
  });

  if (!deployRes.ok) {
    const deployBody = await deployRes.text();
    throw new Error(`Password updated but redeploy failed (${deployRes.status}): ${deployBody}`);
  }

  return { updated: true, redeployed: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!isAuthed(req)) {
    json(res, 401, { error: "Not authenticated" });
    return;
  }

  const currentPassword = getPassword();
  if (!currentPassword) {
    json(res, 503, { error: "Password not configured on server." });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    json(res, 400, { error: "Invalid request body" });
    return;
  }

  const { currentPassword: current, newPassword } = body;

  if (!current || !newPassword) {
    json(res, 400, { error: "Current and new password are required." });
    return;
  }

  if (newPassword.length < 8) {
    json(res, 400, { error: "New password must be at least 8 characters." });
    return;
  }

  if (!safeEqual(current, currentPassword)) {
    json(res, 401, { error: "Current password is incorrect." });
    return;
  }

  if (safeEqual(current, newPassword)) {
    json(res, 400, { error: "New password must be different from the current password." });
    return;
  }

  try {
    const deployResult = await updateVercelPassword(newPassword);

    if (!deployResult.updated) {
      json(res, 503, {
        error: "Password change requires VERCEL_TOKEN and VERCEL_PROJECT_ID to be set in your Vercel project settings.",
      });
      return;
    }

    const token = createSessionToken(getSessionSecret());
    res.setHeader("Set-Cookie", sessionCookie(token));

    json(res, 200, {
      ok: true,
      deployed: deployResult.redeployed,
      message: "Password updated. Vercel is redeploying now — the new password will be active in about a minute.",
    });
  } catch (error) {
    json(res, 500, { error: error.message || "Failed to update password." });
  }
}
