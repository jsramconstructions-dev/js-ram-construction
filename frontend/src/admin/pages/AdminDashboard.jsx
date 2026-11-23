import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  FolderKanban,
  CheckCircle2,
  Sliders,
  Plus,
  ArrowRight,
  ExternalLink,
  MapPin,
} from "lucide-react";
import {
  getStoredProjects,
  fetchProjects,
  getStoredCategories,
  fetchCategories,
  getStoredHomepageConfig,
  fetchHomepageSettings,
} from "../../services/dataStorage";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [projects, setProjects] = useState(() => getStoredProjects());
  const [categories, setCategories] = useState(() => getStoredCategories());
  const [homepageConfig, setHomepageConfig] = useState(() => getStoredHomepageConfig());

  useEffect(() => {
    const loadData = () => {
      fetchCategories(true).then((cats) => {
        if (Array.isArray(cats)) setCategories(cats);
      });
      fetchProjects(null, true).then((projs) => {
        if (Array.isArray(projs)) setProjects(projs);
      });
      fetchHomepageSettings().then((cfg) => {
        if (cfg) setHomepageConfig(cfg);
      });
    };

    loadData();
    window.addEventListener("jsram_data_updated", loadData);
    return () => window.removeEventListener("jsram_data_updated", loadData);
  }, []);

  const totalProjects = projects.length;
  const totalCategories = categories.length;
  const publishedProjects = projects.filter((p) => p.published !== false).length;
  const activeSectionsCount = homepageConfig?.sections
    ? Object.values(homepageConfig.sections).filter(Boolean).length
    : 5;

  const recentProjects = [...projects].slice(0, 5);

  return (
    <div className="admin-dashboard-view">
      {/* PAGE HEADER */}
      <div className="admin-view-header">
        <div>
          <span className="admin-view-eyebrow">ADMINISTRATIVE OVERVIEW</span>
          <h1 className="admin-view-title">Dashboard Overview</h1>
          <p className="admin-view-lead">
            Manage projects, architectural categories, and public homepage presentation.
          </p>
        </div>

        <div className="admin-view-actions">
          <Link to="/admin/projects" className="admin-primary-btn">
            <Plus size={16} />
            <span>Add New Project</span>
          </Link>
        </div>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="metric-icon-box">
            <Building2 size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">TOTAL PROJECTS</span>
            <strong className="metric-number">{totalProjects}</strong>
            <span className="metric-sub">Across 3 architectural sectors</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box">
            <FolderKanban size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">CATEGORIES</span>
            <strong className="metric-number">{totalCategories}</strong>
            <span className="metric-sub">Hospital, Commercial, High-Rise</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box">
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">PUBLISHED ON SITE</span>
            <strong className="metric-number">{publishedProjects}</strong>
            <span className="metric-sub">Active in full-screen exhibition</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box">
            <Sliders size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">ACTIVE SECTIONS</span>
            <strong className="metric-number">{activeSectionsCount} / 6</strong>
            <span className="metric-sub">Homepage visibility status</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BANNER */}
      <div className="admin-quick-actions-bar">
        <div className="quick-action-text">
          <strong>Quick Action Hub:</strong>
          <span>Perform immediate updates to the portfolio and client-facing pages.</span>
        </div>

        <div className="quick-action-buttons">
          <Link to="/admin/categories" className="quick-action-btn">
            <FolderKanban size={14} />
            <span>Manage Categories</span>
          </Link>
          <Link to="/admin/projects" className="quick-action-btn">
            <Building2 size={14} />
            <span>Manage All Projects</span>
          </Link>
          <Link to="/admin/homepage" className="quick-action-btn">
            <Sliders size={14} />
            <span>Configure Homepage</span>
          </Link>
          <a href="/" target="_blank" rel="noreferrer" className="quick-action-btn preview-btn">
            <ExternalLink size={14} />
            <span>Live Site</span>
          </a>
        </div>
      </div>

      {/* RECENT PROJECTS TABLE */}
      <div className="admin-card-container">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Featured Project Portfolio</h2>
            <p className="admin-card-desc">Recent projects currently loaded in the exhibition repository.</p>
          </div>

          <Link to="/admin/projects" className="admin-card-link">
            <span>View All ({totalProjects})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Configuration</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((project) => {
                const cat = categories.find((c) => c.id === project.categoryId);
                return (
                  <tr key={project.id}>
                    <td>
                      <div className="table-project-name">
                        <img
                          src={project.image}
                          alt={project.name}
                          className="table-project-thumb"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div>
                          <strong>{project.name}</strong>
                          <small>{project.client || "JS Ram Client"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill-tag">
                        {cat?.title || project.categoryName || project.categoryId}
                      </span>
                    </td>
                    <td>
                      <span className="location-cell">
                        <MapPin size={13} />
                        {project.location}
                      </span>
                    </td>
                    <td>
                      <span className="config-text">{project.configuration}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${project.published !== false ? "published" : "draft"}`}>
                        {project.published !== false ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link to="/admin/projects" className="table-edit-btn">
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
