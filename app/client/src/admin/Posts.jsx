import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {admin} from '../api.js';
import {byType} from '../collections.js';
import {Field, Flash, ImageField} from './ui.jsx';
import {fmtDate} from '../util.jsx';

export function PostList() {
  const {type} = useParams(), c = byType[type];
  const [list, setList] = useState(null), [msg, setMsg] = useState(null);
  const load = () => admin.get(`/posts?type=${type}`).then(setList).catch(e => setMsg({err: true, text: e.message}));
  useEffect(() => { setList(null); load(); }, [type]);
  if (!c) return <p>Unknown section.</p>;
  async function remove(p) {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    try { await admin.del(`/posts/${p.id}`); load(); } catch (e) { setMsg({err: true, text: e.message}); }
  }
  async function toggle(p) {
    try { await admin.put(`/posts/${p.id}`, {...p, published: !p.published}); load(); } catch (e) { setMsg({err: true, text: e.message}); }
  }
  return <>
    <div className="head"><h1>{c.label}</h1><Link className="btn primary" to={`/admin/posts/${type}/new`}>+ New {c.singular}</Link></div>
    <Flash msg={msg}/>
    {list && !list.length && <p className="empty">No {c.label.toLowerCase()} yet. Create your first one.</p>}
    {list && list.length > 0 && <table className="tbl"><thead><tr><th>Title</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>
      {list.map(p => <tr key={p.id}>
        <td><Link to={`/admin/posts/${type}/${p.id}`}><b>{p.title}</b></Link></td>
        <td>{fmtDate(p.date)}</td>
        <td><span className={p.published ? 'pill ok' : 'pill'}>{p.published ? 'Published' : 'Draft'}</span></td>
        <td className="acts">
          {p.published && <a href={`${c.path}/${p.slug}`} target="_blank" rel="noopener noreferrer">View</a>}
          <button onClick={() => toggle(p)}>{p.published ? 'Unpublish' : 'Publish'}</button>
          <Link to={`/admin/posts/${type}/${p.id}`}>Edit</Link>
          <button className="danger" onClick={() => remove(p)}>Delete</button></td></tr>)}
    </tbody></table>}
  </>;
}

const blank = type => ({type, title: '', slug: '', excerpt: '', body: '', cover: '', tags: '', published: true, date: new Date().toISOString().slice(0, 10)});

export function PostEditor() {
  const {type, id} = useParams(), c = byType[type], nav = useNavigate();
  const isNew = id === 'new';
  const [f, setF] = useState(isNew ? blank(type) : null), [msg, setMsg] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isNew) { setF(blank(type)); return; }
    admin.get(`/posts/${id}`).then(p => setF({...p, tags: p.tags.join(', '), date: p.date.slice(0, 10)})).catch(e => setMsg({err: true, text: e.message}));
  }, [id, type]);
  if (!c) return <p>Unknown section.</p>;
  if (!f) return <><Flash msg={msg}/><p>Loading…</p></>;
  const set = k => e => setF({...f, [k]: e.target.value});
  async function save(publish) {
    setBusy(true); setMsg(null);
    const payload = {...f, published: publish ?? f.published};
    try {
      const saved = isNew ? await admin.post('/posts', payload) : await admin.put(`/posts/${id}`, payload);
      setMsg({text: 'Saved.'});
      if (isNew) nav(`/admin/posts/${type}/${saved.id}`, {replace: true});
      else setF({...saved, tags: saved.tags.join(', '), date: saved.date.slice(0, 10)});
    } catch (e) { setMsg({err: true, text: e.message}); }
    setBusy(false);
  }
  return <>
    <div className="head"><h1>{isNew ? `New ${c.singular}` : `Edit ${c.singular}`}</h1><Link to={`/admin/posts/${type}`} className="btn">← Back to list</Link></div>
    <Flash msg={msg}/>
    <form className="form" onSubmit={e => { e.preventDefault(); save(); }}>
      <Field label="Title"><input required maxLength={200} value={f.title} onChange={set('title')}/></Field>
      <div className="two">
        <Field label="Date" hint="Future dates stay hidden until that day."><input type="date" value={f.date} onChange={set('date')}/></Field>
        <Field label="Tags" hint="Comma separated"><input value={f.tags} onChange={set('tags')}/></Field>
      </div>
      <Field label={type === 'poem' ? 'Poem' : 'Content'} hint={type === 'poem' ? 'Line breaks are kept exactly as you type them.' : 'Leave a blank line between paragraphs. Start a line with “## ” for a heading or “> ” for a quote.'}>
        <textarea required rows={type === 'poem' ? 14 : 18} value={f.body} onChange={set('body')} className={type === 'poem' ? '' : 'serif'}/></Field>
      <Field label="Short summary" hint="Shown on cards and in search. Leave empty to auto-create."><textarea rows={2} maxLength={400} value={f.excerpt} onChange={set('excerpt')}/></Field>
      <ImageField label="Cover image (optional)" value={f.cover} onChange={v => setF({...f, cover: v})}/>
      <Field label="Web address (slug)" hint="Leave empty to create from the title."><input value={f.slug} onChange={set('slug')}/></Field>
      <div className="row">
        <button className="btn primary" disabled={busy} type="button" onClick={() => save(true)}>{f.published && !isNew ? 'Save changes' : 'Publish'}</button>
        <button className="btn" disabled={busy} type="button" onClick={() => save(false)}>Save as draft</button>
      </div>
    </form>
  </>;
}
