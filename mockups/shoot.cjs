const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const f of ['case-file', 'dashboard', 'map-timeline']) {
    await p.goto('file://' + __dirname + '/' + f + '.html');
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    await p.screenshot({ path: __dirname + '/' + f + '.png' });
  }
  await b.close();
})();
