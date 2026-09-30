# Contributing

感谢关注 Papex Writer！

## 开发流程

1. Fork 并克隆仓库
2. `npm install`
3. 建功能分支：`git checkout -b feat/xxx`
4. 开发并自测：`npm run lint && npm run typecheck && npm run test`
5. 若涉及导出契约：`npm run verify:example`
6. 提交 PR（使用 PR 模板）

## 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat: ` 新功能
- `fix: ` 缺陷修复
- `docs: ` 文档
- `chore: ` 工程杂项
- `refactor: ` 重构
- `test: ` 测试

## 设计约束

- 界面令牌与 papex `src/app/globals.css` 保持一致
- 元数据契约必须遵循 `papex-latex/papex.schema.json`
- 转义与片段生成语义与 papex 网页 `latex-gen.ts` 一致（契约测试覆盖）

## 文档

文档位于 `docs/`（VitePress）。功能变更请同步更新对应指南页。

## License

贡献默认以 [Apache-2.0](LICENSE) 授权。
