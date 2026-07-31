import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const STAGES = ["Applied", "Screening", "Interview", "Offer Sent", "Hired", "Rejected"];
const STAGE_STYLES = {
  "Applied":    { bg: "#eff6ff", border: "#bfdbfe", badge: "#3b82f6", text: "#1e3a8a" },
  "Screening":  { bg: "#faf5ff", border: "#e9d5ff", badge: "#8b5cf6", text: "#4c1d95" },
  "Interview":  { bg: "#fef9c3", border: "#fde68a", badge: "#f59e0b", text: "#713f12" },
  "Offer Sent": { bg: "#fff7ed", border: "#fed7aa", badge: "#f97316", text: "#7c2d12" },
  "Hired":      { bg: "#d1fae5", border: "#6ee7b7", badge: "#10b981", text: "#065f46" },
  "Rejected":   { bg: "#fee2e2", border: "#fca5a5", badge: "#ef4444", text: "#7f1d1d" },
};
const EMPTY_FORM = { name: "", email: "", phone: "", linkedin: "", resume: "", position: "", stage: "Applied", notes: "", date: "" };

// ==========================================
// 🔐 LOGIN SCREEN
// ==========================================
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); triggerShake(); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError("Incorrect email or password. Please try again."); triggerShake(); }
    else onLogin();
  };

  const handleForgot = async () => {
    if (!email) { setError("Please enter your email address first."); triggerShake(); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setLoading(false);
    if (error) setError(error.message);
    else setMode("reset_sent");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1628 0%, #0a66c2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 32px 80px rgba(0,0,0,0.3)", textAlign: "center", animation: shake ? "shake 0.5s ease" : "none" }}>
        <div style={{ width: 64, height: 64, background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
          {mode === "reset_sent" ? "📧" : "🔐"}
        </div>
        {mode === "reset_sent" ? (
          <>
            <h1 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Check your email!</h1>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>We sent a reset link to <strong>{email}</strong>. Click it to set a new password.</p>
            <button onClick={() => { setMode("login"); setEmail(""); setError(""); }} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#0a66c2", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Back to Login</button>
          </>
        ) : (
          <>
            <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Migs ATS</h1>
            <p style={{ margin: "0 0 28px", fontSize: 14, color: "#64748b" }}>{mode === "login" ? "Sign in to access the app" : "Enter your email to reset your password"}</p>
            <div style={{ marginBottom: 14, textAlign: "left" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Email</label>
              <input type="email" value={email} placeholder="your@email.com" onChange={(e) => { setEmail(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && mode === "login" && handleLogin()}
                style={{ width: "100%", padding: "12px 16px", border: `2px solid ${error ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, fontSize: 15, boxSizing: "border-box", outline: "none" }} />
            </div>
            {mode === "login" && (
              <div style={{ marginBottom: 6, textAlign: "left" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={show ? "text" : "password"} value={password} placeholder="Enter your password" onChange={(e) => { setPassword(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    style={{ width: "100%", padding: "12px 44px 12px 16px", border: `2px solid ${error ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, fontSize: 15, boxSizing: "border-box", outline: "none" }} />
                  <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8" }}>{show ? "🙈" : "👁️"}</button>
                </div>
              </div>
            )}
            {mode === "login" && <div style={{ textAlign: "right", marginBottom: 20 }}><button onClick={() => { setMode("forgot"); setError(""); setPassword(""); }} style={{ background: "none", border: "none", color: "#0a66c2", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Forgot password?</button></div>}
            {error && <p style={{ margin: "0 0 14px", fontSize: 13, color: "#ef4444", fontWeight: 500 }}>❌ {error}</p>}
            <button onClick={mode === "login" ? handleLogin : handleForgot} disabled={loading}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: loading ? "#93c5fd" : "#0a66c2", color: "white", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Send Reset Link →"}
            </button>
            {mode === "forgot" && <button onClick={() => { setMode("login"); setError(""); }} style={{ marginTop: 14, background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer" }}>← Back to Login</button>}
          </>
        )}
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }`}</style>
    </div>
  );
}

// ==========================================
// 🔑 RESET PASSWORD SCREEN
// ==========================================
function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else { setSuccess(true); setTimeout(() => onDone(), 2000); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1628 0%, #0a66c2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 32px 80px rgba(0,0,0,0.3)", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: success ? "#d1fae5" : "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>{success ? "✅" : "🔑"}</div>
        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{success ? "Password Updated!" : "Set New Password"}</h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: "#64748b" }}>{success ? "Redirecting you to the app..." : "Choose a new password for your account"}</p>
        {!success && (
          <>
            {[{ label: "New Password", val: password, set: setPassword }, { label: "Confirm Password", val: confirm, set: setConfirm }].map(({ label, val, set }) => (
              <div key={label} style={{ marginBottom: 14, textAlign: "left" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
                <div style={{ position: "relative" }}>
                  <input type={show ? "text" : "password"} value={val} placeholder="Min. 6 characters" onChange={(e) => { set(e.target.value); setError(""); }}
                    style={{ width: "100%", padding: "12px 44px 12px 16px", border: `2px solid ${error ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, fontSize: 15, boxSizing: "border-box", outline: "none" }} />
                  <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8" }}>{show ? "🙈" : "👁️"}</button>
                </div>
              </div>
            ))}
            {error && <p style={{ margin: "0 0 14px", fontSize: 13, color: "#ef4444", fontWeight: 500 }}>❌ {error}</p>}
            <button onClick={handleReset} disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: loading ? "#93c5fd" : "#0a66c2", color: "white", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Updating..." : "Update Password →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 🏠 MAIN APP
// ==========================================
export default function ApplicantTracker() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detailApplicant, setDetailApplicant] = useState(null);
  const [saved, setSaved] = useState(false);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    // Catch password recovery from email link
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsResettingPassword(true);
      setAuthLoading(false);
      return;
    }
  
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResettingPassword(true);
        setSession(null);
      } else {
        setIsResettingPassword(false);
        setSession(session);
      }
    });
  
    return () => subscription.unsubscribe();
  }, []);

  const fetchApplicants = async () => {
    setDbLoading(true);
    const { data, error } = await supabase.from("applicants").select("*").order("created_at", { ascending: false });
    if (!error) setApplicants(data || []);
    setDbLoading(false);
  };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const filtered = applicants.filter((a) => {
    const matchStage = filter === "All" || a.stage === filter;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.position.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    return matchStage && matchSearch;
  });

  const counts = {};
  STAGES.forEach((s) => { counts[s] = applicants.filter((a) => a.stage === s).length; });

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (a) => { setForm({ name: a.name, email: a.email, phone: a.phone || "", linkedin: a.linkedin || "", resume: a.resume || "", position: a.position, stage: a.stage, notes: a.notes || "", date: a.date || "" }); setEditingId(a.id); setShowForm(true); setDetailApplicant(null); };

  const handleSubmit = async () => {
    if (!form.name || !form.position) return;
    if (editingId !== null) {
      const { error } = await supabase.from("applicants").update({ name: form.name, email: form.email, phone: form.phone, linkedin: form.linkedin, resume: form.resume, position: form.position, stage: form.stage, notes: form.notes, date: form.date }).eq("id", editingId);
      if (!error) { await fetchApplicants(); flash(); }
    } else {
      const { error } = await supabase.from("applicants").insert([{ name: form.name, email: form.email, phone: form.phone, linkedin: form.linkedin, resume: form.resume, position: form.position, stage: form.stage, notes: form.notes, date: form.date }]);
      if (!error) { await fetchApplicants(); flash(); }
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this applicant?")) {
      const { error } = await supabase.from("applicants").delete().eq("id", id);
      if (!error) { setApplicants((prev) => prev.filter((a) => a.id !== id)); setDetailApplicant(null); flash(); }
    }
  };

  const handleStageChange = async (id, stage) => {
    const { error } = await supabase.from("applicants").update({ stage }).eq("id", id);
    if (!error) {
      setApplicants((prev) => prev.map((a) => a.id === id ? { ...a, stage } : a));
      if (detailApplicant?.id === id) setDetailApplicant((d) => ({ ...d, stage }));
      flash();
    }
  };

  const handleDrop = (stage) => { if (dragId == null) return; handleStageChange(dragId, stage); setDragId(null); };
  const handleLogout = async () => { await supabase.auth.signOut(); };

  const initials = (name) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarColor = (name) => {
    const colors = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#f97316","#06b6d4","#ec4899"];
    let h = 0; for (let c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
    return colors[h];
  };

  if (authLoading) return <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a1628 0%, #0a66c2 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "'Segoe UI', sans-serif", fontSize: 16 }}>Loading...</div>;
  if (isResettingPassword) return <ResetPasswordScreen onDone={() => setIsResettingPassword(false)} />;
  if (!session) return <LoginScreen onLogin={() => {}} />;

  const userEmail = session?.user?.email || "";
  const displayName = userEmail.split("@")[0];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0a66c2 100%)", padding: "20px 32px", color: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>👥 Migs ATS</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, opacity: 0.8 }}>{applicants.length} total applicants · <a href="/apply" target="_blank" rel="noreferrer" style={{ color: "#93c5fd", fontWeight: 600 }}>🔗 Share Application Form</a></p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {saved && <span style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "5px 12px", borderRadius: 20 }}>✅ Saved</span>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: 20 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: avatarColor(displayName), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 11 }}>{initials(displayName)}</div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Hi, {displayName}!</span>
            </div>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: 3 }}>
              {["table","kanban"].map((v) => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: view === v ? "white" : "transparent", color: view === v ? "#0a66c2" : "white", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {v === "table" ? "📋 Table" : "🗂 Kanban"}
                </button>
              ))}
            </div>
            <button onClick={openAdd} style={{ background: "white", color: "#0a66c2", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Add Applicant</button>
            <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🔒 Sign Out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[{ label: "All", count: applicants.length, color: "#0a66c2", bg: "#e7f0fb" }, ...STAGES.map((s) => ({ label: s, count: counts[s], color: STAGE_STYLES[s].badge, bg: STAGE_STYLES[s].bg }))].map(({ label, count, color, bg }) => (
            <button key={label} onClick={() => setFilter(label)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filter === label ? color : "#e2e8f0"}`, background: filter === label ? bg : "white", color: filter === label ? color : "#64748b", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              {label} <span style={{ opacity: 0.8 }}>({count ?? applicants.length})</span>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
          <input placeholder="🔍 Search by name, position, or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 14, background: "white", outline: "none" }} />
          {search && <button onClick={() => setSearch("")} style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 9, background: "white", cursor: "pointer", fontSize: 13, color: "#64748b" }}>Clear</button>}
        </div>

        {dbLoading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", background: "white", borderRadius: 12 }}>
            <div style={{ fontSize: 32 }}>⏳</div>
            <div style={{ marginTop: 8 }}>Loading applicants...</div>
          </div>
        ) : view === "table" ? (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: 40 }}>👤</div>
                <div style={{ marginTop: 8 }}>No applicants yet. Share the <a href="/apply" target="_blank" rel="noreferrer" style={{ color: "#0a66c2" }}>application form</a> to get started!</div>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Applicant", "Position", "Applied", "Stage", "LinkedIn", "Resume", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const s = STAGE_STYLES[a.stage];
                    return (
                      <tr key={a.id} style={{ background: s.bg, borderBottom: i < filtered.length - 1 ? `1px solid ${s.border}` : "none", cursor: "pointer" }} onClick={() => setDetailApplicant(a)}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColor(a.name), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials(a.name)}</div>
                            <div><div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{a.name}</div><div style={{ fontSize: 12, color: "#64748b" }}>{a.email}</div></div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: "#334155" }}>{a.position}</td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{a.date || "—"}</td>
                        <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                          <select value={a.stage} onChange={(e) => handleStageChange(a.id, e.target.value)} style={{ background: s.badge, color: "white", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {STAGES.map((st) => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                          {a.linkedin ? <a href={a.linkedin} target="_blank" rel="noreferrer" style={{ color: "#0a66c2", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>🔗 Profile</a> : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                          {a.resume ? <a href={a.resume} target="_blank" rel="noreferrer" style={{ color: "#7c3aed", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>📄 Resume</a> : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => openEdit(a)} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#334155" }}>Edit</button>
                            <button onClick={() => handleDelete(a.id)} style={{ background: "white", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#dc2626" }}>Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {STAGES.map((stage) => {
              const s = STAGE_STYLES[stage];
              const cards = filtered.filter((a) => a.stage === stage);
              return (
                <div key={stage} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(stage)} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: 12, minHeight: 200 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stage}</span>
                    <span style={{ background: s.badge, color: "white", borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{cards.length}</span>
                  </div>
                  {cards.map((a) => (
                    <div key={a.id} draggable onDragStart={() => setDragId(a.id)} onClick={() => setDetailApplicant(a)} style={{ background: "white", border: `1px solid ${s.border}`, borderRadius: 9, padding: "10px 12px", marginBottom: 8, cursor: "grab" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: avatarColor(a.name), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{initials(a.name)}</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", lineHeight: 1.2 }}>{a.name}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{a.position}</div>
                      {a.notes && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.notes}</div>}
                    </div>
                  ))}
                  {cards.length === 0 && <div style={{ fontSize: 12, color: "#cbd5e1", textAlign: "center", marginTop: 16 }}>Drop here</div>}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", textAlign: "right" }}>
          {filtered.length} of {applicants.length} applicants shown · Data synced with Supabase
        </div>
      </div>

      {detailApplicant && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 998 }} onClick={(e) => e.target === e.currentTarget && setDetailApplicant(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: avatarColor(detailApplicant.name), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18 }}>{initials(detailApplicant.name)}</div>
              <div><h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{detailApplicant.name}</h2><p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{detailApplicant.position}</p></div>
              <button onClick={() => setDetailApplicant(null)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
            {[{ label: "📧 Email", value: detailApplicant.email }, { label: "📱 Phone", value: detailApplicant.phone }, { label: "📅 Applied", value: detailApplicant.date }].map(({ label, value }) => value ? (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
                <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{value}</span>
              </div>
            ) : null)}
            <div style={{ display: "flex", gap: 10, margin: "14px 0" }}>
              {detailApplicant.linkedin && <a href={detailApplicant.linkedin} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "9px", borderRadius: 8, background: "#e7f0fb", color: "#0a66c2", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>🔗 LinkedIn</a>}
              {detailApplicant.resume && <a href={detailApplicant.resume} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "9px", borderRadius: 8, background: "#f5f3ff", color: "#7c3aed", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>📄 Resume</a>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Stage</label>
              <select value={detailApplicant.stage} onChange={(e) => handleStageChange(detailApplicant.id, e.target.value)} style={{ display: "block", width: "100%", marginTop: 6, padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, background: STAGE_STYLES[detailApplicant.stage].bg }}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {detailApplicant.notes && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Interview Notes</label>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "#334155", background: "#f8fafc", padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>{detailApplicant.notes}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => openEdit(detailApplicant)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#334155" }}>✏️ Edit</button>
              <button onClick={() => handleDelete(detailApplicant.id)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "white", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#dc2626" }}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{editingId !== null ? "Edit Applicant" : "Add Applicant"}</h2>
            {[
              { label: "Full Name *", key: "name", type: "text", placeholder: "e.g. Maria Santos" },
              { label: "Email *", key: "email", type: "email", placeholder: "e.g. maria@email.com" },
              { label: "Phone", key: "phone", type: "text", placeholder: "e.g. +63 912 345 6789" },
              { label: "Position Applied For *", key: "position", type: "text", placeholder: "e.g. Frontend Engineer" },
              { label: "LinkedIn URL", key: "linkedin", type: "url", placeholder: "https://linkedin.com/in/..." },
              { label: "Resume Link", key: "resume", type: "url", placeholder: "https://drive.google.com/..." },
              { label: "Date Applied", key: "date", type: "date", placeholder: "" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 13 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[key]} placeholder={placeholder} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              </div>
            ))}
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Stage</label>
              <select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Interview Notes</label>
              <textarea value={form.notes} placeholder="Impressions, skills, follow-ups..." onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 14, color: "#475569" }}>Cancel</button>
              <button onClick={handleSubmit} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#0a66c2", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                {editingId !== null ? "Save Changes" : "Add Applicant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
