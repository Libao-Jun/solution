# 首页实现细则与自查口径（AGENTS.md §2.6 配套参考）

> 本文件是 `AGENTS.md` §2.6 的**详细支撑**：只讲「为什么这么定」与「怎么验证」，供改动首页时对照。规范结论以 `AGENTS.md` §2.6 的表格为准。
> 路径 `.agent-reference/` 为点目录，VitePress 默认不生成站点页面。

---

## 一、等距图 `StackIsometric.vue`

### 1. 几何
- 2:1 等距投影；厚度用「同一圆角矩形向下偏移 `DEPTH` 叠两层」实现，**不要手算六顶点**——圆角处手算必然出接缝。台面外扩 `FACE_PAD`。
- 自适应：固定 `viewBox`（`min-w-[44rem]` + 外层 `overflow-x-auto`），所有几何都要落在 `viewBox` 内。方块中心屏幕 y = 250 + 0.5·(x+y)，太靠外会被上沿裁掉；导轨只比最外侧方块多伸约 65 单位。
- 想更紧凑就**整体缩小方块 + 拉近与平台的距离**（同一导轨上相邻方块中心间距别小于约 105，方块长对角线 = 0.866·(SAT_W+SAT_H) ≈ 123，再近会互相压住），**不要去压边距**。

### 2. 文字与「中文发虚」三成因（已修）
- 方块标签用 `textMatrix()`，切变保持很小 ≈13°，切变越大会让中文越糊；只有台面前沿的长文字才用 `isoMatrix()`（字号约 26 并补 `letter-spacing` 约 7，否则相邻字糊成一团）。
- 中文发虚的三个成因（都已修复，改动前先看）：
  1. **SVG 渲染宽度不是 `viewBox` 宽度的整数倍**——曾用 `max-w-[76rem]`（1216）渲染、缩放 0.95，字形落在半像素上；现在 `max-w-[80rem]`（1280）与 `viewBox` **1:1**。
  2. **未开 `text-rendering: geometricPrecision`**（默认 `auto` 会把带切变的字形吸附到像素网格）。
  3. **字号过小**：标签字号整体上调 1px（卡片 12 / 13.5，方块 13 / 14.5 / 16）。
- 自查口径：`svg 渲染宽度 ÷ viewBox 宽度 = 1`、`text-rendering = geometricprecision`、最长标签 68px 且无溢出。

### 3. 线网
- 方块必须落在导轨上，一条线只画一次，不要「先拉长辅助线、再给每块加分支线」。
- 导轨外端**不写死偏移量**，由 `Math.min(...cubes.map(c => c.at))` 推导，取该导轨上最外侧方块的**中心**：手写偏移极易多伸出一截，在方块之外留下一条断头线（「末端多出了线条」），或画到 `viewBox` 外被 `overflow: hidden` 齐平切掉（「超出容器宽度」，曾把 `from` 写成 -900，外框宽出 402px / 291px）。
- 实测口径：上方 4 条导轨「端点 → 最近方块中心」应为 **0px**（当前 4 条均为 0）；底部 2 条导轨的 `from` 同样取最外侧卡片中心（0px），`to` 则是**两排导轨中心线的交点**（平台底角正下方，有意伸出到卡片之外，与上方导轨「收进平台之下」对应）。

### 4. 底部两组卡片（必须分别对齐「正面」与「侧面」，勿挤成一排）
- 平台的「正面」= 顶面在 `max y` 的那条边（贴「N 篇主题文档」标签的那面，N 取 `data/topics.ts` 的 `docCount`），台面内方向是局部 **+x**，所以正面一排沿 **x 轴**排布、整体落在该边之外（局部 y ≥ 台面边 + 厚度 32 + 净空）。
- 「侧面」= 顶面在 `max x` 的那条边，台面内方向是局部 **+y**，所以侧面一排沿 **y 轴**排布、整体落在该边之外（局部 x ≥ 台面边 + 厚度 32 + 净空）。
- 两排的**容量是 5（正面）+ 4（侧面）**：侧面一排第 5 张的右下角会到屏幕 y ≈ 625，越过 `viewBox` 的 615 被裁掉；新增文档优先占正面一排（工程化的 H5 唤起因此放在侧面一排）。
- 等距投影沿轴保长，因此「沿轨间距 = 屏幕间距」；两排的净空取同一值（`ROW_CLEARANCE`），离平台的视觉距离才一致。由此上下形成 **Λ / V 对称**（上方 4 条导轨向上张开、底部 2 条导轨汇合在平台底角正下方）。
- ⚠️ 卡片宽度方向是局部 x（文字用 `textMatrix` 沿 x 排），所以 y 轴那一排的间距必须按卡片**高度**（38）算，不要按宽度算，否则会互相压住。

### 5. 动画（两层，别混）
- **入场由 GSAP 一条时间线编排**（`StackIsometric.vue` 的 `useMotion`）：投影 → 平台升起 → 正面文字字距收拢 → 台面 6 格 → 导轨从平台向外「生长」→ 导轨方块沿轨滑入 → 底部两排卡片沿各自导轨滑入 → 装饰虚线浮现；进场方向由数据侧 `drift` 给出（**所有方块与卡片都严格沿所在导轨**：底部两排与上方方块同一套规则，不再有「平台中心 → 卡片」的放射连线），不要用 `svgOrigin` 之类把缩放原点挪到平台中心——那会粘在元素上、连带改掉后续悬停缩放的原点。
- SVG 上的 `.is-motion` 会停用 CSS 的 `iso-in` / `iso-draw`，**必须停**：这两条 animation 是 `fill-mode: both`，动画终值以「动画优先级」压掉内联样式（实测会让悬停变暗、虚线流动全部失效）。
- **常驻循环仍走 CSS**：`iso-float`（漂浮）/ `iso-drift`（台面虚线流动）/ `iso-shadow`（投影呼吸），GSAP 一律不碰 `.float` 这一层——同一个元素上 CSS `transform` 会覆盖 SVG 的 `transform` 属性，两套必须分层。CSS 入场保留为兜底（无 JS / GSAP 加载失败 / `prefers-reduced-motion`）。

### 6. 悬停交互
- 以方块自身中心缩放 1.07、同类方块变暗到 0.42、**所在导轨**高亮成品牌色并跑一条流动虚线（虚线周期 10+6=16，offset 每轮走 -16 才不跳变）；底部两排卡片各自绑到它那一排的导轨（`data-rail` 排在 4 条上方导轨之后）；交互在入场时间线 `onComplete` 后才绑定，避免与入场 tween 抢同一批 `scale` / `opacity`。
- ★ 缩放必须写 `gsap.to(el, { scale })`，**不要用 `gsap.quickTo(el, 'scale')`**：SVG 的 scale 在 CSSPlugin 里被拆成 scaleX / scaleY，`quickTo` 的 `resetTo('scale')` 找不到同名 propTween 会**静默不生效**（实测矩阵恒为 identity；HTML 元素的 `quickTo('x' / 'y')` 正常，Hero CTA 磁吸就是用它）。
- 另：`StackIsometric.vue` 里元素列表一律用 `*Els` 后缀（`tileEls` / `satEls` / `cardEls` / `railEls`…），别和同名的数据数组（`tiles` / `rails` / `cards` / `satellites`）撞名——撞名会让 `tiles[i].drift` 读到 SVG 元素，整条入场时间线抛错。

### 7. 整体布局口径（实测）
改完实测「图形外框 vs 画布盒」：当前左右余量 220px / 219px、上下 40px / 23px、图形占宽 66%，且 `scrollWidth === clientWidth`（无横向溢出）。

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
- ★ **每个用 `useMotion()` 的组件根节点必须带 `data-motion-scope`**：`revealOnScroll()` 只处理「最近 scope 祖先 === 本 root」的 `[data-reveal]`。漏掉会让 `Home.vue` 把子组件（等距图 / 快速开始 / 工具栏）的标记一起收进来，同一元素被建两份 tween 互相抢 opacity（症状：滚到底后部分文案仍 `opacity: 0`）。

### 5. SVG 与 CSS transform 覆盖
- **SVG 元素**：CSS transform 会覆盖 SVG 的 `transform` 属性——带等距矩阵 / `translate(...)` 的元素（等距图方块、内容地图卡片组）只能动画其**没有 transform 属性**的外层 `<g>`，或改用透明度；等距图方块的悬停缩放挂在 `<a class="iso-tile">` 上（内部 `.float` 跑 CSS 漂浮，是不同元素，互不覆盖）。

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
