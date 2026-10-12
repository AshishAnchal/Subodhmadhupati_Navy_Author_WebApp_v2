import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(dir, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, {recursive: true});

const EXT = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif'};
export const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + EXT[file.mimetype])
  }),
  limits: {fileSize: 6 * 1024 * 1024, files: 1},
  fileFilter: (req, file, cb) => EXT[file.mimetype] ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed.'))
});
