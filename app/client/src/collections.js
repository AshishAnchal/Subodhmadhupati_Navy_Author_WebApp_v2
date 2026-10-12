// One entry per content type. `type` matches the API; `path` is the public page.
export const COLLECTIONS = [
  {type: 'journal', path: '/journal', label: 'Journal', singular: 'journal entry', eyebrow: 'NOTES FROM THE JOURNAL', title: ['Thoughts from', 'the open sea.'], intro: 'Dated reflections on life, service, and the language of the heart.'},
  {type: 'blog', path: '/blog', label: 'Blog', singular: 'blog post', eyebrow: 'THE BLOG', title: ['Words on', 'writing & life.'], intro: 'Longer pieces on books, writing, and what the sea has taught me.'},
  {type: 'story', path: '/stories', label: 'Stories', singular: 'story', eyebrow: 'SHORT STORIES', title: ['Stories from', 'near and far.'], intro: 'Tales shaped by ports, people and the quiet things we carry.'},
  {type: 'poem', path: '/poetry', label: 'Poetry', singular: 'poem', eyebrow: 'POETRY', title: ['Verses from', 'the inner tides.'], intro: 'Poems — read slowly, the way the sea reads the shore.'}
];
export const byType = Object.fromEntries(COLLECTIONS.map(c => [c.type, c]));
export const byPath = Object.fromEntries(COLLECTIONS.map(c => [c.path.slice(1), c]));
