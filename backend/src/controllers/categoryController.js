const Category = require("../models/Category");
const Project = require("../models/Project");
const { uploadFileWithDetails, deleteFile } = require("../services/storageService");

const getAllCategories = async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    const filter = showAll ? {} : { isActive: true };

    const categories = await Category.find(filter).sort({ displayOrder: 1, createdAt: 1 });

    // Compute dynamic project count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const catObj = cat.toObject();
        const count = await Project.countDocuments({
          categoryId: cat.slug,
          isPublished: true,
        });
        catObj.projectCount = count;
        return catObj;
      })
    );

    return res.status(200).json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
      error: error.message,
    });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug: slug.toLowerCase() });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with identifier "${slug}" was not found.`,
      });
    }

    const catObj = category.toObject();
    catObj.projectCount = await Project.countDocuments({
      categoryId: category.slug,
      isPublished: true,
    });

    return res.status(200).json({
      success: true,
      data: catObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category details.",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { title, subtitle, description, badge, displayOrder, isActive } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category title is required.",
      });
    }

    let slug = req.body.slug
      ? req.body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

    const existingCat = await Category.findOne({ slug });
    if (existingCat) {
      return res.status(400).json({
        success: false,
        message: `A category with identifier "${slug}" already exists.`,
      });
    }

    let coverImage = "";
    let coverImagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadFileWithDetails(req.file, "categories");
      coverImage = uploadResult.url;
      coverImagePublicId = uploadResult.publicId;
    } else if (req.body.coverImage) {
      coverImage = req.body.coverImage.trim();
    } else {
      return res.status(400).json({
        success: false,
        message: "A category cover image is required.",
      });
    }

    const newCategory = new Category({
      slug,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      description: description ? description.trim() : "",
      badge: badge ? badge.trim() : title.trim(),
      coverImage,
      coverImagePublicId,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      isActive: isActive !== undefined ? isActive === true || isActive === "true" : true,
    });

    await newCategory.save();

    const result = newCategory.toObject();
    result.projectCount = 0;

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("[Create Category Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category.",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params; // slug or _id
    const category = await Category.findOne({
      $or: [{ slug: id.toLowerCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const { title, subtitle, description, badge, displayOrder, isActive } = req.body;

    if (title) category.title = title.trim();
    if (subtitle !== undefined) category.subtitle = subtitle.trim();
    if (description !== undefined) category.description = description.trim();
    if (badge !== undefined) category.badge = badge.trim();
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
    if (isActive !== undefined) category.isActive = isActive === true || isActive === "true";

    if (req.file) {
      const uploadResult = await uploadFileWithDetails(req.file, "categories");
      // Clean up previous image if it was on Cloudinary
      if (category.coverImagePublicId || (category.coverImage && category.coverImage.includes("res.cloudinary.com"))) {
        deleteFile(category.coverImagePublicId || category.coverImage).catch(() => {});
      }
      category.coverImage = uploadResult.url;
      category.coverImagePublicId = uploadResult.publicId;
    } else if (req.body.coverImage && req.body.coverImage.trim() !== category.coverImage) {
      category.coverImage = req.body.coverImage.trim();
      category.coverImagePublicId = null;
    }

    await category.save();

    if (title) {
      await Project.updateMany(
        { categoryId: category.slug },
        { categoryName: category.title }
      );
    }

    const catObj = category.toObject();
    catObj.projectCount = await Project.countDocuments({
      categoryId: category.slug,
      isPublished: true,
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: catObj,
    });
  } catch (error) {
    console.error("[Update Category Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category.",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [{ slug: id.toLowerCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // MANDATORY REQUIREMENT: Category deletion protection
    // Check if any projects belong to this category
    const assignedProjectsCount = await Project.countDocuments({
      categoryId: category.slug,
    });

    if (assignedProjectsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.title}" because ${assignedProjectsCount} project(s) are currently assigned to it. Please reassign or delete these projects first.`,
        assignedProjectsCount,
      });
    }

    // Clean up Cloudinary asset if appropriate
    if (category.coverImagePublicId || (category.coverImage && category.coverImage.includes("res.cloudinary.com"))) {
      deleteFile(category.coverImagePublicId || category.coverImage).catch(() => {});
    }

    await Category.deleteOne({ _id: category._id });

    return res.status(200).json({
      success: true,
      message: `Category "${category.title}" was deleted successfully.`,
    });
  } catch (error) {
    console.error("[Delete Category Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
