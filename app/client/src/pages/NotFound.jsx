import React from 'react';
import {Link} from 'react-router-dom';
import {useTitle} from '../util.jsx';

export default function NotFound() {
  useTitle('Page not found');
  return <section className="band dark" style={{textAlign: 'center', minHeight: 360}}>
    <div className="section-label">404</div><h1 className="page-title">Lost at sea.</h1>
    <p className="muted">We couldn’t find that page.</p><Link className="gold-btn" to="/">Back to the harbour</Link>
  </section>;
}
