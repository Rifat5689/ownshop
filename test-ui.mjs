import { chromium, devices } from 'playwright';

async function checkPage(url, device) {
  const browser = await chromium.launch();
  const context = await browser.newContext(device ? devices[device] : undefined);
  const page = await context.newPage();
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`Console Error: ${msg.text()}`);
  });
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Check for broken links
  const links = await page.$$eval('a', anchors => anchors.map(a => a.href));
  // Check for overflowing elements
  const overflows = await page.evaluate(() => {
    const isOverflowing = (el) => {
      return el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
    };
    return Array.from(document.querySelectorAll('*')).filter(isOverflowing).map(el => el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : ''));
  });

  console.log(`\n--- Results for ${url} on ${device || 'Desktop'} ---`);
  if (errors.length) console.log("Errors:", errors);
  if (overflows.length) console.log("Overflows:", overflows.slice(0, 5));
  
  await browser.close();
}

(async () => {
  await checkPage('http://localhost:5173', null);
  await checkPage('http://localhost:5173', 'iPhone 13');
  await checkPage('http://localhost:5174', null);
  await checkPage('http://localhost:5174', 'iPhone 13');
})();

