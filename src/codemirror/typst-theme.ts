import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

/**
 * Dark theme for the Typst code editor, matching the app's dark UI.
 */
export const typstThemeDark = EditorView.theme(
  {
    '&': {
      color: '#e2e8f0',
      backgroundColor: '#0a0e1a',
      fontSize: '14px',
      height: '100%',
    },
    '.cm-content': {
      caretColor: '#818cf8',
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      padding: '16px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#818cf8',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#334155',
    },
    '.cm-panels': {
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
    },
    '.cm-panels.cm-panels-top': {
      borderBottom: '1px solid #1e293b',
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: '1px solid #1e293b',
    },
    '.cm-searchMatch': {
      backgroundColor: '#fbbf2433',
      outline: '1px solid #fbbf2466',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#fbbf2455',
    },
    '.cm-activeLine': {
      backgroundColor: '#1e293b44',
    },
    '.cm-selectionMatch': {
      backgroundColor: '#33415544',
    },
    '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
      backgroundColor: '#33415566',
    },
    '.cm-gutters': {
      backgroundColor: '#0a0e1a',
      color: '#475569',
      border: 'none',
      paddingRight: '8px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1e293b44',
      color: '#94a3b8',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#64748b',
    },
    '.cm-tooltip': {
      border: '1px solid #1e293b',
      backgroundColor: '#0f172a',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: '#0f172a',
      borderBottomColor: '#0f172a',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
      },
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
  },
  { dark: true }
);

/**
 * Syntax highlight styles for Typst-like content.
 */
export const typstHighlightStyle = syntaxHighlighting(
  HighlightStyle.define([
    { tag: t.keyword, color: '#c084fc' },         // purple-400
    { tag: t.controlKeyword, color: '#c084fc' },
    { tag: t.operator, color: '#94a3b8' },
    { tag: t.punctuation, color: '#64748b' },
    { tag: t.bracket, color: '#94a3b8' },
    { tag: t.string, color: '#34d399' },           // emerald-400
    { tag: t.number, color: '#fb923c' },           // orange-400
    { tag: t.bool, color: '#fb923c' },
    { tag: t.comment, color: '#475569', fontStyle: 'italic' },
    { tag: t.lineComment, color: '#475569', fontStyle: 'italic' },
    { tag: t.blockComment, color: '#475569', fontStyle: 'italic' },
    { tag: t.name, color: '#e2e8f0' },
    { tag: t.variableName, color: '#e2e8f0' },
    { tag: t.function(t.variableName), color: '#60a5fa' }, // blue-400
    { tag: t.typeName, color: '#38bdf8' },         // sky-400
    { tag: t.className, color: '#38bdf8' },
    { tag: t.definition(t.variableName), color: '#60a5fa' },
    { tag: t.propertyName, color: '#a78bfa' },     // violet-400
    { tag: t.heading, color: '#f472b6', fontWeight: 'bold' }, // pink-400
    { tag: t.heading1, color: '#f472b6', fontWeight: 'bold', fontSize: '1.3em' },
    { tag: t.heading2, color: '#f472b6', fontWeight: 'bold', fontSize: '1.15em' },
    { tag: t.heading3, color: '#f472b6', fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic', color: '#a5b4fc' },
    { tag: t.strong, fontWeight: 'bold', color: '#e2e8f0' },
    { tag: t.link, color: '#60a5fa', textDecoration: 'underline' },
    { tag: t.labelName, color: '#fbbf24' },        // amber-400
    { tag: t.special(t.string), color: '#2dd4bf' }, // teal-400
    { tag: t.meta, color: '#64748b' },
    { tag: t.invalid, color: '#f87171' },          // red-400
  ])
);
