# 开发指南

## 架构与扩展

`App.tsx` 注册路由与登录守卫，`components/layouts/AdminLayout.tsx` 提供侧栏和顶部导航，`config/menu.ts` 定义分组与入口。新增页面时同时注册懒加载路由和菜单；编辑页等隐藏路由还需设置合适的顶部导航名称。

品牌集中于 `config/app.ts`，浏览器标题在根目录 `index.html`，Logo 在 `public/favicon.svg`。主题变量在 `src/index.css`，通用样式在 `src/styles`。

## UI 规范

- **下拉框统一使用 `@/components/ui/select`**，不得直接使用原生 `select/option`。组合 `Select`、`SelectTrigger`、`SelectValue`、`SelectContent`、`SelectItem`，以文章管理为样式参考。
- 使用 `value/onValueChange` 控制值；`SelectTrigger` 配置关联 Label 的 id 或 aria-label。筛选占位选项使用显式非空值（如 `all`）。
- 图标按钮提供 aria-label；弹窗提供标题和描述；表单输入应关联 Label。
- 颜色使用 `primary`、`foreground`、`muted`、`border` 等主题 token，检查深浅色和手机布局。
- 菜单采用带图标的一级入口与缩进子菜单；一级行高 40px、子菜单行高 36px、项间距 4px、缩进 24px。箭头始终显示，展开/收起按内容实际高度过渡。系统管理默认折叠，侧栏收起时父菜单通过右侧弹出层显示子项，恢复时沿用 localStorage 中的分组状态。
- `/components` 包含基础表单、弹层反馈、数据布局三组可交互示例。

## 本地数据

| 数据                   | 存储                                       | 生命周期       |
| ---------------------- | ------------------------------------------ | -------------- |
| 登录                   | sessionStorage `ai-admin-ui:session`       | 当前标签页会话 |
| 主题                   | localStorage `ai-admin-ui:theme`           | 持久           |
| 菜单                   | localStorage `ai-admin-ui:navigation`      | 持久           |
| 资料、角色、权限、通知 | localStorage `ai-admin-ui:admin`           | 持久           |
| 文章与分类             | localStorage `ai-admin-ui:articles`        | 持久           |
| 文章编辑草稿           | localStorage `ai-admin-ui:article-draft:*` | 保存文章后清理 |
| 用户列表示例           | React state                                | 离开页面重置   |

这些数据按浏览器源隔离，并非多用户数据库。清理指定键即可重置对应演示，清理前请备份需要保留的内容。更改存储结构时提供迁移，不要静默丢弃已有数据。

## 后端接入

- 替换 `services/auth.ts`，调整 `stores/authStore.ts` 的服务端会话处理。
- 替换 `services/articleApi.ts` 和 `services/uploadApi.ts`。后者当前只读取本地图片，支持 PNG/JPEG/WebP/GIF，单张最大 1 MB。
- 将 `stores/adminStore.ts` 的配置操作接入服务端。当前角色权限仅维护配置，未实现用户角色分配及按权限拦截。
- 通知当前只显示于本地通知中心；邮件、推送、富文本与发送任务需单独实现。

## 校验

`npm run check` 依次运行格式检查、单元测试和含类型检查的生产构建。项目没有配置 ESLint，不要将格式检查当作语义 lint。TypeScript 已启用 strict、noImplicitAny 与 noFallthroughCasesInSwitch。

依赖安全更新将 Vite / React Router / Vitest 升级到当前兼容版本。`package.json` 中的 `postcss-selector-parser` override 将传递依赖统一到修复后的 6.x，待上游无需覆盖时再移除；升级后运行完整检查。

登录页采用居中玻璃卡片、紫蓝渐变与粒子背景。“记住账号”只将用户名保存到 `ai-admin-ui:remembered-account`，不会保存密码。
