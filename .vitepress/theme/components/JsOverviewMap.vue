<script setup lang="ts">
/**
 * 「1. 学习地图：JS 的全貌」—— @vue-flow/core 绘制。
 * 内容与正文第 1 节逐条对应，只换渲染方式、不改语义：
 *
 *   JS 全貌
 *     ├─ 语言核心（ECMAScript 标准）  语法与类型 / 执行模型 / 异步模型 / 现代特性
 *     ├─ 宿主环境 API（非语言本身）   浏览器 / Node.js·Deno·Bun / 跨端
 *     └─ 工程生态                    模块系统 / 构建工具 / 类型层
 *
 * ★ 2026-10 重构（原图「太乱」的根因与解法，改动前请先读）：
 *   ① 原布局把 11 个职责卡片排成一列 → 整图高 740+ px，fitView 只能缩到 ~0.7（字变小、线变密）；
 *   ② 原连线是内置 smoothstep + 44px 列间距：竖向拐点固定在「父节点右侧 20px」，
 *      而同一父节点的所有子连线共享起点 → 多条线的竖向段叠在同一 x、横向段只剩 4~24px，
 *      折角圆角互相挤压成一串小方框；长竖向干线又紧贴卡片列，看起来就是「一堆交叉的线」。
 *
 *   现改为「根 → 三大板块（容器）→ 职责卡片」的两段式：
 *   - 三大板块各用一个 panel 容器承载，卡片在容器内按 2 列网格排布：
 *     11 项的高度降到 ~594px，整图接近正方形，fitView 缩放提升到 ~0.9（字更大、更易读）；
 *   - 连线只剩 3 条（根 → 板块），且改用正交树线 `orth`：拐点居中于两端、圆角统一，
 *     根右侧只有一个分叉口，上下两条干线各取所属板块的色相，形成一条「配电干线」；
 *   - 板块内部不再画线：卡片落在容器内即表示「属于该板块」，比 11 条细线更清楚。
 *
 * 坐标全部由代码算出（节点宽高固定、不测量 DOM）；增删职责只改 BRANCHES 一处。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode, FlowTone } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

/* ------------------------------------------------------------------ *
 * §1 版式常量
 * ------------------------------------------------------------------ */
const ROOT_W = 112
const ROOT_H = 52
/** 根与板块容器的水平间距：正交干线就画在这条水槽的中线上 */
const COL_GAP = 72
const BAND_W = 560
/** 容器左右内边距 */
const BAND_PAD_X = 16
/** 容器顶部留给板块标题的高度 */
const BAND_HEAD = 46
/** 容器底部内边距 */
const BAND_FOOT = 14
/** 容器内卡片两列，列间距 / 行间距 */
const CELL_GAP_X = 12
const CELL_GAP_Y = 10
const CELL_W = (BAND_W - BAND_PAD_X * 2 - CELL_GAP_X) / 2
const CELL_H = 60
/** 板块（容器）之间的纵向间距 */
const BAND_GAP = 20
/** 容器内卡片的列数 */
const COLS = 2

/* ------------------------------------------------------------------ *
 * §2 图内容（唯一真相源：与正文第 1 节逐条对应）
 * ------------------------------------------------------------------ */
type Branch = {
  id: string
  /** 板块标题 */
  title: string
  /** 板块补充说明（一句话边界） */
  hint: string
  tone: FlowTone
  leaves: { title: string; desc: string }[]
}

const BRANCHES: Branch[] = [
  {
    id: 'core',
    title: '语言核心（ECMAScript 标准）',
    hint: '规范定义的能力，换宿主也成立',
    tone: 'indigo',
    leaves: [
      { title: '语法与类型', desc: 'let/const、原始类型、对象、Symbol、BigInt' },
      { title: '执行模型', desc: '作用域、闭包、this、原型链、类' },
      { title: '异步模型', desc: '事件循环、宏任务/微任务、Promise、async/await' },
      { title: '现代特性', desc: 'Proxy/Reflect、迭代器、生成器、可选链、空值合并' },
    ],
  },
  {
    id: 'host',
    title: '宿主环境 API（非语言本身）',
    hint: '由运行环境提供，不属于语言规范',
    tone: 'sky',
    leaves: [
      { title: '浏览器', desc: 'DOM、BOM、Fetch、Canvas、Web Worker、Storage' },
      { title: 'Node.js/Deno/Bun', desc: 'fs、net、process、crypto、child_process' },
      { title: '跨端', desc: '小程序 / WebView / IoT 等各自宿主' },
    ],
  },
  {
    id: 'eco',
    title: '工程生态',
    hint: '围绕语言的模块、构建与类型体系',
    tone: 'emerald',
    leaves: [
      { title: '模块系统', desc: 'ESM（推荐）/ CommonJS（Node 遗留）' },
      { title: '构建工具', desc: 'Vite / esbuild / webpack / tsc' },
      { title: '类型层', desc: 'TypeScript / JSDoc' },
    ],
  },
]

/* ------------------------------------------------------------------ *
 * §3 布局：板块自上而下排列，父（根）纵向对齐中间的板块
 * ------------------------------------------------------------------ */
const rowsOf = (count: number) => Math.ceil(count / COLS)
const bandHeight = (rows: number) => BAND_HEAD + rows * CELL_H + (rows - 1) * CELL_GAP_Y + BAND_FOOT

let cursorY = 0
const bands = BRANCHES.map((branch) => {
  const rows = rowsOf(branch.leaves.length)
  const height = bandHeight(rows)
  const top = cursorY
  cursorY += height + BAND_GAP
  return { top, height }
})
const totalHeight = cursorY - BAND_GAP
const bandX = ROOT_W + COL_GAP

/* ------------------------------------------------------------------ *
 * §4 生成节点与连线
 * ------------------------------------------------------------------ */
const nodes: DocFlowNode[] = [
  {
    id: 'root',
    x: 0,
    y: totalHeight / 2 - ROOT_H / 2,
    data: { label: 'JS 全貌', width: ROOT_W, height: ROOT_H, shape: 'start', tone: 'brand', sourcePos: 'right' },
  },
]

const edges: DocFlowEdge[] = []

BRANCHES.forEach((branch, bi) => {
  const band = bands[bi]
  const bandId = `${branch.id}-band`

  nodes.push({
    id: bandId,
    x: bandX,
    y: band.top,
    data: {
      label:
        `<span class="t">${branch.title}</span>` +
        `<span class="d">${branch.hint} · ${branch.leaves.length} 项</span>`,
      width: BAND_W,
      height: band.height,
      shape: 'panel',
      tone: branch.tone,
      align: 'left',
      labelPos: 'top',
      targetPos: 'left',
    },
  })
  edges.push({ source: 'root', target: bandId, edgeType: 'orth', tone: branch.tone })

  branch.leaves.forEach((leaf, li) => {
    const col = li % COLS
    const row = Math.floor(li / COLS)
    nodes.push({
      id: `${branch.id}-${li}`,
      x: bandX + BAND_PAD_X + col * (CELL_W + CELL_GAP_X),
      y: band.top + BAND_HEAD + row * (CELL_H + CELL_GAP_Y),
      data: {
        label: `<span class="t">${leaf.title}</span><span class="d">${leaf.desc}</span>`,
        width: CELL_W,
        height: CELL_H,
        shape: 'card',
        tone: branch.tone,
        align: 'left',
      },
    })
  })
})

const legend: FlowLegendItem[] = [
  { shape: 'rect', tone: 'brand', text: 'JS 全貌' },
  { shape: 'rect', tone: 'indigo', text: '语言核心' },
  { shape: 'rect', tone: 'sky', text: '宿主环境 API' },
  { shape: 'rect', tone: 'emerald', text: '工程生态' },
]

const srText =
  'JS 全貌图：JS 全貌分三大板块，每个板块内列出其职责。一、语言核心（ECMAScript 标准）——语法与类型（let/const、原始类型、对象、Symbol、BigInt）；' +
  '执行模型（作用域、闭包、this、原型链、类）；异步模型（事件循环、宏任务/微任务、Promise、async/await）；' +
  '现代特性（Proxy/Reflect、迭代器、生成器、可选链、空值合并）。二、宿主环境 API（非语言本身）——' +
  '浏览器（DOM、BOM、Fetch、Canvas、Web Worker、Storage）；Node.js/Deno/Bun（fs、net、process、crypto、child_process）；' +
  '跨端（小程序/WebView/IoT 等各自宿主）。三、工程生态——模块系统（ESM 推荐 / CommonJS Node 遗留）；' +
  '构建工具（Vite / esbuild / webpack / tsc）；类型层（TypeScript / JSDoc）。'
</script>

<template>
  <DocFlow
    flow-id="js-overview-map"
    :nodes="nodes"
    :edges="edges"
    :legend="legend"
    :sr-text="srText"
    :height="600"
    :min-zoom="0.55"
    :max-zoom="1.2"
    hint="三层结构：JS 全貌 → 三大板块 → 板块内职责卡；拖拽画布可平移，按钮可缩放"
  />
</template>
