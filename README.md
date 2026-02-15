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

## API 与映射约定

上游 API 规范来源于根目录 `api.md`，代理实现位于 `server/index.ts`，字段映射文档位于 `server/README.md`。当 `api.md` 字段变化时，请优先更新 `server/mappings.ts` 和 `server/README.md`。

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

## 版权说明

本项目仅用于技术研究与 UI/工程实践示例。音乐音频、歌词、封面等内容请遵守对应平台版权与使用条款。


## Tauri 工程结构

- 当前仓库使用根目录 `tauri.conf.json` + `src-tauri/` Rust 工程（`Cargo.toml` 在仓库根目录）。
- `npm run tauri:build` 会先执行 `npm run build`，再打 Linux `deb/rpm` 包。
- 如需 AppImage，可在 `tauri.conf.json` 的 `bundle.targets` 中额外开启并确保 linuxdeploy 环境完整。
