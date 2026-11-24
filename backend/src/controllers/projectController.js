const Project = require("../models/Project");
const Category = require("../models/Category");
const { uploadFileWithDetails, deleteFile } = require("../services/storageService");

const getAllProjects = async (req, res) => {
  try {
    const { category, all } = req.query;
    const filter = {};

    // Public only sees published projects unless admin query with all=true
    if (all !== "true") {
      filter.isPublished = true;
    }

    if (category) {
      filter.categoryId = category.toLowerCase().trim();
    }

    const projects = await Project.find(filter).sort({ displayOrder: 1, createdAt: -1 });

    const sanitizedProjects = projects.map((p) => {
      const pObj = p.toObject ? p.toObject() : { ...p };
      if (!pObj.image || pObj.image.startsWith("blob:") || pObj.image.startsWith("data:image")) {
        pObj.image = (pObj.progressImages && pObj.progressImages[0]) || "/images/hero-construction.jpg";
      }
      if (Array.isArray(pObj.progressImages)) {
        pObj.progressImages = pObj.progressImages.filter(
          (img) => typeof img === "string" && !img.startsWith("blob:") && !img.startsWith("data:image")
        );
      }
      return pObj;
    });

    return res.status(200).json({
      success: true,
      data: sanitizedProjects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects.",
      error: error.message,
    });
  }
};

const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({
      $or: [{ slug: slug.toLowerCase() }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project "${slug}" was not found.`,
      });
    }

    // If unpublished and not an admin request
    if (!project.isPublished && req.query.admin !== "true") {
      return res.status(404).json({
        success: false,
        message: `Project "${slug}" is currently unpublished.`,
      });
    }

    const pObj = project.toObject ? project.toObject() : { ...project };
    if (!pObj.image || pObj.image.startsWith("blob:") || pObj.image.startsWith("data:image")) {
      pObj.image = (pObj.progressImages && pObj.progressImages[0]) || "/images/hero-construction.jpg";
    }
    if (Array.isArray(pObj.progressImages)) {
      pObj.progressImages = pObj.progressImages.filter(
        (img) => typeof img === "string" && !img.startsWith("blob:") && !img.startsWith("data:image")
      );
    }

    return res.status(200).json({
      success: true,
      data: pObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project details.",
      error: error.message,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const {
      name,
      categoryId,
      location,
      client,
      configuration,
      floorPlate,
      additional,
      description,
      displayOrder,
      isPublished,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required.",
      });
    }

    if (!categoryId || !categoryId.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid category must be selected for the project.",
      });
    }

    // Verify category exists
    const category = await Category.findOne({ slug: categoryId.toLowerCase().trim() });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Category "${categoryId}" does not exist.`,
      });
    }

    let slug = req.body.slug
      ? req.body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

    const existingProject = await Project.findOne({ slug });
    if (existingProject) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    let coverImage = req.body.image ? req.body.image.trim() : "";
    let coverImagePublicId = null;
    let progressImages = [];
    let progressImageDetails = [];

    // Parse progressImages if passed as stringified JSON array
    if (req.body.progressImages) {
      try {
        progressImages = typeof req.body.progressImages === "string"
          ? JSON.parse(req.body.progressImages)
          : req.body.progressImages;
      } catch {
        progressImages = [];
      }
    }

    // Handle multer files if uploaded
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadFileWithDetails(file, "projects");
        progressImages.push(uploadResult.url);
        progressImageDetails.push({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        });

        // First uploaded image becomes cover if not yet assigned or if currently a placeholder/blob
        if (!coverImage || coverImage.startsWith("blob:") || coverImage === "/images/hero-construction.jpg") {
          coverImage = uploadResult.url;
          coverImagePublicId = uploadResult.publicId;
        }
      }
    }

    // Sanitize progressImages: remove blob: or data: strings
    progressImages = progressImages.filter((url) => typeof url === "string" && !url.startsWith("blob:") && !url.startsWith("data:image"));
    if (coverImage && (coverImage.startsWith("blob:") || coverImage.startsWith("data:image"))) {
      coverImage = progressImages[0] || "/images/hero-construction.jpg";
    }

    // If a specific cover image was designated from uploaded images
    if (req.body.image && progressImageDetails.length > 0) {
      const match = progressImageDetails.find((d) => d.url === req.body.image.trim());
      if (match && match.publicId) {
        coverImage = match.url;
        coverImagePublicId = match.publicId;
      }
    }

    const newProject = new Project({
      slug,
      name: name.trim(),
      categoryId: category.slug,
      categoryName: category.title,
      location: location ? location.trim() : "",
      client: client ? client.trim() : "",
      configuration: configuration ? configuration.trim() : "",
      floorPlate: floorPlate ? floorPlate.trim() : "",
      additional: additional ? additional.trim() : "",
      description: description ? description.trim() : "",
      image: coverImage,
      imagePublicId: coverImagePublicId,
      progressImages: Array.isArray(progressImages) ? progressImages : [],
      progressImageDetails: Array.isArray(progressImageDetails) ? progressImageDetails : [],
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      isPublished: isPublished !== undefined ? isPublished === true || isPublished === "true" : true,
    });

    await newProject.save();

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: newProject,
    });
  } catch (error) {
    console.error("[Create Project Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create project.",
      error: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      $or: [{ slug: id.toLowerCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const {
      name,
      categoryId,
      location,
      client,
      configuration,
      floorPlate,
      additional,
      description,
      image,
      displayOrder,
      isPublished,
    } = req.body;

    if (name) project.name = name.trim();
    if (location !== undefined) project.location = location.trim();
    if (client !== undefined) project.client = client.trim();
    if (configuration !== undefined) project.configuration = configuration.trim();
    if (floorPlate !== undefined) project.floorPlate = floorPlate.trim();
    if (additional !== undefined) project.additional = additional.trim();
    if (description !== undefined) project.description = description.trim();
    if (displayOrder !== undefined) project.displayOrder = Number(displayOrder);
    if (isPublished !== undefined) project.isPublished = isPublished === true || isPublished === "true";
    if (image !== undefined && image.trim()) {
      project.image = image.trim();
      const matched = project.progressImageDetails?.find((d) => d.url === image.trim());
      if (matched && matched.publicId) {
        project.imagePublicId = matched.publicId;
      }
    }

    if (categoryId && categoryId.toLowerCase().trim() !== project.categoryId) {
      const category = await Category.findOne({ slug: categoryId.toLowerCase().trim() });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Category "${categoryId}" not found.`,
        });
      }
      project.categoryId = category.slug;
      project.categoryName = category.title;
    }

    if (req.body.progressImages) {
      try {
        const parsed = typeof req.body.progressImages === "string"
          ? JSON.parse(req.body.progressImages)
          : req.body.progressImages;
        if (Array.isArray(parsed)) {
          project.progressImages = parsed;
        }
      } catch {
        // Keep existing
      }
    }

    // Handle newly uploaded files
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadFileWithDetails(file, "projects");
        project.progressImages.push(uploadResult.url);
        project.progressImageDetails.push({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        });
        if (!project.image || project.image.startsWith("blob:") || project.image === "/images/hero-construction.jpg") {
          project.image = uploadResult.url;
          project.imagePublicId = uploadResult.publicId;
        }
      }
    }

    // Sanitize progressImages
    project.progressImages = (project.progressImages || []).filter(
      (url) => typeof url === "string" && !url.startsWith("blob:") && !url.startsWith("data:image")
    );
    if (project.image && (project.image.startsWith("blob:") || project.image.startsWith("data:image"))) {
      project.image = project.progressImages[0] || "/images/hero-construction.jpg";
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    console.error("[Update Project Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update project.",
      error: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      $or: [{ slug: id.toLowerCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Delete Cloudinary assets safely
    if (project.imagePublicId || (project.image && project.image.includes("res.cloudinary.com"))) {
      deleteFile(project.imagePublicId || project.image).catch(() => {});
    }

    if (Array.isArray(project.progressImageDetails)) {
      for (const item of project.progressImageDetails) {
        if (item.publicId) {
          deleteFile(item.publicId).catch(() => {});
        }
      }
    }

    await Project.deleteOne({ _id: project._id });

    return res.status(200).json({
      success: true,
      message: `Project "${project.name}" was deleted successfully.`,
    });
  } catch (error) {
    console.error("[Delete Project Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project.",
      error: error.message,
    });
  }
};

// Dedicated endpoint to upload project images
const uploadProjectImages = async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided for upload.",
      });
    }

    const uploaded = [];
    for (const file of req.files) {
      const result = await uploadFileWithDetails(file, "projects");
      uploaded.push(result);
    }

    return res.status(200).json({
      success: true,
      message: `Uploaded ${uploaded.length} project image(s) successfully.`,
      data: uploaded,
      urls: uploaded.map((u) => u.url),
    });
  } catch (error) {
    console.error("[Upload Project Images Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload project images.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImages,
};
