const now = new Date().toISOString();
export const seed = {
  settings: {
    siteName: 'Subodhmadhupati',
    brandSuffix: '.sahityka',
    tagline: 'Stories. Emotions. Life.',
    heroEyebrow: 'STORIES FROM A LIFE AT SEA',
    heroText: 'A collection of heartfelt stories, thoughts and experiences that sail through the depths of life, love and the human spirit.',
    heroQuote: 'Some thoughts are not just written, they are lived…',
    heroImage: '/images/author.jpg',
    aboutTitle: 'A life of service. A heart full of stories.',
    aboutText: 'Known here as Subodhmadhupati.sahityka, the author brings together a naval officer’s discipline, a keen eye for the world, and a writer’s sensitivity to the emotions people often leave unspoken.\n\nThrough poetry and reflection, this space celebrates life beyond the uniform: the memories we carry, the people we meet, and the quiet strength it takes to put feelings into words.',
    aboutImage: '/images/author.jpg',
    email: 'author@example.com',
    phone: '',
    codEnabled: true,
    codFee: 0,
    instagram: '',
    linkedin: '',
    youtube: ''
  },
  books: [{
    id: 'laharon-ki-lipiyan',
    title: 'लहरों की लिपियाँ',
    englishTitle: 'Laharon Ki Lipiyan',
    subtitle: 'कविताएँ, भावनाएँ और जीवन के अनकहे स्वर',
    description: 'A poetic journey across the inner tides of memory, love, solitude and life. The words and experiences in this collection invite readers to pause, feel deeply, and discover meaning in the quiet spaces between moments.',
    price: 399, format: 'Paperback', language: 'Hindi', genre: 'Poetry',
    cover: '/images/book-cover.jpg', published: true, createdAt: now
  }],
  posts: [
    {id: 'p1', type: 'journal', slug: 'what-the-sea-teaches-about-patience', title: 'What the sea teaches about patience', excerpt: 'The horizon asks us to wait, watch, and trust the journey.', body: 'The horizon asks us to wait, watch, and trust the journey.\n\nOn a long passage, days blur into one another. You learn that not everything can be hurried, and that patience is a kind of seamanship.\n\n## Replace this sample\nOpen the admin panel to edit or delete this entry and write your own.', cover: '', tags: ['reflection'], published: true, date: now, createdAt: now, updatedAt: now},
    {id: 'p2', type: 'blog', slug: 'turning-memories-into-words', title: 'Turning memories into words', excerpt: 'A notebook can hold the things we are not ready to say aloud.', body: 'A notebook can hold the things we are not ready to say aloud.\n\nThis is a sample blog post. Edit it from the admin panel.', cover: '', tags: ['writing'], published: true, date: now, createdAt: now, updatedAt: now},
    {id: 'p3', type: 'story', slug: 'some-feelings-find-no-uniform', title: 'Some feelings find no uniform', excerpt: 'Behind every role we play, there is a private human story.', body: 'Behind every role we play, there is a private human story.\n\nThis is a sample story. Edit it from the admin panel.', cover: '', tags: ['life'], published: true, date: now, createdAt: now, updatedAt: now},
    {id: 'p4', type: 'poem', slug: 'sample-poem', title: 'A sample poem', excerpt: 'Replace this with your own verse.', body: 'Line by line the tide comes in,\nline by line it leaves,\nand what it writes upon the sand\nis only what it grieves.', cover: '', tags: ['poetry'], published: true, date: now, createdAt: now, updatedAt: now}
  ],
  gallery: [
    {id: 'g1', image: '/images/author.jpg', caption: 'The person behind the pages', order: 1},
    {id: 'g2', image: '/images/book-cover.jpg', caption: 'The words that found their way', order: 2}
  ],
  messages: [],
  subscribers: [],
  orders: []
};
