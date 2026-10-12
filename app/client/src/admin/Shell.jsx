import React, {useEffect, useState} from 'react';
import {Link, NavLink, Outlet, useNavigate} from 'react-router-dom';
import {Anchor, BookOpen, Image, LayoutDashboard, LogOut, Mail, Settings, ShoppingBag, Users, Feather, ScrollText, NotebookPen, BookText, ExternalLink} from 'lucide-react';
import {admin, setToken} from '../api.js';

const ICONS = {journal: NotebookPen, blog: ScrollText, story: BookText, poem: Feather};
export default function Shell({onLogout}) {
  const [stats, setStats] = useState(null);
  const nav = useNavigate();
  useEffect(() => { admin.get('/stats').then(setStats).catch(() => {}); const t = setInterval(() => admin.get('/stats').then(setStats).catch(() => {}), 30000); return () => clearInterval(t); }, []);
  const link = (to, Icon, text, badge) => <NavLink to={to} end={to === '/admin'} className="al"><Icon size={17}/><span>{text}</span>{badge > 0 && <i>{badge}</i>}</NavLink>;
  return <div className="admin">
    <aside className="admin-side">
      <Link to="/admin" className="admin-brand"><Anchor size={22}/> <span>Author Admin</span></Link>
      <nav>
        {link('/admin', LayoutDashboard, 'Dashboard')}
        <div className="grp">CONTENT</div>
        {[['journal', 'Journal'], ['blog', 'Blog'], ['story', 'Stories'], ['poem', 'Poetry']].map(([t, l]) => link(`/admin/posts/${t}`, ICONS[t], l, stats?.posts[t]?.drafts))}
        {link('/admin/books', BookOpen, 'Books')}
        {link('/admin/gallery', Image, 'Gallery')}
        <div className="grp">AUDIENCE</div>
        {link('/admin/messages', Mail, 'Messages', stats?.unread)}
        {link('/admin/subscribers', Users, 'Subscribers')}
        {link('/admin/orders', ShoppingBag, 'Orders', stats?.newOrders)}
        <div className="grp">SITE</div>
        {link('/admin/settings', Settings, 'Site settings')}
      </nav>
      <div className="side-foot">
        <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> View website</a>
        <button onClick={() => { setToken(null); onLogout(); nav('/admin'); }}><LogOut size={15}/> Sign out</button>
      </div>
    </aside>
    <main className="admin-main"><Outlet context={{stats}}/></main>
  </div>;
}
