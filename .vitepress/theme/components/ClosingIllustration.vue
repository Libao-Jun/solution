<script setup lang="ts">
/**
 * 首页收尾的「内容地图」示意，位置对应参考站 home/HeroRive.vue
 * （参考站用 Rive 动画，本站自绘同风格 SVG：中心节点 + 5 个分类节点 + 连线）。
 */
const center = { x: 600, y: 240 }

const groups = [
  { title: 'Web 基础', x: 180, y: 120, leaves: ['HTML5', '浏览器', 'HTTP / HTTPS'] },
  { title: '框架与端', x: 600, y: 78, leaves: ['React', 'Vue / Svelte', '小程序 / App'] },
  { title: '工程化与适配', x: 1020, y: 120, leaves: ['打包构建', 'Emmet', '大屏 / H5 唤起'] },
  { title: '学习路线', x: 300, y: 396, leaves: ['初学者', '网站开发', '语言与平台'] },
  { title: '职业成长', x: 900, y: 396, leaves: ['开源许可证', '求职 · 简历 · 职场'] },
]
</script>

<template>
  <div class="wrapper md:border-none py-10 md:py-16">
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
          :x1="center.x"
          :y1="center.y"
          :x2="group.x"
          :y2="group.y"
        />
      </g>
      <g fill="#E5E4E7">
        <circle v-for="group in groups" :key="`dot-${group.title}`" :cx="group.x" :cy="group.y" r="3" />
      </g>

      <!-- 中心节点 -->
      <g>
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
      <g v-for="group in groups" :key="`card-${group.title}`">
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
  </div>
</template>
