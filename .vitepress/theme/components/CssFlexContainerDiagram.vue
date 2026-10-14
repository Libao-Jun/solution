<script setup lang="ts">
/**
 * 「8.1 Flex 术语图」—— @vue-flow/core 重构。
 * 内容与 fundamentals/css-css3 8.1 节原 ```text 容器示意图逐条对应，只换渲染方式、不改语义：
 *
 *   flex container（display: flex）
 *     main axis（主轴，由 flex-direction 决定）→
 *     [item] [item] [item]    cross axis（交叉轴，垂直于主轴）
 *
 * 构图：一个容器「区域框」节点（frame：只画虚线边框、不填充，标签压顶）+ 三个 item 节点；
 * 主轴 / 交叉轴用带 HTML 标签的连线表达，两端挂在不可见的 ghost 锚点节点上（只作连线端点）。
 * ★ 容器必须用 frame 而非 card：vue-flow 的连线层在节点层之下，实体卡片会把框内的轴线与连线标签盖住。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

const CONTAINER_W = 680
const CONTAINER_H = 250

const nodes: DocFlowNode[] = [
  // 容器：区域框（不填充），标签压在顶边内侧
  {
    id: 'container',
    x: 0,
    y: 0,
    data: {
      label: '<span class="t">flex container（display: flex）</span>',
      width: CONTAINER_W,
      height: CONTAINER_H,
      shape: 'frame',
      tone: 'indigo',
      labelPos: 'top',
    },
  },
  // 主轴：水平连线（左 → 右），锚点不可见
  {
    id: 'ma-left',
    x: 30,
    y: 82,
    data: { label: '', width: 8, height: 8, shape: 'ghost', sourcePos: 'right' },
  },
  {
    id: 'ma-right',
    x: CONTAINER_W - 38,
    y: 82,
    data: { label: '', width: 8, height: 8, shape: 'ghost', targetPos: 'left' },
  },
  // 三个 item
  ...[0, 1, 2].map<DocFlowNode>((i) => ({
    id: `item-${i}`,
    x: 40 + i * 150,
    y: 140,
    data: { label: 'item', width: 130, height: 48, shape: 'card', tone: 'sky' },
  })),
  // 交叉轴：竖直连线（上 → 下），锚点不可见
  {
    id: 'ca-top',
    x: 600,
    y: 60,
    data: { label: '', width: 8, height: 8, shape: 'ghost', sourcePos: 'bottom' },
  },
  {
    id: 'ca-bottom',
    x: 600,
    y: 206,
    data: { label: '', width: 8, height: 8, shape: 'ghost', targetPos: 'top' },
  },
]

const edges: DocFlowEdge[] = [
  { source: 'ma-left', target: 'ma-right', label: 'main axis（主轴，由 flex-direction 决定）→' },
  { source: 'ca-top', target: 'ca-bottom', label: 'cross axis（交叉轴，垂直于主轴）' },
]

const legend: FlowLegendItem[] = [
  { shape: 'frame', tone: 'indigo', text: 'flex container 容器（区域框）' },
  { shape: 'rect', tone: 'sky', text: 'item 项目' },
]

const srText =
  'Flex 容器术语图：设为 display: flex 的元素是容器（flex container），其直接子元素是项目（item）。' +
  '主轴（main axis）由 flex-direction 决定，项目沿主轴排布；交叉轴（cross axis）垂直于主轴。' +
  '项目默认 flex-shrink: 1，会收缩以适应容器。'
</script>

<template>
  <DocFlow
    flow-id="css-flex-axis"
    :nodes="nodes"
    :edges="edges"
    :legend="legend"
    :sr-text="srText"
    :height="300"
    hint="容器与项目、主轴与交叉轴；拖拽画布可平移，按钮可缩放"
  />
</template>
