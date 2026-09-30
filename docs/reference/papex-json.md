# papex.json 字段

Papex Writer 严格遵循上游 Schema：

- Schema ID：`https://papex.dev/schema/papex.json/v1`
- 版本：`schemaVersion` = `1.0.0`

## 顶层字段

| 字段 | 说明 |
|------|------|
| `schemaVersion` | 必需，契约版本 |
| `paper` | 标题、摘要、关键词、分类、DOI、许可等 |
| `authors[]` | 作者、机构、ORCID、通讯/同等贡献 |
| `references[]` | 文献条目（BibTeX 映射） |
| `sections[]` | 章节文件与层级 |
| `appendices[]` | 附录 |
| `acknowledgments` / `funding` | 致谢与基金 |
| `build` | fontset / bibStyle / columns 等构建选项 |

完整字段说明见 papex 仓库 `papex-latex/papex.schema.json` 与 `PROJECT_PLAN.md` 附录。
