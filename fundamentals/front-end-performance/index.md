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
> 面向角色：初中高级前端工程师。本文按「先建立体系 → 逐层拆解（指标 / 网络 / 资源 / 渲染 / JS 执行 / 框架 / 卡顿 / 监控）→ 汇总坑点与 Checklist」展开，覆盖前端性能优化的关键知识点、重点、注意事项与高频坑点。浏览器内部机制（进程 / 线程 / 渲染管线 / 事件循环）见 [浏览器核心知识手册](/fundamentals/browser/)，脚本加载细节见 [脚本 Script 加载与执行指南](/fundamentals/script/)，HTTP 协议层见 [HTTP / HTTPS 核心知识手册](/fundamentals/http/)——本文聚焦「怎么测、怎么优化、坑在哪」。

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

---

## 一、性能优化总览：双轴模型与切入方式

### 1.1 性能为什么重要

- **业务指标直接受影响**：加载时间每增加 1 秒，转化率与留存率都会明显下降（Amazon / Google 历史上都有公开数据支撑）；移动端用户对超过 3 秒的加载容忍度极低。
- **SEO 排名因素**：Core Web Vitals（LCP / INP / CLS）是 Google 搜索排名的正式信号。
- **用户体验本质是「快」**：功能做出来了但很卡，约等于没做好。

### 1.2 双轴模型：时间与空间

前端性能问题可以归纳为两个维度，所有优化手段都能挂到这两条轴上：

| 维度         | 目标         | 典型手段                                                                           |
| ------------ | ------------ | ---------------------------------------------------------------------------------- |
| **时间角度** | 减少耗时     | 缓存、CDN、HTTP/2、压缩、按需加载、SSR、预加载、任务切片、防抖节流                 |
| **空间角度** | 降低资源占用 | 代码拆分、Tree Shaking、图片压缩与格式升级、移除未使用代码、虚拟列表、内存泄漏治理 |

> 时间轴上又分两段：**加载时**（从发起到可交互）与**运行时**（交互 / 渲染 / 响应）；空间轴上分**体积**（传输大小）与**内存**（占用与泄漏）。

### 1.3 加载流程视角

把「输入 URL 到页面可交互」的完整链路摆出来，每一环都对应一类优化：

```text
DNS 解析 → TCP/TLS 握手 → 发送请求 → 服务端处理 → 响应传输
→ HTML 解析(DOM) → CSSOM 构建 → 渲染树 → 布局(Layout) → 绘制(Paint) → 合成(Composite)
→ 脚本执行 → 可交互 → 持续运行(动画/滚动/交互响应)
```

- **前半段（网络）**：靠缓存、CDN、协议升级、压缩、资源提示。
- **中段（解析与首次渲染）**：靠关键渲染路径优化、资源分层（关键 / 非关键）、SSR / 预渲染。
- **后段（运行时）**：靠 JS 执行优化、渲染优化、卡顿治理、内存治理。

### 1.4 方法论：先测量，后优化

**铁律：没有度量就没有优化。** 凭感觉优化是新手最常见的错误——花一周优化的模块可能只占耗时的 2%。

1. **先测量**：用 Performance 面板 / Lighthouse / 线上监控定位真正的瓶颈（网络？渲染？脚本执行？）。
2. **再优化**：针对瓶颈选手段，一次只改一类，改完复测。
3. **防回归**：建立性能预算（Performance Budget）与监控基线，持续盯指标。

> 二八原则：80% 的性能收益来自 20% 的关键优化（首屏 JS 体积、LCP 资源、长任务），不要陷入「过度优化」——为省 1KB 牺牲可维护性通常是负收益。

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

> **Core Web Vitals（2024 起三件套）= LCP（加载）+ INP（交互）+ CLS（视觉稳定）**。FID 已被 INP 取代（2024-03 起正式废弃）——FID 只测「第一次交互的输入延迟」，INP 衡量「全生命周期所有交互的最差响应」，更接近真实体验。

### 2.2 LCP：最大内容绘制

- **LCP 候选元素**：`<img>`、`<image>` in `<svg>`、`<video>` 的封面、带背景图的元素、块级文本元素。取**用户视口内最大者**，且可能随渲染动态变化。
- **LCP 可拆成四个子部分**，逐个击破：
  1. **TTFB**：服务器 / CDN 响应慢 → 上 CDN、优化重定向链、边缘渲染。
  2. **资源发现延迟**：LCP 资源在 CSS/JS 解析后才发现 → `<link rel="preload">` 提前发现、首屏图片加 `fetchpriority="high"`。
  3. **资源加载时长**：图片太大 → 压缩、现代格式（AVIF/WebP）、响应式尺寸、CDN。
  4. **元素渲染延迟**：被同步 JS / 字体加载阻塞 → 关键资源前置、字体 `font-display`。
- **注意**：懒加载的资源**不会**成为 LCP，首屏大图千万不要 `loading="lazy"`。

### 2.3 CLS：累积布局偏移

偏移分数 = 影响比例 × 距离比例（一个视口内最大 0.25，多次累加）。常见成因与对策：

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

- **Lab（实验室）**：Lighthouse、DevTools、本地模拟——可控可复现，但设备 / 网络环境与真实用户不同。
- **Field（真实用户）**：CrUX、RUM 上报——反映真实分布（关注 P75 分位），但样本有噪声。
- **典型坑**：本地 Lighthouse 满分、线上用户仍抱怨卡——因为你用的是高性能开发机 + 近距离网络。**以线上 P75 数据为准做决策**。

---

## 三、加载流程优化（网络层）：缓存、传输与资源提示

### 3.1 DNS 与连接优化

- **`dns-prefetch`**：`<link rel="dns-prefetch" href="//api.example.com">`，对第三方域名提前解析。
- **`preconnect`**：`<link rel="preconnect" href="https://cdn.example.com" crossorigin>`，提前完成 DNS + TCP + TLS，收益大于 dns-prefetch；只对**最关键的 2~3 个域名**使用（多了浪费连接）。
- **域名收敛 vs 分片**：HTTP/1.1 时代靠域名分片绕开 6 连接限制；**HTTP/2 下域名分片是反优化**（多路复用后单域名即可并行），应收敛域名减少握手。

### 3.2 CDN

- **原理**：就近接入边缘节点，缩短物理往返（RTT）；静态资源（JS / CSS / 图片 / 字体）上 CDN 是性价比最高的优化之一。
- **要点**：合理配置回源（避免回源风暴）、命中缓存（命中率是关键指标）、开启边缘压缩、必要时启用边缘计算（Edge SSR）。

### 3.3 HTTP 缓存（最重要的「零成本」优化）

| 类型         | 机制                                                                 | 关键头                                                  |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------- |
| **强缓存**   | 浏览器直接用本地副本，不发请求（Chrome 显示 from memory/disk cache） | `Cache-Control: max-age=31536000`（优先级高于 Expires） |
| **协商缓存** | 强缓存过期后带标识问服务器，未变返回 304（无 body）                  | `ETag/If-None-Match`、`Last-Modified/If-Modified-Since` |
| **不缓存**   | 每次都协商或全新获取                                                 | `no-cache`（可存但需协商）、`no-store`（完全不存）      |

- **ETag 与 Last-Modified 同时存在时 ETag 优先**（精确到内容哈希）。
- **标准缓存分层策略**：
  - **HTML**：`Cache-Control: no-cache`（每次协商，保证入口最新）。
  - **带内容哈希的静态资源**（`app.a1b2c3.js`）：`Cache-Control: max-age=31536000, immutable`（一年强缓存，改文件名即失效）。
  - **API 响应**：按业务配置短缓存或 no-store。
- **immutable 的意义**：避免用户刷新时浏览器对静态资源发起条件请求（304 也要一个 RTT）。
- **memory cache 与 disk cache**：小 / 频繁用的进内存，大的进磁盘；页面刷新常走 memory，重新打开走 disk——缓存命中路径不同，不要误判为「缓存没生效」。
- **启发式缓存**：没写 Cache-Control 只有 Last-Modified 时，浏览器按「距 Last-Modified 时长的 10%」猜缓存期——**永远显式写 Cache-Control，别依赖猜测**。

### 3.4 传输与压缩

- **文本压缩**：gzip / **brotli**（brotli 压缩率更高，现代浏览器全支持，优先开启）；压缩只对文本有效，图片 / 视频本身已压缩。
- **注意**：小文件（< 1KB）压缩收益为负；动态内容压缩消耗 CPU，静态内容构建期预压缩（`.gz` / `.br`）最佳。
- **HTTP/2**：多路复用（单连接并行多请求）、头部压缩（HPACK）、二进制分帧——消灭 HTTP/1.1 的队头阻塞（应用层）。
- **HTTP/3（QUIC）**：基于 UDP，解决 TCP 层队头阻塞，握手更快（0/1-RTT），弱网与移动端收益明显。
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

**`preload` 的两个高频坑**：

1. **字体 preload 必须加 `crossorigin`**（即使同域）——否则浏览器按匿名 CORS 模式发起**第二个**请求，字体被下载两次：

```html
<link
  rel="preload"
  href="/fonts/main.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

2. **`as` 属性必须写对**——决定优先级与缓存匹配，写错同样导致二次下载。

### 3.6 SSR / SSG / 预渲染

| 方案                    | 原理                            | 适用                                   | 代价                             |
| ----------------------- | ------------------------------- | -------------------------------------- | -------------------------------- |
| **CSR（客户端渲染）**   | 浏览器下载 JS 后渲染            | 后台管理、强交互应用                   | 首屏慢、SEO 弱                   |
| **SSR（服务端渲染）**   | 服务器生成首屏 HTML 直出        | 内容型、SEO 敏感页面                   | 服务器成本、TTFB、hydration 开销 |
| **SSG（静态生成）**     | 构建期生成 HTML                 | 文档站、博客（本站即 VitePress / SSG） | 内容更新需重新构建               |
| **预渲染（Prerender）** | 无头浏览器提前生成静态首屏 HTML | 营销页、落地页                         | 动态数据不适用                   |
| **流式 SSR / 边缘渲染** | 分块输出 / CDN 边缘执行         | 首屏瓶颈在服务端的场景                 | 复杂度高                         |

> SSR 不是银弹：HTML 早到了，但 **hydration（注水）没完成前页面不可交互**，TBT / INP 反而可能更差——大页面考虑 Islands 架构或选择性注水。

### 3.7 Service Worker 与离线缓存

- Service Worker 拦截请求，可自定义缓存策略：**Cache First**（静态资源）、**Network First**（API）、**Stale-While-Revalidate**（可容忍旧值的资源）。
- **坑**：SW 缓存更新不及时是经典事故源——新版本上线后用户可能一直跑旧版本；必须设计好版本号 + `skipWaiting` + `clients.claim` 的更新流程，重要更新提供提示刷新。

---

## 四、加载流程优化（资源层）：JS / CSS / 图片 / 字体

### 4.1 JavaScript 资源

- **压缩与混淆**：Terser / esbuild / SWC 做压缩、去死代码、变量名缩短（esbuild 速度最优）。
- **Tree Shaking**：依赖 **ESM 静态分析**。注意：
  - CommonJS（`require`）无法 tree-shake；Babel 转 CJS 会破坏 shaking（`modules: false`）。
  - 库要有 `sideEffects: false` 标记（或精确标注有副作用的文件），否则死代码被保留。
  - 按 `lodash-es`（ESM）而非 `lodash`（CJS）引入；`import dayjs` 替换 moment（moment 自带全部 locale）。
- **代码拆分（Code Splitting）**：
  - 路由级动态 `import()` 是第一优先级——首屏只加载当前路由代码。
  - 第三方大库（编辑器 / 图表 / PDF / 大日期库）**用到才加载**，绝不做首屏静态 import。
  - 抽离公共 chunk（react/vue 等 vendor），配合长缓存。
- **异步加载脚本**：`defer`（顺序执行，DOM 解析完执行）/ `async`（下载完立即执行，顺序不保证）；详见 [脚本 Script 加载与执行指南](/fundamentals/script/)。
- **Polyfill 按需**：用 browserslist + `@babel/preset-env` 的 useBuiltIns 按目标浏览器注入，**不要全量引 core-js**（全量可占 100KB+）。
- **监控体积**：`webpack-bundle-analyzer` / `rollup-plugin-visualizer` 定期审视产物构成，依赖替换（moment→dayjs、lodash→原生、jQuery→原生）。

### 4.2 CSS 资源

- **关键 CSS（Critical CSS）**：首屏必需样式内联到 `<style>`，其余异步加载：

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

- **格式选型**：**AVIF > WebP > JPEG/PNG**；图标 / 简单图形用 SVG；动画考虑 WebM/APNG 替代 GIF（GIF 体积巨大）。

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

- **响应式图片**：`srcset` + `sizes` 按视口下发合适尺寸，别给 375px 的手机发 2560px 的图。
- **懒加载**：`loading="lazy"`（首屏图禁用，见 LCP 一节）；滚动容器内的图用 IntersectionObserver。
- **压缩**：构建期（sharp / squoosh）或 CDN 按需压缩；质量 75~85 通常肉眼无差。
- **占位防 CLS**：声明宽高比；可选 LQIP / BlurHash 低质量占位。
- **图标**：SVG symbol / 组件化内联，替代图标字体（字体加载慢且可访问性差）。
- **Base64 内联**：只对小图标（< 2~4KB）使用——base64 让体积膨胀约 33%，且无法独立缓存；大图内联进 CSS/JS 会把「可缓存资源」绑死在宿主文件上。

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

- **CSS 阻塞渲染**：浏览器在 CSSOM 就绪前不渲染任何内容（避免无样式闪烁）——CSS 无论放哪里都阻塞渲染，所以要**小而快**（关键 CSS 内联、其余异步）。
- **JS 阻塞 DOM 解析**：同步 `<script>` 阻塞解析器；无 `defer/async` 的脚本必须等前置 CSS 下载解析完（JS 可能读样式）。非关键脚本一律 `defer`。
- **优化目标**：缩短关键路径长度（关键资源数）与关键字节（关键资源体积）。

### 5.2 重排（Reflow）、重绘（Repaint）与合成

| 层级     | 触发的属性举例                                     | 开销                     |
| -------- | -------------------------------------------------- | ------------------------ |
| **重排** | `width` `height` `top` `left` `margin` `font-size` | 最高：布局 + 绘制 + 合成 |
| **重绘** | `color` `background` `visibility` `box-shadow`     | 中：绘制 + 合成          |
| **合成** | `transform` `opacity`                              | **最低：仅合成（GPU）**  |

- **动画只用 `transform` 和 `opacity`**：它们不触发重排重绘，直接走合成线程（主线程卡死也能动）——这是渲染优化的第一原则。
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

---

## 六、JavaScript 执行优化：长任务、事件循环与内存

### 6.1 长任务与主线程

- 主线程一次只执行一个任务，**超过 50ms 即为长任务**——期间无法响应输入（INP 恶化）、无法做渲染。
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

- `setTimeout(fn, 0)` 与 `MessageChannel` 都可让出主线程（MessageChannel 嵌套节流更稳）；新 API 有 `scheduler.yield()`（Chrome 129+）。
- 高优先级更新要用微任务（`queueMicrotask`），低优先级才让宏任务。

### 6.3 防抖与节流

| 手段         | 行为                             | 典型场景                                  |
| ------------ | -------------------------------- | ----------------------------------------- |
| **防抖**     | 停止触发 N 毫秒后才执行一次      | 搜索输入联想、resize 完成后重算、表单校验 |
| **节流**     | 固定频率最多执行一次             | scroll / mousemove / 拖拽、打点上报       |
| **rAF 节流** | 每帧最多执行一次，与渲染节拍对齐 | 滚动相关的视觉更新（首选）                |

- **坑**：防抖用在「首输入」上会人为制造输入延迟（INP 恶化）——搜索框防抖要平衡等待时间；防抖闭包里持有的引用注意释放（内存）。
- `passive: true`：`addEventListener('scroll', fn, { passive: true })` 告知浏览器不会 `preventDefault`，滚动不再等 JS 执行完（滚动性能必做项）。

### 6.4 Web Worker

- 把 **CPU 密集**计算（大 JSON 解析、加解密、图像处理、复杂排序）移出主线程：

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
- **常见内存泄漏清单**（前端 90% 的泄漏来自这里）：
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
- **渲染优化**：`React.memo` / `useMemo` / `useCallback`——但**不要无脑包**：比较 props 也有成本，配合不可变更新（引用稳定）才有意义；滥用反而更慢更难维护。
- **状态下放（状态 colocate）**：把频繁变化的状态移到最小子树，避免顶层 state 拖动整页重渲。
- **代码拆分**：`React.lazy` + `Suspense` 路由级拆分；首屏页面**禁止**静态 import 重依赖（编辑器 / 图表 / PDF），一律用到才 `import()`。
- **并发特性**：大列表筛选等低优先级更新用 `startTransition` 包裹，保持输入响应（直接改善 INP）。
- **大表单 / 大列表**：受控输入每键触发重渲时，考虑非受控 + 事件外同步；列表虚拟化（见第八章）。

### 7.2 Vue

- **`v-show` vs `v-if`**：频繁切换用 `v-show`（display 切换），条件很少变化 / 初始代价大用 `v-if`（不渲染销毁）。
- **`keep-alive`**：缓存组件实例避免重复创建（配合 `include` 控制范围——无上限缓存是内存泄漏源）。
- **computed 缓存**：依赖不变不重算，替代方法调用式模板取值。
- **大数据响应式**：超大数据集（万级 JSON）用 `shallowRef` / `markRaw` 跳过深度响应式代理（Vue3 的 Proxy 深层代理对大对象初始化与读取都有成本）。
- **`v-memo`**：列表项级缓存，依赖不变跳过 diff。

### 7.3 通用与工程化

- **虚拟列表**：万级长列表只渲染视口内十几条（原理与实现见第八章），React 用 `react-window`，Vue 用 `vue-virtual-scroller` / 自研。
- **构建侧**：
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
| **Coverage 面板**    | JS / CSS 的实际使用率——首屏没用到却加载了多少字节                        |
| **Rendering 选项卡** | Paint Flashing（重绘高亮）、Layout Shift Regions（CLS 可视化）、FPS 计   |
| **Layers 面板**      | 合成层数量 / 大小 / 提升原因（排查层爆炸）                               |
| **Memory 面板**      | 堆快照对比、分配时间线（泄漏定位）                                       |
| **Lighthouse / PSI** | 实验室评分 + 优化建议清单；PageSpeed Insights 附带 CrUX 真实用户字段数据 |
| **WebPageTest**      | 多地域多设备实测、首屏瀑布深入分析                                       |

### 9.5 线上监控与性能预算

- **RUM（真实用户监控）**：web-vitals 采集 + 埋点上报，看 **P75** 分布；关联版本号 / 路由 / 设备分层归因。
- **上报细节**：`navigator.sendBeacon` 或 `fetch(..., { keepalive: true })`；采样控制量；SPA 路由切换要重新评估指标窗口。
- **性能预算（Performance Budget）**：给关键指标与产物体积设红线（如首屏 JS < 200KB、LCP < 2.5s），CI 里用 bundle-size-action / Lighthouse CI 卡口，**超预算即失败**——性能必须有「防回归机制」，否则会随迭代无声劣化。

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

1. **首屏图片 `loading="lazy"`**：懒加载资源不参与 LCP，首屏大图懒加载直接恶化 LCP——首屏图用 `fetchpriority="high"` + preload。
2. **图片不写尺寸**：CLS 头号来源；永远写 `width/height` 或 `aspect-ratio`。
3. **字体 preload 忘加 `crossorigin`**：字体被下载两次（见 §3.5）。
4. **`background-image` 无法懒加载**：需要懒加载的图用 `<img loading="lazy">` 或 IntersectionObserver。
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
17. **长缓存资源不带 hash**：内容更新后用户拿不到新版本；反过来 HTML 被强缓存则更新不可达——缓存策略必须「HTML 协商 + 静态资源哈希 + 一年 immutable」配套。
18. **Service Worker 更新卡死**：旧 SW 迟迟不释放导致用户永远在旧版本（见 §3.7）。
19. **HTTP/2 下仍做域名分片 / 过度合并请求**：多路复用后这些都从优化变成劣化。
20. **`{{}}` 模板字符串里的插值残留**：构建模板时注意不要把 Vue/模板占位符漏进生产 HTML（渲染空数据 / 报错）。
21. **依赖 `performance.timing`**：已废弃，用 Navigation Timing Level 2。
22. **FID 达标就认为交互没问题**：FID 只看第一次输入；INP 才反映全部交互。
23. **base64 大图内联进 CSS/JS**：膨胀 33% 且无法独立缓存。
24. **`console.log` 带大对象进生产**：日志引用阻止回收，还拖慢执行。

### 10.3 移动端与弱网专项

- 移动设备 CPU / 内存 / 网络全面弱于开发机：**以中端安卓 + 4G 弱网为基线测试**。
- 减少首屏请求数（弱网下每请求 RTT 都贵）、谨慎使用大体积 Web 字体与重型框架。
- `saveData` / `navigator.connection`（effectiveType、saveData）可做分级加载体验。

---

## 十一、性能优化 Checklist 速查

### 11.1 加载层

- [ ] 静态资源上 CDN，HTML 走协商缓存，哈希资源一年 `immutable`
- [ ] 开启 gzip / brotli 压缩
- [ ] HTTP/2 / HTTP/3，不做域名分片
- [ ] 关键域名 `preconnect`，关键资源 `preload`（字体带 `crossorigin`）
- [ ] 路由级代码拆分，重依赖用到才加载
- [ ] 首屏图 `fetchpriority="high"` 且不懒加载，全站图片声明尺寸
- [ ] WebP/AVIF + 响应式 `srcset`
- [ ] 中文字体子集化 + `font-display`
- [ ] 按页面类型选 CSR / SSR / SSG

### 11.2 渲染层

- [ ] 关键 CSS 内联，非关键 CSS 异步
- [ ] 动画只用 `transform` / `opacity`
- [ ] 读写布局分离，消除布局抖动
- [ ] `passive: true` + scroll 回调 rAF 化 / IntersectionObserver 化
- [ ] `will-change` 临时使用，动画后移除
- [ ] 长页面 / 长列表上 `content-visibility` 或虚拟化

### 11.3 运行时

- [ ] 长任务切片，CPU 密集进 Worker
- [ ] 防抖节流用对场景（scroll 节流 / 输入防抖，不碰首交互）
- [ ] 定时器 / 监听器 / 副作用在卸载时清理
- [ ] 大数据集跳过深度响应式（`shallowRef` / `markRaw`）
- [ ] 生产环境剥离 `console` 与调试代码

### 11.4 监控与防回归

- [ ] web-vitals 采集 LCP / INP / CLS 并上报（`sendBeacon`）
- [ ] longtask 观测 + 错误监控关联
- [ ] Lighthouse CI / 体积预算进 CI 卡口
- [ ] 以线上 P75 数据驱动优化排序，一次一改一复测
