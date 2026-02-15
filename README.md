# yinyu-music-app

基于 React + TypeScript + Vite 的多平台音乐播放器（Web + Tauri Desktop）。项目按 `project.md` 实现动态主题、聚合搜索、歌词页、波浪进度条、播放器状态管理与 CI/CD。

## 产品功能矩阵

| 功能 | Web | Desktop (Tauri) | 说明 |
| --- | --- | --- | --- |
| 搜索 | ✅ 已支持 | ✅ 已支持 | `SearchPage` 走 `server/index.ts` 代理聚合多平台检索。 |
| 播放 | ✅ 已支持 | ✅ 已支持 | `PlayerControls` + `/api/tune/song` 提供播放 URL。 |
| 歌词 | ✅ 已支持 | ✅ 已支持 | `LyricsView` + `/api/tune/lyrics` 支持逐词/逐行展示。 |
| 榜单 | 🟡 基础占位 | 🟡 基础占位 | 已有 `/charts` 页面路由，当前为占位文案。 |
| 设置 | ✅ 已支持 | ✅ 已支持 | 语言切换、主题种子色在设置页可用。 |

> 桌面端基于同一套前端路由与组件，功能可用性与 Web 基本保持一致。

## 项目结构导览

- `src/features/*`：按业务域组织核心功能模块（如 `search`、`player`），包含状态管理、API 适配与特性级 UI。
- `src/components/*`：可复用通用组件（如导航、歌词视图、波浪进度条），供页面与 features 组合使用。
- `server/*`：Node/Express 代理层，负责上游 API 聚合、字段映射、限流与缓存。
- `src-tauri/*`：桌面端 Rust 壳层，负责打包、窗口与平台集成能力。

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

## 本地开发一键流程

### 组合 A：仅前端联调（最快）

```bash
npm run dev
```

- 前端默认端口：`5173`（Vite 默认值）。
- 适合纯 UI/交互开发。

### 组合 B：前端 + 代理 API

```bash
npm run server:dev
npm run dev
```

- 代理默认端口：`3000`（可用 `PORT` 覆盖）。
- 前端默认端口：`5173`。
- 推荐在搜索/播放/歌词联调时使用。

### 组合 C：Tauri 桌面联调（含前端）

```bash
npm run server:dev
npm run tauri:dev
```

- Tauri 会先执行前端构建/开发流程并加载桌面壳。
- 若需后端能力，仍需单独启动代理（默认 `3000`）。

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

## 测试策略

### 1) 单元测试（逻辑函数）

- 范围：纯函数与数据处理逻辑（例如去重、主题计算等）。
- 命令：

```bash
npm run test
```

### 2) 组件测试（UI 行为）

- 范围：关键组件渲染、交互与可访问性（如 `WaveProgress`、主题切换相关组件）。
- 命令：

```bash
npm run test
```

### 3) E2E 测试（核心用户路径）

- 范围：页面导航、路由可达、核心流程烟囱测试。
- 命令：

```bash
npm run e2e
```

- 说明：Playwright 测试使用独立端口 `4173` 启动测试专用前端服务。

## API 与映射约定

上游 API 规范来源于根目录 `api.md`，代理实现位于 `server/index.ts`，字段映射文档位于 `server/README.md`。当 `api.md` 字段变化时，请优先更新 `server/mappings.ts` 和 `server/README.md`。

## 发布流程

1. **准备版本**：更新版本号与变更说明，确保 `npm run ci-build` 通过。
2. **打 Tag**：在 `main` 上创建并推送 `v*` tag（如 `v0.1.1`）。
3. **触发工作流**：`release.yml` 会在 tag push 或 release published 时触发。
4. **矩阵构建**：分别在 `ubuntu/macos/windows` 上执行 lint、test、build、tauri build。
5. **产物上传**：构建结果上传到 GitHub Actions artifact，同时由 `tauri-action` 生成 draft release 附件。
6. **签名与发布**：配置 `TAURI_SIGNING_PRIVATE_KEY` 与 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` 后生成签名产物，验证无误后发布 release。
7. **产物下载**：从 GitHub Release 或 Actions Artifacts 下载对应平台安装包与更新清单（如 `latest.json`）。

### 常见失败排查

- `job skipped`：检查 `TAURI_BUILD` secret 是否为 `true`。
- `signing failed`：检查私钥内容、换行格式与密码是否匹配。
- `tauri build failed`：确认本地 `npm run build` 可通过，且 Rust toolchain 与平台依赖已安装。
- `updater metadata missing`：确认 `includeUpdaterJson` 未被禁用，且上传路径包含 `latest.json`。

## CI/CD 与发布

### 工作流拆分

- `.github/workflows/ci.yml`：PR/分支的 lint、unit、e2e-smoke、build。
- `.github/workflows/release.yml`：仅 `v*` tag push 或 Release Published 时触发，执行 Tauri 发布。

### PR 必过检查（建议配置为 Branch Protection Required Status Checks）

在 `Settings -> Branches -> main` 中将以下 Job 名称配置为 required：

- `lint`
- `unit`
- `e2e-smoke`
- `build`
- `required-checks`

### Required secrets（发布）

- `TAURI_BUILD`：设置为 `true` 才会执行发布 Job。
- `TAURI_SIGNING_PRIVATE_KEY`：Tauri updater/安装包签名私钥。
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`：私钥密码。

### 常见签名相关变量

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- （可选）平台证书相关变量，例如 Apple notarization / Windows 证书密钥（按组织密钥管理策略注入）。

### Tag 发布步骤

1. 确认 `main` 已通过 CI（lint/unit/e2e-smoke/build）。
2. 本地打 tag 并推送：

   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

3. GitHub Actions 自动执行 `release.yml`，按平台产出并上传：
   - `target/release/bundle/**`
   - `latest.json`
4. 在 GitHub Release 页面验证安装包与 updater 元数据后再对外公告。

### 回滚流程

1. 立即撤回有问题的 GitHub Release（标记为 draft 或删除附件）。
2. 若 updater 已指向问题版本，回退 `latest.json` 到上一个稳定 tag 重新发布。
3. 在 `main` 修复后发布 `vX.Y.(Z+1)`，避免复用问题 tag。
4. 如需代码回滚，使用 `git revert <bad_commit>` 提交修复，再走完整 CI+tag 流程。

## 安全与合规

- **API Key 管理**：
  - 严禁将真实 `TUNE_API_KEY` 提交到仓库；仅通过本地 `.env` 或 CI secrets 注入。
  - 新增 key 后建议轮换旧 key，并设置最小权限与调用配额。
- **版权声明**：
  - 本项目仅用于技术研究与工程实践。
  - 音频、歌词、封面等内容需遵守数据来源平台的版权政策与使用条款。
- **日志脱敏原则**：
  - 日志中不得输出 API key、用户凭据、完整请求头。
  - 错误日志优先记录错误类别与追踪 ID，避免输出完整上游响应体中的敏感字段。

## 版权说明

本项目仅用于技术研究与 UI/工程实践示例。音乐音频、歌词、封面等内容请遵守对应平台版权与使用条款。


## Tauri 工程结构

- 当前仓库使用根目录 `tauri.conf.json` + `src-tauri/` Rust 工程（`Cargo.toml` 在仓库根目录）。
- `npm run tauri:build` 会先执行 `npm run build`，再打 Linux `deb/rpm` 包。
- 如需 AppImage，可在 `tauri.conf.json` 的 `bundle.targets` 中额外开启并确保 linuxdeploy 环境完整。
