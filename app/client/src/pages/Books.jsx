import React from 'react';
import {BookOpen, CheckCircle2, Feather, Globe, ShieldCheck, ShoppingCart} from 'lucide-react';
import {useSite} from '../context.jsx';
import {imgUrl} from '../api.js';
import {money, useTitle} from '../util.jsx';

export default function Books() {
  const {books, addToCart} = useSite();
  useTitle('Books | Subodhmadhupati.sahityka');
  return <section className="band light">
    <div className="section-label">THE BOOKSHELF</div>
    <h1 className="page-title dark-text">Books</h1>
    {books.length === 0 && <p className="muted-dark">Books will appear here soon.</p>}
    {books.map(book => <article className="book-layout" key={book.id} id={book.id}>
      <div className="cover-wrap"><div className="cover-halo"></div><img src={imgUrl(book.cover)} alt={`${book.title} cover`}/></div>
      <div className="book-details">
        <h2>{book.title}</h2>
        {book.englishTitle && <h4>{book.englishTitle}</h4>}
        <h3>{book.subtitle}</h3>
        <p>{book.description}</p>
        <div className="metadata">
          {book.format && <span><BookOpen/><b>{book.format}</b><small>Edition</small></span>}
          {book.language && <span><Globe/><b>{book.language}</b><small>Language</small></span>}
          {book.genre && <span><Feather/><b>{book.genre}</b><small>Genre</small></span>}
        </div>
        <div className="price">{money(book.price)}</div>
        <div className="purchase-row"><button className="navy-btn" onClick={() => addToCart(book.id)}><ShoppingCart size={17}/> Add to cart</button></div>
        <p className="payment-note"><ShieldCheck size={16}/> Secure Razorpay checkout.</p>
      </div>
      <div className="book-story"><h3>Why this book may speak to you</h3>
        {['A heartfelt collection shaped by lived experience', 'Words for readers who value emotion and reflection', 'A thoughtful gift for lovers of literature', 'A journey through the tides of everyday life'].map(t => <p key={t}><CheckCircle2 size={16}/>{t}</p>)}
      </div>
    </article>)}
  </section>;
}
