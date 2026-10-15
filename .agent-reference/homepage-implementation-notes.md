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

### 5. transform 归属：只动「自身没有 transform」的元素
- **SVG 元素**：CSS transform 会覆盖 SVG 的 `transform` 属性——带 `translate(...)` 的元素（`StackIsometric.vue` 的等距方块）只能动画其**没有 transform 属性**的子元素，或改用透明度。
- **vue-flow 节点**：vue-flow 会给 `.vue-flow__node` 写内联 `transform: translate(x, y)` 定位，动它会把版式带偏。内容地图（`ClosingIllustrationCanvas.vue`）的位移只挂在节点模板**内层**的 `[data-map-card]` / `[data-map-hub]` 上；端口圆点用 `left/top` 定位（不用 CSS transform 居中），把 `scale` 留给 GSAP。

### 6. Hero CTA 磁吸的两条让路规则（`styles.css` 第 7 段，都不可删）
1. `.marketing-layout [data-hero-cta] .button { transition-property: … }` 把 `transform` 从过渡属性里摘掉交给 GSAP 独占（**必须保留 `scale`**）。
2. `.marketing-layout [data-hero-cta] .button:hover { scale: 105% !important }`——GSAP 一写 transform 就会顺带写下内联 `scale: none`，把主题 `hover:scale-105` 压掉，这条负责把它抢回来。

### 7. 完整复现 / 验证口径
1. `pnpm run build` 后静态托管 `.vitepress/dist`。
2. 无头 Edge + CDP 慢速滚到底，断言：
   - `[data-reveal]` / `[data-hero-step]` 全部 `opacity ≥ 0.95`
   - `data-count` 回到原值
   - `[data-panel-window]` 为 1；`[data-map-card]` 数量 = `topics.ts` 里 `contentMapGroups` 的条数（当前 5），`.vue-flow__edge-path` 数量与之相同
   - 内容地图画布已整图入画（`.vue-flow__viewport` 有 transform + `scale`），且入场结束后画布根带 `is-flowing`（CSS 虚线流光已接力）
3. 再用 `Emulation.setEmulatedMedia` 模拟减少动态效果，断言无内联样式且全部可见。

## 二、内容地图（`ClosingIllustration.vue` 骨架 + `ClosingIllustrationCanvas.vue` 画布，2026-10 由静态 SVG 改为 @vue-flow/core）

- **数据源**：`data/topics.ts` 的 `contentMapGroups`（5 组：3 内容分类在上排、2 成长类在下排）+ `categoryCount` / `docCount`；版式计算在 `data/content-map.ts`（排数、每排等分剩余空间、卡高 `42 + 条目数 × 20`、面板高度、中心节点位置），骨架与画布共用同一份，面板 `aspect-ratio` 才与内容严格同比例。增删分组只改 `topics.ts`。
- **动态加载**：画布在 `onMounted` 里动态 `import()`（`@vue-flow/core` 依赖 d3-zoom），骨架 SSR 照常输出面板 / 刻度 / 工具栏；`@vue-flow/core/dist/style.css` 由骨架静态引入（纯 CSS，安全）。
- **默认视图**：不用 `fitView`（按节点包围盒留边会多出空白），而是 `setViewport({ x: 0, y: 0, zoom: 容器宽 / 面板世界宽 })` 把面板整块铺满——与原静态图 `w-full` + viewBox 等比缩放观感一致；`minZoom` 必须低于窄屏值（26rem 面板 ≈ 0.42），故取 0.35。
- ★ **入场触发用 IntersectionObserver + scroll/resize 复核，不要改回 ScrollTrigger**（两条都已踩过）：
  1. `start: 'top 80%'` 会导致「面板已经露出一截、顶部还没越过 80% 线」的整段里节点停在 `opacity: 0`，表现是**面板空着只剩连线**；
  2. 只用 IO 还有洞：元素若**在一帧内从视口下方直接跳到上方**（加载完立刻滚到页脚），两端都是 `isIntersecting: false`、不跨阈值，IO 一个回调都不会给 → 必须再挂 `scroll`（每帧复核一次）+ 初始 `check()`。
- ★ **建时间线前必须等连线路径可测**：路径还没写 `d` 时 `getTotalLength()` 返回 0，会把内联 `stroke-dasharray` 设成 0 —— 虚线的 CSS 被内联压掉（**连线变实线**）且「画线」动画瞬现；就绪条件 = 节点已渲染 + 至少一条 `getTotalLength() > 0` 的边，未就绪最多重试 40 帧（**就绪前不设任何隐藏样式**，所以即使永远不就绪，内容也是完整可见的）。
- ★ **节点必须分两层：`Handle` / 端口圆点挂在「不动画」的定位层，入场动效只动内层**（`closing-card-node` → `closing-card[data-map-card]`、`closing-hub-node` → `closing-hub[data-map-hub]`）。vue-flow 只在初始化时量一次 handle 坐标并缓存，若 handle 所在元素带着入场起始位移，量到的坐标会**永久偏掉**：实测卡片 `y: 20` 让 5 条连线端点统一偏 +20px（表现为「底部两张卡的点离了线、线穿进卡片 20px」），中心 `scale: 0.88` 让中心两端偏 4.3px（189→192.4 / 261→257.8）。把 handle 移出动画层后端点实测精确落在卡片边缘（140/140/150/300/310 对应卡边 139/139/149/301/311），圆点与线端相切相连。
- 其他口径：时间线 `paused: true`，入场结束才开 CSS 虚线流光（`is-flowing`）与中心浮动；`prefers-reduced-motion` 时 `useMotion` 什么都不做，内容静态可见；端口圆点用 `left/top` 定位、位移只挂内层元素（见 §5）；卡片内条目必须把字号 / 行高 / 颜色显式写在 `li` 上（`.marketing-layout p, li` 会把 `li` 钉成 18px/28px，直接规则优先于继承，只改 `ul` 压不住）。
