import { Link } from "react-router-dom";
import applications from "../../data/applications";

function Applications() {
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
              My Applications
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

        {applications.length === 0 ? (
          <div style={{
            padding: "28px",
            borderRadius: "16px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#64748b"
          }}>
            No applications yet. Start applying to jobs to see them here.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {applications.map((application) => {
              const statusStyle =
                application.status === "Applied"
                  ? { background: "#dcfce7", color: "#15803d" }
                  : application.status === "Under Review"
                    ? { background: "#dbeafe", color: "#2563eb" }
                    : { background: "#fef3c7", color: "#b45309" };

              return (
                <div
                  key={application.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px minmax(0,1fr) auto",
                    gap: "16px",
                    alignItems: "center",
                    padding: "18px 20px",
                    borderRadius: "14px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#e0ecff",
                    color: "#1769e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700
                  }}>
                    {application.company.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>{application.jobTitle}</h3>
                    <p style={{ margin: 0, color: "#64748b" }}>{application.company}</p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 700,
                        ...statusStyle
                      }}
                    >
                      {application.status}
                    </span>
                    <div style={{ marginTop: "8px", color: "#64748b", fontSize: "12px" }}>
                      {application.appliedDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;
