import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });

  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  const width = await page.evaluate(() => document.body.clientWidth);
  const height = await page.evaluate(() => document.body.clientHeight);
  console.log(`BODY SIZE: ${width}x${height}`);

  const mainRect = await page.evaluate(() => {
    const el = document.querySelector('main');
    if (!el) return 'no main';
    const rect = el.getBoundingClientRect();
    return `${rect.width}x${rect.height} @ ${rect.left},${rect.top}`;
  });
  console.log(`MAIN RECT: ${mainRect}`);
  
  const cardRects = await page.evaluate(() => {
    const cards = document.querySelectorAll('h4');
    return Array.from(cards).map(c => {
       const r = c.getBoundingClientRect();
       return `${c.innerText} : ${r.width}x${r.height} @ ${r.left},${r.top}`;
    }).slice(0, 5);
  });
  console.log(`CARD RECTS:\n${cardRects.join('\n')}`);
  
  await browser.close();
})();
