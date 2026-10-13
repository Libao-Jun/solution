<script setup lang="ts">
/**
 * 8.1 缓存的分层模型（一张图看懂）—— @vue-flow/core 重构。
 * 构图：横向四层（用户请求 → L1 内存 → L2 磁盘 → L3 网络），未命中依次下沉。
 */
import { defineAsyncComponent } from 'vue'
import type { AppFlowNode, AppFlowEdge } from './AppFlowchartCanvas.vue'

const Canvas = defineAsyncComponent(() => import('./AppFlowchartCanvas.vue'))

const W = 200
const H = 76
const GAP = 70

const nodes: AppFlowNode[] = [
  { id: 'u', position: { x: 0, y: 0 }, data: { label: '用户请求', width: W, height: H, tone: 'slate', io: 'lr' } },
  { id: 'l1', position: { x: W + GAP, y: 0 }, data: { label: '① 内存缓存 L1<br>最快 · 进程内 · 重启即失<br>LruCache / Map / 图片内存缓存', width: W, height: H, tone: 'indigo', io: 'lr' } },
  { id: 'l2', position: { x: 2 * (W + GAP), y: 0 }, data: { label: '② 磁盘缓存 L2<br>文件 / SQLite / Room<br>Core Data / WebView Cache', width: W, height: H, tone: 'sky', io: 'lr' } },
  { id: 'l3', position: { x: 3 * (W + GAP), y: 0 }, data: { label: '③ 网络 L3 源<br>HTTP 缓存 + CDN 边缘<br>服务端缓存(Redis)', width: W, height: H, tone: 'amber', io: 'lr' } },
]

const edges: AppFlowEdge[] = [
  { id: 'e0', source: 'u', target: 'l1' },
  { id: 'e1', source: 'l1', target: 'l2', label: '未命中' },
  { id: 'e2', source: 'l2', target: 'l3', label: '未命中' },
]
</script>

<template>
  <ClientOnly>
    <Canvas flow-id="cache-layer-model" :nodes="nodes" :edges="edges" :default-zoom="0.85" />
  </ClientOnly>
</template>
