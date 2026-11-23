
import { useEffect, useRef, useState } from "react";
import {
  Factory,
  Settings,
  Building2,
  BriefcaseBusiness,
  House,
  HardHat,
} from "lucide-react";
import "./ServiceStrip.css";

const services = [
  { title: "Industrial", subtitle: "Constructions", Icon: Factory },
  { title: "EPC", subtitle: "Solutions", Icon: Settings },
  { title: "Infrastructure", subtitle: "Projects", Icon: Building2 },
  { title: "Commercial", subtitle: "Buildings", Icon: BriefcaseBusiness },
  { title: "Residential", subtitle: "Bungalows", Icon: House },
  { title: "Specialised", subtitle: "Civil Works", Icon: HardHat },
];

function ServiceStrip() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`service-strip ${isVisible ? "service-strip-visible" : ""}`}
      id="services-strip"
    >
      <div className="service-strip-container">
        {services.map(({ title, subtitle, Icon }, index) => (
          <div
            className="service-strip-item"
            key={title}
            style={{ "--item-index": index }}
          >
            <Icon className="service-strip-icon" strokeWidth={1.6} />

            <h3>
              {title}
              <span>{subtitle}</span>
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ServiceStrip;
