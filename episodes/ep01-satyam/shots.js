// Episode 1 visuals as shot lists (see pipeline/shots.js for every shot type and option).
// A shot starts when the narrator says its `at` phrase; `*WORD` = accent colour.

const HYD = [78.49, 17.39];
const W = 1920, H = 1080;

export const photos = ['first', 'tech', 'campus', 'hitec', 'nyse', 'worldbank', 'bse', 'money', 'office', 'court', 'mumbai'];

export const shots = {
  // ---------------------------------------------------------------- Chapter 1
  chapter1: [{ type: 'chapter', num: 1, title: 'The Perfect Success Story', img: 'hitec' }],
  founding: [
    { type: 'map', from: [40, 25, 5], to: [78.49, 17.39, 24], pins: [{ at: HYD, label: 'HYDERABAD', when: 'Hyderabad' }], text: 'HYDERABAD, *1987', textY: H * 0.18 },
    { at: 'A businessman', type: 'profile', name: 'B. RAMALINGA|*RAJU', role: 'a textiles + real estate family', caption: 'founder' },
    { at: 'starts a small', type: 'photo', img: 'first', text: 'A SMALL *SOFTWARE COMPANY', sub: 'with his brother' },
    { at: 'They call it', type: 'letters', word: 'SATYAM', when: 'Satyam', sub: 'COMPUTER SERVICES', cut: 'zoom' },
  ],
  outsourcing: [
    { type: 'photo', img: 'hitec', text: 'THE TIMING IS *PERFECT', pos: 'center' },
    {
      at: 'The world is going', type: 'map', from: [0, 32, 5.8], to: [10, 30, 5.2],
      pins: [{ at: [-74, 40.7], label: 'USA', when: 'Western', side: -1 }, { at: [-0.1, 51.5], label: 'EUROPE', when: 'companies', side: -1 }, { at: HYD, label: 'INDIA', when: 'discovered' }],
      routes: [{ from: [-74, 40.7], to: HYD, when: 'discovered', lift: 0.3 }, { from: [-0.1, 51.5], to: HYD, when: 'something' }],
      text: 'THE WORLD GOES *DIGITAL', textY: H * 0.14,
    },
    { at: 'Indian engineers', type: 'vs', left: { value: '$$$$', label: 'THE WEST', when: 'same code' }, right: { value: '$', label: 'INDIA', when: 'fraction', color: 'red' }, title: 'THE SAME CODE' },
  ],
  y2k: [
    { type: 'kinetic', text: 'THE *Y2K PANIC', size: 180, bg: 'nyse' },
    { at: 'Every company on earth', type: 'kinetic', text: 'EVERY COMPANY ON *EARTH', sub: 'fix it before the year 2000' },
    { at: 'and Indian IT', type: 'photo', img: 'hitec', text: 'INDIAN IT: *FLOODED WITH WORK', zoom: [1.2, 1.05] },
  ],
  growth: [
    { type: 'ride', up: true, values: [20, 30, 45, 80, 190], drop: 'explosively', label: 'SATYAM GROWS', seed: 3 },
    { at: 'In 2001', type: 'photo', img: 'nyse', text: 'NEW YORK STOCK *EXCHANGE', stamp: { text: 'LISTED · 2001', when: 'New York', delay: 0.9, y: H * 0.45 } },
    { at: 'By 2008', type: 'swarm', img: 'campus', label: '50,000+', when: '50,000', sub: 'employees', red: 0 },
    { at: 'offices around', type: 'list', items: [{ text: 'OFFICES WORLDWIDE', when: 'offices' }, { text: 'FORTUNE 500 CLIENTS', when: 'Fortune', color: 'yellow' }] },
  ],
  bigfour: [
    { type: 'list', title: 'THE BIG FOUR OF INDIAN IT', items: [{ text: 'SATYAM', when: 'Big Four', color: 'yellow', circle: true }, { text: 'TCS', when: 'TCS' }, { text: 'INFOSYS', when: 'Infosys' }, { text: 'WIPRO', when: 'Wipro' }] },
  ],
  award: [
    { type: 'profile', icon: 'trophy', name: 'GOLDEN PEACOCK|AWARD *2008', role: 'excellence in corporate governance', caption: '2008' },
    { at: 'In other words', type: 'kinetic', text: 'FOR BEING *HONEST', size: 170, bg: 'tech' },
    { at: 'Remember that trophy', type: 'profile', icon: 'trophy', name: 'REMEMBER|THIS *TROPHY', role: "we'll come back to it" },
  ],

  // ---------------------------------------------------------------- Chapter 2
  chapter2: [{ type: 'chapter', num: 2, title: 'The Small Lie', img: 'first' }],
  gap: [
    { type: 'kinetic', text: 'WHAT NOBODY *OUTSIDE KNEW', bg: 'tech' },
    { at: 'Years earlier', type: 'bars', title: 'PROFIT', bars: [{ label: 'REAL', value: 86, when: 'real profits' }, { label: 'EXPECTED', value: 100, color: 'gold', when: 'expected' }] },
    { at: 'The gap was small', type: 'bars', title: 'A FEW NUMBERS *ADJUSTED', bars: [{ label: 'EXPECTED', value: 100, color: 'gold' }, { label: 'REPORTED', value: 86, top: 14, when: 'adjusted' }] },
    { at: 'The plan', type: 'kinetic', text: 'NEXT YEAR WILL BE *BETTER', sub: '...right?', bg: 'first' },
  ],
  grows: [
    { type: 'bars', title: 'BUT IT NEVER *CLOSED', max: 330, bars: [10, 30, 60, 100, 150, 210].map((top, i) => ({ label: `YEAR ${i + 1}`, value: 100 + i * 5, top })) },
    { at: 'Every lie needed', type: 'kinetic', text: 'EVERY LIE NEEDED|A *BIGGER LIE' },
  ],
  paper: [
    { type: 'kinetic', text: 'IF YOU CLAIM YOU EARNED IT|IT HAS TO BE *SOMEWHERE' },
    { at: 'So the money appeared', type: 'doc', heading: 'BANK STATEMENT', rows: [{ label: 'Cash balances', value: 'Rs. #,###', when: 'Cash balances' }, { label: 'Bank deposits', value: 'Rs. #,###', when: 'Bank deposits' }, { label: 'Interest earned', value: 'Rs. ###', when: 'Interest earned' }] },
    { at: 'According to investigators', type: 'kinetic', text: 'THOUSANDS OF|*FAKE INVOICES', stamp: { text: 'FORGED', when: 'forged', y: H * 0.8, size: 110 } },
  ],
  mountain: [
    { type: 'photo', img: ['bse', 'first'], text: 'A MOUNTAIN OF *CASH', pos: 'center' },
    { at: 'In reality', type: 'tear', word: 'PAPER', color: 'ink', when: 'paper', tearWhen: 'paper', sub: 'in reality' },
  ],

  // ---------------------------------------------------------------- Chapter 3
  chapter3: [{ type: 'chapter', num: 3, title: 'The Escape Plan', img: 'tech' }],
  maytas: [
    { type: 'kinetic', text: 'THE HOLE WAS TOO *BIG|HE NEEDED A WAY OUT' },
    { at: 'And it seems', type: 'letters', word: 'MAYTAS', reverse: true, when: 'Maytas', toWhen: 'spelled backwards', sub: '...SATYAM, BACKWARDS' },
  ],
  deal: [
    { type: 'flow', title: "*RAJU'S FAMILY", nodes: [{ text: 'MAYTAS PROPERTIES', sub: 'real estate', icon: 'buildings', when: 'Maytas Properties' }, { text: 'MAYTAS INFRA', sub: 'infrastructure', icon: 'buildings', when: 'Maytas Infra' }] },
    { at: 'On December', type: 'flow', title: '16 DECEMBER *2008', nodes: [{ text: 'SATYAM', sub: 'software', icon: 'computer' }, { text: 'MAYTAS', sub: 'real estate', icon: 'buildings', color: 'yellow', when: 'buy them' }], money: { text: '$1.6 BILLION', when: '1.6 billion' } },
    { at: 'On the surface', type: 'kinetic', text: 'WHY WOULD SOFTWARE|BUY *CONSTRUCTION?' },
  ],
  swap: [
    { type: 'kinetic', text: 'LOOK FROM THE *INSIDE', bg: 'tech' },
    { at: 'If Satyam', type: 'flow', nodes: [{ text: 'FAKE CASH', icon: 'cash', when: 'fake cash' }, { text: 'THE DEAL', when: 'deal' }, { text: 'REAL BUILDINGS', sub: 'and land', icon: 'buildings', color: 'yellow', when: 'real buildings' }] },
    { at: 'The hole would', type: 'kinetic', text: 'THE HOLE: *FILLED', size: 160, stamp: { text: 'FOREVER', when: 'Forever', y: H * 0.78 } },
  ],
  revolt: [
    { type: 'swarm', img: 'nyse', label: 'FURIOUS', when: 'furious', red: 0.85, redWhen: 'investors', size: 240 },
    { at: 'Why was the company', type: 'flow', nodes: [{ text: "SHAREHOLDERS' MONEY", icon: 'cash', when: 'shareholders' }, { text: "FOUNDER'S FAMILY", icon: 'buildings', color: 'yellow', when: 'family' }] },
    { at: "Satyam's shares crashed", type: 'ride', values: [100, 100, 100, 45], drop: 'crashed', label: 'SATYAM SHARES', stamp: { text: 'DEAL CANCELLED', when: 'cancelled', y: H * 0.72, size: 110 } },
  ],
  banned: [
    { type: 'photo', img: ['worldbank', 'nyse'], text: 'THEN THE HITS KEPT *COMING', pos: 'center' },
    { at: 'Days later', type: 'photo', img: ['worldbank', 'tech'], text: 'THE *WORLD BANK', stamp: { text: 'BANNED', when: 'banned', y: H * 0.45, size: 150 } },
    { at: 'Independent directors', type: 'list', items: [{ text: 'DIRECTOR', sub: 'resigned' }, { text: 'DIRECTOR', sub: 'resigned' }, { text: 'DIRECTOR', sub: 'resigned', color: 'yellow' }] },
    { at: 'The escape door', type: 'kinetic', text: 'THE DOOR *SLAMMED SHUT', size: 150, boom: 'slammed' },
    { at: 'And Raju was trapped', type: 'kinetic', text: 'TRAPPED INSIDE|HIS *OWN LIE', bg: 'first', font: 'Playfair Display', weight: 900 },
  ],

  // ---------------------------------------------------------------- Chapter 4
  chapter4: [{ type: 'chapter', num: 4, title: 'The Letter', img: 'first' }],
  confession: [
    { type: 'kinetic', text: '7 JANUARY *2009', size: 160 },
    { at: "Raju's letter", type: 'doc', heading: 'TO THE BOARD OF DIRECTORS', typed: 'It is with deep regret, and tremendous burden that I am carrying on my conscience, that I would like to bring the following facts to your notice:', stamp: { text: 'FULL CONFESSION', when: 'full confession', y: H * 0.8, size: 110 } },
  ],
  numbers: [
    { type: 'doc', heading: 'WHAT THE LETTER ADMITTED', rows: [{ label: 'Cash & bank balances', value: 'Rs. 5,040 cr', when: 'cash and bank', mark: true, tag: 'OVERSTATED', tagWhen: 'overstated' }] },
    { at: "That's over a billion", type: 'number', value: 1, prefix: '$', suffix: ' BILLION', when: 'billion', label: 'THAT SIMPLY DID NOT *EXIST', color: '#ff6a4d' },
    { at: 'Interest on deposits', type: 'doc', heading: 'WHAT THE LETTER ADMITTED', rows: [{ label: 'Interest on deposits', when: 'Interest', tag: 'FAKE', tagWhen: 'fake' }, { label: 'Money owed by customers', when: 'Money owed', tag: 'INFLATED', tagWhen: 'inflated' }] },
    { at: 'Even the latest', type: 'vs', title: 'OPERATING MARGIN', left: { value: '24%', label: 'CLAIMED', when: '24' }, right: { value: '3%', label: 'REAL', when: '3 percent', color: 'red' } },
  ],
  tiger: [
    { type: 'kinetic', text: 'A LINE THAT WOULD|BECOME *FAMOUS', font: 'Playfair Display', weight: 900, size: 110 },
    { at: 'It was like', type: 'quote', bg: 'tiger', text: 'It was like riding a tiger, not knowing how to get off without being eaten.', when: 'It was like', until: 'eaten', by: '— B. Ramalinga Raju, 2009' },
    { at: 'He also claimed', type: 'kinetic', text: 'NOT A SINGLE *RUPEE', sub: 'for himself, he claimed', stamp: { text: 'DISPUTED', when: 'dispute', y: H * 0.8, size: 110 } },
  ],
  aftermath: [
    { type: 'ride', values: [179, 179, 179, 40], drop: 'lost', big: '-78%', label: 'IN ONE DAY' },
    { at: 'And remember', type: 'profile', icon: 'trophy', name: 'THE GOVERNANCE|*TROPHY', stamp: { text: 'WITHDRAWN', when: 'taken back', x: W * 0.33, y: H * 0.5 } },
  ],

  // ---------------------------------------------------------------- Chapter 5
  chapter5: [{ type: 'chapter', num: 5, title: 'The Fall', img: 'campus' }],
  arrest: [
    { type: 'profile', name: 'RAMALINGA|*RAJU', role: '9 January 2009', stamp: { text: 'ARRESTED', when: 'arrested', x: W * 0.33, y: H * 0.52 } },
    { at: 'The Indian government', type: 'photo', img: ['court', 'mumbai', 'hitec'], text: 'THE GOVERNMENT *STEPS IN', pos: 'center', grade: 'cold' },
    { at: 'It dissolved', type: 'list', items: [{ text: 'BOARD DISSOLVED', when: 'dissolved' }, { text: 'NEW DIRECTORS', sub: 'appointed by the government', when: 'appointed', color: 'yellow' }] },
    { at: 'Not to save', type: 'swarm', img: 'campus', label: 'SAVE THE JOBS', size: 170, when: 'employees', sub: 'and the clients', red: 0 },
  ],
  mahindra: [
    { type: 'flow', title: '*2009', nodes: [{ text: 'TECH MAHINDRA', sub: 'won the bid', color: 'yellow', when: 'Tech Mahindra' }, { text: 'SATYAM', when: 'take over' }] },
    { at: 'The company survived', type: 'flow', nodes: [{ text: 'MAHINDRA SATYAM', when: 'renamed', icon: 'computer' }, { text: 'TECH MAHINDRA', when: 'merged', color: 'yellow' }] },
    { at: 'The name', type: 'tear', word: 'SATYAM', color: 'ink', when: 'name', tearWhen: 'disappeared', bg: 'campus' },
  ],
  verdict: [
    { type: 'number', value: 6, from: 1, suffix: ' YEARS', when: 'six years', label: 'IN COURT' },
    { at: 'In 2015', type: 'profile', name: 'RAJU, HIS BROTHER|& OTHERS', role: 'special court, 2015', stamp: { text: '7 YEARS', when: 'seven years', x: W * 0.33, y: H * 0.5 } },
    { at: 'And the auditors', type: 'kinetic', text: 'AND THE *AUDITORS?', size: 150 },
    { at: "Satyam's accounts", type: 'kinetic', text: '*PRICEWATERHOUSECOOPERS', size: 110, sub: "one of the world's biggest audit firms" },
    { at: 'Its auditors', type: 'list', items: [{ text: 'CONVICTED', sub: 'in India', when: 'convicted' }, { text: 'FINED', sub: 'by US regulators', when: 'fined', color: 'yellow' }] },
  ],

  // ---------------------------------------------------------------- Chapter 6 + outro
  chapter6: [{ type: 'chapter', num: 6, title: 'How Did Nobody Notice?', img: 'tech' }],
  checklist: [
    { type: 'kinetic', text: 'HOW DID A LIE THIS BIG|*SURVIVE FOR YEARS?' },
    { at: 'One', type: 'list', items: [{ num: '1', text: 'AUDITORS', sub: 'trusted paper, not banks', when: 'One' }, { num: '2', text: 'THE BOARD', sub: 'approved it all', when: 'Two' }, { num: '3', text: 'EVERYONE', sub: 'was making money', when: 'Three', color: 'yellow' }] },
    { at: 'When a share price', type: 'ride', up: true, values: [60, 90, 130, 190], drop: 'going up', label: 'NOBODY ASKS QUESTIONS' },
  ],
  legacy: [
    { type: 'photo', img: 'hitec', text: 'IT CHANGED *INDIAN BUSINESS', pos: 'center' },
    { at: 'Corporate governance', type: 'list', items: [{ text: 'TIGHTER RULES', when: 'tightened' }, { text: 'AUDITORS WATCHED', when: 'scrutiny' }, { text: '"SATYAM" = FRAUD', when: 'shorthand', color: 'yellow' }] },
  ],
  outro: [
    { type: 'tear', word: 'TRUTH', when: 'truth', tearWhen: 'lies' },
    { at: 'It started', type: 'bars', title: 'IT STARTED *SMALL', max: 130, bars: [{ label: 'REAL', value: 100 }, { label: 'REPORTED', value: 100, top: 8, when: 'reported' }] },
    { at: "And that's the lesson", type: 'kinetic', text: 'FRAUDS THIS BIG|NEVER BEGIN *BIG', font: 'Playfair Display', weight: 900, size: 120 },
    { at: 'They begin small', type: 'quote', bg: 'tiger', text: "They begin small... and then they become a tiger you can't get off.", when: 'They begin' },
  ],
  endcard: [
    { type: 'kinetic', text: 'NEXT ON *PAPER EMPIRES', size: 90 },
    { at: 'how the world', type: 'ride', values: [200, 200, 195, 120, 25], drop: 'nothing', label: '#1 TO NOTHING', big: 'NOKIA', seed: 7 },
    { at: 'Subscribe', type: 'kinetic', text: '*SUBSCRIBE', size: 180 },
  ],
};
