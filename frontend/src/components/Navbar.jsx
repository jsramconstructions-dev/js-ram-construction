import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, Menu, X, Shield } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleScrollTo = (e, targetId) => {
    closeMenu();

    if (location.pathname === "/") {
      e.preventDefault();
      if (targetId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link
          to="/"
          className="navbar-logo"
          aria-label="JS RAM Construction Home"
          onClick={(e) => handleScrollTo(e, "home")}
        >
          <img
            src="/images/logo3.png"
            alt="JS RAM Construction Pvt. Ltd."
            className="navbar-logo-image"
          />
        </Link>

        {/* PRIMARY NAV LINKS */}
        <nav
          className={`navbar-links ${isMenuOpen ? "mobile-menu-open" : ""}`}
          id="primary-navigation"
        >
          <a
            href="/#home"
            onClick={(e) => handleScrollTo(e, "home")}
          >
            Home
          </a>
          <a
            href="/#about"
            onClick={(e) => handleScrollTo(e, "about")}
          >
            About
          </a>
          <a
            href="/#projects"
            onClick={(e) => handleScrollTo(e, "projects")}
          >
            Projects
          </a>
          <a
            href="/#clients"
            onClick={(e) => handleScrollTo(e, "clients")}
          >
            Clients
          </a>
          <a
            href="/#services"
            onClick={(e) => handleScrollTo(e, "services")}
          >
            Services
          </a>
          <a
            href="/#blog"
            onClick={(e) => handleScrollTo(e, "blog")}
          >
            Blog
          </a>
          <a
            href="/#contact"
            onClick={(e) => handleScrollTo(e, "contact")}
          >
            Contact
          </a>

          {/* MOBILE ONLY ADMIN LINK */}
          <Link
            to="/admin/login"
            onClick={closeMenu}
            className="navbar-mobile-admin"
          >
            <Shield size={15} />
            <span>Admin Portal</span>
          </Link>
        </nav>

        {/* RIGHT ACTIONS: CTA + SUBTLE ADMIN ICON */}
        <div className="navbar-actions">
          <a href="tel:+919765002278" className="navbar-cta">
            <Phone size={15} />
            <span>Get a Quote</span>
          </a>

          {/* SUBTLE ADMIN LOGIN ICON */}
          <Link
            to="/admin/login"
            className="navbar-admin-icon"
            title="Admin Portal (Staff Only)"
            aria-label="Admin Portal"
          >
            <Shield size={16} />
          </Link>

          {/* MOBILE HAMBURGER BUTTON */}
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
      </div>
    </header>
  );
}

export default Navbar;
