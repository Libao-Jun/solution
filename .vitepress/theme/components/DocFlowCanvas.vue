<script setup lang="ts">
/**
 * 文档正文插图通用画布（@vue-flow/core）。
 *
 * 设计口径（与 AppFlowchartCanvas / BuildToolsFlowCanvas 一致）：
 * - 节点坐标由调用方显式给出（不依赖 DOM 测量），只读场景禁止拖拽 / 连线 / 选中；
 * - 只有一个节点类型 `doc`，外形由 data.shape 决定（普通卡片 / 起点 / 流程 / 判断菱形 / 结果）；
 * - 每个节点带四个方向的入线、出线句柄（s-* / t-*），连线按「节点声明的出线侧 / 入线侧」
 *   自动匹配句柄，调用方只需给节点坐标与连线两端，不必关心句柄；
 * - 连线带 label 时走 DecisionTreeLabelEdge（HTML 标签、可换行），否则用内置 smoothstep。
 *
 * 本文件只被 DocFlow.vue 在浏览器端动态加载（@vue-flow/core 依赖 d3-zoom，需要 DOM），不参与 SSR。
 */
import { Handle, MarkerType, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { useData } from 'vitepress'
import { computed } from 'vue'
import DecisionTreeLabelEdge from './DecisionTreeLabelEdge.vue'
import DocFlowOrthEdge from './DocFlowOrthEdge.vue'

/** 语义色相：节点只声明色相，明暗两套色值由 <style> 里的 hsl() 统一推导 */
export type FlowTone = 'slate' | 'indigo' | 'sky' | 'emerald' | 'amber' | 'brand'
/**
 * 外形：
 * - card / start / process / decision / result：实体节点（有填充色，会盖住其下方的连线）
 * - frame：**只有虚线边框、不填充**的区域框（容器 / 分组用；必须不填充，否则框内的连线与连线标签会被它遮住）
 * - panel：**浅色底漆 + 实线圆角的板块容器**（承载「一组同类节点」，比 frame 更强调分组，同为装饰层、不接收指针事件）
 * - ghost：透明锚点，只作连线端点，不可见
 */
export type FlowShape = 'card' | 'start' | 'process' | 'decision' | 'result' | 'frame' | 'panel' | 'ghost'
/** 入线、出线所在边 */
export type FlowSide = 'top' | 'right' | 'bottom' | 'left'

export interface DocFlowNodeData {
  /** 节点文案（HTML 片段）：<br> 断行；.t 为主标题行、.d 为补充说明行 */
  label: string
  width: number
  height: number
  shape?: FlowShape
  tone?: FlowTone
  /** 文本对齐（默认居中；表格化的「场景 → 方案」用 left） */
  align?: 'center' | 'left'
  /** 标签纵向位置（默认居中；嵌套容器 / 分层带状节点用 top 压在顶边内侧） */
  labelPos?: 'center' | 'top'
  /** 出线所在边（默认 bottom） */
  sourcePos?: FlowSide
  /** 入线所在边（默认 top） */
  targetPos?: FlowSide
}

export interface DocFlowNode {
  id: string
  /** 节点左上角坐标 */
  x: number
  y: number
  data: DocFlowNodeData
}

export interface DocFlowEdge {
  source: string
  target: string
  /** 连线上的标签（HTML 片段），省略即无标签 */
  label?: string
  /** 按条覆盖出线侧（默认取 source 节点的 sourcePos） */
  sourcePos?: FlowSide
  /** 按条覆盖入线侧（默认取 target 节点的 targetPos） */
  targetPos?: FlowSide
  /**
   * 连线形状：默认 smoothstep（内置折线）；`orth` 为正交树线（拐点居中于两端、
   * 同源多条线共用一条竖向干线、圆角统一），适合「一棵树多分支」的场景。
   */
  edgeType?: 'smoothstep' | 'orth'
  /** 连线色相（默认 slate），树状图用父节点的色相区分分支 */
  tone?: FlowTone
  /** 连线末端加箭头（默认不加，与站内其他示意图一致；回路 / 门槛线需要提示方向时打开） */
  arrow?: boolean
  /** 虚线（表达「门槛 / 非必经」等弱连接） */
  dashed?: boolean
}

const props = withDefaults(
  defineProps<{
    flowId: string
    nodes: DocFlowNode[]
    edges: DocFlowEdge[]
    minZoom?: number
    maxZoom?: number
  }>(),
  { minZoom: 0.5, maxZoom: 1.3 },
)

const FIT_VIEW_PARAMS = computed(() => ({ padding: 0.06, minZoom: props.minZoom }))

const LABELED_EDGE = 'labeled'
const ORTH_EDGE = 'orth'
const edgeTypes = { [LABELED_EDGE]: DecisionTreeLabelEdge, [ORTH_EDGE]: DocFlowOrthEdge }

const nodeById = new Map(props.nodes.map((node) => [node.id, node]))
const sideOf = (id: string, key: 'sourcePos' | 'targetPos', fallback: FlowSide) =>
  nodeById.get(id)?.data[key] ?? fallback

/**
 * 边的方向 → 句柄 id 后缀。
 * ★ 模板里的句柄 id 是缩写（`s-t` / `s-r` / `s-b` / `s-l`，target 同理），
 * 若在这里直接拼 `s-${side}` 会得到 `s-right` 这类不存在的 id，
 * Vue Flow 找不到句柄时会**静默退回默认的 bottom → top**——
 * 表现就是「左→右的树，线却从节点底部爬出来」（JS 全貌图连线的真实乱源）。
 * 任何新增方向都必须在 SIDE_TO_HANDLE 与模板句柄 id 之间保持一一对应。
 */
const SIDE_TO_HANDLE = { top: 't', right: 'r', bottom: 'b', left: 'l' } as const satisfies Record<FlowSide, string>

/** 装饰层（区域框 / 板块容器）不接收指针事件，否则大面积容器会挡住画布平移 */
const DECOR_SHAPES = new Set(['frame', 'panel'])

const flowNodes = computed<Node[]>(() =>
  props.nodes.map((node) => ({
    id: node.id,
    type: 'doc',
    position: { x: node.x, y: node.y },
    data: node.data,
    draggable: false,
    connectable: false,
    selectable: false,
    class: DECOR_SHAPES.has(node.data.shape ?? '') ? 'doc-node-wrap--decor' : undefined,
  })),
)

/**
 * 箭头填充色：与 .doc-edge 描边同为 hsl(hue 40% 58%)，这里换算成十六进制。
 * ★ 必须用无空格的色值：Vue Flow 用 marker 对象各字段拼 `<marker id>`，
 * 传 hsl(...) 这类带空格的颜色会拼出非法 id，箭头直接失效。
 */
const ARROW_COLOR: Record<FlowTone, string> = {
  slate: '#6a86bf',
  indigo: '#7769bf',
  sky: '#698ebf',
  emerald: '#69bfa2',
  amber: '#bf9769',
  brand: '#8369bf',
}

const flowEdges = computed<Edge[]>(() =>
  props.edges.map((edge, index) => ({
    id: `${props.flowId}-e-${index}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: `s-${SIDE_TO_HANDLE[edge.sourcePos ?? sideOf(edge.source, 'sourcePos', 'bottom')]}`,
    targetHandle: `t-${SIDE_TO_HANDLE[edge.targetPos ?? sideOf(edge.target, 'targetPos', 'top')]}`,
    type: edge.label ? LABELED_EDGE : (edge.edgeType ?? 'smoothstep'),
    data: { label: edge.label ?? '' },
    selectable: false,
    updatable: false,
    class: [
      'doc-edge',
      edge.tone ? `doc-edge--tone-${edge.tone}` : '',
      edge.dashed ? 'doc-edge--dashed' : '',
    ]
      .filter(Boolean)
      .join(' '),
    markerEnd: edge.arrow
      ? { type: MarkerType.ArrowClosed, color: ARROW_COLOR[edge.tone ?? 'slate'], width: 14, height: 14 }
      : undefined,
  })),
)

const { zoomIn, zoomOut, fitView } = useVueFlow(props.flowId)
const fitAll = () => fitView({ padding: 0.06, minZoom: props.minZoom })

defineExpose({ zoomIn, zoomOut, fitView: fitAll })

const { isDark } = useData()
</script>

<template>
  <div class="doc-canvas" :class="{ 'is-dark': isDark }">
    <VueFlow
      :id="flowId"
      :nodes="flowNodes"
      :edges="flowEdges"
      :edge-types="edgeTypes"
      :fit-view-on-init="true"
      :fit-view-params="FIT_VIEW_PARAMS"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
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
      <template #node-doc="{ data }">
        <div
          class="doc-node"
          :class="[
            `doc-node--${data.shape ?? 'card'}`,
            `doc-node--tone-${data.tone ?? 'slate'}`,
            data.align === 'left' ? 'doc-node--align-left' : '',
            data.labelPos === 'top' ? 'doc-node--label-top' : '',
          ]"
          :style="{ width: `${data.width}px`, height: `${data.height}px` }"
        >
          <!-- 判断节点：外层描边色 + 内层 inset 1px 填充色，画出 1px 菱形描边 -->
          <template v-if="data.shape === 'decision'">
            <span class="doc-node__diamond doc-node__diamond--border" />
            <span class="doc-node__diamond doc-node__diamond--fill" />
          </template>

          <span class="doc-node__label" v-html="data.label" />

          <!-- 四个方向各一对句柄：给连线定位用，本身不可见 -->
          <Handle id="s-t" class="doc-handle" type="source" :position="Position.Top" />
          <Handle id="t-t" class="doc-handle" type="target" :position="Position.Top" />
          <Handle id="s-r" class="doc-handle" type="source" :position="Position.Right" />
          <Handle id="t-r" class="doc-handle" type="target" :position="Position.Right" />
          <Handle id="s-b" class="doc-handle" type="source" :position="Position.Bottom" />
          <Handle id="t-b" class="doc-handle" type="target" :position="Position.Bottom" />
          <Handle id="s-l" class="doc-handle" type="source" :position="Position.Left" />
          <Handle id="t-l" class="doc-handle" type="target" :position="Position.Left" />
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.doc-canvas {
  /* 语义色相兜底：节点各自带 .doc-node--tone-* 覆盖它 */
  --doc-hue: 220;
  width: 100%;
  height: 100%;
}

.doc-canvas :deep(.vue-flow) {
  background: transparent;
}

/* 只读示意图：只保留平移手势 */
.doc-canvas :deep(.vue-flow__pane) {
  cursor: grab;
}

.doc-canvas :deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.doc-canvas :deep(.vue-flow__edge) {
  pointer-events: none;
}

/* ---- 语义色相 ---- */
.doc-canvas :deep(.doc-node--tone-indigo) {
  --doc-hue: 250;
}

.doc-canvas :deep(.doc-node--tone-sky) {
  --doc-hue: 214;
}

.doc-canvas :deep(.doc-node--tone-emerald) {
  --doc-hue: 160;
}

.doc-canvas :deep(.doc-node--tone-amber) {
  --doc-hue: 32;
}

.doc-canvas :deep(.doc-node--tone-slate) {
  --doc-hue: 220;
}

/* ---- 节点公共 ---- */
.doc-canvas :deep(.doc-node) {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  overflow: visible;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.3;
  text-align: center;
}

.doc-canvas :deep(.doc-node--align-left) {
  align-items: flex-start;
  padding-left: 16px;
  text-align: left;
}

/* ---- 形状：卡片 / 流程 / 结果 / 起点 ---- */
.doc-canvas :deep(.doc-node--card),
.doc-canvas :deep(.doc-node--process),
.doc-canvas :deep(.doc-node--result) {
  border: 1px solid hsl(var(--doc-hue) 58% 74%);
  border-radius: 10px;
  background: hsl(var(--doc-hue) 80% 96%);
  color: hsl(var(--doc-hue) 58% 30%);
}

.doc-canvas :deep(.doc-node--process) {
  background: var(--vp-c-bg);
}

.doc-canvas :deep(.doc-node--result) {
  border-radius: 12px;
  font-weight: 600;
}

.doc-canvas :deep(.doc-node--start) {
  border: 1px solid transparent;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 10px 24px -14px rgba(79, 48, 232, 0.75);
}

/* ---- 形状：判断菱形（文字压在菱形之上） ---- */
.doc-canvas :deep(.doc-node--decision) {
  padding: 8px 26px;
  color: hsl(var(--doc-hue) 58% 30%);
}

.doc-canvas :deep(.doc-node__diamond) {
  position: absolute;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}

.doc-canvas :deep(.doc-node__diamond--border) {
  inset: 0;
  background: hsl(var(--doc-hue) 58% 74%);
}

.doc-canvas :deep(.doc-node__diamond--fill) {
  inset: 1px;
  background: hsl(var(--doc-hue) 80% 96%);
}

/* ---- 标签压顶（嵌套容器 / 分层带状节点） ---- */
.doc-canvas :deep(.doc-node--label-top) {
  justify-content: flex-start;
  padding-top: 8px;
}

/* ---- 板块容器（panel）：浅底漆 + 实线圆角，承载「一组同类节点」 ---- */
.doc-canvas :deep(.doc-node--panel) {
  border: 1px solid hsl(var(--doc-hue) 52% 88%);
  border-radius: 14px;
  background: hsl(var(--doc-hue) 68% 98% / 0.7);
  color: hsl(var(--doc-hue) 58% 32%);
}

.doc-canvas.is-dark :deep(.doc-node--panel) {
  border-color: hsl(var(--doc-hue) 40% 30%);
  background: hsl(var(--doc-hue) 30% 15% / 0.65);
  color: hsl(var(--doc-hue) 72% 84%);
}

/* 装饰层（区域框 / 板块容器）不接收指针事件：整块区域都能拖动平移 */
.doc-canvas :deep(.doc-node-wrap--decor) {
  pointer-events: none;
}

/* ---- 区域框：只画虚线边框、不填充，框内的连线与标签才能露出来 ---- */
.doc-canvas :deep(.doc-node--frame) {
  border: 1.5px dashed hsl(var(--doc-hue) 58% 68%);
  border-radius: 12px;
  background: transparent;
  color: hsl(var(--doc-hue) 58% 34%);
}

.doc-canvas.is-dark :deep(.doc-node--frame) {
  border-color: hsl(var(--doc-hue) 46% 46%);
  background: transparent;
  color: hsl(var(--doc-hue) 72% 82%);
}

/* ---- 透明锚点：只作连线端点，不可见 ---- */
.doc-canvas :deep(.doc-node--ghost) {
  border: 0;
  background: transparent;
}

.doc-canvas.is-dark :deep(.doc-node--ghost) {
  border: 0;
  background: transparent;
}

/* ---- 节点文案（.t 主标题行 / .d 补充说明行） ---- */
.doc-canvas :deep(.doc-node__label) {
  position: relative;
  z-index: 1;
  max-width: 100%;
}

.doc-canvas :deep(.doc-node__label .t) {
  display: block;
  font-weight: 600;
  line-height: 1.3;
}

.doc-canvas :deep(.doc-node__label .d) {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.35;
  opacity: 0.82;
}

/* 句柄只用于给连线定位，本身不可见 */
.doc-canvas :deep(.doc-handle) {
  width: 2px;
  height: 2px;
  min-width: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}

/* ---- 连线 ---- */
.doc-canvas :deep(.doc-edge .vue-flow__edge-path) {
  stroke: hsl(var(--doc-hue, 220) 40% 58%);
  stroke-width: 1.6;
  stroke-linecap: round;
}

/* 虚线：弱连接（门槛 / 可选步骤），与实线主流程区分 */
.doc-canvas :deep(.doc-edge--dashed .vue-flow__edge-path) {
  stroke-dasharray: 6 4;
}

/* 按分支着色：类挂在连线组上，色相经 --doc-hue 传给描边与分叉圆点 */
.doc-canvas :deep(.doc-edge--tone-indigo) {
  --doc-hue: 250;
}

.doc-canvas :deep(.doc-edge--tone-sky) {
  --doc-hue: 214;
}

.doc-canvas :deep(.doc-edge--tone-emerald) {
  --doc-hue: 160;
}

.doc-canvas :deep(.doc-edge--tone-amber) {
  --doc-hue: 32;
}

.doc-canvas :deep(.doc-edge--tone-brand) {
  --doc-hue: 258;
}

/* 正交树线的分叉口圆点 */
.doc-canvas :deep(.doc-edge__port) {
  fill: hsl(var(--doc-hue, 220) 45% 55%);
}

/* ---- 深色模式 ---- */
.doc-canvas.is-dark :deep(.doc-node--card),
.doc-canvas.is-dark :deep(.doc-node--process),
.doc-canvas.is-dark :deep(.doc-node--result) {
  border-color: hsl(var(--doc-hue) 46% 42%);
  background: hsl(var(--doc-hue) 36% 19%);
  color: hsl(var(--doc-hue) 72% 84%);
}

.doc-canvas.is-dark :deep(.doc-node--process) {
  background: hsl(220 24% 16%);
}

.doc-canvas.is-dark :deep(.doc-node--start) {
  background: linear-gradient(135deg, #5a3cf0 0%, #897bff 100%);
}

.doc-canvas.is-dark :deep(.doc-node--decision) {
  color: hsl(var(--doc-hue) 72% 84%);
}

.doc-canvas.is-dark :deep(.doc-node__diamond--border) {
  background: hsl(var(--doc-hue) 46% 42%);
}

.doc-canvas.is-dark :deep(.doc-node__diamond--fill) {
  background: hsl(var(--doc-hue) 36% 19%);
}
</style>
