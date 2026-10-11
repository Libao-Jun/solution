<script setup lang="ts">
/**
 * 首页收尾的「内容地图」示意，位置对应参考站 home/HeroRive.vue
 * （参考站用 Rive 动画，本站自绘同风格 SVG：中心节点 + 5 个分类节点 + 连线）。
 *
 * 动效（GSAP，见 ../animations/motion.ts）：连线逐条「画」出来 → 中心节点弹出 →
 * 端点圆点依次亮起 → 分类卡片错落上浮，最后中心节点常驻轻微浮动。
 * ★ 分类卡片的外层 `<g>` 没有 transform 属性（位移在内层 `<g>` 上），
 *   所以外层可以安全地做 y 位移；内层带 `translate(...)` 的绝对不要动画 transform。
 */
import { ref } from 'vue'

import { useMotion } from '../animations/motion'

const center = { x: 600, y: 240 }

const groups = [
  { title: 'Web 基础', x: 180, y: 120, leaves: ['HTML5', '浏览器', 'HTTP / HTTPS'] },
  { title: '框架与端', x: 600, y: 78, leaves: ['React', 'Vue / Svelte', '小程序 / App'] },
  { title: '工程化与适配', x: 1020, y: 120, leaves: ['打包构建', 'Emmet', '大屏 / H5 唤起'] },
  { title: '学习路线', x: 300, y: 396, leaves: ['初学者', '网站开发', '语言与平台'] },
  { title: '职业成长', x: 900, y: 396, leaves: ['开源许可证', '求职 · 简历 · 职场'] },
]

const root = ref<HTMLElement | null>(null)

useMotion(root, ({ gsap }, element) => {
  const lines = gsap.utils.toArray<SVGLineElement>('[data-map-line]', element)
  const dots = gsap.utils.toArray<SVGCircleElement>('[data-map-dot]', element)
  const centerNode = element.querySelector<SVGGElement>('[data-map-center]')
  const cards = gsap.utils.toArray<SVGGElement>('[data-map-card]', element)

  // 连线先量好长度并藏起来，交由时间线「画」出（SVG 的 stroke-dasharray 描绘）
  lines.forEach((line) => {
    const length = line.getTotalLength()
    gsap.set(line, { strokeDasharray: length, strokeDashoffset: length })
  })

  /* 起始态 set、终值 to（不要用 from：from 的终值靠回读当前值，会被别的动画/过渡带偏） */
  if (centerNode) {
    gsap.set(centerNode, { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' })
  }
  if (dots.length) {
    gsap.set(dots, { autoAlpha: 0, scale: 0 })
  }
  if (cards.length) {
    gsap.set(cards, { autoAlpha: 0, y: 18 })
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: element, start: 'top 82%', once: true },
  })

  if (lines.length) {
    timeline.to(lines, { strokeDashoffset: 0, duration: 0.9, stagger: 0.08, ease: 'power2.inOut' }, 0)
  }
  if (centerNode) {
    timeline.to(centerNode, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, 0.15)
  }
  if (dots.length) {
    timeline.to(dots, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.09, ease: 'back.out(2.2)' }, 0.5)
  }
  if (cards.length) {
    timeline.to(cards, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.09 }, 0.55)
  }

  // 常驻浮动：只动 y，与入场动画的 scale / autoAlpha 不抢同一个属性
  if (centerNode) {
    gsap.to(centerNode, {
      y: -5,
      duration: 3,
      delay: 1.4,
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
    参考站靠它前面的 blank Spacer.vue 承接左右竖线，本站已去掉那段空留白，
    这里必须自己带上 border-t，才能让整页外框从上到下连续、不留空框。
  -->
  <section ref="root" data-motion-scope class="wrapper border-t py-10 md:py-16">
    <div class="overflow-x-auto">
      <svg
        class="w-full h-auto min-w-[40rem]"
        viewBox="0 0 1200 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="站点内容地图：中心为 Solution，向外连接五个分类节点"
      >
      <defs>
        <linearGradient id="map-center" x1="500" y1="206" x2="700" y2="274" gradientUnits="userSpaceOnUse">
          <stop stop-color="#6C3BFF" />
          <stop offset="1" stop-color="#4f30e8" />
        </linearGradient>
      </defs>

      <!-- 连线 -->
      <g stroke="#E5E4E7" stroke-width="1">
        <line
          v-for="group in groups"
          :key="`line-${group.title}`"
          data-map-line
          :x1="center.x"
          :y1="center.y"
          :x2="group.x"
          :y2="group.y"
        />
      </g>
      <g fill="#E5E4E7">
        <circle
          v-for="group in groups"
          :key="`dot-${group.title}`"
          data-map-dot
          :cx="group.x"
          :cy="group.y"
          r="3"
        />
      </g>

      <!-- 中心节点 -->
      <g data-map-center>
        <rect :x="center.x - 108" :y="center.y - 36" width="216" height="72" rx="16" fill="url(#map-center)" />
        <text
          :x="center.x"
          :y="center.y - 2"
          text-anchor="middle"
          font-family="Inter, system-ui, sans-serif"
          font-size="20"
          font-weight="700"
          fill="#FFFFFF"
        >
          Solution
        </text>
        <text
          :x="center.x"
          :y="center.y + 22"
          text-anchor="middle"
          font-family="'KH Teka Mono', ui-monospace, monospace"
          font-size="12"
          fill="#FFFFFF"
          fill-opacity="0.8"
        >
          5 大分类 · 20 篇文档
        </text>
      </g>

      <!-- 分类节点 -->
      <g v-for="group in groups" :key="`card-${group.title}`" data-map-card>
        <g :transform="`translate(${group.x - 95}, ${group.y - 56})`">
          <rect
            width="190"
            :height="46 + group.leaves.length * 20"
            rx="12"
            fill="#FFFFFF"
            stroke="#E5E4E7"
          />
          <text
            x="16"
            y="28"
            font-family="Inter, system-ui, sans-serif"
            font-size="14"
            font-weight="600"
            fill="#16171d"
          >
            {{ group.title }}
          </text>
          <text
            v-for="(leaf, index) in group.leaves"
            :key="leaf"
            x="16"
            :y="54 + index * 20"
            font-family="Inter, system-ui, sans-serif"
            font-size="12"
            fill="#867e8e"
          >
            {{ leaf }}
          </text>
        </g>
      </g>
      </svg>
    </div>
  </section>
</template>
