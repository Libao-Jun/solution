<script setup lang="ts">
/**
 * 首页收尾的「内容地图」，位置对应参考站 home/HeroRive.vue。
 * 2026-10 重构：深色科技风面板 —— 网格底纹 + 中心光晕脉冲 + 渐变曲线连线 +
 * 虚线流光 + 玻璃拟态分类卡片；拓扑（上 3 下 2）与文案保持不变。
 *
 * 动效约定（见 ../animations/motion.ts）：
 * - 入场一律 `gsap.set()` 造起始态 + `gsap.to()` 写显式终值（禁 `from()`），
 *   JS / GSAP 失败时页面仍是完整静态内容，绝不用 CSS 先隐藏元素；
 * - 常驻循环（中心脉冲环、连线虚线流光）走 CSS，并包在
 *   `prefers-reduced-motion: no-preference` 里，命中「减少动态」时完全静止；
 * - SVG 带 `transform` 属性的元素（卡片的内层 translate 组）不做位移动画，
 *   位移只挂在外层没有 transform 属性的 `<g data-map-card>` 上。
 *
 * ★ 版式：深色面板铺满整个 wrapper（无内边距、无圆角，上下顶到 border 线）；
 *   卡片宽 132（最长文案「大屏 / H5 唤起」+ 内边距），高 = 42 + 条目数 × 20；
 *   顶排中心 y=88（最高的工程化卡片上边缘 27px，不越界）、底排 y=352（下边缘 ≥ 37px）；
 *   连线止于卡片朝向中心一侧的**边缘中点**（玻璃卡片半透明，伸进卡片会透出线头）；
 *   连接端口圆点贴在卡片边缘外侧 7px 的连线上（不与卡片重叠、不被遮挡）。
 */
import { ref } from 'vue'

import { categoryCount, docCount } from '../data/topics'
import { useMotion } from '../animations/motion'

/** 卡片宽度：最长文案 + 内边距 */
const CARD_WIDTH = 132
/** 卡片高度：标题一行 + 每条目 20px */
const cardHeight = (count: number) => 42 + count * 20

const center = { x: 500, y: 220 }
const TOP_ROW_Y = 88
const BOTTOM_ROW_Y = 352

const groups = [
  { title: 'Web 基础', x: 194, y: TOP_ROW_Y, leaves: ['HTML5', '浏览器', 'HTTP / HTTPS'] },
  { title: '框架与端', x: 500, y: TOP_ROW_Y, leaves: ['React', 'Vue / Svelte', '小程序 / App'] },
  { title: '工程化与适配', x: 806, y: TOP_ROW_Y, leaves: ['打包构建', 'Emmet', '大屏 / H5 唤起', 'Git 速查'] },
  { title: '学习路线', x: 260, y: BOTTOM_ROW_Y, leaves: ['初学者', '网站开发', '语言与平台'] },
  { title: '职业成长', x: 740, y: BOTTOM_ROW_Y, leaves: ['开源许可证', '求职 · 简历 · 职场'] },
]

/** 连线终点 y：卡片朝向中心一侧的边缘中点（顶排 = 底边、底排 = 顶边），线不得伸进卡片内部 */
const edgeY = (group: (typeof groups)[number]): number =>
  group.y === TOP_ROW_Y
    ? group.y + cardHeight(group.leaves.length) / 2
    : group.y - cardHeight(group.leaves.length) / 2

/** 连线：中心 → 卡片边缘的 S 型贝塞尔，两端均沿竖直方向离开 / 进入 */
const curvePath = (gx: number, gy: number): string => {
  const { x: cx, y: cy } = center
  const bend = (gy - cy) * 0.45
  return `M ${cx} ${cy} C ${cx} ${cy + bend}, ${gx} ${gy - bend}, ${gx} ${gy}`
}

/** 连接端口圆点：贴在卡片边缘外侧 7px 的连线上（不与卡片重叠、不被遮挡） */
const dotAt = (group: (typeof groups)[number]): { x: number; y: number } => ({
  x: group.x,
  y: edgeY(group) + (group.y === TOP_ROW_Y ? 7 : -7),
})

const root = ref<HTMLElement | null>(null)

useMotion(root, ({ gsap }, element) => {
  const lines = gsap.utils.toArray<SVGPathElement>('[data-map-line]', element)
  const flows = gsap.utils.toArray<SVGPathElement>('[data-map-flow]', element)
  const dots = gsap.utils.toArray<SVGGElement>('[data-map-dot]', element)
  const centerNode = element.querySelector<SVGGElement>('[data-map-center]')
  const cards = gsap.utils.toArray<SVGGElement>('[data-map-card]', element)

  /* 起始态 set、终值 to（不要用 from：from 的终值靠回读当前值，会被别的动画/过渡带偏） */
  lines.forEach((line) => {
    const length = line.getTotalLength()
    gsap.set(line, { strokeDasharray: length, strokeDashoffset: length })
  })
  if (centerNode) {
    gsap.set(centerNode, { autoAlpha: 0, scale: 0.88, transformOrigin: '50% 50%' })
  }
  if (dots.length) {
    gsap.set(dots, { autoAlpha: 0, scale: 0 })
  }
  if (cards.length) {
    gsap.set(cards, { autoAlpha: 0, y: 20 })
  }
  if (flows.length) {
    gsap.set(flows, { autoAlpha: 0 })
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: element, start: 'top 80%', once: true },
  })

  // 连线逐条「画」出；结束后清掉内联 dash，回落成无虚线的渐变实线（虚线交给 flow 层）
  if (lines.length) {
    timeline.to(
      lines,
      { strokeDashoffset: 0, duration: 1, stagger: 0.07, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' },
      0,
    )
  }
  if (centerNode) {
    timeline.to(centerNode, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, 0.2)
  }
  if (dots.length) {
    timeline.to(dots, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(2)' }, 0.55)
  }
  if (cards.length) {
    timeline.to(cards, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.09 }, 0.6)
  }
  // 流光层最后淡入，把动效接力给 CSS 常驻循环
  if (flows.length) {
    timeline.to(flows, { autoAlpha: 1, duration: 0.8, stagger: 0.06 }, 1)
  }

  // 常驻浮动：只动 y，与入场动画的 scale / autoAlpha 不抢同一个属性
  if (centerNode) {
    gsap.to(centerNode, {
      y: -5,
      duration: 3,
      delay: 1.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
  }
})
</script>

<template>
  <!--
    ⚠️ 不要照抄参考站 HeroRive 的 `md:border-none`：
    本站已去掉参考站的空留白 Spacer，这里必须自己带 border-t，
    整页外框才能从上到下连续、不留空框。
  -->
  <section ref="root" data-motion-scope class="wrapper border-t">
    <!-- 面板铺满 wrapper（无内边距、无圆角），左右与上下都顶到外框边线 -->
    <div class="overflow-x-auto bg-[#12131d] ring-1 ring-white/10 ring-inset">
      <svg
        class="block w-full h-auto min-w-[26rem]"
        viewBox="0 0 1000 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="站点内容地图：中心为 Solution，向外连接五个分类节点"
      >
        <defs>
          <!-- 细网格底纹 -->
          <pattern id="map-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 H 0 V 26" fill="none" stroke="rgba(255,255,255,0.045)" stroke-width="1" />
          </pattern>
          <!-- 中心径向光晕 -->
          <radialGradient id="map-glow" gradientUnits="userSpaceOnUse" :cx="center.x" :cy="center.y" r="250">
            <stop stop-color="#6C3BFF" stop-opacity="0.2" />
            <stop offset="1" stop-color="#6C3BFF" stop-opacity="0" />
          </radialGradient>
          <!-- 连线渐变：中心端品牌紫 → 卡片端渐隐 -->
          <linearGradient
            v-for="(group, index) in groups"
            :id="`map-line-${index}`"
            :key="`grad-${group.title}`"
            gradientUnits="userSpaceOnUse"
            :x1="center.x"
            :y1="center.y"
            :x2="group.x"
            :y2="edgeY(group)"
          >
            <stop stop-color="#8b6bff" stop-opacity="0.9" />
            <stop offset="1" stop-color="#ffffff" stop-opacity="0.12" />
          </linearGradient>
          <!-- 中心节点渐变 -->
          <linearGradient
            id="map-center-bg"
            gradientUnits="userSpaceOnUse"
            :x1="center.x - 90"
            :y1="center.y - 36"
            :x2="center.x + 90"
            :y2="center.y + 36"
          >
            <stop stop-color="#7C4DFF" />
            <stop offset="1" stop-color="#4f30e8" />
          </linearGradient>
        </defs>

        <!-- 底纹与光晕 -->
        <rect width="1000" height="440" fill="url(#map-grid)" />
        <rect width="1000" height="440" fill="url(#map-glow)" />

        <!-- 四角刻度装饰 -->
        <g stroke="rgba(255,255,255,0.22)" stroke-width="1">
          <path
            v-for="tick in [
              { x: 36, y: 36 },
              { x: 964, y: 36 },
              { x: 36, y: 404 },
              { x: 964, y: 404 },
            ]"
            :key="`tick-${tick.x}-${tick.y}`"
            :d="`M ${tick.x - 6} ${tick.y} H ${tick.x + 6} M ${tick.x} ${tick.y - 6} V ${tick.y + 6}`"
          />
        </g>

        <!-- 连线：渐变实线层（GSAP 描绘） + 虚线流光层（CSS 常驻流动） -->
        <g fill="none">
          <path
            v-for="(group, index) in groups"
            :key="`line-${group.title}`"
            data-map-line
            :d="curvePath(group.x, edgeY(group))"
            :stroke="`url(#map-line-${index})`"
            stroke-width="1.2"
          />
          <path
            v-for="group in groups"
            :key="`flow-${group.title}`"
            data-map-flow
            class="map-flow"
            :d="curvePath(group.x, edgeY(group))"
            stroke="rgba(167,139,250,0.7)"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-dasharray="3 9"
          />
        </g>

        <!-- 连接端口圆点：贴在卡片边缘外侧的连线上 -->
        <g v-for="group in groups" :key="`dot-${group.title}`" data-map-dot>
          <circle :cx="dotAt(group).x" :cy="dotAt(group).y" r="6" fill="rgba(167,139,250,0.18)" />
          <circle :cx="dotAt(group).x" :cy="dotAt(group).y" r="2.5" fill="#c4b5fd" />
        </g>

        <!-- 中心节点：脉冲光环 + 渐变徽标 -->
        <g data-map-center>
          <circle class="map-pulse" :cx="center.x" :cy="center.y" r="86" stroke="rgba(139,92,246,0.45)" />
          <circle class="map-pulse map-pulse--late" :cx="center.x" :cy="center.y" r="86" stroke="rgba(139,92,246,0.35)" />
          <rect
            :x="center.x - 90"
            :y="center.y - 36"
            width="180"
            height="72"
            rx="10"
            fill="url(#map-center-bg)"
          />
          <rect
            :x="center.x - 89.5"
            :y="center.y - 35.5"
            width="179"
            height="71"
            rx="9.5"
            stroke="rgba(255,255,255,0.22)"
          />
          <text
            :x="center.x"
            :y="center.y - 5"
            text-anchor="middle"
            font-family="Inter, system-ui, sans-serif"
            font-size="21"
            font-weight="700"
            fill="#FFFFFF"
          >
            Solution
          </text>
          <text
            :x="center.x"
            :y="center.y + 19"
            text-anchor="middle"
            font-family="ui-monospace, monospace"
            font-size="12"
            fill="#FFFFFF"
            fill-opacity="0.82"
          >
            {{ categoryCount }} 大分类 · {{ docCount }} 篇文档
          </text>
        </g>

        <!-- 分类卡片：玻璃拟态；内层带 translate 不做位移动画，位移挂外层 g -->
        <g v-for="group in groups" :key="`card-${group.title}`" data-map-card class="map-card">
          <g
            :transform="`translate(${group.x - CARD_WIDTH / 2}, ${group.y - cardHeight(group.leaves.length) / 2})`"
          >
            <rect
              class="map-card-rect"
              :width="CARD_WIDTH"
              :height="cardHeight(group.leaves.length)"
              rx="14"
              fill="rgba(255,255,255,0.035)"
              stroke="rgba(255,255,255,0.14)"
            />
            <text class="map-card-title" x="16" y="26" font-size="13.5" font-weight="600" fill="#ECEEF8">
              {{ group.title }}
            </text>
            <text
              v-for="(leaf, index) in group.leaves"
              :key="leaf"
              class="map-card-leaf"
              x="16"
              :y="50 + index * 20"
              font-size="12"
              fill="rgba(255,255,255,0.52)"
            >
              {{ leaf }}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </section>
</template>

<style scoped>
/* 常驻循环只在「允许动效」时开启；prefers-reduced-motion 下完全静止 */
@media (prefers-reduced-motion: no-preference) {
  /* 虚线沿连线从中心流向卡片（dasharray "3 9" 周期 12） */
  .map-flow {
    animation: map-dash 1.4s linear infinite;
  }

  /* 中心脉冲环：向外扩散并淡出，双环错相 */
  .map-pulse {
    fill: none;
    transform-box: fill-box;
    transform-origin: center;
    animation: map-pulse 3.2s ease-out infinite;
  }

  .map-pulse--late {
    animation-delay: 1.6s;
  }
}

@keyframes map-dash {
  to {
    stroke-dashoffset: -12;
  }
}

@keyframes map-pulse {
  0% {
    transform: scale(0.55);
    opacity: 0.55;
  }
  70%,
  100% {
    transform: scale(1.45);
    opacity: 0;
  }
}

/* 悬停反馈：只改描边 / 填充 / 文字色（paint 属性），不碰 transform，避免与 GSAP 冲突 */
.map-card-rect,
.map-card-title,
.map-card-leaf {
  transition:
    stroke 0.3s ease,
    fill 0.3s ease;
}

.map-card:hover .map-card-rect {
  stroke: rgba(167, 139, 250, 0.65);
  fill: rgba(139, 92, 246, 0.08);
}

.map-card:hover .map-card-title {
  fill: #ffffff;
}

.map-card:hover .map-card-leaf {
  fill: rgba(255, 255, 255, 0.75);
}
</style>
