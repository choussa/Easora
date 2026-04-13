import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { useDebounce } from './useDebounce';

/**
 * React hook that manages the Typst Web Worker lifecycle.
 *
 * - Spawns the worker on mount
 * - Sends debounced source text for compilation
 * - Receives SVG / error results and pushes them into the Zustand store
 * - Provides a `compilePdf()` function for PDF export
 */
export function useTypstCompiler() {
  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);
  const source = useEditorStore((s) => s.source);
  const setCompilationResult = useEditorStore((s) => s.setCompilationResult);
  const setIsCompiling = useEditorStore((s) => s.setIsCompiling);

  const debouncedSource = useDebounce(source, 300);

  // Spawn worker on mount
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/typst-compiler.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e) => {
      const data = e.data;

      if (data.type === 'result') {
        setCompilationResult(data.svg, data.errors);
      }

      if (data.type === 'pdf') {
        // Trigger download
        const blob = new Blob([data.pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        a.click();
        URL.revokeObjectURL(url);
      }

      if (data.type === 'pdf-error') {
        console.error('[typst] PDF error:', data.error);
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [setCompilationResult]);

  // Compile when source changes (debounced)
  useEffect(() => {
    if (!workerRef.current || !debouncedSource) return;

    const id = ++idRef.current;
    setIsCompiling(true);
    workerRef.current.postMessage({ type: 'compile', source: debouncedSource, id });
  }, [debouncedSource, setIsCompiling]);

  const compilePdf = useCallback(() => {
    if (!workerRef.current) return;
    const id = ++idRef.current;
    workerRef.current.postMessage({ type: 'pdf', source, id });
  }, [source]);

  const forceCompile = useCallback(() => {
    if (!workerRef.current) return;
    const id = ++idRef.current;
    setIsCompiling(true);
    workerRef.current.postMessage({ type: 'compile', source, id });
  }, [source, setIsCompiling]);

  return { compilePdf, forceCompile };
}
