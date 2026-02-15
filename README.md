# yinyu-music-app

基于 React + TypeScript + Vite 的多平台音乐播放器（Web + Tauri Desktop）。项目按 `project.md` 实现动态主题、聚合搜索、歌词页、波浪进度条、播放器状态管理与 CI/CD。

## Quickstart

### 1) 安装依赖

```bash
npm ci
```

### 2) 启动 Web 开发

```bash
npm run dev
```

### 3) 启动服务端代理（可选）

```bash
npm run server:dev
```

### 4) 启动桌面开发（Tauri）

```bash
npm run tauri:dev
```

## 环境变量

参考 `.env.example`（可复制为 `.env`）：

- `TUNE_API_BASE`：TuneHub API 根地址（默认 `https://tunehub.sayqz.com/api`）
- `TUNE_API_KEY`：服务端代理使用的 API Key
- `PORT`：代理服务端口
- `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`：限流配置
- `CACHE_TTL_MS`：代理缓存 TTL

## 常用命令

- `npm run lint`：ESLint
- `npm run test`：Vitest（单元/组件）
- `npm run e2e`：Playwright E2E
- `npm run build`：TypeScript + Vite 构建
- `npm run tauri:build`：构建桌面安装包
- `npm run ci-build`：CI 本地等价检查


## Design System

- 设计令牌集中在 `src/theme/designTokens.ts`，按语义分层命名：`spacing.*`（间距）、`radius.*`（圆角）、`elevation.*`（阴影层级）、`glass.*`（毛玻璃）、`motion.*`（动画时长与缓动）、`typographyScale.*`（字号与字重）。
- 页面优先复用 `src/components/` primitives（`AppShell`, `SectionCard`, `GlassPanel`, `PageHeader`, `EmptyState`, `MusicListItem`），业务页面只负责数据与交互，不重复定义视觉样式。
- 页面视觉改动流程：
  1. 优先调整 design tokens，再同步 primitives。
  2. 确认暗色/浅色背景对比度与焦点可见性。
  3. 更新页面截图（建议包含 Home / Search / Settings 关键页）并随 PR 一起提交。

## API 与映射约定

上游 API 规范来源于根目录 `api.md`，代理实现位于 `server/index.ts`，字段映射文档位于 `server/README.md`。当 `api.md` 字段变化时，请优先更新 `server/mappings.ts` 和 `server/README.md`。

## CI/CD 与发布

- 工作流：`.github/workflows/release.yml`
- 触发：`main` 分支 push、`v*` tag、GitHub release published
- 通过矩阵构建 `ubuntu / macOS / windows`
- 仅当 `TAURI_BUILD=true` secret 生效时执行 Tauri 构建

推荐 secrets：

- `TAURI_BUILD`：`true`
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- (可选) 平台签名相关密钥

## 版权说明

本项目仅用于技术研究与 UI/工程实践示例。音乐音频、歌词、封面等内容请遵守对应平台版权与使用条款。


## Tauri 工程结构

- 当前仓库使用根目录 `tauri.conf.json` + `src-tauri/` Rust 工程（`Cargo.toml` 在仓库根目录）。
- `npm run tauri:build` 会先执行 `npm run build`，再打 Linux `deb/rpm` 包。
- 如需 AppImage，可在 `tauri.conf.json` 的 `bundle.targets` 中额外开启并确保 linuxdeploy 环境完整。
