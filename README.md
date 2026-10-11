# solution

前端常用或常见解决方案。

站点基于 [VitePress](https://vitepress.dev) + VoidZero 官方主题（`@voidzero-dev/vitepress-theme`，`viteplus` 变体）搭建，
布局与样式对齐 [Vite+ 文档站](https://viteplus.nodejs.cn/)，内容全部来自本仓库已有文档。

## 本地开发

```bash
pnpm install
pnpm run dev      # 本地开发（默认 http://localhost:5173）
pnpm run build    # 构建静态站点到 .vitepress/dist
pnpm run preview  # 预览构建产物
```

## 内容目录分类

| 目录            | 分类                                                                           |
| --------------- | ------------------------------------------------------------------------------ |
| `fundamentals/` | Web 基础（HTML5、浏览器、HTTP、JavaScript、ECMAScript 6、TypeScript）          |
| `frameworks/`   | 框架与端（React、Vue、Svelte、框架对比、Taro、微信小程序、App 开发）           |
| `engineering/`  | 工程化与适配（打包构建工具、Emmet、响应式与自适应、数据大屏适配、H5 唤起 APP） |
| `roadmaps/`     | 学习路线图索引页（PDF 原件位于 `public/roadmaps/`，随站点原样发布）            |
| `career/`       | 职业成长（开源许可证、求职与职场）                                             |

每个主题为 `<分类>/<主题>/index.md`，对应路由 `/<分类>/<主题>/`。
侧边栏、顶部导航、页脚链接统一在 `.vitepress/config.mts` 中维护；
`public/` 下的文件会原样复制到站点根目录（如 `public/roadmaps/beginner/*.pdf` → `/roadmaps/beginner/*.pdf`）。

> ⚠️ **改完宽度变量后必须「重建 + 重启预览」**
>
> 这四个变量写在 CSS 里，是构建期处理的：
>
> 1. 改完执行 `pnpm run build`（只刷新浏览器不会生效）；
> 2. 用 `pnpm run preview` 预览时**必须重启预览服务**——它在启动时缓存产物文件清单，
>    重新构建后 CSS 文件名哈希会变（如 `style.BwxEpdWy.css` → `style.Bl5zDPSq.css`），
>    旧进程对新文件返回 404，页面会变成**完全无样式**（表现常被误判为「宽度没适配」）。
>    开发阶段用 `pnpm run dev`（Vite dev server）不存在这个问题。

## 首页组成

首页（`index.md` → `.vitepress/theme/Layout.vue` 的 `layout: home` 分支）由以下区块组成，结构与参考站一一对应：

| 区块                                         | 组件                                                     | 对应参考站                                                                                                |
| -------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Hero（标题 + 描述 + 按钮）                   | `components/Home.vue`                                    | `home/Hero.vue`                                                                                           |
| 命令速查终端（标签页 + 逐字动画 + 滚入播放） | `TerminalPanel.vue`、`TerminalTranscript.vue`            | `home/Terminal.vue`                                                                                       |
| 快速开始（说明 + 深色命令卡 + 复制）         | `InstallCommand.vue`                                     | `home/InstallCommand.vue`                                                                                 |
| 三大分类（3 格 / 3 列 + `code` 胶囊）        | `Home.vue`（`categories`）                               | `home/CoreFeature3Col.vue`                                                                                |
| 站点信息（4 格 / 2×2）                       | `Home.vue`（`highlights` / `statRows` / `growthBlocks`） | `home/ProductivityGrid.vue`                                                                               |
| 深色能力展示区（吸顶工具栏 + 5 个面板）      | `FeatureToolbar.vue`、`FeaturePanel.vue`                 | `home/HeadingSection4.vue` + `home/FeatureToolbar.vue` + `home/Feature{DevBuild,Check,Test,Run,Pack}.vue` |
| 收尾大标题                                   | `Home.vue`                                               | `home/HeadingSection3.vue`                                                                                |
| 留白收尾                                     | `Home.vue`                                               | `shared/Spacer.vue`                                                                                       |
| 内容地图（中心节点 + 分类节点连线）          | `ClosingIllustration.vue`                                | `home/HeroRive.vue`（参考站用 Rive 动画，本站自绘 SVG）                                                   |

数据集中在 `.vitepress/theme/data/`：`features.ts`（能力面板 + 命令卡）、`terminal.ts`（终端演示）、`topics.ts`（分类地图 / 站点信息）。

> ⚠️ **网格边框约定（改动首页前务必读）**
>
> Tailwind 的 `divide-x` / `divide-y` 只会给「除第一个子元素之外」的子元素加边框，因此：
>
> - **单列列表 / 单行排列** 用它永远正确；
> - **会换行的网格** 只有「单元格数量整除列数」时才正确（3 格 3 列、4 格 2×2、2 格 2 列）。
>
> 所以首页的带边框网格一律只用**整除列数**的单元格数量（这也是参考站的做法）；条目多的列表
> 放进格子里做**单列 `divide-y` 列表**，不要再堆一层卡片网格——否则最后一行的空格子必然缺边框，
> 看起来就像样式 bug。另外横向网格要补 `divide-x-0 <bp>:divide-x`，避免窄屏堆叠时多出左边框。

## 布局宽度配置

宽度集中在 `.vitepress/theme/styles.css` 的「布局宽度统一配置」段落，改一处即可全站生效：

| 变量                   | 作用                                                           | 当前值             |
| ---------------------- | -------------------------------------------------------------- | ------------------ |
| `--site-layout-width`  | 横向总宽（左侧导航 + 正文 + 右侧「本页目录」，首页营销区同宽） | `100rem`（1600px） |
| `--site-sidebar-width` | 左侧导航栏宽度（移动端抽屉同宽）                               | `272px`            |
| `--site-doc-width`     | 正文内容列宽度                                                 | `900px`            |
| `--site-aside-width`   | 右侧「本页目录」宽度                                           | `224px`            |

这四个变量必须覆盖到的容器（缺一个就会出现「某一横线对不齐」）：

| 选择器                                             | 覆盖对象                         | 主题原本写死的值     |
| -------------------------------------------------- | -------------------------------- | -------------------- |
| `.content-wrapper`                                 | 文档页内容区                     | `90rem`(1440px)      |
| **`.wrapper`（全局）**                             | **页头**、页脚、首页所有 section | `90rem`(1440px)      |
| `.VPLocalNav .container`                           | 移动端「Menu / 本页目录」条      | `90rem`(1440px)      |
| `.VPDoc .content-container`                        | 正文列宽                         | `688px`              |
| `.VPDoc .aside` / `.aside-container`               | 右侧「本页目录」                 | `256px` / `224px`    |
| `.VPSidebar`                                       | 移动端抽屉式侧边栏               | `320px`              |
| `.VPDoc:not(.has-sidebar) .content` / `.container` | 无侧边栏布局                     | `752/784/992/1104px` |

> ⚠️ `.wrapper` **必须写成全局选择器，不能写成 `.marketing-layout .wrapper`**：
> 页头（`header.wrapper`）在文档页根本不是 `.marketing-layout` 的后代，只覆盖后代会让页头比内容区窄 160px。
>
> 升级主题后如再出现宽度不一致，用下面这条命令扫产物里所有**写死的** `max-width`（排除已用 `var()` 的）：
>
> ```powershell
> $t=[IO.File]::ReadAllText((Get-ChildItem '.vitepress\dist\assets\style.*.css')[0].FullName)
> [regex]::Matches($t,'(?s)([^{}@]+)\{([^{}]*max-width:\s*(?!var\()[^;{}]+[^{}]*)\}') |
>   ForEach-Object { $_.Groups[1].Value.Trim() + ' => ' + ([regex]::Match($_.Groups[2].Value,'max-width:\s*([^;{}]+)').Groups[1].Value.Trim()) } |
>   Where-Object { $_ -match 'wrapper|VPDoc|VPSidebar|aside|container' } | Select-Object -Unique
> ```

## 文档「目录」锚点规则（重要）

VitePress 的标题 id 由标题文本按固定规则生成，**不是** GitHub 那种「去掉所有标点」的规则：

| 规则                          | 示例                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------- |
| 中文顿号 `、` 会**保留**      | `## 一、为什么必须选许可证` → `#一、为什么必须选许可证`                           |
| 空格 / `.` / `：` / `+` → `-` | `## 2.1 宽松式（Permissive）` → `#_2-1-宽松式permissive`                          |
| 括号、`&`、引号等会被删除     | `## 7、辅助技术：媒体查询 & CSS 容器查询` → `#_7、辅助技术-媒体查询-css-容器查询` |
| 以数字开头时前缀 `_`          | `## 11、开发最佳实践` → `#_11、开发最佳实践`                                      |
| 英文字母转小写                | `## 十、常见误区与 FAQ` → `#十、常见误区与-faq`                                   |

**不要手写猜锚点。** 本项目原本 15 篇文档里的 233 个「目录」锚点**全部失效**（按 GitHub 规则手写导致），
点目录没有任何反应。修好后的正确写法见各文档开头的「目录」段。

新增或调整章节后，取真实锚点的两种可靠方式：

1. 鼠标移到标题左侧的 `#` 上，链接即真实锚点；
2. 直接看右侧「本页目录（ON THIS PAGE）」里的链接。

> 自查手段：构建后比对 `dist/<分类>/<主题>/index.html` 中的 `<h2 id="...">` 与自己写的 `](#...)`。

## 站点结构调整说明

- 站点的 `srcDir` 即仓库根目录，`.vitepress/` 为站点配置与自定义主题。
- `README.md` 通过 `srcExclude` 排除，不会生成页面。
