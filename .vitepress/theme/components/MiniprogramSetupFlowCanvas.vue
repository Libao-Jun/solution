<script setup lang="ts">
/**
 * 小程序「从 0 到 1」完整上线流程图 —— @vue-flow/core 实现。
 * 由同目录的 MiniprogramSetupFlow.vue 在浏览器端动态加载。
 *
 * ★ 版式：11 个步骤按「三行蛇形（boustrophedon）」排布，顺序即阅读顺序：
 *   行 1（左 → 右）：① 注册账号 → ② 主体信息 → ③ 小程序信息 → ④ AppID
 *   行 2（右 → 左）：⑤ 小程序备案 → ⑥ 开发者工具 → ⑦ 创建项目 → ⑧ 编译预览
 *   行 3（左 → 右）：⑨ 上传代码 → ⑩ 提交审核 → ⑪ 发布上线
 *
 * ★ 连线与句柄「由顺序推导」，不手写边表：
 *   STEPS 数组顺序 = 流程顺序，第 i 项连第 i+1 项；句柄方向按两节点的
 *   (row, col) 关系算出——换行落到上/下边，同行落到左/右边。
 *   早前手写边表 + 手写句柄曾把「③ 完善小程序信息」和「⑤ 安装开发者工具」
 *   直接连起来（漏掉 ④），此处逻辑切勿改回手工维护。
 */
import { Handle, MarkerType, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'

/* ------------------------------------------------------------------ *
 * §1 版式常量（节点固定宽高，坐标按中心点计算）
 * ------------------------------------------------------------------ */
const NODE_W = 200
const NODE_H = 84
const COL_STEP = 240
const ROW_STEP = 148
/** 连线与箭头颜色：深浅两套背景都清晰可见 */
const EDGE_COLOR = '#94a3b8'
const FIT_PADDING = 0.05
const MIN_FIT_ZOOM = 0.35

const FLOW_ID = 'miniprogram-setup-flow'
const FIT_VIEW_PARAMS = { padding: FIT_PADDING, minZoom: MIN_FIT_ZOOM }

/* ------------------------------------------------------------------ *
 * §2 图内容（唯一真相源：数组顺序 = 流程顺序）
 * ------------------------------------------------------------------ */
/** 阶段配色：account 建号与合规 / dev 开发自测 / review 上传审核 / live 发布上线 */
type Tone = 'account' | 'dev' | 'review' | 'live'

type FlowStep = {
  id: string
  title: string
  caption: string
  tone: Tone
  /** 所在行（0/1/2）与所在列（中心点横向序号） */
  row: 0 | 1 | 2
  col: 0 | 1 | 2 | 3
}

const STEPS: FlowStep[] = [
  // 行 1（左 → 右）：开账号与配置
  { id: 's1', title: '① 注册账号', caption: 'mp.weixin.qq.com → 立即注册 → 小程序', tone: 'account', row: 0, col: 0 },
  { id: 's2', title: '② 填写主体信息', caption: '个人：身份证 + 扫码；企业：营业执照 + 认证', tone: 'account', row: 0, col: 1 },
  { id: 's3', title: '③ 完善小程序信息', caption: '名称 / 头像 / 简介 / 服务类目', tone: 'account', row: 0, col: 2 },
  { id: 's4', title: '④ 获取 AppID', caption: '后台 → 开发 → 开发设置', tone: 'account', row: 0, col: 3 },

  // 行 2（右 → 左）：备案（可与开发并行）+ 本地开发自测
  { id: 's5', title: '⑤ 小程序备案', caption: '设置 → 基本设置 → 小程序备案', tone: 'account', row: 1, col: 3 },
  { id: 's6', title: '⑥ 安装开发者工具', caption: '微信开发者工具（稳定版）', tone: 'dev', row: 1, col: 2 },
  { id: 's7', title: '⑦ 创建项目', caption: '填入 AppID，选择是否使用云开发', tone: 'dev', row: 1, col: 1 },
  { id: 's8', title: '⑧ 编译预览', caption: '模拟器调试 →「预览」扫码真机', tone: 'dev', row: 1, col: 0 },

  // 行 3（左 → 右）：上传、审核与发布
  { id: 's9', title: '⑨ 上传代码', caption: '「上传」→ 版本号 + 项目备注', tone: 'review', row: 2, col: 0 },
  { id: 's10', title: '⑩ 提交审核', caption: '版本管理 → 提交审核（测试账号 / 路径）', tone: 'review', row: 2, col: 1 },
  { id: 's11', title: '⑪ 发布上线', caption: '全量发布 / 分阶段灰度，可回退', tone: 'live', row: 2, col: 2 },
]

/* ------------------------------------------------------------------ *
 * §3 句柄方向推导
 * ------------------------------------------------------------------ */
/** from 指向 to 时，连线应落在 from 的哪一侧 */
const sideOf = (from: FlowStep, to: FlowStep): Position => {
  if (to.row > from.row) return Position.Bottom
  if (to.row < from.row) return Position.Top
  return to.col > from.col ? Position.Right : Position.Left
}

/** 每个节点的入边 / 出边句柄方向（首节点无入边、末节点无出边） */
const HANDLES = STEPS.map((step, i) => ({
  target: i > 0 ? sideOf(step, STEPS[i - 1]) : undefined,
  source: i < STEPS.length - 1 ? sideOf(step, STEPS[i + 1]) : undefined,
}))

/* ------------------------------------------------------------------ *
 * §4 建图
 * ------------------------------------------------------------------ */
const buildGraph = () => {
  const nodes: Node[] = STEPS.map((step, i) => ({
    id: step.id,
    type: 'card',
    position: { x: step.col * COL_STEP - NODE_W / 2, y: step.row * ROW_STEP - NODE_H / 2 },
    data: {
      title: step.title,
      caption: step.caption,
      tone: step.tone,
      width: NODE_W,
      height: NODE_H,
      source: HANDLES[i].source,
      target: HANDLES[i].target,
    },
    draggable: false,
    connectable: false,
    selectable: false,
    focusable: false,
  }))

  const edges: Edge[] = STEPS.slice(1).map((step, i) => ({
    id: `e-${STEPS[i].id}-${step.id}`,
    source: STEPS[i].id,
    target: step.id,
    type: 'smoothstep',
    class: 'mp-edge',
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: EDGE_COLOR },
    style: { stroke: EDGE_COLOR, strokeWidth: 1.6 },
    selectable: false,
    updatable: false,
    focusable: false,
    pathOptions: { borderRadius: 12 },
  }))

  return { nodes, edges }
}

const { nodes, edges } = buildGraph()

/* ------------------------------------------------------------------ *
 * §5 视图控制
 * ------------------------------------------------------------------ */
const { zoomIn, zoomOut, fitView } = useVueFlow(FLOW_ID)
const fitAll = () => fitView({ ...FIT_VIEW_PARAMS })
defineExpose({ zoomIn, zoomOut, fitView: fitAll })
</script>

<template>
  <div class="mp-flow">
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
      <template #node-card="{ data }">
        <div
          class="mp-node"
          :class="`mp-node--${data.tone}`"
          :style="{ width: `${data.width}px`, height: `${data.height}px` }"
        >
          <Handle v-if="data.target" class="mp-handle" type="target" :position="data.target" />
          <Handle v-if="data.source" class="mp-handle" type="source" :position="data.source" />
          <span class="mp-node__title">{{ data.title }}</span>
          <span class="mp-node__caption">{{ data.caption }}</span>
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
  gap: 5px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #fff;
  text-align: center;
}

.mp-flow :deep(.mp-node__title) {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
}

.mp-flow :deep(.mp-node__caption) {
  font-size: 11px;
  font-weight: 400;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.84);
}

/* ---- 阶段配色（饱和底 + 白字，深浅主题通用） ---- */
.mp-flow :deep(.mp-node--account) {
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
  box-shadow: 0 10px 24px -12px rgba(79, 48, 232, 0.65);
}

.mp-flow :deep(.mp-node--dev) {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  box-shadow: 0 10px 24px -12px rgba(30, 64, 175, 0.6);
}

.mp-flow :deep(.mp-node--review) {
  background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%);
  box-shadow: 0 10px 24px -12px rgba(180, 83, 9, 0.6);
}

.mp-flow :deep(.mp-node--live) {
  background: linear-gradient(135deg, #047857 0%, #10b981 100%);
  box-shadow: 0 10px 24px -12px rgba(4, 120, 87, 0.6);
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
</style>
