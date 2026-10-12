import React, {useEffect, useState} from 'react';
import {Link, NavLink, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {Anchor, ArrowRight, Instagram, Linkedin, Mail, Menu, Minus, Plus, Search, ShieldCheck, ShoppingCart, Trash2, X, Youtube} from 'lucide-react';
import {useSite} from '../context.jsx';
import {api, imgUrl} from '../api.js';
import {money} from '../util.jsx';
import Breadcrumbs, {CrumbProvider} from './Breadcrumbs.jsx';

export const NAV = [
  ['Home', '/'], ['Books', '/books'], ['Journal', '/journal'], ['Blog', '/blog'],
  ['Stories', '/stories'], ['Poetry', '/poetry'], ['Gallery', '/gallery'], ['About', '/about'], ['Contact', '/contact']
];

function Brand() {
  const {settings} = useSite();
  return <Link className="brand" to="/">
    <span className="anchor-logo"><Anchor size={26}/></span>
    <span><b>{settings?.siteName || 'Subodhmadhupati'}<i>{settings?.brandSuffix}</i></b><small>STORIES · EMOTIONS · LIFE</small></span>
  </Link>;
}

function Header() {
  const {cartCount, setCartOpen} = useSite();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => { setMenu(false); setSearch(false); }, [loc.pathname]);
  const submit = e => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`); };
  return <>
    <header className="header">
      <Brand/>
      <nav className={menu ? 'nav open' : 'nav'} aria-label="Main">
        {NAV.map(([n, to]) => <NavLink key={to} to={to} end={to === '/'}>{n}</NavLink>)}
      </nav>
      <div className="actions">
        <button aria-label="Search" className="icon-btn" onClick={() => setSearch(s => !s)}><Search size={19}/></button>
        <button aria-label="Open cart" className="icon-btn cart-trigger" onClick={() => setCartOpen(true)}><ShoppingCart size={19}/>{cartCount > 0 && <i>{cartCount}</i>}</button>
        <button className="hamb" aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(m => !m)}>{menu ? <X/> : <Menu/>}</button>
      </div>
    </header>
    {search && <form className="searchbar" onSubmit={submit} role="search">
      <Search size={17}/><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search books, stories, poems and notes" aria-label="Search website"/><button>Search</button>
    </form>}
  </>;
}

export function Newsletter() {
  const [email, setEmail] = useState(''), [notice, setNotice] = useState('');
  async function subscribe(e) {
    e.preventDefault(); setNotice('');
    try { await api.post('/api/newsletter', {email}); setNotice('Thank you — you are on the reader list.'); setEmail(''); }
    catch (err) { setNotice(err.message); }
  }
  return <section className="newsletter">
    <div><div className="section-label">LETTERS FROM THE AUTHOR</div><h2>Stay close to<br/><em>the stories.</em></h2>
      <p>Updates on the book, new writing and moments worth remembering — delivered occasionally, never noisily.</p></div>
    <form onSubmit={subscribe}><label htmlFor="nl-email">YOUR EMAIL ADDRESS</label>
      <div className="email-field"><Mail size={17}/><input id="nl-email" type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/><button aria-label="Subscribe"><ArrowRight size={18}/></button></div>
      <small>By subscribing, you agree to receive occasional author updates.</small>
      {notice && <p className="notice" role="status">{notice}</p>}</form>
  </section>;
}

function Footer() {
  const {settings} = useSite();
  const social = [['instagram', Instagram], ['linkedin', Linkedin], ['youtube', Youtube]].filter(([k]) => settings?.[k]);
  return <footer className="footer">
    <div className="footer-main"><Brand/><p>Service in spirit. Stories at heart.</p>
      <div className="socials">{social.map(([k, Icon]) => <a key={k} href={settings[k]} target="_blank" rel="noopener noreferrer" aria-label={k}><Icon/></a>)}
        {settings?.email && <a href={`mailto:${settings.email}`} aria-label="Email"><Mail/></a>}</div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {settings?.siteName}{settings?.brandSuffix}. ALL RIGHTS RESERVED.</span>
      <div>{NAV.map(([n, to]) => <Link key={to} to={to}>{n}</Link>)}<Link to="/sitemap">Site map</Link></div></div>
  </footer>;
}

function CartDrawer() {
  const {cartOpen, setCartOpen, lines, cartTotal, cartCount, setQty} = useSite();
  useEffect(() => {
    if (!cartOpen) return;
    const k = e => e.key === 'Escape' && setCartOpen(false);
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [cartOpen, setCartOpen]);
  if (!cartOpen) return null;
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setCartOpen(false)}>
    <aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="drawer-head"><div><small>YOUR READING VOYAGE</small><h2>Your Cart <em>({cartCount})</em></h2></div>
        <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart"><X/></button></div>
      {lines.length === 0 && <p className="empty-cart">Your cart is empty.</p>}
      {lines.map(({book, quantity}) => <div className="cart-item" key={book.id}>
        <img src={imgUrl(book.cover)} alt=""/>
        <div><small>BOOK</small><h3>{book.title}</h3><p>{[book.format, book.language].filter(Boolean).join(' · ')}</p><b>{money(book.price)}</b>
          <div className="qty">
            <button onClick={() => setQty(book.id, quantity - 1)} aria-label="Decrease quantity"><Minus size={14}/></button><span>{quantity}</span>
            <button onClick={() => setQty(book.id, quantity + 1)} aria-label="Increase quantity"><Plus size={14}/></button>
            <button className="remove" onClick={() => setQty(book.id, 0)} aria-label="Remove from cart"><Trash2 size={14}/></button></div></div></div>)}
      {lines.length > 0 && <>
        <div className="cart-trust"><ShieldCheck size={18}/><span>Choose Cash on Delivery or pay online at checkout.</span></div>
        <div className="total"><span>Subtotal</span><b>{money(cartTotal)}</b></div>
        <Link className="navy-btn checkout-button" to="/checkout" onClick={() => setCartOpen(false)}>Proceed to checkout<ArrowRight size={16}/></Link></>}
    </aside>
  </div>;
}

export default function Layout() {
  const {pathname} = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <>
    <div className="topline"><span>✦ WORDS THAT SAIL BEYOND ✦</span><span>AN AUTHOR’S JOURNEY · A NAVAL SPIRIT</span></div>
    <CrumbProvider><Header/><Breadcrumbs/><main><Outlet/></main><Footer/><CartDrawer/></CrumbProvider>
  </>;
}
