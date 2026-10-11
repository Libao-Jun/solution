/**
 * 首页「命令速查」终端演示数据。
 * 命令与输出全部对应当前文档中记录的脚手架 / 开发 / 类型检查 / 构建流程。
 */
export type TerminalTone = 'base' | 'muted' | 'brand' | 'accent' | 'success' | 'warning'

export interface TerminalSegment {
  text: string
  tone?: TerminalTone
  bold?: boolean
}

export interface TerminalLine {
  segments: TerminalSegment[]
  tone?: TerminalTone
}

export interface CommandTranscript {
  id: string
  label: string
  title: string
  command: string
  prompt?: string
  lineDelay?: number
  completionDelay?: number
  lines: TerminalLine[]
}

export const commandTranscripts: CommandTranscript[] = [
  {
    id: 'create',
    label: 'create',
    title: '创建项目',
    command: 'npm create vite@latest my-app -- --template react-ts',
    lineDelay: 220,
    completionDelay: 1000,
    lines: [
      {
        segments: [
          { text: '◇ ', tone: 'accent' },
          { text: 'Scaffolding project in ', tone: 'muted' },
          { text: './my-app', tone: 'brand' },
        ],
      },
      {
        segments: [
          { text: '✓ ', tone: 'success' },
          { text: 'react-ts 模板已生成', tone: 'base' },
          { text: '（详见 React 开发规范 · 0.1）', tone: 'muted' },
        ],
      },
      {
        segments: [
          { text: '→ ', tone: 'brand' },
          { text: 'Next: ', tone: 'muted' },
          { text: 'cd my-app && npm install && npm run dev', tone: 'accent' },
        ],
      },
    ],
  },
  {
    id: 'dev',
    label: 'dev',
    title: '启动本地开发',
    command: 'npm run dev',
    lineDelay: 220,
    completionDelay: 1100,
    lines: [
      {
        segments: [
          { text: 'VITE ', tone: 'brand' },
          { text: 'ready in ', tone: 'muted' },
          { text: '312 ms', tone: 'base' },
        ],
      },
      {
        segments: [
          { text: '➜ ', tone: 'brand' },
          { text: 'Local   ', tone: 'muted' },
          { text: 'http://localhost:5173/', tone: 'accent' },
        ],
      },
      {
        segments: [
          { text: '➜ ', tone: 'muted' },
          { text: 'Network ', tone: 'muted' },
          { text: 'use --host to expose', tone: 'base' },
        ],
      },
      {
        segments: [
          { text: 'press ', tone: 'muted' },
          { text: 'h + enter', tone: 'accent' },
          { text: ' to show help', tone: 'muted' },
        ],
      },
    ],
  },
  {
    id: 'check',
    label: 'check',
    title: '类型检查',
    command: 'npx tsc --noEmit',
    lineDelay: 260,
    completionDelay: 1100,
    lines: [
      {
        segments: [
          { text: '✓ ', tone: 'success' },
          { text: '类型检查通过', tone: 'base' },
          { text: '（--noEmit 不产出文件，适合 CI / 提交前检查）', tone: 'muted' },
        ],
      },
      {
        segments: [
          { text: '→ ', tone: 'brand' },
          { text: 'watch 模式：', tone: 'muted' },
          { text: 'npx tsc --watch', tone: 'accent' },
        ],
      },
    ],
  },
  {
    id: 'build',
    label: 'build',
    title: '生产构建',
    command: 'npm run build',
    lineDelay: 220,
    completionDelay: 1100,
    lines: [
      {
        segments: [
          { text: 'vite ', tone: 'brand' },
          { text: 'building for production...', tone: 'muted' },
        ],
      },
      {
        segments: [
          { text: '✓ ', tone: 'success' },
          { text: '128 modules transformed.', tone: 'base' },
        ],
      },
      {
        segments: [
          { text: 'dist/assets/index-*.js', tone: 'accent' },
          { text: '   146.21 kB │ gzip: 47.06 kB', tone: 'muted' },
        ],
      },
      {
        segments: [
          { text: 'dist/assets/index-*.css', tone: 'brand' },
          { text: '   12.44 kB │ gzip: 3.18 kB', tone: 'muted' },
        ],
      },
      {
        segments: [
          { text: '✓ ', tone: 'success' },
          { text: 'built in ', tone: 'muted' },
          { text: '1.24s', tone: 'base' },
        ],
      },
    ],
  },
]
