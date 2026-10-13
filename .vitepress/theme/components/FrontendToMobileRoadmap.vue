<script setup lang="ts">
/**
 * 17.1 前端开发者转移动端（推荐路线）—— @vue-flow/core 重构。
 * 构图：主干六阶段竖向串联，阶段三（选主战场）向下展开三个并列选项，再汇回主干。
 */
import { defineAsyncComponent } from 'vue'
import type { AppFlowNode, AppFlowEdge } from './AppFlowchartCanvas.vue'

const Canvas = defineAsyncComponent(() => import('./AppFlowchartCanvas.vue'))

const W = 250
const H = 56
const STEP_GAP = 28
const branchGap = 150

const mainY = (i: number) => i * (H + STEP_GAP)

const nodes: AppFlowNode[] = [
  { id: 's1', position: { x: 0, y: mainY(0) }, data: { label: '阶段一（基础）<br>HTML/CSS/JS → TypeScript → Vue 或 React', width: W, height: H, tone: 'slate' } },
  { id: 's2', position: { x: 0, y: mainY(1) }, data: { label: '阶段二（移动端认知）<br>页面/路由/状态/权限/打包/上架全流程', width: W, height: H, tone: 'indigo' } },
  { id: 'q', position: { x: 0, y: mainY(2) }, data: { label: '阶段三（选主战场）', width: W, height: H, tone: 'violet' } },
  { id: 'a', position: { x: -branchGap - W, y: mainY(3) }, data: { label: 'React Native / uni-app<br>（快速做 App）', width: W, height: H, tone: 'indigo' } },
  { id: 'b', position: { x: 0, y: mainY(3) }, data: { label: 'Flutter<br>（高质量跨平台）', width: W, height: H, tone: 'sky' } },
  { id: 'c', position: { x: branchGap + W, y: mainY(3) }, data: { label: 'uni-app / Taro<br>（覆盖小程序 + App）', width: W, height: H, tone: 'emerald' } },
  { id: 's4', position: { x: 0, y: mainY(4) }, data: { label: '阶段四（做完整项目）<br>从 0 到 1 做完整 App', width: W, height: H, tone: 'amber' } },
  { id: 's5', position: { x: 0, y: mainY(5) }, data: { label: '阶段五（原生能力补充）<br>Android：Kotlin+Compose / iOS：Swift+SwiftUI', width: W, height: H, tone: 'orange' } },
  { id: 's6', position: { x: 0, y: mainY(6) }, data: { label: '阶段六（工程与发布）<br>打包签名 → 上架 → 监控迭代 → 性能优化', width: W, height: H, tone: 'rose' } },
]

const edges: AppFlowEdge[] = [
  { id: 'e1', source: 's1', target: 's2' },
  { id: 'e2', source: 's2', target: 'q' },
  { id: 'e3', source: 'q', target: 'a', label: '快速' },
  { id: 'e4', source: 'q', target: 'b', label: '质量' },
  { id: 'e5', source: 'q', target: 'c', label: '小程序' },
  { id: 'e6', source: 'a', target: 's4' },
  { id: 'e7', source: 'b', target: 's4' },
  { id: 'e8', source: 'c', target: 's4' },
  { id: 'e9', source: 's4', target: 's5' },
  { id: 'e10', source: 's5', target: 's6' },
]
</script>

<template>
  <ClientOnly>
    <Canvas flow-id="frontend-to-mobile-roadmap" :nodes="nodes" :edges="edges" :default-zoom="0.9" />
  </ClientOnly>
</template>
