import React, {useRef, useState} from 'react';
import {Upload, X} from 'lucide-react';
import {admin, imgUrl} from '../api.js';

export function Field({label, hint, children}) {
  return <label className="af">{<span>{label}</span>}{children}{hint && <small>{hint}</small>}</label>;
}
export function ImageField({label, value, onChange}) {
  const ref = useRef(), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  async function pick(e) {
    const file = e.target.files[0]; if (!file) return;
    setBusy(true); setErr('');
    try { onChange((await admin.upload(file)).url); } catch (x) { setErr(x.message); }
    setBusy(false); e.target.value = '';
  }
  return <div className="af">
    <span>{label}</span>
    <div className="img-field">
      {value ? <div className="thumb"><img src={imgUrl(value)} alt=""/><button type="button" onClick={() => onChange('')} aria-label="Remove image"><X size={14}/></button></div> : <div className="thumb empty">No image</div>}
      <div className="img-actions">
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={pick}/>
        <button type="button" className="btn" disabled={busy} onClick={() => ref.current.click()}><Upload size={15}/> {busy ? 'Uploading…' : 'Upload image'}</button>
        <input placeholder="…or paste an image URL / path" value={value || ''} onChange={e => onChange(e.target.value)}/>
        {err && <small className="err">{err}</small>}
      </div>
    </div>
  </div>;
}
export function Flash({msg}) { return msg ? <div className={`flash ${msg.err ? 'err' : ''}`} role="status">{msg.text}</div> : null; }
