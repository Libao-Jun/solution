<script setup lang="ts">
/**
 * 能力展示区工具栏，对应参考站 docs/.vitepress/theme/components/home/FeatureToolbar.vue：
 * 5 个标签、吸顶、点击平滑滚动到对应面板、底部白色指示条跟随当前激活面板。
 *
 * ★ 标签栏有两种排布，指示条几何必须两种都吃得下（详见 updateUnderline）：
 *   · ≥640px（`sm:grid-cols-5`）：5 等分栅格，格子宽度与字体无关；
 *   · <640px：横向可滚动的 flex，每个标签按内容自适应宽度（宽度会随字体 / 缩放变化）。
 *   ★ 窄屏的横向溢出还会带出滚动条，已由 styles.css 的 `.feature-toolbar-list` 隐藏（勿回退）。
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { revealOnScroll, useMotion } from '../animations/motion'
import { featurePanels } from '../data/features'

const root = ref<HTMLElement | null>(null)

// 工具栏首次进入视口时，5 个标签依次落位（指示条仍由 scroll 驱动的既有逻辑负责）
useMotion(root, (tools, element) =>
  revealOnScroll(tools, element, { distance: 10, stagger: 0.055, start: 'top 94%' }),
)

const activeSection = ref(featurePanels[0].id)
const underlineStyle = ref({ left: '0px', width: '0px' })
const listItems = ref<HTMLElement[]>([])
const listRef = ref<HTMLElement | null>(null)

let frame: number | null = null
let resizeObserver: ResizeObserver | null = null

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

/**
 * 指示条几何：`offsetLeft / offsetWidth` 是「标签栏内容坐标」，不受标签栏横向滚动影响，
 * 可以直接喂给绝对定位的指示条。
 *
 * ★ 必须能「事后重算」，不能只在挂载时量一次：<640px 时标签是内容自适应宽度
 *   （桌面是等宽栅格，同样的变化看不出来），任何改变标签宽度的因素——字体换上来、
 *   浏览器缩放、容器宽度变化、标签文案调整——都会让旧宽度失效，指示条就会与标签对不齐。
 *   因此除 scroll / resize 外，再挂 `document.fonts.ready` 与 ResizeObserver。
 */
const updateUnderline = () => {
  const index = featurePanels.findIndex((item) => item.id === activeSection.value)
  const item = listItems.value[index]
  if (!item) {
    return
  }
  underlineStyle.value = { left: `${item.offsetLeft}px`, width: `${item.offsetWidth}px` }
}

/** 布局可能变了：下一帧重算指示条几何（不与 scroll 的激活项判定抢，只改几何） */
const measure = () => {
  requestAnimationFrame(updateUnderline)
}

/**
 * 把当前激活标签带进可视区：窄屏标签栏会横向溢出（5 个标签总宽 > 视口），
 * 若激活标签停在视口外，白色指示条就「看不到 / 对不上」——所以跟着激活项横向对齐。
 * 只在激活项变化时调用（不能在每帧 scroll 里调，否则会跟用户的手动滚动打架）。
 */
const ensureActiveVisible = () => {
  const list = listRef.value
  const item = listItems.value[featurePanels.findIndex((entry) => entry.id === activeSection.value)]
  if (!list || !item || list.scrollWidth <= list.clientWidth) {
    return
  }
  const viewLeft = list.scrollLeft
  const viewRight = viewLeft + list.clientWidth
  if (item.offsetLeft < viewLeft) {
    list.scrollLeft = item.offsetLeft
  } else if (item.offsetLeft + item.offsetWidth > viewRight) {
    list.scrollLeft = item.offsetLeft + item.offsetWidth - list.clientWidth
  }
}

// 激活项一换（点击 / 滚动切换）就重新量一次，并把该标签带进可视区
watch(activeSection, () => {
  updateUnderline()
  ensureActiveVisible()
})

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
  window.addEventListener('resize', measure)
  requestAnimationFrame(() => {
    updateUnderline()
    handleScroll()
  })

  // 字体就绪后标签宽度才是最终值（移动端标签按内容自适应）→ 必须重算一次，别删
  void document.fonts?.ready.then(measure)

  // 任何尺寸变化（字体、缩放、容器宽度变化）都要重算：同时观察标签栏与每一个标签
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(measure)
    if (listRef.value) {
      resizeObserver.observe(listRef.value)
    }
    listItems.value.forEach((item) => resizeObserver?.observe(item))
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', measure)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (frame !== null) {
    cancelAnimationFrame(frame)
  }
})
</script>

<template>
  <div class="wrapper wrapper--ticks border-t w-full relative z-20"></div>
  <section
    ref="root"
    data-motion-scope
    class="wrapper sticky top-0 border-b bg-primary z-10 overflow-hidden"
  >
    <ul
      ref="listRef"
      class="feature-toolbar-list w-full sm:grid sm:grid-cols-5 flex items-center divide-x divide-nickel relative overflow-x-auto touch-none sm:touch-auto select-none sm:select-auto"
    >
      <div class="feature-toolbar-underline" :style="underlineStyle" />
      <li
        v-for="panel in featurePanels"
        :key="panel.id"
        ref="listItems"
        data-reveal
        class="flex-shrink-0"
      >
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
