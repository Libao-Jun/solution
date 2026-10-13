<script setup lang="ts">
/**
 * 6.3 HTML Entry 加载流程 —— @vue-flow/core 重构。
 * 内容与 engineering/micro-frontend 6.3 节原 ```mermaid flowchart TD 逐条对应，只换渲染方式、不改语义：
 *
 *   路由命中 activeRule → 1. 请求子应用 index.html（HTML Entry）
 *     → 2. import-html-entry 解析 script / style / 外链资源
 *     → 3. 调用 bootstrap()（首次加载，仅一次）
 *     → 4. 调用 mount(props)（JS 进沙箱执行 · 模板注入容器）
 *     → 5. 子应用渲染完成 → 通知主应用
 *     → 路由离开 → 6. 调用 unmount()（清理实例 · 移除样式 · 还原 window）
 *
 * 构图：左侧一条纵向主链（命中路由 → 加载 → 渲染完成），右上一条卸载分支（路由离开 → unmount）。
 * 原 mermaid 里这两条链是断裂的（第 5 步之后没有去向），此处补一条「后续」连线把主链末步接回
 * 卸载分支，构成完整生命周期：第 5 步从右侧出线 → 沿「主链 / 分支」两列之间的竖直通道上行
 * → 由路由离开左侧入线。
 * 主链用 indigo、卸载分支用 rose，区分「进入加载」与「离开清理」。
 * 坐标口径：x / y 为节点左上角，主链自上而下逐行，分支与主链首行对齐后向下一步；
 * 节点宽高固定、显式给出，不依赖 DOM 测量（与 IOSReleaseFlow / FullDevWorkflow 同一范式）。
 */
import { defineAsyncComponent } from 'vue'
import type { AppFlowNode, AppFlowEdge } from './AppFlowchartCanvas.vue'

const Canvas = defineAsyncComponent(() => import('./AppFlowchartCanvas.vue'))

const W = 230
const H = 64
const GAP = 32
/** 单行步距（节点高 + 行间距） */
const PITCH = H + GAP
/** 卸载分支相对主链的横向偏移；两列之间留出竖直通道，供「主链末步 → 卸载分支」的回路连线走线 */
const BRANCH_X = 380

const nodes: AppFlowNode[] = [
  // 主链：命中路由 → 依次加载 → 渲染完成
  { id: 'hit', position: { x: 0, y: 0 }, data: { label: '路由命中<br>activeRule', width: W, height: H, tone: 'indigo', io: 'tb' } },
  { id: 's1', position: { x: 0, y: PITCH }, data: { label: '1. 请求子应用 index.html<br>（HTML Entry）', width: W, height: H, tone: 'indigo', io: 'tb' } },
  { id: 's2', position: { x: 0, y: PITCH * 2 }, data: { label: '2. import-html-entry 解析<br>script / style / 外链资源', width: W, height: H, tone: 'indigo', io: 'tb' } },
  { id: 's3', position: { x: 0, y: PITCH * 3 }, data: { label: '3. 调用 bootstrap()<br>（首次加载，仅一次）', width: W, height: H, tone: 'indigo', io: 'tb' } },
  { id: 's4', position: { x: 0, y: PITCH * 4 }, data: { label: '4. 调用 mount(props)<br>JS 进沙箱执行 · 模板注入容器', width: W, height: H, tone: 'indigo', io: 'tb' } },
  // 末步要向右接回卸载分支，出线口改到右侧（上进右出）
  { id: 's5', position: { x: 0, y: PITCH * 5 }, data: { label: '5. 子应用渲染完成<br>→ 通知主应用', width: W, height: H, tone: 'indigo', io: 'tb', sourcePos: 'right' } },

  // 卸载分支：路由离开 → unmount 清理
  // 路由离开的入线口改到左侧，接收来自主链末步的回路连线
  { id: 'leave', position: { x: BRANCH_X, y: 0 }, data: { label: '路由离开', width: W, height: H, tone: 'rose', io: 'tb', targetPos: 'left' } },
  { id: 's6', position: { x: BRANCH_X, y: PITCH }, data: { label: '6. 调用 unmount()<br>清理实例 · 移除样式 · 还原 window', width: W, height: H, tone: 'rose', io: 'tb' } },
]

const edges: AppFlowEdge[] = [
  { id: 'e-hit-s1', source: 'hit', target: 's1' },
  { id: 'e-s1-s2', source: 's1', target: 's2' },
  { id: 'e-s2-s3', source: 's2', target: 's3' },
  { id: 'e-s3-s4', source: 's3', target: 's4' },
  { id: 'e-s4-s5', source: 's4', target: 's5' },
  // 主链末步 → 卸载分支：补上「第 5 步后续内容」与第 5 步之间的关系连线
  { id: 'e-s5-leave', source: 's5', target: 'leave' },
  { id: 'e-leave-s6', source: 'leave', target: 's6' },
]
</script>

<template>
  <ClientOnly>
    <Canvas
      flow-id="micro-frontend-html-entry-flow"
      :nodes="nodes"
      :edges="edges"
      height="560px"
      :default-zoom="0.9"
      :min-zoom="0.25"
    />
  </ClientOnly>
</template>
