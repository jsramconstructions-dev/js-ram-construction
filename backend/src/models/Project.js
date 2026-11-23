const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    categoryName: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    configuration: {
      type: String,
      required: true,
      trim: true,
    },
    floorPlate: {
      type: String,
      required: true,
      trim: true,
    },
    additional: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: true,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    progressImages: {
      type: [String],
      default: [],
    },
    progressImageDetails: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
      },
    ],
    displayOrder: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual id matching slug for frontend compatibility
projectSchema.virtual("id").get(function () {
  return this.slug;
});

module.exports = mongoose.model("Project", projectSchema);
