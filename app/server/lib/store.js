import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {seed} from '../data/seed.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(dir, '..', 'data', 'db.json');

let db;
function load() {
  if (db) return db;
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    db = structuredClone(seed);
    persist();
  }
  // forward-compat: make sure every collection exists
  for (const k of Object.keys(seed)) if (db[k] === undefined) db[k] = structuredClone(seed[k]);
  return db;
}
function persist() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE); // atomic replace
}
export const store = {
  get: name => load()[name],
  set(name, value) { load()[name] = value; persist(); return value; },
  save() { load(); persist(); }
};
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export function slugify(s) {
  const base = String(s || '').toLowerCase().trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return base || uid();
}
