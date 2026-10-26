# 前端性能优化知识手册（Front-End Performance）

> 参考资料：
>
> - [MDN Web Docs — Web Performance](https://developer.mozilla.org/zh-CN/docs/Web/Performance)
> - [MDN — Web 性能基础知识 / 性能指标](https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides)
> - [web.dev — Web Vitals 与性能优化](https://web.dev/performance?hl=zh-cn)
> - [godbasin — 前端性能优化（归纳篇 / 加载流程篇 / 渲染篇 / 卡顿篇系列）](https://godbasin.github.io/front-end-playground/front-end-basic/performance/front-end-performance-optimization.html)
> - [tedshen — 前端解决方案：前端性能优化](https://books.tedshen.cn/docs/解决方案/前端解决方案/前端性能优化/)
> - [Jacky-Summer — 我的前端性能优化体系总结](https://github.com/Jacky-Summer/personal-blog/blob/master/性能优化/我的前端性能优化体系总结.md)
> - [Jiahong Li — PerformanceOptimization](https://lijiahong.top/skill/PerformanceOptimization/)
>
> 面向角色：初中高级前端工程师。本文按「先建立体系 → 逐层拆解（指标 / 网络 / 资源 / 渲染 / JS 执行 / 框架 / 卡顿 / 监控）→ 汇总坑点与 Checklist」展开，覆盖前端性能优化的关键知识点、重点、注意事项与高频坑点。浏览器内部机制（进程 / 线程 / 渲染管线 / 事件循环）见 [浏览器核心知识手册](/fundamentals/browser/)，脚本加载细节见 [脚本 Script 加载与执行指南](/fundamentals/script/)，HTTP 协议层见 [HTTP / HTTPS 核心知识手册](/fundamentals/http/) — 本文聚焦「怎么测、怎么优化、坑在哪」。

---

## 目录

1. [性能优化总览：双轴模型与切入方式](#一、性能优化总览-双轴模型与切入方式)
2. [性能指标体系：Web Vitals 与体验度量](#二、性能指标体系-web-vitals-与体验度量)
3. [加载流程优化（网络层）：缓存、传输与资源提示](#三、加载流程优化网络层缓存、传输与资源提示)
4. [加载流程优化（资源层）：JS / CSS / 图片 / 字体](#四、加载流程优化资源层js--css--图片--字体)
5. [渲染优化：关键渲染路径、重排重绘与合成层](#五、渲染优化关键渲染路径、重排重绘与合成层)
6. [JavaScript 执行优化：长任务、事件循环与内存](#六、javascript-执行优化长任务、事件循环与内存)
7. [框架与工程化层面的性能优化](#七、框架与工程化层面的性能优化)
8. [卡顿与流畅度：滚动、动画与大列表](#八、卡顿与流畅度滚动、动画与大列表)
9. [性能监控与度量工具](#九、性能监控与度量工具)
10. [注意事项、坑点与常见反模式](#十、注意事项、坑点与常见反模式)
11. [性能优化 Checklist 速查](#十一、性能优化-checklist-速查)
12. [性能工程化治理：预算 / 分析流程 / 三阶段落地](#十二、性能工程化治理-预算-分析流程-三阶段落地)

---

## 一、性能优化总览：双轴模型与切入方式

### 1.1 性能为什么重要

- **业务指标直接受影响**：加载时间每增加 1 秒，转化率与留存率都会明显下降（Amazon / Google 历史上都有公开数据支撑）；移动端用户对超过 3 秒的加载容忍度极低。
- **SEO 排名因素**：Core Web Vitals（LCP / INP / CLS）是 Google 搜索排名的正式信号。
- **用户体验本质是「快」**：功能做出来了但很卡，约等于没做好。

### 1.2 双轴模型：时间与空间

前端性能问题可以归纳为两个维度，所有优化手段都能挂到这两条轴上

| 维度         | 目标         | 典型手段                                                                           |
| ------------ | ------------ | ---------------------------------------------------------------------------------- |
| **时间角度** | 减少耗时     | 缓存、CDN、HTTP/2、压缩、按需加载、SSR、预加载、任务切片、防抖节流                 |
| **空间角度** | 降低资源占用 | 代码拆分、Tree Shaking、图片压缩与格式升级、移除未使用代码、虚拟列表、内存泄漏治理 |

> 时间轴上又分两段：**加载时**（从发起到可交互）与**运行时**（交互 / 渲染 / 响应）；空间轴上分**体积**（传输大小）与**内存**（占用与泄漏）。

### 1.3 加载流程视角

把「输入 URL 到页面可交互」的完整链路摆出来，每一环都对应一类优化

<FrontendPerformanceFlow variant="loading" />

- **前半段（网络）**：靠缓存、CDN、协议升级、压缩、资源提示。
- **中段（解析与首次渲染）**：靠关键渲染路径优化、资源分层（关键 / 非关键）、SSR / 预渲染。
- **后段（运行时）**：靠 JS 执行优化、渲染优化、卡顿治理、内存治理。

### 1.4 方法论：先测量，后优化

**铁律：没有度量就没有优化。** 凭感觉优化是新手最常见的错误 — 花一周优化的模块可能只占耗时的 2%。

1. **先测量**：用 Performance 面板 / Lighthouse / 线上监控定位真正的瓶颈（网络？渲染？脚本执行？）。
2. **再优化**：针对瓶颈选手段，一次只改一类，改完复测。
3. **防回归**：建立性能预算（Performance Budget）与监控基线，持续盯指标。

> 二八原则：80% 的性能收益来自 20% 的关键优化（首屏 JS 体积、LCP 资源、长任务），不要陷入「过度优化」 — 为省 1KB 牺牲可维护性通常是负收益。

---

## 二、性能指标体系：Web Vitals 与体验度量

### 2.1 核心指标全景

| 指标       | 全称                      | 含义                                   | 参考阈值     | 类型     |
| ---------- | ------------------------- | -------------------------------------- | ------------ | -------- |
| **TTFB**   | Time To First Byte        | 收到首个字节的时间（含重定向、DNS 等） | < 800 ms     | 网络层   |
| **FP**     | First Paint               | 首次绘制（任何像素）                   | -            | 加载     |
| **FCP**    | First Contentful Paint    | 首次内容绘制（文本 / 图片等真实内容）  | < 1.8 s      | 加载     |
| **LCP**    | Largest Contentful Paint  | 最大内容元素绘制完成（核心指标）       | **< 2.5 s**  | 加载     |
| **TBT**    | Total Blocking Time       | FCP 到可交互之间长任务的阻塞时间总和   | < 200 ms     | 实验室   |
| **TTI**    | Time To Interactive       | 页面完全可交互（已逐步被 INP 取代）    | < 3.8 s      | 实验室   |
| **FID**    | First Input Delay         | 首次输入延迟（**已废弃**，仅测第一次） | -            | 已替换   |
| **INP**    | Interaction to Next Paint | 所有交互中最差的响应延迟（核心指标）   | **< 200 ms** | 交互     |
| **CLS**    | Cumulative Layout Shift   | 累积布局偏移（核心指标）               | **< 0.1**    | 视觉稳定 |
| **长任务** | Long Task                 | 主线程上超过 50 ms 的任务              | 越少越好     | 运行时   |

> **Core Web Vitals（2024 起三件套）= LCP（加载）+ INP（交互）+ CLS（视觉稳定）**。FID 已被 INP 取代（2024-03 起正式废弃） — FID 只测「第一次交互的输入延迟」，INP 衡量「全生命周期所有交互的最差响应」，更接近真实体验。

### 2.2 LCP：最大内容绘制

- **LCP 候选元素**：`<img>`、`<image>` in `<svg>`、`<video>` 的封面、带背景图的元素、块级文本元素。取**用户视口内最大者**，且可能随渲染动态变化。
- **LCP 可拆成四个子部分**，逐个击破
  1. **TTFB**：服务器 / CDN 响应慢 → 上 CDN、优化重定向链、边缘渲染。
  2. **资源发现延迟**：LCP 资源在 CSS/JS 解析后才发现 → `<link rel="preload">` 提前发现、首屏图片加 `fetchpriority="high"`。
  3. **资源加载时长**：图片太大 → 压缩、现代格式（AVIF/WebP）、响应式尺寸、CDN。
  4. **元素渲染延迟**：被同步 JS / 字体加载阻塞 → 关键资源前置、字体 `font-display`。
- **注意**：懒加载的资源**不会**成为 LCP，首屏大图千万不要 `loading="lazy"`。

### 2.3 CLS：累积布局偏移

偏移分数 = 影响比例 × 距离比例（一个视口内最大 0.25，多次累加）。常见成因与对策

| 成因                         | 对策                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| 图片 / 视频没有声明尺寸      | 永远写 `width`/`height` 或 `aspect-ratio`                            |
| 广告位 / 嵌入内容动态撑开    | 提前占位（固定容器尺寸）                                             |
| Web 字体导致文本重排（FOUT） | `font-display: optional` 或 fallback 字体度量对齐（`size-adjust`）   |
| 动态插入内容（提示条等）     | 在现有内容上方 / 下方预留空间，或用 transform 动画（不触发布局偏移） |
| 异步渲染组件无占位           | 骨架屏固定尺寸                                                       |

### 2.4 INP：交互到下一次绘制

一次交互的延迟由三部分组成，优化对应三处：

1. **输入延迟（Input Delay）**：主线程被长任务占用，事件处理排队 → 切片长任务（见第六章）。
2. **处理时长（Processing Time）**：事件回调本身太重 → 拆逻辑、把非 UI 更新推迟到 `requestAnimationFrame` / `setTimeout` 之后。
3. **呈现延迟（Presentation Delay）**：渲染更新太重 → 减小重排范围、避免在同帧内做大量 DOM 变更。

> 注意 INP 的统计口径：取**所有（或接近最差）交互的 P98**，因此只要有一个高频交互很慢就会拖垮整体；Chrome 127 起有 `performance.eventCounts` / `Event Timing API` 可观测。

### 2.5 实验室数据与线上数据的差异

- **Lab（实验室）**：Lighthouse、DevTools、本地模拟 — 可控可复现，但设备 / 网络环境与真实用户不同。
- **Field（真实用户）**：CrUX、RUM 上报 — 反映真实分布（关注 P75 分位），但样本有噪声。
- **典型坑**：本地 Lighthouse 满分、线上用户仍抱怨卡 — 因为你用的是高性能开发机 + 近距离网络。**以线上 P75 数据为准做决策**。

### 2.6 其他常用指标（运行时 / 实验室补充）

Core Web Vitals 之外，这些指标用于更细的归因与专项优化：

| 指标              | 含义                                                   | 说明                                                          |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| **Speed Index**   | 页面「视觉填充速度」的综合分（首屏内容以多快速度呈现） | Lighthouse 报告项；重首屏可交互前的体感，LCP 只管「最大元素」 |
| **TTI**           | Time To Interactive，页面完全可交互                    | 已逐步被 INP 取代；仍是实验室常用「可交互时间点」             |
| **TBT**           | Total Blocking Time，FCP→TTI 间长任务的阻塞总和        | INP 的实验室近似量，Lighthouse 重点卡分项                     |
| **FPS**           | 每秒渲染帧数                                           | 60Hz 设备应稳定 ≥ 60fps；掉到 < 50 即肉眼卡顿（见第八章）     |
| **Long Tasks**    | 主线程 > 50ms 的任务数 / 总时长                        | 直接关联 INP 与 TTI；用 `longtask` 条目监控（见 §9.2）        |
| **JS 堆内存**     | JS Heap Size / Used                                    | 持续增长不回落 = 怀疑内存泄漏（见 §6.6）                      |
| **CPU 占用**      | 主线程繁忙占比                                         | 高占用 → 交互延迟、滚动卡顿                                   |
| **请求数 / 体积** | 首屏请求数量与传输字节                                 | 弱网下「每请求一个 RTT」都贵；用 `resource` 条目统计（§9.1）  |

> 选型原则：**对外汇报 / SEO 看 Core Web Vitals（LCP/INP/CLS）**；**对内定位瓶颈看 TBT / Long Tasks / FPS / 堆内存 / 请求瀑布**。两者互补，不要互相替代。

---

## 三、加载流程优化（网络层）：缓存、传输与资源提示

### 3.1 DNS 与连接优化

- **`dns-prefetch`**
  > `<link rel="dns-prefetch" href="//api.example.com">`，对第三方域名提前解析。
- **`preconnect`**
  > `<link rel="preconnect" href="https://cdn.example.com" crossorigin>`，提前完成 DNS + TCP + TLS，收益大于 dns-prefetch；只对**最关键的 2~3 个域名**使用（多了浪费连接）。
- **域名收敛 vs 分片**
  > HTTP/1.1 时代靠域名分片绕开 6 连接限制；**HTTP/2 下域名分片是反优化**（多路复用后单域名即可并行），应收敛域名减少握手。

### 3.2 CDN

- **原理**：就近接入边缘节点，缩短物理往返（RTT）；静态资源（JS / CSS / 图片 / 字体）上 CDN 是性价比最高的优化之一。
- **要点**：合理配置回源（避免回源风暴）、命中缓存（命中率是关键指标）、开启边缘压缩、必要时启用边缘计算（Edge SSR）。

### 3.3 HTTP 缓存（最重要的「零成本」优化）

> 一句话区分：**强缓存由浏览器决定「用不用」**（不发请求），**协商缓存由服务器决定「变没变」**（发请求，命中只回 304 无 body）。协议层细节见 [HTTP / HTTPS 核心知识手册](/fundamentals/http/)。

**两类缓存核心对比**

| 对比维度       | 强缓存                                    | 协商缓存                                                    |
| -------------- | ----------------------------------------- | ----------------------------------------------------------- |
| 触发条件       | 缓存有效期内（`max-age` 未到期）          | 强缓存过期、或被要求重新验证                                |
| 是否请求服务器 | ❌ 否（直接读缓存）                       | ✅ 是（带校验头问服务器）                                   |
| 响应状态       | 200（from disk / memory cache）           | 304 Not Modified（无 body）或 200 + 新资源                  |
| 关键头部       | `Cache-Control`、`Expires`（旧）          | `Last-Modified`/`If-Modified-Since`、`ETag`/`If-None-Match` |
| 性能           | 极快（零网络往返）                        | 较快（仍有一个 RTT，但省掉 body 传输）                      |
| 适用资源       | 不常变：图片 / 字体 / CSS / JS（带 hash） | 常变：HTML 入口文件 / API 数据                              |

**完整判定流程**

<FrontendPerformanceFlow variant="cache" />

**`Cache-Control` 指令速查**（多个指令用逗号组合）

| 指令                        | 含义                                   | 备注                           |
| --------------------------- | -------------------------------------- | ------------------------------ |
| `max-age=31536000`          | 强缓存时长（秒）                       | 优先级高于 `Expires`           |
| `s-maxage=3600`             | 给共享缓存（CDN / 代理）的时长         | 存在时对中间节点覆盖 `max-age` |
| `public`                    | 所有节点都能存（含 CDN / 代理）        | 默认值通常不必显式写           |
| `private`                   | 仅浏览器可存，中间节点不可             | 用户相关数据必用               |
| `immutable`                 | 有效期内用户刷新也不发条件请求         | 必须配合 hash 文件名使用       |
| `no-cache`                  | 可缓存，但使用前**必须**协商           | **名字有误导**，见下文         |
| `no-store`                  | 完全禁止写入任何存储                   | 真正的「不缓存」               |
| `must-revalidate`           | 过期后必须协商成功才可用，禁用陈旧副本 | 弱网下避免返回过期内容         |
| `stale-while-revalidate=60` | 过期后先给旧值，后台异步更新           | CDN 与 Service Worker 常用     |

- **`Expires`**
  > HTTP/1.0 的绝对时间字段，**依赖客户端本地时钟**（时钟偏移 / 时区错会误判），且 `Cache-Control` 存在时被忽略 — 新项目只写 `Cache-Control`，把它当历史包袱。
- **`no-cache` vs `no-store`**（高频易错）
  > - `no-cache` **可以缓存**，只是每次使用前必须向服务器校验（本质是「强制走协商缓存」）；
  > - `no-store` **不缓存**，完全不写盘、不进内存。

**响应头示例**

```http
# 带 hash 的静态资源（一年强缓存，改文件名即失效）
Cache-Control: max-age=31536000, immutable

# HTML 入口（每次都问服务器，命中就 304 用本地）
Cache-Control: no-cache
ETag: "33a64df5"
Last-Modified: Mon, 18 Aug 2026 12:00:00 GMT

# 对应的协商请求头
If-None-Match: "33a64df5"
If-Modified-Since: Mon, 18 Aug 2026 12:00:00 GMT
```

**协商缓存的两条校验链路**

1. **`Last-Modified` / `If-Modified-Since`（基于时间）**
   > 服务器返回最后修改时间 → 再请求时浏览器带上该时间 → 未修改则 304。
2. **`ETag` / `If-None-Match`（基于内容指纹，推荐）**
   > 服务器返回内容 Hash → 再请求时浏览器带上该指纹 → 一致则 304。

**`Last-Modified` 的四个缺陷**（这也是必须有 ETag 的原因）

| #   | 缺陷           | 具体情形                                                                |
| --- | -------------- | ----------------------------------------------------------------------- |
| ①   | 精度只有秒     | 同一秒内多次修改检测不到（14:20:30.500 与 14:20:30.800 被视为未变化）   |
| ②   | 时间可被篡改   | 用户手动改系统时间，判定异常                                            |
| ③   | 多机时间不同步 | Server A 14:20:30 / Server B 14:20:35，同一份文件被判成两份             |
| ④   | 内容未变时间变 | 打开后原样保存，内容没动但 `Last-Modified` 变了，本该命中缓存却重新下载 |

**`ETag` vs `Last-Modified`**

| 维度           | ETag                       | Last-Modified                  |
| -------------- | -------------------------- | ------------------------------ |
| 验证依据       | 内容唯一标识（Hash）       | 最后修改时间                   |
| 精度           | 高（内容变即变）           | 低（秒级，毫秒级变化检测不到） |
| 性能开销       | 稍大（需计算 Hash）        | 较小（只读文件修改时间）       |
| 可靠性         | 高（内容不变则不变）       | 低（可篡改、多机时间不同步）   |
| 多服务器一致性 | 一致（内容相同则指纹相同） | 不一致（各机文件时间可能不同） |
| 优先级         | **更高**（服务器优先比对） | 更低（ETag 存在时被忽略）      |
| 适用场景       | 精确验证、CDN、分布式系统  | 静态文件、简单场景（降级方案） |

- **为什么 ETag 优先级更高**：它基于内容本身，不受时间与环境影响，准确性更高。**两者同时配置时的决策顺序**：先比 ETag（一致 ✅）→ 再比 Last-Modified（一致 ✅）→ 返回 304。
- **Weak / Strong ETag**：Strong `"abc123"` 要求字节**完全相同**才算匹配；Weak `W/"abc123"` 允许**语义相同**（字节不同但作用相同，如 gzip 前后）即匹配。
- **ETag 的性能开销与优化**：算 Hash 有成本 — 小文件（< 10MB）用完整 Hash；大文件用「文件大小 + 修改时间」组合生成（Nginx 默认的 `size-mtime`）；或直接使用 CDN 服务商提供的 ETag 计算服务。

**标准缓存分层策略（前端发布实践，必须整套配套）**

- **HTML 入口**：`Cache-Control: no-cache`（每次协商，保证入口最新，命中 304 几乎零成本）。
- **带内容哈希的静态资源**（`app.a1b2c3.js`）：`Cache-Control: max-age=31536000, immutable`（一年强缓存，改文件名即失效）。
- **API 响应**：按业务配置 `private` + 短缓存，敏感数据用 `no-store`。

> 这三条是一套完整闭环：**缺了 hash 就不能用长缓存**（内容更新后 URL 不变，用户永远拿旧版）；**缺了 HTML 的 `no-cache`，连新版文件名都传不出去**（入口本身被缓存了）。发布后「线上样式错乱 / 用户拿到旧资源」的排查顺序：先看用户是否拿到了新 `index.html` 与新 hash 资源 → 再查 `Cache-Control` / `ETag` 配置与 CDN 是否未 purge → 紧急时引导强制刷新 → 长期靠灰度发布 + 回滚预案。

**三种刷新行为的差异**

| 行为                      | 缓存表现                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| 地址栏回车 / 链接跳转     | 正常走强缓存（用户实际最常见的路径）                                |
| F5 / Cmd+R                | 多数浏览器将 `max-age` 视为 0，转为协商缓存（常回 304）             |
| Ctrl+F5 / 强制刷新        | 忽略本地缓存重新下载（请求带 `Cache-Control: no-cache` / `Pragma`） |
| DevTools 勾 Disable cache | 仅开发期生效；**别把它的结果当成用户真实表现**                      |

**其他注意事项**

- **`immutable` 的意义**：避免用户刷新时浏览器对静态资源补发条件请求（304 也要一个 RTT）。
- **memory cache 与 disk cache**：小 / 频繁用的进内存，大的进磁盘；页面刷新常走 memory，重新打开走 disk — 命中路径不同，不要误判为「缓存没生效」。
- **启发式缓存**：没写 `Cache-Control` 只有 `Last-Modified` 时，浏览器按「距 `Last-Modified` 时长的 10%」自行猜缓存期 — **永远显式写 `Cache-Control`，别依赖猜测**。
- **BFCache（往返缓存 / Back/Forward Cache）**：用户前进 / 后退时，浏览器把整个页面（JS 堆、滚动位置、DOM 状态）冻结保存，再次回来**瞬时恢复**（比任何缓存都快）。它和 HTTP 缓存是正交的两套机制 — **注意它会让 `unload` 事件不可靠**，且以下情况会禁用 BFCache：页面监听了 `unload` 事件、`Cache-Control: no-store`、页面用了 `opener` 且未 `noopener`、以及部分 `Cache-Control` 组合。正确做法：用 `pageshow` + `event.persisted` 判断恢复、用 `pagehide` 代替 `unload` 做清理、资源避免 `no-store`。可用 Chrome DevTools → Application → Back/forward cache 检测「不可缓存原因」。

### 3.4 传输与压缩

- **文本压缩**：gzip / **brotli**（brotli 压缩率更高，现代浏览器全支持，优先开启）；压缩只对文本有效，图片 / 视频本身已压缩。
- **注意**：小文件（< 1KB）压缩收益为负；动态内容压缩消耗 CPU，静态内容构建期预压缩（`.gz` / `.br`）最佳。
- **HTTP/2**：多路复用（单连接并行多请求）、头部压缩（HPACK）、二进制分帧 — 消灭 HTTP/1.1 的队头阻塞（应用层）。
- **HTTP/3（QUIC）**：基于 UDP，解决 TCP 层队头阻塞，握手更快（0/1-RTT），弱网与移动端收益明显。
- **`103 Early Hints` 取代 HTTP/2 Server Push**：Server Push 因「浏览器比服务器更懂该推什么」「推送资源难进 HTTP 缓存」等问题，Chrome 已移除支持，**不要再依赖 Push**；改用响应头 `103 Early Hints` + `Link: <style.css>; rel=preload`，在响应 body 还在传输时就让浏览器并行去拉关键 CSS / 字体 / 首图（本质是服务端代发 `preload`），显著缩短 LCP。
- **压缩算法选择**：文本优先 **brotli**（比 gzip 再小 15~25%）；新兴的 **zstd** 在部分 CDN / 服务器已可开启（压缩率与解压速度更优）。图片 / 字体本身已压缩，不要再套 gzip/brotli。
- **减少重定向链**：每多一跳就多一次完整 RTT，HSTS 可省掉 http→https 跳转。

### 3.5 资源提示（Resource Hints）

| 提示                            | 作用                                           | 典型场景                             |
| ------------------------------- | ---------------------------------------------- | ------------------------------------ |
| `dns-prefetch`                  | 提前 DNS 解析                                  | 第三方统计、图床域名                 |
| `preconnect`                    | 提前 DNS + TCP + TLS                           | API、CDN 主域名（少量使用）          |
| `preload`                       | 高优先级提前加载**当前页必需**资源             | 关键字体、LCP 大图、关键 CSS         |
| `modulepreload`                 | 预加载并解析 ES Module 及其依赖                | 入口模块                             |
| `prefetch`                      | 空闲时加载**下一跳**可能用到的资源（低优先级） | 下一页 / 登录后页面资源              |
| `prerender` / Speculation Rules | 预渲染整个页面                                 | 高概率跳转的页面（如搜索结果第一条） |

**`preload` 的两个高频坑**

1. **字体 preload 必须加 `crossorigin`**（即使同域） — 否则浏览器按匿名 CORS 模式发起**第二个**请求，字体被下载两次

```html
<link
  rel="preload"
  href="/fonts/main.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

2. **`as` 属性必须写对** — 决定优先级与缓存匹配，写错同样导致二次下载。

### 3.6 SSR / SSG / 预渲染

| 方案                    | 原理                            | 适用                                   | 代价                             |
| ----------------------- | ------------------------------- | -------------------------------------- | -------------------------------- |
| **CSR（客户端渲染）**   | 浏览器下载 JS 后渲染            | 后台管理、强交互应用                   | 首屏慢、SEO 弱                   |
| **SSR（服务端渲染）**   | 服务器生成首屏 HTML 直出        | 内容型、SEO 敏感页面                   | 服务器成本、TTFB、hydration 开销 |
| **SSG（静态生成）**     | 构建期生成 HTML                 | 文档站、博客（本站即 VitePress / SSG） | 内容更新需重新构建               |
| **预渲染（Prerender）** | 无头浏览器提前生成静态首屏 HTML | 营销页、落地页                         | 动态数据不适用                   |
| **流式 SSR / 边缘渲染** | 分块输出 / CDN 边缘执行         | 首屏瓶颈在服务端的场景                 | 复杂度高                         |

> SSR 不是银弹：HTML 早到了，但 **hydration（注水）没完成前页面不可交互**，TBT / INP 反而可能更差 — 大页面考虑 Islands 架构或选择性注水。

### 3.7 Service Worker 与离线缓存

- Service Worker 拦截请求，可自定义缓存策略：**Cache First**（静态资源）、**Network First**（API）、**Stale-While-Revalidate**（可容忍旧值的资源）。
- **坑**：SW 缓存更新不及时是经典事故源 — 新版本上线后用户可能一直跑旧版本；必须设计好版本号 + `skipWaiting` + `clients.claim` 的更新流程，重要更新提供提示刷新。

---

## 四、加载流程优化（资源层）：JS / CSS / 图片 / 字体

### 4.1 JavaScript 资源

- **压缩与混淆**：Terser / esbuild / SWC 做压缩、去死代码、变量名缩短（esbuild 速度最优）。
- **Tree Shaking**：依赖 **ESM 静态分析**
  - CommonJS（`require`）无法 tree-shake；Babel 转 CJS 会破坏 shaking（`modules: false`）。
  - 库要有 `sideEffects: false` 标记（或精确标注有副作用的文件），否则死代码被保留。
  - 按 `lodash-es`（ESM）而非 `lodash`（CJS）引入；`import dayjs` 替换 moment（moment 自带全部 locale）。
- **代码拆分（Code Splitting）**
  - 路由级动态 `import()` 是第一优先级 — 首屏只加载当前路由代码。
  - 第三方大库（编辑器 / 图表 / PDF / 大日期库）**用到才加载**，绝不做首屏静态 import。
  - 抽离公共 chunk（react/vue 等 vendor），配合长缓存。
- **异步加载脚本**：`defer`（顺序执行，DOM 解析完执行）/ `async`（下载完立即执行，顺序不保证）；详见 [脚本 Script 加载与执行指南](/fundamentals/script/)。
- **Polyfill 按需**：用 browserslist + `@babel/preset-env` 的 useBuiltIns 按目标浏览器注入，**不要全量引 core-js**（全量可占 100KB+）。
- **监控体积**：`webpack-bundle-analyzer` / `rollup-plugin-visualizer` 定期审视产物构成，依赖替换（moment→dayjs、lodash→原生、jQuery→原生）。

### 4.2 CSS 资源

- **关键 CSS（Critical CSS）**：首屏必需样式内联到 `<style>`，其余异步加载

```html
<link
  rel="stylesheet"
  href="/main.css"
  media="print"
  onload="this.media='all'"
/>
```

- **避免 `@import`**：它把 CSS 请求串行化（先下载 HTML 引用的 CSS，解析完才发现 `@import` 的下一层）；用 `<link>` 并行加载。
- **移除未使用样式**：PurgeCSS / UnCSS（Tailwind 4 天生按需生成）。
- **选择器性能**：现代浏览器引擎下选择器匹配已很快，不必过度优化；但避免**过深的嵌套层级**与高频动画节点上的昂贵属性（大阴影 / 大 blur）。
- **CSS containment**：`content-visibility: auto` 让浏览器跳过视口外元素的渲染（布局 / 绘制），长列表页收益巨大；`contain: layout/paint` 限制重排影响范围。

### 4.3 图片（页面体积的最大头）

- **格式选型与量化收益**：**AVIF > WebP > JPEG/PNG**；经验数据：WebP 比同质量 JPEG 小约 **25~35%**，AVIF 比 WebP 再小约 **50%**（移动端 / 视觉密集图收益最大）。图标 / 简单图形用 SVG；动画考虑 WebM/APNG 替代 GIF（GIF 体积巨大）。

```html
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img
    src="hero.jpg"
    width="1200"
    height="600"
    alt="示例"
    loading="lazy"
    decoding="async"
  />
</picture>
```

- **响应式图片**：`srcset` + `sizes` 按视口下发合适尺寸，别给 375px 的手机发 2560px 的图；`sizes` 要写对（常见错误是 `sizes="100vw"` 却只显示 1/3 宽，导致下发过大图）。
- **艺术指导（Art Direction）**：同一张图在桌面 / 移动端用不同构图时，用 `<picture>` 的多个 `<source media="(max-width: 600px)">` 分别指不同图，而非仅缩放同一张。
- **懒加载**：`loading="lazy"`（首屏图禁用，见 LCP 一节）；滚动容器内的图用 IntersectionObserver。
- **压缩与质量**：构建期（sharp / squoosh / imagemin）或 CDN 按需压缩；质量 75~85 通常肉眼无差；**渐进式 JPEG** 先传模糊再变清晰，首屏体感优于基线 JPEG。
- **CDN 图片处理（Image CDN）**：用 imgix / 阿里云 OSS 图片处理 / Cloudinary 等，按 URL 参数实时出图（尺寸、格式 `fm=avif`、质量、裁剪），避免仓库里存一堆静态衍生图，并自动协商 `Accept` 返回最优格式。
- **占位防 CLS**：声明宽高比；可选 LQIP / BlurHash / 主色背景低质量占位，配合 `background-color` 兜底避免空白闪烁。
- **图标**：SVG symbol / 组件化内联，替代图标字体（字体加载慢且可访问性差）。
- **Base64 内联**：只对小图标（< 2~4KB）使用 — base64 让体积膨胀约 33%，且无法独立缓存；大图内联进 CSS/JS 会把「可缓存资源」绑死在宿主文件上。

### 4.4 字体

- **WOFF2 + 子集化**：中文字体必须子集化（unicode-range 分包或只保留用到的字），否则几 MB 的字体文件是首屏杀手。
- **`font-display`**：`swap`（先用 fallback，字体到了再换，有 FOUT 抖动）/ `optional`（100ms 内没加载完就整周期用 fallback，零抖动零 CLS，适合非品牌字体）。
- **关键字体 preload**：加 `crossorigin`（见 §3.5）。
- **fallback 度量对齐**：`size-adjust` / `ascent-override` 等 descriptors 让 fallback 与真实字体度量接近，减少 swap 时的布局抖动。

---

## 五、渲染优化：关键渲染路径、重排重绘与合成层

### 5.1 关键渲染路径（Critical Rendering Path）

```text
HTML → DOM 树
CSS  → CSSOM 树          → 渲染树 → 布局(Layout/Reflow) → 绘制(Paint) → 合成(Composite)
JS   → 可阻塞 DOM 构建 / 样式应用
```

- **CSS 阻塞渲染**：浏览器在 CSSOM 就绪前不渲染任何内容（避免无样式闪烁） — CSS 无论放哪里都阻塞渲染，所以要**小而快**（关键 CSS 内联、其余异步）。
- **JS 阻塞 DOM 解析**：同步 `<script>` 阻塞解析器；无 `defer/async` 的脚本必须等前置 CSS 下载解析完（JS 可能读样式）。非关键脚本一律 `defer`。
- **优化目标**：缩短关键路径长度（关键资源数）与关键字节（关键资源体积）。

### 5.2 重排（Reflow）、重绘（Repaint）与合成

| 层级     | 触发的属性举例                                     | 开销                     |
| -------- | -------------------------------------------------- | ------------------------ |
| **重排** | `width` `height` `top` `left` `margin` `font-size` | 最高：布局 + 绘制 + 合成 |
| **重绘** | `color` `background` `visibility` `box-shadow`     | 中：绘制 + 合成          |
| **合成** | `transform` `opacity`                              | **最低：仅合成（GPU）**  |

- **动画只用 `transform` 和 `opacity`**：它们不触发重排重绘，直接走合成线程（主线程卡死也能动） — 这是渲染优化的第一原则。
- **强制同步布局（Layout Thrashing）**：交替「写样式 → 读布局」N 次，浏览器被迫重排 N 次：

```js
// 反例：每次循环先读 offsetHeight（强制同步布局）再写样式
for (const el of items) {
  const h = el.offsetHeight; // 读布局 → 作废上一次写入
  el.style.height = h + 10 + "px"; // 写样式
}

// 正解：先批量读，再批量写（读写分离）
const heights = items.map((el) => el.offsetHeight);
items.forEach((el, i) => {
  el.style.height = heights[i] + 10 + "px";
});
```

- **批量 DOM 操作**：`DocumentFragment` / 一次性 innerHTML / 离线克隆节点改完再替换；隐藏状态（`display:none`）下的修改只重排一次。
- **高频读布局的场景**（resize / scroll 回调里读 `getBoundingClientRect`）必须做缓存或 rAF 合并。

### 5.3 合成层与 GPU

- **提升为合成层的常见条件**：`transform: translateZ(0)` / 3D transform、`will-change: transform/opacity`、`<video>`、`<canvas>`、WebGL、对 `opacity`/`transform` 做动画。
- **收益**：该元素的动画 / 滚动不再牵动主线程。
- **代价与坑（层爆炸 Layer Explosion）**：每个合成层都要占 GPU 内存，层数失控反而变卡。**只对真正动画的元素临时提升**，动画结束后移除 `will-change`（常驻 `will-change` 是常见误用）。
- 调试：DevTools → Layers 面板查看层数量 / 大小 / 提升原因。

### 5.4 事件委托与 DOM 操作优化

- **事件委托（Event Delegation）**：对列表 / 大量同类元素，把监听挂在**父容器**上，用 `event.target` 判定目标，而非给每个子元素单独 `addEventListener` — 监听器数量从 N 降到 1，节点增删无需重新绑定（React / Vue 的合成就用了同样的思路）。注意：部分事件（如 `focus`/`blur`）不冒泡，需用 `focusin`/`focusout`，或对捕获阶段监听。
- **避免全局变量**：全局变量驻留整个页面生命周期、易引发命名冲突与意外引用泄漏（见 §6.6）；模块作用域 / 闭包 / `const`/`let` 替代 `var` 与隐式全局。
- **高频事件治理**：`scroll` / `mousemove` / `resize` / `pointermove` 触发极频繁 — 统一走「防抖节流 + `passive` + rAF 合并 + `getBoundingClientRect` 结果缓存」（见 §6.3、§8.3），禁止在回调里读写布局或做重计算。
- **批量 DOM 更新**（已在 §5.2 提及）：`DocumentFragment`、整块 `innerHTML`、隐藏态（`display:none`）下改完再显示 — 只触发一次重排。

---

## 六、JavaScript 执行优化：长任务、事件循环与内存

### 6.1 长任务与主线程

- 主线程一次只执行一个任务，**超过 50ms 即为长任务** — 期间无法响应输入（INP 恶化）、无法做渲染。
- 事件循环 / 宏微任务细节见 [浏览器核心知识手册](/fundamentals/browser/)；本节关注**怎么拆任务**。

### 6.2 任务切片（Time Slicing）

把大计算切成多个 < 50ms 的小块，让浏览器有机会处理输入与渲染：

```js
async function processChunks(list, handle) {
  for (let i = 0; i < list.length; i++) {
    handle(list[i]);
    if (i % 100 === 0) {
      // 每处理一批让出主线程；yield 后其他任务 / 渲染得以插入
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}
```

- `setTimeout(fn, 0)` 与 `MessageChannel` 都可让出主线程（MessageChannel 嵌套节流更稳）；新 API 有 `scheduler.yield()`（Chrome 129+）。 |
- 高优先级更新要用微任务（`queueMicrotask`），低优先级才让宏任务。

### 6.3 防抖与节流

| 手段         | 行为                             | 典型场景                                  | 备注         |
| ------------ | -------------------------------- | ----------------------------------------- | ------------ |
| **防抖**     | 停止触发 N 毫秒后才执行一次      | 搜索输入联想、resize 完成后重算、表单校验 | 最后一次生效 |
| **节流**     | 固定频率最多执行一次             | scroll / mousemove / 拖拽、打点上报       | 降低触发频率 |
| **rAF 节流** | 每帧最多执行一次，与渲染节拍对齐 | 滚动相关的视觉更新（首选）                |     —         |

- **坑**：防抖用在「首输入」上会人为制造输入延迟（INP 恶化） — 搜索框防抖要平衡等待时间；防抖闭包里持有的引用注意释放（内存）。
- `passive: true`：`addEventListener('scroll', fn, { passive: true })` 告知浏览器不会 `preventDefault`，滚动不再等 JS 执行完（滚动性能必做项）。

### 6.4 Web Worker

- 把 **CPU 密集**计算（大 JSON 解析、加解密、图像处理、复杂排序）移出主线程

```js
const worker = new Worker(new URL("./heavy.worker.ts", import.meta.url));
worker.postMessage(payload);
worker.onmessage = (e) => render(e.data);
```

- **限制**：不能操作 DOM / window；通信用 `postMessage` 结构化克隆（大数据有拷贝成本，可用 `Transferable`（如 ArrayBuffer）零拷贝转移）。
- Worker 加载也有启动成本，常驻场景才划算；超轻计算不值得开 Worker。

### 6.5 requestAnimationFrame 与 requestIdleCallback

- **rAF**：下一帧渲染前执行，做视觉相关批量更新（读布局后写样式放这里，同帧内读写不分裂）。
- **rIC**（requestIdleCallback）：空闲时执行低优先级任务（预计算、打点、预加载），**必须传 timeout** 防止永远不执行；Safari 不支持需降级 setTimeout。

### 6.6 内存与垃圾回收

- V8 分代 GC：新对象在新生代（Scavenge，快而频繁），长活对象晋升老生代（Mark-Sweep / Mark-Compact，代价高）。**避免制造大量长命临时对象**（如全局缓存无上限增长）。
- **常见内存泄漏清单**（前端 90% 的泄漏来自这里）
  1. **意外的全局变量**（未声明的赋值挂在 window 上）。
  2. **被遗忘的定时器**：`setInterval` 回调持有大对象，组件销毁不 `clearInterval`。
  3. **游离 DOM 引用**：JS 变量存着已从文档移除的节点（`let el = document.querySelector(...)` 后 `remove()`）。
  4. **未解绑的事件监听**：尤其是 window / document 上的全局监听。
  5. **闭包持有大作用域**：回调长期引用大数组 / 大 DOM。
  6. `console.log(大对象)`（生产环境保留日志也会 retain 引用）。
- **治理**：`WeakMap` / `WeakRef` 存可回收的关联数据；SPA 路由切换时清理副作用（React useEffect cleanup / Vue onUnmounted）。
- **排查**：DevTools Memory 面板拍堆快照（操作前后对比，找 detached DOM 与增长对象）、Allocation instrumentation 看分配点。

---

## 七、框架与工程化层面的性能优化

### 7.1 React

- **列表 `key`**：用稳定唯一 id，禁用数组下标（插入 / 删除时引发错误复用与全量重渲染）。
- **渲染优化**：`React.memo` / `useMemo` / `useCallback` — 但**不要无脑包**：比较 props 也有成本，配合不可变更新（引用稳定）才有意义；滥用反而更慢更难维护。
- **状态下放（状态 colocate）**：把频繁变化的状态移到最小子树，避免顶层 state 拖动整页重渲。
- **代码拆分**：`React.lazy` + `Suspense` 路由级拆分；首屏页面**禁止**静态 import 重依赖（编辑器 / 图表 / PDF），一律用到才 `import()`。
- **并发特性**：大列表筛选等低优先级更新用 `startTransition` 包裹，保持输入响应（直接改善 INP）。
- **大表单 / 大列表**：受控输入每键触发重渲时，考虑非受控 + 事件外同步；列表虚拟化（见第八章）。
- **`Context` 拆分避免全量重渲染**：一个大型 `Context` 值变化会让所有消费组件重渲；按「稳定值 / 高频变化值」拆多个 Provider，或用「状态外置（如 Zustand / Jotai 的细粒度订阅）」替代 Context 广播。
- **内联对象 / 函数会令 `React.memo` 失效**：每次渲染新建 `{onClick: () => ...}` 或 `{}` 作为 prop，引用变化导致 memo 子组件照样重渲 — 用 `useCallback` / `useMemo` 稳定引用，或把内联对象移到组件外。
- **`React Compiler`（曾名 Forget）**：编译期自动插入 `memo` / `useMemo` / `useCallback`，免去手写记忆化（需严格模式兼容的纯组件）；渐进接入时可作为「免 manual memo」的升级路径。
- **并发特性进阶**：`useDeferredValue` 给「搜索结果」等非紧急值降优先级，输入框保持即时响应；`useTransition` 标记低优先级更新（见 §6.2 任务切片思想同源）。`Profiler` API / React DevTools Profiler 火焰图定位「哪个组件重渲、花多久」。
- **Fiber 与可中断渲染（理解即可）**：React 的 Fiber 架构把渲染拆成可中断、可恢复的单元，长列表 / 复杂树的 reconcile 不再一次性阻塞主线程 — 这是并发特性与 `startTransition` 的底层基础。

### 7.2 Vue

#### 7.2.1 编译时优化（Vue3 性能的核心优势）

Vue3 的模板编译器在编译期做了大量优化，使运行时 diff 极轻 — 这是 Vue 生态高级工程师必须理解、也是面试高频点

- **PatchFlag（动态标记）**：编译器为每个**动态节点**打上类型标记（如 `TEXT` / `CLASS` / `PROPS`），运行时 diff 只比对带 PatchFlag 的节点与对应字段，**静态部分完全跳过**。
- **Block Tree（区块树）**：模板按 `v-if` / `v-for` / 插槽等「结构可能变化」的边界切成 Block，每个 Block 收集其下所有动态子节点进一个扁平数组，diff 时直接遍历动态节点数组，避免递归整棵树。
- **静态提升（hoistStatic）**：静态节点与静态 `class` / `style` 提升到 `render` 函数外，只在首render 创建一次，后续复用同一 VNode — 大段静态模板收益明显。
- **事件处理缓存（cacheHandler）**：`@click="foo"` 这类内联事件在编译期缓存，避免因「每次渲染生成新函数」触发子组件无谓更新。
- **认知收益**：正因为这些编译优化，Vue3 中「大量静态节点 + 少量动态」的页面开销很低；但用 `v-html`、手动 `h()` 渲染函数、或在 `setup` 里做重计算会绕过编译优化，需另行优化。

#### 7.2.2 响应式系统性能特征

- **Proxy 深层代理的代价**：Vue3 对 `reactive` 对象递归用 Proxy 代理，**初始化（首次访问深层属性才懒代理）和读取都有开销**；超大对象（万级 JSON）或高频更新的大数组是重灾区。
- **响应式 API 选型**
  - `shallowRef` / `shallowReactive`：只代理一层，深层不转响应式 — 大列表 / 配置对象首选，配合手动 `.value = 新数组` 整体替换触发更新。
  - `markRaw`：显式标记「永不转响应式」，用于第三方实例（图表、编辑器、`window` 句柄），避免无意义的代理。
  - `triggerRef`：浅层 ref 改了深层属性后手动触发更新。
  - `toRaw`：需要拿原始对象做高性能遍历 / 传给无响应式依赖的库时取原值。
  - `ref` vs `reactive`：基础类型用 `ref`；大数组用 `shallowRef`（而非 `reactive` 深层包裹）。
- **跳过响应式**：一次性展示、不再变的数据（如死配置、枚举表）用 `markRaw` / `Object.freeze` 或干脆存模块变量，别塞进 `reactive`。

#### 7.2.3 渲染相关指令与 API

- **`v-if` vs `v-show`**：频繁切换用 `v-show`（仅 `display` 切换），条件很少变 / 初始代价大用 `v-if`（不渲染销毁、不占响应式与事件）。注意 `v-if` 与 `v-for` 同元素时 `v-if` 优先级更高（Vue3），易踩「列表里条件过滤」的坑 — 用 `computed` 过滤列表再 `v-for`。
- **列表 `key`**：用稳定唯一 id，禁用数组下标（头插 / 删除引发错误复用与全量重渲染）。
- **`v-once`**：节点只渲染一次、后续跳过更新 — 适合静态大段（如页脚、常量区），但会**永久**脱离响应式，别用在会变的内容上。
- **`v-memo`**：列表项级缓存，依赖数组不变就跳过该节点及其子树 diff，`[ ]` 表示永不更新（极致优化，滥用反伤可维护性）。
- **`computed` 缓存**：依赖不变不重算，替代模板里的「方法调用取值」（方法每次渲染都执行）。
- **函数式组件（`<script setup>` 中的 `functional` / 纯函数组件）**：无状态、无实例、无响应式开销，适合纯展示包装层。
- **`defineAsyncComponent`**：重组件 / 路由级组件按需加载，避免首屏扛全部 bundle。
- **事件修饰符**：`@scroll.passive` / `@touchmove.passive` 等声明被动监听，提升滚动性能（见 §6.3、§8.3）。

#### 7.2.4 缓存范围与大数据冻结

- **`keep-alive`**：缓存组件实例避免重复创建；用 `include` / `exclude` / `max` 控制范围 — **无上限缓存是内存泄漏源**（尤其路由级 keep-alive 堆积）。
- **`Object.freeze` 冻结非响应式大数据**：对只读的大数组 / 大对象 `Object.freeze`，Vue 检测到 frozen 会跳过响应式转换，初始化与遍历开销大幅下降（配合 `shallowRef` 效果更佳）。
- **`v-for` + 大数据**：万级列表一律虚拟化（见 §8.4）；非列表的大 JSON 展示考虑分页 / 折叠。

### 7.3 通用与工程化

- **虚拟列表**：万级长列表只渲染视口内十几条（原理与实现见第八章），React 用 `react-window`，Vue 用 `vue-virtual-scroller` / 自研。
- **构建侧**
  - 产物分析（bundle analyzer）常备，警惕「一个依赖拖垮体积」。
  - 合理拆包：vendor 稳定 chunk 长缓存 + 业务代码独立，提升缓存命中率。
  - dev 预构建（Vite optimizeDeps / esbuild）解决开发期冷启动，但这是开发体验，与产物性能是两回事。
- **微前端**：公共依赖外部化（共享 single-spa / module federation），避免每个子应用打包一份 React/Vue；子应用按需注册加载。
- **小程序 / 跨端**：小程序注意分包加载（subpackage）、控制 `setData` 数据量与频率（微信）；App 端关注启动耗时与热更新资源体积。

---

## 八、卡顿与流畅度：滚动、动画与大列表

### 8.1 卡顿的本质

- 屏幕按 60Hz（高刷 120Hz+）刷新，每帧预算约 **16.7ms**（120Hz 为 8.3ms）；帧内要完成「JS → Style → Layout → Paint → Composite」，超预算即掉帧，肉眼可感知卡顿。
- **掉帧两大来源**：主线程长任务（JS 卡顿）与渲染过重（布局 / 绘制过大范围）。

### 8.2 动画优化原则

1. **只动画 `transform` 与 `opacity`**（合成器动画，见 §5.2）。
2. **滚动绑定的动画用 rAF 驱动**，别在 scroll 事件里直接改样式（滚动回调与渲染不同步）。
3. **临时 `will-change`** 提升即将动画的元素，结束移除。
4. **CSS 动画优先于 JS 动画**（能在合成线程跑）；JS 弹簧物理动画（如 framer-motion）注意在动画期间减少同帧其他工作。
5. **`prefers-reduced-motion`**：尊重用户的减弱动效偏好（可用性 + 无障碍要求）。

### 8.3 滚动优化

- `passive: true`（必做，见 §6.3）。
- scroll 回调内**禁止读写布局**（强制同步布局会让每帧重排）；需要派生状态时先缓存 / 用 IntersectionObserver / `content-visibility` 替代「滚动里量几何」。
- 吸顶 / 懒加载 / 曝光打点等滚动需求优先用 **IntersectionObserver**（浏览器异步批量回调，零布局开销）替代 scroll 监听。

### 8.4 大列表与长页面

- **虚拟化**：只渲染可视区 ± 缓冲区的行。固定行高最简单；动态行高需要测量缓存或预估 + 修正。表格虚拟化注意用 `border-separate` 且边框挂在单元格，避免 spacer 行破坏表格布局。
- **长页面渲染暂停**：`content-visibility: auto` + `contain-intrinsic-size`，让视口外区块跳过渲染。
- **图片瀑布流**：IntersectionObserver 懒加载 + 占位宽高比。

### 8.5 Canvas / WebGL 专项

- **分层**：静态背景与动态前景拆两张 canvas，静态层只在变化时重绘。
- **脏矩形**：只重绘变化区域，不清屏全量重画。
- **离屏 canvas**（OffscreenCanvas）：把绘制移到 Worker，或预渲染重复元素（图元缓存位图后 drawImage）。
- **帧率控制**：用 rAF 驱动重绘循环，页面不可见（`document.hidden`）时暂停。
- 高频粒子 / 大规模图形优先 WebGL（batch draw），Canvas 2D 大量 drawCall 是 CPU 瓶颈。

### 8.6 首屏体验与白屏治理

- **骨架屏（Skeleton）**：内容未到时先画结构占位（固定尺寸的灰块），既是「加载中」反馈，也固定了布局高度防止 CLS（见 §2.3）。SSR 直出骨架、CSR 用组件占位皆可。
- **App Shell 模型**：把「外壳（顶栏 / 侧边 / 布局）」离线缓存（Service Worker），内容按需填充 — 二次访问外壳秒出，首屏从「白屏 → 内容」变为「外壳 → 内容」，体感大幅提升。
- **流式 SSR / 分块输出**：服务器边查边吐 HTML（`<Suspense>` 流式、Edge SSR），首屏无需等全量数据齐了才渲染；配合 `<link rel="preload">` / `103 Early Hints` 缩短 LCP（见 §3.4、§3.6）。
- **CSR 白屏治理**：纯 CSR 在 JS 下载执行前是白屏 — 关键首屏用 SSR / SSG / 预渲染（见 §3.6）；至少用内联骨架 + 关键 CSS 让首屏「先有结构」。
- **首屏资源顺序**：CSS 内联关键、JS `defer`、字体 `font-display: swap`、LCP 图 `fetchpriority="high"` 且**不要 `lazy`**（见 §2.2） — 首屏的每一毫秒都在 LCP 阈值内。

---

## 九、性能监控与度量工具

### 9.1 Performance API（浏览器原生度量）

```js
// 高精度时间
performance.now();

// 打点与测量
performance.mark("query-start");
doQuery();
performance.mark("query-end");
performance.measure("query", "query-start", "query-end");
const [m] = performance.getEntriesByName("query");

// 页面加载各阶段（Navigation Timing Level 2）
const [nav] = performance.getEntriesByType("navigation");
// nav.domContentLoadedEventEnd / loadEventEnd / responseStart(TTFB) ...

// 资源耗时（每个资源的 TTFB / duration / 传输协议）
performance.getEntriesByType("resource");

// 首屏绘制
performance.getEntriesByType("paint"); // first-paint / first-contentful-paint
```

- 旧 `performance.timing`（Level 1）已废弃，统一用 `getEntriesByType('navigation')`。

### 9.2 PerformanceObserver（持续观测）

```js
// 长任务监控（可统计 TBT、定位卡顿窗口）
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log("longtask:", entry.duration, entry.startTime);
  }
}).observe({ type: "longtask", buffered: true });

// LCP / CLS / INP 同样可观测：type 分别为 'largest-contentful-paint' / 'layout-shift' / 'event'
```

- `buffered: true` 可拿到 observer 注册**之前**已发生的记录（指标上报必加，否则丢首屏数据）。

### 9.3 web-vitals 库（指标上报标配）

```js
import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals";

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

- 内部基于 PerformanceObserver + 兼容性封装，是生产环境采集 Core Web Vitals 的事实的标准方案；上报时机注意用 `sendBeacon`（页面卸载也能发出）。

### 9.4 DevTools 工具箱

| 工具                 | 用途                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| **Performance 面板** | 录制火焰图：看主线程任务、布局 / 绘制、帧率；Bottom-Up 找耗时大头        |
| **Network 面板**     | 瀑布图、资源优先级（Priority 列）、缓存命中、TTFB、协议（h2/h3）         |
| **Coverage 面板**    | JS / CSS 的实际使用率 — 首屏没用到却加载了多少字节                       |
| **Rendering 选项卡** | Paint Flashing（重绘高亮）、Layout Shift Regions（CLS 可视化）、FPS 计   |
| **Layers 面板**      | 合成层数量 / 大小 / 提升原因（排查层爆炸）                               |
| **Memory 面板**      | 堆快照对比、分配时间线（泄漏定位）                                       |
| **Lighthouse / PSI** | 实验室评分 + 优化建议清单；PageSpeed Insights 附带 CrUX 真实用户字段数据 |
| **WebPageTest**      | 多地域多设备实测、首屏瀑布深入分析                                       |

### 9.5 线上监控与性能预算

- **RUM（真实用户监控）**：web-vitals 采集 + 埋点上报，看 **P75** 分布；关联版本号 / 路由 / 设备分层归因。
- **上报细节**：`navigator.sendBeacon` 或 `fetch(..., { keepalive: true })`；采样控制量；SPA 路由切换要重新评估指标窗口。
- **性能预算（Performance Budget）**：给关键指标与产物体积设红线（如首屏 JS < 200KB、LCP < 2.5s），CI 里用 bundle-size-action / Lighthouse CI 卡口，**超预算即失败** — 性能必须有「防回归机制」，否则会随迭代无声劣化。预算的落地与「开发 / 部署 / 运维三阶段」完整流程见[第十二章](#十二、性能工程化治理-预算-分析流程-三阶段落地)。

---

## 十、注意事项、坑点与常见反模式

### 10.1 策略层反模式

| 反模式                   | 正确做法                                                            |
| ------------------------ | ------------------------------------------------------------------- |
| 凭感觉优化，不先测量     | 先 Profile / 监控定位瓶颈，二八原则抓大头                           |
| 只优化实验室数据         | 以线上真实用户 P75 为准（开发机性能普遍远超用户设备）               |
| 过度优化                 | 为 1KB 牺牲可读性、为极端场景拖慢主路径都是负收益；性能预算内即达标 |
| 优化完不复测、不做防回归 | 一次一改一测；设 CI 性能卡口与监控基线                              |
| 把 SSR 当万能药          | hydration 开销可能恶化交互指标；按页面类型选 CSR/SSR/SSG            |

### 10.2 高频技术坑点清单

1. **首屏图片 `loading="lazy"`**：懒加载资源不参与 LCP，首屏大图懒加载直接恶化 LCP — 首屏图用 `fetchpriority="high"` + preload。
2. **图片不写尺寸**：CLS 头号来源；永远写 `width/height` 或 `aspect-ratio`。
3. **字体 preload 忘加 `crossorigin`**：字体被下载两次（见 §3.5）。
4. **`background-image` 无法懒加载**：需要懒加载的图用 `<img loading="lazy">` 或 `IntersectionObserver`。
5. **`@import` 串行加载 CSS**：换 `<link>` 并行。
6. **同步 XHR**：`XMLHttpRequest` 同步模式冻结主线程（INP 杀手），已被标准标记弃用。
7. **动画改 `left/top/width`**：触发重排；用 `transform`。
8. **常驻 `will-change`**：层常驻占用显存，反而降性能；动画前加、结束删。
9. **读写布局交替**：循环里 `offsetHeight` + 写样式 = 布局抖动（见 §5.2）。
10. **scroll 监听不带 passive**：滚动被 JS 阻塞，全页掉帧。
11. **防抖用错地方**：把首交互（按钮 / 输入）防抖会制造输入延迟，恶化 INP。
12. **定时器 / 监听不清理**：SPA 路由切换后的内存泄漏与重复回调（同一逻辑触发 N 次）。
13. **无脑 `React.memo` / `useMemo`**：比较成本 + 代码噪音，只在「重渲染确实昂贵且 props 稳定」处用。
14. **数组下标当 `key`**：列表头插 / 删除时状态错乱 + 全量重渲。
15. **tree-shaking 失效**：Babel 转 CJS、库无 `sideEffects` 标记、从入口文件整包 import。
16. **全量 polyfill / 全量 locale**：moment 全 locale、core-js 全量都是几百 KB 级浪费。
17. **长缓存资源不带 hash**：内容更新后用户拿不到新版本；反过来 HTML 被强缓存则更新不可达 — 缓存策略必须「HTML `no-cache` 协商 + 静态资源哈希 + 一年 `immutable`」整套配套（见 §3.3）。
18. **以为 `no-cache` 就是不缓存**：它是「可缓存但每次必须协商」，真正的禁止缓存是 `no-store`（见 §3.3）。
19. **拿 `Expires` 当主配置**：绝对时间依赖客户端本地时钟，且优先级低于 `Cache-Control`，统一写 `Cache-Control`。
20. **只做 ETag 不看 CDN**：静态资源更新后 CDN 边缘仍是旧副本，没有 purge 或新版 URL 就永远换不掉。
21. **Service Worker 更新卡死**：旧 SW 迟迟不释放导致用户永远在旧版本（见 §3.7）。
22. **HTTP/2 下仍做域名分片 / 过度合并请求**：多路复用后这些都从优化变成劣化。
23. **`{{}}` 模板字符串里的插值残留**：构建模板时注意不要把 Vue/模板占位符漏进生产 HTML（渲染空数据 / 报错）。
24. **依赖 `performance.timing`**：已废弃，用 Navigation Timing Level 2。
25. **FID 达标就认为交互没问题**：FID 只看第一次输入；INP 才反映全部交互。
26. **base64 大图内联进 CSS/JS**：膨胀 33% 且无法独立缓存。
27. **`console.log` 带大对象进生产**：日志引用阻止回收，还拖慢执行。

### 10.3 移动端与弱网专项

- 移动设备 CPU / 内存 / 网络全面弱于开发机：**以中端安卓 + 4G 弱网为基线测试**。
- 减少首屏请求数（弱网下每请求 RTT 都贵）、谨慎使用大体积 Web 字体与重型框架。
- `saveData` / `navigator.connection`（effectiveType、saveData）可做分级加载体验。

---

## 十一、性能优化 Checklist 速查

### 11.1 加载层

- [ ] 静态资源上 CDN；HTML `no-cache` 协商 + 哈希资源 `max-age=31536000, immutable`，版本更新时同步 purge CDN
- [ ] 协商缓存配有 `ETag`（必要时保留 `Last-Modified` 降级），确认能回 304 且无 body
- [ ] 开启 gzip / brotli 压缩
- [ ] HTTP/2 / HTTP/3，不做域名分片
- [ ] 关键域名 `preconnect`，关键资源 `preload`（字体带 `crossorigin`）
- [ ] 路由级代码拆分，重依赖用到才加载
- [ ] 首屏图 `fetchpriority="high"` 且不懒加载，全站图片声明尺寸
- [ ] WebP/AVIF + 响应式 `srcset`
- [ ] 中文字体子集化 + `font-display`
- [ ] 按页面类型选 CSR / SSR / SSG
- [ ] 关键资源用 `103 Early Hints` 代发 preload（弃用已废弃的 HTTP/2 Server Push）
- [ ] 资源避免 `no-store`、页面避免 `unload` 监听，保住 BFCache 往返缓存

### 11.2 渲染层

- [ ] 关键 CSS 内联，非关键 CSS 异步
- [ ] 动画只用 `transform` / `opacity`
- [ ] 读写布局分离，消除布局抖动
- [ ] `passive: true` + scroll 回调 rAF 化 / IntersectionObserver 化
- [ ] `will-change` 临时使用，动画后移除
- [ ] 长页面 / 长列表上 `content-visibility` 或虚拟化
- [ ] 列表 / 高频同类元素用事件委托（父容器单一监听）

### 11.3 运行时

- [ ] 长任务切片，CPU 密集进 Worker
- [ ] 防抖节流用对场景（scroll 节流 / 输入防抖，不碰首交互）
- [ ] 定时器 / 监听器 / 副作用在卸载时清理
- [ ] 大数据集跳过深度响应式（`shallowRef` / `markRaw`），只读大数组 `Object.freeze`
- [ ] 生产环境剥离 `console` 与调试代码

### 11.4 监控与防回归

- [ ] web-vitals 采集 LCP / INP / CLS 并上报（`sendBeacon`）
- [ ] longtask 观测 + 错误监控关联
- [ ] Lighthouse CI / 体积预算进 CI 卡口
- [ ] 以线上 P75 数据驱动优化排序，一次一改一复测
- [ ] 性能预算 + 三阶段落地（开发 / 部署 / 运维）纳入 CI 卡口与告警（见第十二章）

---

## 十二、性能工程化治理：预算 / 分析流程 / 三阶段落地

> 性能不是「一次性优化」，而是**工程能力**：没有预算、没有流程、没有监控，所有优化都会随迭代无声回退。本节面向「高级前端 / 前端负责人」 — 把性能从「个人技巧」变成「团队可复制、可防回归的机制」。

### 12.1 性能预算（Performance Budget）

- **两类预算都要有**
  - **指标预算**：LCP < 2.5s、INP < 200ms、CLS < 0.1、TBT < 200ms、Lighthouse 总分 ≥ 90（按业务定阈值）。
  - **体积预算**：首屏 JS / CSS 总传输（gzip 后）上限、单路由 bundle 上限、依赖「黑名单」（如禁入 moment / lodash 整包）。
- **预算要落到 CI 卡口**（否则只是文档）：`Lighthouse CI`（`lhci`）、`lighthouse-ci`、bundle 体积用 `size-limit` / `bundlewatch` / `bundlesize`，PR 阶段自动比对 master 的体积与评分，**超阈值直接失败 / 评论报警**。
- **预算要分层**：全站基线预算 + 单路由更严格的预算（首屏路由最严）；与「缓存分层」（§3.3）配合 — 哈希资源长缓存，所以体积预算重点盯「首屏关键路径体积」。
- **常见坑**：只设预算不接 CI = 形同虚设；预算过严导致频繁失败被团队「绕过」 — 阈值要基于真实数据（线上 P75）倒推，而非拍脑袋。

### 12.2 性能分析流程（实验室 + 现场 + 归因闭环）

把「优化」做成可复用的排查 SOP，而不是凭手感

1. **建立现场数据（Field）**：web-vitals + RUM 上报，按版本 / 路由 / 设备 / 网络分层看 **P75**（见 §9.5）；先回答「谁慢、慢在哪、占比多少」。
2. **复现到实验室（Lab）**：对慢的路由跑 Lighthouse / WebPageTest（选中端安卓 + 4G 弱网，贴近真实用户），拿到可复现的分数与瀑布。
3. **定位瓶颈**：DevTools Performance 录制火焰图 — 看是「网络等待（TTFB / 资源下载）」「长任务（JS 阻塞）」还是「渲染（布局 / 绘制 / 合成）」占大头；Network 面板看请求瀑布与优先级；Coverage 面板看「加载了但没用」的字节（见 §9.4）。
4. **归因与决策**：二八原则，先打最大头（首屏 JS 体积、LCP 资源、长任务）；把指标拆到子项（如 LCP 拆 TTFB / 发现延迟 / 加载 / 渲染，见 §2.2）逐个击破。
5. **改一类、复测一类**：一次只改一处，改完回实验室 + 现场对比；把「原因 → 手段 → 前后数值」写进 PR 描述，沉淀为团队知识。
6. **固化防回归**：把关键路由纳入 Lighthouse CI 预算（§12.1），并把本次优化登记进 Checklist（第十一章）。

> 一句话：**现场定问题、实验室定位、火焰图定因、CI 防回归**。

### 12.3 开发 / 部署 / 运维三阶段落地

**开发阶段**

- 把性能预算写进组件评审清单（首屏体积、是否引入重依赖、是否懒加载）。
- 用 Coverage / Bundle Analyzer 在开发期就发现「加载了没用到」的代码。
- 组件级性能意识：列表虚拟化、事件委托、避免内联对象、大数据冻结 / 浅响应（Vue，见 §7.2）、memo 用对（React，见 §7.1）。

**部署阶段**

- CDN + 边缘缓存、强缓存分层（`no-cache` HTML + 哈希资源 `immutable`，见 §3.3）、开启 brotli / zstd 压缩。
- `103 Early Hints` 代发关键资源 preload（见 §3.4）；按页面类型选 CSR / SSR / SSG / 流式（见 §3.6、§8.6）。
- 发布用「灰度 + 回滚」：因为缓存分层，发布异常时需要有快速回滚与 CDN purge 预案（见 §3.3 排查链）。

**运维阶段**

- 真实用户监控常态化：Core Web Vitals P75 看板 + 告警阈值（如 LCP P75 连续超 2.5s 报警）。
- 定期评估：新设备 / 新浏览器 / 新网络下复测；技术更新（新格式 AVIF、新压缩 zstd、新 API `scheduler.yield`）及时引入。
- 性能技术债偿还：把「历史页面」纳入定期优化排期，而非只优化新页面。

### 12.4 协作机制（让性能真正被重视）

- **性能作为 SLI/SLO**：把 LCP / INP / CLS 写进服务的 SLO，有负责人、有告警、有复盘，性能问题才有「被排期」的资格。
- **性能回归 Gate**：CI 红 = 不可合并；发布前性能验收单（对照第十一章 Checklist）。
- **知识沉淀**：典型优化写成「原因 → 复现 → 手段 → 数值」的 case，形成团队性能知识库（本文即此类沉淀的骨架）。
