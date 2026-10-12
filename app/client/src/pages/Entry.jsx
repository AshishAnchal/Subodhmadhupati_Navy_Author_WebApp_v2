import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import {api, imgUrl} from '../api.js';
import {byPath} from '../collections.js';
import {Rich, fmtDate, useTitle} from '../util.jsx';
import {useCrumbLabel} from '../components/Breadcrumbs.jsx';
import NotFound from './NotFound.jsx';

export default function Entry({section, slug}) {
  const c = byPath[section];
  const [data, setData] = useState(null), [missing, setMissing] = useState(false);
  useEffect(() => { setData(null); setMissing(false); api.get(`/api/posts/${c.type}/${slug}`).then(setData).catch(() => setMissing(true)); }, [c.type, slug]);
  useCrumbLabel(data?.post.title);
  useTitle(data ? `${data.post.title} | ${c.label}` : c.label);
  if (missing) return <NotFound/>;
  if (!data) return <div className="page-loading">Loading…</div>;
  const {post, newer, older} = data;
  return <article className="entry">
    <header>
      <div className="section-label">{c.label.toUpperCase()} · {fmtDate(post.date).toUpperCase()}</div>
      <h1>{post.title}</h1>
      {post.tags.length > 0 && <div className="tags">{post.tags.map(t => <span key={t}>#{t}</span>)}</div>}
    </header>
    {post.cover && <img className="entry-cover" src={imgUrl(post.cover)} alt=""/>}
    <div className={post.type === 'poem' ? 'entry-body poem' : 'entry-body'}><Rich text={post.body} poem={post.type === 'poem'}/></div>
    <nav className="entry-nav" aria-label="More entries">
      {older ? <Link to={`${c.path}/${older.slug}`}><small><ArrowLeft size={13}/> OLDER</small>{older.title}</Link> : <span/>}
      {newer ? <Link to={`${c.path}/${newer.slug}`} className="right"><small>NEWER <ArrowRight size={13}/></small>{newer.title}</Link> : <span/>}
    </nav>
  </article>;
}
