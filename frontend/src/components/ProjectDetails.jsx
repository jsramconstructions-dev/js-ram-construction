import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Building,
  Layers,
  Phone,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import {
  fetchProjectBySlug,
  getStoredProjects,
} from "../services/dataStorage";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { slug } = useParams();
  const normalizedSlug = (slug || "").toLowerCase().trim();

  const [project, setProject] = useState(() => {
    const list = getStoredProjects();
    return (
      list.find(
        (p) =>
          String(p.slug || p.id).toLowerCase() === normalizedSlug
      ) || null
    );
  });

  const [selectedImage, setSelectedImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    fetchProjectBySlug(normalizedSlug)
      .then((data) => {
        if (data) {
          setProject(data);
          setSelectedImage("");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [normalizedSlug]);

  if (!project && !isLoading) {
    return (
      <section className="project-details-page">
        <div className="project-details-container">
          <div className="project-not-found">
            <h2>Project Not Found</h2>
            <p>
              The requested architectural project could not be located or has been archived.
            </p>
            <Link to="/#projects" className="project-back-btn">
              <ArrowLeft size={16} /> Return to Portfolio Archive
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const galleryImages = [
    ...(project?.image ? [project.image] : []),
    ...(project?.progressImages || []),
  ].filter((img, idx, arr) => img && arr.indexOf(img) === idx);

  const defaultImage =
    project?.image ||
    (project?.progressImages && project?.progressImages[0]) ||
    "/images/hero-construction.jpg";

  const currentDisplayImage = selectedImage || defaultImage;

  return (
    <section className="project-details-page">
      <div className="project-details-container">
        {/* COMPACT PROJECT HEADER — PROJECT TITLE AS MAIN HEADING */}
        <header className="project-header-section">
          <h1 className="project-main-title">{project?.name}</h1>

          <div className="project-meta-strip">
            <span className="project-meta-item">
              <MapPin size={15} />
              <span>{project?.location}</span>
            </span>

            <span className="project-meta-item">
              <Building size={15} />
              <span>Client: <strong>{project?.client}</strong></span>
            </span>

            <span className="project-meta-item">
              <Layers size={15} />
              <span>{project?.configuration}</span>
            </span>
          </div>
        </header>

        {/* MAIN SHOWCASE — BROUGHT IMMEDIATELY BELOW HEADER */}
        <div className="project-showcase-layout">
          {/* LEFT: PHOTOGRAPHY & GALLERY */}
          <div className="project-media-column">
            <div className="project-hero-media-wrap">
              <img
                src={currentDisplayImage}
                alt={`${project?.name} architectural view`}
                className="project-hero-media"
              />
            </div>

            {/* THUMBNAILS */}
            {galleryImages.length > 1 && (
              <div
                className="project-thumbnails-row"
                aria-label="Project photograph gallery"
              >
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`project-thumb-btn ${
                      currentDisplayImage === imgUrl ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(imgUrl)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${project?.name} view ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: SPECIFICATIONS & OVERVIEW */}
          <div className="project-info-column">
            <h2 className="project-section-heading">
              <span>Project Overview</span>
              <ShieldCheck size={20} color="#a77a38" />
            </h2>

            <p className="project-overview-text">
              {project?.description ||
                "Delivered with meticulous civil engineering standards, high-grade structural specifications, and transparent project milestone management by JS RAM Construction."}
            </p>

            <h2 className="project-section-heading">
              <span>Technical Specifications</span>
            </h2>

            <div className="project-specs-list">
              <div className="project-spec-row">
                <span className="project-spec-label">Configuration</span>
                <span className="project-spec-val">
                  {project?.configuration || "—"}
                </span>
              </div>

              <div className="project-spec-row">
                <span className="project-spec-label">Floor Plate / Area</span>
                <span className="project-spec-val">
                  {project?.floorPlate || "—"}
                </span>
              </div>

              <div className="project-spec-row">
                <span className="project-spec-label">Client Organisation</span>
                <span className="project-spec-val">
                  {project?.client || "—"}
                </span>
              </div>

              <div className="project-spec-row">
                <span className="project-spec-label">Project Location</span>
                <span className="project-spec-val">
                  {project?.location || "—"}
                </span>
              </div>

              {project?.additional && (
                <div className="project-spec-row">
                  <span className="project-spec-label">Key Specifications</span>
                  <span className="project-spec-val">
                    {project.additional}
                  </span>
                </div>
              )}
            </div>

            {/* DIRECT INQUIRY CARD */}
            <div className="project-cta-card">
              <h4>Planning a similar structure?</h4>
              <p>
                Consult our engineering leadership for comprehensive structural
                and EPC solutions across Central India.
              </p>
              <div className="project-cta-actions">
                <a href="tel:+919765002278" className="project-cta-call">
                  <Phone size={14} /> Call Engineering Team
                </a>
                <a
                  href={`https://wa.me/919765002278?text=${encodeURIComponent(
                    `Hello JS RAM Construction, I am interested in inquiring about the ${project?.name} project specifications.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="project-cta-whatsapp"
                >
                  <MessageSquare size={14} /> WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProjectDetails;
