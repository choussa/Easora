import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
import { typstLanguage } from './typst-language';
import { typstThemeDark, typstHighlightStyle } from './typst-theme';
import { typstCompletion } from './typst-completion';

/**
 * Creates the CodeMirror 6 extension bundle for the Typst editor.
 *
 * @param onChange  Callback fired when the document text changes.
 * @param onSave   Callback fired on Ctrl+S.
 */
export function createEditorExtensions(
  onChange: (doc: string) => void,
  onSave?: () => void
) {
  return [
    basicSetup,
    typstLanguage(),
    typstThemeDark,
    typstHighlightStyle,
    autocompletion(typstCompletion),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
    keymap.of([
      {
        key: 'Mod-s',
        run: () => {
          onSave?.();
          return true;
        },
      },
    ]),
    EditorView.lineWrapping,
  ];
}
