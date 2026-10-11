# AGENTS.md

> 本文件是本仓库的**代理工作规范（规范 / 边界 / 流程）**，面向在本仓库中执行任务的 AI 助手与协作者。
> 站点介绍、首页结构与样式约定见 `README.md`；本文件不重复介绍，只回答三件事：**能改什么（边界）、怎么写（规范）、按什么顺序做（流程）**。
>
> **第一条铁律（先读这条）：修样式、补内容、加需求，都不得影响既有正常功能；任何已修复过的 bug 都不得在后续改动中被覆盖或回退。** 详见 §2.4 与 §2.5。

## 0. 一句话认识本仓库

`solution` 是一个 **VitePress 文档站**：内容全部来自本仓库已有的 Markdown，站点工程只做「渲染 + 导航 + 主题」。
`srcDir` 即仓库根目录，`.vitepress/` 是站点配置与自定义主题，`README.md` 被 `srcExclude` 排除、不生成页面。

---

## 1. 目录地图与真相源

| 路径                                                  | 职责                                                                       | 是否可改                  |
| ----------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------- |
| `fundamentals/`                                       | Web 基础文档（HTML5、浏览器、HTTP、JS、ES6、TS）                           | ✅ 正文可改               |
| `frameworks/`                                         | 框架与端（React、Vue、Svelte、语法对比、Taro、小程序、App）                | ✅ 正文可改               |
| `engineering/`                                        | 工程化与适配（打包构建、Emmet、响应式、数据大屏、H5 唤起）                 | ✅ 正文可改               |
| `roadmaps/`                                           | 学习路线索引页（PDF 原件在 `public/roadmaps/`）                            | ✅ 索引可改，PDF 不改     |
| `career/`                                             | 职业成长（开源许可证、求职与职场）                                         | ✅ 正文可改               |
| `public/`                                             | 静态资源，构建时**原样**复制到站点根                                       | ✅ 新增图片/PDF           |
| `.vitepress/config.mts`                               | **导航 / 侧边栏 / 页脚 / head / markdown 扩展的唯一真相源**                | ✅ 维护级                 |
| `.vitepress/theme/`                                   | 自定义主题：`index.ts`、`Layout.vue`、`styles.css`、`components/`、`data/` | ✅ 维护级                 |
| `.vitepress/theme/data/topics.ts`                     | **首页索引数据的唯一真相源**（`topicGroups` / `categories` / 统计常量）    | ✅ 维护级                 |
| `.agents/skills/`                                     | **Skill 真相源**（`SKILL.md` + `references/` + `agents/`）                 | ✅                        |
| `.codebuddy/skills/`                                  | 指向 `.agents/skills/<name>` 的 **Junction**（供 CodeBuddy 发现）          | ⚠️ 只改链接，不在此写内容 |
| `skills-lock.json`                                    | 锁定第三方 Skill 的来源与哈希                                              | ✅ 新增 skill 时同步      |
| `README.md` / `index.md`                              | 仓库说明 / 首页入口                                                        | ✅                        |
| `.vitepress/dist`、`.vitepress/cache`、`node_modules` | 构建产物与依赖，**已 gitignore**                                           | ❌ 禁止手改/提交          |

> 一句话规则：**内容在分类目录，导航在 `config.mts`，首页在 `data/*.ts`，Skill 在 `.agents/skills/`。** 四者互相引用的部分必须同步改。

---

## 2. 边界（Boundaries）

### 2.1 可以直接做

- 新增 / 编辑 `分类/主题/index.md` 正文。
- 在 `.vitepress/config.mts` 的 `sidebar` / `nav` / `footer` 中登记新页面。
- 在 `.vitepress/theme/data/` 中同步首页索引与统计数字。
- 向 `public/` 增加图片、PDF 等静态资源。
- 在 `.agents/skills/` 下新增本地 Skill。

### 2.2 禁止 / 不要做（除非用户明确要求）

- ❌ 手改或提交 `.vitepress/dist`、`.vitepress/cache`、`node_modules`。
- ❌ 修改 `public/roadmaps/*.pdf` 等二进制原件（只加不改）。
- ❌ 在 `.codebuddy/skills/` 里另写一份内容（它是 Junction，改内容要改 `.agents/skills/` 的源）。
- ❌ 改第三方 Skill（`code-review` / `vitepress` / `vue-best-practices`）的 `SKILL.md` 与 `references/`——它们由上游生成，改内容会与 `skills-lock.json` 的哈希失配；需要定制请**新建**自己的 Skill。
- ❌ 升级 `vitepress`（当前 `2.0.0-alpha`）、`@voidzero-dev/vitepress-theme`、`vue` 等核心依赖版本。
- ❌ 改 `srcDir`、删除 `srcExclude: ['README.md']`、改动首页布局骨架（`Layout.vue` / `components/Home.vue` 的区块顺序）。
- ❌ 手动把正文里的 `{{PLACEHOLDER}}` 改写成 HTML 实体或 `<code>`——渲染期已由 `config.mts` 统一转义，源文件必须保持原样。
- ❌ 使用 `npm` / `yarn`（本仓库统一 `pnpm`，见 `packageManager`）。

### 2.3 需要先与用户确认

- 新增**内容分类**（新开一个顶层目录，如 `ai/`）——涉及 nav、sidebar、footer、首页、README 五处联动。
- 删除或重命名**已存在的路由**（`/分类/主题/`）——会破坏站内/外部链接与锚点。
- 大规模重排导航顺序、或改动 `styles.css` 里的布局宽度变量。
- 改动首页组件结构与 Tailwind 网格边框写法（易触发「缺边框」回归，见 README 的网格约定）。

### 2.4 ★ 不可回退原则（回归红线）

> 无论修样式、补内容还是加新需求，都必须遵守以下三条。这是硬性约束，优先级高于「让新需求更好看/更简洁」。

1. **不得影响既有正常功能**：改动前先明确「这次要动的东西被谁依赖」，改完后原有的导航、侧边栏、首页区块、搜索、深色模式、右侧目录、《本页目录》锚点、PDF 链接等必须**和改动前一致地正常工作**。
2. **不得覆盖已修复的 bug**：历史修复过的坑（见下方清单）在后续任何改动中都**不得被推翻或"顺手整理掉"**。若确实需要动，必须先说明理由并取得用户确认，且改动后要重新验证原问题不再复现。
3. **只做加法，谨慎做减法**：新增需求允许新增文件/新增配置项；删除、重命名、重排既有内容属于高风险动作，必须先确认影响面（谁引用了它：`config.mts`、`data/topics.ts`、`README.md`、正文交叉链接）。

### 2.5 已修复问题防回归清单（改动相关文件前先读）

| 位置 | 已修复的坑 | 不得回退为 |
| --- | --- | --- |
| `.vitepress/config.mts` `markdown.config` | `escape-double-braces` 规则 + `code_inline` 加 `v-pre`，解决正文 `{{PLACEHOLDER}}` 被 Vue 当作插值报错 | 移除/简化这两段转义 |
| `.vitepress/config.mts` | `srcExclude: ['README.md']`，README 不生成页面 | 删除该项导致 README 被编译 |
| `.vitepress/config.mts` | `cleanUrls: true` + 链接统一带尾斜杠 | 改回不带尾斜杠导致 404 |
| `.vitepress/config.mts` | `ignoreDeadLinks: true`（保留原文交叉链接） | 关掉导致构建因历史链接失败 |
| `.vitepress/theme/styles.css` | 「布局宽度统一配置」段 4 个变量映射到 VitePress 官方变量 | 在别处零散写死宽度 |
| `.vitepress/theme/index.ts` | `themeContextKey` 覆盖 `logoDark/logoLight/footerBg/monoIcon` | 删掉覆盖导致品牌资源失效 |
| `.vitepress/theme/Layout.vue` | 首页运行时同步 `data-theme="light"`，避免系统深色偏好污染首屏 | 移除该同步逻辑 |
| 首页网格（`Home.vue` / `data/topics.ts`） | 带边框网格单元格数**整除列数**（3/4/2），多条目列表放格子内做单列 `divide-y`，横向网格补 `divide-x-0 <bp>:divide-x` | 直接给会换行的网格套 `divide-x/y`，导致末行缺边框 |
| `.codebuddy/skills/<name>` | 指向 `.agents/skills/<name>` 的 Junction | 改成复制两份内容导致源漂移 |

> 遇到「新需求要求推翻清单中某项」时：**先停下来说明冲突并征询用户**，不要自行判断「这次可以例外」。

---

## 3. 规范（Standards）

### 3.1 内容组织规范

- 每个主题是 `<分类>/<主题>/index.md`，对应路由 `/<分类>/<主题>/`。
- **目录名用小写英文 + kebab-case**（如 `responsive-vs-adaptive`、`data-screen-adaptation`），不使用中文或驼峰。
- 站点开启 `cleanUrls: true`，站内链接一律写成**带尾斜杠的绝对路径**：`/fundamentals/http/`。
- 新增主题的原文链接（参考资料）保留在文首引用块，不做改写。

### 3.2 文档书写规范（新增 / 编辑 `xx.md` 必须遵守）

文档骨架（与现有文档一致）：

```md
# <主题> 标题

> 参考资料：[名称](链接)、[名称](链接)
> 面向角色：<如 中高级前端工程师>。一句话说明本手册的侧重点与覆盖范围。

---

## 目录

1. [第一章标题](#一第一章标题)
2. [第二章标题](#二第二章标题)

---

## 一、第一章标题

### 1.1 小节标题

正文……
```

硬性要求：

- **标题层级不跳级**：`#` → `##` → `###`，正文从 `##` 开始。
- 文首必须有 **H1 + 引用块**（参考资料 + 面向角色/文档定位）。
- 章节编号用「`## 一、` / `### 1.1`」体例，`## 目录` 的编号与正文标题一一对应（锚点由标题自动生成）。
- 代码块**必须标注语言**（`js / `bash / `ts / `text），可复制的命令、配置、片段优先。
- 中文正文使用中文标点；中英文/数字之间保留一个空格；不滥用 emoji。
- 表格列对齐（`| --- |`），行内术语首次出现给中英对照（如 `跨域（CORS）`）。
- 图片、PDF 等资源放 `public/`，正文用绝对路径引用，如 `/roadmaps/beginner/frontend-beginner.pdf`、`/foo/diagram.png`。
- **不留空章节、不留 TODO**；内容风格与同分类其他文档保持一致。
- 占位符 `{{PLACEHOLDER}}` 原样保留（渲染期统一转义）。

### 3.3 VitePress 工程规范

- 导航、侧边栏、页脚、head、搜索**只在 `.vitepress/config.mts` 维护**，不要在页面里硬编码。
- 侧边栏分组与内容目录一一对应；`nav` 的 `activeMatch` 保持 `^/<分类>/` 形式。
- 自定义主题入口 `.vitepress/theme/index.ts`；页面布局覆写在 `Layout.vue`；样式集中在 `styles.css`。
- 全局宽度只改 `styles.css` 的「布局宽度统一配置」段（`--site-layout-width` 等 4 个变量），改一处全站生效。
- 首页数据只改 `.vitepress/theme/data/topics.ts`（索引与统计）与 `terminal.ts`（终端演示）。
- 首页带边框网格：**单元格数必须整除列数**（3 格 3 列、4 格 2×2、2 格 2 列）；多条目列表放进格子内做单列 `divide-y`；横向网格补 `divide-x-0 <bp>:divide-x`。
- `topics.ts` 的 `docCount` / `roadmapCount` / `categoryCount` 必须与实际情况同步，不能留旧值。

### 3.4 Skill 规范（`.agents/skills/` 与 `.codebuddy/skills/`）

一个 Skill 的标准结构：

```text
.agents/skills/<name>/
├── SKILL.md            # 必需：front-matter + 指令集
├── references/         # 可选：细节参考文档（由 SKILL.md 以表格索引）
│   └── <topic>.md
├── agents/
│   └── openai.yaml     # 可选：界面展示信息
└── GENERATION.md       # 生成类 Skill：来源 / SHA / 生成日期
```

`SKILL.md` front-matter 约定：

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

正文约定（参考 `.agents/skills/code-review/SKILL.md`）：

- 先一段「这个 Skill 做什么」，再进入 `## Process` 的**编号步骤**，全程祈使句。
- 需要细节时把内容拆到 `references/<topic>.md`，在 SKILL.md 用**表格**给出「主题 / 说明 / 参考文件」索引。
- `agents/openai.yaml` 只写展示信息：

```yaml
interface:
  display_name: "Code Review"
  short_description: "Review a diff on standards and spec"
```

- `.codebuddy/skills/<name>` 必须是指向 `.agents/skills/<name>` 的 **Junction**（Windows：`cmd /c mklink /J "路径\.codebuddy\skills\<name>" "路径\.agents\skills\<name>"`），**不要复制两份内容**。
- 新增**第三方** Skill 后，在 `skills-lock.json` 登记 `source` / `sourceType` / `skillPath` / `computedHash`。

### 3.5 提交信息规范

采用 Conventional Commits，描述用中文，形如：

```text
feat(<主题>): 新增 <主题> 文档
fix(<主题>): 修复 <问题>
chore(<主题>): 优化和补充 <内容>
```

一次提交只做一件事；新增文档的提交不应夹带主题/配置无关改动。

---

## 4. 流程（Workflows）

### 4.0 总流程总览

```text
收到需求
  │
  ├─ 新增主题文档 ─────────→ §4.2（含五处联动清单）
  ├─ 编辑已有文档 ─────────→ §4.3
  ├─ 改导航 / 侧栏 / 首页 ─→ §4.4
  ├─ 新增 / 更新 Skill ────→ §4.5
  └─ 评审他人改动 ─────────→ §4.6
  │
  ▼
【改前】确认影响面：谁引用了要改的东西？是否触碰 §2.5 防回归清单？  ← 必做
  │
  ▼
§4.1 本地验证（dev 逐页点开 + build 通过）
  │
  ▼
【改后】回归验证：改动点 + 原有功能 + 清单项逐条确认无回归   ← 必做
  │
  ▼
§5 完成前自检清单
  │
  ▼
提交（§3.5）
```

### 4.1 本地开发与验证（含回归验证）

任何一次改动都必须走完「改前确认影响面 → 改 → 改后回归验证」，**不得只验证新功能**：

**改前（确认影响面）**

1. 定位要改的文件，并列出它被谁引用（`config.mts` / `data/topics.ts` / `README.md` / 正文交叉链接 / 主题组件）。
2. 对照 §2.5 防回归清单，确认本次改动是否触碰清单中的模块；若触碰，按 §2.4 规则先说明并取得确认。

**改后（回归验证）**

1. 验证本次改动本身生效（新内容/新样式达到预期）。
2. 验证「改动点周边」的原有功能未被影响：同页其他区块、同分组其他页面、首页、搜索、深色模式。
3. 验证清单项未被回退：`{{}}` 占位符仍正常显示、`README.md` 仍未生成页面、页内目录锚点仍可跳转、首页网格仍无缺边框、品牌 Logo/页脚背景仍正常。
4. `pnpm run build` 通过（构建期错误即视为回归，必须修完再提交）。



```bash
pnpm install       # 安装依赖
pnpm run dev       # 本地开发，默认 http://localhost:5173
pnpm run build     # 构建校验：md 语法、花括号插值、死链等都会在此暴露
pnpm run preview   # 预览构建产物
```

- **只用 `pnpm`**。
- 任何内容或配置改动，结束前必须能 `pnpm run build` 通过。

### 4.2 ★ 新增 `xx.md`（新增主题文档）标准流程

**Step 1 · 定位置**
确认分类（`fundamentals/` `frameworks/` `engineering/` `career/` 或新分类）与主题目录名（小写 kebab-case）。新分类先按 §2.3 与用户确认。

**Step 2 · 建文件**
`<分类>/<主题>/index.md`。

**Step 3 · 写头部**
H1 标题 + 引用块（参考资料、面向角色/文档定位）。

**Step 4 · 写目录**
`## 目录` 编号索引，条目与正文章节标题严格一致。

**Step 5 · 写正文**
按 `## 一、…` → `### 1.1 …` 展开；代码块标语言；表格对齐；遵守 §3.2 全部硬性要求。

**Step 6 · 挂到站点（关键，必须逐项核对）**

| #   | 文件                                   | 要改什么                                                                                |
| --- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| a   | `.vitepress/config.mts` → `sidebar`    | 对应分组 `items` 追加 `{ text: '<标题>', link: '/<分类>/<主题>/' }`                     |
| b   | `.vitepress/config.mts` → `nav`        | **仅新分类时**：加一项 `{ text, link: '/<分类>/<主题>/', activeMatch: '^/<分类>/' }`    |
| c   | `.vitepress/config.mts` → `footer.nav` | **仅新分类/需曝光时**：把链接加入合适分组                                               |
| d   | `.vitepress/theme/data/topics.ts`      | `topicGroups` 对应分组追加 `{ title, details, link }`；必要时补 `categories` 的 `chips` |
| e   | `.vitepress/theme/data/topics.ts`      | 同步 `docCount`（若计入统计）                                                           |
| f   | `README.md`                            | 更新「内容目录分类」表（仅新增分类/主题时）                                             |

**Step 7 · 附随资源（如有）**
图片/PDF 放 `public/<子目录>/`，正文用绝对路径引用；
若属学习路线，另需同步 `roadmaps/index.md` 列表与 `topics.ts` 的 `roadmapCount`。

**Step 8 · 验证（新增 + 回归）**
`pnpm run dev` 后逐页点开：左侧对应分组、顶部导航、首页索引/统计、右侧「本页目录」全部正确 → **再按 §4.1 回归验证确认既有页面未受影响** → `pnpm run build` 通过。

**Step 9 · 提交**
`feat(<主题>): 新增 <主题> 文档`。

> 一张「新增文档检查清单」：

- [ ] `<分类>/<主题>/index.md` 已创建，结构符合 §3.2
- [ ] `config.mts` sidebar 已登记（漏登记 = 页面构建出来但侧栏里找不到）
- [ ] 新分类已同步 nav、footer、README 表
- [ ] `data/topics.ts` 索引与统计常量已同步
- [ ] 附随资源已放 `public/` 并用绝对路径引用
- [ ] **既有导航 / 侧栏 / 首页 / 搜索未受影响（§4.1 回归验证）**
- [ ] `pnpm run build` 通过
- [ ] 提交信息符合 §3.5

### 4.3 编辑已有文档

1. 只改正文内容，**不随意重排章节顺序**（锚点会变，破坏外部链接）。
2. 若必须改标题，需同步 `## 目录` 中对应条目及站内引用该锚点的链接。
3. 若篇幅增加导致 `topics.ts` 的 `details` 描述不再准确，一并更新。
4. 改完后确认同文档内其他章节、其他页面的交叉链接与锚点仍可跳转（回归验证）。
5. `pnpm run build` 通过后提交（`fix` / `chore`）。

### 4.4 新增 / 更新导航、侧边栏、首页

1. 先确认在 `config.mts` 还是 `data/topics.ts`，不要两处各写一份。
2. 侧边栏与内容目录保持一致顺序；`nav.activeMatch` 保持 `^/<分类>/`。
3. 首页若增删格子，必须回到 §3.3 的网格边框规则：格子数整除列数，列表放格子内做单列 `divide-y`，横向网格补 `divide-x-0 <bp>:divide-x`。
4. 同步 `docCount` / `roadmapCount` / `categoryCount`。
5. **不得改变既有导航项的顺序与链接文本**（除非用户要求）；新增项追加在分组末尾。
6. `pnpm run dev` 逐屏核对**且确认其余分类的导航/侧栏/首页区块无变化**，`pnpm run build` 通过后提交。

### 4.5 新增 / 更新 Skill

1. 在 `.agents/skills/<name>/` 建 `SKILL.md`（front-matter 见 §3.4），细节拆到 `references/`。
2. 需要界面展示信息时加 `agents/openai.yaml`；生成类附 `GENERATION.md`。
3. 建 Junction：`.codebuddy/skills/<name>` → `.agents/skills/<name>`。
4. 第三方来源的 Skill 在 `skills-lock.json` 登记来源与哈希。
5. 不改动上游第三方 Skill 的既有内容。

### 4.6 评审流程（复用 `code-review` Skill）

评审一个分支 / PR / 未提交改动时，按 `.agents/skills/code-review/SKILL.md` 的**双轴**执行：

1. 固定比较基点（commit / branch / tag），用 `git diff <fixed-point>...HEAD`（三点，对比 merge-base）。
2. **Standards 轴**：是否遵守本文件的 §3 各项规范（含 `config.mts` / `topics.ts` 是否同步）。
3. **Spec 轴**：是否如实实现了需求，有无缺项与范围蔓延。
4. **Regression 轴（本仓库补充轴）**：diff 中是否有「删除/重写既有内容」「触碰 §2.5 防回归清单」的动作？若有，是否给出了理由并保持了原有行为？逐条对照 §2.5 清单确认未被回退。
5. 三轴分别输出、**不合并、不重排**；各自给出最好/最差结论。

---

## 5. 完成前自检清单

- [ ] 改动的文件都在 §2.1 允许范围内，没有触碰 §2.2 的红线。
- [ ] **确认过「谁引用了本次要改的东西」，并已在改后回归验证既有功能未受影响（§2.4 / §4.1）。**
- [ ] **未覆盖任何已修复的 bug：逐条对照 §2.5 防回归清单，无一项被回退。**
- [ ] 内容按 `<分类>/<主题>/index.md` 组织，链接为带尾斜杠的绝对路径。
- [ ] 文档结构符合 §3.2（H1 + 引用块 + 目录 + 编号章节 + 代码块标语言）。
- [ ] `config.mts`（sidebar / nav / footer）与 `data/topics.ts`（索引 / 统计）已同步。
- [ ] 首页网格仍满足「格子数整除列数」，未引入缺边框。
- [ ] `{{PLACEHOLDER}}` 占位符仍正常渲染，`README.md` 仍未生成页面，页内目录锚点仍可跳转。
- [ ] `pnpm run build` 通过。
- [ ] 提交信息符合 §3.5，且一次提交只做一件事。
