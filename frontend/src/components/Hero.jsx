
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <p className="hero-eyebrow">
          CONSTRUCTION <span>•</span> EPC <span>•</span> INFRASTRUCTURE
        </p>

        <h1>
          Construction
          <br />
          <span className="hero-heading-highlight">
            planned with purpose.
          </span>
        </h1>

        <p className="hero-description">
          Delivering high quality construction and EPC solutions across
          residential, commercial, industrial and infrastructure projects.
        </p>

        <div className="hero-actions">
          <a href="#services" className="hero-primary-btn">
            Explore our services <ArrowRight size={16} />
          </a>

          <Link to="/contact" className="hero-secondary-btn">
            Discuss a project
          </Link>
        </div>
      </div>

      <div className="hero-footer-left">
        <span>PALACIO • NAGPUR</span>
      </div>

      <div className="hero-side-coords">
        <span>21.08° N, 79.05° E</span>
      </div>

      <div className="hero-footer-right">
        <span className="hero-counter">04 / 10</span>
        <button className="hero-arrow-btn" aria-label="Next slide">
          <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}

export default Hero;
