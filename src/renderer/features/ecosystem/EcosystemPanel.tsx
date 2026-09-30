import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listPlugins, installBuiltinPlugin, collectExporters, collectSnippets } from "@shared/plugins";
import { healthCheck, fetchCategories } from "@shared/papex-cloud";
import { Cloud, Puzzle, Search } from "lucide-react";

export function EcosystemPanel() {
  const { writer, setAiOutput, setRightTab, setStatus } = useApp();
  const [baseUrl, setBaseUrl] = React.useState("https://api.papex.example.com");
  const [apiKey, setApiKey] = React.useState("");
  const [cloudState, setCloudState] = React.useState<string>("未检测");
  const [plugins, setPlugins] = React.useState(() => listPlugins());

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">生态（M5）</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Papex 云对接 · 本地/远程 LLM · 全文检索 · Git 面板 · 插件扩展
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="h-4 w-4" /> Papex 云对接
            </CardTitle>
            <CardDescription>可选。配置后可上传投稿包、拉取分类树</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="API Base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
            <Input
              placeholder="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const cfg = { baseUrl, apiKey, enabled: true };
                  const ok = await healthCheck(cfg);
                  setCloudState(ok ? "服务可达" : "不可达 / 未配置");
                  if (ok) {
                    try {
                      const cats = await fetchCategories(cfg);
                      setStatus(`分类 ${cats.length} 个`);
                    } catch (e) {
                      setStatus(`分类拉取失败：${(e as Error).message}`);
                    }
                  }
                }}
              >
                连通性检测
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setStatus("请先在「导出」生成 submission.tar.gz，再调用 uploadArchive()");
                  setRightTab("ai");
                  setAiOutput(
                    "云上传流程：\n1. 导出 submission.tar.gz\n2. uploadArchive(cfg, blob)\n\nAPI 脚手架已就绪，服务器地址需指向你的 Papex 实例。",
                  );
                }}
              >
                上传投稿包
              </Button>
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">状态：{cloudState}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Puzzle className="h-4 w-4" /> 插件
            </CardTitle>
            <CardDescription>snippet / 导出器 / AI 提示词包扩展点</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                installBuiltinPlugin();
                setPlugins(listPlugins());
                setStatus(
                  `已安装内置插件 · snippet ${collectSnippets().length} · exporter ${collectExporters().length}`,
                );
              }}
            >
              安装内置插件包
            </Button>
            <div className="space-y-1">
              {plugins.map((p) => (
                <div key={p.id} className="rounded-md border border-[hsl(var(--border))] p-2 text-xs">
                  <div className="font-medium">
                    {p.name} <span className="text-[hsl(var(--muted-foreground))]">v{p.version}</span>
                  </div>
                  <div className="text-[hsl(var(--muted-foreground))]">{p.id}</div>
                </div>
              ))}
              {!plugins.length && (
                <div className="text-xs text-[hsl(var(--muted-foreground))]">尚未加载插件</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" /> 本地 LLM
            </CardTitle>
            <CardDescription>
              当前 Provider：{writer.editor.ai.provider} @ {writer.editor.ai.baseUrl}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            在 AI 面板使用 Ollama / OpenAI 兼容 / Anthropic 端点。隐私说明见{" "}
            <code className="rounded bg-[hsl(var(--muted))] px-1 text-xs">docs/reference/ai-privacy.md</code>。
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
