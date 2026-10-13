# 文件上传处理（File Upload）

> 参考资料：
>
> - [TED 知识体系 — 前端解决方案：文件上传处理](https://books.tedshen.cn/docs/解决方案/前端解决方案/文件上传处理)
> - [TED 知识体系 — 前端解决方案：大文件分片断点续传与秒传](https://books.tedshen.cn/docs/解决方案/前端解决方案/大文件分片断点续传与秒传)
> - [博客园 — 大文件上传与断点续传实现](https://www.cnblogs.com/meng-dao-ke/p/22883535)
> - [JSJSON — 文件上传工程化指南](https://www.jsjson.com/blog/file-upload-engineering-guide)
> - [技术站 — 文件上传全链路解析](https://jishuzhan.net/article/1947581432758579202)
>
> 面向角色：中高级 / 资深前端工程师。本文按「基础原理 → 选择读取 → 上传实现 → 体验进阶 → 大文件分片 → 断点续传与秒传 → 服务端协同 → 稳定性 → 安全合规 → 端到端落地 → 坑点 → Checklist」展开，覆盖一个前端高级工程师必须掌握的文件上传关键知识点与完整工程流程。HTTP 报文与缓存见 [HTTP / HTTPS 核心知识手册](/fundamentals/http/)，浏览器二进制与存储见 [浏览器存储](/fundamentals/browser-storage/)，性能与进度体验见 [前端性能优化知识手册](/fundamentals/front-end-performance/)。

---

## 目录

1. [问题背景：为什么文件上传需要专门设计](#一、问题背景-为什么文件上传需要专门设计)
2. [基础方案：FormData 与 multipart 上传](#二、基础方案-formdata-与-multipart-上传)
3. [文件选择与读取：从 input 到二进制](#三、文件选择与读取-从-input-到二进制)
4. [上传体验进阶：校验、预览、压缩与交互](#四、上传体验进阶-校验、预览、压缩与交互)
5. [大文件分片上传：原理与实现](#五、大文件分片上传-原理与实现)
6. [断点续传与秒传：哈希与状态管理](#六、断点续传与秒传-哈希与状态管理)
7. [服务端协同与云存储直传](#七、服务端协同与云存储直传)
8. [稳定性工程：重试、并发控制与限速](#八、稳定性工程-重试-并发控制与限速)
9. [安全与合规：前后端双重防护](#九、安全与合规-前后端双重防护)
10. [完整落地流程：从需求到上线](#十、完整落地流程-从需求到上线)
11. [常见坑点与反模式](#十一、常见坑点与反模式)
12. [文件上传 Checklist 速查](#十二、文件上传-checklist-速查)

---

## 一、问题背景：为什么文件上传需要专门设计

### 1.1 文件上传不是「把文件发出去」这么简单

很多初学者把上传理解成「一个 `input[type=file]` + 一次请求」，但一旦走到生产环境，就会遇到一连串问题：

- 一个几百 MB 的视频，直接 `POST` 会把请求体撑到几百 MB，网络一抖就前功尽弃；
- 弱网环境下上传到 90% 失败，用户只能从头再来；
- 同一份文件反复上传，浪费带宽；
- 上传按钮点了没反应，用户不知道进度；
- 恶意用户传一个伪装成图片的脚本，或传一个解压后膨胀百倍的压缩包。

上传的本质是**把本地二进制安全、可靠、可感知地搬到远端**，它横跨 HTML 交互、HTTP 协议、浏览器二进制 API、前端并发调度、服务端协同与安全校验。把这些环节都打通，才算一个「能上生产」的上传能力。

### 1.2 上传能力的四个层次

| 层次 | 能力 | 典型场景 |
| --- | --- | --- |
| 基础层 | 选择文件、构造请求、发起上传 | 头像、附件表单 |
| 体验层 | 进度、预览、校验、拖拽、取消 | 图片 / 文档上传组件 |
| 大文件层 | 分片、并发、断点续传、秒传 | 视频、安装包、设计稿 |
| 工程层 | 重试、限速、安全校验、可观测 | 企业级中后台、网盘 |

高级工程师与初级的核心差异，往往就在「大文件层」与「工程层」：基础的 `FormData` 谁都会写，但要做到「弱网下断点续传 + 秒传 + 失败自动恢复 + 不被攻击」，需要一套系统性的设计。

---

## 二、基础方案：FormData 与 multipart 上传

### 2.1 HTTP 文件上传的底层形态

浏览器上传文件走的是 `multipart/form-data` 编码。一个带文件的表单，请求体大致长这样：

```text
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryABCD

------WebKitFormBoundaryABCD
Content-Disposition: form-data; name="file"; filename="demo.png"
Content-Type: image/png

<二进制字节流>
------WebKitFormBoundaryABCD
Content-Disposition: form-data; name="module"

avatar
------WebKitFormBoundaryABCD--
```

关键点：**不要手动设置 `Content-Type`**。一旦用 `FormData` 装了文件，`fetch` / `XMLHttpRequest` 会自动带上 `boundary` 分隔符，手写 `Content-Type: multipart/form-data` 却漏掉 `boundary` 会让服务端解析失败。

### 2.2 用 FormData 构造请求体

```js
const fd = new FormData()
fd.append('file', file, file.name) // 第三个参数显式指定文件名
fd.append('module', 'avatar')

await fetch('/api/upload', { method: 'POST', body: fd })
```

`FormData` 可以混入普通字段与文件字段，服务端用 `multipart` 解析器（如 `multer`、`multiparty`、Spring 的 `MultipartFile`）按 `name` 取字段。

### 2.3 XHR、fetch 与 axios 三种写法对比

| 方案 | 进度监听 | 取消 | 说明 |
| --- | --- | --- | --- |
| `XMLHttpRequest` | ✅ `upload.onprogress` | ✅ `abort()` | 进度与取消最原生、最完整 |
| `fetch` | ⚠️ 需 `ReadableStream` 模拟（较绕） | ✅ `AbortController` | 默认拿不到上传进度，但 API 现代 |
| `axios` | ✅ `onUploadProgress` | ✅ `CancelToken` / `AbortController` | 对进度 / 取消封装最友好，工程首选 |

### 2.4 上传进度监控

用 XHR 直接拿真实上传进度：

```js
function uploadXHR(file, fd, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText))
      else reject(new Error('HTTP ' + xhr.status))
    }
    xhr.onerror = () => reject(new Error('network error'))
    xhr.onabort = () => reject(new DOMException('aborted', 'AbortError'))
    xhr.send(fd)
  })
}
```

`fetch` 想拿进度需要「上传侧」包装 `ReadableStream`，实现成本高于 XHR；所以进度是 XHR 的强项。工程上推荐：**进度 / 取消优先 XHR 或 axios，`fetch` 适合简单的无进度场景**。

---

## 三、文件选择与读取：从 input 到二进制

### 3.1 input[type=file] 与 File 对象

```html
<input type="file" accept="image/*" multiple />
```

```js
input.addEventListener('change', (e) => {
  const files = e.target.files // FileList，类数组
  for (const file of files) {
    console.log(file.name, file.size, file.type, file.lastModified)
  }
})
```

`File` 继承自 `Blob`，自带 `name` / `size` / `type` / `lastModified`。`accept` 只做**选择器层面的过滤**，不是安全校验——用户仍可手动选其他类型。

常用属性：`multiple` 允许多选；`webkitdirectory` 允许选文件夹（配合 `webkitRelativePath` 拿相对路径）；`capture` 在移动端调起摄像头 / 麦克风。

### 3.2 FileReader 与 Blob

```js
// 读成 DataURL（小图预览可用，但体积会膨胀约 33%）
const reader = new FileReader()
reader.onload = () => console.log(reader.result)
reader.readAsDataURL(file)

// 读成 ArrayBuffer（二进制处理、哈希计算）
reader.readAsArrayBuffer(file)
```

`Blob` 是不可变的二进制容器，`File` 是它的子类。切片、转换、计算哈希都基于 `Blob` / `ArrayBuffer`。

### 3.3 URL.createObjectURL 与内存回收

```js
const url = URL.createObjectURL(file) // 生成本地 blob: 临时地址
img.src = url
// 用完后务必释放，否则内存泄漏
URL.revokeObjectURL(url)
```

`createObjectURL` 比 `readAsDataURL` 更省内存（不拷贝整份数据），但**必须 `revokeObjectURL`**，否则直到页面卸载才会回收。组件卸载、预览销毁时都要记得释放。

---

## 四、上传体验进阶：校验、预览、压缩与交互

### 4.1 类型与大小校验

```js
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED = ['image/png', 'image/jpeg']

function validate(file) {
  if (!ALLOWED.includes(file.type)) return '文件类型不支持'
  if (file.size > MAX_SIZE) return '文件超过 5MB'
  return null
}
```

校验要分两层：**前端只做「快速拦截」提升体验，真正的安全边界在服务端**。前端 `type` 由浏览器根据扩展名推断，可被伪造，不能信任。

### 4.2 图片预览与压缩

预览用 `URL.createObjectURL`；压缩可用 `canvas`：

```js
async function compressImage(file, maxW = 1920, quality = 0.8) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxW / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width * scale
  canvas.height = bitmap.height * scale
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return await new Promise((res) =>
    canvas.toBlob(res, 'image/jpeg', quality)
  )
}
```

`createImageBitmap` 比 `Image` + `onload` 更现代，且不依赖 DOM 时序，适合在 Worker 里预处理。注意 `toBlob` 输出是 `Blob`，可直接进 `FormData`。

### 4.3 拖拽与粘贴上传

```js
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault() // 必须阻止默认行为，否则不会触发 drop
  dropZone.classList.add('active')
})
dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  const files = e.dataTransfer.files
  handleFiles(files)
})
// 粘贴上传
document.addEventListener('paste', (e) => {
  const items = e.clipboardData.files
  if (items.length) handleFiles(items)
})
```

### 4.4 并发上传与取消

多文件上传时，用 `AbortController` 支持逐个取消：

```js
async function uploadWithAbort(file, signal) {
  const fd = new FormData()
  fd.append('file', file)
  return fetch('/api/upload', { method: 'POST', body: fd, signal })
}

const controller = new AbortController()
uploadWithAbort(file, controller.signal)
controller.abort() // 取消该次上传
```

---

## 五、大文件分片上传：原理与实现

### 5.1 为什么需要分片

当文件达到几十 MB、上百 MB 甚至 GB 级，整文件上传的弊端被放大：

- 单次请求体过大，超时 / 断连直接导致全部失败；
- 无法并发利用带宽；
- 失败后只能重传全部，浪费已传部分。

**分片（Chunking）** 把文件按固定大小切成多块，逐块上传，从根本上解决以上问题，也是断点续传与秒传的前提。

### 5.2 Blob.slice 与分片算法

```js
function createChunks(file, chunkSize = 2 * 1024 * 1024) {
  const chunks = []
  let cur = 0
  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + chunkSize)) // Blob.slice 左闭右开
    cur += chunkSize
  }
  return chunks
}
```

`Blob.slice` 不拷贝数据，只是创建一个引用视图，开销极小。分片大小通常取 **2MB ~ 5MB**：太小则请求数过多、元数据开销大，太大则单块失败成本高。

### 5.3 并发分片与整体进度

```js
async function uploadChunks(chunks, fileHash, onProgress) {
  let uploaded = 0
  const tasks = chunks.map((chunk, index) => async () => {
    const fd = new FormData()
    fd.append('hash', fileHash)
    fd.append('index', String(index))
    fd.append('chunk', chunk)
    await fetch('/api/upload/chunk', { method: 'POST', body: fd })
    uploaded += chunk.size
    onProgress(uploaded)
  })
  // 并发控制见第八章
  await Promise.all(tasks.map((t) => t()))
}
```

整体进度 = `已上传字节 / 文件总字节`，而不是简单的「分片完成数 / 总分片数」——后者在不均匀分片下不准确。

### 5.4 暂停与恢复

暂停 = 停止发起新的分片请求并 `abort` 进行中的请求；恢复 = 向服务端查询「哪些分片已存在」，只补传缺失部分。这正是下一章断点续传要解决的。

---

## 六、断点续传与秒传：哈希与状态管理

### 6.1 秒传：文件指纹比对

**秒传**的思路：上传前先算文件指纹（哈希），告诉服务端「我要传这个 hash 的文件」。若服务端已有该 hash，直接返回成功，前端跳过实际上传——省时省带宽。

常见指纹：

- 小文件：`spark-md5` 算整个文件的 MD5；
- 大文件：取首尾 + 中间若干块抽样计算「局部哈希」，兼顾速度与唯一性（撞 hash 概率极低）。

### 6.2 断点续传：已上传分片记录

断点续传依赖「服务端 / 本地记录已上传分片索引」：

1. 前端算 `fileHash`；
2. 调 `POST /api/upload/check`，传 `fileHash`，服务端返回 `uploaded: [0,1,2,5]`；
3. 前端过滤掉已传分片，只传 `[3,4,6,...]`；
4. 全部分片到齐后调 `POST /api/upload/merge` 让服务端合并。

### 6.3 计算哈希：主线程阻塞与 Web Worker

整文件 MD5 在大文件上会**阻塞主线程**，导致页面卡死。正确做法放进 Web Worker：

```js
// worker.js
import SparkMD5 from 'spark-md5'

self.onmessage = ({ data: { chunks } }) => {
  const spark = new SparkMD5.ArrayBuffer()
  let i = 0
  const step = () => {
    if (i >= chunks.length) {
      self.postMessage({ hash: spark.end() })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      spark.append(e.target.result)
      i++
      self.postMessage({ progress: i / chunks.length })
      step()
    }
    reader.readAsArrayBuffer(chunks[i])
  }
  step()
}
```

主线程通过 `worker.postMessage` 传分片，`onmessage` 收进度与最终 hash，界面始终保持流畅。也可分片增量计算（每块算一次增量哈希），避免一次性读全部进内存。

### 6.4 分片合并与服务端契约

服务端约定示例：

```text
POST /api/upload/check   { hash }                  → { uploaded: number[] }
POST /api/upload/chunk   { hash, index, chunk }    → { ok: true }
POST /api/upload/merge   { hash, filename, size }  → { url }
```

合并阶段服务端按 `index` 顺序拼接分片，校验总大小，再回写数据库 / 对象存储地址。前端在合并完成后才算「上传成功」。

---

## 七、服务端协同与云存储直传

### 7.1 前后端接口契约

一份可靠的上传方案，前后端要约定清楚：

| 项 | 说明 |
| --- | --- |
| 字段名 | `file` / `chunk` / `hash` / `index` 命名一致 |
| 分片大小 | 前后端对齐，避免切片边界错位 |
| 合并触发 | 前端汇总完成 vs 服务端自动检测齐活 |
| 幂等 | 同一分片重复上传应安全覆盖 |
| 返回结构 | 统一 `{ code, data, message }` |

### 7.2 对象存储直传：OSS / S3 / COS

大文件不应先落到应用服务器再转发，而是**前端直传对象存储**（阿里云 OSS、AWS S3、腾讯云 COS），降低服务器压力：

```js
// 前端拿临时上传地址后直传
const { url, fields } = await fetch('/api/sts/sign?key=' + key).then((r) => r.json())
const fd = new FormData()
Object.entries(fields).forEach(([k, v]) => fd.append(k, v))
fd.append('file', file)
await fetch(url, { method: 'POST', body: fd })
```

前端直传通常分「表单 POST 直传（带 policy 签名）」与「分片上传 API（如 S3 `UploadPart`）」两种；超大文件走云厂商的分片上传接口，断点续传能力由云端保证。

### 7.3 临时凭证与 STS

直传不能把永久密钥放前端。正确模式：

1. 前端向后端申请**临时凭证（STS / 预签名 URL）**，带有效期与最小权限；
2. 用临时凭证直传；
3. 凭证过期后重新申请。

这样既安全，又避免长期密钥泄露。

### 7.4 回调与状态一致性

直传完成后，云厂商可**回调应用服务器**通知「文件已落库」，或前端上传成功后主动 `POST /api/file/commit` 提交最终状态。要处理「云上成功但回调丢失」的边界：用「前端 commit + 服务端兜底查询」双保险保证状态一致。

---

## 八、稳定性工程：重试、并发控制与限速

### 8.1 失败重试策略

网络抖动是常态，需对失败分片做**有限次重试**：

```js
async function retry(fn, times = 3, delay = 1000) {
  let lastErr
  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, delay * (i + 1))) // 指数退避
    }
  }
  throw lastErr
}
```

只对**可重试错误**（网络超时、5xx）重试，对 4xx（如 401、413 过大）直接失败，避免无谓重试。

### 8.2 并发控制与任务队列

无限制并发会打满连接数、触发服务端限流。用「任务队列 + 并发上限」：

```js
async function runWithLimit(tasks, limit = 3) {
  const ret = []
  let i = 0
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (i < tasks.length) {
      const cur = i++
      ret[cur] = await tasks[cur]()
    }
  })
  await Promise.all(workers)
  return ret
}
```

分片上传把 `limit` 设为 3~6 较为均衡：太低带宽利用率不足，太高易被限流或丢包。

### 8.3 限速与节流

- **整体进度节流**：`onProgress` 回调高频触发，用 `requestAnimationFrame` 或节流（如每 200ms）更新 UI，避免频繁 `setState` 卡顿；
- **带宽限速**：必要时用 `ReadableStream` 分块读取并 `await sleep` 控制发送速率，照顾弱网与同网络其他用户；
- **暂停 / 恢复**：结合第六章的「已上传记录」，实现用户主动暂停与恢复。

---

## 九、安全与合规：前后端双重防护

### 9.1 类型与大小校验的边界

- 前端校验只是**体验层拦截**，绝不能当安全边界；
- 服务端必须重新校验：扩展名白名单、MIME 探测（`file` 命令 / 魔数识别）、大小上限；
- 重命名落库，避免原文件名带来的路径穿越（如 `../../etc/passwd`）与特殊字符问题。

### 9.2 防攻击：zip 炸弹、伪装文件、超大文件

| 攻击 | 手法 | 防护 |
| --- | --- | --- |
| zip 炸弹 | 压缩包解压后膨胀数百倍 | 限制解压后大小、服务端沙箱解压 |
| 伪装文件 | 改扩展名传脚本 | 按**文件头魔数**而非扩展名判断类型 |
| 超大文件 | 撑爆存储 / 内存 | 前后端双重大小上限 + 配额 |
| 恶意内容 | 脚本 / 可执行文件 | 指定目录不可执行、CDN 隔离、病毒扫描 |

### 9.3 敏感文件与合规

- 用户上传内容放**独立存储桶 / 独立域名**，杜绝与业务站点同源执行；
- 图片等静态资源经 CDN 分发，且设置 `Content-Disposition: attachment` 或正确 `Content-Type` 防止被当 HTML 执行；
- 遵守数据合规（PII、版权），必要时做内容审核与加密存储。

---

## 十、完整落地流程：从需求到上线

### 10.1 需求评估

先问清四件事：文件多大（决定要不要分片）、并发量（决定服务端架构）、是否要断点续传 / 秒传、合规要求（决定存储与扫描策略）。小头像用基础方案即可，GB 级视频必须上分片 + 直传。

### 10.2 技术选型

- 普通小文件：前端 `FormData` + 后端 `multipart` 解析，直存应用服务器或对象存储；
- 大文件 / 网盘类：**分片 + 哈希 + 断点续传 + 秒传 + 对象存储直传**；
- 选库：哈希用 `spark-md5`；并发控制可手写队列或借 `p-limit`；进度 / 取消用 axios 或 XHR。

### 10.3 端到端实现流程

```text
选择文件 → 前端校验(类型/大小)
   → 计算文件哈希(Web Worker)
   → 查服务端已上传分片(check)
   → 过滤已传 → 并发上传缺失分片(uploadChunks，带重试/限流)
   → 全部分片到齐 → 合并(merge)
   → 服务端落库 / 直传提交(commit)
   → 返回可访问地址 → 前端展示结果
```

每一步都要有**失败可恢复**：断网能续、失败能重试、用户能暂停。

### 10.4 验证与监控

- 弱网模拟（DevTools Network 限速 / 断流）验证断点续传；
- 同文件二次上传验证秒传；
- 监控上传成功率、平均耗时、失败分布、分片重试率；
- 大文件边界（恰好等于 / 略大于分片边界）单测覆盖。

---

## 十一、常见坑点与反模式

1. **手写 `multipart/form-data` 的 `Content-Type` 却漏 `boundary`**：让服务端解析失败。交给 `FormData` 自动处理。
2. **用 `fetch` 又想要上传进度**：`fetch` 默认没有上传进度事件，换 XHR / axios。
3. **主线程算大文件 MD5**：页面直接卡死，必须进 Web Worker。
4. **`createObjectURL` 不 `revokeObjectURL`**：内存泄漏，尤其列表里循环预览。
5. **用 `FileReader.readAsDataURL` 预览大图**：体积膨胀约 33%，大图用 `createObjectURL` 更省。
6. **进度用「分片完成数 / 总数」**：不均匀分片下不准，应算字节比。
7. **无限并发**：连接打满、被限流，必须用任务队列限流。
8. **只对可重试错误重试**：413 / 401 重试纯属浪费。
9. **把前端类型校验当安全边界**：`type` 可伪造，服务端必须重写校验。
10. **直传把永久密钥放前端**：必须用 STS / 预签名 URL 临时凭证。
11. **合并后未校验总大小**：分片被篡改 / 丢失时合并出错误文件。
12. **秒传 hash 碰撞未兜底**：抽样哈希有极小碰撞概率，服务端应做内容一致性校验。

---

## 十二、文件上传 Checklist 速查

**基础**

- [ ] 用 `FormData` 装文件，不手动写 `Content-Type: multipart/form-data`
- [ ] 进度用 XHR / axios，取消用 `AbortController` / `abort()`
- [ ] 预览用 `createObjectURL` 并在销毁时 `revokeObjectURL`

**大文件**

- [ ] 按 2~5MB 切片，`Blob.slice` 不拷贝数据
- [ ] 文件哈希在 Web Worker 计算，不阻塞主线程
- [ ] 先 `check` 已传分片，只补传缺失部分（断点续传）
- [ ] 同 hash 走秒传，跳过实际上传
- [ ] 合并前后校验总大小与分片完整性

**工程**

- [ ] 分片并发受控（3~6），失败指数退避重试
- [ ] 只对网络 / 5xx 错误重试，4xx 直接失败
- [ ] 进度按字节比计算并节流更新 UI

**安全**

- [ ] 服务端重写类型 / 大小 / 魔数校验，前端校验仅体验用
- [ ] 重命名落库，防路径穿越
- [ ] 直传用 STS / 预签名临时凭证，不放永久密钥
- [ ] 上传内容隔离域名 / 存储桶，防脚本执行
