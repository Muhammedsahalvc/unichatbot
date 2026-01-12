import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function ComplaintDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [draftText, setDraftText] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const normalizedStatus = complaint?.status?.toUpperCase();

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            const res = await axiosInstance.get(`/complaints/${id}`);
            setComplaint(res.data);

            // 🔑 IMPORTANT: sync draft_text into state
            setDraftText(res.data.draft_text || "");
        } catch (err) {
            console.error("Failed to load complaint", err);
        } finally {
            setLoading(false);
        }
    };


    // ---------------- ACTIONS ----------------

    const generateDraft = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.post(
                `/complaints/generate-draft/${id}`,
                {
                    category: complaint.category,
                    description: complaint.description,
                }
            );

            await fetchComplaint(); // refresh complaint after draft generation
        } catch (err) {
            console.error("Generate draft error:", err.response?.data || err);
            alert("Draft generation failed");
        } finally {
            setActionLoading(false);
        }
    };

    const finalizeComplaint = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.post(`/complaints/finalize/${id}`, {
                draft_text: draftText,
            });
            await fetchComplaint();
        } catch (err) {
            alert("Finalization failed");
        } finally {
            setActionLoading(false);
        }
    };

    const downloadPDF = async () => {
        try {
            const response = await axiosInstance.get(
                `/complaints/${id}/download-pdf`,
                { responseType: "blob" }
            );

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `complaint_${id}.pdf`;
            link.click();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Failed to download PDF");
        }
    };


    const sendComplaint = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.post(
                `/complaints/send/${id}`,
                {
                    email: "university@gmail.com"
                }
            );

            await fetchComplaint();
            alert("Complaint sent successfully");
        } catch (err) {
            console.error("Send error:", err.response?.data || err);
            alert("Failed to send complaint");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <p>Loading complaint...</p>;
    if (!complaint) return <p>Complaint not found</p>;

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <h2 style={styles.title}>
                    {complaint.title || "Untitled Complaint"}
                </h2>
                <span style={statusBadge(normalizedStatus)}>
                    {complaint.status}
                </span>
            </div>

            {/* META INFO */}
            <div style={styles.meta}>
                <p><strong>Category:</strong> {complaint.category}</p>
                <p>
                    <strong>Created:</strong>{" "}
                    {new Date(complaint.created_at).toLocaleDateString()}
                </p>
            </div>

            {/* DESCRIPTION */}
            <div style={styles.section}>
                <h3>Description</h3>
                <p style={styles.description}>
                    {complaint.description}
                </p>
            </div>

            {/* DRAFT SECTION */}
            {complaint.draft_text && (
                <div style={styles.section}>
                    <h3>Draft Letter</h3>
                    <textarea
                        style={styles.textarea}
                        rows={10}
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        disabled={normalizedStatus === "SENT"}
                    />
                </div>
            )}

            {/* ACTIONS */}
            <div style={styles.actions}>
                {normalizedStatus === "DRAFT" && (
                    <button onClick={generateDraft} style={styles.primaryBtn}>
                        ✍️ Generate Draft
                    </button>
                )}

                {normalizedStatus === "DRAFT GENERATED" && (
                    <button onClick={finalizeComplaint} style={styles.primaryBtn}>
                        ✅ Finalize Complaint
                    </button>
                )}

                {normalizedStatus === "FINALIZED" && (
                    <>
                        <button onClick={sendComplaint} style={styles.primaryBtn}>
                            📤 Send to University
                        </button>
                        <button onClick={downloadPDF} style={styles.secondaryBtn}>
                            ⬇ Download PDF
                        </button>
                    </>
                )}

                {normalizedStatus === "SENT" && (
                    <p style={styles.successText}>
                        ✅ Complaint successfully sent to the university
                    </p>
                )}

                <button
                    onClick={() => navigate("/dashboard/complaints")}
                    style={styles.backBtn}
                >
                    ⬅ Back to Complaints
                </button>
            </div>
        </div>
    );

}

export default ComplaintDetails;

/* ---------- Styles ---------- */

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  title: {
    color: "#1e3a8a",
  },

  meta: {
    display: "flex",
    gap: "20px",
    fontSize: "14px",
    color: "#374151",
    marginBottom: "20px",
  },

  section: {
    marginBottom: "20px",
  },

  description: {
    background: "#f8fafc",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    resize: "vertical",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "10px",
  },

  primaryBtn: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#1e3a8a",
    color: "#ffffff",
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
  },

  backBtn: {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#e5e7eb",
    cursor: "pointer",
  },

  successText: {
    color: "#16a34a",
    fontWeight: "500",
  },
};

function statusBadge(status) {
  let bg = "#9ca3af";
  if (status === "DRAFT") bg = "#f59e0b";
  if (status === "DRAFT GENERATED") bg = "#6366f1";
  if (status === "FINALIZED") bg = "#2563eb";
  if (status === "SENT") bg = "#16a34a";

  return {
    background: bg,
    color: "#ffffff",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  };
}
