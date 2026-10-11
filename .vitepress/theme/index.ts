import { VoidZeroTheme, themeContextKey } from '@voidzero-dev/vitepress-theme'
// withBase：品牌资源是写死的根路径，子路径部署下会被解析到域名根目录，需按 base 补全
import { withBase, type Theme } from 'vitepress'

import Layout from './Layout.vue'
import './styles.css'

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
  },
} satisfies Theme
