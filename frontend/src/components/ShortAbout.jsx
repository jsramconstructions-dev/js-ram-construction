import { useState, useEffect } from "react";
import { ArrowRight, Building, Award, ShieldCheck, MapPin } from "lucide-react";
import { getStoredHomepageConfig } from "../services/dataStorage";
import "./ShortAbout.css";

const pillarIcons = [Award, Building, ShieldCheck];

function ShortAbout() {
  const [config, setConfig] = useState(() => {
    const stored = getStoredHomepageConfig();
    return stored?.about || {};
  });

  useEffect(() => {
    const handleUpdate = () => {
      const latest = getStoredHomepageConfig();
      setConfig(latest?.about || {});
    };

    window.addEventListener("jsram_data_updated", handleUpdate);
    return () => window.removeEventListener("jsram_data_updated", handleUpdate);
  }, []);

  const scrollToProjects = (e) => {
    e.preventDefault();
    const projectsEl = document.getElementById("projects");
    if (projectsEl) {
      projectsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const pillars = config.pillars || [];

  return (
    <section className="short-about" id="about">
      <div className="short-about-container">
        {/* TOP HEADER */}
        <div className="short-about-header">
          <div className="short-about-eyebrow">
            <span className="eyebrow-line" />
            ABOUT JS RAM CONSTRUCTION
          </div>

          <div className="short-about-grid">
            <div className="short-about-heading-wrap">
              <h2 className="short-about-title">
                {config.title || "Planned with purpose."}
                <br />
                <span className="title-italic">{config.titleItalic || "Built to last."}</span>
              </h2>
            </div>

            <div className="short-about-intro-wrap">
              <p className="short-about-lead">
                {config.lead}
              </p>
              <p className="short-about-text">
                {config.description}
              </p>

              <div className="short-about-action">
                <a href="#projects" onClick={scrollToProjects} className="short-about-btn">
                  <span>View Our Portfolio</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>



        {/* METRICS / STATS STRIP */}
        <div className="short-about-stats">
          <div className="stat-item">
            <span className="stat-label">HEADQUARTERS</span>
            <strong className="stat-value">
              <MapPin size={14} className="stat-icon" /> Nagpur, Maharashtra
            </strong>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">COORDINATES</span>
            <strong className="stat-value">21.08° N, 79.05° E</strong>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">CORE DOMAINS</span>
            <strong className="stat-value">Healthcare • Commercial • High-Rise</strong>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">GOVERNANCE</span>
            <strong className="stat-value">Civil Engineering Leadership</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShortAbout;
