import type { VoidZeroThemeConfig } from '@voidzero-dev/vitepress-theme'
import { extendConfig } from '@voidzero-dev/vitepress-theme/config'
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

export default extendConfig(
  defineConfig({
    title: 'Solution',
    titleTemplate: ':title | 前端解决方案手册',
    description:
      '前端常用或常见解决方案：HTML、浏览器、HTTP、JavaScript、TypeScript、主流框架、小程序与工程化实践。',
    lang: 'zh-CN',
    cleanUrls: true,
    // 文档保留原始交叉链接，构建时不做死链校验。
    ignoreDeadLinks: true,
    // README 属于仓库说明，不作为站点页面。
    srcExclude: ['README.md'],
    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      ['meta', { name: 'theme-color', content: '#4f30e8' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'Solution' }],
    ],
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
      footer: {
        copyright: '前端常用或常见解决方案 · 内容持续更新',
        nav: [
          {
            title: 'Web 基础',
            items: [
              { text: 'HTML5', link: '/fundamentals/html5/' },
              { text: '浏览器', link: '/fundamentals/browser/' },
              { text: 'HTTP / HTTPS', link: '/fundamentals/http/' },
              { text: 'JavaScript', link: '/fundamentals/javascript/' },
              { text: 'TypeScript', link: '/fundamentals/typescript/' },
            ],
          },
          {
            title: '框架与端',
            items: [
              { text: 'React', link: '/frameworks/react/' },
              { text: 'Vue', link: '/frameworks/vue/' },
              { text: 'Svelte', link: '/frameworks/svelte/' },
              { text: '微信小程序', link: '/frameworks/wechat-miniprogram/' },
              { text: 'App 开发', link: '/frameworks/app-development/' },
            ],
          },
          {
            title: '工程化与适配',
            items: [
              { text: '打包构建工具', link: '/engineering/build-tools/' },
              { text: '响应式与自适应', link: '/engineering/responsive-vs-adaptive/' },
              { text: '数据大屏适配', link: '/engineering/data-screen-adaptation/' },
              { text: 'H5 唤起 APP', link: '/engineering/h5-app-invoke/' },
            ],
          },
          {
            title: '其他',
            items: [
              { text: '学习路线', link: '/roadmaps/' },
              { text: '开源许可证', link: '/career/open-source-license/' },
              { text: '求职与职场', link: '/career/resume-and-career/' },
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
