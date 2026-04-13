import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { useDebounce } from './useDebounce';

/**
 * React hook managing the Typst Web Worker lifecycle.
 *
 * Boot sequence:
 *  1. Worker spawned
 *  2. Hook sends { type:'init', baseUrl } — worker starts WASM + font loading
 *  3. Worker replies { type:'ready' } — first queued compile is flushed
 *  4. Subsequent compiles are debounced at 600 ms
 */
export function useTypstCompiler() {
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);   // compile queued before ready
  const idRef = useRef(0);

  const source = useEditorStore((s) => s.source);
  const setCompilationResult = useEditorStore((s) => s.setCompilationResult);
  const setIsCompiling = useEditorStore((s) => s.setIsCompiling);
  const setWorkerReady = useEditorStore((s) => s.setWorkerReady);

  const debouncedSource = useDebounce(source, 600);

  // Internal: post a compile or queue it if the worker isn't ready yet
  const sendCompile = useCallback((src: string) => {
    if (!workerRef.current) return;
    if (!workerReadyRef.current) {
      pendingRef.current = src;         // will be sent when 'ready' arrives
      return;
    }
    const id = ++idRef.current;
    setIsCompiling(true);
    workerRef.current.postMessage({ type: 'compile', source: src, id });
  }, [setIsCompiling]);

  // Spawn worker once on mount
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/typst-compiler.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e) => {
      const data = e.data;

      if (data.type === 'ready') {
        workerReadyRef.current = true;
        setWorkerReady(true);
        // Flush any compile that arrived before WASM was ready
        if (pendingRef.current !== null) {
          const pending = pendingRef.current;
          pendingRef.current = null;
          const id = ++idRef.current;
          setIsCompiling(true);
          worker.postMessage({ type: 'compile', source: pending, id });
        }
      }

      if (data.type === 'init-error') {
        console.error('[typst] Worker init failed:', data.error);
        setWorkerReady(false);
      }

      if (data.type === 'result') {
        setCompilationResult(data.svg, data.errors ?? []);
      }

      if (data.type === 'pdf') {
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

    worker.onerror = (err) => {
      console.error('[typst] Worker uncaught error:', err.message);
    };

    workerRef.current = worker;

    // Send init with the base URL so the worker knows where to load WASMs from.
    // import.meta.env.BASE_URL is replaced at build time by Vite / Astro.
    worker.postMessage({ type: 'init', baseUrl: import.meta.env.BASE_URL ?? '/' });

    return () => {
      worker.terminate();
      workerRef.current = null;
      workerReadyRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-compile whenever debounced source changes
  useEffect(() => {
    if (!debouncedSource) return;
    sendCompile(debouncedSource);
  }, [debouncedSource, sendCompile]);

  const compilePdf = useCallback(() => {
    if (!workerRef.current || !workerReadyRef.current) return;
    workerRef.current.postMessage({ type: 'pdf', source, id: ++idRef.current });
  }, [source]);

  const forceCompile = useCallback(() => {
    sendCompile(source);
  }, [source, sendCompile]);

  return { compilePdf, forceCompile };
}
