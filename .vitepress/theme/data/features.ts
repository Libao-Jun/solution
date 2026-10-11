/**
 * 首页「能力展示区」数据（对应参考站 docs/.vitepress/theme/components/home/Feature*.vue）。
 * 面板结构、classes 与参考站一致：左侧文案 + checkmark-list，右侧渐变视觉 + 代码窗。
 * 文案中的文档标题、命令、数字均来自本仓库已有内容。
 */
import type { TerminalTone } from './terminal'

export interface CodeLine {
  text: string
  tone?: TerminalTone
}

export interface FeatureBullet {
  /** 正文（文档标题） */
  text: string
  /** 追加说明（灰色小字） */
  detail?: string
  link: string
}

export interface FeaturePanel {
  /** 锚点 id，工具栏点击后滚动到这里 */
  id: string
  /** 工具栏标签 */
  label: string
  /** 工具栏图标（16×16 线性图标 path） */
  icon: string[]
  eyebrow: string
  title: string
  description: string
  bullets: FeatureBullet[]
  /** 收录数量说明 */
  meta: string
  /** 右侧渐变色号 1-5 */
  tone: 1 | 2 | 3 | 4 | 5
  /** 代码窗标题 */
  command: string
  lines: CodeLine[]
}

export const featurePanels: FeaturePanel[] = [
  {
    id: 'feature-fundamentals',
    label: '基础',
    icon: [
      'M8 2 2 5l6 3 6-3-6-3Z',
      'M2 8l6 3 6-3',
      'M2 11l6 3 6-3',
    ],
    eyebrow: 'Web 基础 · fundamentals',
    title: 'HTML、浏览器与协议层，一次讲清',
    description:
      '从标签语义与渲染管线，到状态码、缓存协商与 CORS 预检，基础层反复踩的坑都能在这里定位。',
    bullets: [
      { text: 'HTML5 知识指南', detail: '语义化标签、表单、多媒体与存储', link: '/fundamentals/html5/' },
      {
        text: '浏览器核心知识手册',
        detail: '渲染流程、事件循环、缓存与跨域',
        link: '/fundamentals/browser/',
      },
      {
        text: 'HTTP / HTTPS 核心知识手册',
        detail: '请求方法、状态码、缓存协商与安全',
        link: '/fundamentals/http/',
      },
      {
        text: 'JavaScript / ES6 / TypeScript',
        detail: '语言基础、异步编程与类型系统',
        link: '/fundamentals/typescript/',
      },
    ],
    meta: '收录 6 篇文档',
    tone: 1,
    command: '$ npx tsc --noEmit',
    lines: [
      { text: '', tone: 'muted' },
      { text: '✓ 类型检查通过', tone: 'success' },
      { text: '→ 不产出文件，适合 CI / 提交前检查', tone: 'muted' },
      { text: '→ 详见 fundamentals/typescript/index.md', tone: 'brand' },
    ],
  },
  {
    id: 'feature-frameworks',
    label: '框架',
    icon: [
      'M3 3h5v5H3z',
      'M9 3h5v5H9z',
      'M3 9h5v5H3z',
      'M9 9h5v5H9z',
    ],
    eyebrow: '框架与端 · frameworks',
    title: '框架规范与多端落地',
    description:
      'React / Vue / Svelte 的开发规范与语法对照，加上 Taro、微信小程序与 App 的完整落地流程。',
    bullets: [
      { text: 'React 开发规范', detail: '组件、Hooks、状态管理与性能反模式', link: '/frameworks/react/' },
      { text: 'Vue 开发规范', detail: '组合式 API、目录组织与命名约定', link: '/frameworks/vue/' },
      { text: 'Svelte 开发规范与指南', detail: '响应式语法与项目结构', link: '/frameworks/svelte/' },
      {
        text: 'JS 框架语法对比',
        detail: '同一需求在 React / Vue / Svelte 下的写法差异',
        link: '/frameworks/js-framework-comparison/',
      },
      { text: 'Taro 4.x 小程序开发指导', detail: '脚手架、编译与多端适配', link: '/frameworks/taro/' },
      {
        text: '微信小程序开发指南',
        detail: '目录结构、生命周期与调试发布',
        link: '/frameworks/wechat-miniprogram/',
      },
      { text: 'App 开发完全指南', detail: '环境准备到打包签名上架', link: '/frameworks/app-development/' },
    ],
    meta: '收录 7 篇文档',
    tone: 2,
    command: '$ npm create vite@latest my-app -- --template react-ts',
    lines: [
      { text: '', tone: 'muted' },
      { text: '◇ Scaffolding project in ./my-app', tone: 'muted' },
      { text: '✓ react-ts 模板已生成', tone: 'success' },
      { text: '→ cd my-app && npm install && npm run dev', tone: 'brand' },
    ],
  },
  {
    id: 'feature-engineering',
    label: '工程化',
    icon: ['M10.5 2a3.5 3.5 0 0 0-3.2 4.9L2 12.2 3.8 14l5.3-5.3A3.5 3.5 0 0 0 14 5.5l-2 2-1.5-1.5 2-2A3.5 3.5 0 0 0 10.5 2Z'],
    eyebrow: '工程化与适配 · engineering',
    title: '构建配置可以直接抄',
    description:
      'Webpack / Vite / Rollup / tsup 的配置与优化，加上响应式、数据大屏与 H5 唤起 APP 这类端适配方案。',
    bullets: [
      {
        text: '前端打包构建工具',
        detail: 'Webpack / Vite / Rollup / tsup 配置与产物优化',
        link: '/engineering/build-tools/',
      },
      { text: 'Emmet 快速语法', detail: '缩写语法与完整命令集', link: '/engineering/emmet/' },
      {
        text: '响应式与自适应设计',
        detail: '断点方案、视口与单位选择',
        link: '/engineering/responsive-vs-adaptive/',
      },
      {
        text: '前端数据大屏通用适配方案',
        detail: '等比缩放与多屏一致性',
        link: '/engineering/data-screen-adaptation/',
      },
      {
        text: 'H5 唤起 APP 与跳转应用商店',
        detail: 'Scheme / Universal Link 与兜底',
        link: '/engineering/h5-app-invoke/',
      },
    ],
    meta: '收录 5 篇文档',
    tone: 3,
    command: '$ npm run build',
    lines: [
      { text: 'vite building for production...', tone: 'muted' },
      { text: '✓ 128 modules transformed.', tone: 'success' },
      { text: 'dist/assets/index-*.js   146.21 kB │ gzip: 47.06 kB', tone: 'brand' },
      { text: 'dist/assets/index-*.css   12.44 kB │ gzip: 3.18 kB', tone: 'brand' },
      { text: '✓ built in 1.24s', tone: 'success' },
    ],
  },
  {
    id: 'feature-roadmaps',
    label: '路线图',
    icon: [
      'M2 13V4l4-2 4 2 4-2v9l-4 2-4-2-4 2Z',
      'M6 2v9',
      'M10 4v9',
    ],
    eyebrow: '学习路线 · roadmaps',
    title: '47 份学习路线图',
    description:
      '前端、后端、DevOps、AI、语言与平台的完整路线图，按「初学者 / 网站开发 / 语言与平台」三组归档，可离线保存。',
    bullets: [
      { text: '初学者路线', detail: 'frontend / backend / devops / git 4 份', link: '/roadmaps/' },
      { text: '网站开发', detail: 'frontend / backend / full-stack / qa 等 7 份', link: '/roadmaps/' },
      { text: '语言与平台', detail: 'JavaScript、TypeScript、Vue、React、Rust 等 36 份', link: '/roadmaps/' },
      { text: 'PDF 随站点发布', detail: '无需跳转外站，可直接下载', link: '/roadmaps/' },
    ],
    meta: '共 47 份 PDF',
    tone: 4,
    command: 'roadmaps/',
    lines: [
      { text: '├─ beginner/              4 份', tone: 'brand' },
      { text: '├─ website-development/   7 份', tone: 'brand' },
      { text: '└─ languages-platforms/  36 份', tone: 'brand' },
      { text: '→ 全部随站点静态发布，可离线保存', tone: 'muted' },
    ],
  },
  {
    id: 'feature-career',
    label: '成长',
    icon: [
      'M2 5h12v9H2z',
      'M6 5V3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5V5',
    ],
    eyebrow: '职业成长 · career',
    title: '许可证、简历与职场',
    description: '技术之外但更要命的问题：开源许可证怎么选、简历怎么写、面试怎么准备。',
    bullets: [
      {
        text: '如何选择开源许可证',
        detail: 'MIT / Apache / GPL 等常见许可证的区别与适用场景',
        link: '/career/open-source-license/',
      },
      {
        text: '求职 · 简历 · 职场',
        detail: '简历写法、面试准备与职场沟通经验',
        link: '/career/resume-and-career/',
      },
    ],
    meta: '收录 2 篇文档',
    tone: 5,
    command: '$ head -n 4 LICENSE',
    lines: [
      { text: 'MIT         最宽松，允许闭源使用', tone: 'success' },
      { text: 'Apache-2.0  含专利授权与免责声明', tone: 'brand' },
      { text: 'GPL-3.0     衍生作品必须开源', tone: 'warning' },
      { text: '→ 详见 career/open-source-license/', tone: 'muted' },
    ],
  },
]

/** 首页「快速开始」命令卡（对应参考站 home/InstallCommand.vue） */
export const installCommandCards = [
  {
    id: 'scaffold',
    label: '创建项目 · macOS / Linux / Windows',
    command: 'npm create vite@latest my-app -- --template react-ts',
  },
  {
    id: 'check-build',
    label: '检查 + 构建',
    command: 'npx tsc --noEmit && npm run build',
  },
]
