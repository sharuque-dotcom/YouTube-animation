// Episode 2 visuals as shot lists (light style; `dark: true` for the darker turns).
const SG = [103.82, 1.35], KL = [101.69, 3.14], SZ = [114.06, 22.54], TAINAN = [120.2, 23.0];
const H = 1080;
const RECREATION = { text: 'Recreation · words as reported', y: 990 };

export const photos = ['jensen', 'nvidiahq', 'singapore', 'capitol', 'gpu', 'datacenter', 'kualalumpur'];

export const shots = {
  // ---------------------------------------------------------------- cold open
  c_email: [
    { type: 'email', from: 'Jensen Huang', to: 'Nvidia employees', date: 'Sunday, 8 November 2026', subject: '', body: 'I was unfaithful to my wife. My actions hurt her and our children. There is no excuse for what I did.', when: 'I was unfaithful', until: 'what I did', note: RECREATION },
    { at: 'The man was', type: 'photo', img: 'jensen', text: 'Jensen Huang · founder and CEO of Nvidia' },
  ],
  c_twist: [
    { type: 'kinetic', text: 'Not just *an affair', size: 140, dark: true },
    { at: 'The woman at the centre', type: 'profile', name: 'Alice Huang', role: 'reportedly watched by US intelligence', caption: 'no photo shown', dark: true },
    { at: 'And her company', type: 'number', value: 4.8, decimals: 1, prefix: '$', suffix: ' billion', when: 'billions', label: 'of Nvidia chips', sub: 'her former company, per The New York Times', dark: true },
  ],
  c_q: [
    { type: 'list', items: [{ text: 'A LOVE STORY?', when: 'love story' }, { text: 'A SPY STORY?', when: 'spy story' }, { text: 'A CHIP STORY?', when: 'chips', color: 'yellow' }] },
    { at: 'Maybe all three', type: 'kinetic', text: 'Maybe *all three.', size: 140 },
  ],
  title: [{ type: 'title', title: 'Toppled Giants', sub: 'Episode 2 · The CEO, the Chips and the Alleged Spy' }],

  // ---------------------------------------------------------------- 1
  chapter1: [{ type: 'chapter', num: 1, title: 'The Man Who Powers AI', img: 'jensen' }],
  rise: [
    { type: 'map', from: [112, 26, 6], to: [120.6, 23.4, 30], pins: [{ at: TAINAN, label: 'Taiwan · 1963', when: 'Taiwan' }] },
    { at: 'In 1993', type: 'flow', nodes: [{ text: '1993', sub: 'three friends', when: '1993' }, { text: "A DENNY'S BOOTH", sub: 'where the plan was sketched', when: "Denny's", color: 'yellow' }] },
    { at: 'They called it', type: 'letters', word: 'NVIDIA', when: 'Nvidia' },
  ],
  ai: [
    { type: 'photo', img: ['gpu', 'datacenter'], text: 'made for video games' },
    { at: 'Then researchers', type: 'kinetic', text: 'Perfect for *training AI', size: 130 },
    { at: 'When the AI boom', type: 'photo', img: ['datacenter', 'gpu'], text: 'the AI boom runs on Nvidia' },
  ],
  value: [
    { type: 'number', value: 4.5, decimals: 1, prefix: '$', suffix: ' trillion', when: '4.5', label: 'Nvidia, late 2026' },
    { at: 'And Jensen Huang', type: 'photo', img: 'jensen', text: 'one of the most powerful businessmen alive' },
  ],

  // ---------------------------------------------------------------- 2
  chapter2: [{ type: 'chapter', num: 2, title: 'The Chip Wall', img: 'datacenter' }],
  wall: [
    { type: 'kinetic', text: 'Not just *products', size: 140, sub: 'strategic weapons' },
    { at: 'Since 2022', type: 'map', from: [95, 30, 5.5], to: [104, 34, 8], pins: [{ at: [104, 35], label: 'China', when: 'China' }], text: 'US limits on advanced AI chips · since 2022' },
    { at: 'China is a huge', type: 'kinetic', text: 'The rules cost Nvidia *billions', size: 110 },
  ],
  leak: [
    { type: 'kinetic', text: 'A way *around the wall?', size: 130, dark: true },
    { at: 'Investigators and lawmakers', type: 'map', from: [106, 18, 9], to: [106, 10, 18], pins: [{ at: SG, label: 'Singapore', when: 'Singapore' }, { at: KL, label: 'Malaysia', when: 'Malaysia', side: -1 }], routes: [{ from: SG, to: SZ, when: 'Chinese customers', lift: 0.3 }], text: 'possible routes, under investigation' },
    { at: 'Nvidia has always', type: 'photo', img: 'nvidiahq', text: 'Nvidia says it follows the rules' },
  ],

  // ---------------------------------------------------------------- 3
  chapter3: [{ type: 'chapter', num: 3, title: 'Megaspeed', img: 'singapore' }],
  mega: [
    { type: 'photo', img: 'singapore', text: 'Megaspeed · cloud computing · Singapore' },
    { at: 'According to reports', type: 'flow', title: 'Megaspeed, according to reports', nodes: [{ text: '7ROAD', sub: 'Chinese gaming & cloud firm', when: 'spin-off' }, { text: 'OFFSHORE COMPANY', sub: 'linked to Alice Huang', when: 'offshore', color: 'yellow' }] },
  ],
  alice: [
    { type: 'profile', name: 'Alice Huang', role: 'former TV reporter in China', caption: 'no photo shown' },
    { at: 'From March', type: 'list', items: [{ text: 'MANAGING DIRECTOR', sub: 'Megaspeed · Mar – Nov 2023', when: 'managing director' }] },
    { at: 'Huang is a common', type: 'vs', title: 'not reported to be related', left: { value: 'Huang', label: 'Jensen', when: 'common' }, right: { value: 'Huang', label: 'Alice', when: 'surname' } },
  ],
  chips: [
    { type: 'photo', img: ['datacenter', 'gpu'], text: "one of Nvidia's big customers" },
    { at: 'The New York Times reported', type: 'number', value: 4.8, decimals: 1, prefix: '$', suffix: ' billion', when: '4.8', label: 'of Nvidia chips in two years', sub: 'per The New York Times' },
    { at: 'Investigators are now', type: 'map', from: [106, 8, 14], to: [110, 14, 9], pins: [{ at: SG, label: 'Singapore' }], routes: [{ from: SG, to: SZ, when: 'diverted', lift: 0.3 }], text: 'were chips diverted? under investigation' },
    { at: 'The Times also reported', type: 'kinetic', text: 'A *criminal inquiry', size: 140, sub: 'Justice Department, reported by The New York Times', dark: true },
  ],
  deny: [
    { type: 'kinetic', text: 'Megaspeed *denies it', size: 140 },
    { at: 'It calls the reports', type: 'quote', text: 'Misleading information and incorrect insinuations.', when: 'misleading', until: 'insinuations', by: '— Megaspeed' },
  ],

  // ---------------------------------------------------------------- 4
  chapter4: [{ type: 'chapter', num: 4, title: 'The Report', img: 'nvidiahq' }],
  report: [
    { type: 'kinetic', text: '29 October', size: 150, sub: 'The New York Times', dark: true },
    { at: 'It reported that American', type: 'profile', name: 'A person close|to Jensen Huang', role: 'could be a Chinese intelligence asset, the report said', caption: 'no photo shown', dark: true },
    { at: 'The concern', type: 'flow', title: 'the concern, according to the report', nodes: [{ text: 'NVIDIA', sub: 'information', when: 'Nvidia', icon: 'computer' }, { text: 'THE PRESIDENT', sub: 'access', when: 'President', color: 'yellow' }], dark: true },
  ],
  more: [
    { type: 'list', items: [{ text: 'WALL STREET JOURNAL', sub: 'suspicion in the US, Singapore and Taiwan', when: 'Wall Street' }, { text: 'FINANCIAL TIMES', sub: 'a romantic relationship', when: 'Financial', color: 'yellow' }], dark: true },
  ],
  nvreply: [
    { type: 'photo', img: 'nvidiahq', text: 'Nvidia pushed back' },
    { at: 'It said Huang', type: 'quote', text: 'Thoroughly investigated and debunked.', when: 'thoroughly', until: 'debunked', by: '— Nvidia, on the chip allegations' },
  ],

  // ---------------------------------------------------------------- 5
  chapter5: [{ type: 'chapter', num: 5, title: 'The Confession', img: 'capitol' }],
  congress: [
    { type: 'photo', img: 'capitol', text: 'the story would not go away' },
    { at: 'Last week', type: 'list', title: 'asking for a closed-door briefing', items: [{ text: 'FOREIGN AFFAIRS', when: 'Foreign Affairs' }, { text: 'CHINA COMMITTEE', when: 'China Committee' }, { text: 'INTELLIGENCE', when: 'Intelligence Committee', color: 'yellow' }] },
    { at: 'Democrats called', type: 'kinetic', text: 'Both parties want *answers', size: 120 },
  ],
  confess: [
    { type: 'email', from: 'Jensen Huang', to: 'Nvidia employees', date: 'Sunday, 8 November 2026', subject: '', body: 'I was unfaithful to my wife. My actions hurt her and our children. There is no excuse for what I did.', when: 'admitted', until: 'fully', note: RECREATION, dark: true },
    { at: "Nvidia's board announced", type: 'doc', heading: 'NVIDIA BOARD INVESTIGATION', rows: [{ label: 'Independent directors', when: 'independent' }, { label: 'Outside lawyers', when: 'outside' }, { label: 'A foreign intelligence target?', when: 'foreign', mark: true }] },
    { at: 'The board said', type: 'quote', text: 'No reason to believe that either national security or NVIDIA secrets were compromised.', when: 'no reason', until: 'compromised', by: '— Nvidia board' },
  ],
  market: [
    { type: 'ride', values: [100, 100, 100, 96], drop: 'fell', label: 'NVDA · Monday 9 November', big: '−4%' },
    { at: 'President Trump', type: 'quote', text: 'An honorable guy.', when: 'honorable', until: 'guy', by: '— President Trump' },
    { at: 'added that the FBI', type: 'quote', text: 'Looking into it in terms of something else.', when: 'looking', until: 'else', by: '— President Trump, on the FBI' },
    { at: 'Nvidia says Huang', type: 'photo', img: 'jensen', text: 'staying on as CEO · "without interruption"' },
  ],

  // ---------------------------------------------------------------- 6 + outro
  chapter6: [{ type: 'chapter', num: 6, title: "What We Don't Know", img: 'nvidiahq' }],
  known: [
    { type: 'kinetic', text: 'What do we *actually know?', size: 120 },
    { at: 'Huang has admitted', type: 'list', items: [{ text: 'THE AFFAIR', sub: 'confirmed by Huang', when: 'admitted' }, { text: 'SPYING CLAIMS', sub: 'anonymous sources, in news reports', when: 'spying' }, { text: 'NO CHARGES', sub: 'Alice Huang has not commented', when: 'charged', color: 'yellow' }, { text: 'MEGASPEED', sub: 'denies wrongdoing', when: 'Megaspeed' }] },
  ],
  next: [
    { type: 'list', items: [{ text: 'BOARD INVESTIGATION', when: 'board' }, { text: 'CONGRESS BRIEFING', when: 'Lawmakers' }, { text: 'WHERE DID THE CHIPS GO?', when: 'investigators', color: 'yellow' }] },
  ],
  outro: [
    { type: 'photo', img: ['gpu', 'datacenter'] },
    { at: 'Now, in a world', type: 'kinetic', text: 'Something far more *human.', size: 130, dark: true },
    { at: 'This story is still', type: 'kinetic', text: 'Still *developing', size: 140, sub: 'as of 10 November 2026' },
  ],
  endcard: [{ type: 'title', title: 'Toppled Giants', sub: 'Subscribe for the next story' }],
};
