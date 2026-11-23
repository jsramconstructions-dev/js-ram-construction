import { useEffect, useState } from "react";
import { ArrowUpRight, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getStoredCategories,
  fetchCategories,
  getProjectsByCategory,
} from "../services/dataStorage";
import "./ProjectPortfolio.css";

function ProjectPortfolio() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(() =>
    getStoredCategories()
      .filter((category) => category.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  );

  useEffect(() => {
    // Fetch live categories from backend API / MongoDB
    fetchCategories(false).then((cats) => {
      if (Array.isArray(cats)) {
        setCategories(
          cats
            .filter((c) => c.isActive !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        );
      }
    });

    const handleUpdate = () => {
      setCategories(
        getStoredCategories()
          .filter((category) => category.isActive !== false)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      );
    };

    window.addEventListener("jsram_data_updated", handleUpdate);
    return () => window.removeEventListener("jsram_data_updated", handleUpdate);
  }, []);

  const handleOpenCategory = (category) => {
    const slug = category.slug || category.id;
    navigate(`/category/${slug}`);
  };

  return (
    <section className="project-portfolio" id="projects">
      <div className="portfolio-container">
        <header className="portfolio-header">
          <div className="portfolio-header-left">
            <div className="portfolio-eyebrow">
              <span className="eyebrow-line" />
              PORTFOLIO ARCHIVE • SPECIALISED DIVISIONS
            </div>

            <h2 className="portfolio-title">
              Proven execution across
              <br />
              <span className="portfolio-title-italic">
                specialised architectural sectors.
              </span>
            </h2>
          </div>

          <div className="portfolio-header-right">
            <p className="portfolio-subtitle">
              Select any category card below to view our comprehensive
              project gallery, structural specifications, and verified
              delivery milestones.
            </p>
          </div>
        </header>

        <div className="category-cards-grid">
          {categories.map((category, index) => {
            const catId = category.slug || category.id;
            const projects = getProjectsByCategory(catId);
            const count = category.projectCount !== undefined ? category.projectCount : projects.length;
            const coverImage = category.coverImage || "/images/hero-construction.jpg";

            return (
              <article
                className="category-card"
                key={catId}
                onClick={() => handleOpenCategory(category)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenCategory(category);
                  }
                }}
                aria-label={`Open ${category.title} project grid`}
              >
                <div className="category-card-media">
                  <img
                    src={coverImage}
                    alt={`${category.title} portfolio cover`}
                    className="category-card-image"
                    loading="eager"
                    decoding="async"
                    draggable="false"
                  />
                  <div className="category-card-scrim" />
                </div>

                <div className="category-card-top">
                  <span className="category-card-index">0{index + 1}</span>

                  <span className="category-card-count">
                    <Layers size={13} />
                    {count} {count === 1 ? "Project" : "Projects"}
                  </span>
                </div>

                <div className="category-card-bottom">
                  <span className="category-card-badge">
                    {category.badge || category.title}
                  </span>

                  <h3 className="category-card-title">{category.title}</h3>

                  <p className="category-card-desc">
                    {category.subtitle || category.description}
                  </p>

                  <div className="category-card-action">
                    <span className="action-text">Explore Category</span>

                    <span className="action-circle">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="portfolio-footer-note">
          <span>
            ALL PROJECTS VERIFIED • CENTRAL INDIA • PRECISION IN EXECUTION
          </span>
        </footer>
      </div>
    </section>
  );
}

export default ProjectPortfolio;
