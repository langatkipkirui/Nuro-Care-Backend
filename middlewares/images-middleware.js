const multer = require('multer');

// upload multiple images;
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const fileFilterforMultiple = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images allowed'), false);
};
const uploadMultiple = multer({
  storage,
  fileFilterforMultiple,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  uploadMultiple,
};
