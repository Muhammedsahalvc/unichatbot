const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f8fafc",
  },

  sidebar: {
    width: "240px",
    background: "#0f172a", // dark navy
    color: "#ffffff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  logo: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "30px",
    textAlign: "center",
    color: "#e0e7ff",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  link: {
    textDecoration: "none",
    color: "#e5e7eb",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "background 0.2s",
  },

  logoutBtn: {
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    background: "#1e3a8a",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
  },

  main: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
};



import { Outlet, NavLink, useNavigate } from "react-router-dom";

function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>UniGuide AI</h2>

          <nav style={styles.nav}>
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                ...styles.link,
                backgroundColor: isActive ? "#1e293b" : "transparent",
              })}
            >
              🏠 Dashboard
            </NavLink>

            <NavLink
              to="/dashboard/chat"
              style={({ isActive }) => ({
                ...styles.link,
                backgroundColor: isActive ? "#1e293b" : "transparent",
              })}
            >
              💬 Chat
            </NavLink>

            <NavLink
              to="/dashboard/complaints"
              style={({ isActive }) => ({
                ...styles.link,
                backgroundColor: isActive ? "#1e293b" : "transparent",
              })}
            >
              🧾 Complaints
            </NavLink>

            <NavLink
              to="/dashboard/profile"
              style={({ isActive }) => ({
                ...styles.link,
                backgroundColor: isActive ? "#1e293b" : "transparent",
              })}
            >
              👤 Profile
            </NavLink>
          </nav>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
