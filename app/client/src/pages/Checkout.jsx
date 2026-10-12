import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft, Banknote, CheckCircle2, CreditCard, ShieldCheck} from 'lucide-react';
import {useSite} from '../context.jsx';
import {api, imgUrl} from '../api.js';
import {money, useTitle} from '../util.jsx';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];
const blank = {name: '', phone: '', email: '', address: '', city: '', state: '', pincode: ''};

export default function Checkout() {
  const {lines, cartTotal, clearCart, setQty, settings} = useSite();
  const [opts, setOpts] = useState(null), [method, setMethod] = useState('');
  const [c, setC] = useState(blank), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  useTitle('Checkout | Subodhmadhupati');
  useEffect(() => {
    api.get('/api/payments/options').then(o => { setOpts(o); setMethod(o.cod ? 'cod' : o.online ? 'online' : ''); }).catch(() => setOpts({online: false, cod: false, codFee: 0}));
  }, []);
  const set = k => e => setC({...c, [k]: e.target.value});
  const fee = method === 'cod' ? opts?.codFee || 0 : 0;
  const total = cartTotal + fee;
  const items = lines.map(l => ({bookId: l.bookId, quantity: l.quantity}));

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (method === 'cod') {
        const r = await api.post('/api/payments/cod', {items, customer: c});
        clearCart(); setDone({orderNo: r.orderNo, total: r.total, method: 'cod'});
      } else {
        const d = await api.post('/api/payments/create-order', {items, customer: c});
        const launch = () => new window.Razorpay({
          key: d.keyId, amount: d.amount, currency: d.currency, order_id: d.orderId, name: `${settings?.siteName}${settings?.brandSuffix}`,
          prefill: {name: c.name, contact: c.phone, email: c.email}, theme: {color: '#c6a467'},
          handler: async response => {
            try { const v = await api.post('/api/payments/verify', response); clearCart(); setDone({orderNo: v.orderNo, total: d.amount / 100, method: 'online'}); }
            catch (x) { setErr(x.message); }
          }
        }).open();
        if (window.Razorpay) launch();
        else { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = launch; s.onerror = () => setErr('Could not load secure checkout.'); document.body.appendChild(s); }
      }
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  if (done) return <section className="band light checkout-done">
    <CheckCircle2 size={48}/>
    <h1>Thank you for your order!</h1>
    <p>Your order number is <b>{done.orderNo}</b>.</p>
    <p>{done.method === 'cod' ? <>Please keep <b>{money(done.total)}</b> ready in cash when your book arrives.</> : 'Your payment has been verified.'} The author will contact you on <b>{c.phone || 'your phone number'}</b> to confirm delivery.</p>
    <Link className="navy-btn" to="/">Back to the website</Link>
  </section>;

  if (lines.length === 0) return <section className="band light checkout-done">
    <h1>Your cart is empty</h1><p>Add a book to your cart to continue.</p><Link className="navy-btn" to="/books">Browse books</Link>
  </section>;

  const noPay = opts && !opts.cod && !opts.online;
  return <section className="band light">
    <Link className="back dark-link" to="/books"><ArrowLeft size={15}/> Continue shopping</Link>
    <h1 className="page-title dark-text">Checkout</h1>
    <form className="checkout" onSubmit={submit}>
      <div className="co-main">
        <h2>Delivery details</h2>
        <div className="co-grid">
          <label>Full name<input required autoComplete="name" maxLength={100} value={c.name} onChange={set('name')}/></label>
          <label>Mobile number<input required inputMode="numeric" autoComplete="tel" placeholder="10-digit number" maxLength={14} value={c.phone} onChange={set('phone')}/></label>
          <label className="full">Email <small>(optional)</small><input type="email" autoComplete="email" maxLength={200} value={c.email} onChange={set('email')}/></label>
          <label className="full">Address<textarea required rows={3} autoComplete="street-address" placeholder="House no., street, area, landmark" maxLength={300} value={c.address} onChange={set('address')}/></label>
          <label>City<input required autoComplete="address-level2" maxLength={80} value={c.city} onChange={set('city')}/></label>
          <label>State<select required value={c.state} onChange={set('state')}><option value="">Select state</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>PIN code<input required inputMode="numeric" autoComplete="postal-code" maxLength={6} pattern="\d{6}" value={c.pincode} onChange={set('pincode')}/></label>
        </div>

        <h2>Payment method</h2>
        {!opts && <p className="muted-dark">Loading payment options…</p>}
        {noPay && <p className="co-error">No payment method is available right now. Please contact the author.</p>}
        {opts?.cod && <label className={method === 'cod' ? 'pay-opt on' : 'pay-opt'}>
          <input type="radio" name="pay" checked={method === 'cod'} onChange={() => setMethod('cod')}/>
          <Banknote size={22}/><span><b>Cash on Delivery</b><small>Pay in cash when your book arrives{opts.codFee > 0 ? ` · extra ${money(opts.codFee)} COD charge` : ''}.</small></span></label>}
        {opts?.online && <label className={method === 'online' ? 'pay-opt on' : 'pay-opt'}>
          <input type="radio" name="pay" checked={method === 'online'} onChange={() => setMethod('online')}/>
          <CreditCard size={22}/><span><b>Pay online</b><small>UPI, cards, net banking and wallets via Razorpay.</small></span></label>}
        {opts && !opts.online && opts.cod && <p className="muted-dark small">Online payment is not enabled yet.</p>}
      </div>

      <aside className="co-summary">
        <h2>Order summary</h2>
        {lines.map(({book, quantity}) => <div className="co-line" key={book.id}>
          <img src={imgUrl(book.cover)} alt=""/>
          <div><b>{book.title}</b><div className="qty-mini"><button type="button" onClick={() => setQty(book.id, quantity - 1)} aria-label="Decrease">−</button><span>{quantity}</span><button type="button" onClick={() => setQty(book.id, quantity + 1)} aria-label="Increase">+</button></div></div>
          <span>{money(book.price * quantity)}</span></div>)}
        <div className="co-row"><span>Subtotal</span><span>{money(cartTotal)}</span></div>
        {method === 'cod' && fee > 0 && <div className="co-row"><span>COD charge</span><span>{money(fee)}</span></div>}
        <div className="co-row total"><span>Total{method === 'cod' ? ' payable on delivery' : ''}</span><b>{money(total)}</b></div>
        {err && <p className="co-error" role="alert">{err}</p>}
        <button className="navy-btn wide" disabled={busy || !method}>{busy ? 'Please wait…' : method === 'cod' ? 'Place order (Cash on Delivery)' : `Pay ${money(total)}`}</button>
        <p className="payment-note"><ShieldCheck size={16}/> Prices are confirmed on the server when you order.</p>
      </aside>
    </form>
  </section>;
}
