import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { validateManifest } from "@latex-core/validate";
import { buildArchiveFiles } from "@latex-core/generate";
import { Download, FileText, PackageCheck } from "lucide-react";

export function ExportPanel() {
  const { manifest, files, exportArchive, exportPdf, saveProject, status } = useApp();
  const validation = React.useMemo(() => validateManifest(manifest), [manifest]);

  const preview = React.useMemo(() => {
    try {
      return buildArchiveFiles(manifest, files, {
        templateTex: "% template",
        cls: "% cls",
      }).map((f) => f.name);
    } catch {
      return [];
    }
  }, [manifest, files]);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">导出</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            生成 Papex 兼容投稿包 submission.tar.gz
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageCheck className="h-4 w-4" /> 预检清单
            </CardTitle>
            <CardDescription>{status}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <CheckRow ok={validation.valid} label={validation.valid ? "papex.json schema 校验通过" : "papex.json 未通过校验"} />
            <CheckRow ok={manifest.authors.length > 0} label="作者信息完整" />
            <CheckRow ok={manifest.sections.length > 0} label="章节齐全" />
            <CheckRow
              ok={(manifest.paper.abstract ?? "").length > 20}
              label="摘要长度合理"
            />
            <CheckRow
              ok={(manifest.references ?? []).every((r) => !!r.key)}
              label="参考文献均有 cite key"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">将包含的文件（{preview.length}）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {preview.map((n) => (
                <Badge key={n} variant="secondary" className="font-mono text-[10px]">
                  {n}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="cta"
            onClick={() => {
              void saveProject();
              void exportArchive();
            }}
          >
            <Download className="h-3.5 w-3.5" /> 导出 submission.tar.gz
          </Button>
          <Button variant="outline" onClick={() => void exportPdf()}>
            <FileText className="h-3.5 w-3.5" /> 导出 PDF
          </Button>
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          导出产物写入项目 <code className="rounded bg-[hsl(var(--muted))] px-1">dist/</code>{" "}
          目录。结构与 papex-latex 提交包一致，可直接上传 Papex 平台。
        </p>
      </div>
    </div>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          "flex h-5 w-5 items-center justify-center rounded-full text-[10px] " +
          (ok
            ? "bg-[hsl(var(--cta))] text-white"
            : "bg-[hsl(var(--destructive))] text-white")
        }
      >
        {ok ? "✓" : "!"}
      </span>
      <span className="text-[hsl(var(--foreground))]">{label}</span>
    </div>
  );
}
