# Server API Status Code Conventions

## `/api/tune/search`

- `200 OK`: 成功返回搜索结果，结构：`{ "items": MusicItem[] }`，最少包含 `id/platform/title/artist`。
- `400 Bad Request`: 缺少 `keyword` 参数，返回：`{ "error": "keyword is required" }`。
- `502 Bad Gateway`: 所有请求的平台上游均不可用。
- `500 Internal Server Error`: 其他未预期的服务端错误。

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
