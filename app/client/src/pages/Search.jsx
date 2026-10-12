import React, {useEffect, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {api} from '../api.js';
import {byType} from '../collections.js';
import {useTitle} from '../util.jsx';

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim().toLowerCase();
  const [all, setAll] = useState(null);
  useTitle('Search | Subodhmadhupati.sahityka');
  useEffect(() => {
    Promise.all([api.get('/api/posts'), api.get('/api/books')]).then(([posts, books]) => setAll([
      ...books.map(b => ({key: 'b' + b.id, to: '/books', kind: 'Book', title: b.title, text: `${b.englishTitle} ${b.subtitle} ${b.description}`})),
      ...posts.map(p => ({key: p.id, to: `${byType[p.type].path}/${p.slug}`, kind: byType[p.type].label, title: p.title, text: `${p.excerpt} ${p.tags.join(' ')}`}))
    ])).catch(() => setAll([]));
  }, []);
  const results = (all || []).filter(r => q && `${r.title} ${r.text}`.toLowerCase().includes(q));
  return <section className="band mid">
    <div className="section-label">SEARCH</div>
    <h1 className="page-title">Results for “{params.get('q')}”</h1>
    {all && !results.length && <p className="muted">No matches found. Try a different word.</p>}
    <ul className="results">{results.map(r => <li key={r.key}><Link to={r.to}><small>{r.kind.toUpperCase()}</small><h3>{r.title}</h3></Link></li>)}</ul>
  </section>;
}
