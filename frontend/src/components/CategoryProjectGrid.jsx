import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import {
  getStoredCategories,
  fetchCategories,
  getProjectsByCategory,
  fetchProjects,
  resolveImageUrl,
} from "../services/dataStorage";
import "./CategoryProjectGrid.css";

function CategoryProjectGrid() {
  const { slug } = useParams();
  const normalizedSlug = (slug || "").toLowerCase().trim();

  const [category, setCategory] = useState(() => {
    const list = getStoredCategories();
    return (
      list.find(
        (c) =>
          String(c.slug || c.id).toLowerCase() === normalizedSlug
      ) || null
    );
  });

  const [projects, setProjects] = useState(() => {
    return getProjectsByCategory(normalizedSlug);
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    // Fetch latest category and projects from API/storage
    Promise.all([
      fetchCategories(true),
      fetchProjects(normalizedSlug, false),
    ])
      .then(([cats, projs]) => {
        const found = cats.find(
          (c) =>
            String(c.slug || c.id).toLowerCase() === normalizedSlug
        );
        if (found) setCategory(found);
        if (Array.isArray(projs)) setProjects(projs);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const handleUpdate = () => {
      const list = getStoredCategories();
      const found = list.find(
        (c) =>
          String(c.slug || c.id).toLowerCase() === normalizedSlug
      );
      if (found) setCategory(found);
      setProjects(getProjectsByCategory(normalizedSlug));
    };

    window.addEventListener("jsram_data_updated", handleUpdate);
    return () => window.removeEventListener("jsram_data_updated", handleUpdate);
  }, [normalizedSlug]);

  const rawTitle = category?.title || normalizedSlug.replace(/-/g, " ");
  // Format as "Hospital Projects", avoiding duplicate "Projects Projects"
  const headingTitle = rawTitle.toLowerCase().endsWith("projects")
    ? rawTitle
    : `${rawTitle} Projects`;

  return (
    <section className="category-grid-page">
      <div className="category-grid-container">
        {/* COMPACT CATEGORY HEADING ONLY */}
        <header className="category-grid-header">
          <h1 className="category-grid-title">{headingTitle}</h1>
        </header>

        {/* PROJECTS GRID — DISPLAYED IMMEDIATELY BELOW HEADING */}
        {projects.length > 0 ? (
          <div className="category-projects-grid">
            {projects.map((project, index) => {
              const projectIdentifier = project.slug || project.id;
              const coverImg = resolveImageUrl(
                project.image || (project.progressImages && project.progressImages[0])
              );

              return (
                <article className="cat-project-card" key={projectIdentifier}>
                  <Link
                    to={`/projects/${projectIdentifier}`}
                    className="cat-project-media-link"
                    aria-label={`View ${project.name} specifications`}
                  >
                    <div className="cat-project-image-wrap">
                      <img
                        src={coverImg}
                        alt={`${project.name} construction project`}
                        className="cat-project-image"
                        loading={index < 3 ? "eager" : "lazy"}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/hero-construction.jpg";
                        }}
                      />

                      <span className="cat-project-badge">
                        {project.categoryName || category?.badge || rawTitle}
                      </span>

                      <span className="cat-project-arrow">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                  </Link>

                  <div className="cat-project-info">
                    <div className="cat-project-location">
                      <MapPin size={13} />
                      <span>{project.location}</span>
                    </div>

                    <h2 className="cat-project-title">
                      <Link
                        to={`/projects/${projectIdentifier}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {project.name}
                      </Link>
                    </h2>

                    <p className="cat-project-client">
                      Client: <strong>{project.client}</strong>
                    </p>

                    <div className="cat-project-specs">
                      <div>
                        <span>Configuration</span>
                        <strong>{project.configuration}</strong>
                      </div>

                      <div>
                        <span>Floor Plate</span>
                        <strong>{project.floorPlate}</strong>
                      </div>
                    </div>

                    {project.additional && (
                      <p className="cat-project-additional">
                        {project.additional}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="category-empty-state">
            <h3>{isLoading ? "Loading Projects..." : "No Projects Found"}</h3>
            <p>
              {isLoading
                ? "Connecting to repository..."
                : "No published projects are currently available in this sector."}
            </p>
            <Link to="/#projects" className="category-grid-cta-btn">
              Explore Other Categories
            </Link>
          </div>
        )}

        {/* FOOTER */}
        <footer className="category-grid-footer">
          <p>Precision in Construction, Commitment in Delivery.</p>

          <a href="tel:+919765002278" className="category-grid-cta-btn">
            Discuss Your Project <ArrowUpRight size={16} />
          </a>
        </footer>
      </div>
    </section>
  );
}

export default CategoryProjectGrid;
