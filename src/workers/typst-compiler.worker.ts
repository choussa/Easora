/**
 * Typst WASM compilation Web Worker.
 *
 * Initialization protocol:
 *   FIRST message must be: { type: 'init', baseUrl: string }
 *   Worker responds with:  { type: 'ready' } when WASM + fonts are loaded
 *                          { type: 'init-error', error: string } if init fails
 *
 * Compilation protocol:
 *   IN:  { type: 'compile', source: string, id: number }
 *   OUT: { type: 'result',  id: number, svg: string | null, errors: string[] }
 *
 * PDF protocol:
 *   IN:  { type: 'pdf', source: string, id: number }
 *   OUT: { type: 'pdf',       id: number, pdf: Uint8Array }
 *        { type: 'pdf-error', id: number, error: string }
 */

let typstReady = false;
let $typst: any = null;

async function initTypst(baseUrl: string) {
  try {
    const { $typst: instance, TypstSnippet } = await import(
      '@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs'
    );
    $typst = instance;

    // Resolve WASM asset paths using the base URL passed from the main thread.
    // baseUrl is import.meta.env.BASE_URL (e.g. "/Easora/" or "/")
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const origin = self.location.origin;

    $typst.setCompilerInitOptions({
      getModule: () => `${origin}${base}wasm/typst_ts_web_compiler_bg.wasm`,
    });

    $typst.setRendererInitOptions({
      getModule: () => `${origin}${base}wasm/typst_ts_renderer_bg.wasm`,
    });

    // Fetch official Typst fonts from CDN (Linux Libertine, New Computer Modern, etc.)
    $typst.use(TypstSnippet.preloadFontAssets());

    typstReady = true;
    self.postMessage({ type: 'ready' });
    console.info('[typst-worker] Ready. base:', base);
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error('[typst-worker] Init failed:', msg);
    self.postMessage({ type: 'init-error', error: msg });
  }
}

// ---------------------------------------------------------------------------
// Fallback renderer — plain-text SVG shown while WASM is initialising
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
      const safe = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<text x="${padding}" y="${y}" font-family="serif" font-size="13" fill="#e2e8f0">${safe}</text>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#0f172a" rx="4"/>
  <text x="${padding}" y="16" font-family="sans-serif" font-size="10" fill="#64748b">Initialising Typst engine…</text>
  ${escaped}
</svg>`;
}

// ---------------------------------------------------------------------------
// Message router
// ---------------------------------------------------------------------------
self.onmessage = async (e: MessageEvent) => {
  const { type, source, id, baseUrl } = e.data;

  if (type === 'init') {
    await initTypst(baseUrl as string);
    return;
  }

  if (type === 'compile') {
    if (typstReady && $typst) {
      try {
        const svg: string = await $typst.svg({ mainContent: source });
        self.postMessage({ type: 'result', id, svg, errors: [] });
      } catch (err: any) {
        self.postMessage({
          type: 'result', id, svg: null,
          errors: [err?.message ?? String(err)],
        });
      }
    } else {
      self.postMessage({ type: 'result', id, svg: fallbackSvg(source), errors: [] });
    }
  }

  if (type === 'pdf') {
    if (typstReady && $typst) {
      try {
        const pdf: Uint8Array = await $typst.pdf({ mainContent: source });
        self.postMessage({ type: 'pdf', id, pdf });
      } catch (err: any) {
        self.postMessage({ type: 'pdf-error', id, error: err?.message ?? String(err) });
      }
    } else {
      self.postMessage({ type: 'pdf-error', id, error: 'Typst engine not ready yet — please wait.' });
    }
  }
};
