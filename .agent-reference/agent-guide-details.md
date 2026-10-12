# Agent 指南细节参考（AGENTS.md 配套参考）

> 本文件是 `AGENTS.md` 的**详细参考**：只放「示例 / 详解 / 扩展步骤」，供执行时对照。规范结论以 `AGENTS.md` 正文为准。
> 路径 `.agent-reference/` 为点目录，VitePress 默认不生成站点页面。

---

## 一、文档书写示例（对应 AGENTS.md §3.2）

### 1. 文档骨架

```md
# <主题> 标题

> 参考资料：
>
> - [名称](链接)
> - [名称](链接)
>
> 面向角色：<如 中高级前端工程师>。一句话说明本手册的侧重点与覆盖范围。

---

## 目录

- [一、第一章标题](#一、第一章标题)
- [二、第二章标题](#二、第二章标题)

---

## 一、第一章标题

### 1.1 小节标题

正文……
```

### 2. 目录锚点规则（手写必错，复制为准）

VitePress 的标题 id 规则：保留中文顿号 `、`、把空格 / `.` / `：` / `+` 转为 `-`、数字开头加 `_` 前缀。正确做法是把鼠标移到标题左侧 `#` 上复制真实链接（详见 `README.md`「文档『目录』锚点规则」）。不要把多个参考资料链接用 `、` 连成一行——「参考资料」必须用引用块内的无序列表（`> - [名称](链接)` 每行一条），列表与「面向角色」之间用一行 `>` 空行分隔。

---

## 二、Skill 结构示例（对应 AGENTS.md §3.4）

### 1. 标准目录结构

```text
.agents/skills/<name>/
├── SKILL.md            # 必需：front-matter + 指令集
├── references/         # 可选：细节参考文档（由 SKILL.md 以表格索引）
│   └── <topic>.md
├── agents/
│   └── openai.yaml     # 可选：界面展示信息
└── GENERATION.md       # 生成类 Skill：来源 / SHA / 生成日期
```

### 2. `SKILL.md` front-matter 样例

```yaml
---
name: <kebab-case 名称>
description: "<一句话说明能力 + 何时使用（Use when ...），第三人称、英文、单行>"
license: MIT # 可选
metadata: # 可选
  author: <来源>
  version: "<版本>"
  source: <生成来源>
---
```

`agents/openai.yaml` 只写展示信息：

```yaml
interface:
  display_name: "Code Review"
  short_description: "Review a diff on standards and spec"
```

Junction 命令（Windows）：`cmd /c mklink /J "路径\.codebuddy\skills\<name>" "路径\.agents\skills\<name>"`。新增第三方 Skill 后，在 `skills-lock.json` 登记 `source` / `sourceType` / `skillPath` / `computedHash`。

---

## 三、新增文档全量排查与检查清单（对应 AGENTS.md §4.2）

### 1. Step 6.5 全量排查命令

用**现有任一文档的路由片段**在整个项目搜索，得到「引用点全集」，再对照 Step 6 确认新文档覆盖全部同类位置：

```bash
rg -n "data-screen-adaptation|/engineering/data-screen-adaptation/" .
```

判定：搜索命中的每一类位置（sidebar / nav / footer / topics.ts / README / 其他正文），新文档都必须同样出现。只要有一类「旧文档在、新文档不在」就是漏改，补齐后再进验证。

### 2. 新增文档检查清单（a~j 逐项打勾，缺一即未完成）

- [ ] (a) `config.mts` sidebar 已登记（漏登记 = 页面能构建但侧栏里找不到）
- [ ] (b)(c) 新分类已加 `nav`（含 `activeMatch`）与 `footer.nav`
- [ ] (d)(e)(f) `topics.ts` 的 `topicGroups` / `categories` / 统计常量已同步
- [ ] (g) `README.md` 表格与相关描述已更新
- [ ] (h) `roadmaps/index.md` 已追加（路线图 PDF）；(i) 资源已放 `public/` 并绝对路径引用
- [ ] (j) 其他文档交叉链接已按需补充
- [ ] **Step 6.5 全量排查已做：旧文档命中过的每一类位置，新文档都已出现**
- [ ] 既有导航 / 侧栏 / 首页 / 搜索未受影响；`pnpm run build` 通过；提交信息符合 §3.5

---

## 四、收尾 Code Review 三轴详程（对应 AGENTS.md §4.6）

流程参考 `.agents/skills/code-review/SKILL.md`，按本仓库实际扩展：

- **Step 1 固定比较基点**：改动未提交时用 `HEAD`（`git diff HEAD`）；评审分支 / PR 时用用户给定的 commit / branch / tag（`git diff <fixed-point>...HEAD`，三点对比 merge-base）。先确认基点可解析且 diff 非空。
- **Step 2 Standards 轴（是否符合 §3）**：逐文件核对内容组织、文档书写（§3.2）、VitePress 工程（§3.3）、Skill（§3.4）、提交信息（§3.5）——重点是 `config.mts` 与 `data/topics.ts` 是否同步、`docCount` 是否更新。**本次为「新增文档」时必须额外执行 §4.2 Step 6.5 全量排查**，任何一类联动缺失即判为规范违背（必修）。
- **Step 3 Spec 轴（是否忠实实现需求）**：核对 (a) 需求要求但缺失 / 只做一半的部分；(b) 未被要求却做了的范围蔓延；(c) 看似实现但实现有误的部分。每条结论引用需求原文或用户原话。
- **Step 4 Regression 轴（本仓库补充轴，权重最高）**：核对 diff 是否存在「删除 / 重写既有内容」「触碰 §2.5 防回归清单」的动作，若有是否给出理由且保持原有行为；逐条对照 §2.5 确认未被回退。
- **Step 5 汇总**：三轴分别输出、**不合并、不重排**，各轴给出「问题数 + 最严重问题」。
- **Step 6 修复与复验（不可省略）**：按 §2.4 判断影响面 → 修复 → 重跑 §4.1 → 重跑 Step 2~5 确认清零。若某条判定为「可接受的取舍」，必须显式说明理由，不得静默放过。
- **Step 7 输出**：向用户简要汇报三轴结论、已修复问题清单、仍未解决项及原因（如有）。

---

## 五、首页实现细则（对应 AGENTS.md §2.6）

见同级文件 `homepage-implementation-notes.md`。

---

## 六、防回归清单条目详解（对应 AGENTS.md §2.5 的「现状」完整说明）

- **markdown 转义**（`config.mts` `markdown.config`）：`escape-double-braces` 规则 + `code_inline` 加 `v-pre`，使正文 `{{PLACEHOLDER}}` 不被 Vue 当插值报错；渲染期统一转义，源文件保持原样。
- **`srcExclude: ['README.md']`**：README 不生成站点页面。
- **`cleanUrls: true`**：站内链接统一带尾斜杠，去掉会 404。
- **`ignoreDeadLinks: true`**：保留原文交叉链接，关闭会因历史死链导致构建失败。
- **布局宽度**（`theme/styles.css`）：「布局宽度统一配置」段 4 个变量映射到 VitePress 官方变量，改一处全站生效。
- **品牌资源**（`theme/index.ts`）：`themeContextKey` 覆盖 `logoDark` / `logoLight` / `footerBg` / `monoIcon`，删掉覆盖品牌资源失效。
- **首屏主题**（`theme/Layout.vue`）：首页运行时同步 `data-theme="light"`，避免系统深色偏好污染首屏。
- **首页网格**（`Home.vue` / `topics.ts`）：带边框网格单元格数**整除列数**（3 格 3 列、4 格 2×2、2 格 2 列）；多条目列表放格内做单列 `divide-y`；横向网格补 `divide-x-0 <bp>:divide-x`。直接给会换行的网格套 `divide-x/y` 末行缺边框。
- **技术栈面板**（`StackIsometric.vue`，2026-10 由 SVG 等距图重构为深色 Bento 面板）：卡片与芯片完全由 `topics.ts` 的 `categories` / `growthBlocks` 数据驱动（新增文档只需在 `topics.ts` 加一条 chip，组件零改动）；`lg:grid-cols-6` 下首行 3 卡各 `lg:col-span-2`、次行 2 卡各 `lg:col-span-3`，每行都整除 6 列；面板恒深色固定 `bg-[#12131d]`、文字固定色，**不用 `data-theme="dark"`**（否则 `border-t` 与相邻浅色区块横线变色）；悬停只动 paint 属性，禁 `transform`（与入场时间线抢 transform / opacity）。把芯片写死进模板、或写死 `data-theme="dark"`、或手算间距失整除均为回退。
- **首页动效**（`animations/motion.ts`）：`gsap.set()` 造起点 + `gsap.to()` 写死终值（**不用 `from()`**——停在中途态，实测 Hero CTA 停在 `opacity: 0`）；`prefers-reduced-motion` 时零动画；GSAP 只能动态 `import()`；`useMotion()` 根节点带 `data-motion-scope`。CSS 先隐藏再由 JS 显形 = JS 失败整块不可见；去 scope 会让同元素两份动画互抢 opacity。
- **`base` 与资源引用**：`base` 按 `process.env.CI` 切换（CI `/solution/`、本地 `/`）；组件 / `head` / 页脚的根路径链接与 favicon 一律经 `withBase()`（组件从 `vitepress` 导入，`config.mts` 用本地同名辅助函数）。写死 `/` 或裸写 `/xxx` 在子路径部署下全 404。
- **页头 Logo 根链接**：主题包写死 `href="/"`——构建期 `transformHtml` 精确匹配补 base，运行时 `fixThemeLogoLink()` 兜底（含移动端菜单动态插入的链接）。删除后子路径部署点 Logo 跳到域名根目录。
- **SEO 三件套**（`config.mts` + `public/`）：站点级 `head`（keywords / robots / OG / Twitter / Cache-Control）+ 每页 `transformHead`（canonical / 每页 OG / JSON-LD `WebSite`·`TechArticle`）+ `lastUpdated` + `sitemap`（`hostname` = `siteUrl`，**末尾斜杠不可去**）+ `public/robots.txt`（含 Sitemap 声明）。删减导致 TDK、canonical、分享卡片、结构化数据、sitemap 地址丢失。

---

## 七、VitePress 工程细节（对应 AGENTS.md §3.3 的展开说明）

- **SEO 细节**：`siteUrl` 与 `base` 解耦——`canonical` / `sitemap` / `og:url` 的唯一基准是 `siteUrl`，换域名只改这一处，或用 `SITE_URL` 覆盖且末尾带 `/`；抓取规则见 `public/robots.txt`。
- **`withBase()`**：`base` 在 CI 下是 `/solution/`，裸写 `/xxx` 会 404。
- **侧边栏**：分组与内容目录一一对应；`nav.activeMatch` 保持 `^/<分类>/`。
- **首页数据**：`terminal.ts` 只放终端演示数据；统计常量必须与实际情况同步，不留旧值。
