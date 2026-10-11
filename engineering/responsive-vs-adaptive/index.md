# 响应式与自适应设计

> 本文定位：**既是新手的入门学习指南，也是非新手的团队规范指南与避坑指南。**
>
> - 如果你是新手：按 01 → 04 → 05 → 08 顺序通读，先建立心智模型，再看代码怎么落地。
> - 如果你已有经验：直奔 **09 团队规范**、**10 避坑清单**、**12 评审 Checklist**，把它当作落地标准与自查表。

---

## 目录

- [01 基础知识](#01-基础知识)
  - [1.1 为什么需要多端适配](#11-为什么需要多端适配)
  - [1.2 什么是响应式设计 RWD](#12-什么是响应式设计-rwd)
  - [1.3 什么是自适应设计 AWD](#13-什么是自适应设计-awd)
  - [1.4 核心差异对照表](#14-核心差异对照表)
  - [1.5 优缺点全解](#15-优缺点全解)
  - [1.6 常见误解澄清](#16-常见误解澄清)
- [02 前置知识：视口、像素与单位](#02-前置知识视口像素与单位)
- [03 响应式设计如何实现](#03-响应式设计如何实现)
- [04 自适应设计如何实现](#04-自适应设计如何实现)
- [05 主流适配方案（工程化）](#05-主流适配方案工程化)
- [06 现在最流行的响应式解决方案](#06-现在最流行的响应式解决方案)
- [07 现在最流行的自适应解决方案](#07-现在最流行的自适应解决方案)
- [08 响应式与自适应如何选择](#08-响应式与自适应如何选择)
- [09 团队规范指南](#09-团队规范指南)
- [10 避坑指南（27 个高频坑）](#10-避坑指南27-个高频坑)
- [11 完整最小实践骨架](#11-完整最小实践骨架)
- [12 评审 Checklist](#12-评审-checklist)
- [13 参考资料](#13-参考资料)

---

## 01 基础知识

### 1.1 为什么需要多端适配

Web 早期只有两种建站思路（MDN 对这段历史的描述）：

| 历史方案             | 做法                    | 问题                                 |
| -------------------- | ----------------------- | ------------------------------------ |
| **固定宽度站点**     | 容器写死 `width: 960px` | 窄屏出现横向滚动条；宽屏两侧大片空白 |
| **液态（流体）站点** | 用百分比撑满浏览器      | 小屏挤成一团；大屏行长过长、难以阅读 |

随后移动端兴起，行业主流做法是**另做一个移动站**（`m.example.com` / `example.mobi`），代价是：

- 两套代码、两套内容，**同步成本极高**；
- 移动站功能常被阉割，用户拿不到桌面站的完整信息；
- 每出现一种新形态设备（平板 → 折叠屏 → 车机屏 → 车载/手表），就要再复制一份。

于是"一套内容、多端呈现"的方案成为主流，分化出两条路：**响应式**与**自适应**。

### 1.2 什么是响应式设计 RWD

> **响应式网页设计（Responsive Web Design，RWD）**：同一个 HTML 文档、同一套 URL，页面布局像"水"一样，随着视口（viewport）尺寸连续地流动、重排，从而适配任意屏幕。

**起源**：2010 年 Ethan Marcotte 在 A List Apart 发表《Responsive Web Design》，定义为三种技术的组合：

1. **流体网格（Fluid Grids）** — 用相对单位（百分比 / 后来的 `fr`、`flex`）代替固定像素；
2. **弹性图片（Flexible Images）** — `img { max-width: 100%; }`，图片随容器缩放而不溢出；
3. **媒体查询（Media Queries）** — 纯 CSS 完成"不同尺寸下切换布局"，取代早期用 JS 探测分辨率再加载 CSS 的土办法。

**关键认知**：响应式**不是某一项技术**，而是"一组最佳实践"的统称。现代 CSS 布局（Flexbox / Grid）**天生就是响应式的**，加上容器查询、`clamp()` 等新特性，"让页面响应视口"已经是 Web 的默认基线能力。

```css
/* 响应式的典型形态：连续流动 + 少量断点修正 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
```

### 1.3 什么是自适应设计 AWD

> **自适应网页设计（Adaptive Web Design，AWD）**：预先为**若干档固定尺寸**（如 320 / 480 / 760 / 960 / 1200 / 1600px）设计好**多套固定布局**，运行时先探测设备/视口，再**选中并加载**与之匹配的那一套。

它像"抽屉"：视口是钥匙，抽屉里是已经做好的成品布局，取出来直接用，**不在抽屉覆盖范围内的尺寸就可能显示异常**（典型表现：PC 端窗口缩小后出现横向滚动条、内容溢出）。

**典型形态**：

- 同一套代码里写 N 个固定宽度断点（CSS 层面自适应）；
- JS / 服务端探测 UA 或屏幕宽度后**跳转到不同站点**（`m.xxx.com` vs `www.xxx.com`）；
- 服务端动态服务（Dynamic Serving）：同一 URL，服务端按 UA 返回不同 HTML。

### 1.4 核心差异对照表

| 维度         | 响应式 RWD                            | 自适应 AWD                                        |
| ------------ | ------------------------------------- | ------------------------------------------------- |
| **核心理念** | 流体网格（Fluid Grid）                | 断点布局（Breakpoint Layout）                     |
| **代码库**   | **一套** HTML + CSS                   | **多套**界面/模板（2~6 套常见）                   |
| **变化方式** | **连续**、平滑过渡                    | **离散**、到点切换，切换时可能"跳变"              |
| **尺寸覆盖** | 覆盖连续谱系，天然兼容未来新尺寸      | 只覆盖预设档位，未覆盖尺寸可能布局异常            |
| **检测位置** | 客户端 CSS 媒体查询（浏览器原生）     | JS 探测 / 服务端 UA 探测 / 多站点跳转             |
| **URL**      | 唯一，全端一致                        | 可能多域名、多路径，需额外 SEO 处理               |
| **SEO**      | 谷歌等**明确推荐**，权重集中          | 有重复内容风险，需 `canonical` / `alternate` 规范 |
| **性能**     | 取决于优化；易给小屏下发大图/冗余代码 | 可针对设备深度裁剪，**理论首屏更优**              |
| **维护成本** | 低（改一处全端生效）                  | 高（改需求要同步改 N 套）                         |
| **典型案例** | 企业官网、博客、文档站（内容型）      | 淘宝/京东等首页（PC 与移动端内容差异巨大）        |

**一句话记忆**：

- 响应式 = **内容像水**（Content is like water）— 一个容器，随形就势；
- 自适应 = **内容选抽屉** — 先量尺寸，再取对应成品。

#### 总结（速查版）

上面那张表太细？记住这 8 行就够应付绝大多数讨论与面试场景：

| 特性           | 响应式设计（Responsive）                            | 自适应设计（Adaptive）                                                 |
| -------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| **底层逻辑**   | 一套代码库，基于流式网格（Fluid Grid）**连续伸缩**  | 单一或多套布局，基于固定断点（Breakpoint）"Snap（切换）"到**固定版本** |
| **直观差异**   | 一套代码，布局像液体一样连续流动，断点只是微调      | 多套代码，布局像开关一样在断点处跳变，每个断点都是一套独立设计         |
| **核心区别**   | 一套代码，流体变化                                  | 多套代码，断点切换                                                     |
| **尺寸单位**   | 常用 `%`、`rem`、`em`、`vw/vh`，配合 Flexbox / Grid | 常用 `px`（配合固定宽度容器与媒体查询）                                |
| **布局方式**   | 流式，根据屏幕大小**自动连续调整**                  | 预设多种布局，根据屏幕大小**选择其中一套**                             |
| **实现技术**   | CSS 媒体查询、Flexbox、Grid                         | JavaScript / 服务器端检测、不同的 CSS 与 HTML                          |
| **加载与性能** | 前端加载**全量资源**，通过 CSS 隐藏或重排，首屏略重 | **按需加载**特定设备的布局与资源，首屏加载通常更快                     |
| **开发维护**   | 维护成本低（1 套代码），但**调试边界情况工作量大**  | 针对主流设备**深度定制体验好**，但需维护多套布局，成本较高             |
| **用户体验**   | 流畅自然（平滑过渡）                                | 可能出现跳跃（跨断点突变）                                             |
| **SEO**        | 友好（URL 统一，搜索引擎明确推荐）                  | 需要谨慎处理（多站点需 `canonical` 等规范）                            |

**读法提示**：

- 「底层逻辑 + 尺寸单位」回答「**底层怎么实现**」——流式连续伸缩 vs 断点固定切换，这是最容易被追问的两点；
- 「布局方式 + 实现技术」回答「**是什么、怎么做**」——这是两者的本质分野；
- 「加载与性能 + 开发维护」回答「**要花多少钱**」——响应式赢在维护（一套代码），自适应赢在运行性能（按需加载）；
- 「用户体验 + SEO」回答「**有什么副作用**」——响应式要防小屏加载全量资源的性能劣化，自适应要防 SEO 与多套布局的维护失控。

实践中不必二选一：**响应式打底 + 在关键场景用自适应补位**（即 RESS / 服务端分流）才是当下的主流落地形态。

> 参考来源：[博客园 · 说说响应式设计和自适应设计的区别](https://www.cnblogs.com/ai888/p/18569746)

### 1.5 优缺点全解

#### 响应式 RWD

**优点**

1. **一套代码多处适配**：长期功能迭代与维护只针对一套代码，总体成本可控。
2. **维护最简单**：内容、链接、HTML 结构唯一，不存在多端内容不一致。
3. **SEO 友好**：搜索引擎明确推荐，URL 统一、无重复内容，利于权重集中与爬虫抓取。
4. **体验连续平滑**：无缝覆盖大屏到小屏的所有中间尺寸（含分屏、折叠屏展开态等）。
5. **未来适应性强**：新设备、新尺寸无需额外开发。

**缺点**

1. **初期投入与设计难度较高**：需通盘考虑所有尺寸，对 CSS 功底要求高。
2. **性能依赖优化**：移动端可能下载到被隐藏的桌面端大图与冗余代码，未优化会拖慢加载。
3. **代码可能臃肿**：容易出现"隐藏无用元素 + 加载时间变长"的折中结果。
4. **复杂信息架构下力不从心**：内容极多、PC 与移动端信息结构差异巨大的场景，强行一套会互相妥协。
5. **一定程度上改变原有布局结构**，可能造成用户认知混淆。

#### 自适应 AWD

**优点**

1. **可深度定制特定设备**：为移动端单独提供精简代码与合适尺寸图片，理论初始加载性能更优。
2. **对复杂站点兼容性更大**：PC、平板、手机可以各给各的信息优先级。
3. **可并行开发、快速上线**：已有成熟 PC 站时，可独立开一个移动版快速铺开，不改动原站。
4. **代码更高效、测试更容易**：每套布局都是固定宽度，设计师与测试都能精确把控。

**缺点**

1. **后期维护成本高**：新增尺寸档位（如折叠屏）或全站改版，需要同步改多套代码。
2. **内容同步易出错**：多版本之间内容一致性需要额外机制保障。
3. **SEO 风险**：不同子域名/参数区分设备易造成重复内容，必须配合 `canonical` 等规范。
4. **适配不完美**：非预设尺寸设备可能出现布局问题（PC 端窗口缩小时尤其明显）。
5. **切换有跳变**：跨断点时布局突变，体验不如响应式平滑。

### 1.6 常见误解澄清

| 误解                   | 正解                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| "响应式就是媒体查询"   | 媒体查询只是手段之一。现代响应式更依赖 Grid/Flex 的内在弹性，甚至**零媒体查询**也能做出来             |
| "自适应已经过时了"     | 没有过时。PC/移动**业务形态差异巨大**时（电商首页、后台系统）仍是首选                                 |
| "两者互斥，只能选一个" | 实践中**绝大多数项目是混合的**：整体响应式 + 关键模块/路由自适应分流                                  |
| "响应式 = 移动端适配"  | 响应式覆盖从 320px 到 8K 的连续谱系，移动端只是其中一段                                               |
| "用了 vw 就是响应式"   | 纯 `vw` 等比缩放更像"自适应/缩放"，且会破坏用户缩放能力，见 [坑 3](#坑-3只用-vw-设定字号破坏用户缩放) |

---

## 02 前置知识：视口、像素与单位

这一节是所有适配方案的**共同地基**，务必先掌握。

### 2.1 viewport meta（必须写在 head 里）

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**为什么必须有**：早期 iPhone 为了让未经优化的桌面站也能看，默认把视口宽度谎报为 **980px** 并按此宽度渲染后再整体缩小。若不覆写，你的"≤480px 窄屏样式"在手机上**永远不会生效**。

常用项：

| 属性                 | 说明                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `width=device-width` | 视口宽度 = 设备宽度（核心）                                         |
| `initial-scale=1`    | 初始缩放 100%                                                       |
| `viewport-fit=cover` | iOS 刘海屏下让内容延伸到安全区之外（配合 `env(safe-area-inset-*)`） |

> **无障碍红线**：不要写 `user-scalable=no` 或 `maximum-scale=1`，这会剥夺用户缩放能力，违反可访问性原则。

### 2.2 三种像素

| 概念                     | 含义                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| **设备像素（物理像素）** | 屏幕真实发光点                                                                 |
| **CSS 像素（逻辑像素）** | 我们在 CSS 里写的 `px`，与设备无关                                             |
| **DPR（设备像素比）**    | 物理像素 / CSS 像素。DPR=2 时 1 CSS px 由 2×2 物理点渲染，所以要用 2x 图才清晰 |

媒体查询里匹配的是 **CSS 像素**，高清屏用 `min-resolution` 或 `-webkit-min-device-pixel-ratio` 匹配。

```css
@media (min-resolution: 2dppx) {
  .logo {
    background-image: url(logo@2x.png);
  }
}
```

### 2.3 单位体系速查

| 单位            | 参照                 | 适用场景                     | 备注                                                       |
| --------------- | -------------------- | ---------------------------- | ---------------------------------------------------------- |
| `px`            | 绝对（CSS 像素）     | 边框、细线、阴影             | 不要用于布局主尺寸                                         |
| `%`             | 父元素               | 宽度、高度                   | 高度百分比依赖父级显式高度                                 |
| `em`            | **父元素**字号       | 组件内间距                   | 嵌套会复合放大，慎用                                       |
| `rem`           | **根元素**字号       | 间距、字号、尺寸             | 团队协作首选                                               |
| `vw` / `vh`     | 视口宽/高 1%         | 全屏区块、等比缩放           | `100vw` 含滚动条，见 [坑 2](#坑-2100vw-导致莫名横向滚动条) |
| `vmin` / `vmax` | 视口较小/较大边      | 正方形元素、横竖屏通用       |                                                            |
| `svh/lvh/dvh`   | 小/大/**动态**视口高 | 移动端全屏块                 | `dvh` 随地址栏收放变化，解决移动端 `100vh` 跳动            |
| `ch`            | 字符 `0` 宽度        | 控制行长（45~75ch 最佳阅读） |                                                            |
| `fr`            | Grid 剩余空间份额    | 栅格列宽                     | 配合 `minmax()` 使用                                       |

### 2.4 断点（Breakpoint）

样式发生改变的那个临界视口宽度，就是**断点**。

**核心原则：断点由"内容"决定，不由"设备"决定。** 拖动窗口，当行长过长、文字被挤成每行两三个字、盒子明显空旷时—那里就该加断点，而不是照抄"iPhone 是 375、iPad 是 768"。

---

## 03 响应式设计如何实现

### 3.1 移动优先（Mobile First）— 默认写法

先写窄屏基础样式，再用 `min-width` **逐级增强**：

```css
/* 基础：移动端（无媒体查询） */
.card {
  display: block;
}

/* 平板起 */
@media (min-width: 48em) {
  /* 768px */
  .card {
    display: inline-block;
    width: 48%;
  }
}

/* 桌面起 */
@media (min-width: 75em) {
  /* 1200px */
  .card {
    width: 32%;
  }
}
```

**为什么推荐移动优先**：

- 移动样式通常更简洁，作为基础层代码量最小；
- `min-width` 单向递增，天然避免断点重叠/缝隙（见 [坑 6](#坑-6max-width-与-min-width-混用造成断点缝隙或重叠)）；
- 强制你先想清楚内容的优先级。

### 3.2 现代布局（Flexbox / Grid）— 响应式的第一主力

这三种布局**默认就是响应式的**：

```css
/* 多列布局：浏览器自己算列数 */
.article {
  column-width: 18em;
} /* 最小列宽，列数随空间自动变化 */

/* Flexbox：弹性伸缩 */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar > .btn {
  flex: 1 1 120px;
} /* 基础 120px，可伸可缩，放不下自动换行 */

/* Grid：一行搞定"卡片自适应列数"，零媒体查询 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
```

`auto-fit` vs `auto-fill`：

- `auto-fit`：空轨道会被折叠，有元素时**拉伸填满**（卡片列表用它）；
- `auto-fill`：保留空轨道，元素不拉伸（固定尺寸网格用它）。

### 3.3 媒体查询（Media Queries）

```css
/* 传统写法 */
@media screen and (min-width: 768px) { ... }

/* 现代 range 语法（更简洁，推荐新项目使用） */
@media (width >= 768px) { ... }
@media (480px < width < 1200px) { ... }

/* 常见媒体特性 */
@media (orientation: landscape) { ... }          /* 横竖屏 */
@media (hover: hover) and (pointer: fine) { ... } /* 真正的鼠标设备 */
@media (prefers-color-scheme: dark) { ... }       /* 深色模式 */
@media (prefers-reduced-motion: reduce) { ... }   /* 降低动效偏好 */
@media print { ... }                              /* 打印样式 */
```

**断点参考值**（供起步，务必按内容微调）：

| 名称  | 断点     | 典型设备              |
| ----- | -------- | --------------------- |
| `sm`  | ≥ 640px  | 大屏手机横屏 / 小平板 |
| `md`  | ≥ 768px  | 平板竖屏              |
| `lg`  | ≥ 1024px | 平板横屏 / 小笔记本   |
| `xl`  | ≥ 1280px | 桌面                  |
| `2xl` | ≥ 1536px | 大屏桌面              |

> Tailwind 默认断点即上表，已成为事实标准。

### 3.4 响应式排版：流式字号

不要为每个断点手写字号，用 `clamp()` 一次搞定：

```css
/* clamp(最小值, 理想值, 最大值) */
h1 {
  font-size: clamp(1.75rem, 1rem + 3vw, 4rem);
}
body {
  font-size: clamp(14px, 0.5rem + 0.4vw, 18px);
}

/* 用 CSS 变量统一令牌 */
:root {
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.25rem);
  --step-1: clamp(1.25rem, 1.15rem + 0.5vw, 1.75rem);
  --step-2: clamp(1.5rem, 1.3rem + 1vw, 2.5rem);
}
```

**黄金规则**：`vw` 必须和固定单位（`rem`/`em`）**相加**使用（`calc()` 或 `clamp()` 内部），保证用户缩放能力不被破坏。

### 3.5 响应式图片

```html
<!-- 分辨率切换：让浏览器按 DPR 和布局宽度挑最合适的 -->
<img
  src="photo-800.jpg"
  srcset="photo-480.jpg 480w, photo-800.jpg 800w, photo-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
  alt="示例照片"
  loading="lazy"
  decoding="async"
  width="800"
  height="600"
/>

<!-- 艺术指导：不同尺寸给不同裁切/构图 -->
<picture>
  <source media="(min-width: 1200px)" srcset="hero-wide.jpg" />
  <source media="(min-width: 768px)" srcset="hero-medium.jpg" />
  <img src="hero-small.jpg" alt="主视觉" />
</picture>

<!-- 新格式回退：WebP 比 JPEG 同质量小约 26% -->
<picture>
  <source type="image/webp" srcset="pic.webp" />
  <img src="pic.jpg" alt="" />
</picture>
```

基线样式（几乎所有项目都该有）：

```css
img,
video,
svg,
canvas {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### 3.6 容器查询（Container Queries）— 组件级响应式

媒体查询看的是**视口**，容器查询看的是**父容器**。这让同一个组件在侧边栏（窄）和主区（宽）能呈现不同形态，是组件库/设计系统的关键能力（2023 年起主流浏览器已全面支持）。

```css
.card-list {
  container-type: inline-size;
  container-name: cardlist;
}

.card {
  display: grid;
  gap: 8px;
}

@container cardlist (min-width: 480px) {
  .card {
    grid-template-columns: 160px 1fr;
  } /* 宽容器 → 左图右文 */
}

/* 容器查询单位：相对容器尺寸 */
.card__title {
  font-size: clamp(1rem, 4cqi, 1.5rem);
}
```

### 3.7 CSS 变量 + 媒体查询（令牌驱动）

把断点差异收敛到变量，业务样式只消费变量，避免 `@media` 到处散落：

```css
:root {
  --pad: 16px;
  --cols: 1;
  --gap: 12px;
}
@media (width >= 768px) {
  :root {
    --pad: 24px;
    --cols: 2;
    --gap: 16px;
  }
}
@media (width >= 1200px) {
  :root {
    --pad: 32px;
    --cols: 3;
    --gap: 24px;
  }
}

.section {
  padding: var(--pad);
  display: grid;
  gap: var(--gap);
  grid-template-columns: repeat(var(--cols), 1fr);
}
```

### 3.8 交互形态的响应式

```css
/* 只有真正支持 hover 的设备才加 hover 效果，避免移动端"粘住" */
@media (hover: hover) {
  .btn:hover {
    background: #eee;
  }
}

/* 触摸设备加大点击热区（≥44×44px，iOS HIG 要求 44，Material 要求 48） */
@media (pointer: coarse) {
  .btn {
    min-height: 44px;
    padding-inline: 16px;
  }
}

button,
a {
  touch-action: manipulation;
} /* 消除 300ms 点击延迟 */
```

---

## 04 自适应设计如何实现

### 4.1 方案一：CSS 固定档位（最轻量）

```css
.container {
  width: 100%;
}
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}
@media (min-width: 992px) {
  .container {
    width: 970px;
  }
}
@media (min-width: 1200px) {
  .container {
    width: 1170px;
  }
}
@media (min-width: 1600px) {
  .container {
    width: 1520px;
  }
}
```

这是 Bootstrap 3 时代的经典栅格思想：**每档一个固定宽度**，档与档之间是"跳变"。

### 4.2 方案二：客户端探测 + 跳转/加载

```js
// 按 UA 跳转到不同站点（传统独立移动站做法）
const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(
  navigator.userAgent,
);
if (isMobile && location.hostname === "www.example.com") {
  location.replace("https://m.example.com" + location.pathname);
}

// 按视口条件加载不同模块（现代做法，更推荐）
if (window.matchMedia("(min-width: 768px)").matches) {
  import("./desktop-module.js");
} else {
  import("./mobile-module.js");
}
```

> **强烈建议**：优先用 `matchMedia` / `ResizeObserver` 这类**能力/尺寸探测**，而不是 UA 嗅探。UA 会骗人、会变、需要长期维护。

### 4.3 方案三：服务端适配（Dynamic Serving / RESS）

同一 URL，服务端根据 UA 返回不同 HTML/CSS：

```nginx
# 关键：必须加 Vary，否则 CDN/代理会把移动版缓存给桌面用户
Vary: User-Agent
```

```html
<!-- 双向标注，告诉搜索引擎这是同一内容的两种呈现 -->
<!-- 桌面页 -->
<link
  rel="alternate"
  media="only screen and (max-width: 640px)"
  href="https://m.example.com/page"
/>
<!-- 移动页 -->
<link rel="canonical" href="https://www.example.com/page" />
```

**RESS（Responsive + Server Side）**：以响应式为主体，仅在服务端做少量差异化（比如按设备下发不同尺寸图片、裁剪掉某些区块），是当下最实用的折中。

### 4.4 方案四：独立站点 / 多模板

| 形态                     | 示例                                    | 适用             |
| ------------------------ | --------------------------------------- | ---------------- |
| 子域名                   | `m.example.com`                         | 传统门户、电商   |
| 子目录                   | `example.com/m/`                        | SEO 迁移成本较低 |
| 多模板（服务端渲染时选） | `template = isMobile ? 'mobile' : 'pc'` | SSR 应用         |
| 微前端分流               | 不同端加载不同子应用                    | 大型平台         |

### 4.5 方案五：移动端等比缩放（rem / vw 方案）

移动端 H5 里最常见的一类"自适应"—**按设计稿宽度等比缩放**：

```js
// amfe-flexible / lib-flexible 思路
function setRem() {
  const designWidth = 750; // 设计稿宽度
  const w = document.documentElement.clientWidth;
  document.documentElement.style.fontSize = (w / designWidth) * 100 + "px";
}
setRem();
window.addEventListener("resize", setRem);
window.addEventListener("pageshow", (e) => e.persisted && setRem()); // 处理 iOS 回退缓存
```

配合构建期自动换算（写 px，产物变 rem）：

```js
// postcss.config.js — postcss-pxtorem
module.exports = {
  plugins: {
    "postcss-pxtorem": {
      rootValue: 75, // 750 设计稿 / 10
      propList: ["*", "!border*", "!font-size"], // 边框与字号通常不参与换算
      selectorBlackList: [/^html$/, /^\.ignore-/],
      minPixelValue: 2,
    },
  },
};
```

**纯 CSS 等价方案**（无需 JS，推荐新项目）：

```js
// postcss-px-to-viewport-8-plugin：375 设计稿 → 直接用 vw
{ viewportWidth: 375, unitPrecision: 5, viewportUnit: 'vw',
  selectorBlackList: ['.ignore-'], minPixelValue: 1,
  mediaQuery: false, exclude: [/node_modules/] }
```

> ⚠️ 这类等比缩放方案**只适合移动端 H5**，直接套到 PC/平板上会出现"巨无霸界面"，见 [坑 14](#坑-14rem-等比方案在-pc-大屏上失控)。

---

## 05 主流适配方案（工程化）

### 5.1 七大方案对比

| #   | 方案                    | 核心手段                           | 断点         | 适用                         | 优点                      | 缺点                                       |
| --- | ----------------------- | ---------------------------------- | ------------ | ---------------------------- | ------------------------- | ------------------------------------------ |
| A   | **媒体查询 + 断点体系** | `@media` + 固定容器宽              | 有           | 全场景基础层                 | 精确可控、兼容性最好      | 档位间跳变，样式分散                       |
| B   | **Flex/Grid 内在弹性**  | `auto-fit` + `minmax()`            | **几乎为零** | 卡片/列表/栅格               | 代码最少、真正连续        | 无法处理结构性差异（如侧栏显隐）           |
| C   | **rem + 动态根字号**    | JS 设 `html.font-size` + `pxtorem` | 无           | 移动端 H5、活动页            | 严格还原设计稿比例        | 依赖 JS、有闪烁、大屏失控                  |
| D   | **vw + 构建换算**       | `postcss-px-to-viewport`           | 无           | 移动端 H5、小程序 webview    | 纯 CSS，无需 JS，SSR 友好 | 大屏失控、边框过细、无法限制宽度           |
| E   | **clamp() 流式令牌**    | `clamp(min, rem+vw, max)`          | 无           | 字号、间距、全站排版         | 平滑、无需断点、可限幅    | 只解决"尺寸"，不解决"结构"                 |
| F   | **容器查询**            | `container-type` + `@container`    | 组件级       | 组件库、设计系统、可复用区块 | 组件自洽、与位置解耦      | 需设 container-type，有 containment 副作用 |
| G   | **原子化断点**          | Tailwind/UnoCSS `md:` `lg:` 前缀   | 有           | 快速开发、团队统一           | 断点集中、零上下文切换    | 类名冗长、需团队共识                       |

### 5.2 推荐的"分层策略"（生产级组合）

```
第 1 层：视口与基线     → viewport meta + box-sizing: border-box + img{max-width:100%}
第 2 层：弹性骨架       → Grid auto-fit/minmax + Flex wrap（能不写断点就不写）
第 3 层：关键结构断点   → 少量 min-width 断点（侧栏显隐、导航切换、栅格列数）
第 4 层：尺寸平滑过渡   → clamp() 流式令牌 + CSS 变量
第 5 层：组件自洽       → 容器查询（组件库 / 可复用区块）
第 6 层：资源按需       → srcset/sizes + loading=lazy + 条件加载
第 7 层：专项兜底       → 安全区、1px 边框、hover 判定、横竖屏、打印
```

> **适配的本质不是让所有设备看起来相同，而是让每个设备都获得最佳体验。**

### 5.3 按场景选方案

| 场景                     | 推荐组合                                                    |
| ------------------------ | ----------------------------------------------------------- |
| 企业官网 / 博客 / 文档站 | B + A + E（媒体查询 + Grid + clamp）                        |
| 移动端 H5 / 活动落地页   | D（vw 方案）或 C（rem 方案）+ Flex，容器加 `max-width` 限幅 |
| 后台管理系统             | A + G（栅格 + 断点隐藏列）+ 侧栏折叠                        |
| 组件库 / 设计系统        | F（容器查询）+ E（令牌）                                    |
| 跨端 Web 应用            | B + A + F + 服务端 RESS 分流                                |
| 大屏可视化               | 等比缩放（transform scale 或 rem）+ `preserveAspectRatio`   |

---

## 06 现在最流行的响应式解决方案

### 6.1 CSS 原生能力（首选，零依赖）

| 能力                                           | 作用                                               | 状态           |
| ---------------------------------------------- | -------------------------------------------------- | -------------- |
| **CSS Grid `repeat(auto-fit, minmax())`**      | 一行代码实现列数自适应，目前最主流的"无断点响应式" | 全面支持       |
| **Flexbox `flex-wrap` + `flex: 1 1 <basis>`**  | 一维自适应、工具栏、表单行                         | 全面支持       |
| **容器查询 `@container`**                      | 组件级响应式，组件库标配                           | 2023+ 全面支持 |
| **`clamp()` / `min()` / `max()`**              | 流式字号与间距，替代大量断点                       | 全面支持       |
| **逻辑属性** `margin-inline` / `padding-block` | 天然适配 RTL 与横竖屏                              | 全面支持       |
| **`:has()`**                                   | 结构条件化样式（如"有图时两栏"）                   | 2023+ 全面支持 |
| **样式查询 `@container style()`**              | 按自定义属性切换样式                               | 逐步支持       |
| **新视口单位** `svh/lvh/dvh`                   | 解决移动端 `100vh` 跳动                            | 2022+ 支持     |
| **CSS 嵌套**                                   | 媒体查询内嵌进选择器，大幅提升可维护性             | 2023+ 支持     |

```css
/* CSS 嵌套：媒体查询就近书写，不再需要文件底部堆一大坨 */
.card {
  display: grid;
  gap: 12px;

  @media (width >= 640px) {
    grid-template-columns: 200px 1fr;
  }
}
```

### 6.2 框架与工具（生态主流）

| 类别             | 主流选择                                                             | 说明                                                                           |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **原子化 CSS**   | **Tailwind CSS**、UnoCSS、Windi CSS                                  | 断点集中在 `sm/md/lg/xl/2xl`，移动优先前缀；当前最流行的响应式落地方式         |
| **CSS 框架**     | Bootstrap 5、Bulma                                                   | Bootstrap 5 仍是"栅格 + 断点"的事实教材，但新项目更多转向 Tailwind             |
| **组件库**       | shadcn/ui、Radix UI、MUI、Ant Design 5、Element Plus、Naive UI       | Ant Design 5 内置 `Grid`/`Row`/`Col` + `useBreakpoint`；MUI 有 `useMediaQuery` |
| **Vue 生态**     | VueUse `useBreakpoints` / `useMediaQuery`                            | 响应式断点进入 JS 逻辑层                                                       |
| **React 生态**   | `react-responsive`、CSS-in-JS（emotion/styled-components）、Tailwind | 逻辑层断点仅用于"结构差异"，样式差异一律交给 CSS                               |
| **元框架**       | Next.js、Nuxt、Remix、Astro                                          | SSR/SSG + 图片组件自动 `srcset`，响应式开箱即用                                |
| **PostCSS 生态** | `postcss-pxtorem`、`postcss-px-to-viewport-8-plugin`、`autoprefixer` | 设计稿 px → 相对单位                                                           |
| **设计侧**       | Figma Auto Layout / Variables、设计令牌（Design Token）              | 设计稿与代码的断点对齐，是"响应式能落地"的组织前提                             |

### 6.3 2026 年的事实标准写法（推荐模板）

```css
/* 1. 基线 */
*,
*::before,
*::after {
  box-sizing: border-box;
}
img,
svg,
video {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 2. 令牌（流式，无断点） */
:root {
  --space-2: clamp(8px, 0.5rem + 0.5vw, 16px);
  --space-4: clamp(16px, 1rem + 1vw, 32px);
  --text-body: clamp(14px, 0.875rem + 0.2vw, 16px);
}

/* 3. 骨架（无断点自适应列数） */
.grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
}

/* 4. 少量结构断点 */
.layout {
  display: grid;
  grid-template-columns: 1fr;
}
@media (width >= 64rem) {
  .layout {
    grid-template-columns: 16rem 1fr;
  }
}
```

> `minmax(min(100%, 260px), 1fr)` 是个重要技巧：防止极窄视口（<260px）下溢出。

---

## 07 现在最流行的自适应解决方案

### 7.1 服务端侧

| 方案                            | 说明                                                                 | 现状                                       |
| ------------------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| **Dynamic Serving（动态服务）** | 同一 URL + `Vary: User-Agent`，服务端返回不同 HTML                   | 谷歌认可的三种移动配置之一，仍广泛用于电商 |
| **RESS**                        | 响应式为主 + 服务端做少量差异化（图片尺寸、区块裁剪、AB 分流）       | **当下的最佳实践折中**                     |
| **边缘计算分流**                | Cloudflare Workers / Vercel Edge / EdgeOne 按设备特征在 CDN 节点分流 | 新兴主流，延迟低                           |
| **SSR 条件渲染**                | Next.js/Nuxt 中间件读 UA → 渲染不同组件树                            | 现代框架常见做法                           |

### 7.2 客户端 / 工程侧

| 方案                     | 说明                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **路由级多端分流**       | `/pc/*` 与 `/m/*` 路由指向不同页面组件（Vue Router / React Router）                       |
| **组件级条件渲染**       | `useBreakpoint()` / `useMediaQuery()` 返回档位，渲染不同组件                              |
| **微前端多套并存**       | PC 子应用与 H5 子应用分别部署，网关按端分发                                               |
| **跨端框架一套码多端**   | uni-app、Taro、Remax — 编译期输出到 H5 / 小程序 / App（本质是"多端独立产物"的自适应思路） |
| **独立 H5 + 小程序矩阵** | 微信/支付宝小程序 + 移动 H5 + PC Web 各自独立，共享后端 API                               |
| **条件加载 / 代码分割**  | `matchMedia` + 动态 `import()`，按端加载不同 bundle                                       |

### 7.3 大屏可视化的特殊自适应

```js
// 等比缩放（transform scale），大屏项目的事实标准
function fitScreen(designW = 1920, designH = 1080) {
  const scale = Math.min(innerWidth / designW, innerHeight / designH);
  const el = document.querySelector("#screen");
  el.style.transform = `scale(${scale})`;
  el.style.transformOrigin = "left top";
  el.style.width = designW + "px";
  el.style.height = designH + "px";
}
addEventListener("resize", fitScreen);
fitScreen();
```

---

## 08 响应式与自适应如何选择

### 8.1 决策树

```
                    ┌─ PC 端与移动端的「信息架构/功能」是否差异巨大？
                    │
        ┌───────────┴───────────┐
        是                       否
        │                        │
  是否有极致性能要求？        → 响应式（RWD）
  （首屏秒开、弱网）              │
        │                   内容是否复杂需大量断点？
   ┌────┴────┐              ┌───┴───┐
   是         否            是       否
   │          │             │        │
 独立移动站   RESS/       响应式   纯弹性布局
 + 服务端     SSR 分流     + 容器查询  （Grid/Flex）
 动态服务     （混合）                 零断点
```

### 8.2 打分决策表

按你的项目给每一项打 1~5 分，**RWD 列总分高就选响应式，AWD 列总分高就选自适应**：

| 决策因素          | 倾向 RWD                     | 倾向 AWD                       | 你的得分 |
| ----------------- | ---------------------------- | ------------------------------ | -------- |
| 内容型 / 功能型   | 内容型（官网、博客、文档）   | 功能型（工具、后台、电商首页） |          |
| PC 与移动内容差异 | 基本一致                     | 差异巨大、信息优先级不同       |          |
| 预算与工期        | 有限、追求长期性价比         | 充足、可分端并行               |          |
| 迭代频率          | 高频，需一处改动全端生效     | 低频，版本稳定                 |          |
| SEO 重要性        | 高，需要 URL 统一与权重集中  | 可控，愿意维护 canonical       |          |
| 性能要求          | 可通过图片/懒加载优化        | 极致首屏，必须按端裁剪         |          |
| 已有资产          | 全新项目                     | 已有成熟 PC 站，需补移动端     |          |
| 未来设备覆盖      | 必须兼容折叠屏、车机等新形态 | 只服务已知几档设备             |          |

### 8.3 场景速查

| 场景                  | 首选                                          | 理由                                             |
| --------------------- | --------------------------------------------- | ------------------------------------------------ |
| 企业官网、品牌站      | **响应式**                                    | 内容统一、SEO 优先、维护成本低                   |
| 博客 / 文档 / 知识库  | **响应式**                                    | 单一内容源是刚需                                 |
| 新闻资讯门户          | **响应式为主**                                | 内容驱动，但可做 RESS 图片优化                   |
| 电商首页 / 商品详情   | **自适应（独立移动站）**                      | PC 与移动信息量差异巨大（淘宝模式）              |
| 后台管理系统          | **响应式（有限）**                            | 桌面优先，移动端仅做关键审批/查看，常配合独立 H5 |
| 移动端活动页 / 落地页 | **vw 或 rem 等比缩放**                        | 严格还原设计稿，周期短                           |
| SaaS 产品             | **混合**：响应式主体 + 移动端关键路径独立优化 | 兼顾维护成本与移动体验                           |
| 大屏可视化            | **等比缩放（scale）**                         | 固定设计稿比例                                   |
| 组件库 / 设计系统     | **容器查询 + 令牌**                           | 组件需在任何位置自洽                             |

### 8.4 结论

- **默认选响应式**。它是现代 Web 的基线能力，维护简便、SEO 友好、天然兼容未来设备。
- **在"分端体验差异巨大"的地方用自适应补位**，而不是全局切换。
- **现实中最常见的是混合方案**：整体响应式骨架 + 关键路由/关键组件的端级分流 + 服务端图片优化。

---

## 09 团队规范指南

> 本节面向非新手，可直接作为团队规范落地。

### 9.1 断点规范

```scss
// ✅ 断点集中定义，禁止散落魔法数字
// styles/tokens/breakpoints.scss
$bp: (
  sm: 40rem,
  // 640px
  md: 48rem,
  // 768px
  lg: 64rem,
  // 1024px
  xl: 80rem,
  // 1280px
  2xl: 96rem, // 1536px
);

@mixin up($name) {
  @media (width >= map-get($bp, $name)) {
    @content;
  }
}

.card {
  @include up(md) {
    display: flex;
  }
}
```

**硬性规则**：

1. 全项目**只允许**出现这几档断点；新增档位需评审。
2. 断点统一用 **`em`/`rem`（推荐 `em`，媒体查询中 `1em = 16px` 浏览器默认字号）**，不用 `px` — 用户改了浏览器默认字号时 px 断点会失效（见 [坑 5](#坑-5断点写死-px-导致用户放大字号时布局错乱)）。
3. 一律 **移动优先 + 单向 `min-width`**，禁止 `max-width` 与 `min-width` 混用。
4. 断点由内容决定，禁止写"iPhone 14 是 390 所以加个 390 断点"这种设备驱动断点。

### 9.2 单位规范

| 类别               | 规定                                 | 反例                      |
| ------------------ | ------------------------------------ | ------------------------- |
| 间距 / 尺寸 / 圆角 | `rem` 或设计令牌变量                 | `padding: 17px`           |
| 字号               | 令牌变量（内部 `clamp()`）           | `font-size: 15px`         |
| 边框               | `px`（1px 细线）                     | `border: 0.0625rem solid` |
| 媒体/容器尺寸      | `%` / `fr` / `auto`                  | 固定 `width: 350px`       |
| 全屏高度           | `dvh`（移动端）/`vh`（PC）           | 移动端 `height: 100vh`    |
| 长文本容器         | `max-width: 65ch`                    | 无限宽文本行              |
| 视口相关           | 必须与固定单位组合（`calc`/`clamp`） | `font-size: 3vw`          |

### 9.3 书写顺序规范

```css
/* 组件样式内部顺序：布局 → 尺寸 → 视觉 → 状态 → 断点（嵌套在最内层） */
.card {
  /* 1. 布局 */
  display: grid;
  gap: var(--space-3);
  /* 2. 尺寸 */
  inline-size: 100%;
  /* 3. 视觉 */
  background: var(--surface);
  border-radius: 8px;

  /* 4. 状态 */
  @media (hover: hover) {
    &:hover {
      box-shadow: var(--shadow-2);
    }
  }

  /* 5. 断点（就近嵌套，放最后） */
  @media (width >= 48rem) {
    grid-template-columns: 160px 1fr;
  }
}
```

### 9.4 图片与媒体规范

1. 所有 `<img>` 必须带 **`width` 与 `height` 属性**（或 CSS `aspect-ratio`），否则触发 CLS。
2. 首屏图片**不加** `loading="lazy"`（会拖慢 LCP）；首屏外一律加。
3. 内容图必须用 `srcset` + `sizes`；装饰图用 CSS 背景或 SVG。
4. 优先 WebP / AVIF，提供回退。
5. 图标一律用 **SVG / iconfont**，禁止位图图标（DPR 模糊）。

### 9.5 无障碍与交互规范

- 点击热区 ≥ **44×44px**（`pointer: coarse` 下强制）。
- hover 效果必须包在 `@media (hover: hover)` 内。
- 禁止 `user-scalable=no` / `maximum-scale=1`。
- 尊重 `prefers-reduced-motion`：动效需提供减弱版本。
- 键盘可达：隐藏的导航折叠后焦点不可落到 `display:none` 元素上（用 `hidden` 属性或 `inert`）。

### 9.6 性能预算

| 指标                | 目标                  |
| ------------------- | --------------------- |
| CLS（布局偏移）     | < 0.1                 |
| LCP（首屏最大内容） | < 2.5s                |
| INP（交互响应）     | < 200ms               |
| 移动端首屏 JS       | < 170KB（gzip）       |
| 单张图片            | < 200KB（移动端下发） |

### 9.7 目录与命名规范（推荐）

```
styles/
├─ tokens/
│   ├─ breakpoints.scss     # 唯一定断点的文件
│   ├─ spacing.scss         # clamp() 流式间距
│   └─ typography.scss      # clamp() 流式字号
├─ base/
│   ├─ reset.css
│   └─ base.css             # box-sizing / img max-width / 安全区变量
└─ utilities/
    └─ layout.css           # .grid-auto / .stack / .cluster 等布局原语
```

### 9.8 测试规范

必测视口（最低要求）：

```
320px（小屏手机） 375px（iPhone 基准） 768px（平板竖屏）
1024px（平板横屏/小笔电） 1280px（桌面） 1920px（大屏） 2560px+（超大屏）
```

必测条件：横竖屏切换、浏览器缩放 200%、系统深色模式、DPR=2/3、iOS 安全区、Android 键盘弹出。

---

## 10 避坑指南（27 个高频坑）

### 布局与断点类

#### 坑 1：忘记写 viewport meta

**症状**：手机上显示的是桌面版的缩小版，媒体查询全部失效。
**原因**：移动端浏览器默认视口宽度谎报为 980px。
**解决**：`<meta name="viewport" content="width=device-width, initial-scale=1">`，**必须**写在 `<head>`。

#### 坑 2：`100vw` 导致莫名横向滚动条

**原因**：`100vw` 包含滚动条宽度，而 `100%` 不包含。
**解决**：全宽元素用 `width: 100%`；确需视口单位时用 `100%` 配 `margin-inline: calc(50% - 50vw)`，或直接 `html { overflow-x: hidden; }` 兜底（不推荐作为首选）。

#### 坑 3：只用 `vw` 设定字号，破坏用户缩放

**原因**：纯 `vw` 的字号不随用户浏览器字号设置变化，无障碍不合格。
**解决**：`font-size: clamp(1rem, 0.5rem + 1vw, 2rem);` — `vw` 必须与 `rem`/`em` **相加**使用。

#### 坑 4：断点按设备而非内容设定

**症状**：为每个机型加断点，断点数量爆炸，仍总有设备显示不佳。
**解决**：拖动窗口找"内容开始难看"的位置加断点；设备尺寸表只作为初始值参考。

#### 坑 5：断点写死 px，导致用户放大字号时布局错乱

**原因**：`px` 断点不随根字号变化，`em` 断点会。
**解决**：媒体查询用 `em`（如 `@media (width >= 48em)`）。注意媒体查询中的 `em` 始终基于**浏览器默认字号 16px**，与 `html { font-size }` 无关。

#### 坑 6：`max-width` 与 `min-width` 混用造成断点缝隙或重叠

```css
/* ❌ 768px 处两者都不匹配，样式"漏空" */
@media (max-width: 767px) { ... }
@media (min-width: 769px) { ... }
```

**解决**：统一移动优先 + 单向 `min-width`，让断点天然连续覆盖。

#### 坑 7：`@media` 放在文件顶部，被后面的基础样式覆盖

**原因**：媒体查询**不提升优先级**，同权重下后写者胜。
**解决**：断点样式全部放在对应组件样式的**最后**（或用 CSS 嵌套写在组件内部）。

#### 坑 8：Flex 子项因 `min-width: auto` 撑破容器

**症状**：`flex: 1` 的子项里有长文本/长 URL，容器被撑开，出现横向滚动。
**解决**：

```css
.flex-item {
  min-width: 0;
} /* 关键 */
.long-text {
  overflow-wrap: anywhere;
}
```

#### 坑 9：Grid `1fr` 被子项内容撑破

**原因**：`1fr` 的最小值是 `auto`（即 `min-content`）。
**解决**：`grid-template-columns: minmax(0, 1fr) 20rem;`

#### 坑 10：`auto-fit` 网格在极窄屏溢出

**解决**：`repeat(auto-fit, minmax(min(100%, 260px), 1fr))` — `min()` 兜底。

#### 坑 11：`100vh` 在移动端超出/跳动

**原因**：移动端地址栏收放会改变可视高度，`vh` 取的是最大视口高度。
**解决**：`height: 100dvh;`（`dvh` = dynamic viewport height），并保留 `100vh` 作为回退：

```css
.hero {
  height: 100vh;
  height: 100dvh;
}
```

### 移动端专项类

#### 坑 12：1px 边框在高清屏上变粗

**解决**（三选一）：

```css
/* 方案 A：伪元素缩放（兼容性最好） */
.hairline {
  position: relative;
}
.hairline::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: #ddd;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}
/* 方案 B：高 DPR 用 0.5px */
@media (min-resolution: 2dppx) {
  .hairline {
    border-width: 0.5px;
  }
}
```

另：构建期的 px→rem/vw 换算插件**务必排除 `border-*`**（`propList: ['*', '!border*']`），否则边框会被换算成看不见的细线。

#### 坑 13：`position: fixed` 在移动端被键盘顶飞 / 抖动

**解决**：输入场景避免 `fixed` 底栏；或监听 `visualViewport` 的 `resize` 动态调整；表单页改用文档流布局。

#### 坑 14：rem 等比方案在 PC 大屏上失控

**症状**：设计稿 750 的移动端页面在 1920 屏幕上，文字和按钮巨大无比。
**解决**：

```js
const w = Math.min(document.documentElement.clientWidth, 640); // 限幅
document.documentElement.style.fontSize = (w / 750) * 100 + "px";
```

或干脆分端：PC 走断点布局，移动端走等比缩放。

#### 坑 15：vw 方案在平板/折叠屏上无限放大

**解决**：给最外层容器加 `max-width` + 居中：

```css
#app {
  max-width: 540px;
  margin-inline: auto;
} /* 超过手机宽度不再放大 */
```

#### 坑 16：Chrome 中文最小字号 12px，等比缩放后小字变成 12px 挤成一团

**解决**：设计稿中小于 12px 的中文文案要么改设计，要么用 `transform: scale()` 单独处理（注意 `transform` 不影响布局占位）。

#### 坑 17：iOS 回退（bfcache）后 rem 未重算

**解决**：`window.addEventListener('pageshow', e => e.persisted && setRem());`

#### 坑 18：刘海屏/底部小黑条遮挡内容

**解决**：

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

```css
.page {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

#### 坑 19：移动端点击 300ms 延迟 / 双击误缩放

**解决**：`button, a, [role="button"] { touch-action: manipulation; }`（配合正确的 viewport meta 已基本无需 FastClick）。

#### 坑 20：hover 样式在触摸设备上"粘住"

**解决**：`@media (hover: hover) and (pointer: fine) { .item:hover { ... } }`

### 性能与资源类

#### 坑 21：`display: none` 隐藏了元素，但资源照样加载

**症状**：移动端用 `display:none` 隐藏桌面大图，流量和加载时间一点没省。
**解决**：

- 图片用 `<picture>` / `srcset` 让浏览器只下载命中的那张；
- 模块用 JS 动态 `import()` 条件加载；
- 隐藏元素同时加 `inert` / 移出无障碍树。

#### 坑 22：图片未设尺寸导致 CLS

**解决**：`<img width="800" height="600">` 或 CSS `aspect-ratio: 4 / 3;`（浏览器据此预留空间）。

#### 坑 23：自适应多站点造成 SEO 重复内容

**解决**：

- 移动页 `<link rel="canonical" href="https://www.example.com/page">`
- 桌面页 `<link rel="alternate" media="only screen and (max-width: 640px)" href="https://m.example.com/page">`
- 服务端动态服务必须发 `Vary: User-Agent`，否则 CDN 会把移动版缓存给桌面用户（**串页事故**）。

#### 坑 24：UA 嗅探不可靠

**症状**：iPad 请求桌面站、折叠屏被判成手机、UA 新增机型未覆盖。
**解决**：优先用尺寸/能力探测（`matchMedia`、`ResizeObserver`、CSS 媒体查询），UA 只作为 SSR 首屏的兜底启发式。

### 认知升级类

#### 坑 25：把"屏幕尺寸"当成"视口尺寸"

**症状**：分屏、多窗口、折叠屏展开、车机屏下布局错乱。
**解决**：永远基于**视口**（`vw`/媒体查询）而非设备屏幕做决策；用容器查询让组件只关心自己的容器。

#### 坑 26：容器查询设了 `@container` 却不生效

**原因**：忘了给父级设 `container-type`。
**副作用提醒**：`container-type: inline-size` 会施加 **尺寸约束（size containment）**，元素尺寸将不再由内容撑开，必须显式给宽/高，否则可能塌陷。

```css
.wrapper {
  container-type: inline-size;
  inline-size: 100%;
} /* 宽度要显式给 */
```

#### 坑 27：只拖浏览器窗口做"响应式测试"

**症状**：评审通过，真机上一塌糊涂。
**解决**：真机 + 设备模拟器双测，覆盖 DPR 2/3、横竖屏、深色模式、系统字号 200%、iOS Safari 与 Android Chrome 双内核。

---

## 11 完整最小实践骨架

可直接作为新项目的起点：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <!-- 坑 1：viewport 必须有；不加 user-scalable=no（无障碍） -->
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover"
    />
    <title>响应式骨架</title>
    <style>
      /* ---------- 基线 ---------- */
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      img,
      svg,
      video {
        max-width: 100%;
        height: auto;
        display: block;
      }
      button,
      a {
        touch-action: manipulation;
      }

      /* ---------- 流式令牌（零断点） ---------- */
      :root {
        --space-3: clamp(12px, 0.75rem + 0.5vw, 20px);
        --space-5: clamp(24px, 1.5rem + 1.5vw, 48px);
        --text-body: clamp(14px, 0.875rem + 0.2vw, 16px);
        --text-h1: clamp(1.75rem, 1rem + 3vw, 3.5rem);
        --maxw: 1200px;
        --safe-b: env(safe-area-inset-bottom, 0px);
      }

      body {
        margin: 0;
        font:
          var(--text-body)/1.6 system-ui,
          sans-serif;
        padding: var(--space-3);
        padding-bottom: calc(var(--space-3) + var(--safe-b)); /* 坑 18 */
      }

      /* ---------- 骨架：Grid 自适应列数（坑 10 已用 min() 兜底） ---------- */
      .grid {
        display: grid;
        gap: var(--space-3);
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
        max-width: var(--maxw);
        margin-inline: auto;
      }

      /* ---------- 结构布局：少量断点 ---------- */
      .layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-3);
        max-width: var(--maxw);
        margin-inline: auto;
      }
      .sidebar {
        display: none;
      }
      @media (width >= 64rem) {
        /* 1024px，用 em 而非 px（坑 5） */
        .layout {
          grid-template-columns: 16rem minmax(0, 1fr);
        } /* 坑 9 */
        .sidebar {
          display: block;
        }
      }

      /* ---------- 卡片：容器查询（坑 26：父级必须设 container-type） ---------- */
      .card-list {
        container-type: inline-size;
        inline-size: 100%;
      }
      .card {
        display: grid;
        gap: 8px;
        padding: var(--space-3);
        border-radius: 8px;
      }
      @container (min-width: 420px) {
        .card {
          grid-template-columns: 140px minmax(0, 1fr);
        }
      }

      /* ---------- 交互：只在真鼠标设备加 hover（坑 20） ---------- */
      @media (hover: hover) and (pointer: fine) {
        .card:hover {
          box-shadow: 0 4px 16px rgb(0 0 0 / 0.12);
        }
      }

      /* ---------- 首屏高度（坑 11） ---------- */
      .hero {
        height: 60vh;
        height: 60dvh;
      }

      /* ---------- 深色模式 / 减弱动效 ---------- */
      @media (prefers-color-scheme: dark) {
        :root {
          color-scheme: dark;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <aside class="sidebar">侧栏（&lt;1024px 隐藏）</aside>
      <main>
        <h1 style="font-size: var(--text-h1)">标题</h1>
        <div class="card-list">
          <div class="grid">
            <article class="card">
              <img
                src="p-480.jpg"
                srcset="p-480.jpg 480w, p-800.jpg 800w, p-1600.jpg 1600w"
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 400px"
                width="400"
                height="300"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <p>卡片内容</p>
            </article>
          </div>
        </div>
      </main>
    </div>
  </body>
</html>
```

---

## 12 评审 Checklist

提交前逐项打勾：

**基线**

- [ ] `<head>` 中有 `viewport` meta，且**未**禁用缩放
- [ ] 全局 `box-sizing: border-box`
- [ ] `img/video/svg { max-width: 100%; height: auto; }`

**布局**

- [ ] 能用 `auto-fit/minmax`、`flex-wrap` 解决的，没有硬写媒体查询
- [ ] Grid 用 `minmax(0, 1fr)`，Flex 子项用 `min-width: 0`
- [ ] 断点来自集中定义文件，无散落魔法数字
- [ ] 断点用 `em`，且全部为单向 `min-width`（移动优先）
- [ ] 断点样式写在组件样式之后（或嵌套在内部）

**单位**

- [ ] 字号/间距用令牌，`clamp()` 内含固定单位（非纯 `vw`）
- [ ] 全宽元素不用 `100vw`；全屏高度用 `dvh`
- [ ] 等比缩放方案已做最大宽度/根字号限幅

**移动端**

- [ ] 1px 边框已处理（且换算插件排除了 border）
- [ ] 刘海屏安全区已处理（`viewport-fit=cover` + `env()`）
- [ ] 点击热区 ≥ 44×44px
- [ ] hover 包在 `@media (hover: hover)` 内
- [ ] 无 `position: fixed` 与键盘冲突问题

**性能**

- [ ] 图片有 `width/height` 或 `aspect-ratio`（防 CLS）
- [ ] 内容图用 `srcset`/`sizes`/`<picture>`
- [ ] 首屏图未加 `loading="lazy"`，首屏外已加
- [ ] 隐藏元素未造成无用资源加载（已改条件加载）

**测试**

- [ ] 320 / 375 / 768 / 1024 / 1280 / 1920px 全部过一遍
- [ ] 横竖屏、缩放 200%、深色模式、DPR=2 已测
- [ ] iOS Safari + Android Chrome 真机或模拟器已测
- [ ] Lighthouse CLS < 0.1

**自适应项目额外项**

- [ ] 多站点/多模板已配 `canonical` + `alternate`
- [ ] 服务端已发 `Vary: User-Agent`（若用动态服务）

---

## 13 参考资料

[1. MDN — 响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
[2. MDN — 媒体查询](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Media_queries)
[3. MDN — 响应式图片](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Guides/Responsive_images)
[4. 徐龙博客 — 响应式网站与自适应网站的技术对比与选型建议](https://www.xu-long.com/responsive-vs-adaptive-website-technology-comparison-selection-guide/)
[5. 掘金 — 响应式和自适应的区别](https://juejin.cn/post/6932649153268809736)
[6. Pixso — 响应式设计与自适应网页设计](https://pixso.cn/designskills/responsive-design-and-adaptive-web-design/)
[7. 博客园 — 说说响应式设计和自适应设计的区别](https://www.cnblogs.com/ai888/p/18569746)
[8. 技术栈 — 前端适配方案深度解析:从响应式到自适应设计](https://jishuzhan.net/article/1932024834636165122)
[9. 腾讯云开发者社区 — 技术百科](https://cloud.tencent.com/developer/techpedia/1876)
[10. 腾讯 CoDesign — 全面解析｜自适应与响应式网页设计的区别与应用](https://codesign.qq.com/hc/article/responsive-web-design/)
[11. 前端三剑客 — 布局 / 响应式布局](https://baimohui.github.io/前端三剑客/CSS/布局/响应式布局/)
[12. 百度开发者中心 — 响应式网页设计:构建全设备兼容的现代 Web 方案](https://developer.baidu.com/article/detail.html?id=5637371)
