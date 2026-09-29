import { Link } from "react-router-dom";
import interviews from "../../data/interviews";

function InterviewsPage() {
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
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <div>
            <p style={{ margin: 0, color: "#1769e0", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Candidate Portal
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: "32px" }}>
              Upcoming Interviews
            </h1>
          </div>

          <Link
            to="/candidate/dashboard"
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#1769e0",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Back to Dashboard
          </Link>
        </div>

        {interviews.length === 0 ? (
          <div style={{
            padding: "28px",
            borderRadius: "16px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#64748b"
          }}>
            No interviews scheduled yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {interviews.map((interview) => (
              <div
                key={interview.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "52px minmax(0,1fr) auto",
                  gap: "16px",
                  alignItems: "center",
                  padding: "18px 20px",
                  borderRadius: "14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "#edf4ff",
                  color: "#1769e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px"
                }}>
                  {interview.type === "Technical" ? "🎥" : interview.type === "HR" ? "👥" : "🧩"}
                </div>

                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>{interview.title}</h3>
                  <p style={{ margin: "0 0 6px", color: "#64748b" }}>{interview.company}</p>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                    📅 {interview.date} &nbsp; 🕐 {interview.time} &nbsp; • &nbsp; {interview.location}
                  </p>
                </div>

                <span style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "#dbeafe",
                  color: "#2563eb",
                  fontSize: "11px",
                  fontWeight: 700
                }}>
                  {interview.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewsPage;
