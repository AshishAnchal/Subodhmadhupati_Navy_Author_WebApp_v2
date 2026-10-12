import React, {useState} from 'react';
import {Anchor} from 'lucide-react';
import {api, setToken} from '../api.js';

export default function Login({onLogin}) {
  const [f, setF] = useState({username: '', password: ''}), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { const {token} = await api.post('/api/admin/login', f); setToken(token); onLogin(); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  return <div className="login-wrap">
    <form className="login-card" onSubmit={submit}>
      <Anchor size={32}/><h1>Admin sign in</h1><p>Manage your journal, blog, stories, poetry, books and gallery.</p>
      <label className="af"><span>Username</span><input autoFocus autoComplete="username" value={f.username} onChange={e => setF({...f, username: e.target.value})} required/></label>
      <label className="af"><span>Password</span><input type="password" autoComplete="current-password" value={f.password} onChange={e => setF({...f, password: e.target.value})} required/></label>
      {err && <div className="flash err" role="alert">{err}</div>}
      <button className="btn primary wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <a className="back-link" href="/">← Back to website</a>
    </form>
  </div>;
}
