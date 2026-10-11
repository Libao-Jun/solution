# Emmet 快速语法

> 一份面向前端工程师的 **Emmet 快速语法 + 完整命令集** 速查手册。
>
> Emmet（前身 **Zen Coding**）是一款编辑器插件，使用类似 CSS 选择器的 **缩写（Abbreviations）** 表达式，按一下快捷键即可展开为结构化的 HTML / CSS / XSL 代码块，极大提升前端编码效率。
>
> 参考资料：
>
> - Emmet 快速语法：<https://code.z01.com/emmet/>
> - Emmet 完整命令集：<https://code.z01.com/emmet/all.html>
> - Emmet 官网：<https://emmet.io/>
> - 官方速查表：<http://docs.emmet.io/cheat-sheet/>

---

## 目录

**第一部分 · Emmet 快速语法（教程篇）**

1. [Emmet 的安装与介绍](#一emmet-的安装与介绍)
2. [基本语法（缩写操作符）](#二基本语法)
3. [HTML 标签语法](#三html-标签语法)
4. [CSS](#四css)
5. [XSL](#五xsl)

**第二部分 · Emmet 完整命令集（速查表篇）**

6. [语法符号速查](#六完整命令集一语法符号速查)
7. [HTML 缩写完整集](#七完整命令集二html-缩写全集)
8. [CSS 缩写完整集](#八完整命令集三css-缩写全集)
9. [XSL 缩写完整集](#九完整命令集四xsl-缩写全集)

10. [附录：常用操作与快捷键](#十附录常用操作与快捷键)

---

# 第一部分 · Emmet 快速语法

## 一、Emmet 的安装与介绍

### 1-1. 用 Emmet 的好处

- 大多数文本编辑器允许存储/重用代码块（"片段"），但缺点是需要**预先定义**，且**不能在运行时扩展**。
- Emmet 把片段概念提升到新层次：可设置 **CSS 形式的、能动态被解析的表达式**，按输入的缩写得到内容。
- 适用于 HTML/XML 与 CSS，也可用于编程语言。

### 1-2. 安装 Emmet

Emmet 为多数流行编辑器提供插件：

| 编辑器                | 安装方式                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **VS Code**           | 内置集成，无需安装（开箱可用）                                                                                           |
| **Adobe Dreamweaver** | 早在 **2015 版**就全面兼容 Emmet 语法，按 **Tab** 键即可展开                                                             |
| **Atom**              | ① 点击 Atom 的 "Preferences" 菜单（Windows 下为 "Settings"）→ ② 进入 Install 页面 → ③ 搜索 "Emmet" 包，点击 Install 安装 |
| **EditPlus 等**       | 安装对应插件后按 **Ctrl + E** 展开                                                                                       |

> 展开快捷键因编辑器而异：Dreamweaver 用 **Tab**，EditPlus 等软件用 **Ctrl + E**，VS Code 默认用 **Tab / Enter**。

### 1-3. 简单的使用样例

输入 `ul>li*6`，按展开键后自动生成完整 HTML 代码片断：

```html
<ul>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul>
```

---

## 二、基本语法

Emmet 使用特殊表达式 **Abbreviations（缩写）**，会被解析并转义成结构化代码块，语法类似 CSS 选择器，用来描述元素在 DOM 树中的位置和属性。

### 2-1. 后代：`>`

生成嵌套的子元素。

| 缩写        | 展开输出                        |
| ----------- | ------------------------------- |
| `nav>ul>li` | `<nav><ul><li></li></ul></nav>` |

```html
<!-- nav>ul>li -->
<nav>
  <ul>
    <li></li>
  </ul>
</nav>
```

### 2-2. 兄弟：`+`

生成同级的相邻元素。

| 缩写       | 展开输出                                      |
| ---------- | --------------------------------------------- |
| `div+p+bq` | `<div></div><p></p><blockquote></blockquote>` |

```html
<!-- div+p+bq -->
<div></div>
<p></p>
<blockquote></blockquote>
```

### 2-3. 上级：`^`（爬升）

`^` 让后面的元素**向上爬升一级**（跳出当前层级）。每多一个 `^`，就向上爬升一级。

**(1)** `div+div>p>span+em^bq` —— `bq` 爬升一级，成为内层 `div` 的兄弟：

```html
<div></div>
<div>
  <p><span></span><em></em></p>
  <blockquote></blockquote>
</div>
```

**(2)** `div+div>p>span+em^^bq` —— `bq` 爬升两级，跳出到最外层：

```html
<div></div>
<div>
  <p><span></span><em></em></p>
</div>
<blockquote></blockquote>
```

### 2-4. 分组：`()`

用圆括号把一组元素包成一个整体，控制层级与重复范围。

**(1)** `div>(header>ul>li*2>a)+footer>p`

```html
<div>
  <header>
    <ul>
      <li><a href=""></a></li>
      <li><a href=""></a></li>
    </ul>
  </header>
  <footer>
    <p></p>
  </footer>
</div>
```

**(2)** `(div>dl>(dt+dd)*3)+footer>p`

```html
<div>
  <dl>
    <dt></dt>
    <dd></dd>
    <dt></dt>
    <dd></dd>
    <dt></dt>
    <dd></dd>
  </dl>
</div>
<footer>
  <p></p>
</footer>
```

### 2-5. 乘法：`*`

重复生成 N 个元素。

| 缩写      | 展开输出                            |
| --------- | ----------------------------------- |
| `ul>li*5` | `<ul>` + 5 个 `<li></li>` + `</ul>` |

```html
<!-- ul>li*5 -->
<ul>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul>
```

### 2-6. 自增符号：`$`

`$` 用于自动编号，可配合 `*` 使用。

**(1)** 基本自增 —— `ul>li.item$*5` → `item1` ~ `item5`

```html
<ul>
  <li class="item1"></li>
  <li class="item2"></li>
  <li class="item3"></li>
  <li class="item4"></li>
  <li class="item5"></li>
</ul>
```

**(2)** 多处同时自增 —— `h$[title=item$]{Header $}*3`：标签名、属性、文本里的 `$` 全部同步递增

```html
<h1 title="item1">Header 1</h1>
<h2 title="item2">Header 2</h2>
<h3 title="item3">Header 3</h3>
```

**(3)** 位数补零 —— `ul>li.item$$$*5` → `item001` ~ `item005`

```html
<ul>
  <li class="item001"></li>
  <li class="item002"></li>
  <li class="item003"></li>
  <li class="item004"></li>
  <li class="item005"></li>
</ul>
```

**(4)** 倒序编号 —— `ul>li.item$@-*5` → `item5`、`item4`、`item3`、`item2`、`item1`

```html
<ul>
  <li class="item5"></li>
  <li class="item4"></li>
  <li class="item3"></li>
  <li class="item2"></li>
  <li class="item1"></li>
</ul>
```

**(5)** 指定起始基数 —— `ul>li.item$@3*5` → `item3` ~ `item7`

```html
<ul>
  <li class="item3"></li>
  <li class="item4"></li>
  <li class="item5"></li>
  <li class="item6"></li>
  <li class="item7"></li>
</ul>
```

### 2-7. ID 和类属性

沿用 CSS 选择器的写法：`#` 表示 ID，`.` 表示 class。默认容器标签为 `div`。

| 缩写                     | 展开输出                                 |
| ------------------------ | ---------------------------------------- |
| `#header`                | `<div id="header"></div>`                |
| `.title`                 | `<div class="title"></div>`              |
| `form#search.wide`       | `<form id="search" class="wide"></form>` |
| `p.class1.class2.class3` | `<p class="class1 class2 class3"></p>`   |

### 2-8. 自定义属性

用 `[]` 定义任意属性，多个属性用空格分隔；属性值可省略（生成空值）。

| 缩写                            | 展开输出                                     |
| ------------------------------- | -------------------------------------------- |
| `p[title="Hello world"]`        | `<p title="Hello world"></p>`                |
| `td[rowspan=2 colspan=3 title]` | `<td rowspan="2" colspan="3" title=""></td>` |
| `[a='value1' b="value2"]`       | `<div a="value1" b="value2"></div>`          |

### 2-9. 文本：`{}`

用 `{}` 给元素插入文本内容。

| 缩写                                | 展开输出                                       |
| ----------------------------------- | ---------------------------------------------- |
| `a{Click me}`                       | `<a href="">Click me</a>`                      |
| `p>{Click }+a{here}+{ to continue}` | `<p>Click <a href="">here</a> to continue</p>` |

### 2-10. 隐式标签

只写 `#id` / `.class` 时，Emmet 会根据**父元素**自动推断出默认标签名：

| 缩写              | 展开输出                                                    | 说明                  |
| ----------------- | ----------------------------------------------------------- | --------------------- |
| `.class`          | `<div class="class"></div>`                                 | 无父级 → `div`        |
| `em>.class`       | `<em><span class="class"></span></em>`                      | 行内父级 → `span`     |
| `ul>.class`       | `<ul><li class="class"></li></ul>`                          | 列表父级 → `li`       |
| `table>.row>.col` | `<table><tr class="row"><td class="col"></td></tr></table>` | `table` → `tr` → `td` |

常见隐式标签规则：

| 父元素                                | 隐式子标签  |
| ------------------------------------- | ----------- |
| `ul` / `ol`                           | `li`        |
| `table` / `tbody` / `thead` / `tfoot` | `tr`        |
| `tr`                                  | `td`        |
| `select`                              | `option`    |
| `dl`                                  | `dt` / `dd` |
| `map`                                 | `area`      |
| `em` / `span` 等行内元素              | `span`      |
| 其它（无上下文）                      | `div`       |

---

## 三、HTML 标签语法

### 3-1. 所有未知的缩写都会转换成标签

任何无法识别的缩写，Emmet 都会直接当作标签名输出。

| 缩写     | 展开输出            |
| -------- | ------------------- |
| `hangge` | `<hangge></hangge>` |
| `foo`    | `<foo></foo>`       |

### 3-2. 基本 HTML 标签

#### （1）文档骨架：`!`

输入 `!` 即可一键生成 HTML5 文档骨架（等价于 `html:5`）：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
  </head>
  <body></body>
</html>
```

#### （2）链接 / 元信息 / 嵌入元素

| 缩写           | 展开输出                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `a`            | `<a href=""></a>`                                                                                                                  |
| `a:link`       | `<a href="http://"></a>`                                                                                                           |
| `a:mail`       | `<a href="mailto:"></a>`                                                                                                           |
| `abbr`         | `<abbr title=""></abbr>`                                                                                                           |
| `acronym`      | `<acronym title=""></acronym>`                                                                                                     |
| `base`         | `<base href="" />`                                                                                                                 |
| `basefont`     | `<basefont />`                                                                                                                     |
| `br`           | `<br />`                                                                                                                           |
| `frame`        | `<frame />`                                                                                                                        |
| `hr`           | `<hr />`                                                                                                                           |
| `bdo`          | `<bdo dir=""></bdo>`                                                                                                               |
| `bdo:r`        | `<bdo dir="rtl"></bdo>`                                                                                                            |
| `bdo:l`        | `<bdo dir="ltr"></bdo>`                                                                                                            |
| `col`          | `<col />`                                                                                                                          |
| `link`         | `<link rel="stylesheet" href="" />`                                                                                                |
| `link:css`     | `<link rel="stylesheet" href="style.css" />`                                                                                       |
| `link:print`   | `<link rel="stylesheet" href="print.css" media="print" />`                                                                         |
| `link:favicon` | `<link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />`                                                              |
| `link:touch`   | `<link rel="apple-touch-icon" href="favicon.png" />`                                                                               |
| `link:rss`     | `<link rel="alternate" type="application/rss+xml" title="RSS" href="rss.xml" />`                                                   |
| `link:atom`    | `<link rel="alternate" type="application/atom+xml" title="Atom" href="atom.xml" />`                                                |
| `meta`         | `<meta />`                                                                                                                         |
| `meta:utf`     | `<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />`                                                             |
| `meta:win`     | `<meta http-equiv="Content-Type" content="text/html;charset=windows-1251" />`                                                      |
| `meta:vp`      | `<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />` |
| `meta:compat`  | `<meta http-equiv="X-UA-Compatible" content="IE=7" />`                                                                             |
| `style`        | `<style></style>`                                                                                                                  |
| `script`       | `<script></script>`                                                                                                                |
| `script:src`   | `<script src=""></script>`                                                                                                         |
| `img`          | `<img src="" alt="" />`                                                                                                            |
| `iframe`       | `<iframe src="" frameborder="0"></iframe>`                                                                                         |
| `embed`        | `<embed src="" type="" />`                                                                                                         |
| `object`       | `<object data="" type=""></object>`                                                                                                |
| `param`        | `<param name="" value="" />`                                                                                                       |
| `map`          | `<map name=""></map>`                                                                                                              |
| `area`         | `<area shape="" coords="" href="" alt="" />`                                                                                       |
| `area:d`       | `<area shape="default" href="" alt="" />`                                                                                          |
| `area:c`       | `<area shape="circle" coords="" href="" alt="" />`                                                                                 |
| `area:r`       | `<area shape="rect" coords="" href="" alt="" />`                                                                                   |
| `area:p`       | `<area shape="poly" coords="" href="" alt="" />`                                                                                   |

#### （3）表单元素

| 缩写                               | 展开输出                                                  |
| ---------------------------------- | --------------------------------------------------------- |
| `form`                             | `<form action=""></form>`                                 |
| `form:get`                         | `<form action="" method="get"></form>`                    |
| `form:post`                        | `<form action="" method="post"></form>`                   |
| `label`                            | `<label for=""></label>`                                  |
| `input`                            | `<input type="text" />`                                   |
| `inp`                              | `<input type="text" name="" id="" />`                     |
| `input:hidden`（缩写 `input:h`）   | `<input type="hidden" name="" />`                         |
| `input:text`（缩写 `input:t`）     | `<input type="text" name="" id="" />`                     |
| `input:search`                     | `<input type="search" name="" id="" />`                   |
| `input:email`                      | `<input type="email" name="" id="" />`                    |
| `input:url`                        | `<input type="url" name="" id="" />`                      |
| `input:password`（缩写 `input:p`） | `<input type="password" name="" id="" />`                 |
| `input:datetime`                   | `<input type="datetime" name="" id="" />`                 |
| `input:date`                       | `<input type="date" name="" id="" />`                     |
| `input:datetime-local`             | `<input type="datetime-local" name="" id="" />`           |
| `input:month`                      | `<input type="month" name="" id="" />`                    |
| `input:week`                       | `<input type="week" name="" id="" />`                     |
| `input:time`                       | `<input type="time" name="" id="" />`                     |
| `input:number`                     | `<input type="number" name="" id="" />`                   |
| `input:color`                      | `<input type="color" name="" id="" />`                    |
| `input:checkbox`（缩写 `input:c`） | `<input type="checkbox" name="" id="" />`                 |
| `input:radio`（缩写 `input:r`）    | `<input type="radio" name="" id="" />`                    |
| `input:range`                      | `<input type="range" name="" id="" />`                    |
| `input:file`（缩写 `input:f`）     | `<input type="file" name="" id="" />`                     |
| `input:submit`（缩写 `input:s`）   | `<input type="submit" value="" />`                        |
| `input:image`（缩写 `input:i`）    | `<input type="image" src="" alt="" />`                    |
| `input:button`（缩写 `input:b`）   | `<input type="button" value="" />`                        |
| `input:reset`                      | `<input type="reset" value="" />`                         |
| `isindex`                          | `<isindex />`                                             |
| `select`                           | `<select name="" id=""></select>`                         |
| `option`                           | `<option value=""></option>`                              |
| `textarea`                         | `<textarea name="" id="" cols="30" rows="10"></textarea>` |

#### （4）菜单 / 多媒体 / 别名与简写

| 缩写                               | 展开输出                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `menu:context`（缩写 `menu:c`）    | `<menu type="context"></menu>`                       |
| `menu:toolbar`（缩写 `menu:t`）    | `<menu type="toolbar"></menu>`                       |
| `video`                            | `<video src=""></video>`                             |
| `audio`                            | `<audio src=""></audio>`                             |
| `html:xml`                         | `<html xmlns="http://www.w3.org/1999/xhtml"></html>` |
| `keygen`                           | `<keygen />`                                         |
| `command`                          | `<command />`                                        |
| `bq`（= `blockquote`）             | `<blockquote></blockquote>`                          |
| `acr`（= `acronym`）               | `<acronym title=""></acronym>`                       |
| `fig`（= `figure`）                | `<figure></figure>`                                  |
| `figc`（= `figcaption`）           | `<figcaption></figcaption>`                          |
| `ifr`（= `iframe`）                | `<iframe src="" frameborder="0"></iframe>`           |
| `emb`（= `embed`）                 | `<embed src="" type="" />`                           |
| `obj`（= `object`）                | `<object data="" type=""></object>`                  |
| `src`（= `source`）                | `<source></source>`                                  |
| `cap`（= `caption`）               | `<caption></caption>`                                |
| `colg`（= `colgroup`）             | `<colgroup></colgroup>`                              |
| `btn:r`（= `button[type=reset]`）  | `<button type="reset"></button>`                     |
| `btn:s`（= `button[type=submit]`） | `<button type="submit"></button>`                    |

---

## 四、CSS

### 4-1. CSS 模块使用模糊搜索来查找未知的缩写

CSS 缩写不要求精确匹配，Emmet 会做**模糊搜索**：

- `ov-h` == `ovh` == `oh`，都展开为 `overflow:hidden;`
- 若未找到缩写，则转换为属性名：`foo-bar` → `foo-bar: |;`
- 可用连字符作为前缀生成供应商前缀属性：`-foo`

```css
/* 输入 -bdrs → 展开为 */
-webkit-border-radius:;
-moz-border-radius:;
border-radius:;
```

### 4-2. 常用样式简写

| 缩写  | 展开输出                 |
| ----- | ------------------------ |
| `pos` | `position:relative;`     |
| `t`   | `top:;`                  |
| `d:f` | `display:flex;`          |
| `m`   | `margin:;`               |
| `p`   | `padding:;`              |
| `w`   | `width:;`                |
| `h`   | `height:;`               |
| `bg`  | `background:#000;`       |
| `c`   | `color:#000;`            |
| `bd+` | `border:1px solid #000;` |

> 完整的 CSS 缩写清单见 [第二部分：CSS 缩写完整集](#八完整命令集三css-缩写全集)。

---

## 五、XSL

### （1）`xsl`

`xsl` 是 `!!!+xsl:stylesheet[version=1.0 xmlns:xsl=http://www.w3.org/1999/XSL/Transform]{ |}` 的别名：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

</xsl:stylesheet>
```

### （2）`var`

```xml
<xsl:variable name=""></xsl:variable>
```

---

---

# 第二部分 · Emmet 完整命令集

> 以下内容为 Emmet 官方速查表（cheat-sheet）的完整命令集，覆盖 **语法符号、HTML 缩写、CSS 缩写、XSL 缩写** 四大部分。
>
> 来源：<https://code.z01.com/emmet/all.html>

---

## 六、完整命令集（一）：语法符号速查

### 6.1 操作符与符号

| 符号  | 名称                   | 示例                              | 说明                                                    |
| ----- | ---------------------- | --------------------------------- | ------------------------------------------------------- |
| `>`   | Child（子元素）        | `nav>ul>li`                       | 生成嵌套：`<nav><ul><li></li></ul></nav>`               |
| `+`   | Sibling（兄弟元素）    | `div+p+bq`                        | 同级排列：`<div></div><p></p><blockquote></blockquote>` |
| `^`   | Climb-up（上跳一级）   | `div+div>p>span+em^bq`            | 把 `bq` 提升一级；`^^bq` 则跳出两层                     |
| `()`  | Grouping（分组）       | `div>(header>ul>li*2>a)+footer>p` | 用分组控制层级与重复范围                                |
| `*`   | Multiplication（重复） | `ul>li*5`                         | 生成 5 个 `li`                                          |
| `$`   | Item numbering（编号） | `ul>li.item$*5`                   | 生成 item1…item5                                        |
| `$$$` | 补零编号               | `ul>li.item$$$*5`                 | 生成 item001…item005                                    |
| `$@-` | 倒序编号               | `ul>li.item$@-*5`                 | 生成 item5…item1                                        |
| `$@3` | 指定起始编号           | `ul>li.item$@3*5`                 | 生成 item3…item7                                        |
| `[]`  | 自定义属性             | `p[title="Hello world"]`          | 生成 `<p title="Hello world"></p>`                      |
| `#`   | ID                     | `#header`                         | `<div id="header"></div>`                               |
| `.`   | CLASS                  | `.title`                          | `<div class="title"></div>`                             |
| `{}`  | Text（文本）           | `a{Click me}`                     | `<a href="">Click me</a>`                               |

**自定义属性的完整用法：**

| 缩写                            | 展开输出                                     |
| ------------------------------- | -------------------------------------------- |
| `p[title="Hello world"]`        | `<p title="Hello world"></p>`                |
| `td[rowspan=2 colspan=3 title]` | `<td rowspan="2" colspan="3" title=""></td>` |
| `[a='value1' b="value2"]`       | `<div a="value1" b="value2"></div>`          |

**ID / CLASS 组合：**

| 缩写                     | 展开输出                                 |
| ------------------------ | ---------------------------------------- |
| `#header`                | `<div id="header"></div>`                |
| `.title`                 | `<div class="title"></div>`              |
| `form#search.wide`       | `<form id="search" class="wide"></form>` |
| `p.class1.class2.class3` | `<p class="class1 class2 class3"></p>`   |

**文本插入：**

| 缩写                                | 展开输出                                       |
| ----------------------------------- | ---------------------------------------------- |
| `a{Click me}`                       | `<a href="">Click me</a>`                      |
| `p>{Click }+a{here}+{ to continue}` | `<p>Click <a href="">here</a> to continue</p>` |

### 6.2 隐式标签名（Implicit tag names）

| 缩写              | 生成                                                        |
| ----------------- | ----------------------------------------------------------- |
| `.class`          | `<div class="class"></div>`                                 |
| `em>.class`       | `<em><span class="class"></span></em>`                      |
| `ul>.class`       | `<ul><li class="class"></li></ul>`                          |
| `table>.row>.col` | `<table><tr class="row"><td class="col"></td></tr></table>` |

> 所有未知缩写都会被转换成标签，例如 `foo` → `<foo></foo>`。

---

## 七、完整命令集（二）：HTML 缩写全集

### 7.1 文档与元信息

| 缩写       | 生成 / 说明                                                 |
| ---------- | ----------------------------------------------------------- |
| `!`        | `html:5` 的别名，生成 HTML5 文档骨架                        |
| `doc`      | `html>(head>meta[charset=${charset}]+title{Document})+body` |
| `doc4`     | HTML4 风格文档（含 `http-equiv` Content-Type）              |
| `html:5`   | `!!!+doc[lang=${lang}]`，HTML5 完整模板                     |
| `html:4t`  | HTML 4.01 Transitional DOCTYPE + `doc4`                     |
| `html:4s`  | HTML 4.01 Strict DOCTYPE + `doc4`                           |
| `html:xt`  | XHTML 1.0 Transitional                                      |
| `html:xs`  | XHTML 1.0 Strict                                            |
| `html:xxs` | XHTML 1.1                                                   |
| `html:xml` | `<html xmlns="http://www.w3.org/1999/xhtml"></html>`        |
| `!!!`      | `<!DOCTYPE html>`                                           |
| `!!!4t`    | HTML 4.01 Transitional DOCTYPE                              |
| `!!!4s`    | HTML 4.01 Strict DOCTYPE                                    |
| `!!!xt`    | XHTML 1.0 Transitional DOCTYPE                              |
| `!!!xs`    | XHTML 1.0 Strict DOCTYPE                                    |
| `!!!xxs`   | XHTML 1.1 DOCTYPE                                           |
| `c`        | `<!-- ${child} -->` 注释                                    |
| `cc:ie6`   | `<!--[if lte IE 6]> ${child} <![endif]-->`                  |
| `cc:ie`    | `<!--[if IE]> ${child} <![endif]-->`                        |
| `cc:noie`  | `<!--[if !IE]><!--> ${child} <!--<![endif]-->`              |

### 7.2 head 相关

| 缩写                      | 生成                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `meta`                    | `<meta />`                                                                                                                         |
| `meta:utf`                | `<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />`                                                             |
| `meta:win`                | `<meta http-equiv="Content-Type" content="text/html;charset=windows-1251" />`                                                      |
| `meta:vp`                 | `<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />` |
| `meta:compat`             | `<meta http-equiv="X-UA-Compatible" content="IE=7" />`                                                                             |
| `link`                    | `<link rel="stylesheet" href="" />`                                                                                                |
| `link:css`                | `<link rel="stylesheet" href="style.css" />`                                                                                       |
| `link:print`              | `<link rel="stylesheet" href="print.css" media="print" />`                                                                         |
| `link:favicon`            | `<link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />`                                                              |
| `link:touch`              | `<link rel="apple-touch-icon" href="favicon.png" />`                                                                               |
| `link:rss`                | `<link rel="alternate" type="application/rss+xml" title="RSS" href="rss.xml" />`                                                   |
| `link:atom`               | `<link rel="alternate" type="application/atom+xml" title="Atom" href="atom.xml" />`                                                |
| `link:import` / `link:im` | `<link rel="import" href="component.html" />`                                                                                      |
| `style`                   | `<style></style>`                                                                                                                  |
| `script`                  | `<script></script>`                                                                                                                |
| `script:src`              | `<script src=""></script>`                                                                                                         |
| `base`                    | `<base href="" />`                                                                                                                 |
| `basefont`                | `<basefont />`                                                                                                                     |

### 7.3 文本与结构元素

| 缩写              | 生成                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| `a`               | `<a href=""></a>`                                                      |
| `a:link`          | `<a href="http://"></a>`                                               |
| `a:mail`          | `<a href="mailto:"></a>`                                               |
| `abbr`            | `<abbr title=""></abbr>`                                               |
| `acronym` / `acr` | `<acronym title=""></acronym>`                                         |
| `br`              | `<br />`                                                               |
| `hr`              | `<hr />`                                                               |
| `frame`           | `<frame />`                                                            |
| `bdo`             | `<bdo dir=""></bdo>`                                                   |
| `bdo:r`           | `<bdo dir="rtl"></bdo>`                                                |
| `bdo:l`           | `<bdo dir="ltr"></bdo>`                                                |
| `col`             | `<col />`                                                              |
| `bq`              | `blockquote` 别名 → `<blockquote></blockquote>`                        |
| `fig`             | `figure` → `<figure></figure>`                                         |
| `figc`            | `figcaption` → `<figcaption></figcaption>`                             |
| `pic`             | `picture` → `<picture></picture>`                                      |
| `ifr`             | `iframe` → `<iframe src="" frameborder="0"></iframe>`                  |
| `emb`             | `embed` → `<embed src="" type="" />`                                   |
| `obj`             | `object` → `<object data="" type=""></object>`                         |
| `cap`             | `caption` → `<caption></caption>`                                      |
| `colg`            | `colgroup` → `<colgroup></colgroup>`                                   |
| `fst` / `fset`    | `fieldset` → `<fieldset></fieldset>`                                   |
| `btn`             | `button` → `<button></button>`                                         |
| `optg`            | `optgroup` → `<optgroup></optgroup>`                                   |
| `tarea`           | `textarea` → `<textarea name="" id="" cols="30" rows="10"></textarea>` |
| `leg`             | `legend` → `<legend></legend>`                                         |
| `sect`            | `section` → `<section></section>`                                      |
| `art`             | `article` → `<article></article>`                                      |
| `hdr`             | `header` → `<header></header>`                                         |
| `ftr`             | `footer` → `<footer></footer>`                                         |
| `adr`             | `address` → `<address></address>`                                      |
| `dlg`             | `dialog` → `<dialog></dialog>`                                         |
| `str`             | `strong` → `<strong></strong>`                                         |
| `prog`            | `progress` → `<progress></progress>`                                   |
| `mn`              | `main` → `<main></main>`                                               |
| `tem`             | `template` → `<template></template>`                                   |
| `datag`           | `datagrid` → `<datagrid></datagrid>`                                   |
| `datal`           | `datalist` → `<datalist></datalist>`                                   |
| `kg`              | `keygen` → `<keygen />`                                                |
| `out`             | `output` → `<output></output>`                                         |
| `det`             | `details` → `<details></details>`                                      |
| `cmd`             | `command` → `<command />`                                              |
| `keygen`          | `<keygen />`                                                           |
| `command`         | `<command />`                                                          |

### 7.4 媒体元素

| 缩写                            | 生成                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `img`                           | `<img src="" alt="" />`                                    |
| `img:srcset` / `img:s`          | `<img srcset="" src="" alt="" />`                          |
| `img:sizes` / `img:z`           | `<img sizes="" srcset="" src="" alt="" />`                 |
| `picture`                       | `<picture></picture>`                                      |
| `source` / `src`                | `<source />`                                               |
| `source:src` / `src:sc`         | `<source src="" type="" />`                                |
| `source:srcset` / `src:s`       | `<source srcset="" />`                                     |
| `source:media` / `src:m`        | `<source media="(min-width: )" srcset="" />`               |
| `source:type` / `src:t`         | `<source srcset="" type="image/" />`                       |
| `source:sizes` / `src:z`        | `<source sizes="" srcset="" />`                            |
| `source:media:type` / `src:mt`  | `<source media="(min-width: )" srcset="" type="image/" />` |
| `source:media:sizes` / `src:mz` | `<source media="(min-width: )" sizes="" srcset="" />`      |
| `source:sizes:type` / `src:zt`  | `<source sizes="" srcset="" type="image/" />`              |
| `iframe`                        | `<iframe src="" frameborder="0"></iframe>`                 |
| `embed`                         | `<embed src="" type="" />`                                 |
| `object`                        | `<object data="" type=""></object>`                        |
| `param`                         | `<param name="" value="" />`                               |
| `map`                           | `<map name=""></map>`                                      |
| `area`                          | `<area shape="" coords="" href="" alt="" />`               |
| `area:d`                        | `<area shape="default" href="" alt="" />`                  |
| `area:c`                        | `<area shape="circle" coords="" href="" alt="" />`         |
| `area:r`                        | `<area shape="rect" coords="" href="" alt="" />`           |
| `area:p`                        | `<area shape="poly" coords="" href="" alt="" />`           |
| `video`                         | `<video src=""></video>`                                   |
| `audio`                         | `<audio src=""></audio>`                                   |
| `marquee`                       | `<marquee behavior="" direction=""></marquee>`             |

### 7.5 表单元素

| 缩写                                                    | 生成                                                      |
| ------------------------------------------------------- | --------------------------------------------------------- |
| `form`                                                  | `<form action=""></form>`                                 |
| `form:get`                                              | `<form action="" method="get"></form>`                    |
| `form:post`                                             | `<form action="" method="post"></form>`                   |
| `label`                                                 | `<label for=""></label>`                                  |
| `input`                                                 | `<input type="text" />`                                   |
| `inp`                                                   | `<input type="text" name="" id="" />`                     |
| `input:hidden` / `input:h`                              | `<input type="hidden" name="" />`                         |
| `input:text` / `input:t`                                | `<input type="text" name="" id="" />`                     |
| `input:search`                                          | `<input type="search" name="" id="" />`                   |
| `input:email`                                           | `<input type="email" name="" id="" />`                    |
| `input:url`                                             | `<input type="url" name="" id="" />`                      |
| `input:password` / `input:p`                            | `<input type="password" name="" id="" />`                 |
| `input:datetime`                                        | `<input type="datetime" name="" id="" />`                 |
| `input:date`                                            | `<input type="date" name="" id="" />`                     |
| `input:datetime-local`                                  | `<input type="datetime-local" name="" id="" />`           |
| `input:month`                                           | `<input type="month" name="" id="" />`                    |
| `input:week`                                            | `<input type="week" name="" id="" />`                     |
| `input:time`                                            | `<input type="time" name="" id="" />`                     |
| `input:tel`                                             | `<input type="tel" name="" id="" />`                      |
| `input:number`                                          | `<input type="number" name="" id="" />`                   |
| `input:color`                                           | `<input type="color" name="" id="" />`                    |
| `input:checkbox` / `input:c`                            | `<input type="checkbox" name="" id="" />`                 |
| `input:radio` / `input:r`                               | `<input type="radio" name="" id="" />`                    |
| `input:range`                                           | `<input type="range" name="" id="" />`                    |
| `input:file` / `input:f`                                | `<input type="file" name="" id="" />`                     |
| `input:submit` / `input:s`                              | `<input type="submit" value="" />`                        |
| `input:image` / `input:i`                               | `<input type="image" src="" alt="" />`                    |
| `input:button` / `input:b`                              | `<input type="button" value="" />`                        |
| `input:reset`                                           | `<input type="reset" value="" />`                         |
| `isindex`                                               | `<isindex />`                                             |
| `select`                                                | `<select name="" id=""></select>`                         |
| `select:disabled` / `select:d`                          | `<select name="" id="" disabled="disabled"></select>`     |
| `option` / `opt`                                        | `<option value=""></option>`                              |
| `textarea`                                              | `<textarea name="" id="" cols="30" rows="10"></textarea>` |
| `menu:context` / `menu:c`                               | `<menu type="context"></menu>`                            |
| `menu:toolbar` / `menu:t`                               | `<menu type="toolbar"></menu>`                            |
| `button:submit` / `button:s` / `btn:s`                  | `<button type="submit"></button>`                         |
| `button:reset` / `button:r` / `btn:r`                   | `<button type="reset"></button>`                          |
| `button:disabled` / `button:d` / `btn:d`                | `<button disabled="disabled"></button>`                   |
| `fieldset:disabled` / `fieldset:d` / `fset:d` / `fst:d` | `<fieldset disabled="disabled"></fieldset>`               |

### 7.6 响应式图片（`ri:` 系列）

| 缩写                   | 生成                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `ri:dpr` / `ri:d`      | `<img srcset="" src="" alt="" />`                                                    |
| `ri:viewport` / `ri:v` | `<img sizes="" srcset="" src="" alt="" />`                                           |
| `ri:art` / `ri:a`      | `<picture><source media="(min-width: )" srcset="" /><img src="" alt="" /></picture>` |
| `ri:type` / `ri:t`     | `<picture><source srcset="" type="image/" /><img src="" alt="" /></picture>`         |

### 7.7 快捷包裹（`+` 后缀别名）

在标签后加 `+`，自动生成「容器 + 默认子元素」结构：

| 缩写                  | 等价写法                    | 生成                                                            |
| --------------------- | --------------------------- | --------------------------------------------------------------- |
| `ol+`                 | `ol>li`                     | `<ol><li></li></ol>`                                            |
| `ul+`                 | `ul>li`                     | `<ul><li></li></ul>`                                            |
| `dl+`                 | `dl>dt+dd`                  | `<dl><dt></dt><dd></dd></dl>`                                   |
| `map+`                | `map>area`                  | `<map name=""><area shape="" coords="" href="" alt="" /></map>` |
| `table+`              | `table>tr>td`               | `<table><tr><td></td></tr></table>`                             |
| `colgroup+` / `colg+` | `colgroup>col`              | `<colgroup><col /></colgroup>`                                  |
| `tr+`                 | `tr>td`                     | `<tr><td></td></tr>`                                            |
| `select+`             | `select>option`             | `<select name="" id=""><option value=""></option></select>`     |
| `optgroup+` / `optg+` | `optgroup>option`           | `<optgroup><option value=""></option></optgroup>`               |
| `pic+`                | `picture>source:srcset+img` | `<picture><source srcset="" /><img src="" alt="" /></picture>`  |

---

## 八、完整命令集（三）：CSS 缩写全集

> **规则说明**
>
> - **模糊搜索**：`ov:h` == `ov-h` == `ovh` == `oh`，不必精确输入。
> - **未知缩写**：若未匹配到，则转换为属性名，如 `foo-bar` → `foo-bar: |;`。
> - **厂商前缀**：在缩写前加连字符 `-`，生成带厂商前缀的属性，如 `-foo`。
> - **默认值占位**：结果中的 `|` 表示光标停留位置。

### 8.1 视觉格式化（Visual Formatting）

| 缩写         | 结果                                |
| ------------ | ----------------------------------- |
| `pos`        | `position:relative;`                |
| `pos:s`      | `position:static;`                  |
| `pos:a`      | `position:absolute;`                |
| `pos:r`      | `position:relative;`                |
| `pos:f`      | `position:fixed;`                   |
| `t`          | `top:;`                             |
| `t:a`        | `top:auto;`                         |
| `r`          | `right:;`                           |
| `r:a`        | `right:auto;`                       |
| `b`          | `bottom:;`                          |
| `b:a`        | `bottom:auto;`                      |
| `l`          | `left:;`                            |
| `l:a`        | `left:auto;`                        |
| `z`          | `z-index:;`                         |
| `z:a`        | `z-index:auto;`                     |
| `fl`         | `float:left;`                       |
| `fl:n`       | `float:none;`                       |
| `fl:l`       | `float:left;`                       |
| `fl:r`       | `float:right;`                      |
| `cl`         | `clear:both;`                       |
| `cl:n`       | `clear:none;`                       |
| `cl:l`       | `clear:left;`                       |
| `cl:r`       | `clear:right;`                      |
| `cl:b`       | `clear:both;`                       |
| `d`          | `display:block;`                    |
| `d:n`        | `display:none;`                     |
| `d:b`        | `display:block;`                    |
| `d:f`        | `display:flex;`                     |
| `d:if`       | `display:inline-flex;`              |
| `d:i`        | `display:inline;`                   |
| `d:ib`       | `display:inline-block;`             |
| `d:li`       | `display:list-item;`                |
| `d:ri`       | `display:run-in;`                   |
| `d:cp`       | `display:compact;`                  |
| `d:tb`       | `display:table;`                    |
| `d:itb`      | `display:inline-table;`             |
| `d:tbcp`     | `display:table-caption;`            |
| `d:tbcl`     | `display:table-column;`             |
| `d:tbclg`    | `display:table-column-group;`       |
| `d:tbhg`     | `display:table-header-group;`       |
| `d:tbfg`     | `display:table-footer-group;`       |
| `d:tbr`      | `display:table-row;`                |
| `d:tbrg`     | `display:table-row-group;`          |
| `d:tbc`      | `display:table-cell;`               |
| `d:rb`       | `display:ruby;`                     |
| `d:rbb`      | `display:ruby-base;`                |
| `d:rbbg`     | `display:ruby-base-group;`          |
| `d:rbt`      | `display:ruby-text;`                |
| `d:rbtg`     | `display:ruby-text-group;`          |
| `v`          | `visibility:hidden;`                |
| `v:v`        | `visibility:visible;`               |
| `v:h`        | `visibility:hidden;`                |
| `v:c`        | `visibility:collapse;`              |
| `ov`         | `overflow:hidden;`                  |
| `ov:v`       | `overflow:visible;`                 |
| `ov:h`       | `overflow:hidden;`                  |
| `ov:s`       | `overflow:scroll;`                  |
| `ov:a`       | `overflow:auto;`                    |
| `ovx`        | `overflow-x:hidden;`                |
| `ovx:v`      | `overflow-x:visible;`               |
| `ovx:h`      | `overflow-x:hidden;`                |
| `ovx:s`      | `overflow-x:scroll;`                |
| `ovx:a`      | `overflow-x:auto;`                  |
| `ovy`        | `overflow-y:hidden;`                |
| `ovy:v`      | `overflow-y:visible;`               |
| `ovy:h`      | `overflow-y:hidden;`                |
| `ovy:s`      | `overflow-y:scroll;`                |
| `ovy:a`      | `overflow-y:auto;`                  |
| `ovs`        | `overflow-style:scrollbar;`         |
| `ovs:a`      | `overflow-style:auto;`              |
| `ovs:s`      | `overflow-style:scrollbar;`         |
| `ovs:p`      | `overflow-style:panner;`            |
| `ovs:m`      | `overflow-style:move;`              |
| `ovs:mq`     | `overflow-style:marquee;`           |
| `zoo` / `zm` | `zoom:1;`                           |
| `cp`         | `clip:;`                            |
| `cp:a`       | `clip:auto;`                        |
| `cp:r`       | `clip:rect(top right bottom left);` |
| `rsz`        | `resize:;`                          |
| `rsz:n`      | `resize:none;`                      |
| `rsz:b`      | `resize:both;`                      |
| `rsz:h`      | `resize:horizontal;`                |
| `rsz:v`      | `resize:vertical;`                  |
| `cur`        | `cursor:${pointer};`                |
| `cur:a`      | `cursor:auto;`                      |
| `cur:d`      | `cursor:default;`                   |
| `cur:c`      | `cursor:crosshair;`                 |
| `cur:ha`     | `cursor:hand;`                      |
| `cur:he`     | `cursor:help;`                      |
| `cur:m`      | `cursor:move;`                      |
| `cur:p`      | `cursor:pointer;`                   |
| `cur:t`      | `cursor:text;`                      |

### 8.2 Margin & Padding

| 缩写   | 结果                  |
| ------ | --------------------- |
| `m`    | `margin:;`            |
| `m:a`  | `margin:auto;`        |
| `mt`   | `margin-top:;`        |
| `mt:a` | `margin-top:auto;`    |
| `mr`   | `margin-right:;`      |
| `mr:a` | `margin-right:auto;`  |
| `mb`   | `margin-bottom:;`     |
| `mb:a` | `margin-bottom:auto;` |
| `ml`   | `margin-left:;`       |
| `ml:a` | `margin-left:auto;`   |
| `p`    | `padding:;`           |
| `pt`   | `padding-top:;`       |
| `pr`   | `padding-right:;`     |
| `pb`   | `padding-bottom:;`    |
| `pl`   | `padding-left:;`      |

### 8.3 盒模型与尺寸（Box Sizing）

| 缩写      | 结果                                                   |
| --------- | ------------------------------------------------------ |
| `bxz`     | `box-sizing:border-box;`                               |
| `bxz:cb`  | `box-sizing:content-box;`                              |
| `bxz:bb`  | `box-sizing:border-box;`                               |
| `bxsh`    | `box-shadow:inset hoff voff blur color;`               |
| `bxsh:r`  | `box-shadow:inset hoff voff blur spread rgb(0, 0, 0);` |
| `bxsh:ra` | `box-shadow:inset h v blur spread rgba(0, 0, 0, .5);`  |
| `bxsh:n`  | `box-shadow:none;`                                     |
| `w`       | `width:;`                                              |
| `w:a`     | `width:auto;`                                          |
| `h`       | `height:;`                                             |
| `h:a`     | `height:auto;`                                         |
| `maw`     | `max-width:;`                                          |
| `maw:n`   | `max-width:none;`                                      |
| `mah`     | `max-height:;`                                         |
| `mah:n`   | `max-height:none;`                                     |
| `miw`     | `min-width:;`                                          |
| `mih`     | `min-height:;`                                         |

### 8.4 字体（Font）

| 缩写      | 结果                                                                  |
| --------- | --------------------------------------------------------------------- |
| `f`       | `font:;`                                                              |
| `f+`      | `font:1em Arial,sans-serif;`                                          |
| `fw`      | `font-weight:;`                                                       |
| `fw:n`    | `font-weight:normal;`                                                 |
| `fw:b`    | `font-weight:bold;`                                                   |
| `fw:br`   | `font-weight:bolder;`                                                 |
| `fw:lr`   | `font-weight:lighter;`                                                |
| `fs`      | `font-style:${italic};`                                               |
| `fs:n`    | `font-style:normal;`                                                  |
| `fs:i`    | `font-style:italic;`                                                  |
| `fs:o`    | `font-style:oblique;`                                                 |
| `fv`      | `font-variant:;`                                                      |
| `fv:n`    | `font-variant:normal;`                                                |
| `fv:sc`   | `font-variant:small-caps;`                                            |
| `fz`      | `font-size:;`                                                         |
| `fza`     | `font-size-adjust:;`                                                  |
| `fza:n`   | `font-size-adjust:none;`                                              |
| `ff`      | `font-family:;`                                                       |
| `ff:s`    | `font-family:serif;`                                                  |
| `ff:ss`   | `font-family:sans-serif;`                                             |
| `ff:c`    | `font-family:cursive;`                                                |
| `ff:f`    | `font-family:fantasy;`                                                |
| `ff:m`    | `font-family:monospace;`                                              |
| `ff:a`    | `font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;`        |
| `ff:t`    | `font-family: "Times New Roman", Times, Baskerville, Georgia, serif;` |
| `ff:v`    | `font-family: Verdana, Geneva, sans-serif;`                           |
| `fef`     | `font-effect:;`                                                       |
| `fef:n`   | `font-effect:none;`                                                   |
| `fef:eg`  | `font-effect:engrave;`                                                |
| `fef:eb`  | `font-effect:emboss;`                                                 |
| `fef:o`   | `font-effect:outline;`                                                |
| `fem`     | `font-emphasize:;`                                                    |
| `femp`    | `font-emphasize-position:;`                                           |
| `femp:b`  | `font-emphasize-position:before;`                                     |
| `femp:a`  | `font-emphasize-position:after;`                                      |
| `fems`    | `font-emphasize-style:;`                                              |
| `fems:n`  | `font-emphasize-style:none;`                                          |
| `fems:ac` | `font-emphasize-style:accent;`                                        |
| `fems:dt` | `font-emphasize-style:dot;`                                           |
| `fems:c`  | `font-emphasize-style:circle;`                                        |
| `fems:ds` | `font-emphasize-style:disc;`                                          |
| `fsm`     | `font-smooth:;`                                                       |
| `fsm:a`   | `font-smooth:auto;`                                                   |
| `fsm:n`   | `font-smooth:never;`                                                  |
| `fsm:aw`  | `font-smooth:always;`                                                 |
| `fst`     | `font-stretch:;`                                                      |
| `fst:n`   | `font-stretch:normal;`                                                |
| `fst:uc`  | `font-stretch:ultra-condensed;`                                       |
| `fst:ec`  | `font-stretch:extra-condensed;`                                       |
| `fst:c`   | `font-stretch:condensed;`                                             |
| `fst:sc`  | `font-stretch:semi-condensed;`                                        |
| `fst:se`  | `font-stretch:semi-expanded;`                                         |
| `fst:e`   | `font-stretch:expanded;`                                              |
| `fst:ee`  | `font-stretch:extra-expanded;`                                        |
| `fst:ue`  | `font-stretch:ultra-expanded;`                                        |

### 8.5 文本（Text）

| 缩写      | 结果                                      |
| --------- | ----------------------------------------- |
| `va`      | `vertical-align:top;`                     |
| `va:sup`  | `vertical-align:super;`                   |
| `va:t`    | `vertical-align:top;`                     |
| `va:tt`   | `vertical-align:text-top;`                |
| `va:m`    | `vertical-align:middle;`                  |
| `va:bl`   | `vertical-align:baseline;`                |
| `va:b`    | `vertical-align:bottom;`                  |
| `va:tb`   | `vertical-align:text-bottom;`             |
| `va:sub`  | `vertical-align:sub;`                     |
| `ta`      | `text-align:left;`                        |
| `ta:l`    | `text-align:left;`                        |
| `ta:c`    | `text-align:center;`                      |
| `ta:r`    | `text-align:right;`                       |
| `ta:j`    | `text-align:justify;`                     |
| `ta-lst`  | `text-align-last:;`                       |
| `tal:a`   | `text-align-last:auto;`                   |
| `tal:l`   | `text-align-last:left;`                   |
| `tal:c`   | `text-align-last:center;`                 |
| `tal:r`   | `text-align-last:right;`                  |
| `td`      | `text-decoration:none;`                   |
| `td:n`    | `text-decoration:none;`                   |
| `td:u`    | `text-decoration:underline;`              |
| `td:o`    | `text-decoration:overline;`               |
| `td:l`    | `text-decoration:line-through;`           |
| `te`      | `text-emphasis:;`                         |
| `te:n`    | `text-emphasis:none;`                     |
| `te:ac`   | `text-emphasis:accent;`                   |
| `te:dt`   | `text-emphasis:dot;`                      |
| `te:c`    | `text-emphasis:circle;`                   |
| `te:ds`   | `text-emphasis:disc;`                     |
| `te:b`    | `text-emphasis:before;`                   |
| `te:a`    | `text-emphasis:after;`                    |
| `th`      | `text-height:;`                           |
| `th:a`    | `text-height:auto;`                       |
| `th:f`    | `text-height:font-size;`                  |
| `th:t`    | `text-height:text-size;`                  |
| `th:m`    | `text-height:max-size;`                   |
| `ti`      | `text-indent:;`                           |
| `ti:-`    | `text-indent:-9999px;`                    |
| `tj`      | `text-justify:;`                          |
| `tj:a`    | `text-justify:auto;`                      |
| `tj:iw`   | `text-justify:inter-word;`                |
| `tj:ii`   | `text-justify:inter-ideograph;`           |
| `tj:ic`   | `text-justify:inter-cluster;`             |
| `tj:d`    | `text-justify:distribute;`                |
| `tj:k`    | `text-justify:kashida;`                   |
| `tj:t`    | `text-justify:tibetan;`                   |
| `to`      | `text-outline:;`                          |
| `to+`     | `text-outline:0 0 #000;`                  |
| `to:n`    | `text-outline:none;`                      |
| `tr`      | `text-replace:;`                          |
| `tr:n`    | `text-replace:none;`                      |
| `tt`      | `text-transform:uppercase;`               |
| `tt:n`    | `text-transform:none;`                    |
| `tt:c`    | `text-transform:capitalize;`              |
| `tt:u`    | `text-transform:uppercase;`               |
| `tt:l`    | `text-transform:lowercase;`               |
| `tw`      | `text-wrap:;`                             |
| `tw:n`    | `text-wrap:normal;`                       |
| `tw:no`   | `text-wrap:none;`                         |
| `tw:u`    | `text-wrap:unrestricted;`                 |
| `tw:s`    | `text-wrap:suppress;`                     |
| `tsh`     | `text-shadow:hoff voff blur #000;`        |
| `tsh:r`   | `text-shadow:h v blur rgb(0, 0, 0);`      |
| `tsh:ra`  | `text-shadow:h v blur rgba(0, 0, 0, .5);` |
| `tsh+`    | `text-shadow:0 0 0 #000;`                 |
| `tsh:n`   | `text-shadow:none;`                       |
| `lh`      | `line-height:;`                           |
| `lts`     | `letter-spacing:;`                        |
| `lts-n`   | `letter-spacing:normal;`                  |
| `whs`     | `white-space:;`                           |
| `whs:n`   | `white-space:normal;`                     |
| `whs:p`   | `white-space:pre;`                        |
| `whs:nw`  | `white-space:nowrap;`                     |
| `whs:pw`  | `white-space:pre-wrap;`                   |
| `whs:pl`  | `white-space:pre-line;`                   |
| `whsc`    | `white-space-collapse:;`                  |
| `whsc:n`  | `white-space-collapse:normal;`            |
| `whsc:k`  | `white-space-collapse:keep-all;`          |
| `whsc:l`  | `white-space-collapse:loose;`             |
| `whsc:bs` | `white-space-collapse:break-strict;`      |
| `whsc:ba` | `white-space-collapse:break-all;`         |
| `wob`     | `word-break:;`                            |
| `wob:n`   | `word-break:normal;`                      |
| `wob:k`   | `word-break:keep-all;`                    |
| `wob:ba`  | `word-break:break-all;`                   |
| `wos`     | `word-spacing:;`                          |
| `wow`     | `word-wrap:;`                             |
| `wow:nm`  | `word-wrap:normal;`                       |
| `wow:n`   | `word-wrap:none;`                         |
| `wow:u`   | `word-wrap:unrestricted;`                 |
| `wow:s`   | `word-wrap:suppress;`                     |
| `wow:b`   | `word-wrap:break-word;`                   |

### 8.6 背景（Background）

| 缩写      | 结果                                   |
| --------- | -------------------------------------- |
| `bg`      | `background:#000;`                     |
| `bg+`     | `background:#fff url() 0 0 no-repeat;` |
| `bg:n`    | `background:none;`                     |
| `bgc`     | `background-color:#fff;`               |
| `bgc:t`   | `background-color:transparent;`        |
| `bgi`     | `background-image:url();`              |
| `bgi:n`   | `background-image:none;`               |
| `bgr`     | `background-repeat:;`                  |
| `bgr:n`   | `background-repeat:no-repeat;`         |
| `bgr:x`   | `background-repeat:repeat-x;`          |
| `bgr:y`   | `background-repeat:repeat-y;`          |
| `bgr:sp`  | `background-repeat:space;`             |
| `bgr:rd`  | `background-repeat:round;`             |
| `bga`     | `background-attachment:;`              |
| `bga:f`   | `background-attachment:fixed;`         |
| `bga:s`   | `background-attachment:scroll;`        |
| `bgp`     | `background-position:0 0;`             |
| `bgpx`    | `background-position-x:;`              |
| `bgpy`    | `background-position-y:;`              |
| `bgbk`    | `background-break:;`                   |
| `bgbk:bb` | `background-break:bounding-box;`       |
| `bgbk:eb` | `background-break:each-box;`           |
| `bgbk:c`  | `background-break:continuous;`         |
| `bgcp`    | `background-clip:padding-box;`         |
| `bgcp:bb` | `background-clip:border-box;`          |
| `bgcp:pb` | `background-clip:padding-box;`         |
| `bgcp:cb` | `background-clip:content-box;`         |
| `bgcp:nc` | `background-clip:no-clip;`             |
| `bgo`     | `background-origin:;`                  |
| `bgo:pb`  | `background-origin:padding-box;`       |
| `bgo:bb`  | `background-origin:border-box;`        |
| `bgo:cb`  | `background-origin:content-box;`       |
| `bgsz`    | `background-size:;`                    |
| `bgsz:a`  | `background-size:auto;`                |
| `bgsz:ct` | `background-size:contain;`             |
| `bgsz:cv` | `background-size:cover;`               |

### 8.7 颜色与不透明度

| 缩写   | 结果                       |
| ------ | -------------------------- |
| `c`    | `color:#000;`              |
| `c:r`  | `color:rgb(0, 0, 0);`      |
| `c:ra` | `color:rgba(0, 0, 0, .5);` |
| `op`   | `opacity:;`                |

### 8.8 生成内容（Generated content）

| 缩写                 | 结果                                       |
| -------------------- | ------------------------------------------ |
| `cnt`                | `content:'';`                              |
| `cnt:n` / `ct:n`     | `content:normal;`                          |
| `cnt:oq` / `ct:oq`   | `content:open-quote;`                      |
| `cnt:noq` / `ct:noq` | `content:no-open-quote;`                   |
| `cnt:cq` / `ct:cq`   | `content:close-quote;`                     |
| `cnt:ncq` / `ct:ncq` | `content:no-close-quote;`                  |
| `cnt:a` / `ct:a`     | `content:attr();`                          |
| `cnt:c` / `ct:c`     | `content:counter();`                       |
| `cnt:cs` / `ct:cs`   | `content:counters();`                      |
| `ct`                 | `content:;`                                |
| `q`                  | `quotes:;`                                 |
| `q:n`                | `quotes:none;`                             |
| `q:ru`               | `quotes: '\00AB' '\00BB' '\201E' '\201C';` |
| `q:en`               | `quotes: '\201C' '\201D' '\2018' '\2019';` |
| `coi`                | `counter-increment:;`                      |
| `cor`                | `counter-reset:;`                          |

### 8.9 轮廓（Outline）

| 缩写     | 结果                    |
| -------- | ----------------------- |
| `ol`     | `outline:;`             |
| `ol:n`   | `outline:none;`         |
| `olo`    | `outline-offset:;`      |
| `olw`    | `outline-width:;`       |
| `olw:tn` | `outline-width:thin;`   |
| `olw:m`  | `outline-width:medium;` |
| `olw:tc` | `outline-width:thick;`  |
| `ols`    | `outline-style:;`       |
| `ols:n`  | `outline-style:none;`   |
| `ols:dt` | `outline-style:dotted;` |
| `ols:ds` | `outline-style:dashed;` |
| `ols:s`  | `outline-style:solid;`  |
| `ols:db` | `outline-style:double;` |
| `ols:g`  | `outline-style:groove;` |
| `ols:r`  | `outline-style:ridge;`  |
| `ols:i`  | `outline-style:inset;`  |
| `ols:o`  | `outline-style:outset;` |
| `olc`    | `outline-color:#000;`   |
| `olc:i`  | `outline-color:invert;` |

### 8.10 表格（Tables）

| 缩写    | 结果                   |
| ------- | ---------------------- |
| `tbl`   | `table-layout:;`       |
| `tbl:a` | `table-layout:auto;`   |
| `tbl:f` | `table-layout:fixed;`  |
| `cps`   | `caption-side:;`       |
| `cps:t` | `caption-side:top;`    |
| `cps:b` | `caption-side:bottom;` |
| `ec`    | `empty-cells:;`        |
| `ec:s`  | `empty-cells:show;`    |
| `ec:h`  | `empty-cells:hide;`    |

### 8.11 边框（Border）

| 缩写         | 结果                                  |
| ------------ | ------------------------------------- |
| `bd`         | `border:;`                            |
| `bd+`        | `border:1px solid #000;`              |
| `bd:n`       | `border:none;`                        |
| `bdbk`       | `border-break:close;`                 |
| `bdbk:c`     | `border-break:close;`                 |
| `bdcl`       | `border-collapse:;`                   |
| `bdcl:c`     | `border-collapse:collapse;`           |
| `bdcl:s`     | `border-collapse:separate;`           |
| `bdc`        | `border-color:#000;`                  |
| `bdc:t`      | `border-color:transparent;`           |
| `bdi`        | `border-image:url();`                 |
| `bdi:n`      | `border-image:none;`                  |
| `bdti`       | `border-top-image:url();`             |
| `bdti:n`     | `border-top-image:none;`              |
| `bdri`       | `border-right-image:url();`           |
| `bdri:n`     | `border-right-image:none;`            |
| `bdbi`       | `border-bottom-image:url();`          |
| `bdbi:n`     | `border-bottom-image:none;`           |
| `bdli`       | `border-left-image:url();`            |
| `bdli:n`     | `border-left-image:none;`             |
| `bdci`       | `border-corner-image:url();`          |
| `bdci:n`     | `border-corner-image:none;`           |
| `bdci:c`     | `border-corner-image:continue;`       |
| `bdtli`      | `border-top-left-image:url();`        |
| `bdtli:n`    | `border-top-left-image:none;`         |
| `bdtli:c`    | `border-top-left-image:continue;`     |
| `bdtri`      | `border-top-right-image:url();`       |
| `bdtri:n`    | `border-top-right-image:none;`        |
| `bdtri:c`    | `border-top-right-image:continue;`    |
| `bdbri`      | `border-bottom-right-image:url();`    |
| `bdbri:n`    | `border-bottom-right-image:none;`     |
| `bdbri:c`    | `border-bottom-right-image:continue;` |
| `bdbli`      | `border-bottom-left-image:url();`     |
| `bdbli:n`    | `border-bottom-left-image:none;`      |
| `bdbli:c`    | `border-bottom-left-image:continue;`  |
| `bdf`        | `border-fit:repeat;`                  |
| `bdf:c`      | `border-fit:clip;`                    |
| `bdf:r`      | `border-fit:repeat;`                  |
| `bdf:sc`     | `border-fit:scale;`                   |
| `bdf:st`     | `border-fit:stretch;`                 |
| `bdf:ow`     | `border-fit:overwrite;`               |
| `bdf:of`     | `border-fit:overflow;`                |
| `bdf:sp`     | `border-fit:space;`                   |
| `bdlen`      | `border-length:;`                     |
| `bdlen:a`    | `border-length:auto;`                 |
| `bdsp`       | `border-spacing:;`                    |
| `bds`        | `border-style:;`                      |
| `bds:n`      | `border-style:none;`                  |
| `bds:h`      | `border-style:hidden;`                |
| `bds:dt`     | `border-style:dotted;`                |
| `bds:ds`     | `border-style:dashed;`                |
| `bds:s`      | `border-style:solid;`                 |
| `bds:db`     | `border-style:double;`                |
| `bds:dtds`   | `border-style:dot-dash;`              |
| `bds:dtdtds` | `border-style:dot-dot-dash;`          |
| `bds:w`      | `border-style:wave;`                  |
| `bds:g`      | `border-style:groove;`                |
| `bds:r`      | `border-style:ridge;`                 |
| `bds:i`      | `border-style:inset;`                 |
| `bds:o`      | `border-style:outset;`                |
| `bdw`        | `border-width:;`                      |
| `bdt` / `bt` | `border-top:;`                        |
| `bdt+`       | `border-top:1px solid #000;`          |
| `bdt:n`      | `border-top:none;`                    |
| `bdtw`       | `border-top-width:;`                  |
| `bdts`       | `border-top-style:;`                  |
| `bdts:n`     | `border-top-style:none;`              |
| `bdtc`       | `border-top-color:#000;`              |
| `bdtc:t`     | `border-top-color:transparent;`       |
| `bdr` / `br` | `border-right:;`                      |
| `bdr+`       | `border-right:1px solid #000;`        |
| `bdr:n`      | `border-right:none;`                  |
| `bdrw`       | `border-right-width:;`                |
| `bdrst`      | `border-right-style:;`                |
| `bdrst:n`    | `border-right-style:none;`            |
| `bdrc`       | `border-right-color:#000;`            |
| `bdrc:t`     | `border-right-color:transparent;`     |
| `bdb` / `bb` | `border-bottom:;`                     |
| `bdb+`       | `border-bottom:1px solid #000;`       |
| `bdb:n`      | `border-bottom:none;`                 |
| `bdbw`       | `border-bottom-width:;`               |
| `bdbs`       | `border-bottom-style:;`               |
| `bdbs:n`     | `border-bottom-style:none;`           |
| `bdbc`       | `border-bottom-color:#000;`           |
| `bdbc:t`     | `border-bottom-color:transparent;`    |
| `bdl` / `bl` | `border-left:;`                       |
| `bdl+`       | `border-left:1px solid #000;`         |
| `bdl:n`      | `border-left:none;`                   |
| `bdlw`       | `border-left-width:;`                 |
| `bdls`       | `border-left-style:;`                 |
| `bdls:n`     | `border-left-style:none;`             |
| `bdlc`       | `border-left-color:#000;`             |
| `bdlc:t`     | `border-left-color:transparent;`      |
| `bdrs`       | `border-radius:;`                     |
| `bdtrrs`     | `border-top-right-radius:;`           |
| `bdtlrs`     | `border-top-left-radius:;`            |
| `bdbrrs`     | `border-bottom-right-radius:;`        |
| `bdblrs`     | `border-bottom-left-radius:;`         |

### 8.12 列表（Lists）

| 缩写        | 结果                                    |
| ----------- | --------------------------------------- |
| `lis`       | `list-style:;`                          |
| `lis:n`     | `list-style:none;`                      |
| `lisp`      | `list-style-position:;`                 |
| `lisp:i`    | `list-style-position:inside;`           |
| `lisp:o`    | `list-style-position:outside;`          |
| `list`      | `list-style-type:;`                     |
| `list:n`    | `list-style-type:none;`                 |
| `list:d`    | `list-style-type:disc;`                 |
| `list:c`    | `list-style-type:circle;`               |
| `list:s`    | `list-style-type:square;`               |
| `list:dc`   | `list-style-type:decimal;`              |
| `list:dclz` | `list-style-type:decimal-leading-zero;` |
| `list:lr`   | `list-style-type:lower-roman;`          |
| `list:ur`   | `list-style-type:upper-roman;`          |
| `lisi`      | `list-style-image:;`                    |
| `lisi:n`    | `list-style-image:none;`                |

### 8.13 打印（Print）

| 缩写      | 结果                        |
| --------- | --------------------------- |
| `pgbb`    | `page-break-before:;`       |
| `pgbb:au` | `page-break-before:auto;`   |
| `pgbb:al` | `page-break-before:always;` |
| `pgbb:l`  | `page-break-before:left;`   |
| `pgbb:r`  | `page-break-before:right;`  |
| `pgbi`    | `page-break-inside:;`       |
| `pgbi:au` | `page-break-inside:auto;`   |
| `pgbi:av` | `page-break-inside:avoid;`  |
| `pgba`    | `page-break-after:;`        |
| `pgba:au` | `page-break-after:auto;`    |
| `pgba:al` | `page-break-after:always;`  |
| `pgba:l`  | `page-break-after:left;`    |
| `pgba:r`  | `page-break-after:right;`   |
| `orp`     | `orphans:;`                 |
| `wid`     | `widows:;`                  |

### 8.14 其它（动画 / Flex / 变换 / 前缀等）

| 缩写                      | 结果                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `!`                       | `!important`                                                                                  |
| `@f`                      | `@font-face { font-family:; src:url(\|); }`                                                   |
| `@f+`                     | 完整 `@font-face`（含 eot/woff/ttf/svg 多格式重写）                                           |
| `@i` / `@import`          | `@import url();`                                                                              |
| `@kf`                     | `@-webkit-keyframes` / `@-o-keyframes` / `@-moz-keyframes` / `@keyframes` 块                  |
| `@m` / `@media`           | `@media screen { }`                                                                           |
| `ac`                      | `align-content:;`                                                                             |
| `ac:c`                    | `align-content:center;`                                                                       |
| `ac:fe`                   | `align-content:flex-end;`                                                                     |
| `ac:fs`                   | `align-content:flex-start;`                                                                   |
| `ac:s`                    | `align-content:stretch;`                                                                      |
| `ac:sa`                   | `align-content:space-around;`                                                                 |
| `ac:sb`                   | `align-content:space-between;`                                                                |
| `ai`                      | `align-items:;`                                                                               |
| `ai:b`                    | `align-items:baseline;`                                                                       |
| `ai:c`                    | `align-items:center;`                                                                         |
| `ai:fe`                   | `align-items:flex-end;`                                                                       |
| `ai:fs`                   | `align-items:flex-start;`                                                                     |
| `ai:s`                    | `align-items:stretch;`                                                                        |
| `anim`                    | `animation:;`                                                                                 |
| `anim-`                   | `animation:name duration timing-function delay iteration-count direction fill-mode;`          |
| `animdel`                 | `animation-delay:time;`                                                                       |
| `animdir`                 | `animation-direction:normal;`                                                                 |
| `animdir:a`               | `animation-direction:alternate;`                                                              |
| `animdir:ar`              | `animation-direction:alternate-reverse;`                                                      |
| `animdir:n`               | `animation-direction:normal;`                                                                 |
| `animdir:r`               | `animation-direction:reverse;`                                                                |
| `animdur`                 | `animation-duration:0s;`                                                                      |
| `animfm`                  | `animation-fill-mode:both;`                                                                   |
| `animfm:b`                | `animation-fill-mode:backwards;`                                                              |
| `animfm:bt` / `animfm:bh` | `animation-fill-mode:both;`                                                                   |
| `animfm:f`                | `animation-fill-mode:forwards;`                                                               |
| `animic`                  | `animation-iteration-count:1;`                                                                |
| `animic:i`                | `animation-iteration-count:infinite;`                                                         |
| `animn`                   | `animation-name:none;`                                                                        |
| `animps`                  | `animation-play-state:running;`                                                               |
| `animps:p`                | `animation-play-state:paused;`                                                                |
| `animps:r`                | `animation-play-state:running;`                                                               |
| `animtf`                  | `animation-timing-function:linear;`                                                           |
| `animtf:cb`               | `animation-timing-function:cubic-bezier(0.1, 0.7, 1.0, 0.1);`                                 |
| `animtf:e`                | `animation-timing-function:ease;`                                                             |
| `animtf:ei`               | `animation-timing-function:ease-in;`                                                          |
| `animtf:eio`              | `animation-timing-function:ease-in-out;`                                                      |
| `animtf:eo`               | `animation-timing-function:ease-out;`                                                         |
| `animtf:l`                | `animation-timing-function:linear;`                                                           |
| `ap`                      | `appearance:${none};`                                                                         |
| `as`                      | `align-self:;`                                                                                |
| `as:a`                    | `align-self:auto;`                                                                            |
| `as:b`                    | `align-self:baseline;`                                                                        |
| `as:c`                    | `align-self:center;`                                                                          |
| `as:fe`                   | `align-self:flex-end;`                                                                        |
| `as:fs`                   | `align-self:flex-start;`                                                                      |
| `as:s`                    | `align-self:stretch;`                                                                         |
| `bfv`                     | `backface-visibility:;`                                                                       |
| `bfv:h`                   | `backface-visibility:hidden;`                                                                 |
| `bfv:v`                   | `backface-visibility:visible;`                                                                |
| `bg:ie`                   | `filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='x.png',sizingMethod='crop');` |
| `cm`                      | `/* ${child} */`                                                                              |
| `colm`                    | `columns:;`                                                                                   |
| `colmc`                   | `column-count:;`                                                                              |
| `colmf`                   | `column-fill:;`                                                                               |
| `colmg`                   | `column-gap:;`                                                                                |
| `colmr`                   | `column-rule:;`                                                                               |
| `colmrc`                  | `column-rule-color:;`                                                                         |
| `colmrs`                  | `column-rule-style:;`                                                                         |
| `colmrw`                  | `column-rule-width:;`                                                                         |
| `colms`                   | `column-span:;`                                                                               |
| `colmw`                   | `column-width:;`                                                                              |
| `d:ib+`                   | `display: inline-block; *display: inline; *zoom: 1;`                                          |
| `fx`                      | `flex:;`                                                                                      |
| `fxb`                     | `flex-basis:;`                                                                                |
| `fxd`                     | `flex-direction:;`                                                                            |
| `fxd:c`                   | `flex-direction:column;`                                                                      |
| `fxd:cr`                  | `flex-direction:column-reverse;`                                                              |
| `fxd:r`                   | `flex-direction:row;`                                                                         |
| `fxd:rr`                  | `flex-direction:row-reverse;`                                                                 |
| `fxf`                     | `flex-flow:;`                                                                                 |
| `fxg`                     | `flex-grow:;`                                                                                 |
| `fxsh`                    | `flex-shrink:;`                                                                               |
| `fxw`                     | `flex-wrap: ;`                                                                                |
| `fxw:n`                   | `flex-wrap:nowrap;`                                                                           |
| `fxw:w`                   | `flex-wrap:wrap;`                                                                             |
| `fxw:wr`                  | `flex-wrap:wrap-reverse;`                                                                     |
| `jc`                      | `justify-content:;`                                                                           |
| `jc:c`                    | `justify-content:center;`                                                                     |
| `jc:fe`                   | `justify-content:flex-end;`                                                                   |
| `jc:fs`                   | `justify-content:flex-start;`                                                                 |
| `jc:sa`                   | `justify-content:space-around;`                                                               |
| `jc:sb`                   | `justify-content:space-between;`                                                              |
| `mar`                     | `max-resolution:res;`                                                                         |
| `mir`                     | `min-resolution:res;`                                                                         |
| `op+`                     | `opacity: ; filter: alpha(opacity=);`                                                         |
| `op:ie`                   | `filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=100);`                                |
| `op:ms`                   | `-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=100)';`                          |
| `ord`                     | `order:;`                                                                                     |
| `ori`                     | `orientation:;`                                                                               |
| `ori:l`                   | `orientation:landscape;`                                                                      |
| `ori:p`                   | `orientation:portrait;`                                                                       |
| `tov`                     | `text-overflow:${ellipsis};`                                                                  |
| `tov:c`                   | `text-overflow:clip;`                                                                         |
| `tov:e`                   | `text-overflow:ellipsis;`                                                                     |
| `trf`                     | `transform:;`                                                                                 |
| `trf:r`                   | `transform: rotate(angle);`                                                                   |
| `trf:rx`                  | `transform: rotateX(angle);`                                                                  |
| `trf:ry`                  | `transform: rotateY(angle);`                                                                  |
| `trf:rz`                  | `transform: rotateZ(angle);`                                                                  |
| `trf:sc`                  | `transform: scale(x, y);`                                                                     |
| `trf:sc3`                 | `transform: scale3d(x, y, z);`                                                                |
| `trf:scx`                 | `transform: scaleX(x);`                                                                       |
| `trf:scy`                 | `transform: scaleY(y);`                                                                       |
| `trf:scz`                 | `transform: scaleZ(z);`                                                                       |
| `trf:skx`                 | `transform: skewX(angle);`                                                                    |
| `trf:sky`                 | `transform: skewY(angle);`                                                                    |
| `trf:t`                   | `transform: translate(x, y);`                                                                 |
| `trf:t3`                  | `transform: translate3d(tx, ty, tz);`                                                         |
| `trf:tx`                  | `transform: translateX(x);`                                                                   |
| `trf:ty`                  | `transform: translateY(y);`                                                                   |
| `trf:tz`                  | `transform: translateZ(z);`                                                                   |
| `trfo`                    | `transform-origin:;`                                                                          |
| `trfs`                    | `transform-style:preserve-3d;`                                                                |
| `trs`                     | `transition:prop time;`                                                                       |
| `trsde`                   | `transition-delay:time;`                                                                      |
| `trsdu`                   | `transition-duration:time;`                                                                   |
| `trsp`                    | `transition-property:prop;`                                                                   |
| `trstf`                   | `transition-timing-function:tfunc;`                                                           |
| `us`                      | `user-select:${none};`                                                                        |
| `wfsm`                    | `-webkit-font-smoothing:${antialiased};`                                                      |
| `wfsm:a`                  | `-webkit-font-smoothing:antialiased;`                                                         |
| `wfsm:n`                  | `-webkit-font-smoothing:none;`                                                                |
| `wfsm:s` / `wfsm:sa`      | `-webkit-font-smoothing:subpixel-antialiased;`                                                |
| `wm`                      | `writing-mode:lr-tb;`                                                                         |
| `wm:btl`                  | `writing-mode:bt-lr;`                                                                         |
| `wm:btr`                  | `writing-mode:bt-rl;`                                                                         |
| `wm:lrb`                  | `writing-mode:lr-bt;`                                                                         |
| `wm:lrt`                  | `writing-mode:lr-tb;`                                                                         |
| `wm:rlb`                  | `writing-mode:rl-bt;`                                                                         |
| `wm:rlt`                  | `writing-mode:rl-tb;`                                                                         |
| `wm:tbl`                  | `writing-mode:tb-lr;`                                                                         |
| `wm:tbr`                  | `writing-mode:tb-rl;`                                                                         |

---

## 九、完整命令集（四）：XSL 缩写全集

| 缩写              | 生成                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| `tmatch` / `tm`   | `<xsl:template match="" mode=""></xsl:template>`                                 |
| `tname` / `tn`    | `<xsl:template name=""></xsl:template>`                                          |
| `call`            | `<xsl:call-template name="" />`                                                  |
| `ap`              | `<xsl:apply-templates select="" mode="" />`                                      |
| `api`             | `<xsl:apply-imports />`                                                          |
| `imp`             | `<xsl:import href="" />`                                                         |
| `inc`             | `<xsl:include href="" />`                                                        |
| `ch`              | `<xsl:choose></xsl:choose>`                                                      |
| `xsl:when` / `wh` | `<xsl:when test=""></xsl:when>`                                                  |
| `ot`              | `<xsl:otherwise></xsl:otherwise>`                                                |
| `if`              | `<xsl:if test=""></xsl:if>`                                                      |
| `par`             | `<xsl:param name=""></xsl:param>`                                                |
| `pare`            | `<xsl:param name="" select="" />`                                                |
| `var`             | `<xsl:variable name=""></xsl:variable>`                                          |
| `vare`            | `<xsl:variable name="" select="" />`                                             |
| `wp`              | `<xsl:with-param name="" select="" />`                                           |
| `key`             | `<xsl:key name="" match="" use="" />`                                            |
| `elem`            | `<xsl:element name=""></xsl:element>`                                            |
| `attr`            | `<xsl:attribute name=""></xsl:attribute>`                                        |
| `attrs`           | `<xsl:attribute-set name=""></xsl:attribute-set>`                                |
| `cp`              | `<xsl:copy select="" />`                                                         |
| `co`              | `<xsl:copy-of select="" />`                                                      |
| `val`             | `<xsl:value-of select="" />`                                                     |
| `each` / `for`    | `<xsl:for-each select=""></xsl:for-each>`                                        |
| `tex`             | `<xsl:text></xsl:text>`                                                          |
| `com`             | `<xsl:comment></xsl:comment>`                                                    |
| `msg`             | `<xsl:message terminate="no"></xsl:message>`                                     |
| `fall`            | `<xsl:fallback></xsl:fallback>`                                                  |
| `num`             | `<xsl:number value="" />`                                                        |
| `nam`             | `<namespace-alias stylesheet-prefix="" result-prefix="" />`                      |
| `pres`            | `<xsl:preserve-space elements="" />`                                             |
| `strip`           | `<xsl:strip-space elements="" />`                                                |
| `proc`            | `<xsl:processing-instruction name=""></xsl:processing-instruction>`              |
| `sort`            | `<xsl:sort select="" order="" />`                                                |
| `choose+`         | `xsl:choose>xsl:when+xsl:otherwise` 的别名                                       |
| `xsl`             | `!!!+xsl:stylesheet[version=1.0 xmlns:xsl=http://www.w3.org/1999/XSL/Transform]` |
| `!!!`（XSL 中）   | `<?xml version="1.0" encoding="UTF-8"?>`                                         |

---

## 十、附录：常用操作与快捷键

### 10.1 常用操作

| 操作                            | 说明                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| **展开缩写**                    | 输入缩写后按 **Tab**（Dreamweaver / VS Code）或 **Ctrl + E**（EditPlus 等）        |
| **用缩写包裹**                  | 选中内容，用缩写生成结构并包裹所选内容（VS Code：`Emmet: Wrap with Abbreviation`） |
| **移除标签**                    | 删除光标所在标签，保留其内部内容                                                   |
| **跳转匹配标签 / 选中配对标签** | 在成对标签之间跳转或选中                                                           |
| **更新图片尺寸**                | 自动读取图片真实宽高并回填 `width` / `height`                                      |
| **合并 / 删除行**               | 合并 CSS 规则行                                                                    |
| **编码 / 解码图片为 dataURL**   | 图片与 `data:` URL 互转                                                            |
| **数学表达式求值**              | 选中 `4*8+4` 求值得到 `36`                                                         |
| **递增 / 递减数值**             | 对光标处数字 ±1 / ±0.1 / ±10                                                       |
| **生成随机文本**                | `lorem` / `lipsum` 生成占位文本，如 `lorem10`、`p*4>lorem`                         |

### 10.2 记忆口诀

| 口诀                                          | 含义                                             |
| --------------------------------------------- | ------------------------------------------------ |
| **`>` 进、`+` 平、`^` 退**                    | `>` 进子级，`+` 同级，`^` 退一级                 |
| **`*` 复制、`()` 打包、`$` 编号**             | `*` 重复 N 次，`()` 分组，`$` 自增编号           |
| **`#` 是 id、`.` 是类、`[]` 属性、`{}` 文本** | 属性与内容的写法                                 |
| **`+` 后缀自动补子元素**                      | `ul+` → `ul>li`、`table+` → `table>tr>td`        |
| **CSS 记不住就打模糊前缀**                    | `ovh` == `ov-h` == `ov:h`，加 `-` 前缀补厂商前缀 |

### 10.3 综合案例

```text
div.wrapper>header.top+main.content>section.card*3>h2{标题 $}+p>lorem10+footer.bottom
```

展开后得到：

```html
<div class="wrapper">
  <header class="top"></header>
  <main class="content">
    <section class="card">
      <h2>标题 1</h2>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. …</p>
    </section>
    <section class="card">
      <h2>标题 2</h2>
      <p>…</p>
    </section>
    <section class="card">
      <h2>标题 3</h2>
      <p>…</p>
    </section>
  </main>
  <footer class="bottom"></footer>
</div>
```

```text
table.data>thead>tr>th*4^^tbody>tr*3>td.item$*4
```

```html
<table class="data">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="item1"></td>
      <td class="item2"></td>
      <td class="item3"></td>
      <td class="item4"></td>
    </tr>
    <tr>
      …
    </tr>
    <tr>
      …
    </tr>
  </tbody>
</table>
```

---

> 参考来源：
>
> - <https://code.z01.com/emmet/>（Emmet 快速语法）
> - <https://code.z01.com/emmet/all.html>（Emmet 完整命令集）
> - <https://emmet.io/>
> - <http://docs.emmet.io/cheat-sheet/>
