import { useEditorStore, type FileEntry } from '@/stores/editor-store';
import { File, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function FileTreeItem({ entry, depth = 0 }: { entry: FileEntry; depth?: number }) {
  const activeFile = useEditorStore((s) => s.activeFile);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const [expanded, setExpanded] = useState(true);

  const isActive = entry.path === activeFile;
  const paddingLeft = 12 + depth * 16;

  if (entry.isDirectory) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 py-1 text-left text-sm text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
          style={{ paddingLeft }}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#64748b]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#64748b]" />
          )}
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#fbbf24]" />
          <span className="truncate">{entry.name}</span>
        </button>
        {expanded && entry.children?.map((child) => (
          <FileTreeItem key={child.path} entry={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => setActiveFile(entry.path)}
      className={`flex w-full items-center gap-1.5 py-1 text-left text-sm transition-colors ${
        isActive
          ? 'bg-[#1e293b] text-white'
          : 'text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white'
      }`}
      style={{ paddingLeft: paddingLeft + 18 }}
    >
      <File className="h-3.5 w-3.5 shrink-0 text-[#60a5fa]" />
      <span className="truncate">{entry.name}</span>
    </button>
  );
}

/**
 * File explorer sidebar — shows the project file tree.
 */
export function FileExplorer() {
  const files = useEditorStore((s) => s.files);
  const showFileExplorer = useEditorStore((s) => s.showFileExplorer);

  if (!showFileExplorer) return null;

  return (
    <div
      className="flex h-full w-56 shrink-0 flex-col border-r border-[#1e293b] bg-[#0a0e1a]"
      id="file-explorer"
    >
      <div className="border-b border-[#1e293b] px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
          Files
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.map((entry) => (
          <FileTreeItem key={entry.path} entry={entry} />
        ))}
      </div>
    </div>
  );
}
