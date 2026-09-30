import * as React from "react";
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightSpecialChars,
  placeholder as cmPlaceholder,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches, search } from "@codemirror/search";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
  StreamLanguage,
} from "@codemirror/language";

/** Lightweight LaTeX stream language (no lezer dependency) for highlighting. */
const latex = StreamLanguage.define({
  name: "latex",
  startState: () => ({ math: false }),
  token(stream, state) {
    if (stream.match(/\\begin\{[^}]+\}/)) return "keyword";
    if (stream.match(/\\end\{[^}]+\}/)) return "keyword";
    if (stream.match(/\\[a-zA-Z@]+\*?/)) return "keyword";
    if (stream.match(/\$[^$]+\$/)) return "string";
    if (stream.match(/\$\$/)) {
      state.math = !state.math;
      return "string";
    }
    if (state.math) {
      if (stream.next()) return "string";
    }
    if (stream.match(/%%?.*$/)) return "comment";
    if (stream.match(/[{}]/)) return "bracket";
    stream.next();
    return null;
  },
});

const highlightStyle = syntaxHighlighting(defaultHighlightStyle, { fallback: true });

export interface CompletionSourceData {
  citeKeys: string[];
  labels: string[];
  sectionFiles: string[];
  assets: string[];
}

export function buildLatexCompletions(data: CompletionSourceData) {
  const environments = [
    "abstract",
    "itemize",
    "enumerate",
    "figure",
    "table",
    "tabular",
    "equation",
    "align",
    "theorem",
    "lemma",
    "proof",
    "algorithm",
    "quote",
    "verbatim",
  ];
  const packages = [
    "amsmath",
    "amssymb",
    "graphicx",
    "booktabs",
    "hyperref",
    "ctex",
    "biblatex",
    "algorithm",
    "algpseudocode",
    "tikz",
    "xcolor",
  ];

  return (ctx: CompletionContext): CompletionResult | null => {
    const before = ctx.matchBefore(/\\[a-zA-Z]*\{?[\w:-]*$/);
    if (!before && !ctx.matchBefore(/\/[\w./-]*$/)) return null;

    const line = ctx.state.doc.lineAt(ctx.pos);
    const textBefore = line.text.slice(0, ctx.pos - line.from);

    // \cite{ or \ref{ or \input{ or \includegraphics{
    const brace = textBefore.match(/\\(cite|ref|eqref|input|includegraphics)\{([\w:./-]*)$/);
    if (brace) {
      const cmd = brace[1];
      let options: { label: string; type: string; detail?: string }[] = [];
      if (cmd === "cite") {
        options = data.citeKeys.map((k) => ({ label: k, type: "text", detail: "cite key" }));
      } else if (cmd === "ref" || cmd === "eqref") {
        options = data.labels.map((k) => ({ label: k, type: "text", detail: "label" }));
      } else if (cmd === "input") {
        options = data.sectionFiles.map((k) => ({ label: k, type: "text", detail: "file" }));
      } else if (cmd === "includegraphics") {
        options = data.assets.map((k) => ({ label: k, type: "text", detail: "asset" }));
      }
      return {
        from: ctx.pos - brace[2].length,
        options,
        validFor: /^[\w:./-]*$/,
      };
    }

    // \begin{
    const begin = textBefore.match(/\\begin\{(\w*)$/);
    if (begin) {
      return {
        from: ctx.pos - begin[1].length,
        options: environments.map((e) => ({
          label: e,
          type: "class",
          apply: (view, completion, from, to) => {
            const insert = `${e}}\n\n\\end{${e}}`;
            view.dispatch({ changes: { from, to, insert } });
          },
        })),
      };
    }

    // \usepackage{
    const pkg = textBefore.match(/\\usepackage\{(\w*)$/);
    if (pkg) {
      return {
        from: ctx.pos - pkg[1].length,
        options: packages.map((e) => ({ label: e, type: "class" })),
      };
    }

    // backslash commands
    const cmdMatch = textBefore.match(/\\([a-zA-Z]*)$/);
    if (cmdMatch) {
      const cmds = [
        "section",
        "subsection",
        "textbf",
        "emph",
        "cite",
        "ref",
        "label",
        "includegraphics",
        "caption",
        "begin",
        "end",
        "item",
        "footnote",
        "usepackage",
        "input",
        "maketitle",
      ];
      return {
        from: ctx.pos - cmdMatch[1].length - 1,
        options: cmds.map((c) => ({ label: `\\${c}`, type: "keyword", boost: 1 })),
      };
    }

    return null;
  };
}

export interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  completionData: CompletionSourceData;
  /** Jump target line (1-based) when errors are clicked. */
  revealLine?: number | null;
  onCursorChange?: (pos: number) => void;
  placeholder?: string;
}

export function CodeMirrorEditor({
  value,
  onChange,
  completionData,
  revealLine,
  onCursorChange,
  placeholder: ph,
}: CodeMirrorEditorProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<EditorView | null>(null);
  const onChangeRef = React.useRef(onChange);
  const completionRef = React.useRef(completionData);
  onChangeRef.current = onChange;
  completionRef.current = completionData;

  React.useEffect(() => {
    if (!hostRef.current) return;

    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      indentUnit.of("  "),
      bracketMatching(),
      closeBrackets(),
      autocompletion({
        override: [
          (ctx) => buildLatexCompletions(completionRef.current)(ctx),
        ],
        activateOnTyping: true,
      }),
      rectangularSelection(),
      crosshairCursor(),
      highlightSelectionMatches(),
      search({ top: true }),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      latex,
      highlightStyle,
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        indentWithTab,
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
        if (update.selectionSet && onCursorChange) {
          onCursorChange(update.state.selection.main.head);
        }
      }),
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "13px",
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
        ".cm-content": {
          fontFamily: "var(--font-mono, 'JetBrains Mono', Consolas, monospace)",
          padding: "12px 0",
          caretColor: "hsl(var(--primary))",
        },
        ".cm-gutters": {
          backgroundColor: "hsl(var(--muted))",
          color: "hsl(var(--muted-foreground))",
          border: "none",
        },
        ".cm-activeLine": { backgroundColor: "hsl(var(--accent) / 0.35)" },
        ".cm-activeLineGutter": { backgroundColor: "hsl(var(--accent))" },
        "&.cm-focused": { outline: "none" },
        ".cm-selectionBackground, ::selection": {
          backgroundColor: "hsl(var(--primary) / 0.25) !important",
        },
        ".cm-tooltip": {
          backgroundColor: "hsl(var(--popover))",
          color: "hsl(var(--popover-foreground))",
          border: "1px solid hsl(var(--border))",
        },
        ".cm-tooltip-autocomplete ul li[aria-selected]": {
          backgroundColor: "hsl(var(--accent))",
          color: "hsl(var(--accent-foreground))",
        },
      }),
    ];
    if (ph) extensions.push(cmPlaceholder(ph));

    const state = EditorState.create({ doc: value, extensions });
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // intentionally mount-once; value sync handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // external value sync
  React.useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // reveal line from error click
  React.useEffect(() => {
    const view = viewRef.current;
    if (!view || !revealLine || revealLine < 1) return;
    const line = view.state.doc.line(Math.min(revealLine, view.state.doc.lines));
    view.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: "center" }),
    });
    view.focus();
  }, [revealLine]);

  return <div ref={hostRef} className="h-full w-full overflow-hidden" />;
}
