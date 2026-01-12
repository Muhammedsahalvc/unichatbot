import { Outlet, Link } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#222", color: "#fff", padding: "20px" }}>
        <h3>Dashboard</h3>
        <nav>
          <p><Link to="/dashboard" style={{ color: "#fff" }}>Home</Link></p>
          <p><Link to="/dashboard/complaints" style={{ color: "#fff" }}>Complaints</Link></p>
          <p><Link to="/dashboard/new-complaint" style={{ color: "#fff" }}>New Complaint</Link></p>
          <p><Link to="/dashboard/chat" style={{ color: "#fff" }}>Chat</Link></p>
          <p><Link to="/dashboard/profile" style={{ color: "#fff" }}>Profile</Link></p>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;
