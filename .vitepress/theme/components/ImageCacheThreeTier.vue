<script setup lang="ts">
/**
 * 8.5 图片缓存（流量与内存的最大头）—— @vue-flow/core 重构。
 * 构图：横向三级（内存 → 磁盘 → 网络），未命中逐层下沉，命中后回写上层。
 */
import { defineAsyncComponent } from 'vue'
import type { AppFlowNode, AppFlowEdge } from './AppFlowchartCanvas.vue'

const Canvas = defineAsyncComponent(() => import('./AppFlowchartCanvas.vue'))

const W = 230
const H = 70
const GAP = 90

const nodes: AppFlowNode[] = [
  { id: 'm', position: { x: 0, y: 0 }, data: { label: '内存缓存 LruCache<br>强引用 · 按 size 计量 · 最快', width: W, height: H, tone: 'indigo', io: 'lr' } },
  { id: 'd', position: { x: W + GAP, y: 0 }, data: { label: '磁盘缓存 DiskLruCache / 文件<br>journal 日志索引 · key 用 MD5 作文件名', width: W, height: H, tone: 'sky', io: 'lr' } },
  { id: 'n', position: { x: 2 * (W + GAP), y: 0 }, data: { label: '网络<br>下载后依次写入 磁盘 → 内存', width: W, height: H, tone: 'amber', io: 'lr' } },
]

const edges: AppFlowEdge[] = [
  { id: 'e1', source: 'm', target: 'd', label: '未命中' },
  { id: 'e2', source: 'd', target: 'n', label: '未命中' },
]
</script>

<template>
  <ClientOnly>
    <Canvas flow-id="image-cache-three-tier" :nodes="nodes" :edges="edges" :default-zoom="0.95" />
  </ClientOnly>
</template>
