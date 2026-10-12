import {slugify, uid} from './store.js';

export const POST_TYPES = ['journal', 'blog', 'story', 'poem'];
const str = (v, max) => String(v ?? '').trim().slice(0, max);
const url = v => {
  const s = str(v, 500);
  // only same-site paths or http(s) links - blocks javascript: etc.
  return s === '' || s.startsWith('/') && !s.startsWith('//') || /^https?:\/\//i.test(s) ? s : '';
};

export function cleanPost(input, existing, all) {
  const type = POST_TYPES.includes(input.type) ? input.type : existing?.type;
  if (!type) throw new Error('Invalid content type.');
  const title = str(input.title, 200);
  if (!title) throw new Error('Title is required.');
  const body = String(input.body ?? '').slice(0, 100000);
  let slug = slugify(input.slug || title);
  const taken = s => all.some(p => p.type === type && p.slug === s && p.id !== existing?.id);
  const base = slug; let n = 2;
  while (taken(slug)) slug = `${base}-${n++}`;
  const d = new Date(input.date);
  const now = new Date().toISOString();
  return {
    id: existing?.id || uid(), type, slug, title,
    excerpt: str(input.excerpt, 400) || body.replace(/[#>]/g, '').replace(/\s+/g, ' ').slice(0, 160),
    body, cover: url(input.cover),
    tags: (Array.isArray(input.tags) ? input.tags : String(input.tags || '').split(','))
      .map(t => str(t, 30)).filter(Boolean).slice(0, 8),
    published: Boolean(input.published),
    date: isNaN(d) ? (existing?.date || now) : d.toISOString(),
    createdAt: existing?.createdAt || now, updatedAt: now
  };
}

export function cleanBook(input, existing, all) {
  const title = str(input.title, 200);
  if (!title) throw new Error('Title is required.');
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0 || price > 100000) throw new Error('Enter a valid price.');
  let id = existing?.id || slugify(input.englishTitle || title);
  if (!existing) { const base = id; let n = 2; while (all.some(b => b.id === id)) id = `${base}-${n++}`; }
  return {
    id, title, englishTitle: str(input.englishTitle, 200), subtitle: str(input.subtitle, 300),
    description: str(input.description, 5000), price: Math.round(price * 100) / 100,
    format: str(input.format, 60), language: str(input.language, 60), genre: str(input.genre, 60),
    cover: url(input.cover), published: Boolean(input.published), createdAt: existing?.createdAt || new Date().toISOString()
  };
}

export function cleanGallery(input, existing) {
  const image = url(input.image);
  if (!image) throw new Error('An image is required.');
  return {id: existing?.id || uid(), image, caption: str(input.caption, 200), order: Number.isFinite(Number(input.order)) ? Number(input.order) : (existing?.order ?? 99)};
}

const SETTING_FIELDS = {
  siteName: 80, brandSuffix: 40, tagline: 120, heroEyebrow: 80, heroText: 500, heroQuote: 300,
  aboutTitle: 200, aboutText: 5000, email: 120, phone: 40, instagram: 300, linkedin: 300, youtube: 300
};
export function cleanSettings(input, existing) {
  const out = {...existing};
  for (const [k, max] of Object.entries(SETTING_FIELDS)) if (input[k] !== undefined) out[k] = str(input[k], max);
  if (input.codEnabled !== undefined) out.codEnabled = Boolean(input.codEnabled);
  if (input.codFee !== undefined) out.codFee = Math.min(5000, Math.max(0, Math.round(Number(input.codFee) || 0)));
  for (const k of ['heroImage', 'aboutImage']) if (input[k] !== undefined) out[k] = url(input[k]);
  for (const k of ['instagram', 'linkedin', 'youtube']) if (out[k] && !/^https?:\/\//i.test(out[k])) out[k] = '';
  return out;
}
