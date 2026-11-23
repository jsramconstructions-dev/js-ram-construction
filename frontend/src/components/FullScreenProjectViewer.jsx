import { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  ChevronUp,
  ChevronDown,
  MapPin,
  Maximize2,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import {
  getStoredCategories,
  getProjectsByCategory,
} from "../services/dataStorage";
import "./FullScreenProjectViewer.css";

function FullScreenProjectViewer({
  initialCategory,
  isOpen,
  onClose,
}) {
  const categories = getStoredCategories().filter((c) => c.enabled !== false);

  const [activeCategoryId, setActiveCategoryId] = useState(
    initialCategory?.id || categories[0]?.id || "hospital"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageError, setImageError] = useState(false);

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || initialCategory || categories[0];

  const currentCategoryProjects = getProjectsByCategory(activeCategoryId);
  const totalProjects = currentCategoryProjects.length;
  const currentProject = currentCategoryProjects[currentIndex] || currentCategoryProjects[0];

  const savedScrollPosition = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const lastNavTime = useRef(0);
  const containerRef = useRef(null);

  // Lock body scroll and remember scroll position upon opening
  useEffect(() => {
    if (isOpen) {
      savedScrollPosition.current = window.scrollY || window.pageYOffset || 0;
      const scrollY = savedScrollPosition.current;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = savedScrollPosition.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Preload adjacent images
  useEffect(() => {
    if (!isOpen || !currentCategoryProjects || totalProjects === 0) return;

    const nextIndex = (currentIndex + 1) % totalProjects;
    const prevIndex = (currentIndex - 1 + totalProjects) % totalProjects;

    [nextIndex, prevIndex].forEach((idx) => {
      if (currentCategoryProjects[idx]?.image) {
        const img = new Image();
        img.src = currentCategoryProjects[idx].image;
      }
    });
  }, [currentIndex, isOpen, currentCategoryProjects, totalProjects]);

  // Navigate projects within active category
  const changeProject = useCallback(
    (direction) => {
      const now = Date.now();
      if (now - lastNavTime.current < 420 || isTransitioning || totalProjects <= 1) return;
      lastNavTime.current = now;

      setImageError(false);
      setIsTransitioning(true);
      setSlideDirection(direction);

      if (direction === "next") {
        setCurrentIndex((prev) => (prev + 1) % totalProjects);
      } else {
        setCurrentIndex((prev) => (prev - 1 + totalProjects) % totalProjects);
      }

      setTimeout(() => {
        setIsTransitioning(false);
      }, 420);
    },
    [isTransitioning, totalProjects]
  );

  const handleNext = useCallback(() => {
    changeProject("next");
  }, [changeProject]);

  const handlePrev = useCallback(() => {
    changeProject("prev");
  }, [changeProject]);

  // Category switching inside viewer
  const handleSwitchCategory = (catId) => {
    if (catId === activeCategoryId) return;
    setImageError(false);
    setIsTransitioning(true);
    setSlideDirection("next");
    setActiveCategoryId(catId);
    setCurrentIndex(0);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 420);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Wheel navigation with debounce
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      if (Math.abs(delta) < 25) return;

      if (delta > 0) {
        handleNext(); // Wheel down -> Next project
      } else {
        handlePrev(); // Wheel up -> Prev project
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [isOpen, handleNext, handlePrev]);

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaY = touchStartY.current - touchEndY.current;
    if (Math.abs(deltaY) > 45) {
      if (deltaY > 0) {
        // Swiped UP -> Next project
        handleNext();
      } else {
        // Swiped DOWN -> Prev project
        handlePrev();
      }
    }
  };

  if (!isOpen || !currentProject) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello JS RAM Construction, I am inquiring about the ${currentProject.name} (${currentProject.categoryName || activeCategory.title}) project.`
  );
  const whatsappUrl = `https://wa.me/919765002278?text=${whatsappMessage}`;

  return (
    <div
      className="fullscreen-viewer-overlay"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${activeCategory?.title} Project Viewer`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* TOP BAR / CATEGORY SELECTOR & CONTROLS */}
      <header className="viewer-top-bar">
        {/* LEFT: Category Navigation Pills */}
        <div className="viewer-category-selector" role="tablist" aria-label="Select Project Category">
          {categories.map((cat) => {
            const catProjects = getProjectsByCategory(cat.id);
            const count = catProjects.length;
            const isSelected = cat.id === activeCategoryId;

            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                className={`viewer-cat-pill ${isSelected ? "active" : ""}`}
                onClick={() => handleSwitchCategory(cat.id)}
                type="button"
              >
                <span className="pill-dot" />
                <span className="pill-title">{cat.title}</span>
                <span className="pill-count">({count})</span>
              </button>
            );
          })}
        </div>

        {/* CENTER: Project Counter */}
        <div className="viewer-counter-badge" aria-label={`Project ${currentIndex + 1} of ${totalProjects}`}>
          <span className="counter-current">{String(currentIndex + 1).padStart(2, "0")}</span>
          <span className="counter-sep">/</span>
          <span className="counter-total">{String(totalProjects).padStart(2, "0")}</span>
        </div>

        {/* RIGHT: Close Button */}
        <button
          className="viewer-close-btn"
          onClick={onClose}
          aria-label="Close Project Viewer"
          type="button"
        >
          <span className="close-text">CLOSE</span>
          <X size={18} />
          <kbd className="esc-key">ESC</kbd>
        </button>
      </header>

      {/* MAIN PROJECT DISPLAY */}
      <main
        className={`viewer-body ${
          slideDirection === "next"
            ? "slide-up-active"
            : slideDirection === "prev"
            ? "slide-down-active"
            : ""
        }`}
      >
        {/* LEFT / CENTER: HIGH-RES PHOTOGRAPHY */}
        <section className="viewer-media-panel">
          <div className="viewer-media-frame">
            {imageError ? (
              <div className="viewer-image-fallback">
                <ShieldAlert size={48} />
                <p>Project architectural photography preview unavailable</p>
                <span>{currentProject.name}</span>
              </div>
            ) : (
              <img
                src={currentProject.image}
                alt={`${currentProject.name} - ${currentProject.categoryName || activeCategory.title}`}
                className="viewer-main-image"
                onError={() => setImageError(true)}
              />
            )}
            <div className="image-vignette-overlay" />
            <div className="image-badge-tag">
              <Maximize2 size={13} />
              <span>Full-Screen Exhibition • {activeCategory.title}</span>
            </div>
          </div>
        </section>

        {/* RIGHT: ARCHITECTURAL METRICS & DETAILS */}
        <section className="viewer-info-panel">
          <div className="viewer-info-scroll">
            <div className="info-meta-eyebrow">
              <span className="location-pin">
                <MapPin size={15} />
              </span>
              <span>{currentProject.location}</span>
            </div>

            <h1 className="viewer-project-title">{currentProject.name}</h1>

            <div className="viewer-divider-gold" />

            <div className="viewer-spec-table">
              {currentProject.client && (
                <div className="spec-row">
                  <span className="spec-label">CLIENT</span>
                  <strong className="spec-value">{currentProject.client}</strong>
                </div>
              )}

              {currentProject.configuration && (
                <div className="spec-row">
                  <span className="spec-label">CONFIGURATION</span>
                  <strong className="spec-value">{currentProject.configuration}</strong>
                </div>
              )}

              {currentProject.floorPlate && (
                <div className="spec-row">
                  <span className="spec-label">FLOOR PLATE / AREA</span>
                  <strong className="spec-value">{currentProject.floorPlate}</strong>
                </div>
              )}

              {currentProject.additional && (
                <div className="spec-row">
                  <span className="spec-label">ADDITIONAL SPEC</span>
                  <strong className="spec-value">{currentProject.additional}</strong>
                </div>
              )}
            </div>

            {currentProject.description && (
              <div className="viewer-description-box">
                <span className="desc-title">PROJECT OVERVIEW</span>
                <p className="viewer-description-text">{currentProject.description}</p>
              </div>
            )}

            <div className="viewer-action-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="viewer-enquire-btn"
              >
                <span>Inquire About Similar Development</span>
                <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="viewer-gesture-hint desktop-only">
              <span>Use Mouse Wheel or ↑ ↓ Arrow Keys • Switch Categories Above</span>
            </div>
            <div className="viewer-gesture-hint mobile-only">
              <span>Swipe UP for next project • Swipe DOWN for previous</span>
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING VERTICAL NAVIGATION CONTROLS */}
      {totalProjects > 1 && (
        <nav className="viewer-vertical-nav" aria-label="Project Navigation">
          <button
            className="vert-nav-btn prev-btn"
            onClick={handlePrev}
            title="Previous Project (Arrow Up)"
            aria-label="Previous Project"
            type="button"
          >
            <ChevronUp size={22} />
          </button>

          {/* Step Indicators */}
          <div className="vert-nav-dots">
            {currentCategoryProjects.map((p, idx) => (
              <button
                key={p.id || idx}
                className={`nav-dot ${idx === currentIndex ? "active" : ""}`}
                onClick={() => {
                  setImageError(false);
                  setSlideDirection(idx > currentIndex ? "next" : "prev");
                  setCurrentIndex(idx);
                }}
                aria-label={`Jump to ${p.name}`}
                type="button"
              />
            ))}
          </div>

          <button
            className="vert-nav-btn next-btn"
            onClick={handleNext}
            title="Next Project (Arrow Down)"
            aria-label="Next Project"
            type="button"
          >
            <ChevronDown size={22} />
          </button>
        </nav>
      )}
    </div>
  );
}

export default FullScreenProjectViewer;
