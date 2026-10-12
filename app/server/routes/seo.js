import {Router} from 'express';
import {store} from '../lib/store.js';
import {POST_TYPES} from '../lib/validate.js';

export const seoRouter = Router();
const PATHS = {journal: 'journal', blog: 'blog', story: 'stories', poem: 'poetry'};
const esc = s => String(s).replace(/[<>&'"]/g, c => ({'<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'}[c]));
const base = req => (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
const day = d => new Date(d).toISOString().slice(0, 10);

seoRouter.get('/sitemap.xml', (req, res) => {
  const b = base(req);
  const posts = store.get('posts').filter(p => p.published && new Date(p.date) <= new Date());
  const latest = type => posts.filter(p => p.type === type).map(p => p.updatedAt || p.date).sort().pop();
  const urls = [
    {loc: '/', priority: '1.0', changefreq: 'weekly'},
    {loc: '/books', priority: '0.9', changefreq: 'monthly'},
    ...POST_TYPES.map(t => ({loc: `/${PATHS[t]}`, priority: '0.8', changefreq: 'weekly', lastmod: latest(t)})),
    {loc: '/gallery', priority: '0.6', changefreq: 'monthly'},
    {loc: '/about', priority: '0.7', changefreq: 'yearly'},
    {loc: '/contact', priority: '0.5', changefreq: 'yearly'},
    ...posts.map(p => ({loc: `/${PATHS[p.type]}/${p.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: p.updatedAt || p.date}))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${esc(b + encodeURI(u.loc))}</loc>${u.lastmod ? `<lastmod>${day(u.lastmod)}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n') +
    '\n</urlset>\n';
  res.type('application/xml').send(xml);
});

seoRouter.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base(req)}/sitemap.xml\n`);
});
