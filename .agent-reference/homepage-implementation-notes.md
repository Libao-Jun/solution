# 首页实现细则与自查口径（AGENTS.md §2.6 配套参考）

> 本文件是 `AGENTS.md` §2.6 的**详细支撑**：只讲「为什么这么定」与「怎么验证」，供改动首页时对照。规范结论以 `AGENTS.md` §2.6 的表格为准。
> 路径 `.agent-reference/` 为点目录，VitePress 默认不生成站点页面。

---

## 一、技术栈面板 `StackIsometric.vue`（2026-10 由 SVG 等距图重构为深色 Bento 面板）

### 1. 版式与配色
- 深色面板铺满 `wrapper`（无内边距、无圆角），与收尾的「内容地图」同一套设计语言；外框由 section 的 `border-t` 延续，中间不做 `md:border-none` 留白（否则会留出左右有竖线、上下不封口的空框）。
- 面板**恒深色、文字用固定色**（`bg-[#12131d]` + `text-white`/`white/60`），**不要改用 `data-theme="dark"`**——那会改变本区块 `border-t` 的主题变量，使相邻浅色区块的横线颜色与本区块不一致。

### 2. 数据驱动（核心收益）
- 卡片与芯片完全来自 `../data/topics.ts` 的 `categories`（内容分类：Web 基础 / 框架与端 / 工程化与适配）与 `growthBlocks`（学习路线 / 职业成长，链接含章节锚点）。
- 芯片 `flex-wrap` 自动换行，**新增一篇文档只需在 `topics.ts` 加一条 chip，本组件零改动**——这正是放弃旧等距图的主因（旧实现 22 个方块全是手工等距坐标，每次新增文档都要手调几何）。

### 3. Bento 网格与边框
- `lg:grid-cols-6`：第一行 3 卡各 `lg:col-span-2`、第二行 2 卡各 `lg:col-span-3`，**每一行都整除 6 列**（同时满足 §2.6 A「单元格数整除列数」）。
- 卡内芯片是 flex-wrap 链接组，**不使用共享 divide 边框**；卡片自身用独立描边 + 间隙（`gap-3`），不是 §2.6 A 的 `divide-x/y` 模式。
- 自查口径：无头浏览器统计「空的带边框块」（无内容、任一边有框、宽 ≥200 高 ≥24）= **0**；每行卡片数整除列数，外框连续无断点。

### 4. 动效（两层，别混）
- **入场由一条 GSAP 时间线编排**（`StackIsometric.vue` 的 `useMotion`，ScrollTrigger 一次性触发 `top 78%`）：背景网格淡入 / 光晕放大淡入 → 装饰扫描线 `.tech-scan` 自上而下扫过一遍（一次性，非常驻循环；CSS 默认透明，JS 失败时不可见即可，不承载内容）→ 标题组错落上浮 → 卡片依次上浮 + 边框「通电」闪光回落（keyframes + stagger）→ 芯片弹性 pop（`back.out(1.7)`，DOM 顺序天然逐卡瀑布）→ `.tech-count` 计数徽标数字滚动（对象补间 + `onUpdate` 回填，保留「篇 / 组」后缀）。
- ★ 结束态必须干净：标题 / 卡片 / 芯片的 tween 都带 `clearProps: 'transform'`，边框闪光带 `clearProps: 'borderColor'`——把内联样式还给 CSS，悬停的 paint 过渡才能正常接管。
- 起点一律 `gsap.set()` 在 JS 侧生成，零 JS / GSAP / 减少动态时内容完整静态可见（唯一 CSS 默认透明的是纯装饰扫描线，不承载内容）。
- **常驻循环只走 CSS**：顶部「数据流」光带 `tech-beam-flow`，包在 `@media (prefers-reduced-motion: no-preference)` 内；GSAP 不碰任何常驻循环（避免互抢）。

### 5. 悬停交互
- 只改 **paint 属性**（`color` / `border-color` / `background-color`）：卡片悬停泛紫 + 对角刻度（`::before`/`::after` 的 `border-color`）亮起；芯片悬停描边 / 背景 / 文字色变化。
- ★ **禁止 `transform`**：卡片 / 芯片的悬停若改 `transform` / `scale`，会与入场时间线写下的 `transform` / `opacity` 互抢（症状：滚动后部分文案仍 `opacity: 0`），也违背 §2.6 C 的「SVG/CSS transform 覆盖」原则。

### 6. 整体布局口径（实测）
- 面板宽度与相邻区块一致（铺满 `wrapper`），上下顶到 `border-t` 线、无额外内边距留白；三层背景装饰 `tech-grid`（径向蒙版边缘淡出的细网格）/ `tech-glow`（顶部品牌色光晕）/ `tech-beam`（顶部数据流光带）均 `aria-hidden`。

---

## 二、首页动效（GSAP，`animations/motion.ts`）

### 1. 入口与加载
- **唯一入口**是 `.vitepress/theme/animations/motion.ts`（组件不要各自 `import gsap`）：GSAP 与 ScrollTrigger **只在浏览器端动态 `import()`**（不进入首屏 entry chunk，构建期不求值），组件一律用 `useMotion()` 挂载，卸载（含 SPA 切路由）时自动 revert 内联样式与 ScrollTrigger。

### 2. 三条硬禁令的失败复盘
- ★ **不得用 CSS 先隐藏元素再等 JS 显形**：入场起点只能用 `gsap.set()` 在 JS 侧生成——JS / GSAP 失败时页面必须是完整静态内容（这是首页「白屏」类事故的根因）。
- ★ **写动用 `gsap.set()` 造起点 + `gsap.to()` 写显式终值，不要用 `gsap.from()`**：`from()` 的「终值」是运行时回读元素当前值，元素一旦正处于别的动画或 CSS 过渡的中间态就会被记错——实测 Hero CTA 按钮（排在时间线靠后、且带 `transition-all`）终值被记成 0，时间线跑完仍停在 `opacity: 0; visibility: hidden`。`to()` 的终值写死，任何情况下都会回到它。
- 命中 `prefers-reduced-motion: reduce` 时**一个动画都不建**，直接呈现静态终态；实测口径：无任何内联样式、全部元素 `opacity = 1`。

### 3. 标记约定
- `data-reveal`（可选 `up`（默认）/ `scale` / `left` / `right`）做滚动入场，分组容器取最近的 `[data-reveal-group]` 或 `<section>`；`data-count` 做数字滚动（从 SSR 文本里解析数字，回填时保留前后缀）；Hero 用 `data-hero-step`（按 DOM 顺序错落）与 `data-hero-cta`（按钮组磁吸）。

### 4. scope 争夺
- ★ **每个用 `useMotion()` 的组件根节点必须带 `data-motion-scope`**：`revealOnScroll()` 只处理「最近 scope 祖先 === 本 root」的 `[data-reveal]`。漏掉会让 `Home.vue` 把子组件（技术栈面板 / 快速开始 / 工具栏）的标记一起收进来，同一元素被建两份 tween 互相抢 opacity（症状：滚到底后部分文案仍 `opacity: 0`）。

### 5. SVG 与 CSS transform 覆盖
- **SVG 元素**：CSS transform 会覆盖 SVG 的 `transform` 属性——带 `translate(...)` 的元素（**内容地图卡片组** `ClosingIllustration.vue` 的内层 `<g transform>`）只能动画其**没有 transform 属性**的外层 `<g data-map-card>`，或改用透明度。

### 6. Hero CTA 磁吸的两条让路规则（`styles.css` 第 7 段，都不可删）
1. `.marketing-layout [data-hero-cta] .button { transition-property: … }` 把 `transform` 从过渡属性里摘掉交给 GSAP 独占（**必须保留 `scale`**）。
2. `.marketing-layout [data-hero-cta] .button:hover { scale: 105% !important }`——GSAP 一写 transform 就会顺带写下内联 `scale: none`，把主题 `hover:scale-105` 压掉，这条负责把它抢回来。

### 7. 完整复现 / 验证口径
1. `pnpm run build` 后静态托管 `.vitepress/dist`。
2. 无头 Edge + CDP 慢速滚到底，断言：
   - `[data-reveal]` / `[data-hero-step]` 全部 `opacity ≥ 0.95`
   - `data-count` 回到原值
   - `[data-panel-window]` / `[data-map-card]` 为 1
3. 再用 `Emulation.setEmulatedMedia` 模拟减少动态效果，断言无内联样式且全部可见。
