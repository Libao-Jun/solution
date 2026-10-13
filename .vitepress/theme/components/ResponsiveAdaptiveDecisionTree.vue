<script setup lang="ts">
/**
 * 08 响应式与自适应如何选择「8.1 决策树」—— @vue-flow/core 重构。
 * 内容与 engineering/responsive-vs-adaptive 8.1 节原 ```mermaid flowchart TD 逐条对应，
 * 只换渲染方式，不改语义：
 *
 *   PC 端与移动端的信息架构 / 功能差异巨大？
 *     是 → 是否有极致性能要求（首屏秒开 / 弱网）？
 *       是 → 独立移动站 + 服务端动态服务
 *       否 → RESS / SSR 分流（混合方案）
 *     否 → 内容是否复杂、需大量断点？
 *       是 → 响应式 RWD + 容器查询
 *       否 → 纯弹性布局（Grid / Flex / 零断点）
 *
 * 坐标口径：x 为节点左上角（按各自宽度居中排布），y 自上而下逐行；判断节点菱形，
 * 菱形内可用宽度随高度收窄，故文案宽度按行单独校核过。
 */
import DecisionTreeFlow from './DecisionTreeFlow.vue'
import type { DecisionTreeEdge, DecisionTreeNode } from './DecisionTreeCanvas.vue'

const nodes: DecisionTreeNode[] = [
  { id: 'q1', kind: 'decision', label: 'PC 端与移动端的<br>信息架构 / 功能差异巨大？', x: -130, y: 0, width: 260, height: 92 },

  { id: 'q2', kind: 'decision', label: '是否有极致性能要求？<br>首屏秒开 / 弱网', x: -315, y: 136, width: 210, height: 76 },
  { id: 'q3', kind: 'decision', label: '内容是否复杂<br>需大量断点？', x: 115, y: 136, width: 190, height: 76 },

  { id: 'r-standalone', kind: 'result', label: '独立移动站<br>+ 服务端动态服务', x: -397, y: 260, width: 174, height: 58 },
  { id: 'r-ress', kind: 'result', label: 'RESS / SSR 分流<br>（混合方案）', x: -197, y: 260, width: 174, height: 58 },
  { id: 'r-rwd', kind: 'result', label: '响应式 RWD<br>+ 容器查询', x: 23, y: 260, width: 174, height: 58 },
  { id: 'r-flex', kind: 'result', label: '纯弹性布局<br>Grid / Flex / 零断点', x: 223, y: 260, width: 174, height: 58 },
]

const edges: DecisionTreeEdge[] = [
  { source: 'q1', target: 'q2', label: '是' },
  { source: 'q1', target: 'q3', label: '否' },
  { source: 'q2', target: 'r-standalone', label: '是' },
  { source: 'q2', target: 'r-ress', label: '否' },
  { source: 'q3', target: 'r-rwd', label: '是' },
  { source: 'q3', target: 'r-flex', label: '否' },
]

const srText =
  '决策树：先问「PC 端与移动端的信息架构 / 功能差异巨大？」——是，则再问「是否有极致性能要求（首屏秒开 / 弱网）？」：' +
  '是选「独立移动站 + 服务端动态服务」，否选「RESS / SSR 分流（混合方案）」。' +
  '否，则再问「内容是否复杂、需大量断点？」：是选「响应式 RWD + 容器查询」，否选「纯弹性布局（Grid / Flex / 零断点）」。'
</script>

<template>
  <DecisionTreeFlow
    flow-id="rwd-vs-awd-decision-tree"
    :nodes="nodes"
    :edges="edges"
    :height="400"
    :sr-text="srText"
    hint="拖拽画布可平移，按钮可缩放；连线上的「是 / 否」即决策走向"
  />
</template>
