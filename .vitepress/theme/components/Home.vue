<script setup lang="ts">
// 组件内的站内链接必须经 withBase 处理，否则子路径部署（GitHub Pages /solution/）下会 404
import { withBase } from 'vitepress'

import { featurePanels } from '../data/features'
import {
  categories,
  categoryCount,
  docCount,
  growthBlocks,
  highlights,
  roadmapCount,
  statRows,
} from '../data/topics'

import ClosingIllustration from './ClosingIllustration.vue'
import FeaturePanel from './FeaturePanel.vue'
import FeatureToolbar from './FeatureToolbar.vue'
import InstallCommand from './InstallCommand.vue'
import StackIsometric from './StackIsometric.vue'
import TerminalPanel from './TerminalPanel.vue'

/**
 * 首页区块与参考站 docs/.vitepress/theme/layouts/Home.vue 一一对应：
 *   Hero → StackIsometric（技术栈等距图）→ Terminal → InstallCommand → CoreFeature3Col → ProductivityGrid
 *   → (深色) HeadingSection4 + FeatureToolbar + Feature* 面板
 *   → HeadingSection3 → HeroRive（本站为自绘 SVG 内容地图）
 *
 * ⚠️ 参考站在 HeadingSection3 与 HeroRive 之间还有一个 blank 的 Spacer.vue
 *   （`<section class="wrapper wrapper--ticks border-t h-16 sm:h-30">`），
 *   而 HeroRive 自身是 `md:border-none`：两者相拼会在页面最下方留下一个
 *   左右有竖线、上下不封口的**空框**（看起来就是一块没渲染出来的空区块）。
 *   本站不需要这段纯留白，直接去掉，并把外框交给内容地图自己延续。
 *
 * ★ 网格边框约定：divide-* 只给「除第一个子元素外」加边框，所以只有
 *   「单元格数量整除列数」时才安全（3 格 3 列、4 格 2×2、2 格 2 列）。
 *   多条目列表一律放进格子里做单列 divide-y 列表，别堆卡片网格。
 */
</script>

<template>
  <div class="home">
    <!-- 1. Hero（home/Hero.vue） -->
    <section class="wrapper flex flex-col justify-start items-center gap-6 pt-14 pb-6">
      <div class="w-full sm:w-2xl flex flex-col justify-start items-center gap-10 px-5 sm:px-0">
        <div class="flex flex-col justify-start items-center gap-4">
          <img :src="withBase('/icon.svg')" alt="Solution" class="w-9" />
          <p class="text-sm font-mono text-[var(--color-brand)]">前端常用或常见解决方案</p>
          <h1 class="text-center text-primary text-balance shine-text">
            <span class="inline-block">前端知识</span>
            <span class="inline-block">一站式解决方案手册</span>
          </h1>
          <p class="self-stretch text-center text-balance text-nickel">
            覆盖 HTML、浏览器、HTTP、JavaScript、TypeScript、主流框架、小程序与工程化实践。
          </p>
          <p class="text-sm text-grey">
            {{ docCount }} 篇主题文档 · {{ categoryCount }} 大分类 · {{ roadmapCount }} 份学习路线图
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-5">
          <a :href="withBase('/fundamentals/html5/')" class="button button--primary"> 开始阅读 </a>
          <a :href="withBase('/roadmaps/')" class="button"> 查看学习路线 </a>
        </div>
      </div>
    </section>

    <!-- 2. 技术栈等距图（参考站首页的 Rive 视觉位；本站为纯 SVG 等距投影） -->
    <StackIsometric />

    <!-- 3. 命令速查终端（home/Terminal.vue） -->
    <TerminalPanel />

    <!-- 4. 快速开始（home/InstallCommand.vue） -->
    <InstallCommand />

    <!-- 5. 三大分类：3 格 / 3 列（home/CoreFeature3Col.vue） -->
    <section
      class="wrapper border-t grid grid-rows-3 lg:grid-rows-1 lg:grid-cols-3 lg:h-80 divide-x-0 lg:divide-x divide-y lg:divide-y-0 divide-stroke"
    >
      <div
        v-for="category in categories"
        :key="category.key"
        class="p-5 lg:p-10 flex flex-col justify-between gap-6"
      >
        <div class="flex flex-col gap-3">
          <h5 class="text-balance">{{ category.title }}</h5>
          <p class="text-pretty">{{ category.details }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a v-for="chip in category.chips" :key="chip.link" :href="withBase(chip.link)">
            <code>{{ chip.text }}</code>
          </a>
        </div>
      </div>
    </section>

    <!-- 6. 站点信息：4 格 / 2×2（home/ProductivityGrid.vue） -->
    <section
      class="wrapper wrapper--ticks border-t grid lg:grid-cols-2 divide-x-0 lg:divide-x divide-y divide-stroke"
    >
      <div class="p-5 sm:p-10 flex flex-col gap-3">
        <h5>站点怎么用</h5>
        <p class="max-w-[26rem] text-pretty">所有内容都来自本仓库已有文档，按主题归档，随取随用。</p>
        <!-- 浅色区块用 list-disc（checkmark-list 的勾选图标是为深色背景准备的） -->
        <ul class="list-disc pl-3 flex flex-col gap-2 marker:text-ruby mt-1">
          <li v-for="item in highlights" :key="item" class="leading-tight">{{ item }}</li>
        </ul>
      </div>

      <div class="p-5 sm:p-10 flex flex-col gap-3">
        <h5>内容概览</h5>
        <p class="max-w-[26rem] text-pretty">下面这些数字都来自仓库里的实际文件，没有估算。</p>
        <!-- 每行 2 项 → divide-x 正确；行与行之间是单列 → divide-y 正确 -->
        <div class="flex flex-col divide-y divide-stroke mt-1">
          <div
            v-for="(row, rowIndex) in statRows"
            :key="rowIndex"
            class="grid grid-cols-2 divide-x divide-stroke py-5 first:pt-0 last:pb-0"
          >
            <div
              v-for="(item, itemIndex) in row"
              :key="item.label"
              class="flex flex-col gap-1"
              :class="itemIndex === 0 ? 'pr-5' : 'pl-5'"
            >
              <p class="text-primary font-medium text-base sm:text-xl">{{ item.value }}</p>
              <p class="leading-tight text-base text-grey">{{ item.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-for="block in growthBlocks"
        :key="block.title"
        class="p-5 sm:p-10 flex flex-col gap-3 justify-between"
      >
        <div class="flex flex-col gap-3">
          <h5>{{ block.title }}</h5>
          <p class="max-w-[26rem] text-balance">{{ block.details }}</p>
        </div>
        <!--
          链接行不要再用 underline：下划线（文字宽度）+ divide-y 分隔线（整格宽度）
          会形成两条长短不一的横线，看起来像边框错乱。这里只保留分隔线做视觉分隔。
        -->
        <ul class="flex flex-col divide-y divide-stroke mt-4">
          <li v-for="link in block.links" :key="link.link" class="py-2.5 first:pt-0 last:pb-0">
            <a
              :href="withBase(link.link)"
              class="group flex items-center justify-between gap-3 text-base text-primary hover:text-[var(--color-brand)] transition-colors"
            >
              <span>{{ link.text }}</span>
              <span
                aria-hidden="true"
                class="text-grey group-hover:translate-x-0.5 transition-transform"
              >
                →
              </span>
            </a>
          </li>
        </ul>
        <a :href="withBase(block.action.link)" class="button button--sm w-fit mt-4">
          {{ block.action.text }}
        </a>
      </div>
    </section>

    <!-- 7. 深色能力展示区（home/HeadingSection4 + FeatureToolbar + Feature* 面板） -->
    <section id="features" data-theme="dark" class="bg-primary">
      <section
        class="wrapper wrapper--ticks border-t px-5 sm:px-10 h-70 sm:h-[22rem] flex flex-col justify-center gap-6 text-center items-center"
      >
        <h2 class="text-white">一款手册覆盖日常所需</h2>
        <p class="max-w-md text-white/70 text-balance sm:text-pretty">
          五个分类、二十篇主题文档，从语言基础到工程化与职业成长，按需跳转即可。
        </p>
      </section>

      <FeatureToolbar />

      <FeaturePanel v-for="panel in featurePanels" :key="panel.id" :panel="panel" />
    </section>

    <!-- 8. 收尾大标题（home/HeadingSection3.vue） -->
    <section
      class="wrapper border-t px-5 sm:px-10 h-70 sm:h-80 flex flex-col justify-center gap-5"
    >
      <h3>前端知识，一处可查</h3>
      <p class="max-w-md text-pretty">
        从语言基础到框架规范、从工程化配置到跨端适配，全部按主题整理，支持全文检索与离线保存。
      </p>
    </section>

    <!-- 9. 内容地图（home/HeroRive.vue 的位置） -->
    <ClosingIllustration />
  </div>
</template>
