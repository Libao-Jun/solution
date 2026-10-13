<script setup lang="ts">
/**
 * 大屏「10 选型决策树」—— @vue-flow/core 重构。
 * 内容与 engineering/data-screen-adaptation 第 10 节原 ```mermaid flowchart TD 逐条对应，
 * 只换渲染方式，不改语义：
 *
 *   大屏是否固定运行在 16:9 屏幕（LED / 展厅投影）？
 *     是（几乎没有弹窗、拖拽交互）→ scale 整体缩放（开发快、还原度高、接受黑边）
 *     否（需兼容多种比例、超宽拼接屏、有交互）→ 业务复杂度如何？
 *       简单 demo，快速验证 → vw / vh 流式方案
 *       正式企业项目 → 混合方案（vw/vh 布局 + clamp 字体 + JS 处理 ECharts 图表）
 *
 * 本图的分支条件是长句（不适合单行放在连线上），故连线上用可换行标签承载，
 * 判断节点菱形、结论节点圆角矩形。
 *
 * 坐标口径：x 为节点左上角，y 自上而下逐行；两行之间的间距需大于连线的 offset(12)，
 * 同一行内相邻节点留 25px 以上间隙，且同一行两条连线中点间距要大于标签最大宽度(130px)。
 */
import DecisionTreeFlow from './DecisionTreeFlow.vue'
import type { DecisionTreeEdge, DecisionTreeNode } from './DecisionTreeCanvas.vue'

const nodes: DecisionTreeNode[] = [
  {
    id: 'q1',
    kind: 'decision',
    label: '大屏是否固定运行在<br>16:9 屏幕<br>（LED / 展厅投影）？',
    x: -145,
    y: 0,
    width: 290,
    height: 118,
  },

  { id: 'r-scale', kind: 'result', label: 'scale 整体缩放<br>开发快、还原度高<br>接受黑边', x: -275, y: 176, width: 190, height: 76 },
  { id: 'q2', kind: 'decision', label: '业务复杂度如何？', x: 40, y: 176, width: 200, height: 78 },

  { id: 'r-vwvh', kind: 'result', label: 'vw / vh 流式方案', x: -45, y: 306, width: 170, height: 52 },
  {
    id: 'r-hybrid',
    kind: 'result',
    label: '混合方案<br>vw/vh 布局 + clamp 字体<br>+ JS 处理 ECharts 图表',
    x: 150,
    y: 306,
    width: 240,
    height: 76,
  },
]

const edges: DecisionTreeEdge[] = [
  // 长句用 <br> 指定断点：交给浏览器自动断行会把「拖拽」这类词从中间切开
  { source: 'q1', target: 'r-scale', label: '是，几乎没有弹窗、<br>拖拽交互' },
  { source: 'q1', target: 'q2', label: '否，需兼容多种比例、<br>超宽拼接屏、有交互' },
  { source: 'q2', target: 'r-vwvh', label: '简单 demo，快速验证' },
  { source: 'q2', target: 'r-hybrid', label: '正式企业项目' },
]

const srText =
  '决策树：先问「大屏是否固定运行在 16:9 屏幕（LED / 展厅投影）？」——' +
  '是（几乎没有弹窗、拖拽交互）选「scale 整体缩放：开发快、还原度高、接受黑边」；' +
  '否（需兼容多种比例、超宽拼接屏、有交互）则再问「业务复杂度如何？」：' +
  '简单 demo、快速验证选「vw / vh 流式方案」，正式企业项目选「混合方案：vw/vh 布局 + clamp 字体 + JS 处理 ECharts 图表」。'
</script>

<template>
  <DecisionTreeFlow
    flow-id="data-screen-selection-decision-tree"
    :nodes="nodes"
    :edges="edges"
    :height="420"
    :sr-text="srText"
    hint="拖拽画布可平移，按钮可缩放；连线上的文字即分支条件"
  />
</template>
