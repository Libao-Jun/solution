/**
 * 首页索引数据：标题与链接均取自仓库中已有文档。
 */
export interface Topic {
  title: string
  details: string
  link: string
}

export interface TopicGroup {
  /** 分组标题（mono 小标题） */
  eyebrow: string
  topics: Topic[]
}

export interface CategoryChip {
  text: string
  link: string
}

export interface CategoryCard {
  key: string
  title: string
  details: string
  chips: CategoryChip[]
}

export interface StatItem {
  value: string
  label: string
}

export const docCount = 20
export const roadmapCount = 47
export const categoryCount = 5

/**
 * 四大内容分组。首页以「2×2 带边框网格」呈现（4 个格子刚好整除 2 列），
 * 每个格子内部是单列列表（列表用 divide-y，永远只有上下边框、不会缺线）。
 */
export const topicGroups: TopicGroup[] = [
  {
    eyebrow: 'Web 基础 · fundamentals',
    topics: [
      {
        title: 'HTML5 知识指南',
        details: '语义化标签、表单、多媒体、存储与常用新特性速查。',
        link: '/fundamentals/html5/',
      },
      {
        title: '浏览器核心知识手册',
        details: '渲染流程、事件循环、缓存策略、跨域与兼容性问题排查。',
        link: '/fundamentals/browser/',
      },
      {
        title: 'HTTP / HTTPS 核心知识手册',
        details: '请求方法、状态码、缓存与协商、CORS 预检、HTTPS 与安全。',
        link: '/fundamentals/http/',
      },
      {
        title: 'JavaScript 知识点指南',
        details: '语言基础、原型与继承、异步编程、模块化与常见手写题。',
        link: '/fundamentals/javascript/',
      },
      {
        title: 'ECMAScript 6 知识指南',
        details: 'let/const、解构、模板字符串、Promise、Class、模块等标准特性。',
        link: '/fundamentals/ecmascript-6/',
      },
      {
        title: 'TypeScript 入门到精通指南',
        details: '类型系统、泛型、工具类型、配置项与工程内落地方式。',
        link: '/fundamentals/typescript/',
      },
    ],
  },
  {
    eyebrow: '框架与端 · frameworks',
    topics: [
      {
        title: 'React 开发规范',
        details: '目录结构、组件写法、Hooks 约定、状态管理与工程配置。',
        link: '/frameworks/react/',
      },
      {
        title: 'Vue 开发规范',
        details: '组件与组合式 API 约定、目录组织、命名与最佳实践。',
        link: '/frameworks/vue/',
      },
      {
        title: 'Svelte 开发规范与指南',
        details: '响应式语法、组件通信、生命周期与项目结构约定。',
        link: '/frameworks/svelte/',
      },
      {
        title: 'JS 框架语法对比',
        details: 'React / Vue / Svelte 等框架的写法差异与对照速查。',
        link: '/frameworks/js-framework-comparison/',
      },
      {
        title: 'Taro 4.x 小程序开发指导',
        details: '脚手架初始化、编译流程、多端适配与常用配置。',
        link: '/frameworks/taro/',
      },
      {
        title: '微信小程序开发指南',
        details: '目录结构、生命周期、组件与 API、登录支付与调试发布。',
        link: '/frameworks/wechat-miniprogram/',
      },
      {
        title: 'App 开发完全指南',
        details: '从环境准备到打包签名、上架发布的完整流程。',
        link: '/frameworks/app-development/',
      },
    ],
  },
  {
    eyebrow: '工程化与适配 · engineering',
    topics: [
      {
        title: '前端打包构建工具',
        details: 'Webpack / Vite / Rollup / tsup 等构建工具的配置与优化。',
        link: '/engineering/build-tools/',
      },
      {
        title: 'Emmet 快速语法',
        details: '缩写语法与完整命令集，写 HTML/CSS 的提速手册。',
        link: '/engineering/emmet/',
      },
      {
        title: '响应式与自适应设计',
        details: '断点方案、视口与单位选择、移动端适配与图片处理。',
        link: '/engineering/responsive-vs-adaptive/',
      },
      {
        title: '前端数据大屏通用适配方案',
        details: '大屏等比缩放、分辨率适配与多屏一致性的实现思路。',
        link: '/engineering/data-screen-adaptation/',
      },
      {
        title: 'H5 唤起 APP 与跳转应用商店',
        details: 'URL Scheme、Universal Link、唤起失败兜底与设备判断。',
        link: '/engineering/h5-app-invoke/',
      },
    ],
  },
  {
    eyebrow: '学习路线与成长 · roadmaps & career',
    topics: [
      {
        title: 'Roadmaps 学习路线',
        details: '前后端、DevOps、AI、语言与平台的完整学习路线图（PDF）。',
        link: '/roadmaps/',
      },
      {
        title: '如何选择开源许可证',
        details: '常见许可证的区别、适用场景与选择建议。',
        link: '/career/open-source-license/',
      },
      {
        title: '求职 · 简历 · 职场',
        details: '简历写法、面试准备与职场沟通的实用经验。',
        link: '/career/resume-and-career/',
      },
    ],
  },
]

/** 首页「三大分类」三列区块（对应参考站 CoreFeature3Col，3 个格子整除 3 列） */
export const categories: CategoryCard[] = [
  {
    key: 'fundamentals',
    title: 'Web 基础一座到底',
    details: '把 HTML、浏览器、HTTP 与语言基础串成一条线，遇到问题可以直接按主题定位。',
    chips: [
      { text: 'HTML5', link: '/fundamentals/html5/' },
      { text: '浏览器', link: '/fundamentals/browser/' },
      { text: 'HTTP', link: '/fundamentals/http/' },
      { text: 'JavaScript', link: '/fundamentals/javascript/' },
      { text: 'ES6', link: '/fundamentals/ecmascript-6/' },
      { text: 'TypeScript', link: '/fundamentals/typescript/' },
    ],
  },
  {
    key: 'frameworks',
    title: '框架规范与跨端',
    details: 'React / Vue / Svelte 的开发规范与写法对照，以及小程序与 App 的落地流程。',
    chips: [
      { text: 'React', link: '/frameworks/react/' },
      { text: 'Vue', link: '/frameworks/vue/' },
      { text: 'Svelte', link: '/frameworks/svelte/' },
      { text: '语法对比', link: '/frameworks/js-framework-comparison/' },
      { text: 'Taro', link: '/frameworks/taro/' },
      { text: '微信小程序', link: '/frameworks/wechat-miniprogram/' },
      { text: 'App 开发', link: '/frameworks/app-development/' },
    ],
  },
  {
    key: 'engineering',
    title: '工程化与端适配',
    details: '构建打包、书写效率、多端适配与端能力接入，都是可以直接抄配置的部分。',
    chips: [
      { text: '打包构建', link: '/engineering/build-tools/' },
      { text: 'Emmet', link: '/engineering/emmet/' },
      { text: '响应式/自适应', link: '/engineering/responsive-vs-adaptive/' },
      { text: '数据大屏', link: '/engineering/data-screen-adaptation/' },
      { text: 'H5 唤起 APP', link: '/engineering/h5-app-invoke/' },
    ],
  },
]

/**
 * 首页「内容概览」数据行：每行 2 个指标（单行 2 项 → divide-x 正确），
 * 行与行之间用 divide-y（单列 → 正确）。
 */
export const statRows: StatItem[][] = [
  [
    { value: String(docCount), label: '篇主题文档' },
    { value: String(categoryCount), label: '大内容分类' },
  ],
  [
    { value: String(roadmapCount), label: '份学习路线图' },
    { value: '100%', label: '来自本仓库已有内容' },
  ],
]

/** 首页深色区块的勾选清单（描述本站自身的组织方式） */
export const highlights: string[] = [
  '按 Web 基础 / 框架与端 / 工程化与适配 / 学习路线 / 职业成长分类归档',
  '文档正文保留可直接复制的命令、配置与代码片段',
  '支持全文搜索、本页目录（右侧 ON THIS PAGE）与深浅色切换',
  '学习路线图以 PDF 形式随站点发布，可离线保存',
]

/** 首页「资料补充」双栏区块（对应参考站 Fullstack2Col，2 个格子整除 2 列） */
export const growthBlocks = [
  {
    title: '学习路线图',
    details: '按「初学者 / 网站开发 / 语言与平台」三组整理的路线图 PDF，可离线保存。',
    links: [
      { text: '初学者路线', link: '/roadmaps/#初学者路线' },
      { text: '网站开发', link: '/roadmaps/#网站开发' },
      { text: '语言与平台', link: '/roadmaps/#语言与平台' },
    ],
    action: { text: '查看全部路线图', link: '/roadmaps/' },
  },
  {
    title: '职业成长',
    details: '许可证选择、简历与面试准备这类「非技术但更要命」的问题。',
    links: [
      { text: '如何选择开源许可证', link: '/career/open-source-license/' },
      { text: '求职 · 简历 · 职场', link: '/career/resume-and-career/' },
    ],
    action: { text: '进入职业成长', link: '/career/open-source-license/' },
  },
]
