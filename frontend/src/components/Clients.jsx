
import { useEffect, useRef, useState } from "react";
import "./Clients.css";

const clients = [
  { name: "Client 1", logo: "/images/client1.png" },
  { name: "Client 2", logo: "/images/client2.png" },
  { name: "Client 3", logo: "/images/client3.png" },
  { name: "Client 4", logo: "/images/client4.png" },
  { name: "Client 6", logo: "/images/client6.png" },
  { name: "Client 7", logo: "/images/client7.png" },
  { name: "Client 8", logo: "/images/client8.png" },
  { name: "Client 9", logo: "/images/client9.png" },
  { name: "Client 10", logo: "/images/client10.png" },
];

function Clients() {
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
      { threshold: 0.12 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`clients-section ${isVisible ? "clients-visible" : ""}`}
      aria-labelledby="clients-heading"
    >
      <div className="clients-container">
        <header className="clients-header clients-reveal">
          <div className="clients-heading-group">
            <span className="clients-eyebrow">OUR CLIENTS</span>

            <h2 id="clients-heading">
              Trusted <span>partnerships.</span>
            </h2>
          </div>

          <p>
            We work with organisations across construction, infrastructure,
            industry, and commercial development. Every relationship reflects
            our commitment to quality workmanship, dependable execution,
            and lasting professional partnerships.
          </p>
        </header>

        <div className="clients-grid">
          {clients.map((client, index) => (
            <div
              className="client-logo-item clients-reveal"
              key={client.logo}
              style={{ "--client-index": index }}
            >
              <img
                src={client.logo}
                alt={client.name}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        <footer className="clients-footer clients-reveal">
          <span>BUILT ON TRUST. BACKED BY EXPERIENCE.</span>
          <span>JS RAM CONSTRUCTION PVT. LTD.</span>
        </footer>
      </div>
    </section>
  );
}

export default Clients;
