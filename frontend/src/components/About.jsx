
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./About.css";

const directors = [
  {
    name: "Hariprasad Katre",
    role: "Founder & Chairman",
    image: "/images/hariprasad-katre.jpg",
  },
  {
    name: "Rohit H. Katre",
    role: "Director",
    image: "/images/rohit-katre.jpg",
  },
  {
    name: "Ram H. Katre",
    role: "Director",
    image: "/images/ram-katre.jpg",
  },
];

const purposeItems = [
  {
    number: "01",
    label: "OUR VISION",
    title: "Building towards a better future.",
    description:
      "To achieve sustainable growth through continuous learning, innovation, and industry best practices. We aspire to take on challenging construction projects, set a positive example in the industry, and provide quality construction solutions.",
    Icon: Eye,
    footer: "LOOKING AHEAD",
  },
  {
    number: "02",
    label: "OUR MISSION",
    title: "Delivering excellence through every project.",
    description:
      "To deliver high-quality, cost-effective construction services through capable and committed teams. We strive for excellence, performance, and reliability while fulfilling client requirements and contributing to nation-building through construction and land development.",
    Icon: Target,
    footer: "DELIVERING WITH PURPOSE",
  },
];

function About() {
  const pageRef = useRef(null);
  const [visibleSections, setVisibleSections] = useState({});

  useEffect(() => {
    const page = pageRef.current;

    if (!page) return undefined;

    const revealElements = page.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      setVisibleSections(
        Object.fromEntries(
          Array.from(revealElements).map((element) => [
            element.dataset.reveal,
            true,
          ])
        )
      );

      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const sectionName = entry.target.dataset.reveal;

          setVisibleSections((previous) => ({
            ...previous,
            [sectionName]: true,
          }));

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const revealClass = (name) =>
    `about-reveal ${visibleSections[name] ? "is-visible" : ""}`;

  const handleImageError = (event, missingClass) => {
    event.currentTarget.style.display = "none";
    event.currentTarget.parentElement?.classList.add(missingClass);
  };

  return (
    <main className="about-page" ref={pageRef}>
      {/* COMPANY INTRODUCTION */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div
            className={`${revealClass("intro-copy")} about-intro-copy`}
            data-reveal="intro-copy"
          >
            <div className="about-eyebrow">
              <span />
              ABOUT JS RAM
            </div>

            <h1 className="about-main-title">
              Building a
              <span> stronger tomorrow.</span>
            </h1>

            <p className="about-intro-lead">
              Construction expertise. Dependable execution. Lasting impact.
            </p>

            <p className="about-intro-description">
              JS RAM Construction Pvt. Ltd. specialises in construction
              services across the building and infrastructure industries.
              Our focus is on delivering quality construction solutions
              through thoughtful planning, technical expertise, and
              dependable project execution.
            </p>

            <p className="about-intro-description">
              Led by experienced civil engineering professionals, we strive
              to provide high-quality and timely construction services while
              contributing to lasting infrastructure development.
            </p>

            <Link to="/contact" className="about-primary-link">
              Discuss your project
              <ArrowRight size={17} />
            </Link>

            <div className="about-intro-meta">
              <span>JS RAM CONSTRUCTION PVT. LTD.</span>
              <span>NAGPUR, MAHARASHTRA</span>
            </div>
          </div>

          {/* COMPANY LOGO VISUAL */}
          <div
            className={`${revealClass("intro-visual")} about-hero-visual`}
            data-reveal="intro-visual"
          >
            <div className="about-visual-heading">
              <span>OUR WORK</span>
              <span>01 — CONSTRUCTION</span>
            </div>

            <div className="about-visual-image about-logo-display">
              <img
                className="about-visual-logo"
                src="/images/logo.png"
                alt="JS RAM Construction Pvt. Ltd. logo"
                onError={(event) =>
                  handleImageError(event, "about-logo-missing")
                }
              />
            </div>

            <div className="about-visual-caption">
              <p>Quality in every detail.</p>
              <span>PLANNED WITH PURPOSE. BUILT TO LAST.</span>
            </div>
          </div>
        </div>
      </section>

      {/* BOARD OF DIRECTORS */}
      <section className="about-leadership">
        <div
          className={`${revealClass("leadership-heading")} about-leadership-heading`}
          data-reveal="leadership-heading"
        >
          <div className="about-eyebrow">
            <span />
            BOARD OF DIRECTORS
          </div>

          <div className="about-leadership-heading-row">
            <h2>
              The people behind
              <span> our foundation.</span>
            </h2>

            <p>
              Guided by civil engineering experience and a commitment to
              dependable construction, our leadership shapes the direction
              and standards of the company.
            </p>
          </div>
        </div>

        <div className="about-directors-grid">
          {directors.map((director, index) => (
            <article
              className={`about-director ${revealClass(
                `director-${index}`
              )}`}
              data-reveal={`director-${index}`}
              key={director.name}
              style={{ "--director-index": index }}
            >
              <div className="about-director-image">
                <img
                  src={director.image}
                  alt={director.name}
                  loading="lazy"
                  onError={(event) =>
                    handleImageError(
                      event,
                      "about-director-image-missing"
                    )
                  }
                />

                <div className="about-director-placeholder">
                  <Users size={38} strokeWidth={1} />
                  <span>JS RAM LEADERSHIP</span>
                </div>

                <span className="about-director-number">
                  0{index + 1}
                </span>
              </div>

              <div className="about-director-info">
                <span>{director.role}</span>
                <h3>{director.name}</h3>
                <div className="about-director-rule" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* VISION AND MISSION */}
      <section className="about-purpose">
        <div
          className={`${revealClass("purpose-heading")} about-purpose-heading`}
          data-reveal="purpose-heading"
        >
          <div className="about-eyebrow">
            <span />
            OUR PURPOSE
          </div>

          <h2 className="about-purpose-title">
            A clear direction.
            <span> A lasting contribution.</span>
          </h2>

          <p className="about-purpose-intro">
            Our vision and mission guide how we approach challenges,
            deliver projects, and contribute to the construction industry.
          </p>
        </div>

        <div className="about-purpose-list">
          {purposeItems.map(
            ({ number, label, title, description, Icon, footer }) => (
              <article
                className={`about-purpose-item ${revealClass(
                  `purpose-${number}`
                )}`}
                data-reveal={`purpose-${number}`}
                key={number}
              >
                <span className="about-purpose-number">{number}</span>

                <div className="about-purpose-item-icon">
                  <Icon size={25} strokeWidth={1.4} />
                </div>

                <div className="about-purpose-item-content">
                  <span className="about-purpose-label">{label}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="about-purpose-footer">{footer}</span>
                </div>

                <ArrowUpRight
                  className="about-purpose-item-arrow"
                  size={22}
                  aria-hidden="true"
                />
              </article>
            )
          )}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section
        className={`${revealClass("contact-banner")} about-contact-banner`}
        data-reveal="contact-banner"
      >
        <div>
          <span>LET'S BUILD SOMETHING MEANINGFUL</span>
          <h2>Have a project in mind?</h2>
          <p>
            Talk to our team about your construction and infrastructure
            requirements.
          </p>
        </div>

        <Link to="/contact" className="about-banner-link">
          Get in touch
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* PAGE SIGNATURE */}
      <div className="about-page-footer">
        <span>JS RAM CONSTRUCTION PVT. LTD.</span>
        <span>PLANNED WITH PURPOSE. BUILT TO LAST.</span>
      </div>
    </main>
  );
}

export default About;
