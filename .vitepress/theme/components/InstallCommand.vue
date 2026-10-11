<script setup lang="ts">
/**
 * 首页「快速开始」，对应参考站 home/InstallCommand.vue：
 * 左侧说明 + 右侧深色命令卡（mono 大写标签 / 命令 / 复制按钮）。
 */
import { withBase } from 'vitepress'
import { onBeforeUnmount, ref } from 'vue'

import { installCommandCards } from '../data/features'

const copiedId = ref<string | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const flashCopied = (id: string) => {
  copiedId.value = id
  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }
  copiedTimer = setTimeout(() => {
    copiedId.value = null
    copiedTimer = null
  }, 1600)
}

const copyCommand = async (id: string, command: string) => {
  try {
    await navigator.clipboard.writeText(command)
    flashCopied(id)
  } catch {
    // 剪贴板不可用时静默忽略
  }
}

onBeforeUnmount(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }
})
</script>

<template>
  <section
    class="wrapper border-t grid lg:grid-cols-[0.9fr_1.1fr] divide-y lg:divide-y-0 lg:divide-x divide-stroke dark:divide-nickel"
  >
    <div class="px-5 py-6 sm:p-10 flex flex-col gap-4 justify-center">
      <span class="text-grey text-xs font-mono uppercase tracking-wide">快速开始</span>
      <h4>两条命令跑起来</h4>
      <p class="max-w-[28rem] text-pretty">
        命令取自仓库中的 React 开发规范与 TypeScript 指南，可直接复制到终端执行。
      </p>
      <p class="text-sm text-grey">
        想先看规范？
        <a
          class="text-primary underline decoration-stroke underline-offset-4"
          :href="withBase('/frameworks/react/')"
        >
          前往 React 开发规范
        </a>
        。
      </p>
    </div>
    <div class="px-5 py-6 sm:p-10 grid gap-4">
      <div
        v-for="card in installCommandCards"
        :key="card.id"
        class="rounded-xl bg-primary text-white p-5 outline outline-white/10 transition-colors hover:bg-[#1a1a1a]"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="text-grey text-xs font-mono uppercase tracking-wide">{{ card.label }}</div>
            <div class="mt-3 block overflow-x-auto whitespace-nowrap font-mono text-white">
              {{ card.command }}
            </div>
          </div>
          <button
            type="button"
            class="shrink-0 inline-flex items-center gap-2 rounded-md border border-white/12 px-3 py-2 text-sm text-grey transition-colors hover:text-white hover:border-white/25"
            :aria-label="`复制命令：${card.label}`"
            @click="copyCommand(card.id, card.command)"
          >
            <svg
              v-if="copiedId !== card.id"
              class="size-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" />
              <path d="M10.5 3.5v-1a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h1" />
            </svg>
            <svg
              v-else
              class="size-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M2.5 8.5 6 12l7.5-8" />
            </svg>
            <span>{{ copiedId === card.id ? '已复制' : '复制' }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
