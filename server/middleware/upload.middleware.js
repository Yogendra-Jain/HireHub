const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hirehub-resumes",
    resource_type: "raw",
  },
});

const upload = multer({
  storage,
});

module.exports = upload;