import multer from 'multer';
import { AppError } from '../utils/app-error.js';

// Use memory storage to avoid writing local files
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no permitido. Solo se aceptan imagenes png, jpeg, jpg o webp.', 400), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter,
});

export const uploadAvatarMiddleware = upload.single('avatar');
