import { useState } from "react";

export default function ChangePasswordModal({ onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to change password.");
        return;
      }

      setMessage(data.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess?.(data);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Change Password</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
          Your new password is saved to Vercel and triggers an automatic redeploy so it takes effect everywhere.
        </p>

        <form onSubmit={handleSubmit}>
          {[
            { label: "Current Password", value: currentPassword, setter: setCurrentPassword, autoComplete: "current-password" },
            { label: "New Password", value: newPassword, setter: setNewPassword, autoComplete: "new-password" },
            { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, autoComplete: "new-password" },
          ].map(({ label, value, setter, autoComplete }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                autoComplete={autoComplete}
                required
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>
          ))}

          {error && (
            <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "#fef2f2", color: "#b91c1c", fontSize: 13 }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "#ecfdf5", color: "#047857", fontSize: 13 }}>
              {message}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 14, color: "#475569" }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: loading ? "#94a3b8" : "#E17726", color: "white", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14 }}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
