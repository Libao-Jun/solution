# AGENTS.md

> 本仓库的**代理工作规范**：能改什么（边界）、怎么写（规范）、按什么顺序做（流程）。站点介绍与首页区块清单见 `README.md`。
>
> **铁律一**：改样式、补内容、加需求，都不得影响既有正常功能；已修复过的 bug 不得被覆盖或回退（§2.4 / §2.5）。
> **铁律二**：每次任务 / 对话收尾必须执行一次收尾 Code Review（§4.6），发现问题就修复并复验，不得带问题收尾。

## 0. 项目概览

`solution` 是 **VitePress 文档站**：内容全部来自本仓库已有的 Markdown，站点工程只负责「渲染 + 导航 + 主题」。`srcDir` 即仓库根目录，`README.md` 由 `srcExclude` 排除、不生成页面。

**技术栈**：VitePress `2.0.0-alpha` + Vue 3 + `@voidzero-dev/vitepress-theme`（`viteplus` 变体）+ Tailwind 4 + GSAP 3（首页动效）+ reka-ui；包管理器锁定 **pnpm 10**（禁 npm / yarn）。部署：推送 `main` → `.github/workflows/deploy-docs.yml` → GitHub Pages 子路径 `/solution/`。

**常用命令**：

```bash
pnpm install     # 安装依赖
pnpm run dev     # 本地开发，http://localhost:5173
pnpm run build   # 构建校验：md 语法、花括号插值、死链等在此暴露 —— 任何改动结束前必须能通过
pnpm run preview # 预览构建产物
```

## 1. 目录地图与真相源

| 路径                                                   | 职责                                                                                      | 可改性             |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------ |
| `fundamentals/` `frameworks/` `engineering/` `career/` | 正文分类：Web 基础 / 框架与端 / 工程化与适配 / 职业成长                                   | ✅ 正文            |
| `roadmaps/`                                            | 学习路线索引页（PDF 原件在 `public/roadmaps/`）                                           | ✅ 索引，PDF 不改  |
| `public/`                                              | 静态资源，构建时**原样**复制到站点根（含 SEO 用的 `robots.txt`）                          | ✅ 新增图片 / PDF  |
| `.vitepress/config.mts`                                | **导航 / 侧边栏 / 页脚 / head / SEO / markdown 扩展的唯一真相源**                         | ✅ 维护级          |
| `.vitepress/theme/`                                    | 自定义主题：`index.ts`、`Layout.vue`、`styles.css`、`components/`、`data/`、`animations/` | ✅ 维护级          |
| `.vitepress/theme/data/topics.ts`                      | **首页索引数据唯一真相源**（`topicGroups` / `categories` / 统计常量）                     | ✅ 维护级          |
| `.agents/skills/<name>/`                               | **Skill 真相源**（`SKILL.md` + `references/` + `agents/`）                                | ✅                 |
| `.codebuddy/skills/<name>`                             | 指向上者的 **Junction**（供 CodeBuddy 发现）                                              | ⚠️ 只改链接        |
| `skills-lock.json`                                     | 第三方 Skill 的来源与哈希                                                                 | ✅ 新增时同步      |
| `.github/workflows/`                                   | Pages 发布流水线                                                                          | ✅ 维护级          |
| `README.md` / `index.md`                               | 仓库说明 / 首页入口                                                                       | ✅                 |
| `.vitepress/dist`、`.vitepress/cache`、`node_modules`  | 构建产物与依赖，已 gitignore                                                              | ❌ 禁止手改 / 提交 |

> 一句话：**内容在分类目录，导航在 `config.mts`，首页在 `data/*.ts`，Skill 在 `.agents/skills/`**——四者交叉引用的部分必须同步改。

## 2. 边界（Boundaries）

### 2.1 可以直接做

- 新增 / 编辑 `<分类>/<主题>/index.md` 正文。
- 在 `config.mts` 的 `sidebar` / `nav` / `footer` 登记页面。
- 在 `.vitepress/theme/data/` 同步首页索引与统计数字。
- 向 `public/` 增加图片、PDF 等静态资源。
- 在 `.agents/skills/` 下新增本地 Skill。

### 2.2 禁止 / 不要做（除非用户明确要求）

- ❌ 手改或提交 `.vitepress/dist`、`.vitepress/cache`、`node_modules`。
- ❌ 改 `public/roadmaps/*.pdf` 等二进制原件（只加不改）。
- ❌ 在 `.codebuddy/skills/` 另写一份内容（它是 Junction，改内容要改 `.agents/skills/` 的源）。
- ❌ 改第三方 Skill（`code-review` / `vitepress` / `vue-best-practices`）的 `SKILL.md` 与 `references/`——改动会与 `skills-lock.json` 哈希失配；需定制请**新建**自己的 Skill。
- ❌ 升级 `vitepress`、`@voidzero-dev/vitepress-theme`、`vue` 等核心依赖。
- ❌ 改 `srcDir`、删除 `srcExclude: ['README.md']`、改动首页布局骨架（`Layout.vue` / `Home.vue` 的区块顺序）。
- ❌ 手动把正文 `{{PLACEHOLDER}}` 改写成 HTML 实体或 `<code>`——渲染期由 `config.mts` 统一转义，源文件必须保持原样。
- ❌ 使用 `npm` / `yarn`；提交密钥、令牌等敏感信息（CI 凭据一律走 GitHub Secrets）。

### 2.3 需先与用户确认

- 新增**内容分类**（新开顶层目录，如 `ai/`）——涉及 nav、sidebar、footer、首页、README 五处联动。
- 删除或重命名**已存在的路由**——会破坏站内外链接与锚点。
- 大规模重排导航顺序，或改动 `styles.css` 的布局宽度变量。
- 改动首页组件结构与 Tailwind 网格边框写法（易触发「缺边框」回归，细则见 §2.6）。

### 2.4 不可回退原则（回归红线）

1. **不得影响既有正常功能**：改动前先明确「要动的东西被谁依赖」；改完后导航、侧边栏、首页区块、搜索、深色模式、右侧目录、《本页目录》锚点、PDF 链接必须**与改动前一致地正常工作**。
2. **不得覆盖已修复的 bug**：§2.5 清单中的坑在后续改动中不得被推翻或「顺手整理掉」；确需改动须先说明理由并取得确认，且改后重新验证原问题不再复现。
3. **只做加法，谨慎做减法**：新增需求允许新增文件 / 配置项；删除、重命名、重排既有内容属高风险动作，必须先确认影响面（`config.mts`、`data/topics.ts`、`README.md`、正文交叉链接）。

### 2.5 已修复问题防回归清单（改动相关文件前先读）

| 位置                                   | 现状（勿动）                                                                                                                                                                                                                                                      | 禁回退为                                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `config.mts` `markdown.config`         | `escape-double-braces` 规则 + `code_inline` 加 `v-pre`（正文 `{{PLACEHOLDER}}` 不再报插值错）                                                                                                                                                                     | 移除 / 简化这两段转义                                                                                              |
| `config.mts`                           | `srcExclude: ['README.md']`                                                                                                                                                                                                                                       | 删除导致 README 被编译                                                                                             |
| `config.mts`                           | `cleanUrls: true` + 站内链接统一带尾斜杠                                                                                                                                                                                                                          | 去掉尾斜杠导致 404                                                                                                 |
| `config.mts`                           | `ignoreDeadLinks: true`（保留原文交叉链接）                                                                                                                                                                                                                       | 关掉导致构建因历史链接失败                                                                                         |
| `theme/styles.css`                     | 「布局宽度统一配置」段 4 个变量映射到 VitePress 官方变量                                                                                                                                                                                                          | 在别处零散写死宽度                                                                                                 |
| `theme/index.ts`                       | `themeContextKey` 覆盖 `logoDark/logoLight/footerBg/monoIcon`                                                                                                                                                                                                     | 删掉覆盖导致品牌资源失效                                                                                           |
| `theme/Layout.vue`                     | 首页运行时同步 `data-theme="light"`，避免系统深色偏好污染首屏                                                                                                                                                                                                     | 移除该同步逻辑                                                                                                     |
| 首页网格（`Home.vue` / `topics.ts`）   | 带边框网格单元格数**整除列数**（3/4/2）；多条目列表放格内做单列 `divide-y`；横向网格补 `divide-x-0 <bp>:divide-x`                                                                                                                                                 | 给会换行的网格直接套 `divide-x/y`，末行缺边框                                                                      |
| 等距图底部卡片（`StackIsometric.vue`） | 正面 4 篇沿 **x 轴**、侧面 4 篇沿 **y 轴**，各落对应台面边之外、同净空；两排导轨在平台底角正下方汇合（Λ / V 对称）                                                                                                                                                | 8 张卡片沿屏幕水平排成一行；或按卡片**宽度**算 y 轴排间距                                                          |
| 首页动效（`animations/motion.ts`）     | `gsap.set()` 造起点 + `gsap.to()` 写死终值（**不用 `from()`**）；`prefers-reduced-motion` 时零动画；GSAP 只能动态 `import()`；`useMotion()` 根节点带 `data-motion-scope`                                                                                          | CSS 先隐藏再由 JS 显形（JS 失败＝整块不可见）；改用 `from()` 停在中间态；去掉 scope 导致同元素两份动画互抢 opacity |
| `config.mts` `base` + 站内资源引用     | `base` 按 `process.env.CI` 切换（CI `/solution/`、本地 `/`）；组件 / `head` / 页脚的根路径链接与 favicon 一律经 `withBase()`                                                                                                                                      | 写死 `/` 或裸写 `/xxx`，子路径部署下全 404                                                                         |
| 页头 Logo 根链接                       | 主题包写死 `href="/"`：构建期 `transformHtml` 精确匹配补 base，运行时 `fixThemeLogoLink()` 兜底（含移动端菜单动态插入的链接）                                                                                                                                     | 删除后子路径部署点 Logo 跳到域名根目录                                                                             |
| SEO 三件套（`config.mts` + `public/`） | 站点级 `head`（keywords / robots / OG / Twitter / Cache-Control）+ 每页 `transformHead`（canonical / 每页 OG / JSON-LD `WebSite`·`TechArticle`）+ `lastUpdated` + `sitemap`（`hostname` = `siteUrl`，**末尾斜杠不可去**）+ `public/robots.txt`（含 Sitemap 声明） | 删减导致 TDK、canonical、分享卡片、结构化数据、sitemap 地址丢失                                                    |

> 遇到「新需求要求推翻清单中某项」时：**先停下来说明冲突并征询用户**，不要自行判断「这次可以例外」。

### 2.6 首页改动细则（网格 / 等距图 / 动效，改动前必读）

**A. 网格边框（Tailwind）**

- `divide-x` / `divide-y` 只给「除第一个子元素外」的子元素加边框：单列 / 单行永远正确，**会换行的网格只有「单元格数整除列数」时才正确**（3 格 3 列、4 格 2×2、2 格 2 列）。
- 条目多的列表放进格子里做单列 `divide-y`；横向网格补 `divide-x-0 <bp>:divide-x`，避免窄屏堆叠多出左边框。
- 区块骨架 `<section class="wrapper border-t">`，外框必须一路不断线：不要照搬参考站的空白 `Spacer.vue`（页尾留不封口空框）；除刻意全宽通栏外，不给中间区块加 `md:border-none`。
- 自查：构建后用无头浏览器统计「空的带边框块」（无文字 / 图片、四边任一有边框、宽 ≥200 且高 ≥24）应为 **0**。

**B. 等距图 `StackIsometric.vue`**

- **内容**：每个方块必须是仓库已有的一篇文档，数据取 `data/topics.ts` 的 `categories`，不另写标题 / 链接。
- **几何**：2:1 等距投影；厚度用「同一圆角矩形下移 `DEPTH` 叠两层」实现，**不要手算六顶点**（圆角必出接缝）；台面外扩 `FACE_PAD`。
- **文字**：方块标签用 `textMatrix()`（切变保持 ≈13°，越大中文越糊）；只有台面前沿的长文字用 `isoMatrix()`（字号 ≈26 + `letter-spacing` ≈7，否则相邻字糊成一团）。
- **中文发虚三因（已修）**：① SVG 渲染宽不是 `viewBox` 宽的整数倍（曾 `max-w-[76rem]`(1216) + 缩放 0.95 让字形落半像素；现 `max-w-[80rem]`(1280) 与 `viewBox` **1:1**）；② 未开 `text-rendering: geometricPrecision`（默认 `auto` 会把带切变的字形吸附到像素网格）；③ 字号过小（已整体 +1px：卡片 12 / 13.5，方块 13 / 14.5 / 16）。
  自查：`渲染宽 ÷ viewBox 宽 = 1`、`text-rendering = geometricprecision`、最长标签 68px 且无溢出。
- **线网**：方块必须落在导轨上，一条线只画一次；导轨外端**由 `Math.min(...cubes.map(c => c.at))` 推导**取最外侧方块中心，**禁手写偏移**（否则多伸出断头线，或画到 `viewBox` 外被 `overflow: hidden` 齐平切掉）。
  实测口径：上方 4 条导轨「端点 → 最近方块中心」= **0px**；底部 2 条 `from` 同样取最外侧卡片中心（0px），`to` 是两排导轨中心线的交点（平台底角正下方，有意伸出卡片之外）。
- **底部两组卡片**：「正面」= 顶面在 `max y` 的边（贴「N 篇主题文档」，N 取 `docCount`），台面内方向为局部 +x → 该排沿 **x 轴**排布并落在台面边之外；「侧面」= 顶面在 `max x` 的边，台面内方向为局部 +y → 沿 **y 轴**排布。
  容量 **正面 5 + 侧面 4**（侧面第 5 张右下角到屏幕 y ≈ 625，越过 `viewBox` 的 615 被裁），新增文档优先占正面。两排净空取同一 `ROW_CLEARANCE`；等距投影沿轴保长，**y 轴那排间距必须按卡片高度 38 算**，按宽度算会互相压住。
- **动画两层，别混**：① 入场由 GSAP 一条时间线编排（`useMotion`），进场方向由数据侧 `drift` 给出，**所有方块与卡片严格沿所在导轨滑入**；不用 `svgOrigin`（会粘在元素上、改掉后续悬停缩放原点）。SVG 上的 `.is-motion` **必须**停用 CSS `iso-in` / `iso-draw`——这两条 `fill-mode: both` 的动画会以动画优先级压掉内联样式（实测使悬停变暗、虚线流动失效）。② 常驻循环仍走 CSS（`iso-float` / `iso-drift` / `iso-shadow`），GSAP 一律不碰 `.float` 层（同一元素上 CSS `transform` 会覆盖 SVG 的 `transform` 属性，两套必须分层）；CSS 入场保留为无 JS / GSAP 失败 / `prefers-reduced-motion` 的兜底。
- **悬停**：以方块自身中心缩放 1.07、同类变暗到 0.42、**所在导轨**高亮品牌色并跑流动虚线（周期 10+6=16，offset 每轮 -16 才不跳变）；底部两排卡片各绑本排导轨（`data-rail` 排在上方 4 条之后）；交互在入场时间线 `onComplete` 后才绑定，避免与入场 tween 抢同一批 `scale` / `opacity`。
  ★ 缩放必须 `gsap.to(el, { scale })`，**禁 `gsap.quickTo(el, 'scale')`**：SVG 的 scale 在 CSSPlugin 里被拆成 scaleX / scaleY，`quickTo` 的 `resetTo('scale')` 找不到同名 propTween 会**静默不生效**（HTML 的 `quickTo('x' / 'y')` 正常，Hero CTA 磁吸即用它）。
  ★ 元素列表一律 `*Els` 后缀（`tileEls` / `satEls` / `cardEls` / `railEls`…），别与数据数组（`tiles` / `rails` / `cards` / `satellites`）撞名——撞名会让 `tiles[i].drift` 读到 SVG 元素，整条入场时间线抛错。
- **自适应与紧凑度**：固定 `viewBox`（`min-w-[44rem]` + 外层 `overflow-x-auto`），**所有几何都要落在 `viewBox` 内**（方块中心屏幕 y = 250 + 0.5·(x + y)，太靠外会被上沿裁掉）；导轨只比最外侧方块多伸约 65 单位。想更紧凑就**整体缩小方块 + 拉近与平台距离**（同轨相邻方块中心间距别小于 ≈105，方块长对角线 = 0.866·(SAT_W+SAT_H) ≈ 123），不要去压边距。
  口径：左右余量 220px / 219px、上下 40px / 23px、图形占宽 66%，且 `scrollWidth === clientWidth`。

**C. 首页动效（GSAP）**

- **唯一入口**是 `.vitepress/theme/animations/motion.ts`（组件不各自 `import gsap`）：GSAP 与 ScrollTrigger **只在浏览器端动态 `import()`**（不进首屏 entry chunk），组件一律用 `useMotion()` 挂载，卸载（含 SPA 切路由）时自动 revert 内联样式与 ScrollTrigger。
- ★ **不得用 CSS 先隐藏元素再等 JS 显形**：入场起点只能用 `gsap.set()` 在 JS 侧生成——JS / GSAP 失败时页面必须是完整静态内容（这是首页「白屏」类事故的根因）。
- ★ **用 `gsap.set()` 造起点 + `gsap.to()` 写显式终值，不用 `gsap.from()`**：`from()` 的终值是运行时回读元素当前值，元素一旦处于别的动画或 CSS 过渡中间态就会被记错（实测 Hero CTA 终值被记成 0，跑完仍停在 `opacity: 0; visibility: hidden`）。
- 命中 `prefers-reduced-motion: reduce` 时**一个动画都不建**；口径：无任何内联样式、全部元素 `opacity = 1`。
- 标记约定：`data-reveal`（`up` 默认 / `scale` / `left` / `right`，分组容器取最近 `[data-reveal-group]` 或 `<section>`）、`data-count`（从 SSR 文本解析数字，回填保留前后缀）、`data-hero-step`（按 DOM 顺序错落）、`data-hero-cta`（按钮组磁吸）。
- ★ **每个用 `useMotion()` 的组件根节点必须带 `data-motion-scope`**：`revealOnScroll()` 只处理「最近 scope 祖先 === 本 root」的 `[data-reveal]`。漏掉会让 `Home.vue` 把子组件标记一起收进来，同一元素被建两份 tween 互抢 opacity（症状：滚到底后部分文案仍 `opacity: 0`）。
- **SVG 元素**：CSS transform 会覆盖 SVG 的 `transform` 属性——带等距矩阵 / `translate(...)` 的元素只能动画其**没有 transform 属性**的外层 `<g>`，或改用透明度；等距图方块的悬停缩放挂在 `<a class="iso-tile">` 上（内部 `.float` 跑 CSS 漂浮，是不同元素，互不覆盖）。
- **Hero CTA 磁吸需 `styles.css` 第 7 段两条让路（都不可删）**：① `.marketing-layout [data-hero-cta] .button { transition-property: … }` 把 `transform` 从过渡属性摘给 GSAP 独占（**必须保留 `scale`**）；② 同选择器 `:hover { scale: 105% !important }`——GSAP 一写 transform 会顺带写内联 `scale: none` 压掉主题 `hover:scale-105`，这条负责抢回来。
- **复现口径**：`pnpm run build` 后静态托管 `.vitepress/dist`，无头 Edge + CDP 慢速滚到底，断言「`[data-reveal]` / `[data-hero-step]` 全部 `opacity ≥ 0.95`」「`data-count` 回到原值」「`[data-panel-window]` / `[data-map-card]` 为 1」；再用 `Emulation.setEmulatedMedia` 模拟减少动态效果，断言无内联样式且全部可见。

## 3. 规范（Standards）

### 3.1 内容组织规范

- 每个主题是 `<分类>/<主题>/index.md`，对应路由 `/<分类>/<主题>/`。
- **目录名用小写 kebab-case**（`responsive-vs-adaptive`、`data-screen-adaptation`），不用中文或驼峰。
- 开启 `cleanUrls: true`，站内链接一律写成**带尾斜杠的绝对路径**：`/fundamentals/http/`。
- 新增主题的原文链接（参考资料）保留在文首引用块，不做改写。
- ★ **新增文档「全量联动」原则**：新增任何一篇 `xx.md`（不论分类、不论是否首次出现）都不是「只加一个文件」，而是「加文件 + 把全项目中所有需登记 / 引用它的地方一次改齐」。**漏改任何一处都视为任务未完成**（典型后果：页面能构建但侧栏找不到、首页索引没有、统计数字是旧值）。清单见 §4.2 Step 6。

### 3.2 文档书写规范（新增 / 编辑 `xx.md` 必须遵守）

骨架（与现有文档一致）：

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
- 文首必须有 **H1 + 引用块**（参考资料 + 面向角色 / 文档定位）。
- **「参考资料」必须用引用块内的无序列表**（`> - [名称](链接)` 每行一条），**禁止**用 `、` 把多个链接连成一行；列表与「面向角色」之间用一行 `>` 空行分隔。
- 章节编号用「`## 一、` / `### 1.1`」体例，`## 目录` 的编号与正文标题一一对应。**目录锚点不要手写猜**：VitePress 保留中文顿号 `、`、把空格 / `.` / `：` / `+` 转为 `-`、数字开头加 `_` 前缀——把鼠标移到标题左侧 `#` 上复制真实链接（详见 README「文档『目录』锚点规则」）。
- 代码块**必须标注语言**（`js` / `bash` / `ts` / `text`），可复制的命令、配置、片段优先。
- 中文正文用中文标点；中英文 / 数字之间保留一个空格；不滥用 emoji。
- 表格列对齐（`| --- |`），行内术语首次出现给中英对照（如 `跨域（CORS）`）。
- 图片、PDF 等资源放 `public/`，正文用绝对路径引用（如 `/roadmaps/beginner/frontend-beginner.pdf`）。
- **不留空章节、不留 TODO**；占位符 `{{PLACEHOLDER}}` 原样保留（渲染期统一转义）。

### 3.3 VitePress 工程规范

- 导航、侧边栏、页脚、head、搜索**只在 `config.mts` 维护**，不在页面里硬编码。
- 侧边栏分组与内容目录一一对应；`nav.activeMatch` 保持 `^/<分类>/`。
- 自定义主题入口 `theme/index.ts`；布局覆写在 `Layout.vue`；样式集中在 `styles.css`。
- 全局宽度只改 `styles.css` 的「布局宽度统一配置」段（`--site-layout-width` 等 4 个变量），改一处全站生效。
- 首页数据只改 `theme/data/topics.ts`（索引与统计）与 `terminal.ts`（终端演示）；`docCount` / `roadmapCount` / `categoryCount` 必须与实际情况同步，不留旧值。
- 首页带边框网格：**单元格数必须整除列数**；多条目列表放进格子内做单列 `divide-y`；横向网格补 `divide-x-0 <bp>:divide-x`（细则见 §2.6 A）。
- **SEO 只在 `config.mts` 维护**：站点 TDK 取自 `siteTitle` / `siteDescription` / `siteLang`；`canonical` / `sitemap` / `og:url` 的唯一基准是 `siteUrl`（与 `base` 解耦，换域名只改这一处，或用 `SITE_URL` 覆盖且末尾带 `/`）；每页 TDK 与 JSON-LD 由 `buildSeoHead`（`transformHead`）生成；抓取规则见 `public/robots.txt`。
- 组件与 `config.mts` 里引用站内链接 / 根路径资源**必须经 `withBase()`**（组件从 `vitepress` 导入，`config.mts` 用本地同名辅助函数）——`base` 在 CI 下是 `/solution/`，裸写 `/xxx` 会 404。

### 3.4 Skill 规范（`.agents/skills/` → `.codebuddy/skills/`）

标准结构：

```text
.agents/skills/<name>/
├── SKILL.md            # 必需：front-matter + 指令集
├── references/         # 可选：细节参考文档（由 SKILL.md 以表格索引）
│   └── <topic>.md
├── agents/
│   └── openai.yaml     # 可选：界面展示信息
└── GENERATION.md       # 生成类 Skill：来源 / SHA / 生成日期
```

`SKILL.md` front-matter：

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
- 细节拆到 `references/<topic>.md`，在 `SKILL.md` 用**表格**给出「主题 / 说明 / 参考文件」索引。
- `agents/openai.yaml` 只写展示信息：`interface.display_name` / `interface.short_description`。
- `.codebuddy/skills/<name>` 必须是指向 `.agents/skills/<name>` 的 **Junction**（Windows：`cmd /c mklink /J "路径\.codebuddy\skills\<name>" "路径\.agents\skills\<name>"`），**不要复制两份内容**。
- 新增**第三方** Skill 后，在 `skills-lock.json` 登记 `source` / `sourceType` / `skillPath` / `computedHash`。

### 3.5 提交信息规范

Conventional Commits，描述用中文：

```text
feat(<主题>): 新增 <主题> 文档
fix(<主题>): 修复 <问题>
chore(<主题>): 优化和补充 <内容>
```

一次提交只做一件事；新增文档的提交不夹带主题 / 配置无关的改动。

## 4. 流程（Workflows）

### 4.0 总流程总览

```text
收到需求
  ├─ 新增主题文档 ─────────→ §4.2（Step 6 全量联动 a~j + Step 6.5 全量排查）
  ├─ 编辑已有文档 ─────────→ §4.3
  ├─ 改导航 / 侧栏 / 首页 ─→ §4.4
  ├─ 新增 / 更新 Skill ────→ §4.5
  └─ 评审他人改动 ─────────→ §4.6
  ▼
【改前】确认影响面：谁引用了它？是否触碰 §2.5 防回归清单？        ← 必做
  ▼
【改中】按 §3 规范实施
  ▼
【改后】回归验证：改动点 + 原有功能 + 清单项逐条确认（§4.1）      ← 必做
  ▼
§5 完成前自检清单
  ▼
★ §4.6 收尾 Code Review（Standards / Spec / Regression 三轴）    ← 必做，不得跳过
  │   └─ 发现问题 → 修复 → 重跑 §4.1 → 再评一次（直到问题清零）
  ▼
问题清零后提交（§3.5）
```

### 4.1 本地验证与回归验证

任何改动都必须走完「改前确认影响面 → 改 → 改后回归验证」，**不得只验证新功能**：

- **改前**：列出要改的文件被谁引用（`config.mts` / `data/topics.ts` / `README.md` / 正文交叉链接 / 主题组件）；对照 §2.5 确认是否触碰清单模块，若触碰按 §2.4 先说明并取得确认。
- **改后**：① 本次改动生效；② 改动点周边的原有功能未被影响（同页其他区块、同分组其他页面、首页、搜索、深色模式）；③ 清单项未被回退（`{{}}` 占位符仍正常显示、`README.md` 仍未生成页面、页内目录锚点仍可跳转、首页网格仍无缺边框、品牌 Logo / 页脚背景仍正常）；④ `pnpm run build` 通过（构建期错误即视为回归，必须修完再提交）。
- **只用 pnpm**；命令见 §0。

### 4.2 ★ 新增 `xx.md`（新增主题文档）标准流程

**Step 1 定位置**：确认分类（`fundamentals/` `frameworks/` `engineering/` `career/` 或新分类）与主题目录名（小写 kebab-case）。新分类先按 §2.3 与用户确认。
**Step 2 建文件**：`<分类>/<主题>/index.md`。
**Step 3 写头部**：H1 标题 + 引用块（参考资料、面向角色 / 文档定位）。
**Step 4 写目录**：`## 目录` 编号索引，条目与正文章节标题严格一致。
**Step 5 写正文**：按 `## 一、…` → `### 1.1 …` 展开；代码块标语言；表格对齐；遵守 §3.2 全部硬性要求。

**Step 6 挂到站点（★ 全量联动，逐项核对，一处都不能漏）**

| #   | 位置                             | 何时必改              | 要改什么                                                            |
| --- | -------------------------------- | --------------------- | ------------------------------------------------------------------- |
| a   | `config.mts` → `sidebar`         | **每次新增都必改**    | 对应分组 `items` 追加 `{ text: '<标题>', link: '/<分类>/<主题>/' }` |
| b   | `config.mts` → `nav`             | 新增**分类**时        | 加 `{ text, link: '/<分类>/<主题>/', activeMatch: '^/<分类>/' }`    |
| c   | `config.mts` → `footer.nav`      | 新增分类 / 需页脚曝光 | 把链接加入合适分组                                                  |
| d   | `data/topics.ts` → `topicGroups` | **每次新增都必改**    | 对应分组追加 `{ title, details, link }`                             |
| e   | `data/topics.ts` → `categories`  | 需进首页分类 chips    | 追加 `{ text, link }`                                               |
| f   | `data/topics.ts` → 统计常量      | 数量变化时            | `docCount` +1；路线图另加 `roadmapCount`；新分类加 `categoryCount`  |
| g   | `README.md`                      | 新增分类 / 首个主题   | 「内容目录分类」表 + 受影响的「首页组成」「目录结构」等描述         |
| h   | `roadmaps/index.md`              | 新增学习路线图时      | 追加 PDF 链接                                                       |
| i   | `public/`                        | 有图片 / PDF 时       | 放入对应子目录，正文用绝对路径（如 `/roadmaps/beginner/x.pdf`）引用 |
| j   | 其他文档正文的交叉链接           | 该主题被别处提及      | 补充 / 修正指向新页面的链接                                         |

**Step 6.5 全量排查（防漏改，必做）**

用**现有任一文档的路由片段**（如 `data-screen-adaptation`）在**整个项目**搜索，得到「引用点全集」，再对照 Step 6 确认新文档覆盖了全部同类位置：

```bash
rg -n "data-screen-adaptation|/engineering/data-screen-adaptation/" .
```

判定：**搜索命中的每一类位置（sidebar / nav / footer / topics.ts / README / 其他正文），新文档都必须同样出现**。只要有一类「旧文档在、新文档不在」就是漏改，补齐后再进 Step 7。

**Step 7 验证**：`pnpm run dev` 逐页点开——左侧分组、顶部导航、首页索引 / 统计、右侧「本页目录」全部正确 → 按 §4.1 回归验证既有页面未受影响 → `pnpm run build` 通过。
**Step 8 提交**：`feat(<主题>): 新增 <主题> 文档`。

> 新增文档检查清单（**a~j 逐项打勾，缺一即未完成**）：
>
> - [ ] (a) `config.mts` sidebar 已登记（漏登记 = 页面能构建但侧栏里找不到）
> - [ ] (b)(c) 新分类已加 `nav`（含 `activeMatch`）与 `footer.nav`
> - [ ] (d)(e)(f) `topics.ts` 的 `topicGroups` / `categories` / 统计常量已同步
> - [ ] (g) `README.md` 表格与相关描述已更新
> - [ ] (h) `roadmaps/index.md` 已追加（路线图 PDF）；(i) 资源已放 `public/` 并绝对路径引用
> - [ ] (j) 其他文档交叉链接已按需补充
> - [ ] **Step 6.5 全量排查已做：旧文档命中过的每一类位置，新文档都已出现**
> - [ ] 既有导航 / 侧栏 / 首页 / 搜索未受影响；`pnpm run build` 通过；提交信息符合 §3.5

### 4.3 编辑已有文档

1. 只改正文内容，**不随意重排章节顺序**（锚点会变，破坏外部链接）。
2. 必须改标题时，同步 `## 目录` 对应条目及站内引用该锚点的链接。
3. 篇幅变化导致 `topics.ts` 的 `details` 描述不再准确时，一并更新。
4. 改完确认同文档其他章节、其他页面的交叉链接与锚点仍可跳转。
5. `pnpm run build` 通过后提交（`fix` / `chore`）。

### 4.4 新增 / 更新导航、侧边栏、首页

1. 先确认改 `config.mts` 还是 `data/topics.ts`，不要两处各写一份。
2. 侧边栏与内容目录保持一致顺序；`nav.activeMatch` 保持 `^/<分类>/`。
3. 首页增删格子必须回到 §2.6 A / §3.3 的网格边框规则。
4. 同步 `docCount` / `roadmapCount` / `categoryCount`。
5. **不得改变既有导航项的顺序与链接文本**（除非用户要求）；新增项追加在分组末尾。
6. `pnpm run dev` 逐屏核对**且确认其余分类的导航 / 侧栏 / 首页区块无变化**，`pnpm run build` 通过后提交。

### 4.5 新增 / 更新 Skill

1. 在 `.agents/skills/<name>/` 建 `SKILL.md`（front-matter 见 §3.4），细节拆到 `references/`。
2. 需要界面展示信息时加 `agents/openai.yaml`；生成类附 `GENERATION.md`。
3. 建 Junction：`.codebuddy/skills/<name>` → `.agents/skills/<name>`。
4. 第三方来源的 Skill 在 `skills-lock.json` 登记来源与哈希。
5. 不改动上游第三方 Skill 的既有内容。

### 4.6 ★ 收尾 Code Review（任务 / 对话完成后必做，复用 `code-review` Skill）

> **强制要求**：一次任务或一段对话收尾时（无论用户是否要求提交 / 评审），都必须按本节对本次改动做一次自查式 Code Review，**判定「是否存在问题」**。凡属「规范违背 / 需求未落实 / 影响既有功能 / 覆盖已修 bug」的问题，一律就地修复并重跑 §4.1，然后**再评一次**，直到问题清零；**不得带着已知问题宣布完成**。

流程参考 `.agents/skills/code-review/SKILL.md`，按本仓库实际扩展为三轴：

- **Step 1 固定比较基点**：改动未提交时用 `HEAD`（`git diff HEAD`）；评审分支 / PR 时用用户给定的 commit / branch / tag（`git diff <fixed-point>...HEAD`，三点对比 merge-base）。先确认基点可解析且 diff 非空。
- **Step 2 Standards 轴（是否符合 §3）**：逐文件核对内容组织、文档书写（§3.2）、VitePress 工程（§3.3）、Skill（§3.4）、提交信息（§3.5）——重点是 `config.mts` 与 `data/topics.ts` 是否同步、`docCount` 是否更新。**本次为「新增文档」时必须额外执行 §4.2 Step 6.5 全量排查**，任何一类联动缺失即判为规范违背（必修）。
- **Step 3 Spec 轴（是否忠实实现需求）**：核对 (a) 需求要求但缺失 / 只做一半的部分；(b) 未被要求却做了的范围蔓延；(c) 看似实现但实现有误的部分。每条结论引用需求原文或用户原话。
- **Step 4 Regression 轴（本仓库补充轴，权重最高）**：核对 diff 是否存在「删除 / 重写既有内容」「触碰 §2.5 防回归清单」的动作，若有是否给出理由且保持原有行为；逐条对照 §2.5 确认未被回退。
- **Step 5 汇总**：三轴分别输出、**不合并、不重排**，各轴给出「问题数 + 最严重问题」。
- **Step 6 修复与复验（不可省略）**：按 §2.4 判断影响面 → 修复 → 重跑 §4.1 → 重跑 Step 2~5 确认清零。若某条判定为「可接受的取舍」，必须显式说明理由，不得静默放过。
- **Step 7 输出**：向用户简要汇报三轴结论、已修复问题清单、仍未解决项及原因（如有）。

## 5. 完成前自检清单

- [ ] 改动文件都在 §2.1 允许范围内，未触碰 §2.2 红线。
- [ ] **已确认「谁引用了本次要改的东西」，且改后回归验证既有功能未受影响（§2.4 / §4.1）。**
- [ ] **逐条对照 §2.5 防回归清单，无一项被回退。**
- [ ] 内容按 `<分类>/<主题>/index.md` 组织，链接为带尾斜杠的绝对路径。
- [ ] 文档结构符合 §3.2（H1 + 引用块 + 目录 + 编号章节 + 代码块标语言）。
- [ ] `config.mts`（sidebar / nav / footer）与 `data/topics.ts`（索引 / 统计）已同步。
- [ ] **若为新增文档：§4.2 Step 6 的 a~j 已改齐，且已用 Step 6.5 全量排查确认无遗漏。**
- [ ] 首页网格仍满足「格子数整除列数」，未引入缺边框。
- [ ] `{{PLACEHOLDER}}` 仍正常渲染，`README.md` 仍未生成页面，页内目录锚点仍可跳转。
- [ ] `pnpm run build` 通过。
- [ ] **已按 §4.6 完成收尾 Code Review（三轴），发现的问题均已修复并复验。**
- [ ] 提交信息符合 §3.5，且一次提交只做一件事。
