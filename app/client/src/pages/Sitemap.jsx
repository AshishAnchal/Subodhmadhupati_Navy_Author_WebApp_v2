import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../api.js';
import {COLLECTIONS} from '../collections.js';
import {useTitle} from '../util.jsx';

export default function Sitemap() {
  const [posts, setPosts] = useState([]);
  useTitle('Site map | Subodhmadhupati');
  useEffect(() => { api.get('/api/posts').then(setPosts).catch(() => {}); }, []);
  const main = [['Home', '/'], ['Books', '/books'], ['Gallery', '/gallery'], ['About the author', '/about'], ['Contact', '/contact']];
  return <section className="band mid">
    <div className="section-label">SITE MAP</div>
    <h1 className="page-title">Find your way <em>around.</em></h1>
    <div className="sitemap">
      <div><h3>Main pages</h3><ul>{main.map(([n, to]) => <li key={to}><Link to={to}>{n}</Link></li>)}</ul></div>
      {COLLECTIONS.map(c => <div key={c.type}><h3><Link to={c.path}>{c.label}</Link></h3>
        <ul>{posts.filter(p => p.type === c.type).map(p => <li key={p.id}><Link to={`${c.path}/${p.slug}`}>{p.title}</Link></li>)}</ul></div>)}
    </div>
  </section>;
}
