<script setup lang="ts">
/**
 * 五、从 0 到 1：完整项目开发流程（17 步）—— @vue-flow/core 重构。
 * 构图：4 个阶段分 4 行，每行内步骤横向串联（LR），阶段之间以上一阶段末步 → 下一阶段首步横向衔接，
 * 顶部另置阶段标题色块，整体呈「蛇形」阅读动线。
 */
import { defineAsyncComponent } from 'vue'
import type { AppFlowNode, AppFlowEdge } from './AppFlowchartCanvas.vue'

const Canvas = defineAsyncComponent(() => import('./AppFlowchartCanvas.vue'))

const STEP_W = 150
const STEP_GAP = 18
const ROW_Y = 110
const TITLE_H = 34

const phases: { title: string; tone: 'indigo' | 'sky' | 'violet' | 'amber'; steps: string[] }[] = [
  { title: '阶段一：需求与设计', tone: 'indigo', steps: ['1. 需求分析', '2. 原型设计', '3. UI 设计'] },
  { title: '阶段二：技术准备与基础搭建', tone: 'sky', steps: ['4. 技术选型', '5. 搭建项目', '6. 开发页面'] },
  { title: '阶段三：核心功能开发', tone: 'violet', steps: ['7. 封装网络请求', '8. 登录注册', '9. 状态管理', '10. 本地存储', '11. 权限处理', '12. 接入推送/支付/地图/相机'] },
  { title: '阶段四：测试、上架与迭代', tone: 'amber', steps: ['13. 真机测试', '14. 性能优化', '15. 打包', '16. 应用市场上架', '17. 后续版本迭代'] },
]

const nodes: AppFlowNode[] = []
const edges: AppFlowEdge[] = []

phases.forEach((phase, ci) => {
  const y = ci * ROW_Y
  // 阶段标题块置于该行左侧上方
  nodes.push({
    id: `title-${ci}`,
    position: { x: 0, y: y - TITLE_H - 10 },
    data: { label: phase.title, width: 220, height: TITLE_H, tone: phase.tone, io: 'lr' },
  })
  phase.steps.forEach((step, si) => {
    const id = `s-${ci}-${si}`
    nodes.push({
      id,
      position: { x: si * (STEP_W + STEP_GAP), y },
      data: { label: step, width: STEP_W, height: 44, tone: phase.tone, io: 'lr' },
    })
    if (si > 0) {
      edges.push({ id: `e-${ci}-${si}`, source: `s-${ci}-${si - 1}`, target: id })
    }
  })
  // 阶段间衔接：上一阶段末步 → 下一阶段首步
  if (ci > 0) {
    const prevLen = phases[ci - 1].steps.length
    edges.push({ id: `phase-${ci}`, source: `s-${ci - 1}-${prevLen - 1}`, target: `s-${ci}-0` })
  }
})
</script>

<template>
  <ClientOnly>
    <Canvas flow-id="full-dev-workflow" :nodes="nodes" :edges="edges" :default-zoom="0.7" :min-zoom="0.2" />
  </ClientOnly>
</template>
