
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Factory,
  House,
  Droplets,
  Waves,
  BriefcaseBusiness,
  ShieldCheck,
  Plane,
  Wrench,
  Cog,
  Truck,
  Construction,
  HardHat,
  Layers3,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Services.css";

const services = [
  {
    number: "01",
    title: "Multi-Storeyed Apartments",
    description:
      "Residential apartment developments planned for functionality, structural quality, and lasting value.",
    Icon: Building2,
    slug: "multi-storeyed-apartments",
  },
  {
    number: "02",
    title: "Water Dams & Treatment Plants",
    description:
      "Water infrastructure projects focused on dependable construction and practical project execution.",
    Icon: Droplets,
    slug: "water-dams-treatment-plants",
  },
  {
    number: "03",
    title: "Commercial Buildings",
    description:
      "Commercial spaces designed around business requirements, usability, and long-term performance.",
    Icon: BriefcaseBusiness,
    slug: "commercial-buildings",
  },
  {
    number: "04",
    title: "Residential Bungalows",
    description:
      "Residential construction with attention to planning, workmanship, and everyday living needs.",
    Icon: House,
    slug: "residential-bungalows",
  },
  {
    number: "05",
    title: "Bridge Works",
    description:
      "Bridge construction works delivered with a focus on coordination, structural requirements, and quality.",
    Icon: Waves,
    slug: "bridge-works",
  },
  {
    number: "06",
    title: "Canal & Irrigation Works",
    description:
      "Civil infrastructure works supporting water distribution and irrigation requirements.",
    Icon: Construction,
    slug: "canal-irrigation-works",
  },
  {
    number: "07",
    title: "Industrial Constructions",
    description:
      "Industrial facilities developed around operational needs, durability, and construction quality.",
    Icon: Factory,
    slug: "industrial-constructions",
  },
  {
    number: "08",
    title: "Fabrication Work",
    description:
      "Fabrication works tailored to project specifications and site requirements.",
    Icon: Settings,
    slug: "fabrication-work",
  },
  {
    number: "09",
    title: "Airfield Construction",
    description:
      "Construction works for airfield infrastructure, guided by project requirements and execution planning.",
    Icon: Plane,
    slug: "airfield-construction",
  },
  {
    number: "10",
    title: "Waterproofing Works",
    description:
      "Waterproofing solutions intended to protect structures and support long-term building performance.",
    Icon: ShieldCheck,
    slug: "waterproofing-works",
  },
];

const equipment = [
  {
    number: "01",
    title: "Plywood Shuttering",
    detail: "150,000–200,000 sq. ft.",
    Icon: Layers3,
  },
  {
    number: "02",
    title: "Passenger-Cum-Material Hoists",
    detail: "1-ton and 1.5-ton capacity",
    Icon: Construction,
  },
  {
    number: "03",
    title: "Scaffolding & Support Materials",
    detail: "Ledgers, joists, jack pipes, rafters, purlins, runners and acro spans",
    Icon: Wrench,
  },
  {
    number: "04",
    title: "Bar Bending Machines",
    detail: "5 machines",
    Icon: Settings,
  },
  {
    number: "05",
    title: "Rebar Cutting Machines",
    detail: "4 machines",
    Icon: Cog,
  },
  {
    number: "06",
    title: "Concrete Mixers",
    detail: "6 units · 200-litre capacity",
    Icon: Settings,
  },
  {
    number: "07",
    title: "Mini Material Lifts",
    detail: "3 units",
    Icon: Construction,
  },
  {
    number: "08",
    title: "Concrete Vibrators",
    detail: "15 units · 5 HP and 2 HP, electric and diesel",
    Icon: Cog,
  },
  {
    number: "09",
    title: "Trowel Machinery",
    detail: "5 machines",
    Icon: HardHat,
  },
  {
    number: "10",
    title: "Dumpers & Pickups",
    detail: "8 vehicles",
    Icon: Truck,
  },
];

function useScrollReveal() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return undefined;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
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

  return { sectionRef, isVisible };
}

function Services() {
  const servicesReveal = useScrollReveal();
  const equipmentReveal = useScrollReveal();

  return (
    <div className="services-page" id="services">
      {/* SERVICES INTRODUCTION */}
      <section
        ref={servicesReveal.sectionRef}
        id="services-details"
        className={`services-section ${
          servicesReveal.isVisible ? "services-visible" : ""
        }`}
      >
        <div className="services-container">
          <header className="services-header services-reveal">
            <div className="services-heading-copy">
              <span className="services-eyebrow">
                <span className="services-eyebrow-line" />
                WHAT WE PROVIDE
              </span>

              <h1 className="services-main-title">
                Built for purpose.
                <span> Made to last.</span>
              </h1>
            </div>

            <p className="services-header-description">
              From residential developments to industrial and major civil
              works, JS RAM Construction delivers construction services
              shaped around project requirements, technical coordination,
              and dependable execution.
            </p>
          </header>

          {/* SERVICE LIST */}
          <div className="services-grid">
            {services.map(({ number, title, description, Icon, slug }, index) => (
              <article
                className="service-card services-reveal"
                key={slug}
                style={{ "--service-index": index }}
              >
                <div className="service-card-top">
                  <span className="service-number">{number}</span>

                  <Icon
                    className="service-card-icon"
                    size={31}
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />
                </div>

                <h2>{title}</h2>
                <p>{description}</p>

                <Link
                  to={`/services/${slug}`}
                  className="service-card-link"
                  aria-label={`Explore ${title}`}
                >
                  <span>Explore service</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>

          <div className="services-bottom services-reveal">
            <div>
              <span className="services-bottom-eyebrow">
                HAVE A PROJECT IN MIND?
              </span>
              <p>Let's discuss your construction requirements.</p>
            </div>

            <Link to="/contact" className="services-contact-link">
              Discuss your project
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* CONSTRUCTION EQUIPMENT */}
      <section
        ref={equipmentReveal.sectionRef}
        className={`equipment-section ${
          equipmentReveal.isVisible ? "equipment-visible" : ""
        }`}
      >
        <div className="equipment-container">
          <header className="equipment-header equipment-reveal">
            <div>
              <span className="services-eyebrow">
                <span className="services-eyebrow-line" />
                OUR RESOURCES
              </span>

              <h2 className="equipment-title">
                Equipped to
                <span> deliver.</span>
              </h2>
            </div>

            <p>
              Our equipment and construction resources support efficient
              site operations and the execution of a broad range of projects.
            </p>
          </header>

          <div className="equipment-list">
            {equipment.map(({ number, title, detail, Icon }, index) => (
              <article
                className="equipment-item equipment-reveal"
                key={number}
                style={{ "--equipment-index": index }}
              >
                <span className="equipment-number">{number}</span>

                <Icon
                  className="equipment-icon"
                  size={25}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />

                <div className="equipment-item-content">
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>

                <ArrowUpRight
                  className="equipment-arrow"
                  size={19}
                  aria-hidden="true"
                />
              </article>
            ))}
          </div>

          <div className="equipment-footer equipment-reveal">
            <span>JS RAM CONSTRUCTION PVT. LTD.</span>
            <span>PLANNED WITH PURPOSE. BUILT TO LAST.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Services;
