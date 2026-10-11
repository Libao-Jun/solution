# 浏览器核心知识手册

> 参考资料：[MDN Web Docs — 浏览器相关](https://developer.mozilla.org/zh-CN/docs/Web)、[MDN — 浏览器工作原理（Inside look at modern web browser）](https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work)、[web.dev — 渲染性能/Web Vitals](https://web.dev/)
> 面向角色：中高级前端工程师。本文不仅罗列规范，更侧重**浏览器实际行为**、**常见坑点**与**调试手段**。与 `../http/http.md`（HTTP 协议层）互补：本文聚焦**浏览器内部**——架构、渲染、JS 引擎、缓存/存储、安全、性能调试。

---

## 目录

1. [浏览器架构与运行原理](#一浏览器架构与运行原理)
2. [渲染原理与关键渲染路径](#二渲染原理与关键渲染路径)
3. [JavaScript 引擎与执行机制（V8）](#三javascript-引擎与执行机制v8)
4. [网络与资源加载](#四网络与资源加载)
5. [存储与状态管理](#五存储与状态管理)
6. [安全机制](#六安全机制)
7. [性能与调试](#七性能与调试)
8. [兼容性与 Web 平台能力](#八兼容性与-web-平台能力)

---

## 一、浏览器架构与运行原理

### 1.1 多进程架构

现代主流浏览器（Chrome / Edge / 新版 Opera 等 Chromium 系）采用**多进程（Multi-process）架构**，核心进程如下：

| 进程                          | 职责                                                                 | 说明                                                                         |
| ----------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Browser 进程（主进程）**    | 地址栏、书签、前进后退、UI、导航、管理其他进程、部分网络与存储、下载 | 用户直接接触的"外壳"，崩溃则整个浏览器挂掉                                   |
| **Renderer 进程（渲染进程）** | 解析 HTML/CSS、构建 DOM、执行 JS、渲染页面                           | 默认**每个标签页一个**（受 Site Isolation 影响），运行在**沙箱**中，权限极低 |
| **GPU 进程**                  | 处理 GPU 任务、图层合成、3D/Canvas/WebGL 加速                        | 所有标签页共用                                                               |
| **Network 进程（网络服务）**  | 网络请求、DNS、socket                                                | Chromium 可将其独立为进程（也可置于 Browser 进程内）                         |
| **Plugin 进程**               | 早期 NPAPI 插件（Flash 等）                                          | 已基本淘汰                                                                   |
| **Utility 进程**              | 各类辅助任务（如音频解码、打印、文件格式转换）                       | 按需派生                                                                     |

> 进程间通过 **IPC（Inter-Process Communication）** 通信。渲染进程不直接接触磁盘/网络/系统，必须经 Browser 进程代理——这是安全沙箱的基础。

**为什么要多进程？**

- **稳定性**：某个标签页渲染进程崩溃（JS 死循环、OOM）只会冻住该页，不影响其他页与浏览器本身。
- **安全性**：渲染进程沙箱化，即便被恶意页面攻破，也拿不到操作系统级权限。
- **性能隔离**：多核并行，一个进程长时间运算不阻塞其他页。

### 1.2 渲染进程内的线程

一个渲染进程内部又分多个**线程**，关键三者：

| 线程                              | 职责                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **主线程（Main thread）**         | 解析 HTML/CSS、运行 JS、计算样式（Style）、执行布局（Layout/Reflow）、处理大多数用户输入事件。GUI 渲染与 JS 执行**互斥（同处主线程）**     |
| **合成线程（Compositor thread）** | 处理滚动、平移缩放，运行合成器，把页面拆分成图层、确定绘制顺序，生成绘制指令交给光栅线程。**不依赖主线程**，所以滚动即使主线程卡死也能响应 |
| **光栅线程（Raster thread）**     | 将绘制指令（Paint 命令）光栅化为位图（像素）。可有多个并行                                                                                 |

> 其他还有：Worker 线程（Web Worker）、音频线程、网络线程等。
> **关键认知**：`transform`/`opacity` 动画只走**合成线程**（无需主线程参与），因此极其流畅；而改 `width`/`top` 会触发主线程的布局与绘制，容易掉帧。

### 1.3 引擎关系：Chromium / WebKit / Gecko / Blink / V8

**浏览器 = 外壳 + 渲染引擎 + JS 引擎**。理清关系（这是高频混淆点）：

- **Chromium**：Google 开源的**浏览器项目**（Chrome、Edge、Opera、国内多数"双核"壳的底层都基于它）。它本身不是引擎，而是一整套浏览器实现。
- **Blink**：Chromium 的**渲染引擎**（2013 年从 WebKit 分叉出来），负责 HTML/CSS 解析、DOM 树、布局、渲染树、绘制。
- **V8**：Google 的 **JavaScript 引擎**（独立项目，Node.js / Deno / Electron 也都用它），负责解析并执行 JS、编译为机器码。运行在渲染进程内。
- **WebKit**：Apple 的引擎，Safari 使用。由渲染引擎 **WebCore** + JS 引擎 **JavaScriptCore（JSC）** 组成。Blink 源自 WebKit 的 WebCore。
- **Gecko**：Mozilla 的引擎，Firefox 使用，JS 引擎是 **SpiderMonkey**。

```
Chrome/Edge ─┐
Opera ───────┼─► Chromium 外壳 ─► Blink(渲染) + V8(JS)
国内双核壳 ──┘

Safari ─────► WebKit(WebCore 渲染) + JavaScriptCore(JS)
Firefox ────► Gecko(渲染) + SpiderMonkey(JS)
```

> 一句话记忆：**Blink 管"画页面"，V8 管"跑 JS"；二者都在 Chromium 里，而 Chromium 是 Chrome/Edge 的内核。**

### 1.4 多标签页与进程隔离（Site Isolation）

- **早期（单进程/多标签单进程）**：一个标签页崩溃拖垮全部。现代已弃用。
- **每标签页一进程**：标签页间崩溃隔离。但同一网站多个标签页可能**共享进程**以省内存（依赖启发式策略）。
- **Site Isolation（站点隔离）**：把**每个跨站站点**放在独立的渲染进程里。关键定义：
  - **"site"（站点）** = `scheme` + **eTLD+1**（有效顶级域名+一级，如 `https://mail.google.com` 与 `https://docs.google.com` 的 site 都是 `google.com`）。
  - 跨 site 的 `<iframe>` 也会被分配**独立进程**（OOPIF — Out-of-Process Iframe）。
  - **目的**：防御 Spectre 等 CPU 侧信道攻击——即使 JS 能"猜"到相邻内存，跨进程也物理隔离、拿不到跨站数据。

> 在 DevTools → `Shift+Esc`（Chrome 任务管理器）或 `chrome://process-internals` 可看到每个标签页/iframe 对应的进程 ID，验证隔离是否生效。

### 1.5 浏览器如何加载一个网站（从输入 URL 到首屏渲染）

这是串联全篇的经典流程：

1. **地址栏输入 / 点击链接** → Browser 进程接收，校验 URL、补全协议。
2. **DNS 解析**：查缓存（浏览器 → 系统 hosts → 本地 DNS → 递归查询）→ 得到 IP。（见 `preconnect`/`dns-prefetch` 优化）
3. **建立连接**：TCP 三次握手；若是 HTTPS，再 TLS 握手（证书校验、密钥协商）。HTTP/2 或 HTTP/3(QUIC) 在此协商。
4. **发送请求**：Browser 进程经 Network 进程发出 HTTP 请求（带 Cookie、缓存校验头等）。
5. **响应处理**：服务器返回 HTML；浏览器按 `Cache-Control`/`ETag` 等决定是否走缓存（详见第四章）。
6. **解析与构建**：渲染进程**主线程**解析 HTML 生成 **DOM 树**；遇到 `<link>` CSS 构建 **CSSOM**；遇到 `<script>`（非 async/defer）**阻塞解析**执行 JS。
7. **关键渲染路径（CRP）**：DOM + CSSOM → **Render Tree** → **Layout（Reflow）** → **Paint** → **Composite**，首次像素出现在屏幕（首次绘制 FP / 最大内容绘制 LCP）。
8. **持续加载**：图片、字体、JS、CSS 异步资源继续加载；JS 可能触发更多请求（数据接口、懒加载）。
9. **交互就绪**：`load` 事件（所有资源加载完）→ 之后 `DOMContentLoaded` 早已触发（仅 DOM 解析完，不含样式/图片）。

> **调试入口**：DevTools → Network 面板看每个请求的 **Timing waterfall**；Performance 面板录一段看 **Main 线程火焰图**与 **Frames**；Lighthouse 一键出"加载性能报告"。

---

## 二、渲染原理与关键渲染路径

### 2.1 关键渲染路径（Critical Rendering Path, CRP）

浏览器把代码变成像素要依次经过：

```
HTML ──► DOM Tree        CSS ──► CSSOM Tree
            │                        │
            └──────► Render Tree ────┘   (只含可见节点)
                          │
                     Layout (Reflow)   ← 计算几何：位置、尺寸
                          │
                      Paint            ← 绘制到图层（填充像素、颜色、文字）
                          │
                    Composite          ← 把各图层合成为最终画面送 GPU 上屏
```

### 2.2 渲染树（Render Tree）

- 由 **DOM 树** 与 **CSSOM 树** 合并而成，只包含**会渲染出来的节点**。
- `display: none` 的节点**不进**渲染树（完全不占空间）；`visibility: hidden` **进**渲染树（占空间但不可见）。

### 2.3 重排（Reflow）与重绘（Repaint）

|              | 重排 Reflow / Layout                                            | 重绘 Repaint                                          |
| ------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| 触发         | 几何/布局变化：尺寸、位置、增删 DOM 节点、改变字体、窗口 resize | 外观变化但不影响布局：颜色、背景、visibility、outline |
| 代价         | 大（通常连带重绘，且可能影响整棵子树甚至全局）                  | 较小（只重画像素，不涉及几何计算）                    |
| 是否走主线程 | 是                                                              | 是（但比 reflow 轻）                                  |

**强制同步布局（Forced Synchronous Layout / Layout Thrashing）**——最隐蔽的性能陷阱：

```js
// ❌ 反例：写-读-写-读 交替，每次读都强制浏览器先完成布局
for (let i = 0; i < boxes.length; i++) {
  boxes[i].style.width = "100px"; // 写
  const w = boxes[i].offsetWidth; // 读 → 强制同步布局！浏览器被迫立即 reflow
}

// ✅ 正解：先批量读，再批量写
const widths = boxes.map((b) => b.offsetWidth); // 只读
boxes.forEach((b, i) => (b.style.width = widths[i] + "px")); // 只写
```

> **口诀**：**"先读后写、批量操作、读写分离"**。也可借助 `requestAnimationFrame` 把写操作推迟到下一帧，或使用 `FastDOM` 类库。

### 2.4 合成层（Compositing Layer）与 GPU 加速

- 浏览器把页面分成多个**图层**，各自光栅化后由**合成线程**合并上屏。
- 元素被"提升"为独立合成层（Promoted Layer）的常见条件：
  - `transform: translateZ(0)` / `translate3d(0,0,0)`
  - `will-change: transform`（或其他合成器属性）
  - `position: fixed`
  - `<video>`、`<canvas>`、WebGL
  - `opacity` 动画（部分情况）
- **GPU 加速的本质**：`transform` 和 `opacity` 的动画**只走合成线程**，不触发主线程的 reflow/repaint → 极流畅、不掉帧。

### 2.5 层爆炸（Layer Explosion）与 will-change 滥用

- **层爆炸**：创建过多合成层 → 显存/内存暴涨，反而让**合成变慢**（合成器要合并的层数过多）、页面卡顿。
- **will-change 滥用**：`will-change` 会**持久**保留一个合成层（即便动画结束也不释放），千万别给大量静态元素或列表项统一加 `will-change: transform`。
- **正确姿势**：
  - 只给**真正需要动画**的元素加；
  - 动画**即将开始**前加，结束后用 `will-change: auto` 移除（或 `removeProperty('will-change')`）；
  - 优先用 `transform/opacity`（天然可合成），避免动画 `width/height/top/left`。

```css
/* ❌ 给 1000 个列表项都加 → 层爆炸 */
li {
  will-change: transform;
}

/* ✅ 仅 hover/动画时短暂提升 */
.card {
  transition: transform 0.2s;
}
.card:hover {
  will-change: transform;
} /* 鼠标移出后浏览器会自动回收 */
```

### 2.6 阻塞渲染的资源

| 资源                                  | 如何阻塞                                                                | 优化                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **CSS（外部 `<link>`）**              | 阻塞渲染（需先建 CSSOM）；且**阻塞其后的 JS 执行**（JS 可能读样式）     | 关键 CSS 内联；非关键 CSS 用 `media`/`onload` 异步加载                                        |
| **同步 `<script>`（无 defer/async）** | 阻塞 HTML 解析（解析器停下，等 JS 下载+执行完）                         | 放 `<body>` 末尾；或加 `defer`（顺序执行、DOM 解析完前不跑）/ `async`（下载完立即跑、不保序） |
| **字体（Web Font）**                  | `font-display: block`（默认）会**阻塞文字渲染（FOIT，空白）**一小段时间 | `font-display: swap`（先用后备字体，字体就绪再换）；`preload` 关键字体                        |
| **JS 大包**                           | 阻塞主线程（解析/编译耗时）                                             | 代码分割、Tree-shaking、延迟加载非首屏逻辑                                                    |

```html
<!-- 关键 CSS 内联，首屏秒出；非关键 CSS 异步，不阻塞 -->
<style>
  /* 首屏必需样式 */
</style>
<link
  rel="stylesheet"
  href="non-critical.css"
  media="print"
  onload="this.media='all'"
/>

<!-- JS：defer 保序、等 DOM 解析完；async 不保序、适合独立统计脚本 -->
<script defer src="app.js"></script>
<script async src="analytics.js"></script>
```

### 2.7 关键渲染路径优化清单

1. **HTML**：减少 DOM 节点数与嵌套深度；服务端渲染（SSR）直接给首屏 HTML，省去客户端建树。
2. **CSS**：内联关键 CSS（Critical CSS）；删除未使用样式（Coverage 面板查）；避免 `@import`（串行）。
3. **JS**：`defer`/`async`；代码分割（路由懒加载）；首屏不静态 import 重依赖（见 `../react` 等经验：pdfjs/codemirror 等要"用到才 `import()`"）。
4. **资源**：`preload` 关键资源、`prefetch` 预测下一页、`preconnect` 提前连域名。
5. **字体**：`font-display: swap` + `preload`。
6. **图片**：现代格式（webp/avif）、响应式 `srcset`、懒加载 `loading="lazy"`。

---

## 三、JavaScript 引擎与执行机制（V8）

### 3.1 V8 引擎架构

V8 把 JS 从源码变成可执行机器码，分几个阶段：

```
源码 → 解析器(Parser) → AST →
  Ignition(解释器) 生成字节码(Bytecode) 并执行 →
    热点代码被 TurboFan(优化编译器) 编译为高度优化的机器码
```

- **Parser**：分两步——**Pre-parser**（快速跳读，先略过函数体确认语法）与 **Parser**（真正解析用到的作用域），避免一次性解析全部代码拖慢启动。
- **Ignition（解释器）**：生成并执行**字节码**（而非直接编译机器码），启动快、内存省。
- **TurboFan（优化编译器）**：监控运行中**热点（Hot）**函数（执行频率高），基于**运行时类型假设**做激进优化（内联、去虚化），生成机器码。
- **反优化（Deoptimization）**：当类型假设失效（如某函数突然收到与之前不同类型参数），已优化的机器码作废，回退到解释器执行。

### 3.2 隐藏类（Hidden Class / Map）与内联缓存（Inline Cache）

- **隐藏类（在 V8 内部叫 Map 或 Shape）**：JS 对象看似"动态属性字典"，V8 实际会为每个**对象形状**（属性名+顺序+类型组合）生成一个隐藏类，并缓存每个属性在内存中的**偏移量**。
- **内联缓存（IC）**：V8 缓存"某隐藏类 → 某属性偏移"的映射。下次访问同形状对象时直接按偏移取，**跳过字典查找**。
- **优化建议**（否则隐藏类频繁变化、IC 失效、性能骤降）：
  - **保持对象属性顺序一致**：`{x:1, y:2}` 与 `{y:2, x:1}` 是**不同隐藏类**。
  - **初始化时一次写好所有属性**，避免后续动态增删：
    ```js
    // ❌ 每次新增属性都新建隐藏类
    const o = {};
    o.x = 1;
    o.y = 2;
    o.z = 3;
    // ✅ 字面量一次初始化（同一隐藏类）
    const o = { x: 1, y: 2, z: 3 };
    ```
  - **`delete` 会破坏隐藏类** → 改用 `obj.key = null` 或 `undefined`（保留形状）。
  - **避免同函数接收差异极大的参数类型**（如有时传 `number` 有时传 `string`），会让 TurboFan 反复优化/去优化。

### 3.3 事件循环（Event Loop）

JS 是**单线程**，靠事件循环调度异步任务：

- **调用栈（Call Stack）**：正在执行的函数栈。
- **宏任务（Macrotask）队列**：`script`（整体代码）、`setTimeout` / `setInterval`、`setImmediate`（Node）、I/O、UI 渲染、`MessageChannel`。
- **微任务（Microtask）队列**：`Promise.then/catch/finally`、`queueMicrotask()`、`MutationObserver`、`process.nextTick`（Node，优先于其他微任务）。

**一轮循环的执行顺序**（关键）：

```
1. 从宏任务队列取【一个】宏任务执行
2. 执行过程中产生的微任务，全部【清空】（包括微任务里新产生的微任务）
3. 必要时进行渲染（GUI 渲染、requestAnimationFrame 回调）
4. 回到第 1 步，取下一个宏任务
```

> **高频考点**：`setTimeout(fn, 0)` 并不"立刻"执行——它只是排进宏任务队列，要等**当前宏任务 + 所有微任务**清空后才轮到。

```js
console.log("1"); // 宏任务 script：同步
setTimeout(() => console.log("2"), 0); // 宏任务
Promise.resolve().then(() => console.log("3")); // 微任务
console.log("4"); // 同步
// 输出顺序：1 → 4 → 3 → 2
```

### 3.4 调用栈、渲染时机与 requestAnimationFrame

- **`requestAnimationFrame(cb)`**：在**浏览器下一次重绘之前**回调，与屏幕刷新率同步（通常 60fps，约每 16.7ms 一帧）。适合做动画/逐帧更新，**不要**在里面做耗时逻辑（会占用渲染帧）。
- **渲染时机**：浏览器在"清空微任务之后、下一宏任务之前"决定是否渲染。若微任务队列**无限（或极长）**，会一直不渲染 → 页面"卡死假死"。
- **`requestIdleCallback` / `scheduler.yield()`**：把大计算拆到空闲时段，避免阻塞渲染（见第七章长任务）。

> **坑**：在 `Promise` 链里写死循环或海量同步微任务，会**饿死渲染线程**，表现为"页面能点但画面不动"。

### 3.5 JIT 优化与去优化场景

- **JIT（Just-In-Time）**：V8 在运行时收集类型信息做优化编译，比纯解释快几个数量级。
- **去优化（Deoptimization）触发**：
  - 同一函数接收到与历史**不同类型**的参数（如数组元素类型从 `int` 变 `double` 或混 `object`）。
  - 隐藏类突变（`delete`、动态加属性导致形状不匹配）。
  - 调用了被 V8 判定为"难以优化"的结构（如 `try/catch` 内热点、`arguments` 滥用，现代 V8 已大幅改善）。
- **对策**：保持数据/参数**类型稳定**；用 `TypedArray` 处理数值密集型计算；避免在热路径上频繁改变对象形状。

---

## 四、网络与资源加载

> 协议层细节（状态码、报文、CORS 头写法）见 `../http/http.md`。本章聚焦**浏览器侧**行为。

### 4.1 HTTP/1.1、HTTP/2、HTTP/3（浏览器表现）

| 版本               | 浏览器侧表现                                                                      | 对前端的影响                                                          |
| ------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **HTTP/1.1**       | 同域名约 **6 个并发连接**，多资源排队（队头阻塞在连接层）                         | 需"雪碧图、域名分片、文件合并"等妥协                                  |
| **HTTP/2**         | **单连接多路复用**（一个 TCP 连接上并发多请求）、**HPACK 头部压缩**、**流优先级** | 6 连接限制消失；但仍有 **TCP 层队头阻塞**（丢一个包整条连接等重传）   |
| **HTTP/3（QUIC）** | 跑在 **UDP** 上，独立流互不阻塞；连接迁移（换网络不断线）                         | 彻底解决 TCP 队头阻塞；弱网/移动端更稳。DevTools Protocol 列可见 `h3` |

> 查看：DevTools → Network → 右键表头勾选 **Protocol**，可见 `h2` / `h3`。

### 4.2 缓存机制（浏览器侧）

浏览器有多级缓存，查找优先级大致为：

```
1. Service Worker Cache   （若有 SW 且命中其 fetch 逻辑）
2. Memory Cache          （内存，当前标签页会话内，最快，关页即失）
3. Disk Cache            （磁盘，持久，跨会话）
4. Push Cache            （HTTP/2 Server Push，已基本弃用）
   ↓ 都不命中才发网络请求
```

- **强缓存（不发请求）**：`Cache-Control: max-age=3600`（或 `s-maxage` 给 CDN）、`Expires`。命中时 DevTools 显示 `200 (memory cache)` / `200 (disk cache)`，**完全不发请求**。
- **协商缓存（发请求，服务器判）**：首次带 `Last-Modified` / `ETag`；下次带 `If-Modified-Since` / `If-None-Match`；没变回 **304**（空 body，用缓存），变了回 200 + 新内容。
- **静态资源发布铁律**：JS/CSS 用 **指纹文件名**（`app.3a9f.js`）配长缓存（`max-age=31536000, immutable`）；**HTML 用 `no-cache`**（每次问服务器是否新鲜）。否则"发版了用户还在跑旧 JS"。

> ⚠️ `Cache-Control: no-cache` ≠ 不缓存，它只是"用前必须问服务器"（走 304）；真·不缓存是 `no-store`。

### 4.3 预加载系列

| 指令                            | 作用                                                 | 使用场景                       |
| ------------------------------- | ---------------------------------------------------- | ------------------------------ |
| `<link rel="preload" as="...">` | **当前页急需**资源，高优先级提前加载并缓存（不执行） | 首屏关键 CSS/字体/JS chunk     |
| `<link rel="prefetch">`         | **预测未来页**会用到，低优先级、浏览器空闲时加载     | 下一步大概率进入的页面资源     |
| `<link rel="preconnect">`       | 提前建立到目标域的 **DNS + TCP + TLS** 连接          | 第三方关键域名（字体、API）    |
| `<link rel="dns-prefetch">`     | 仅提前解析 DNS（preconnect 的子集）                  | 兼容性兜底                     |
| `<link rel="modulepreload">`    | 预加载 **ES Module**（含其依赖），会解析+实例化      | 关键模块图，避免运行时链式等待 |

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preload" href="/critical.css" as="style" />
<link rel="modulepreload" href="/main.js" />
<link rel="prefetch" href="/next-page-chunk.js" />
```

> **坑**：`preload` 了却不使用，DevTools Console 会警告"preload 未被使用"，且浪费带宽；`preload` 必须配正确的 `as`，否则无效甚至重复下载。

### 4.4 资源优先级（Priority Hints）与加载调度

- `fetchpriority="high" | "low" | "auto"` 属性可加在 `<img>`、`<script>`、`<link>`、`<iframe>` 上，显式告诉浏览器相对优先级。
- 配合 `loading="lazy"`（图片/iframe 懒加载）减少首屏带宽争抢。
- 浏览器内部已对资源类型有默认优先级（如 CSS > 图片 > 预取），Priority Hints 用于**纠正**自动判断。

```html
<img src="hero.jpg" fetchpriority="high" />
<img src="below-fold.jpg" loading="lazy" fetchpriority="low" />
```

### 4.5 CORS、CSP、SameSite、跨域隔离（COOP/COEP）

- **CORS**（详见 `../http/http.md` 5.2）：跨源请求的安全闸门；简单请求直发，非简单请求先发 `OPTIONS` 预检。
- **CSP**：见第六章。
- **SameSite**：Cookie 跨站是否随请求发送（`Strict` / `Lax` / `None`），默认 `Lax` → 跨站 POST 默认不带 Cookie。
- **跨域隔离（Cross-Origin Isolation）**：
  - 响应头 `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp`。
  - 满足后 `window.crossOriginIsolated === true`，可启用 **SharedArrayBuffer**、`performance.measureUserAgentSpecificMemory()` 等高性能/高安全特性；
  - 代价：所有跨源子资源必须带 `Cross-Origin-Resource-Policy` 或 CORS 头，否则加载失败（是 PWA/视频会议/WebAssembly 多线程应用的硬前置）。

### 4.6 连接数限制与域名分片

- **HTTP/1.1**：同域约 **6 个并发连接**，资源多就排队。
- **域名分片（Domain Sharding）**：把资源分散到 `a.example.com` / `b.example.com` 多个子域以突破 6 连接限制——**这是 HTTP/1.1 时代的妥协**。
- **HTTP/2 下反成负优化**：多域名会破坏单一连接的多路复用、增加 TLS 握手与连接数，应当**合并到同一域名**。

---

## 五、存储与状态管理

### 5.1 Cookie

| 维度                  | 说明 / 限制                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **大小**              | 单 Cookie 约 **4KB**；每个域名约 20~50 个（视浏览器）                                    |
| **Domain**            | 默认当前域；可设父域（`.example.com`）让其子域共享                                       |
| **Path**              | 生效路径前缀                                                                             |
| **Expires / Max-Age** | 过期时间；不设则为"会话 Cookie"，关浏览器即失                                            |
| **Secure**            | 仅经 HTTPS 传输                                                                          |
| **HttpOnly**          | JS 的 `document.cookie` **读不到**，防 XSS 窃取                                          |
| **SameSite**          | `Strict`（完全不跨站带）/ `Lax`（默认，跨站 POST 不带）/ `None`（跨站带，须配 `Secure`） |

> ⚠️ **Cookie 巨型化会拖慢每个请求**：Cookie 随每个同域请求（含图片、API）自动发送，过大 → 请求头膨胀、甚至触发 `431 Request Header Fields Too Large`。只放必要标识，业务数据放 `localStorage`/Token。

### 5.2 localStorage / sessionStorage

|          | localStorage                      | sessionStorage                                         |
| -------- | --------------------------------- | ------------------------------------------------------ |
| 生命周期 | 永久（除非代码/用户清除）         | 仅当前**标签页会话**（关页即失；同源多标签页彼此独立） |
| 容量     | 约 **5MB/域**                     | 约 5MB/域                                              |
| 类型     | 字符串（需 `JSON.stringify`）     | 同左                                                   |
| 同步     | **同步 API**，读写为阻塞主线程    | 同左                                                   |
| 跨标签页 | 同源可共享、可监听 `storage` 事件 | 不共享                                                 |

> **坑**：`localStorage` 是**同步**的，存大对象/循环写入会卡主线程；且**隐私模式**下 Safari 等会直接抛异常（写操作 `QuotaExceededError` 或 `SecurityError`），务必 `try/catch` 包裹。

### 5.3 IndexedDB

- **结构化**数据库（键值 + 索引），**异步** API，**容量大**（按配额，常达数百 MB 甚至 GB）。
- 适合：离线数据、大文件（Blob）、PWA 缓存、本地草稿。
- 事务模型：`readonly` / `readwrite`；版本升级 `onupgradeneeded`。
- 比 `localStorage` 复杂但强大；可配合 `idb` / `Dexie` 等库简化。

### 5.4 Cache Storage 与 Service Worker

- **Cache Storage API**：以 `Request` 为键存 `Response`，供 **Service Worker** 编程式控制缓存（离线优先、 stale-while-revalidate 等策略）。
- 属于"渐进增强"，无 SW 时不影响正常加载。

### 5.5 存储配额与持久化

```js
// 查询配额与使用量
const { usage, quota } = await navigator.storage.estimate();
console.log(
  `已用 ${(usage / 1024 / 1024).toFixed(1)}MB / 配额 ${(quota / 1024 / 1024).toFixed(0)}MB`,
);

// 请求持久化存储（不被浏览器自动清理，需用户授权/习惯判定）
const granted = await navigator.storage.persist();
```

- 浏览器在存储压力时会**自动清理**非持久化源（LRU）。`persist()` 可避免关键数据被清。
- **存储分区（Storage Partitioning）**：第三方（跨站）上下文的存储（Cookie 之外也包括 localStorage/IndexedDB 等）自 2021 起按**顶级站点**分区，即同一第三方脚本在不同站点下看到的是**不同存储**——影响跨站登录态共享类方案。

### 5.6 隐私模式与第三方 Cookie 限制

- **隐私/无痕模式**：临时存储不落盘，关窗即清；且 `localStorage` 写入可能受限（见 5.2）。
- **第三方 Cookie 淘汰趋势**：Safari（ITP）早已严格限制第三方 Cookie；Chrome 推进"隐私沙盒"逐步限制第三方 Cookie（时间表多次调整）。依赖第三方 Cookie 的广告/追踪/跨站登录方案需迁移到 **FedCM / CHIPS（分区 Cookie）/ 隐私沙盒 API**。

---

## 六、安全机制

### 6.1 同源策略（SOP）与跨域解决方案

**同源** = 协议 + 域名 + 端口 **三者全同**。例：`https://a.com:443` 与 `https://a.com`（默认 443 同源）、与 `http://a.com`（协议不同）、与 `https://api.a.com`（域名不同）、与 `https://a.com:8080`（端口不同）均**不同源**。

**SOP 限制**：

- 跨源**无法读**对方 DOM（`iframe.contentDocument` 受限）。
- 跨源 **XHR/fetch 默认被拦**（CORS 是"显式放宽"机制）。
- Cookie 默认不跨子域（除非设 `Domain`）。

**跨域解决方案**：

- **CORS**（服务端加 `Access-Control-Allow-*` 头，最正统）。
- **代理**：开发用 Vite/webpack `proxy`；生产用同源网关反向代理（最省心）。
- **postMessage**：`window.postMessage` + 校验 `event.origin` 实现跨窗口/跨 iframe 安全通信。
- **JSONP**：`<script>` 不受 SOP 限制（仅 GET，已过时，仅老系统兼容用）。
- `document.domain`：已被标准**弃用**（Chrome 已移除支持），勿再用。

### 6.2 XSS、CSRF、点击劫持及浏览器层防御

| 攻击                         | 原理                                           | 浏览器/标准层防御                                                                               |
| ---------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **XSS（跨站脚本）**          | 恶意脚本注入页面并执行（反射型/存储型/DOM 型） | `HttpOnly` Cookie（偷不到）、**CSP**（限制脚本源）、`X-Content-Type-Options: nosniff`、输入转义 |
| **CSRF（跨站请求伪造）**     | 诱导用户浏览器向已登录站点发非本意请求         | `SameSite=Lax/Strict` Cookie、CSRF Token、校验 `Origin`/`Referer`                               |
| **点击劫持（Clickjacking）** | 透明 iframe 覆盖诱导点击                       | `X-Frame-Options: DENY/SAMEORIGIN` 或 CSP `frame-ancestors`                                     |

> **XSS 防御口诀**：不信任任何用户输入；输出到 HTML 时**按上下文转义**（HTML 文本、属性、JS 字符串、URL 各有不同）；用框架的自动转义（React/Vue 默认）；`innerHTML` 必须 sanitize（如 DOMPurify）；`HttpOnly` + `CSP` 兜底。

### 6.3 CSP（内容安全策略）

通过 `Content-Security-Policy` 响应头（或 `<meta http-equiv>`）给出**白名单**，浏览器据此拦截违例资源：

```http
Content-Security-Policy: default-src 'self';
  script-src 'self' https://trusted.cdn.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  frame-ancestors 'none';
  object-src 'none'
```

- 常用指令：`default-src`、`script-src`、`style-src`、`img-src`、`connect-src`（限制 fetch/XHR/WebSocket）、`frame-src`、`frame-ancestors`、`object-src`。
- **报告模式**：`Content-Security-Policy-Report-Only` 只上报不拦截，用于平滑迁移。
- **`strict-dynamic` / `nonce` / `hash`**：现代 CSP 不再依赖域名白名单，而是给可信脚本打 `nonce`（一次性随机数）或哈希，彻底杜绝内联脚本注入。

### 6.4 沙箱（Sandbox）与 iframe 安全

- 渲染进程**沙箱**：Chromium 渲染进程以极低权限运行（无法直连文件系统/网络），是 XSS 等攻击的"最后一道墙"。
- **`<iframe sandbox>`**：限制 iframe 内行为，如 `allow-scripts`（允许 JS）、`allow-same-origin`、`allow-forms`、`allow-popups` 等。**最严格是 `sandbox=""`**（几乎啥都不能干）。嵌入第三方内容务必加 `sandbox` 并最小授权。

```html
<iframe
  src="https://third-party.com/widget"
  sandbox="allow-scripts allow-same-origin"
></iframe>
```

- **权限策略（Permissions Policy，原 Feature Policy）**：通过 `<iframe allow="camera 'none'; microphone 'self'">` 或 `Permissions-Policy` 响应头，限制页面/iframe 能用哪些浏览器能力（摄像头、麦克风、地理位置等）。

### 6.5 HTTPS、混合内容、HSTS

- **HTTPS** = HTTP over TLS，加密 + 身份认证。所有新项目应默认 HTTPS。
- **混合内容（Mixed Content）**：HTTPS 页面加载 HTTP 资源——
  - **主动混合内容**（脚本、iframe、CSS）：浏览器**直接拦截**（红错）。
  - **被动混合内容**（图片）：旧浏览器允许但警告，新版本也趋严。
  - 解法：全站 HTTPS，或把接口/资源走同源代理。
- **HSTS**（`Strict-Transport-Security: max-age=31536000; includeSubDomains`）：告诉浏览器"以后只走 HTTPS"，防 SSL 剥离。

### 6.6 浏览器指纹与隐私（ITP、隐私沙盒）

- **浏览器指纹（Fingerprinting）**：不依赖 Cookie，而是收集 `User-Agent`、屏幕分辨率、时区、语言、已安装字体、**Canvas/WebGL 渲染特征**、音频指纹等，拼出一个"几乎唯一"的标识，用于追踪。
- **防御（浏览器侧）**：
  - **Safari ITP（Intelligent Tracking Prevention）**：限制跨站追踪、收缩 Cookie 生命周期、划分存储。
  - **Chrome 隐私沙盒（Privacy Sandbox）**：用 **FedCM**（联邦身份凭证，替代第三方登录 Cookie）、**Topics API / Attribution Reporting** 等替代跨站追踪，同时承诺不引入永久指纹机制。
  - **`navigator.userAgent` 逐步冻结**（User-Agent Reduction）：只给粗粒度信息，削弱指纹强度。

---

## 七、性能与调试

> 本节以 Chromium DevTools 为主。核心心法：**先用面板看"真凶"，再改代码**，别靠猜。

### 7.1 Performance 面板

- **FPS 条**（顶部绿色）：掉到 60 以下=卡顿；红色块=长任务。
- **CPU 区**：各线程占用；主线程爆满=JS 太重。
- **Main（主线程火焰图）**：自顶向下看每个任务的调用栈，找耗时函数。
- **Frames（帧）**：每帧耗时 > 16.7ms 即可能掉帧；点帧看其各阶段（脚本/渲染/绘制）占比。
- **录制技巧**：勾 "Screenshots" 看逐帧画面；"Web Vitals" 直接标 LCP/CLS/INP；点长任务看"Bottom-Up"/"Call Tree"。

### 7.2 Lighthouse / Web Vitals

**Core Web Vitals（核心网页指标）**：

| 指标                                 | 含义                             | 良好阈值 | 说明                                          |
| ------------------------------------ | -------------------------------- | -------- | --------------------------------------------- |
| **LCP**（Largest Contentful Paint）  | 最大内容元素绘制完成时间         | ≤ 2.5s   | 衡量"加载快慢"                                |
| **INP**（Interaction to Next Paint） | 用户交互到下次绘制（取代旧 FID） | ≤ 200ms  | 衡量"交互响应"，2024 年 3 月起为官方核心指标  |
| **CLS**（Cumulative Layout Shift）   | 累积布局偏移                     | ≤ 0.1    | 衡量"视觉稳定性"（图片/广告突然插入导致跳动） |
| **TTFB**（Time to First Byte）       | 首字节时间（支持性指标）         | ≤ 0.8s   | 服务器/网络响应                               |

> **FID vs INP**：`FID`（First Input Delay，首次输入延迟）已于 2024 年被 **INP** 取代——INP 考察**所有**交互的延迟而非仅首次，更贴近真实体验。

- **Lighthouse**：DevTools 内置，一键审计性能/可访问性/SEO/最佳实践，给出可操作建议（压缩图片、消除阻塞资源、减少主线程工作等）。

### 7.3 Memory 面板（内存泄漏）

- **堆快照（Heap Snapshot）**：抓两时刻快照对比，找"该释放却没释放"的对象。
- **常见泄漏源**：
  - **分离的 DOM 节点（Detached DOM）**：已从文档移除但 JS 仍引用（如闭包、数组缓存）→ 无法 GC。
  - **未清理的监听器 / 定时器**：`addEventListener` / `setInterval` 在组件销毁时未移除。
  - **意外的全局变量**、`Map`/`Set` 无限增长。
- **Allocation instrumentation**：随时间记录内存分配，定位持续上涨的源头。

### 7.4 Network 面板

- **瀑布图（Waterfall）**：每个请求的时序——排队（Queueing）、阻塞、DNS、TLS、TTFB、内容下载。
- **Timing 标签**：细看各阶段耗时（如 `Stalled` 长时间=连接争抢/队头阻塞）。
- **Priority 列**：资源优先级（Highest/High/Medium/Low），配合 4.4 优化。
- 技巧：勾 **Disable cache** 排除缓存；**Preserve log** 跨导航保留；右键请求 "Copy as cURL" 复现给后端。

### 7.5 Coverage / Rendering / Layers 面板

- **Coverage（覆盖率）**：录制看 JS/CSS 有多少**未被使用**（红条=未用），指导删代码/按需加载。
- **Rendering（渲染面板）**：
  - **Paint flashing**：重绘区域高亮闪烁 → 找出不必要重绘。
  - **Layout Shift Regions**：布局偏移区域高亮。
  - **Frame Rendering Stats / FPS meter**：实时 FPS、GPU 占用。
- **Layers（图层）**：可视化所有合成层，看是否有**层爆炸**（层数异常多）。

### 7.6 长任务（Long Task）与卡顿

- **Long Task**：主线程**连续阻塞 > 50ms** 的任务（用户能感知卡顿）。DevTools 标红、Performance Observer 可代码监听。
- **对策**：
  - **拆分大任务**：用 `await new Promise(r => setTimeout(r))`（让出主线程）、`scheduler.yield()`（实验）、`requestIdleCallback` 把工作切片。
  - **Web Worker**：把重计算搬出主线程。
  - **减少同步布局**（见 2.3）、**减少强制 reflow**。
  - 用 `PerformanceObserver` 监控真实用户的 INP/长任务：

```js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50)
      console.warn("Long Task:", entry.duration, entry.attribution);
  }
}).observe({ type: "longtask", buffered: true });
```

---

## 八、兼容性与 Web 平台能力

### 8.1 内核差异与特性检测（Feature Detection）

| 内核       | 代表浏览器                                     | 渲染引擎 / JS 引擎      |
| ---------- | ---------------------------------------------- | ----------------------- |
| **Blink**  | Chrome、Edge、Opera、国内主流壳                | Blink / V8              |
| **WebKit** | Safari（含 iOS 所有浏览器，iOS 只允许 WebKit） | WebKit / JavaScriptCore |
| **Gecko**  | Firefox                                        | Gecko / SpiderMonkey    |

> **iOS 铁律**：苹果的 App Store 政策要求 iOS 上所有浏览器**必须用 WebKit 内核**（即便 Chrome 也如此），所以 iOS 上"Chrome"与"Safari"行为高度一致、都受 WebKit 限制（如 `position: fixed` 在输入框聚焦时的诡异行为、某些 API 缺失）。

**特性检测（而非"UA 嗅探"）**：

```js
// ✅ 检测能力存在，而非判断浏览器品牌
if ('IntersectionObserver' in window) { /* 用 IO */ }
else { /* 降级方案 */ }

// ❌ 不要靠 UA 字符串判断（易误判、易被伪造）
if (/Chrome/.test(navigator.userAgent)) { ... }
```

### 8.2 Polyfill / Transpiling / Browserslist

- **Transpile**：用 **Babel/SWC** 把新语法（ES2022+、JSX、TS）转成旧浏览器能跑的 ES5/ES2015。
- **Polyfill**：补齐缺失的 API（如 `core-js`、`regenerator-runtime` 补 `Promise`/`Array.prototype.flat`）。
- **Browserslist**：在 `package.json` / `.browserslistrc` 声明目标浏览器（如 `> 0.5%, last 2 versions, not dead`），Babel/Autoprefixer/esbuild 据此决定转译与加前缀范围。目标越宽 → 产物越大。

```
# .browserslistrc 示例
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
> 0.5% in CN
not dead
```

### 8.3 渐进增强与优雅降级

- **渐进增强（Progressive Enhancement）**：先保证基础功能在一切环境可用，再为现代浏览器加增强（动画、离线、新 API）。
- **优雅降级（Graceful Degradation）**：先按现代能力实现，再为旧环境提供兜底（如 `WebP` 不支持回退 `JPEG`、无 `IntersectionObserver` 用滚动监听）。
- 实践中二者结合：核心功能不依赖新特性；新特性用 `if (capability)` 包裹并备 fallback。

### 8.4 新兴 Web API

| API                     | 能力                                                | 典型用途                                |
| ----------------------- | --------------------------------------------------- | --------------------------------------- |
| **Web Worker**          | 后台线程跑 JS（不阻塞主线程）                       | 重计算、大数组处理                      |
| **SharedWorker**        | 同源多标签页共享的 Worker                           | 跨标签页通信/状态同步                   |
| **Service Worker**      | 拦截网络请求、离线缓存、推送                        | PWA、离线应用                           |
| **WebSocket**           | 全双工实时通信（基于 101 升级）                     | 聊天、协同、行情                        |
| **WebRTC**              | 浏览器间点对点音视频/数据                           | 视频会议、直播、P2P                     |
| **WebAssembly（Wasm）** | 接近原生的二进制执行（C/Rust/Go 编译）              | 图像/音视频处理、游戏、加密、高性能计算 |
| **Web Components**      | `Custom Elements` + `Shadow DOM` + `HTML Templates` | 框架无关的可复用组件                    |

> **WebAssembly 与多线程**：Wasm 要用 `SharedArrayBuffer` 做多线程，需先满足**跨域隔离**（见 4.5 的 COOP/COEP）。

### 8.5 PWA 与 Service Worker 生命周期

**Service Worker 生命周期**：

```
注册(sw.js) → install(缓存静态资源) → activate(清理旧缓存) → fetch(拦截请求, 自定义缓存策略)
```

- **install**：首次注册时触发，常用于预缓存 App Shell（`cache.addAll`）。
- **activate**：旧 SW 退出后触发，清理过期 Cache（`caches.keys()` + `caches.delete`）。
- **更新机制**：SW 文件**字节变化**才被视为新版本。新 SW 先 `waiting`，默认要等所有旧页面关闭才激活。
  - **`skipWaiting()`**（在 install 里调）+ **`clients.claim()`**（在 activate 里调）= 新 SW 立即接管，无需等页面刷新。
  - 开发期想每次都用最新：DevTools → Application → Service Workers → 勾 **Update on reload**。

```js
// sw.js 立即生效（牺牲"等旧页关闭"的稳定性，换取即时更新）
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
```

- **Web App Manifest**（`manifest.json` + `<link rel="manifest">`）：定义图标、名称、启动屏、显示模式（`standalone`），让网站"可安装"成桌面/主屏应用。
- **离线策略示例（stale-while-revalidate）**：先返回缓存（快），同时后台更新缓存，下次更准。

---

## 附：高频面试题速记

1. **输入 URL 到页面显示经历了什么？** → 见 1.5（DNS→连接→请求→解析→CRP→渲染→交互）。
2. **浏览器进程 vs 线程？** → 多进程隔离稳定/安全；渲染进程内主线程（JS+布局）、合成线程（滚动/GPU）、光栅线程（绘制位图）分工（1.2）。
3. **重排和重绘区别？如何避免？** → 几何变化 vs 外观变化；读写分离防 Layout Thrashing（2.3）。
4. **为什么 transform 动画更流畅？** → 只走合成线程，不触发主线程 reflow/repaint（2.4）。
5. **宏任务与微任务执行顺序？** → 一个宏任务 → 清空所有微任务 → 渲染 → 下一宏任务（3.3）。
6. **V8 如何提升 JS 性能？** → 隐藏类 + 内联缓存 + 解释器/优化编译器双段 JIT（3.1/3.2）。
7. **强缓存 vs 协商缓存？** → `max-age`/200 from cache vs `ETag`/304（4.2，详见 http.md 5.1）。
8. **Cookie / localStorage / IndexedDB 区别？** → 见 5.1/5.2/5.3 表格。
9. **同源策略与跨域方案？** → 见 6.1。
10. **XSS / CSRF / 点击劫持如何防御？** → HttpOnly + CSP / SameSite + Token / X-Frame-Options（6.2/6.3）。

---

> 本文持续更新。核心心法：**"浏览器不是黑盒"**——架构决定进程隔离、CRP 决定渲染性能、事件循环决定响应、缓存/存储决定状态、安全头决定边界。多数"玄学报错"都能在 DevTools 的 **Network / Performance / Memory / Application** 四个面板里找到真相。
