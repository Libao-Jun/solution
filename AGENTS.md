# AGENTS.md

> 本文件是本仓库的**代理工作规范（规范 / 边界 / 流程）**，面向在本仓库中执行任务的 AI 助手与协作者。
> 站点介绍与首页区块清单见 `README.md`；首页改动细则（等距图 / 网格边框）见本文件 §2.6。本文件不重复介绍，只回答三件事：**能改什么（边界）、怎么写（规范）、按什么顺序做（流程）**。
>
> **第一条铁律（先读这条）：修样式、补内容、加需求，都不得影响既有正常功能；任何已修复过的 bug 都不得在后续改动中被覆盖或回退。** 详见 §2.4 与 §2.5。
>
> **第二条铁律：任务或对话收尾时必须执行一次收尾 Code Review（§4.6），判定本次改动是否存在问题；有问题就修复并复验，直到问题清零，不得带问题收尾。**

## 0. 一句话认识本仓库

`solution` 是一个 **VitePress 文档站**：内容全部来自本仓库已有的 Markdown，站点工程只做「渲染 + 导航 + 主题」。
`srcDir` 即仓库根目录，`.vitepress/` 是站点配置与自定义主题，`README.md` 被 `srcExclude` 排除、不生成页面。

---

## 1. 目录地图与真相源

| 路径                                                  | 职责                                                                       | 是否可改                  |
| ----------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------- |
| `fundamentals/`                                       | Web 基础文档（HTML5、浏览器、HTTP、JS、ES6、TS）                           | ✅ 正文可改               |
| `frameworks/`                                         | 框架与端（React、Vue、Svelte、语法对比、Taro、小程序、App）                | ✅ 正文可改               |
| `engineering/`                                        | 工程化与适配（打包构建、Emmet、响应式、数据大屏、H5 唤起）                 | ✅ 正文可改               |
| `roadmaps/`                                           | 学习路线索引页（PDF 原件在 `public/roadmaps/`）                            | ✅ 索引可改，PDF 不改     |
| `career/`                                             | 职业成长（开源许可证、求职与职场）                                         | ✅ 正文可改               |
| `public/`                                             | 静态资源，构建时**原样**复制到站点根（含 SEO 用的 `robots.txt`）            | ✅ 新增图片/PDF           |
| `.vitepress/config.mts`                               | **导航 / 侧边栏 / 页脚 / head / SEO / markdown 扩展的唯一真相源**          | ✅ 维护级                 |
| `.vitepress/theme/`                                   | 自定义主题：`index.ts`、`Layout.vue`、`styles.css`、`components/`、`data/` | ✅ 维护级                 |
| `.vitepress/theme/data/topics.ts`                     | **首页索引数据的唯一真相源**（`topicGroups` / `categories` / 统计常量）    | ✅ 维护级                 |
| `.agents/skills/`                                     | **Skill 真相源**（`SKILL.md` + `references/` + `agents/`）                 | ✅                        |
| `.codebuddy/skills/`                                  | 指向 `.agents/skills/<name>` 的 **Junction**（供 CodeBuddy 发现）          | ⚠️ 只改链接，不在此写内容 |
| `skills-lock.json`                                    | 锁定第三方 Skill 的来源与哈希                                              | ✅ 新增 skill 时同步      |
| `.github/workflows/`                                  | GitHub Pages 发布流水线（`deploy-docs.yml`：推送 `main` → 构建 → 部署 Pages） | ✅ 维护级                 |
| `README.md` / `index.md`                              | 仓库说明 / 首页入口                                                        | ✅                        |
| `.vitepress/dist`、`.vitepress/cache`、`node_modules` | 构建产物与依赖，**已 gitignore**                                           | ❌ 禁止手改/提交          |

> 一句话规则：**内容在分类目录，导航在 `config.mts`，首页在 `data/*.ts`，Skill 在 `.agents/skills/`。** 四者互相引用的部分必须同步改。

---

## 2. 边界（Boundaries）

### 2.1 可以直接做

- 新增 / 编辑 `分类/主题/index.md` 正文。
- 在 `.vitepress/config.mts` 的 `sidebar` / `nav` / `footer` 中登记新页面。
- 在 `.vitepress/theme/data/` 中同步首页索引与统计数字。
- 向 `public/` 增加图片、PDF 等静态资源。
- 在 `.agents/skills/` 下新增本地 Skill。

### 2.2 禁止 / 不要做（除非用户明确要求）

- ❌ 手改或提交 `.vitepress/dist`、`.vitepress/cache`、`node_modules`。
- ❌ 修改 `public/roadmaps/*.pdf` 等二进制原件（只加不改）。
- ❌ 在 `.codebuddy/skills/` 里另写一份内容（它是 Junction，改内容要改 `.agents/skills/` 的源）。
- ❌ 改第三方 Skill（`code-review` / `vitepress` / `vue-best-practices`）的 `SKILL.md` 与 `references/`——它们由上游生成，改内容会与 `skills-lock.json` 的哈希失配；需要定制请**新建**自己的 Skill。
- ❌ 升级 `vitepress`（当前 `2.0.0-alpha`）、`@voidzero-dev/vitepress-theme`、`vue` 等核心依赖版本。
- ❌ 改 `srcDir`、删除 `srcExclude: ['README.md']`、改动首页布局骨架（`Layout.vue` / `components/Home.vue` 的区块顺序）。
- ❌ 手动把正文里的 `{{PLACEHOLDER}}` 改写成 HTML 实体或 `<code>`——渲染期已由 `config.mts` 统一转义，源文件必须保持原样。
- ❌ 使用 `npm` / `yarn`（本仓库统一 `pnpm`，见 `packageManager`）。

### 2.3 需要先与用户确认

- 新增**内容分类**（新开一个顶层目录，如 `ai/`）——涉及 nav、sidebar、footer、首页、README 五处联动。
- 删除或重命名**已存在的路由**（`/分类/主题/`）——会破坏站内/外部链接与锚点。
- 大规模重排导航顺序、或改动 `styles.css` 里的布局宽度变量。
- 改动首页组件结构与 Tailwind 网格边框写法（易触发「缺边框」回归，细则与自查口径见 §2.6、防回归条目见 §2.5）。

### 2.4 ★ 不可回退原则（回归红线）

> 无论修样式、补内容还是加新需求，都必须遵守以下三条。这是硬性约束，优先级高于「让新需求更好看/更简洁」。

1. **不得影响既有正常功能**：改动前先明确「这次要动的东西被谁依赖」，改完后原有的导航、侧边栏、首页区块、搜索、深色模式、右侧目录、《本页目录》锚点、PDF 链接等必须**和改动前一致地正常工作**。
2. **不得覆盖已修复的 bug**：历史修复过的坑（见下方清单）在后续任何改动中都**不得被推翻或"顺手整理掉"**。若确实需要动，必须先说明理由并取得用户确认，且改动后要重新验证原问题不再复现。
3. **只做加法，谨慎做减法**：新增需求允许新增文件/新增配置项；删除、重命名、重排既有内容属于高风险动作，必须先确认影响面（谁引用了它：`config.mts`、`data/topics.ts`、`README.md`、正文交叉链接）。

### 2.5 已修复问题防回归清单（改动相关文件前先读）

| 位置                                      | 已修复的坑                                                                                                          | 不得回退为                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `.vitepress/config.mts` `markdown.config` | `escape-double-braces` 规则 + `code_inline` 加 `v-pre`，解决正文 `{{PLACEHOLDER}}` 被 Vue 当作插值报错              | 移除/简化这两段转义                               |
| `.vitepress/config.mts`                   | `srcExclude: ['README.md']`，README 不生成页面                                                                      | 删除该项导致 README 被编译                        |
| `.vitepress/config.mts`                   | `cleanUrls: true` + 链接统一带尾斜杠                                                                                | 改回不带尾斜杠导致 404                            |
| `.vitepress/config.mts`                   | `ignoreDeadLinks: true`（保留原文交叉链接）                                                                         | 关掉导致构建因历史链接失败                        |
| `.vitepress/theme/styles.css`             | 「布局宽度统一配置」段 4 个变量映射到 VitePress 官方变量                                                            | 在别处零散写死宽度                                |
| `.vitepress/theme/index.ts`               | `themeContextKey` 覆盖 `logoDark/logoLight/footerBg/monoIcon`                                                       | 删掉覆盖导致品牌资源失效                          |
| `.vitepress/theme/Layout.vue`             | 首页运行时同步 `data-theme="light"`，避免系统深色偏好污染首屏                                                       | 移除该同步逻辑                                    |
| 首页网格（`Home.vue` / `data/topics.ts`） | 带边框网格单元格数**整除列数**（3/4/2），多条目列表放格子内做单列 `divide-y`，横向网格补 `divide-x-0 <bp>:divide-x` | 直接给会换行的网格套 `divide-x/y`，导致末行缺边框 |
| 首页动效（`animations/motion.ts` + 各组件的 `useMotion()`） | 入场起点用 `gsap.set()` 在 JS 侧生成、终值用 `gsap.to()` 显式写死（**不用 `gsap.from()`**：它的终值靠回读元素当前值，会被别的动画/CSS 过渡记错）；命中 `prefers-reduced-motion` 时一个动画都不建；GSAP/ScrollTrigger 只能动态 `import()`；每个用 `useMotion()` 的根节点必须带 `data-motion-scope` | 用 CSS 先隐藏再由 JS 显形（JS/GSAP 失败 = 整块内容不可见）；改用 `from()` 导致元素停在中途状态（实测 Hero CTA 停在 `opacity: 0`）；去掉 scope 判定导致同一元素被建两份动画互相抢 opacity |
| `.codebuddy/skills/<name>`                | 指向 `.agents/skills/<name>` 的 Junction                                                                            | 改成复制两份内容导致源漂移                        |
| `.vitepress/config.mts` `base`            | 按 `process.env.CI` 切换：CI 用 `/solution/`（GitHub Pages 子路径），本地 dev/preview 用 `/`                        | 写死 `/` 导致 Pages 上静态资源全 404              |
| 主题组件 / `config.mts` 的根路径链接与资源 | 一律经 `withBase()` 补 `base`（VitePress **只**给 Markdown 正文链接自动补 base；组件、`head`、页脚导航都不会）      | 写成裸 `/xxx`，CI 子路径部署下 404                |
| 页头 Logo 根链接（`config.mts` `transformHtml` + `Layout.vue`） | 主题包页头写死 `href="/"`：构建期 `transformHtml` 只匹配精确的 `href="/"` 补 `base`，运行时 `fixThemeLogoLink()` 兜底（含移动端菜单动态插入的链接） | 删除后子路径部署点 Logo 会跳到域名根目录 |
| `.vitepress/config.mts` SEO 段            | 站点级 `head`（keywords / robots / OG / Twitter / Cache-Control）+ 每页 `transformHead`（`canonical` / 每页 OG / JSON-LD `WebSite`·`TechArticle`）+ `lastUpdated` | 删掉/简化会导致 TDK、canonical、分享卡片、结构化数据丢失 |
| `.vitepress/config.mts` `sitemap`         | `hostname` 取 `siteUrl`（生产地址），构建产出 `sitemap.xml`；**末尾斜杠不可去**                                    | 去掉斜杠导致子路径下 sitemap 里的地址错误         |
| `public/robots.txt`                       | 允许抓取并声明 `Sitemap` 地址                                                                                      | 删除导致爬虫规则与 sitemap 发现路径丢失           |
| 子路径部署下的站内链接                    | 组件内 `<a :href>` 一律走 `withBase()`；`head` 的 favicon 与页脚 `footer.nav` 在 `config.mts` 里用本地 `withBase()` 拼 base；主题包写死的 Logo 链接在 `Layout.vue` 里按 base 纠正 | 直接写 `/xxx/`，子路径部署下链接与 favicon 全 404 |

> 遇到「新需求要求推翻清单中某项」时：**先停下来说明冲突并征询用户**，不要自行判断「这次可以例外」。

### 2.6 首页改动细则（等距图 / 网格边框 / 动效，改动前必读）

> 首页最容易踩坑、且反复修复过的两块是等距图 `StackIsometric.vue` 与首页网格边框。改动这两处前先读完本节；对应的防回归条目见 §2.5，仓库只在这里维护这部分实现细节（`README.md` 仅保留首页区块清单）。

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
> - **动画（两层，别混）**：① **入场由 GSAP 一条时间线编排**（`StackIsometric.vue` 的 `useMotion`）：投影 → 平台升起 → 正面文字字距收拢 → 台面 6 格 → 导轨从平台向外「生长」→ 导轨方块沿轨滑入 → 底部连线画出 + 卡片飞出 → 装饰虚线浮现；进场方向由数据侧 `drift` 给出（**导轨上的方块严格沿所在导轨**、卡片沿它到平台的连线），不要用 `svgOrigin` 之类把缩放原点挪到平台中心——那会粘在元素上、连带改掉后续悬停缩放的原点。SVG 上的 `.is-motion` 会停用 CSS 的 `iso-in` / `iso-draw`，**必须停**：这两条 animation 是 `fill-mode: both`，动画终值以「动画优先级」压掉内联样式（实测会让悬停变暗、虚线流动全部失效）。
>   ② **常驻循环仍走 CSS**：`iso-float`（漂浮）/ `iso-drift`（台面虚线流动）/ `iso-shadow`（投影呼吸），GSAP 一律不碰 `.float` 这一层——同一个元素上 CSS `transform` 会覆盖 SVG 的 `transform` 属性，两套必须分层。CSS 入场保留为兜底（无 JS / GSAP 加载失败 / `prefers-reduced-motion`）。
> - **悬停交互**：以方块自身中心缩放 1.07、同类方块变暗到 0.42、所在导轨 / 连线高亮成品牌色并跑一条流动虚线（虚线周期 10+6=16，offset 每轮走 -16 才不跳变）；交互在入场时间线 `onComplete` 后才绑定，避免与入场 tween 抢同一批 `scale` / `opacity`。
>   ★ 缩放必须写 `gsap.to(el, { scale })`，**不要用 `gsap.quickTo(el, 'scale')`**：SVG 的 scale 在 CSSPlugin 里被拆成 scaleX / scaleY，`quickTo` 的 `resetTo('scale')` 找不到同名 propTween 会**静默不生效**（实测矩阵恒为 identity；HTML 元素的 `quickTo('x' / 'y')` 正常，Hero CTA 磁吸就是用它）。
>   另：`StackIsometric.vue` 里元素列表一律用 `*Els` 后缀（`tileEls` / `railEls` / `lineEls`…），别和同名的数据数组（`tiles` / `rails` / `cards` / `satellites`）撞名——撞名会让 `tiles[i].drift` 读到 SVG 元素，整条入场时间线抛错。
> - **自适应与紧凑度**：固定 `viewBox`（`min-w-[44rem]` + 外层 `overflow-x-auto`），**所有几何都要落在
>   `viewBox` 内**：方块中心屏幕 y = 250 + 0.5·(x + y)，太靠外会被上沿裁掉（Vue / 小程序 曾被顶出画布）；
>   导轨只比最外侧方块多伸约 65 单位。想更紧凑就**整体缩小方块 + 拉近与平台的距离**（同一导轨上相邻方块
>   中心间距别小于约 105，方块长对角线 = 0.866·(SAT_W+SAT_H) ≈ 123，再近会互相压住），不要去压边距。
>   改完实测「图形外框 vs 画布盒」：当前左右余量 214px / 150px、上下 28px / 12px、图形占宽 73%，
>   且 `scrollWidth === clientWidth`（无横向溢出）。

> ⚠️ **网格约定：边框与外框连续性（改动首页前必读）**
>
> - Tailwind 的 `divide-x` / `divide-y` 只给「除第一个子元素外」的子元素加边框：单列 / 单行用它永远正确，
>   **会换行的网格只有「单元格数量整除列数」时才正确**（3 格 3 列、4 格 2×2、2 格 2 列）。
> - 条目多的列表放进格子里做单列 `divide-y`，不要再堆一层卡片网格；横向网格补 `divide-x-0 <bp>:divide-x`，避免窄屏堆叠时多出左边框。
> - 每个区块都是 `<section class="wrapper border-t">`（`.wrapper` 给左右竖线、`border-t` 给顶部分隔线），外框必须一路不断线：
>   不要照搬参考站的空白 `Spacer.vue`（会在页尾留下不封口的空框），除刻意全宽通栏外不要给中间区块加 `md:border-none`。
> - **自查**：构建后用无头浏览器统计「空的带边框块」（无文字/图片、四条边任一有边框、宽 ≥200 且高 ≥24）应为 **0**。

> ⚠️ **首页动效（GSAP，改动前必读）**
>
> - **唯一入口**是 `.vitepress/theme/animations/motion.ts`（组件不要各自 `import gsap`）：GSAP 与 ScrollTrigger **只在浏览器端动态 `import()`**（不进入首屏 entry chunk，构建期不求值），组件一律用 `useMotion()` 挂载，卸载（含 SPA 切路由）时自动 revert 内联样式与 ScrollTrigger。
> - ★ **不得用 CSS 先隐藏元素再等 JS 显形**：入场起点只能用 `gsap.set()` 在 JS 侧生成——JS / GSAP 失败时页面必须是完整静态内容（这是首页「白屏」类事故的根因）。
> - ★ **写动用 `gsap.set()` 造起点 + `gsap.to()` 写显式终值，不要用 `gsap.from()`**：`from()` 的「终值」是运行时回读元素当前值，元素一旦正处于别的动画或 CSS 过渡的中间态就会被记错——实测 Hero CTA 按钮（排在时间线靠后、且带 `transition-all`）终值被记成 0，时间线跑完仍停在 `opacity: 0; visibility: hidden`。`to()` 的终值写死，任何情况下都会回到它。
> - 命中 `prefers-reduced-motion: reduce` 时**一个动画都不建**，直接呈现静态终态；实测口径：无任何内联样式、全部元素 `opacity = 1`。
> - 标记约定：`data-reveal`（可选 `up`（默认）/ `scale` / `left` / `right`）做滚动入场，分组容器取最近的 `[data-reveal-group]` 或 `<section>`；`data-count` 做数字滚动（从 SSR 文本里解析数字，回填时保留前后缀）；Hero 用 `data-hero-step`（按 DOM 顺序错落）与 `data-hero-cta`（按钮组磁吸）。
> - ★ **每个用 `useMotion()` 的组件根节点必须带 `data-motion-scope`**：`revealOnScroll()` 只处理「最近 scope 祖先 === 本 root」的 `[data-reveal]`。漏掉会让 `Home.vue` 把子组件（等距图 / 快速开始 / 工具栏）的标记一起收进来，同一元素被建两份 tween 互相抢 opacity（症状：滚到底后部分文案仍 `opacity: 0`）。
> - **SVG 元素**：CSS transform 会覆盖 SVG 的 `transform` 属性——带等距矩阵 / `translate(...)` 的元素（等距图方块、内容地图卡片组）只能动画其**没有 transform 属性**的外层 `<g>`，或改用透明度；等距图方块的悬停缩放挂在 `<a class="iso-tile">` 上（内部 `.float` 跑 CSS 漂浮，是不同元素，互不覆盖）。
> - Hero CTA 的磁吸位移需要 CSS 让路（`styles.css` 第 7 段，两条都不可删）：① `.marketing-layout [data-hero-cta] .button { transition-property: … }` 把 `transform` 从过渡属性里摘掉交给 GSAP 独占（**必须保留 `scale`**）；② `.marketing-layout [data-hero-cta] .button:hover { scale: 105% !important }`——GSAP 一写 transform 就会顺带写下内联 `scale: none`，把主题 `hover:scale-105` 压掉，这条负责把它抢回来。
> - **复现口径**：`pnpm run build` 后静态托管 `.vitepress/dist`，无头 Edge + CDP 慢速滚到底，断言「`[data-reveal]` / `[data-hero-step]` 全部 `opacity ≥ 0.95`」「`data-count` 回到原值」「`[data-panel-window]` / `[data-map-card]` 为 1」；再用 `Emulation.setEmulatedMedia` 模拟减少动态效果，断言无内联样式且全部可见。

---

## 3. 规范（Standards）

### 3.1 内容组织规范

- 每个主题是 `<分类>/<主题>/index.md`，对应路由 `/<分类>/<主题>/`。
- **目录名用小写英文 + kebab-case**（如 `responsive-vs-adaptive`、`data-screen-adaptation`），不使用中文或驼峰。
- 站点开启 `cleanUrls: true`，站内链接一律写成**带尾斜杠的绝对路径**：`/fundamentals/http/`。
- 新增主题的原文链接（参考资料）保留在文首引用块，不做改写。
- **★ 新增文档「全量联动」原则**：新增任何一篇 `xx.md`（**不论分类、不论是否首次出现**）都不是「只加一个文件」，而是「加文件 + 把全项目中所有需要登记/引用它的地方一次改齐」。**漏改任何一处都视为任务未完成**（典型后果：页面能构建出来但侧边栏里找不到、首页索引里没有、统计数字是旧值）。完整清单见 §4.2 Step 6。

### 3.2 文档书写规范（新增 / 编辑 `xx.md` 必须遵守）

文档骨架（与现有文档一致）：

```md
# <主题> 标题

> 参考资料：
>
> - [名称](链接)
> - [名称](链接)
>
> 面向角色：<如 中高级前端工程师>。一句话说明本手册的侧重点与覆盖范围。

---

## 目录

- [一、第一章标题](#一、第一章标题)
- [二、第二章标题](#二、第二章标题)

---

## 一、第一章标题

### 1.1 小节标题

正文……
```

硬性要求：

- **标题层级不跳级**：`#` → `##` → `###`，正文从 `##` 开始。
- 文首必须有 **H1 + 引用块**（参考资料 + 面向角色/文档定位）。
- **「参考资料」必须用引用块内的无序列表**（`> - [名称](链接)` 每行一条），**禁止**用 `、` 把多个链接连成一行；
  列表与其后的「面向角色」之间用一行 `>` 空行分隔。
- 章节编号用「`## 一、` / `### 1.1`」体例，`## 目录` 的编号与正文标题一一对应。
  **目录锚点不要手写猜**：VitePress 保留中文顿号 `、`、把空格/`.`/`：`/`+` 转为 `-`、数字开头加 `_` 前缀，
  正确写法是把鼠标移到标题左侧 `#` 上复制真实链接（详见 README「文档『目录』锚点规则」）。
- 代码块**必须标注语言**（如 `js`、`bash`、`ts`、`text`），可复制的命令、配置、片段优先。
- 中文正文使用中文标点；中英文/数字之间保留一个空格；不滥用 emoji。
- 表格列对齐（`| --- |`），行内术语首次出现给中英对照（如 `跨域（CORS）`）。
- 图片、PDF 等资源放 `public/`，正文用绝对路径引用，如 `/roadmaps/beginner/frontend-beginner.pdf`、`/foo/diagram.png`。
- **不留空章节、不留 TODO**；内容风格与同分类其他文档保持一致。
- 占位符 `{{PLACEHOLDER}}` 原样保留（渲染期统一转义）。

### 3.3 VitePress 工程规范

- 导航、侧边栏、页脚、head、搜索**只在 `.vitepress/config.mts` 维护**，不要在页面里硬编码。
- 侧边栏分组与内容目录一一对应；`nav` 的 `activeMatch` 保持 `^/<分类>/` 形式。
- 自定义主题入口 `.vitepress/theme/index.ts`；页面布局覆写在 `Layout.vue`；样式集中在 `styles.css`。
- 全局宽度只改 `styles.css` 的「布局宽度统一配置」段（`--site-layout-width` 等 4 个变量），改一处全站生效。
- 首页数据只改 `.vitepress/theme/data/topics.ts`（索引与统计）与 `terminal.ts`（终端演示）。
- 首页带边框网格：**单元格数必须整除列数**（3 格 3 列、4 格 2×2、2 格 2 列）；多条目列表放进格子内做单列 `divide-y`；横向网格补 `divide-x-0 <bp>:divide-x`（改动细则与自查口径见 §2.6）。
- `topics.ts` 的 `docCount` / `roadmapCount` / `categoryCount` 必须与实际情况同步，不能留旧值。
- **SEO 只在 `config.mts` 维护**：站点标题 / 描述 / 语言取自 `siteTitle`、`siteDescription`、`siteLang`；
  `canonical` / `sitemap` / `og:url` 的唯一基准是 `siteUrl`（与 `base` 解耦，换域名只改这一处，或用 `SITE_URL` 覆盖且末尾带 `/`）；
  每页 TDK 与 JSON-LD 由 `buildSeoHead`（`transformHead`）生成；抓取规则见 `public/robots.txt`。
- 组件与 `config.mts` 里引用站内链接 / 根路径资源**必须经 `withBase()`**（组件从 `vitepress` 导入，
  `config.mts` 用本地同名辅助函数）——`base` 在 CI 下是 `/solution/`，裸写 `/xxx` 会 404。

### 3.4 Skill 规范（`.agents/skills/` 与 `.codebuddy/skills/`）

一个 Skill 的标准结构：

```text
.agents/skills/<name>/
├── SKILL.md            # 必需：front-matter + 指令集
├── references/         # 可选：细节参考文档（由 SKILL.md 以表格索引）
│   └── <topic>.md
├── agents/
│   └── openai.yaml     # 可选：界面展示信息
└── GENERATION.md       # 生成类 Skill：来源 / SHA / 生成日期
```

`SKILL.md` front-matter 约定：

```yaml
---
name: <kebab-case 名称>
description: "<一句话说明能力 + 何时使用（Use when ...），第三人称、英文、单行>"
license: MIT # 可选
metadata: # 可选
  author: <来源>
  version: "<版本>"
  source: <生成来源>
---
```

正文约定（参考 `.agents/skills/code-review/SKILL.md`）：

- 先一段「这个 Skill 做什么」，再进入 `## Process` 的**编号步骤**，全程祈使句。
- 需要细节时把内容拆到 `references/<topic>.md`，在 SKILL.md 用**表格**给出「主题 / 说明 / 参考文件」索引。
- `agents/openai.yaml` 只写展示信息：

```yaml
interface:
  display_name: "Code Review"
  short_description: "Review a diff on standards and spec"
```

- `.codebuddy/skills/<name>` 必须是指向 `.agents/skills/<name>` 的 **Junction**（Windows：`cmd /c mklink /J "路径\.codebuddy\skills\<name>" "路径\.agents\skills\<name>"`），**不要复制两份内容**。
- 新增**第三方** Skill 后，在 `skills-lock.json` 登记 `source` / `sourceType` / `skillPath` / `computedHash`。

### 3.5 提交信息规范

采用 Conventional Commits，描述用中文，形如：

```text
feat(<主题>): 新增 <主题> 文档
fix(<主题>): 修复 <问题>
chore(<主题>): 优化和补充 <内容>
```

一次提交只做一件事；新增文档的提交不应夹带主题/配置无关改动。

---

## 4. 流程（Workflows）

### 4.0 总流程总览

```text
收到需求
  │
  ├─ 新增主题文档 ─────────→ §4.2（Step 6 全量联动 a~k + Step 6.5 全量排查，一处不漏）
  ├─ 编辑已有文档 ─────────→ §4.3
  ├─ 改导航 / 侧栏 / 首页 ─→ §4.4
  ├─ 新增 / 更新 Skill ────→ §4.5
  └─ 评审他人改动 ─────────→ §4.6
  │
  ▼
【改前】确认影响面：谁引用了要改的东西？是否触碰 §2.5 防回归清单？  ← 必做
  │
  ▼
§4.1 本地验证（dev 逐页点开 + build 通过）
  │
  ▼
【改后】回归验证：改动点 + 原有功能 + 清单项逐条确认无回归   ← 必做
  │
  ▼
§5 完成前自检清单
  │
  ▼
★ §4.6 收尾 Code Review（三轴：Standards / Spec / Regression）  ← 任务/对话完成必做，不得跳过
  │        │
  │        └─ 发现任何问题 → 立即修复 → 重跑 §4.1 回归验证 → 再评一次（直到问题清零）
  ▼
问题清零后提交（§3.5）
```

### 4.1 本地开发与验证（含回归验证）

任何一次改动都必须走完「改前确认影响面 → 改 → 改后回归验证」，**不得只验证新功能**：

**改前（确认影响面）**

1. 定位要改的文件，并列出它被谁引用（`config.mts` / `data/topics.ts` / `README.md` / 正文交叉链接 / 主题组件）。
2. 对照 §2.5 防回归清单，确认本次改动是否触碰清单中的模块；若触碰，按 §2.4 规则先说明并取得确认。

**改后（回归验证）**

1. 验证本次改动本身生效（新内容/新样式达到预期）。
2. 验证「改动点周边」的原有功能未被影响：同页其他区块、同分组其他页面、首页、搜索、深色模式。
3. 验证清单项未被回退：`{{}}` 占位符仍正常显示、`README.md` 仍未生成页面、页内目录锚点仍可跳转、首页网格仍无缺边框、品牌 Logo/页脚背景仍正常。
4. `pnpm run build` 通过（构建期错误即视为回归，必须修完再提交）。

```bash
pnpm install       # 安装依赖
pnpm run dev       # 本地开发，默认 http://localhost:5173
pnpm run build     # 构建校验：md 语法、花括号插值、死链等都会在此暴露
pnpm run preview   # 预览构建产物
```

- **只用 `pnpm`**。
- 任何内容或配置改动，结束前必须能 `pnpm run build` 通过。

### 4.2 ★ 新增 `xx.md`（新增主题文档）标准流程

**Step 1 · 定位置**
确认分类（`fundamentals/` `frameworks/` `engineering/` `career/` 或新分类）与主题目录名（小写 kebab-case）。新分类先按 §2.3 与用户确认。

**Step 2 · 建文件**
`<分类>/<主题>/index.md`。

**Step 3 · 写头部**
H1 标题 + 引用块（参考资料、面向角色/文档定位）。

**Step 4 · 写目录**
`## 目录` 编号索引，条目与正文章节标题严格一致。

**Step 5 · 写正文**
按 `## 一、…` → `### 1.1 …` 展开；代码块标语言；表格对齐；遵守 §3.2 全部硬性要求。

**Step 6 · 挂到站点（关键，必须逐项核对；★ 全量联动，一处都不能漏）**

| #   | 位置                                            | 何时必改             | 要改什么                                                                                |
| --- | ----------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| a   | `.vitepress/config.mts` → `sidebar`             | **每次新增都必改**   | 对应分组 `items` 追加 `{ text: '<标题>', link: '/<分类>/<主题>/' }`                     |
| b   | `.vitepress/config.mts` → `nav`                 | 新增**分类**时       | 加一项 `{ text, link: '/<分类>/<主题>/', activeMatch: '^/<分类>/' }`                    |
| c   | `.vitepress/config.mts` → `footer.nav`          | 新增分类 / 需页脚曝光 | 把链接加入合适分组                                                                      |
| d   | `.vitepress/theme/data/topics.ts` → `topicGroups` | **每次新增都必改** | 对应分组追加 `{ title, details, link }`                                                 |
| e   | `.vitepress/theme/data/topics.ts` → `categories` | 需进首页「三大分类」 chips | 追加 `{ text, link }`                                                             |
| f   | `.vitepress/theme/data/topics.ts` → 统计常量     | 数量变化时           | `docCount` +1；路线图另加 `roadmapCount`；新分类加 `categoryCount`                        |
| g   | `README.md` → 「内容目录分类」表                 | 新增分类 / 首个主题  | 更新表格                                                                                |
| h   | `README.md` → 其他相关描述                      | 影响描述时           | 同步「首页组成」「目录结构」等段落                                                       |
| i   | `roadmaps/index.md`                             | 新增学习路线图时     | 追加 PDF 链接                                                                            |
| j   | `public/`                                       | 有图片 / PDF 时      | 放入对应子目录，正文用绝对路径（如 `/roadmaps/beginner/x.pdf`）引用                       |
| k   | 其他文档正文的交叉链接                          | 该主题被别处提及     | 补充 / 修正指向新页面的链接                                                              |

**Step 6.5 · 全量排查（防止漏改，必做）**

用**现有任一文档的路由片段**（如 `data-screen-adaptation` 或 `/frameworks/vue/`）在**整个项目**中做一次全量搜索，得到「引用点全集」，再对照 Step 6 表格确认新文档已覆盖全部同类位置：

```bash
# 以仓库根为工作目录，被 srcExclude/gitignore 的部分会自动排除
rg -n "data-screen-adaptation|/engineering/data-screen-adaptation/" .
```

判定标准：**搜索命中的每一类位置（sidebar / nav / footer / topics.ts / README / 其他正文），新文档都必须同样在其中出现**。只要有一类位置旧文档在、新文档不在，就是漏改，必须补齐后再进入 Step 8。

**Step 7 · 附随资源（如有）**
图片 / PDF 放 `public/<子目录>/`，正文用绝对路径引用；
若属学习路线，另需同步 `roadmaps/index.md` 列表与 `topics.ts` 的 `roadmapCount`。

**Step 8 · 验证（新增 + 回归）**
`pnpm run dev` 后逐页点开：左侧对应分组、顶部导航、首页索引/统计、右侧「本页目录」全部正确 → **再按 §4.1 回归验证确认既有页面未受影响** → `pnpm run build` 通过。

**Step 9 · 提交**
`feat(<主题>): 新增 <主题> 文档`。

> 一张「新增文档检查清单」（**a~k 逐项打勾，缺一即未完成**）：

- [ ] `<分类>/<主题>/index.md` 已创建，结构符合 §3.2
- [ ] (a) `config.mts` sidebar 已登记（漏登记 = 页面构建出来但侧栏里找不到）
- [ ] (b) 新分类已加 `nav`（含 `activeMatch`）
- [ ] (c) `footer.nav` 已按需补充
- [ ] (d) `data/topics.ts` 的 `topicGroups` 已追加条目
- [ ] (e) `data/topics.ts` 的 `categories` chips 已按需补充
- [ ] (f) `docCount` / `roadmapCount` / `categoryCount` 等统计常量已同步
- [ ] (g) `README.md` 「内容目录分类」表已更新
- [ ] (h) `README.md` 其他受影响描述已同步
- [ ] (i) `roadmaps/index.md` 已追加（路线图 PDF）
- [ ] (j) 附随资源已放 `public/` 并用绝对路径引用
- [ ] (k) 其他文档中的交叉链接已按需补充
- [ ] **Step 6.5 全量排查已做：旧文档命中过的每一类位置，新文档都已出现**
- [ ] **既有导航 / 侧栏 / 首页 / 搜索未受影响（§4.1 回归验证）**
- [ ] `pnpm run build` 通过
- [ ] 提交信息符合 §3.5

### 4.3 编辑已有文档

1. 只改正文内容，**不随意重排章节顺序**（锚点会变，破坏外部链接）。
2. 若必须改标题，需同步 `## 目录` 中对应条目及站内引用该锚点的链接。
3. 若篇幅增加导致 `topics.ts` 的 `details` 描述不再准确，一并更新。
4. 改完后确认同文档内其他章节、其他页面的交叉链接与锚点仍可跳转（回归验证）。
5. `pnpm run build` 通过后提交（`fix` / `chore`）。

### 4.4 新增 / 更新导航、侧边栏、首页

1. 先确认在 `config.mts` 还是 `data/topics.ts`，不要两处各写一份。
2. 侧边栏与内容目录保持一致顺序；`nav.activeMatch` 保持 `^/<分类>/`。
3. 首页若增删格子，必须回到 §2.6 / §3.3 的网格边框规则：格子数整除列数，列表放格子内做单列 `divide-y`，横向网格补 `divide-x-0 <bp>:divide-x`。
4. 同步 `docCount` / `roadmapCount` / `categoryCount`。
5. **不得改变既有导航项的顺序与链接文本**（除非用户要求）；新增项追加在分组末尾。
6. `pnpm run dev` 逐屏核对**且确认其余分类的导航/侧栏/首页区块无变化**，`pnpm run build` 通过后提交。

### 4.5 新增 / 更新 Skill

1. 在 `.agents/skills/<name>/` 建 `SKILL.md`（front-matter 见 §3.4），细节拆到 `references/`。
2. 需要界面展示信息时加 `agents/openai.yaml`；生成类附 `GENERATION.md`。
3. 建 Junction：`.codebuddy/skills/<name>` → `.agents/skills/<name>`。
4. 第三方来源的 Skill 在 `skills-lock.json` 登记来源与哈希。
5. 不改动上游第三方 Skill 的既有内容。

### 4.6 ★ 收尾 Code Review（任务 / 对话完成后必做，复用 `code-review` Skill）

> **强制要求**：一次任务或一段对话收尾时（无论用户是否要求提交、是否要求评审），都必须按本节的流程对本次改动做一次自查式 Code Review，**判定「是否存在问题」**。
> **发现问题就必须修复**：凡属于「规范违背 / 需求未落实 / 影响既有功能 / 覆盖已修 bug」的问题，一律就地修复并重跑 §4.1 回归验证，然后**再评一次**，直到问题清零；**不得带着已知问题宣布完成**。

流程参考 `.agents/skills/code-review/SKILL.md`，并按本仓库实际扩展为三轴：

**Step 1 · 固定比较基点**
本次改动尚未提交时，基点用 `HEAD`（评审 `git diff HEAD`，即工作区改动）；需要评审分支/PR 时用用户给定的 commit / branch / tag，比较命令为 `git diff <fixed-point>...HEAD`（三点，对比 merge-base）。
先确认基点可解析（`git rev-parse <fixed-point>`）且 diff 非空，再往下走。

**Step 2 · Standards 轴（是否符合本仓库规范）**
逐文件核对是否符合本文件 §3：内容组织、文档书写（§3.2）、VitePress 工程（§3.3）、Skill 规范（§3.4）、提交信息（§3.5）——重点是 `config.mts` 与 `data/topics.ts` 是否同步、`docCount` 是否更新。
**若本次改动的性质是「新增文档」，必须额外执行 §4.2 Step 6.5 的全量排查**：确认 a~k 每一类联动位置都已改齐，任何一类缺失即判为规范违背（属必修问题）。

**Step 3 · Spec 轴（是否忠实实现需求）**
核对：(a) 需求要求但缺失/只做一半的部分；(b) diff 中没被要求却做了的范围蔓延；(c) 看似实现但实现有误的部分。每条结论都要引用需求原文或用户原话。

**Step 4 · Regression 轴（本仓库补充轴，权重最高）**
核对 diff 中是否存在「删除 / 重写既有内容」「触碰 §2.5 防回归清单」的动作；若有，是否给出了理由并保持了原有行为。逐条对照 §2.5 清单确认未被回退。

**Step 5 · 汇总**
三轴分别输出、**不合并、不重排**（不跨轴重排优先级），各轴给出「问题数 + 最严重问题」。

**Step 6 · 修复与复验（必做，不可省略）**
对每条确认的问题：先按 §2.4 判断影响面 → 修复 → 重跑 §4.1（dev 逐页点开 + `pnpm run build` + 回归验证）→ 重跑本流程 Step 2~5 确认问题清零。
若某条问题判定为「可接受的取舍」，必须显式说明理由，不得静默放过。

**Step 7 · 输出**
向用户简要汇报：三轴各自的结论、已修复的问题清单、仍未解决项及原因（如有）。

---

## 5. 完成前自检清单

- [ ] 改动的文件都在 §2.1 允许范围内，没有触碰 §2.2 的红线。
- [ ] **确认过「谁引用了本次要改的东西」，并已在改后回归验证既有功能未受影响（§2.4 / §4.1）。**
- [ ] **未覆盖任何已修复的 bug：逐条对照 §2.5 防回归清单，无一项被回退。**
- [ ] 内容按 `<分类>/<主题>/index.md` 组织，链接为带尾斜杠的绝对路径。
- [ ] 文档结构符合 §3.2（H1 + 引用块 + 目录 + 编号章节 + 代码块标语言）。
- [ ] `config.mts`（sidebar / nav / footer）与 `data/topics.ts`（索引 / 统计）已同步。
- [ ] **若为新增文档：§4.2 Step 6 的 a~k 全部联动位置已改齐，且已用 Step 6.5 全量排查确认无遗漏。**
- [ ] 首页网格仍满足「格子数整除列数」，未引入缺边框。
- [ ] `{{PLACEHOLDER}}` 占位符仍正常渲染，`README.md` 仍未生成页面，页内目录锚点仍可跳转。
- [ ] `pnpm run build` 通过。
- [ ] **已按 §4.6 对本次改动完成收尾 Code Review（Standards / Spec / Regression 三轴），发现的问题均已修复并复验，无遗留问题。**
- [ ] 提交信息符合 §3.5，且一次提交只做一件事。
