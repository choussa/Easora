import { useEditorStore } from '@/stores/editor-store';
import { useTypstCompiler } from '@/hooks/useTypstCompiler';
import {
  Play,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
  Sun,
  Moon,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Top toolbar with compile, export, sidebar toggle, and theme toggle.
 */
export function Toolbar() {
  const { compilePdf, forceCompile } = useTypstCompiler();
  const isCompiling = useEditorStore((s) => s.isCompiling);
  const showFileExplorer = useEditorStore((s) => s.showFileExplorer);
  const toggleFileExplorer = useEditorStore((s) => s.toggleFileExplorer);
  const toggleErrorConsole = useEditorStore((s) => s.toggleErrorConsole);
  const [isDark, setIsDark] = useState(true);

  return (
    <div
      className="flex h-10 shrink-0 items-center justify-between border-b border-[#1e293b] bg-[#0a0e1a] px-2"
      id="editor-toolbar"
    >
      {/* Left group */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleFileExplorer}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
          title={showFileExplorer ? 'Hide file explorer' : 'Show file explorer'}
        >
          {showFileExplorer ? (
            <PanelLeftClose className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="mx-1 h-4 w-px bg-[#1e293b]" />

        <button
          onClick={forceCompile}
          disabled={isCompiling}
          className="flex items-center gap-1.5 rounded bg-[#818cf8] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#6366f1] disabled:opacity-50"
          title="Recompile (Ctrl+Enter)"
        >
          <Play className="h-3 w-3" />
          {isCompiling ? 'Compiling...' : 'Compile'}
        </button>

        <button
          onClick={compilePdf}
          className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
          title="Export PDF"
        >
          <Download className="h-3.5 w-3.5" />
          PDF
        </button>
      </div>

      {/* Center: project title */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#e2e8f0]">Stitch UI</span>
        <span className="rounded-full bg-[#818cf8]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#818cf8]">
          Demo
        </span>
      </div>

      {/* Right group */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleErrorConsole}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
          title="Toggle error console"
        >
          <Terminal className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => {
            setIsDark((d) => !d);
            document.documentElement.classList.toggle('dark');
          }}
          className="rounded p-1 text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
          title="Toggle theme"
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
