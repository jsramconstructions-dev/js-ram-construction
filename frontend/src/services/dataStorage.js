// JS RAM CONSTRUCTION — INTEGRATED DATA STORAGE & API CLIENT
// Connects to Node.js + Express + MongoDB Atlas backend with resilient offline/localStorage fallback.

import { categoryData, categorizedProjects } from "../data/projectsData";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port !== "5000"
    ? "http://localhost:5000"
    : "");

const STORAGE_KEYS = {
  PROJECTS: "jsram_projects_v3",
  CATEGORIES: "jsram_categories_v3",
  HOMEPAGE: "jsram_homepage_v3",
  AUTH: "jsram_admin_auth_v3",
};

// Safe localStorage set that cleans up legacy base64 data and avoids quota errors
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Storage] localStorage write failed for key "${key}":`, err.message);
    try {
      // Purge oversized legacy cache if any
      const currentHp = localStorage.getItem(STORAGE_KEYS.HOMEPAGE);
      if (currentHp && currentHp.includes("data:image")) {
        localStorage.removeItem(STORAGE_KEYS.HOMEPAGE);
      }
      localStorage.setItem(key, value);
    } catch {
      // Ignore fallback failures
    }
  }
};

// Safe JSON fetch helper to prevent "Unexpected token <" HTML parse errors
const safeFetchJson = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await res.json();
      return { ok: res.ok, status: res.status, data: json };
    }
    return { ok: false, status: res.status, message: `Server returned non-JSON response (${res.status})` };
  } catch (err) {
    return { ok: false, status: 0, message: err.message };
  }
};

// -------------------------------------------------------------
// DEFAULT DATA INITIALIZERS
// -------------------------------------------------------------

const getDefaultProjectsList = () => {
  const list = [];
  Object.keys(categorizedProjects).forEach((catId) => {
    categorizedProjects[catId].forEach((proj, idx) => {
      list.push({
        ...proj,
        slug: proj.id,
        categoryId: catId,
        displayOrder: idx + 1,
        isPublished: true,
      });
    });
  });
  return list;
};

const getDefaultCategories = () =>
  categoryData.map((cat, idx) => ({
    ...cat,
    slug: cat.id,
    displayOrder: idx + 1,
    isActive: true,
  }));

const getDefaultHomepageConfig = () => ({
  heroImage: "/images/hero-construction.jpg",
  sections: {
    showAbout: true,
    showPortfolio: true,
    showClients: true,
    showServices: true,
    showBlog: true,
    showContact: true,
  },
  about: {
    title: "Planned with purpose.",
    titleItalic: "Built to last.",
    lead: "JS Ram Construction is a Nagpur-based civil engineering firm specialising in hospitals, commercial complexes and high-rise residential towers.",
    description:
      "With a commitment to structural excellence and timely delivery, we bring together experienced engineering leadership, rigorous quality control and deep domain expertise across healthcare, commercial and residential construction.",
    pillars: [
      {
        label: "Engineering Excellence",
        text: "Precision-driven structural design and execution across complex building typologies.",
      },
      {
        label: "Timely Delivery",
        text: "Disciplined project management ensuring milestones are met without compromise.",
      },
      {
        label: "Quality Assurance",
        text: "Rigorous material testing and quality protocols at every construction phase.",
      },
    ],
  },
});

// Window event notifier for real-time reactivity
export const notifyDataUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("jsram_data_updated"));
  }
};

// -------------------------------------------------------------
// AUTHENTICATION UTILITIES
// -------------------------------------------------------------

export const getAuthToken = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (raw) {
      const data = JSON.parse(raw);
      return data?.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

export const getAuthenticatedUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (raw) {
      const data = JSON.parse(raw);
      return data?.user || null;
    }
  } catch {
    return null;
  }
  return null;
};

export const isUserAuthenticated = () => {
  return Boolean(getAuthToken());
};

export const loginAdmin = async (username, password) => {
  const cleanUsername = username.trim();

  // Try Backend API First
  const response = await safeFetchJson(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: cleanUsername, password }),
  });

  if (response.ok && response.data?.success && response.data?.token) {
    safeSetItem(
      STORAGE_KEYS.AUTH,
      JSON.stringify({
        isAuthenticated: true,
        user: response.data.user,
        token: response.data.token,
        timestamp: new Date().toISOString(),
      })
    );
    notifyDataUpdated();
    return { success: true, user: response.data.user };
  }

  // Fallback Dev Auth when backend unreachable
  if (
    (cleanUsername === "admin" || cleanUsername === "admin@jsramconstruction.com") &&
    password === "JSRam@2026"
  ) {
    const fallbackUser = {
      username: "admin",
      email: "admin@jsramconstruction.com",
      role: "Administrator",
    };
    const authState = {
      isAuthenticated: true,
      user: fallbackUser,
      token: `jsram_fallback_token_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    safeSetItem(STORAGE_KEYS.AUTH, JSON.stringify(authState));
    notifyDataUpdated();
    return { success: true, user: fallbackUser };
  }

  return {
    success: false,
    message: response.data?.message || "Invalid administrator credentials. Please check your username and password.",
  };
};

export const logoutAdmin = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  notifyDataUpdated();
};

// -------------------------------------------------------------
// HOMEPAGE HERO IMAGE
// -------------------------------------------------------------

export const getStoredHomepageConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOMEPAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up legacy base64 hero image if present
      if (typeof parsed.heroImage === "string" && parsed.heroImage.startsWith("data:image")) {
        parsed.heroImage = "/images/hero-construction.jpg";
        safeSetItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading homepage config:", err);
  }
  const defaults = getDefaultHomepageConfig();
  safeSetItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(defaults));
  return defaults;
};

export const fetchHomepageSettings = async () => {
  const result = await safeFetchJson(`${API_BASE}/api/homepage`);
  if (result.ok && result.data?.success && result.data?.data?.heroImage) {
    const current = getStoredHomepageConfig();
    const updated = { ...current, heroImage: result.data.data.heroImage };
    safeSetItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(updated));
    return updated;
  }
  return getStoredHomepageConfig();
};

export const updateHomepageHeroImage = async (fileOrUrl) => {
  const token = getAuthToken();

  try {
    let res;
    if (fileOrUrl instanceof File) {
      const formData = new FormData();
      formData.append("image", fileOrUrl);
      res = await safeFetchJson(`${API_BASE}/api/homepage/image`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
    } else if (typeof fileOrUrl === "string") {
      res = await safeFetchJson(`${API_BASE}/api/homepage/image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ heroImage: fileOrUrl }),
      });
    }

    if (res?.ok && res.data?.success && res.data?.data?.heroImage) {
      const heroUrl = res.data.data.heroImage;
      const current = getStoredHomepageConfig();
      const updated = { ...current, heroImage: heroUrl };
      safeSetItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(updated));
      notifyDataUpdated();
      return { success: true, heroImage: heroUrl };
    } else if (res && !res.ok) {
      console.warn("[Homepage API]", res.message || res.data?.message);
    }
  } catch (e) {
    console.warn("[Homepage API Upload] Error:", e.message);
  }

  // Fallback: Use string URL or temporary object URL. NEVER store base64 in localStorage!
  let heroImageUrl = "/images/hero-construction.jpg";
  if (typeof fileOrUrl === "string" && !fileOrUrl.startsWith("data:image")) {
    heroImageUrl = fileOrUrl;
  } else if (fileOrUrl instanceof File && typeof window !== "undefined") {
    heroImageUrl = URL.createObjectURL(fileOrUrl);
  }

  const current = getStoredHomepageConfig();
  const updated = { ...current, heroImage: heroImageUrl };
  safeSetItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(updated));
  notifyDataUpdated();
  return { success: true, heroImage: heroImageUrl };
};

// -------------------------------------------------------------
// CATEGORIES REPOSITORY & API
// -------------------------------------------------------------

export const getStoredCategories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading categories from storage:", err);
  }
  const defaults = getDefaultCategories();
  safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaults));
  return defaults;
};

export const fetchCategories = async (showAll = false) => {
  const result = await safeFetchJson(`${API_BASE}/api/categories${showAll ? "?all=true" : ""}`);
  if (result.ok && result.data?.success && Array.isArray(result.data?.data)) {
    safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(result.data.data));
    return result.data.data;
  }

  const local = getStoredCategories();
  return showAll ? local : local.filter((c) => c.isActive !== false);
};

export const saveCategory = async (categoryData, coverFile = null, isNewRecord = false) => {
  const token = getAuthToken();
  const catId = categoryData.slug || categoryData.id;
  const isNew = Boolean(isNewRecord || categoryData._isNew || !catId);

  // Try API first
  try {
    let res;
    const endpoint = !isNew && catId
      ? `${API_BASE}/api/categories/${catId}`
      : `${API_BASE}/api/categories`;
    const method = !isNew && catId ? "PUT" : "POST";

    if (coverFile instanceof File) {
      const formData = new FormData();
      Object.keys(categoryData).forEach((key) => {
        if (key !== "_isNew") {
          formData.append(key, categoryData[key]);
        }
      });
      formData.append("coverImage", coverFile);

      res = await safeFetchJson(endpoint, {
        method,
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
    } else {
      res = await safeFetchJson(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(categoryData),
      });
    }

    if (res?.ok && res.data?.success && res.data?.data) {
      await fetchCategories(true);
      notifyDataUpdated();
      return { success: true, data: res.data.data };
    } else if (res && !res.ok) {
      console.warn("[Categories API]", res.data?.message || res.message);
      return { success: false, message: res.data?.message || res.message || "Failed to save category." };
    }
  } catch (e) {
    console.warn("[Categories API] Persistence fallback:", e.message);
  }

  // Local fallback without Base64 storage
  const categories = getStoredCategories();
  let coverImage = categoryData.coverImage;
  if (coverFile instanceof File && typeof window !== "undefined") {
    coverImage = URL.createObjectURL(coverFile);
  }

  const updatedItem = {
    ...categoryData,
    slug: catId || `cat-${Date.now()}`,
    id: catId || `cat-${Date.now()}`,
    coverImage: coverImage || "/images/hero-construction.jpg",
    updatedAt: new Date().toISOString(),
  };

  const idx = categories.findIndex((c) => (c.slug || c.id) === updatedItem.slug);
  if (idx !== -1) {
    categories[idx] = { ...categories[idx], ...updatedItem };
  } else {
    categories.push(updatedItem);
  }

  safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  notifyDataUpdated();
  return { success: true, data: updatedItem };
};

export const deleteCategory = async (idOrSlug) => {
  const token = getAuthToken();

  // Deletion protection check
  const projects = getStoredProjects();
  const assigned = projects.filter(
    (p) => String(p.categoryId).toLowerCase() === String(idOrSlug).toLowerCase()
  );

  if (assigned.length > 0) {
    return {
      success: false,
      message: `Cannot delete category because ${assigned.length} project(s) are currently assigned to it. Please reassign or delete these projects first.`,
    };
  }

  // Try API call
  const res = await safeFetchJson(`${API_BASE}/api/categories/${idOrSlug}`, {
    method: "DELETE",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });

  if (res?.ok && res.data?.success === false) {
    return { success: false, message: res.data?.message };
  }

  // Local remove
  const categories = getStoredCategories();
  const filtered = categories.filter(
    (c) => String(c.slug || c.id) !== String(idOrSlug)
  );
  safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
  notifyDataUpdated();
  return { success: true };
};

// -------------------------------------------------------------
// PROJECTS REPOSITORY & API
// -------------------------------------------------------------

export const getStoredProjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading projects from storage:", err);
  }
  const defaults = getDefaultProjectsList();
  safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaults));
  return defaults;
};

export const fetchProjects = async (categorySlug = null, showAll = false) => {
  const params = new URLSearchParams();
  if (categorySlug) params.append("category", categorySlug);
  if (showAll) params.append("all", "true");

  const url = `${API_BASE}/api/projects${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await safeFetchJson(url);

  if (res.ok && res.data?.success && Array.isArray(res.data?.data)) {
    if (!categorySlug && showAll) {
      safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(res.data.data));
    }
    return res.data.data;
  }

  const all = getStoredProjects();
  return all
    .filter((p) => {
      const matchCat = categorySlug ? String(p.categoryId).toLowerCase() === String(categorySlug).toLowerCase() : true;
      const matchPub = showAll ? true : p.isPublished !== false && p.published !== false;
      return matchCat && matchPub;
    })
    .sort((a, b) => (a.displayOrder || a.order || 0) - (b.displayOrder || b.order || 0));
};

export const fetchProjectBySlug = async (slug) => {
  const res = await safeFetchJson(`${API_BASE}/api/projects/${slug}`);
  if (res.ok && res.data?.success && res.data?.data) {
    return res.data.data;
  }

  const projects = getStoredProjects();
  return (
    projects.find(
      (p) => String(p.slug || p.id).toLowerCase() === String(slug).toLowerCase()
    ) || null
  );
};

export const getProjectsByCategory = (categoryId) => {
  const projects = getStoredProjects();
  return projects
    .filter(
      (p) =>
        String(p.categoryId).toLowerCase() === String(categoryId).toLowerCase() &&
        p.isPublished !== false &&
        p.published !== false
    )
    .sort((a, b) => (a.displayOrder || a.order || 0) - (b.displayOrder || b.order || 0));
};

export const saveProject = async (projectData, files = [], isNewRecord = false) => {
  const token = getAuthToken();
  const projId = projectData.slug || projectData.id;
  const isCreation = Boolean(isNewRecord || projectData._isNew || !projId);

  // Clean progressImages: filter out any temporary blob: URLs before sending to backend
  const cleanProgressImages = Array.isArray(projectData.progressImages)
    ? projectData.progressImages.filter((img) => typeof img === "string" && !img.startsWith("blob:") && !img.startsWith("data:image"))
    : [];

  const endpoint = !isCreation && projId
    ? `${API_BASE}/api/projects/${projId}`
    : `${API_BASE}/api/projects`;
  const method = !isCreation && projId ? "PUT" : "POST";

  try {
    let res;
    if (files && files.length > 0) {
      const formData = new FormData();
      Object.keys(projectData).forEach((key) => {
        if (key === "progressImages") {
          formData.append(key, JSON.stringify(cleanProgressImages));
        } else if (key !== "_isNew") {
          formData.append(key, projectData[key]);
        }
      });
      files.forEach((file) => formData.append("images", file));

      res = await safeFetchJson(endpoint, {
        method,
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
    } else {
      res = await safeFetchJson(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...projectData,
          progressImages: cleanProgressImages,
        }),
      });
    }

    if (res?.ok && res.data?.success && res.data?.data) {
      await fetchProjects(null, true);
      notifyDataUpdated();
      return { success: true, data: res.data.data };
    } else if (res && !res.ok) {
      console.warn("[Projects API]", res.data?.message || res.message);
      return { success: false, message: res.data?.message || res.message || "Failed to save project." };
    }
  } catch (e) {
    console.warn("[Projects API] Local persistence fallback:", e.message);
  }

  // Local fallback without Base64 storage
  const projects = getStoredProjects();
  const slug = projId || `proj-${Date.now()}`;
  const updatedItem = {
    ...projectData,
    slug,
    id: slug,
    progressImages: cleanProgressImages,
    isPublished: projectData.isPublished !== undefined ? projectData.isPublished : true,
    published: projectData.isPublished !== undefined ? projectData.isPublished : true,
    updatedAt: new Date().toISOString(),
  };

  const idx = projects.findIndex((p) => String(p.slug || p.id) === String(slug));
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...updatedItem };
  } else {
    projects.push(updatedItem);
  }

  safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  notifyDataUpdated();
  return { success: true, data: updatedItem };
};

export const deleteProject = async (idOrSlug) => {
  const token = getAuthToken();

  const res = await safeFetchJson(`${API_BASE}/api/projects/${idOrSlug}`, {
    method: "DELETE",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });

  if (res?.ok && res.data?.success === false) {
    return { success: false, message: res.data?.message };
  }

  const projects = getStoredProjects();
  const filtered = projects.filter(
    (p) => String(p.slug || p.id) !== String(idOrSlug)
  );
  safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  notifyDataUpdated();
  return { success: true };
};

// Reset all data back to initial defaults
export const resetAllDataToDefaults = () => {
  const defaultProjects = getDefaultProjectsList();
  const defaultCategories = getDefaultCategories();
  const defaultHomepage = getDefaultHomepageConfig();

  safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaultProjects));
  safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  safeSetItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(defaultHomepage));

  notifyDataUpdated();
  return true;
};
