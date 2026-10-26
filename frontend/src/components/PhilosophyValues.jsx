
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Users,
  Scale,
  CheckCircle2,
  ClipboardCheck,
  HardHat,
  MessagesSquare,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./PhilosophyValues.css";

const values = [
  {
    number: "01",
    title: "Integrity",
    description:
      "We uphold professional ethics, honesty, accountability, and transparency in every engagement.",
    Icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Our People",
    description:
      "We encourage human resource development, technical learning, teamwork, and knowledge sharing.",
    Icon: Users,
  },
  {
    number: "03",
    title: "Compliance",
    description:
      "We value professional management, responsible practices, and adherence to project requirements.",
    Icon: Scale,
  },
  {
    number: "04",
    title: "Dependability",
    description:
      "We focus on consistent processes, careful coordination, and predictable project execution.",
    Icon: CheckCircle2,
  },
];

const deliverySteps = [
  {
    number: "01",
    title: "Understand & Plan",
    description:
      "We understand the client's requirements, site conditions, scope, and priorities before planning the work.",
    Icon: ClipboardCheck,
  },
  {
    number: "02",
    title: "Coordinate & Execute",
    description:
      "We coordinate technical requirements, resources, and on-site activities to support an organised construction process.",
    Icon: HardHat,
  },
  {
    number: "03",
    title: "Maintain Quality",
    description:
      "We emphasise workmanship, process discipline, and attention to project specifications throughout execution.",
    Icon: Building2,
  },
  {
    number: "04",
    title: "Communicate & Deliver",
    description:
      "We value transparent communication, progress coordination, and dependable delivery against agreed requirements.",
    Icon: MessagesSquare,
  },
];

function PhilosophyValues() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return undefined;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const reveal = (className = "") =>
    `philosophy-reveal ${className}`.trim();

  return (
    <section
      ref={sectionRef}
      className={`philosophy-section ${
        isVisible ? "philosophy-visible" : ""
      }`}
      aria-labelledby="philosophy-heading"
    >
      <div className="philosophy-container">
        {/* COMPANY PHILOSOPHY — OFF-WHITE */}
        <section className={reveal("philosophy-quote-block")}>
          <div className="philosophy-quote-content">
            <span className="philosophy-eyebrow">
              THE THINKING BEHIND OUR WORK
            </span>

            <h2 id="philosophy-heading">
              We build today.
              <span> For generations to come.</span>
            </h2>

            <blockquote>
              <span
                className="philosophy-quote-mark"
                aria-hidden="true"
              >
                “
              </span>

              <p>
                When we build, let us think that we build forever! Let it
                not be for present delight, nor for the present use alone.
                Let it be such work as our descendants will thank us for
                forever.
              </p>

              <footer>
                <span className="philosophy-quote-rule" />
                <div>
                  <strong>Rohit H. Katre</strong>
                  <span>JS RAM CONSTRUCTION PVT. LTD.</span>
                </div>
              </footer>
            </blockquote>
          </div>

          <div className="philosophy-quote-aside">
            <Building2
              className="philosophy-building-icon"
              strokeWidth={0.9}
              aria-hidden="true"
            />
            <span>BUILT ON STRONG FOUNDATIONS</span>
            <div className="philosophy-aside-line" />
            <p>Planned with purpose. Built to last.</p>
          </div>
        </section>

        {/* VALUES — BLACK AND GOLD */}
        <section className={reveal("philosophy-values-block")}>
          <header
            className={reveal("philosophy-section-heading")}
          >
            <div>
              <span className="philosophy-eyebrow">
                WHAT GUIDES US
              </span>
              <h3>
                Our values.
                <span> Our commitment.</span>
              </h3>
            </div>

            <p>
              The principles behind how we work, how we collaborate, and
              how we approach every construction project.
            </p>
          </header>

          <div className="philosophy-values-grid">
            {values.map(({ number, title, description, Icon }, index) => (
              <article
                className={reveal("philosophy-value")}
                key={number}
                style={{ "--philosophy-index": index }}
              >
                <div className="philosophy-value-top">
                  <span>{number}</span>
                  <Icon size={28} strokeWidth={1.4} />
                </div>

                <h4>{title}</h4>
                <p>{description}</p>

                <span className="philosophy-value-bottom">
                  OUR PRINCIPLE
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* HOW WE PROVIDE OUR SERVICES — OFF-WHITE */}
        <section className={reveal("philosophy-delivery-block")}>
          <header
            className={reveal("philosophy-section-heading")}
          >
            <div>
              <span className="philosophy-eyebrow">
                FROM PLANNING TO COMPLETION
              </span>

              <h3>
                How we deliver.
                <span> What we promise.</span>
              </h3>
            </div>

            <p>
              A coordinated, quality-focused approach shaped around each
              project's requirements, site conditions, and agreed scope.
            </p>
          </header>

          <div className="philosophy-delivery-list">
            {deliverySteps.map(
              ({ number, title, description, Icon }, index) => (
                <article
                  className={reveal("philosophy-delivery-item")}
                  key={number}
                  style={{ "--philosophy-index": index }}
                >
                  <span className="philosophy-delivery-number">
                    {number}
                  </span>

                  <div className="philosophy-delivery-icon">
                    <Icon size={25} strokeWidth={1.4} />
                  </div>

                  <div className="philosophy-delivery-copy">
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>

                  <ArrowUpRight
                    className="philosophy-delivery-arrow"
                    size={21}
                    aria-hidden="true"
                  />
                </article>
              )
            )}
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className={reveal("philosophy-cta")}>
          <div>
            <span className="philosophy-eyebrow">
              LET'S BUILD SOMETHING LASTING
            </span>

            <h3>Have a project in mind?</h3>

            <p>
              Discuss your construction and infrastructure requirements
              with our team.
            </p>
          </div>

          <Link to="/contact" className="philosophy-cta-link">
            Discuss your project
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </section>
  );
}

export default PhilosophyValues;
