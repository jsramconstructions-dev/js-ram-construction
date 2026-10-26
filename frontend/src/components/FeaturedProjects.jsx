
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./FeaturedProjects.css";

const featuredProjects = [
  {
    name: "Palacio",
    category: "Residential Development",
    location: "Nagpur, Maharashtra",
    image: "/images/palacio.jpg",
  },
  {
    name: "Lotus Residency",
    category: "Residential Development",
    location: "Nagpur, Maharashtra",
    image: "/images/lotus-residency.jpg",
  },
  {
    name: "Royale Regency",
    category: "Residential Development",
    location: "Nagpur, Maharashtra",
    image: "/images/royale-regency.jpg",
  },
];

function FeaturedProjects() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`featured-projects ${isVisible ? "is-visible" : ""}`}
      id="featured-projects"
    >
      <div className="featured-projects-container">
        <div className="featured-projects-heading reveal-item">
          <div>
            <p className="featured-projects-eyebrow">
              OUR PORTFOLIO <span>•</span> SELECTED WORK
            </p>

            <h2>
              Projects built
              <br />
              <span>with purpose.</span>
            </h2>
          </div>

          <p className="featured-projects-description">
            Explore selected developments that reflect our commitment to
            thoughtful planning, quality construction and lasting value.
          </p>
        </div>

        <div className="featured-projects-grid">
          {featuredProjects.map((project, index) => (
            <article
              className="featured-project-card reveal-item"
              key={project.name}
              style={{ "--reveal-delay": `${index * 140}ms` }}
            >
              <Link
                to="/projects"
                className="featured-project-image-link"
                aria-label={`View ${project.name} project`}
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="featured-project-image"
                  loading="lazy"
                />

                <span className="featured-project-number">
                  0{index + 1}
                </span>

                <span className="featured-project-image-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </Link>

              <div className="featured-project-info">
                <div>
                  <p className="featured-project-category">
                    {project.category}
                  </p>

                  <h3>{project.name}</h3>

                  <p className="featured-project-location">
                    {project.location}
                  </p>
                </div>

                <Link
                  to="/projects"
                  className="featured-project-link"
                  aria-label={`View ${project.name}`}
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div
          className="featured-projects-footer reveal-item"
          style={{ "--reveal-delay": "180ms" }}
        >
          <p>Thoughtfully planned. Carefully executed.</p>

          <Link to="/projects" className="featured-projects-button">
            View All Projects <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProjects;
