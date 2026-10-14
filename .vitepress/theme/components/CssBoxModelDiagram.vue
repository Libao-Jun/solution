<script setup lang="ts">
/**
 * 「3.1 盒模型（Box Model）」—— @vue-flow/core 重构。
 * 内容与 fundamentals/css-css3 3.1 节原 ```text 同心矩形图逐层对应，只换渲染方式、不改语义：
 *
 *   margin（外边距，透明，不参与背景）
 *     └ border（边框）
 *         └ padding（内边距）
 *             └ content（内容区）  width × height
 *
 * 构图：四层同心带状节点（外层先渲染在下、内层覆盖在上），每层的名称标签压在该层
 * 顶边内侧（labelPos: 'top'），无连线——嵌套关系由矩形叠加直接表达。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowNode, FlowTone } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

type Layer = {
  id: string
  title: string
  /** 补充说明（仅最外层与最内层有，避免窄层带里文字拥挤） */
  desc?: string
  tone: FlowTone
  x: number
  y: number
  width: number
  height: number
  /** 最内层 content 标签居中，其余层标签压顶 */
  labelPos?: 'top'
}

/** 同心内缩步长：横向 / 纵向各 44px，保证层带里放得下一行标签 */
const INSET = 44

const LAYERS: Layer[] = [
  {
    id: 'margin',
    title: 'margin（外边距）',
    desc: '透明，不参与背景与点击命中',
    tone: 'slate',
    x: 0,
    y: 0,
    width: 640,
    height: 380,
    labelPos: 'top',
  },
  {
    id: 'border',
    title: 'border（边框）',
    tone: 'amber',
    x: INSET,
    y: INSET,
    width: 640 - INSET * 2,
    height: 380 - INSET * 2,
    labelPos: 'top',
  },
  {
    id: 'padding',
    title: 'padding（内边距）',
    tone: 'emerald',
    x: INSET * 2,
    y: INSET * 2,
    width: 640 - INSET * 4,
    height: 380 - INSET * 4,
    labelPos: 'top',
  },
  {
    id: 'content',
    title: 'content（内容区）',
    desc: 'width × height',
    tone: 'indigo',
    x: INSET * 3,
    y: INSET * 3,
    width: 640 - INSET * 6,
    height: 380 - INSET * 6,
  },
]

const nodes: DocFlowNode[] = LAYERS.map((layer) => ({
  id: layer.id,
  x: layer.x,
  y: layer.y,
  data: {
    label: `<span class="t">${layer.title}</span>${layer.desc ? `<span class="d">${layer.desc}</span>` : ''}`,
    width: layer.width,
    height: layer.height,
    shape: 'card',
    tone: layer.tone,
    labelPos: layer.labelPos,
  },
}))

const legend: FlowLegendItem[] = [
  { shape: 'rect', tone: 'slate', text: 'margin 外边距' },
  { shape: 'rect', tone: 'amber', text: 'border 边框' },
  { shape: 'rect', tone: 'emerald', text: 'padding 内边距' },
  { shape: 'rect', tone: 'indigo', text: 'content 内容区' },
]

const srText =
  '盒模型同心图：每个元素都是一个盒子，由外到内四层——margin（外边距，透明，不参与背景与点击命中）、' +
  'border（边框）、padding（内边距）、content（内容区，尺寸即 width × height）。' +
  'content-box 下实际占宽 = width + padding×2 + border×2；border-box 下 width 已包含内边距与边框。'
</script>

<template>
  <DocFlow
    flow-id="css-box-model"
    :nodes="nodes"
    :edges="[]"
    :legend="legend"
    :sr-text="srText"
    :height="440"
    hint="由外到内四层同心结构：margin → border → padding → content；拖拽画布可平移，按钮可缩放"
  />
</template>
