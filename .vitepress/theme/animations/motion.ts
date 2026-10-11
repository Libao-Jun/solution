/**
 * 首页 GSAP 动效的统一入口（本文件是唯一入口，组件不要各自 `import gsap`）。
 *
 * ★ 约定（改动前必读）
 * 1. GSAP / ScrollTrigger 只在浏览器端「用到才动态 import」：不进入首屏 entry chunk，
 *    构建期（SSR）完全不求值，文档页首屏不受影响。
 * 2. 入场一律 **`gsap.set()` 造起始态 + `gsap.to()` 写显式终值**，不要用 `gsap.from()`：
 *    `from()` 的终值是运行时回读元素「当前值」，元素若正处于别的动画 / CSS 过渡的中间态，
 *    终值就会被记错（实测踩过：Hero CTA 按钮排在同一条时间线靠后位置，终值被记成 0，
 *    时间线跑完仍停在 `opacity: 0; visibility: hidden`）。`to()` 的终值写死，任何情况下都会回到它。
 *    —— 起始态由 JS 侧生成，**绝不用 CSS 先把元素隐藏**，JS / GSAP 失败时页面必须仍是完整静态内容。
 * 3. 尊重 `prefers-reduced-motion: reduce`：命中时一个动画都不建，直接呈现静态终态。
 * 4. SVG 元素注意：CSS transform 会覆盖 SVG 的 `transform` 属性，
 *    带等距矩阵 / `translate(...)` 的元素（如 StackIsometric 的方块、内容地图的卡片组）
 *    不要直接做位移动画，只能动画它们**没有 transform 属性**的子元素或用透明度。
 * 5. 组件统一用 `useMotion()` 挂载：卸载（含 VitePress SPA 切路由）时会自动 revert 内联样式与 ScrollTrigger。
 */
import { onMounted, onUnmounted, type Ref } from 'vue'

/** 动态加载后的 GSAP 句柄（类型全部来自 gsap 自带的 .d.ts，不额外引三方类型包） */
export interface MotionTools {
  gsap: typeof import('gsap')['gsap']
  ScrollTrigger: typeof import('gsap/ScrollTrigger')['ScrollTrigger']
}

export type MotionCleanup = () => void
export type MotionBuild = (tools: MotionTools, root: HTMLElement) => MotionCleanup | void

let loader: Promise<MotionTools> | null = null

/** 是否命中「减少动态效果」偏好 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 动态加载 gsap + ScrollTrigger（全站只加载一次，多个组件共享同一个 Promise）。
 * 顺带在字体 / 资源就绪后 refresh 一次，避免 ScrollTrigger 起止点算偏导致「该入场的不入场」。
 */
export const loadMotion = (): Promise<MotionTools> => {
  loader ??= (async () => {
    const [core, scrollTriggerModule] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])
    const gsap = core.gsap ?? core.default
    const ScrollTrigger = scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default

    gsap.registerPlugin(ScrollTrigger)
    gsap.defaults({ ease: 'power3.out', duration: 0.7 })
    ScrollTrigger.config({ ignoreMobileResize: true })

    const refresh = () => ScrollTrigger.refresh()
    if (typeof document !== 'undefined' && document.fonts) {
      void document.fonts.ready.then(refresh)
    }
    if (document.readyState !== 'complete') {
      window.addEventListener('load', refresh, { once: true })
    }

    return { gsap, ScrollTrigger }
  })()

  return loader
}

/**
 * 组件级动效容器：动态加载 GSAP 后，在 `root` 作用域内执行 `build`。
 * - `prefers-reduced-motion` 或找不到根节点时**什么都不做**（内容保持静态可见）；
 * - `build` 可以返回一个清理函数（例如移除 pointer 事件监听），卸载时先执行它，再 revert 所有动画。
 */
export const useMotion = (root: Ref<HTMLElement | null>, build: MotionBuild): void => {
  let revert: MotionCleanup | null = null
  let disposed = false

  onMounted(async () => {
    const element = root.value
    if (!element || prefersReducedMotion()) {
      return
    }

    const tools = await loadMotion()
    if (disposed || !root.value) {
      return
    }

    let cleanup: MotionCleanup | null = null
    const context = tools.gsap.context(() => {
      cleanup = build(tools, root.value as HTMLElement) ?? null
    }, element)

    revert = () => {
      cleanup?.()
      cleanup = null
      context.revert()
    }
  })

  onUnmounted(() => {
    disposed = true
    revert?.()
    revert = null
  })
}

/* ------------------------------------------------------------------ */
/* 通用「进入视口后成组入场」                                          */
/* ------------------------------------------------------------------ */

export type RevealVariant = 'up' | 'scale' | 'left' | 'right'

export interface RevealOptions {
  /** 默认位移距离（px） */
  distance?: number
  /** 组内相邻元素的间隔（秒） */
  stagger?: number
  /** 单个元素时长（秒） */
  duration?: number
  /** ScrollTrigger 触发点，默认「元素顶部到达视口 86%」 */
  start?: string
  /** 超过该数量后改用更小的间隔，避免一组长列表拖太久 */
  maxStagger?: number
}

/** 每种变体的起始态与终态（终态写死，不用 from 回读） */
const VARIANTS: Record<RevealVariant, { from: (distance: number) => object; to: object }> = {
  up: { from: (distance) => ({ y: distance }), to: { y: 0 } },
  scale: { from: (distance) => ({ scale: 0.94, y: distance * 0.4 }), to: { scale: 1, y: 0 } },
  left: { from: (distance) => ({ x: -distance * 1.4 }), to: { x: 0 } },
  right: { from: (distance) => ({ x: distance * 1.4 }), to: { x: 0 } },
}

const resolveVariant = (value: string | undefined): RevealVariant => {
  switch (value) {
    case 'scale':
    case 'left':
    case 'right':
      return value
    default:
      return 'up'
  }
}

/**
 * 把 `root` 内所有 `[data-reveal]` 元素**按所属容器 + 变体分组**，
 * 逐组做「进入视口后错落入场」。容器取最近的 `[data-reveal-group]`，没有则取最近的 `<section>`。
 * `data-reveal` 的值可选：`up`（默认）/ `scale` / `left` / `right`。
 *
 * ★ 只处理「属于自己这一层」的元素：根节点带 `data-motion-scope`，
 *   只要某元素的最近 scope 祖先不是 `root` 本身（说明它在子组件的 DOM 里），就跳过——
 *   否则首页 Home.vue 会把子组件（等距图 / 快速开始 / 工具栏…）的 data-reveal 一起收进来，
 *   同一元素被创建两份 tween，互相抢 opacity。
 */
export const revealOnScroll = (
  { gsap }: MotionTools,
  root: HTMLElement,
  options: RevealOptions = {},
): void => {
  const { distance = 24, stagger = 0.08, duration = 0.7, start = 'top 86%', maxStagger = 8 } = options

  const groups = new Map<Element, Map<RevealVariant, Element[]>>()

  const belongsToRoot = (element: HTMLElement) => {
    const scope = element.closest('[data-motion-scope]')
    return !scope || scope === root || !root.contains(scope)
  }

  gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((element) => {
    if (!belongsToRoot(element)) {
      return
    }
    const trigger = element.closest('[data-reveal-group]') ?? element.closest('section') ?? root
    const variant = resolveVariant(element.dataset.reveal)
    const byVariant = groups.get(trigger) ?? new Map<RevealVariant, Element[]>()
    byVariant.set(variant, [...(byVariant.get(variant) ?? []), element])
    groups.set(trigger, byVariant)
  })

  groups.forEach((byVariant, trigger) => {
    byVariant.forEach((elements, variant) => {
      const { from, to } = VARIANTS[variant]
      gsap.set(elements, { autoAlpha: 0, ...from(distance) })
      gsap.to(elements, {
        autoAlpha: 1,
        ...to,
        duration,
        // 动画结束后清掉内联 transform，避免影响元素自身的 hover 缩放（内联 scale 会压过 CSS）
        clearProps: 'transform,translate,scale,rotate,filter',
        stagger: { each: elements.length > maxStagger ? 0.04 : stagger },
        scrollTrigger: { trigger, start, once: true },
      })
    })
  })
}
