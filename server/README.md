# Server Notes

## `/api/tune/search` 请求流程

`/api/tune/search` 不再使用任何硬编码歌曲 ID（如 `ids: '1974443814'`）。当前流程为：

1. 根据 `platform` 调用 `GET /v1/methods/:platform/search` 获取方法配置。
2. 按 `api.md` 的模板变量规则替换方法配置中的 `{{keyword}}`、`{{page}}`、`{{pageSize}}`。
3. 由服务端根据配置（`url` / `method` / `params` / `body` / `headers`）发起真实上游搜索请求。
4. 将不同平台的返回结果统一转换为 `ParseRecord`（或兼容结构），再映射为 `MusicItem`。
5. `MusicItem` 保留 `platform` 字段，最终统一返回：

```json
{
  "items": [
    {
      "id": "...",
      "title": "...",
      "artist": "...",
      "album": "...",
      "platform": "netease"
    }
  ]
}
```

这样 `keyword` 会真实影响上游搜索结果，而不是返回固定歌曲。
