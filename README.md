# yinyu

## 本地构建

本仓库采用**根目录 `tauri.conf.json`** 的结构，不使用 `src-tauri/`。

1. 构建前端：

```bash
npm run build
```

2. 构建桌面包：

```bash
npm run tauri build
```

构建完成后，Tauri 产物位于：

```text
target/release/bundle
```

## CI 产物位置

GitHub Actions workflow 会上传与本地一致的目录：

```text
target/release/bundle
```

请勿按 `src-tauri/target/...` 路径排查当前仓库的问题，当前结构下该路径不适用。
