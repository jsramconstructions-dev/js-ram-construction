
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, ImageOff } from "lucide-react";
import { resolveImageUrl } from "../services/dataStorage";
import "./Projects.css";

const projects = [
  {
    id: 1,
    name: "Anjani Exotica",
    location: "MIHAN, Nagpur",
    category: "Residential",
    client: "Anjanikripa Projects Pvt. Ltd.",
    configuration: "F Wing · G+16",
    floorPlate: "5,500 sq. ft.",
    additional: "Podium slab · 10,000 sq. ft.",
    image: "/images/anjani-exoctica.jpg",
  },
  {
    id: 2,
    name: "WHC One",
    location: "Coffee House Square, Nagpur",
    category: "Commercial",
    client: "Goleccha Housing Infra Pvt. Ltd.",
    configuration: "G+8 Commercial",
    floorPlate: "6,500 sq. ft.",
    additional: "Double basement · 10,000 sq. ft.",
    image: "/images/whc-one.jpg",
  },
  {
    id: 3,
    name: "Ram Swar Medspace",
    location: "Nagpur",
    category: "Healthcare",
    client: "Akshay Mehadia (Gopal Bricks)",
    configuration: "G+9 Hospital Building",
    floorPlate: "6,500 sq. ft.",
    additional: "Double basement · 8,000 sq. ft.",
    image: "/images/ram-swar-medspace.jpg",
  },
  {
    id: 4,
    name: "Palacio",
    location: "Shankar Nagar, Nagpur",
    category: "Residential",
    client: "Raghav Lifespace",
    configuration: "G+15 Residential",
    floorPlate: "6,500 sq. ft.",
    additional: "",
    image: "/images/palacio.jpg",
  },
  {
    id: 5,
    name: "Royale Regency",
    location: "Khare Town, Nagpur",
    category: "Residential",
    client: "Vrindavan Constructions, Nagpur",
    configuration: "G+16 Residential",
    floorPlate: "5,500 sq. ft.",
    additional: "",
    image: "/images/royale-regency.jpg",
  },
  {
    id: 6,
    name: "Lotus Residency",
    location: "Laxmi Nagar, Nagpur",
    category: "Residential",
    client: "Vrindavan Constructions, Nagpur",
    configuration: "G+11 Residential",
    floorPlate: "3,500 sq. ft.",
    additional: "Pit parking · 5,000 sq. ft.",
    image: "/images/lotus-residency.jpg",
  },
  {
    id: 7,
    name: "Limbanna Towers",
    location: "Sadar, Nagpur",
    category: "Commercial",
    client: "Akshay Limbanna (Navratna Raghav)",
    configuration: "G+8 Commercial",
    floorPlate: "8,000 sq. ft.",
    additional: "Double basement · 11,000 sq. ft.",
    image: "/images/limbanna-towers.jpg",
  },
  {
    id: 8,
    name: "Vrindavan Estate",
    location: "Besa, Nagpur",
    category: "Township",
    client: "BVN Constro Ventures LLP",
    configuration: "Residential Township",
    floorPlate: "50,000 sq. ft. township area",
    additional: "Residential towers",
    image: "/images/vrindavan-estate.jpg",
  },
  {
    id: 9,
    name: "Mayo Hospital Admin Building",
    location: "Mount Road, Nagpur",
    category: "Healthcare",
    client: "Sadiq and Company",
    configuration: "G+7 Hospital Administration Building",
    floorPlate: "44,000 sq. ft.",
    additional: "",
    image: "/images/mayo-hospital.jpg",
  },
  {
    id: 10,
    name: "Vijaywargi Complex",
    location: "Bharat Nagar, Nagpur",
    category: "Commercial",
    client: "Vijaywargi Infra Engineers Pvt. Ltd.",
    configuration: "G+5 Commercial Complex",
    floorPlate: "5,500 sq. ft.",
    additional: "",
    image: "/images/vijaywargi-complex.jpg",
  },
];

const categories = [
  "All Projects",
  "Residential",
  "Commercial",
  "Healthcare",
  "Township",
];

function Projects() {
  const [activeCategory, setActiveCategory] = useState("All Projects");
  const [failedImages, setFailedImages] = useState([]);

  const filteredProjects =
    activeCategory === "All Projects"
      ? projects
      : projects.filter(
          (project) => project.category === activeCategory
        );

  const handleImageError = (projectId) => {
    setFailedImages((current) =>
      current.includes(projectId)
        ? current
        : [...current, projectId]
    );
  };

  return (
    <section className="projects-section" id="projects">
      <div className="projects-container">
        <header className="projects-heading">
          <div>
            <span className="projects-eyebrow">
              OUR WORK · OUR COMMITMENT
            </span>

            <h2>
              Projects built with <span>purpose.</span>
            </h2>

            <p>
              A selection of residential, commercial and infrastructure
              projects reflecting our commitment to quality construction.
            </p>
          </div>

          <div className="projects-count">
            <strong>{projects.length}</strong>
            <span>Featured projects</span>
          </div>
        </header>

        <div
          className="projects-filters"
          aria-label="Filter projects by category"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category ? "active" : ""
              }
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="projects-grid" aria-live="polite">
          {filteredProjects.map((project, index) => (
            <article
              className="project-card"
              key={project.id}
              style={{ "--project-index": index }}
            >
              <Link
                to={`/projects/${project.id}`}
                className="project-image-link"
                aria-label={`View ${project.name} project`}
              >
                <div className="project-image-wrap">
                  {failedImages.includes(project.id) ? (
                    <div className="project-image-fallback">
                      <ImageOff size={32} />
                      <span>Project image unavailable</span>
                    </div>
                  ) : (
                    <img
                      src={resolveImageUrl(project.image)}
                      alt={`${project.name} construction project`}
                      className="project-image"
                      loading={index < 3 ? "eager" : "lazy"}
                      onError={() => handleImageError(project.id)}
                    />
                  )}

                  <span className="project-category">
                    {project.category}
                  </span>

                  <span className="project-view">
                    <ArrowUpRight size={21} />
                  </span>
                </div>
              </Link>

              <div className="project-card-content">
                <div className="project-location">
                  <MapPin size={14} />
                  <span>{project.location}</span>
                </div>

                <h3>{project.name}</h3>

                <p className="project-client">
                  Client: {project.client}
                </p>

                <div className="project-specifications">
                  <div>
                    <span>Configuration</span>
                    <strong>{project.configuration}</strong>
                  </div>

                  <div>
                    <span>Floor plate / area</span>
                    <strong>{project.floorPlate}</strong>
                  </div>
                </div>

                {project.additional && (
                  <p className="project-additional">
                    {project.additional}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <footer className="projects-footer">
          <p>
            Precision in Construction, Commitment in Delivery.
          </p>

          <Link to="/contact" className="projects-contact-link">
            Discuss your project <ArrowUpRight size={18} />
          </Link>
        </footer>
      </div>
    </section>
  );
}

export default Projects;
