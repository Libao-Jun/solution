# Open Graph 协议知识手册（社交分享卡片）

> 参考资料：
>
> - [Open Graph protocol 官方规范](https://ogp.me/)
> - [前端 HTML / Open Graph 实践笔记](https://peiyanlu.github.io/vite-press/frontend/html/og)
> - [掘金 — Open Graph 协议详解](https://juejin.cn/post/7023173942001008670)
> - [博客园 — 深入理解 Open Graph 协议](https://www.cnblogs.com/caiawo/p/17278549.html)
> - [OpenGraph.dev 中文站](https://opengraph.dev/zh/)
> - [SegmentFault — Open Graph 协议入门](https://segmentfault.com/a/1190000040863000)
> - [zhuangpenglong — What is Open Graph Protocol](https://zhuangpenglong.com/posts/what-is-open-graph-protocol)
>
> 面向角色：中高级前端工程师、全栈工程师与站点负责人。本文按「协议是什么 → 完整属性清单 → 图像 / 视频规格 → 与 Twitter Card、JSON-LD 的关系 → 分享卡片生成全流程 → 各平台差异 → 工程化注入 → 验证调试 → 常见坑」展开，覆盖一个前端高级工程师必须掌握的 Open Graph（OG）关键知识点与落地流程。页面级 TDK、canonical 与结构化数据在本站由站点工程统一生成（见 [SEO 全流程知识手册](/fundamentals/seo/)），本文聚焦「社交分享卡片」这一垂直主题：爬虫 / 爬虫抓取、富链接预览、以及如何把它做对、做稳。

---

## 目录

1. [Open Graph 协议是什么：定义、起源与价值](#一、open-graph-协议是什么-定义、起源与价值)
2. [核心元数据：基础四件套与完整属性清单](#二、核心元数据-基础四件套与完整属性清单)
3. [og:type 与垂直对象类型](#三、og-type-与垂直对象类型)
4. [og:image 封面图：规格、属性与最佳实践](#四、og-image-封面图-规格、属性与最佳实践)
5. [视频、音频与多媒体对象](#五、视频、音频与多媒体对象)
6. [Twitter Card：与 OG 的关系及配置](#六、twitter-card-与-og-的关系及配置)
7. [JSON-LD 结构化数据与 OG 的分工](#七、json-ld-结构化数据与-og-的分工)
8. [分享卡片生成全流程：从分享链接到展示](#八、分享卡片生成全流程-从分享链接到展示)
9. [各平台差异与适配要点](#九、各平台差异与适配要点)
10. [工程化落地：在站点中正确注入 OG 标签](#十、工程化落地-在站点中正确注入-og-标签)
11. [验证、调试与缓存刷新](#十一、验证、调试与缓存刷新)
12. [常见坑、反模式与上线前 Checklist](#十二、常见坑、反模式与上线前-checklist)
13. [相关协议与延伸：oEmbed 与 Schema.org](#十三、相关协议与延伸-oembed-与-schema-org)

---

## 一、Open Graph 协议是什么：定义、起源与价值

Open Graph（开放图谱，简称 OG）协议是一套由 Facebook（现 Meta）在 2010 年提出的 `<meta>` 元数据标准，目的是让任意网页在被分享到社交平台时，能像「原生内容」一样展示出**标题、描述、封面图、来源站**组成的富链接预览卡片，而不是一串光秃秃的文本 URL。

它的核心机制只有一句话：在 HTML `<head>` 里用 `property="og:*"` 的 `<meta>` 标签，声明「这张页面代表现实世界里的什么对象」。

### 1.1 为什么前端必须懂它

- **分享即门面**：用户在微信、钉钉、Slack、Discord、Twitter、LinkedIn 粘贴链接的瞬间，卡片质量直接决定点击率（CTR）。一张 1200×630 的清晰封面图，比纯文字链接的点击率高出一个数量级。
- **它只认服务端 HTML**：绝大多数社交爬虫（Facebook 的 `facebookexternalhit`、Twitter 的 `Twitterbot`、LinkedIn 的 `LinkedInBot`）是**不执行 JavaScript** 的。SPA（单页应用）若只在客户端动态插入 `<meta>`，爬虫抓到的只是空 `<head>`，卡片必失败。
- **它是 SEO 之外最容易被忽视的「前端可见收益」**：TDK 影响搜索排名，OG 影响社交分发——两者都是「在 `<head>` 写对标签」这种前端基本功，但 OG 的反馈最快、最可量化。

### 1.2 协议的基本概念

OG 把每个网页建模成一个「图谱对象（Graph Object）」，四类基础属性描述它：

| 维度     | 对应标签          | 含义                         |
| -------- | ----------------- | ---------------------------- |
| 标题     | `og:title`        | 卡片主标题                   |
| 类型     | `og:type`         | 对象类型（网页 / 文章 / 视频） |
| 图片     | `og:image`        | 卡片封面图                   |
| 地址     | `og:url`          | 该对象的标准网址（规范化）   |

其余属性（描述、站点名、语言、图像尺寸等）都是对这四者的补充。

---

## 二、核心元数据：基础四件套与完整属性清单

### 2.1 基础四件套（必须写）

```html
<head>
  <meta property="og:title" content="2026 前端性能优化实战指南" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://example.com/perf/" />
  <meta property="og:image" content="https://example.com/cover.png" />
</head>
```

这四项是规范定义的「必需」字段，缺任意一项，部分平台会拒绝生成卡片或回退到默认抓取。

### 2.2 推荐补充字段

```html
<meta property="og:description" content="从 LCP、INP、CLS 到资源加载与缓存，一篇讲透性能优化。" />
<meta property="og:site_name" content="Example 技术博客" />
<meta property="og:locale" content="zh_CN" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:determiner" content="the" />
```

- `og:description`：卡片副文案，建议 2~4 句，控制在 200 字符内（平台会截断）。
- `og:site_name`：站点品牌名，与域名解耦，便于多域名共用品牌。
- `og:locale`：语言地区，格式 `语言_地区`（下划线），如 `zh_CN`、`en_US`；`og:locale:alternate` 可重复声明多语言版本。
- `og:determiner`：标题前的冠词（a / an / the / ""），仅英文场景有意义。

### 2.3 完整属性速查表

| 属性                    | 说明                                       | 是否必填 |
| ----------------------- | ------------------------------------------ | -------- |
| `og:title`              | 对象标题                                   | 必填     |
| `og:type`               | 对象类型                                   | 必填     |
| `og:image`              | 封面图 URL                                 | 必填     |
| `og:url`                | 对象规范 URL                               | 必填     |
| `og:description`        | 对象描述                                   | 推荐     |
| `og:site_name`          | 站点名称                                   | 推荐     |
| `og:locale`             | 语言地区                                   | 推荐     |
| `og:locale:alternate`   | 备用语言地区（可多个）                     | 可选     |
| `og:determiner`         | 标题冠词                                   | 可选     |
| `og:image:width`        | 图像宽（px）                               | 推荐     |
| `og:image:height`       | 图像高（px）                               | 推荐     |
| `og:image:alt`          | 图像替代文本（无障碍）                     | 推荐     |
| `og:image:type`         | 图像 MIME（如 `image/png`）                | 可选     |
| `og:image:secure_url`   | HTTPS 图像 URL                             | 可选     |
| `og:video` / `og:audio` | 多媒体资源（见第五章）                     | 可选     |
| `og:updated_time`       | 对象更新时间（ISO 8601）                    | 可选     |

> 注意：`og:url` 应填**规范化地址**（去掉跟踪参数、统一 https、统一结尾斜杠），它让平台把分享聚合到同一个对象，避免同页多条链接分散点赞与评论。

---

## 三、og:type 与垂直对象类型

`og:type` 决定平台如何呈现与理解对象。基础类型只有 `website`，但协议为不同内容形态定义了「垂直类型（verticals）」。

### 3.1 常用类型对照

| 类型                  | 适用场景                                   | 额外推荐字段                                   |
| --------------------- | ------------------------------------------ | ---------------------------------------------- |
| `website`             | 首页、栏目页、工具页                       | `og:title` / `og:image`                        |
| `article`             | 博客、新闻、教程（最常用）                 | `article:published_time` / `article:author` / `article:section` |
| `book`                | 电子书、出版物                             | `book:isbn` / `book:author`                    |
| `profile`             | 个人主页、作者页                           | `profile:username` / `profile:first_name`      |
| `video.movie` / `video.episode` | 视频内容                          | `video:*` 系列（见 5.1）                        |
| `music.song`          | 音乐单曲                                   | `music:*` 系列                                 |

### 3.2 article 类型的典型写法

```html
<meta property="og:type" content="article" />
<meta property="og:title" content="Open Graph 协议知识手册" />
<meta property="article:published_time" content="2026-10-19T09:00:00+08:00" />
<meta property="article:modified_time" content="2026-10-19T09:00:00+08:00" />
<meta property="article:author" content="Example 技术博客" />
<meta property="article:section" content="前端工程化" />
<meta property="article:tag" content="SEO" />
<meta property="article:tag" content="社交分享" />
```

`article:tag` 可重复出现，用于聚合同主题内容。对于博客类站点，`article` 比 `website` 更能让平台理解「这是一篇有时效、有作者、有分类的内容」。

---

## 四、og:image 封面图：规格、属性与最佳实践

封面图是 OG 里**最影响点击、也最容易出错**的字段。

### 4.1 平台推荐尺寸（以 Facebook 为基准）

- 推荐：**1200 × 630 px**（宽高比约 1.91:1），这是大多数平台的「大图卡片」黄金尺寸。
- 最小可用：600 × 315 px；低于此 Facebook 会使用小图样式甚至不展示。
- 最大文件：建议 ≤ 5 MB（部分平台更严，如 Twitter 单图 ≤ 5 MB、WeChat 偏好更小）。

### 4.2 必须声明宽高，避免二次抓取

```html
<meta property="og:image" content="https://example.com/cover.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="一张展示性能优化指标示意图的封面" />
<meta property="og:image:type" content="image/png" />
```

声明 `og:image:width` / `og:image:height` 后，爬虫**无需下载图片即可排版**，卡片生成更快、更稳定；否则部分爬虫会先抓图测尺寸，增加一次往返。

### 4.3 格式与 HTTPS

- 格式：PNG / JPG 最稳；GIF 多数平台支持静态首帧；**SVG 不被社交爬虫接受**，切勿用 `og:image` 指向 SVG。
- 必须 HTTPS：`og:image` 与 `og:image:secure_url` 都应走 HTTPS，否则在 https 页面分享时图片被浏览器拦截。
- 多图：可重复 `og:image` 提供多张候选，平台自行挑选（如相册类内容）。

### 4.4 设计要点

- 文字直接烘焙进图片，不要依赖 `og:title` 在图上渲染（卡片标题另取自 `og:title`）。
- 主体居中、留安全边距，避免被平台圆角裁剪丢失关键信息。
- 同一张图在不同平台比例下都会被裁切，重要信息不要贴边。

---

## 五、视频、音频与多媒体对象

当分享的是视频 / 音乐时，用 `og:video` / `og:audio` 系列让平台内嵌播放器。

### 5.1 视频对象

```html
<meta property="og:type" content="video.movie" />
<meta property="og:video" content="https://example.com/clip.mp4" />
<meta property="og:video:secure_url" content="https://example.com/clip.mp4" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="1280" />
<meta property="og:video:height" content="720" />
<meta property="og:video:image" content="https://example.com/poster.png" />
```

`og:video:image` 是视频未播放时的海报图，作用等同于 `og:image`。

### 5.2 音频对象

```html
<meta property="og:type" content="music.song" />
<meta property="og:audio" content="https://example.com/track.mp3" />
<meta property="og:audio:type" content="audio/mpeg" />
<meta property="og:audio:secure_url" content="https://example.com/track.mp3" />
```

---

## 六、Twitter Card：与 OG 的关系及配置

Twitter（X）在 OG 之外定义了自己的 `twitter:*` 卡片协议，但**实现上直接复用 OG 字段作为回退**。

### 6.1 两者的关系

- 若页面有 `twitter:card` + `twitter:title` 等字段，Twitter 优先用它们。
- 若缺 `twitter:*` 字段，Twitter 会**回退读取对应的 `og:*` 字段**（如没有 `twitter:title` 就用 `og:title`）。
- 因此「写好 OG 四件套」已经能让 Twitter 生成 `summary_large_image` 大图卡片，无需重复写两套。

### 6.2 显式声明 Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@example" />
<meta name="twitter:creator" content="@author" />
<meta name="twitter:title" content="Open Graph 协议知识手册" />
<meta name="twitter:description" content="前端高级工程师必须掌握的社交分享卡片知识。" />
<meta name="twitter:image" content="https://example.com/cover.png" />
```

`twitter:card` 取值：`summary`（小图）、`summary_large_image`（大图，推荐）、`app`（应用安装）、`player`（内嵌播放器）。

> 实践建议：OG 写全，Twitter 只补 `twitter:card` 与 `twitter:site` 即可，避免信息双份维护导致不一致。

---

## 七、JSON-LD 结构化数据与 OG 的分工

OG 与 [JSON-LD](https://ogp.me/)（Schema.org 结构化数据）解决的是**不同问题**，不要混为一谈：

| 维度         | Open Graph                    | JSON-LD（Schema.org）            |
| ------------ | ----------------------------- | -------------------------------- |
| 目标消费者   | 社交平台爬虫（分享卡片）      | 搜索引擎 / 语音助手（理解实体）  |
| 数据形态     | `<meta>` 键值对               | `<script type="application/ld+json">` JSON |
| 典型用途     | 微信 / Twitter / LinkedIn 卡片 | Google 富结果（评论星、面包屑）   |
| 是否影响排名 | 不直接影响                    | 帮助理解页面实体，间接影响展现    |

两者**共存不冲突**：OG 管「分享长什么样」，JSON-LD 管「搜索引擎怎么理解你」。本站文档页同时输出 `TechArticle` 的 JSON-LD 与页面级 OG（见 [SEO 全流程知识手册](/fundamentals/seo/)）。

---

## 八、分享卡片生成全流程：从分享链接到展示

理解「卡片是怎么来的」是排查问题的前提。完整链路如下：

1. **用户复制链接**：在微信 / Slack / Twitter 粘贴 `https://example.com/perf/`。
2. **平台发起抓取**：平台服务端用专属爬虫（如 `facebookexternalhit/1.1`）请求该 URL 的 HTML。这一步发生在**平台服务器**，与分享者的浏览器无关。
3. **解析 `<head>`**：爬虫只读服务端返回的 HTML 文本，提取 `og:*` / `twitter:*` / `<title>` / `<meta name="description">`。
4. **生成卡片**：平台把解析结果渲染成预览卡片，缓存到「这条链接」上。
5. **展示与聚合**：卡片展示给接收者；同 `og:url` 的多次分享聚合为同一对象（点赞 / 评论共享）。
6. **更新与刷新**：内容变更后，需主动到平台调试工具刷新缓存（见第十一章），否则旧卡片会停留数小时到数天。

> **关键结论**：卡片内容取决于「爬虫抓取那一刻的服务端 HTML」。SPA 若不在服务端渲染 `<head>`，爬虫拿不到 OG，卡片就废了——这是 OG 落地里最高频的线上事故。

---

## 九、各平台差异与适配要点

不同平台对 OG 的解读存在细节差异，统一写法难以 100% 覆盖，需针对重点平台取舍。

| 平台       | 大图尺寸偏好        | 特殊点                                                       |
| ---------- | ------------------- | ------------------------------------------------------------ |
| Facebook   | 1200×630（1.91:1）  | 有 Sharing Debugger，缓存强，必须手动「抓取新副本」刷新      |
| Twitter/X  | 1200×600（2:1）     | 优先 `twitter:*`；回退 OG；`summary_large_image` 才显示大图 |
| LinkedIn   | 1200×627            | Post Inspector 可刷新；对 `og:image` 大小 / 比例较敏感       |
| Slack      | 大图 + 标题 + 描述  | 读取 OG；机器人有缓存，更新后需等或重发                     |
| Discord    | 大图卡片            | 同 OG；支持 `og:image` 多图候选                              |
| Telegram   | 大图 + 标题         | 读取 OG；站內有链接预览缓存                                  |
| 微信       | 缩略图（小）        | 公众号 / 小程序内分享走自有协议；普通网页分享预览依赖 OG，但部分场景只显示小图 |

**适配策略**：以 1200×630 为通用封面基准，同时满足 Twitter 的 2:1 与 LinkedIn 的 627 高；有强运营诉求时，再用平台调试工具单独校验 Facebook / LinkedIn / Twitter。

---

## 十、工程化落地：在站点中正确注入 OG 标签

### 10.1 总原则：在服务端渲染

无论用哪种框架，**OG 标签必须出现在服务端返回的 HTML `<head>` 里**。常见落地方式：

- **SSR / SSG 框架**（Next.js、Nuxt、Astro、VitePress）：在页面级 `head` / `useHead` / `transformHead` 中按路由注入。
- **静态站**：构建期为每个页面写入对应 `<meta>`。
- **纯 CSR（如裸 React/Vue SPA）**：需加预渲染（prerender）或改成 SSG/SSR，否则社交爬虫拿不到 OG。

### 10.2 以 VitePress 为例（本站做法）

VitePress 通过 `transformHead` 在构建期按页面生成 OG，无需手写每个 `<meta>`：

```ts
// .vitepress/config.mts（示意）
const buildSeoHead = ({ pageData }) => {
  const canonical = new URL(routePath, siteUrl).href
  return [
    ['link', { rel: 'canonical', href: canonical }],
    ['meta', { property: 'og:title', content: pageData.title }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: siteOgImage }],
  ]
}
```

要点：`og:url` 用**绝对地址的 canonical**（与 `base` 解耦，本地 `/`、CI `/solution/` 都正确），`og:image` 用绝对地址，避免相对路径。

### 10.3 动态页面（如文章详情）的注入

```ts
// Nuxt 3 示例：useHead 按数据注入
useHead({
  title: article.title,
  meta: [
    { property: 'og:title', content: article.title },
    { property: 'og:type', content: 'article' },
    { property: 'og:image', content: article.cover },
    { property: 'og:url', content: `https://example.com/p/${article.id}/` },
    { property: 'article:published_time', content: article.createdAt },
  ],
})
```

### 10.4 本地自测脚本

构建后用 `curl` 校验服务端 HTML 是否真的含有 OG（这是判断「SPA 是否生效」的最快手段）：

```bash
# 启动预览后，检查服务端返回的 <head>
curl -s http://localhost:4173/perf/ | grep -E 'og:(title|image|type|url)'
```

若 `grep` 命中为空，说明 OG 没进服务端 HTML，分享必然失败。

---

## 十一、验证、调试与缓存刷新

### 11.1 官方调试工具（必用）

| 平台        | 工具                                                         |
| ----------- | ------------------------------------------------------------ |
| Facebook    | Sharing Debugger（开发者后台）                               |
| Twitter/X   | Card Validator（需登录）                                     |
| LinkedIn    | Post Inspector（postinspector.linkedinlabs.com）             |
| 通用校验    | opengraph.dev、ogp.me 文档对照                               |

### 11.2 刷新缓存

社交平台会缓存「链接 → 卡片」的映射，改了内容后旧卡片不会自动消失：

- **Facebook**：在 Sharing Debugger 输入 URL，点「Fetch new information / 抓取新副本」。
- **LinkedIn**：Post Inspector 重新抓取即刷新。
- **Twitter**：Card Validator 重新校验。
- **通用**：换 URL（加 `?v=2` 之类无害参数）可强制视为新对象，但会丢失原对象的聚合数据，仅作兜底。

### 11.3 本地快速校验清单

```bash
# 1) 服务端 HTML 含 OG 四件套
curl -s https://example.com/perf/ | grep -oE 'og:(title|type|image|url)' | sort -u
# 2) 图像可访问且为 HTTPS
curl -I https://example.com/cover.png | grep -iE 'HTTP/|content-type'
# 3) 图像尺寸达标
#    用图片工具读取 width/height，确认 ≥ 1200×630
```

---

## 十二、常见坑、反模式与上线前 Checklist

### 12.1 高频反模式

- **SPA 客户端注入 OG**：爬虫不执行 JS，拿到空 `<head>` → 卡片失败。必须用 SSR/SSG。
- **`og:image` 用相对路径 / HTTP**：相对路径爬虫无法解析；HTTP 在 https 页被拦。
- **`og:image` 指向 SVG**：社交爬虫不接受 SVG，卡片无图。
- **漏写 `og:image:width/height`**：爬虫需二次测尺寸，卡片变慢、偶发不稳。
- **`og:url` 带跟踪参数**：同页分散成多个对象，点赞 / 评论不聚合。
- **`og:title` / `og:description` 过长**：被平台截断，关键信息丢失。
- **OG 与 JSON-LD 信息冲突**（如标题不一致）：用户困惑，信任度下降。

### 12.2 上线前 Checklist

- [ ] 服务端 HTML（非 CSR）含 `og:title` / `og:type` / `og:image` / `og:url` 四件套
- [ ] `og:image` 绝对 HTTPS 地址，PNG/JPG，≥ 1200×630，并声明 `width/height`
- [ ] `og:url` 为规范化绝对地址（去参数、统一 https、统一结尾斜杠）
- [ ] `og:description` ≤ 200 字，含核心信息
- [ ] 文章页用 `og:type=article` 并补 `article:published_time` / `author`
- [ ] Twitter 显式声明 `twitter:card=summary_large_image`（其余回退 OG）
- [ ] 用 Facebook / LinkedIn / Twitter 调试工具逐一验证通过
- [ ] 内容更新后已到对应工具刷新缓存

---

## 十三、相关协议与延伸：oEmbed 与 Schema.org

- **oEmbed**：让平台「自动嵌入」富内容（如 YouTube 视频、Twitter 推文）的协议，与 OG 互补——OG 解决「链接预览卡片」，oEmbed 解决「把外部内容嵌进自己的页面」。它需要服务端提供 `oembed` 端点。
- **Schema.org / JSON-LD**：面向搜索引擎的结构化数据（见第七章），与 OG 并行不悖。
- **Microdata / RDFa**：更早的语义标注方案，现代站点更推荐 JSON-LD。

OG 是「社交分发」这一环的最优解：成本极低（只在 `<head>` 写几个标签）、收益极高（直接提升分享点击）。把它纳入前端工程化的「页面元信息」标准流程，是高级前端的基本功。

---

> 延伸阅读：[SEO 全流程知识手册](/fundamentals/seo/) 覆盖 TDK、canonical、结构化数据与社交分享的整体工程化；本文是其「社交分享卡片」专题的纵深展开。
