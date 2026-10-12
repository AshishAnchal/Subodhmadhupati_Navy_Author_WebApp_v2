import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {admin, imgUrl} from '../api.js';
import {Field, Flash, ImageField} from './ui.jsx';
import {money} from '../util.jsx';

export function BookList() {
  const [list, setList] = useState(null), [msg, setMsg] = useState(null);
  const load = () => admin.get('/books').then(setList).catch(e => setMsg({err: true, text: e.message}));
  useEffect(() => { load(); }, []);
  async function remove(b) {
    if (!window.confirm(`Delete “${b.title}”?`)) return;
    try { await admin.del(`/books/${b.id}`); load(); } catch (e) { setMsg({err: true, text: e.message}); }
  }
  return <>
    <div className="head"><h1>Books</h1><Link className="btn primary" to="/admin/books/new">+ Add book</Link></div>
    <Flash msg={msg}/>
    {list && <table className="tbl"><thead><tr><th></th><th>Title</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>
      {list.map(b => <tr key={b.id}>
        <td style={{width: 54}}>{b.cover && <img className="mini" src={imgUrl(b.cover)} alt=""/>}</td>
        <td><Link to={`/admin/books/${b.id}`}><b>{b.title}</b></Link></td><td>{money(b.price)}</td>
        <td><span className={b.published ? 'pill ok' : 'pill'}>{b.published ? 'Visible' : 'Hidden'}</span></td>
        <td className="acts"><Link to={`/admin/books/${b.id}`}>Edit</Link><button className="danger" onClick={() => remove(b)}>Delete</button></td></tr>)}
    </tbody></table>}
  </>;
}

const blank = {title: '', englishTitle: '', subtitle: '', description: '', price: '', format: 'Paperback', language: 'Hindi', genre: '', cover: '', published: true};
export function BookEditor() {
  const {id} = useParams(), nav = useNavigate(), isNew = id === 'new';
  const [f, setF] = useState(isNew ? blank : null), [msg, setMsg] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { if (!isNew) admin.get(`/books/${id}`).then(setF).catch(e => setMsg({err: true, text: e.message})); }, [id]);
  if (!f) return <><Flash msg={msg}/><p>Loading…</p></>;
  const set = k => e => setF({...f, [k]: e.target.value});
  async function save(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      const saved = isNew ? await admin.post('/books', f) : await admin.put(`/books/${id}`, f);
      setMsg({text: 'Saved.'}); isNew ? nav(`/admin/books/${saved.id}`, {replace: true}) : setF(saved);
    } catch (x) { setMsg({err: true, text: x.message}); }
    setBusy(false);
  }
  return <>
    <div className="head"><h1>{isNew ? 'Add book' : 'Edit book'}</h1><Link className="btn" to="/admin/books">← Back</Link></div>
    <Flash msg={msg}/>
    <form className="form" onSubmit={save}>
      <div className="two"><Field label="Title"><input required value={f.title} onChange={set('title')}/></Field><Field label="Title in English letters"><input value={f.englishTitle} onChange={set('englishTitle')}/></Field></div>
      <Field label="Subtitle"><input value={f.subtitle} onChange={set('subtitle')}/></Field>
      <Field label="Description"><textarea rows={6} value={f.description} onChange={set('description')}/></Field>
      <div className="two"><Field label="Price (₹)" hint="This is the price customers are charged."><input required type="number" min="0" step="1" value={f.price} onChange={set('price')}/></Field><Field label="Format"><input value={f.format} onChange={set('format')}/></Field></div>
      <div className="two"><Field label="Language"><input value={f.language} onChange={set('language')}/></Field><Field label="Genre"><input value={f.genre} onChange={set('genre')}/></Field></div>
      <ImageField label="Cover image" value={f.cover} onChange={v => setF({...f, cover: v})}/>
      <label className="check"><input type="checkbox" checked={f.published} onChange={e => setF({...f, published: e.target.checked})}/> Visible on website and available to buy</label>
      <div className="row"><button className="btn primary" disabled={busy}>Save book</button></div>
    </form>
  </>;
}
