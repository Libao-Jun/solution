<script setup lang="ts">
/**
 * 前端安全「攻防全景」思维导图 —— @vue-flow/core 实现。
 * 由同目录的 FrontendSecurityMindmap.vue 在浏览器端动态加载（@vue-flow/core 依赖 d3-zoom，
 * 需要 DOM，不参与 SSR 构建）。
 *
 * ★ 为什么换掉原来的 ```mermaid mindmap：mermaid 的 mindmap 是「自动放射布局 + 一次性静态 SVG」，
 *   中文标签容易被截断、不能缩放平移、深色模式要整图重渲；换成 Vue Flow 后节点与连线由代码显式排布，
 *   可以按「左侧攻击面 / 右侧防御机制」的语义分色，并支持拖拽平移与按钮缩放。
 *
 * ★ 结构（与正文 1.2 节文字描述、原 mermaid 图逐条对应，只换渲染实现、不改语义）：
 *
 *     攻击面 · 7 个（暖色）──┐
 *                            ├── 前端安全：攻与防 ──┬── 防御机制 · 4 组（冷色）── 关键问题 · 6 个
 *     跨站脚本 / 伪造 … ─────┘                      └── CSP / Iframe / HSTS / CSP
 *
 * ★ 内容真相源 = 下面的 ATTACKS / DEFENSES 两个数组：增删条目只改数组即可，
 *   节点坐标（tidy 树：父节点垂直居中于自己的子节点块）与连线会自动重算。
 *
 * ★ 所有节点宽高固定（见 §2 版式常量），坐标可精确计算、无需测量 DOM，fitView 一次即可整图入画。
 */
import { Handle, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { useData } from 'vitepress'

/* ------------------------------------------------------------------ *
 * §1 图内容（唯一真相源）
 * ------------------------------------------------------------------ */

/** 语义色：只声明色相，明暗两套色值由 <style> 里的 hsl() 统一推导 */
type Tone = 'rose' | 'amber' | 'violet' | 'green' | 'teal' | 'blue' | 'purple'

/** 左侧：前端要面对的典型攻击面（暖色） */
const ATTACKS: { label: string; tone: Tone }[] = [
  { label: '跨站脚本攻击（XSS）', tone: 'rose' },
  { label: '跨站请求伪造（CSRF）', tone: 'rose' },
  { label: '点击劫持（Clickjacking）', tone: 'amber' },
  { label: 'CDN 劫持', tone: 'amber' },
  { label: '页面劫持', tone: 'amber' },
  { label: 'DoS 攻击', tone: 'violet' },
  { label: '中间人攻击（MITM）', tone: 'violet' },
]

/** 右侧：协议与浏览器提供的防御机制，以及其必须回答的关键问题（冷色） */
const DEFENSES: { label: string; tone: Tone; questions: string[] }[] = [
  { label: '内容安全策略（CSP）', tone: 'green', questions: ['如何启用？', '有什么限制？'] },
  { label: 'Iframe', tone: 'teal', questions: ['有什么缺点？', '如何防御通过 Iframe 的攻击？'] },
  { label: 'HTTP 严格传输安全（HSTS）', tone: 'blue', questions: ['如何开启？'] },
  // 与原 mermaid 保持一致：CSP 在「防御机制」与「如何开启」两处各出现一次，不做合并
  { label: '内容安全策略（CSP）', tone: 'purple', questions: ['如何开启？'] },
]

/* ------------------------------------------------------------------ *
 * §2 版式常量（节点固定宽高，坐标可精确计算）
 * ★ 三列（攻击面 / 中心 / 防御机制+关键问题）的总宽度决定 fitView 的初始缩放：
 *   正文内容区约 750px，故这里按「整图宽度 ≈ 750 / 0.94」反推列宽与列距，
 *   保证默认缩放≈0.94（字号 13px → 实际约 12px），过大则首屏字太小、需手动放大。
 * ------------------------------------------------------------------ */
const ROOT_W = 164
const ROOT_H = 58
const NODE_W = 156
const NODE_H = 54
const COL_GAP = 38
const ATTACK_STEP = 64
const QUESTION_STEP = 62
const FIT_PADDING = 0.05
/** 窄屏（手机）下限缩放：低于它就不「强行塞下整图」，宁可让用户拖拽查看，也不把字缩到看不清 */
const MIN_FIT_ZOOM = 0.8

/** 本图是只读示意图：不拖拽、不连线、不选中；显式传 id 便于父组件拿到同一份 store 做缩放 */
const FLOW_ID = 'frontend-security-mindmap'

/** fitView 参数：初始化与工具栏「适应」共用，保证两者结果一致 */
const FIT_VIEW_PARAMS = { padding: FIT_PADDING, minZoom: MIN_FIT_ZOOM }

/* ------------------------------------------------------------------ *
 * §3 建图
 * ------------------------------------------------------------------ */
const buildGraph = () => {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const rootLeft = -ROOT_W / 2
  const attackX = rootLeft - COL_GAP - NODE_W
  const defenseX = rootLeft + ROOT_W + COL_GAP
  const questionX = defenseX + NODE_W + COL_GAP

  /** 节点公共属性 */
  const base = { type: 'mind', draggable: false, connectable: false, selectable: false }
  /** 连线公共属性 */
  const link = { type: 'default', selectable: false, updatable: false }

  nodes.push({
    ...base,
    id: 'root',
    position: { x: rootLeft, y: -ROOT_H / 2 },
    data: { label: '前端安全：攻与防', width: ROOT_W, height: ROOT_H, kind: 'root' },
  })

  ATTACKS.forEach((item, index) => {
    const id = `attack-${index}`
    nodes.push({
      ...base,
      id,
      position: { x: attackX, y: (index - (ATTACKS.length - 1) / 2) * ATTACK_STEP - NODE_H / 2 },
      data: { label: item.label, tone: item.tone, width: NODE_W, height: NODE_H, kind: 'leaf' },
    })
    edges.push({
      ...link,
      id: `edge-${id}`,
      source: id,
      target: 'root',
      class: `mm-edge mm-tone--${item.tone}`,
    })
  })

  // 右侧：先按顺序给每棵子树分配叶子槽位，父节点再垂直居中于自己的子节点块
  const totalQuestions = DEFENSES.reduce((sum, group) => sum + group.questions.length, 0)
  let slot = 0

  DEFENSES.forEach((group, groupIndex) => {
    const parentId = `defense-${groupIndex}`
    const childCenters: number[] = []

    group.questions.forEach((question, questionIndex) => {
      const id = `question-${groupIndex}-${questionIndex}`
      const centerY = (slot - (totalQuestions - 1) / 2) * QUESTION_STEP
      slot += 1
      childCenters.push(centerY)

      nodes.push({
        ...base,
        id,
        position: { x: questionX, y: centerY - NODE_H / 2 },
        data: { label: question, tone: group.tone, width: NODE_W, height: NODE_H, kind: 'leaf' },
      })
      edges.push({
        ...link,
        id: `edge-${id}`,
        source: parentId,
        target: id,
        class: `mm-edge mm-tone--${group.tone}`,
      })
    })

    const centerY = childCenters.length
      ? childCenters.reduce((sum, y) => sum + y, 0) / childCenters.length
      : 0

    nodes.push({
      ...base,
      id: parentId,
      position: { x: defenseX, y: centerY - NODE_H / 2 },
      data: { label: group.label, tone: group.tone, width: NODE_W, height: NODE_H, kind: 'leaf' },
    })
    edges.push({
      ...link,
      id: `edge-${parentId}`,
      source: 'root',
      target: parentId,
      class: `mm-edge mm-tone--${group.tone}`,
    })
  })

  return { nodes, edges }
}

// 图是静态的：只在初始化时算一次
const { nodes, edges } = buildGraph()

/* ------------------------------------------------------------------ *
 * §4 视图控制（暴露给外层骨架的工具栏按钮）
 * ------------------------------------------------------------------ */
const { zoomIn, zoomOut, fitView } = useVueFlow(FLOW_ID)

const fitAll = () => fitView({ ...FIT_VIEW_PARAMS })

defineExpose({ zoomIn, zoomOut, fitView: fitAll })

const { isDark } = useData()
</script>

<template>
  <div class="mindmap-canvas" :class="{ 'is-dark': isDark }">
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
      <template #node-mind="{ data }">
        <div
          class="mm-node"
          :class="[`mm-node--${data.kind}`, data.tone && `mm-tone--${data.tone}`]"
          :style="{ width: `${data.width}px`, height: `${data.height}px` }"
        >
          <Handle class="mm-handle" type="target" :position="Position.Left" />
          <span class="mm-node__text">{{ data.label }}</span>
          <Handle class="mm-handle" type="source" :position="Position.Right" />
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.mindmap-canvas {
  /* 语义色相兜底：节点 / 连线各自带 .mm-tone--* 覆盖它（这里用继承，避免与基础样式抢优先级） */
  --mm-hue: 220;
  width: 100%;
  height: 100%;
}

.mindmap-canvas :deep(.vue-flow) {
  background: transparent;
}

/* 只读示意图：平移手势保留，其余交互全部关闭 */
.mindmap-canvas :deep(.vue-flow__pane) {
  cursor: grab;
}

.mindmap-canvas :deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.mindmap-canvas :deep(.vue-flow__edge) {
  pointer-events: none;
}

/* ---- 语义色：只声明色相，其余色值由此推导 ---- */
.mindmap-canvas :deep(.mm-tone--rose) {
  --mm-hue: 352;
}

.mindmap-canvas :deep(.mm-tone--amber) {
  --mm-hue: 30;
}

.mindmap-canvas :deep(.mm-tone--violet) {
  --mm-hue: 262;
}

.mindmap-canvas :deep(.mm-tone--green) {
  --mm-hue: 152;
}

.mindmap-canvas :deep(.mm-tone--teal) {
  --mm-hue: 182;
}

.mindmap-canvas :deep(.mm-tone--blue) {
  --mm-hue: 214;
}

.mindmap-canvas :deep(.mm-tone--purple) {
  --mm-hue: 288;
}

/* ---- 节点 ---- */
.mindmap-canvas :deep(.mm-node) {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border: 1px solid hsl(var(--mm-hue) 58% 74%);
  border-radius: 10px;
  background: hsl(var(--mm-hue) 80% 96%);
  color: hsl(var(--mm-hue) 58% 30%);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  text-align: center;
  overflow: hidden;
}

/* 中心节点：品牌色实心，作为整图的视觉锚点 */
.mindmap-canvas :deep(.mm-node--root) {
  border-color: transparent;
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 12px 26px -14px rgba(79, 48, 232, 0.8);
}

/* 句柄只用于给连线定位（连线接在节点左右两侧中线），本身不可见 */
.mindmap-canvas :deep(.mm-handle) {
  width: 2px;
  height: 2px;
  min-width: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}

/* ---- 连线：颜色沿用所属分支的色相 ---- */
.mindmap-canvas :deep(.mm-edge .vue-flow__edge-path) {
  stroke: hsl(var(--mm-hue, 220) 54% 58%);
  stroke-width: 1.8;
  stroke-linecap: round;
}

/* ---- 深色模式 ---- */
.mindmap-canvas.is-dark :deep(.mm-node) {
  border-color: hsl(var(--mm-hue) 46% 42%);
  background: hsl(var(--mm-hue) 36% 19%);
  color: hsl(var(--mm-hue) 72% 84%);
}

.mindmap-canvas.is-dark :deep(.mm-edge .vue-flow__edge-path) {
  stroke: hsl(var(--mm-hue, 220) 50% 62%);
}

.mindmap-canvas.is-dark :deep(.mm-node--root) {
  border-color: transparent;
  background: linear-gradient(135deg, #5a3cf0 0%, #897bff 100%);
  color: #fff;
}
</style>>
