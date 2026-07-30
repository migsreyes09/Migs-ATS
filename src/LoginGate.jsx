import { useEffect, useState } from "react";
import ApplicantTracker from "./ApplicantTracker";
import ChangePasswordModal from "./ChangePasswordModal";

export default function LoginGate() {
  const [status, setStatus] = useState("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    fetch("/api/verify", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStatus(data.authenticated ? "authed" : "login"))
      .catch(() => setStatus("login"));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      setPassword("");
      setStatus("authed");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setStatus("login");
  };

  if (status === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif", color: "#64748b" }}>
        Checking access…
      </div>
    );
  }

  if (status === "login") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e3a5f 0%, #0a66c2 100%)", fontFamily: "'Segoe UI', sans-serif", padding: 16 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Applicant Tracker</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748b" }}>Enter your password to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
              placeholder="Enter ATS password"
              style={{ width: "100%", padding: "11px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 14 }}
            />

            {error && (
              <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 8, background: "#fef2f2", color: "#b91c1c", fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "11px", borderRadius: 8, border: "none", background: loading ? "#94a3b8" : "#0a66c2", color: "white", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15 }}
            >
              {loading ? "Signing in…" : "Unlock ATS"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <ApplicantTracker
        onLogout={handleLogout}
        onChangePassword={() => setShowChangePassword(true)}
      />
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => {
            setTimeout(() => setShowChangePassword(false), 1800);
          }}
        />
      )}
    </>
  );
}
