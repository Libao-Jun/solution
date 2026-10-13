<script setup lang="ts">
/**
 * 前端打包构建工具「流程 / 依赖 / 生态 / 选型」四张图 —— @vue-flow/core 画布。
 * 由同目录 BuildToolsFlow.vue 在浏览器端动态加载（@vue-flow/core 依赖 d3-zoom，需要 DOM，不参与 SSR 构建）。
 *
 * ★ 替换范围（engineering/build-tools/index.md），只换渲染与布局、不改语义：
 *   - 1.2 构建流程核心阶段：原 ```mermaid flowchart TD（源码 → 六阶段流水线）→ variant="pipeline"
 *   - 1.3 入口 / 出口 / 依赖图：原 ```mermaid graph LR（main.ts 出发的依赖图）→ variant="deps"
 *   - 1.6 构建工具生态定位：原 ```mermaid flowchart TD（含「应用开发层 / 库底层层」两个 subgraph）→ variant="ecosystem"
 *   - 11.1 选型决策树：原纯文本树 → variant="decision"
 *
 * ★ 布局策略：
 *   - 树状图（pipeline / deps / decision）走 buildTree()：块尺寸自底向上累加（块宽 = 子块之和 + 间距，
 *     并保证不小于自身尺寸），交叉轴按子树块顺序依次排开，父节点在交叉轴居中于自己的子节点块——
 *     这样同层节点天然不重叠，父子对齐，节点坐标可精确算出，不依赖 DOM 测量。
 *   - 生态关系图（ecosystem）含两个分组容器与一条「向上」的跨层连线（Rolldown → Vite），
 *     语义层级与连线方向相反，故显式给出坐标（分层 + 组内水平排列），不套树算法。
 */
import { Handle, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { useData } from 'vitepress'

/* ------------------------------------------------------------------ *
 * §1 版式常量
 * ------------------------------------------------------------------ */
/** 树布局：同一层（交叉轴）相邻子树块的间距 */
const CROSS_GAP = 26
/**
 * 树布局：层与层之间（主轴）的间距。
 * 纵向（td）排列的节点本身较窄、层高固定，间距小一点才不会把整图拉得过高；
 * 横向（lr）排列的节点很宽，间距需要更从容，连线才有舒展感。
 */
const LAYER_GAP: Record<'td' | 'lr', number> = { td: 34, lr: 44 }
/** 只读示意图的缩放边界：过小则字看不清，宁可让用户拖拽查看 */
const MIN_ZOOM = 0.55
const MAX_ZOOM = 1.25
const FIT_VIEW_PARAMS = { padding: 0.06, minZoom: MIN_ZOOM }

type Variant = 'pipeline' | 'deps' | 'ecosystem' | 'decision'
type Direction = 'td' | 'lr'
/** 语义色：节点只声明色相，明暗两套色值由 <style> 里的 hsl() 统一推导 */
type Tone = 'brand' | 'indigo' | 'sky' | 'emerald' | 'amber' | 'slate'

const props = defineProps<{ variant: Variant }>()

/* ------------------------------------------------------------------ *
 * §2 树状图布局（pipeline / deps / decision 共用）
 * ------------------------------------------------------------------ */
type TreeItem = {
  id: string
  /** 主标题（第一行） */
  title: string
  /** 补充说明（第二行） */
  desc?: string
  tone?: Tone
  width?: number
  height?: number
  children?: TreeItem[]
}

type Slot = { block: number; cross: number; main: number }

const sizeOf = (item: TreeItem) => ({ w: item.width ?? 180, h: item.height ?? 56 })

function buildTree(root: TreeItem, direction: Direction): { nodes: Node[]; edges: Edge[] } {
  const slots = new Map<string, Slot>()
  const crossSize = (item: TreeItem) => {
    const { w, h } = sizeOf(item)
    return direction === 'td' ? w : h
  }
  const mainSize = (item: TreeItem) => {
    const { w, h } = sizeOf(item)
    return direction === 'td' ? h : w
  }

  // ① 自底向上量块：块尺寸 = max(自身交叉轴尺寸, 子块之和 + 间距)
  const measure = (item: TreeItem): number => {
    const kids = item.children ?? []
    let block = crossSize(item)
    if (kids.length) {
      const span = kids.reduce((sum, kid) => sum + measure(kid), 0) + CROSS_GAP * (kids.length - 1)
      block = Math.max(block, span)
    }
    slots.set(item.id, { block, cross: 0, main: 0 })
    return block
  }
  measure(root)

  // ② 每层的主轴尺寸 → 层起点（每一层都按该层最高/最宽的节点让位）
  const depthMax: number[] = []
  const collectDepth = (item: TreeItem, depth: number) => {
    depthMax[depth] = Math.max(depthMax[depth] ?? 0, mainSize(item))
    ;(item.children ?? []).forEach((kid) => collectDepth(kid, depth + 1))
  }
  collectDepth(root, 0)

  const layerStart: number[] = []
  let cursorMain = 0
  depthMax.forEach((size, depth) => {
    layerStart[depth] = cursorMain
    cursorMain += size + LAYER_GAP[direction]
  })

  // ③ 自顶向下铺：子树块依次排开，父节点在交叉轴取首末子节点中心的中点（= 居中于子块）
  const place = (item: TreeItem, start: number, depth: number) => {
    const slot = slots.get(item.id)!
    const kids = item.children ?? []
    let cross: number
    if (!kids.length) {
      cross = start + slot.block / 2
    } else {
      const span =
        kids.reduce((sum, kid) => sum + slots.get(kid.id)!.block, 0) + CROSS_GAP * (kids.length - 1)
      let cursor = start + (slot.block - span) / 2
      const centers: number[] = []
      kids.forEach((kid) => {
        place(kid, cursor, depth + 1)
        centers.push(slots.get(kid.id)!.cross)
        cursor += slots.get(kid.id)!.block + CROSS_GAP
      })
      cross = (centers[0] + centers[centers.length - 1]) / 2
    }
    slot.cross = cross
    slot.main = layerStart[depth] + (depthMax[depth] - mainSize(item)) / 2
  }
  place(root, 0, 0)

  // ④ 生成节点与连线（TD：source 在下、target 在上；LR：source 在右、target 在左）
  const nodes: Node[] = []
  const edges: Edge[] = []
  const sourceHandle = direction === 'td' ? 's-b' : 's-r'
  const targetHandle = direction === 'td' ? 't-t' : 't-l'

  const emit = (item: TreeItem) => {
    const slot = slots.get(item.id)!
    const { w, h } = sizeOf(item)
    nodes.push({
      id: item.id,
      type: 'bt',
      position:
        direction === 'td'
          ? { x: slot.cross - w / 2, y: slot.main }
          : { x: slot.main, y: slot.cross - h / 2 },
      data: { title: item.title, desc: item.desc, tone: item.tone ?? 'slate', width: w, height: h },
      draggable: false,
      connectable: false,
      selectable: false,
    })
    ;(item.children ?? []).forEach((kid) => {
      edges.push({
        id: `e-${item.id}-${kid.id}`,
        source: item.id,
        target: kid.id,
        sourceHandle,
        targetHandle,
        type: 'smoothstep',
        selectable: false,
        updatable: false,
        class: 'bt-edge',
      })
      emit(kid)
    })
  }
  emit(root)

  return { nodes, edges }
}

/* ------------------------------------------------------------------ *
 * §3 图内容（唯一真相源：文案与原文逐条对应，增删节点只改这里）
 * ------------------------------------------------------------------ */

/** 1.2 构建流程核心阶段：源码 → 六阶段流水线（原 mermaid flowchart TD） */
const PIPELINE: TreeItem = {
  id: 'src',
  title: '源码',
  desc: 'TS / JSX / Vue / Sass / …',
  tone: 'brand',
  width: 420,
  height: 56,
  children: [
    {
      id: 'resolve',
      title: '① 解析 Resolve',
      desc: '找到 import 指向哪个文件',
      tone: 'indigo',
      width: 420,
      height: 56,
      children: [
        {
          id: 'load',
          title: '② 加载 Load',
          desc: '读取文件原始内容',
          tone: 'indigo',
          width: 420,
          height: 56,
          children: [
            {
              id: 'transform',
              title: '③ 转换 Transform',
              desc: '编译 / 转译（babel / esbuild / sass）',
              tone: 'indigo',
              width: 420,
              height: 56,
              children: [
                {
                  id: 'bundle',
                  title: '④ 打包 Bundle',
                  desc: '按依赖图拼接成 chunk',
                  tone: 'indigo',
                  width: 420,
                  height: 56,
                  children: [
                    {
                      id: 'optimize',
                      title: '⑤ 优化 Optimize',
                      desc: 'Tree Shaking / 压缩 / 分包 / 内联',
                      tone: 'indigo',
                      width: 420,
                      height: 56,
                      children: [
                        {
                          id: 'emit',
                          title: '⑥ 输出 Emit',
                          desc: '写入 dist：js / css / 图片 / html',
                          tone: 'emerald',
                          width: 420,
                          height: 56,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

/** 1.3 入口 / 出口 / 依赖图（原 mermaid graph LR） */
const DEPS: TreeItem = {
  id: 'main',
  title: 'main.ts',
  desc: '入口 Entry',
  tone: 'brand',
  width: 148,
  height: 52,
  children: [
    {
      id: 'utils',
      title: 'utils.ts',
      desc: '工具模块',
      tone: 'sky',
      width: 148,
      height: 52,
      children: [
        { id: 'lib', title: 'lib.js', desc: '第三方库', tone: 'slate', width: 148, height: 52 },
      ],
    },
    {
      id: 'app',
      title: 'App.tsx',
      desc: '根组件',
      tone: 'sky',
      width: 148,
      height: 52,
      children: [
        { id: 'button', title: 'Button.tsx', desc: '子组件', tone: 'slate', width: 148, height: 52 },
        { id: 'store', title: 'store.ts', desc: '状态模块', tone: 'slate', width: 148, height: 52 },
      ],
    },
  ],
}

/** 11.1 选型决策树（原纯文本树，仅拆成「问题 → 结果」两级，文案保持原样） */
const DECISION: TreeItem = {
  id: 'q-root',
  title: '你要在做什么？',
  desc: '按目标选工具',
  tone: 'brand',
  width: 200,
  height: 56,
  children: [
    {
      id: 'q-app',
      title: '开发一个 Web 应用？',
      desc: 'Vue / React',
      tone: 'indigo',
      width: 224,
      height: 56,
      children: [
        {
          id: 'r-vite',
          title: '直接用 Vite',
          desc: '新项目 · 推荐，省心又快',
          tone: 'emerald',
          width: 240,
          height: 56,
        },
        {
          id: 'r-rspack',
          title: 'Rspack',
          desc: '已有 Webpack 大型项目想提速',
          tone: 'emerald',
          width: 250,
          height: 56,
        },
      ],
    },
    {
      id: 'q-next',
      title: '做一个 Next.js 项目？',
      tone: 'indigo',
      width: 224,
      height: 56,
      children: [
        {
          id: 'r-turbo',
          title: '直接用 Turbopack',
          desc: 'next dev --turbo（默认）',
          tone: 'emerald',
          width: 240,
          height: 56,
        },
      ],
    },
    {
      id: 'q-lib',
      title: '发布一个 npm 库 / 组件库？',
      tone: 'indigo',
      width: 224,
      height: 56,
      children: [
        {
          id: 'r-tsup',
          title: 'tsup / unbuild',
          desc: '想要极简 · 一行命令',
          tone: 'emerald',
          width: 240,
          height: 56,
        },
        {
          id: 'r-rollup',
          title: 'Rollup',
          desc: '想要完全控制',
          tone: 'emerald',
          width: 240,
          height: 56,
        },
      ],
    },
    {
      id: 'q-small',
      title: '做小项目 / 原型 / 快速验证？',
      tone: 'indigo',
      width: 224,
      height: 56,
      children: [
        {
          id: 'r-parcel',
          title: 'Parcel 或 Vite',
          desc: '零配置，开箱即用',
          tone: 'emerald',
          width: 240,
          height: 56,
        },
      ],
    },
    {
      id: 'q-ie',
      title: '必须兼容 IE11 / 老系统？',
      tone: 'indigo',
      width: 224,
      height: 56,
      children: [
        {
          id: 'r-webpack',
          title: 'Webpack + Babel',
          desc: '配置最全',
          tone: 'emerald',
          width: 240,
          height: 56,
        },
      ],
    },
  ],
}

/* ------------------------------------------------------------------ *
 * §4 生态关系图（1.6）：两个分组容器 + 一条向上的跨层连线，故显式给坐标
 * ------------------------------------------------------------------ */
type BandDef = { id: string; title: string; x: number; y: number; w: number; h: number }
type CardDef = {
  id: string
  title: string
  desc?: string
  tone: Tone
  x: number
  y: number
  w: number
  h: number
}

const ECO_CARD_W = 196
const ECO_CARD_H = 64
const ECO_GAP = 14
const ECO_PAD = 24

const ECO_BANDS: BandDef[] = [
  { id: 'band-app', title: '应用开发层', x: 0, y: 0, w: ECO_PAD * 2 + ECO_CARD_W * 3 + ECO_GAP * 2, h: 136 },
  {
    id: 'band-lib',
    title: '库 / 底层层',
    x: 0,
    y: 180,
    w: ECO_PAD * 2 + ECO_CARD_W * 3 + ECO_GAP * 2,
    h: 136,
  },
]

const ECO_CARDS: CardDef[] = [
  { id: 'webpack', title: 'Webpack', desc: 'JS / 全能', tone: 'sky', x: ECO_PAD, y: 52, w: ECO_CARD_W, h: ECO_CARD_H },
  {
    id: 'vite',
    title: 'Vite',
    desc: 'esbuild + Rollup',
    tone: 'brand',
    x: ECO_PAD + ECO_CARD_W + ECO_GAP,
    y: 52,
    w: ECO_CARD_W,
    h: ECO_CARD_H,
  },
  {
    id: 'next',
    title: 'Next.js',
    desc: '→ Turbopack',
    tone: 'sky',
    x: ECO_PAD + (ECO_CARD_W + ECO_GAP) * 2,
    y: 52,
    w: ECO_CARD_W,
    h: ECO_CARD_H,
  },
  {
    id: 'rollup',
    title: 'Rollup',
    desc: '纯净 ESM',
    tone: 'indigo',
    x: ECO_PAD,
    y: 232,
    w: ECO_CARD_W,
    h: ECO_CARD_H,
  },
  {
    id: 'esbuild',
    title: 'esbuild',
    desc: '极快引擎',
    tone: 'indigo',
    x: ECO_PAD + ECO_CARD_W + ECO_GAP,
    y: 232,
    w: ECO_CARD_W,
    h: ECO_CARD_H,
  },
  {
    id: 'roldown',
    title: 'Rolldown',
    desc: 'Rust / Vite 未来内核',
    tone: 'indigo',
    x: ECO_PAD + (ECO_CARD_W + ECO_GAP) * 2,
    y: 232,
    w: ECO_CARD_W,
    h: ECO_CARD_H,
  },
  {
    id: 'rspack',
    title: 'Rspack',
    desc: 'Webpack 配置的 Rust 提速版',
    tone: 'slate',
    x: ECO_PAD + ECO_CARD_W + ECO_GAP,
    y: 356,
    w: ECO_CARD_W,
    h: ECO_CARD_H,
  },
]

/** 边：Vite 底层用 Rollup 与 esbuild；Rolldown 是 Vite 的未来内核（视觉上向上） */
const ECO_EDGES: { id: string; source: string; target: string; sourceHandle: string; targetHandle: string }[] = [
  { id: 'e-vite-rollup', source: 'vite', target: 'rollup', sourceHandle: 's-b', targetHandle: 't-t' },
  { id: 'e-vite-esbuild', source: 'vite', target: 'esbuild', sourceHandle: 's-b', targetHandle: 't-t' },
  { id: 'e-roldown-vite', source: 'roldown', target: 'vite', sourceHandle: 's-t', targetHandle: 't-b' },
]

function buildEcosystem(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []

  // 分组容器先入数组 = 渲染在最底层，仅作视觉分区
  ECO_BANDS.forEach((band) => {
    nodes.push({
      id: band.id,
      type: 'band',
      position: { x: band.x, y: band.y },
      data: { title: band.title, width: band.w, height: band.h },
      draggable: false,
      connectable: false,
      selectable: false,
    })
  })

  ECO_CARDS.forEach((card) => {
    nodes.push({
      id: card.id,
      type: 'bt',
      position: { x: card.x, y: card.y },
      data: {
        title: card.title,
        desc: card.desc,
        tone: card.tone,
        width: card.w,
        height: card.h,
      },
      draggable: false,
      connectable: false,
      selectable: false,
    })
  })

  const edges: Edge[] = ECO_EDGES.map((edge) => ({
    ...edge,
    type: 'smoothstep',
    selectable: false,
    updatable: false,
    class: 'bt-edge',
  }))

  return { nodes, edges }
}

/* ------------------------------------------------------------------ *
 * §5 建图与视图控制
 * ------------------------------------------------------------------ */
function build() {
  switch (props.variant) {
    case 'deps':
      return buildTree(DEPS, 'lr')
    case 'decision':
      return buildTree(DECISION, 'lr')
    case 'ecosystem':
      return buildEcosystem()
    default:
      return buildTree(PIPELINE, 'td')
  }
}

// 图是静态的：只在初始化时算一次
const { nodes, edges } = build()

const FLOW_ID = `build-tools-flow-${props.variant}`
const { zoomIn, zoomOut, fitView } = useVueFlow(FLOW_ID)
const fitAll = () => fitView({ ...FIT_VIEW_PARAMS })

defineExpose({ zoomIn, zoomOut, fitView: fitAll })

const { isDark } = useData()
</script>

<template>
  <div class="bt-canvas" :class="{ 'is-dark': isDark }">
    <VueFlow
      :id="FLOW_ID"
      :nodes="nodes"
      :edges="edges"
      :fit-view-on-init="true"
      :fit-view-params="FIT_VIEW_PARAMS"
      :min-zoom="MIN_ZOOM"
      :max-zoom="MAX_ZOOM"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :edges-updatable="false"
      :zoom-on-double-click="false"
      :zoom-on-scroll="false"
      :pan-on-scroll="false"
      :prevent-scrolling="false"
      :auto-pan-on-node-drag="false"
    >
      <template #node-bt="{ data }">
        <div
          class="bt-node"
          :class="`bt-tone--${data.tone}`"
          :style="{ width: `${data.width}px`, height: `${data.height}px` }"
        >
          <!-- 四个方向各一对句柄：给连线定位用，本身不可见（生态图存在「向上」的连线） -->
          <Handle id="s-t" class="bt-handle" type="source" :position="Position.Top" />
          <Handle id="t-t" class="bt-handle" type="target" :position="Position.Top" />
          <Handle id="s-b" class="bt-handle" type="source" :position="Position.Bottom" />
          <Handle id="t-b" class="bt-handle" type="target" :position="Position.Bottom" />
          <Handle id="s-l" class="bt-handle" type="source" :position="Position.Left" />
          <Handle id="t-l" class="bt-handle" type="target" :position="Position.Left" />
          <Handle id="s-r" class="bt-handle" type="source" :position="Position.Right" />
          <Handle id="t-r" class="bt-handle" type="target" :position="Position.Right" />
          <span class="bt-node__title">{{ data.title }}</span>
          <span v-if="data.desc" class="bt-node__desc">{{ data.desc }}</span>
        </div>
      </template>

      <template #node-band="{ data }">
        <div
          class="bt-band"
          :style="{ width: `${data.width}px`, height: `${data.height}px` }"
        >
          <span class="bt-band__label">{{ data.title }}</span>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.bt-canvas {
  /* 语义色相兜底：节点各自带 .bt-tone--* 覆盖它 */
  --bt-hue: 220;
  width: 100%;
  height: 100%;
}

.bt-canvas :deep(.vue-flow) {
  background: transparent;
}

/* 只读示意图：只保留平移手势 */
.bt-canvas :deep(.vue-flow__pane) {
  cursor: grab;
}

.bt-canvas :deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.bt-canvas :deep(.vue-flow__edge) {
  pointer-events: none;
}

/* ---- 语义色：只声明色相，其余色值由此推导 ---- */
.bt-canvas :deep(.bt-tone--indigo) {
  --bt-hue: 250;
}

.bt-canvas :deep(.bt-tone--sky) {
  --bt-hue: 214;
}

.bt-canvas :deep(.bt-tone--emerald) {
  --bt-hue: 160;
}

.bt-canvas :deep(.bt-tone--amber) {
  --bt-hue: 32;
}

.bt-canvas :deep(.bt-tone--slate) {
  --bt-hue: 220;
}

/* ---- 普通节点 ---- */
.bt-canvas :deep(.bt-node) {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 12px;
  border: 1px solid hsl(var(--bt-hue) 58% 74%);
  border-radius: 10px;
  background: hsl(var(--bt-hue) 80% 96%);
  color: hsl(var(--bt-hue) 58% 30%);
  text-align: center;
  overflow: hidden;
}

.bt-canvas :deep(.bt-node__title) {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
}

.bt-canvas :deep(.bt-node__desc) {
  font-size: 11.5px;
  font-weight: 400;
  line-height: 1.3;
  opacity: 0.78;
}

/* 品牌色实心节点：整个图里的视觉锚点（起点 / 主干） */
.bt-canvas :deep(.bt-tone--brand) {
  border-color: transparent;
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
  color: #fff;
  box-shadow: 0 10px 24px -14px rgba(79, 48, 232, 0.75);
}

/* ---- 分组容器（生态关系图的两个分层） ---- */
/* 纯视觉分区：禁用指针事件，避免整块区域挡住画布拖拽平移 */
.bt-canvas :deep(.bt-band) {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  opacity: 0.55;
  pointer-events: none;
}

.bt-canvas :deep(.bt-band__label) {
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* 句柄只用于给连线定位，本身不可见 */
.bt-canvas :deep(.bt-handle) {
  width: 2px;
  height: 2px;
  min-width: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}

/* ---- 连线 ---- */
.bt-canvas :deep(.bt-edge .vue-flow__edge-path) {
  stroke: hsl(var(--bt-hue, 220) 46% 58%);
  stroke-width: 1.6;
  stroke-linecap: round;
}

/* ---- 深色模式 ---- */
.bt-canvas.is-dark :deep(.bt-node) {
  border-color: hsl(var(--bt-hue) 46% 42%);
  background: hsl(var(--bt-hue) 36% 19%);
  color: hsl(var(--bt-hue) 72% 84%);
}

.bt-canvas.is-dark :deep(.bt-tone--brand) {
  border-color: transparent;
  background: linear-gradient(135deg, #5a3cf0 0%, #897bff 100%);
  color: #fff;
}

.bt-canvas.is-dark :deep(.bt-band) {
  background: transparent;
  border-color: hsl(220 24% 32%);
}
</style>
