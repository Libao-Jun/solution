import { VoidZeroTheme, themeContextKey } from '@voidzero-dev/vitepress-theme'
// withBase：品牌资源是写死的根路径，子路径部署下会被解析到域名根目录，需按 base 补全
import { withBase, type Theme } from 'vitepress'
import { nextTick } from 'vue'

import Layout from './Layout.vue'
import './styles.css'

// ---- Mermaid 客户端渲染 ----
// VitePress 2 alpha 未内置 mermaid，这里用已安装的 `mermaid` 库自建接入：
// config.mts 把 ```mermaid 块渲染成 <div class="mermaid" v-pre data-src="…">（源码以 JSON 存入
// data-src，浏览器端 JSON.parse 精确还原，避免 textContent 的换行丢失/中文乱码）。
// 本脚本在浏览器里调用 mermaid.render 把源码换成 SVG。懒加载 + 仅在浏览器执行，不影响 SSR。
let mermaidMod: any = null
async function getMermaid() {
  if (!mermaidMod) {
    const mod: any = await import('mermaid')
    mermaidMod = mod.default ?? mod
  }
  return mermaidMod
}

// 防止重叠渲染：MutationObserver 触发与 renderMermaid 自身修改 DOM 可能并发，
// 用全局锁保证同一时刻只有一个渲染流程在执行。
let rendering = false

async function doRenderMermaid() {
  if (typeof document === 'undefined') return

  // 防止重叠渲染：MutationObserver 触发与 renderMermaid 自身修改 DOM 可能并发。
  if (rendering) return
  rendering = true

  // 先等 Vue 的当前渲染/水合 tick 完成，避免在 Vue 仍操作 DOM 时强行写入导致被覆盖。
  try {
    await nextTick()
  } catch {
    rendering = false
    return
  }

  try {
    // 只处理尚未渲染的块；源码从 data-src 精确还原（不再依赖 textContent）
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('div.mermaid[data-src]:not([data-mermaid-processed])'),
    )
    if (!els.length) return

    const mermaid = await getMermaid()
    const dark = document.documentElement.classList.contains('dark')
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: dark ? 'dark' : 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 28,
      },
      sequence: {
        useMaxWidth: true,
      },
    })

    for (const el of els) {
      const raw = el.getAttribute('data-src')
      if (!raw) continue
      let src: string
      try {
        // data-src 是 JSON 字符串，可精确还原换行与中文
        src = JSON.parse(raw)
      } catch {
        src = raw
      }
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
      try {
        const { svg } = await mermaid.render(id, src)
        el.innerHTML = svg
        fixMermaidNodeHeights(el.querySelector('svg'))
        el.setAttribute('data-mermaid-processed', 'true')
      } catch (err) {
        el.classList.add('mermaid-error')
        el.textContent = `[mermaid 渲染失败] ${String(err)}`
        console.error('[mermaid] render failed:', err)
        // 失败也要标记，防止后续 MutationObserver 反复重试导致闪烁/死循环
        el.setAttribute('data-mermaid-processed', 'error')
      }
    }
  } finally {
    rendering = false
  }
}

function renderMermaid() {
  void doRenderMermaid()
}

/**
 * 修复 mermaid 中文 HTML 标签高度不足导致文本被截断的问题。
 * mermaid 在隐藏元素里测量文本高度时，中文行高/字体会导致实际渲染高度比测量值大。
 * 这里在渲染后遍历所有 foreignObject（节点 + 边/子图标签），根据 div.scrollHeight
 * 动态增加 foreignObject 与背景形状的高度，并同步上移 y 坐标保持居中；只扩大不缩小。
 */
function fixMermaidNodeHeights(svg: SVGSVGElement | null) {
  if (!svg) return

  const processed = new Set<SVGForeignObjectElement>()

  const fixForeignObject = (fo: SVGForeignObjectElement) => {
    if (processed.has(fo)) return
    processed.add(fo)

    const div = fo.querySelector<HTMLDivElement>('div')
    if (!div) return

    const foH = parseFloat(fo.getAttribute('height') || '0')
    const neededH = div.scrollHeight
    if (!foH || neededH <= foH) return

    const delta = neededH - foH
    const half = delta / 2

    // 同步放大 foreignObject，并上移保持居中
    fo.setAttribute('height', String(neededH))
    const foY = parseFloat(fo.getAttribute('y') || '0')
    fo.setAttribute('y', String(foY - half))

    // 在父级或节点内寻找背景形状并同步放大
    const parent = fo.parentElement
    const node = fo.closest<SVGGElement>('.node')
    const shape =
      node?.querySelector<SVGRectElement>(':scope > rect') ??
      node?.querySelector<SVGPolygonElement>(':scope > polygon') ??
      node?.querySelector<SVGCircleElement>(':scope > circle') ??
      parent?.querySelector<SVGRectElement>('rect') ??
      parent?.querySelector<SVGPolygonElement>('polygon') ??
      parent?.querySelector<SVGCircleElement>('circle')

    if (!shape) return

    if (shape.tagName === 'rect') {
      const rect = shape as SVGRectElement
      const rectH = parseFloat(rect.getAttribute('height') || '0')
      const rectY = parseFloat(rect.getAttribute('y') || '0')
      rect.setAttribute('height', String(rectH + delta))
      rect.setAttribute('y', String(rectY - half))
    } else if (shape.tagName === 'circle') {
      const circle = shape as SVGCircleElement
      const r = parseFloat(circle.getAttribute('r') || '0')
      circle.setAttribute('r', String(r + half))
    } else if (shape.tagName === 'polygon') {
      // 菱形/多边形：放大 points 的纵向范围，保持中心不变
      const polygon = shape as SVGPolygonElement
      const pointsAttr = polygon.getAttribute('points')
      if (!pointsAttr) return
      const points = pointsAttr.split(' ').map((p) => p.split(',').map(Number))
      if (points.length < 4) return
      const ys = points.map((p) => p[1])
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      const centerY = (minY + maxY) / 2
      const newHalf = (maxY - minY) / 2 + half
      const newPoints = points
        .map((p) => {
          const y = p[1] < centerY ? centerY - newHalf : centerY + newHalf
          return `${p[0]},${y}`
        })
        .join(' ')
      polygon.setAttribute('points', newPoints)
    }
  }

  // 先处理节点，再处理边/子图标签
  svg.querySelectorAll<SVGGElement>('.node').forEach((node) => {
    const fo = node.querySelector<SVGForeignObjectElement>('foreignObject')
    if (fo) fixForeignObject(fo)
  })
  svg.querySelectorAll<SVGForeignObjectElement>('foreignObject').forEach((fo) => {
    fixForeignObject(fo)
  })

  // 节点放大后可能超出原 viewBox，按需扩展 viewBox 保证整图可见
  try {
    const bbox = svg.getBBox()
    const vb = svg.viewBox.baseVal
    const padding = 8
    const minX = Math.min(vb.x, bbox.x - padding)
    const minY = Math.min(vb.y, bbox.y - padding)
    const maxX = Math.max(vb.x + vb.width, bbox.x + bbox.width + padding)
    const maxY = Math.max(vb.y + vb.height, bbox.y + bbox.height + padding)
    svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`)
  } catch {
    // SVG 在特殊状态下 getBBox 可能抛错，忽略即可
  }
}

// 记录上一次主题，仅在「深色/浅色」真正切换时才重渲，避免无意义的渲染风暴
let lastDark: boolean | null = null
function rerenderOnThemeChange() {
  const dark = document.documentElement.classList.contains('dark')
  if (dark === lastDark) return
  lastDark = dark
  document
    .querySelectorAll<HTMLElement>('div.mermaid[data-src][data-mermaid-processed]')
    .forEach((el) => {
      el.removeAttribute('data-mermaid-processed')
      el.innerHTML = ''
    })
  void renderMermaid()
}

function setupMermaid(router: any) {
  if (typeof document === 'undefined') return
  const start = () => {
    rerenderOnThemeChange()
    void renderMermaid()
    // 正文挂载/更新后才会出现 mermaid 块：监听内容区，仅渲染未处理的块（不会递归）
    const target = document.querySelector('#VPContent') || document.body
    new MutationObserver(() => {
      void renderMermaid()
    }).observe(target, { childList: true, subtree: true })
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
  // 仅监听 <html> 的 class 变化用于跟随深色模式；用 lastDark 去重，不会产生递归风暴
  new MutationObserver(() => rerenderOnThemeChange()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  // SPA 路由切换后内容整体替换，重置主题记忆并重渲新页面上的 mermaid 块
  if (router?.onAfterRouteChanged) {
    router.onAfterRouteChanged(() => {
      lastDark = null
      void renderMermaid()
    })
  }
}

export default {
  Layout,
  enhanceApp(ctx) {
    // 复用 VoidZero 主题自带逻辑（写入 data-variant、注册 Badge、同步 frontmatter.theme）
    VoidZeroTheme.enhanceApp(ctx)

    // 覆盖品牌资源（页头 Logo / 页脚背景 / 顶栏图标）
    ctx.app.provide(themeContextKey, {
      logoDark: withBase('/logo.svg'),
      logoLight: withBase('/logo-light.svg'),
      logoAlt: 'Solution',
      footerBg: withBase('/footer-background.svg'),
      monoIcon: withBase('/icon.svg'),
    })

    // 启用 mermaid 客户端渲染
    setupMermaid(ctx.router)
  },
} satisfies Theme
