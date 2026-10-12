import {Router} from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import {store} from '../lib/store.js';
import {buildLines, cleanCustomer, createOrder, orderLimiter, settingsFor, totals} from '../lib/orders.js';

export const paymentsRouter = Router();
function config() {
  const id = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret || id.includes('replace_me') || secret.includes('replace_with')) return null;
  return {client: new Razorpay({key_id: id, key_secret: secret}), id, secret};
}

// Which payment options are available right now (for the checkout page)
paymentsRouter.get('/options', (req, res) => res.json({online: Boolean(config()), cod: settingsFor().codEnabled, codFee: settingsFor().codFee}));

// Cash on delivery
paymentsRouter.post('/cod', orderLimiter, (req, res) => {
  try {
    if (!settingsFor().codEnabled) return res.status(400).json({message: 'Cash on delivery is not available right now.'});
    const lines = buildLines(req.body?.items), customer = cleanCustomer(req.body?.customer);
    const order = createOrder({lines, customer, method: 'cod'});
    res.status(201).json({orderNo: order.orderNo, total: order.total, fee: order.fee});
  } catch (e) { res.status(400).json({message: e.message}); }
});

// Online payment (Razorpay)
paymentsRouter.post('/create-order', orderLimiter, async (req, res) => {
  let lines, customer;
  try { lines = buildLines(req.body?.items); customer = cleanCustomer(req.body?.customer); }
  catch (e) { return res.status(400).json({message: e.message}); }
  const cfg = config();
  if (!cfg) return res.status(503).json({message: 'Online payment is not set up yet. Please choose Cash on Delivery or contact the author.'});
  try {
    const {total} = totals(lines, 'online');
    const order = await cfg.client.orders.create({amount: Math.round(total * 100), currency: 'INR', receipt: `book_${Date.now()}`});
    createOrder({lines, customer, method: 'online', extra: {razorpayOrderId: order.id}});
    res.json({orderId: order.id, amount: order.amount, currency: order.currency, keyId: cfg.id});
  } catch (err) {
    console.error('Razorpay create order failed:', err.message);
    res.status(502).json({message: 'Could not create a payment order. Please try again.'});
  }
});

paymentsRouter.post('/verify', (req, res) => {
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body || {};
  const cfg = config();
  if (!cfg) return res.status(503).json({message: 'Payment verification is not configured.'});
  const order = store.get('orders').find(o => o.razorpayOrderId === razorpay_order_id);
  if (!order || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({message: 'Payment details are incomplete or the order is unknown.'});
  const expected = crypto.createHmac('sha256', cfg.secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  const a = Buffer.from(expected), b = Buffer.from(String(razorpay_signature));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({message: 'Payment signature could not be verified.'});
  Object.assign(order, {payment: 'paid', paymentId: razorpay_payment_id, paidAt: new Date().toISOString()});
  store.save();
  res.json({verified: true, orderNo: order.orderNo});
});
