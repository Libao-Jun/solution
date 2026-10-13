<script setup lang="ts">
/**
 * 决策树外框（通用）：图例 + 缩放工具条 + 无障碍文字描述 + 画布容器。
 *
 * 与 StorageDecisionTree 同一范式：外框服务端即可渲染（含给读屏软件的文字版决策树），
 * 真正的 @vue-flow/core 画布在浏览器端动态加载——既避免 SSR 触碰 d3-zoom，也避免水合后布局跳动。
 * 具体决策树内容由调用方以 nodes / edges 传入（见 ResponsiveAdaptiveDecisionTree.vue 等）。
 */
import '@vue-flow/core/dist/style.css'
import { onMounted, ref, shallowRef, type Component } from 'vue'
import type { DecisionTreeEdge, DecisionTreeNode } from './DecisionTreeCanvas.vue'

type CanvasControls = {
  zoomIn: () => unknown
  zoomOut: () => unknown
  fitView: () => unknown
}

type LegendItem = { kind: 'decision' | 'result'; text: string }

withDefaults(
  defineProps<{
    flowId: string
    nodes: DecisionTreeNode[]
    edges: DecisionTreeEdge[]
    /** 无障碍用：决策树的口述版本（读屏软件读这段，画布对读屏透明） */
    srText: string
    hint?: string
    legend?: LegendItem[]
    /** 画布高度（px） */
    height?: number
  }>(),
  {
    hint: '拖拽画布可平移，按钮可缩放；连线上的文字即分支条件',
    legend: () => [
      { kind: 'decision', text: '判断' },
      { kind: 'result', text: '结论' },
    ],
    height: 420,
  },
)

const Canvas = shallowRef<Component | null>(null)
const canvasRef = ref<CanvasControls | null>(null)

onMounted(async () => {
  Canvas.value = (await import('./DecisionTreeCanvas.vue')).default
})
</script>

<template>
  <div class="dt-flow">
    <div class="dt-flow__bar">
      <div class="dt-flow__legend">
        <span v-for="item in legend" :key="item.text" class="dt-flow__legend-item">
          <i class="dt-flow__dot" :class="`dt-flow__dot--${item.kind}`" />
          {{ item.text }}
        </span>
      </div>
      <div class="dt-flow__tools">
        <button type="button" class="dt-flow__btn" :disabled="!Canvas" @click="canvasRef?.zoomOut()">缩小</button>
        <button type="button" class="dt-flow__btn" :disabled="!Canvas" @click="canvasRef?.fitView()">适应</button>
        <button type="button" class="dt-flow__btn" :disabled="!Canvas" @click="canvasRef?.zoomIn()">放大</button>
      </div>
    </div>

    <div class="dt-flow__canvas" :style="{ height: `${height}px` }">
      <p class="dt-flow__sr">{{ srText }}</p>
      <component
        :is="Canvas"
        v-if="Canvas"
        ref="canvasRef"
        :flow-id="flowId"
        :nodes="nodes"
        :edges="edges"
      />
    </div>

    <p class="dt-flow__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.dt-flow {
  /* 与 DecisionTreeCanvas 的节点同源配色：CSS 变量 + html.dark 覆盖 */
  --dt-legend-line: hsl(220 58% 74%);
  --dt-legend-fill: hsl(220 80% 96%);
  margin: 1.25rem 0 1.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.dt-flow__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.dt-flow__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.dt-flow__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dt-flow__dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.dt-flow__dot--decision {
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: var(--dt-legend-line);
}

.dt-flow__dot--result {
  border: 1px solid var(--dt-legend-line);
  background: var(--dt-legend-fill);
}

.dt-flow__tools {
  display: flex;
  gap: 6px;
}

.dt-flow__btn {
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

.dt-flow__btn:hover:not(:disabled) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}

.dt-flow__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.dt-flow__canvas {
  position: relative;
  background-image: radial-gradient(circle, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 22px 22px;
}

/* 口述版决策树：仅给读屏软件，视觉上不可见 */
.dt-flow__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.dt-flow__hint {
  margin: 0;
  padding: 6px 12px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
}
</style>

<!-- 深色模式：非 scoped 全局块，避免 Vue scoped 的 :global(html.dark) .dt-flow
     丢掉 .dt-flow 后代导致级联遮蔽；.dt-flow 为本组件专属类名，全局规则安全。 -->
<style>
html.dark .dt-flow {
  --dt-legend-line: hsl(220 46% 42%);
  --dt-legend-fill: hsl(220 36% 19%);
}
</style>
