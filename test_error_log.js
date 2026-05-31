import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });

  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  const text = await page.evaluate(() => {
    return document.body.innerText;
  });
  console.log('BODY TEXT:', text.substring(0, 500));
  
  await browser.close();
})();
