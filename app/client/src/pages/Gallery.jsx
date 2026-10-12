import React, {useEffect, useState} from 'react';
import {X} from 'lucide-react';
import {api, imgUrl} from '../api.js';
import {useTitle} from '../util.jsx';

export default function Gallery() {
  const [items, setItems] = useState(null), [open, setOpen] = useState(null);
  useTitle('Gallery | Subodhmadhupati.sahityka');
  useEffect(() => { api.get('/api/gallery').then(setItems).catch(() => setItems([])); }, []);
  useEffect(() => {
    if (!open) return;
    const k = e => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [open]);
  return <section className="band dark">
    <div className="section-label">GALLERY & MOMENTS</div>
    <div className="section-heading"><h1 className="page-title">Between the sea<br/>and the <em>sentence.</em></h1><p>A glimpse into the world behind the words.</p></div>
    {items && items.length === 0 && <p className="muted">Photos will appear here soon.</p>}
    <div className="photo-grid">{(items || []).map(g => <figure key={g.id}>
      <button onClick={() => setOpen(g)} aria-label={`Enlarge: ${g.caption || 'photo'}`}><img src={imgUrl(g.image)} alt={g.caption || ''} loading="lazy"/></button>
      {g.caption && <figcaption>{g.caption.toUpperCase()}</figcaption>}</figure>)}</div>
    {open && <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
      <button className="icon-btn" aria-label="Close"><X/></button><img src={imgUrl(open.image)} alt={open.caption || ''}/>{open.caption && <p>{open.caption}</p>}</div>}
  </section>;
}
