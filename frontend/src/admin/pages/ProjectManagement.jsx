import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Check,
  Save,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  getStoredProjects,
  fetchProjects,
  getStoredCategories,
  fetchCategories,
  saveProject,
  deleteProject,
} from "../../services/dataStorage";
import "./ProjectManagement.css";

const EMPTY_FORM = {
  slug: "",
  name: "",
  categoryId: "hospital",
  location: "Nagpur, Maharashtra",
  client: "",
  configuration: "",
  floorPlate: "",
  additional: "",
  description: "",
  image: "/images/hero-construction.jpg",
  progressImages: [],
  isPublished: true,
};

function ProjectManagement() {
  const [projects, setProjects] = useState(() => getStoredProjects());
  const [categories, setCategories] = useState(() => getStoredCategories());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [newImageInput, setNewImageInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [notification, setNotification] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = () => {
    fetchCategories(true).then((cats) => {
      if (Array.isArray(cats)) setCategories(cats);
    });
    fetchProjects(null, true).then((projs) => {
      if (Array.isArray(projs)) setProjects(projs);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener("jsram_data_updated", loadData);
    return () => window.removeEventListener("jsram_data_updated", loadData);
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setErrorMessage("");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleOpenAddModal = async () => {
    setEditingId(null);
    setUploadedFiles([]);
    setNewImageInput("");
    setErrorMessage("");

    // Fresh categories from MongoDB whenever modal opens
    const freshCats = await fetchCategories(true);
    const availableCats = Array.isArray(freshCats) && freshCats.length > 0 ? freshCats : categories;
    setCategories(availableCats);

    const defaultCat =
      selectedCategory !== "all" && availableCats.some((c) => (c.slug || c.id) === selectedCategory)
        ? selectedCategory
        : availableCats[0]?.slug || availableCats[0]?.id || "hospital";

    setFormData({
      ...EMPTY_FORM,
      categoryId: defaultCat,
      image: "/images/hero-construction.jpg",
      progressImages: [],
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = async (project) => {
    setEditingId(project.slug || project.id);
    setUploadedFiles([]);
    setNewImageInput("");
    setErrorMessage("");

    // Fresh categories from MongoDB
    const freshCats = await fetchCategories(true);
    if (Array.isArray(freshCats) && freshCats.length > 0) {
      setCategories(freshCats);
    }

    setFormData({
      slug: project.slug || project.id || "",
      name: project.name || "",
      categoryId: project.categoryId || "hospital",
      location: project.location || "",
      client: project.client || "",
      configuration: project.configuration || "",
      floorPlate: project.floorPlate || "",
      additional: project.additional || "",
      description: project.description || "",
      image: project.image || "",
      progressImages: Array.isArray(project.progressImages) ? [...project.progressImages] : [],
      isPublished: project.isPublished !== false && project.published !== false,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setUploadedFiles([]);
    setErrorMessage("");
  };

  // Add multiple image files with lightweight object URLs (no base64!)
  const handleMultipleFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadedFiles((prev) => [...prev, ...files]);

    const newBlobUrls = files.map((f) => URL.createObjectURL(f));
    setFormData((prev) => {
      const list = [...prev.progressImages, ...newBlobUrls];
      const cover = prev.image && prev.image !== "/images/hero-construction.jpg" ? prev.image : newBlobUrls[0];
      return { ...prev, progressImages: list, image: cover };
    });
  };

  const handleAddImageUrl = () => {
    if (!newImageInput.trim()) return;
    const url = newImageInput.trim();
    setFormData((prev) => ({
      ...prev,
      progressImages: [...prev.progressImages, url],
      image: prev.image && prev.image !== "/images/hero-construction.jpg" ? prev.image : url,
    }));
    setNewImageInput("");
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const removed = prev.progressImages[indexToRemove];
      const updatedList = prev.progressImages.filter((_, i) => i !== indexToRemove);
      let newCover = prev.image;
      if (prev.image === removed) {
        newCover = updatedList[0] || "/images/hero-construction.jpg";
      }
      return {
        ...prev,
        progressImages: updatedList,
        image: newCover,
      };
    });
  };

  const handleSelectCover = (imgUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imgUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Project name is required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const cat = categories.find((c) => (c.slug || c.id) === formData.categoryId);
    const categoryName = cat ? cat.title : "Construction";

    const isNew = !editingId;
    const payload = {
      ...formData,
      categoryName,
      slug: editingId ? editingId : formData.slug || formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      published: formData.isPublished,
      _isNew: isNew,
    };

    try {
      const res = await saveProject(payload, uploadedFiles, isNew);
      setIsSaving(false);
      if (res.success) {
        handleCloseModal();
        loadData();
        showNotification(
          editingId
            ? `Project "${formData.name}" updated successfully.`
            : `New project "${formData.name}" added to portfolio.`
        );
      } else {
        setErrorMessage(res.message || "Failed to save project.");
      }
    } catch (err) {
      setIsSaving(false);
      setErrorMessage(err.message || "An error occurred while saving project.");
    }
  };

  const handleDelete = async (project) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${project.name}" from the portfolio? This cannot be undone.`
    );
    if (!confirmDelete) return;

    const res = await deleteProject(project.slug || project.id);
    if (res.success) {
      loadData();
      showNotification(`Project "${project.name}" deleted.`);
    } else {
      alert(res.message || "Failed to delete project.");
    }
  };

  const handleTogglePublish = async (project) => {
    const currentStatus = project.isPublished !== false && project.published !== false;
    const newStatus = !currentStatus;

    await saveProject({
      ...project,
      isPublished: newStatus,
      published: newStatus,
    }, [], false);
    loadData();
    showNotification(
      `Project "${project.name}" is now ${newStatus ? "published live" : "saved as draft (hidden)"}.`
    );
  };

  // Filter projects by search and category
  const filteredProjects = projects.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" ||
      String(p.categoryId).toLowerCase() === String(selectedCategory).toLowerCase();
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="project-management-view">
      {/* HEADER */}
      <div className="admin-view-header">
        <div>
          <span className="admin-view-eyebrow">PORTFOLIO REPOSITORY</span>
          <h1 className="admin-view-title">Project Management</h1>
          <p className="admin-view-lead">
            Manage projects, upload multiple site photographs, choose cover photos, and toggle publish status.
          </p>
        </div>

        <div className="admin-view-actions">
          <button
            onClick={handleOpenAddModal}
            className="admin-primary-btn"
            type="button"
          >
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="admin-toast-notification">
          <Check size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="project-filters-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects by name, client or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter-wrap">
          <Filter size={15} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Sectors ({projects.length})</option>
            {categories.map((c) => {
              const catId = c.slug || c.id;
              return (
                <option key={catId} value={catId}>
                  {c.title}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* PROJECTS TABLE */}
      <div className="admin-card-container">
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Project / Cover</th>
                <th>Category</th>
                <th>Location</th>
                <th>Configuration &amp; Specs</th>
                <th>Client</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center empty-cell">
                    No projects found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const cat = categories.find(
                    (c) => (c.slug || c.id) === project.categoryId
                  );
                  const isPublished =
                    project.isPublished !== false && project.published !== false;
                  const cover =
                    project.image ||
                    (project.progressImages && project.progressImages[0]) ||
                    "/images/hero-construction.jpg";

                  return (
                    <tr
                      key={project.slug || project.id}
                      className={!isPublished ? "row-hidden" : ""}
                    >
                      <td>
                        <div className="table-project-name">
                          <img
                            src={cover}
                            alt={project.name}
                            className="table-project-thumb"
                          />
                          <div>
                            <strong>{project.name}</strong>
                            <small className="project-id-sub">
                              Slug: {project.slug || project.id}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill-tag">
                          {cat?.title || project.categoryName || project.categoryId}
                        </span>
                      </td>
                      <td>
                        <span className="location-cell">
                          <MapPin size={13} />
                          {project.location}
                        </span>
                      </td>
                      <td>
                        <div className="specs-cell">
                          <strong>{project.configuration}</strong>
                          <small>{project.floorPlate}</small>
                        </div>
                      </td>
                      <td>
                        <span className="client-text">
                          {project.client || "—"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleTogglePublish(project)}
                          className={`status-toggle-badge ${
                            isPublished ? "published" : "hidden"
                          }`}
                          title="Click to toggle publish status"
                          type="button"
                        >
                          {isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span>{isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="table-actions-inline">
                          <button
                            onClick={() => handleOpenEditModal(project)}
                            className="action-icon-btn edit"
                            title="Edit Project"
                            type="button"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(project)}
                            className="action-icon-btn delete"
                            title="Delete Project"
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PROJECT MODAL DIALOG */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-dialog modal-lg">
            <div className="admin-modal-header">
              <h2>
                {editingId
                  ? `Edit Project: ${formData.name}`
                  : "Add New Portfolio Project"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="modal-close-btn"
                type="button"
              >
                &times;
              </button>
            </div>

            {errorMessage && (
              <div className="modal-error-banner">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-form-grid-2">
                <div className="modal-form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Ram Swar Medspace"
                    required
                  />
                </div>

                <div className="modal-form-group">
                  <label>Assigned Sector / Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    required
                  >
                    {categories.map((c) => {
                      const catId = c.slug || c.id;
                      return (
                        <option key={catId} value={catId}>
                          {c.title}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="modal-form-grid-2">
                <div className="modal-form-group">
                  <label>Project Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Shankar Nagar, Nagpur"
                    required
                  />
                </div>

                <div className="modal-form-group">
                  <label>Client Organisation *</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    placeholder="e.g. Raghav Lifespace"
                    required
                  />
                </div>
              </div>

              <div className="modal-form-grid-2">
                <div className="modal-form-group">
                  <label>Configuration *</label>
                  <input
                    type="text"
                    value={formData.configuration}
                    onChange={(e) =>
                      setFormData({ ...formData, configuration: e.target.value })
                    }
                    placeholder="e.g. G+15 Residential"
                    required
                  />
                </div>

                <div className="modal-form-group">
                  <label>Floor Plate / Area *</label>
                  <input
                    type="text"
                    value={formData.floorPlate}
                    onChange={(e) =>
                      setFormData({ ...formData, floorPlate: e.target.value })
                    }
                    placeholder="e.g. 6,500 sq. ft."
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Additional Specifications</label>
                <input
                  type="text"
                  value={formData.additional}
                  onChange={(e) =>
                    setFormData({ ...formData, additional: e.target.value })
                  }
                  placeholder="e.g. Double basement · 10,000 sq. ft."
                />
              </div>

              <div className="modal-form-group">
                <label>Project Overview / Architectural Summary</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Comprehensive structural overview, special load specs, basements..."
                />
              </div>

              {/* PHOTOGRAPHS & COVER SELECTION */}
              <div className="project-photos-management-box">
                <label className="box-section-label">
                  <ImageIcon size={15} />
                  <span>Project Photographs (Select Cover Photo)</span>
                </label>

                {/* Upload Buttons */}
                <div className="upload-controls-row">
                  <label className="upload-file-label">
                    <Upload size={14} />
                    <span>Upload Site Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleFilesUpload}
                      style={{ display: "none" }}
                    />
                  </label>

                  <div className="url-add-inline">
                    <input
                      type="text"
                      placeholder="Or paste image URL / Cloudinary link..."
                      value={newImageInput}
                      onChange={(e) => setNewImageInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="add-url-btn"
                    >
                      Add Photo
                    </button>
                  </div>
                </div>

                {/* ALL PROJECT PHOTOS GRID WITH COVER SELECTOR */}
                {formData.progressImages.length > 0 ? (
                  <div className="photos-selection-grid">
                    {formData.progressImages.map((imgUrl, idx) => {
                      const isCover = formData.image === imgUrl;
                      return (
                        <div
                          key={idx}
                          className={`photo-select-item ${
                            isCover ? "is-selected-cover" : ""
                          }`}
                        >
                          <img src={imgUrl} alt={`Photo ${idx + 1}`} />

                          <button
                            type="button"
                            className="remove-photo-btn"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove photo"
                          >
                            <X size={12} />
                          </button>

                          <button
                            type="button"
                            className={`select-cover-btn ${
                              isCover ? "active-cover" : ""
                            }`}
                            onClick={() => handleSelectCover(imgUrl)}
                          >
                            {isCover ? (
                              <>
                                <CheckCircle2 size={12} />
                                <span>Cover Photo</span>
                              </>
                            ) : (
                              <span>Set as Cover</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-photos-hint">
                    No gallery photos added yet. Upload or enter URLs above.
                  </div>
                )}
              </div>

              <div className="modal-form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                  />
                  <span>
                    <strong>Publish Project</strong> (Visible on category grid and project details page)
                  </span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={isSaving}
                >
                  <Save size={15} />
                  <span>
                    {isSaving
                      ? "Saving & Uploading..."
                      : editingId
                      ? "Save Project Changes"
                      : "Create Project"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManagement;
