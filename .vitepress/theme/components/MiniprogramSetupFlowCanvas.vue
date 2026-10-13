<script setup lang="ts">
/**
 * 小程序「从 0 到 1」开通流程图 —— @vue-flow/core 实现。
 * 由同目录的 MiniprogramSetupFlow.vue 在浏览器端动态加载。
 *
 * ★ 为什么替换原 ```mermaid flowchart TD：原 12 节点单列纵排在一屏内被压得
 *   极长、可读性差；改为三行蛇形（boustrophedon）布局，节点位置与连线走向由
 *   代码显式控制，支持拖拽平移与按钮缩放，并随深色模式同步切换配色。
 *
 * ★ 内容（与原 2.1 节 mermaid 逐条对应，只换版式、不改语义）：
 *   行 1（左→右）：① 注册账号 → mp.weixin.qq.com 选择「小程序」类型 →
 *                  ② 填写主体信息 → 个人：身份证+扫码 / 企业：营业执照+认证
 *   行 2（右→左）：后台→开发→开发设置 ← ④ 获取 AppID ← 名称/头像/简介/服务类目 ← ③ 完善小程序信息
 *   行 3（左→右）：⑤ 安装开发者工具 → ⑥ 创建项目 → 填入 AppID 选云服务 →
 *                  ⑦ 编译预览 → 模拟器 / 扫码真机预览
 */
import { Handle, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { useData } from 'vitepress'

/* ------------------------------------------------------------------ *
 * §1 版式常量（节点固定宽高，蛇形三行，坐标按中心点计算）
 * ------------------------------------------------------------------ */
const STEP_W = 150
const STEP_H = 48
const DETAIL_W = 190
const DETAIL_H = 58
const COL_STEP = 220
const ROW_STEP = 150
const FIT_PADDING = 0.05
const MIN_FIT_ZOOM = 0.5

const FLOW_ID = 'miniprogram-setup-flow'
const FIT_VIEW_PARAMS = { padding: FIT_PADDING, minZoom: MIN_FIT_ZOOM }

/* ------------------------------------------------------------------ *
 * §2 图内容（唯一真相源）
 * ------------------------------------------------------------------ */
type NodeKind = 'step' | 'detail'

type FlowNodeSpec = {
  id: string
  label: string
  kind: NodeKind
  /** 所在行（0/1/2）与所在列（中心点横向序号） */
  row: 0 | 1 | 2
  col: number
  /** 连线进出方向，决定横向 / 纵向蛇形走向 */
  source: Position
  target?: Position
}

const NODES: FlowNodeSpec[] = [
  // 行 1：左 → 右
  { id: 's1', label: '① 注册账号', kind: 'step', row: 0, col: 0, source: Position.Right },
  { id: 's1d', label: 'mp.weixin.qq.com\n选择「小程序」类型', kind: 'detail', row: 0, col: 1, source: Position.Right, target: Position.Left },
  { id: 's2', label: '② 填写主体信息', kind: 'step', row: 0, col: 2, source: Position.Right, target: Position.Left },
  { id: 's2d', label: '个人：身份证 + 扫码\n企业：营业执照 + 认证', kind: 'detail', row: 0, col: 3, source: Position.Bottom, target: Position.Left },

  // 行 2：右 → 左（s2d ↓ s4d，再向左折返）
  { id: 's4d', label: '后台 → 开发\n→ 开发设置', kind: 'detail', row: 1, col: 3, target: Position.Top, source: Position.Left },
  { id: 's4', label: '④ 获取 AppID', kind: 'step', row: 1, col: 2, target: Position.Right, source: Position.Left },
  { id: 's3d', label: '名称 / 头像 / 简介\n/ 服务类目', kind: 'detail', row: 1, col: 1, target: Position.Right, source: Position.Left },
  { id: 's3', label: '③ 完善小程序信息', kind: 'step', row: 1, col: 0, target: Position.Right, source: Position.Bottom },

  // 行 3：左 → 右（s3 ↓ s5）
  { id: 's5', label: '⑤ 安装开发者工具', kind: 'step', row: 2, col: 0, target: Position.Top, source: Position.Right },
  { id: 's6', label: '⑥ 创建项目', kind: 'step', row: 2, col: 1, target: Position.Left, source: Position.Right },
  { id: 's6d', label: '填入 AppID\n选云服务 / 云开发', kind: 'detail', row: 2, col: 2, target: Position.Left, source: Position.Right },
  { id: 's7', label: '⑦ 编译预览', kind: 'step', row: 2, col: 3, target: Position.Left, source: Position.Right },
  { id: 's7d', label: '模拟器 / 扫码\n真机预览', kind: 'detail', row: 2, col: 4, target: Position.Left },
]

const EDGES: Array<[string, string]> = [
  ['s1', 's1d'],
  ['s1d', 's2'],
  ['s2', 's2d'],
  ['s2d', 's4d'],
  ['s4d', 's4'],
  ['s4', 's3d'],
  ['s3d', 's3'],
  ['s3', 's5'],
  ['s5', 's6'],
  ['s6', 's6d'],
  ['s6d', 's7'],
  ['s7', 's7d'],
]

/* ------------------------------------------------------------------ *
 * §3 建图
 * ------------------------------------------------------------------ */
const buildGraph = () => {
  const nodes: Node[] = NODES.map((n) => {
    const width = n.kind === 'step' ? STEP_W : DETAIL_W
    const height = n.kind === 'step' ? STEP_H : DETAIL_H
    return {
      id: n.id,
      type: n.kind,
      position: { x: n.col * COL_STEP - width / 2, y: n.row * ROW_STEP - height / 2 },
      data: { label: n.label, width, height, source: n.source, target: n.target },
      draggable: false,
      connectable: false,
      selectable: false,
    }
  })

  const edges: Edge[] = EDGES.map(([source, target], index) => ({
    id: `e-${index}`,
    source,
    target,
    type: 'smoothstep',
    selectable: false,
    updatable: false,
    class: 'mp-edge',
    pathOptions: { borderRadius: 10 },
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
  <div class="mp-flow" :class="{ 'is-dark': isDark }">
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
      <template #node-step="{ data }">
        <div class="mp-node mp-node--step" :style="{ width: `${data.width}px`, height: `${data.height}px` }">
          <Handle v-if="data.source" class="mp-handle" type="source" :position="data.source" />
          <Handle v-if="data.target" class="mp-handle" type="target" :position="data.target" />
          <span class="mp-node__text">{{ data.label }}</span>
        </div>
      </template>

      <template #node-detail="{ data }">
        <div class="mp-node mp-node--detail" :style="{ width: `${data.width}px`, height: `${data.height}px` }">
          <Handle v-if="data.source" class="mp-handle" type="source" :position="data.source" />
          <Handle v-if="data.target" class="mp-handle" type="target" :position="data.target" />
          <span v-for="(line, i) in data.label.split('\n')" :key="i" class="mp-node__text">{{ line }}</span>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.mp-flow {
  width: 100%;
  height: 100%;
}

.mp-flow :deep(.vue-flow) {
  background: transparent;
}

.mp-flow :deep(.vue-flow__pane) {
  cursor: grab;
}

.mp-flow :deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.mp-flow :deep(.vue-flow__edge) {
  pointer-events: none;
}

/* ---- 节点公共 ---- */
.mp-flow :deep(.mp-node) {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  text-align: center;
}

.mp-flow :deep(.mp-node__text) {
  display: block;
}

/* 主步骤节点 */
.mp-flow :deep(.mp-node--step) {
  border: 1px solid transparent;
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 10px 24px -12px rgba(79, 48, 232, 0.65);
}

/* 材料 / 说明节点 */
.mp-flow :deep(.mp-node--detail) {
  border: 1px solid hsl(250 58% 74%);
  background: hsl(250 80% 97%);
  color: hsl(250 45% 35%);
}

/* 句柄仅用于连线定位 */
.mp-flow :deep(.mp-handle) {
  width: 2px;
  height: 2px;
  min-width: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}

/* 连线 */
.mp-flow :deep(.mp-edge .vue-flow__edge-path) {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.6;
  stroke-linecap: round;
}

/* ---- 深色模式 ---- */
.mp-flow.is-dark :deep(.mp-node--step) {
  background: linear-gradient(135deg, #5a3cf0 0%, #897bff 100%);
  box-shadow: 0 10px 24px -12px rgba(90, 60, 240, 0.55);
}

.mp-flow.is-dark :deep(.mp-node--detail) {
  border-color: hsl(250 40% 48%);
  background: hsl(250 30% 19%);
  color: hsl(250 70% 85%);
}

.mp-flow.is-dark :deep(.mp-edge .vue-flow__edge-path) {
  stroke: var(--vp-c-text-3);
}
</style>
