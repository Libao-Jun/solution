# 前端数据大屏通用适配方案

> 文档说明：整理市面上主流大屏适配技术，包含原理、完整代码、优缺点、适用场景、踩坑问题、选型决策，以 1920×1080 设计稿为基准。

## 目录

- [1、大屏适配业务特点](#1大屏适配业务特点)
- [2、主流适配方案对比总表](#2主流适配方案对比总表)
- [3、方案一 transform-scale 整体等比缩放](#3方案一-transform-scale-整体等比缩放)
- [4、方案二 vw/vh + flex + clamp() 流式适配](#4方案二-vwvh--flex--clamp-流式适配)
- [5、方案三 rem 根字体适配](#5方案三-rem-根字体适配)
- [6、方案四 混合生产级方案（推荐企业项目）](#6方案四-混合生产级方案推荐企业项目)
- [7、辅助技术：媒体查询 & CSS 容器查询](#7辅助技术媒体查询--css-容器查询)
- [8、ECharts 图表适配重点](#8echarts-图表适配重点)
- [9、高频踩坑与解决方案](#9高频踩坑与解决方案)
- [10、选型决策树](#10选型决策树)
- [11、开发最佳实践](#11开发最佳实践)

---

## 1、大屏适配业务特点

数据大屏与普通后台页面的差异：

1. 以**展示**为主，交互少，一般禁止滚动条；
2. UI 输出固定尺寸设计稿，最常用 `1920×1080`（16:9）；
3. 需要兼容笔记本、2K、4K、LED 拼接屏、投影设备；
4. 大量 ECharts 图表、地图、指标卡片；
5. 长时间挂机运行，要关注内存泄漏问题。

> 三个核心概念
>
> - **CSS 像素**：前端写代码使用 px，逻辑像素；
> - **物理像素**：屏幕硬件发光点；
> - **DPR 设备像素比**：`DPR = 物理像素 / CSS 像素`，Windows/macOS 系统缩放会改变 DPR。

---

## 2、主流适配方案对比总表

| 方案                | 核心原理                                     | 优点                                 | 缺点                                          | 适合场景                           | 不适合场景                |
| ----------------- | ---------------------------------------- | ---------------------------------- | ------------------------------------------- | ------------------------------ | -------------------- |
| `transform-scale` | JS 计算缩放比例，外层容器整体缩放，内部全部写 px              | 开发简单，直接复制 UI 标注，1:1 还原设计稿；所有元素统一缩放 | 屏幕比例不一致产生黑边；非整数 scale 字体/Canvas 模糊；鼠标交互坐标偏移 | 固定 16:9 展厅大屏、快速交付 demo，几乎无复杂交互 | 超宽非标拼接屏、大量弹窗/点击交互场景  |
| `vw/vh` 视口单位      | CSS 相对视口百分比单位，1vw = 视口宽度 1%              | 原生流式铺满屏幕，无坐标偏移；无黑边                 | ECharts 配置只接受 px，需要 JS 转换函数；极端宽高比布局挤压       | 需要铺满全屏、多种屏幕比例、多分辨率兼容           | 简单快速 demo，不想写转换函数的项目 |
| `rem`             | JS 动态修改 html 根字体大小                       | 可以局部控制缩放                           | 需要 postcss 插件转换 px；配置繁琐；效果接近 scale          | 旧项目改造，已有 rem 技术栈               | 新项目大屏，性价比低，不优先选择     |
| **混合方案**          | vw/vh 布局 + clamp 字体限制 + JS 处理 ECharts 图表 | 兼顾铺满屏幕、极端尺寸兜底、图表正常渲染               | 代码量最大，需要封装工具函数                              | 正式企业级生产项目                      | 小型 demo 原型开发         |
| 媒体查询 Media Query  | 多断点写多套 CSS 样式                            | 针对特定尺寸精细调整                         | 大量冗余代码，断点之间跳跃不平滑                            | 局部微调补充，不作为主适配方案                | 完整大屏主适配              |

---

## 3、方案一 transform-scale 整体等比缩放

> 原理：容器固定设计稿尺寸 1920×1080；JS 获取窗口宽高，取宽高缩放比较小值 `Math.min(scaleX, scaleY)` 做等比缩放，再计算偏移实现居中，保证全部内容完整显示不裁剪。

### 3.1 原生 JS 基础版

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    .screen-wrap {
      position: absolute;
      width: 1920px;
      height: 1080px;
      transform-origin: left top;
    }
  </style>
</head>
<body>
<div class="screen-wrap" id="screen">
  
</div>
<script>
  const designW = 1920
  const designH = 1080
  const screenDom = document.getElementById('screen')

  function setScale() {
    const winW = window.innerWidth
    const winH = window.innerHeight
    const scaleX = winW / designW
    const scaleY = winH / designH
    const scale = Math.min(scaleX, scaleY)

    const offsetLeft = (winW - designW * scale) / 2
    const offsetTop = (winH - designH * scale) / 2

    screenDom.style.transform = `scale(${scale})`
    screenDom.style.left = `${offsetLeft}px`
    screenDom.style.top = `${offsetTop}px`
  }

  // 防抖处理 resize，避免频繁执行
  let timer = null
  window.addEventListener('resize', () => {
    clearTimeout(timer)
    timer = setTimeout(setScale, 120)
  })
  window.addEventListener('load', setScale)
</script>
</body>
</html>
```

### 3.2 Vue3 + TS 封装 Hook：useScreenScale.ts

```typescript
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

interface Options {
  width?: number
  height?: number
  minScale?: number
  maxScale?: number
}

export function useScreenScale(options: Options = {}) {
  const designWidth = options.width ?? 1920
  const designHeight = options.height ?? 1080
  const minScale = options.minScale ?? 0.3
  const maxScale = options.maxScale ?? 3

  const scale = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)
  let rafId = 0

  const calc = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    let sX = w / designWidth
    let sY = h / designHeight
    let s = Math.min(sX, sY)
    s = Math.max(minScale, Math.min(s, maxScale))

    offsetX.value = (w - designWidth * s) / 2
    offsetY.value = (h - designHeight * s) / 2
    scale.value = s
  }

  const resizeHandle = () => {
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(calc)
  }

  const containerStyle = computed(() => ({
    width: `${designWidth}px`,
    height: `${designHeight}px`,
    transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
    transformOrigin: 'left top',
    position: 'absolute' as const,
  }))

  onMounted(async () => {
    await nextTick()
    calc()
    window.addEventListener('resize', resizeHandle)
  })

  onUnmounted(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resizeHandle)
  })

  return { scale, containerStyle }
}
```

### 3.3 ScaleScreen.vue 组件封装

```vue
<template>
  <div class="scale-wrapper">
    <div :style="containerStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScreenScale } from '@/composables/useScreenScale'

const props = withDefaults(
  defineProps<{
    width?: number
    height?: number
  }>(),
  { width: 1920, height: 1080 }
)

const { containerStyle } = useScreenScale({ ...props })
</script>

<style scoped>
.scale-wrapper {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #020817;
}
</style>
```

使用方式：

```vue
<template>
  <ScaleScreen>
    
  </ScaleScreen>
</template>
```

> ⚠️ scale 方案重要坑
>
> 1. 屏幕比例 ≠ 16:9 会出现黑边，属于正常现象，可以把外层 wrapper 设置渐变背景，视觉弱化黑边；
> 2. 鼠标点击、tooltip 坐标偏移：DOM 视觉位置和实际布局位置不一致，有交互场景要换算坐标；
> 3. 非整数缩放，canvas / ECharts 文字模糊，可以尝试 ECharts 使用 `renderer: 'svg'` 缓解，不能完全根除。

---

## 4、方案二 vw/vh + flex + clamp() 流式适配

> 核心：vw 基于视口宽度，vh 基于视口高度；`clamp(min, ideal, max)` 限制尺寸上下限，避免超大屏文字过大、小屏文字过小；flex/grid 做布局排版。

### 4.1 SCSS 转换函数（把 UI 的 px 转为 vw/vh）

`@/styles/screen-util.scss`

```scss
// 设计稿 1920 * 1080
@function px2vw($px) {
  @return calc(#{$px} / 1920 * 100vw);
}

@function px2vh($px) {
  @return calc(#{$px} / 1080 * 100vh);
}
```

`vite.config.ts` 全局注入 scss 函数：

```typescript
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/screen-util.scss" as *;`,
      },
    },
  },
})
```

页面中使用示例：

```scss
.panel {
  width: px2vw(450);
  height: px2vh(320);
  padding: px2vh(20) px2vw(16);
  // 字体限制最小最大
  font-size: clamp(14px, px2vw(18), 24px);
}
```

### 4.2 ECharts 的 px 适配工具函数

> 重点：ECharts 不识别 vw/vh，所有 `fontSize`、`grid.left` 等配置项，需要 JS 动态计算 px 值。

工具函数 `@/utils/screen-size.ts`：

```typescript
// 设计稿 1920
export function fitSize(px: number, base = 1920): number {
  const clientW = document.documentElement.clientWidth
  return Number(((px * clientW) / base).toFixed(2))
}
```

ECharts option 中调用：

```typescript
const option = {
  title: {
    textStyle: { fontSize: fitSize(20) },
  },
  grid: {
    left: fitSize(40),
    right: fitSize(20),
  },
}
```

---

## 5、方案三 rem 根字体适配

原理：JS 监听窗口变化，动态修改 `document.documentElement.style.fontSize`，页面使用 rem 单位；搭配 `postcss-pxtorem` 自动将 px 转换 rem。

### 5.1 JS 设置根字体

```javascript
const designW = 1920
const baseFont = 100

function setRem() {
  const w = document.documentElement.clientWidth
  const scale = w / designW
  document.documentElement.style.fontSize = `${baseFont * scale}px`
}

setRem()
window.addEventListener('resize', setRem)
```

### 5.2 postcss.config.js 配置

```javascript
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 100,
      propList: ['*'],
    },
  },
}
```

> 缺点：大屏场景性价比不高，配置繁琐，效果和 scale 接近，**新项目不优先选择**。

---

## 6、方案四 混合生产级方案（推荐企业项目）

> 适合正式上线、多屏幕、多比例的大屏项目，取长补短：

1. **布局层：vw/vh**，实现全屏铺满；
2. **字体、间距：clamp()** 设置最大最小阈值，防止极端屏幕尺寸错乱；
3. **图表、地图：JS 工具函数动态计算 px，窗口 resize 时执行 `echarts.resize()`**；
4. **局部复杂组件：可少量使用 rem；**
5. **媒体查询仅做局部微调，不作为主适配逻辑**。

---

## 7、辅助技术：媒体查询 & CSS 容器查询

### 7.1 媒体查询 Media Query

仅做局部细节微调，不要作为大屏主适配：

```css
@media screen and (max-width: 1366px) {
  .title {
    font-size: 16px;
  }
}
```

### 7.2 CSS 容器查询 Container Queries（现代浏览器 Chrome ≥ 105）

组件根据父容器大小改变样式，而不是整个浏览器视口；适合组件内部自适应，不能替代全局适配。

```css
.chart-box {
  container-type: inline-size;
  container-name: chartBox;
}

@container chartBox (max-width: 600px) {
  .chart-title {
    font-size: 14px;
  }
}
```

---

## 8、ECharts 图表适配重点

1. **容器必须写死宽高，不能高度为 0**；
2. 组件销毁必须执行 `chart?.dispose()`，防止内存泄漏；
3. 使用 `ResizeObserver` 监听容器尺寸变化，调用 `chart.resize()`；
4. vw/vh 方案：resize 后需要重新 `setOption` 更新字体、间距等 px 配置；单纯 resize 不会更新 option 内部数值；
5. scale 方案：可尝试 `renderer: 'svg'` 降低模糊，但会牺牲部分动画性能。

### BaseChart.vue 简单封装示例

```vue
<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { EChartsOption } from 'echarts'

const props = defineProps<{ option: EChartsOption }>()
const chartRef = ref<HTMLDivElement | null>(null)
let chartIns: echarts.ECharts | null = null
let ro: ResizeObserver | null = null

watch(
  () => props.option,
  (opt) => {
    chartIns?.setOption(opt, true)
  },
  { deep: true }
)

onMounted(() => {
  if (!chartRef.value) return
  chartIns = echarts.init(chartRef.value)
  chartIns.setOption(props.option)

  ro = new ResizeObserver(() => chartIns?.resize())
  ro.observe(chartRef.value)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  chartIns?.dispose()
  ro = null
  chartIns = null
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
```

---

## 9、高频踩坑与解决方案

### 9.1 scale 方案黑边

> 不是 bug，屏幕比例与 16:9 不一致必然出现。

解决：外层容器铺满全屏，设置深色科技渐变背景，内容居中缩放，视觉弱化黑边；如果强制铺满屏幕可以使用 `scale(scaleX, scaleY)` 非等比缩放，但是会导致图形、圆形、地图变形，谨慎使用。

### 9.2 scale 缩放后鼠标 / tooltip 坐标偏移

> transform 改变视觉位置，DOM 布局坐标不变。

解决：

1. 尽量避免 scale 容器内部复杂交互弹窗；
2. 手动换算坐标：`真实坐标 = 浏览器坐标 / scale`。

### 9.3 缩放后文字、ECharts 画布模糊

- scale 方案：尽量不要极小/极大的缩放倍数；基础字体设置大一点；ECharts 尝试 svg 渲染；没有彻底根治方案。
- vw/vh 方案：使用 `clamp()` 限制字体上下限，不要让字体完全依赖 vw。

### 9.4 ECharts 窗口变化图表不变化

- scale：调用 `chart.resize()`；
- vw/vh：除 resize 外，还需要重新 `setOption` 更新 fontSize、grid 等值。

### 9.5 内存泄漏

- `window.addEventListener` 要在组件卸载 `removeEventListener`；
- ECharts 必须 `dispose`；ResizeObserver 必须 `disconnect`；
- `setInterval` / `setTimeout` 页面卸载清除定时器；WebSocket 组件销毁关闭连接。

### 9.6 Ctrl + 滚轮浏览器缩放页面错乱

Chrome 中 Ctrl + 滚轮会改变 innerWidth，触发页面重排。scale 方案受影响最小；流式 vw/vh 页面会发生布局挤压，属于浏览器辅助缩放行为，一般不需要修复。

---

## 10、选型决策树

```
你的大屏是否固定运行在 16:9 屏幕（LED / 展厅投影）？
├── ✅ 是，几乎没有弹窗、拖拽交互
│   └── 👉 优先选择 scale 整体缩放，开发快，还原度高；接受黑边
└── ❌ 否，需要兼容多种屏幕比例、超宽拼接屏，有交互
    ├── 业务简单 demo，快速验证
    │   └── 👉 vw/vh 流式方案
    └── 👉 正式企业项目
        └── 👉 混合方案：vw/vh 布局 + clamp 字体 + JS 处理 ECharts 图表
```


```

> 重要前置：开发前确认甲方真实设备分辨率、屏幕比例，是否允许页面留白黑边，很多适配问题属于需求沟通问题，不是纯技术问题。

---

## 11、开发最佳实践

1. 统一确认设计稿基准尺寸，绝大多数大屏项目基准：`1920 × 1080`；
2. scale 方案：内部全部写 px，UI 标注直接复制，开发效率最高；外层背景铺满屏幕弱化黑边；
3. vw/vh 方案：不要直接裸写 vw 字体，**必须搭配 clamp 设置最大最小值**；
4. ECharts 统一封装通用 BaseChart 组件，统一处理 resize、销毁；
5. 监听 resize 务必使用防抖 / requestAnimationFrame，防止高频执行；
6. 上线前必须去真实大屏硬件设备上测试，不要只在开发电脑浏览器模拟；
7. 长时间挂机大屏：重点检查定时器、事件监听、ECharts 实例、ResizeObserver、WebSocket，防止内存泄漏。

---

## 参考资料来源

- 简书：《前端大屏项目的屏幕适配方案》
- 掘金：《前端大屏适配方案：rem、vw/vh、scale 到底选哪个》
- 掘金：《前端数据大屏开发完整指南 Vue3 + ECharts 自适应实战》
- 掘金：《一文掌握大屏适配方案》
- 博客园 / 技术栈：相关大屏适配与 ECharts 实战文章
