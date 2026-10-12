import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {api} from './api.js';

const Ctx = createContext(null);
export const useSite = () => useContext(Ctx);
const CART_KEY = 'cart_v2';
const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };

export function SiteProvider({children}) {
  const [settings, setSettings] = useState(null);
  const [counts, setCounts] = useState({});
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(readCart);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    api.get('/api/site').then(d => { setSettings(d.settings); setCounts(d.counts); }).catch(e => setError(e.message));
    api.get('/api/books').then(setBooks).catch(() => {});
  }, []);
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ } }, [cart]);

  const value = useMemo(() => {
    const lines = cart.map(c => ({...c, book: books.find(b => b.id === c.bookId)})).filter(l => l.book);
    return {
      settings, counts, books, error, cartOpen, setCartOpen, lines,
      cartCount: lines.reduce((s, l) => s + l.quantity, 0),
      cartTotal: lines.reduce((s, l) => s + l.quantity * l.book.price, 0),
      addToCart: (bookId, open = true) => {
        setCart(c => c.some(x => x.bookId === bookId) ? c.map(x => x.bookId === bookId ? {...x, quantity: Math.min(10, x.quantity + 1)} : x) : [...c, {bookId, quantity: 1}]);
        if (open) setCartOpen(true);
      },
      setQty: (bookId, q) => setCart(c => q < 1 ? c.filter(x => x.bookId !== bookId) : c.map(x => x.bookId === bookId ? {...x, quantity: Math.min(10, q)} : x)),
      clearCart: () => setCart([])
    };
  }, [settings, counts, books, error, cart, cartOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
