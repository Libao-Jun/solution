<script setup lang="ts">
/**
 * 3.2 选型决策树（前端开发者视角）—— @vue-flow/core 重构（v2）。
 * 忠实还原旧 mermaid 版的全部功能点：两棵子树（左：团队/技术底色，右：项目诉求），
 * 每个条件分支都必须有对应的「推荐技术」叶子结论节点：
 *   左：会 React/RN 生态→RN（快速）；会 Vue→uni-app（覆盖小程序，Ionic/Capacitor 纯 H5 壳）；
 *      无前端包袱·追求体验一致→Flutter；已有原生团队·只共享逻辑→KMP；
 *      只做展示页/活动页·预算极低→Hybrid（WebView + Vue/React）
 *   右：性能整体高·预算足·大型 App→原生（Kotlin/Compose、Swift/SwiftUI）；
 *      一个团队覆盖双端→跨平台（Flutter/RN）；同时覆盖小程序+App→uni-app/Taro；
 *      快速拉新·内容展示→Web App/H5/PWA
 * 布局：根居中分叉到两个问题节点；每个问题节点向下串起各自条件列，
 * 每个条件节点向右水平连出推荐技术节点（indigo/emerald 条件 → amber 结论）。
 */
import { defineAsyncComponent } from 'vue'
import type { AppFlowNode, AppFlowEdge } from './AppFlowchartCanvas.vue'

const Canvas = defineAsyncComponent(() => import('./AppFlowchartCanvas.vue'))

const COL_W = 210
const REC_W = 220
const ROW_H = 52
const X_L = 20 // 左子树条件列
const X_R = 560 // 右子树条件列
const Y_Q = 80
const Y_START = 190
const PITCH = 76

const root: AppFlowNode = {
  id: 'root',
  position: { x: 415, y: 0 },
  data: { label: 'App 技术选型', width: 200, height: 46, tone: 'slate' },
}

const q1: AppFlowNode = {
  id: 'q1',
  position: { x: X_L, y: Y_Q },
  data: { label: '① 你的团队 / 技术底色是什么？', width: COL_W, height: ROW_H, tone: 'violet' },
}
const q2: AppFlowNode = {
  id: 'q2',
  position: { x: X_R, y: Y_Q },
  data: { label: '② 项目诉求是什么？', width: COL_W, height: ROW_H, tone: 'violet' },
}

/** [条件文案, 推荐技术文案] */
const leftBranches: Array<[string, string]> = [
  ['会 React / RN 生态', 'RN（快速）· Expo'],
  ['会 Vue', 'uni-app（覆盖小程序，<br>Ionic / Capacitor 纯 H5 壳）'],
  ['无前端包袱 · 追求体验一致', 'Flutter'],
  ['已有原生团队 · 只共享逻辑', 'KMP'],
  ['只做展示页 / 活动页 · 预算极低', 'Hybrid（WebView +<br>Vue/React）'],
]

const rightBranches: Array<[string, string]> = [
  ['性能整体高 · 预算足 ·<br>大型 App', '原生（Kotlin/Compose、<br>Swift/SwiftUI）'],
  ['一个团队覆盖双端', '跨平台（Flutter / RN）'],
  ['同时覆盖小程序 + App', 'uni-app / Taro'],
  ['快速拉新 · 内容展示', 'Web App / H5 / PWA'],
]

const nodes: AppFlowNode[] = [root, q1, q2]
const edges: AppFlowEdge[] = [
  { id: 'e-root-q1', source: 'root', target: 'q1' },
  { id: 'e-root-q2', source: 'root', target: 'q2' },
]

function buildBranches(
  qId: string,
  xCond: number,
  prefix: string,
  branches: Array<[string, string]>,
  condTone: NonNullable<AppFlowNode['data']['tone']>,
) {
  branches.forEach(([cond, rec], i) => {
    const y = Y_START + PITCH * i
    const condId = `${prefix}-cond-${i + 1}`
    const recId = `${prefix}-rec-${i + 1}`
    nodes.push({
      id: condId,
      position: { x: xCond, y },
      data: {
        label: cond,
        width: COL_W,
        height: ROW_H,
        tone: condTone,
        targetPos: 'top',
        sourcePos: 'right',
      },
    })
    nodes.push({
      id: recId,
      position: { x: xCond + COL_W + 30, y },
      data: { label: rec, width: REC_W, height: ROW_H, tone: 'amber', targetPos: 'left' },
    })
    edges.push({ id: `e-${qId}-${condId}`, source: qId, target: condId })
    edges.push({ id: `e-${condId}-${recId}`, source: condId, target: recId })
  })
}

buildBranches('q1', X_L, 'l', leftBranches, 'indigo')
buildBranches('q2', X_R, 'r', rightBranches, 'emerald')
</script>

<template>
  <ClientOnly>
    <Canvas flow-id="tech-selection-tree" :nodes="nodes" :edges="edges" height="620px" :default-zoom="0.8" :min-zoom="0.2" />
  </ClientOnly>
</template>
