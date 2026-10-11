<script setup lang="ts">
/**
 * 能力展示区工具栏，对应参考站 docs/.vitepress/theme/components/home/FeatureToolbar.vue：
 * 5 个等宽标签、吸顶、点击平滑滚动到对应面板、底部白色指示条跟随当前可见面板。
 */
import { onMounted, onUnmounted, ref } from 'vue'

import { featurePanels } from '../data/features'

const activeSection = ref(featurePanels[0].id)
const underlineStyle = ref({ left: '0px', width: '0px' })
const listItems = ref<HTMLElement[]>([])

let frame: number | null = null

const scrollToSection = (event: MouseEvent, id: string) => {
  event.preventDefault()
  const element = document.getElementById(id)
  if (!element) {
    return
  }
  const toolbar = (event.currentTarget as HTMLElement).closest('section')
  const toolbarHeight = toolbar?.offsetHeight ?? 0
  const offsetPosition = element.getBoundingClientRect().top + window.scrollY - toolbarHeight
  window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
}

const updateUnderline = () => {
  const index = featurePanels.findIndex((item) => item.id === activeSection.value)
  const item = listItems.value[index]
  if (!item) {
    return
  }
  underlineStyle.value = { left: `${item.offsetLeft}px`, width: `${item.offsetWidth}px` }
}

const handleScroll = () => {
  if (frame !== null) {
    return
  }
  frame = requestAnimationFrame(() => {
    frame = null
    const threshold = window.innerHeight * 0.35
    let current = featurePanels[0].id
    for (const panel of featurePanels) {
      const element = document.getElementById(panel.id)
      if (element && element.getBoundingClientRect().top <= threshold) {
        current = panel.id
      }
    }
    if (current !== activeSection.value) {
      activeSection.value = current
    }
    updateUnderline()
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updateUnderline)
  requestAnimationFrame(() => {
    updateUnderline()
    handleScroll()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateUnderline)
  if (frame !== null) {
    cancelAnimationFrame(frame)
  }
})
</script>

<template>
  <div class="wrapper wrapper--ticks border-t w-full relative z-20"></div>
  <section class="wrapper sticky top-0 border-b bg-primary z-10 overflow-hidden">
    <ul
      class="w-full sm:grid sm:grid-cols-5 flex items-center divide-x divide-nickel relative overflow-x-auto touch-none sm:touch-auto select-none sm:select-auto"
    >
      <div class="feature-toolbar-underline" :style="underlineStyle" />
      <li v-for="panel in featurePanels" :key="panel.id" ref="listItems" class="flex-shrink-0">
        <a
          :href="`#${panel.id}`"
          class="h-full text-sm font-mono tracking-tight py-4 px-6 sm:px-0 flex justify-center items-center gap-1.5 transition-colors duration-200 whitespace-nowrap"
          :class="activeSection === panel.id ? 'text-white' : 'text-grey'"
          @click="scrollToSection($event, panel.id)"
        >
          <svg
            class="w-4 shrink-0"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path v-for="(d, index) in panel.icon" :key="index" :d="d" />
          </svg>
          <span>{{ panel.label }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>
