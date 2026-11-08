# 部署指南

```bash
npm ci
npm run check
npm run preview
```

发布 `dist/` 到静态托管服务。`vite preview` 用于本地检查，不是生产服务器。默认部署于域名根路径。

## SPA 路由回退

本项目使用 BrowserRouter，直接访问或刷新 `/article/list` 等子路由需要回退到 `index.html`。

Nginx 示例（root 替换为实际部署目录）：

```nginx
server {
    listen 80;
    root /srv/ai-admin-ui/dist;
    index index.html;
    location /assets/ { try_files $uri =404; }
    location / { try_files $uri $uri/ /index.html; }
}
```

其他托管服务也需要配置等效 rewrite。GitHub Pages 不原生提供 SPA 路由回退，不应仅上传 dist 就认为子路由可用；可选择支持 rewrite 的托管，或另行改为 HashRouter。部署到子目录时，还需要同时配置 Vite base 与路由 basename。

## 公开演示的边界

公开托管的是演示前端，任何人可使用公开演示账号。所有演示数据仅在访问者浏览器中保存。正式上线业务前应完成服务端认证、授权、持久化和备份。
