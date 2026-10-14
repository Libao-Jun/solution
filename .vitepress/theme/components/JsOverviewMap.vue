<script setup lang="ts">
/**
 * 「1. 学习地图：JS 的全貌」—— @vue-flow/core 重构。
 * 内容与 fundamentals/javascript 第 1 节原 ```text 缩进树逐条对应，只换渲染方式、不改语义：
 *
 *   JS 全貌
 *     ├─ 语言核心（ECMAScript 标准）  语法与类型 / 执行模型 / 异步模型 / 现代特性
 *     ├─ 宿主环境 API（非语言本身）   浏览器 / Node.js·Deno·Bun / 跨端
 *     └─ 工程生态                    模块系统 / 构建工具 / 类型层
 *
 * 构图：三级横向树（根 → 板块 → 职责）。主轴为 x，交叉轴为 y：
 * 每个板块的叶子按 ROW_GAP 自上而下排开、板块之间留 BRANCH_GAP，父节点纵向居中于自己的叶子块，
 * 坐标全部由代码算出，不依赖 DOM 测量。三个板块各配一种色相，便于对号入座。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode, FlowTone } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

const ROOT_W = 140
const ROOT_H = 52
const CAT_W = 230
const CAT_H = 46
const LEAF_W = 320
const LEAF_H = 50
/**
 * 层间距（主轴）：内置 smoothstep 连线的 offset 默认 20，两侧各吃掉 20px，
 * 故这一间距必须大于 40，否则连线起点会越过终点、在节点之间打结。
 */
const COL_GAP = 44
/** 同一板块内相邻叶子间距（交叉轴） */
const ROW_GAP = 12
/** 板块之间的额外间距（交叉轴） */
const BRANCH_GAP = 26

const ROOT_X = 0
const CAT_X = ROOT_X + ROOT_W + COL_GAP
const LEAF_X = CAT_X + CAT_W + COL_GAP

type Branch = {
  id: string
  /** 板块标题 */
  title: string
  tone: FlowTone
  leaves: { title: string; desc: string }[]
}

const BRANCHES: Branch[] = [
  {
    id: 'core',
    title: '语言核心（ECMAScript 标准）',
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
    tone: 'emerald',
    leaves: [
      { title: '模块系统', desc: 'ESM（推荐）/ CommonJS（Node 遗留）' },
      { title: '构建工具', desc: 'Vite / esbuild / webpack / tsc' },
      { title: '类型层', desc: 'TypeScript / JSDoc' },
    ],
  },
]

/** 先量每个板块（= 它的叶子块）在交叉轴上的高度与起点，父节点再居中于自己的叶子块 */
let cursor = 0
const blocks = BRANCHES.map((branch) => {
  const height = branch.leaves.length * LEAF_H + (branch.leaves.length - 1) * ROW_GAP
  const top = cursor
  cursor += height + BRANCH_GAP
  return { top, height }
})
const totalHeight = cursor - BRANCH_GAP

const nodes: DocFlowNode[] = [
  {
    id: 'root',
    x: ROOT_X,
    y: totalHeight / 2 - ROOT_H / 2,
    data: { label: 'JS 全貌', width: ROOT_W, height: ROOT_H, shape: 'start', tone: 'brand', sourcePos: 'right' },
  },
]

const edges: DocFlowEdge[] = []

BRANCHES.forEach((branch, bi) => {
  const block = blocks[bi]
  nodes.push({
    id: branch.id,
    x: CAT_X,
    y: block.top + block.height / 2 - CAT_H / 2,
    data: {
      label: `<span class="t">${branch.title}</span>`,
      width: CAT_W,
      height: CAT_H,
      shape: 'process',
      tone: branch.tone,
      targetPos: 'left',
      sourcePos: 'right',
    },
  })
  edges.push({ source: 'root', target: branch.id })

  branch.leaves.forEach((leaf, li) => {
    const id = `${branch.id}-${li}`
    nodes.push({
      id,
      x: LEAF_X,
      y: block.top + li * (LEAF_H + ROW_GAP),
      data: {
        label: `<span class="t">${leaf.title}</span><span class="d">${leaf.desc}</span>`,
        width: LEAF_W,
        height: LEAF_H,
        shape: 'card',
        tone: branch.tone,
        targetPos: 'left',
      },
    })
    edges.push({ source: branch.id, target: id })
  })
})

const legend: FlowLegendItem[] = [
  { shape: 'rect', tone: 'brand', text: 'JS 全貌' },
  { shape: 'rect', tone: 'indigo', text: '语言核心' },
  { shape: 'rect', tone: 'sky', text: '宿主环境 API' },
  { shape: 'rect', tone: 'emerald', text: '工程生态' },
]

const srText =
  'JS 全貌树：JS 全貌分三大板块。一、语言核心（ECMAScript 标准）——语法与类型（let/const、原始类型、对象、Symbol、BigInt）；' +
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
    :min-zoom="0.4"
    :max-zoom="1.2"
    hint="三级横向树：根 → 三大板块 → 各自职责；拖拽画布可平移，按钮可缩放"
  />
</template>
