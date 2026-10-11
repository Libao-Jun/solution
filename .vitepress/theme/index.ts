import { VoidZeroTheme, themeContextKey } from '@voidzero-dev/vitepress-theme'
import type { Theme } from 'vitepress'

import Layout from './Layout.vue'
import './styles.css'

export default {
  Layout,
  enhanceApp(ctx) {
    // 复用 VoidZero 主题自带逻辑（写入 data-variant、注册 Badge、同步 frontmatter.theme）
    VoidZeroTheme.enhanceApp(ctx)

    // 覆盖品牌资源（页头 Logo / 页脚背景 / 顶栏图标）
    ctx.app.provide(themeContextKey, {
      logoDark: '/logo.svg',
      logoLight: '/logo-light.svg',
      logoAlt: 'Solution',
      footerBg: '/footer-background.svg',
      monoIcon: '/icon.svg',
    })
  },
} satisfies Theme
