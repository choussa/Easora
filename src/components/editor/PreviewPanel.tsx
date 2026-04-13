import { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/**
 * Preview panel — renders the compiled SVG output from Typst.
 * Supports zoom in/out and scroll.
 */
export function PreviewPanel() {
  const svgOutput = useEditorStore((s) => s.svgOutput);
  const isCompiling = useEditorStore((s) => s.isCompiling);
  const compilationErrors = useEditorStore((s) => s.compilationErrors);
  const previewScale = useEditorStore((s) => s.previewScale);
  const setPreviewScale = useEditorStore((s) => s.setPreviewScale);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = useCallback(() => {
    setPreviewScale(Math.min(previewScale + 0.1, 3));
  }, [previewScale, setPreviewScale]);

  const zoomOut = useCallback(() => {
    setPreviewScale(Math.max(previewScale - 0.1, 0.3));
  }, [previewScale, setPreviewScale]);

  const resetZoom = useCallback(() => {
    setPreviewScale(1);
  }, [setPreviewScale]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setPreviewScale(Math.max(0.3, Math.min(3, previewScale + delta)));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [previewScale, setPreviewScale]);

  const hasErrors = compilationErrors.length > 0 && !svgOutput;

  return (
    <div className="flex h-full flex-col bg-[#0f172a]" id="preview-panel">
      {/* Zoom controls */}
      <div className="flex items-center justify-between border-b border-[#1e293b] px-3 py-1.5">
        <span className="text-xs font-medium text-[#94a3b8]">Preview</span>
        <div className="flex items-center gap-1">
          {isCompiling && (
            <span className="mr-2 text-xs text-[#fbbf24] animate-pulse">
              Compiling...
            </span>
          )}
          <button
            onClick={zoomOut}
            className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="min-w-[3rem] rounded px-1.5 py-0.5 text-center text-xs text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
            title="Reset zoom"
          >
            {Math.round(previewScale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* SVG output */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4"
      >
        {hasErrors ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
              <p className="text-sm font-medium text-red-400">Compilation Error</p>
              {compilationErrors.map((err, i) => (
                <p key={i} className="mt-2 text-xs text-red-300/80">{err}</p>
              ))}
            </div>
          </div>
        ) : svgOutput ? (
          <div
            className="mx-auto transition-transform duration-150"
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
            }}
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#334155] border-t-[#818cf8]" />
              <p className="text-sm text-[#64748b]">Initializing Typst engine...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
