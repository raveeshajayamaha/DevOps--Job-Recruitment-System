import { Link } from "react-router-dom";

function ResumeBuilder() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#eef3f9",
      padding: "32px 24px",
      fontFamily: "Inter, 'Segoe UI', sans-serif",
      color: "#0f172a"
    }}>
      <div style={{
        maxWidth: "960px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "18px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
        padding: "28px"
      }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, color: "#1769e0", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Career Resource
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: "32px" }}>
            Resume Builder
          </h1>
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          <div style={{ padding: "20px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <h2 style={{ marginTop: 0 }}>Resume Tips</h2>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: "1.8" }}>
              <li>Use a clear summary statement at the top.</li>
              <li>Highlight measurable achievements with numbers.</li>
              <li>Keep formatting simple and ATS-friendly.</li>
              <li>Match your keywords to the job description.</li>
            </ul>
          </div>

          <div style={{ padding: "20px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <h2 style={{ marginTop: 0 }}>Suggested Structure</h2>
            <ol style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: "1.8" }}>
              <li>Contact Information</li>
              <li>Professional Summary</li>
              <li>Skills</li>
              <li>Experience</li>
              <li>Education</li>
            </ol>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <Link
            to="/candidate/resources"
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#1769e0",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Back to Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
