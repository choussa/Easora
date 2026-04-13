import { create } from 'zustand';

export interface FileEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: FileEntry[];
}

interface EditorState {
  // Source
  source: string;
  setSource: (s: string) => void;

  // Preview
  svgOutput: string | null;
  compilationErrors: string[];
  isCompiling: boolean;
  workerReady: boolean;
  setCompilationResult: (svg: string | null, errors: string[]) => void;
  setIsCompiling: (v: boolean) => void;
  setWorkerReady: (v: boolean) => void;

  // Files
  files: FileEntry[];
  setFiles: (files: FileEntry[]) => void;
  activeFile: string;
  setActiveFile: (path: string) => void;

  // UI
  previewScale: number;
  setPreviewScale: (scale: number) => void;
  showFileExplorer: boolean;
  toggleFileExplorer: () => void;
  showErrorConsole: boolean;
  toggleErrorConsole: () => void;
}

const DEFAULT_SOURCE = `#set page(paper: "a4", margin: 2cm)
#set text(font: "Linux Libertine", size: 11pt)
#set heading(numbering: "1.1.")

= Welcome to Stitch UI

This is a _Typst_ document rendered *live* in your browser using WebAssembly.

== Features

- Instant preview as you type
- Syntax highlighting with CodeMirror 6
- Client-side PDF export
- No server required

== Math Support

The famous Euler's identity:

$ e^(i pi) + 1 = 0 $

And an integral:

$ integral_0^infinity e^(-x^2) dif x = sqrt(pi) / 2 $
`;

export const useEditorStore = create<EditorState>((set) => ({
  // Source
  source: DEFAULT_SOURCE,
  setSource: (source) => set({ source }),

  // Preview
  svgOutput: null,
  compilationErrors: [],
  isCompiling: false,
  workerReady: false,
  setCompilationResult: (svgOutput, compilationErrors) =>
    set({ svgOutput, compilationErrors, isCompiling: false }),
  setIsCompiling: (isCompiling) => set({ isCompiling }),
  setWorkerReady: (workerReady) => set({ workerReady }),

  // Files
  files: [
    { path: 'main.typ', name: 'main.typ', isDirectory: false },
  ],
  setFiles: (files) => set({ files }),
  activeFile: 'main.typ',
  setActiveFile: (activeFile) => set({ activeFile }),

  // UI
  previewScale: 1,
  setPreviewScale: (previewScale) => set({ previewScale }),
  showFileExplorer: true,
  toggleFileExplorer: () => set((s) => ({ showFileExplorer: !s.showFileExplorer })),
  showErrorConsole: false,
  toggleErrorConsole: () => set((s) => ({ showErrorConsole: !s.showErrorConsole })),
}));
