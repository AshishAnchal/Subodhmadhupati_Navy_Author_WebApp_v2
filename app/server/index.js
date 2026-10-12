import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
dotenv.config();
import {publicRouter} from './routes/public.js';
import {adminRouter} from './routes/admin.js';
import {paymentsRouter} from './routes/payments.js';
import {UPLOAD_DIR} from './lib/upload.js';
import {adminConfigured} from './lib/auth.js';
import {seoRouter} from './routes/seo.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin'});
  next();
});
app.use(cors({origin: process.env.CLIENT_URL || 'http://localhost:5173'}));
app.use(express.json({limit: '1mb'}));
app.use('/uploads', express.static(UPLOAD_DIR, {maxAge: '7d', index: false}));

app.use(seoRouter);
app.get('/api/health', (req, res) => res.json({ok: true, adminConfigured: adminConfigured()}));
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api', publicRouter);

// Serve the built React site when present (single-server deployment)
const dist = path.join(here, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api|uploads|sitemap\.xml|robots\.txt).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({message: 'Image is too large (max 6 MB).'});
  if (err?.message?.startsWith('Only JPG')) return res.status(400).json({message: err.message});
  console.error(err);
  res.status(500).json({message: 'Unexpected server error.'});
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Author API listening on http://localhost:${port}`);
  if (!adminConfigured()) console.warn('\n⚠  Admin panel is DISABLED. Set ADMIN_PASSWORD and SESSION_SECRET in server/.env (not the "change_me" placeholders).\n');
});
