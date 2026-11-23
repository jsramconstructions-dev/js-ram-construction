const mongoose = require("mongoose");

const homepageSettingsSchema = new mongoose.Schema(
  {
    heroImage: {
      type: String,
      default: "/images/hero-construction.jpg",
      required: true,
    },
    heroImagePublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to get or create the singleton settings record
homepageSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      heroImage: "/images/hero-construction.jpg",
      heroImagePublicId: null,
    });
  }
  return settings;
};

module.exports = mongoose.model("HomepageSettings", homepageSettingsSchema);
