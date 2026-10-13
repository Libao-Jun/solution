<script setup lang="ts">
/**
 * 通用 Vue Flow 流程图画布。
 * 用于把 `frameworks/app-development/index.md` 中多个 mermaid 流程图统一替换为可交互的
 * @vue-flow/core 实现。接收预定义的 nodes / edges，自动 fitView，支持拖拽平移与缩放按钮。
 *
 * 设计原则：
 * - 节点宽高固定，坐标由各自 wrapper 组件显式排布（避免依赖 DOM 测量）。
 * - 连线使用 smoothstep，只读场景下禁止拖拽/连线/选中。
 * - 组件在 ClientOnly 内使用，避免 SSR 期间渲染 @vue-flow/core（其依赖 d3-zoom）。
 */
import { VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { computed } from 'vue'
import AppFlowchartNode from './AppFlowchartNode.vue'

export interface AppFlowNode extends Omit<Node, 'data'> {
  data: {
    label: string
    width?: number
    height?: number
    tone?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky' | 'orange'
    /** 连接点方向：'tb' 上下（默认，适合纵向流程），'lr' 左右（适合横向流程） */
    io?: 'tb' | 'lr'
    /** 可选：单独覆写目标/来源把手方向（优先于 io），用于「上进右出」等混合连线 */
    targetPos?: 'top' | 'bottom' | 'left' | 'right'
    sourcePos?: 'top' | 'bottom' | 'left' | 'right'
  }
}

export interface AppFlowEdge extends Omit<Edge, 'label'> {
  label?: string
}

interface Props {
  flowId: string
  nodes: AppFlowNode[]
  edges: AppFlowEdge[]
  minZoom?: number
  defaultZoom?: number
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  minZoom: 0.2,
  defaultZoom: 0.95,
  height: '420px',
})

const nodeTypes = { card: AppFlowchartNode }

const flowNodes = computed<Node[]>(() =>
  props.nodes.map((n) => ({
    ...n,
    type: 'card',
    draggable: false,
    connectable: false,
    selectable: false,
  }))
)

const flowEdges = computed<Edge[]>(() =>
  props.edges.map((e) => ({
    ...e,
    type: 'smoothstep',
    animated: false,
    selectable: false,
    updatable: false,
  }))
)

const { fitView, zoomIn, zoomOut } = useVueFlow({ id: props.flowId })
</script>

<template>
  <div class="app-flowchart" :style="{ height: props.height }">
    <VueFlow
      :id="flowId"
      :nodes="flowNodes"
      :edges="flowEdges"
      :node-types="nodeTypes"
      :default-viewport="{ zoom: defaultZoom }"
      :min-zoom="minZoom"
      :max-zoom="2"
      fit-view-on-init
      :fit-view-options="{ padding: 0.08, minZoom: minZoom }"
      class="app-flowchart__flow"
    >
      <div class="app-flowchart__toolbar">
        <button class="app-flowchart__btn" title="适应画布" @click="fitView({ padding: 0.05, minZoom: minZoom })">⟲</button>
        <button class="app-flowchart__btn" title="放大" @click="zoomIn()">+</button>
        <button class="app-flowchart__btn" title="缩小" @click="zoomOut()">−</button>
      </div>
    </VueFlow>
    <p class="app-flowchart__tip">提示：拖拽画布可平移，滚轮可缩放，点击 ⟲ 可重置视图。</p>
  </div>
</template>

<style scoped>
.app-flowchart {
  position: relative;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  margin: 16px 0;
}
.app-flowchart__flow {
  width: 100%;
  height: 100%;
}
.app-flowchart__toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 6px;
}
.app-flowchart__btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.app-flowchart__btn:hover {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg-soft-up);
}
.app-flowchart__tip {
  position: absolute;
  bottom: 4px;
  right: 8px;
  margin: 0;
  font-size: 11px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
  pointer-events: none;
}
</style>
