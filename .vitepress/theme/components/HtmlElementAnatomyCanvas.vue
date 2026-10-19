<script setup lang="ts">
/**
 * 「元素、标签、属性、内容」拆解图 —— @vue-flow/core 画布。
 *
 * 为什么这样实现（不要回退成代码块里的 ASCII 箭头）：
 * 代码块用等宽字体，「中文宽 = 2 个西文字符」并不成立（Consolas 下 1 个汉字 ≈ 1.82 个字符宽），
 * 靠数空格摆出来的标签必然与箭头错位，且随字体 / 缩放漂移。
 * 这里改为：代码 token 由 DOM 自然排布 → 用 offsetLeft/offsetWidth 实测每个片段的真实区间 →
 * 把「区间括号」与「中文标签」作为 vue-flow 节点按实测坐标摆放 → 再连线。
 * 字体、字号、语言怎么变都不会歪。
 *
 * 本文件只被 HtmlElementAnatomy.vue 在浏览器端动态加载（@vue-flow/core 依赖 d3-zoom），不参与 SSR。
 */
import { Handle, MarkerType, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { useData } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

type TokenKind = 'punct' | 'tag' | 'attr' | 'str' | 'text'

interface Piece {
  text: string
  kind: TokenKind
}

interface Block {
  key: string
  /** 标注文案；为空表示该片段不标注（它仍会出现在代码行里） */
  label?: string
  pieces: Piece[]
  /** 片段之后的间隔（示意图里用空格拉开，给下方标签留位置） */
  gap: string
}

/** 与正文语义一一对应：标签名 / 属性名=属性值 / 其余属性 / 内容 / 结束标签 */
const BLOCKS: Block[] = [
  {
    key: 'open',
    label: '标签名',
    pieces: [
      { text: '<', kind: 'punct' },
      { text: 'a', kind: 'tag' },
    ],
    gap: '   ',
  },
  {
    key: 'href',
    label: '属性名=属性值（多个）',
    pieces: [
      { text: 'href', kind: 'attr' },
      { text: '=', kind: 'punct' },
      { text: '"https://example.com"', kind: 'str' },
    ],
    gap: ' ',
  },
  {
    key: 'attrs',
    label: '属性',
    pieces: [
      { text: 'target', kind: 'attr' },
      { text: '=', kind: 'punct' },
      { text: '"_blank"', kind: 'str' },
      { text: ' ', kind: 'punct' },
      { text: 'class', kind: 'attr' },
      { text: '=', kind: 'punct' },
      { text: '"link"', kind: 'str' },
    ],
    gap: '',
  },
  { key: 'gt', pieces: [{ text: '>', kind: 'punct' }], gap: '  ' },
  { key: 'content', label: '内容', pieces: [{ text: '示例', kind: 'text' }], gap: '    ' },
  {
    key: 'end',
    label: '结束标签',
    pieces: [
      { text: '</', kind: 'punct' },
      { text: 'a', kind: 'tag' },
      { text: '>', kind: 'punct' },
    ],
    gap: '',
  },
]

/** 画布坐标（px）：代码行在上，区间括号、中文标签依次向下 */
const SPAN_Y = 40
const TAG_Y = 74
/** 区间括号两端各缩进多少，避免相邻片段的括号粘成一条线 */
const SPAN_INSET = 4
/** 相邻标签的最小水平间距 */
const TAG_GAP = 8
/** 连线 / 箭头颜色（深浅两套背景都够看） */
const EDGE_COLOR = '#94a3b8'

const props = withDefaults(defineProps<{ flowId?: string }>(), { flowId: 'html-element-anatomy' })

const { isDark } = useData()
const { fitView, zoomIn, zoomOut } = useVueFlow(props.flowId)
// 不放大：代码字号与正文代码块保持一致（14px），只在放不下时等比缩小
const fitAll = () => fitView({ padding: 0.08, minZoom: 0.45, maxZoom: 1 })
defineExpose({ zoomIn, zoomOut, fitView: fitAll })

const rootRef = ref<HTMLElement | null>(null)
const codeRef = ref<HTMLElement | null>(null)

/** 代码片段 DOM（测区间）与标签 DOM（测宽度） */
const blockEls = new Map<string, HTMLElement>()
const tagEls = new Map<string, HTMLElement>()

const ready = ref(false)
const measures = ref<Record<string, { left: number; width: number }>>({})
const tagWidths = ref<Record<string, number>>({})

function setBlockEl(key: string, el: unknown) {
  if (el instanceof HTMLElement) blockEls.set(key, el)
  else blockEls.delete(key)
}

function setTagEl(key: string, el: unknown) {
  if (el instanceof HTMLElement) tagEls.set(key, el)
  else tagEls.delete(key)
}

/** 标签按「片段中心」居中对齐；放不下时向右让位（保证文字不重叠） */
const placed = computed(() => {
  const list = BLOCKS.filter((block) => block.label && measures.value[block.key]).map((block) => {
    const m = measures.value[block.key]
    return {
      key: block.key,
      text: block.label as string,
      center: m.left + m.width / 2,
      spanWidth: m.width,
      tagWidth: tagWidths.value[block.key] ?? 0,
    }
  })

  let prevRight = Number.NEGATIVE_INFINITY
  return list.map((item) => {
    let x = item.center - item.tagWidth / 2
    if (x < prevRight + TAG_GAP) x = prevRight + TAG_GAP
    const width = Math.max(4, item.spanWidth - SPAN_INSET * 2)
    prevRight = x + item.tagWidth
    return { ...item, x, spanLeft: item.center - width / 2, spanDrawWidth: width }
  })
})

const flowNodes = computed<Node[]>(() => {
  const nodes: Node[] = [
    {
      id: 'code',
      type: 'code',
      position: { x: 0, y: 0 },
      data: {},
      draggable: false,
      selectable: false,
      connectable: false,
    },
  ]

  for (const item of placed.value) {
    nodes.push({
      id: `span-${item.key}`,
      type: 'span',
      position: { x: item.spanLeft, y: SPAN_Y },
      data: { width: item.spanDrawWidth },
      draggable: false,
      selectable: false,
      connectable: false,
    })
    nodes.push({
      id: `tag-${item.key}`,
      type: 'tag',
      position: { x: item.x, y: TAG_Y },
      data: { key: item.key, text: item.text },
      draggable: false,
      selectable: false,
      connectable: false,
    })
  }

  return nodes
})

const flowEdges = computed<Edge[]>(() =>
  placed.value.map((item) => ({
    id: `edge-${item.key}`,
    source: `span-${item.key}`,
    target: `tag-${item.key}`,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 13, height: 13, color: EDGE_COLOR },
    style: { stroke: EDGE_COLOR, strokeWidth: 1.4 },
    selectable: false,
    updatable: false,
    focusable: false,
  })),
)

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/** 读取当前 DOM 的真实区间 / 标签宽度；返回是否发生变化 */
function applyMeasure(): boolean {
  if (!codeRef.value) return false

  const nextMeasures: Record<string, { left: number; width: number }> = {}
  for (const block of BLOCKS) {
    const el = blockEls.get(block.key)
    if (!el) continue
    nextMeasures[block.key] = { left: el.offsetLeft, width: el.offsetWidth }
  }
  if (!Object.keys(nextMeasures).length) return false

  const nextWidths: Record<string, number> = {}
  for (const [key, el] of tagEls) nextWidths[key] = el.offsetWidth

  let changed = false
  for (const [key, value] of Object.entries(nextMeasures)) {
    const prev = measures.value[key]
    if (!prev || prev.left !== value.left || prev.width !== value.width) changed = true
  }
  for (const [key, value] of Object.entries(nextWidths)) {
    if (tagWidths.value[key] !== value) changed = true
  }

  measures.value = nextMeasures
  tagWidths.value = nextWidths
  return changed
}

/**
 * 测量 → 布局是两段收敛：
 * 第 1 轮拿到代码片段的真实区间（此时标签节点还未渲染，宽度未知）；
 * 第 2 轮标签已渲染，补测宽度并重排位置。稳定后一次性显示并 fitView。
 */
async function measure() {
  for (let i = 0; i < 40; i += 1) {
    await nextTick()
    if (applyMeasure()) break
    await frame()
  }

  let stable = 0
  for (let i = 0; i < 12 && stable < 2; i += 1) {
    await nextTick()
    stable = applyMeasure() ? 0 : stable + 1
    await frame()
  }

  await nextTick()
  await fitAll()
  ready.value = true
}

onMounted(async () => {
  // 字体（含中文回退字体）就绪后再测，避免首次测到回退字体的宽度
  try {
    await document.fonts?.ready
  } catch {
    // 忽略：个别浏览器无 document.fonts
  }
  await nextTick()
  void measure()
  window.addEventListener('resize', onResize)
})

function onResize() {
  if (!ready.value) return
  void fitAll()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div ref="rootRef" class="anatomy-canvas" :class="{ 'is-dark': isDark, 'is-ready': ready }">
    <VueFlow
      :id="flowId"
      :nodes="flowNodes"
      :edges="flowEdges"
      :fit-view-on-init="false"
      :min-zoom="0.45"
      :max-zoom="1.4"
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
      <!-- 代码行：token 由 DOM 自然排布，宽度即真实宽度 -->
      <template #node-code>
        <div ref="codeRef" class="an-code">
          <template v-for="block in BLOCKS" :key="block.key">
            <span :ref="(el) => setBlockEl(block.key, el)" class="an-block">
              <span v-for="(piece, i) in block.pieces" :key="i" :class="`an-tk--${piece.kind}`">{{
                piece.text
              }}</span>
            </span>
            <span class="an-gap">{{ block.gap }}</span>
          </template>
        </div>
      </template>

      <!-- 片段区间：一条带端点竖线的细横线，宽度 = 实测片段宽 -->
      <template #node-span="{ data }">
        <div class="an-span" :style="{ width: `${data.width}px` }">
          <Handle type="source" :position="Position.Bottom" class="an-handle" />
        </div>
      </template>

      <!-- 中文标签：药丸样式，宽度由文字决定 -->
      <template #node-tag="{ id, data }">
        <div :ref="(el) => setTagEl(data.key, el)" class="an-tag">
          {{ data.text }}
          <Handle :id="`in-${id}`" type="target" :position="Position.Top" class="an-handle" />
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.anatomy-canvas {
  /* 语法着色：亮色（贴近正文代码块的高亮配色） */
  --an-tag-name: #116329;
  --an-attr: #0550ae;
  --an-str: #0a3069;
  --an-punct: #57606a;
  --an-text: #24292f;
  --an-bracket: hsl(220 12% 68%);
  --an-tag-border: hsl(220 42% 80%);
  --an-tag-bg: hsl(220 62% 97%);
  --an-tag-fg: hsl(220 40% 32%);

  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.anatomy-canvas.is-ready {
  opacity: 1;
}

.anatomy-canvas.is-dark {
  --an-tag-name: #7ee787;
  --an-attr: #79c0ff;
  --an-str: #a5d6ff;
  --an-punct: #8b949e;
  --an-text: #e6edf3;
  --an-bracket: hsl(220 10% 40%);
  --an-tag-border: hsl(220 30% 34%);
  --an-tag-bg: hsl(220 26% 17%);
  --an-tag-fg: hsl(220 44% 84%);
}

.anatomy-canvas :deep(.vue-flow) {
  background: transparent;
}

.anatomy-canvas :deep(.vue-flow__pane) {
  cursor: grab;
}

.anatomy-canvas :deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.anatomy-canvas :deep(.vue-flow__edge),
.anatomy-canvas :deep(.vue-flow__edge-path) {
  pointer-events: none;
}

/* ---- 代码行 ---- */
.anatomy-canvas :deep(.an-code) {
  position: relative;
  display: inline-flex;
  align-items: center;
  white-space: pre;
  color: var(--an-text);
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 22px;
}

.anatomy-canvas :deep(.an-block) {
  display: inline-block;
}

.anatomy-canvas :deep(.an-tk--tag) {
  color: var(--an-tag-name);
}

.anatomy-canvas :deep(.an-tk--attr) {
  color: var(--an-attr);
}

.anatomy-canvas :deep(.an-tk--str) {
  color: var(--an-str);
}

.anatomy-canvas :deep(.an-tk--punct) {
  color: var(--an-punct);
}

.anatomy-canvas :deep(.an-tk--text) {
  color: var(--an-text);
}

/* ---- 片段区间括号 ---- */
.anatomy-canvas :deep(.an-span) {
  position: relative;
  height: 0;
  border-top: 1.5px solid var(--an-bracket);
}

.anatomy-canvas :deep(.an-span::before),
.anatomy-canvas :deep(.an-span::after) {
  content: '';
  position: absolute;
  top: -1.5px;
  width: 1.5px;
  height: 5px;
  background: var(--an-bracket);
}

.anatomy-canvas :deep(.an-span::before) {
  left: 0;
}

.anatomy-canvas :deep(.an-span::after) {
  right: 0;
}

/* ---- 中文标签 ---- */
.anatomy-canvas :deep(.an-tag) {
  position: relative;
  padding: 1px 8px;
  border: 1px solid var(--an-tag-border);
  border-radius: 999px;
  background: var(--an-tag-bg);
  color: var(--an-tag-fg);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  white-space: nowrap;
}

/* 句柄只用于连线定位，本身不可见 */
.anatomy-canvas :deep(.an-handle) {
  width: 2px;
  height: 2px;
  min-width: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}
</style>
