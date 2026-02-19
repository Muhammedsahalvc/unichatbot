import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/user/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleLogin}>
        <h2 style={styles.title}>University Law Chatbot</h2>
        <p style={styles.subtitle}>Student Login</p>

        <input
          style={styles.input}
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={styles.passwordWrapper}>
          <input
            style={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <span
            style={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            👁️
          </span>
        </div>


        <button style={styles.button} type="submit">
          Login
        </button>

        <p style={styles.footer}>
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
  },
  card: {
    width: "360px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  title: {
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: "5px",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
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
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  eye: {
    position: "absolute",
    right: "10px",
    cursor: "pointer",
    fontSize: "16px",
    color: "#64748b",
  },

  footer: {
    textAlign: "center",
    fontSize: "14px",
  },
};

export default Login;
