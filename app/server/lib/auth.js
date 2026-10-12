import crypto from 'node:crypto';

const TTL = 1000 * 60 * 60 * 12; // 12h sessions
const b64 = b => Buffer.from(b).toString('base64url');
const eq = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
function secret() {
  const s = process.env.SESSION_SECRET;
  return s && !s.startsWith('change_me') ? s : null;
}
export function adminConfigured() {
  const p = process.env.ADMIN_PASSWORD;
  return Boolean(p && !p.startsWith('change_me') && secret());
}
export function checkCredentials(user, pass) {
  const u = process.env.ADMIN_USERNAME || 'admin';
  // evaluate both so timing doesn't reveal which was wrong
  const okU = eq(user, u), okP = eq(pass, process.env.ADMIN_PASSWORD || '');
  return okU && okP;
}
export function signToken() {
  const payload = b64(JSON.stringify({sub: 'admin', exp: Date.now() + TTL}));
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
export function verifyToken(token) {
  if (!secret() || typeof token !== 'string') return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  if (!eq(sig, expected)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); }
  catch { return false; }
}
export function requireAdmin(req, res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ') && verifyToken(h.slice(7))) return next();
  res.status(401).json({message: 'Please sign in to the admin panel.'});
}
// very small in-memory brute-force limiter
const attempts = new Map();
export function loginLimiter(req, res, next) {
  const key = req.ip, now = Date.now();
  const rec = (attempts.get(key) || []).filter(t => now - t < 15 * 60 * 1000);
  if (rec.length >= 8) return res.status(429).json({message: 'Too many attempts. Try again in 15 minutes.'});
  req.recordFailure = () => { rec.push(now); attempts.set(key, rec); };
  attempts.set(key, rec);
  next();
}
