const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/images';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Define file filters for image and logo
const imageFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const mimeType = fileTypes.test(file.mimetype);
  const extName = fileTypes.test(path.extname(file.originalname));
  if (mimeType && extName) {
    cb(null, true);
  } else {
    req.imageUploadError =
      'Invalid image file. Only JPEG, JPG, PNG, and GIF files are allowed.';
    cb(null, false);
  }
};

// Define a middleware to handle the image upload
const uploadImage = fields =>
  multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: imageFilter,
  }).fields(fields);

module.exports = { uploadImage };
