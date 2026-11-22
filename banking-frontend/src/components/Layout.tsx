import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">B</span><span>BankFlow</span></div>
        <p className="nav-label">MENU</p>
        <nav className="nav-links">
          <NavLink to="/">Overview</NavLink>
          <NavLink to="/deposit">Deposit</NavLink>
          <NavLink to="/withdraw">Withdraw</NavLink>
          <NavLink to="/transfer">Transfer</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{user?.fullName?.charAt(0).toUpperCase() || "U"}</div>
            <div><strong>{user?.fullName}</strong><small>{user?.role}</small></div>
          </div>
          <button className="button button-ghost full-width" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div><span className="eyebrow">PERSONAL BANKING</span><strong>Welcome back, {user?.fullName?.split(" ")[0]}</strong></div>
          <span className="status-pill">● Secure session</span>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}