<script setup lang="ts">
/**
 * 11.2 iOS —— @vue-flow/core 重构。
 * 构图：纵向六步上架流程，每步带序号徽标语义（注册 → 配置 → 打包 → 上传 → 内测 → 发布），
 * 节点自上而下换行排列，避免横向过宽导致文字被压缩。
 */
import { defineAsyncComponent } from 'vue'
import type { AppFlowNode, AppFlowEdge } from './AppFlowchartCanvas.vue'

const Canvas = defineAsyncComponent(() => import('./AppFlowchartCanvas.vue'))

const W = 260
const H = 66
const GAP = 38

const steps: { label: string; tone: 'slate' | 'indigo' | 'sky' | 'violet' | 'amber' | 'emerald' }[] = [
  { label: '① 注册 Apple Developer Program<br>（个人 $99/年 或 公司需 D-U-N-S 编号）', tone: 'slate' },
  { label: '② 创建 App ID<br>（Bundle Identifier）', tone: 'indigo' },
  { label: '③ 配置证书与描述文件<br>（Certificates / Provisioning Profiles）', tone: 'sky' },
  { label: '④ Xcode → Product → Archive 打包', tone: 'violet' },
  { label: '⑤ 上传 App Store Connect<br>（Xcode / Transporter）', tone: 'amber' },
  { label: '⑥ TestFlight 内测 → 提交审核 → 通过后发布', tone: 'emerald' },
]

const nodes: AppFlowNode[] = steps.map((s, i) => ({
  id: `s${i}`,
  position: { x: 0, y: i * (H + GAP) },
  data: { label: s.label, width: W, height: H, tone: s.tone, io: 'tb' },
}))

const edges: AppFlowEdge[] = steps.slice(1).map((_, i) => ({
  id: `e${i}`,
  source: `s${i}`,
  target: `s${i + 1}`,
}))
</script>

<template>
  <ClientOnly>
    <Canvas flow-id="ios-release-flow" :nodes="nodes" :edges="edges" height="580px" :default-zoom="0.9" :min-zoom="0.25" />
  </ClientOnly>
</template>
