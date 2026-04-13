/**
 * Typst WASM compilation Web Worker.
 *
 * Communicates via postMessage:
 *   IN:  { type: 'compile', source: string, id: number }
 *   OUT: { type: 'result', id: number, svg: string | null, errors: string[] }
 *
 *   IN:  { type: 'pdf', source: string, id: number }
 *   OUT: { type: 'pdf', id: number, pdf: Uint8Array }
 *         { type: 'pdf-error', id: number, error: string }
 *
 * Falls back to a simple SVG text renderer when WASM hasn't loaded yet.
 */

let typstReady = false;
let $typst: any = null;

async function initTypst() {
  try {
    const { $typst: instance, TypstSnippet } = await import(
      '@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs'
    );
    $typst = instance;

    // Point compiler at local WASM binary
    $typst.setCompilerInitOptions({
      getModule: () =>
        new URL('/wasm/typst_ts_web_compiler_bg.wasm', self.location.origin).href,
    });

    // Point renderer at local WASM binary
    $typst.setRendererInitOptions({
      getModule: () =>
        new URL('/wasm/typst_ts_renderer_bg.wasm', self.location.origin).href,
    });

    // Load default font assets (fetched from typst CDN automatically)
    $typst.use(TypstSnippet.preloadFontAssets());

    typstReady = true;
    self.postMessage({ type: 'ready' });
    console.log('[typst-worker] WASM initialized successfully.');
  } catch (err) {
    console.warn('[typst-worker] WASM init failed, operating in fallback mode.', err);
    // Worker still serves fallback SVG — no crash.
  }
}

// ---------------------------------------------------------------------------
// Fallback renderer — plain-text SVG when WASM isn't loaded
// ---------------------------------------------------------------------------
function fallbackSvg(source: string): string {
  const lines = source.split('\n');
  const lineHeight = 20;
  const padding = 24;
  const width = 595;
  const height = Math.max(842, lines.length * lineHeight + padding * 2);

  const escaped = lines
    .map((line, i) => {
      const y = padding + (i + 1) * lineHeight;
      const text = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<text x="${padding}" y="${y}" font-family="serif" font-size="13" fill="#e2e8f0">${text}</text>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#0f172a" rx="4"/>
  <text x="${padding}" y="${padding - 6}" font-family="sans-serif" font-size="10" fill="#64748b">
    Preview — WASM loading... (full rendering requires fonts + WASM binaries)
  </text>
  ${escaped}
</svg>`;
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------
self.onmessage = async (e: MessageEvent) => {
  const { type, source, id } = e.data;

  if (type === 'compile') {
    if (typstReady && $typst) {
      try {
        const svg = await $typst.svg({ mainContent: source });
        self.postMessage({ type: 'result', id, svg, errors: [] });
      } catch (err: any) {
        // Surface the Typst error in the preview panel's error UI
        self.postMessage({
          type: 'result',
          id,
          svg: null,
          errors: [err?.message ?? String(err)],
        });
      }
    } else {
      const svg = fallbackSvg(source);
      self.postMessage({ type: 'result', id, svg, errors: [] });
    }
  }

  if (type === 'pdf') {
    if (typstReady && $typst) {
      try {
        const pdf = await $typst.pdf({ mainContent: source });
        self.postMessage({ type: 'pdf', id, pdf });
      } catch (err: any) {
        self.postMessage({
          type: 'pdf-error',
          id,
          error: err?.message ?? String(err),
        });
      }
    } else {
      self.postMessage({
        type: 'pdf-error',
        id,
        error: 'Typst WASM not ready — cannot export PDF yet.',
      });
    }
  }
};

// Kick off WASM initialisation immediately
initTypst();
