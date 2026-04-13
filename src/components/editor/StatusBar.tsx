import { useEditorStore } from '@/stores/editor-store';

/**
 * Bottom status bar showing cursor position, errors, and compile status.
 */
export function StatusBar() {
  const isCompiling = useEditorStore((s) => s.isCompiling);
  const compilationErrors = useEditorStore((s) => s.compilationErrors);
  const activeFile = useEditorStore((s) => s.activeFile);

  const errorCount = compilationErrors.length;

  return (
    <div
      className="flex h-6 shrink-0 items-center justify-between border-t border-[#1e293b] bg-[#0a0e1a] px-3 text-[11px]"
      id="status-bar"
    >
      <div className="flex items-center gap-3">
        <span className="text-[#64748b]">{activeFile}</span>
        <span className="text-[#64748b]">Typst</span>
      </div>

      <div className="flex items-center gap-3">
        {isCompiling && (
          <span className="flex items-center gap-1 text-[#fbbf24]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#fbbf24]" />
            Compiling
          </span>
        )}
        {errorCount > 0 ? (
          <span className="text-[#f87171]">
            ✕ {errorCount} error{errorCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[#34d399]">✓ Ready</span>
        )}
      </div>
    </div>
  );
}
