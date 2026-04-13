import { StreamLanguage } from '@codemirror/language';

/**
 * A StreamParser-based Typst language mode for CodeMirror 6.
 * This provides basic syntax highlighting without requiring a full Lezer grammar.
 * Covers: comments, strings, math mode, headings, emphasis, labels, refs,
 * function calls, keywords, numbers, and operators.
 */
const typstStreamParser = StreamLanguage.define({
  name: 'typst',

  startState() {
    return {
      inMathBlock: false,
      inMathInline: false,
      inString: false,
      inLineComment: false,
      inBlockComment: false,
      blockCommentDepth: 0,
    };
  },

  token(stream, state) {
    // --- Block comment ---
    if (state.inBlockComment) {
      if (stream.match('/*')) {
        state.blockCommentDepth++;
        return 'blockComment';
      }
      if (stream.match('*/')) {
        state.blockCommentDepth--;
        if (state.blockCommentDepth <= 0) {
          state.inBlockComment = false;
          state.blockCommentDepth = 0;
        }
        return 'blockComment';
      }
      stream.next();
      return 'blockComment';
    }

    // --- Line comment ---
    if (stream.match('//')) {
      stream.skipToEnd();
      return 'lineComment';
    }

    // --- Start block comment ---
    if (stream.match('/*')) {
      state.inBlockComment = true;
      state.blockCommentDepth = 1;
      return 'blockComment';
    }

    // --- String ---
    if (stream.match('"')) {
      while (!stream.eol()) {
        const ch = stream.next();
        if (ch === '\\') {
          stream.next(); // skip escaped char
        } else if (ch === '"') {
          break;
        }
      }
      return 'string';
    }

    // --- Math block ($ ... $ with spaces -> display math) ---
    if (!state.inMathInline && !state.inMathBlock) {
      // Display math: $ at start of line after optional whitespace
      if (stream.sol() && stream.match(/^\$\s/)) {
        state.inMathBlock = true;
        return 'keyword';
      }
      // Inline math: $ not followed by space
      if (stream.match('$')) {
        state.inMathInline = true;
        return 'keyword';
      }
    } else if (state.inMathBlock) {
      if (stream.sol() && stream.match(/^\$/)) {
        state.inMathBlock = false;
        return 'keyword';
      }
      stream.next();
      return 'number'; // math content
    } else if (state.inMathInline) {
      if (stream.match('$')) {
        state.inMathInline = false;
        return 'keyword';
      }
      stream.next();
      return 'number'; // math content
    }

    // --- Headings (= at start of line) ---
    if (stream.sol() && stream.match(/^=+\s/)) {
      stream.skipToEnd();
      return 'heading';
    }

    // --- Labels: <label-name> ---
    if (stream.match(/<[a-zA-Z0-9_-]+>/)) {
      return 'labelName';
    }

    // --- References: @ref-name ---
    if (stream.match(/@[a-zA-Z0-9_:.-]+/)) {
      return 'labelName';
    }

    // --- Raw/code inline: `...` ---
    if (stream.match('`')) {
      while (!stream.eol()) {
        if (stream.next() === '`') break;
      }
      return 'string';
    }

    // --- Bold: *text* ---
    if (stream.match(/^\*[^*]+\*/)) {
      return 'strong';
    }

    // --- Italic: _text_ ---
    if (stream.match(/^_[^_]+_/)) {
      return 'emphasis';
    }

    // --- Function call: #function-name ---
    if (stream.match(/#[a-zA-Z][a-zA-Z0-9_-]*/)) {
      const word = stream.current().slice(1);
      const keywords = [
        'let', 'set', 'show', 'import', 'include', 'if', 'else',
        'for', 'while', 'break', 'continue', 'return', 'context',
      ];
      if (keywords.includes(word)) {
        return 'keyword';
      }
      return 'function(variableName)';
    }

    // --- Numbers ---
    if (stream.match(/^-?\d+(\.\d+)?(em|pt|mm|cm|in|%)?/)) {
      return 'number';
    }

    // --- Operators ---
    if (stream.match(/^[+\-*/=<>!&|:,;.]+/)) {
      return 'operator';
    }

    // --- List markers ---
    if (stream.sol() && stream.match(/^\s*[-+]\s/)) {
      return 'keyword';
    }

    // Skip anything else
    stream.next();
    return null;
  },
});

/**
 * Returns the CodeMirror Typst language extension.
 */
export function typstLanguage() {
  return typstStreamParser;
}
