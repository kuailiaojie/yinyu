# Server API Status Code Conventions

## `/api/tune/song`

- `200 OK`: 成功返回歌曲信息。
- `404 Not Found`: 上游返回成功，但 `parsed.data?.[0]` 为空，返回：`{ "error": "Song not found" }`。
- `502 Bad Gateway`: 上游服务不可用（网络失败或上游返回非 2xx）。
- `500 Internal Server Error`: 其他未预期的服务端错误。

## `/api/tune/lyrics`

- `200 OK`: 成功返回歌词信息。
- `404 Not Found`: 上游返回成功，但 `parsed.data?.[0]` 为空，返回：`{ "error": "Lyrics not found" }`。
- `502 Bad Gateway`: 上游服务不可用（网络失败或上游返回非 2xx）。
- `500 Internal Server Error`: 其他未预期的服务端错误。

## 约定说明

- **业务无数据**（如歌曲不存在、歌词不存在）统一返回 `404`。
- **上游失败**（如超时、连接失败、上游 HTTP 非 2xx）统一返回 `502`。
- 必须区分“上游失败”和“业务无数据”，避免把无数据误判为上游故障。

## 环境变量

- `TUNEHUB_API_KEY`（必需）：用于调用上游 TuneHub 接口的 API Key，会作为 `X-API-Key` 请求头发送。
- `TUNEHUB_UPSTREAM_URL`（可选）：上游解析接口地址，默认 `https://tunehub.sayqz.com/api/v1/parse`。
- `PORT`（可选）：服务监听端口，默认 `3000`。

### 启动示例

```bash
export TUNEHUB_API_KEY=your_api_key
export TUNEHUB_UPSTREAM_URL=https://tunehub.sayqz.com/api/v1/parse
export PORT=3000
node server/index.ts
```

> 若未配置 `TUNEHUB_API_KEY`，服务会返回 `500` 并提示配置缺失；若上游返回 `401/403`，服务会返回 `500` 并提示鉴权失败。

