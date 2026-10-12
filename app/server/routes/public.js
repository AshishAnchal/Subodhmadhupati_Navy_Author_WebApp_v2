import {Router} from 'express';
import {store, uid} from '../lib/store.js';
import {POST_TYPES} from '../lib/validate.js';

export const publicRouter = Router();
const live = p => p.published && new Date(p.date) <= new Date(Date.now() + 864e5);
const card = ({body, ...rest}) => rest; // listings don't ship full bodies
const email = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

publicRouter.get('/site', (req, res) => {
  const posts = store.get('posts').filter(live);
  const counts = Object.fromEntries(POST_TYPES.map(t => [t, posts.filter(p => p.type === t).length]));
  res.json({settings: store.get('settings'), counts});
});
publicRouter.get('/books', (req, res) => res.json(store.get('books').filter(b => b.published)));
publicRouter.get('/gallery', (req, res) => res.json([...store.get('gallery')].sort((a, b) => a.order - b.order)));

publicRouter.get('/posts', (req, res) => {
  const {type} = req.query;
  const limit = Math.min(Number(req.query.limit) || 100, 100);
  let list = store.get('posts').filter(live);
  if (type) list = list.filter(p => p.type === type);
  list.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(list.slice(0, limit).map(card));
});
publicRouter.get('/posts/:type/:slug', (req, res) => {
  const list = store.get('posts').filter(live).sort((a, b) => new Date(b.date) - new Date(a.date));
  const i = list.findIndex(p => p.type === req.params.type && p.slug === req.params.slug);
  if (i < 0) return res.status(404).json({message: 'Not found.'});
  const same = list.filter(p => p.type === req.params.type);
  const j = same.findIndex(p => p.id === list[i].id);
  res.json({post: list[i], newer: same[j - 1] ? card(same[j - 1]) : null, older: same[j + 1] ? card(same[j + 1]) : null});
});

publicRouter.post('/newsletter', (req, res) => {
  const addr = String(req.body?.email || '').trim().toLowerCase().slice(0, 200);
  if (!email(addr)) return res.status(400).json({message: 'Please provide a valid email address.'});
  const subs = store.get('subscribers');
  if (!subs.some(s => s.email === addr)) { subs.push({id: uid(), email: addr, createdAt: new Date().toISOString()}); store.save(); }
  res.status(201).json({message: 'Subscribed'});
});
publicRouter.post('/contact', (req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim().slice(0, 100), addr = String(b.email || '').trim().slice(0, 200), message = String(b.message || '').trim().slice(0, 3000);
  if (!name || !email(addr) || message.length < 3) return res.status(400).json({message: 'Please fill in your name, a valid email and a message.'});
  if (b.website) return res.status(201).json({message: 'Sent'}); // honeypot: bots fill this
  store.get('messages').unshift({id: uid(), name, email: addr, message, read: false, createdAt: new Date().toISOString()});
  store.save();
  res.status(201).json({message: 'Sent'});
});
