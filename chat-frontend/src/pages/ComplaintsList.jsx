import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axiosInstance.get("/complaints/all");
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading complaints...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Complaints</h2>
        <button
          style={styles.newBtn}
          onClick={() => navigate("/dashboard/complaints/new")}
        >
          + New Complaint
        </button>
      </div>

      {complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <div style={styles.cardGrid}>
          {complaints.map((c) => (
  <div key={c.id} style={styles.card}>
    
    {/* Header row */}
    <div style={styles.cardHeader}>
      <h3 style={styles.title}>
        {c.title || "Untitled Complaint"}
      </h3>

      <span style={styles.statusBadge(c.status)}>
        {c.status}
      </span>
    </div>

    {/* Description preview */}
    <p style={styles.preview}>
      {c.description
        ? c.description.slice(0, 80) + "..."
        : "No description provided"}
    </p>

    {/* Meta info */}
    <div style={styles.meta}>
      <span>Category: <strong>{c.category}</strong></span>
      <span>🕒 Updated {timeAgo(c.submitted_at || c.created_at)}</span>
    </div>

    {/* Action */}
    <button
      style={styles.viewBtn}
      onClick={() => navigate(`/dashboard/complaints/${c.id}`)}
    >
      View Complaint
    </button>

  </div>
))}

        </div>
      )}
    </div>
  );
}

export default ComplaintsList;

/* ---------- Helpers ---------- */

function timeAgo(dateString) {
  if (!dateString) return "Just now";
  const diff =
    Math.floor(
      (new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24)
    );

  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

function statusStyle(status) {
  let bg = "#9ca3af";

  if (status === "Draft") bg = "#f59e0b";
  if (status === "Draft Generated") bg = "#6366f1";
  if (status === "Finalized") bg = "#2563eb";
  if (status === "Sent") bg = "#16a34a";

  return {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    background: bg,
    color: "#fff",
  };
}

/* ---------- Styles ---------- */

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "0.2s",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
  },

  preview: {
    color: "#555",
    fontSize: "14px",
  },

  meta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#777",
  },

  viewBtn: {
    marginTop: "10px",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
  },

  statusBadge: (status) => {
    let bg = "#999";
    if (status === "Draft") bg = "#f59e0b";
    if (status === "Draft Generated") bg = "#6366f1";
    if (status === "Finalized") bg = "#2563eb";
    if (status === "Sent") bg = "#16a34a";

    return {
      background: bg,
      color: "#fff",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
    };
  },
};
