// Headless screenshot harness — captures the homepage-demo at common
// viewports so we can eyeball responsiveness without standing up the
// full vitest/playwright test runner. Run with:
//   node e2e/screenshot-responsive.mjs [path]
// Defaults to /homepage-demo on http://localhost:3000.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const targetPath = process.argv[2] ?? '/homepage-demo';
const outDir = resolve(process.cwd(), 'e2e', '.screenshots');

const viewports = [
  { name: 'mobile-375', width: 375, height: 812 }, // iPhone SE-ish
  { name: 'mobile-414', width: 414, height: 896 }, // iPhone Plus
  { name: 'tablet-768', width: 768, height: 1024 }, // iPad portrait
  { name: 'laptop-1024', width: 1024, height: 768 }, // iPad landscape / small laptop
  { name: 'desktop-1440', width: 1440, height: 900 }, // standard laptop
  { name: 'desktop-1920', width: 1920, height: 1080 }, // full HD
];

// Vertical scroll waypoints to capture per viewport (fraction of full page).
const scrollStops = [0, 0.12, 0.28, 0.45, 0.6, 0.74, 0.88, 1];

async function run() {
  await mkdir(outDir, { recursive: true });
  const slug = targetPath.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
  console.log(`→ baseURL=${baseURL}  path=${targetPath}  out=${outDir}/${slug}__*`);

  const browser = await chromium.launch();
  try {
    for (const vp of viewports) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
      });
      const page = await ctx.newPage();
      page.on('pageerror', (err) => console.error(`[${vp.name}] pageerror:`, err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') console.error(`[${vp.name}] console.error:`, msg.text());
      });

      const url = `${baseURL}${targetPath}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
      // Allow shader + Lenis + GSAP one settled frame.
      await page.waitForTimeout(800);

      const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
      const winH = vp.height;
      const maxScroll = Math.max(0, totalH - winH);

      for (let i = 0; i < scrollStops.length; i++) {
        const stop = scrollStops[i];
        const y = Math.round(maxScroll * stop);
        await page.evaluate((sy) => window.scrollTo({ top: sy, behavior: 'instant' }), y);
        await page.waitForTimeout(450); // give canvas + reveals time to land
        const file = `${outDir}/${slug}__${vp.name}__${String(i).padStart(2, '0')}_${Math.round(stop * 100)}.png`;
        await page.screenshot({ path: file, fullPage: false });
        console.log(`  saved ${file.replace(outDir + '/', '')}`);
      }
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
