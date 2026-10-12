import React, {useEffect, useState} from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {api} from '../api.js';
import {byPath} from '../collections.js';
import PostCard from '../components/PostCard.jsx';
import {useTitle} from '../util.jsx';

export default function Collection({section}) {
  const c = byPath[section];
  const [posts, setPosts] = useState(null), [err, setErr] = useState('');
  useTitle(`${c.label} | Subodhmadhupati.sahityka`);
  useEffect(() => { setPosts(null); api.get(`/api/posts?type=${c.type}`).then(setPosts).catch(e => setErr(e.message)); }, [c.type]);
  return <section className="band mid">
    <div className="section-label">{c.eyebrow}</div>
    <div className="section-heading"><h1 className="page-title">{c.title[0]}<br/><em>{c.title[1]}</em></h1><p>{c.intro}</p></div>
    {err && <p className="notice">{err}</p>}
    {posts && posts.length === 0 && <p className="muted">Nothing published here yet — please check back soon.</p>}
    <div className="blog-grid spaced">{(posts || []).map((p, i) => <PostCard key={p.id} post={p} index={i}/>)}</div>
  </section>;
}
