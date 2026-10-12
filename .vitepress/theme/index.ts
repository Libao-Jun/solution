import { VoidZeroTheme, themeContextKey } from '@voidzero-dev/vitepress-theme'
// withBase：品牌资源是写死的根路径，子路径部署下会被解析到域名根目录，需按 base 补全
import { withBase, type Theme } from 'vitepress'

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

async function renderMermaid() {
  if (typeof document === 'undefined') return
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
      el.setAttribute('data-mermaid-processed', 'true')
    } catch (err) {
      el.classList.add('mermaid-error')
      el.textContent = `[mermaid 渲染失败] ${String(err)}`
      console.error('[mermaid] render failed:', err)
    }
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
