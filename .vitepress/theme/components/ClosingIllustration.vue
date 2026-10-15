<script setup lang="ts">
/**
 * 首页收尾的「内容地图」，位置对应参考站 home/HeroRive.vue。
 *
 * ★ 2026-10 重构：原静态 SVG 换为 @vue-flow/core 动态画布（可平移 / 缩放，节点边由数据生成）。
 * - 本文件是**外层骨架**，只渲染 SSR 可输出的部分：深色面板（网格底纹 + 四角刻度）+ 缩放工具条；
 *   真正的画布 ClosingIllustrationCanvas.vue 在浏览器端动态 import
 *   （@vue-flow/core 依赖 d3-zoom，需要 DOM，不进构建期），容器用 aspect-ratio 撑开高度，
 *   挂载后不会发生布局跳动，JS / 画布加载失败时面板仍是完整可见的静态区块。
 * - 图内容全部来自 ../data/content-map（数据源 = ../data/topics 的 contentMapGroups 与统计常量）：
 *   增删分组、改文案只改数据，卡片排布、中心节点位置与面板高度自动重排。
 * - 面板恒深色：`bg-[#12131d]` + 固定白字，**不用 `data-theme="dark"`**——
 *   那会改变本区块 `border-t` 的主题变量，与相邻浅色区块的横线颜色不一致。
 * - ⚠️ 不要照抄参考站的 `md:border-none`：这里必须自己带 border-t，整页外框才能从上到下连续。
 * - 动效（GSAP 入场 + CSS 常驻流光 / 脉冲）都在画布组件里，本文件只管骨架；
 *   section 保留 `data-motion-scope`，让 Home.vue 的 revealOnScroll 跳过这一层。
 */
import { onMounted, ref, shallowRef, type Component } from 'vue'

import '@vue-flow/core/dist/style.css'
import { contentMapLayout } from '../data/content-map'

type CanvasControls = {
  zoomIn: () => unknown
  zoomOut: () => unknown
  fitView: () => unknown
}

const Canvas = shallowRef<Component | null>(null)
const canvasRef = ref<CanvasControls | null>(null)

onMounted(async () => {
  Canvas.value = (await import('./ClosingIllustrationCanvas.vue')).default
})

/** 面板宽高比跟随内容版式（世界坐标 1000 × 由数据算出的高），整图入画不变形 */
const stageStyle = { aspectRatio: `${contentMapLayout.width} / ${contentMapLayout.height}` }

/** 无障碍描述：画布里的卡片是真实 DOM 文本，读屏可读，这里只补一句整体说明 */
const mapTitles = contentMapLayout.nodes
  .filter((node) => node.kind === 'card')
  .map((node) => node.title)
const mapLabel = `站点内容地图：中心节点 Solution，向外连接 ${mapTitles.length} 个节点（${mapTitles.join('、')}）`
</script>

<template>
  <section class="wrapper border-t" data-motion-scope :aria-label="mapLabel">
    <!-- 面板铺满 wrapper（无内边距、无圆角），左右与上下都顶到外框边线 -->
    <div class="closing-map">
      <!-- 窄屏横向滚动（面板竖高按宽高比算，压缩会让图上文字不可读），与原静态图一致 -->
      <div class="closing-map__scroll">
        <div class="closing-map__stage" :style="stageStyle">
          <component :is="Canvas" v-if="Canvas" ref="canvasRef" />
        </div>
      </div>

      <!-- 四角刻度装饰 -->
      <span class="closing-map__tick closing-map__tick--tl" aria-hidden="true" />
      <span class="closing-map__tick closing-map__tick--tr" aria-hidden="true" />
      <span class="closing-map__tick closing-map__tick--bl" aria-hidden="true" />
      <span class="closing-map__tick closing-map__tick--br" aria-hidden="true" />

      <!-- 动态画布的缩放控制：画布未载入前禁用 -->
      <div class="closing-map__tools">
        <button type="button" class="closing-map__btn" :disabled="!Canvas" @click="canvasRef?.zoomOut()">
          缩小
        </button>
        <button type="button" class="closing-map__btn" :disabled="!Canvas" @click="canvasRef?.fitView()">
          适应
        </button>
        <button type="button" class="closing-map__btn" :disabled="!Canvas" @click="canvasRef?.zoomIn()">
          放大
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.closing-map {
  position: relative;
  background-color: #12131d;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.closing-map__scroll {
  overflow-x: auto;
}

.closing-map__stage {
  position: relative;
  min-width: 26rem;
  /* 26px 细网格底纹：与原静态图的 pattern（每格上 / 左各一条 1px 线）等价 */
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 26px 26px;
}

/* 四角刻度：13px 的 “+”，两条 1px 细线拼出，不随画布缩放 */
.closing-map__tick {
  position: absolute;
  width: 13px;
  height: 13px;
  pointer-events: none;
}

.closing-map__tick::before,
.closing-map__tick::after {
  content: '';
  position: absolute;
  background-color: rgba(255, 255, 255, 0.22);
}

.closing-map__tick::before {
  top: 6px;
  left: 0;
  width: 13px;
  height: 1px;
}

.closing-map__tick::after {
  top: 0;
  left: 6px;
  width: 1px;
  height: 13px;
}

.closing-map__tick--tl {
  top: 30px;
  left: 30px;
}

.closing-map__tick--tr {
  top: 30px;
  right: 30px;
}

.closing-map__tick--bl {
  bottom: 30px;
  left: 30px;
}

.closing-map__tick--br {
  right: 30px;
  bottom: 30px;
}

.closing-map__tools {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  gap: 6px;
}

.closing-map__btn {
  padding: 2px 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background-color: rgba(18, 19, 29, 0.72);
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.closing-map__btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
}

.closing-map__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* 移动端：面板竖高按宽高比算，横向滚动查看整图（与原静态图 min-w-[26rem] 口径一致） */
@media (max-width: 640px) {
  .closing-map__tick--tl,
  .closing-map__tick--bl {
    left: 12px;
  }

  .closing-map__tick--tr,
  .closing-map__tick--br {
    right: 12px;
  }

  /*
   * 窄屏收起缩放工具条：面板只有 ~180px 高，右上角按钮会压住第三张卡片；
   * 这里恢复成原静态图的干净版面（画布本身仍可拖拽平移 / 双指缩放，面板也可横向滚动）。
   */
  .closing-map__tools {
    display: none;
  }
}
</style>
