<script setup lang="ts">
/**
 * front-end-performance 正文两张图 —— @vue-flow/core 重构（variant 切换）。
 * 内容与原文逐条对应，只换渲染方式、不改语义：
 *
 * - variant="loading"（1.3 加载流程视角）：原 ```text 的三行箭头链
 *   DNS 解析 → TCP/TLS 握手 → 发送请求 → 服务端处理 → 响应传输
 *   → HTML 解析(DOM) → CSSOM 构建 → 渲染树 → 布局(Layout) → 绘制(Paint) → 合成(Composite)
 *   → 脚本执行 → 可交互 → 持续运行(动画/滚动/交互响应)
 *   共 14 步：改为三行「蛇形」排布（第一行自左向右、第二行折返、第三行再自左向右），
 *   按正文紧接的三段（网络 / 解析与首次渲染 / 运行时）着色，节点带序号 1–14 保证阅读顺序无歧义。
 *
 * - variant="cache"（3.3 完整判定流程）：原 ```text 的判定分支图
 *   发起请求 → 本地有副本且未过期？是则直接用本地副本 200 (from cache)；
 *   否则带条件头发请求 → 服务器校验 → 指纹一致则 304 读本地，不一致则 200 + 新资源。
 *   改为自上而下的判定图：判断节点菱形、流程节点与结果节点分色，分支条件写在连线上。
 *
 * 坐标一律显式给出（不依赖 DOM 测量）。
 */
import { computed } from 'vue'
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode, FlowSide, FlowTone } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

type Variant = 'loading' | 'cache'

const props = withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'loading' })

/* ------------------------------------------------------------------ *
 * §1 加载流程（1.3）：三行蛇形
 * ------------------------------------------------------------------ */
const NODE_W = 120
const NODE_H = 56
/**
 * 列距 = 节点宽 + 40：既保证相邻节点之间的连线有可见长度，
 * 又满足内置 smoothstep 连线 offset（两侧各 20px）的取点要求。
 */
const COL_PITCH = 160
const ROW_PITCH = 120
/** 每行节点数：5 / 5 / 4（合起来 14 步） */
const ROW_SIZES = [5, 5, 4]
/** 行内最大列序号（最多 5 个节点，折返行从 4 往回排） */
const MAX_COL = 4

type LoadingStep = { label: string; tone: FlowTone; width?: number }

/** 14 步按正文顺序排列，tone 即正文紧随的三段：网络 / 解析与首次渲染 / 运行时 */
const LOADING_STEPS: LoadingStep[] = [
  { label: '1. DNS 解析', tone: 'sky' },
  { label: '2. TCP/TLS 握手', tone: 'sky' },
  { label: '3. 发送请求', tone: 'sky' },
  { label: '4. 服务端处理', tone: 'sky' },
  { label: '5. 响应传输', tone: 'sky' },
  { label: '6. HTML 解析<br>（DOM）', tone: 'indigo' },
  { label: '7. CSSOM 构建', tone: 'indigo' },
  { label: '8. 渲染树', tone: 'indigo' },
  { label: '9. 布局<br>（Layout）', tone: 'indigo' },
  { label: '10. 绘制<br>（Paint）', tone: 'indigo' },
  { label: '11. 合成<br>（Composite）', tone: 'indigo' },
  { label: '12. 脚本执行', tone: 'emerald' },
  { label: '13. 可交互', tone: 'emerald' },
  { label: '14. 持续运行<br>（动画 / 滚动 / 交互响应）', tone: 'emerald', width: 240 },
]

function buildLoading(): { nodes: DocFlowNode[]; edges: DocFlowEdge[] } {
  const nodes: DocFlowNode[] = []
  const edges: DocFlowEdge[] = []
  const order: string[] = []

  let cursor = 0
  ROW_SIZES.forEach((size, r) => {
    // 偶数行自左向右（dir = 1），奇数行折返（dir = -1，从最右列往回排）
    const dir = r % 2 === 0 ? 1 : -1
    const steps = LOADING_STEPS.slice(cursor, cursor + size)
    cursor += size

    steps.forEach((step, i) => {
      const isFirst = i === 0
      const isLast = i === steps.length - 1
      const col = dir === 1 ? i : MAX_COL - i
      // 每行首节点从上方入线、末节点向下出线（衔接下一行首节点）
      const targetPos: FlowSide = isFirst ? 'top' : dir === 1 ? 'left' : 'right'
      const sourcePos: FlowSide = isLast ? 'bottom' : dir === 1 ? 'right' : 'left'
      const id = `lp-${r}-${i}`

      order.push(id)
      nodes.push({
        id,
        x: col * COL_PITCH,
        y: r * ROW_PITCH,
        data: {
          label: `<span class="t">${step.label}</span>`,
          width: step.width ?? NODE_W,
          height: NODE_H,
          shape: 'card',
          tone: step.tone,
          targetPos,
          sourcePos,
        },
      })
    })
  })

  for (let i = 0; i < order.length - 1; i++) {
    edges.push({ source: order[i], target: order[i + 1] })
  }

  return { nodes, edges }
}

/* ------------------------------------------------------------------ *
 * §2 缓存判定流程（3.3）：自上而下的判定图
 * ------------------------------------------------------------------ */
const cacheNodes: DocFlowNode[] = [
  {
    id: 'start',
    x: -85,
    y: 0,
    data: { label: '发起请求', width: 170, height: 48, shape: 'start', tone: 'brand', targetPos: 'top', sourcePos: 'bottom' },
  },
  {
    id: 'q-expired',
    x: -150,
    y: 68,
    data: {
      label: '本地有副本且<br>Cache-Control / Expires<br>未过期？',
      width: 300,
      height: 112,
      shape: 'decision',
      tone: 'indigo',
      targetPos: 'top',
      sourcePos: 'bottom',
    },
  },
  {
    id: 'hit',
    x: -340,
    y: 220,
    data: {
      label: '<span class="t">直接用本地副本</span><span class="d">200 (from cache)，完全不发请求 ✅</span>',
      width: 240,
      height: 68,
      shape: 'result',
      tone: 'emerald',
      targetPos: 'top',
    },
  },
  {
    id: 'request',
    x: 80,
    y: 220,
    data: {
      label:
        '<span class="t">携带条件头发请求</span>' +
        '<span class="d">If-None-Match(ETag) /<br>If-Modified-Since(Last-Modified)</span>',
      width: 250,
      height: 76,
      shape: 'process',
      tone: 'sky',
      targetPos: 'top',
      sourcePos: 'bottom',
    },
  },
  {
    id: 'verify',
    x: 80,
    y: 336,
    data: {
      label: '<span class="t">服务器校验</span><span class="d">ETag 优先；ETag 存在时忽略 Last-Modified</span>',
      width: 250,
      height: 68,
      shape: 'process',
      tone: 'sky',
      targetPos: 'top',
      sourcePos: 'bottom',
    },
  },
  {
    id: 'not-modified',
    x: -47,
    y: 444,
    data: {
      label: '<span class="t">304 Not Modified</span><span class="d">（无 body），浏览器读本地 ✅</span>',
      width: 235,
      height: 68,
      shape: 'result',
      tone: 'emerald',
      targetPos: 'top',
    },
  },
  {
    id: 'changed',
    x: 233,
    y: 444,
    data: {
      label: '<span class="t">200 + 新资源</span><span class="d">浏览器更新本地缓存</span>',
      width: 235,
      height: 68,
      shape: 'result',
      tone: 'emerald',
      targetPos: 'top',
    },
  },
]

const cacheEdges: DocFlowEdge[] = [
  { source: 'start', target: 'q-expired' },
  { source: 'q-expired', target: 'hit', label: '是' },
  { source: 'q-expired', target: 'request', label: '否' },
  { source: 'request', target: 'verify' },
  { source: 'verify', target: 'not-modified', label: '指纹一致' },
  { source: 'verify', target: 'changed', label: '不一致' },
]

/* ------------------------------------------------------------------ *
 * §3 每个 variant 的画布高度、图例、无障碍描述与操作提示
 * ------------------------------------------------------------------ */
const META: Record<Variant, { height: number; legend: FlowLegendItem[]; sr: string; hint: string }> = {
  loading: {
    height: 380,
    legend: [
      { shape: 'rect', tone: 'sky', text: '前半段 · 网络' },
      { shape: 'rect', tone: 'indigo', text: '中段 · 解析与首次渲染' },
      { shape: 'rect', tone: 'emerald', text: '后段 · 运行时' },
    ],
    sr:
      '加载流程十四步：1 DNS 解析 → 2 TCP/TLS 握手 → 3 发送请求 → 4 服务端处理 → 5 响应传输（以上为网络段）；' +
      '6 HTML 解析（DOM）→ 7 CSSOM 构建 → 8 渲染树 → 9 布局（Layout）→ 10 绘制（Paint）→ 11 合成（Composite）（以上为解析与首次渲染段）；' +
      '12 脚本执行 → 13 可交互 → 14 持续运行（动画 / 滚动 / 交互响应）（以上为运行时段）。',
    hint: '三行蛇形排布：第一行自左向右，第二行折返（自右向左），第三行再自左向右，按节点序号 1–14 阅读；拖拽画布可平移，按钮可缩放',
  },
  cache: {
    height: 480,
    legend: [
      { shape: 'rect', tone: 'brand', text: '起点' },
      { shape: 'diamond', tone: 'indigo', text: '判断' },
      { shape: 'rect', tone: 'sky', text: '流程节点' },
      { shape: 'rect', tone: 'emerald', text: '结果' },
    ],
    sr:
      '缓存完整判定流程：发起请求 → 判断「本地有副本且 Cache-Control / Expires 未过期？」——' +
      '是，则直接用本地副本，返回 200 (from cache)，完全不发请求；' +
      '否，则携带 If-None-Match(ETag) / If-Modified-Since(Last-Modified) 发请求 → ' +
      '服务器校验（ETag 优先；ETag 存在时忽略 Last-Modified）→ ' +
      '指纹一致返回 304 Not Modified（无 body），浏览器读本地；不一致返回 200 + 新资源，浏览器更新本地缓存。',
    hint: '自上而下是主流程，连线上的文字即判定分支；拖拽画布可平移，按钮可缩放',
  },
}

const meta = computed(() => META[props.variant])
const flow = computed(() => (props.variant === 'cache' ? { nodes: cacheNodes, edges: cacheEdges } : buildLoading()))
</script>

<template>
  <DocFlow
    :flow-id="`frontend-performance-${variant}`"
    :nodes="flow.nodes"
    :edges="flow.edges"
    :legend="meta.legend"
    :sr-text="meta.sr"
    :hint="meta.hint"
    :height="meta.height"
    :min-zoom="0.4"
    :max-zoom="1.2"
  />
</template>
