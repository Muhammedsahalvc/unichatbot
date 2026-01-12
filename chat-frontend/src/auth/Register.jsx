import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [college, setCollege] = useState("");
  const [registerNo, setRegisterNo] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await axiosInstance.post("/user/signup", {
        name,
        email,
        password,
        college,
        register_no: registerNo,
      });
      alert("Registration successful");
      navigate("/");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleRegister}>
        <h2 style={styles.title}>Create Student Account</h2>

        <input
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />


        <input
          style={styles.input}
          placeholder="College"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          required
        />

        <input
          style={styles.input}
          placeholder="Register Number"
          value={registerNo}
          onChange={(e) => setRegisterNo(e.target.value)}
          required
        />

        <button style={styles.button} type="submit">
          Register
        </button>

        <p style={styles.footer}>
          Already registered? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
  },
  card: {
    width: "380px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  title: {
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#1e3a8a",
    color: "#ffffff",
    fontWeight: "500",
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    fontSize: "14px",
  },
};

export default Register;
