<script setup lang="ts">
/**
 * 决策树画布（@vue-flow/core）：判断节点用菱形、结论节点用圆角矩形，
 * 分支条件由 DecisionTreeLabelEdge 渲染成可换行的标签。
 *
 * 与 StorageDecisionTreeCanvas 同一范式：节点宽高固定、坐标由内容组件显式给出
 * （不依赖 DOM 测量），只读场景禁止拖拽 / 连线 / 选中。
 * 本文件只被 DecisionTreeFlow.vue 在浏览器端动态加载，不参与 SSR。
 */
import { Handle, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { computed } from 'vue'
import DecisionTreeLabelEdge from './DecisionTreeLabelEdge.vue'

/** 节点：kind 决定形状——decision 为菱形判断，result 为圆角矩形结论 */
export interface DecisionTreeNode {
  id: string
  kind: 'decision' | 'result'
  /** 节点文案（HTML 片段，用 <br> 控制断行） */
  label: string
  x: number
  y: number
  width: number
  height: number
}

export interface DecisionTreeEdge {
  source: string
  target: string
  /** 分支条件（HTML 片段），无标签时省略 */
  label?: string
}

const props = withDefaults(
  defineProps<{
    flowId: string
    nodes: DecisionTreeNode[]
    edges: DecisionTreeEdge[]
    minZoom?: number
  }>(),
  { minZoom: 0.6 },
)

const MAX_ZOOM = 1.6
const FIT_PADDING = 0.08
const LABELED_EDGE = 'labeled'

const edgeTypes = { [LABELED_EDGE]: DecisionTreeLabelEdge }

const flowNodes = computed<Node[]>(() =>
  props.nodes.map((n) => ({
    id: n.id,
    type: n.kind,
    position: { x: n.x, y: n.y },
    data: { label: n.label, width: n.width, height: n.height },
    draggable: false,
    connectable: false,
    selectable: false,
  })),
)

const flowEdges = computed<Edge[]>(() =>
  props.edges.map((e, index) => ({
    id: `${props.flowId}-e-${index}`,
    source: e.source,
    target: e.target,
    type: LABELED_EDGE,
    data: { label: e.label ?? '' },
    selectable: false,
    updatable: false,
    class: 'dt-edge',
  })),
)

const { zoomIn, zoomOut, fitView } = useVueFlow(props.flowId)

const fitAll = () => fitView({ padding: FIT_PADDING, minZoom: props.minZoom })

defineExpose({ zoomIn, zoomOut, fitView: fitAll })
</script>

<template>
  <div class="dt-canvas">
    <VueFlow
      :id="flowId"
      :nodes="flowNodes"
      :edges="flowEdges"
      :edge-types="edgeTypes"
      :fit-view-on-init="true"
      :min-zoom="minZoom"
      :max-zoom="MAX_ZOOM"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :edges-updatable="false"
      :zoom-on-double-click="false"
      :zoom-on-scroll="false"
      :pan-on-scroll="false"
      :prevent-scrolling="false"
      :auto-pan-on-node-drag="false"
    >
      <!-- 判断节点：菱形底 + 居中文字 -->
      <template #node-decision="{ data }">
        <div class="dt-node dt-node--decision" :style="{ width: `${data.width}px`, height: `${data.height}px` }">
          <span class="dt-node__diamond-border" />
          <span class="dt-node__diamond" />
          <span class="dt-node__text" v-html="data.label" />
          <Handle class="dt-handle" type="target" :position="Position.Top" />
          <Handle class="dt-handle" type="source" :position="Position.Bottom" />
        </div>
      </template>

      <!-- 结论节点：圆角矩形 -->
      <template #node-result="{ data }">
        <div class="dt-node dt-node--result" :style="{ width: `${data.width}px`, height: `${data.height}px` }">
          <Handle class="dt-handle" type="target" :position="Position.Top" />
          <span class="dt-node__text" v-html="data.label" />
          <Handle class="dt-handle" type="source" :position="Position.Bottom" />
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.dt-canvas {
  /* 节点配色一律走 CSS 变量 + html.dark 覆盖：不依赖 JS 主题状态，
     既避免 SSR/水合时序差异，也不受主题切换实现影响 */
  --dt-node-line: hsl(220 58% 74%);
  --dt-node-fill: hsl(220 80% 96%);
  --dt-node-text: hsl(220 58% 30%);
  width: 100%;
  height: 100%;
}

.dt-canvas :deep(.vue-flow) {
  background: transparent;
}

.dt-canvas :deep(.vue-flow__pane) {
  cursor: grab;
}

.dt-canvas :deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.dt-canvas :deep(.vue-flow__edge) {
  pointer-events: none;
}

/* ---- 节点公共 ---- */
.dt-canvas :deep(.dt-node) {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
  overflow: visible;
}

.dt-canvas :deep(.dt-node__text) {
  position: relative;
  z-index: 1;
}

/* ---- 判断节点：用「外层=描边色 + 内层 inset 1px=填充色」画出 1px 菱形描边 ---- */
.dt-canvas :deep(.dt-node__diamond-border) {
  position: absolute;
  inset: 0;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: var(--dt-node-line);
}

.dt-canvas :deep(.dt-node__diamond) {
  position: absolute;
  inset: 1px;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: var(--dt-node-fill);
}

.dt-canvas :deep(.dt-node--decision .dt-node__text) {
  max-width: 100%;
  padding: 8px 26px;
  color: var(--dt-node-text);
}

/* ---- 结论节点 ---- */
.dt-canvas :deep(.dt-node--result) {
  padding: 0 12px;
  border: 1px solid var(--dt-node-line);
  border-radius: 10px;
  background: var(--dt-node-fill);
  color: var(--dt-node-text);
}

/* 句柄只用于连线定位，不显示 */
.dt-canvas :deep(.dt-handle) {
  width: 2px;
  height: 2px;
  min-width: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}

/* ---- 连线 ---- */
.dt-canvas :deep(.dt-edge .vue-flow__edge-path) {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.6;
  stroke-linecap: round;
}
</style>

<!-- 深色模式：用非 scoped 全局块写 html.dark .dt-canvas，
     避免 Vue scoped 的 :global(html.dark) .dt-canvas 把 .dt-canvas 后代丢掉、
     导致深色变量被 .dt-canvas 自身的浅色声明级联遮蔽。
     .dt-canvas 为本组件专属类名，全局规则安全不会泄漏。 -->
<style>
html.dark .dt-canvas {
  --dt-node-line: hsl(220 46% 42%);
  --dt-node-fill: hsl(220 36% 19%);
  --dt-node-text: hsl(220 72% 84%);
}
</style>
