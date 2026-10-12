import {store, uid} from './store.js';

const str = (v, max) => String(v ?? '').trim().slice(0, max);

export function settingsFor() {
  const s = store.get('settings');
  return {codEnabled: s.codEnabled !== false, codFee: Math.max(0, Number(s.codFee) || 0)};
}
// Prices always come from the server's book list, never from the browser.
export function buildLines(items) {
  const books = store.get('books');
  const lines = [];
  for (const it of (Array.isArray(items) ? items : []).slice(0, 10)) {
    const book = books.find(b => b.id === it.bookId && b.published), qty = Number(it.quantity);
    if (!book || !Number.isInteger(qty) || qty < 1 || qty > 10) throw new Error('Invalid book or quantity.');
    lines.push({bookId: book.id, title: book.title, quantity: qty, unitPrice: book.price});
  }
  if (!lines.length) throw new Error('Your cart is empty.');
  return lines;
}
export function cleanCustomer(c = {}) {
  const phone = String(c.phone || '').replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
  const out = {
    name: str(c.name, 100), phone, email: str(c.email, 200).toLowerCase(),
    address: str(c.address, 300), city: str(c.city, 80), state: str(c.state, 80), pincode: str(c.pincode, 6)
  };
  if (out.name.length < 2) throw new Error('Please enter your full name.');
  if (!/^[6-9]\d{9}$/.test(out.phone)) throw new Error('Please enter a valid 10-digit mobile number.');
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) throw new Error('Please enter a valid email address.');
  if (out.address.length < 6) throw new Error('Please enter your full delivery address.');
  if (!out.city) throw new Error('Please enter your city.');
  if (!out.state) throw new Error('Please enter your state.');
  if (!/^\d{6}$/.test(out.pincode)) throw new Error('Please enter a valid 6-digit PIN code.');
  return out;
}
export function totals(lines, method) {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const fee = method === 'cod' ? settingsFor().codFee : 0;
  return {subtotal, fee, total: subtotal + fee};
}
export function createOrder({lines, customer, method, extra = {}}) {
  const orders = store.get('orders');
  const no = 'SM-' + String(1001 + orders.length).padStart(4, '0');
  const t = totals(lines, method);
  const order = {
    id: uid(), orderNo: no, method, lines, customer, ...t,
    payment: method === 'cod' ? 'cod' : 'pending', status: 'new',
    createdAt: new Date().toISOString(), ...extra
  };
  orders.unshift(order); store.save();
  return order;
}
// Old orders (before COD existed) get sensible defaults when shown.
export function normalize(o) {
  return {
    ...o,
    method: o.method || 'online',
    payment: o.payment || (o.status === 'paid' ? 'paid' : 'pending'),
    status: ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(o.status) ? o.status : 'new',
    total: o.total ?? (o.amount ? o.amount / 100 : 0)
  };
}
// tiny in-memory limiter so nobody can flood the order list
const hits = new Map();
export function orderLimiter(req, res, next) {
  const now = Date.now(), rec = (hits.get(req.ip) || []).filter(t => now - t < 3600e3);
  if (rec.length >= 10) return res.status(429).json({message: 'Too many orders from this connection. Please try again later.'});
  rec.push(now); hits.set(req.ip, rec); next();
}
