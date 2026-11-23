import { clientPartners } from "../data/projectsData";
import "./TrustedClients.css";

function TrustedClients() {
  // Seamless loop by duplicating the 9 genuine client logos
  const marqueeLogos = [...clientPartners, ...clientPartners, ...clientPartners];

  return (
    <section className="trusted-clients" id="clients" aria-labelledby="clients-title">
      <div className="clients-container">
        {/* HEADER */}
        <header className="trusted-clients-header">
          <div className="clients-eyebrow">
            <span className="eyebrow-line" />
            OUR VALUED PARTNERS • CENTRAL INDIA
          </div>

          <div className="clients-header-split">
            <h2 className="clients-main-title" id="clients-title">
              Trusted Client
              <br />
              <span className="clients-title-italic">Partnerships.</span>
            </h2>

            <p className="clients-description">
              Over years of civil engineering delivery, we have fostered enduring relationships with prominent infrastructure groups, developers, and institutions across Maharashtra.
            </p>
          </div>
        </header>

        {/* CONTINUOUS HORIZONTAL SCROLLING LOGO CAROUSEL */}
        <div className="marquee-wrapper">
          <div className="marquee-fade-left" aria-hidden="true" />
          <div className="marquee-fade-right" aria-hidden="true" />

          <div className="marquee-track" role="region" aria-label="Client logos continuous carousel">
            {marqueeLogos.map((client, index) => (
              <div
                className="marquee-logo-card"
                key={`${client.name}-${index}`}
                title={client.name}
              >
                <img
                  src={client.logo}
                  alt={`${client.name} client partnership logo`}
                  className="client-logo-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER ACCENT NOTE */}
        <div className="clients-bottom-meta">
          <span>BUILT ON TRUST • BACKED BY EXPERIENCE • JS RAM CONSTRUCTION PVT. LTD.</span>
        </div>
      </div>
    </section>
  );
}

export default TrustedClients;
