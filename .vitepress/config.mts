import type { VoidZeroThemeConfig } from '@voidzero-dev/vitepress-theme'
import { extendConfig } from '@voidzero-dev/vitepress-theme/config'
import type { HeadConfig, PageData } from 'vitepress'
import { defineConfig } from 'vitepress'

/**
 * 侧边栏分组与内容目录一一对应：
 *   fundamentals/ Web 基础      frameworks/ 框架与端
 *   engineering/  工程化与适配  roadmaps/   学习路线   career/ 职业成长
 */
const sidebar = [
  {
    text: 'Web 基础',
    items: [
      { text: 'HTML5 知识指南', link: '/fundamentals/html5/' },
      { text: '浏览器核心知识手册', link: '/fundamentals/browser/' },
      { text: 'HTTP / HTTPS 核心知识手册', link: '/fundamentals/http/' },
      { text: 'JavaScript 知识点指南', link: '/fundamentals/javascript/' },
      { text: 'ECMAScript 6 知识指南', link: '/fundamentals/ecmascript-6/' },
      { text: 'TypeScript 入门到精通指南', link: '/fundamentals/typescript/' },
    ],
  },
  {
    text: '框架与端',
    items: [
      { text: 'React 开发规范', link: '/frameworks/react/' },
      { text: 'Vue 开发规范', link: '/frameworks/vue/' },
      { text: 'Svelte 开发规范与指南', link: '/frameworks/svelte/' },
      { text: 'JS 框架语法对比', link: '/frameworks/js-framework-comparison/' },
      { text: 'Taro 4.x 小程序开发指导', link: '/frameworks/taro/' },
      { text: '微信小程序开发指南', link: '/frameworks/wechat-miniprogram/' },
      { text: 'App 开发完全指南', link: '/frameworks/app-development/' },
    ],
  },
  {
    text: '工程化与适配',
    items: [
      { text: '前端打包构建工具', link: '/engineering/build-tools/' },
      { text: 'Emmet 快速语法', link: '/engineering/emmet/' },
      { text: '响应式与自适应设计', link: '/engineering/responsive-vs-adaptive/' },
      { text: '前端数据大屏通用适配方案', link: '/engineering/data-screen-adaptation/' },
      { text: 'H5 唤起 APP 与跳转应用商店', link: '/engineering/h5-app-invoke/' },
      { text: 'Git 入门、避坑与速查指南', link: '/engineering/git/' },
    ],
  },
  {
    text: '学习路线',
    items: [{ text: 'Roadmaps 总览', link: '/roadmaps/' }],
  },
  {
    text: '职业成长',
    items: [
      { text: '如何选择开源许可证', link: '/career/open-source-license/' },
      { text: '求职 · 简历 · 职场', link: '/career/resume-and-career/' },
    ],
  },
]

/**
 * GitHub Pages 项目站点部署在 https://libao-jun.github.io/solution/ 子路径下：
 * CI（GitHub Actions）构建时使用子路径，本地 dev / preview 仍走根路径。
 * 位于根路径的部署（自定义域名 / 独立站点）无需改动，CI 下把此处改为 '/' 即可。
 */
const base = process.env.CI ? '/solution/' : '/'

/**
 * 页脚导航由主题包（@voidzero-dev/vitepress-theme 的 FooterNav）用原生 `<a :href>` 渲染，
 * 不会自动补 base，所以在配置侧拼一次；base 为 '/' 时结果与原路径一致，本地开发无差异。
 */
const withBase = (path: string) => `${base}${path.replace(/^\//, '')}`

/** 站点标题 / 副标题（titleTemplate 的后缀） */
const siteTitle = 'Solution'
const siteTitleSuffix = '前端解决方案手册'
const siteDescription =
  '前端常用或常见解决方案：HTML、浏览器、HTTP、JavaScript、TypeScript、主流框架、小程序与工程化实践。'
const siteLang = 'zh-CN'
const siteAuthor = 'Libao-Jun'

/**
 * SEO 绝对地址的唯一基准（canonical / sitemap.xml / og:url / og:image）。
 * 「线上地址」与 base 解耦：无论本地构建（base = '/'）还是 CI 构建（base = '/solution/'），
 * canonical 与 sitemap 都指向线上地址，避免把 localhost / 根路径写进搜索引擎索引。
 * 换域名时只改这一处（也可用环境变量 SITE_URL 覆盖，**末尾必须带 /**）。
 */
const siteUrl = process.env.SITE_URL || 'https://libao-jun.github.io/solution/'

/** 站点关键词（keywords meta），与站内分类保持一致 */
const siteKeywords = [
  '前端',
  '前端解决方案',
  '前端手册',
  'HTML5',
  '浏览器',
  'HTTP',
  'JavaScript',
  'ECMAScript 6',
  'TypeScript',
  'React',
  'Vue',
  'Svelte',
  'Taro',
  '微信小程序',
  'App 开发',
  '前端工程化',
  'Git',
  '打包构建',
  '响应式与自适应',
  '数据大屏',
  'H5 唤起 APP',
  '学习路线',
  '开源许可证',
  '求职与职场',
]

/** 社交分享封面图（绝对地址）：当前复用站点图标，后续可换成 1200×630 的 PNG */
const siteOgImage = `${siteUrl}icon.svg`

/**
 * 每页 SEO head：canonical + 页面级 Open Graph / Twitter 字段 + JSON-LD 结构化数据。
 * - 首页输出 WebSite，文档页输出 TechArticle（便于搜索引擎与 AI 准确识别页面实体）
 * - 站点级 head 只放与页面无关的标签，避免同一属性出现两个取值
 */
const buildSeoHead = ({ pageData }: { pageData: PageData }): HeadConfig[] => {
  const relativePath = pageData.relativePath ?? ''
  // fundamentals/html5/index.md → fundamentals/html5/（与 cleanUrls 的路由一一对应）
  const routePath = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  const canonical = new URL(routePath, siteUrl).href
  const title = pageData.title || siteTitle
  const description = pageData.description || siteDescription

  const structuredData =
    relativePath === 'index.md'
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteTitle,
          alternateName: siteTitleSuffix,
          url: siteUrl,
          description: siteDescription,
          inLanguage: siteLang,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title,
          description,
          url: canonical,
          mainEntityOfPage: canonical,
          inLanguage: siteLang,
          author: { '@type': 'Person', name: siteAuthor },
          publisher: {
            '@type': 'Organization',
            name: siteTitle,
            logo: { '@type': 'ImageObject', url: siteOgImage },
          },
          ...(pageData.lastUpdated
            ? { dateModified: new Date(pageData.lastUpdated).toISOString() }
            : {}),
        }

  return [
    ['link', { rel: 'canonical', href: canonical }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(structuredData)],
  ]
}

export default extendConfig(
  defineConfig({
    base,
    title: siteTitle,
    titleTemplate: `:title | ${siteTitleSuffix}`,
    description: siteDescription,
    lang: siteLang,
    cleanUrls: true,
    // 文档保留原始交叉链接，构建时不做死链校验。
    ignoreDeadLinks: true,
    // README 与 AGENTS.md 属于仓库说明 / AI 协作规则，不作为站点页面。
    // （.agents/** 是点目录，VitePress 默认不生成页面。）
    srcExclude: ['README.md', 'AGENTS.md'],
    // 站点级 SEO head：只放与具体页面无关的标签，
    // 与页面强相关的 title / description / url 由 buildSeoHead（transformHead）按页生成。
    head: [
      // VitePress 不会给 head 里的链接补 base，根路径资源需手动拼接
      ['link', { rel: 'icon', type: 'image/svg+xml', href: withBase('/favicon.svg') }],
      ['link', { rel: 'apple-touch-icon', href: withBase('/icon.svg') }],
      ['meta', { name: 'theme-color', content: '#4f30e8' }],
      ['meta', { name: 'author', content: siteAuthor }],
      ['meta', { name: 'keywords', content: siteKeywords.join(',') }],
      ['meta', { name: 'robots', content: 'index, follow' }],
      // 与参考站 ordinary-coder 一致：声明 1 小时缓存（HTML 缓存策略主要由托管方响应头生效）
      ['meta', { 'http-equiv': 'Cache-Control', content: 'max-age=3600' }],
      // Open Graph 分享卡片（标题 / 描述 / 地址按页面覆盖，见 buildSeoHead）
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: siteTitle }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
      ['meta', { property: 'og:image', content: siteOgImage }],
      // Twitter Card 复用同一份元信息
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:image', content: siteOgImage }],
    ],
    // 每页 TDK 与结构化数据：canonical / og:url / og:title / JSON-LD
    transformHead: buildSeoHead,
    /**
     * 主题包（@voidzero-dev/vitepress-theme）页头把 Logo 链接写死成 href="/"，
     * 组件里改不到，子路径部署时在构建产物里补一次 base（只匹配精确的 href="/"，不会动其它链接）。
     * 运行时另有兜底：Layout.vue 的 fixThemeLogoLink（覆盖移动端菜单里才渲染出来的那一个）。
     */
    transformHtml(html) {
      return base === '/' ? html : html.replace(/(<a\b[^>]*?\shref=)"\/"/g, `$1"${base}"`)
    },
    // 页面「最后更新于」：用于文档页脚展示，同时作为 JSON-LD 的 dateModified
    lastUpdated: true,
    sitemap: {
      // 末尾斜杠必须保留：子路径部署时 sitemap 里的地址才会解析到 /solution/ 下
      hostname: siteUrl,
    },
    themeConfig: {
      variant: 'viteplus' as VoidZeroThemeConfig['variant'],
      nav: [
        {
          text: '基础',
          link: '/fundamentals/html5/',
          activeMatch: '^/fundamentals/',
        },
        { text: '框架', link: '/frameworks/react/', activeMatch: '^/frameworks/' },
        {
          text: '工程化',
          link: '/engineering/build-tools/',
          activeMatch: '^/engineering/',
        },
        { text: '学习路线', link: '/roadmaps/', activeMatch: '^/roadmaps/' },
        { text: '职业成长', link: '/career/open-source-license/', activeMatch: '^/career/' },
      ],
      sidebar: {
        '/': sidebar,
      },
      outline: {
        level: [2, 3],
        label: '本页目录',
      },
      search: {
        provider: 'local',
      },
      // 文档页脚展示的更新时间文案（lastUpdated 已在站点级开启）
      lastUpdated: {
        text: '最后更新于',
        formatOptions: {
          dateStyle: 'short',
          timeStyle: 'medium',
        },
      },
      footer: {
        copyright: '前端常用或常见解决方案 · 内容持续更新',
        nav: [
          {
            title: 'Web 基础',
            items: [
              { text: 'HTML5', link: withBase('/fundamentals/html5/') },
              { text: '浏览器', link: withBase('/fundamentals/browser/') },
              { text: 'HTTP / HTTPS', link: withBase('/fundamentals/http/') },
              { text: 'JavaScript', link: withBase('/fundamentals/javascript/') },
              { text: 'TypeScript', link: withBase('/fundamentals/typescript/') },
            ],
          },
          {
            title: '框架与端',
            items: [
              { text: 'React', link: withBase('/frameworks/react/') },
              { text: 'Vue', link: withBase('/frameworks/vue/') },
              { text: 'Svelte', link: withBase('/frameworks/svelte/') },
              { text: '微信小程序', link: withBase('/frameworks/wechat-miniprogram/') },
              { text: 'App 开发', link: withBase('/frameworks/app-development/') },
            ],
          },
          {
            title: '工程化与适配',
            items: [
              { text: '打包构建工具', link: withBase('/engineering/build-tools/') },
              { text: '响应式与自适应', link: withBase('/engineering/responsive-vs-adaptive/') },
              { text: '数据大屏适配', link: withBase('/engineering/data-screen-adaptation/') },
              { text: 'H5 唤起 APP', link: withBase('/engineering/h5-app-invoke/') },
              { text: 'Git 速查指南', link: withBase('/engineering/git/') },
            ],
          },
          {
            title: '其他',
            items: [
              { text: '学习路线', link: withBase('/roadmaps/') },
              { text: '开源许可证', link: withBase('/career/open-source-license/') },
              { text: '求职与职场', link: withBase('/career/resume-and-career/') },
            ],
          },
        ],
      },
    },
    markdown: {
      lineNumbers: false,
      config(md) {
        /**
         * 文档中大量存在 `{{PLACEHOLDER}}` 占位符（正文与行内代码），
         * 会被 VitePress 的 Vue 模板编译当作插值表达式而报错。
         * 这里在渲染阶段统一转义，源 Markdown 保持原样。
         */
        md.core.ruler.push('escape-double-braces', (state: any) => {
          const Token = state.Token
          const braceEntities: Record<string, string> = {
            '{{': '&#123;&#123;',
            '}}': '&#125;&#125;',
          }

          // 把含花括号的文本节点拆成「文本 + 实体」，实体走 html_inline 原样输出
          const splitBraces = (token: any) => {
            const content: string = token.content ?? ''
            if (!content.includes('{{') && !content.includes('}}')) {
              return null
            }

            const parts: any[] = []
            const pattern = /\{\{|\}\}/g
            let cursor = 0
            let match: RegExpExecArray | null

            while ((match = pattern.exec(content)) !== null) {
              if (match.index > cursor) {
                const text = new Token('text', '', 0)
                text.content = content.slice(cursor, match.index)
                parts.push(text)
              }
              const entity = new Token('html_inline', '', 0)
              entity.content = braceEntities[match[0]]
              parts.push(entity)
              cursor = match.index + match[0].length
            }

            if (cursor < content.length) {
              const text = new Token('text', '', 0)
              text.content = content.slice(cursor)
              parts.push(text)
            }

            return parts
          }

          const walk = (tokens: any[]) => {
            for (const token of tokens) {
              if (!token.children) {
                continue
              }
              const children: any[] = []
              for (const child of token.children) {
                const parts = child.type === 'text' ? splitBraces(child) : null
                if (parts) {
                  children.push(...parts)
                } else {
                  children.push(child)
                }
              }
              token.children = children
              walk(children)
            }
          }

          walk(state.tokens)
        })

        // 行内代码同样会被 Vue 编译，补上 v-pre 跳过插值
        const codeInline = md.renderer.rules.code_inline
        if (codeInline) {
          md.renderer.rules.code_inline = (tokens, idx, options, env, self) =>
            codeInline(tokens, idx, options, env, self).replace('<code', '<code v-pre')
        }
      },
    },
  }),
)
