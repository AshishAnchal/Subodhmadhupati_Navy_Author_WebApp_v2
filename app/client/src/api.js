const BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'admin_token';

export const getToken = () => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = t => { try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ } };

async function request(path, {method = 'GET', body, admin = false, form} = {}) {
  const headers = {};
  if (admin && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {method, headers, body: form || (body ? JSON.stringify(body) : undefined)});
  } catch {
    throw new Error('Cannot reach the server. Is the API running?');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && admin) { setToken(null); window.dispatchEvent(new Event('admin-logout')); }
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}
export const api = {
  get: p => request(p),
  post: (p, body) => request(p, {method: 'POST', body})
};
export const admin = {
  get: p => request(`/api/admin${p}`, {admin: true}),
  post: (p, body) => request(`/api/admin${p}`, {method: 'POST', body, admin: true}),
  put: (p, body) => request(`/api/admin${p}`, {method: 'PUT', body, admin: true}),
  patch: (p, body) => request(`/api/admin${p}`, {method: 'PATCH', body, admin: true}),
  del: p => request(`/api/admin${p}`, {method: 'DELETE', admin: true}),
  upload: file => { const f = new FormData(); f.append('image', file); return request('/api/admin/upload', {method: 'POST', form: f, admin: true}); }
};
export const imgUrl = u => (u && u.startsWith('/uploads') ? `${BASE}${u}` : u);
