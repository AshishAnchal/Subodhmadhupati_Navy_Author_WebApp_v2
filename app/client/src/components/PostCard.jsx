import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight, Anchor} from 'lucide-react';
import {byType} from '../collections.js';
import {imgUrl} from '../api.js';
import {fmtDate} from '../util.jsx';

export default function PostCard({post, index}) {
  const c = byType[post.type];
  return <article className="blog-card">
    <Link to={`${c.path}/${post.slug}`} className="blog-art" style={post.cover ? {backgroundImage: `linear-gradient(rgba(6,24,47,.25),rgba(6,24,47,.55)),url(${imgUrl(post.cover)})`} : undefined} aria-label={post.title}>
      {!post.cover && <><span>{String((index ?? 0) + 1).padStart(2, '0')}</span><Anchor size={26}/></>}
    </Link>
    <div className="blog-body">
      <small>{c.label.toUpperCase()} · {fmtDate(post.date).toUpperCase()}</small>
      <h3><Link to={`${c.path}/${post.slug}`}>{post.title}</Link></h3>
      <p>{post.excerpt}</p>
      <Link className="read-link" to={`${c.path}/${post.slug}`}>{post.type === 'poem' ? 'Read the poem' : 'Read more'} <ArrowRight size={15}/></Link>
    </div>
  </article>;
}
