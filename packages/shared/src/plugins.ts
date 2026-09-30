/**
 * Lightweight plugin registry (M5 extension points).
 * Plugins can register snippets, export formats, and AI prompt packs.
 */

export interface SnippetPlugin {
  id: string;
  label: string;
  insert: string;
  category?: string;
}

export interface ExportPlugin {
  id: string;
  label: string;
  extension: string;
  render: (files: { name: string; content: string }[]) => string;
}

export interface PromptPackPlugin {
  id: string;
  task: string;
  system: string;
}

export interface WriterPlugin {
  id: string;
  name: string;
  version: string;
  snippets?: SnippetPlugin[];
  exporters?: ExportPlugin[];
  prompts?: PromptPackPlugin[];
}

const plugins = new Map<string, WriterPlugin>();

export function registerPlugin(plugin: WriterPlugin): void {
  plugins.set(plugin.id, plugin);
}

export function listPlugins(): WriterPlugin[] {
  return [...plugins.values()];
}

export function collectSnippets(): SnippetPlugin[] {
  return [...plugins.values()].flatMap((p) => p.snippets ?? []);
}

export function collectExporters(): ExportPlugin[] {
  return [...plugins.values()].flatMap((p) => p.exporters ?? []);
}

export function collectPrompts(task: string): PromptPackPlugin[] {
  return [...plugins.values()].flatMap((p) =>
    (p.prompts ?? []).filter((x) => x.task === task),
  );
}

export function clearPlugins(): void {
  plugins.clear();
}

/** Built-in demo plugin — zip-like text bundle exporter + extra snippets. */
export const builtinPackPlugin: WriterPlugin = {
  id: "papex.builtin",
  name: "Papex Built-in Pack",
  version: "1.0.0",
  snippets: [
    {
      id: "contrib",
      label: "贡献点",
      insert: "\n\\begin{itemize}\n  \\item 贡献一\n  \\item 贡献二\n\\end{itemize}\n",
      category: "paper",
    },
    {
      id: "related",
      label: "相关工作段",
      insert: "\n\\subsection{相关工作}\n\n相关研究可从以下线索展开。\n",
      category: "paper",
    },
  ],
  exporters: [
    {
      id: "plain-bundle",
      label: "纯文本打包",
      extension: ".txt",
      render: (files) =>
        files.map((f) => `===== ${f.name} =====\n${f.content}`).join("\n\n"),
    },
  ],
  prompts: [
    {
      id: "contrib-bullets",
      task: "ideation",
      system: "从素材中提炼 3-5 条论文贡献点，每条一句话，不编造引用。",
    },
  ],
};

export function installBuiltinPlugin(): void {
  registerPlugin(builtinPackPlugin);
}
