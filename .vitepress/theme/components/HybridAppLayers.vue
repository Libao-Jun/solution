<script setup lang="ts">
/**
 * 1.7 混合 App 的三层结构与 JSBridge —— @vue-flow/core 重构。
 * 构图：自上而下三层（网页层 → 引擎层 → 容器层），并标注由谁编写。
 */
import { defineAsyncComponent } from 'vue'
import type { AppFlowNode, AppFlowEdge } from './AppFlowchartCanvas.vue'

const Canvas = defineAsyncComponent(() => import('./AppFlowchartCanvas.vue'))

const W = 280
const H = 64
const gap = 120

const nodes: AppFlowNode[] = [
  {
    id: 'l1',
    position: { x: 0, y: 0 },
    data: {
      label: '① HTML5 网页层（前端页面）<br>前端工程师写这层（Vue/React/原生 JS）',
      width: W, height: H, tone: 'indigo',
    },
  },
  {
    id: 'l2',
    position: { x: 0, y: H + gap },
    data: {
      label: '② 网页引擎层（WebView 实例）<br>本质是一个隔离的浏览器内核',
      width: W, height: H, tone: 'sky',
    },
  },
  {
    id: 'l3',
    position: { x: 0, y: 2 * (H + gap) },
    data: {
      label: '③ 容器层（原生外壳）<br>原生工程师写这层',
      width: W, height: H, tone: 'orange',
    },
  },
]

const edges: AppFlowEdge[] = [
  { id: 'e1', source: 'l1', target: 'l2', label: '运行于' },
  { id: 'e2', source: 'l2', target: 'l3', label: '承载于' },
]
</script>

<template>
  <ClientOnly>
    <Canvas flow-id="hybrid-app-layers" :nodes="nodes" :edges="edges" :default-zoom="1" />
  </ClientOnly>
</template>
