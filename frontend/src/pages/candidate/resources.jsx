import { Link } from "react-router-dom";
import resources from "../../data/resources";

function ResourcesPage() {
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
              Career Resources
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

        <div style={{ display: "grid", gap: "16px" }}>
          {resources.map((resource) => (
            <Link
              key={resource.id}
              to={resource.route}
              style={{
                display: "grid",
                gridTemplateColumns: "52px minmax(0,1fr)",
                gap: "16px",
                alignItems: "center",
                padding: "18px 20px",
                borderRadius: "14px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                textDecoration: "none"
              }}
            >
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "12px",
                background: resource.category === "resume" ? "#e0ecff" : "#e7f9ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                {resource.category === "resume" ? "📄" : "💡"}
              </div>

              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>{resource.title}</h3>
                <p style={{ margin: 0, color: "#64748b" }}>{resource.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResourcesPage;
