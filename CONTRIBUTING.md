# 贡献指南

欢迎提交可复现的问题、文档修正和通用组件改进。较大的功能变更请先通过 issue 说明场景与范围。

## 本地开发

1. Fork 仓库并克隆你的 fork。
2. 执行 `nvm use`（或安装 Node.js 22）及 `npm ci`。
3. 创建分支，运行 `npm run dev`。
4. 修改后执行 `npm run format` 和 `npm run check`。
5. 提交 pull request，说明问题、修改内容、验证结果。UI 修改附截图。

## 代码约定

- 通用组件放在 `src/components/ui`；业务页面在 `src/pages`；数据适配器在 `src/services`；跨页面状态在 `src/stores`。
- 采用现有主题变量与 shadcn/Radix 组件，避免为单页重复维护控件。
- 下拉框必须使用标准 Select；遵循 [开发指南](docs/DEVELOPMENT.md)。
- 不引入真实业务名称、域名、账号数据或密钥。演示内容使用 `example.com`。
- bug 修复应测试有意义的边界行为，不为样式细节编写脆弱测试。
- 依赖修改同步提交 `package-lock.json`，不要提交 `node_modules` 或 `dist`。
- 提交信息描述目的，例如 `fix: prevent invalid article pagination`。

项目采用 MIT 许可；提交内容需由你拥有贡献权利，并保留第三方许可声明。
