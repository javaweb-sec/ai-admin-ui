# GitHub 发布清单

## 首次公开前

- 确认根目录 MIT 许可适用于全部原创内容，确认从其他项目移入的内容有权公开；保留第三方许可。
- 确定 GitHub owner、仓库名称、简介和是否创建公开仓库。
- 运行 `npm ci` 与 `npm run check`；检查深浅色、窄屏、登录和文章编辑。
- 运行 `npm audit --registry=https://registry.npmjs.org`，评估结果，记录无法立即升级的依赖。
- 检查待提交文件：不含环境密钥、个人信息、业务数据、node_modules、dist 或 IDE 文件。
- 新建仓库后填写 package.json 的 repository、homepage、bugs；不要使用虚构链接。
- 推送后确认 CI 成功，启用分支保护与私密漏洞报告。

## 当前仓库

远程仓库：`git@github.com:javaweb-sec/ai-admin-ui.git`，默认分支 `main`。package.json 已配置对应 repository、homepage 与 bugs 链接。

## 提交流程

```bash
npm ci
npm run check
git add .
git diff --cached --stat
git diff --cached
# 审阅通过后：
git commit -m "feat: initialize admin template"
```

需要发布到 GitHub 时执行 `git push -u origin main`，随后确认 CI 结果。当前 package.json 版本为 `1.0.0`，标签版本应与之保持一致。发布说明应说明本地演示认证、配置权限边界和存储限制。
