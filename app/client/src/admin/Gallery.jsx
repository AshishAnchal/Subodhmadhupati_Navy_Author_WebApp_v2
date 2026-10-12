import React, {useEffect, useState} from 'react';
import {admin, imgUrl} from '../api.js';
import {Field, Flash, ImageField} from './ui.jsx';

export default function GalleryAdmin() {
  const [list, setList] = useState(null), [msg, setMsg] = useState(null), [nf, setNf] = useState({image: '', caption: ''});
  const load = () => admin.get('/gallery').then(l => setList([...l].sort((a, b) => a.order - b.order))).catch(e => setMsg({err: true, text: e.message}));
  useEffect(() => { load(); }, []);
  async function add(e) {
    e.preventDefault();
    try { await admin.post('/gallery', {...nf, order: (list?.length || 0) + 1}); setNf({image: '', caption: ''}); setMsg({text: 'Photo added.'}); load(); }
    catch (x) { setMsg({err: true, text: x.message}); }
  }
  async function update(g, patch) { try { await admin.put(`/gallery/${g.id}`, {...g, ...patch}); load(); } catch (x) { setMsg({err: true, text: x.message}); } }
  async function remove(g) { if (window.confirm('Remove this photo?')) { try { await admin.del(`/gallery/${g.id}`); load(); } catch (x) { setMsg({err: true, text: x.message}); } } }
  async function move(g, dir) {
    const i = list.findIndex(x => x.id === g.id), o = list[i + dir]; if (!o) return;
    await Promise.all([admin.put(`/gallery/${g.id}`, {...g, order: o.order}), admin.put(`/gallery/${o.id}`, {...o, order: g.order})]);
    load();
  }
  return <>
    <h1>Gallery</h1><Flash msg={msg}/>
    <form className="form box" onSubmit={add}><h2>Add a photo</h2>
      <ImageField label="Photo" value={nf.image} onChange={v => setNf({...nf, image: v})}/>
      <Field label="Caption"><input value={nf.caption} onChange={e => setNf({...nf, caption: e.target.value})}/></Field>
      <div className="row"><button className="btn primary" disabled={!nf.image}>Add to gallery</button></div></form>
    <div className="gal-admin">{(list || []).map((g, i) => <div className="gal-item" key={g.id}>
      <img src={imgUrl(g.image)} alt=""/>
      <input defaultValue={g.caption} placeholder="Caption" onBlur={e => e.target.value !== g.caption && update(g, {caption: e.target.value})}/>
      <div className="acts"><button disabled={i === 0} onClick={() => move(g, -1)}>↑</button><button disabled={i === list.length - 1} onClick={() => move(g, 1)}>↓</button><button className="danger" onClick={() => remove(g)}>Delete</button></div></div>)}</div>
  </>;
}
