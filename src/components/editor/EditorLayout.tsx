import { Panel, Group as PanelGroup, Separator } from 'react-resizable-panels';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';
import { FileExplorer } from './FileExplorer';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { ErrorConsole } from './ErrorConsole';

/**
 * Master editor layout — assembles the full IDE into a single view.
 *
 *   ┌──────────────────────────────────────────────┐
 *   │                  Toolbar                     │
 *   ├────────┬────────────────┬────────────────────┤
 *   │  File  │                │                    │
 *   │  Tree  │   CodeEditor   │   PreviewPanel     │
 *   │        │                │                    │
 *   ├────────┴────────────────┴────────────────────┤
 *   │               ErrorConsole                   │
 *   ├──────────────────────────────────────────────┤
 *   │                StatusBar                     │
 *   └──────────────────────────────────────────────┘
 */
export function EditorLayout() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0a0e1a]" id="editor-layout">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <FileExplorer />

        <PanelGroup orientation="horizontal" className="flex-1">
          <Panel defaultSize={50} minSize={25}>
            <CodeEditor />
          </Panel>

          <Separator className="group relative w-1 bg-[#1e293b] transition-colors hover:bg-[#818cf8]">
            <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
            <div className="absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#334155] transition-colors group-hover:bg-[#818cf8]" />
          </Separator>

          <Panel defaultSize={50} minSize={25}>
            <PreviewPanel />
          </Panel>
        </PanelGroup>
      </div>

      <ErrorConsole />
      <StatusBar />
    </div>
  );
}
