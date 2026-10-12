import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {ChevronRight, Home} from 'lucide-react';
import {COLLECTIONS} from '../collections.js';

// Pages can set a custom last label (e.g. the title of a journal entry)
const CrumbCtx = createContext(() => {});
export const CrumbProvider = ({children}) => {
  const [label, setLabel] = useState({path: '', text: ''});
  const value = useMemo(() => ({label, setLabel}), [label]);
  return <CrumbCtx.Provider value={value}>{children}</CrumbCtx.Provider>;
};
export function useCrumbLabel(text) {
  const {setLabel} = useContext(CrumbCtx), {pathname} = useLocation();
  useEffect(() => { if (text) setLabel({path: pathname, text}); return () => setLabel({path: '', text: ''}); }, [text, pathname, setLabel]);
}

const NAMES = {books: 'Books', gallery: 'Gallery', about: 'About', contact: 'Contact', search: 'Search', checkout: 'Checkout', sitemap: 'Site map',
  ...Object.fromEntries(COLLECTIONS.map(c => [c.path.slice(1), c.label]))};

export default function Breadcrumbs() {
  const {pathname} = useLocation();
  const {label} = useContext(CrumbCtx);
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [{name: 'Home', to: '/'}];
  let path = '';
  parts.forEach((seg, i) => {
    path += '/' + seg;
    const name = i === 0 ? NAMES[seg] : (label.path === pathname && label.text) || seg.replace(/-/g, ' ');
    if (name) crumbs.push({name, to: path});
  });

  // structured data so search engines can show the trail in results
  const show = parts.length > 0 && NAMES[parts[0]];
  useEffect(() => {
    if (!show) return;
    const el = document.createElement('script'); el.type = 'application/ld+json';
    el.textContent = JSON.stringify({'@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({'@type': 'ListItem', position: i + 1, name: c.name, item: window.location.origin + c.to}))});
    document.head.appendChild(el); return () => el.remove();
  }, [show, pathname, label.text]);

  if (!show) return null;
  return <nav className="crumbs" aria-label="Breadcrumb"><ol>
    {crumbs.map((c, i) => {
      const last = i === crumbs.length - 1;
      return <li key={c.to}>
        {last ? <span aria-current="page">{c.name}</span> : <Link to={c.to}>{i === 0 && <Home size={13}/>}{c.name}</Link>}
        {!last && <ChevronRight size={13} aria-hidden="true"/>}
      </li>;
    })}
  </ol></nav>;
}
