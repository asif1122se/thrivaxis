// Single-shot Playwright screenshot of /black-hole at 1440x900.
// Used to visually verify the WebGPU renderer during shader iteration.
//
// Usage:
//   node e2e/screenshot-blackhole.mjs [tag] [waitMs]
//
// Capturing at warmup+steady-state. Surfaces console errors and pageerrors
// so WGSL compile failures land in the terminal output.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const targetPath = '/black-hole';
const outDir = resolve(process.cwd(), 'e2e', '.screenshots');
const tag = process.argv[2] ?? 'current';
const waitMs = Number(process.argv[3] ?? 2500);

async function run() {
  await mkdir(outDir, { recursive: true });
  // Headless Chromium uses a software WebGPU backend that doesn't match what
  // a user actually sees (often renders pure black). Default to headed mode
  // so we get the real GPU; pass HEADLESS=1 to override for CI.
  const headless = process.env.HEADLESS === '1';
  const browser = await chromium.launch({
    headless,
    args: [
      '--enable-unsafe-webgpu',
      '--enable-features=Vulkan,UseSkiaRenderer,WebGPU',
    ],
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
      if (t === 'error' || t === 'warning') {
        console.error(`CONSOLE.${t.toUpperCase()}:`, msg.text());
        if (t === 'error') errors.push(`console.error: ${msg.text()}`);
      }
    });

    const url = `${baseURL}${targetPath}`;
    console.log(`→ ${url}  wait=${waitMs}ms  tag=${tag}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

    // Wait for the canvas to be sized to its container (means ResizeObserver
    // and renderer init have run). Falls back to fixed wait if it never resolves.
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
      const c = document.querySelector('canvas');
      if (!c) return { canvas: null };
      // Sample one pixel from the visible canvas via 2d copy
      const tmp = document.createElement('canvas');
      tmp.width = 4;
      tmp.height = 4;
      const ctx = tmp.getContext('2d');
      ctx.drawImage(c, 0, 0, c.width, c.height, 0, 0, 4, 4);
      const data = ctx.getImageData(0, 0, 4, 4).data;
      const samples = [];
      for (let i = 0; i < data.length; i += 4) {
        samples.push(`(${data[i]},${data[i + 1]},${data[i + 2]})`);
      }
      return { width: c.width, height: c.height, opacity: getComputedStyle(c).opacity, samples };
    });
    console.log('  canvas:', JSON.stringify(diag));

    const file = `${outDir}/blackhole__${tag}.png`;
    await page.screenshot({ path: file, fullPage: false });
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
