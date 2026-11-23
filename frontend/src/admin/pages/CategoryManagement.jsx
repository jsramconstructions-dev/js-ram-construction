import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Check,
  Save,
  Layers,
  ArrowUp,
  ArrowDown,
  Plus,
  AlertTriangle,
} from "lucide-react";
import {
  getStoredCategories,
  fetchCategories,
  saveCategory,
  deleteCategory,
  getProjectsByCategory,
} from "../../services/dataStorage";
import "./CategoryManagement.css";

function CategoryManagement() {
  const [categories, setCategories] = useState(() =>
    getStoredCategories().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  );

  const [editingCategory, setEditingCategory] = useState(null); // null, 'new', or category object
  const [editForm, setEditForm] = useState({
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    badge: "",
    coverImage: "",
    isActive: true,
  });
  const [coverFile, setCoverFile] = useState(null);
  const [notification, setNotification] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = () => {
    fetchCategories(true).then((list) => {
      if (Array.isArray(list)) {
        setCategories(
          [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        );
      }
    });
  };

  useEffect(() => {
    loadCategories();
    window.addEventListener("jsram_data_updated", loadCategories);
    return () => window.removeEventListener("jsram_data_updated", loadCategories);
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setErrorModal("");
    setTimeout(() => setNotification(""), 4000);
  };

  const handleStartCreate = () => {
    setEditingCategory("new");
    setCoverFile(null);
    setEditForm({
      slug: "",
      title: "",
      subtitle: "",
      description: "",
      badge: "",
      coverImage: "/images/hero-construction.jpg",
      isActive: true,
    });
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category);
    setCoverFile(null);
    setEditForm({
      slug: category.slug || category.id || "",
      title: category.title || "",
      subtitle: category.subtitle || "",
      description: category.description || "",
      badge: category.badge || category.title || "",
      coverImage: category.coverImage || "",
      isActive: category.isActive !== false,
    });
  };

  const handleCancelModal = () => {
    setEditingCategory(null);
    setCoverFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    // Instant lightweight object URL preview (no base64)
    const previewUrl = URL.createObjectURL(file);
    setEditForm((prev) => ({ ...prev, coverImage: previewUrl }));
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      alert("Category title is required.");
      return;
    }

    setIsSaving(true);
    const isNew = editingCategory === "new";
    const payload = {
      ...editForm,
      _isNew: isNew,
      displayOrder: isNew ? categories.length + 1 : editingCategory.displayOrder || 1,
    };

    try {
      const res = await saveCategory(payload, coverFile, isNew);
      setIsSaving(false);
      if (res.success) {
        setEditingCategory(null);
        setCoverFile(null);
        loadCategories();
        showNotification(`Category "${editForm.title}" saved successfully.`);
      } else {
        setErrorModal(res.message || "Failed to save category.");
      }
    } catch (err) {
      setIsSaving(false);
      setErrorModal(err.message || "Failed to save category.");
    }
  };

  const handleDelete = async (category) => {
    const catId = category.slug || category.id;
    const assignedProjects = getProjectsByCategory(catId);

    // CRITICAL: Prevent deletion if projects are assigned
    if (assignedProjects.length > 0) {
      setErrorModal(
        `Cannot delete category "${category.title}" because ${assignedProjects.length} project(s) are currently assigned to it (${assignedProjects.map((p) => p.name).join(", ")}). Please reassign or delete these projects first.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete category "${category.title}"?`
    );
    if (!confirmed) return;

    const res = await deleteCategory(catId);
    if (res.success) {
      loadCategories();
      showNotification(`Category "${category.title}" was deleted.`);
    } else {
      setErrorModal(res.message || "Failed to delete category.");
    }
  };

  const handleToggleVisibility = async (cat) => {
    const newStatus = !(cat.isActive !== false);
    await saveCategory({
      ...cat,
      isActive: newStatus,
    }, null, false);
    loadCategories();
    showNotification(`Category "${cat.title}" is now ${newStatus ? "visible on website" : "hidden from website"}.`);
  };

  const handleMoveOrder = async (index, direction) => {
    const newCategories = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    for (let i = 0; i < newCategories.length; i++) {
      await saveCategory({
        ...newCategories[i],
        displayOrder: i + 1,
      }, null, false);
    }

    loadCategories();
    showNotification("Category display order updated.");
  };

  return (
    <div className="category-management-view">
      {/* HEADER */}
      <div className="admin-view-header">
        <div>
          <span className="admin-view-eyebrow">PORTFOLIO ARCHITECTURE</span>
          <h1 className="admin-view-title">Category Management</h1>
          <p className="admin-view-lead">
            Manage architectural sectors. Newly created and active categories appear directly in project forms and public portfolio grids.
          </p>
        </div>

        <div className="admin-view-actions">
          <button
            type="button"
            className="primary-action-btn"
            onClick={handleStartCreate}
          >
            <Plus size={16} />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="admin-toast-notification">
          <Check size={16} />
          <span>{notification}</span>
        </div>
      )}

      {errorModal && (
        <div className="admin-toast-error">
          <AlertTriangle size={18} />
          <span>{errorModal}</span>
        </div>
      )}

      {/* CATEGORIES GRID */}
      <div className="categories-grid">
        {categories.map((cat, index) => {
          const catId = cat.slug || cat.id;
          const projects = getProjectsByCategory(catId);
          const projectCount = cat.projectCount !== undefined ? cat.projectCount : projects.length;
          const isVisible = cat.isActive !== false;

          return (
            <div className={`category-admin-card ${!isVisible ? "is-disabled" : ""}`} key={catId}>
              {/* Media Preview */}
              <div className="cat-card-media-wrap">
                <img
                  src={cat.coverImage || "/images/hero-construction.jpg"}
                  alt={cat.title}
                  className="cat-card-preview-img"
                />
                <div className="cat-card-badge-row">
                  <span className="cat-badge-id">
                    0{index + 1} &bull; {cat.badge || cat.title}
                  </span>
                  <span className={`cat-status-pill ${isVisible ? "active" : "hidden"}`}>
                    {isVisible ? "Active (Visible)" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="cat-card-body">
                <div className="cat-title-row">
                  <div>
                    <h2 className="cat-admin-title">{cat.title}</h2>
                    {cat.subtitle && <span className="cat-admin-subtitle">{cat.subtitle}</span>}
                  </div>
                  <span className="cat-project-counter">
                    <Layers size={13} />
                    {projectCount} {projectCount === 1 ? "Project" : "Projects"}
                  </span>
                </div>

                <p className="cat-admin-description">{cat.description || "Portfolio division for JS Ram Construction."}</p>

                {/* Actions */}
                <div className="cat-admin-actions">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="cat-action-btn edit-btn"
                    type="button"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleToggleVisibility(cat)}
                    className="cat-action-btn toggle-btn"
                    title={isVisible ? "Hide category on website" : "Show category on website"}
                    type="button"
                  >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{isVisible ? "Hide" : "Activate"}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(cat)}
                    className="cat-action-btn delete-btn"
                    title="Delete category"
                    type="button"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>

                  <div className="cat-order-arrows">
                    <button
                      onClick={() => handleMoveOrder(index, "up")}
                      disabled={index === 0}
                      className="order-btn"
                      title="Move up"
                      type="button"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, "down")}
                      disabled={index === categories.length - 1}
                      className="order-btn"
                      title="Move down"
                      type="button"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-dialog">
            <div className="admin-modal-header">
              <h2>
                {editingCategory === "new" ? "Add New Category" : `Edit Category: ${editingCategory.title}`}
              </h2>
              <button
                onClick={handleCancelModal}
                className="modal-close-btn"
                type="button"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="admin-modal-form">
              <div className="modal-form-group">
                <label>Category Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Industrial & Logistics"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Category Identifier / Slug</label>
                <input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  placeholder="e.g. industrial (optional, auto-generated if blank)"
                />
              </div>

              <div className="modal-form-group">
                <label>Sector Badge Label</label>
                <input
                  type="text"
                  value={editForm.badge}
                  onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                  placeholder="e.g. Industrial"
                />
              </div>

              <div className="modal-form-group">
                <label>Subtitle / Sub-domain</label>
                <input
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  placeholder="e.g. Heavy Engineering & Warehousing Facilities"
                />
              </div>

              <div className="modal-form-group">
                <label>Category Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description displayed on category card..."
                />
              </div>

              <div className="modal-form-group">
                <label>One Fixed Cover Photograph *</label>
                <input
                  type="text"
                  value={editForm.coverImage}
                  onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                  placeholder="e.g. /images/ram-swar-medspace.jpg or Cloudinary URL"
                  required
                />

                <div className="file-upload-row">
                  <label className="upload-file-label">
                    <Upload size={14} />
                    <span>Upload New Photograph</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  <small>Accepts JPG, PNG, WebP up to 15MB (Stored in Cloudinary)</small>
                </div>

                {editForm.coverImage && (
                  <div className="image-preview-box">
                    <span>Selected Cover Preview:</span>
                    <img
                      src={editForm.coverImage}
                      alt="Cover Preview"
                      className="modal-cover-preview"
                    />
                  </div>
                )}
              </div>

              <div className="modal-form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  <span>Active &amp; visible on the public website</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={handleCancelModal}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn" disabled={isSaving}>
                  <Save size={15} />
                  <span>{isSaving ? "Saving..." : "Save Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManagement;
