import React from 'react';
import {Link, useOutletContext} from 'react-router-dom';
import {COLLECTIONS} from '../collections.js';

export default function Dashboard() {
  const {stats} = useOutletContext();
  if (!stats) return <p>Loading…</p>;
  return <>
    <h1>Dashboard</h1>
    <p className="lede">Welcome back. Manage everything that appears on your website from here.</p>
    <div className="cards">
      {COLLECTIONS.map(c => <Link key={c.type} to={`/admin/posts/${c.type}`} className="card"><b>{stats.posts[c.type].total}</b><span>{c.label}</span>{stats.posts[c.type].drafts > 0 && <small>{stats.posts[c.type].drafts} draft(s)</small>}</Link>)}
      <Link to="/admin/books" className="card"><b>{stats.books}</b><span>Books</span></Link>
      <Link to="/admin/gallery" className="card"><b>{stats.gallery}</b><span>Photos</span></Link>
      <Link to="/admin/messages" className="card"><b>{stats.messages}</b><span>Messages</span>{stats.unread > 0 && <small>{stats.unread} unread</small>}</Link>
      <Link to="/admin/subscribers" className="card"><b>{stats.subscribers}</b><span>Subscribers</span></Link>
      <Link to="/admin/orders" className="card"><b>{stats.orders}</b><span>Paid orders</span></Link>
    </div>
    <h2>Quick actions</h2>
    <div className="row">{COLLECTIONS.map(c => <Link key={c.type} className="btn primary" to={`/admin/posts/${c.type}/new`}>+ New {c.singular}</Link>)}</div>
  </>;
}
