import { useNavigate } from "react-router-dom";

function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to UniGuide AI</h1>

      <p style={styles.description}>
        UniGuide AI is an intelligent assistance system designed to help
        Calicut University students understand university rules, student
        rights, academic procedures, and complaint mechanisms.
      </p>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h3>💬 AI Chat Assistance</h3>
          <p>
            Ask questions related to university regulations, exams, fees,
            student rights, and general academic guidance.
          </p>
          <button
            style={styles.button}
            onClick={() => navigate("/dashboard/chat")}
          >
            Go to Chat
          </button>
        </div>

        <div style={styles.card}>
          <h3>🧾 Complaint Management</h3>
          <p>
            Create, draft, finalize, and submit official complaints to the
            university with AI-assisted drafting and PDF generation.
          </p>
          <button
            style={styles.button}
            onClick={() => navigate("/dashboard/complaints")}
          >
            View Complaints
          </button>
        </div>

        <div style={styles.card}>
          <h3>👤 Profile</h3>
          <p>
            Manage your personal details, including college information and
            registration details used in complaint generation.
          </p>
          <button
            style={styles.button}
            onClick={() => navigate("/dashboard/profile")}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;

/* ---------- Styles ---------- */

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
  },

  title: {
    color: "#1e3a8a",
    marginBottom: "10px",
  },

  description: {
    color: "#374151",
    fontSize: "16px",
    maxWidth: "800px",
    marginBottom: "30px",
    lineHeight: "1.6",
  },

  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  button: {
    marginTop: "auto",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    background: "#1e3a8a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "500",
  },
};
