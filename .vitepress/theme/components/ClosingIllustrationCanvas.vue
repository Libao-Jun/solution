<script setup lang="ts">
/**
 * 首页收尾「内容地图」画布（@vue-flow/core 动态画布）。
 *
 * 本文件只被 ClosingIllustration.vue 在浏览器端动态 import
 * （@vue-flow/core 依赖 d3-zoom，必须有 DOM），不参与 SSR。
 *
 * 设计口径（与 DocFlowCanvas / BuildToolsFlowCanvas 一致）：
 * - 节点坐标由 ../data/content-map 精确算出（不依赖 DOM 测量），只读场景禁止拖拽 / 连线 / 选中；
 * - 只有两种节点：hub（中心节点，带 上/下 两个出线句柄）与 card（分类卡，带 上/下 两个入线句柄）；
 * - 连线用 vue-flow 内置贝塞尔（`type: 'default'`），两端都沿竖直方向进出，复刻原静态图的 S 型曲线，
 *   虚线 + 流光交给 CSS（`.closing-edge .vue-flow__edge-path`）；
 * - 面板恒深色：色值全部写死（不用站点主题变量），所以不引入 useData().isDark。
 *
 * 动效（唯一入口 ../animations/motion.ts，本文件不直接 import gsap）：
 * - 入场：中心节点弹出 → 连线逐条「画」出 → 端口圆点 → 卡片上浮；全部 `gsap.set()` 造起始态 + `to()` 写终值；
 * - 常驻：中心脉冲环与虚线流光走 CSS，且只在 `prefers-reduced-motion: no-preference` 下开启动画；
 * - 位移只挂在「自身没有 transform」的内层元素上：vue-flow 会给节点根元素写内联 transform 定位，
 *   动它会把版式带偏；同理端口圆点用 left/top 定位，不用 CSS transform 居中。
 * - 时间线**建好时是 paused**，等「节点已渲染 + 连线路径已可测量」且**画布进入视口**才播
 *   （触发用 IntersectionObserver，见 build 内注释：ScrollTrigger 的 80% 触发线会让面板
 *   明明已经露出一截却整块空白）；就绪前最多重试 40 帧。
 */
import { Handle, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useMotion } from '../animations/motion'
import { contentMapLayout } from '../data/content-map'

const props = withDefaults(
  defineProps<{
    flowId?: string
    minZoom?: number
    maxZoom?: number
  }>(),
  /* 默认视图 = 面板铺满（见 fitPanel）：窄到 26rem 的面板时缩放约 0.42，故 minZoom 需低于它 */
  { flowId: 'closing-map', minZoom: 0.35, maxZoom: 1.8 },
)

const flowNodes = computed<Node[]>(() =>
  contentMapLayout.nodes.map((node) => ({
    id: node.id,
    type: node.kind === 'hub' ? 'hub' : 'card',
    position: { x: node.x, y: node.y },
    data: node,
    draggable: false,
    connectable: false,
    selectable: false,
  })),
)

const flowEdges = computed<Edge[]>(() =>
  contentMapLayout.edges.map((edge, index) => ({
    id: `${props.flowId}-e-${index}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: `s-${edge.sourceSide}`,
    targetHandle: `t-${edge.targetSide}`,
    type: 'default',
    selectable: false,
    updatable: false,
    class: 'closing-edge',
  })),
)

const root = ref<HTMLElement | null>(null)
/** 入场时间线跑完后再开 CSS 虚线流光：否则两边会同时改 stroke-dashoffset */
const flowing = ref(false)

const { zoomIn, zoomOut, setViewport } = useVueFlow(props.flowId)

/**
 * 默认视图：把面板世界坐标（0,0 → width×height）**整块铺满容器**。
 * 容器宽高比与面板一致（见骨架的 aspect-ratio），所以按宽度算出的缩放同时满足高度，
 * 观感与原静态 SVG（`w-full` + viewBox 等比缩放）完全一致——不用 fitView 那一套
 * 「按节点包围盒留边」的算法，避免四周多出空白。
 */
const fitPanel = () => {
  const host = root.value
  if (!host?.clientWidth) {
    return
  }
  void setViewport({ x: 0, y: 0, zoom: host.clientWidth / contentMapLayout.width })
}

defineExpose({ zoomIn, zoomOut, fitView: fitPanel })

useMotion(root, ({ gsap }, element) => {
  let frame = 0
  let attempts = 0
  let cancelled = false
  let revealed = false
  let observer: IntersectionObserver | null = null
  let timeline: ReturnType<typeof gsap.timeline> | null = null
  let float: ReturnType<typeof gsap.to> | null = null

  const build = () => {
    if (cancelled) {
      return
    }

    const cards = gsap.utils.toArray<HTMLElement>('[data-map-card]', element)
    const hub = element.querySelector<HTMLElement>('[data-map-hub]')
    /*
     * 等两类东西都就绪再建时间线：
     * ① 节点（vue-flow 量完尺寸才渲染，否则整段入场动画落空）；
     * ② 连线路径已经能测长度（路径还没写 `d` 时 getTotalLength() 返回 0，
     *    会把内联 stroke-dasharray 设成 0——虚线的 CSS 被内联压掉，连线变成一条实线，
     *    且「画线」动画也变成瞬现）。
     */
    const edges = gsap.utils.toArray<SVGPathElement>('.vue-flow__edge-path', element).filter(
      (path) => path.getTotalLength() > 0,
    )

    if (!cards.length || !hub || !edges.length) {
      if (attempts < 40) {
        attempts += 1
        frame = requestAnimationFrame(build)
      }
      return
    }

    const ports = gsap.utils.toArray<HTMLElement>('[data-map-port]', element)

    /* 起始态 set、终值 to（不要用 from：from 的终值靠回读当前值，会被别的动画带偏） */
    edges.forEach((edge) => {
      const length = edge.getTotalLength()
      gsap.set(edge, { strokeDasharray: length, strokeDashoffset: length })
    })
    gsap.set(hub, { autoAlpha: 0, scale: 0.88, transformOrigin: '50% 50%' })
    gsap.set(cards, { autoAlpha: 0, y: 20 })
    if (ports.length) {
      gsap.set(ports, { autoAlpha: 0, scale: 0 })
    }

    timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      paused: true,
      onComplete: () => {
        /* 流光接力 + 常驻浮动（只动 y，与入场的 scale / autoAlpha 不抢同一个属性） */
        flowing.value = true
        float = gsap.to(hub, {
          y: -5,
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      },
    })

    /* 连线逐条「画」出；结束后清掉内联 dash，回落到 CSS 的虚线（流光由 CSS 常驻动画接力） */
    if (edges.length) {
      timeline.to(
        edges,
        {
          strokeDashoffset: 0,
          duration: 1,
          stagger: 0.07,
          ease: 'power2.inOut',
          clearProps: 'strokeDasharray,strokeDashoffset',
        },
        0,
      )
    }
    timeline.to(hub, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, 0.2)
    if (ports.length) {
      timeline.to(ports, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(2)' }, 0.55)
    }
    timeline.to(cards, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.09 }, 0.6)

    /*
     * ★ 入场触发用 IntersectionObserver，不用 ScrollTrigger ★
     * 面板有 550px 高，ScrollTrigger 的 `start: 'top 80%'` 会让「面板已经进入视口、
     * 但顶部还没越过视口 80%」这一段里所有节点停在 opacity: 0 —— 表现就是
     * 「面板空着、只剩几条连线」。IO 在 observe 时会立刻回调一次：
     * 元素已在视口内（或已被滚过）就马上播，不依赖 ScrollTrigger 的位置计算与 refresh 时机
     * （画布是动态挂载的，页面高度/位置很容易被算偏）。
     */
    const reveal = () => {
      if (revealed) {
        return
      }
      revealed = true
      observer?.disconnect()
      observer = null
      window.removeEventListener('scroll', checkSoon)
      window.removeEventListener('resize', checkSoon)
      timeline?.play()
    }

    /** 已进入视口（露出任意一截）或已被滚到视口上方，就该露出来了 */
    const shouldReveal = () => {
      const rect = element.getBoundingClientRect()
      return (rect.bottom > 0 && rect.top < window.innerHeight) || rect.bottom <= 0
    }

    let ticking = false
    const check = () => {
      ticking = false
      if (!revealed && !cancelled && shouldReveal()) {
        reveal()
      }
    }
    /* 滚动事件里每帧只复核一次，避免长页面滚动时反复触发布局读取 */
    const checkSoon = () => {
      if (ticking) {
        return
      }
      ticking = true
      requestAnimationFrame(check)
    }

    if (typeof IntersectionObserver === 'undefined') {
      reveal()
      return
    }

    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) {
        reveal()
      }
    })
    observer.observe(element)
    /*
     * IO 之外再挂 scroll / resize 复核：元素若在「一帧内」从视口下方直接跳到上方
     * （例如加载完立刻滚到页脚），两端都是 isIntersecting=false，不会跨阈值，
     * IO 一个回调都不会给 —— 只有靠滚动事件复核才能把它补上。
     */
    window.addEventListener('scroll', checkSoon, { passive: true })
    window.addEventListener('resize', checkSoon)
    check()
  }

  build()

  return () => {
    cancelled = true
    if (frame) {
      cancelAnimationFrame(frame)
    }
    observer?.disconnect()
    observer = null
    timeline?.kill()
    float?.kill()
  }
})

/* 面板宽度变化（窗口缩放 / 侧栏开合）后重新铺满：容器比例与面板一致，不会被拉偏 */
let resizeObserver: ResizeObserver | null = null
let initFrame = 0
let attempts = 0
let lastWidth = 0
let refitTimer = 0

const initView = () => {
  const host = root.value
  /* 节点还没渲染出来就先等下一帧，避免在初始化过程中被 vue-flow 覆盖 */
  if (host && !host.querySelector('.vue-flow__node') && attempts < 40) {
    attempts += 1
    initFrame = requestAnimationFrame(initView)
    return
  }
  fitPanel()
  lastWidth = host?.clientWidth ?? 0
}

onMounted(() => {
  const host = root.value
  if (!host) {
    return
  }
  initView()
  if (typeof ResizeObserver === 'undefined') {
    return
  }
  resizeObserver = new ResizeObserver(() => {
    const width = host.clientWidth
    if (!width || Math.abs(width - lastWidth) < 2) {
      return
    }
    lastWidth = width
    window.clearTimeout(refitTimer)
    refitTimer = window.setTimeout(() => fitPanel(), 120)
  })
  resizeObserver.observe(host)
})

onUnmounted(() => {
  if (initFrame) {
    cancelAnimationFrame(initFrame)
  }
  resizeObserver?.disconnect()
  resizeObserver = null
  window.clearTimeout(refitTimer)
})
</script>

<template>
  <div ref="root" class="closing-canvas" :class="{ 'is-flowing': flowing }" data-motion-scope>
    <VueFlow
      :id="flowId"
      :nodes="flowNodes"
      :edges="flowEdges"
      :fit-view-on-init="false"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
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
      <!--
        ★ 节点一律分两层：外层「定位层」尺寸固定、**永远不做动画**，只挂 Handle 与端口圆点；
          内层才是被 GSAP 入场动效动的元素（卡片上浮 / 中心缩放）。
        vue-flow 只在初始化时量一次 handle 坐标并缓存，若 handle 所在元素带着入场起始位移
        （卡片 `y: 20`、中心 `scale: 0.88`），量到的坐标就永久偏掉 ——
        实测：5 条连线端点统一偏 +20px（正是卡片的入场位移），中心节点两端偏 4.3px（正是 0.88 缩放）。
      -->
      <template #node-hub="{ data }">
        <div
          class="closing-hub-node"
          :style="{ width: `${data.width}px`, height: `${data.height}px` }"
        >
          <div class="closing-hub" data-map-hub>
            <span class="closing-hub__glow" aria-hidden="true" />
            <span class="closing-hub__pulse" aria-hidden="true" />
            <span class="closing-hub__pulse closing-hub__pulse--late" aria-hidden="true" />
            <span class="closing-hub__box">
              <span class="closing-hub__title">{{ data.title }}</span>
              <span class="closing-hub__meta">{{ data.subtitle }}</span>
            </span>
          </div>
          <Handle id="s-top" class="closing-handle" type="source" :position="Position.Top" />
          <Handle id="s-bottom" class="closing-handle" type="source" :position="Position.Bottom" />
        </div>
      </template>

      <template #node-card="{ data }">
        <div
          class="closing-card-node"
          :class="`closing-card-node--port-${data.port}`"
          :style="{ width: `${data.width}px`, height: `${data.height}px` }"
        >
          <div class="closing-card" data-map-card>
            <span class="closing-card__title">{{ data.title }}</span>
            <ul class="closing-card__leaves">
              <li v-for="leaf in data.leaves" :key="leaf">{{ leaf }}</li>
            </ul>
          </div>
          <span class="closing-card__port" data-map-port aria-hidden="true" />
          <Handle id="t-top" class="closing-handle" type="target" :position="Position.Top" />
          <Handle id="t-bottom" class="closing-handle" type="target" :position="Position.Bottom" />
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.closing-canvas {
  width: 100%;
  height: 100%;
}

.closing-canvas :deep(.vue-flow) {
  background: transparent;
}

/* 只读示意图：只保留平移手势 */
.closing-canvas :deep(.vue-flow__pane) {
  cursor: grab;
}

.closing-canvas :deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

.closing-canvas :deep(.vue-flow__edge) {
  pointer-events: none;
}

/* ---- 连线：虚线贝塞尔（入场时由 GSAP 逐条画出，结束后清掉内联 dash 回落到这里） ---- */
.closing-canvas :deep(.closing-edge .vue-flow__edge-path) {
  stroke: rgba(167, 139, 250, 0.7);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-dasharray: 3 9;
}

@media (prefers-reduced-motion: no-preference) {
  /* 虚线沿连线从中心流向卡片（dasharray "3 9" 的周期是 12） */
  .closing-canvas.is-flowing :deep(.closing-edge .vue-flow__edge-path) {
    animation: closing-dash 1.4s linear infinite;
  }
}

@keyframes closing-dash {
  to {
    stroke-dashoffset: -12;
  }
}

/* ---- 卡片定位层：尺寸固定、不做动画，Handle 与端口圆点挂在这一层（见模板注释） ---- */
.closing-canvas :deep(.closing-card-node) {
  position: relative;
  box-sizing: border-box;
}

/* ---- 分类卡片：玻璃拟态；卡高与 data/content-map.ts 的 42 + 条目数 × 20 严格对应 ---- */
.closing-canvas :deep(.closing-card) {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 14px 16px 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;
}

/* 悬停只改 paint 属性，不碰 transform（避免与 GSAP 抢） */
.closing-canvas :deep(.closing-card:hover) {
  border-color: rgba(167, 139, 250, 0.65);
  background: rgba(139, 92, 246, 0.08);
}

.closing-canvas :deep(.closing-card__title) {
  color: #eceef8;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 20px;
}

.closing-canvas :deep(.closing-card__leaves) {
  margin: 0;
  padding: 0;
  list-style: none;
}

/*
 * ★ 字号 / 行高 / 颜色必须显式写在 `li` 上（不能只写在 `ul` 上）★
 * 首页处于 `.marketing-layout`，主题 marketing.css 里有 `.marketing-layout p, li { @apply text-base md:text-lg text-grey }`
 * —— 桌面直接给 `li` 定死 18px / 28px 与主题灰。直接规则优先于继承，
 * 只改 `ul` 压不住它，会导致卡片文案换行、行高从 20px 变 28px（卡高 42 + 条目数 × 20 的算式失效、文字溢出卡片）。
 */
.closing-canvas :deep(.closing-card__leaves li) {
  margin: 0;
  padding: 0;
  color: rgba(255, 255, 255, 0.52);
  font-size: 12px;
  line-height: 20px;
  transition: color 0.3s ease;
}

.closing-canvas :deep(.closing-card:hover .closing-card__leaves li) {
  color: rgba(255, 255, 255, 0.75);
}

/* 连接端口圆点：圆心贴在卡片边缘外侧 7px 的连线上（12px 圆 → 外偏 13px）；
   用 left/top 定位而不是 transform 居中，好让 GSAP 独占它的 scale */
.closing-canvas :deep(.closing-card__port) {
  position: absolute;
  left: calc(50% - 6px);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(167, 139, 250, 0.18);
}

.closing-canvas :deep(.closing-card__port::after) {
  content: '';
  position: absolute;
  inset: 3.5px;
  border-radius: 50%;
  background: #c4b5fd;
}

.closing-canvas :deep(.closing-card-node--port-bottom .closing-card__port) {
  bottom: -13px;
}

.closing-canvas :deep(.closing-card-node--port-top .closing-card__port) {
  top: -13px;
}

/* ---- 中心节点：定位层（不动画） + 内容层（光晕 / 脉冲环 / 渐变徽标） ---- */
.closing-canvas :deep(.closing-hub-node) {
  position: relative;
  box-sizing: border-box;
}

.closing-canvas :deep(.closing-hub) {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

/* 光晕跟着中心节点走（不用面板级固定渐变，平移 / 缩放时不会错位） */
.closing-canvas :deep(.closing-hub__glow) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 560px;
  height: 560px;
  margin: -280px 0 0 -280px;
  background: radial-gradient(circle, rgba(108, 59, 255, 0.2) 0%, rgba(108, 59, 255, 0) 66%);
  pointer-events: none;
}

.closing-canvas :deep(.closing-hub__pulse) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 172px;
  height: 172px;
  margin: -86px 0 0 -86px;
  border: 1px solid rgba(139, 92, 246, 0.45);
  border-radius: 50%;
  opacity: 0.45;
  pointer-events: none;
}

.closing-canvas :deep(.closing-hub__pulse--late) {
  border-color: rgba(139, 92, 246, 0.35);
}

@media (prefers-reduced-motion: no-preference) {
  /* 中心脉冲环：向外扩散并淡出，双环错相 */
  .closing-canvas :deep(.closing-hub__pulse) {
    animation: closing-pulse 3.2s ease-out infinite;
  }

  .closing-canvas :deep(.closing-hub__pulse--late) {
    animation-delay: 1.6s;
  }
}

@keyframes closing-pulse {
  0% {
    transform: scale(0.55);
    opacity: 0.55;
  }

  70%,
  100% {
    transform: scale(1.45);
    opacity: 0;
  }
}

.closing-canvas :deep(.closing-hub__box) {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c4dff 0%, #4f30e8 100%);
  /* 原静态图的 1px 内描边 */
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22);
}

.closing-canvas :deep(.closing-hub__title) {
  color: #ffffff;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.15;
}

.closing-canvas :deep(.closing-hub__meta) {
  color: rgba(255, 255, 255, 0.82);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 1.2;
}

/* 句柄只用于给连线定位，本身不可见 */
.closing-canvas :deep(.closing-handle) {
  width: 2px;
  height: 2px;
  min-width: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}
</style>
