import {useEffect} from 'react';

export const fmtDate = d => new Date(d).toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'});
export const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
export function useTitle(title) {
  useEffect(() => { document.title = title; }, [title]);
}
// Safe, tiny formatter: blank line = paragraph, "## " = heading, "> " = quote. No HTML is ever injected.
export function Rich({text, poem}) {
  if (poem) return <div className="poem-text">{text}</div>;
  return <>{String(text || '').split(/\n{2,}/).map((block, i) => {
    const b = block.trim();
    if (!b) return null;
    if (b.startsWith('## ')) return <h3 key={i}>{b.slice(3)}</h3>;
    if (b.startsWith('> ')) return <blockquote key={i}>{b.slice(2)}</blockquote>;
    return <p key={i}>{b}</p>;
  })}</>;
}
