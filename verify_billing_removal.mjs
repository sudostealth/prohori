import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to homepage...");
  await page.goto('http://localhost:3000');

  console.log("Taking screenshot of homepage...");
  await page.screenshot({ path: '/home/jules/verification/homepage.png', fullPage: true });

  console.log("Navigating to signup page...");
  await page.goto('http://localhost:3000/auth/signup');

  console.log("Taking screenshot of signup page...");
  await page.screenshot({ path: '/home/jules/verification/signup.png' });

  await browser.close();
  console.log("Done.");
})();
