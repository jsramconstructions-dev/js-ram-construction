
import { Link } from "react-router-dom";
import { Phone, Menu } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="JS RAM Construction Home">
          <img
            src="/images/logo2.png"
            alt="JS RAM Construction Pvt. Ltd."
            className="navbar-logo-image"
          />
        </Link>

        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/services">Services</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <a href="tel:+919765002278" className="navbar-cta">
          <Phone size={16} />
          <span>Get a Quote</span>
        </a>

        <button
          className="mobile-menu"
          aria-label="Open navigation"
          type="button"
        >
          <Menu size={25} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
