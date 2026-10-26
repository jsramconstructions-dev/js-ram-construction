
import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Menu, X } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-logo"
          aria-label="JS RAM Construction Home"
          onClick={closeMenu}
        >
          <img
            src="/images/logo2.png"
            alt="JS RAM Construction Pvt. Ltd."
            className="navbar-logo-image"
          />
        </Link>

        <nav
          className={`navbar-links ${isMenuOpen ? "mobile-menu-open" : ""}`}
          id="primary-navigation"
        >
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/about" onClick={closeMenu}>
            About Us
          </Link>
          <Link to="/services" onClick={closeMenu}>
            Services
          </Link>
          <Link to="/projects" onClick={closeMenu}>
            Projects
          </Link>
          <Link to="/blog" onClick={closeMenu}>
            Blog
          </Link>
          <Link to="/contact" onClick={closeMenu}>
            Contact
          </Link>
        </nav>

        <a href="tel:+919765002278" className="navbar-cta">
          <Phone size={16} />
          <span>Get a Quote</span>
        </a>

        <button
          className="mobile-menu"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          type="button"
          onClick={() => setIsMenuOpen((previous) => !previous)}
        >
          {isMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
