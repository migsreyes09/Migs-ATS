import { useState } from "react";
import { supabase } from "./supabase";

const POSITIONS = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Product Designer",
  "Product Manager",
  "Data Analyst",
  "DevOps Engineer",
  "QA Engineer",
  "Customer Support Specialist",
  "Other",
];

const FIELD_STYLE = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #e2e8f0",
  borderBottom: "2px solid #e2e8f0",
  borderRadius: "4px 4px 0 0",
  fontSize: 15,
  background: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "'Segoe UI', sans-serif",
};

function FormCard({ children, required, label, hint }) {
  return (
    <div style={{ background: "white", borderRadius: 8, border: "1px solid #e0e0e0", padding: "24px 28px", marginBottom: 16, borderLeft: "6px solid #0a66c2" }}>
      {label && (
        <label style={{ display: "block", fontSize: 15, fontWeight: 500, color: "#202124", marginBottom: 16 }}>
          {label} {required && <span style={{ color: "#d93025" }}>*</span>}
        </label>
      )}
      {children}
      {hint && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#80868b" }}>{hint}</p>}
    </div>
  );
}

export default function ApplicationForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", position: "", linkedin: "", resume: "", date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState("");

  const set = (key, val) => { setForm((f) => ({ ...f, [key]: val })); setErrors((e) => ({ ...e, [key]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "This is a required question";
    if (!form.email.trim()) e.email = "This is a required question";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Please enter a valid email";
    if (!form.position) e.position = "This is a required question";
    if (!form.date) e.date = "This is a required question";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    const { error } = await supabase.from("applicants").insert([{
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position: form.position,
      linkedin: form.linkedin.trim(),
      resume: form.resume.trim(),
      date: form.date,
      stage: "Applied",
      notes: "",
    }]);
    setLoading(false);
    if (error) { alert("Something went wrong. Please try again."); console.error(error); }
    else setSubmitted(true);
  };

  const inputStyle = (key) => ({
    ...FIELD_STYLE,
    borderBottomColor: errors[key] ? "#d93025" : focused === key ? "#0a66c2" : "#e2e8f0",
  });

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ background: "white", borderRadius: 8, border: "1px solid #e0e0e0", padding: "48px 40px", maxWidth: 520, width: "100%", textAlign: "center", borderTop: "10px solid #0a66c2" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#202124", margin: "0 0 12px" }}>Application Submitted!</h2>
          <p style={{ fontSize: 15, color: "#5f6368", lineHeight: 1.6, margin: "0 0 28px" }}>
            Thank you <strong>{form.name}</strong>! We've received your application for <strong>{form.position}</strong>. We'll be in touch soon.
          </p>
          <button onClick={() => { setForm({ name: "", email: "", phone: "", position: "", linkedin: "", resume: "", date: new Date().toISOString().split("T")[0] }); setSubmitted(false); }}
            style={{ padding: "10px 24px", borderRadius: 4, border: "none", background: "#0a66c2", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f9", fontFamily: "'Segoe UI', sans-serif", padding: "32px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Header Card */}
        <div style={{ background: "white", borderRadius: 8, border: "1px solid #e0e0e0", borderTop: "10px solid #0a66c2", padding: "28px 28px 24px", marginBottom: 16 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 600, color: "#202124" }}>Job Application Form</h1>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#5f6368", lineHeight: 1.6 }}>
            Thank you for your interest! Please fill out the form below and we'll get back to you as soon as possible.
          </p>
          <div style={{ padding: "10px 14px", background: "#fff8e1", borderRadius: 4, border: "1px solid #ffe082", fontSize: 13, color: "#795548" }}>
            <span style={{ color: "#d93025", fontWeight: 600 }}>*</span> Indicates required question
          </div>
        </div>

        {/* Full Name */}
        <FormCard label="Full Name" required>
          <input type="text" value={form.name} placeholder="Your answer"
            onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
            onChange={(e) => set("name", e.target.value)}
            style={inputStyle("name")} />
          {errors.name && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#d93025" }}>{errors.name}</p>}
        </FormCard>

        {/* Email */}
        <FormCard label="Email Address" required>
          <input type="email" value={form.email} placeholder="Your answer"
            onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
            onChange={(e) => set("email", e.target.value)}
            style={inputStyle("email")} />
          {errors.email && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#d93025" }}>{errors.email}</p>}
        </FormCard>

        {/* Phone */}
        <FormCard label="Phone Number">
          <input type="text" value={form.phone} placeholder="Your answer"
            onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
            onChange={(e) => set("phone", e.target.value)}
            style={inputStyle("phone")} />
        </FormCard>

        {/* Position */}
        <FormCard label="Position Applying For" required>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {POSITIONS.map((p) => (
              <label key={p} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontSize: 15, color: "#202124" }}>
                <div onClick={() => set("position", p)}
                  style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form.position === p ? "#0a66c2" : "#80868b"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                  {form.position === p && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0a66c2" }} />}
                </div>
                <span onClick={() => set("position", p)}>{p}</span>
              </label>
            ))}
          </div>
          {errors.position && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#d93025" }}>{errors.position}</p>}
        </FormCard>

        {/* Date Applied */}
        <FormCard label="Date Applied" required>
          <input type="date" value={form.date}
            onFocus={() => setFocused("date")} onBlur={() => setFocused("")}
            onChange={(e) => set("date", e.target.value)}
            style={inputStyle("date")} />
          {errors.date && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#d93025" }}>{errors.date}</p>}
        </FormCard>

        {/* LinkedIn */}
        <FormCard label="LinkedIn Profile URL" hint="e.g. https://linkedin.com/in/yourname">
          <input type="url" value={form.linkedin} placeholder="Your answer"
            onFocus={() => setFocused("linkedin")} onBlur={() => setFocused("")}
            onChange={(e) => set("linkedin", e.target.value)}
            style={inputStyle("linkedin")} />
        </FormCard>

        {/* Resume */}
        <FormCard label="Resume Link (Google Drive)" hint="Make sure the link is set to 'Anyone with the link can view'">
          <input type="url" value={form.resume} placeholder="Your answer"
            onFocus={() => setFocused("resume")} onBlur={() => setFocused("")}
            onChange={(e) => set("resume", e.target.value)}
            style={inputStyle("resume")} />
        </FormCard>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: "12px 28px", borderRadius: 4, border: "none", background: loading ? "#93c5fd" : "#0a66c2", color: "white", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button onClick={() => setForm({ name: "", email: "", phone: "", position: "", linkedin: "", resume: "", date: new Date().toISOString().split("T")[0] })}
            style={{ background: "none", border: "none", color: "#0a66c2", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>
            Clear form
          </button>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "#80868b", textAlign: "center" }}>
          Never submit passwords through this form.
        </p>
      </div>
    </div>
  );
}
