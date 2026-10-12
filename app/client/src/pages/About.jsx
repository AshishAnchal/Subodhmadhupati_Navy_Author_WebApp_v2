import React from 'react';
import {Anchor} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useSite} from '../context.jsx';
import {imgUrl} from '../api.js';
import {useTitle} from '../util.jsx';

export default function About() {
  const {settings} = useSite();
  useTitle('About | Subodhmadhupati.sahityka');
  if (!settings) return <div className="page-loading">Loading…</div>;
  return <section className="about-section">
    <div className="about-photo"><img src={imgUrl(settings.aboutImage)} alt="Author portrait"/></div>
    <div className="about-copy">
      <div className="section-label">ABOUT THE AUTHOR</div>
      <h1>{settings.aboutTitle}</h1>
      {settings.aboutText.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
      <div className="signature"><Anchor size={24}/><span>{settings.siteName}{settings.brandSuffix}<small>{settings.tagline}</small></span></div>
      <Link className="gold-btn" to="/contact" style={{marginTop: 26}}>Get in touch</Link>
    </div>
  </section>;
}
