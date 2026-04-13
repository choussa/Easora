import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete';

/**
 * Typst built-in function completions for CodeMirror autocomplete.
 */
const typstFunctions: Completion[] = [
  // Page & document
  { label: '#set', type: 'keyword', detail: 'Set rule', info: 'Apply a style rule' },
  { label: '#show', type: 'keyword', detail: 'Show rule', info: 'Transform elements' },
  { label: '#let', type: 'keyword', detail: 'Binding', info: 'Define a variable or function' },
  { label: '#import', type: 'keyword', detail: 'Import', info: 'Import a package or file' },
  { label: '#include', type: 'keyword', detail: 'Include', info: 'Include another Typst file' },

  // Control flow
  { label: '#if', type: 'keyword', detail: 'Conditional' },
  { label: '#for', type: 'keyword', detail: 'For loop' },
  { label: '#while', type: 'keyword', detail: 'While loop' },
  { label: '#return', type: 'keyword', detail: 'Return value' },

  // Common functions
  { label: '#text', type: 'function', detail: 'text(..)', info: 'Style text content' },
  { label: '#page', type: 'function', detail: 'page(..)', info: 'Configure page layout' },
  { label: '#heading', type: 'function', detail: 'heading(..)', info: 'Create heading' },
  { label: '#figure', type: 'function', detail: 'figure(body, caption)', info: 'Create a figure' },
  { label: '#image', type: 'function', detail: 'image(path, ..)', info: 'Include an image' },
  { label: '#table', type: 'function', detail: 'table(columns, ..)', info: 'Create a table' },
  { label: '#link', type: 'function', detail: 'link(url)[text]', info: 'Create a hyperlink' },
  { label: '#block', type: 'function', detail: 'block(..)', info: 'Create a block element' },
  { label: '#align', type: 'function', detail: 'align(alignment)[body]', info: 'Align content' },
  { label: '#rect', type: 'function', detail: 'rect(..)', info: 'Draw a rectangle' },
  { label: '#circle', type: 'function', detail: 'circle(..)', info: 'Draw a circle' },
  { label: '#line', type: 'function', detail: 'line(..)', info: 'Draw a line' },
  { label: '#grid', type: 'function', detail: 'grid(columns, ..)', info: 'Create a grid layout' },
  { label: '#stack', type: 'function', detail: 'stack(dir, ..)', info: 'Stack elements' },
  { label: '#box', type: 'function', detail: 'box(..)', info: 'Inline container' },
  { label: '#pad', type: 'function', detail: 'pad(..)', info: 'Add padding' },
  { label: '#highlight', type: 'function', detail: 'highlight[text]', info: 'Highlight text' },
  { label: '#strike', type: 'function', detail: 'strike[text]', info: 'Strikethrough text' },
  { label: '#underline', type: 'function', detail: 'underline[text]', info: 'Underline text' },
  { label: '#emph', type: 'function', detail: 'emph[text]', info: 'Emphasize text' },
  { label: '#strong', type: 'function', detail: 'strong[text]', info: 'Bold text' },
  { label: '#raw', type: 'function', detail: 'raw(text, ..)', info: 'Raw/code text' },
  { label: '#enum', type: 'function', detail: 'enum(..)', info: 'Enumerated list' },
  { label: '#list', type: 'function', detail: 'list(..)', info: 'Bullet list' },
  { label: '#outline', type: 'function', detail: 'outline(..)', info: 'Table of contents' },
  { label: '#bibliography', type: 'function', detail: 'bibliography(path)', info: 'Bibliography' },
  { label: '#cite', type: 'function', detail: 'cite(label)', info: 'Cite a reference' },
  { label: '#pagebreak', type: 'function', detail: 'pagebreak()', info: 'Insert page break' },
  { label: '#v', type: 'function', detail: 'v(length)', info: 'Vertical spacing' },
  { label: '#h', type: 'function', detail: 'h(length)', info: 'Horizontal spacing' },
  { label: '#par', type: 'function', detail: 'par(..)', info: 'Paragraph settings' },
  { label: '#counter', type: 'function', detail: 'counter(..)', info: 'Counter access' },
  { label: '#numbering', type: 'function', detail: 'numbering(..)', info: 'Numbering format' },
  { label: '#math.equation', type: 'function', detail: 'math.equation(..)', info: 'Equation settings' },
];

/**
 * CodeMirror autocomplete source for Typst.
 */
function typstCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/#[a-zA-Z.]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  return {
    from: word.from,
    options: typstFunctions,
    validFor: /^#[a-zA-Z.]*/,
  };
}

/**
 * CodeMirror extension for Typst autocompletion.
 */
export const typstCompletion = {
  override: [typstCompletionSource],
};
