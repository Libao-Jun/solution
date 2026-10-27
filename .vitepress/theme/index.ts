import { VoidZeroTheme, themeContextKey } from '@voidzero-dev/vitepress-theme'
// withBase：品牌资源是写死的根路径，子路径部署下会被解析到域名根目录，需按 base 补全
import { withBase, type Theme } from 'vitepress'
import { nextTick } from 'vue'

// 前端安全「攻防全景」思维导图（正文 `fundamentals/frontend-security/` 1.2 节使用）：
// 外层骨架可直接 SSR，真正的 @vue-flow/core 画布在浏览器端动态加载，故此处静态引入是安全的。
import FrontendSecurityMindmap from './components/FrontendSecurityMindmap.vue'
import MiniprogramSetupFlow from './components/MiniprogramSetupFlow.vue'
import StorageDecisionTree from './components/StorageDecisionTree.vue'
import HybridAppLayers from './components/HybridAppLayers.vue'
import TechSelectionDecisionTree from './components/TechSelectionDecisionTree.vue'
import FullDevWorkflow from './components/FullDevWorkflow.vue'
import CacheLayerModel from './components/CacheLayerModel.vue'
import ImageCacheThreeTier from './components/ImageCacheThreeTier.vue'
import IOSReleaseFlow from './components/IOSReleaseFlow.vue'
import FrontendToMobileRoadmap from './components/FrontendToMobileRoadmap.vue'
// 决策树（@vue-flow/core 实现，外框 SSR + 画布懒加载，分支条件支持换行标签）：
// 工程化与适配两篇正文各一张——响应式与自适应如何选择 / 大屏选型决策树
import ResponsiveAdaptiveDecisionTree from './components/ResponsiveAdaptiveDecisionTree.vue'
import DataScreenSelectionDecisionTree from './components/DataScreenSelectionDecisionTree.vue'
// 微前端 HTML Entry 加载流程（加载主链 + 路由离开卸载分支，正文 `engineering/micro-frontend/` 6.3 节使用）
import MicroFrontendHtmlEntryFlow from './components/MicroFrontendHtmlEntryFlow.vue'
// 小程序「发布全流程（六步）」（主列 + 被拒支线 + 备案门槛），正文 wechat-miniprogram 23.2 节使用
import MiniprogramReleaseFlow from './components/MiniprogramReleaseFlow.vue'
// 小程序「双线程模型」（视图层 / 逻辑层 / Native 三层容器 + 中转连线），正文 wechat-miniprogram 5.1 节使用
import MiniprogramDualThreadFlow from './components/MiniprogramDualThreadFlow.vue'
// 前端打包构建工具「流程 / 依赖 / 生态 / 选型」四张图（正文 `engineering/build-tools/` 1.2 / 1.3 / 1.6 / 11.1 节使用）
import BuildToolsFlow from './components/BuildToolsFlow.vue'
// 以下 3 个组件共用 DocFlow（外层骨架）+ DocFlowCanvas（@vue-flow/core 画布）：
// 正文 fundamentals/javascript 第 1 节的「JS 全貌」三级树
import JsOverviewMap from './components/JsOverviewMap.vue'
// 正文 fundamentals/long-list-optimization 2.3 节的「组合策略」场景 → 方案对照
import LongListCombinationFlow from './components/LongListCombinationFlow.vue'
// 正文 fundamentals/front-end-performance 1.3「加载流程」与 3.3「缓存完整判定流程」（variant 切换）
import FrontendPerformanceFlow from './components/FrontendPerformanceFlow.vue'
// —— 以下 3 个组件：把 fundamentals/css-css3 中的文本图与 mermaid 决策图重构为 @vue-flow/core ——
// 3.1 盒模型（margin/border/padding/content 四层同心带状结构，层标签压顶）
import CssBoxModelDiagram from './components/CssBoxModelDiagram.vue'
// 8.1 Flex 术语图（容器 + item + 主轴 / 交叉轴连线，轴线用 ghost 锚点挂连线）
import CssFlexContainerDiagram from './components/CssFlexContainerDiagram.vue'
// 9.7 Flex 与 Grid 如何选型（决策树，分支到共识的连线按条覆盖出线侧）
import FlexGridChoiceFlow from './components/FlexGridChoiceFlow.vue'
// 1.4 元素 / 标签 / 属性 / 内容拆解图（代码 token + 区间括号 + 中文标签，坐标由 DOM 实测得出，
// 取代原先写在 ```html 代码块里、靠数空格对齐的 ASCII 箭头图）
import HtmlElementAnatomy from './components/HtmlElementAnatomy.vue'
// Vuex 与 Pinia 核心概念对照图（左 Vuex 5 概念 / 右 Pinia 6 概念，正文 frameworks/stores 第 4 章使用）
import StoreConceptMapping from './components/StoreConceptMapping.vue'
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

    // 前端安全「攻防全景」思维导图（@vue-flow/core 实现），供正文 Markdown 直接使用
    ctx.app.component('FrontendSecurityMindmap', FrontendSecurityMindmap)

    // 浏览器存储机制选择决策树（@vue-flow/core 实现），供 browser-storage 2.2 节使用
    ctx.app.component('StorageDecisionTree', StorageDecisionTree)

    // 小程序「从 0 到 1」开通流程图（@vue-flow/core 实现，三行蛇形布局），供 wechat-miniprogram 2.1 节使用
    ctx.app.component('MiniprogramSetupFlow', MiniprogramSetupFlow)

    // 小程序「发布全流程（六步）」（@vue-flow/core 实现，主列 + 被拒支线 + 备案门槛），
    // 供 wechat-miniprogram 23.2 节使用（原 mermaid 图）
    ctx.app.component('MiniprogramReleaseFlow', MiniprogramReleaseFlow)

    // 小程序「双线程模型」（@vue-flow/core 实现，三层板块容器 + Native 中转连线），
    // 供 wechat-miniprogram 5.1 节使用（原 mermaid 图）
    ctx.app.component('MiniprogramDualThreadFlow', MiniprogramDualThreadFlow)

    // 前端打包构建工具「流程 / 依赖 / 生态 / 选型」四张图（@vue-flow/core 实现，variant 切换），
    // 供 engineering/build-tools 1.2 / 1.3 / 1.6 / 11.1 节使用
    ctx.app.component('BuildToolsFlow', BuildToolsFlow)

    // —— 以下 7 个组件：把 frameworks/app-development 中 7 张 mermaid 流程图重构为 @vue-flow/core ——
    // 1.7 混合 App 的三层结构与 JSBridge
    ctx.app.component('HybridAppLayers', HybridAppLayers)
    // 3.2 选型决策树（前端开发者视角）
    ctx.app.component('TechSelectionDecisionTree', TechSelectionDecisionTree)
    // 五、从 0 到 1：完整项目开发流程（17 步）
    ctx.app.component('FullDevWorkflow', FullDevWorkflow)
    // 8.1 缓存的分层模型（一张图看懂）
    ctx.app.component('CacheLayerModel', CacheLayerModel)
    // 8.5 图片缓存（流量与内存的最大头）
    ctx.app.component('ImageCacheThreeTier', ImageCacheThreeTier)
    // 11.2 iOS 上架流程
    ctx.app.component('IOSReleaseFlow', IOSReleaseFlow)
    // 17.1 前端开发者转移动端（推荐路线）
    ctx.app.component('FrontendToMobileRoadmap', FrontendToMobileRoadmap)

    // 08 响应式与自适应如何选择（8.1 决策树）
    ctx.app.component('ResponsiveAdaptiveDecisionTree', ResponsiveAdaptiveDecisionTree)
    // 大屏适配（10 选型决策树）
    ctx.app.component('DataScreenSelectionDecisionTree', DataScreenSelectionDecisionTree)

    // 6.3 HTML Entry 加载流程（加载主链 + 路由离开卸载分支）
    ctx.app.component('MicroFrontendHtmlEntryFlow', MicroFrontendHtmlEntryFlow)

    // —— 以下 3 个组件：把正文里的纯文本图（缩进树 / 箭头链 / 判定分支）重构为 @vue-flow/core ——
    // 1. 学习地图：JS 的全貌（三级横向树）
    ctx.app.component('JsOverviewMap', JsOverviewMap)
    // 2.3 组合策略（业务场景 → 推荐策略组合）
    ctx.app.component('LongListCombinationFlow', LongListCombinationFlow)
    // 1.3 加载流程视角（variant="loading"）/ 3.3 缓存完整判定流程（variant="cache"）
    ctx.app.component('FrontendPerformanceFlow', FrontendPerformanceFlow)

    // —— CSS / CSS3 篇三张图（@vue-flow/core）——
    // 3.1 盒模型（同心四层）
    ctx.app.component('CssBoxModelDiagram', CssBoxModelDiagram)
    // 8.1 Flex 术语图（容器 / item / 主轴 / 交叉轴）
    ctx.app.component('CssFlexContainerDiagram', CssFlexContainerDiagram)
    // 9.7 Flex 与 Grid 如何选型（决策树）
    ctx.app.component('FlexGridChoiceFlow', FlexGridChoiceFlow)

    // 1.4 元素、标签、属性、内容拆解图（标签名 / 属性 / 内容 / 结束标签）
    ctx.app.component('HtmlElementAnatomy', HtmlElementAnatomy)

    // Vuex 与 Pinia 核心概念对照图（正文 frameworks/stores 第 4 章）
    ctx.app.component('StoreConceptMapping', StoreConceptMapping)

    // 启用 mermaid 客户端渲染
    setupMermaid(ctx.router)
  },
} satisfies Theme
