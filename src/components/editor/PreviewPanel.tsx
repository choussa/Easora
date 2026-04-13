import { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react';

/**
 * Preview panel — renders the compiled SVG output from Typst.
 * Displays a loading state while the WASM engine initialises,
 * a spinner while compiling, and error details if compilation fails.
 */
export function PreviewPanel() {
  const svgOutput = useEditorStore((s) => s.svgOutput);
  const isCompiling = useEditorStore((s) => s.isCompiling);
  const workerReady = useEditorStore((s) => s.workerReady);
  const compilationErrors = useEditorStore((s) => s.compilationErrors);
  const previewScale = useEditorStore((s) => s.previewScale);
  const setPreviewScale = useEditorStore((s) => s.setPreviewScale);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = useCallback(() => setPreviewScale(Math.min(previewScale + 0.1, 3)), [previewScale, setPreviewScale]);
  const zoomOut = useCallback(() => setPreviewScale(Math.max(previewScale - 0.1, 0.3)), [previewScale, setPreviewScale]);
  const resetZoom = useCallback(() => setPreviewScale(1), [setPreviewScale]);

  // Ctrl/Cmd+Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setPreviewScale(Math.max(0.3, Math.min(3, previewScale + (e.deltaY > 0 ? -0.05 : 0.05))));
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [previewScale, setPreviewScale]);

  const hasErrors = compilationErrors.length > 0 && !svgOutput;

  return (
    <div className="flex h-full flex-col bg-[#0f172a]" id="preview-panel">

      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#1e293b] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#94a3b8]">Preview</span>
          {!workerReady && (
            <span className="flex items-center gap-1 text-[10px] text-[#fbbf24]">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              Loading engine…
            </span>
          )}
          {workerReady && isCompiling && (
            <span className="flex items-center gap-1 text-[10px] text-[#60a5fa] animate-pulse">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              Compiling…
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white" title="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button onClick={resetZoom} className="min-w-[3rem] rounded px-1.5 py-0.5 text-center text-xs text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white" title="Reset zoom">
            {Math.round(previewScale * 100)}%
          </button>
          <button onClick={zoomIn} className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white" title="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button onClick={resetZoom} className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white" title="Reset view">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content area — white paper background so Typst black-on-white SVG is always visible */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-[#1e293b] p-4">
        {!workerReady ? (
          /* WASM still booting */
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#334155] border-t-[#818cf8]" />
            <p className="text-sm font-medium text-[#94a3b8]">Loading Typst engine…</p>
            <p className="text-xs text-[#475569]">Downloading WASM + fonts (~30 MB, once only)</p>
          </div>
        ) : hasErrors ? (
          /* Compilation errors */
          <div className="flex h-full items-start justify-center pt-12">
            <div className="max-w-lg rounded-xl border border-red-500/30 bg-red-500/10 p-6">
              <p className="text-sm font-semibold text-red-400">Compilation Error</p>
              {compilationErrors.map((err, i) => (
                <pre key={i} className="mt-2 whitespace-pre-wrap text-xs text-red-300/80">{err}</pre>
              ))}
            </div>
          </div>
        ) : svgOutput ? (
          /* Rendered Typst SVG — white paper, scale transform */
          <div
            className="mx-auto origin-top rounded shadow-2xl transition-transform duration-150"
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              backgroundColor: '#ffffff',
              display: 'inline-block',
            }}
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
        ) : (
          /* Waiting for first compile result */
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#334155] border-t-[#818cf8]" />
              <p className="text-sm text-[#64748b]">Compiling…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
