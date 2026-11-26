
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

const WHATSAPP_NUMBER = "919765002278";
const BUILT_BY_URL = "https://buildnbrew.in";

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Our Services", path: "/services" },
  { label: "Our Projects", path: "/projects" },
  { label: "Insights & Blog", path: "/blog" },
  { label: "Contact Us", path: "/contact" },
];

const services = [
  "Residential Construction",
  "Commercial Construction",
  "Industrial Construction",
  "Structural & Civil Works",
  "Project Planning & Consultation",
];

function Footer() {
  const currentYear = new Date().getFullYear();

  const officeAddress =
    "288, F. No. 401, Sai Residency Apartment, Loksewa, G.N.S.S., Bhamti, Nagpur, Maharashtra 440020";

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    officeAddress
  )}`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello JS RAM Construction, I would like to discuss a construction project."
  )}`;

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-top-line" />

      {/* PROJECT CTA */}
      <section className="footer-cta">
        <div className="footer-cta-content">
          <span className="footer-eyebrow">
            HAVE A PROJECT IN MIND?
          </span>

          <h2>
            Let’s build something
            <br />
            <span>remarkable together.</span>
          </h2>

          <p>
            From planning to execution, let’s turn your vision
            into a structure built to last.
          </p>
        </div>

        <Link to="/contact" className="footer-cta-button">
          Discuss Your Project
          <ArrowUpRight size={17} />
        </Link>
      </section>

      <div className="footer-divider" />

      {/* FOOTER CONTENT */}
      <div className="footer-main">
        {/* COMPANY INFORMATION */}
        <div className="footer-company">
          <Link
            to="/"
            className="footer-logo-link"
            aria-label="JS RAM Construction home"
          >
            <img
              src="/images/Js Ram Logo.png"
              alt="JS RAM Construction Private Limited"
              className="footer-logo"
              loading="lazy"
            />
          </Link>

          <p className="footer-company-description">
            Building with precision. Delivering with commitment.
            We believe every structure should reflect quality,
            thoughtful execution, and lasting value.
          </p>

          <div className="footer-company-tagline">
            <span />
            <p>
              Precision in Construction, Commitment in Delivery.
            </p>
          </div>

          <a
            href="https://www.instagram.com/construction_wala_/"
            target="_blank"
            rel="noreferrer"
            className="footer-social-link"
            aria-label="Visit our Instagram"
          >
            <span
              className="footer-instagram-icon"
              aria-hidden="true"
            >
              ◎
            </span>
            <span>@construction_wala_</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <span className="footer-heading-line" />

          <ul>
            {quickLinks.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>
                  <ChevronRight size={13} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* SERVICES */}
        <div className="footer-column">
          <h3>Our Expertise</h3>
          <span className="footer-heading-line" />

          <ul>
            {services.map((service) => (
              <li key={service}>
                <Link to="/services">
                  <ChevronRight size={13} />
                  {service}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/services" className="footer-text-link">
            Explore all services
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* CONTACT DETAILS */}
        <div className="footer-column footer-contact-column">
          <h3>Get In Touch</h3>
          <span className="footer-heading-line" />

          <a
            className="footer-contact-item"
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span className="footer-contact-icon">
              <MapPin size={17} />
            </span>

            <span>
              <strong>Office Address</strong>
              <small>
                288, F. No. 401, Sai Residency Apartment,
                Loksewa, G.N.S.S., Bhamti,
                Nagpur, Maharashtra 440020
              </small>
            </span>
          </a>

          <a
            className="footer-contact-item"
            href="tel:+919765002278"
          >
            <span className="footer-contact-icon">
              <Phone size={16} />
            </span>

            <span>
              <strong>Call Us</strong>
              <small>+91 97650 02278</small>
              <small>+91 80550 02278</small>
            </span>
          </a>

          <a
            className="footer-contact-item"
            href="mailto:rhk@jsramconstruction.com"
          >
            <span className="footer-contact-icon">
              <Mail size={16} />
            </span>

            <span>
              <strong>Email Us</strong>
              <small>rhk@jsramconstruction.com</small>
            </span>
          </a>

          <a
            className="footer-contact-item"
            href="https://www.jsramconstruction.com"
            target="_blank"
            rel="noreferrer"
          >
            <span className="footer-contact-icon">
              <Globe size={16} />
            </span>

            <span>
              <strong>Website</strong>
              <small>www.jsram</small>
            </span>
          </a>
        </div>
      </div>

      {/* WHATSAPP ENQUIRY */}
      <div className="footer-contact-banner">
        <div>
          <span className="footer-eyebrow">
            LET’S TALK ABOUT YOUR NEXT PROJECT
          </span>

          <p>
            Have questions? Our team is ready to hear your requirements.
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="footer-whatsapp-link"
        >
          Start an Enquiry
          <ArrowUpRight size={16} />
        </a>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        <p>
          © {currentYear} JS RAM Construction Pvt. Ltd.
          <span> All rights reserved.</span>
        </p>

        <p className="footer-bottom-center">
          Built on trust. Defined by precision.
        </p>

        <Link to="/contact" className="footer-bottom-link">
          Get in touch
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* BUILD N BREW WATERMARK */}
      <div className="footer-watermark">
        <span>Designed & Developed by</span>

        <a
          href={BUILT_BY_URL}
          target="_blank"
          rel="noreferrer"
          className="footer-watermark-brand"
          aria-label="Build N Brew — website design and development"
        >
          BUILD N BREW
          <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
