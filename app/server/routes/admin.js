import {Router} from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {store} from '../lib/store.js';
import {adminConfigured, checkCredentials, signToken, requireAdmin, loginLimiter} from '../lib/auth.js';
import {cleanPost, cleanBook, cleanGallery, cleanSettings, POST_TYPES} from '../lib/validate.js';
import {upload, UPLOAD_DIR} from '../lib/upload.js';
import {normalize} from '../lib/orders.js';

export const adminRouter = Router();

adminRouter.post('/login', loginLimiter, (req, res) => {
  if (!adminConfigured()) return res.status(503).json({message: 'Admin is not configured. Set ADMIN_PASSWORD and SESSION_SECRET in server/.env and restart.'});
  const {username, password} = req.body || {};
  if (!checkCredentials(username, password)) { req.recordFailure(); return res.status(401).json({message: 'Incorrect username or password.'}); }
  res.json({token: signToken()});
});

adminRouter.use(requireAdmin);
adminRouter.get('/me', (req, res) => res.json({ok: true}));

adminRouter.get('/stats', (req, res) => {
  const posts = store.get('posts');
  res.json({
    posts: Object.fromEntries(POST_TYPES.map(t => [t, {total: posts.filter(p => p.type === t).length, drafts: posts.filter(p => p.type === t && !p.published).length}])),
    books: store.get('books').length, gallery: store.get('gallery').length,
    messages: store.get('messages').length, unread: store.get('messages').filter(m => !m.read).length,
    subscribers: store.get('subscribers').length,
    orders: store.get('orders').map(normalize).filter(o => o.payment === 'paid' || o.method === 'cod').length,
    newOrders: store.get('orders').map(normalize).filter(o => o.status === 'new' && (o.payment === 'paid' || o.method === 'cod')).length
  });
});

// ---- generic CRUD helper
function crud(name, clean, {filter} = {}) {
  const r = Router();
  r.get('/', (req, res) => {
    let list = store.get(name);
    if (filter) list = filter(list, req);
    res.json(list);
  });
  r.get('/:id', (req, res) => {
    const item = store.get(name).find(x => x.id === req.params.id);
    item ? res.json(item) : res.status(404).json({message: 'Not found.'});
  });
  r.post('/', (req, res) => {
    try {
      const all = store.get(name), item = clean(req.body || {}, null, all);
      all.unshift(item); store.save(); res.status(201).json(item);
    } catch (e) { res.status(400).json({message: e.message}); }
  });
  r.put('/:id', (req, res) => {
    const all = store.get(name), i = all.findIndex(x => x.id === req.params.id);
    if (i < 0) return res.status(404).json({message: 'Not found.'});
    try { all[i] = clean(req.body || {}, all[i], all); store.save(); res.json(all[i]); }
    catch (e) { res.status(400).json({message: e.message}); }
  });
  r.delete('/:id', (req, res) => {
    const all = store.get(name), i = all.findIndex(x => x.id === req.params.id);
    if (i < 0) return res.status(404).json({message: 'Not found.'});
    all.splice(i, 1); store.save(); res.json({ok: true});
  });
  return r;
}
adminRouter.use('/posts', crud('posts', cleanPost, {filter: (l, req) => (req.query.type ? l.filter(p => p.type === req.query.type) : l).slice().sort((a, b) => new Date(b.date) - new Date(a.date))}));
adminRouter.use('/books', crud('books', cleanBook));
adminRouter.use('/gallery', crud('gallery', cleanGallery));

adminRouter.get('/settings', (req, res) => res.json(store.get('settings')));
adminRouter.put('/settings', (req, res) => res.json(store.set('settings', cleanSettings(req.body || {}, store.get('settings')))));

// ---- inbox / subscribers / orders
adminRouter.get('/messages', (req, res) => res.json(store.get('messages')));
adminRouter.patch('/messages/:id', (req, res) => {
  const m = store.get('messages').find(x => x.id === req.params.id);
  if (!m) return res.status(404).json({message: 'Not found.'});
  m.read = Boolean(req.body?.read); store.save(); res.json(m);
});
adminRouter.delete('/messages/:id', (req, res) => {
  store.set('messages', store.get('messages').filter(x => x.id !== req.params.id)); res.json({ok: true});
});
adminRouter.get('/subscribers', (req, res) => res.json(store.get('subscribers')));
adminRouter.delete('/subscribers/:id', (req, res) => {
  store.set('subscribers', store.get('subscribers').filter(x => x.id !== req.params.id)); res.json({ok: true});
});
adminRouter.get('/orders', (req, res) => res.json(store.get('orders').map(normalize)));
adminRouter.patch('/orders/:id', (req, res) => {
  const o = store.get('orders').find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({message: 'Not found.'});
  const {status, payment} = req.body || {};
  if (status !== undefined) {
    if (!['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) return res.status(400).json({message: 'Invalid status.'});
    o.status = status;
  }
  // Online payments can only be marked paid by signature verification; COD cash can be marked collected by the admin.
  if (payment !== undefined) {
    if (o.method !== 'cod' || !['cod', 'paid'].includes(payment)) return res.status(400).json({message: 'Only cash-on-delivery orders can be changed manually.'});
    o.payment = payment;
  }
  store.save(); res.json(normalize(o));
});
adminRouter.delete('/orders/:id', (req, res) => {
  store.set('orders', store.get('orders').filter(x => x.id !== req.params.id)); res.json({ok: true});
});

// ---- image uploads
adminRouter.post('/upload', (req, res, next) => upload.single('image')(req, res, err => {
  if (err) return next(err);
  if (!req.file) return res.status(400).json({message: 'No image received.'});
  res.status(201).json({url: `/uploads/${req.file.filename}`});
}));
adminRouter.get('/uploads', (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).filter(f => /\.(jpg|png|webp|gif)$/.test(f))
    .map(f => ({url: `/uploads/${f}`, time: fs.statSync(path.join(UPLOAD_DIR, f)).mtimeMs}))
    .sort((a, b) => b.time - a.time);
  res.json(files);
});
