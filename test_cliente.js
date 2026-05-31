import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });

  await page.goto('http://localhost:3000/cliente');
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
  const rects = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, button, input')).map(el => {
       const r = el.getBoundingClientRect();
       return `${el.tagName} ${el.textContent?.substring(0,20).trim()} : ${r.width}x${r.height} @ ${r.left},${r.top}`;
    }).filter(s => s.includes('@ 0,0') === false).slice(0, 10);
  });
  
  console.log('HTML SNIPPET:', html);
  console.log('CLIENTE RECTS:\n' + rects.join('\n'));
  
  await browser.close();
})();
