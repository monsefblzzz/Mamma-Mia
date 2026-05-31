import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });

  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  const oversized = await page.evaluate(() => {
    const ww = document.body.clientWidth;
    const all = document.querySelectorAll('*');
    const over = [];
    all.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > ww && !el.tagName.match(/HTML|BODY|MAIN|DIV/)) {
        over.push(`${el.tagName}#${el.id}.${el.className} : ${rect.width}`);
      }
    });
    return over.slice(0, 10);
  });
  console.log(`OVERSIZED:\n${oversized.join('\n')}`);
  
  await browser.close();
})();
