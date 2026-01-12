import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable profile fields
  const [name, setName] = useState("");
  const [registerNo, setRegisterNo] = useState("");
  const [college, setCollege] = useState("");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/user/profile");
      setProfile(res.data);

      setName(res.data.name || "");
      setRegisterNo(res.data.register_no || "");
      setCollege(res.data.college || "");
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UPDATE PROFILE ---------- */
  const updateProfile = async () => {
    try {
      await axiosInstance.put("/user/profile", {
        name,
        register_no: registerNo,
        college,
      });
      alert("Profile updated successfully");
      fetchProfile();
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  /* ---------- UPDATE PASSWORD ---------- */
  const updatePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert("Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      await axiosInstance.put("/user/update-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      alert("Password updated successfully");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert("Password update failed");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Profile not found</p>;

  return (
    <div style={styles.container}>
      <h2>👤 My Profile</h2>

      {/* PROFILE INFO */}
      <div style={styles.card}>
        <h3>Basic Information</h3>

        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <label>Register Number</label>
        <input
          value={registerNo}
          onChange={(e) => setRegisterNo(e.target.value)}
          style={styles.input}
        />

        <label>College</label>
        <input
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          style={styles.input}
        />

        <label>Email (read-only)</label>
        <input
          value={profile.email}
          disabled
          style={{
            ...styles.input,
            background: "#f3f4f6",
            cursor: "not-allowed",
          }}
        />

        <button onClick={updateProfile} style={styles.primaryBtn}>
          Update Profile
        </button>
      </div>

      {/* PASSWORD SECTION */}
      <div style={styles.card}>
        <h3>🔐 Change Password</h3>

        <input
          type="password"
          placeholder="Current password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={updatePassword} style={styles.dangerBtn}>
          Update Password
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  primaryBtn: {
    marginTop: "15px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "500",
    cursor: "pointer",
  },

  dangerBtn: {
    marginTop: "10px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: "500",
    cursor: "pointer",
  },
};


export default ProfilePage;
