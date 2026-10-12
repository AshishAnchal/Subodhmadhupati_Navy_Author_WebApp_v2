import React, {useEffect, useState} from 'react';
import {Route, Routes} from 'react-router-dom';
import {admin, getToken} from '../api.js';
import Login from './Login.jsx';
import Shell from './Shell.jsx';
import Dashboard from './Dashboard.jsx';
import {PostEditor, PostList} from './Posts.jsx';
import {BookEditor, BookList} from './Books.jsx';
import GalleryAdmin from './Gallery.jsx';
import SettingsAdmin from './Settings.jsx';
import {Messages, Orders, Subscribers} from './Inbox.jsx';
import './admin.css';

export default function AdminApp() {
  const [state, setState] = useState(getToken() ? 'checking' : 'out');
  useEffect(() => {
    document.title = 'Admin';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m);
    const out = () => setState('out'); window.addEventListener('admin-logout', out);
    if (getToken()) admin.get('/me').then(() => setState('in')).catch(() => setState('out'));
    return () => { m.remove(); window.removeEventListener('admin-logout', out); };
  }, []);
  if (state === 'checking') return <div className="login-wrap">Loading…</div>;
  if (state === 'out') return <Login onLogin={() => setState('in')}/>;
  return <Routes>
    <Route element={<Shell onLogout={() => setState('out')}/>}>
      <Route index element={<Dashboard/>}/>
      <Route path="posts/:type" element={<PostList/>}/>
      <Route path="posts/:type/:id" element={<PostEditor/>}/>
      <Route path="books" element={<BookList/>}/>
      <Route path="books/:id" element={<BookEditor/>}/>
      <Route path="gallery" element={<GalleryAdmin/>}/>
      <Route path="settings" element={<SettingsAdmin/>}/>
      <Route path="messages" element={<Messages/>}/>
      <Route path="subscribers" element={<Subscribers/>}/>
      <Route path="orders" element={<Orders/>}/>
      <Route path="*" element={<Dashboard/>}/>
    </Route>
  </Routes>;
}
