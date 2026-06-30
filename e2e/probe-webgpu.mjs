// Quick probe — checks whether headless Chromium has WebGPU available
// and what the BlackHoleCanvas status resolves to on /black-hole.
import { chromium } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

async function probe(args) {
  const browser = await chromium.launch({ args });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'no-preference',
    });
    const page = await ctx.newPage();
    page.on('pageerror', (err) => console.error('  PAGEERROR:', err.message));
    page.on('console', (msg) => {
      const t = msg.type();
      if (t === 'error' || t === 'warning') {
        console.log(`  console.${t}:`, msg.text());
      }
    });

    await page.goto(`${baseURL}/black-hole`, { waitUntil: 'networkidle' });

    const result = await page.evaluate(async () => {
      const hasGpu = typeof navigator !== 'undefined' && !!navigator.gpu;
      let adapterInfo = null;
      let deviceOk = false;
      let preferredFormat = null;
      let lastError = null;
      if (hasGpu) {
        try {
          const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
          if (adapter) {
            adapterInfo = await adapter.requestAdapterInfo?.() || { vendor: '?', architecture: '?' };
            const device = await adapter.requestDevice();
            deviceOk = !!device;
            preferredFormat = navigator.gpu.getPreferredCanvasFormat();
          } else {
            lastError = 'no-adapter';
          }
        } catch (e) {
          lastError = String(e);
        }
      }
      const canvas = document.querySelector('canvas');
      return {
        hasGpu,
        adapterInfo,
        deviceOk,
        preferredFormat,
        lastError,
        canvasFound: !!canvas,
        canvasW: canvas?.width ?? 0,
        canvasH: canvas?.height ?? 0,
        bodyBg: getComputedStyle(document.body).backgroundColor,
      };
    });

    console.log(JSON.stringify(result, null, 2));
    await ctx.close();
  } finally {
    await browser.close();
  }
}

const argSets = [
  ['default', []],
  ['enable-unsafe-webgpu', ['--enable-unsafe-webgpu', '--enable-features=Vulkan,UseSkiaRenderer,WebGPU']],
  ['metal-only', ['--enable-unsafe-webgpu', '--use-angle=metal']],
];

for (const [name, args] of argSets) {
  console.log(`\n── ${name} ── args=${JSON.stringify(args)}`);
  try {
    await probe(args);
  } catch (e) {
    console.error(`  PROBE ERROR:`, e.message);
  }
}
