// Episode 2 visuals as shot lists (light style; `dark: true` for the darker turns).
const SG = [103.82, 1.35], KL = [101.69, 3.14], SZ = [114.06, 22.54], TAINAN = [120.2, 23.0];
const H = 1080;
const RECREATION = { text: 'Recreation · words as reported', y: 990 };

export const photos = ['jensen', 'nvidiahq', 'singapore', 'capitol', 'gpu', 'datacenter', 'kualalumpur', 'trump', 'nvidialogo.png'];

export const shots = {
  // ---------------------------------------------------------------- cold open
  c_email: [
    { type: 'sendmail', dark: true, send: 'sent an email', date: 'Sunday · 8 November 2026', dateWhen: 'Sunday', text: 'the most important man in AI', textWhen: 'the most important' },
    { at: 'I was unfaithful', type: 'email', from: 'Jensen Huang', to: 'Nvidia employees', date: 'Sunday, 8 November 2026', subject: '', body: 'I was unfaithful to my wife. My actions hurt her and our children. There is no excuse for what I did.', when: 'I was unfaithful', until: 'what I did', note: RECREATION, cut: 'zoom' },
    { at: 'The man was', type: 'photo', img: 'jensen', logo: 'nvidialogo', text: 'Jensen Huang · founder and CEO of Nvidia' },
  ],
  c_twist: [
    { type: 'kinetic', text: 'Not just *an affair', size: 140, dark: true },
    { at: 'The woman at the centre', type: 'profile', name: 'Alice Huang', role: 'no photo shown', caption: 'no photo shown', dark: true, scan: { when: 'watched', lines: ['SUBJECT · ALICE HUANG', 'WATCHED BY · US INTELLIGENCE', 'SUSPICION · WORKING FOR CHINA', '* ACCORDING TO REPORTS'] } },
    { at: 'And her company', type: 'number', value: 4.8, decimals: 1, prefix: '$', suffix: ' billion', when: 'billions', label: 'of Nvidia chips', sub: 'her former company, per The New York Times', dark: true, fx: [{ kind: 'chips', when: 'Nvidia' }] },
  ],
  c_q: [
    { type: 'list', items: [{ text: 'A LOVE STORY?', when: 'love story' }, { text: 'A SPY STORY?', when: 'spy story' }, { text: 'A CHIP STORY?', when: 'chips', color: 'yellow' }], fx: [{ kind: 'hearts', when: 'love story' }, { kind: 'spy', when: 'spy story' }, { kind: 'chips', when: 'chips' }] },
    { at: 'Maybe all three', type: 'kinetic', text: 'Maybe *all three.', size: 140 },
  ],
  title: [{ type: 'sting', title: 'Toppled Giants', sub: 'Episode 2 · The CEO, the Chips and the Alleged Spy' }],

  // ---------------------------------------------------------------- 1
  chapter1: [{ type: 'chapter', num: 1, title: 'The Man Who Powers AI', img: 'jensen' }],
  rise: [
    { type: 'flight', from: 'Taiwan', depart: 'moved', fromLabel: 'Taiwan · 1963', toLabel: 'United States · as a child' },
    { at: 'In 1993', type: 'diner', sketch: 'sketched', text: '1993 · three friends, one plan' },
    { at: 'They called it', type: 'letters', word: 'NVIDIA', when: 'Nvidia' },
  ],
  ai: [
    { type: 'aiboom', dissolve: 'researchers', boom: 'AI boom', hub: 'needed Nvidia', labels: ['made for video games', 'perfect for training AI', 'the AI boom runs on Nvidia'] },
  ],
  value: [
    { type: 'race', when: 'trillion', title: "the world's most valuable companies", note: 'approximate market values at the end of each year', years: [2019, 2020, 2021, 2022, 2023, 2024, 2025], companies: [
      { name: 'Apple', color: '#c9b8ff', v: [1.29, 2.26, 2.91, 2.07, 2.99, 3.79, 4.0] },
      { name: 'Microsoft', color: '#ffc9a8', v: [1.2, 1.68, 2.52, 1.79, 2.79, 3.13, 3.5] },
      { name: 'Alphabet', color: '#b8e0d2', v: [0.92, 1.19, 1.92, 1.15, 1.76, 2.33, 3.7] },
      { name: 'Amazon', color: '#f5c6e0', v: [0.92, 1.63, 1.69, 0.86, 1.57, 2.31, 2.4] },
      { name: 'Nvidia', color: '#76b900', hero: true, v: [0.14, 0.32, 0.73, 0.36, 1.22, 3.29, 4.5] },
    ] },
    { at: 'And Jensen Huang', type: 'keynote', jacket: 'leather jacket', chipText: 'the leather jacket', text: 'one of the most powerful businessmen alive', textWhen: 'powerful' },
  ],

  // ---------------------------------------------------------------- 2
  chapter2: [{ type: 'chapter', num: 2, title: 'The Chip Wall', img: 'datacenter' }],
  wall: [
    { type: 'kinetic', text: 'Not just *products', size: 140 },
    { at: 'Governments', type: 'chess', drop: 'strategic weapons', flagsWhen: 'Governments', text: 'strategic weapons' },
    { at: 'Since 2022', type: 'export', cut: 'restricted', text: 'US limits on advanced AI chips to China · since 2022' },
    { at: 'China is a huge', type: 'drain', grow: 'huge market', lose: 'cost Nvidia', text: 'China: a huge market', stackLabel: 'SALES IN CHINA', lossText: '− billions' },
  ],
  leak: [
    { type: 'maze', dark: true, text: 'a way around the wall?' },
    { at: 'Investigators and lawmakers', type: 'map', from: [106, 18, 9], to: [106, 10, 18], pins: [{ at: SG, label: 'Singapore', when: 'Singapore' }, { at: KL, label: 'Malaysia', when: 'Malaysia', side: -1 }], routes: [{ from: SG, to: SZ, when: 'Chinese customers', lift: 0.3, ship: true }, { from: KL, to: SZ, when: 'Chinese customers', lift: 0.35, ship: true }], text: 'possible routes, under investigation' },
    { at: 'Nvidia has always', type: 'photo', img: 'nvidiahq', text: 'Nvidia says it follows the rules' },
  ],

  // ---------------------------------------------------------------- 3
  chapter3: [{ type: 'chapter', num: 3, title: 'Megaspeed', img: 'singapore' }],
  mega: [
    { type: 'photo', img: 'singapore', text: 'Megaspeed · cloud computing · Singapore' },
    { at: 'According to reports', type: 'hops', text: 'Megaspeed, according to reports', link: 'linked to Alice Huang', linkWhen: 'Alice', stops: [
      { flag: 'CN', name: '7Road', sub: 'Chinese gaming & cloud firm', when: '7Road' },
      { flag: 'SG', name: 'Megaspeed', sub: 'spin-off · Singapore', when: 'spin-off' },
      { flag: 'ISLAND', name: 'Offshore company', sub: 'later bought it', when: 'offshore' },
    ] },
  ],
  alice: [
    { type: 'profile', name: 'Alice Huang', role: 'former TV reporter in China', caption: 'no photo shown' },
    { at: 'From March', type: 'badge', org: 'MEGASPEED', name: 'ALICE HUANG', role: 'MANAGING DIRECTOR', dates: 'MAR – NOV 2023', text: 'illustration · no photo shown' },
    { at: 'Huang is a common', type: 'vs', title: 'not reported to be related', left: { value: 'Huang', label: 'Jensen', when: 'common' }, right: { value: 'Huang', label: 'Alice', when: 'surname' } },
  ],
  chips: [
    { type: 'photo', img: ['datacenter', 'gpu'], text: "one of Nvidia's big customers" },
    { at: 'The New York Times reported', type: 'chipstack', value: 4.8, when: '4.8', label: 'of Nvidia chips in two years', sub: 'per The New York Times' },
    { at: 'Investigators are now', type: 'map', from: [106, 8, 14], to: [110, 14, 9], pins: [{ at: SG, label: 'Singapore' }], routes: [{ from: SG, to: SZ, when: 'diverted', lift: 0.3, ship: true }], text: 'were chips diverted? under investigation' },
    { at: 'The Times also reported', type: 'casefolder', dark: true, stampWhen: 'criminal inquiry', title: 'CRIMINAL INQUIRY', stampText: 'REPORTED', text: 'Justice Department · reported by The New York Times' },
  ],
  deny: [
    { type: 'kinetic', text: 'Megaspeed *denies it', size: 140, stamp: { text: 'DENIED', when: 'denies', delay: 0.4, y: 820 } },
    { at: 'It calls the reports', type: 'quote', text: 'Misleading information and incorrect insinuations.', when: 'misleading', until: 'insinuations', by: '— Megaspeed' },
    { at: 'and says inspections', type: 'checks', title: 'INSPECTIONS, ACCORDING TO MEGASPEED', rows: [{ label: 'American officials', when: 'American' }, { label: 'Malaysian officials', when: 'Malaysian' }, { label: 'Nvidia', when: 'by Nvidia' }], text: 'no evidence of any violations, Megaspeed says', textWhen: 'no evidence' },
  ],

  sub: [{ type: 'subscribe', clickWhen: 'tap subscribe', text: 'it really helps the channel' }],

  // ---------------------------------------------------------------- 4
  chapter4: [{ type: 'chapter', num: 4, title: 'The Report', img: 'nvidiahq' }],
  report: [
    { type: 'newspaper', dark: true, date: 'THURSDAY, 29 OCTOBER 2026', headline: ['Intelligence agencies watched', "a person close to Nvidia's CEO"], text: 'The New York Times · 29 October' },
    { at: 'It reported that American', type: 'profile', name: 'A person close|to Jensen Huang', role: 'could be a Chinese intelligence asset, the report said', caption: 'no photo shown', dark: true },
    { at: 'The concern', type: 'flow', title: 'the concern, according to the report', nodes: [{ text: 'NVIDIA', sub: 'information', when: 'Nvidia', img: 'nvidialogo' }, { text: 'THE PRESIDENT', sub: 'access', when: 'President', img: 'trump', fit: 'cover', color: 'yellow' }], dark: true },
  ],
  more: [
    { type: 'radar', dark: true, text: 'The Wall Street Journal: reason to suspect her', flags: [{ code: 'US', label: 'United States', when: 'United States' }, { code: 'SG', label: 'Singapore', when: 'Singapore' }, { code: 'TW', label: 'Taiwan', when: 'Taiwan' }] },
    { at: 'The Financial Times', type: 'kinetic', text: 'A *romantic relationship', size: 130, sub: 'reported by the Financial Times', fx: [{ kind: 'hearts', when: 'romantic' }] },
  ],
  nvreply: [
    { type: 'shield', label: 'allegations', text: 'Huang talks to thousands of customers a year, Nvidia says', textWhen: 'thousands' },
    { at: 'the chip diversion', type: 'quote', text: 'Thoroughly investigated and debunked.', when: 'thoroughly', until: 'debunked', by: '— Nvidia, on the chip allegations' },
  ],

  // ---------------------------------------------------------------- 5
  chapter5: [{ type: 'chapter', num: 5, title: 'The Confession', img: 'capitol' }],
  congress: [
    { type: 'photo', img: 'capitol', text: 'the story would not go away' },
    { at: 'Last week', type: 'hearing', doors: 'closed doors', text: 'three House committee chairmen want a briefing', seats: [{ label: 'FOREIGN AFFAIRS', when: 'Foreign Affairs' }, { label: 'CHINA COMMITTEE', when: 'China Committee' }, { label: 'INTELLIGENCE', when: 'Intelligence Committee' }] },
    { at: 'Democrats called', type: 'kinetic', text: 'Both parties want *answers', size: 120 },
  ],
  confess: [
    { type: 'email', from: 'Jensen Huang', to: 'Nvidia employees', date: 'Sunday, 8 November 2026', subject: '', body: 'I was unfaithful to my wife. My actions hurt her and our children. There is no excuse for what I did.', when: 'admitted', until: 'fully', note: RECREATION, dark: true },
    { at: "Nvidia's board announced", type: 'boardroom', text: "Nvidia's board investigates", rows: [{ label: 'Independent directors', when: 'independent' }, { label: 'Outside lawyers', when: 'outside' }, { label: 'Foreign intelligence target?', when: 'foreign', mark: true }] },
    { at: 'The board said', type: 'quote', text: 'No reason to believe that either national security or NVIDIA secrets were compromised.', when: 'no reason', until: 'compromised', by: '— Nvidia board' },
  ],
  market: [
    { type: 'phone', drop: 'fell', pct: 4, text: 'Monday, 9 November' },
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
    { type: 'chipheart', rival: 'better chip', morph: 'far more human', labels: ['the biggest risk: a better chip', 'something far more human'] },
    { at: 'This story is still', type: 'kinetic', text: 'Still *developing', size: 140, sub: 'as of 10 November 2026' },
  ],
  endcard: [{ type: 'subscribe', clickWhen: 'Subscribe', text: 'see you in the next story' }],
};
