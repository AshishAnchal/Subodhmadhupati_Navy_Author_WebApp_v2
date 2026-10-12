import React, {useState} from 'react';
import {Anchor, Mail, Phone} from 'lucide-react';
import {useSite} from '../context.jsx';
import {api} from '../api.js';
import {useTitle} from '../util.jsx';

export default function Contact() {
  const {settings} = useSite();
  const [f, setF] = useState({name: '', email: '', message: '', website: ''});
  const [state, setState] = useState({busy: false, msg: '', ok: false});
  useTitle('Contact | Subodhmadhupati.sahityka');
  const set = k => e => setF({...f, [k]: e.target.value});
  async function send(e) {
    e.preventDefault(); setState({busy: true, msg: '', ok: false});
    try { await api.post('/api/contact', f); setState({busy: false, ok: true, msg: 'Thank you — your message has reached the author.'}); setF({name: '', email: '', message: '', website: ''}); }
    catch (err) { setState({busy: false, ok: false, msg: err.message}); }
  }
  return <section className="band dark contact-page">
    <div className="contact-intro">
      <Anchor size={29}/><div className="section-label">GET IN TOUCH</div>
      <h1 className="page-title">Every good story<br/>begins with <em>hello.</em></h1>
      <p>For book enquiries, literary events, interviews or a note about a line that stayed with you.</p>
      {settings?.email && <p className="contact-line"><Mail size={16}/> <a href={`mailto:${settings.email}`}>{settings.email}</a></p>}
      {settings?.phone && <p className="contact-line"><Phone size={16}/> {settings.phone}</p>}
    </div>
    <form className="contact-form" onSubmit={send}>
      <label>Your name<input required maxLength={100} value={f.name} onChange={set('name')}/></label>
      <label>Email<input required type="email" maxLength={200} value={f.email} onChange={set('email')}/></label>
      <label>Message<textarea required rows={6} maxLength={3000} value={f.message} onChange={set('message')}/></label>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} name="website"/>
      <button className="gold-btn" disabled={state.busy}>{state.busy ? 'Sending…' : 'Send message'}</button>
      {state.msg && <p className={state.ok ? 'notice' : 'notice err'} role="status">{state.msg}</p>}
    </form>
  </section>;
}
