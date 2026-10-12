import React, {useEffect, useState} from 'react';
import {admin} from '../api.js';
import {Flash} from './ui.jsx';
import {money} from '../util.jsx';

const when = d => new Date(d).toLocaleString('en-IN', {dateStyle: 'medium', timeStyle: 'short'});

export function Messages() {
  const [list, setList] = useState(null), [msg, setMsg] = useState(null);
  const load = () => admin.get('/messages').then(setList).catch(e => setMsg({err: true, text: e.message}));
  useEffect(() => { load(); }, []);
  const mark = (m, read) => admin.patch(`/messages/${m.id}`, {read}).then(load);
  const remove = m => window.confirm('Delete this message?') && admin.del(`/messages/${m.id}`).then(load);
  return <>
    <h1>Messages</h1><Flash msg={msg}/>
    {list && !list.length && <p className="empty">No messages yet.</p>}
    {(list || []).map(m => <div key={m.id} className={m.read ? 'msg' : 'msg unread'}>
      <div className="msg-top"><b>{m.name}</b> <a href={`mailto:${m.email}`}>{m.email}</a><span>{when(m.createdAt)}</span></div>
      <p>{m.message}</p>
      <div className="acts"><a href={`mailto:${m.email}`}>Reply</a><button onClick={() => mark(m, !m.read)}>{m.read ? 'Mark unread' : 'Mark read'}</button><button className="danger" onClick={() => remove(m)}>Delete</button></div></div>)}
  </>;
}
export function Subscribers() {
  const [list, setList] = useState(null);
  const load = () => admin.get('/subscribers').then(setList);
  useEffect(() => { load(); }, []);
  function csv() {
    const blob = new Blob(['email,subscribed\n' + list.map(s => `${s.email},${s.createdAt}`).join('\n')], {type: 'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'subscribers.csv'; a.click(); URL.revokeObjectURL(a.href);
  }
  return <>
    <div className="head"><h1>Subscribers ({list?.length ?? 0})</h1>{list?.length > 0 && <button className="btn" onClick={csv}>Download CSV</button>}</div>
    {list && !list.length && <p className="empty">No subscribers yet.</p>}
    {list?.length > 0 && <table className="tbl"><thead><tr><th>Email</th><th>Joined</th><th></th></tr></thead><tbody>
      {list.map(s => <tr key={s.id}><td>{s.email}</td><td>{when(s.createdAt)}</td><td className="acts"><button className="danger" onClick={() => admin.del(`/subscribers/${s.id}`).then(load)}>Remove</button></td></tr>)}</tbody></table>}
  </>;
}
const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAY = {paid: 'Paid', cod: 'Cash due on delivery', pending: 'Awaiting payment'};
export function Orders() {
  const [list, setList] = useState(null), [msg, setMsg] = useState(null), [filter, setFilter] = useState('all');
  const load = () => admin.get('/orders').then(setList).catch(e => setMsg({err: true, text: e.message}));
  useEffect(() => { load(); }, []);
  const patch = (o, body) => admin.patch(`/orders/${o.id}`, body).then(load).catch(e => setMsg({err: true, text: e.message}));
  const remove = o => window.confirm(`Delete order ${o.orderNo || ''}?`) && admin.del(`/orders/${o.id}`).then(load);
  const shown = (list || []).filter(o => filter === 'all' ? true : filter === 'cod' ? o.method === 'cod' : filter === 'online' ? o.method === 'online' : o.status === filter);
  return <>
    <h1>Orders</h1><Flash msg={msg}/>
    <p className="lede">Cash on Delivery orders appear instantly. Online orders show <b>Awaiting payment</b> until the Razorpay payment is verified.</p>
    <div className="row" style={{marginBottom: 14}}>{['all', 'cod', 'online', ...STATUSES].map(f => <button key={f} className={filter === f ? 'btn primary' : 'btn'} onClick={() => setFilter(f)}>{f === 'cod' ? 'COD' : f[0].toUpperCase() + f.slice(1)}</button>)}</div>
    {list && !shown.length && <p className="empty">No orders here.</p>}
    {shown.map(o => <div className="order" key={o.id}>
      <div className="order-top"><b>{o.orderNo || 'Order'}</b>
        <span className={o.method === 'cod' ? 'pill cod' : 'pill'}>{o.method === 'cod' ? 'COD' : 'Online'}</span>
        <span className={o.payment === 'paid' ? 'pill ok' : 'pill'}>{PAY[o.payment]}</span>
        <span className="when">{when(o.createdAt)}</span></div>
      <div className="order-grid">
        <div><h4>Customer</h4>{o.customer ? <p><b>{o.customer.name}</b><br/><a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a>{o.customer.email && <><br/><a href={`mailto:${o.customer.email}`}>{o.customer.email}</a></>}<br/>{o.customer.address}<br/>{o.customer.city}, {o.customer.state} – {o.customer.pincode}</p> : <p className="muted-a">No details (older order)</p>}</div>
        <div><h4>Items</h4><p>{o.lines.map(l => <span key={l.bookId}>{l.title} × {l.quantity} — {money(l.unitPrice * l.quantity)}<br/></span>)}
          {o.fee > 0 && <span>COD charge — {money(o.fee)}<br/></span>}<b>Total: {money(o.total)}</b></p>
          {o.paymentId && <small className="muted-a">Payment ID: {o.paymentId}</small>}</div>
      </div>
      <div className="acts spread">
        <label>Status <select value={o.status} onChange={e => patch(o, {status: e.target.value})}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
        {o.method === 'cod' && o.payment !== 'paid' && <button onClick={() => patch(o, {payment: 'paid'})}>Mark cash collected</button>}
        {o.method === 'cod' && o.payment === 'paid' && <button onClick={() => patch(o, {payment: 'cod'})}>Undo cash collected</button>}
        <button className="danger" onClick={() => remove(o)}>Delete</button></div>
    </div>)}
  </>;
}
