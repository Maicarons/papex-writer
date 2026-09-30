import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { validateManifest } from "@latex-core/validate";
import type { PapexAuthor, PapexManifest } from "@latex-core/types";

export function MetaPanel() {
  const { manifest, setManifest, saveProject } = useApp();
  const validation = React.useMemo(() => validateManifest(manifest), [manifest]);

  const patchPaper = (key: keyof PapexManifest["paper"], value: unknown) => {
    setManifest({ ...manifest, paper: { ...manifest.paper, [key]: value } });
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">元数据</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              对应 papex.json · schema v1.0.0
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                validation.valid
                  ? "text-xs text-[hsl(var(--cta))]"
                  : "text-xs text-[hsl(var(--destructive))]"
              }
            >
              {validation.valid ? "校验通过" : `${validation.issues.length} 个问题`}
            </span>
            <Button size="sm" onClick={() => void saveProject()}>
              保存
            </Button>
          </div>
        </div>

        {!validation.valid && (
          <Card className="border-[hsl(var(--destructive))]">
            <CardContent className="pt-4">
              <ul className="space-y-1 text-xs text-[hsl(var(--destructive))]">
                {validation.issues.slice(0, 8).map((iss, i) => (
                  <li key={i}>
                    {iss.path}: {iss.message}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">论文</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="标题">
              <Input
                value={manifest.paper.title}
                onChange={(e) => patchPaper("title", e.target.value)}
              />
            </Field>
            <Field label="副标题">
              <Input
                value={manifest.paper.subtitle ?? ""}
                onChange={(e) => patchPaper("subtitle", e.target.value)}
              />
            </Field>
            <Field label="摘要">
              <Textarea
                rows={6}
                value={manifest.paper.abstract}
                onChange={(e) => patchPaper("abstract", e.target.value)}
              />
            </Field>
            <Field label="关键词（逗号分隔）">
              <Input
                value={(manifest.paper.keywords ?? []).join(", ")}
                onChange={(e) =>
                  patchPaper(
                    "keywords",
                    e.target.value
                      .split(/[,,]/)
                      .map((k) => k.trim())
                      .filter(Boolean),
                  )
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="主分类">
                <Input
                  value={manifest.paper.primaryCategoryId}
                  onChange={(e) => patchPaper("primaryCategoryId", e.target.value)}
                />
              </Field>
              <Field label="许可">
                <Input
                  value={manifest.paper.license ?? ""}
                  onChange={(e) => patchPaper("license", e.target.value)}
                />
              </Field>
              <Field label="DOI">
                <Input
                  value={manifest.paper.doi ?? ""}
                  onChange={(e) => patchPaper("doi", e.target.value)}
                />
              </Field>
              <Field label="Venue">
                <Input
                  value={manifest.paper.venue ?? ""}
                  onChange={(e) => patchPaper("venue", e.target.value)}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">作者</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {manifest.authors.map((a, i) => (
              <div key={i} className="rounded-lg border border-[hsl(var(--border))] p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="姓名">
                    <Input
                      value={a.name}
                      onChange={(e) => {
                        const authors = [...manifest.authors] as PapexAuthor[];
                        authors[i] = { ...a, name: e.target.value };
                        setManifest({ ...manifest, authors });
                      }}
                    />
                  </Field>
                  <Field label="机构">
                    <Input
                      value={a.affiliation ?? ""}
                      onChange={(e) => {
                        const authors = [...manifest.authors] as PapexAuthor[];
                        authors[i] = { ...a, affiliation: e.target.value };
                        setManifest({ ...manifest, authors });
                      }}
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      value={a.email ?? ""}
                      onChange={(e) => {
                        const authors = [...manifest.authors] as PapexAuthor[];
                        authors[i] = { ...a, email: e.target.value };
                        setManifest({ ...manifest, authors });
                      }}
                    />
                  </Field>
                  <Field label="ORCID">
                    <Input
                      value={a.orcid ?? ""}
                      onChange={(e) => {
                        const authors = [...manifest.authors] as PapexAuthor[];
                        authors[i] = { ...a, orcid: e.target.value };
                        setManifest({ ...manifest, authors });
                      }}
                    />
                  </Field>
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={!!a.corresponding}
                    onChange={(e) => {
                      const authors = [...manifest.authors] as PapexAuthor[];
                      authors[i] = { ...a, corresponding: e.target.checked };
                      setManifest({ ...manifest, authors });
                    }}
                  />
                  通讯作者
                </label>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setManifest({
                  ...manifest,
                  authors: [
                    ...manifest.authors,
                    { name: "新作者", order: manifest.authors.length },
                  ] as PapexAuthor[],
                })
              }
            >
              添加作者
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">构建选项</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Field label="fontset">
              <Input
                value={manifest.build?.fontset ?? "windows"}
                onChange={(e) =>
                  setManifest({ ...manifest, build: { ...manifest.build, fontset: e.target.value } })
                }
              />
            </Field>
            <Field label="bibStyle">
              <Input
                value={manifest.build?.bibStyle ?? "numeric"}
                onChange={(e) =>
                  setManifest({
                    ...manifest,
                    build: {
                      ...manifest.build,
                      bibStyle: e.target.value as "numeric" | "authoryear",
                    },
                  })
                }
              />
            </Field>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
      {children}
    </label>
  );
}
