import { useState, useEffect } from "react";
import {
  Upload,
  Check,
  Lock,
  ExternalLink,
  RotateCcw,
  Image as ImageIcon,
  Save,
  AlertCircle,
} from "lucide-react";
import {
  getStoredHomepageConfig,
  fetchHomepageSettings,
  updateHomepageHeroImage,
  resolveImageUrl,
} from "../../services/dataStorage";
import "./HomepageManagement.css";

function HomepageManagement() {
  const [currentHeroImage, setCurrentHeroImage] = useState(() => {
    return getStoredHomepageConfig().heroImage || "/images/hero-construction.jpg";
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHomepageSettings().then((cfg) => {
      if (cfg?.heroImage) {
        setCurrentHeroImage(cfg.heroImage);
      }
    });

    const handleUpdate = () => {
      const cfg = getStoredHomepageConfig();
      if (cfg?.heroImage) {
        setCurrentHeroImage(cfg.heroImage);
      }
    };

    window.addEventListener("jsram_data_updated", handleUpdate);
    return () => window.removeEventListener("jsram_data_updated", handleUpdate);
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setError("");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setSelectedFile(file);
    setImageUrlInput("");
    setError("");

    // Use lightweight object URL for instant preview (zero base64 in storage!)
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrlInput(url);
    setSelectedFile(null);
    if (url.trim()) {
      setPreviewImage(url.trim());
    } else {
      setPreviewImage(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedFile && !imageUrlInput.trim()) {
      setError("Please select a replacement photograph or enter an image URL.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const target = selectedFile || imageUrlInput.trim();
      const result = await updateHomepageHeroImage(target);
      setIsSaving(false);

      if (result.success) {
        setCurrentHeroImage(result.heroImage);
        setPreviewImage(null);
        setSelectedFile(null);
        setImageUrlInput("");
        showNotification("Homepage hero background image updated and published live!");
      } else {
        setError("Failed to update image. Please try again.");
      }
    } catch (err) {
      setIsSaving(false);
      setError(err.message || "An error occurred while uploading.");
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Reset homepage hero background image back to default architectural photograph?"
    );
    if (confirmed) {
      setIsSaving(true);
      await updateHomepageHeroImage("/images/hero-construction.jpg");
      setCurrentHeroImage("/images/hero-construction.jpg");
      setPreviewImage(null);
      setSelectedFile(null);
      setImageUrlInput("");
      setIsSaving(false);
      showNotification("Homepage hero image restored to default.");
    }
  };

  const activeDisplayImage = previewImage || currentHeroImage;
  const resolvedDisplayImage = previewImage
    ? resolveImageUrl(previewImage, "/images/hero-construction.jpg", true)
    : resolveImageUrl(currentHeroImage);

  return (
    <div className="homepage-management-view">
      {/* HEADER */}
      <div className="admin-view-header">
        <div>
          <span className="admin-view-eyebrow">HOMEPAGE CONTROLS</span>
          <h1 className="admin-view-title">Homepage Hero Background Image</h1>

        </div>

        <div className="admin-view-actions">

        </div>
      </div>

      {notification && (
        <div className="admin-toast-notification">
          <Check size={16} />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="admin-toast-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}



      <div className="hero-management-grid">
        {/* CURRENT & PREVIEW DISPLAY */}
        <div className="admin-form-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                {previewImage ? "Preview of Replacement Image" : "Current Active Hero Image"}
              </h2>
              <p className="panel-desc">
                {previewImage
                  ? "Unsaved preview. Click 'Save & Publish Hero Image' below to apply."
                  : "Currently displayed on the public landing page."}
              </p>
            </div>
            {previewImage && (
              <span className="preview-badge">UNSAVED PREVIEW</span>
            )}
          </div>

          {/* REALISTIC HERO MOCKUP */}
          <div className="hero-mockup-frame">
            <div
              className="hero-mockup-bg"
              style={{ backgroundImage: `url("${resolvedDisplayImage}")` }}
            />
            <div className="hero-mockup-overlay" />
            <div className="hero-mockup-content">
              <span className="mockup-eyebrow">CONSTRUCTION • EPC • INFRASTRUCTURE</span>
              <h3 className="mockup-heading">
                Construction<br />
                <span>planned with purpose.</span>
              </h3>
              <p className="mockup-text">
                Delivering high quality construction and EPC solutions across residential, commercial, industrial and infrastructure projects.
              </p>
            </div>
          </div>

          <div className="hero-image-path-info">
            <ImageIcon size={14} />
            <span>Source: <code>{activeDisplayImage}</code></span>
          </div>
        </div>

        {/* UPLOAD FORM */}
        <div className="admin-form-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Upload Replacement Photograph</h2>
              <p className="panel-desc">
                Upload a high-resolution architectural photograph (recommended: 1920×1080 or larger, landscape orientation).
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="hero-upload-form">
            {/* FILE DROP ZONE */}
            <div className="file-drop-zone">
              <input
                type="file"
                id="hero-file-input"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              <label htmlFor="hero-file-input" className="file-drop-label">
                <Upload size={32} className="upload-icon" />
                <strong>Choose image file or drag here</strong>
                <span>Supports JPG, PNG, WebP up to 15MB (Stored in Cloudinary)</span>
              </label>
            </div>

            {selectedFile && (
              <div className="selected-file-info">
                <Check size={15} color="#25d366" />
                <span>Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
            )}

            <div className="or-divider">
              <span>OR ENTER IMAGE URL</span>
            </div>

            <div className="form-group">
              <label htmlFor="hero-url-input">Image Path or Cloudinary URL</label>
              <input
                id="hero-url-input"
                type="text"
                value={imageUrlInput}
                onChange={handleUrlChange}
                placeholder="e.g. /images/hero-construction.jpg or https://res.cloudinary.com/..."
              />
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                onClick={handleReset}
                className="secondary-reset-btn"
                disabled={isSaving}
              >
                <RotateCcw size={15} />
                <span>Restore Default</span>
              </button>

              <button
                type="submit"
                className="primary-save-btn"
                disabled={isSaving || (!selectedFile && !imageUrlInput.trim())}
              >
                <Save size={16} />
                <span>{isSaving ? "Saving & Uploading..." : "Save & Publish Hero Image"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HomepageManagement;
