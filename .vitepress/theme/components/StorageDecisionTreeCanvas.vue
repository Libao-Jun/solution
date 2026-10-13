<script setup lang="ts">
/**
 * 浏览器存储机制选择决策树 —— @vue-flow/core 实现。
 * 由同目录的 StorageDecisionTree.vue 在浏览器端动态加载。
 *
 * ★ 为什么替换原 ```mermaid flowchart：mermaid 的中文标签在部分浏览器下存在
 *   行高测量偏差导致裁字，且决策树较深时 SVG 整体缩放后标签可读性差；换成
 *   Vue Flow 后节点位置与连线由代码显式控制，支持拖拽平移、按钮缩放，并能在
 *   深色模式下同步切换配色。
 *
 * ★ 内容（与原 2.2 节 mermaid 逐条对应，只换渲染、不改语义）：
 *   要存的数据 → 是否需要随 HTTP 请求自动发给服务端？
 *     是 → JS 需要读取内容？
 *       否 → HttpOnly Cookie（服务端 Set-Cookie 下发）
 *       是 → Cookie（SameSite + Secure）
 *     否 → 需要索引 / 查询 / 事务 或数据量大于 5MB？
 *       是 → 是文件或超大二进制？
 *         是 → OPFS / File System Access
 *         否 → IndexedDB
 *       否 → 只在当前标签页会话内需要？
 *         是 → sessionStorage
 *         否 → 数据量极小且极高频读取？
 *           是 → 内存变量 + Cache Storage 兜底
 *           否 → localStorage
 */
import { Handle, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { useData } from 'vitepress'

/* ------------------------------------------------------------------ *
 * §1 版式常量（节点固定宽高，坐标可精确计算）
 * ------------------------------------------------------------------ */
const START_W = 140
const START_H = 44
const DECISION_W = 180
const DECISION_H = 64
const RESULT_W = 170
const RESULT_H = 54
const RESULT_SINGLE_H = 44
const ROW_STEP = 84
const FIT_PADDING = 0.04
const MIN_FIT_ZOOM = 0.78

const FLOW_ID = 'storage-decision-tree'
const FIT_VIEW_PARAMS = { padding: FIT_PADDING, minZoom: MIN_FIT_ZOOM }

/* ------------------------------------------------------------------ *
 * §2 图内容（唯一真相源）
 * ------------------------------------------------------------------ */
type NodeKind = 'start' | 'decision' | 'result'

type TreeNode = {
  id: string
  label: string
  kind: NodeKind
  x: number
  y: number
  width?: number
  height?: number
}

const NODES: TreeNode[] = [
  { id: 'root', label: '要存的数据', kind: 'start', x: -START_W / 2, y: 0 },
  {
    id: 'd1',
    label: '需要随 HTTP 请求\n自动发给服务端？',
    kind: 'decision',
    x: -DECISION_W / 2,
    y: ROW_STEP,
  },
  { id: 'd2', label: 'JS 需要\n读取内容？', kind: 'decision', x: -340, y: ROW_STEP * 2 },
  { id: 'd3', label: '需要索引 / 查询 / 事务\n或数据量大于 5MB？', kind: 'decision', x: 160, y: ROW_STEP * 2 },

  { id: 'r-httponly', label: 'HttpOnly Cookie\n（服务端 Set-Cookie 下发）', kind: 'result', x: -400, y: ROW_STEP * 3 },
  { id: 'r-cookie', label: 'Cookie\n（SameSite + Secure）', kind: 'result', x: -240, y: ROW_STEP * 3 },
  { id: 'd4', label: '是文件或\n超大二进制？', kind: 'decision', x: 270, y: ROW_STEP * 3 },
  { id: 'd5', label: '只在当前标签页\n会话内需要？', kind: 'decision', x: 0, y: ROW_STEP * 3 },

  { id: 'r-opfs', label: 'OPFS / File System Access', kind: 'result', x: 320, y: ROW_STEP * 4, height: RESULT_SINGLE_H },
  { id: 'r-indexeddb', label: 'IndexedDB', kind: 'result', x: 170, y: ROW_STEP * 4, height: RESULT_SINGLE_H },
  { id: 'r-session', label: 'sessionStorage', kind: 'result', x: -50, y: ROW_STEP * 4, height: RESULT_SINGLE_H },
  { id: 'd6', label: '数据量极小且\n极高频读取？', kind: 'decision', x: 100, y: ROW_STEP * 4 },

  { id: 'r-memory', label: '内存变量 +\nCache Storage 兜底', kind: 'result', x: 40, y: ROW_STEP * 5 },
  { id: 'r-local', label: 'localStorage', kind: 'result', x: 190, y: ROW_STEP * 5, height: RESULT_SINGLE_H },
]

type TreeEdge = { source: string; target: string; label: string }

const EDGES: TreeEdge[] = [
  { source: 'root', target: 'd1', label: '' },
  { source: 'd1', target: 'd2', label: '是' },
  { source: 'd1', target: 'd3', label: '否' },
  { source: 'd2', target: 'r-httponly', label: '否' },
  { source: 'd2', target: 'r-cookie', label: '是' },
  { source: 'd3', target: 'd4', label: '是' },
  { source: 'd3', target: 'd5', label: '否' },
  { source: 'd4', target: 'r-opfs', label: '是' },
  { source: 'd4', target: 'r-indexeddb', label: '否' },
  { source: 'd5', target: 'r-session', label: '是' },
  { source: 'd5', target: 'd6', label: '否' },
  { source: 'd6', target: 'r-memory', label: '是' },
  { source: 'd6', target: 'r-local', label: '否' },
]

/* ------------------------------------------------------------------ *
 * §3 建图
 * ------------------------------------------------------------------ */
const buildGraph = () => {
  const nodes: Node[] = NODES.map((n) => {
    const width = n.width ?? (n.kind === 'start' ? START_W : n.kind === 'decision' ? DECISION_W : RESULT_W)
    const height = n.height ?? (n.kind === 'start' ? START_H : n.kind === 'decision' ? DECISION_H : RESULT_H)
    return {
      id: n.id,
      type: n.kind,
      position: { x: n.x, y: n.y },
      data: { label: n.label, width, height, kind: n.kind },
      draggable: false,
      connectable: false,
      selectable: false,
    }
  })

  const edges: Edge[] = EDGES.map((e, index) => ({
    id: `e-${index}`,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'default',
    selectable: false,
    updatable: false,
    class: 'dt-edge',
    labelBgStyle: { fill: 'var(--vp-c-bg-soft)' },
    labelBgPadding: [4, 4],
    labelShowBg: true,
  }))

  return { nodes, edges }
}

const { nodes, edges } = buildGraph()

/* ------------------------------------------------------------------ *
 * §4 视图控制
 * ------------------------------------------------------------------ */
const { zoomIn, zoomOut, fitView } = useVueFlow(FLOW_ID)
const fitAll = () => fitView({ ...FIT_VIEW_PARAMS })
defineExpose({ zoomIn, zoomOut, fitView: fitAll })

const { isDark } = useData()
</script>

<template>
  <div class="storage-tree" :class="{ 'is-dark': isDark }">
    <VueFlow
      :id="FLOW_ID"
      :nodes="nodes"
      :edges="edges"
      :fit-view-on-init="true"
      :fit-view-params="FIT_VIEW_PARAMS"
      :min-zoom="MIN_FIT_ZOOM"
      :max-zoom="1.6"
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
      <template #node-start="{ data }">
        <div class="dt-node dt-node--start" :style="{ width: `${data.width}px`, height: `${data.height}px` }">
          <Handle class="dt-handle" type="source" :position="Position.Bottom" />
          <span class="dt-node__text">{{ data.label }}</span>
        </div>
      </template>

      <template #node-decision="{ data }">
        <div class="dt-node dt-node--decision" :style="{ width: `${data.width}px`, height: `${data.height}px` }">
          <div class="dt-decision-shape" :style="{ width: `${data.width}px`, height: `${data.height}px` }"></div>
          <div class="dt-decision-text">
            <span v-for="(line, i) in data.label.split('\n')" :key="i">{{ line }}</span>
          </div>
          <Handle class="dt-handle" type="target" :position="Position.Top" />
          <Handle class="dt-handle" type="source" :position="Position.Bottom" />
        </div>
      </template>

      <template #node-result="{ data }">
        <div class="dt-node dt-node--result" :style="{ width: `${data.width}px`, height: `${data.height}px` }">
          <Handle class="dt-handle" type="target" :position="Position.Top" />
          <span v-for="(line, i) in data.label.split('\n')" :key="i" class="dt-node__text">{{ line }}</span>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.storage-tree {
  width: 100%;
  height: 100%;
}

.storage-tree :deep(.vue-flow) {
  background: transparent;
}

.storage-tree :deep(.vue-flow__pane) {
  cursor: grab;
}

.storage-tree :deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.storage-tree :deep(.vue-flow__edge) {
  pointer-events: none;
}

/* ---- 节点公共 ---- */
.storage-tree :deep(.dt-node) {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;
  overflow: visible;
}

.storage-tree :deep(.dt-node__text) {
  position: relative;
  z-index: 1;
}

/* 起始节点 */
.storage-tree :deep(.dt-node--start) {
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 10px 24px -12px rgba(79, 48, 232, 0.65);
}

/* 决策节点：菱形背景 + 文字覆盖 */
.storage-tree :deep(.dt-node--decision) {
  background: transparent;
}

.storage-tree :deep(.dt-decision-shape) {
  position: absolute;
  top: 0;
  left: 0;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: hsl(220 80% 96%);
  border: 1px solid hsl(220 58% 74%);
  box-sizing: border-box;
}

.storage-tree :deep(.dt-decision-text) {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 6px 18px;
  color: hsl(220 58% 30%);
  font-size: 12.5px;
  pointer-events: none;
}

/* 结果节点 */
.storage-tree :deep(.dt-node--result) {
  padding: 0 10px;
  border: 1px solid hsl(220 58% 74%);
  border-radius: 10px;
  background: hsl(220 80% 96%);
  color: hsl(220 58% 30%);
}

/* 句柄仅用于连线定位 */
.storage-tree :deep(.dt-handle) {
  width: 2px;
  height: 2px;
  min-width: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}

/* 连线 */
.storage-tree :deep(.dt-edge .vue-flow__edge-path) {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.6;
  stroke-linecap: round;
}

.storage-tree :deep(.dt-edge .vue-flow__edge-text) {
  fill: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 500;
}

.storage-tree :deep(.dt-edge .vue-flow__edge-textbg) {
  fill: var(--vp-c-bg-soft);
}

/* ---- 深色模式 ---- */
.storage-tree.is-dark :deep(.dt-node--start) {
  background: linear-gradient(135deg, #5a3cf0 0%, #897bff 100%);
  box-shadow: 0 10px 24px -12px rgba(90, 60, 240, 0.55);
}

.storage-tree.is-dark :deep(.dt-decision-shape) {
  background: hsl(220 36% 19%);
  border-color: hsl(220 46% 42%);
}

.storage-tree.is-dark :deep(.dt-decision-text) {
  color: hsl(220 72% 84%);
}

.storage-tree.is-dark :deep(.dt-node--result) {
  background: hsl(220 36% 19%);
  border-color: hsl(220 46% 42%);
  color: hsl(220 72% 84%);
}

.storage-tree.is-dark :deep(.dt-edge .vue-flow__edge-path) {
  stroke: var(--vp-c-text-3);
}

.storage-tree.is-dark :deep(.dt-edge .vue-flow__edge-text) {
  fill: var(--vp-c-text-2);
}
</style>
