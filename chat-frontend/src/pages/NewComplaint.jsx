import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function NewComplaint() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !description) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/complaints/create", {
        title,
        category,
        description,
      });

      alert("Complaint draft created");
      navigate("/dashboard/complaints");
    } catch (err) {
      console.error(err);
      alert("Failed to create complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create New Complaint</h2>

      <form style={styles.card} onSubmit={handleSubmit}>
        <label style={styles.label}>Complaint Title</label>
        <input
          style={styles.input}
          placeholder="Short title of the complaint"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label style={styles.label}>Category</label>
        <select
          style={styles.input}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category</option>
          <option value="Examinations">Examinations</option>
          <option value="Fees">Fees</option>
          <option value="Hostel">Hostel</option>
          <option value="Scholarship">Scholarship</option>
          <option value="Admission">Admission</option>
          <option value="Other">Other</option>
        </select>

        <label style={styles.label}>Complaint Description</label>
        <textarea
          style={styles.textarea}
          rows={6}
          placeholder="Describe your issue in detail"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={styles.actions}>
          <button style={styles.submitBtn} disabled={loading}>
            {loading ? "Creating..." : "Create Draft"}
          </button>

          <button
            type="button"
            style={styles.cancelBtn}
            onClick={() => navigate("/dashboard/complaints")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewComplaint;

/* ---------- Styles ---------- */

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
  },

  title: {
    color: "#1e3a8a",
    marginBottom: "20px",
  },

  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },

  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    resize: "vertical",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  submitBtn: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#1e3a8a",
    color: "#fff",
    cursor: "pointer",
  },

  cancelBtn: {
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#ffffff",
    cursor: "pointer",
  },
};
