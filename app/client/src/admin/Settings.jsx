import React, {useEffect, useState} from 'react';
import {admin} from '../api.js';
import {Field, Flash, ImageField} from './ui.jsx';

export default function SettingsAdmin() {
  const [f, setF] = useState(null), [msg, setMsg] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { admin.get('/settings').then(setF).catch(e => setMsg({err: true, text: e.message})); }, []);
  if (!f) return <><Flash msg={msg}/><p>Loading…</p></>;
  const set = k => e => setF({...f, [k]: e.target.value});
  async function save(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { setF(await admin.put('/settings', f)); setMsg({text: 'Settings saved. Refresh the website to see changes.'}); } catch (x) { setMsg({err: true, text: x.message}); }
    setBusy(false);
  }
  return <>
    <h1>Site settings</h1><Flash msg={msg}/>
    <form className="form" onSubmit={save}>
      <h2>Homepage</h2>
      <div className="two"><Field label="Name shown in the hero" hint="Shown large on the homepage."><input value={f.siteName} onChange={set('siteName')}/></Field>
        <Field label="Name suffix" hint="Appears only in the logo & footer, e.g. .sahityka. Leave empty to hide."><input value={f.brandSuffix} onChange={set('brandSuffix')}/></Field></div>
      <Field label="Tagline" hint="Three short sentences, e.g. Stories. Emotions. Life."><input value={f.tagline} onChange={set('tagline')}/></Field>
      <Field label="Small line above the name"><input value={f.heroEyebrow} onChange={set('heroEyebrow')}/></Field>
      <Field label="Intro text"><textarea rows={3} value={f.heroText} onChange={set('heroText')}/></Field>
      <Field label="Quote"><textarea rows={2} value={f.heroQuote} onChange={set('heroQuote')}/></Field>
      <ImageField label="Homepage portrait" value={f.heroImage} onChange={v => setF({...f, heroImage: v})}/>
      <h2>About page</h2>
      <Field label="Heading"><input value={f.aboutTitle} onChange={set('aboutTitle')}/></Field>
      <Field label="Text" hint="Blank line = new paragraph."><textarea rows={8} value={f.aboutText} onChange={set('aboutText')}/></Field>
      <ImageField label="About photo" value={f.aboutImage} onChange={v => setF({...f, aboutImage: v})}/>
      <h2>Checkout</h2>
      <label className="check"><input type="checkbox" checked={f.codEnabled !== false} onChange={e => setF({...f, codEnabled: e.target.checked})}/> Offer Cash on Delivery at checkout</label>
      <Field label="COD extra charge (₹)" hint="Added to the total for COD orders only. Use 0 for no charge."><input type="number" min="0" max="5000" step="1" value={f.codFee ?? 0} onChange={set('codFee')}/></Field>
      <h2>Contact & social links</h2>
      <div className="two"><Field label="Public email"><input type="email" value={f.email} onChange={set('email')}/></Field><Field label="Phone (optional)"><input value={f.phone} onChange={set('phone')}/></Field></div>
      <Field label="Instagram URL"><input placeholder="https://instagram.com/…" value={f.instagram} onChange={set('instagram')}/></Field>
      <Field label="LinkedIn URL"><input placeholder="https://linkedin.com/in/…" value={f.linkedin} onChange={set('linkedin')}/></Field>
      <Field label="YouTube URL"><input placeholder="https://youtube.com/@…" value={f.youtube} onChange={set('youtube')}/></Field>
      <div className="row"><button className="btn primary" disabled={busy}>Save settings</button></div>
    </form>
  </>;
}
