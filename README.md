# Solution

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

面向前端工程师的知识手册站：按主题整理 HTML、浏览器、HTTP、JavaScript、TypeScript、主流框架、小程序与 App 开发等前端知识，可全文检索、可离线查阅。

站点基于 [VitePress](https://vitepress.dev) 2 与 VoidZero 官方主题（`@voidzero-dev/vitepress-theme` 的 `viteplus` 变体）搭建，布局对齐 [Vite+ 文档站](https://viteplus.nodejs.cn/)，内容取自本仓库已有的 Markdown；另附 47 份学习路线图 PDF 与开源许可证、求职职场资料。`srcDir` 即仓库根目录，`.vitepress/` 存放站点配置与自定义主题，`README.md` 与 `AGENTS.md` 由 `srcExclude` 排除、不生成站点页面。

## 目录

- [安装](#安装)
- [使用](#使用)
- [目录结构](#目录结构)
- [内容目录分类](#内容目录分类)
- [编写与新增文档](#编写与新增文档)
- [文档「目录」锚点规则](#文档目录锚点规则)
- [导航、侧边栏与首页](#导航侧边栏与首页)
- [主题与样式](#主题与样式)
- [布局宽度配置](#布局宽度配置)
- [构建与部署](#构建与部署)
- [SEO](#seo)
- [常见问题](#常见问题)
- [维护者](#维护者)
- [贡献](#贡献)
- [许可证](#许可证)

## 安装

运行环境 [Node.js](https://nodejs.org) 20+（本仓库在 Node.js 24 下开发）与 [pnpm](https://pnpm.io) 10；`packageManager` 已锁定 pnpm，**不要使用 npm / yarn**。

```bash
pnpm install
```

主要依赖：

| 依赖                            | 版本             | 说明                                          |
| ------------------------------- | ---------------- | --------------------------------------------- |
| VitePress                       | `2.0.0-alpha.17` | 静态站点生成，`srcDir` 即仓库根目录           |
| `@voidzero-dev/vitepress-theme` | `4.8.4`          | VoidZero 官方主题，本站使用 `viteplus` 变体   |
| Vue                             | `3.5`            | 主题与首页组件的运行时                        |
| Tailwind CSS                    | `4`              | 样式基于 Tailwind 4，`@source` 扫描本仓库组件 |

## 使用

```bash
pnpm run dev      # 本地开发（默认 http://localhost:5173）
pnpm run build    # 构建静态站点到 .vitepress/dist
pnpm run preview  # 预览构建产物
```

搜索由 VitePress 的本地全文搜索（`provider: 'local'`）提供，构建时生成索引，不依赖外部服务。

> ⚠️ 下面两坑的症状都是**整页无样式**（易误判为「宽度 / 样式没生效」）：① 重建后**没重启 `preview`**——它缓存了产物清单，CSS 新哈希文件名会 404；② 构建时**带了 `CI`**——资源被加上 `/solution/` 前缀，而 `preview` 只服务根路径。本地验证固定如下：
>
> ```powershell
> Remove-Item env:CI -ErrorAction SilentlyContinue   # PowerShell；bash: unset CI
> pnpm run build; pnpm run preview
> ```

## 目录结构

```text
solution/
├─ fundamentals/            # Web 基础
├─ frameworks/              # 框架与端
├─ engineering/             # 工程化与适配
├─ career/                  # 职业成长
├─ roadmaps/index.md        # 学习路线图索引页（PDF 在 public/roadmaps/）
├─ public/                  # 静态资源，构建时原样复制到站点根目录
│  ├─ roadmaps/             # 47 份路线图 PDF
│  └─ *.svg                 # favicon、站点 Logo、页脚背景
├─ index.md                 # 首页（frontmatter：layout: home）
├─ .vitepress/
│  ├─ config.mts            # 导航 / 侧边栏 / 页脚 / head / SEO / markdown 扩展（唯一真相源）
│  └─ theme/
│     ├─ index.ts           # 主题入口：复用 VoidZero 主题 + 覆盖品牌资源
│     ├─ Layout.vue         # 首页营销布局与文档页布局的分发
│     ├─ styles.css         # 全站样式（7 段，宽度变量在第 2 段）
│     ├─ components/        # 首页区块组件
│     ├─ animations/        # 首页动效（GSAP 唯一入口 motion.ts）
│     └─ data/              # 首页数据：features.ts、terminal.ts、topics.ts
├─ AGENTS.md                # 改动规范与「已修复问题防回归清单」
└─ package.json
```

`.vitepress/cache`、`.vitepress/dist`、`node_modules` 已在 `.gitignore` 中，不要手改或提交。

## 内容目录分类

| 目录            | 分类                                                                           |
| --------------- | ------------------------------------------------------------------------------ |
| `fundamentals/` | Web 基础（HTML5、脚本 Script、浏览器、HTTP、JavaScript、ECMAScript 6、TypeScript、前端性能、浏览器存储、前端安全防护） |
| `frameworks/`   | 框架与端（React、Vue、Svelte、框架对比、Taro、微信小程序、App 开发）           |
| `engineering/`  | 工程化与适配（打包构建工具、Emmet、响应式与自适应、数据大屏适配、H5 唤起 APP、Git、微前端） |
| `roadmaps/`     | 学习路线图索引页（PDF 原件位于 `public/roadmaps/`，随站点原样发布）            |
| `career/`       | 职业成长（开源许可证、求职与职场）                                             |

每个主题为 `<分类>/<主题>/index.md`，路由 `/<分类>/<主题>/`；站点开启 `cleanUrls`，站内链接统一写**带尾斜杠的绝对路径**。`public/` 下的文件原样复制到站点根目录（如 `public/roadmaps/beginner/frontend-beginner.pdf` → `/roadmaps/beginner/frontend-beginner.pdf`）。

## 编写与新增文档

文档骨架为 **H1 + 参考资料引用块 + `## 目录` + `## 一、` / `### 1.1` 正文**；全部书写要求（层级不跳级、代码块标语言、`{{PLACEHOLDER}}` 原样保留、图片与 PDF 放 `public/` 并以绝对路径引用等）见 `AGENTS.md` §3.2。

新增文档不是「只加一个文件」，而是把所有登记位置一次改齐：`config.mts` 的 `sidebar`（**必改**）、`data/topics.ts` 的 `topicGroups` 与统计常量、本文件的「内容目录分类」表，以及 `nav` / `footer.nav` / `roadmaps/index.md` 等按需联动；**完整清单（a~j）见 `AGENTS.md` §4.2，全量排查命令与逐项检查清单见 `.agent-reference/agent-guide-details.md` 三**。漏改症状：页面能打开，但侧栏里找不到、首页索引里没有、统计数字是旧值。

## 文档「目录」锚点规则

VitePress 的标题 id 按自己的规则生成，**不是** GitHub 那种「去掉所有标点」的规则：

| 规则                          | 示例                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------- |
| 中文顿号 `、` 会**保留**      | `## 一、为什么必须选许可证` → `#一、为什么必须选许可证`                           |
| 空格 / `.` / `：` / `+` → `-` | `## 2.1 宽松式（Permissive）` → `#_2-1-宽松式permissive`                          |
| 括号、`&`、引号等会被删除     | `## 7、辅助技术：媒体查询 & CSS 容器查询` → `#_7、辅助技术-媒体查询-css-容器查询` |
| 以数字开头时前缀 `_`          | `## 11、开发最佳实践` → `#_11、开发最佳实践`                                      |
| 英文字母转小写                | `## 十、常见误区与 FAQ` → `#十、常见误区与-faq`                                   |

**不要手写猜锚点**：以标题左侧 `#` 的链接或右侧「本页目录」为准；改完章节后比对 `dist/<分类>/<主题>/index.html` 的 `<h2 id="...">` 与正文 `](#...)`。

## 导航、侧边栏与首页

- **导航 / 侧边栏 / 页脚 / head / SEO**：只在 `.vitepress/config.mts` 维护，不要在页面里硬编码；`nav` 的 `activeMatch` 保持 `^/<分类>/`，侧边栏分组顺序与内容目录一致。
- **首页数据**：集中在 `.vitepress/theme/data/`——`features.ts`（能力面板 + 命令卡）、`terminal.ts`（终端演示）、`topics.ts`（分类地图 / 站点信息，含 `docCount` / `roadmapCount` / `categoryCount` 统计常量）。
- **首页文案**：Hero 与各区块标题直接写在 `Home.vue` 及其子组件中。

### 首页组成

首页 = `index.md`（`layout: home`）+ `.vitepress/theme/Layout.vue` 的 home 分支，区块自上而下：

| 区块                                           | 组件                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Hero（标题 / 描述 / 按钮）                     | `Home.vue`                                                              |
| 技术栈等距图（可点击）                         | `StackIsometric.vue`                                                    |
| 命令速查终端（逐字动画）                       | `TerminalPanel.vue`、`TerminalTranscript.vue`                           |
| 快速开始（命令卡 + 复制）                      | `InstallCommand.vue`                                                    |
| 三大分类 / 站点信息 / 收尾大标题（3 格、4 格） | `Home.vue`（`categories` / `highlights` / `statRows` / `growthBlocks`） |
| 能力展示区（工具栏 + 5 面板）                  | `FeatureToolbar.vue`、`FeaturePanel.vue`                                |
| 内容地图（自绘 SVG）                           | `ClosingIllustration.vue`                                               |
| 页脚                                           | `SiteFooter.vue`                                                        |

> 首页动效由 `.vitepress/theme/animations/motion.ts`（GSAP + ScrollTrigger）驱动；等距图、网格边框与动效的**关键规则在 `AGENTS.md` §2.6，完整实现细则与自查口径见 `.agent-reference/homepage-implementation-notes.md`**，本节只列区块构成。

## 主题与样式

- **主题入口** `.vitepress/theme/index.ts`：复用 VoidZero 主题的 `enhanceApp`，并通过 `themeContextKey` 覆盖品牌资源（`logoDark` / `logoLight` / `logoAlt` / `footerBg` / `monoIcon`，对应 `public/` 下的 svg）。
- **布局** `.vitepress/theme/Layout.vue`：首页走 `marketing-layout` 分支（`OSSHeader` + `Home` + `SiteFooter`），其余页面用主题默认布局；首页运行时同步 `data-theme="light"`，避免系统深色偏好影响首屏。
- **样式** `.vitepress/theme/styles.css` 共 7 段：品牌色 / 布局宽度配置 / 正文细节修正 / 首页装饰 / 终端演示 / 能力展示渐变 / 首页动效。改动前看清段落，不要零散写死宽度或颜色。
- **动效** `.vitepress/theme/animations/motion.ts`：首页 GSAP 唯一入口（动态加载 / `useMotion()` / `revealOnScroll()`）；组件不得各自 `import gsap`，硬约束与失败复盘见 `AGENTS.md` §2.6 及 `.agent-reference/homepage-implementation-notes.md`。

## 布局宽度配置

宽度集中在 `.vitepress/theme/styles.css` 的「布局宽度统一配置」段，改这一处即可全站生效：

| 变量                   | 作用                                                           | 当前值             |
| ---------------------- | -------------------------------------------------------------- | ------------------ |
| `--site-layout-width`  | 横向总宽（左侧导航 + 正文 + 右侧「本页目录」，首页营销区同宽） | `100rem`（1600px） |
| `--site-sidebar-width` | 左侧导航栏宽度（移动端抽屉同宽）                               | `272px`            |
| `--site-doc-width`     | 正文内容列宽度                                                 | `900px`            |
| `--site-aside-width`   | 右侧「本页目录」宽度                                           | `224px`            |

这 4 个变量要覆盖 `.content-wrapper`、`.wrapper`、`.VPLocalNav .container`、`.VPDoc .content-container`、`.VPDoc .aside`、`.VPSidebar` 等容器，缺一处就会「某一横线对不齐」；其中 **`.wrapper` 必须用全局选择器**——写成 `.marketing-layout .wrapper` 会让页头比内容区窄 160px。

## 构建与部署

- `pnpm run build` 产出纯静态站点到 `.vitepress/dist`（`public/` 原样复制），可直接托管到任意静态服务器 / 对象存储 / Pages 服务；
- 线上由 GitHub Actions 发布：`.github/workflows/deploy-docs.yml` 在推送 `main` 后构建并部署到 <https://libao-jun.github.io/solution/>（首次需在 **Settings → Pages** 把 Source 选为 **GitHub Actions**，之后可在 Actions 页手动 `workflow_dispatch`）；
- `config.mts` 的 `base` 按环境切换（CI 用 `/solution/`，本地用 `/`）：改用自定义域名 / 根路径部署就改成 `'/'`，其它子路径则改成对应前缀，否则资源 404。

## SEO

SEO 配置集中在 `.vitepress/config.mts`（下表位置均指该文件）：

| 项目                     | 位置                                                 | 说明                                                                                             |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 站点标题 / 描述 / 语言   | `siteTitle` / `siteDescription` / `siteLang`         | 驱动 `<title>`、`description` 与 JSON-LD                                                         |
| 生产地址（绝对地址基准） | `siteUrl`                                            | 与 `base` 解耦，换域名只改这一处（可用 `SITE_URL` 覆盖，末尾带 `/`）                             |
| 站点级 head              | `head`                                               | favicon / `keywords` / `robots` / `Cache-Control` / Open Graph / Twitter Card                    |
| 每页 head + 结构化数据   | `transformHead`（`buildSeoHead`）                    | 每页 `canonical`、`og:*`、`twitter:*` 与 JSON-LD；首页 `WebSite`、文档页 `TechArticle`           |
| 页面更新时间             | `lastUpdated`                                        | 文档页脚展示「最后更新于」，并作为 JSON-LD 的 `dateModified`                                     |
| 站点地图 / 抓取规则      | `sitemap` + `public/robots.txt`                      | 产出 `sitemap.xml`（`hostname` 取 `siteUrl`，末尾斜杠不可去）；robots 允许全站抓取并声明 sitemap |
| 页头 Logo 根链接         | `transformHtml` + `Layout.vue` 的 `fixThemeLogoLink` | 主题包把 Logo 写死为 `href="/"`，构建期补 `base`，运行时再兜底（移动端菜单）                     |

构建后自查（产物 `.vitepress/dist`）：① 页面 `<head>` 含 `canonical` / `og:*` / `twitter:*` / JSON-LD；② 根目录有 `sitemap.xml` 与 `robots.txt`；③ CI 模式构建（`$env:CI='true'; pnpm run build`）时资源与站内链接都带 `/solution/` 前缀。

> ⚠️ **改站内链接 / 根路径资源必须补 `base`**：VitePress 只给 **Markdown 正文里的链接**自动补 `base`，主题组件、`head` 与页脚导航都不会。组件里用 `withBase()`（从 `vitepress` 导入），`config.mts` 里用本地同名辅助函数；裸写 `/xxx` 在 CI 下会 404。

## 常见问题

| 现象                                               | 原因与处理                                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 页面打开后完全无样式                               | `preview` 未重启，或构建时带 `CI`；见「使用」                                     |
| 首页出现「空框」或缺边框                           | 网格单元格数未整除列数，或给中间区块加了 `md:border-none`；细则见 `AGENTS.md` §2.6 |
| 点文档里的「目录」没反应                           | 锚点按 GitHub 规则手写了；改用标题左侧 `#` 或右侧「本页目录」                      |
| 新页面构建出来但侧栏里没有                         | `config.mts` 的 `sidebar` 未登记该页面                                             |
| 首页数字与实际不符                                 | `data/topics.ts` 的 `docCount` / `roadmapCount` / `categoryCount` 未同步           |
| 线上图标 / 链接 404、canonical 或 sitemap 域名不对 | 根路径未过 `withBase()`，或 `siteUrl` 未同步；见「SEO」                            |

## 维护者

- [@Libao-Jun](https://github.com/Libao-Jun)

## 贡献

- 改动导航 / 首页 / 主题 / 样式前先读 `AGENTS.md`（改动规范 + 「已修复问题防回归清单」）：本文件讲「怎么用、怎么跑」，`AGENTS.md` 讲「怎么改、哪些坑不能踩」。
- 欢迎在 [GitHub Issues](https://github.com/Libao-Jun/solution/issues) 提问、报告问题或提交 Pull Request；提交前请确认 `pnpm run build` 通过。
- 提交信息用 Conventional Commits + 中文，如 `feat(<主题>): 新增 <主题> 文档` / `fix(<主题>): 修复 <问题>`；一次提交只做一件事。
- 不要升级 VitePress / `@voidzero-dev/vitepress-theme` / Vue 等核心依赖，也不要改 `srcDir` 与 `srcExclude`——会影响既有页面与路由，需先与维护者确认。

## 许可证

本仓库**未声明开源许可证**（`UNLICENSED`），内容版权归维护者所有。如需使用、分发或商用，请先通过 [GitHub Issues](https://github.com/Libao-Jun/solution/issues) 联系维护者；若确定采用某个许可证，应在仓库根目录补充 `LICENSE` 文件并在此处说明。
