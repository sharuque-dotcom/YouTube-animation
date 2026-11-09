// Cold open, version 3: documentary ("Netflix") style, as a shot list.
const HUBS = [[77.59, 12.97], [78.49, 17.39], [73.86, 18.52], [80.27, 13.08], [72.88, 19.08], [77.03, 28.46]];

export const shots = {
  letter: [
    { type: 'still', img: 'first', super: { text: 'HYDERABAD, INDIA', sub: '7 January 2009', when: 'January' } },
    { at: 'the chairman', type: 'still', img: 'tech', zoom: [1.12, 1.24], pan: [[-0.02, 0.01], [0.015, -0.005]] },
    {
      at: 'sat down', type: 'macro', cut: 'blur', boom: 'exist',
      rows: [
        { text: 'To the Board of Directors,', when: 'wrote' },
        { text: 'It is with deep regret, and tremendous burden', typed: true, when: 'In it', typing: 2.6 },
        { text: 'that I am carrying on my conscience, that I would', typed: true, when: 'nobody', typing: 1.8 },
        { text: 'like to bring the following facts to your notice:', typed: true, when: 'possible', typing: 1.2 },
        { text: '', when: 0 },
        { text: 'Cash and bank balances', when: 'billions', amount: 'Rs. 5,361 crore', amountDelay: 0.9, underline: 'bank', vanish: 'exist' },
      ],
      focus: [{ row: 0 }, { row: 1, when: 'In it' }, { row: 2, when: 'nobody' }, { row: 5, when: 'billions' }],
    },
  ],
  crash: [
    { type: 'screen', drop: 'crashed', boom: 'crashed', super: { text: 'BY EVENING', when: 'evening' } },
    { at: 'Fifty thousand', type: 'lights', figure: '50,000', caption: 'EMPLOYEES', when: 'Fifty', out: 'jobs', count: 700, img: 'tech', cut: 'blur' },
    { at: "And India's", type: 'night', from: [62, 22, 5.5], to: [78, 18, 15], hubs: HUBS, hubsWhen: 'industry', doubt: 'suspicion', line: 'the pride of the nation', cut: 'blur' },
  ],
  truth: [
    { type: 'statement', text: 'The strangest part?' },
    { at: "The company's name", type: 'reveal', word: 'SATYAM', when: 'Satyam', img: 'tech', under: { text: 'सत्यम्', when: 'Sanskrit' }, then: { word: 'truth.', when: 'Truth' }, boom: 'Truth', cut: 'blur' },
  ],
  title: [
    { type: 'titlecard', title: 'PAPER EMPIRES', sub: 'EPISODE ONE · THE COMPANY CALLED TRUTH', boom: 0.2 },
  ],
};
