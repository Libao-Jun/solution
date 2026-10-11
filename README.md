# solution

面向前端工程师的**知识手册站**：把开发中常见的问题与知识点（HTML、浏览器、HTTP、JavaScript、
TypeScript、主流框架、小程序与 App 开发、工程化与端适配等）按主题整理成可全文检索、可离线查阅的文档，
遇到问题按主题即可定位；另附 47 份学习路线图 PDF 与开源许可证、求职职场资料，用于系统学习与查漏补缺。

站点基于 [VitePress](https://vitepress.dev) + VoidZero 官方主题（`@voidzero-dev/vitepress-theme`，`viteplus` 变体）搭建，
布局与样式对齐 [Vite+ 文档站](https://viteplus.nodejs.cn/)，内容全部来自本仓库已有文档。

## 技术栈与环境

| 依赖                            | 版本             | 说明                                        |
| ------------------------------- | ---------------- | ------------------------------------------- |
| VitePress                       | `2.0.0-alpha.17` | 静态站点生成，`srcDir` 即仓库根目录         |
| `@voidzero-dev/vitepress-theme` | `4.8.4`          | VoidZero 官方主题，本站使用 `viteplus` 变体 |
| Vue                             | `3.5`            | 主题与首页组件的运行时                      |
| Tailwind CSS                    | `4`              | 样式基于 Tailwind 4，`@source` 扫描本仓库组件 |

运行环境：Node.js 20+（本仓库在 Node.js 24 下开发）与 pnpm 10；`packageManager` 已锁定 pnpm，**不要使用 npm / yarn**。

> 搜索由 VitePress 的本地全文搜索（`provider: 'local'`）提供，构建时生成索引，不依赖外部服务。

## 本地开发

```bash
pnpm install
pnpm run dev      # 本地开发（默认 http://localhost:5173）
pnpm run build    # 构建静态站点到 .vitepress/dist
pnpm run preview  # 预览构建产物
```

> ⚠️ 改完 `styles.css` 的宽度变量后必须「重新 build + 重启 preview」：CSS 是构建期处理的，且 preview
> 启动时会缓存产物清单，重建后 CSS 文件名哈希变化会让旧进程返回 404，页面表现为**完全无样式**
> （常被误判为「宽度没适配」）。开发阶段用 `pnpm run dev` 不存在这个问题。
>
> ⚠️⚠️ **本地构建前请确保 `CI` 环境变量未设置。**
> `config.mts` 里 `const base = process.env.CI ? '/solution/' : '/'`（GitHub Pages 子路径部署用）。
> 若在设置了 `CI` 的环境（CI 流水线、部分 IDE 任务/终端）里执行 `pnpm run build`，产物里的资源会变成
> `/solution/assets/...`，而 `pnpm run preview` 只在**根路径**提供页面 → 所有 CSS / JS **404**，
> 打开后是**整页无样式**：`.wrapper` 不再限宽、`px-10` 内边距消失、body 还有默认 8px 边距，
> 于是插图看起来"顶到容器边缘/超出容器宽度"——**这是丢样式，不是几何问题**。
>
> 本地验证固定用下面这条（或部署环境下访问 `/solution/` 路径）：
>
> ```powershell
> Remove-Item env:CI -ErrorAction SilentlyContinue   # PowerShell；bash: unset CI
> pnpm run build; pnpm run preview
> ```

## 目录结构

```text
solution/
├─ fundamentals/            # Web 基础：HTML5、浏览器、HTTP、JavaScript、ES6、TypeScript
├─ frameworks/              # 框架与端：React、Vue、Svelte、语法对比、Taro、小程序、App 开发
├─ engineering/             # 工程化与适配：打包构建、Emmet、响应式、数据大屏、H5 唤起 APP
├─ career/                  # 职业成长：开源许可证、求职与职场
├─ roadmaps/index.md        # 学习路线图索引页（PDF 在 public/roadmaps/）
├─ public/                  # 静态资源，构建时原样复制到站点根目录
│  ├─ roadmaps/             # 47 份路线图 PDF（beginner / website-development / languages-platforms）
│  └─ *.svg                 # favicon、站点 Logo、页脚背景
├─ index.md                 # 首页（frontmatter：layout: home）
├─ .vitepress/
│  ├─ config.mts            # 导航 / 侧边栏 / 页脚 / head / markdown 扩展（唯一真相源）
│  └─ theme/
│     ├─ index.ts           # 主题入口：复用 VoidZero 主题 + 覆盖品牌资源
│     ├─ Layout.vue         # 首页营销布局与文档页布局的分发
│     ├─ styles.css         # 全站样式（6 段，宽度变量在第 2 段）
│     ├─ components/        # 首页区块组件（Hero、等距图、终端、能力面板……）
│     └─ data/              # 首页数据：features.ts、terminal.ts、topics.ts
├─ AGENTS.md                # 改动规范与「已修复问题防回归清单」
└─ package.json
```

`.vitepress/cache`、`.vitepress/dist`、`node_modules` 已在 `.gitignore` 中，不要手改或提交。

## 内容目录分类

| 目录            | 分类                                                                           |
| --------------- | ------------------------------------------------------------------------------ |
| `fundamentals/` | Web 基础（HTML5、浏览器、HTTP、JavaScript、ECMAScript 6、TypeScript）          |
| `frameworks/`   | 框架与端（React、Vue、Svelte、框架对比、Taro、微信小程序、App 开发）           |
| `engineering/`  | 工程化与适配（打包构建工具、Emmet、响应式与自适应、数据大屏适配、H5 唤起 APP） |
| `roadmaps/`     | 学习路线图索引页（PDF 原件位于 `public/roadmaps/`，随站点原样发布）            |
| `career/`       | 职业成长（开源许可证、求职与职场）                                             |

每个主题为 `<分类>/<主题>/index.md`，对应路由 `/<分类>/<主题>/`（站点开启 `cleanUrls`，站内链接统一写**带尾斜杠的绝对路径**）。
`public/` 下的文件原样复制到站点根目录，例如 `public/roadmaps/beginner/frontend-beginner.pdf` → `/roadmaps/beginner/frontend-beginner.pdf`。

## 编写与新增文档

一篇文档的结构（与现有文档保持一致）：

```md
# <主题> 标题

> 参考资料：
>
> - [名称](链接)
>
> 面向角色：中高级前端工程师。一句话说明本手册的侧重点与覆盖范围。

---

## 目录

- [一、第一章标题](#一、第一章标题)

---

## 一、第一章标题

### 1.1 小节标题

正文……
```

约定（细节见 `AGENTS.md` §3.2）：

- 标题层级不跳级（`#` → `##` → `###`），正文从 `##` 开始，章节编号用 `## 一、` / `### 1.1` 体例；
- 文首必须有 **H1 + 引用块**，「参考资料」用引用块内的无序列表，一行一条链接；
- 代码块**标注语言**（`js`、`bash`、`ts`、`text`），可复制的命令 / 配置优先；
- 图片、PDF 放 `public/`，正文用绝对路径引用；中文正文用中文标点，中英文之间留一个空格；
- `{{PLACEHOLDER}}` 这类占位符**原样保留**，构建期会统一转义，不要手改成 HTML 实体。

**新增一篇文档要改的位置**（漏改的典型症状：页面能打开，但侧栏里找不到、首页索引里没有）：

1. 新建 `<分类>/<主题>/index.md`；
2. `.vitepress/config.mts` 的 `sidebar` 对应分组追加一项（**必改**）；
3. `.vitepress/theme/data/topics.ts` 按首页需要同步分类 chips 与统计常量（`docCount` / `roadmapCount` / `categoryCount`）；
4. 若是学习路线图，另在 `roadmaps/index.md` 追加 PDF 链接；
5. 新增**分类**时，还要同步 `nav`、`footer.nav`、首页数据与本文件的分类表。

完整联动清单（a~k）与自查方法见 `AGENTS.md` §4.2。

## 文档「目录」锚点规则

VitePress 的标题 id 按自己的规则生成，**不是** GitHub 那种「去掉所有标点」的规则：

| 规则                          | 示例                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------- |
| 中文顿号 `、` 会**保留**      | `## 一、为什么必须选许可证` → `#一、为什么必须选许可证`                           |
| 空格 / `.` / `：` / `+` → `-` | `## 2.1 宽松式（Permissive）` → `#_2-1-宽松式permissive`                          |
| 括号、`&`、引号等会被删除     | `## 7、辅助技术：媒体查询 & CSS 容器查询` → `#_7、辅助技术-媒体查询-css-容器查询` |
| 以数字开头时前缀 `_`          | `## 11、开发最佳实践` → `#_11、开发最佳实践`                                      |
| 英文字母转小写                | `## 十、常见误区与 FAQ` → `#十、常见误区与-faq`                                   |

**不要手写猜锚点**：取真实锚点看标题左侧 `#` 上的链接或右侧「本页目录」；改完章节后比对
`dist/<分类>/<主题>/index.html` 里的 `<h2 id="...">` 与正文 `](#...)`。

## 导航、侧边栏与首页

- **导航 / 侧边栏 / 页脚 / head**：只在 `.vitepress/config.mts` 维护，不要在页面里硬编码；
  `nav` 的 `activeMatch` 保持 `^/<分类>/` 形式，侧边栏分组的顺序与内容目录一致。
- **首页数据**：集中在 `.vitepress/theme/data/`——`features.ts`（能力面板 + 命令卡）、
  `terminal.ts`（终端演示）、`topics.ts`（分类地图 / 站点信息，`docCount` / `roadmapCount` / `categoryCount` 等统计常量也在这里）。
- **首页文案**：Hero 与各区块标题直接写在 `Home.vue` 及其子组件中。

首页 = `index.md`（`layout: home`）+ `.vitepress/theme/Layout.vue` 的 home 分支，区块自上而下与参考站一一对应：

| 区块                          | 组件                                                     |
| ----------------------------- | -------------------------------------------------------- |
| Hero（标题 / 描述 / 按钮）    | `Home.vue`                                               |
| 技术栈等距图（可点击）        | `StackIsometric.vue`                                     |
| 命令速查终端（逐字动画）      | `TerminalPanel.vue`、`TerminalTranscript.vue`            |
| 快速开始（命令卡 + 复制）     | `InstallCommand.vue`                                     |
| 三大分类（3 格 / 3 列）       | `Home.vue`（`categories`）                               |
| 站点信息（4 格 / 2×2）        | `Home.vue`（`highlights` / `statRows` / `growthBlocks`） |
| 能力展示区（工具栏 + 5 面板） | `FeatureToolbar.vue`、`FeaturePanel.vue`                 |
| 收尾大标题                    | `Home.vue`                                               |
| 内容地图（自绘 SVG）          | `ClosingIllustration.vue`                                |
| 页脚                          | `SiteFooter.vue`                                         |

> ⚠️ **等距图 `StackIsometric.vue`（改动前必读）**
>
> - **内容**：每个方块都必须是仓库里已有的一篇文档，数据取 `data/topics.ts` 的 `categories`，不要另写标题 / 链接。
> - **几何**：2:1 等距投影；厚度用「同一圆角矩形向下偏移 `DEPTH` 叠两层」实现，不要手算六顶点（圆角处必出接缝）；台面要外扩 `FACE_PAD`。
> - **文字**：方块标签用 `textMatrix()`（切变保持很小 ≈13°，切变越大会让中文越糊）；只有台面前沿的长文字才用
>   `isoMatrix()`（字号约 26 并补 `letter-spacing` 约 7，否则相邻字糊成一团）。
>   ⚠️ **中文发虚的三个成因（都已修，改动前先看）**：① SVG **渲染宽度不是 `viewBox` 宽度的整数倍**——
>   曾用 `max-w-[76rem]`(1216) 渲染、缩放 0.95，字形落在半像素上；现在 `max-w-[80rem]`(1280) 与 `viewBox`
>   **1:1**。② 未开 `text-rendering: geometricPrecision`（默认 `auto` 会把带切变的字形吸附到像素网格）。
>   ③ 字号过小：标签字号整体上调 1px（卡片 12 / 13.5，方块 13 / 14.5 / 16）。
>   自查口径：`svg 渲染宽度 ÷ viewBox 宽度 = 1`、`text-rendering = geometricprecision`、最长标签 68px 且无溢出。
> - **线网**：方块必须落在导轨上，一条线只画一次，不要「先拉长辅助线、再给每块加分支线」。
>   导轨外端**不写死偏移量**，由 `Math.min(...cubes.map(c => c.at))` 推导，取该导轨上最外侧方块的**中心**：
>   手写偏移极易多伸出一截，在方块之外留下一条断头线（就是「末端多出了线条」），
>   或画到 `viewBox` 外被 `overflow: hidden` 齐平切掉（「超出容器宽度」，曾把 `from` 写成 -900，外框宽出 402px / 291px）。
>   实测口径：每条导轨端点 → 最近方块中心距离应为 **0px**（当前 4 条均为 0）。
> - **动画**：入场 `iso-in` → 导轨 `iso-draw` → 常驻 `iso-float`；CSS `transform` 会覆盖 SVG 的 `transform` 属性，动画必须挂在外层 `<g>` 上；`prefers-reduced-motion` 时直接呈现终态。
> - **自适应与紧凑度**：固定 `viewBox`（`min-w-[44rem]` + 外层 `overflow-x-auto`），**所有几何都要落在
>   `viewBox` 内**：方块中心屏幕 y = 250 + 0.5·(x + y)，太靠外会被上沿裁掉（Vue / 小程序 曾被顶出画布）；
>   导轨只比最外侧方块多伸约 65 单位。想更紧凑就**整体缩小方块 + 拉近与平台的距离**（同一导轨上相邻方块
>   中心间距别小于约 105，方块长对角线 = 0.866·(SAT_W+SAT_H) ≈ 123，再近会互相压住），不要去压边距。
>   改完实测「图形外框 vs 画布盒」：当前左右余量 214px / 150px、上下 28px / 12px、图形占宽 73%，
>   且 `scrollWidth === clientWidth`（无横向溢出）。

> ⚠️ **网格边框与外框连续性（改动首页前必读）**
>
> - Tailwind 的 `divide-x` / `divide-y` 只给「除第一个子元素外」的子元素加边框：单列 / 单行用它永远正确，
>   **会换行的网格只有「单元格数量整除列数」时才正确**（3 格 3 列、4 格 2×2、2 格 2 列）。
> - 条目多的列表放进格子里做单列 `divide-y`，不要再堆一层卡片网格；横向网格补 `divide-x-0 <bp>:divide-x`，避免窄屏堆叠时多出左边框。
> - 每个区块都是 `<section class="wrapper border-t">`（`.wrapper` 给左右竖线、`border-t` 给顶部分隔线），外框必须一路不断线：
>   不要照搬参考站的空白 `Spacer.vue`（会在页尾留下不封口的空框），除刻意全宽通栏外不要给中间区块加 `md:border-none`。
> - **自查**：构建后用无头浏览器统计「空的带边框块」（无文字/图片、四条边任一有边框、宽 ≥200 且高 ≥24）应为 **0**。

## 主题与样式

- **主题入口** `.vitepress/theme/index.ts`：复用 VoidZero 主题自带的 `enhanceApp`，并通过 `themeContextKey`
  覆盖品牌资源（`logoDark` / `logoLight` / `logoAlt` / `footerBg` / `monoIcon`，对应 `public/` 下的 svg）。
- **布局** `.vitepress/theme/Layout.vue`：首页走 `marketing-layout` 分支（`OSSHeader` + `Home` + `SiteFooter`），
  其余页面交给主题默认布局；首页会在运行时同步 `data-theme="light"`，避免用户系统深色偏好影响首屏。
- **样式** `.vitepress/theme/styles.css` 共 6 段：① 品牌色 ② 布局宽度统一配置 ③ 文档正文细节修正
  ④ 首页装饰 ⑤ 终端演示 ⑥ 能力展示区渐变。改动前先看清所在段落，不要零散写死宽度或颜色。

## 布局宽度配置

宽度集中在 `.vitepress/theme/styles.css` 的「布局宽度统一配置」段，改这一处即可全站生效：

| 变量                   | 作用                                                           | 当前值             |
| ---------------------- | -------------------------------------------------------------- | ------------------ |
| `--site-layout-width`  | 横向总宽（左侧导航 + 正文 + 右侧「本页目录」，首页营销区同宽） | `100rem`（1600px） |
| `--site-sidebar-width` | 左侧导航栏宽度（移动端抽屉同宽）                               | `272px`            |
| `--site-doc-width`     | 正文内容列宽度                                                 | `900px`            |
| `--site-aside-width`   | 右侧「本页目录」宽度                                           | `224px`            |

这四个变量要覆盖 `.content-wrapper`、`.wrapper`、`.VPLocalNav .container`、`.VPDoc .content-container`、
`.VPDoc .aside`、`.VPSidebar` 等容器，缺一处就会出现「某一横线对不齐」。其中 **`.wrapper` 必须写成全局选择器**，
不能写成 `.marketing-layout .wrapper`——页头在文档页不在 `.marketing-layout` 内，只覆盖后代会让页头比内容区窄 160px。

## 构建与部署

- `pnpm run build` 产出 `.vitepress/dist`（纯静态 HTML / CSS / JS），`public/` 下的文件原样复制到产物根目录；
- 产物是纯静态站点，可直接托管到任意静态服务器 / 对象存储 / Pages 服务；
- 线上发布走 GitHub Actions：`.github/workflows/deploy-docs.yml` 在推送到 `main` 后自动构建并部署到
  GitHub Pages，地址 <https://libao-jun.github.io/solution/>（首次需在仓库 **Settings → Pages** 把
  Source 选为 **GitHub Actions**，此后也可在 Actions 页面手动触发 `workflow_dispatch` 重新发布）；
- `config.mts` 的 `base` 按环境自动切换：CI（GitHub Actions）构建用子路径 `/solution/`，本地 `dev` / `preview`
  仍走**域名根路径** `/`。若改为自定义域名 / 独立站点（部署在根路径），把该行改成固定 `'/'`；
  若部署到其它子路径（如 `https://example.com/docs/`），改成对应前缀，否则资源会 404；
- 本地验证产物的正确姿势是 `pnpm run preview`，且**重建后要重启预览服务**（见上文提醒）。

## SEO

站点的搜索引擎优化集中在 `.vitepress/config.mts` 与 `public/robots.txt`，做法与参考站
[ordinary-coder](https://github.com/HumorFrank/ordinary-coder) 一致：

| 项目                     | 位置                                                              | 说明                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 站点标题 / 描述 / 语言   | `config.mts` 的 `siteTitle` / `siteDescription` / `siteLang`      | 驱动 `<title>`、`<meta name="description">` 与 JSON-LD                                                                                                 |
| 生产地址（绝对地址基准） | `config.mts` 的 `siteUrl`                                         | 固定为 `https://libao-jun.github.io/solution/`，与 `base` 解耦；换域名只改这一处（或用 `SITE_URL` 覆盖，末尾带 `/`）                                     |
| 站点级 head              | `config.mts` 的 `head`                                            | favicon / `keywords` / `robots` / `Cache-Control` / Open Graph（`og:type`、`og:site_name`、`og:locale`、`og:image`）/ Twitter Card                        |
| 每页 head                | `config.mts` 的 `transformHead`（`buildSeoHead`）                 | 每页生成 `canonical`、`og:title`、`og:description`、`og:url`、`twitter:*` 与 JSON-LD 结构化数据                                                         |
| 结构化数据               | 同上                                                              | 首页输出 `WebSite`，文档页输出 `TechArticle`（含 `dateModified`）                                                                                       |
| 站点地图                 | `config.mts` 的 `sitemap`                                         | 构建产出 `sitemap.xml`，`hostname` 取 `siteUrl`                                                                                                        |
| 抓取规则                 | `public/robots.txt`                                               | 允许全站抓取，并声明 `Sitemap` 地址                                                                                                                    |
| 页面更新时间             | `config.mts` 的 `lastUpdated`                                     | 开启后文档页脚展示「最后更新于」，并作为 JSON-LD 的 `dateModified`                                                                                     |
| 页头 Logo 根链接         | `config.mts` 的 `transformHtml` + `Layout.vue` 的 `fixThemeLogoLink` | 主题包把 Logo 写死为 `href="/"`，构建期补 `base`（爬虫可见），运行时再兜底一次（移动端菜单）                                                          |

构建后自查（产物在 `.vitepress/dist`）：

1. 页面 `<head>` 内有 `canonical` / `og:*` / `twitter:*` / `<script type="application/ld+json">`；
2. 产物根目录有 `sitemap.xml` 与 `robots.txt`；
3. 以 CI 模式构建（`$env:CI='true'; pnpm run build`）时，页内资源与站内链接都带 `/solution/` 前缀。

> ⚠️ **改站内链接 / 根路径资源必须补 `base`**：VitePress 只会给 **Markdown 正文里的链接**自动补 `base`，
> 主题组件、`head` 与页脚导航都不会。组件里用 `withBase()`（从 `vitepress` 导入），
> `config.mts` 里用本地同名辅助函数；`base` 在 CI 下是 `/solution/`，裸写 `/xxx` 会 404。

## 常见问题

| 现象                          | 原因与处理                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| 页面打开后完全无样式          | 重建后 preview 进程未重启（旧进程缓存了产物清单，新哈希文件 404）；重启 `pnpm run preview`   |
| 首页某处出现「空框」或缺边框  | 网格单元格数未整除列数，或给中间区块加了 `md:border-none` 导致外框断线                       |
| 点文档里的「目录」没反应      | 锚点是按 GitHub 规则手写的；改用标题左侧 `#` 或右侧「本页目录」里的真实链接                  |
| 新页面构建出来但侧栏里没有    | `.vitepress/config.mts` 的 `sidebar` 未登记该页面                                            |
| 首页数字与实际不符            | `data/topics.ts` 的 `docCount` / `roadmapCount` / `categoryCount` 未同步                     |
| 线上图标 / 首页插图 404       | 组件里写了根路径（如 `/icon.svg`）而 CI 下 `base` 是 `/solution/`；改用 `withBase('/icon.svg')` |
| canonical / sitemap 域名不对  | `config.mts` 的 `siteUrl` 未同步（或用 `SITE_URL` 环境变量覆盖，末尾带 `/`）                  |
| 线上站内链接 404              | 组件内 `<a :href>`、页脚 nav、favicon 未按 `base` 拼接；见「构建与部署」与 `AGENTS.md` §2.5            |

## 仓库协作说明

- `AGENTS.md` 是本仓库的改动规范与「已修复问题防回归清单」，改动导航 / 首页 / 主题 / 样式前建议先读；
  本文件负责「项目怎么用、怎么跑」，`AGENTS.md` 负责「改动怎么做、哪些坑不能踩」。
- 提交信息采用 Conventional Commits、描述用中文，例如 `feat(<主题>): 新增 <主题> 文档`、`fix(<主题>): 修复 <问题>`；
  一次提交只做一件事，新增文档时不要夹带无关改动。
- 不要升级 VitePress / `@voidzero-dev/vitepress-theme` / Vue 等核心依赖版本，也不要改动 `srcDir` 与
  `srcExclude`——会影响既有页面与路由，需先与维护者确认。
- `README.md`、`AGENTS.md` 已通过 `srcExclude` 排除，不会生成站点页面。
