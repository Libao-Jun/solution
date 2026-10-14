<script setup lang="ts">
/**
 * 文档正文插图的通用外框（外层骨架）。
 *
 * 与 BuildToolsFlow / DecisionTreeFlow 同一范式：
 * - 外层只用真实 DOM 渲染图例、缩放工具条、无障碍口述版与操作提示，SSR 可直接输出；
 * - 真正的 @vue-flow/core 画布（DocFlowCanvas.vue）在浏览器端动态加载，
 *   既避免构建期触碰 d3-zoom，也避免水合后的布局跳动。
 *
 * 具体图内容由调用方以 nodes / edges 传入（见 JsOverviewMap.vue 等）。
 */
import { onMounted, ref, shallowRef, type Component } from 'vue'

import '@vue-flow/core/dist/style.css'
import type { DocFlowEdge, DocFlowNode, FlowTone } from './DocFlowCanvas.vue'

export interface FlowLegendItem {
  /** 图例色点：矩形（普通节点）/ 菱形（判断节点） */
  shape: 'rect' | 'diamond'
  tone: FlowTone
  text: string
}

type CanvasControls = {
  zoomIn: () => unknown
  zoomOut: () => unknown
  fitView: () => unknown
}

withDefaults(
  defineProps<{
    flowId: string
    nodes: DocFlowNode[]
    edges: DocFlowEdge[]
    /** 无障碍用：图的口述版本（读屏软件读这段，画布对读屏透明） */
    srText: string
    legend?: FlowLegendItem[]
    hint?: string
    /** 画布高度（px） */
    height?: number
    minZoom?: number
    maxZoom?: number
  }>(),
  {
    legend: () => [],
    hint: '拖拽画布可平移，按钮可缩放',
    height: 460,
    minZoom: 0.5,
    maxZoom: 1.3,
  },
)

const Canvas = shallowRef<Component | null>(null)
const canvasRef = ref<CanvasControls | null>(null)

onMounted(async () => {
  Canvas.value = (await import('./DocFlowCanvas.vue')).default
})
</script>

<template>
  <div class="doc-flow">
    <div class="doc-flow__bar">
      <div class="doc-flow__legend">
        <span v-for="item in legend" :key="item.text" class="doc-flow__legend-item">
          <i class="doc-flow__dot" :class="[`doc-flow__dot--${item.shape}`, `doc-flow__dot--${item.tone}`]" />
          {{ item.text }}
        </span>
      </div>
      <div class="doc-flow__tools">
        <button type="button" class="doc-flow__btn" :disabled="!Canvas" @click="canvasRef?.zoomOut()">
          缩小
        </button>
        <button type="button" class="doc-flow__btn" :disabled="!Canvas" @click="canvasRef?.fitView()">
          适应
        </button>
        <button type="button" class="doc-flow__btn" :disabled="!Canvas" @click="canvasRef?.zoomIn()">
          放大
        </button>
      </div>
    </div>

    <div class="doc-flow__canvas" :style="{ height: `${height}px` }">
      <p class="doc-flow__sr">{{ srText }}</p>
      <component
        :is="Canvas"
        v-if="Canvas"
        ref="canvasRef"
        :flow-id="flowId"
        :nodes="nodes"
        :edges="edges"
        :min-zoom="minZoom"
        :max-zoom="maxZoom"
      />
    </div>

    <p class="doc-flow__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.doc-flow {
  margin: 1.25rem 0 1.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.doc-flow__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.doc-flow__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.doc-flow__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* 图例色点：geometry 由 shape 决定，色值由 tone（--doc-hue）决定 */
.doc-flow__dot {
  --doc-hue: 220;
  width: 10px;
  height: 10px;
}

.doc-flow__dot--rect {
  border: 1px solid hsl(var(--doc-hue) 58% 74%);
  border-radius: 3px;
  background: hsl(var(--doc-hue) 80% 96%);
}

.doc-flow__dot--diamond {
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: hsl(var(--doc-hue) 52% 66%);
}

.doc-flow__dot--indigo {
  --doc-hue: 250;
}

.doc-flow__dot--sky {
  --doc-hue: 214;
}

.doc-flow__dot--emerald {
  --doc-hue: 160;
}

.doc-flow__dot--amber {
  --doc-hue: 32;
}

.doc-flow__dot--brand {
  border-color: transparent;
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
}

.doc-flow__tools {
  display: flex;
  gap: 6px;
}

.doc-flow__btn {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.doc-flow__btn:hover:not(:disabled) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}

.doc-flow__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.doc-flow__canvas {
  position: relative;
  background-image: radial-gradient(circle, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 22px 22px;
}

/* 口述版图内容：仅给读屏软件，视觉上不可见 */
.doc-flow__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.doc-flow__hint {
  margin: 0;
  padding: 6px 12px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
}

@media (max-width: 768px) {
  .doc-flow__canvas {
    max-height: 72vh;
  }
}
</style>

<!-- 深色模式：用非 scoped 全局块写 html.dark .doc-flow__dot，
     避免 Vue scoped 的 :global(html.dark) 丢掉后代选择器导致浅色声明遮蔽深色值。
     .doc-flow__dot 为本组件专属类名，全局规则安全。 -->
<style>
html.dark .doc-flow__dot--rect {
  border-color: hsl(var(--doc-hue) 46% 42%);
  background: hsl(var(--doc-hue) 36% 19%);
}

html.dark .doc-flow__dot--diamond {
  background: hsl(var(--doc-hue) 46% 46%);
}
</style>
