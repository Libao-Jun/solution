# HTTP / HTTPS 核心知识手册

> 参考资料：[MDN Web Docs - HTTP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)、[ITBook HTTP 中文手册](https://itbook.team/book/http/)
> 面向角色：中高级前端工程师。不仅罗列规范，更侧重**浏览器实际行为**、**常见坑点**与**调试手段**。

---

## 目录

1. [HTTP 基础与协议演进](#一http-基础与协议演进)
2. [HTTP/1.1 核心机制](#二http11-核心机制)
3. [HTTP/2 与 HTTP/3](#三http2-与-http3)
4. [缓存机制](#四缓存机制)
5. [Cookie 与状态管理](#五cookie-与状态管理)
6. [跨域与安全](#六跨域与安全)
7. [HTTPS 与传输安全](#七https-与传输安全)
8. [性能优化与调试实践](#八性能优化与调试实践)

---

## 一、HTTP 基础与协议演进

### 1.1 什么是 HTTP

HTTP（HyperText Transfer Protocol，超文本传输协议）是基于 **TCP/IP** 的应用层协议，用于在客户端（通常浏览器）与服务器之间传输超文本（HTML、图片、JSON 等）。

两个根本特征：

- **无状态（stateless）**：每个请求彼此独立，服务器默认不记得上一个请求是谁发的。状态靠 `Cookie` / `Token` / `Session` 等机制补充。
- **无连接 → 持久连接**：早期每请求新建 TCP；HTTP/1.1 起默认复用（`Keep-Alive`）。

### 1.2 HTTP 报文结构

一条 HTTP 报文由四部分组成：**起始行（请求行 / 状态行）、头部（Headers）、空行、消息体（Body）**。

**请求报文**

```
POST /api/login HTTP/1.1            ← 请求行：方法 请求目标 协议版本
Host: example.com                   ← 请求头（键值对，每行一个）
User-Agent: Mozilla/5.0
Content-Type: application/json
Authorization: Bearer <token>
                                   ← 空行（CRLF，分隔头与体，必不可少）
{"username":"a","password":"b"}     ← 消息体（Body，GET 通常无）
```

**响应报文**

```
HTTP/1.1 200 OK                    ← 状态行：协议版本 状态码 原因短语
Content-Type: application/json     ← 响应头
Cache-Control: max-age=300
Content-Length: 42
                                   ← 空行
{"token":"xyz","uid":1}            ← 消息体
```

要点：

- 头部是 **ASCII 文本、换行（CRLF）分隔、以空行结束**；Body 才是二进制或编码数据。
- 头部字段名**不区分大小写**（`Content-Type` ≡ `content-type`），但约定首字母大写（驼峰）。
- 空行是头与体的硬性边界：缺了空行，解析会失败或把头当体。

### 1.3 常见请求方法（含幂等性）

| 方法      | 语义                                          | 有 Body          | 安全 | 幂等 |
| --------- | --------------------------------------------- | ---------------- | ---- | ---- |
| `GET`     | 获取资源表示                                  | 否（规范禁止带） | ✅   | ✅   |
| `HEAD`    | 同 GET，但**无响应体**（只拿头）              | 否               | ✅   | ✅   |
| `POST`    | 提交数据，通常产生副作用/新建                 | 是               | ❌   | ❌   |
| `PUT`     | **整体替换**目标资源                          | 是               | ❌   | ✅   |
| `DELETE`  | 删除资源                                      | 可带可不带       | ❌   | ✅   |
| `PATCH`   | **部分修改**资源                              | 是               | ❌   | ❌   |
| `OPTIONS` | 查询目标资源支持的通信选项（**CORS 预检用**） | 否               | ✅   | ✅   |
| `CONNECT` | 建立隧道（HTTPS 代理用）                      | 否               | ❌   | ❌   |
| `TRACE`   | 回显请求用于诊断（有安全风险，常被禁用）      | 否               | ✅   | ✅   |

> **安全（Safe）**：不改变服务器状态（GET/HEAD/OPTIONS/TRACE）。
> **幂等（Idempotent）**：执行 1 次与 N 次效果相同（GET/HEAD/PUT/DELETE/OPTIONS/TRACE 幂等；**POST / PATCH 不幂等**）。

- **GET vs POST**：GET 取数据、参数在 URL、可缓存、幂等；POST 提交、参数在 Body、默认不缓存、不幂等。常见误解："GET 比 POST 快"（错，差异在语义/缓存）、"POST 比 GET 安全"（错，明文与否取决于 HTTPS）。
- **PUT vs PATCH**：PUT 传**完整**对象（缺字段被清空），幂等；PATCH 只传**要改的字段**，不幂等。

### 1.4 状态码语义（含常见码）

五大类（由 RFC 7231 等定义）：

| 类  | 范围    | 含义                                |
| --- | ------- | ----------------------------------- |
| 1xx | 100–199 | 信息响应：请求已收，继续/协议切换   |
| 2xx | 200–299 | 成功                                |
| 3xx | 300–399 | 重定向：需进一步操作                |
| 4xx | 400–499 | **客户端错误**（请求本身有问题）    |
| 5xx | 500–599 | **服务端错误**（服务器挂了/逻辑错） |

**常见码速查（重点）**

| 码    | 名称                  | 触发原因 / 场景                                                        |
| ----- | --------------------- | ---------------------------------------------------------------------- |
| `200` | OK                    | 请求成功，最通用                                                       |
| `204` | No Content            | 成功但**无响应体**（DELETE 成功、PUT 更新无返回）。`res.json()` 会报错 |
| `301` | Moved Permanently     | 资源 URL **永久**变更。**浏览器缓存跳转**，且常把 POST 改 GET          |
| `302` | Found                 | 资源**临时**在别处（未登录跳登录）。默认不缓存，POST 常被改 GET        |
| `304` | Not Modified          | **协商缓存命中**，响应体为空，浏览器读缓存                             |
| `307` | Temporary Redirect    | 同 302，但**严格保持请求方法**（POST 仍是 POST）                       |
| `308` | Permanent Redirect    | 同 301，但**严格保持请求方法**                                         |
| `400` | Bad Request           | 请求格式错（JSON 不符合 schema、参数类型错）                           |
| `401` | Unauthorized          | **未认证**（Token 过期/未登录）。语义"你谁啊"                          |
| `403` | Forbidden             | **无权限**（服务器知道你是谁但拒绝）。区别于 401                       |
| `404` | Not Found             | 资源不存在（路径错、已删、路由未匹配）                                 |
| `405` | Method Not Allowed    | 资源不支持该方法（响应带 `Allow` 头）                                  |
| `429` | Too Many Requests     | **限流**。响应常带 `Retry-After`；前端需退避重试                       |
| `500` | Internal Server Error | 后端抛异常，最笼统的"我也不知道啥错了"                                 |
| `502` | Bad Gateway           | 服务器作网关从上游收到无效响应（后端/重启/超时）                       |
| `504` | Gateway Timeout       | 网关等上游响应超时（慢查询/下游卡死）                                  |

> **301 vs 302 vs 307 vs 308 记忆**：是否永久？30**1**/30**8** 永久、30**2**/30**7** 临时。是否保方法？30**7**/30**8** 保方法、30**1**/30**2** 可能改 GET。

### 1.5 协议演进脉络

| 版本         | 年份/规范                 | 关键特性                                                                                                                                            |
| ------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HTTP/0.9** | 1991                      | 只有 `GET`，无头部、无状态码，响应直接是 HTML 文本，取完即关连接                                                                                    |
| **HTTP/1.0** | 1996 (RFC 1945)           | 引入**状态行 + 头部**、`Content-Type`、多方法（POST/HEAD）；但默认**每请求一连接**（Keep-Alive 需手动 `Connection: keep-alive` 开启）               |
| **HTTP/1.1** | 1997/1999 (RFC 2616→7230) | **持久连接默认开启**；`Host` 头强制（支持虚拟主机）；分块传输 `chunked`；管线化（pipelining）；`Cache-Control`/`ETag`；`Range` 请求；`100-continue` |
| **HTTP/2**   | 2015 (RFC 7540)           | **二进制分帧、多路复用、HPACK 头部压缩、服务端推送、流优先级**                                                                                      |
| **HTTP/3**   | 2022 (RFC 9114)           | 基于 **QUIC（跑在 UDP 上）**，解决 TCP 层队头阻塞、支持连接迁移                                                                                     |

### 1.6 无状态性与连接管理（Keep-Alive、管线化）

- **无状态**：HTTP 本身不保存上下文。解决方案：`Cookie`（客户端带状态）、`Session`（服务端存状态）、`Token`（无状态签名凭证，如 JWT）。
- **持久连接（Keep-Alive）**：HTTP/1.1 默认同一条 TCP 连接服务多个请求/响应，直到超时或显式 `Connection: close`。`Keep-Alive: timeout=5, max=1000` 可微调。
- **管线化（Pipelining）**：HTTP/1.1 允许**不等待响应就连续发多个请求**，但响应必须**按请求顺序**返回——因此仍受应用层队头阻塞，且代理/服务器兼容性差，**浏览器基本都禁用了它**。这正是 HTTP/2 多路复用要解决的痛点。

---

## 二、HTTP/1.1 核心机制

### 2.1 持久连接与队头阻塞（HOL Blocking）

- 持久连接避免了 TCP 三次握手的重复开销，但 **HTTP/1.1 在同一连接上是"请求—响应"串行的**（即使管线化，响应也要按序）。
- **应用层 HOL（Head-of-Line Blocking）**：一个慢响应（如大文件）会阻塞后面所有请求。为缓解，浏览器对**同一域名开约 6 条 TCP 连接**并行，但文件再多仍会排队。
- 这是 1.1 时代"雪碧图、域名分片（cdn1/2/3）、文件合并"等妥协的根源；HTTP/2 多路复用后这些手段大多过时。

### 2.2 常用头字段

| 头                | 方向 | 作用 / 示例                                                                                       |
| ----------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `Host`            | 请求 | **HTTP/1.1 强制**。指明主机名+端口，使一台服务器能托管多域名（虚拟主机）。`Host: www.example.com` |
| `Content-Type`    | 双向 | 实体媒体类型，如 `application/json; charset=utf-8`                                                |
| `Content-Length`  | 双向 | Body 字节长度。**与 `Transfer-Encoding: chunked` 互斥**                                           |
| `User-Agent`      | 请求 | 客户端标识（浏览器/OS 版本）。可用于统计，但**不可用于鉴权**（易伪造）                            |
| `Referer`         | 请求 | 来源页面 URL。用于防盗链、统计；隐私场景受 `Referrer-Policy` 控制                                 |
| `Accept`          | 请求 | 客户端可接受的响应类型。`Accept: text/html,application/json`                                      |
| `Accept-Language` | 请求 | 期望语言。`Accept-Language: zh-CN,zh;q=0.9`                                                       |
| `Accept-Encoding` | 请求 | 可接受的压缩。`Accept-Encoding: gzip, deflate, br`                                                |
| `Accept-Charset`  | 请求 | 可接受字符集（现已少用，由 `charset` 参数替代）                                                   |

> `q` 是相对质量因子（0–1），用于内容协商时表达偏好权重。

### 2.3 内容协商（Content Negotiation）

服务器按客户端 `Accept*` 头选择最合适的表示（同一资源可有多种格式/语言/编码）。两种协商：

- **服务端驱动**：靠 `Accept` / `Accept-Language` / `Accept-Encoding` 头。
- **代理驱动**：服务器发 `300`/`406`，由客户端选（少见）。

示例（语言协商）：

```
Accept-Language: en;q=0.8, zh-CN;q=0.9
→ 服务器优先返回 zh-CN
```

压缩协商：`Accept-Encoding: br, gzip` → 服务器选 Brotli（压缩率更高）并在响应带 `Content-Encoding: br`。

### 2.4 分块传输（Transfer-Encoding: chunked）

当响应长度**未知**（流式生成、大文件），服务器用分块编码代替 `Content-Length`：

```
HTTP/1.1 200 OK
Transfer-Encoding: chunked

1a\r\n                ← 块大小（十六进制，26 字节）
<26 字节数据>\r\n
0\r\n                 ← 0 大小表示结束
\r\n
```

- 优点：边生成边发，不必等全部拼完；配合 `Content-Length` 二选一（**两者不能同时存在**）。
- 前端 SSE（`text/event-stream`）、大文件下载常依赖此机制。

### 2.5 Range 请求与断点续传

客户端用 `Range` 头请求部分内容：

```http
GET /big.zip HTTP/1.1
Range: bytes=0-1023          ← 请求第 0~1023 字节
```

服务器支持时回 **`206 Partial Content`** + `Content-Range`：

```http
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/10000
```

- 不支持则返回 `200` 并给完整体（`Accept-Ranges: none`）。
- 应用：大文件**分片并发下载**、**断点续传**（记录已下字节，失败从断点续）、**音视频拖拽播放**（浏览器自动发 `Range` 定位时间点）。
- 前端合并：各分片 `Blob.arrayBuffer()` 后用 `new Blob([...])` 合成。

---

## 三、HTTP/2 与 HTTP/3

### 3.1 HTTP/2 核心机制

HTTP/2 把 HTTP 语义（方法/状态码/头）保留，但**改变了传输格式**，核心：

- **二进制分帧（Binary Framing）**：不再是人类可读的文本行，而是二进制帧（frame）。最小单位叫 **流（Stream）**——每个请求/响应是一个双向流，由多个帧组成。
- **多路复用（Multiplexing）**：**一个 TCP 连接上并发多个流**，帧交错传输，彼此独立。彻底消除 1.1 的连接数与应用层 HOL，6 连接限制消失。
- **头部压缩 HPACK**：维护客户端/服务端各一张**静态+动态表**，重复头（如 `User-Agent`、`Cookie`）只传索引号，首部体积大幅下降（1.1 头部是纯文本无压缩，Cookie 一大就浪费）。
- **服务端推送（Server Push）**：服务器可主动把资源（如 CSS）推给客户端，**但已被主流放弃**（实际收益有限、缓存控制复杂，Chrome 已移除支持）。
- **流优先级（Stream Priority）**：客户端可声明资源依赖与权重，帮助服务器决定发送顺序（如先发关键 CSS/JS）。

### 3.2 HTTP/2 的队头阻塞（TCP 层）

HTTP/2 解决了**应用层** HOL，但**仍存在 TCP 层 HOL**：所有流共用一条 TCP 连接，一旦某个 TCP 包**丢失**，整条连接要等重传，其上所有流都被阻塞。在**高丢包弱网**下，HTTP/2 可能反而比多连接的 HTTP/1.1 更慢。这正是 HTTP/3 要解决的。

### 3.3 HTTP/3：基于 QUIC（UDP）

- 把传输层从 **TCP 换成 QUIC（跑在 UDP 上）**。QUIC 内置可靠传输、加密、多路复用。
- **彻底解决 TCP 层 HOL**：QUIC 的流在传输层独立，一个流丢包**不阻塞其他流**。
- **0-RTT 连接建立**：基于之前会话的 PSK（预共享密钥）恢复，首个请求即可带数据，握手延迟降到最低（重连极快）。
- **连接迁移（Connection Migration）**：用 **Connection ID** 标识连接，切换网络（如 WiFi→4G，IP 变了）时连接不中断，传统 TCP 基于"IP+端口"四元组做不到这点。
- 代价：UDP 可能被某些老旧网络设备/防火墙丢弃，需服务端/运营商支持。

### 3.4 浏览器实际表现与降级策略

- 浏览器通过 TLS 握手中的 **ALPN（Application-Layer Protocol Negotiation）** 协商协议版本：客户端在 `ClientHello` 声明支持 `h2`/`http/1.1`，服务器选一个回在 `ServerHello`。
- 不支持 HTTP/2 的服务器/代理会**自动降级到 HTTP/1.1**，无需前端改动。
- 查看实际版本：DevTools → Network → 勾选 **Protocol** 列，可见 `h2` / `h3` / `http/1.1` 标记。

---

## 四、缓存机制

缓存是前端性能与"改了不生效"排障的核心。

### 4.1 强缓存（不发请求）

命中时浏览器**直接读本地副本**，DevTools 显示 `200 (memory cache)` / `200 (disk cache)`，**状态码显示 200 但完全不发网络请求**。

- `Expires: Wed, 21 Oct 2026 07:28:00 GMT`：HTTP/1.0 遗留，**绝对时间**，受本地时钟影响，**已不推荐单独使用**。
- `Cache-Control`：HTTP/1.1 首选，指令组合：
  - `max-age=3600`：相对时间（秒），最常用。
  - `no-cache`：**使用前必须问服务器是否新鲜**（走协商缓存 304），≠ 不缓存。
  - `no-store`：**真·不缓存**，连本地都不存（敏感数据）。
  - `public`：可被任何缓存（含 CDN/代理）缓存。
  - `private`：仅浏览器（用户代理）可缓存，中间代理不可。
  - `s-maxage=3600`：专给**共享缓存（CDN/代理）** 的 `max-age`，覆盖 `max-age`。
  - `immutable`：资源永不变，期间不发起任何再验证（配合带 hash 的文件名）。

### 4.2 协商缓存（发请求，服务器判是否用缓存）

首次响应带验证器；下次请求带对应条件头，资源没变 → 服务器回 **304 Not Modified**（空 body，浏览器用缓存）。

- **最后修改时间**：响应 `Last-Modified: <GMT>` → 下次请求 `If-Modified-Since: <GMT>`。
- **实体标签（更精确）**：响应 `ETag: "<hash>"` → 下次请求 `If-None-Match: "<hash>"`。
  - ETag 比 Last-Modified **精度更高**（秒级不够、内容没变但时间变会误判）；强 ETag（`"abc"`）任意字节变化都变，弱 ETag（`W/"abc"`）语义变才变。

### 4.3 缓存决策流程与优先级

1. 先看 `Cache-Control: no-store` → 不缓存。
2. 有 `max-age`/`s-maxage` 且未过期 → **强缓存命中**（不发请求）。
3. 过期或 `no-cache` → 带 `If-None-Match` / `If-Modified-Since` 发请求。
4. 服务器比对：没变 → **304**（用缓存）；变了 → **200 + 新内容**。
5. 通常 `Cache-Control` 优先于 `Expires`；`ETag` 优先于 `Last-Modified`。

### 4.4 缓存位置（从快到慢）

| 位置                     | 说明                                                          |
| ------------------------ | ------------------------------------------------------------- |
| **Memory Cache**         | 内存缓存，最快，随标签页关闭消失（热资源、preload）           |
| **Disk Cache**           | 磁盘缓存，跨会话持久，容量大                                  |
| **Service Worker Cache** | 由 JS 控制的缓存（PWA），可编程拦截请求（`cache API`）        |
| **Push Cache**           | HTTP/2 服务端推送的缓存，**随连接存活、容量极小、已废弃趋势** |

> Service Worker 缓存优先级常高于 Disk Cache（在 `fetch` 事件里 `respondWith` 自行决定）。其更新需 `skipWaiting` + `clients.claim`，否则用户停留在旧 SW（"改了不生效"常见元凶之一）。

### 4.5 CDN / 代理缓存与失效策略

- CDN 是**共享缓存**，认 `public`/`s-maxage`，不认 `private`。
- 失效手段：① 改 URL（**带内容 hash 的文件名** `app.3a9f.js` 最可靠）；② 主动 purge/刷新 CDN 节点；③ 短 `s-maxage` + 长 `max-age` 组合。
- **最佳实践**：HTML 用 `no-cache`（每次问服务器）；带 hash 的 JS/CSS 用 `public, max-age=31536000, immutable`（一年强缓存，靠 hash 变文件名来更新）。

---

## 五、Cookie 与状态管理

### 5.1 Set-Cookie / Cookie 头

- 服务器通过响应头 **`Set-Cookie`** 种 Cookie（可一次多个）：
  ```http
  Set-Cookie: sessionid=abc123; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=Lax
  ```
- 浏览器后续请求通过 **`Cookie`** 头自动回传（满足作用域与属性的前提下）：
  ```http
  Cookie: sessionid=abc123; theme=dark
  ```

### 5.2 属性

| 属性       | 作用                                                            |
| ---------- | --------------------------------------------------------------- |
| `Domain`   | 允许哪些主机收 Cookie（默认当前 host；`.example.com` 含子域）   |
| `Path`     | 路径作用域（默认 `/`，`/admin` 仅该路径及子路径）               |
| `Expires`  | 绝对过期时间（HTTP/1.0 风格）                                   |
| `Max-Age`  | 相对秒数（**优先于 Expires**，负数即删）                        |
| `Secure`   | 仅 **HTTPS** 传输，防明文泄露                                   |
| `HttpOnly` | JS 的 `document.cookie` **读不到**，防 XSS 偷 Cookie            |
| `SameSite` | **跨站请求是否带 Cookie**（防 CSRF）：`Strict` / `Lax` / `None` |

**SameSite 三档**：

- `Strict`：完全禁止跨站携带（最严，但可能破坏"从邮件点链接带登录态"的体验）。
- `Lax`（现代浏览器**默认值**）：**顶级导航的 GET 跨站请求带 Cookie**，但跨站 POST/iframe 不带。
- `None`：跨站总是带，但**必须同时 `Secure`**（即仅 HTTPS）。用于合法的跨站嵌入场景。

### 5.3 会话 Cookie 与持久 Cookie

- **会话 Cookie**：不设 `Expires`/`Max-Age` → 浏览器关闭即删（实际常被浏览器"恢复会话"保留，非严格）。
- **持久 Cookie**：设了过期时间 → 写到磁盘，到期前一直有效（"记住我"功能）。

### 5.4 跨站请求中的 Cookie 携带规则

- **同源**请求：按 Domain/Path 正常带。
- **跨站**（不同站，含跨子域但不同 eTLD+1）：受 `SameSite` 约束（见上）。现代默认 `Lax` → 跨站 POST 默认**不带**。
- 跨域 **fetch/XHR** 带 Cookie 需显式：`fetch(url, { credentials: 'include' })` / `axios.defaults.withCredentials = true`；且服务器必须回 `Access-Control-Allow-Credentials: true` 且 `Access-Control-Allow-Origin` **不能为 `*`**。

### 5.5 与 localStorage / sessionStorage 的区别与选型

| 维度           | Cookie                         | localStorage      | sessionStorage |
| -------------- | ------------------------------ | ----------------- | -------------- |
| 容量           | ~4KB                           | ~5MB              | ~5MB           |
| 自动随请求发送 | ✅（每次 HTTP 都带，浪费流量） | ❌                | ❌             |
| 生命周期       | 可设过期 / 会话级              | 永久（手动清）    | 标签页关闭即清 |
| 服务端可写     | ✅（`Set-Cookie`）             | ❌                | ❌             |
| 易遭 XSS 窃取  | 是（但 `HttpOnly` 可防）       | 是                | 是             |
| 典型用途       | 会话标识、追踪                 | 前端持久偏好/缓存 | 单页临时状态   |

**选型原则**：需要服务端识别身份 → Cookie（配 `HttpOnly`+`Secure`+`SameSite`）；纯前端状态/大数据 → `localStorage`/`sessionStorage`。**不要把敏感 Token 放 localStorage**（XSS 一偷就走，除非有严格 CSP + 短期有效）。

---

## 六、跨域与安全

### 6.1 同源策略与跨域场景

**同源** = 协议 + 域名（eTLD+1）+ 端口 三者全同。不同源即"跨域"。限制范围：XHR/fetch 响应读取、DOM 访问（iframe）、Cookie 读取等。但 `<img>`/`<script>`/`<link>`/`<form>` 等"资源嵌入"不受同源限制（这也是 JSONP 与 CSRF 的基础）。

### 6.2 CORS（跨源资源共享）

基于 HTTP 头的机制，让服务器声明"哪些外源可访问"。

**① 简单请求（不触发预检）**——须同时满足：

- 方法 ∈ {`GET`, `HEAD`, `POST`}；
- 人为设置的头仅限 `Accept` / `Accept-Language` / `Content-Language` / `Content-Type` / `Range`；
- `Content-Type` 仅限 `text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded`。

浏览器直接发，带 `Origin` 头；服务器回 `Access-Control-Allow-Origin: *`（或具体源）即放行。

**② 预检请求（Preflight，自动发的 `OPTIONS`）**——对服务器有副作用或非简单条件时（如 `PUT`/`PATCH`/`DELETE`、`application/json`、自定义头 `Authorization`、带凭据的复杂头）。流程：

```
# 预检请求
OPTIONS /api HTTP/1.1
Origin: https://app.example
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization

# 预检响应
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400        ← 缓存预检 24h，减少 OPTIONS 次数
```

预检通过后，浏览器才发真实请求。

**核心响应头**：

- `Access-Control-Allow-Origin`：允许的源（`*` 或具体源；**带凭据时不能用 `*`**）。
- `Access-Control-Allow-Methods` / `Allow-Headers`：允许的方法/头。
- `Access-Control-Allow-Credentials: true`：允许带凭据。
- `Access-Control-Expose-Headers`：除基本头外，允许 JS 用 `getResponseHeader()` 读取的头（如 `X-Total-Count`）。
- 建议配合 `Vary: Origin`，避免 CDN 把某源的响应错误缓存给别的源。

### 6.3 跨域携带凭证（withCredentials）

- 默认跨域请求**不带 Cookie/HTTP 认证**。需 `fetch(url, { credentials: 'include' })` 或 `axios` 设 `withCredentials = true`。
- 服务器必须回 `Access-Control-Allow-Credentials: true`，且 `Access-Control-Allow-Origin` 为**具体源**（非 `*`），否则浏览器拒收响应。
- 注意：即便 CORS 头正确，Cookie 仍受 `SameSite` / 第三方 Cookie 策略约束。

### 6.4 CSRF 与 SameSite 防御

- **CSRF（跨站请求伪造）**：攻击者诱导用户在已登录状态下发起非预期请求（如 `<img src="/api/transfer?to=attacker">`、自动提交表单）。
- 防御：
  - **`SameSite` Cookie**：`Strict`/`Lax` 能挡掉绝大多数跨站伪造（默认 `Lax` 已挡跨站 POST）。
  - **CSRF Token**：服务端下发随机 token，前端随请求（头/隐藏域）带回，服务端校验。
  - **`SameSite=None; Secure` 场景必须配 CSRF Token**，因为此时 Cookie 跨站会带。
  - 校验 `Origin` / `Referer` 头做二次确认。

### 6.5 XSS 与 Content-Security-Policy

- **XSS（跨站脚本）**：攻击者注入恶意脚本到页面执行（窃取 Cookie、Token、钓鱼）。
- **CSP（Content-Security-Policy）**：白名单控制可加载/执行的资源源，从根上限制脚本注入：
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc'; img-src 'self' data:;
  ```

  - `script-src 'self'` 禁止行内脚本与第三方脚本；`'nonce-xxx'` / `'sha256-xxx'` 精确放行可信脚本。
  - 配合 `X-XSS-Protection`（已废弃，交给 CSP）使用。
- 防 XSS 还要：输出转义、避免 `innerHTML` 拼用户输入、Token 放 `HttpOnly` Cookie。

### 6.6 点击劫持与 X-Frame-Options / frame-ancestors

- **点击劫持（Clickjacking）**：把目标站用透明 `iframe` 覆盖在诱饵页上，骗用户点击。
- 防御：
  - 旧方案 `X-Frame-Options: DENY` / `SAMEORIGIN`（拒绝/仅同源被嵌）。
  - 新方案 CSP 的 `frame-ancestors 'none'` / `'self'`（功能更强，可指定允许嵌入的父源）。
  - 现代以 `frame-ancestors` 为准（CSP 覆盖 X-Frame-Options）。

---

## 七、HTTPS 与传输安全

### 7.1 HTTPS = HTTP + TLS/SSL

HTTPS 不是新协议，而是 **HTTP 报文跑在 TLS 加密通道之上**（TLS 再跑在 TCP）。TLS 前身为 SSL（已不安全，禁用 SSLv3）。

### 7.2 对称加密、非对称加密、混合加密

- **对称加密**：同一密钥加解密（AES 等）。快，但**密钥分发难**（网上传密钥会被截获）。
- **非对称加密**：公钥加密、私钥解密（RSA/ECDHE 等）。解决分发问题，但**慢**、不适合大量数据。
- **混合加密（TLS 实际做法）**：握手阶段用**非对称**安全地协商出**对称会话密钥**，之后通信全用**对称**加密。兼顾安全与性能。

### 7.3 数字证书、CA、证书链、验证流程

- **数字证书**：CA（证书颁发机构）用**私钥**对服务器公钥+域名等信息签名，证明"这个公钥确实属于 example.com"。
- **证书链**：叶子证书（你的站点）→ 中间证书（中间 CA）→ 根证书（可信根 CA，预置在操作系统/浏览器**信任库**）。验证需一路回溯到信任的根。
- **验证流程**（浏览器）：① 证书域名匹配当前访问域名；② 签名链完整、可追溯到信任根；③ 未过期；④ 未被吊销（CRL/OCSP 检查）；任一不过 → 浏览器红字警告。

### 7.4 TLS 握手（TLS 1.2 vs TLS 1.3）

**TLS 1.2（约 2-RTT）**：

1. 客户端 `ClientHello`（随机数、支持的 cipher、SNI、ALPN）。
2. 服务器 `ServerHello`（选定 cipher）+ 发证书 + （DHE 时）`ServerKeyExchange` + `ServerHelloDone`。
3. 客户端校验证书 → `ClientKeyExchange`（用服务器公钥加密的预备主密钥或 DH 参数）+ `ChangeCipherSpec` + `Finished`。
4. 服务器 `ChangeCipherSpec` + `Finished`。→ 开始加密通信。

**TLS 1.3（1-RTT，更快）**：

- 大幅精简：客户端 `ClientHello` 直接带上**密钥共享参数（key share）**，服务器 `ServerHello` + `EncryptedExtensions` + `Finished` 一并返回，握手压缩到 **1 个往返**。
- **0-RTT（Early Data）**：基于 PSK（会话恢复）重连时，客户端首个包即可携带应用数据，**延迟最低**；但有**重放攻击风险**（0-RTT 数据不保证幂等，仅适合 GET 类安全请求）。

### 7.5 SNI、ALPN、OCSP Stapling

- **SNI（Server Name Indication）**：客户端在 `ClientHello` 里声明要访问的域名，让**一台服务器（同一 IP）能托管多个 HTTPS 站点**（服务器据此返回对应证书）。没有 SNI，虚拟主机 HTTPS 无法实现。
- **ALPN（Application-Layer Protocol Negotiation）**：在 TLS 握手内协商应用协议（`h2` vs `http/1.1`），决定走 HTTP/2 还是 1.1，无需额外往返。
- **OCSP Stapling**：服务器在握手时**附带** CA 的 OCSP 吊销证明（stapled），免去客户端另行联系 CA 查询吊销的延迟与隐私问题。

### 7.6 HSTS（Strict-Transport-Security）

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

- 告诉浏览器：之后一段时间**强制走 HTTPS**，即使用户手输 `http://` 也被浏览器内部改写为 `https://`，杜绝 SSL 剥离攻击。
- `preload` + 提交到 [HSTS Preload List](https://hstspreload.org) 后，浏览器**首次访问前**就强制 HTTPS（连第一次的 http 跳转都省）。

### 7.7 中间人攻击（MITM）与证书固定

- **MITM**：攻击者在客户端与服务器之间截获/篡改通信（公共 WiFi 下常见）。HTTPS 靠证书校验防止——但若用户点了"继续访问风险网站"（忽略证书错误）即被攻破。
- 抓包调试（Charles/Whistle/Fiddler）本质是**受控 MITM**：需把代理的 CA 证书**安装并设为信任**，浏览器才会放过。
- **证书固定（Certificate Pinning）**：客户端只信任**预置的特定证书/公钥**，即使系统信任库里有别的有效证书也拒绝（防伪造 CA）。Web 端主要靠 HSTS preload + 浏览器信任库；移动 App 可代码内固定公钥。注意：pinning 一旦证书轮换不当会导致**全站无法访问**，需谨慎。

---

## 八、性能优化与调试实践

### 8.1 连接复用、域名分片、预连接

- **连接复用**：HTTP/2 多路复用让"域名分片"（把资源分到 cdn1/2/3 突破 6 连接限制）**基本过时**；HTTP/2 下过多分片反而因建立多连接而变慢。
- **预连接（Resource Hints）**：
  - `<link rel="dns-prefetch" href="https://cdn.example">`：提前做 DNS 解析。
  - `<link rel="preconnect" href="https://cdn.example">`：提前建 TCP + TLS 连接（含 DNS），对关键第三方源收益大。谨慎使用（每个 preconnect 占一个 socket）。
  - `<link rel="preload" ...>`（见下）。

### 8.2 资源预加载

| 提示            | 语义                                                 | 典型用途               |
| --------------- | ---------------------------------------------------- | ---------------------- |
| `preload`       | **当前页面马上要用**的关键资源，提升优先级、提前获取 | 首屏关键 CSS/JS、字体  |
| `prefetch`      | **未来页面**可能用（低优先级，空闲时取）             | 下一步路由的 JS chunk  |
| `modulepreload` | 预解析+编译 ES module（仅 `<script type=module>`）   | 路由懒加载前的依赖预取 |
| `prerender`     | 提前渲染整个页面到隐藏标签页（已少用）               | —                      |

> `preload` 用错（预加载了却没用）会在控制台报警告且浪费带宽；字体 `preload` 必须带 `crossorigin`（即使同源），否则重复下载。

### 8.3 压缩

- **文本压缩（响应体）**：`Accept-Encoding: gzip, deflate, br`；服务器回 `Content-Encoding`。
  - **Gzip**：通用，压缩率好。
  - **Brotli（br）**：压缩率更高（尤其文本），现代浏览器全支持，优先用。
  - 适用：HTML/JS/CSS/JSON。**图片/音视频本是二进制压缩格式，再 gzip 徒增 CPU，不划算**。
- **头部压缩**：HTTP/2 的 **HPACK**（见 3.1）压缩重复请求头，显著降低 Cookie 多时的开销；HTTP/1.1 无此能力。

### 8.4 首字节时间（TTFB）与瀑布图

- **TTFB（Time To First Byte）**：从请求发起到位**收到第一个响应字节**的耗时 = DNS + TCP + TLS + 服务器处理 + 网络往返。偏高通常是**后端慢/数据库慢/网络远**，不是前端问题。
- **瀑布图（Waterfall）**：DevTools 里每条请求的时序条，能看出排队（Queued）、Stalled（连接等待）、TTFB、Content Download 各占多久，定位瓶颈。

### 8.5 Chrome DevTools Network 面板

- **Timing 标签**（点开单条请求）分解各阶段：
  - `Queueing`：排队（受 6 连接限制 / 高优请求插队）。
  - `Stalled`：连接建立前的等待。
  - `DNS Lookup` / `Initial connection` / `SSL`：对应解析、TCP、TLS 耗时。
  - `Waiting (TTFB)`：服务器处理。
  - `Content Download`：下载耗时（大文件/慢带宽）。
- **Priority**：请求优先级（Highest/High/Medium/Low），受 `preload`、资源类型、HTTP/2 流优先级影响。
- **Waterfall** 列：可视化上述时序。
- 实用技巧：勾 **Disable cache** 排除缓存；**Preserve log** 保留跨跳转日志；右键请求 **Copy → Copy as cURL** 把问题复现给后端。

### 8.6 常见线上问题排查

1. **跨域失败**：Network 里请求显示 `(failed)` / `(canceled)`、无响应体、Console 报 CORS → 查响应头 `Access-Control-Allow-*` 是否齐全、是否漏 `Allow-Credentials`、是否误用 `*`；带凭据需具体源。预检 `OPTIONS` 被拦也会让真实请求发不出。
2. **缓存不生效 / 改了不生效**：① 静态资源是否带**内容 hash**（没 hash 又被长缓存就 stalе）；② HTML 是否 `no-cache`；③ Service Worker 是否未 `skipWaiting` 仍用旧缓存；④ 浏览器磁盘缓存（DevTools 勾 Disable cache 验证）；⑤ CDN 节点未 purge。
3. **证书错误**：浏览器红字（NET::ERR*CERT*...）。原因：证书过期/域名不匹配/自签名未信任/系统时间错误。调试用代理需安装并信任代理 CA；生产必须用合法 CA 证书。
4. **混合内容（Mixed Content）**：HTTPS 页面加载 **HTTP 子资源**（脚本/iframe/图片）会被浏览器**拦截**（active 必拦，passive 现代也多拦截并自动升级）。解决：全站 HTTPS，或用代理/相对协议把子资源也升级为 https；可用 CSP `upgrade-insecure-requests` 让浏览器自动把 http 子资源升级为 https。

---

> **核心心法**：HTTP 是"文本/二进制协议 + 头驱动的声明式协商"。绝大多数前后端联调与性能问题，都能在 **Request Headers / Response Headers / Status / Timing** 四处找到答案——善用 DevTools 与 `curl -i` 这两把钥匙。
