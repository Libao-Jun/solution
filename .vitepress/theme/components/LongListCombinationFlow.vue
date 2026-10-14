<script setup lang="ts">
/**
 * 「2.3 组合策略」—— @vue-flow/core 重构。
 * 内容与 fundamentals/long-list-optimization 2.3 节原 ```text 逐条对应，只换渲染方式、不改语义：
 *
 *   后端一次性大列表    → 虚拟列表（固定 DOM 数量）
 *   后端分页但不想翻页  → 无限滚动（追加）+ 内存回收
 *   图文混排长列表      → 虚拟列表 + 图片懒加载
 *   超长聊天 / 日志     → 无限滚动 + 虚拟列表 + 上滑重拉历史
 *
 * 构图：左列「业务场景」、右列「策略组合」，一行一组、横向连线（线上标注 →），
 * 整体读起来是一张「场景 → 方案」对照表。坐标显式给出，不依赖 DOM 测量。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

const LEFT_W = 248
const LEFT_H = 54
/** 两列之间的通道：留出连线与线上「→」标签的位置 */
const GAP = 104
const RIGHT_W = 396
const RIGHT_H = 54
const ROW_GAP = 34

const RIGHT_X = LEFT_W + GAP
const PITCH = LEFT_H + ROW_GAP

const ROWS: { scene: string; strategy: string }[] = [
  { scene: '后端一次性大列表', strategy: '虚拟列表（固定 DOM 数量）' },
  { scene: '后端分页但不想翻页', strategy: '无限滚动（追加） + 内存回收' },
  { scene: '图文混排长列表', strategy: '虚拟列表 + 图片懒加载' },
  { scene: '超长聊天 / 日志', strategy: '无限滚动 + 虚拟列表 + 上滑重拉历史' },
]

const nodes: DocFlowNode[] = []
const edges: DocFlowEdge[] = []

ROWS.forEach((row, index) => {
  const y = index * PITCH
  nodes.push({
    id: `scene-${index}`,
    x: 0,
    y,
    data: {
      label: `<span class="t">${row.scene}</span>`,
      width: LEFT_W,
      height: LEFT_H,
      shape: 'process',
      tone: 'slate',
      align: 'left',
      sourcePos: 'right',
    },
  })
  nodes.push({
    id: `strategy-${index}`,
    x: RIGHT_X,
    y,
    data: {
      label: `<span class="t">${row.strategy}</span>`,
      width: RIGHT_W,
      height: RIGHT_H,
      shape: 'card',
      tone: 'indigo',
      align: 'left',
      targetPos: 'left',
    },
  })
  edges.push({ source: `scene-${index}`, target: `strategy-${index}`, label: '→' })
})

const legend: FlowLegendItem[] = [
  { shape: 'rect', tone: 'slate', text: '业务场景' },
  { shape: 'rect', tone: 'indigo', text: '推荐组合策略' },
]

const srText =
  '组合策略对照表：后端一次性大列表 → 虚拟列表（固定 DOM 数量）；' +
  '后端分页但不想翻页 → 无限滚动（追加） + 内存回收；' +
  '图文混排长列表 → 虚拟列表 + 图片懒加载；' +
  '超长聊天 / 日志 → 无限滚动 + 虚拟列表 + 上滑重拉历史。'
</script>

<template>
  <DocFlow
    flow-id="long-list-combination-flow"
    :nodes="nodes"
    :edges="edges"
    :legend="legend"
    :sr-text="srText"
    :height="400"
    :min-zoom="0.5"
    :max-zoom="1.15"
    hint="一行一组：左侧业务场景 → 右侧推荐策略组合；拖拽画布可平移，按钮可缩放"
  />
</template>
