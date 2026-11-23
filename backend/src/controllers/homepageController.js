const HomepageSettings = require("../models/HomepageSettings");
const { uploadFileWithDetails, deleteFile } = require("../services/storageService");

const getHomepage = async (req, res) => {
  try {
    const settings = await HomepageSettings.getSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve homepage settings.",
      error: error.message,
    });
  }
};

const updateHeroImage = async (req, res) => {
  try {
    let heroImageUrl = "";
    let heroImagePublicId = null;

    // If an image file was uploaded
    if (req.file) {
      const uploadResult = await uploadFileWithDetails(req.file, "homepage");
      heroImageUrl = uploadResult.url;
      heroImagePublicId = uploadResult.publicId;
    } else if (req.body.heroImage) {
      heroImageUrl = req.body.heroImage.trim();
    } else {
      return res.status(400).json({
        success: false,
        message: "No image file or heroImage URL was provided.",
      });
    }

    let settings = await HomepageSettings.findOne();
    if (!settings) {
      settings = new HomepageSettings({
        heroImage: heroImageUrl,
        heroImagePublicId,
      });
    } else {
      // Clean up previous Cloudinary asset if replacing
      const oldPublicId = settings.heroImagePublicId;
      const oldUrl = settings.heroImage;
      if (oldPublicId || (oldUrl && oldUrl.includes("res.cloudinary.com"))) {
        deleteFile(oldPublicId || oldUrl).catch((err) =>
          console.warn("[Storage Warning] Old hero image deletion:", err.message)
        );
      }

      settings.heroImage = heroImageUrl;
      settings.heroImagePublicId = heroImagePublicId;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Homepage hero background image updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("[Homepage Update Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update homepage hero image.",
      error: error.message,
    });
  }
};

module.exports = {
  getHomepage,
  updateHeroImage,
};
