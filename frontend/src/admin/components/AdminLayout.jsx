import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image,
  FolderKanban,
  Building2,
  ExternalLink,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import {
  logoutAdmin,
  getAuthenticatedUser,
} from "../../services/dataStorage";
import "./AdminLayout.css";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = getAuthenticatedUser() || { username: "admin", role: "Administrator" };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-brand" onClick={closeSidebar}>
            <div className="admin-brand-icon">
              <Shield size={20} />
            </div>
            <div className="admin-brand-text">
              <strong>JS RAM</strong>
              <small>CONTENT CONTROL</small>
            </div>
          </Link>

          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* SIDEBAR NAV LINKS (DASHBOARD, HOMEPAGE, CATEGORIES, PROJECTS) */}
        <nav className="admin-nav">
          <span className="admin-nav-category">NAVIGATION</span>

          {/* 1. DASHBOARD */}
          <NavLink
            to="/admin/dashboard"
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {/* 2. HOMEPAGE IMAGE */}
          <NavLink
            to="/admin/homepage"
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <Image size={18} />
            <span>Homepage Hero</span>
          </NavLink>

          {/* 3. CATEGORIES */}
          <NavLink
            to="/admin/categories"
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <FolderKanban size={18} />
            <span>Categories</span>
          </NavLink>

          {/* 4. PROJECTS */}
          <NavLink
            to="/admin/projects"
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
          >
            <Building2 size={18} />
            <span>Projects</span>
          </NavLink>



        </nav>

        {/* SIDEBAR FOOTER (ANCHORED AT BOTTOM) */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile">
            <div className="admin-avatar">
              <span>{(user.username || "A").charAt(0).toUpperCase()}</span>
            </div>
            <div className="admin-user-details">
              <strong>{user.username || "Admin"}</strong>
              <small>{user.role || "Administrator"}</small>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="admin-logout-btn"
            title="Log Out"
            type="button"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="admin-main-wrapper">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            <Menu size={22} />
          </button>

          <div className="topbar-status">
            <span className="status-indicator-dot" />
            <span className="topbar-status-text">
              JS RAM Construction Admin Panel &bull; Live Content Control
            </span>
          </div>

          <div className="topbar-actions">
            <Link to="/" className="topbar-site-link">
              <span>Live Site</span>
              <ExternalLink size={14} />
            </Link>

            <button
              onClick={handleLogout}
              className="topbar-logout-btn"
              title="Log Out"
              type="button"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* OUTLET FOR ADMIN PAGES */}
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
