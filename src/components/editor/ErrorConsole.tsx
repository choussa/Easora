import { useEditorStore } from '@/stores/editor-store';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Error console panel — slides up from the bottom of the editor.
 * Shows compilation errors/warnings from the Typst engine.
 */
export function ErrorConsole() {
  const compilationErrors = useEditorStore((s) => s.compilationErrors);
  const showErrorConsole = useEditorStore((s) => s.showErrorConsole);
  const toggleErrorConsole = useEditorStore((s) => s.toggleErrorConsole);

  if (!showErrorConsole) return null;

  return (
    <div
      className="flex h-40 shrink-0 flex-col border-t border-[#1e293b] bg-[#0a0e1a]"
      id="error-console"
    >
      <div className="flex items-center justify-between border-b border-[#1e293b] px-3 py-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
            Problems
          </span>
          {compilationErrors.length > 0 && (
            <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
              {compilationErrors.length}
            </span>
          )}
        </div>
        <button
          onClick={toggleErrorConsole}
          className="rounded p-0.5 text-[#64748b] transition-colors hover:bg-[#1e293b] hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {compilationErrors.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-[#475569]">No problems detected.</span>
          </div>
        ) : (
          <ul className="space-y-1">
            {compilationErrors.map((err, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded px-2 py-1 text-xs hover:bg-[#1e293b]"
              >
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
                <span className="text-red-300">{err}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
