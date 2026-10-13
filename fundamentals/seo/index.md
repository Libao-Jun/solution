# SEO 全流程知识手册（Search Engine Optimization）

> 参考资料：
>
> - [htmlpage.cn — SEO 完整指南](https://htmlpage.cn/topics/seo/seo-complete-guide)
> - [TED 知识体系 — SEO 解决方案](https://books.tedshen.cn/docs/解决方案/SEO解决方案/SEO)
> - [Ahrefs — SEO 学习中心（中文）](https://ahrefs.com/zh/seo/)
> - [好 SEO — 技术 SEO 博客](https://www.uhaoseo.com/blog/technical-seo)
> - [ordinary-coder — SEO 优化](https://libao-jun.github.io/ordinary-coder/docs/seo/seo.html#seo-优化)
>
> 面向角色：初中级到高级前端工程师。本文按「总览 → 技术 SEO → 渲染模式与 JavaScript SEO → 元数据与社交分享 → 体验信号 → 内容语义化 → 工程化落地 → 站外权威 → 数据驱动 → 坑点与 Checklist」展开，覆盖一个前端高级工程师必须掌握的 SEO 关键知识点与完整工程流程。HTTP 状态码与缓存见 [HTTP / HTTPS 核心知识手册](/fundamentals/http/)，体验指标（LCP / INP / CLS）的工程优化见 [前端性能优化知识手册](/fundamentals/front-end-performance/)，浏览器渲染管线见 [浏览器核心知识手册](/fundamentals/browser/)，语义化标签见 [HTML5 知识指南](/fundamentals/html5/)，响应式适配见 [响应式与自适应设计](/engineering/responsive-vs-adaptive/)——本文聚焦「搜索引擎怎么看页面、前端怎么把页面做给爬虫看」。
>
> **只想把自己的网站 / 博客按流程做对 SEO、不知道从哪下手？** 直接跳到 [第十一章：实战落地流程](#十一、实战落地流程-从配置到上线的完整闭环)——它按「配置 → 本地验证配置是否生效 → 发布 → 上线复验」给出一条可照做的闭环，并附「上线前必做配置清单」与「配置没生效怎么排查」。

---

## 目录

1. [SEO 总览：定义、原理与前端职责](#一、seo-总览-定义、原理与前端职责)
2. [技术 SEO：让爬虫找得到、读得懂、信得过](#二、技术-seo-让爬虫找得到、读得懂、信得过)
3. [渲染模式与 JavaScript SEO：SPA 的生死线](#三、渲染模式与-javascript-seo-spa-的生死线)
4. [页面元数据与社交分享：TDK 与 Open Graph](#四、页面元数据与社交分享-tdk-与-open-graph)
5. [页面体验信号：Core Web Vitals 与移动友好](#五、页面体验信号-core-web-vitals-与移动友好)
6. [内容结构与时语义化 HTML：On-page SEO](#六、内容结构与时语义化-html-on-page-seo)
7. [前端工程化落地：把 SEO 写进构建链路](#七、前端工程化落地-把-seo-写进构建链路)
8. [站外 SEO 与权威建设：Off-page](#八、站外-seo-与权威建设-off-page)
9. [数据驱动：监控、分析与诊断](#九、数据驱动-监控、分析与诊断)
10. [常见坑、反模式与上线前 Checklist](#十、常见坑、反模式与上线前-checklist)
11. [实战落地流程：从配置到上线的完整闭环](#十一、实战落地流程-从配置到上线的完整闭环)

---

## 一、SEO 总览：定义、原理与前端职责

### 1.1 什么是 SEO

搜索引擎优化（Search Engine Optimization，SEO）是一组通过改善网站**可被抓取、可被理解、可被信任、可被推荐**的程度，从而提升在自然搜索结果中排名与流量的技术与内容实践。它区别于 SEM（Search Engine Marketing，付费投放）——SEO 追求的是「不花钱买排名」的自然流量增长。

对前端而言，SEO 不是「写完页面再补几个 meta 标签」，而是从**架构选型、渲染方式、资源加载、URL 设计**开始就要参与的工程命题。

### 1.2 搜索引擎的工作流程：抓取 → 索引 → 排名

搜索引擎（以 Google / Bing 为代表）对网页的处理可归纳为三个核心阶段：

| 阶段       | 英文          | 做什么                                                                       | 前端最容易踩坑的地方                         |
| ---------- | ------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| 抓取       | Crawling      | 爬虫（Googlebot / Bingbot）沿链接发现 URL，下载 HTML / 资源                   | JS 渲染导致首屏无内容、被 robots 拦截、死链 |
| 索引       | Indexing      | 解析内容、理解语义、存入检索库（含渲染后的 DOM）                             | 内容藏在事件后、重复内容无 canonical        |
| 排名       | Ranking       | 按数百个信号（相关性、权威、体验）对查询排序                                 | 体验指标差、内容薄、无结构化数据             |

> 关键认知：**爬虫看到的页面 ≠ 用户看到的页面**。如果重要内容只存在于「点击后才请求的数据」或「必须执行 JS 才出现的 DOM」，爬虫可能完全抓不到——这正是前端 SEO 的核心矛盾。

### 1.3 为什么前端工程师必须懂 SEO

- **框架默认不利于 SEO**：Vue / React 默认 CSR（客户端渲染），首屏 HTML 是空壳，爬虫拿不到正文。
- **性能即排名**：Core Web Vitals 是 Google 官方排名信号，而指标优化在前端手里。
- **元信息是排名入口**：`title` / `description` / `canonical` / 结构化数据，决定搜索结果怎么展示、有没有富媒体样式。
- **URL 与重定向一旦上线难改**：错误的重定向链、重复 URL 会长期稀释权重。

### 1.4 前端在 SEO 中的职责边界

前端负责「技术可达性 + 体验 + 结构化」这部分；关键词策略、外链建设、内容创作通常由增长 / 内容团队负责。但前端要**为这些策略提供落地能力**：可索引的 URL、稳定的渲染、可被爬虫读取的结构化数据。

---

## 二、技术 SEO：让爬虫找得到、读得懂、信得过

### 2.1 可抓取性：robots.txt 与元指令

`robots.txt` 放在站点根目录，用 `User-agent` 与 `Disallow` / `Allow` 告诉爬虫哪些路径可抓：

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$

Sitemap: https://example.com/sitemap.xml
```

页面级用 `<meta>` 元指令（比 robots.txt 更精确，但爬虫必须「先抓到页面」才能读到）：

```html
<!-- 禁止索引且禁止跟随出站链接 -->
<meta name="robots" content="noindex, nofollow" />
<!-- 仅禁止索引，但允许发现页内链接 -->
<meta name="robots" content="noindex, follow" />
```

> `robots.txt` 是「建议」而非强制；敏感内容必须靠鉴权，不能靠 `Disallow` 保密。

### 2.2 XML Sitemap：告诉搜索引擎有什么

Sitemap 是一份 URL 清单，帮助爬虫发现你的重要页面（尤其深链、孤立页）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/fundamentals/seo/</loc>
    <lastmod>2026-10-13</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

`priority` 仅作相对提示，搜索引擎并不严格按它排序；`lastmod` 应反映真实更新时间。Sitemap 提交入口在 Search Console / Bing Webmaster Tools。

### 2.3 URL 规范与 canonical：消除重复内容

同一份内容若可通过多个 URL 访问（带参、大小写、http/https、www 与非 www），会被判定为**重复内容**，稀释排名权重。用 `<link rel="canonical">` 指定「唯一真身」：

```html
<link rel="canonical" href="https://example.com/fundamentals/seo/" />
```

规范要点：

- 全站统一 `www` 或非 `www`、`https` 或 `http` 其一（用 301 重定向收口）。
- 分页、筛选、排序参数优先用 `canonical` 指回聚合页，或用 `robots` 屏蔽，避免参数爆炸。
- canonical 必须**是真实可访问的 URL**，不能是 404 / 5xx。

### 2.4 状态码与重定向：200 / 301 / 302 / 404 / 410

| 状态码 | 语义                 | SEO 含义                                                    |
| ------ | -------------------- | ----------------------------------------------------------- |
| 200    | 正常                 | 可索引                                                      |
| 301    | 永久重定向           | 权重**传递**到目标 URL（改版、合并页面用）                  |
| 302    | 临时重定向           | 权重**不传递**（仅临时跳转，勿用于永久迁移）                |
| 404    | 未找到               | 正常「不存在」信号；长期存在的软 404 会被降权               |
| 410    | 已永久删除           | 明确告诉爬虫「别再来了」，比 404 更快从索引移除             |

重定向链要**短**：`A → B → C` 应改成 `A → C`，每多一跳都浪费抓取预算与加载时间。详见 [HTTP / HTTPS 核心知识手册](/fundamentals/http/)。

### 2.5 HTTPS 与安全信号

HTTPS 是 Google 的轻量排名信号，也是现代浏览器的「安全上下文」前提（Service Worker、地理定位等能力都要求 HTTPS）。务必：

- 全站 301 从 http 跳 https；
- 证书有效且覆盖所有子域；
- 混合内容（HTTPS 页里加载 HTTP 资源）会触发浏览器警告并影响体验评分。

### 2.6 结构化数据（Schema.org / JSON-LD）

结构化数据用 [Schema.org](https://schema.org) 词汇表标注页面实体（文章、商品、FAQ、面包屑、组织等），让搜索引擎生成**富媒体结果**（星级、价格、问答折叠）。推荐 **JSON-LD**（放在 `<head>` 或 `<body>`，不与渲染耦合）：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "SEO 全流程知识手册",
  "description": "前端工程师必须掌握的 SEO 全流程知识。",
  "author": { "@type": "Person", "name": "Libao-Jun" },
  "datePublished": "2026-10-13",
  "publisher": {
    "@type": "Organization",
    "name": "Solution",
    "logo": { "@type": "ImageObject", "url": "https://example.com/icon.svg" }
  }
}
</script>
```

> 本站（VitePress）已通过 `transformHead` 的 `buildSeoHead` 为每个文档页自动注入 `TechArticle` 型 JSON-LD 与 `canonical` / `og:*`，无需手写——但自定义页面类型（商品、FAQ）需自行补充。

### 2.7 多语言与国际化（hreflang）

多语言 / 多地区站点用 `hreflang` 告诉爬虫「这个 URL 对应哪种语言 / 地区」，避免被当作重复内容，并让正确语言版本进入对应地区搜索结果：

```html
<link rel="alternate" hreflang="zh-CN" href="https://example.com/zh/seo/" />
<link rel="alternate" hreflang="en" href="https://example.com/en/seo/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/seo/" />
```

`hreflang` 必须**成对互指**（A 指向 B，B 也要指回 A），否则会被忽略。

---

## 三、渲染模式与 JavaScript SEO：SPA 的生死线

### 3.1 CSR / SSR / SSG / 预渲染 对比

| 模式            | 首屏 HTML                     | 爬虫可见度       | 适用                         |
| --------------- | ----------------------------- | ---------------- | ---------------------------- |
| CSR（客户端渲染） | 空壳 + JS 加载后填充          | 依赖渲染能力     | 后台、强交互、无需索引的页面 |
| SSR（服务端渲染） | 服务端直出完整 HTML           | 好               | 内容站、电商、需首屏 SEO     |
| SSG（静态生成）   | 构建期生成静态 HTML           | 最好             | 文档、博客、营销页           |
| 预渲染（Prerender）| 构建/运行时对爬虫吐静态快照   | 好（仅爬虫）     | 既有 SPA 改造、中等规模      |

### 3.2 搜索引擎如何渲染 JS

现代 Googlebot 基于 Chromium，**能执行 JavaScript** 并完成「抓取 → 渲染队列 → 二次抓取执行 JS 后的 DOM」。但存在代价与风险：

- 渲染是**异步、有延迟**的，索引可能比纯 HTML 慢数天；
- 依赖客户端数据请求（接口）时，若接口被 robots 屏蔽 / 需登录 / 跨域受限，内容仍抓不到；
- 资源体积过大、JS 报错会导致渲染失败，正文丢失。

> 结论：**不要假设爬虫一定能渲染你的 JS**。把关键内容、链接、元信息尽量放进「首屏直出的 HTML」最稳。

### 3.3 动态渲染与混合方案

对已有 CSR 项目，常用过渡方案：

- **动态渲染（Dynamic Rendering）**：对爬虫 UA 返回预渲染的静态 HTML，对用户返回正常 SPA（注意 Google 已不推荐长期依赖，仅作过渡）。
- **关键内容服务端注水**：用 SSR / SSG 让首屏与核心内容直出，交互再 hydrate。

### 3.4 流式 SSR 与 SEO 友好输出

现代框架（Nuxt / Next / 自定义 Vue SSR）支持流式输出与 `<Suspense>`，让首屏 HTML 尽快到达。SEO 友好的 SSR 输出应满足：

- `<title>` / `description` / `canonical` 在 HTML `<head>` 中直出（不要等 JS 设）；
- 正文文本在 HTML 中可见（不要用「点击展开才渲染」承载核心内容）；
- 内部链接是真实 `<a href>`，而非 JS 路由拦截后无降级。

---

## 四、页面元数据与社交分享：TDK 与 Open Graph

### 4.1 Title / Description / Keywords

`<title>` 是最重要的单页排名信号之一，要**唯一、准确、带核心词、≤ 60 字符**；

```html
<title>SEO 全流程知识手册 | 前端解决方案手册</title>
<meta name="description" content="前端工程师必须掌握的 SEO 全流程：技术 SEO、JavaScript 渲染、Core Web Vitals、结构化数据与工程化落地。" />
```

`description` 不直接参与排名，但影响搜索结果的**点击率（CTR）**；`keywords` 现代搜索引擎基本忽略，可省略。标题层次见 [HTML5 知识指南](/fundamentals/html5/)。

### 4.2 Open Graph 与 Twitter Card

社交分享卡片由 Open Graph（OG）与 Twitter Card 驱动，决定链接在微信 / Twitter / Slack 等场景的预览样式：

```html
<meta property="og:type" content="article" />
<meta property="og:title" content="SEO 全流程知识手册" />
<meta property="og:description" content="前端工程师的 SEO 全流程指南。" />
<meta property="og:url" content="https://example.com/fundamentals/seo/" />
<meta property="og:image" content="https://example.com/cover.png" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="SEO 全流程知识手册" />
<meta name="twitter:image" content="https://example.com/cover.png" />
```

`og:image` 建议 1200×630，否则分享卡片被压缩。

### 4.3 前端框架中的元信息管理

SPA 下需用库统一管理 `<head>`：

- **Vue 生态**：`@vueuse/head` 或 `unhead`，在组件内 `useHead({ title, meta })`；
- **React 生态**：`react-helmet-async`（并发安全）；
- **Nuxt / Next**：内置 `useHead` / `next/head`，并支持 SSR 直出。

> 注意：库设的元信息在 CSR 下是「JS 执行后才改 DOM」，爬虫若不强渲染就看不到。需 SEO 的页面务必走 SSR/SSG 让元信息进首屏 HTML。

---

## 五、页面体验信号：Core Web Vitals 与移动友好

### 5.1 LCP / INP / CLS

Google 的Core Web Vitals（核心网页指标）是正式排名信号：

| 指标 | 含义                       | 良好阈值     | 前端抓手                                   |
| ---- | -------------------------- | ------------ | ------------------------------------------ |
| LCP  | 最大内容绘制（首屏主元素） | ≤ 2.5s       | 图片/字体预加载、SSR 直出、CDN、关键 CSS   |
| INP  | 交互到下次绘制（响应）     | ≤ 200ms      | 拆长任务、防主线程阻塞、事件委托           |
| CLS  | 累积布局偏移（视觉稳定）   | ≤ 0.1        | 图片/广告预留尺寸、字体 `size-adjust`      |

详细优化手段见 [前端性能优化知识手册](/fundamentals/front-end-performance/)。

### 5.2 移动端适配与响应式

移动优先索引（Mobile-first Indexing）下，Google 主要用**移动版**评估排名。要点：

- 视口 `width=device-width` 必须设置；
- 用响应式而非「独立 m 站」（避免两套 URL 的 canonical 复杂度）；
- 可点区域 ≥ 48×48px，文字可读、无横向滚动。
- 详见 [响应式与自适应设计](/engineering/responsive-vs-adaptive/)。

### 5.3 其他体验因素

- **安全浏览**：无恶意软件、无欺诈；
- **HTTPS**：见 §2.5；
- **无侵入式插页广告**：全屏弹窗（尤其移动端）会受惩罚；
- **可访问性（a11y）**：语义化与对比度间接影响体验与留存。

---

## 六、内容结构与时语义化 HTML：On-page SEO

### 6.1 标题层次与语义标签

正确使用标题层级（H1 唯一、H2 分段、H3 细化）既是可读性也是排名信号：

```html
<h1>SEO 全流程知识手册</h1>
  <h2>技术 SEO</h2>
    <h3>robots.txt 与元指令</h3>
```

语义标签（`<article>` / `<nav>` / `<main>` / `<section>`）帮助爬虫理解页面结构；`<img alt>` 是图片的「文字替代」，既是 a11y 也是图片搜索入口。语义化细节见 [HTML5 知识指南](/fundamentals/html5/)。

### 6.2 内部链接与锚文本

内部链接传递权重、帮助爬虫发现全站、提供上下文：

- 用**描述性锚文本**（「前端性能优化」优于「点击这里」）；
- 保证重要页面从首页 / 导航 ≤ 3 次点击可达；
- 避免「孤儿页」（无任何入链）；
- 用面包屑（`BreadcrumbList` 结构化数据）强化层级。

### 6.3 图片与媒体 SEO

- 文件名有含义（`seo-flow.svg` 优于 `img01.png`）；
- 必填 `alt`，装饰图用空 `alt=""` 让屏幕阅读器跳过；
- 现代格式（WebP / AVIF）+ 响应式 `srcset` 兼顾体积与清晰度；
- 用 `loading="lazy"`（首屏外）与 `fetchpriority="high"`（主图）优化加载。

---

## 七、前端工程化落地：把 SEO 写进构建链路

### 7.1 构建期预渲染（prerender / SSG）

对内容站，优先 SSG：构建期把每个路由渲染成静态 HTML，部署即「首屏直出」。VitePress、Astro、Next `output: export`、Nuxt `ssr` 都属此类。对既有 Vite + Vue/React SPA，可加 `vite-plugin-ssr` 或 `@prerenderer/prerenderer` 在构建期生成快照。

### 7.2 元信息管理方案

统一在应用层管理元信息，避免散落硬编码：

```ts
// Vue + @vueuse/head 示例
import { useHead } from '@vueuse/head'

useHead({
  title: 'SEO 全流程知识手册',
  meta: [
    { name: 'description', content: '前端工程师的 SEO 全流程指南。' },
    { property: 'og:title', content: 'SEO 全流程知识手册' },
  ],
  link: [{ rel: 'canonical', href: 'https://example.com/fundamentals/seo/' }],
})
```

### 7.3 Vite / Vue / React 的 SEO 配置要点

- **路由用 History 模式 + 服务端 fallback**：让每个深链都有真实 URL（Hash 路由 `#/x` 不利于索引）；
- **预连接与预加载关键资源**：`<link rel="preconnect" href="https://fonts.gstatic.com">` 等；
- **生成 sitemap**：用 `vite-plugin-sitemap` 或构建脚本从路由表产出；
- **SSR 下的状态注水**：避免 CSR 再发一次请求导致内容闪烁 / 重复。

### 7.4 常见框架 SEO 陷阱

- **SPA 首屏空壳**：核心内容靠 JS 渲染，爬虫抓不到；
- **无限滚动无分页 / 无 `<a>`**：内容不可达；
- **`#` 锚点做路由**：URL 不干净、不索引；
- **SSR 但元信息在客户端设**：`<title>` 延迟出现；
- **重复渲染两套 canonical**：自相矛盾被忽略。

---

## 八、站外 SEO 与权威建设：Off-page

### 8.1 外链与权威性

外链（Backlink）是经典的权威信号：来自高权重、相关主题站点的自然链接，会提升目标页排名。前端能做的：

- 提供**可嵌入、可引用**的内容（代码片段、图表、API 文档）吸引自然外链；
- 规范 `canonical` 防止镜像站稀释；
- 用 `rel="nofollow"` / `ugc` / `sponsored` 标注用户生成与付费链接，避免被误判操纵排名。

### 8.2 品牌与口碑信号

品牌词搜索量、被提及次数（即便无链接）等「实体信号」逐渐被纳入排名。前端可配合：统一的 `Organization` 结构化数据、站点一致的品牌信息、社交分享卡片的正确配置。

---

## 九、数据驱动：监控、分析与诊断

### 9.1 Google Search Console / Bing Webmaster

免费且必备：

- **覆盖率报告**：哪些 URL 被索引 / 被排除（noindex、canonical 指向其他、404）；
- **核心网页指标报告**：真实用户（CrUX）的 LCP / INP / CLS；
- **搜索效果**：展示量、点击量、CTR、平均排名，按页面 / 查询下钻；
- **URL 检查**：单页的抓取 / 索引 / 渲染诊断。

### 9.2 流量与排名分析

- 用 GA4 / Plausible 等看自然搜索流量趋势与落地页表现；
- 跟踪目标关键词排名（Ahrefs / Semrush 等第三方）；
- 关注 CTR：标题 / 描述写得好，排名不变也能涨流量。

### 9.3 日志分析与抓取预算

对大型站点，分析爬虫访问日志：

- 爬虫是否花大量预算在低效 URL（筛选参数、分页）上？
- 用 `robots.txt` / `noindex` / `canonical` 把预算导向重要页；
- 监控「被抓取但未索引」的比例，排查内容质量 / 渲染问题。

---

## 十、常见坑、反模式与上线前 Checklist

### 10.1 高频坑点

| 坑                                   | 后果                                   | 正确做法                                   |
| ------------------------------------ | -------------------------------------- | ------------------------------------------ |
| SPA 首屏无直出 HTML                  | 正文不被索引                           | SSR / SSG / 预渲染                        |
| 全站 `noindex` 误配                  | 整站消失                               | 仅对后台 / 测试环境 `noindex`             |
| canonical 指向自己 404 的页          | 权重丢失                               | canonical 必须 200 可达                    |
| 重定向链过长（A→B→C）                | 抓取预算浪费、变慢                     | 直连最终目标                               |
| 用 302 做永久迁移                    | 权重不传递                             | 用 301                                     |
| 图片无 `alt` / 文件名随机            | 图片搜索零流量                         | 语义文件名 + 描述性 alt                    |
| 标题堆砌关键词                       | 被判作弊、降权                         | 自然、唯一、可读                           |
| 移动端全屏弹窗                       | 受干预广告惩罚                         | 延迟 / 可关闭 / 不挡内容                   |
| Hash 路由                            | URL 不索引                             | History 模式 + 服务端 fallback             |

### 10.2 上线前 SEO Checklist

- [ ] 重要页面走 SSR / SSG，首屏 HTML 含核心文本与链接；
- [ ] `<title>` 唯一、`description` 准确、`canonical` 指向真身；
- [ ] `robots.txt` 放行关键路径，含 `Sitemap:` 声明；
- [ ] `sitemap.xml` 已生成并提交 Search Console / Bing；
- [ ] 全站 https、无混合内容、www 或非 www 统一（301）；
- [ ] 关键页面注入 JSON-LD（TechArticle / BreadcrumbList 等）；
- [ ] 多语言用 `hreflang` 成对互指；
- [ ] 图片 `alt` + 现代格式 + 响应式 `srcset`；
- [ ] Core Web Vitals（LCP / INP / CLS）达标；
- [ ] 内部链接可达、无孤儿页、锚文本描述性；
- [ ] 社交分享卡片（OG / Twitter）配置正确，`og:image` 尺寸达标；
- [ ] Search Console 覆盖率无异常、无「被排除」的重要页。

> 把以上能力固化进构建与发布流程（CI 校验 sitemap、Lighthouse CI 卡 Core Web Vitals、上线前跑 Search Console URL 检查），才能让 SEO 从「一次性补丁」变成「工程常态」。

---

## 十一、实战落地流程：从配置到上线的完整闭环

前面十章是「知识」，这一章是「动作」。如果你要给自己的网站 / 博客做 SEO，照着下面四个阶段走：**配置 → 本地验证配置是否生效 → 发布 → 上线复验**。每一个阶段都给出「做到什么程度算完成」，避免「配了一堆但不知道有没有用」。

### 11.1 先想清楚：你要优化什么、现状如何

动手前先回答三个问题，避免方向错：

1. **目标是什么**：内容站 / 博客 → 要自然搜索流量与收录；电商 → 商品页曝光与排名；工具站 → 品牌词与功能页可达。
2. **现状盘点**（用 `site:你的域名` 在搜索引擎查收录，或看 Search Console）：
   - 页面现在是 CSR 还是 SSR / SSG？`view-source:` 看首屏有没有正文；
   - 有没有被收录？有没有 Search Console / Bing Webmaster 账号？
   - 有没有 `sitemap.xml` / `robots.txt`？
3. **定 KPI**：展示量（Impressions）、点击量（Clicks）、平均排名、核心词排名、Core Web Vitals（LCP / INP / CLS）。

> 新手常见误区：一上来就堆关键词、买外链。先把「能被抓取、能被索引、体验达标」这三件基础做对，收益最大也最稳。

### 11.2 阶段一：配置（上线前把基础打牢）

下面是一份「上线前必做配置清单」，按「配置项 → 在哪配 → 怎么验证生效」三列给出，逐项打勾即可：

| 配置项                     | 在哪配 / 用什么                                                            | 怎么验证生效（详见 §11.3）                              |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| 渲染模式                   | 选 SSG（博客 / 文档站，如 VitePress / Astro / Next `output: export`）或 SSR | `view-source:` 首屏 HTML 含核心文本与链接               |
| `robots.txt`               | 站点根目录放静态文件，放行关键路径 + 声明 `Sitemap:`                       | 浏览器访问 `域名/robots.txt` 看到内容                   |
| `sitemap.xml`              | 构建生成（`vite-plugin-sitemap` / 框架插件 / 脚本从路由表产出）            | 访问 `域名/sitemap.xml`；提交 Search Console            |
| `canonical`                | 每页 `<link rel="canonical">`，SSR 直出真身 URL                            | `view-source:` 含正确且 200 可达的 URL                  |
| `title` / `description`    | 元信息库（Vue `@vueuse/head` / React `react-helmet-async`），SSR 直出       | `view-source:` 含 `<title>` 与 `description`            |
| Open Graph / Twitter Card | 同上，配 `og:*` / `twitter:*` + `og:image`(1200×630)                       | `view-source:` 含；社交调试器预览卡片正确               |
| 结构化数据 JSON-LD         | 页面注入 `TechArticle` / `BreadcrumbList` / `FAQPage` 等                   | Google Rich Results Test 无错误                         |
| HTTPS + 域名统一           | 托管 / 服务器 301：http→https、www↔非 www 取其一                          | `curl -I` 看到 301 且最终为 https                      |
| 多语言 `hreflang`          | 有国际化时才配，`<link rel="alternate" hreflang>` 成对互指                 | `view-source:` 含且 A↔B 互指                           |
| 体验优化                   | 预连接关键域名、图片尺寸占位、`font-size-adjust`、响应式 `srcset`          | Lighthouse 的 LCP / INP / CLS 达标                      |

> 核心原则：**所有「会被爬虫先读」的东西（正文、title、canonical、sitemap、结构化数据）都必须进首屏直出的 HTML**，不能等 JS 执行后才出现——详见第三章。

### 11.3 阶段二：本地测试（配置到底生没生效，先自己验）

**这一步最关键，也最容易被跳过。** 很多人的「配了没用」其实是「配置只在浏览器渲染后才有，爬虫视角根本看不到」。

**① 用「爬虫视角」看页面，而不是 DevTools**

DevTools 里看到的 DOM 是 JS 执行后的结果；爬虫（尤其不渲染 JS 的）看到的是「原始 HTML」。验证必须抓**原始 HTML**：

```bash
# 先起本地预览（本仓库：pnpm run build && pnpm run preview；其它框架用各自 serve）
# 再用 curl 抓「未渲染」的纯 HTML，看关键元信息是否已直出
curl -s http://localhost:4173/fundamentals/seo/ | grep -E \
  '<title>|<link rel="canonical"|<meta name="description"|<script type="application/ld\+json"'
```

- 如果你看到 `title` / `canonical` / 正文都在 → 配置直出成功；
- 如果 `grep` 什么都抓不到、或只看到 `<div id="app"></div>` 空壳 → 说明是纯 CSR，**爬虫拿不到内容**，必须改 SSR / SSG / 预渲染（见 §3、§7）。

> 小技巧：浏览器里 `view-source:域名/路径` 看到的就是爬虫拿到的原文，比 DevTools 更可信。

**② 结构化数据校验**

把页面 URL 或 JSON-LD 贴到 [Google Rich Results Test](https://search.google.com/test/rich-results)（或本地 schema 校验器），确认无语法错误、富媒体字段被正确识别。

**③ 体验指标**

本地或 CI 跑 Lighthouse / PageSpeed Insights，确认 LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1：

```bash
npx lighthouse http://localhost:4173/fundamentals/seo/ --only-categories=performance,seo,best-practices
```

**④ 社交卡片预览**

把链接贴到调试器自测：Facebook Sharing Debugger、Twitter Card Validator、微信「公众号文章卡片」自测——确认标题 / 描述 / 封面图正确。

**⑤ 死链与锚点**

本仓库构建已用 `ignoreDeadLinks` 放行站内死链（便于写作），但上线前建议跑一次链接检查（如 `markdown-link-check` 或框架插件），确保没有 404 的内部链接、锚点可跳转。

### 11.4 阶段三：发布

- **部署到静态托管 / 服务器**：GitHub Pages、Vercel、Netlify、对象存储 + CDN 等；
- **确认绝对地址正确**：`canonical` / `sitemap` / `og:url` 必须指向**线上域名**（CI 下 `base` 与 `siteUrl` 切换，见本站 `config.mts` 的 `base` / `siteUrl` 机制），否则会把 localhost 写进搜索引擎；
- **配置 301 重定向**：http→https、`www`↔非 `www`、旧路径迁移，全部用 301（不要用 302，见 §2.4）；
- **把校验固化进 CI**：sitemap 自动生成、Lighthouse CI 卡 Core Web Vitals、构建期校验元信息——让 SEO 成为「每次发布自动保证」，而不是手动补丁。

### 11.5 阶段四：上线后验证（发布 ≠ 完成）

发布后还要确认「搜索引擎真的收到了、且收对了」：

1. **提交 sitemap**：在 Google Search Console、Bing Webmaster Tools 的「sitemap」处提交 `域名/sitemap.xml`；
2. **URL 检查**：在 Search Console 贴具体 URL，看「抓取 / 索引 / 渲染」是否正常，可手动「请求编入索引」加速新站收录；
3. **查收录**：用 `site:你的域名/具体路径` 看是否已出现在结果中（新站通常要几天到几周）；
4. **监控覆盖率报告**：重点看有没有重要页被「排除」（常见原因：`noindex` 误配、canonical 指向别人、404）；
5. **看真实体验**：CrUX 的 Core Web Vitals 报告需要积累真实用户数据，上线一段时间后才准确；
6. **看搜索效果**：Search Console 的「搜索效果」报告看展示量 / 点击量 / CTR / 平均排名，按页面与查询下钻；
7. **社交自测**：把链接真正发出去（微信 / Twitter 等），确认卡片展示符合预期。

### 11.6 最小可行流程（MVP）：只想先把博客做对

如果时间紧，按这条精简路径就够覆盖 80% 收益：

1. 用 **SSG** 框架（VitePress / Astro / Hugo / Next `output: export）生成静态站；
2. 构建期**自动生成 `sitemap.xml`**，根目录放 `robots.txt` 放行并声明它；
3. 每页配 **`title` + `description` + `canonical`**（框架元信息库，SSR 直出）；
4. 配 **Open Graph**（含 1200×630 封面）让分享好看；
5. 部署后到 **Search Console 提交 sitemap + 请求编入索引**；
6. 用 `view-source:` / `curl` 复验首屏含正文与元信息。

### 11.7 配置「没生效」怎么排查

| 现象                                   | 大概率原因                                   | 排查动作                                               |
| -------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `view-source:` 首屏是空壳             | 纯 CSR，内容靠 JS 渲染                       | 改 SSR / SSG / 预渲染（§3、§7）                        |
| `<title>` 搜不到 / 是默认值           | 元信息是 JS 才设，未 SSR 直出                | 把 `useHead` / `helmet` 放进 SSR 输出                  |
| 富结果不显示                           | JSON-LD 语法错或内容对爬虫不可见             | Rich Results Test 看报错；确认数据在直出 HTML 里       |
| canonical 不生效 / 被忽略             | 指向 404 / 5xx，或 A、B 页 canonical 互指    | 保证 canonical 是 200 可达的真身且自洽                  |
| 收录很慢 / 不收录                      | 新站抓取预算少、无外链、sitemap 未提交       | 提交 sitemap + URL 检查请求收录 + 适度外链              |
| 排名有但点击少                         | 标题 / 描述写得不吸引人                      | 改 `title` / `description` 提升 CTR                    |
| 移动端排名差                           | 未响应式 / 有侵入弹窗 / 视口缺失             | 查 §5.2；用 Search Console 移动端测试                  |

> 一句话心法：**先让爬虫「看得到、读得懂」，再谈「排得高」；配置完必须「用爬虫视角（view-source / curl）验过」才算数，最后用 Search Console 确认搜索引擎真的收了。**
