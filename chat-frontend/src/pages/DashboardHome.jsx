import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* 🔵 HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={styles.title}>
            Welcome to <span style={{ color: "#2563eb" }}>UniGuide AI</span>
          </h1>

          <h2 style={styles.typing}>
            <Typewriter
              words={[
                "Know Your Rights.",
                "Understand University Rules.",
                "Get Guided. Get Protected.",
              ]}
              loop
              cursor
              typeSpeed={60}
              deleteSpeed={40}
            />
          </h2>

          <p style={styles.description}>
            An intelligent academic assistance system designed to help
            Calicut University students understand university rules,
            student rights, academic procedures, and complaint mechanisms —
            in a simple and structured way.
          </p>
        </motion.div>

        {/* 🔷 CARDS SECTION */}
        <div style={styles.cardContainer}>
          
          {/* Card 1 */}
          <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <h3>💬 AI Chat Assistance</h3>
            <p>
              Ask questions related to university regulations, exams,
              fees, student rights, and academic procedures.
            </p>
            <button
              style={styles.button}
              onClick={() => navigate("/dashboard/chat")}
            >
              Go to Chat
            </button>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <h3>🧾 Complaint Management</h3>
            <p>
              Create, draft, finalize, and submit official complaints
              with AI-assisted drafting and PDF generation.
            </p>
            <button
              style={styles.button}
              onClick={() => navigate("/dashboard/complaints")}
            >
              View Complaints
            </button>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <h3>👤 Profile</h3>
            <p>
              Manage your personal details including college
              information and registration details used in complaint
              generation.
            </p>
            <button
              style={styles.button}
              onClick={() => navigate("/dashboard/profile")}
            >
              View Profile
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;


/* ---------- Styles ---------- */

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f8fafc, #eef2ff)",
    paddingTop: "40px",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
  },

  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "10px",
  },

  typing: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#1e3a8a",
    marginBottom: "20px",
  },

  description: {
    color: "#374151",
    fontSize: "16px",
    maxWidth: "750px",
    marginBottom: "40px",
    lineHeight: "1.6",
  },

  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },

  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "all 0.3s ease",
    border: "1px solid #e5e7eb",
  },

  button: {
    marginTop: "auto",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#1e3a8a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
};
