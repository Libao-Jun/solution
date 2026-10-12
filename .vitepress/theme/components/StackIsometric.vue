<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
// 方块链接必须经 withBase 处理，否则子路径部署（GitHub Pages /solution/）下会 404
import { withBase } from 'vitepress'

import { revealOnScroll, useMotion } from '../animations/motion'
import { categories } from '../data/topics'

/**
 * 首页「技术栈覆盖」等距 3D 示意图（对应参考站 home/HeroRive.vue 的视觉位置）。
 *
 * ★ 内容约定：图上出现的每一个方块都必须对应仓库里**已有的一篇文档**，数据直接取自
 *   ../data/topics.ts 的 categories（标题与链接都不另写一份）。20 篇主题文档全部在图上：
 *   中心平台 6 篇（Web 基础）+ 左右导轨上 7 篇（框架 / 跨端）
 *   + 下方「正面」一排 4 篇（工程化）+ 下方「侧面」一排 4 篇（H5 唤起 / 学习路线 / 开源许可证 / 求职职场）。
 * ★ 实现约定：纯 SVG 等距投影（不引入 Rive / 3D 库）。块体厚度用「同一圆角矩形向屏幕
 *   下方偏移 DEPTH 叠两层」实现——底层有色、顶层白色，露出的边自然成为侧面；比手算六个
 *   顶点稳妥，圆角处也不会出现接缝。
 * ★ 线网约定：**方块一律落在导轨（沿 ±x / ±y 的等距直线）上，一条线只画一次**。
 *   不要「先画一根长辅助线、再给每个方块画一根分支线」——那样同一方向会出现两条近乎
 *   平行的线，看起来就是多余的分支线。
 * ★ 底部两组必须**分别对齐平台的「正面」与「侧面」，不要挤成一排**（曾经的做法是把 8 张
 *   卡片全部沿屏幕水平方向排成一行，等于既不平行于正面也不平行于侧面，且相邻卡片只有
 *   10px 间距，视觉上「挤在一堆」）：
 *   - 「正面」= 顶面在 max y 的那条边（贴「20 篇主题文档」的那面），其台面内方向是局部 +x，
 *     所以正面一排沿 **x 轴**排布、整体位于该边之外（局部 y > 台面边 + 厚度）；
 *   - 「侧面」= 顶面在 max x 的那条边，其台面内方向是局部 +y，所以侧面一排沿 **y 轴**排布、
 *     整体位于该边之外（局部 x > 台面边 + 厚度）。
 *   两排由此分别贴着各自那一面、方向与该面一致，并在平台底角正下方汇合成 V，
 *   与上方两组导轨的 Λ 形成上下呼应（上方导轨收进平台之下，下方两排汇合于平台之下）。
 */

/* ---------------- 等距投影工具 ---------------- */
const round = (n: number) => Math.round(n * 100) / 100
const IX = round(Math.cos(Math.PI / 6)) // 0.866：30° 等距横轴系数
const IY = 0.5 // 纵轴系数（2:1 等距）
const ORIGIN = { x: 595, y: 250 } // 平台局部原点在画布中的位置（595 让整幅图形在画布里左右居中）

const project = (x: number, y: number) => ({ x: (x - y) * IX, y: (x + y) * IY })
const onScreen = (x: number, y: number, dz = 0) => {
  const p = project(x, y)
  return { x: round(ORIGIN.x + p.x), y: round(ORIGIN.y + p.y + dz) }
}
/** 平面矩形（局部 u/v 坐标）→ 等距矩阵；dz 为屏幕垂直偏移，用于叠出厚度 */
const isoMatrix = (x: number, y: number, dz = 0) => {
  const p = onScreen(x, y, dz)
  return `matrix(${IX} ${IY} ${-IX} ${IY} ${p.x} ${p.y})`
}
/**
 * 平面上的文字：只做轻微斜切（不做整块 30° 变形）保证中文可读。
 * 切变越小字形越清晰（笔画多的中文对切变尤其敏感），0.24/-0.26 ≈ 13° 足以读出"在平面上"。
 */
const textMatrix = (x: number, y: number, dz = 0) => {
  const p = onScreen(x, y, dz)
  return `matrix(1 0.24 -0.26 1 ${p.x} ${p.y})`
}
/** 字号整体上调 1px：中文笔画密，小字号最容易糊 */
const labelFont = (text: string) => (text.length > 8 ? 13 : text.length > 5 ? 14.5 : 16)
const cardFont = (text: string) => (text.length > 4 ? 12 : 13.5)

/* ---------------- 数据（全部来自已有文档） ---------------- */
/** 图上放不下的长标签用短名显示，完整名称通过 title 与链接给出 */
const SHORT: Record<string, string> = {
  微信小程序: '小程序',
  '响应式/自适应': '响应式',
  'H5 唤起 APP': 'H5 唤起',
  '求职 · 简历 · 职场': '求职职场',
}
type Doc = { text: string; link: string }
const short = (t: string) => SHORT[t] ?? t

const platformDocs = categories[0].chips // Web 基础 6 篇
const leftDocs = categories[1].chips.slice(0, 4) // React / Vue / Svelte / 语法对比
const rightDocs = categories[1].chips.slice(4) // Taro / 微信小程序 / App 开发
const bottomDocs: Doc[] = [
  ...categories[2].chips, // 工程化 5 篇
  { text: '学习路线', link: '/roadmaps/' },
  { text: '开源许可证', link: '/career/open-source-license/' },
  { text: '求职 · 简历 · 职场', link: '/career/resume-and-career/' },
]

/* ---------------- 中心平台尺寸 ---------------- */
const TILE = 84
const GAP = 10
const COLS = 3
const ROWS = 2
const DEPTH = 32
const FACE_PAD = 20 // 台面比 6 格区域外扩一圈，否则白色台面 + 白色方块会糊成一片
const W = COLS * TILE + (COLS - 1) * GAP // 272（6 格区域）
const H = ROWS * TILE + (ROWS - 1) * GAP // 178
const FACE_W = W + FACE_PAD * 2
const FACE_H = H + FACE_PAD * 2
/** 台面中心在画布里的坐标：入场时方块「从平台往外长」的方向基准 */
const PLATFORM_CENTER = onScreen(W / 2, H / 2)
/**
 * 从平台中心指向 p 的单位向量 × d（屏幕坐标）。
 * 入场位移用它而不是缩放原点：位移方向显式可控（导轨上的方块仍严格沿导轨方向滑入），
 * 也不会像 GSAP `svgOrigin` 那样把「缩放原点」粘在元素上、影响后续悬停缩放的原点。
 */
const outward = (p: { x: number; y: number }, d: number) => {
  const dx = p.x - PLATFORM_CENTER.x
  const dy = p.y - PLATFORM_CENTER.y
  const len = Math.hypot(dx, dy) || 1
  return { x: round((dx / len) * d), y: round((dy / len) * d) }
}
/** 6 格之间的虚线分隔（落在格与格的缝隙里） */
const separators = [
  [TILE + GAP / 2, 0, TILE + GAP / 2, H],
  [2 * (TILE + GAP) - GAP / 2, 0, 2 * (TILE + GAP) - GAP / 2, H],
  [0, TILE + GAP / 2, W, TILE + GAP / 2],
].map(([x1, y1, x2, y2]) => {
  const a = onScreen(x1, y1)
  const b = onScreen(x2, y2)
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
})

/* ---------------- 台面 6 格（Web 基础） ---------------- */
const tiles = platformDocs.map((doc, i) => {
  const x = (i % COLS) * (TILE + GAP)
  const y = Math.floor(i / COLS) * (TILE + GAP)
  return {
    ...doc,
    label: short(doc.text),
    size: TILE,
    /** 入场位移：从平台中心朝向自己的方向（靠中心的格位移小，靠外沿的更明显） */
    drift: outward(onScreen(x + TILE / 2, y + TILE / 2), 14),
    shadow: isoMatrix(x, y, 6),
    face: isoMatrix(x, y),
    labelAt: textMatrix(x + TILE / 2, y + TILE / 2),
    delay: `${260 + i * 60}ms`,
    floatDelay: `-${round((i * 0.9) % 7)}s`,
  }
})

/* ---------------- 导轨 + 落在导轨上的方块 ---------------- */
const SAT_W = 92
const SAT_H = 50
/** 入场时方块沿导轨滑入的距离（屏幕像素）；上方方块与底部两排卡片共用同一值 */
const RAIL_DRIFT = 24
type RailDef = { axis: 'x' | 'y'; offset: number; to: number; cubes: { doc: Doc; at: number }[] }

/**
 * ★ 导轨端点**不写死**：由最外侧方块的位置推导（见下面 `rails`）。
 *   手写偏移量极易多伸出一截，在方块外侧留下一条断头线（「末端多出的线条」），
 *   或画到 viewBox 外被 overflow:hidden 齐平切掉（「超出容器宽度」）。
 * 其余约束：
 * 1. 方块中心屏幕 y = 250 + 0.5·(x + y)，太靠外会被 viewBox 上沿裁掉；
 * 2. 同一导轨上相邻方块中心间距不要小于约 105：方块长对角线 = 0.866·(SAT_W + SAT_H) ≈ 123，
 *    再近就会明显互相压住。想更紧凑要整体缩小方块 + 拉近与平台的距离，别把方块叠在一起。
 */
const railDefs: RailDef[] = [
  {
    axis: 'x',
    offset: 20,
    to: 100,
    cubes: [
      { doc: leftDocs[0], at: -90 },
      { doc: leftDocs[1], at: -200 },
    ],
  },
  {
    axis: 'x',
    offset: 170,
    to: 100,
    cubes: [
      { doc: leftDocs[2], at: -80 },
      { doc: leftDocs[3], at: -190 },
    ],
  },
  {
    axis: 'y',
    offset: 40,
    to: 120,
    cubes: [
      { doc: rightDocs[0], at: -90 },
      { doc: rightDocs[1], at: -200 },
    ],
  },
  {
    axis: 'y',
    offset: 190,
    to: 120,
    cubes: [{ doc: rightDocs[2], at: -175 }],
  },
]

/**
 * 上方 4 条导轨线（一条只画一次）。等距投影对轴向长度是保长的，所以屏幕长度 = |to - from|。
 * ★ `from` 取该导轨上**最外侧方块的中心**：线正好收进方块底下，
 *   末端绝不会在方块之外多出一截断头线（这正是「末端多出了线条」的成因）。
 */
const satelliteRails = railDefs.map((r, i) => {
  const from = Math.min(...r.cubes.map((c) => c.at))
  const a = r.axis === 'x' ? onScreen(from, r.offset) : onScreen(r.offset, from)
  const b = r.axis === 'x' ? onScreen(r.to, r.offset) : onScreen(r.offset, r.to)
  return {
    x1: a.x,
    y1: a.y,
    x2: b.x,
    y2: b.y,
    len: Math.abs(r.to - from),
    delay: `${60 + i * 80}ms`,
  }
})

/** 方块：中心对齐导轨，于是「线从方块下面穿过」而不是「另拉一根支线」 */
let satIndex = 0
const satellites = railDefs.flatMap((r, railIndex) =>
  r.cubes.map((c) => {
    const cx = r.axis === 'x' ? c.at : r.offset
    const cy = r.axis === 'x' ? r.offset : c.at
    const x = cx - SAT_W / 2
    const y = cy - SAT_H / 2
    const delay = `${420 + satIndex * 70}ms`
    const floatDelay = `-${round((satIndex * 1.3) % 7)}s`
    satIndex += 1
    return {
      ...c.doc,
      label: short(c.doc.text),
      w: SAT_W,
      h: SAT_H,
      /** 所属导轨下标：悬停时高亮这条导轨用 */
      rail: railIndex,
      /**
       * 入场位移：**严格沿所在导轨**从外侧滑进来。
       * x 轴导轨的外侧在屏幕左上（-x 方向 → (-IX, -IY)）；y 轴导轨的外侧在屏幕右上（-y 方向 → (IX, -IY)）。
       */
      drift:
        r.axis === 'x'
          ? { x: -round(IX * RAIL_DRIFT), y: -round(IY * RAIL_DRIFT) }
          : { x: round(IX * RAIL_DRIFT), y: -round(IY * RAIL_DRIFT) },
      base: isoMatrix(x, y, 12),
      face: isoMatrix(x, y),
      labelAt: textMatrix(cx, cy),
      delay,
      floatDelay,
    }
  }),
)

/* ---------------- 底部两排：正面（沿 x 轴）与侧面（沿 y 轴） ---------------- */
const CARD_W = 70
const CARD_H = 38
/** 同一排相邻卡片的中心间距（局部单位；等距投影沿轴保长，所以也就是屏幕上的沿轨距离） */
const CARD_PITCH = 96
/** 两排最外侧卡片的局部起点（正面一排是 x，侧面一排是 y）：负值让外端伸到平台之外 */
const ROW_FROM = -104
/**
 * 两排导轨的位置：都在各自那一面的台面边之外、并留出相同的净空（厚度 32 + 净空 38），
 * 于是两排离平台的视觉距离一致。再往里会贴住平台的侧面厚度，再往外会与平台脱节。
 */
const ROW_CLEARANCE = 38
const FRONT_ROW_Y = H + FACE_PAD + DEPTH + ROW_CLEARANCE
const SIDE_ROW_X = W + FACE_PAD + DEPTH + ROW_CLEARANCE
/**
 * 两排导轨中心线的交点：两条导轨在此汇合，落在平台底角正下方——
 * 上方 4 条导轨是「收进平台之下」，下方两条在此「汇合于平台之下」，上下因此对称。
 */
const ROW_VERTEX = { x: SIDE_ROW_X + CARD_W / 2, y: FRONT_ROW_Y + CARD_H / 2 }

/**
 * 前 4 篇（工程化）对齐**正面**：沿 x 轴排布，整体落在正面那条边之外；
 * 后 4 篇（H5 唤起 / 学习路线 / 开源许可证 / 求职职场）对齐**侧面**：沿 y 轴排布，整体落在侧面那条边之外。
 * 两排的 `rail` 指向下方那两条导轨线（下标接在上方 4 条之后）。
 */
const bottomRows = [
  { axis: 'x' as const, docs: bottomDocs.slice(0, 4) },
  { axis: 'y' as const, docs: bottomDocs.slice(4) },
]
const cards = bottomRows.flatMap((row, rowIndex) =>
  row.docs.map((doc, i) => {
    const along = ROW_FROM + i * CARD_PITCH
    const x = row.axis === 'x' ? along : SIDE_ROW_X
    const y = row.axis === 'x' ? FRONT_ROW_Y : along
    return {
      ...doc,
      label: short(doc.text),
      w: CARD_W,
      h: CARD_H,
      /** 所属导轨下标（接在上方 4 条之后）：悬停时高亮这一排的导轨 */
      rail: railDefs.length + rowIndex,
      /**
       * 入场位移：**严格沿所在导轨**从外侧滑进来（与上方导轨方块同一套规则）。
       * x 轴导轨的外侧在屏幕左上（(-IX, -IY)）；y 轴导轨的外侧在屏幕右上（(IX, -IY)）。
       */
      drift:
        row.axis === 'x'
          ? { x: -round(IX * RAIL_DRIFT), y: -round(IY * RAIL_DRIFT) }
          : { x: round(IX * RAIL_DRIFT), y: -round(IY * RAIL_DRIFT) },
      base: isoMatrix(x, y, 8),
      face: isoMatrix(x, y),
      labelAt: textMatrix(x + CARD_W / 2, y + CARD_H / 2),
      delay: `${760 + (rowIndex * 4 + i) * 50}ms`,
      floatDelay: `-${round(((rowIndex * 4 + i) * 0.6) % 7)}s`,
    }
  }),
)

/**
 * 底部两条导轨线：分别沿 x / y 轴、各贴着对应那一面，`from` 取该排最外侧卡片的中心，
 * `to` 取两排的汇合点（平台底角正下方）。与上方 4 条导轨共用同一套「从平台向外生长」的绘制动画。
 */
const bottomRails = bottomRows.map((row, i) => {
  const from = ROW_FROM + (row.axis === 'x' ? CARD_W : CARD_H) / 2
  const to = row.axis === 'x' ? ROW_VERTEX.x : ROW_VERTEX.y
  const offset = row.axis === 'x' ? ROW_VERTEX.y : ROW_VERTEX.x
  const a = row.axis === 'x' ? onScreen(from, offset) : onScreen(offset, from)
  const b = row.axis === 'x' ? onScreen(to, offset) : onScreen(offset, to)
  return {
    x1: a.x,
    y1: a.y,
    x2: b.x,
    y2: b.y,
    len: Math.abs(to - from),
    delay: `${320 + i * 80}ms`,
  }
})

/** 导轨线合集：上方 4 条（框架 / 跨端）+ 下方 2 条（正面 / 侧面） */
const rails = [...satelliteRails, ...bottomRails]

/* ---------------- 平台装饰 ---------------- */
/** 基底三个可见顶点垂下的装饰虚线（对应参考图里台面往下的虚线） */
const drops = [
  onScreen(-FACE_PAD, H + FACE_PAD, DEPTH),
  onScreen(W + FACE_PAD, H + FACE_PAD, DEPTH),
  onScreen(W + FACE_PAD, -FACE_PAD, DEPTH),
]
const shadow = onScreen(W + FACE_PAD, H + FACE_PAD, DEPTH - 12)
/**
 * 正面文字：必须用**完整等距矩阵**而不是 textMatrix。
 * 台面前沿是 30° 斜边，长文字若只做轻微斜切会越过只有 DEPTH 厚度的侧面
 * （150px 宽的文字在斜边方向会上下错开 ~138px ≫ 32px 厚度）。
 * 用等距矩阵后文字沿斜边排布、贴在侧面上；字号要在平面里放大到 ~22 才有 ~11px 的视觉字高，
 * 且必须补 letter-spacing —— 等距下中文横向前进只有 0.866×字号，不补字距相邻字会互相压住。
 */
const platformLabel = isoMatrix(W / 2, H + FACE_PAD, DEPTH * 0.62)

/* ---------------- 入场 / 漂浮动画的触发 ---------------- */
const root = ref<HTMLElement | null>(null)
const revealed = ref(false) // 进入视口后播放入场动画（一次）
const visible = ref(false) // 在视口内时才跑持续漂浮（离开即暂停，省电）
/** GSAP 接管入场的标记：样式里的 `.is-motion` 会停用 CSS 入场，避免两套动画抢 transform / stroke-dashoffset */
const motion = ref(false)
let io: IntersectionObserver | null = null

onMounted(() => {
  const svg = root.value?.querySelector('svg')
  if (!svg || typeof IntersectionObserver === 'undefined') {
    revealed.value = true
    visible.value = true
    return
  }
  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          revealed.value = true
        }
        visible.value = entry.isIntersecting
      }
    },
    { threshold: [0, 0.25] },
  )
  io.observe(svg)
})

onUnmounted(() => {
  io?.disconnect()
  io = null
})

/**
 * GSAP 增强（不回退上面那套 CSS 动效）：
 *
 * 1. 入场编排：GSAP 接管时给 svg 挂 `.is-motion`（样式里据此禁用 CSS 的 iso-in / iso-draw），
 *    改由**一条时间线**按物理层次编排：
 *    投影 → 平台升起 → 正面文字字距收拢 → 台面 6 格从平台中心长出 → 导轨从平台向外生长 →
 *    导轨方块与底部两排卡片沿轨滑入 → 装饰虚线浮现。
 *    「向外」的位移方向由数据侧算好（`drift`）：导轨上的方块**严格沿所在导轨**滑入，
 *    底部两排卡片与上方方块同一套规则（正面一排沿 x 轴、侧面一排沿 y 轴），
 *    台面格子朝平台外沿长出来——进场方向与静态几何同源，不会把方块送离它该在的那条线上。
 *    CSS 入场仍保留为兜底：无 JS / 减少动态效果 / 进视口时 GSAP 还没就绪 三种情况都还能正常播。
 * 2. 常驻漂浮 / 台面虚线流动 / 投影呼吸继续走 CSS（iso-float / iso-drift / iso-shadow）——
 *    GSAP 一律不碰 `.float` 这一层：同一个元素上 CSS transform 会覆盖 SVG 的 transform 属性，两套必须分层。
 * 3. 交互：方块悬停缩放 + 同类方块变暗聚焦 + 所在导轨高亮并「流动」。
 */
useMotion(root, (tools, element) => {
  const { gsap } = tools
  revealOnScroll(tools, element, { distance: 16, stagger: 0.07 })

  const svg = element.querySelector('svg')
  if (!svg) {
    return
  }

  const pick = <T extends Element>(selector: string) => gsap.utils.toArray<T>(selector, svg)

  const shadowEls = pick<SVGElement>('[data-iso="shadow"]')
  const platformEls = pick<SVGElement>('[data-iso="platform"]')
  const labelEls = pick<SVGElement>('[data-iso="label"]')
  // 注意命名：元素列表一律 *Els 后缀，别和上面同名的数据数组（tiles / satellites / cards）撞名——
  // 撞名会让 `tiles[i].drift` 读到 SVG 元素而不是数据（曾因此整条入场时间线抛错）
  const tileEls = pick<SVGElement>('[data-iso="tile"]')
  const satEls = pick<SVGElement>('[data-iso="sat"]')
  const cardEls = pick<SVGElement>('[data-iso="card"]')
  const railEls = pick<SVGLineElement>('[data-iso="rail"]')
  const dropEls = pick<SVGElement>('[data-iso="drops"]')

  const blocks = [...tileEls, ...satEls, ...cardEls]
  /** 全部连线即导轨本身（底部两排各自的那条导轨也在 railEls 里，下标排在 4 条上方导轨之后） */
  const lines = railEls
  const cleanups: Array<() => void> = []

  /* 缩放原点显式设在方块自身中心（GSAP 会把它烘进矩阵，位移量正好是中心 ×(1-scale)） */
  blocks.forEach((el) => gsap.set(el, { transformOrigin: '50% 50%' }))

  /**
   * ★ 悬停缩放必须用 `gsap.to`，**不要用 `gsap.quickTo(el, 'scale')`**：
   *   SVG 元素的 scale 在 CSSPlugin 里被拆成 scaleX / scaleY 两个 propTween，
   *   quickTo 的 `resetTo('scale')` 找不到同名 propTween → 静默不生效（实测矩阵始终是 identity）。
   *   `overwrite: 'auto'` 让来回快速切换时旧 tween 被收掉，不会越积越多互相抢。
   */
  const scaleTo = (el: Element, value: number, duration = 0.3) =>
    gsap.to(el, { scale: value, duration, ease: 'power2.out', overwrite: 'auto' })

  const lineStroke = getComputedStyle(lines[0] ?? svg).stroke || '#E4E2EC'
  const brand = getComputedStyle(element).getPropertyValue('--color-brand').trim() || '#4F30E8'
  /** 导轨 / 连线的流动虚线动画（悬停时创建，离开时销毁） */
  let flow: gsap.core.Tween | null = null

  /** 方块 → 它所在的那条导轨 */
  const relatedLine = (el: Element) => {
    const { rail } = (el as HTMLElement).dataset
    return rail === undefined ? null : (railEls[Number(rail)] ?? null)
  }

  /** 悬停聚焦：本方放大、同类变暗、所在导轨高亮并「流动」；传 null 复位 */
  const setFocus = (target: Element | null) => {
    if (target) {
      scaleTo(target, 1.07)
    }
    gsap.to(target ? blocks.filter((el) => el !== target) : blocks, {
      scale: target ? 0.985 : 1,
      opacity: target ? 0.42 : 1,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    })

    flow?.kill()
    flow = null
    // 复位所有线：实线 + 原色（dasharray 置 none 即实线，与入场结束后的观感一致）
    gsap.set(lines, { strokeDasharray: 'none', strokeDashoffset: 0 })
    gsap.to(lines, { stroke: lineStroke, strokeWidth: 1, duration: 0.3, overwrite: 'auto' })

    const line = target ? relatedLine(target) : null
    if (line) {
      // 虚线周期 = 10 + 6 = 16：offset 每轮正好走 -16，循环处无跳变
      gsap.set(line, { strokeDasharray: '10 6', strokeDashoffset: 0 })
      gsap.to(line, { stroke: brand, strokeWidth: 1.8, duration: 0.25, overwrite: 'auto' })
      flow = gsap.to(line, { strokeDashoffset: -16, duration: 0.9, ease: 'none', repeat: -1 })
    }
  }

  /** 入场结束后才绑定指针交互：避免与入场 tween 抢同一个 scale / opacity */
  const bindInteractions = () => {
    blocks.forEach((el) => {
      let hovered = false
      const onEnter = () => {
        hovered = true
        setFocus(el)
      }
      const onLeave = () => {
        hovered = false
        setFocus(null)
      }
      const onDown = () => scaleTo(el, 0.97, 0.15)
      const onUp = () => scaleTo(el, hovered ? 1.07 : 1, 0.2)
      el.addEventListener('pointerenter', onEnter)
      el.addEventListener('pointerleave', onLeave)
      el.addEventListener('pointerdown', onDown)
      el.addEventListener('pointerup', onUp)
      cleanups.push(() => {
        el.removeEventListener('pointerenter', onEnter)
        el.removeEventListener('pointerleave', onLeave)
        el.removeEventListener('pointerdown', onDown)
        el.removeEventListener('pointerup', onUp)
      })
    })
  }

  const setupEntrance = () => {
    /* 起点（JS 侧生成；GSAP 不参与时页面仍是完整静态内容，绝不用 CSS 先隐藏） */
    gsap.set(shadowEls, { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' })
    gsap.set(platformEls, { autoAlpha: 0, y: 34 })
    gsap.set(labelEls, { autoAlpha: 0, letterSpacing: '18px' })
    // x / y 起点按各自数据给的「向外位移」逐块取（函数式取值，避免 20 多个 tween 各写一遍）
    gsap.set(tileEls, {
      autoAlpha: 0,
      scale: 0.88,
      x: (i: number) => tiles[i]?.drift.x ?? 0,
      y: (i: number) => tiles[i]?.drift.y ?? 0,
    })
    gsap.set(satEls, {
      autoAlpha: 0,
      scale: 0.8,
      x: (i: number) => satellites[i]?.drift.x ?? 0,
      y: (i: number) => satellites[i]?.drift.y ?? 0,
    })
    gsap.set(cardEls, {
      autoAlpha: 0,
      scale: 0.82,
      x: (i: number) => cards[i]?.drift.x ?? 0,
      y: (i: number) => cards[i]?.drift.y ?? 0,
    })
    gsap.set(dropEls, { autoAlpha: 0 })
    railEls.forEach((line) => {
      const len = line.getTotalLength()
      // dashoffset 从 -len 到 0：从平台那头（P2）向外生长
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: -len })
    })

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: svg, start: 'top 84%', once: true },
      onComplete: bindInteractions,
    })

    timeline.to(shadowEls, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power2.out' }, 0)
    timeline.to(platformEls, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.05)
    timeline.to(labelEls, { autoAlpha: 1, letterSpacing: '7px', duration: 0.7 }, 0.35)
    timeline.to(
      tileEls,
      { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(1.7)' },
      0.4,
    )
    timeline.to(railEls, { strokeDashoffset: 0, duration: 0.75, stagger: 0.09, ease: 'power2.inOut' }, 0.7)
    timeline.to(
      satEls,
      { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 0.6, stagger: 0.07, ease: 'back.out(1.5)' },
      0.95,
    )
    timeline.to(
      cardEls,
      { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 0.55, stagger: 0.05, ease: 'back.out(1.4)' },
      1.2,
    )
    timeline.to(dropEls, { autoAlpha: 1, duration: 0.5 }, 1.45)
  }

  /**
   * ★ 一律由 GSAP 接管入场（不再看 IO 的 `revealed`）：
   *   等距图在 900px 高的首屏里已经露了一角，IO 在页面加载时就会置 `revealed = true`，
   *   若据此让位给 CSS 入场，用户真正滚到图前时看到的是「早就播完的静止画面」。
   *   另外 `.reveal` 上的 iso-in / iso-draw 是 `fill-mode: both` 的 CSS 动画，
   *   它们结束后的终值以**动画优先级**压掉内联样式（实测：悬停变暗、虚线流动全部失效），
   *   所以只要 GSAP 在，就必须用 `.is-motion` 关掉这两组 CSS 动画（见样式段）。
   */
  motion.value = true
  try {
    setupEntrance()
  } catch {
    // 兜底：编排构建失败时撤回内联起点、解除接管，交回 CSS 入场（内容必须始终可见）
    motion.value = false
    gsap.set([...blocks, ...platformEls, ...shadowEls, ...labelEls, ...dropEls], { clearProps: 'all' })
    gsap.set(lines, { clearProps: 'strokeDasharray,strokeDashoffset' })
    bindInteractions()
  }

  return () => {
    flow?.kill()
    flow = null
    cleanups.forEach((off) => off())
  }
})
</script>

<template>
  <section ref="root" data-motion-scope class="wrapper border-t px-5 sm:px-10 py-10 md:py-16">
    <div class="flex flex-col gap-2 mb-8">
      <p data-reveal class="text-sm font-mono text-[var(--color-brand)]">技术栈覆盖</p>
      <h3 data-reveal class="text-balance">图上每一块，都是仓库里的一篇文档</h3>
      <p data-reveal class="max-w-2xl text-pretty">
        中心平台是 Web 基础，左上与右上是框架与跨端，下方贴着平台正面的一排是工程化、贴着侧面的一排是学习路线与职业成长。点任意方块直接进入对应文档。
      </p>
    </div>

    <div class="overflow-x-auto">
      <svg
        class="iso-stack w-auto h-auto mx-auto min-w-[44rem] max-w-[80rem]"
        :class="{ 'is-revealed': revealed, 'is-visible': visible, 'is-motion': motion }"
        viewBox="0 85 1280 530"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="技术栈等距示意图：中心为 Solution 手册，四周连接仓库中已有的主题文档"
      >
        <defs>
          <!-- 竖向渐变（userSpaceOnUse）：两侧侧面同高同色，不会因为随矩形旋转而变成「箭头」 -->
          <linearGradient id="stack-edge" gradientUnits="userSpaceOnUse" x1="600" y1="330" x2="600" y2="535">
            <stop stop-color="#7C5CFF" />
            <stop offset="0.45" stop-color="#4F30E8" />
            <stop offset="1" stop-color="#2C1290" />
          </linearGradient>
          <filter id="stack-blur" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>

        <!-- 1. 导轨（每条只画一次，方块落在导轨上；上方 4 条 + 底部正面/侧面各 1 条） -->
        <g class="rail-group" stroke="#E4E2EC" stroke-width="1" stroke-linecap="round">
          <line
            v-for="(rail, i) in rails"
            :key="`rail-${i}`"
            data-iso="rail"
            class="rail"
            :style="{ '--len': rail.len, '--d': rail.delay }"
            :x1="rail.x1"
            :y1="rail.y1"
            :x2="rail.x2"
            :y2="rail.y2"
          />
        </g>

        <!-- 2. 地面投影 -->
        <ellipse
          data-iso="shadow"
          class="shadow"
          :cx="shadow.x"
          :cy="shadow.y"
          rx="228"
          ry="46"
          fill="#2B2440"
          opacity="0.14"
          filter="url(#stack-blur)"
        />

        <!-- 3. 中心平台 -->
        <g data-iso="platform" class="reveal" :style="{ '--d': '0ms' }">
          <g class="float" :style="{ '--f': '-2.4s' }">
            <!-- 底层（彩色）= 侧面 -->
            <rect
              x="0"
              y="0"
              :width="FACE_W"
              :height="FACE_H"
              rx="22"
              :transform="isoMatrix(-FACE_PAD, -FACE_PAD, DEPTH)"
              fill="url(#stack-edge)"
            />
            <!-- 顶层（浅色）= 台面 -->
            <rect
              x="0"
              y="0"
              :width="FACE_W"
              :height="FACE_H"
              rx="22"
              :transform="isoMatrix(-FACE_PAD, -FACE_PAD)"
              fill="#F1EEFF"
              stroke="#D6D0F2"
            />
            <!-- 台面内圈虚线（缓慢流动）+ 6 格之间的虚线分隔 -->
            <rect
              class="drift"
              x="0"
              y="0"
              :width="FACE_W - 18"
              :height="FACE_H - 18"
              rx="16"
              :transform="isoMatrix(-FACE_PAD + 9, -FACE_PAD + 9)"
              stroke="#DCD6F2"
              stroke-dasharray="5 5"
            />
            <g stroke="#DDD8F4" stroke-width="1" stroke-dasharray="4 5" opacity="0.9">
              <line v-for="(s, i) in separators" :key="`sep-${i}`" v-bind="s" />
            </g>
            <!-- 正面标签（用等距矩阵贴在侧面厚度上） -->
            <text
              x="0"
              y="0"
              :transform="platformLabel"
              text-anchor="middle"
              dominant-baseline="central"
              fill="#FFFFFF"
              font-size="26"
              font-weight="600"
              letter-spacing="7"
              data-iso="label"
              class="select-none"
            >
              20 篇主题文档
            </text>
          </g>

          <!-- 台面 6 格 = Web 基础 6 篇 -->
          <a
            v-for="tile in tiles"
            :key="tile.link"
            data-iso="tile"
            :href="withBase(tile.link)"
            class="iso-tile reveal"
            :style="{ '--d': tile.delay }"
          >
            <title>{{ tile.text }}</title>
            <g class="float" :style="{ '--f': tile.floatDelay }">
              <!-- 方块投影：让白色方块在浅色台面上「立」起来 -->
              <rect
                x="0"
                y="0"
                :width="tile.size"
                :height="tile.size"
                rx="12"
                :transform="tile.shadow"
                fill="#5A4B96"
                opacity="0.13"
              />
              <rect
                class="iso-face"
                x="0"
                y="0"
                :width="tile.size"
                :height="tile.size"
                rx="12"
                :transform="tile.face"
                fill="#FFFFFF"
                stroke="#E7E4F4"
              />
              <rect
                x="4"
                y="4"
                :width="tile.size - 8"
                :height="tile.size - 8"
                rx="9"
                :transform="tile.face"
                stroke="#F1EFFA"
              />
              <text
                x="0"
                y="0"
                :transform="tile.labelAt"
                text-anchor="middle"
                dominant-baseline="central"
                fill="#3F3B52"
                :font-size="labelFont(tile.label)"
                font-weight="500"
                class="select-none"
              >
                {{ tile.label }}
              </text>
            </g>
          </a>
        </g>

        <!-- 4. 平台底边往下的装饰虚线 -->
        <g
          data-iso="drops"
          stroke="#CCC8DA"
          stroke-width="1"
          stroke-dasharray="4 5"
          class="reveal"
          :style="{ '--d': '200ms' }"
        >
          <line
            v-for="(d, i) in drops"
            :key="`drop-${i}`"
            :x1="d.x"
            :y1="d.y"
            :x2="d.x"
            :y2="d.y + 34"
          />
        </g>

        <!-- 5. 导轨上的方块（上方 4 条导轨上的框架 / 跨端） -->
        <a
          v-for="sat in satellites"
          :key="sat.link"
          data-iso="sat"
          :data-rail="sat.rail"
          :href="withBase(sat.link)"
          class="iso-tile reveal"
          :style="{ '--d': sat.delay }"
        >
          <title>{{ sat.text }}</title>
          <g class="float" :style="{ '--f': sat.floatDelay }">
            <rect
              x="0"
              y="0"
              :width="sat.w"
              :height="sat.h"
              rx="12"
              :transform="sat.base"
              fill="#D8D5E5"
            />
            <rect
              class="iso-face"
              x="0"
              y="0"
              :width="sat.w"
              :height="sat.h"
              rx="12"
              :transform="sat.face"
              fill="#FFFFFF"
              stroke="#E7E4F4"
            />
            <text
              x="0"
              y="0"
              :transform="sat.labelAt"
              text-anchor="middle"
              dominant-baseline="central"
              fill="#3F3B52"
              :font-size="labelFont(sat.label)"
              font-weight="500"
              class="select-none"
            >
              {{ sat.label }}
            </text>
          </g>
        </a>

        <!-- 6. 底部两组卡片：前 4 篇沿正面（x 轴）排布、后 4 篇沿侧面（y 轴）排布 -->
        <a
          v-for="card in cards"
          :key="card.link"
          data-iso="card"
          :data-rail="card.rail"
          :href="withBase(card.link)"
          class="iso-tile reveal"
          :style="{ '--d': card.delay }"
        >
          <title>{{ card.text }}</title>
          <g class="float" :style="{ '--f': card.floatDelay }">
            <rect
              x="0"
              y="0"
              :width="card.w"
              :height="card.h"
              rx="9"
              :transform="card.base"
              fill="#CBC7DD"
            />
            <rect
              class="iso-face"
              x="0"
              y="0"
              :width="card.w"
              :height="card.h"
              rx="9"
              :transform="card.face"
              fill="#FFFFFF"
              stroke="#E7E4F4"
            />
            <text
              x="0"
              y="0"
              :transform="card.labelAt"
              text-anchor="middle"
              dominant-baseline="central"
              fill="#3F3B52"
              :font-size="cardFont(card.label)"
              font-weight="500"
              class="select-none"
            >
              {{ card.label }}
            </text>
          </g>
        </a>
      </svg>
    </div>
  </section>
</template>

<style scoped>
/* ------------------------------------------------------------------
   动画：全部走 CSS，SVG 的静态等距矩阵挂在元素自身的 transform 属性上，
   动画挂在**外层 <g class="float">** 上——两者是不同元素，互不覆盖。
   （同一个元素上 CSS transform 会覆盖 SVG transform 属性，所以必须分层。）
   ------------------------------------------------------------------ */

/* 显式声明：图形必须被画布裁住，不允许溢到内容区外面 */
.iso-stack {
  overflow: hidden;
}

/*
 * 文本清晰度：带切变的 SVG 文字若按默认（auto）渲染，浏览器会把字形吸附到像素网格，
 * 与非整数缩放叠加后中文就会发虚。geometricPrecision 改用几何精度栅格化，边缘明显干净。
 */
.iso-stack text {
  text-rendering: geometricPrecision;
}

.iso-tile {
  cursor: pointer;
}

.iso-face {
  transition:
    stroke 0.15s ease,
    fill 0.15s ease;
}

/* 悬浮：描边变为品牌色 + 轻微光晕（不做位移，避免与 float 动画抢 transform） */
.iso-tile:hover .iso-face {
  stroke: var(--color-brand);
  fill: #fdfcff;
  filter: drop-shadow(0 6px 10px rgb(79 48 232 / 0.18));
}

/* 入场：从下往上淡入（只在进入视口后播放，没有 JS / 无 IO 时保持可见） */
.iso-stack.is-revealed .reveal {
  animation: iso-in 0.72s cubic-bezier(0.22, 0.68, 0, 1) both;
  animation-delay: var(--d, 0ms);
}

/* 持续漂浮：只在区块位于视口内时运行 */
.iso-stack .float {
  animation: iso-float 7s ease-in-out infinite;
  animation-delay: var(--f, 0s);
  animation-play-state: paused;
}

.iso-stack.is-visible .float {
  animation-play-state: running;
}

/* 导轨与连线的「绘制」动画 */
.iso-stack.is-revealed .rail {
  stroke-dasharray: var(--len);
  animation: iso-draw 1.1s cubic-bezier(0.4, 0.2, 0.2, 1) both;
  animation-delay: var(--d, 0ms);
}

/* 台面虚线缓慢流动 */
.iso-stack .drift {
  animation: iso-drift 9s linear infinite;
}

/* 投影随平台一起「呼吸」 */
.iso-stack .shadow {
  animation: iso-shadow 7s ease-in-out infinite;
}

/*
 * GSAP 接管入场时（svg 上的 .is-motion）必须停用 CSS 入场与连线绘制：
 * CSS animation 的优先级**高于内联样式**，不关掉会直接盖住 GSAP 写的 transform / stroke-dashoffset。
 * 常驻的 iso-float / iso-drift / iso-shadow 不受影响（挂在不同元素上，GSAP 不碰那一层）。
 */
.iso-stack.is-motion .reveal,
.iso-stack.is-motion .rail {
  animation: none;
}

@keyframes iso-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes iso-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

@keyframes iso-draw {
  from {
    stroke-dashoffset: var(--len);
    opacity: 0;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes iso-drift {
  to {
    stroke-dashoffset: -60;
  }
}

@keyframes iso-shadow {
  0%,
  100% {
    opacity: 0.14;
  }
  50% {
    opacity: 0.2;
  }
}

/* 尊重系统「减少动态效果」：全部关掉，直接呈现终态 */
@media (prefers-reduced-motion: reduce) {
  .iso-stack .reveal,
  .iso-stack .float,
  .iso-stack .rail,
  .iso-stack .drift,
  .iso-stack .shadow {
    animation: none !important;
  }

  /* 需要 !important：上面 `.iso-stack.is-revealed .rail` 的选择器权重更高 */
  .iso-stack .rail {
    stroke-dasharray: none !important;
  }
}
</style>
