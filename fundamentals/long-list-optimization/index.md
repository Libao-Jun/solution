# 超长列表优化处理（Long List Optimization）

> 参考资料：
>
> - [TED 知识体系 — 前端解决方案：超长列表优化处理](https://books.tedshen.cn/docs/解决方案/前端解决方案/超长列表优化处理)
> - [牛客网 — 长列表性能优化方案：无限滚动 虚拟滚动](https://www.nowcoder.com/discuss/793106812177252352)
> - [raybyte — 超长列表渲染 / 虚拟滚动优化](https://raybyte.cn/post/2026/2/21/040a57f9)
> - [腾讯云开发者 — 十万条数据，后端不分页咋办（如何优化长列表渲染）](https://cloud.tencent.com/developer/article/2064523)
>
> 面向角色：初中高级前端工程师，重点面向「需要独立设计长列表方案」的中高级 / 资深前端。本文按「问题 → 方案全景 → 分页与无限滚动 → 虚拟列表（定高 / 不定高）→ 虚拟表格与特殊形态 → 懒加载 → 工程化落地 → 度量监控 → 端到端流程 → 坑点与 Checklist」展开，覆盖超长列表优化处理的关键知识点、重点、注意事项与完整落地流程。浏览器渲染机制（重排 / 重绘 / 合成）、事件循环见 [浏览器核心知识手册](/fundamentals/browser/)，性能度量体系见 [前端性能优化知识手册](/fundamentals/front-end-performance/)——本文聚焦「超长列表这一具体场景怎么选、怎么写、怎么避坑」。

---

## 目录

1. [问题背景：为什么超长列表会卡](#一、问题背景-为什么超长列表会卡)
2. [方案全景：五大优化策略对比](#二、方案全景-五大优化策略对比)
3. [分页与无限滚动：分段加载的两种形态](#三、分页与无限滚动-分段加载的两种形态)
4. [虚拟列表核心原理：固定高度实现](#四、虚拟列表核心原理-固定高度实现)
5. [不定高虚拟列表：动态高度的工程化处理](#五、不定高虚拟列表-动态高度的工程化处理)
6. [虚拟表格与横向、瀑布流虚拟列表](#六、虚拟表格与横向、瀑布流虚拟列表)
7. [懒加载与图片资源优化](#七、懒加载与图片资源优化)
8. [工程化落地：主流库与框架集成](#八、工程化落地-主流库与框架集成)
9. [性能度量与监控](#九、性能度量与监控)
10. [完整落地流程：从评估到验证](#十、完整落地流程-从评估到验证)
11. [常见坑点与反模式](#十一、常见坑点与反模式)
12. [超长列表优化 Checklist 速查](#十二、超长列表优化-checklist-速查)

---

## 一、问题背景：为什么超长列表会卡

### 1.1 直接渲染的代价

当一个列表有上千、上万甚至十万条数据时，如果「一次性把所有数据都渲染成 DOM 节点」，页面会同时挂载海量节点。每个 DOM 节点都要占用：

- **内存**：节点对象、样式表规则匹配、事件监听等；
- **布局（Layout / 重排）**：节点尺寸 / 位置变化会触发整段布局计算；
- **样式（Style）**：选择器匹配与样式计算；
- **绘制（Paint）与合成（Composite）**：像素填充与图层合成。

数据量达到「千级别及以上」时，直接遍历渲染会出现明显的卡顿，低端设备甚至可能直接不可用。一个常见结论是：渲染近万条数据可能产生 **十万个以上 DOM 节点**，而同样的数据用虚拟列表渲染，实际常驻 DOM 始终只有 **几百个**。

### 1.2 性能瓶颈拆解

超长列表的性能问题可以按「影响程度」拆成几类，每一类对应不同的优化手段：

| 瓶颈 | 表现 | 影响程度 | 对应手段 |
| --- | --- | --- | --- |
| DOM 节点过多 | 内存占用飙升、删除 / 更新慢 | 高 | 虚拟化渲染、分页加载 |
| 渲染阻塞 | 一次性渲染卡死主线程 | 高 | 分批渲染、异步处理、时间分片 |
| 滚动性能 | 频繁重排重绘、掉帧 | 中 | 滚动优化、事件节流、DOM 回收 |
| 内存泄漏 | 事件监听 / 定时器未清理 | 中 | 事件委托、及时清理、对象池 |
| 网络请求 | 一次性拉取大量数据 | 中 | 分页加载、懒加载、分段拉取 |

本质思路只有一句话：**减少同时存在于 DOM 树中的节点数量，或者把数据分批 / 分片加载，降低主线程压力。**

### 1.3 什么时候才需要优化

虚拟列表不是银弹，它带来了实现复杂度。是否引入，取决于数据量：

- **几百条以内**：虚拟列表与真实 DOM 渲染性能几乎无差别，直接渲染即可，不要过度设计。
- **几千到几万条**：虚拟列表优势开始显现，尤其是后端无法 / 不愿分页时。
- **十万级及以上**：必须虚拟化，否则页面基本不可用。
- **关键判断**：是否「后端能分页」。如果后端能分页，优先分页 / 无限滚动；如果后端一次性返回全量（历史数据、日志、本地数据集等），再上虚拟列表。

---

## 二、方案全景：五大优化策略对比

### 2.1 策略总览

主流优化策略可以归为五类，核心区别在于「是否减少 DOM 数量」「是否减少数据量」「体验如何」：

| 优化策略 | 原理 | 优势 | 劣势 | 适用场景 |
| --- | --- | --- | --- | --- |
| 虚拟化渲染（虚拟列表） | 只渲染可见区域 + 少量缓冲 | 性能最优，内存占用少 | 实现复杂，滚动体验需打磨 | 大数据量、性能要求高、后端不分页 |
| 分页加载 | 按页分批加载并替换当前页 | 实现简单、内存可控 | 需要分页器、体验一般 | 数据量中等、后台管理类简单页 |
| 懒加载 | 按需加载（图片 / 内容进入视口才加载） | 减少首屏请求与初始负载 | 滚动时可能短暂卡顿 | 图片墙、长图文页 |
| 无限滚动 | 滚动到底部追加更多数据 | 沉浸感好、无需分页器 | 内存持续增长、需回收 | 社交 Feed、内容流、C 端信息流 |
| 窗口化渲染 | 固定窗口大小渲染 | 性能稳定、内存可控 | 滚动体验一般 | 固定高度列表 |

> 注意区分两组易混概念：**分页是「替换本页数据」，无限滚动是「追加到列表尾部」**；二者数据模型写法不同，DOM 操作也不同，写错会导致重复渲染或数据错乱。

### 2.2 适用场景选型

- **追求极致性能 & 大数据量** → 虚拟化渲染（定高用固定高度方案，内容参差用动态高度方案）。
- **数据量中等、后台类简单页面** → 分页加载或窗口化渲染。
- **图片墙、长图文页** → 配合懒加载减少首屏请求。
- **C 端信息流、社交 Feed** → 无限滚动提升沉浸感，但必须做内存回收。
- **终极形态** → **无限滚动 + 虚拟列表**：分段拉取数据 + 只渲染可视区，兼顾「数据量无限」与「DOM 数量恒定」。

### 2.3 组合策略

真实业务往往是组合拳：

<LongListCombinationFlow />

---

## 三、分页与无限滚动：分段加载的两种形态

分段加载的本质是「第一次只请求部分数据，在某个时机再请求后续数据」。它包含两种形态：分页加载与无限滚动。

### 3.1 分页加载

最经典的分段方式。后端返回 `pageNum / pageSize / total`，前端维护页码，切换页时「替换」当前页内容。

```ts
// 分页数据模型（替换式）
interface PagedResult<T> {
  list: T[]
  pageNum: number
  pageSize: number
  total: number
}

async function loadPage(pageNum: number) {
  const res = await fetch(`/api/list?page=${pageNum}&size=20`)
  const data: PagedResult<Item> = await res.json()
  // 注意：是「替换」，不是「追加」
  setList(data.list)
  setTotal(data.total)
}
```

适合有分页器、用户需要「跳页 / 精确翻页」的后台场景；劣势是打断浏览体验。

### 3.2 无限滚动

监听滚动到底部 / 即将到底部，把新数据「追加」到列表尾部。适合消息中心、商品列表、移动端信息流。

```ts
// 无限滚动数据模型（追加式）
interface InfiniteState<T> {
  list: T[]
  page: number
  isLoading: boolean // 防重复请求
  hasMore: boolean   // 防止无数据还请求
}

function onReachBottom() {
  const s = state()
  if (s.isLoading || !s.hasMore) return // 两个状态缺一不可
  setState({ ...s, isLoading: true })
  fetchNext(s.page + 1).then((res) => {
    setState({
      list: [...s.list, ...res.list], // 追加
      page: s.page + 1,
      isLoading: false,
      hasMore: res.list.length > 0,
    })
  })
}
```

### 3.3 触发时机：scroll 监听 vs IntersectionObserver

无限滚动「何时触发加载」有两种实现：

**方式一：节流监听 `scroll`**（兼容性好，但主线程开销略高）

```ts
const THRESHOLD = 100 // 距底 100px 预加载
function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - THRESHOLD) {
    onReachBottom()
  }
}
// 务必用节流包裹，避免每次滚动都触发判断
container.addEventListener('scroll', throttle(onScroll, 200))
```

**方式二：IntersectionObserver 监听底部哨兵元素**（异步、不阻塞主线程，现代浏览器推荐）

```ts
const sentinel = document.querySelector('#bottom-sentinel')!
const io = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) onReachBottom()
  },
  { root: container, rootMargin: '200px' }, // 提前 200px 触发
)
io.observe(sentinel)
```

### 3.4 状态控制与坑点

- **必须维护 `isLoading` 和 `hasMore`**：遗漏任一个都会导致重复请求（重复渲染）或空请求（无数据仍打接口）。
- **追加 vs 替换不能混**：分页替换、无限滚动追加，数据模型与 DOM 操作必须一致。
- **内存回收**：无限滚动一直追加会让内存无限增长。优化做法是「只保留当前需要的数据 + 少量最近历史」，向上滑时重新请求历史；这也正是「无限滚动 + 虚拟列表」要解决的。

---

## 四、虚拟列表核心原理：固定高度实现

虚拟列表（Virtual List / Windowing）是超长列表优化的核心手段。核心思想：**不把全部数据对应的 DOM 节点挂到页面，只渲染当前视口（可见区域）及少量缓冲区的列表项**，滚动时动态计算并替换可见项，删除离开视窗的项，使实际 DOM 数量恒定在几百个。

### 4.1 三层 DOM 结构

无论定高还是不定高，虚拟列表都依赖「三层结构」：

```html
<!-- 外层：固定可视宽高，overflow:auto，position:relative -->
<div class="viewport" style="height: 400px; overflow: auto; position: relative;">
  <!-- 占位层：撑起真实滚动条高度（总高度 = 总条数 × 单项高度） -->
  <div class="phantom" style="height: 100000px;"></div>
  <!-- 真实渲染层：position:absolute，靠 transform 偏移「浮」在可视区 -->
  <div class="real-list" style="position: absolute; top: 0; transform: translateY(0);">
    <!-- 只渲染可视项 -->
  </div>
</div>
```

- **外层容器（viewport）**：固定可视宽高，`overflow: auto`，提供滚动。
- **占位容器（phantom）**：高度 = 总数据量 × 单项高度，用于撑出**真实的滚动条**。
- **可视项容器（real-list）**：绝对定位，通过 `transform: translateY(offset)` 偏移，只渲染 `[startIndex, endIndex]` 这一小段数据。

### 4.2 关键参数计算

假设每项高度固定为 `itemHeight`，滚动距离为 `scrollTop`，视窗高度为 `wrapperHeight`：

```ts
const itemHeight = 50
const wrapperHeight = 400

// 占位总高度
const totalHeight = list.length * itemHeight
// 可视区域能放下多少项
const visibleCount = Math.ceil(wrapperHeight / itemHeight)
// 起始索引
const startIndex = Math.floor(scrollTop / itemHeight)
// 结束索引（多渲染 1~2 个防白屏）
const endIndex = startIndex + visibleCount + 1
// 真实列表的偏移量
const offset = startIndex * itemHeight

const visibleData = list.slice(startIndex, endIndex)
```

### 4.3 滚动更新与缓冲区

- 监听 `scroll` 事件，用 `requestAnimationFrame` 合并高频更新；
- **缓冲区（overscan / bufferSize）**：在可视区上下各多渲染若干条，避免快速滚动时出现白屏（快滑时渲染进程来不及更新视图，会只剩背景）；
- 用 `transform: translate3d(0, offset, 0)` 做位移，避免触发重排（只走合成层）。

### 4.4 最小实现示例

```ts
class FixedHeightVirtualList {
  private container: HTMLElement
  private phantom: HTMLElement
  private realList: HTMLElement
  private itemHeight: number
  private bufferSize: number
  private data: any[]

  constructor(container: HTMLElement, data: any[], itemHeight = 50, bufferSize = 5) {
    this.container = container
    this.data = data
    this.itemHeight = itemHeight
    this.bufferSize = bufferSize

    this.phantom = document.createElement('div')
    this.realList = document.createElement('div')
    this.realList.style.position = 'absolute'
    this.realList.style.top = '0'
    this.realList.style.left = '0'
    this.realList.style.right = '0'

    container.style.position = 'relative'
    container.style.overflow = 'auto'
    container.appendChild(this.phantom)
    container.appendChild(this.realList)

    this.phantom.style.height = `${data.length * itemHeight}px`
    this.container.addEventListener('scroll', this.onScroll)
    this.render()
  }

  private onScroll = () => {
    requestAnimationFrame(() => this.render())
  }

  private render() {
    const scrollTop = this.container.scrollTop
    const wrapH = this.container.clientHeight
    const visibleCount = Math.ceil(wrapH / this.itemHeight)
    let start = Math.floor(scrollTop / this.itemHeight) - this.bufferSize
    let end = Math.floor(scrollTop / this.itemHeight) + visibleCount + this.bufferSize
    start = Math.max(0, start)
    end = Math.min(this.data.length, end)

    const offset = start * this.itemHeight
    this.realList.style.transform = `translate3d(0, ${offset}px, 0)`
    this.realList.innerHTML = this.data
      .slice(start, end)
      .map((item, i) => `<div style="height:${this.itemHeight}px">${item.text}</div>`)
      .join('')
  }
}
```

---

## 五、不定高虚拟列表：动态高度的工程化处理

### 5.1 难点

定高方案依赖 `scrollTop / itemHeight` 直接算出索引，落到了「所有项一样高」的假设上。但真实业务里列表项高度往往不固定（文本折行、图片、富内容）。不定高带来两个核心难题：

1. **无法用单一除法定位索引**：总高度不再等于 `count × itemHeight`，必须知道「每一项的实际高度」才能算出某条数据在列表中的纵向位置。
2. **滚动条比例会错**：如果高度估算不准又不修正，滚动条长度和实际内容不匹配，会出现跳动。

### 5.2 预估高度 + 前缀和数组

工程化做法是「先估算、后修正」：

- 初始化时用 `estimatedItemHeight` 填充高度数组 `itemHeights`;
- 通过 `calculatePositions()` 累加各项高度，生成「前缀和位置数组」`itemPositions`（第 i 项顶部的偏移量）;
- 占位层总高度 = 已测得高度之和 + 未测项的预估高度之和。

```ts
class DynamicHeightVirtualList {
  private estimated = 60
  private itemHeights: number[] = []
  private itemPositions: number[] = []
  private measured = new Set<number>()

  constructor(private data: any[]) {
    this.itemHeights = data.map(() => this.estimated)
    this.recalcPositions()
  }

  // 前缀和：itemPositions[i] = 前 i 项的高度累计
  private recalcPositions() {
    this.itemPositions = []
    let acc = 0
    for (let i = 0; i < this.itemHeights.length; i++) {
      this.itemPositions.push(acc)
      acc += this.itemHeights[i]
    }
    this.totalHeight = acc
  }
}
```

### 5.3 二分查找定位

滚动时不能直接除法，而是用**二分查找**在 `itemPositions` 中找到「滚动位置对应的起始索引」：

```ts
private findStartIndex(scrollTop: number): number {
  let lo = 0
  let hi = this.itemPositions.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (this.itemPositions[mid] < scrollTop) lo = mid + 1
    else hi = mid
  }
  // lo 是第一个 top >= scrollTop 的项，起点退一格
  return Math.max(0, lo - 1)
}
```

### 5.4 动态测量与位置修正

渲染某一项后，用 `offsetHeight` 测量它的真实高度：如果与记录不符，更新高度数组并**重新计算所有位置**（重排位置映射），保证滚动条比例正确。

```ts
private measureAndFix(index: number, el: HTMLElement) {
  if (this.measured.has(index)) return
  const real = el.offsetHeight
  if (real > 0 && real !== this.itemHeights[index]) {
    this.itemHeights[index] = real
    this.recalcPositions() // 全量重算位置（数据量极大时可用增量更新优化）
  }
  this.measured.add(index)
}
```

### 5.5 滚动锚定（Scroll Anchoring）

动态测量会改变上方已渲染项的高度，从而导致滚动位置「跳动」。解决思路：

- **锚定可见项**：在测量并修正高度前，记录当前可视区某条数据的 `index` 与其距视口顶部的偏移；修正后，根据该项的新的 `itemPositions` 重新设置 `scrollTop`，使视口内容不跳；
- 或用 `ResizeObserver` 监听项尺寸变化，统一在回调里做「修正高度 + 重设 scrollTop」；
- 理想路径下，配合 `requestIdleCallback` 在空闲时预测量即将进入视口的项，减少滚动时的突兀修正。

---

## 六、虚拟表格与横向、瀑布流虚拟列表

### 6.1 虚拟表格

表格比列表多一个维度：既要虚拟化行，也要虚拟化列（列很多时）。要点：

- **行虚拟化**：与列表一致，按行高 / 预估行高定位可视行；
- **列虚拟化**：表头与表体横向也只渲染可视列，水平滚动时用同样的 `translateX` 偏移；
- **固定列 / 固定表头**：左固定列、表头吸顶需要在滚动时独立定位，不能一起被位移；
- 主流表格组件（如 Element Plus `el-table-v2`、Ant Design `VirtualTable`）已内置，优先用库而非手写。

### 6.2 横向虚拟列表

把「纵向虚拟化」旋转 90 度：监听 `scrollLeft`，按 `clientWidth / itemWidth` 计算可视列，偏移走 `translateX`。常见于甘特图、时间轴、看板泳道。

### 6.3 瀑布流虚拟列表

瀑布流（宽度固定、高度不一、错落布局）不能用「索引范围截取」，因为同一行的多个卡片高度不同、纵向位置交错。必须：

- 为每张卡片缓存坐标 `itemMeta { top, bottom, left, width, height }`;
- 用**二分查找比对坐标**定位可视项：`item.bottom >= visibleTop && item.top <= visibleBottom`;
- 绝对定位 + 坐标缓存，配合不定高思路做高度修正。

---

## 七、懒加载与图片资源优化

### 7.1 IntersectionObserver 懒加载

懒加载解决的是「资源（图片 / 内容）进入视口才加载」，减少首屏请求。虚拟列表解决的是「DOM 数量」，二者正交，可以叠加。

```ts
// 图片懒加载：data-src 存真实地址，进入视口才赋值 src
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const img = e.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
        }
        io.unobserve(img)
      }
    }
  },
  { rootMargin: '100px' },
)
document.querySelectorAll('img[data-src]').forEach((el) => io.observe(el))
```

### 7.2 图片优化

即便虚拟列表只渲染少量项，单屏内的图片仍可能成为瓶颈：

- 使用现代格式（WebP / AVIF）并做尺寸自适应（`srcset` / `sizes`）；
- 首屏关键图用 `loading="eager"` + 预连接（`preconnect`），其余 `loading="lazy"`;
- 列表项内图片固定宽高比（CSS `aspect-ratio`），避免加载后布局抖动（CLS）。

---

## 八、工程化落地：主流库与框架集成

### 8.1 主流库

| 库 | 生态 | 特点 |
| --- | --- | --- |
| `@tanstack/virtual` | React / Vue / Solid 通用 | 无样式、headless，定高 / 不定高 / 横向都支持，推荐新项目 |
| `react-window` | React | 轻量，定高 / 变高场景 API 简单 |
| `react-virtualized` | React | 老牌全功能（表格 / 集合 / 网格），体积较大 |
| `vue-virtual-scroller` | Vue 2 / 3 | Vue 生态经典，开箱即用 |
| `el-table-v2` / `Ant VirtualTable` | Vue / React | 组件库内置虚拟表格，优先复用 |

选型原则：**优先用成熟库**，掌握原理是为了「库不满足需求时能自行扩展」——真实页面常含头部 / 底部 / 吸顶 / 分组等，库的开箱组件可能不够，需要基于原理自定义偏移计算。

### 8.2 React 示例（@tanstack/react-virtual 不定高）

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: string[] }) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,          // 预估高度
    overscan: 8,                     // 缓冲区
    measureElement: (el) => el.getBoundingClientRect().height, // 动态测量
  })

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((vi) => (
          <div
            key={vi.key}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${vi.start}px)`,
            }}
          >
            {items[vi.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 8.3 Vue 示例（三层结构 + 定高）

```vue
<template>
  <div ref="viewport" class="viewport" @scroll="onScroll">
    <div class="phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="real-list" :style="{ transform: `translate3d(0, ${offset}px, 0)` }">
      <div
        v-for="item in visibleData"
        :key="item.id"
        class="row"
        :style="{ height: itemHeight + 'px' }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps<{ data: any[]; itemHeight?: number }>()
const itemHeight = props.itemHeight ?? 50

const viewport = ref<HTMLElement>()
const scrollTop = ref(0)

const totalHeight = computed(() => props.data.length * itemHeight)
const visibleCount = computed(() =>
  Math.ceil((viewport.value?.clientHeight ?? 400) / itemHeight),
)
const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight))
const endIndex = computed(() => startIndex.value + visibleCount.value + 1)
const offset = computed(() => startIndex.value * itemHeight)
const visibleData = computed(() => props.data.slice(startIndex.value, endIndex.value))

function onScroll() {
  scrollTop.value = viewport.value?.scrollTop ?? 0
}
</script>
```

---

## 九、性能度量与监控

没有度量就没有优化。超长列表场景应关注以下指标与手段：

### 9.1 度量指标

| 指标 | 含义 | 目标 |
| --- | --- | --- |
| DOM 节点数 | 常驻节点数量 | 恒定在几百，不随数据量线性增长 |
| FPS / 掉帧 | 滚动时帧率 | 稳定 60 FPS，INP 低 |
| JS 堆内存 | `performance.memory.usedJSHeapSize` | 不随滚动持续上涨（无泄漏） |
| 滚动耗时 | 单次 scroll 处理 + 渲染耗时 | 控制在 16ms 内 |
| CLS | 布局抖动 | 图片 / 内容加载不引起跳变 |

### 9.2 监控手段

- **Performance 面板**：录制滚动过程，看长任务（Long Task）是否集中在 scroll 处理;
- **FPS  meter**：`requestAnimationFrame` 统计帧间隔，低于阈值告警;
- **内存快照**：滚动前后对比堆内存，确认有回收（无限滚动必须做内存回收）;
- **`PerformanceObserver`**：监听 `longtask` / `paint` / `layout-shift`，做线上度量;
- 监控到超内存阈值时，触发清理（释放非可视区数据缓存、对象池复用 DOM）。

---

## 十、完整落地流程：从评估到验证

把上面的知识点串成一条「端到端流程」，作为中高级前端独立交付长列表需求的 SOP：

### 10.1 需求评估

1. 数据量大概多少？万级 / 十万级？
2. 后端能否分页？能否分段拉取？
3. 列表项是否定高？是否表格 / 横向 / 瀑布流？
4. 目标设备（低端机占比）与体验要求（沉浸式还是后台精准）？

### 10.2 选型决策树

```text
能否分页？
├─ 能分页 + 后台简单页  →  分页加载
└─ 不能 / 不想分页
   ├─ 数据量 < 几千  →  直接渲染 + 图片懒加载
   └─ 数据量 >= 几千
      ├─ 项高固定  →  固定高度虚拟列表
      ├─ 项高不定  →  不定高虚拟列表（预估 + 前缀和 + 二分 + 修正 + 锚定）
      ├─ 表格  →  虚拟表格（行 + 列虚拟化）
      ├─ 横向  →  横向虚拟列表
      ├─ 瀑布流  →  坐标缓存 + 二分定位
      └─ 数据无限增长  →  无限滚动 + 虚拟列表 + 内存回收
```

### 10.3 实现清单

- [ ] 确定三层 DOM 结构（viewport / phantom / real-list）;
- [ ] 实现索引计算（定高除法 / 不定高前缀和 + 二分）;
- [ ] 实现偏移（translate3d，避免重排）与缓冲区（overscan）;
- [ ] 滚动用 `requestAnimationFrame` 合并更新;
- [ ] 不定高场景加入预估、测量、位置修正、滚动锚定;
- [ ] 图片 / 资源叠加懒加载（`IntersectionObserver`）;
- [ ] 无限滚动维护 `isLoading` / `hasMore`，并做内存回收;
- [ ] 事件监听在销毁时清理（防内存泄漏）。

### 10.4 验证与回归

- 构造大数据 mock（如 10 万条），验证 DOM 节点数恒定;
- 快速滚动验证无白屏、无跳动（缓冲区 + 锚定生效）;
- 低端机 / 节流 CPU 验证 FPS 与 INP;
- 滚动前后内存快照对比，确认无泄漏;
- 与既有页面交互（搜索、筛选、分组、吸顶）回归，确认不冲突。

---

## 十一、常见坑点与反模式

1. **无限滚动状态遗漏**：没有 `isLoading` / `hasMore`，导致重复请求与重复渲染、空请求。
2. **追加与替换混淆**：分页是替换、无限滚动是追加，数据模型与 DOM 操作必须一致。
3. **不定高不做高度缓存与前缀和**：会导致滚动跳动、偏移算错；未渲染项必须用预估高度，渲染后立刻修正。
4. **大数据存储爆炸**：无限滚动一直追加会让内存无限增长，应只保留当前 + 少量历史，上滑重拉。
5. **「分片渲染」的伪优化**：用 `DocumentFragment` / `setTimeout` 分片仍会创建一万个 DOM，内存依旧高；`Canvas` 无 DOM 交互能力；`Web Worker` 不能操作 DOM——**虚拟列表才是 DOM 数量固定、内存可控的真解**。
6. **缓冲区不足导致快滑白屏**：靠监听滚动「假装滚动」，渲染来不及更新时会只剩背景，必须多渲染缓冲项。
7. **用 `index` 截取瀑布流**：瀑布流必须用坐标二分查找，不能按索引范围截取。
8. **几百条数据硬上虚拟列表**：性能无差别却增加复杂度，属于过度设计。
9. **事件监听 / 定时器未清理**：离开页面不卸载会导致内存泄漏，应在 `onUnmounted` / `destroyed` 中清理 `IntersectionObserver`、滚动监听、`ResizeObserver`。
10. **滚动用同步重排**：直接读 `offsetHeight` / `scrollTop` 触发强制同步布局，应合并到 `rAF` 或用 `translate3d` 走合成层。

---

## 十二、超长列表优化 Checklist 速查

**选型**

- [ ] 先评估数据量与是否可分页，再决定方案
- [ ] 万级以下直接渲染 + 懒加载；万级以上虚拟化
- [ ] 不限增长数据用「无限滚动 + 虚拟列表 + 内存回收」

**虚拟列表（定高）**

- [ ] 三层结构：viewport / phantom（撑高度）/ real-list（绝对定位偏移）
- [ ] `startIndex = floor(scrollTop / itemHeight)`，`endIndex = startIndex + ceil(clientHeight/itemHeight)`
- [ ] 用 `translate3d` 偏移，避免重排
- [ ] 加 overscan 缓冲区防白屏
- [ ] scroll 更新合并进 `requestAnimationFrame`

**虚拟列表（不定高）**

- [ ] 预估高度初始化 + 前缀和位置数组
- [ ] 二分查找定位起止索引
- [ ] 渲染后测真实高度并修正位置（recalcPositions）
- [ ] 滚动锚定防止跳动（ResizeObserver / 锚定可视项重设 scrollTop）
- [ ] 空闲时用 `requestIdleCallback` 预测量

**无限滚动**

- [ ] 维护 `isLoading` + `hasMore`，防重复 / 空请求
- [ ] 用 `IntersectionObserver` 哨兵元素触发（优于节流 scroll）
- [ ] 追加式数据模型，内存做回收

**质量**

- [ ] 图片叠加懒加载（`data-src` + `IntersectionObserver` + `aspect-ratio`）
- [ ] 销毁时清理所有监听 / 观察器
- [ ] 度量 DOM 数 / FPS / 内存，确认无泄漏无白屏无跳动
- [ ] 优先用成熟库（`@tanstack/virtual` / `vue-virtual-scroller` / 组件库虚拟表格），掌握原理用于扩展
