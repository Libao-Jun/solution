<script setup lang="ts">
/**
 * 「Vuex 与 Pinia 的核心概念对照图」——@vue-flow/core 重构。
 *
 * 依据两套官方文档各自列出的「核心概念」清单构图：
 * - Vuex 4：State / Getter / Mutation / Action / Module
 * - Pinia：定义 Store / State / Getter / Action / 插件 / 组件外的 Store
 *
 * 构图：左 Vuex、右 Pinia 两列，同行即「同一关注点」，横线为概念对应关系；
 * Vuex 的 Mutation 在 Pinia 无对应概念（并入 Action），用琥珀色 + 虚线强调，
 * 这是两者最本质的差别。坐标显式给出，不依赖 DOM 测量。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

const LEFT_X = 10
const LEFT_W = 316
const RIGHT_X = 560
const RIGHT_W = 336
const NODE_H = 58
const PITCH = 86

/** 一行 = 一个关注点：Vuex 侧概念 + Pinia 侧概念（pinia 为空表示该侧无对应概念） */
interface ConceptRow {
  vuex?: { title: string; desc: string }
  pinia?: { title: string; desc: string }
  /** 两侧之间的连线标签（省略则不连线） */
  link?: { label: string; dashed?: boolean }
  /** Vuex 官方清单之外的「对照项」（仅为对齐 Pinia 才列出，如插件 / 组件外使用） */
  compare?: boolean
}

const ROWS: ConceptRow[] = [
  {
    vuex: { title: 'Module', desc: '子树 + namespaced 命名空间' },
    pinia: { title: '定义 Store', desc: 'defineStore(id, …)，一文件一实例' },
    link: { label: '组织与隔离的单位' },
  },
  {
    vuex: { title: 'State', desc: '唯一数据源（模块内写成函数）' },
    pinia: { title: 'State', desc: 'state() 或 ref / reactive' },
    link: { label: '同名同义' },
  },
  {
    vuex: { title: 'Getter', desc: '派生 + 缓存，跨模块用 rootGetters' },
    pinia: { title: 'Getter', desc: 'getters 或 computed' },
    link: { label: '派生值，不存第二份' },
  },
  {
    vuex: { title: 'Mutation', desc: '唯一改状态入口，必须同步' },
    pinia: { title: '无 Mutation', desc: 'Pinia 不再有这一层' },
    link: { label: '无对应概念', dashed: true },
  },
  {
    vuex: { title: 'Action', desc: '异步编排 → commit 落地' },
    pinia: { title: 'Action', desc: '同步 / 异步都行，直接改' },
    link: { label: '业务动作的统一出口' },
  },
  {
    vuex: { title: '插件（plugins 选项）', desc: '常配合 subscribe 使用' },
    pinia: { title: '插件', desc: 'pinia.use() + $subscribe' },
    link: { label: '扩展点：持久化 / 日志', dashed: true },
    compare: true,
  },
  {
    vuex: { title: '组件外使用', desc: 'import 单例 store 即可' },
    pinia: { title: '组件外的 Store', desc: 'useStore(pinia) / setActivePinia' },
    link: { label: 'Pinia 多一步「拿到容器」', dashed: true },
    compare: true,
  },
]

/** 行索引：Mutation = 3、Action = 4，用于「并入 Action」那条跨行连线 */
const MUTATION_ROW = 3
const ACTION_ROW = 4
const panelHeight = (ROWS.length - 1) * PITCH + NODE_H

const nodes: DocFlowNode[] = [
  // 两个概念分组底板（装饰层，不接收指针事件）
  {
    id: 'panel-vuex',
    x: LEFT_X - 34,
    y: -66,
    data: {
      label: '<span class="t">Vuex 4 · 核心概念 5 个（下方 2 项为对照）</span>',
      width: LEFT_W + 52,
      height: panelHeight + 106,
      shape: 'panel',
      tone: 'slate',
      labelPos: 'top',
      align: 'left',
    },
  },
  {
    id: 'panel-pinia',
    x: RIGHT_X - 20,
    y: -66,
    data: {
      label: '<span class="t">Pinia · 6 个核心概念</span>',
      width: RIGHT_W + 44,
      height: panelHeight + 106,
      shape: 'panel',
      tone: 'indigo',
      labelPos: 'top',
      align: 'left',
    },
  },
]

const edges: DocFlowEdge[] = []

ROWS.forEach((row, index) => {
  const y = index * PITCH
  if (row.vuex) {
    const isMutation = index === MUTATION_ROW
    nodes.push({
      id: `vuex-${index}`,
      x: LEFT_X,
      y,
      data: {
        label: `<span class="t">${row.vuex.title}</span><span class="d">${row.vuex.desc}</span>`,
        width: LEFT_W,
        height: NODE_H,
        shape: 'card',
        tone: isMutation ? 'amber' : row.compare ? 'sky' : 'slate',
        align: 'left',
        sourcePos: 'right',
      },
    })
  }
  if (row.pinia) {
    const isMissing = row.pinia.title === '无 Mutation'
    nodes.push({
      id: `pinia-${index}`,
      x: RIGHT_X,
      y,
      data: {
        label: `<span class="t">${row.pinia.title}</span><span class="d">${row.pinia.desc}</span>`,
        width: RIGHT_W,
        height: NODE_H,
        shape: 'card',
        tone: isMissing ? 'amber' : 'indigo',
        align: 'left',
        targetPos: 'left',
      },
    })
  }
  if (row.vuex && row.pinia && row.link) {
    edges.push({
      source: `vuex-${index}`,
      target: `pinia-${index}`,
      label: row.link.label,
      dashed: row.link.dashed,
    })
  }
})

// 关键差异：Vuex 的 Mutation 在 Pinia 没有独立层，变更并入 Action
edges.push({
  source: `pinia-${MUTATION_ROW}`,
  target: `pinia-${ACTION_ROW}`,
  label: '并入 Action',
  dashed: true,
  arrow: true,
  sourcePos: 'bottom',
  targetPos: 'left',
})

const legend: FlowLegendItem[] = [
  { shape: 'rect', tone: 'slate', text: 'Vuex 概念' },
  { shape: 'rect', tone: 'indigo', text: 'Pinia 概念' },
  { shape: 'rect', tone: 'amber', text: '两者最本质的差别' },
  { shape: 'rect', tone: 'sky', text: '对照项（Vuex 侧为对齐 Pinia 才列出）' },
  { shape: 'frame', tone: 'slate', text: '概念分组' },
]

const srText =
  'Vuex 与 Pinia 核心概念对照：' +
  'Vuex 的 Module 对应 Pinia 的定义 Store（defineStore）；' +
  'State、Getter、Action 两侧同名同义；' +
  'Vuex 的 Mutation 在 Pinia 没有对应概念，状态变更并入 Action；' +
  'Vuex 的 plugins 选项对应 Pinia 的 pinia.use() 插件；' +
  '在组件外使用 store：Vuex 直接 import 单例即可，Pinia 需要先拿到 pinia 容器（useStore(pinia) 或 setActivePinia）。'
</script>

<template>
  <DocFlow
    flow-id="store-concept-mapping"
    :nodes="nodes"
    :edges="edges"
    :legend="legend"
    :sr-text="srText"
    :height="660"
    :min-zoom="0.4"
    :max-zoom="1.1"
    hint="左 Vuex、右 Pinia，同一行即同一关注点；虚线表示「只是近似对应 / Pinia 多一步」"
  />
</template>
