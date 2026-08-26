# XHS GPT Cloud

云端小红书搜索 + ChatGPT Remote MCP。项目目标是把小红书关键词搜索包装成一个可部署的 Web API 与 MCP 工具，让 ChatGPT 能直接调用 `xhs_search` 做研究和分析。

## 功能

- `/` 网页搜索控制台
- `/api/search?q=关键词` HTTP 搜索接口
- `/api/mcp` Remote MCP，提供 `xhs_search` / `xhs_status`
- Vercel 环境变量保存 `XHS_COOKIE`
- 支持综合 / 最新 / 热度排序，以及图文 / 视频筛选

## 本地运行

```bash
npm install
cp .env.example .env.local
# 填入 XHS_COOKIE
npm run dev
```

## Vercel

在项目 Environment Variables 中设置：

```text
XHS_COOKIE=你浏览器中当前有效的小红书 Cookie
```

可选：

```text
APP_API_KEY=保护 /api/search 的 Bearer Token
```

> 如果要直接使用内置网页搜索页，不要设置 `APP_API_KEY`，或者自行给前端增加授权头。

Cookie 只放在 Vercel 环境变量中，不要提交到 GitHub。

## ChatGPT / MCP

部署后，将下面地址作为 Remote MCP endpoint：

```text
https://YOUR_DOMAIN/api/mcp
```

扫描工具后应看到：

- `xhs_search`
- `xhs_status`

示例：

```text
搜索小红书“琶洲酒店”，按热度找前 20 篇并总结高频主题。
```

## 数据来源与兼容性

搜索层采用社区开源项目中验证过的轻量 Web HTTP + Cookie 思路，当前请求小红书 Web 搜索端点，不需要 Chromium/Playwright，因此更适合 Serverless 部署。

参考实现：`xyj2570/xhs-mcp`（MIT）。

## 风险说明

这是非官方研究型连接器，依赖小红书 Web 行为。Cookie 会过期，接口也可能变化，并可能触发平台风控。建议低频、合规使用，并遵守平台条款；不要用于高频批量抓取或绕过访问控制。
