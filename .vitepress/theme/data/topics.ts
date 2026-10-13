/**
 * 首页数据：分类地图、站点信息、资料补充。
 * 标题、链接、数字全部来自仓库中已有内容（详见各 md 文件与 public/roadmaps）。
 */
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

export const docCount = 28
export const roadmapCount = 47
export const categoryCount = 5

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
      { text: '前端性能', link: '/fundamentals/front-end-performance/' },
      { text: '前端安全', link: '/fundamentals/frontend-security/' },
      { text: 'WebSocket', link: '/fundamentals/websocket/' },
      { text: '超长列表优化', link: '/fundamentals/long-list-optimization/' },
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
      { text: 'Git', link: '/engineering/git/' },
      { text: '微前端', link: '/engineering/micro-frontend/' },
    ],
  },
]

/**
 * 首页「内容概览」数据行：每行 2 个指标（单行 2 项 → divide-x 正确），
 * 行与行之间是单列 → divide-y 正确。
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

/** 首页「站点怎么用」清单（浅色区块用 list-disc，深色区块用 checkmark-list） */
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
