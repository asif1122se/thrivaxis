// Single-shot Playwright screenshot of /homepage-demo-sdf at 1440x900.
// Mirrors e2e/screenshot-blackhole.mjs but for the multi-canvas SDF homepage.
//
// Usage:
//   node e2e/screenshot-sdf.mjs [tag] [waitMs] [scrollY]
//
// Capturing at warmup+steady-state. Surfaces console errors and pageerrors
// so WGSL compile failures land in the terminal output. Optional scrollY
// (e.g. 2400) lets us hit the capability cards / process / work sections.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const targetPath = '/homepage-demo-sdf';
const outDir = resolve(process.cwd(), 'e2e', '.screenshots');
const tag = process.argv[2] ?? 'current';
const waitMs = Number(process.argv[3] ?? 2500);
const scrollY = Number(process.argv[4] ?? 0);
const fullPage = process.env.FULL_PAGE === '1';

async function run() {
  await mkdir(outDir, { recursive: true });
  const headless = process.env.HEADLESS === '1';
  const browser = await chromium.launch({
    headless,
    args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan,UseSkiaRenderer,WebGPU'],
  });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
    });
    const page = await ctx.newPage();

    const errors = [];
    page.on('pageerror', (err) => {
      console.error('PAGEERROR:', err.message);
      errors.push(`pageerror: ${err.message}`);
    });
    page.on('console', (msg) => {
      const t = msg.type();
      if (t === 'error' || t === 'warning' || t === 'info' || t === 'log') {
        console.error(`CONSOLE.${t.toUpperCase()}:`, msg.text());
        if (t === 'error') errors.push(`console.error: ${msg.text()}`);
      }
    });

    const url = `${baseURL}${targetPath}`;
    console.log(`→ ${url}  wait=${waitMs}ms  scroll=${scrollY}  tag=${tag}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    if (scrollY > 0) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    }

    // Wait for the hero canvas to be sized.
    await page
      .waitForFunction(
        () => {
          const c = document.querySelector('canvas');
          return c && c.width > 600 && c.height > 400;
        },
        { timeout: 10_000 },
      )
      .catch(() => console.warn('  canvas-resize wait timed out'));

    await page.waitForTimeout(waitMs);

    const diag = await page.evaluate(() => {
      const cs = Array.from(document.querySelectorAll('canvas'));
      return {
        canvasCount: cs.length,
        canvases: cs.map((c) => {
          // Sample a few pixels from the canvas to confirm it's rendered, not all-black.
          const tmp = document.createElement('canvas');
          tmp.width = 8;
          tmp.height = 8;
          const ctx = tmp.getContext('2d');
          let samples = [];
          let nonBlack = 0;
          try {
            ctx.drawImage(c, 0, 0, c.width, c.height, 0, 0, 8, 8);
            const data = ctx.getImageData(0, 0, 8, 8).data;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i] + data[i + 1] + data[i + 2] > 12) nonBlack++;
            }
            samples = [`${data[0]},${data[1]},${data[2]}`, `${data[100]},${data[101]},${data[102]}`];
          } catch (e) {
            samples = [`err:${String(e).slice(0, 40)}`];
          }
          return {
            w: c.width,
            h: c.height,
            opacity: getComputedStyle(c).opacity,
            nonBlack,
            samples,
          };
        }),
      };
    });
    console.log('  canvases:', JSON.stringify(diag, null, 2));

    const file = `${outDir}/sdf-home__${tag}.png`;
    // Pause Three.js rendering before screenshot so readPixels doesn't contend
    // with Playwright's screenshot pipeline.
    await page.evaluate(() => {
      // biome-ignore lint/suspicious/noExplicitAny: probing global runtime state
      const w = window;
      w.__pausedRaf = window.requestAnimationFrame;
      window.requestAnimationFrame = () => 0;
    });
    await page.waitForTimeout(150);
    await page.screenshot({ path: file, fullPage, animations: 'disabled', timeout: 60_000 });
    console.log(`saved ${file.replace(outDir + '/', '')}`);

    if (errors.length) {
      console.error(`\n${errors.length} error(s) during page load — see above.`);
      process.exitCode = 2;
    }

    await ctx.close();
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
