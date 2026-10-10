# HTML5 知识指南

> 一份面向前端开发工程师的 HTML5 速查与深度学习指南：从入门到精通，覆盖关键基础知识、**全部 HTML 元素与元素类型（meta / self-closing / inline / block / experimental）**、全部属性（全局属性 + 元素专有属性 + 事件属性）以及 HTML5 的 API 能力。
> 适用人群：入门者按「一 ~ 二」顺序渐进；熟练者可直接查阅「三、四」元素/属性速查与「五」API 章节。
>
> 参考资料：
>
> - [HTML 元素与属性速查（元素类型标注体系来源）](https://htmlreference.io/)
> - [HTML 标准官方文档（WHATWG Living Standard）](https://html.spec.whatwg.org/multipage/indices.html)
> - [MDN HTML 参考（补充说明与兼容性）](https://developer.mozilla.org/zh-CN/docs/Web/HTML)

---

## 目录

1. [HTML 基础认知（入门）](#一html-基础认知入门)
2. [从入门到精通：核心知识点](#二从入门到精通核心知识点)
3. [HTML 元素全表（含类型标注）](#三html-元素全表含类型标注)
4. [HTML 属性速查（全局属性 / 专有属性 / 事件属性）](#四html-属性速查)
5. [HTML5 新增 API（进阶到精通）](#五html5-新增-api进阶到精通)
6. [可访问性（A11y）与 SEO](#六可访问性a11y与-seo)
7. [易错点与最佳实践](#七易错点与最佳实践)
8. [速查表](#八速查表)

---

## 一、HTML 基础认知（入门）

### 1.1 HTML 是什么，HTML5 又是什么

| 概念                | 说明                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HTML**            | HyperText Markup Language，超文本标记语言。它是**标记语言**而不是编程语言：用「标签」描述文档的**结构与语义**，不负责样式（CSS）与行为（JavaScript）。                                                  |
| **HTML5**           | 2014 年正式定稿的第五个主要版本（也是第一个由 WHATWG 维护的「Living Standard / 活标准」）。它不仅是新标签，更是一整套**语义化标签 + 表单增强 + 多媒体 + 图形 + 离线存储 + 设备访问 + 通信**的规范集合。 |
| **Living Standard** | HTML 已不再按版本号冻结，而是持续演进。所谓「H5」「HTML5」在工程语境下通常泛指「现代 HTML + CSS3 + ES6+ 的整套 Web 技术」。                                                                             |

一句话区分三者职责：**HTML 负责结构（是什么）→ CSS 负责表现（长什么样）→ JavaScript 负责行为（做什么）**。

### 1.2 最小文档骨架

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>文档标题</title>
  </head>
  <body>
    页面内容
  </body>
</html>
```

- `<!DOCTYPE html>`：**必须放在文档第一行**，告诉浏览器使用「标准模式（standards mode）」渲染。
- `<html>`：根元素，`lang` 属性声明语言（影响朗读、翻译、字体与 SEO）。
- `<head>`：元数据容器，其中的内容基本不直接显示。
- `<body>`：可见内容容器。

### 1.3 DOCTYPE 与渲染模式

| 写法              | 触发模式                  | 后果                                           |
| ----------------- | ------------------------- | ---------------------------------------------- |
| `<!DOCTYPE html>` | **标准模式**（Standards） | 按规范渲染（推荐）                             |
| 缺失 / 写错       | **怪异模式**（Quirks）    | 盒模型、行高、表格等按老 IE 规则渲染，布局错乱 |

> 现代项目只需记住：**永远写 `<!DOCTYPE html>`**。Web 端 `<!doctype html>` 不区分大小写。

### 1.4 元素、标签、属性、内容

```html
<a href="https://example.com" target="_blank" class="link">示例</a>
<!-- └┬┘ └────────┬─────────┘ └────┬─────┘ └─┬──┘ └┬┘ -->
<!-- 标签名   属性名=属性值（多个）    属性       内容  结束标签 -->
```

| 组成                       | 说明                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **开始标签 / 结束标签**    | `<p>` … `</p>`。结束标签可省略的元素（如 `li`、`p`）由解析器自动补全。                                        |
| **属性（attribute）**      | 写在开始标签内，`名="值"`。布尔属性（如 `disabled`、`checked`）只要有名字即生效，值为该属性名或空串。         |
| **内容（content）**        | 标签之间的文本 / 元素 / 注释。                                                                                |
| **空元素（void element）** | 没有内容、没有结束标签，书写上自闭合：`<br />`、`<img />`、`<input />`、`<hr />`、`<meta />`、`<link />` 等。 |

### 1.5 元素的类型与内容模型（★ 核心基础）

这是理解布局与嵌套规则的**根**，也是本文档第三章「元素全表」的分类依据。

#### 1.5.1 按「显示类型」分类（CSS 层面）

| 类型                    | 默认 `display`                        | 特征                                                        | 典型元素                                               |
| ----------------------- | ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| **块级元素 block**      | `block`                               | 独占一行、可设宽高、垂直堆叠，默认撑满父级宽度              | `div`、`p`、`h1`~`h6`、`ul`、`li`、`section`、`table`  |
| **行内元素 inline**     | `inline`                              | 不换行、宽高由内容决定、`width/height` 与上下 `margin` 无效 | `span`、`a`、`strong`、`em`、`code`、`img`（替换元素） |
| **行内块 inline-block** | `inline-block`                        | 不换行但可设宽高（由 CSS 指定，非 HTML 分类）               | 常显式设置的 `button`、`input`、`img`                  |
| **表格相关**            | `table` / `table-row` / `table-cell`… | 表格内部显示类型                                            | `table`、`tr`、`td`、`th`                              |
| **不显示 none**         | `none`                                | 不参与渲染（元数据/脚本类）                                 | `head`、`meta`、`link`、`script`、`style`、`title`     |

> ⚠️ 注意：**「块级 / 行内」是 CSS 的 `display` 概念，不是 HTML 规范的定义**。HTML 规范用的是「内容模型（Content Model）」。但工程与面试语境下讲「块级/行内元素」完全通用，本文档沿用该口径。

#### 1.5.2 空元素 / 自闭合元素（self-closing / void）

不能有子内容的元素，必须自闭合：

| 空元素                                                                                   | 用途                 |
| ---------------------------------------------------------------------------------------- | -------------------- |
| `area` `base` `br` `col` `embed` `hr` `img` `input` `link` `meta` `source` `track` `wbr` | 全部 13 个 void 元素 |

> 自闭合写法 `<br />` 与 `<br>` 在 HTML 中**等价**；但在 JSX / Vue 模板的编译语境下建议写 `<br />`。

#### 1.5.3 元数据元素（meta elements）

**只出现在 `<head>` 中、为文档提供元信息、本身不渲染**的元素：

| 元素    | 作用                                             |
| ------- | ------------------------------------------------ |
| `base`  | 声明文档中所有相对 URL 的基准地址与默认 `target` |
| `link`  | 链接外部资源（CSS、图标、preload、canonical 等） |
| `meta`  | 字符集、viewport、SEO、社交卡片、http-equiv 等   |
| `style` | 文档内嵌样式表                                   |
| `title` | 文档标题（浏览器标签页文字、搜索引擎标题）       |

> `script`、`template` 属于 **script-supporting / metadata** 内容，也可置于 `head`。

#### 1.5.4 替换元素与非替换元素

| 概念                           | 说明                                    | 例子                                                                       |
| ------------------------------ | --------------------------------------- | -------------------------------------------------------------------------- |
| **替换元素（replaced）**       | 内容由外部资源决定，`width/height` 生效 | `img`、`video`、`iframe`、`canvas`、`input`（部分类型）、`embed`、`object` |
| **非替换元素（non-replaced）** | 内容即标签文本，尺寸由内容/样式决定     | `span`、`p`、`div`、`a`                                                    |

#### 1.5.5 内容模型（Content Model，HTML 规范的真正分类）

| 类别                     | 含义                             | 代表元素                                           |
| ------------------------ | -------------------------------- | -------------------------------------------------- |
| **Metadata**             | 元数据                           | `base` `link` `meta` `style` `title`               |
| **Flow（流内容）**       | body 中可出现的绝大多数元素      | `div` `p` `section` `a` `img`…                     |
| **Sectioning**           | 划分文档大纲的区块               | `article` `aside` `nav` `section`                  |
| **Heading**              | 标题                             | `h1`~`h6` `hgroup`                                 |
| **Phrasing（短语内容）** | 段落内的行内级内容               | `span` `a` `strong` `em` `code` `img` `br`         |
| **Embedded**             | 嵌入外部资源                     | `img` `video` `audio` `iframe` `canvas` `svg`      |
| **Interactive**          | 可交互（不可相互嵌套）           | `a` `button` `input` `select` `textarea` `details` |
| **Palpable**             | 有可感知内容（SEO/可访问性相关） | 有文本的 `p`、有 `alt` 的 `img` 等                 |
| **Script-supporting**    | 脚本支撑                         | `script` `template`                                |
| **Form-associated**      | 与表单关联                       | 表单控件 + `label` `fieldset` `output`             |

> **嵌套铁律（最容易犯错）**：
>
> - `p` 内不能放块级元素（`div`、`p`、`ul`…），浏览器会自动闭合 `p`；
> - `a` 内不能再放 `a`/`button`；`button` 内不能放交互元素；
> - `ul`/`ol` 的直接子元素**只能是 `li`**；`dl` 的直接子元素只能是 `dt`/`dd`；
> - `table` 的直接子元素只能是 `caption`/`colgroup`/`thead`/`tbody`/`tfoot`/`tr`。

### 1.6 语义化（Semantics）

语义化 = **用最贴合内容含义的标签**，而不是全部用 `div` / `span`。

| 反例（无语义）                  | 正例（语义化）     |
| ------------------------------- | ------------------ |
| `<div class="header">`          | `<header>`         |
| `<div class="nav">`             | `<nav>`            |
| `<div onclick="...">`           | `<button>`         |
| `<div class="title">标题</div>` | `<h2>标题</h2>`    |
| `<span class="bold">`           | `<strong>` / `<b>` |

**收益**：① 更利于 SEO 与爬虫理解；② 屏幕阅读器等辅助设备可正确朗读；③ 代码可读、可维护；④ 部分元素自带默认行为（如 `button` 可键盘聚焦、`details` 可折叠）。

---

## 二、从入门到精通：核心知识点

### 2.1 文档元数据：`<head>` 里的元素

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="页面描述，影响搜索结果摘要" />
  <meta name="keywords" content="HTML5,前端" />
  <meta name="theme-color" content="#0ea5e9" />
  <!-- 社交分享卡片（Open Graph / Twitter Card） -->
  <meta property="og:title" content="标题" />
  <meta property="og:image" content="https://example.com/cover.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="canonical" href="https://example.com/page" />
  <title>文档标题</title>
</head>
```

| 元素 / 属性                                             | 说明                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| `<meta charset="UTF-8">`                                | **必须放在 `<head>` 最前面（前 1024 字节内）**，否则可能出现乱码。   |
| `<meta name="viewport" ...>`                            | 移动端视口控制，`width=device-width, initial-scale=1` 是响应式标配。 |
| `<meta http-equiv="refresh" content="5;url=...">`       | 定时刷新/跳转（慎用，影响可访问性）。                                |
| `<link rel="preload/prefetch/dns-prefetch/preconnect">` | 资源预加载与连接优化。                                               |
| `<title>`                                               | 唯一且必需的元数据，不可省略。                                       |
| `<base href target>`                                    | 改变相对路径基准，**全文档只能有一个，且须在其他 URL 之前**。        |

### 2.2 文本内容元素

| 元素                            | 语义                      | 说明                                                           |
| ------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `h1`~`h6`                       | 标题                      | 一级到六级标题，**不可跳级**，页面建议只有一个 `h1`            |
| `p`                             | 段落                      | 块级，不能嵌套块级元素                                         |
| `hr`                            | 主题分隔                  | 语义是「段落级主题转换」，不是单纯画线                         |
| `pre`                           | 预格式化                  | 保留空格与换行，常搭配 `code`                                  |
| `blockquote`                    | 块级引用                  | 用 `cite` 属性标注来源 URL                                     |
| `q`                             | 行内引用                  | 浏览器自动加引号                                               |
| `cite`                          | 作品标题                  | 书、电影、论文标题                                             |
| `strong` / `b`                  | 强调 / 视觉加粗           | `strong` 表**重要性**，`b` 仅样式性强调                        |
| `em` / `i`                      | 强调 / 术语               | `em` 表**重音强调**，`i` 表术语、外语、想法                    |
| `mark`                          | 高亮                      | 搜索命中高亮                                                   |
| `small`                         | 旁注                      | 免责声明、版权                                                 |
| `s` / `del`                     | 删除线 / 删除             | `del` 表文档修订中删除的内容                                   |
| `ins`                           | 插入                      | 与 `del` 配对表示修订                                          |
| `u`                             | 下划线                    | 非文本注释（拼写错误标注），慎用（易与链接混淆）               |
| `sub` / `sup`                   | 下标 / 上标               | 化学式、脚注                                                   |
| `code` / `kbd` / `samp` / `var` | 代码 / 键盘 / 输出 / 变量 | 语义化代码标记                                                 |
| `abbr`                          | 缩写                      | `title` 提供全称，鼠标悬停显示                                 |
| `dfn`                           | 术语定义                  | 首次出现的术语                                                 |
| `time`                          | 时间                      | `datetime` 提供机器可读值                                      |
| `data`                          | 机器可读数据              | `value` 存机器值，内容存人类可读值                             |
| `bdi` / `bdo`                   | 双向文本隔离 / 覆盖       | 处理阿拉伯语等 RTL 混排                                        |
| `ruby` / `rt` / `rp`            | 注音                      | 中文拼音、日文假名注音                                         |
| `br`                            | 换行                      | 只用于「确实需要换行」的地方（诗歌、地址），**禁止用于调间距** |
| `wbr`                           | 可选断行点                | 长 URL 折行                                                    |

### 2.3 列表

| 元素               | 说明                                         |
| ------------------ | -------------------------------------------- |
| `ul`               | 无序列表，子元素只能是 `li`                  |
| `ol`               | 有序列表，支持 `start` / `reversed` / `type` |
| `li`               | 列表项，`value` 可指定序号                   |
| `dl` / `dt` / `dd` | 描述列表：术语表、问答、键值对               |
| `menu`             | 命令/工具列表（语义上是 `ul` 的变体）        |

```html
<ol start="3" reversed>
  <li>第三项</li>
  <li value="10">第十项</li>
</ol>
```

### 2.4 超链接与路径

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">外链</a>
<a href="/about">站内绝对路径</a>
<a href="../docs/a.html">相对路径</a>
<a href="#section-1">页内锚点</a>
<a href="mailto:a@b.com">邮件</a>
<a href="tel:+8613800000000">电话</a>
<a href="file.pdf" download="文件名.pdf">下载</a>
```

| 属性                | 说明                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `href`              | 目标地址；`#id` 为锚点，`#top`/`#` 为回到顶部                                                                                                             |
| `target`            | `_self`（默认）/ `_blank`（新标签）/ `_parent` / `_top` / 具名窗口                                                                                        |
| `rel`               | 关系：`noopener`、`noreferrer`、`nofollow`、`external`、`prefetch`。**`target="_blank"` 必须配 `rel="noopener"` 防钓鱼（现代浏览器已默认隐含 noopener）** |
| `download`          | 触发下载，值可作文件名                                                                                                                                    |
| `hreflang` / `type` | 目标资源语言 / MIME 类型                                                                                                                                  |

**路径三种写法**：绝对路径（`/a/b` 或 `https://…`）、相对路径（`./`、`../`）、根相对路径。

### 2.5 图片与响应式图片

```html
<!-- 基础：alt 必写 -->
<img
  src="a.png"
  alt="描述"
  width="300"
  height="200"
  loading="lazy"
  decoding="async"
/>

<!-- srcset 按分辨率 -->
<img src="a.png" srcset="a.png 1x, a@2x.png 2x" alt="描述" />

<!-- picture：按格式/视口切换 -->
<picture>
  <source type="image/avif" srcset="a.avif" />
  <source type="image/webp" srcset="a.webp" />
  <source media="(max-width: 600px)" srcset="a-small.jpg" />
  <img src="a.jpg" alt="描述" />
</picture>
```

| 属性                   | 说明                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `alt`                  | **必写**。装饰图写 `alt=""`；内容图写描述。缺失会损害可访问性与 SEO |
| `width` / `height`     | 建议都写，用于占位防止 CLS 布局抖动                                 |
| `loading="lazy"`       | 原生懒加载（首屏图不要加，会拖慢 LCP）                              |
| `decoding="async"`     | 异步解码，避免阻塞渲染                                              |
| `srcset` / `sizes`     | 响应式图片候选集与视口尺寸                                          |
| `fetchpriority="high"` | 提升 LCP 图片优先级                                                 |
| `usemap` / `ismap`     | 图像映射（配合 `map`/`area`）                                       |

### 2.6 多媒体：`audio` / `video`

```html
<video
  src="movie.mp4"
  poster="cover.jpg"
  controls
  preload="metadata"
  playsinline
  muted
  loop
  width="640"
  height="360"
>
  <source src="movie.webm" type="video/webm" />
  <source src="movie.mp4" type="video/mp4" />
  <track kind="subtitles" src="zh.vtt" srclang="zh" label="中文" default />
  您的浏览器不支持 video。
</video>
```

| 属性          | 说明                                            |
| ------------- | ----------------------------------------------- |
| `controls`    | 显示播放控件（不写则无控件）                    |
| `autoplay`    | 自动播放，**必须同时 `muted`** 否则被浏览器拦截 |
| `preload`     | `none` / `metadata` / `auto`                    |
| `playsinline` | iOS 内联播放（不全屏）                          |
| `poster`      | 视频封面（仅 `video`）                          |
| `crossorigin` | 跨域 CORS（canvas 截图/字幕需要）               |
| `source`      | 提供多格式回退，`type` 帮助浏览器快速判断       |
| `track`       | 字幕/章节/描述轨（WebVTT）                      |

### 2.7 表格

```html
<table>
  <caption>
    成绩表
  </caption>
  <colgroup>
    <col span="1" />
    <col span="2" />
  </colgroup>
  <thead>
    <tr>
      <th scope="col">姓名</th>
      <th scope="col">科目</th>
      <th scope="col">分数</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>数学</td>
      <td>95</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3">共 1 条</td>
    </tr>
  </tfoot>
</table>
```

| 元素 / 属性                 | 说明                                                       |
| --------------------------- | ---------------------------------------------------------- |
| `caption`                   | 表格标题，必须是 `table` 的第一个子元素                    |
| `colgroup` / `col`          | 列分组与列样式，`span` 指定跨列数                          |
| `thead` / `tbody` / `tfoot` | 表头 / 表体 / 表脚                                         |
| `th`                        | 表头单元格，`scope="col/row"` 声明作用范围（可访问性关键） |
| `td`                        | 数据单元格                                                 |
| `colspan` / `rowspan`       | 跨列 / 跨行合并                                            |
| `headers`                   | 关联表头单元格 id（复杂表格可访问性）                      |

> **表格只用于展示数据**，绝不可用于页面布局（那是 table 布局时代的反模式）。

### 2.8 表单（HTML5 增强重点）

涉及的标签：`form`、`label`、`input`、`textarea`、`select`、`option`、`optgroup`、`datalist`、`button`、`fieldset`、`legend`、`output`、`meter`、`progress`。

```html
<form action="/submit" method="post" enctype="multipart/form-data" novalidate>
  <fieldset>
    <legend>基本信息</legend>

    <label for="name">姓名</label>
    <input
      id="name"
      name="name"
      type="text"
      required
      minlength="2"
      maxlength="20"
      placeholder="请输入"
    />

    <label for="email">邮箱</label>
    <input id="email" name="email" type="email" required />

    <label for="pwd">密码</label>
    <input id="pwd" name="pwd" type="password" pattern="(?=.*\d).{8,}" />

    <label for="age">年龄</label>
    <input id="age" name="age" type="number" min="1" max="120" step="1" />

    <input type="file" name="file" accept="image/png, image/jpeg" multiple />
    <input type="checkbox" name="hobby" value="read" checked /> 阅读
    <input type="radio" name="gender" value="m" /> 男

    <select name="city">
      <optgroup label="华东">
        <option value="sh" selected>上海</option>
        <option value="hz">杭州</option>
      </optgroup>
    </select>

    <input list="colors" name="color" />
    <datalist id="colors">
      <option value="red"></option>
      <option value="green"></option>
    </datalist>

    <textarea name="desc" rows="4" cols="30" placeholder="备注"></textarea>

    <button type="submit">提交</button>
    <button type="reset">重置</button>
    <button type="button">普通按钮</button>
  </fieldset>
</form>
```

#### `input` 的全部 `type` 取值

| type             | 说明                                |
| ---------------- | ----------------------------------- |
| `text`           | 单行文本（默认）                    |
| `password`       | 密码（掩码显示）                    |
| `email`          | 邮箱，自带格式校验 + 移动端邮箱键盘 |
| `url`            | URL 校验                            |
| `tel`            | 电话（无格式校验，移动端数字键盘）  |
| `search`         | 搜索框（带清除按钮）                |
| `number`         | 数字，配 `min`/`max`/`step`         |
| `range`          | 滑块，配 `min`/`max`/`step`         |
| `date`           | 日期选择器                          |
| `time`           | 时间                                |
| `datetime-local` | 本地日期时间                        |
| `month`          | 年月                                |
| `week`           | 年周                                |
| `color`          | 颜色选择器                          |
| `file`           | 文件上传，配 `accept` / `multiple`  |
| `checkbox`       | 复选框                              |
| `radio`          | 单选框（同 `name` 互斥）            |
| `hidden`         | 隐藏字段（随表单提交）              |
| `submit`         | 提交按钮                            |
| `reset`          | 重置按钮                            |
| `button`         | 普通按钮                            |
| `image`          | 图片提交按钮（配 `src`/`alt`）      |

#### 表单关键属性

| 属性                                                                  | 适用             | 说明                                                                                           |
| --------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `action` / `method`                                                   | `form`           | 提交地址 / `get`\|`post`\|`dialog`                                                             |
| `enctype`                                                             | `form`           | `application/x-www-form-urlencoded`（默认）、`multipart/form-data`（含文件必须）、`text/plain` |
| `novalidate`                                                          | `form`           | 关闭浏览器原生校验                                                                             |
| `autocomplete`                                                        | `form`/`input`   | `on`/`off`                                                                                     |
| `required`                                                            | 输入控件         | 必填                                                                                           |
| `placeholder`                                                         | 输入控件         | 占位提示（不能替代 `label`）                                                                   |
| `pattern`                                                             | `input`          | 正则校验（自动加 `^(?:…)$`）                                                                   |
| `readonly` / `disabled`                                               | 输入控件         | 只读（会提交）/ 禁用（不提交、不聚焦）                                                         |
| `min` / `max` / `step`                                                | 数字类           | 范围与步长                                                                                     |
| `multiple`                                                            | `input`/`select` | 允许多值                                                                                       |
| `list`                                                                | `input`          | 关联 `datalist` 建议                                                                           |
| `form`                                                                | 表单控件         | 关联到页面中任意 `form`（即使不在其内部）                                                      |
| `formaction`/`formmethod`/`formenctype`/`formnovalidate`/`formtarget` | `button`/`input` | 覆盖所属 form 的提交行为                                                                       |
| `for`                                                                 | `label`          | 关联控件的 `id`（或包裹控件）                                                                  |

> **可访问性**：`label` 必须与控件关联（`for`+`id` 或包裹），否则点击文字无法聚焦、屏幕阅读器读不出名称。

### 2.9 语义化结构元素（HTML5 布局标签）

| 元素                    | 语义                                               |
| ----------------------- | -------------------------------------------------- |
| `header`                | 页眉 / 区块头部                                    |
| `nav`                   | 导航链接区                                         |
| `main`                  | **页面唯一**的主内容区（每页只能一个，且不可嵌套） |
| `article`               | 可独立分发/复用的完整内容（文章、卡片、评论）      |
| `section`               | 有主题的通用章节（**应带标题**）                   |
| `aside`                 | 与主内容相关但可独立（侧栏、广告、引用）           |
| `footer`                | 页脚                                               |
| `figure` / `figcaption` | 独立的图/代码/表格 + 说明文字                      |
| `address`               | 联系信息                                           |
| `hgroup`                | 标题 + 副标题分组（实验性）                        |
| `search`                | 搜索相关内容区（较新）                             |

### 2.10 交互元素：`details` / `dialog`

```html
<details open>
  <summary>点击展开</summary>
  <p>折叠的内容</p>
</details>

<dialog id="dlg">
  <form method="dialog">
    <p>对话框内容</p>
    <button>关闭</button>
  </form>
</dialog>
<script>
  dlg.showModal(); // 模态；show() 为非模态
</script>
```

- `details` / `summary`：原生折叠面板（无需 JS），`open` 控制默认展开。
- `dialog`：原生模态对话框，`showModal()` 自带 `::backdrop` 遮罩与焦点捕获。

### 2.11 内嵌内容：`iframe` / `canvas` / `embed` / `object`

| 元素                           | 说明                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `iframe`                       | 内联框架，嵌入其他页面；`sandbox` 限制权限，`loading="lazy"` 懒加载，`allow` 声明权限策略 |
| `canvas`                       | 位图画布，靠 JS 绘制（`getContext('2d'/'webgl')`），无 DOM 语义                           |
| `svg`                          | 矢量图形（SVG 命名空间），有 DOM、可 CSS 控制、缩放不失真                                 |
| `embed`                        | 嵌入外部插件内容（空元素）                                                                |
| `object`                       | 嵌入外部资源，可含回退内容                                                                |
| `map` / `area`                 | 图像热区映射                                                                              |
| `picture` / `source` / `track` | 响应式/多媒体资源                                                                         |

### 2.12 脚本与样式

```html
<!-- 普通同步脚本：阻塞解析 -->
<script src="a.js"></script>

<!-- async：下载完成后立即执行，执行顺序不定，仅适用于独立脚本（如统计） -->
<script src="a.js" async></script>

<!-- defer：文档解析完成后、DOMContentLoaded 前按顺序执行（推荐用于业务脚本） -->
<script src="a.js" defer></script>

<!-- 模块：默认 defer 语义 -->
<script type="module" src="app.js"></script>

<style media="print">
  /* 仅打印生效 */
</style>
```

| 对比            | 解析阻塞       | 执行时机       | 顺序         |
| --------------- | -------------- | -------------- | ------------ |
| 普通 `<script>` | 是             | 下载完立即执行 | 按文档顺序   |
| `async`         | 否（下载并行） | 下载完立即执行 | **不确定**   |
| `defer`         | 否             | 解析完成后执行 | **保证顺序** |
| `type="module"` | 否             | 默认 defer     | 保证顺序     |

`<script type="application/ld+json">` 可内嵌 JSON-LD 结构化数据。

### 2.13 模板与 Web Components

| 元素       | 作用                                             |
| ---------- | ------------------------------------------------ |
| `template` | 声明不渲染的模板内容，JS 通过 `content` 克隆使用 |
| `slot`     | 自定义元素中的插槽，`name` 指定具名插槽          |

```html
<template id="card-tpl">
  <div class="card"><slot name="title"></slot></div>
</template>

<script>
  class MyCard extends HTMLElement {
    constructor() {
      super();
      const tpl = document.getElementById("card-tpl");
      this.attachShadow({ mode: "open" }).appendChild(
        tpl.content.cloneNode(true),
      );
    }
  }
  customElements.define("my-card", MyCard);
</script>

<my-card><span slot="title">标题</span></my-card>
```

Web Components 三件套：**Custom Elements（自定义元素）+ Shadow DOM（影子 DOM）+ HTML Templates（模板）**。

### 2.14 全局属性（出现在任何元素上）

| 属性                   | 说明                                                |
| ---------------------- | --------------------------------------------------- |
| `id`                   | 全文档唯一标识                                      |
| `class`                | 类名（空格分隔多个）                                |
| `style`                | 内联样式                                            |
| `title`                | 附加提示信息（悬停显示）                            |
| `lang`                 | 元素内容语言                                        |
| `dir`                  | 文本方向 `ltr`/`rtl`/`auto`                         |
| `hidden`               | 隐藏元素（`until-found` 可被查找时显示）            |
| `tabindex`             | 键盘 Tab 焦点顺序（0 可聚焦、-1 可编程聚焦）        |
| `accesskey`            | 键盘快捷键                                          |
| `contenteditable`      | 内容可编辑（`true`/`false`/`plaintext-only`）       |
| `draggable`            | 是否可拖拽（`true`/`false`）                        |
| `spellcheck`           | 拼写检查                                            |
| `translate`            | 是否翻译                                            |
| `inert`                | 使元素及其子树不可交互、不可聚焦                    |
| `popover`              | 声明为浮层（`auto`/`manual`），配合 `popovertarget` |
| `data-*`               | 自定义数据属性，JS 通过 `dataset` 读取              |
| `role` / `aria-*`      | ARIA 可访问性（见第六节）                           |
| `inputmode`            | 移动端虚拟键盘类型                                  |
| `enterkeyhint`         | 回车键提示文案                                      |
| `slot` / `part` / `is` | Web Components 相关                                 |

### 2.15 数据属性与自定义属性

```html
<li data-user-id="42" data-role="admin">张三</li>
<script>
  const li = document.querySelector("li");
  li.dataset.userId; // "42"（连字符转小驼峰）
  li.dataset.role; // "admin"
</script>
```

- 命名必须以 `data-` 开头。
- 可通过 CSS 属性选择器 `[data-role="admin"]` 使用。
- **不要用 `data-*` 存放需要频繁变更的状态**（每次变更会触发样式重算/序列化），优先用 DOM 属性或状态管理。

### 2.16 字符实体与 URL 编码

| 实体                         | 显示       | 说明                   |
| ---------------------------- | ---------- | ---------------------- |
| `&lt;`                       | `<`        | 尖括号需转义           |
| `&gt;`                       | `>`        |                        |
| `&amp;`                      | `&`        | & 符号需转义           |
| `&quot;` / `&#39;`           | `"` / `'`  | 引号                   |
| `&nbsp;`                     | 不换行空格 | 慎用（影响换行与朗读） |
| `&copy;` `&times;` `&mdash;` | © × —      | 常用符号               |

URL 中特殊字符需编码：空格→`%20`、中文→UTF-8 百分号编码，JS 用 `encodeURIComponent()`。

---

## 三、HTML 元素全表（含类型标注）

### 3.1 类型图例（与 htmlreference.io 一致）

| 标记              | 含义                                                      |
| ----------------- | --------------------------------------------------------- |
| 🟨 `experimental` | 实验性/较新（浏览器支持不完整，使用前查兼容性）           |
| 🩷 `meta`         | 元数据元素（出现在 `head`，为文档提供元信息，不直接渲染） |
| 🟥 `self-closing` | 空元素（void），须自闭合，无子内容                        |
| 🟩 `inline`       | 行内元素（默认 `display: inline`）                        |
| 🟦 `block`        | 块级元素（默认 `display: block`）                         |

> 说明：分类体系采用 **htmlreference.io** 的标注方式（`experimental` / `meta` / `self-closing` / `inline` / `block`）；`area` 等按 WHATWG 规范属 void（空元素），表中已同时标注。
> 一个元素可同时拥有多个标记，例如 `br` = 🟥 `self-closing` + 🟩 `inline`。

### 3.2 完整元素表（A–Z，共 100+ 个）

| 元素              | 说明                     | 类型                                            |
| ----------------- | ------------------------ | ----------------------------------------------- |
| `a`               | 超链接 / 锚点            | 🟩 `inline`                                     |
| `abbr`            | 缩写、首字母缩略词       | 🟩 `inline`                                     |
| `address`         | 联系信息                 | 🟦 `block`                                      |
| `area`            | 图像映射热区             | 🟥 `self-closing` 🟩 `inline`                   |
| `article`         | 独立可复用的文章/内容块  | 🟦 `block`                                      |
| `aside`           | 侧边栏 / 附属内容        | 🟦 `block`                                      |
| `audio`           | 音频播放器               | 🟦 `block`                                      |
| `b`               | 视觉加粗（不表重要性）   | 🟩 `inline`                                     |
| `base`            | 文档基准 URL             | 🟥 `self-closing` 🩷 `meta`                     |
| `bdi`             | 双向文本隔离             | 🟩 `inline`                                     |
| `bdo`             | 双向文本覆盖             | 🟩 `inline`                                     |
| `blockquote`      | 块级引用                 | 🟦 `block`                                      |
| `body`            | 文档主体                 | 🟦 `block`                                      |
| `br`              | 换行（空元素）           | 🟥 `self-closing` 🟩 `inline`                   |
| `button`          | 按钮                     | 🟩 `inline`                                     |
| `canvas`          | 位图画布                 | 🟦 `block`                                      |
| `caption`         | 表格标题                 | 🟦 `block`                                      |
| `cite`            | 作品标题引用             | 🟩 `inline`                                     |
| `code`            | 代码片段                 | 🟩 `inline`                                     |
| `col`             | 表格列（空元素）         | 🟥 `self-closing`                               |
| `colgroup`        | 表格列组                 | 🟦 `block`                                      |
| `data`            | 机器可读数据             | 🟩 `inline`                                     |
| `datalist`        | 输入建议列表             | 🟦 `block`                                      |
| `dd`              | 描述列表的定义           | 🟩 `inline`                                     |
| `del`             | 已删除内容               | 🟩 `inline`                                     |
| `details`         | 可折叠详情面板           | 🟦 `block`                                      |
| `dfn`             | 术语定义                 | 🟩 `inline`                                     |
| `dialog`          | 对话框                   | 🟨 `experimental` 🟦 `block`                    |
| `div`             | 通用块级容器             | 🟦 `block`                                      |
| `dl`              | 描述 / 定义列表          | 🟦 `block`                                      |
| `dt`              | 描述列表的术语           | 🟦 `block`                                      |
| `em`              | 重音强调（斜体）         | 🟩 `inline`                                     |
| `embed`           | 嵌入外部内容（空元素）   | 🟥 `self-closing` 🟩 `inline`                   |
| `fieldset`        | 表单控件分组             | 🟦 `block`                                      |
| `figcaption`      | `figure` 的说明文字      | 🟦 `block`                                      |
| `figure`          | 独立插图 / 代码 / 表格   | 🟦 `block`                                      |
| `footer`          | 页脚                     | 🟦 `block`                                      |
| `form`            | 表单                     | 🟦 `block`                                      |
| `h1`              | 一级标题                 | 🟦 `block`                                      |
| `h2`              | 二级标题                 | 🟦 `block`                                      |
| `h3`              | 三级标题                 | 🟦 `block`                                      |
| `h4`              | 四级标题                 | 🟦 `block`                                      |
| `h5`              | 五级标题                 | 🟦 `block`                                      |
| `h6`              | 六级标题                 | 🟦 `block`                                      |
| `head`            | 文档元数据容器           | 🩷 `meta`                                       |
| `header`          | 页眉 / 区块头部          | 🟦 `block`                                      |
| `hgroup`          | 标题分组                 | 🟨 `experimental` 🟦 `block`                    |
| `hr`              | 主题分隔线（空元素）     | 🟥 `self-closing` 🟦 `block`                    |
| `html`            | 文档根元素               | 🟦 `block`                                      |
| `i`               | 术语 / 外语（斜体）      | 🟩 `inline`                                     |
| `iframe`          | 内联框架                 | 🟩 `inline`                                     |
| `img`             | 图像（空元素）           | 🟥 `self-closing` 🟩 `inline`                   |
| `input`           | 表单输入控件（空元素）   | 🟥 `self-closing` 🟩 `inline`                   |
| `ins`             | 已插入内容               | 🟩 `inline`                                     |
| `kbd`             | 键盘输入                 | 🟩 `inline`                                     |
| `label`           | 表单控件标签             | 🟩 `inline`                                     |
| `legend`          | `fieldset` 的标题        | 🟦 `block`                                      |
| `li`              | 列表项                   | 🟦 `block`                                      |
| `link`            | 外部资源链接（空元素）   | 🟥 `self-closing` 🩷 `meta`                     |
| `main`            | 主内容区（唯一）         | 🟦 `block`                                      |
| `map`             | 图像映射容器             | 🟩 `inline`                                     |
| `mark`            | 高亮标记                 | 🟩 `inline`                                     |
| `menu`            | 命令 / 工具列表          | 🟦 `block`                                      |
| `meta`            | 元数据（空元素）         | 🟥 `self-closing` 🩷 `meta`                     |
| `meter`           | 已知范围的度量值         | 🟩 `inline`                                     |
| `nav`             | 导航                     | 🟦 `block`                                      |
| `noscript`        | 脚本被禁用时的内容       | 🟦 `block`                                      |
| `object`          | 嵌入外部资源对象         | 🟩 `inline`                                     |
| `ol`              | 有序列表                 | 🟦 `block`                                      |
| `optgroup`        | 选项分组                 | 🟦 `block`                                      |
| `option`          | 下拉选项                 | 🟦 `block`                                      |
| `output`          | 计算结果输出             | 🟩 `inline`                                     |
| `p`               | 段落                     | 🟦 `block`                                      |
| `picture`         | 响应式图片容器           | 🟨 `experimental` 🟩 `inline`                   |
| `pre`             | 预格式化文本             | 🟦 `block`                                      |
| `progress`        | 任务进度条               | 🟩 `inline`                                     |
| `q`               | 行内引用                 | 🟩 `inline`                                     |
| `rp`              | ruby 回退括号            | 🟩 `inline`                                     |
| `rt`              | ruby 注音                | 🟩 `inline`                                     |
| `ruby`            | 注音标注                 | 🟩 `inline`                                     |
| `s`               | 不再准确的内容（删除线） | 🟩 `inline`                                     |
| `samp`            | 程序输出示例             | 🟩 `inline`                                     |
| `script`          | 脚本                     | 🩷 `meta`                                       |
| `search`          | 搜索相关内容区           | 🟦 `block`                                      |
| `section`         | 通用章节                 | 🟦 `block`                                      |
| `select`          | 下拉选择框               | 🟩 `inline`                                     |
| `selectedcontent` | 显示 `select` 选中项内容 | 🟩 `inline`                                     |
| `slot`            | Web Components 插槽      | 🟨 `experimental` 🟩 `inline`                   |
| `small`           | 旁注 / 小字              | 🟩 `inline`                                     |
| `source`          | 媒体来源（空元素）       | 🟥 `self-closing`                               |
| `span`            | 通用行内容器             | 🟩 `inline`                                     |
| `strong`          | 重要性强调（加粗）       | 🟩 `inline`                                     |
| `style`           | 内嵌样式表               | 🩷 `meta`                                       |
| `sub`             | 下标                     | 🟩 `inline`                                     |
| `summary`         | `details` 的摘要         | 🟦 `block`                                      |
| `sup`             | 上标                     | 🟩 `inline`                                     |
| `table`           | 表格                     | 🟦 `block`                                      |
| `tbody`           | 表格主体                 | 🟦 `block`                                      |
| `td`              | 表格数据单元格           | 🟦 `block`                                      |
| `template`        | 模板                     | 🟨 `experimental` 🩷 `meta`                     |
| `textarea`        | 多行文本输入             | 🟩 `inline`                                     |
| `tfoot`           | 表格脚注                 | 🟦 `block`                                      |
| `th`              | 表格表头单元格           | 🟦 `block`                                      |
| `thead`           | 表格表头                 | 🟦 `block`                                      |
| `time`            | 时间 / 日期              | 🟩 `inline`                                     |
| `title`           | 文档标题                 | 🩷 `meta`                                       |
| `tr`              | 表格行                   | 🟦 `block`                                      |
| `track`           | 媒体文本轨（空元素）     | 🟥 `self-closing`                               |
| `u`               | 非文本注释（下划线）     | 🟩 `inline`                                     |
| `ul`              | 无序列表                 | 🟦 `block`                                      |
| `var`             | 变量                     | 🟩 `inline`                                     |
| `video`           | 视频播放器               | 🟦 `block`                                      |
| `wbr`             | 可选换行点（空元素）     | 🟨 `experimental` 🟥 `self-closing` 🟩 `inline` |

#### 外来命名空间元素（Foreign Elements）

| 元素   | 说明                               | 类型        |
| ------ | ---------------------------------- | ----------- |
| `svg`  | SVG 矢量图形（SVG 命名空间）       | 🟩 `inline` |
| `math` | MathML 数学公式（MathML 命名空间） | 🟩 `inline` |

### 3.3 按用途分类索引

| 分类                | 元素                                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **文档结构**        | `html` `head` `body`                                                                                                                                                        |
| **元数据**          | `base` `link` `meta` `style` `title` `script` `template`                                                                                                                    |
| **章节 / 语义结构** | `header` `nav` `main` `article` `section` `aside` `footer` `address` `hgroup` `search` `h1`~`h6`                                                                            |
| **文本内容**        | `div` `p` `hr` `pre` `blockquote` `ol` `ul` `menu` `li` `dl` `dt` `dd` `figure` `figcaption`                                                                                |
| **行内文本语义**    | `a` `abbr` `b` `bdi` `bdo` `br` `cite` `code` `data` `dfn` `em` `i` `kbd` `mark` `q` `rp` `rt` `ruby` `s` `samp` `small` `span` `strong` `sub` `sup` `time` `u` `var` `wbr` |
| **图像 / 多媒体**   | `img` `picture` `source` `audio` `video` `track` `map` `area`                                                                                                               |
| **内嵌内容**        | `iframe` `embed` `object` `canvas` `svg` `math`                                                                                                                             |
| **表格**            | `table` `caption` `colgroup` `col` `thead` `tbody` `tfoot` `tr` `td` `th`                                                                                                   |
| **表单**            | `form` `label` `input` `button` `select` `datalist` `optgroup` `option` `textarea` `output` `progress` `meter` `fieldset` `legend`                                          |
| **交互**            | `details` `summary` `dialog`                                                                                                                                                |
| **Web Components**  | `template` `slot` `selectedcontent`                                                                                                                                         |

### 3.4 已废弃 / 不推荐使用的元素

> WHATWG 已从标准中移除（obsolete）。**新项目严禁使用**，见到旧代码应替换为语义化标签 + CSS。

| 废弃元素                                                            | 替代方案                                  |
| ------------------------------------------------------------------- | ----------------------------------------- |
| `center`                                                            | `text-align: center` / `margin: auto`     |
| `font`                                                              | CSS `font-family` / `font-size` / `color` |
| `big` `strike` `tt`                                                 | `font-size` / `del` `s` / `code`          |
| `acronym`                                                           | `abbr`                                    |
| `applet`                                                            | `object` / `embed`                        |
| `frame` `frameset` `noframes`                                       | `iframe` / 现代布局                       |
| `marquee` `blink`                                                   | CSS 动画                                  |
| `keygen`                                                            | Web Crypto API                            |
| `menuitem`                                                          | 自定义菜单 / `menu`                       |
| `dir`                                                               | `ul`                                      |
| `basefont` `bgsound` `isindex` `spacer` `xmp` `plaintext` `noembed` | 现代等价标签                              |
| `param`                                                             | 不再支持（用 `object` 的 `data`）         |
| `rb` `rtc`                                                          | ruby 简化模型                             |
| `hgroup`（曾被移除后又回归）                                        | 现为有效元素                              |

---

## 四、HTML 属性速查

### 4.1 全局属性（所有元素可用）

| 属性                 | 取值                                                           | 说明                         |
| -------------------- | -------------------------------------------------------------- | ---------------------------- |
| `accesskey`          | 字符                                                           | 键盘快捷键                   |
| `autocapitalize`     | `on`/`off`/`none`/`sentences`/`words`/`characters`             | 移动端自动大写               |
| `autocorrect`        | `on`/`off`/空                                                  | 自动纠错（移动端）           |
| `autofocus`          | 布尔                                                           | 自动聚焦（页面中只应有一个） |
| `class`              | 空格分隔 tokens                                                | 类名                         |
| `contenteditable`    | `true`/`false`/`plaintext-only`/空                             | 可编辑                       |
| `dir`                | `ltr`/`rtl`/`auto`                                             | 文本方向                     |
| `draggable`          | `true`/`false`                                                 | 可拖拽                       |
| `enterkeyhint`       | `enter`/`done`/`go`/`next`/`previous`/`search`/`send`          | 回车键提示                   |
| `exportparts`        | tokens                                                         | 导出 Shadow DOM 部件         |
| `hidden`             | 布尔 / `until-found`                                           | 隐藏                         |
| `id`                 | 唯一标识符                                                     | 元素 id                      |
| `inert`              | 布尔                                                           | 不可交互                     |
| `inputmode`          | `none`/`text`/`tel`/`url`/`email`/`numeric`/`decimal`/`search` | 虚拟键盘类型                 |
| `is`                 | 自定义元素名                                                   | 定制内置元素                 |
| `lang`               | BCP 47 语言标签                                                | 语言                         |
| `nonce`              | 字符串                                                         | CSP nonce                    |
| `part`               | tokens                                                         | Shadow DOM 部件暴露          |
| `popover`            | `auto`/`manual`/空                                             | 浮层                         |
| `slot`               | 插槽名                                                         | 指定插槽                     |
| `spellcheck`         | `true`/`false`/空                                              | 拼写检查                     |
| `style`              | CSS 声明                                                       | 内联样式                     |
| `tabindex`           | 整数                                                           | 焦点顺序（0/-1/正数）        |
| `title`              | 文本                                                           | 附加信息                     |
| `translate`          | `yes`/`no`/空                                                  | 是否翻译                     |
| `writingsuggestions` | `true`/`false`/空                                              | 写作建议                     |
| `data-*`             | 自定义                                                         | 自定义数据                   |
| `role` / `aria-*`    | ARIA 值                                                        | 可访问性                     |

**微数据（Microdata）全局属性**：`itemscope` `itemtype` `itemid` `itemprop` `itemref`。

### 4.2 元素专有属性（按元素，来源：WHATWG Index of Attributes）

| 元素          | 专有属性                                                                                                                                                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `a`           | `href` `target` `download` `ping` `rel` `hreflang` `type` `referrerpolicy`                                                                                                                                                                                                                                                                                          |
| `area`        | `alt` `coords` `shape` `href` `target` `download` `ping` `rel` `referrerpolicy`                                                                                                                                                                                                                                                                                     |
| `audio`       | `src` `crossorigin` `preload` `autoplay` `loading` `loop` `muted` `controls`                                                                                                                                                                                                                                                                                        |
| `base`        | `href` `target`                                                                                                                                                                                                                                                                                                                                                     |
| `blockquote`  | `cite`                                                                                                                                                                                                                                                                                                                                                              |
| `body`        | 事件属性（见 4.3）                                                                                                                                                                                                                                                                                                                                                  |
| `button`      | `command` `commandfor` `disabled` `form` `formaction` `formenctype` `formmethod` `formnovalidate` `formtarget` `name` `popovertarget` `popovertargetaction` `type` `value`                                                                                                                                                                                          |
| `canvas`      | `width` `height`                                                                                                                                                                                                                                                                                                                                                    |
| `col`         | `span`                                                                                                                                                                                                                                                                                                                                                              |
| `colgroup`    | `span`                                                                                                                                                                                                                                                                                                                                                              |
| `data`        | `value`                                                                                                                                                                                                                                                                                                                                                             |
| `del` / `ins` | `cite` `datetime`                                                                                                                                                                                                                                                                                                                                                   |
| `details`     | `name` `open`                                                                                                                                                                                                                                                                                                                                                       |
| `dialog`      | `open` `closedby`                                                                                                                                                                                                                                                                                                                                                   |
| `embed`       | `src` `type` `width` `height`                                                                                                                                                                                                                                                                                                                                       |
| `fieldset`    | `disabled` `form` `name`                                                                                                                                                                                                                                                                                                                                            |
| `form`        | `accept-charset` `action` `autocomplete` `enctype` `method` `name` `novalidate` `rel` `target`                                                                                                                                                                                                                                                                      |
| `iframe`      | `src` `srcdoc` `name` `sandbox` `allow` `allowfullscreen` `width` `height` `referrerpolicy` `loading`                                                                                                                                                                                                                                                               |
| `img`         | `alt` `src` `srcset` `sizes` `crossorigin` `usemap` `ismap` `controls` `width` `height` `referrerpolicy` `decoding` `loading` `fetchpriority`                                                                                                                                                                                                                       |
| `input`       | `accept` `alpha` `alt` `autocomplete` `checked` `colorspace` `dirname` `disabled` `form` `formaction` `formenctype` `formmethod` `formnovalidate` `formtarget` `height` `list` `max` `maxlength` `min` `minlength` `multiple` `name` `pattern` `placeholder` `popovertarget` `popovertargetaction` `readonly` `required` `size` `src` `step` `type` `value` `width` |
| `label`       | `for`                                                                                                                                                                                                                                                                                                                                                               |
| `li`          | `value`                                                                                                                                                                                                                                                                                                                                                             |
| `link`        | `href` `crossorigin` `rel` `as` `media` `hreflang` `type` `sizes` `imagesrcset` `imagesizes` `referrerpolicy` `integrity` `blocking` `color` `disabled` `fetchpriority`                                                                                                                                                                                             |
| `map`         | `name`                                                                                                                                                                                                                                                                                                                                                              |
| `meta`        | `name` `http-equiv` `content` `charset` `media`                                                                                                                                                                                                                                                                                                                     |
| `meter`       | `value` `min` `max` `low` `high` `optimum`                                                                                                                                                                                                                                                                                                                          |
| `object`      | `data` `type` `name` `form` `width` `height`                                                                                                                                                                                                                                                                                                                        |
| `ol`          | `reversed` `start` `type`                                                                                                                                                                                                                                                                                                                                           |
| `optgroup`    | `disabled` `label`                                                                                                                                                                                                                                                                                                                                                  |
| `option`      | `disabled` `label` `selected` `value`                                                                                                                                                                                                                                                                                                                               |
| `output`      | `for` `form` `name`                                                                                                                                                                                                                                                                                                                                                 |
| `progress`    | `value` `max`                                                                                                                                                                                                                                                                                                                                                       |
| `q`           | `cite`                                                                                                                                                                                                                                                                                                                                                              |
| `script`      | `src` `type` `nomodule` `async` `defer` `crossorigin` `integrity` `referrerpolicy` `blocking` `fetchpriority`                                                                                                                                                                                                                                                       |
| `select`      | `autocomplete` `disabled` `form` `multiple` `name` `required` `size`                                                                                                                                                                                                                                                                                                |
| `slot`        | `name`                                                                                                                                                                                                                                                                                                                                                              |
| `source`      | `type` `media` `src` `srcset` `sizes` `width` `height`                                                                                                                                                                                                                                                                                                              |
| `style`       | `media` `blocking`                                                                                                                                                                                                                                                                                                                                                  |
| `td` / `th`   | `colspan` `rowspan` `headers`（`th` 另有 `scope` `abbr`）                                                                                                                                                                                                                                                                                                           |
| `template`    | `for` `shadowrootmode` `shadowrootdelegatesfocus` `shadowrootserializable` `shadowrootslotassignment` `shadowrootclonable` `shadowrootcustomelementregistry`                                                                                                                                                                                                        |
| `textarea`    | `autocomplete` `cols` `dirname` `disabled` `form` `maxlength` `minlength` `name` `placeholder` `readonly` `required` `rows` `wrap`                                                                                                                                                                                                                                  |
| `time`        | `datetime`                                                                                                                                                                                                                                                                                                                                                          |
| `track`       | `default` `kind` `label` `src` `srclang`                                                                                                                                                                                                                                                                                                                            |
| `video`       | `src` `crossorigin` `poster` `preload` `autoplay` `playsinline` `loading` `loop` `muted` `controls` `width` `height`                                                                                                                                                                                                                                                |

### 4.3 事件处理属性（`on*`，内容属性写法）

> 推荐用 `addEventListener` 绑定事件，`on*` 属性仅适合简单场景/内联场景。

| 类别                  | 属性                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **鼠标**              | `onclick` `ondblclick` `onmousedown` `onmouseup` `onmousemove` `onmouseover` `onmouseout` `onmouseenter` `onmouseleave` `oncontextmenu` `onwheel` |
| **键盘**              | `onkeydown` `onkeyup` `onkeypress`(废弃)                                                                                                          |
| **表单**              | `onchange` `oninput` `onsubmit` `onreset` `onfocus` `onblur` `oninvalid` `onselect` `onsearch`                                                    |
| **拖拽**              | `ondrag` `ondragstart` `ondragend` `ondragenter` `ondragover` `ondragleave` `ondrop`                                                              |
| **触摸**              | `ontouchstart` `ontouchmove` `ontouchend` `ontouchcancel`                                                                                         |
| **指针**              | `onpointerdown` `onpointerup` `onpointermove` `onpointerover` `onpointerout` `onpointercancel`                                                    |
| **媒体**              | `onplay` `onpause` `onended` `ontimeupdate` `onvolumechange` `onloadeddata` `oncanplay` `onwaiting` `ondurationchange`                            |
| **窗口/文档（body）** | `onload` `onunload` `onresize` `onscroll` `onerror` `onhashchange` `onpopstate` `onbeforeunload` `onstorage` `ononline` `onoffline` `onmessage`   |
| **动画 / 过渡**       | `onanimationstart` `onanimationend` `onanimationiteration` `ontransitionend`                                                                      |
| **剪贴板**            | `oncopy` `oncut` `onpaste`                                                                                                                        |
| **对话框**            | `onclose` `oncancel`                                                                                                                              |
| **其他**              | `ontoggle` `onbeforetoggle` `oncontextlost`                                                                                                       |

---

## 五、HTML5 新增 API（进阶到精通）

> HTML5 的价值一半在「标签」，一半在这些配套 **Web API**。它们通过 JavaScript 暴露能力。

### 5.1 Web Storage（本地存储）

| API              | 生命周期         | 容量 | 说明                   |
| ---------------- | ---------------- | ---- | ---------------------- |
| `localStorage`   | 永久（手动清除） | ~5MB | 同源共享，永不自动过期 |
| `sessionStorage` | 标签页会话       | ~5MB | 关闭标签页即清除       |

```js
localStorage.setItem("token", "abc");
const token = localStorage.getItem("token");
localStorage.removeItem("token");
localStorage.clear();
// 存储对象需序列化
localStorage.setItem("user", JSON.stringify({ id: 1 }));
const user = JSON.parse(localStorage.getItem("user") ?? "{}");
```

| 存储方案       | 容量     | 特点                                                |
| -------------- | -------- | --------------------------------------------------- |
| Cookie         | ~4KB     | 随请求自动携带，可设 `HttpOnly`/`Secure`/`SameSite` |
| localStorage   | ~5MB     | 同步、简单、字符串                                  |
| sessionStorage | ~5MB     | 会话级                                              |
| IndexedDB      | 数百 MB+ | **异步**、可存二进制/大对象、支持索引与事务         |

### 5.2 拖放（Drag and Drop）

```html
<div draggable="true" id="src">拖我</div>
<div id="drop">放到这里</div>
<script>
  src.addEventListener("dragstart", (e) =>
    e.dataTransfer.setData("text/plain", "hello"),
  );
  drop.addEventListener("dragover", (e) => e.preventDefault()); // 必须阻止默认才能 drop
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    console.log(e.dataTransfer.getData("text/plain"));
  });
</script>
```

事件顺序：`dragstart → drag → dragenter → dragover → drop → dragend`。

### 5.3 地理定位（Geolocation）

```js
navigator.geolocation.getCurrentPosition(
  (pos) => console.log(pos.coords.latitude, pos.coords.longitude),
  (err) => console.error(err),
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
);
```

> **仅在 HTTPS（或 localhost）下可用**，需用户授权。

### 5.4 多媒体 API

```js
video.play();
video.pause();
video.currentTime = 30;
video.volume = 0.5;
video.playbackRate = 1.5;
```

常用：`HTMLMediaElement`（播放控制）、`MediaStream`/`getUserMedia`（摄像头/麦克风）、`MediaRecorder`（录制）、`SpeechSynthesis`（语音合成）、`Fullscreen API`。

```js
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});
video.srcObject = stream;
```

### 5.5 Canvas 与 SVG

```js
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#0ea5e9";
ctx.fillRect(10, 10, 100, 60);
ctx.font = "16px sans-serif";
ctx.fillText("Hello Canvas", 20, 50);
```

| 对比 | Canvas                       | SVG                    |
| ---- | ---------------------------- | ---------------------- |
| 本质 | 位图（像素）                 | 矢量（DOM 节点）       |
| 缩放 | 失真                         | 不失真                 |
| 交互 | 需手动命中检测               | 每个元素可绑定事件     |
| 适用 | 大量像素绘制、游戏、图像处理 | 图标、图表、可缩放图形 |

### 5.6 消息与实时通信

| API                                | 方向                      | 特点               |
| ---------------------------------- | ------------------------- | ------------------ |
| `postMessage`                      | 跨窗口/iframe/Worker 双向 | 需校验 `origin`    |
| `WebSocket`                        | 全双工长连接              | 实时聊天、行情     |
| `Server-Sent Events (EventSource)` | 服务器→客户端单向         | 轻量推送、自动重连 |
| `BroadcastChannel`                 | 同源多标签页              | 标签页间通信       |

```js
// WebSocket
const ws = new WebSocket("wss://example.com/ws");
ws.onopen = () => ws.send("hi");
ws.onmessage = (e) => console.log(e.data);

// SSE
const es = new EventSource("/events");
es.onmessage = (e) => console.log(e.data);

// 跨窗口
otherWindow.postMessage({ type: "ping" }, "https://example.com");
window.addEventListener("message", (e) => {
  if (e.origin !== "https://example.com") return;
  console.log(e.data);
});
```

### 5.7 Web Worker（后台线程）

```js
// main.js
const worker = new Worker("worker.js");
worker.postMessage({ n: 1e7 });
worker.onmessage = (e) => console.log(e.data);

// worker.js
onmessage = (e) => {
  let sum = 0;
  for (let i = 0; i < e.data.n; i++) sum += i;
  postMessage(sum);
};
```

> Worker 不能访问 DOM；用于密集计算。还有 `SharedWorker`、`ServiceWorker`。

### 5.8 History API（SPA 路由基础）

```js
history.pushState({ page: 1 }, "", "/page/1");
history.replaceState({ page: 2 }, "", "/page/2");
window.addEventListener("popstate", (e) => console.log(e.state));
```

### 5.9 原生表单验证

```js
input.checkValidity(); // 是否有效
input.validationMessage; // 错误信息
input.setCustomValidity("自定义错误");
form.reportValidity(); // 主动触发校验 UI
```

伪类：`:valid` `:invalid` `:required` `:optional` `:in-range` `:out-of-range` `:placeholder-shown`。

### 5.10 资源提示与性能

| 手段                        | 作用                             |
| --------------------------- | -------------------------------- |
| `<link rel="preload">`      | 提前加载**当前页必需**的关键资源 |
| `<link rel="prefetch">`     | 空闲时预取**未来可能用到**的资源 |
| `<link rel="preconnect">`   | 提前做 DNS + TCP + TLS           |
| `<link rel="dns-prefetch">` | 只提前解析 DNS                   |
| `<img loading="lazy">`      | 原生懒加载                       |
| `<script defer/async>`      | 不阻塞解析                       |
| `fetchpriority="high"`      | 提升关键资源优先级               |

### 5.11 PWA：manifest 与 Service Worker

```html
<link rel="manifest" href="/manifest.webmanifest" />
```

```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]
}
```

Service Worker 负责离线缓存、拦截请求、推送。要求 HTTPS。

### 5.12 结构化数据 / SEO / 社交卡片

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "标题",
    "author": { "@type": "Person", "name": "作者" }
  }
</script>
```

也可用 Microdata（`itemscope`/`itemtype`/`itemprop`）或 RDFa 标注。

### 5.13 其他常用 HTML5 API

| API                                           | 作用                              |
| --------------------------------------------- | --------------------------------- |
| `Notification`                                | 桌面通知（需授权）                |
| `Clipboard`                                   | 剪贴板读写                        |
| `IntersectionObserver`                        | 元素可见性检测（懒加载/曝光统计） |
| `MutationObserver`                            | DOM 变更监听                      |
| `ResizeObserver`                              | 尺寸变化监听                      |
| `requestAnimationFrame`                       | 逐帧动画                          |
| `FileReader` / `Blob` / `URL.createObjectURL` | 文件读写与预览                    |
| `Fetch` / `XMLHttpRequest`                    | 网络请求                          |
| `Page Visibility`                             | 页面可见性（暂停轮询）            |
| `Vibration`                                   | 设备振动                          |

---

## 六、可访问性（A11y）与 SEO

### 6.1 可访问性要点

| 要点             | 做法                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **语义化优先**   | 能用原生元素（`button`/`nav`/`label`）就用，不要用 `div` 模拟                                                                                           |
| **图片替代文本** | `alt` 描述内容；装饰图 `alt=""`                                                                                                                         |
| **表单可访问**   | `label` 关联控件；`fieldset`+`legend` 分组；错误信息可读                                                                                                |
| **键盘可达**     | 交互元素可聚焦、有焦点样式；`tabindex` 正确                                                                                                             |
| **标题层级**     | 不跳级，页面有唯一 `h1`                                                                                                                                 |
| **ARIA**         | 原生语义不足时补充：`role`、`aria-label`、`aria-labelledby`、`aria-hidden`、`aria-live`、`aria-expanded`、`aria-current`。**「无 ARIA 好过错误 ARIA」** |
| **颜色对比**     | 文字与背景对比度 ≥ 4.5:1（大字号 ≥ 3:1）                                                                                                                |
| **语言声明**     | `<html lang="zh-CN">`                                                                                                                                   |
| **表格关联**     | `th` 加 `scope`，复杂表格用 `headers`                                                                                                                   |

```html
<button aria-label="关闭弹窗" aria-expanded="false">×</button>
<div role="status" aria-live="polite">已保存</div>
<nav aria-label="主导航">…</nav>
```

### 6.2 SEO 要点

| 项                 | 建议                                         |
| ------------------ | -------------------------------------------- |
| `title`            | 每页唯一，包含核心关键词（55~60 字符内）     |
| `meta description` | 摘要，影响点击率（150~160 字符）             |
| 标题结构           | `h1` 唯一，`h2`/`h3` 层级清晰                |
| 语义标签           | `header`/`main`/`nav`/`article` 帮助理解结构 |
| 链接               | 使用有意义的锚文本，而非「点击这里」         |
| 图片               | `alt` + 描述性文件名                         |
| `canonical`        | 避免重复内容                                 |
| 结构化数据         | JSON-LD 提升富摘要展现                       |
| 移动友好           | `viewport` + 响应式                          |

---

## 七、易错点与最佳实践

### 7.1 常见错误

1. **`p` 里嵌套块级元素**：`<p><div></div></p>` → 浏览器自动闭合 `p`，结构被破坏。
2. **`alt` 缺失**：损害可访问性与 SEO；装饰图应写 `alt=""` 而不是省略。
3. **`<a>` 嵌套 `<a>` / `<button>` 嵌套交互元素**：非法嵌套，行为不可预测。
4. **`<ul>` 里放非 `li` 元素**（如直接放 `div`）。
5. **用 `<table>` 布局页面**：老式反模式。
6. **`target="_blank"` 不加 `rel="noopener"`**：存在 window.opener 劫持风险。
7. **`<img>` 不写宽高**：造成 CLS 布局偏移。
8. **`viewport` 禁止缩放**（`user-scalable=no`）：损害可访问性。
9. **重复 `id`**：`id` 必须全文档唯一，`<label for>`/锚点会失效。
10. **`autoplay` 不加 `muted`**：被浏览器策略拦截。
11. **`<br>` 当作换行排版工具**：应使用 CSS 间距。
12. **`hidden` 依赖 `display` 覆盖**：`hidden` 的样式优先级低，被 `display:block` 覆盖会失效。
13. **`type` 写错**：`<input type="emial">` 会退化为 `text`，静默失效。
14. **`placeholder` 替代 `label`**：输入后提示消失，可访问性差。
15. **内联事件属性滥用**：`onclick="..."` 不利于维护与 CSP。

### 7.2 最佳实践清单

- 始终写 `<!DOCTYPE html>`、`lang`、`charset`、`viewport`、`title`。
- **优先语义化标签**，`div`/`span` 只作无更好选择时的容器。
- 文档结构：`header` → `nav` → `main`（唯一）→ `article`/`section` → `aside` → `footer`。
- 表单必须 `label` 关联；分组用 `fieldset`/`legend`。
- 图片必写 `alt` 与 `width/height`，首屏不懒加载、非首屏 `loading="lazy"`。
- 业务脚本用 `defer`；独立脚本用 `async`；ESM 用 `type="module"`。
- 关键资源用 `preload`，第三方域名用 `preconnect`/`dns-prefetch`。
- 交互优先用原生元素（`button`/`details`/`dialog`），减少自造轮子。
- 内联样式与 `on*` 属性尽量外置，利于缓存与 CSP。

---

## 八、速查表

### 8.1 元素类型一览（速记）

| 类型                    | 记忆口诀               | 元素                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **块级 block**          | 独占一行、可以设宽高   | `address` `article` `aside` `audio` `blockquote` `body` `canvas` `caption` `colgroup` `datalist` `details` `dialog` `div` `dl` `dt` `fieldset` `figcaption` `figure` `footer` `form` `h1`~`h6` `header` `hgroup` `hr` `html` `legend` `li` `main` `menu` `nav` `noscript` `ol` `optgroup` `option` `p` `pre` `search` `section` `summary` `table` `tbody` `td` `tfoot` `th` `thead` `tr` `ul` `video` |
| **行内 inline**         | 不换行、宽度由内容决定 | `a` `abbr` `area` `b` `bdi` `bdo` `br` `button` `cite` `code` `data` `dd` `del` `dfn` `em` `embed` `i` `iframe` `img` `input` `ins` `kbd` `label` `map` `mark` `meter` `object` `output` `picture` `progress` `q` `rp` `rt` `ruby` `s` `samp` `select` `selectedcontent` `slot` `small` `span` `strong` `sub` `sup` `textarea` `time` `u` `var` `wbr` `svg` `math`                                    |
| **空元素 self-closing** | 没有内容、无结束标签   | `area` `base` `br` `col` `embed` `hr` `img` `input` `link` `meta` `source` `track` `wbr`                                                                                                                                                                                                                                                                                                              |
| **元数据 meta**         | 只出现在 head、不渲染  | `base` `link` `meta` `style` `title`（+ `script` `template`）                                                                                                                                                                                                                                                                                                                                         |
| **实验性 experimental** | 用前查兼容性           | `dialog` `hgroup` `picture` `slot` `template` `wbr`                                                                                                                                                                                                                                                                                                                                                   |

### 8.2 常用标签「一句话」

| 元素                                 | 一句话                      |
| ------------------------------------ | --------------------------- |
| `div` / `span`                       | 无语义容器（块 / 行内）     |
| `a`                                  | 超链接                      |
| `img`                                | 图片（必写 alt）            |
| `ul` / `ol` / `li`                   | 无序 / 有序 / 列表项        |
| `button`                             | 按钮（优先于 `div`）        |
| `input`                              | 输入控件（20+ 种 type）     |
| `section` / `article`                | 章节 / 独立内容             |
| `header` / `footer` / `nav` / `main` | 页眉 / 页脚 / 导航 / 主内容 |
| `table`                              | 数据表格                    |
| `video` / `audio`                    | 视频 / 音频                 |
| `canvas` / `svg`                     | 位图绘制 / 矢量图形         |
| `template` / `slot`                  | 模板 / 插槽                 |

### 8.3 常用文档结构模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="页面描述" />
    <title>页面标题</title>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <header>…</header>
    <nav aria-label="主导航">…</nav>
    <main>
      <article>
        <h1>文章标题</h1>
        <section>
          <h2>章节</h2>
          <p>正文…</p>
        </section>
      </article>
      <aside>…</aside>
    </main>
    <footer>…</footer>
    <script src="/app.js" defer></script>
  </body>
</html>
```

---

> 文档基于 **htmlreference.io** 的元素类型标注体系与 **WHATWG HTML Living Standard**（`indices.html` 元素/属性索引）整理。
> 规范持续演进（如 `search`、`selectedcontent`、`:has()` 相关属性等新特性），实际开发请以 <https://html.spec.whatwg.org/> 与 MDN 的最新内容为准。
