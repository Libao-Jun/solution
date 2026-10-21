#!/usr/bin/env node
/**
 * 临时产物边界校验（规范见 AGENTS.md §4.1.1）。
 *
 * 背景：2026-10-21 曾把无头浏览器的 `--user-data-dir` 指向仓库根目录做截图校验，
 * 一个浏览器 profile 目录就产生上千个文件，`git status` 瞬间多出 1447 个未跟踪条目。
 * 本脚本把「临时产物不得落在仓库里」这条红线变成可执行的检查：
 *
 *   pnpm run check:temp
 *
 * 命中任意一项即打印路径并以退出码 1 结束；仓库干净时退出码 0。
 * 只做检查、不自动删除——删除是人的决定，脚本不做破坏性动作。
 */
import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()

/** 永不扫描的目录（依赖、版本库、构建产物与缓存） */
const SKIP_ABSOLUTE = ['node_modules', '.git', join('.vitepress', 'cache'), join('.vitepress', 'dist'), join('.vitepress', '.temp')]

/** 命名即临时产物的规则 */
const TEMP_NAME_RULES = [
  { re: /^\.tmp/i, why: '`.tmp*` 前缀' },
  { re: /^tmp-/i, why: '`tmp-*` 前缀' },
  { re: /\.tmp$/i, why: '`*.tmp` 后缀' },
  { re: /^(cdp|chrome|edge)[-_]?profile/i, why: '浏览器 profile 目录' },
]

/** 浏览器 profile 的特征文件（命中即认定整个目录是临时 profile） */
const PROFILE_MARKERS = ['Local State', 'Crashpad']

const findings = []

const isSkipped = (relPath) =>
  SKIP_ABSOLUTE.some((prefix) => relPath === prefix || relPath.startsWith(prefix + sep))

function looksLikeBrowserProfile(absDir) {
  return PROFILE_MARKERS.some((marker) => {
    try {
      statSync(join(absDir, marker))
      return true
    } catch {
      return false
    }
  })
}

function walk(absDir) {
  let entries
  try {
    entries = readdirSync(absDir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const abs = join(absDir, entry.name)
    const rel = relative(ROOT, abs)
    if (isSkipped(rel)) continue

    const nameHit = TEMP_NAME_RULES.find((rule) => rule.re.test(entry.name))
    if (nameHit) {
      findings.push({ rel, why: nameHit.why })
      continue
    }
    if (entry.isDirectory()) {
      if (looksLikeBrowserProfile(abs)) {
        findings.push({ rel, why: '浏览器 profile 目录（含 Local State / Crashpad）' })
        continue
      }
      walk(abs)
    }
  }
}

walk(ROOT)

if (findings.length > 0) {
  console.error(`✗ 检测到 ${findings.length} 处临时产物落在仓库内（违反 AGENTS.md §4.1.1）：`)
  for (const item of findings.slice(0, 50)) {
    console.error(`  - ${item.rel}  （${item.why}）`)
  }
  if (findings.length > 50) console.error(`  … 其余 ${findings.length - 50} 处省略`)
  console.error('\n请全部删除后重跑本检查；临时脚本 / 日志 / 截图 / 浏览器 profile 一律放到系统临时目录。')
  process.exit(1)
}

console.log('✓ 仓库内无临时产物（AGENTS.md §4.1.1 通过）')
