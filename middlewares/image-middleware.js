const multer = require('multer');

// upload single images
// set up our memory storage
const storage = multer.memoryStorage();
const uploadSingle = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only images allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = { uploadSingle };
