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

          <Separator
            className="w-[3px] cursor-col-resize bg-[#1e293b] transition-colors duration-150 hover:bg-[#818cf8] focus-visible:outline-none"
          />

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
