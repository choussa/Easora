/**
 * Typst WASM compilation Web Worker.
 *
 * Communicates via postMessage:
 *   IN:  { type: 'compile', source: string, id: number }
 *   OUT: { type: 'result', id: number, svg: string | null, errors: string[] }
 *
 *   IN:  { type: 'pdf', source: string, id: number }
 *   OUT: { type: 'pdf', id: number, pdf: Uint8Array }
 *
 * For the MVP, we use a simplified approach that falls back to a
 * placeholder SVG if typst.ts WASM modules aren't available yet,
 * since the full WASM pipeline requires fonts and binary assets.
 */

let typstReady = false;
let $typst: any = null;

async function initTypst() {
  try {
    const mod = await import('@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs');
    $typst = mod.$typst;

    $typst.setCompilerInitOptions({
      getModule: () =>
        new URL('/wasm/typst_ts_web_compiler_bg.wasm', self.location.origin).href,
    });
    $typst.setRendererInitOptions({
      getModule: () =>
        new URL('/wasm/typst_ts_renderer_bg.wasm', self.location.origin).href,
    });

    typstReady = true;
    self.postMessage({ type: 'ready' });
  } catch (err) {
    console.warn('[typst-worker] WASM modules not available, using fallback mode.', err);
    // Worker still operates — it will return placeholder output.
  }
}

/**
 * Generate a simple SVG placeholder when WASM is not loaded.
 */
function fallbackSvg(source: string): string {
  const lines = source.split('\n');
  const lineHeight = 20;
  const padding = 24;
  const width = 595; // A4-ish width in points
  const height = Math.max(842, lines.length * lineHeight + padding * 2);

  const escaped = lines
    .map((line, i) => {
      const y = padding + (i + 1) * lineHeight;
      const text = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<text x="${padding}" y="${y}" font-family="serif" font-size="14" fill="#e2e8f0">${text}</text>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#0f172a" rx="4"/>
    <text x="${padding}" y="${padding - 6}" font-family="sans-serif" font-size="10" fill="#64748b">Preview (WASM not loaded — install fonts + WASM binaries for full rendering)</text>
    ${escaped}
  </svg>`;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, source, id } = e.data;

  if (type === 'compile') {
    if (typstReady && $typst) {
      try {
        const svg = await $typst.svg({ mainContent: source });
        self.postMessage({ type: 'result', id, svg, errors: [] });
      } catch (err: any) {
        self.postMessage({
          type: 'result',
          id,
          svg: null,
          errors: [err?.message || String(err)],
        });
      }
    } else {
      // Fallback mode: render source as plain text in an SVG
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
          error: err?.message || String(err),
        });
      }
    } else {
      self.postMessage({
        type: 'pdf-error',
        id,
        error: 'Typst WASM modules not loaded. Cannot generate PDF.',
      });
    }
  }
};

// Kick off WASM init
initTypst();
