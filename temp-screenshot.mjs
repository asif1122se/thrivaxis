import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Desktop
  const pageDesktop = await context.newPage();
  await pageDesktop.setViewportSize({ width: 1440, height: 900 });
  await pageDesktop.goto('http://localhost:3001');
  // Wait for 3D canvas and GSAP animations to settle
  await pageDesktop.waitForTimeout(3000);
  await pageDesktop.screenshot({ path: '/Users/hamid/.gemini/antigravity-ide/brain/84071e4a-0d05-40e3-90cd-e6237062d44d/screenshot-desktop.png', fullPage: true, animations: 'disabled', timeout: 60000 });

  // Mobile
  const pageMobile = await context.newPage();
  await pageMobile.setViewportSize({ width: 390, height: 844 });
  await pageMobile.goto('http://localhost:3001');
  await pageMobile.waitForTimeout(3000);
  await pageMobile.screenshot({ path: '/Users/hamid/.gemini/antigravity-ide/brain/84071e4a-0d05-40e3-90cd-e6237062d44d/screenshot-mobile.png', fullPage: true, animations: 'disabled', timeout: 60000 });

  await browser.close();
  console.log('Screenshots captured successfully.');
})();
