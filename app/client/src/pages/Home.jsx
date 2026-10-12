import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Anchor, ArrowRight} from 'lucide-react';
import {useSite} from '../context.jsx';
import {api, imgUrl} from '../api.js';
import {COLLECTIONS} from '../collections.js';
import PostCard from '../components/PostCard.jsx';
import {Newsletter} from '../components/Layout.jsx';
import {money, useTitle} from '../util.jsx';

export default function Home() {
  const {settings, books, addToCart} = useSite();
  const [latest, setLatest] = useState([]);
  useTitle(`${settings?.siteName || 'Subodhmadhupati'}${settings?.brandSuffix || ''} | ${settings?.tagline || 'Stories. Emotions. Life.'}`);
  useEffect(() => { api.get('/api/posts?limit=3').then(setLatest).catch(() => {}); }, []);
  if (!settings) return <div className="page-loading">Loading…</div>;
  const book = books[0];
  const tag = settings.tagline.split('.').map(s => s.trim()).filter(Boolean);

  return <>
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="eyebrow"><span></span> {settings.heroEyebrow} <span></span></div>
          <h1>{settings.siteName}</h1>
          <h2>{tag.slice(0, -1).map(t => `${t}. `)}<em>{tag.at(-1)}.</em></h2>
          <p>{settings.heroText}</p>
          <Link className="gold-btn" to="/books">Explore the book <ArrowRight size={17}/></Link>
          <div className="hero-note"><Anchor size={17}/><span>DISCIPLINE OF THE SEA. FREEDOM OF THE WORD.</span></div>
        </div>
        <figure className="hero-portrait"><img src={imgUrl(settings.heroImage)} alt={`${settings.siteName} in naval officer uniform`}/></figure>
        <blockquote className="hero-quote"><span aria-hidden="true">“</span><p>{settings.heroQuote}</p><i>— {settings.siteName}{settings.brandSuffix}</i><Anchor size={22}/></blockquote>
      </div>
    </section>

    {book && <section className="band light home-book">
      <div className="home-book-cover"><img src={imgUrl(book.cover)} alt={`${book.title} cover`}/></div>
      <div>
        <div className="section-label gold">FEATURED BOOK</div>
        <h2>{book.title}</h2>
        <h3>{book.subtitle}</h3>
        <p>{book.description}</p>
        <div className="price">{money(book.price)}</div>
        <div className="purchase-row">
          <button className="navy-btn" onClick={() => addToCart(book.id)}>Add to cart</button>
          <Link className="outline-btn" to="/books">Book details <ArrowRight size={16}/></Link>
        </div>
      </div>
    </section>}

    <section className="band dark">
      <div className="section-label">EXPLORE THE WRITING</div>
      <div className="section-heading"><h2>Four ways to<br/>read <em>the sea.</em></h2><p>Journal, blog, stories and poetry — each has its own home.</p></div>
      <div className="tile-grid">
        {COLLECTIONS.map(c => <Link key={c.type} to={c.path} className="tile"><small>{c.eyebrow}</small><h3>{c.label}</h3><p>{c.intro}</p><span>Open <ArrowRight size={14}/></span></Link>)}
      </div>
    </section>

    {latest.length > 0 && <section className="band mid">
      <div className="section-label">LATEST FROM THE AUTHOR</div>
      <div className="blog-grid spaced">{latest.map((p, i) => <PostCard key={p.id} post={p} index={i}/>)}</div>
    </section>}

    <Newsletter/>
  </>;
}
