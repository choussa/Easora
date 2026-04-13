import { useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { createEditorExtensions } from '@/codemirror/extensions';
import { useEditorStore } from '@/stores/editor-store';

/**
 * CodeMirror 6 editor wrapper component.
 * Mounts the editor into a container div and syncs with Zustand store.
 */
export function CodeEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const source = useEditorStore((s) => s.source);
  const setSource = useEditorStore((s) => s.setSource);

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = createEditorExtensions(
      (doc) => setSource(doc),
      () => {
        // Ctrl+S save handler — for future backend integration
        console.log('[editor] Save triggered');
      }
    );

    const state = EditorState.create({
      doc: source,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run once on mount — source updates flow through CM's updateListener
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      id="code-editor-container"
    />
  );
}
