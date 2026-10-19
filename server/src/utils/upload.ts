import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppError } from './AppError';

export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${ext}`);
  },
});

const ALLOWED_MIMES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'video/mp4',
];

export const uploadDeliverable = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB cap
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        AppError.badRequest(
          `Unsupported file type: ${file.mimetype}. Allowed types: PNG, JPEG, PDF, MP4`
        )
      );
    }
  },
});
