<script setup lang="ts">
import {
  categories,
  categoryCount,
  docCount,
  growthBlocks,
  highlights,
  roadmapCount,
  statRows,
  topicGroups,
} from '../data/topics'

import TerminalPanel from './TerminalPanel.vue'

/**
 * 网格边框约定（务必保持）：
 * - 只有「单元格数量能整除列数」的网格才用边框网格（3 格 3 列、4 格 2×2、2 格 2 列）。
 * - 竖直方向永远是单列列表，所以 divide-y 一定正确。
 * - 横向每行都补 `divide-x-0 <bp>:divide-x`，避免窄屏堆叠时多出左边框。
 */
</script>

<template>
  <div class="home">
    <!-- 1. Hero（对应参考站 home/Hero.vue） -->
    <section class="wrapper flex flex-col justify-start items-center gap-6 pt-14 pb-6">
      <div class="w-full sm:w-2xl flex flex-col justify-start items-center gap-10 px-5 sm:px-0">
        <div class="flex flex-col justify-start items-center gap-4">
          <img src="/icon.svg" alt="Solution" class="w-9" />
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
          <a href="/fundamentals/html5/" class="button button--primary"> 开始阅读 </a>
          <a href="/roadmaps/" class="button"> 查看学习路线 </a>
        </div>
      </div>
    </section>

    <!-- 2. 命令速查终端（对应参考站 home/Terminal.vue） -->
    <TerminalPanel />

    <!-- 3. 三大分类：3 格 / 3 列（对应参考站 home/CoreFeature3Col.vue） -->
    <section
      class="wrapper border-t grid grid-rows-3 lg:grid-rows-1 lg:grid-cols-3 lg:h-80 divide-x-0 lg:divide-x divide-y lg:divide-y-0 divide-stroke dark:divide-nickel"
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
          <a v-for="chip in category.chips" :key="chip.link" :href="chip.link">
            <code>{{ chip.text }}</code>
          </a>
        </div>
      </div>
    </section>

    <!-- 4. 全部文档索引：4 格 / 2×2（对应参考站 home/ProductivityGrid.vue） -->
    <section
      class="wrapper wrapper--ticks border-t grid lg:grid-cols-2 divide-x-0 lg:divide-x divide-y divide-stroke dark:divide-nickel"
    >
      <div
        v-for="group in topicGroups"
        :key="group.eyebrow"
        class="p-5 sm:p-10 flex flex-col gap-3"
      >
        <span class="text-grey text-xs font-mono uppercase tracking-wide">
          {{ group.eyebrow }}
        </span>
        <ul class="mt-2 -mx-5 sm:mx-0 divide-y divide-stroke dark:divide-nickel">
          <li v-for="topic in group.topics" :key="topic.link">
            <a
              :href="topic.link"
              class="group flex flex-col gap-1 py-4 -mx-5 px-5 sm:mx-0 sm:px-0 hover:bg-beige transition-colors"
            >
              <span class="text-base sm:text-lg font-medium text-primary text-balance">
                {{ topic.title }}
              </span>
              <span class="text-sm leading-snug text-grey text-pretty">{{ topic.details }}</span>
            </a>
          </li>
        </ul>
      </div>
    </section>

    <!-- 5. 深色区块：标题 + 勾选清单 + 内容概览（对应参考站 home/HeadingSection4.vue） -->
    <section id="highlights" data-theme="dark" class="bg-primary">
      <section
        class="wrapper wrapper--ticks border-t border-nickel px-5 sm:px-10 h-70 sm:h-[22rem] flex flex-col justify-center gap-6 text-center items-center"
      >
        <h2 class="text-white">把散落的前端知识，整理成可检索的手册</h2>
        <p class="max-w-md text-white/70 text-balance sm:text-pretty">
          不写教程连载，只把日常开发里最容易踩坑、最容易忘记的知识点按主题归档。
        </p>
      </section>

      <section
        class="wrapper border-t border-nickel grid lg:grid-cols-2 divide-x-0 lg:divide-x divide-y lg:divide-y-0 divide-nickel"
      >
        <div class="p-5 sm:p-10 flex flex-col gap-4">
          <h5 class="text-white">站点怎么用</h5>
          <ul class="checkmark-list">
            <li v-for="item in highlights" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="p-5 sm:p-10 flex flex-col gap-4">
          <h5 class="text-white">内容概览</h5>
          <!-- 每行 2 项 → divide-x 正确；行与行之间是单列 → divide-y 正确 -->
          <div class="flex flex-col divide-y divide-nickel mt-1">
            <div
              v-for="(row, rowIndex) in statRows"
              :key="rowIndex"
              class="grid grid-cols-2 divide-x divide-nickel py-5 first:pt-0 last:pb-0"
            >
              <div
                v-for="(item, itemIndex) in row"
                :key="item.label"
                class="flex flex-col gap-1"
                :class="itemIndex === 0 ? 'pr-5' : 'pl-5'"
              >
                <p class="text-white font-medium text-base sm:text-xl">{{ item.value }}</p>
                <p class="leading-tight text-base text-white/70">{{ item.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>

    <!-- 6. 收尾大标题（对应参考站 home/HeadingSection3.vue） -->
    <section class="wrapper border-t border-stroke dark:border-nickel px-5 sm:px-10 h-70 sm:h-80 flex flex-col justify-center gap-5">
      <h3>前端知识，一处可查</h3>
      <p class="max-w-md text-pretty">
        从语言基础到框架规范、从工程化配置到跨端适配，全部按主题整理，支持全文检索与离线保存。
      </p>
    </section>

    <!-- 7. 资料补充：2 格 / 2 列（对应参考站 home/Fullstack2Col.vue） -->
    <section
      class="wrapper wrapper--ticks border-t grid lg:grid-cols-2 divide-x-0 lg:divide-x divide-y lg:divide-y-0 divide-stroke dark:divide-nickel"
    >
      <div
        v-for="block in growthBlocks"
        :key="block.title"
        class="p-5 sm:p-10 flex flex-col gap-3 justify-between"
      >
        <div class="flex flex-col gap-3">
          <h6>{{ block.title }}</h6>
          <p class="max-w-[22rem] text-balance">{{ block.details }}</p>
        </div>
        <ul class="flex flex-col gap-2 mt-6 divide-y divide-stroke dark:divide-nickel">
          <li v-for="link in block.links" :key="link.link" class="pt-2 first:pt-0">
            <a
              :href="link.link"
              class="text-base text-primary underline decoration-stroke underline-offset-4 hover:decoration-primary"
            >
              {{ link.text }}
            </a>
          </li>
        </ul>
        <a :href="block.action.link" class="button button--sm w-fit mt-4">
          {{ block.action.text }}
        </a>
      </div>
    </section>

    <!-- 8. 留白收尾（对应参考站 shared/Spacer.vue） -->
    <section class="wrapper wrapper--ticks border-t h-16 sm:h-30"></section>
  </div>
</template>
