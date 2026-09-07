const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `poster-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp|jfif|avif|bmp/;
  const extName = allowedExts.test(path.extname(file.originalname).toLowerCase());

  const isImageMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';

  if (extName && isImageMime) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG, JPEG, PNG, WEBP) yang diperbolehkan!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

module.exports = upload;