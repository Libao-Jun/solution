<script setup lang="ts">
/**
 * 能力展示面板，对应参考站 home/Feature{DevBuild,Check,Test,Run,Pack}.vue：
 * 左列：mono 小标题 + h4 + 描述 + checkmark-list + 收录说明；
 * 右列：渐变视觉 + 深色代码窗（rounded-tl rounded-bl + outline 双层边框）。
 *
 * 动效（GSAP，见 ../animations/motion.ts）：进入视口后按
 * 文案 → 清单 → 代码窗（从右侧滑入，被 .visual 的 overflow-clip 裁成「揭幕」）→ 代码行
 * 的顺序串成一条时间线，五个面板各自独立触发。
 */
import { withBase } from 'vitepress'
import { ref } from 'vue'

import { useMotion } from '../animations/motion'
import type { FeaturePanel } from '../data/features'
import { terminalToneClass } from '../data/terminal'

defineProps<{ panel: FeaturePanel }>()

const root = ref<HTMLElement | null>(null)

useMotion(root, ({ gsap }, element) => {
  const copy = gsap.utils.toArray<HTMLElement>('[data-panel-copy] > *', element)
  const bullets = gsap.utils.toArray<HTMLElement>('[data-panel-bullets] > *', element)
  const meta = element.querySelector<HTMLElement>('[data-panel-meta]')
  const codeWindow = element.querySelector<HTMLElement>('[data-panel-window]')
  const lines = gsap.utils.toArray<HTMLElement>('[data-panel-line]', element)

  /* 起始态 set、终值 to（不要用 from：from 的终值靠回读当前值，会被别的动画/过渡带偏） */
  if (copy.length) {
    gsap.set(copy, { autoAlpha: 0, y: 22 })
  }
  if (bullets.length) {
    gsap.set(bullets, { autoAlpha: 0, x: -18 })
  }
  if (meta) {
    gsap.set(meta, { autoAlpha: 0, y: 12 })
  }
  if (codeWindow) {
    gsap.set(codeWindow, { autoAlpha: 0, x: 48 })
  }
  if (lines.length) {
    gsap.set(lines, { autoAlpha: 0, y: 10 })
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: element, start: 'top 78%', once: true },
  })

  if (copy.length) {
    timeline.to(copy, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0)
  }
  if (bullets.length) {
    timeline.to(bullets, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.06 }, '-=0.4')
  }
  if (meta) {
    timeline.to(meta, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.3')
  }
  if (codeWindow) {
    timeline.to(codeWindow, { autoAlpha: 1, x: 0, duration: 0.8 }, 0.15)
  }
  if (lines.length) {
    timeline.to(lines, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06 }, '-=0.5')
  }
})
</script>

<template>
  <section
    ref="root"
    data-motion-scope
    :id="panel.id"
    class="wrapper border-t grid md:grid-cols-2 md:divide-x divide-nickel"
  >
    <div class="px-5 py-6 md:p-10 flex flex-col justify-between gap-15">
      <div data-panel-copy class="flex flex-col gap-5">
        <span class="text-grey text-xs font-mono uppercase tracking-wide">{{ panel.eyebrow }}</span>
        <h4 class="text-white text-balance">{{ panel.title }}</h4>
        <p class="text-white/70 text-base max-w-[25rem] text-pretty">{{ panel.description }}</p>
        <ul data-panel-bullets class="checkmark-list">
          <li v-for="bullet in panel.bullets" :key="bullet.text">
            <a :href="withBase(bullet.link)" class="block hover:opacity-80 transition-opacity">
              <span class="text-white">{{ bullet.text }}</span>
              <span v-if="bullet.detail" class="block text-sm leading-snug text-grey">
                {{ bullet.detail }}
              </span>
            </a>
          </li>
        </ul>
      </div>
      <div data-panel-meta class="px-3 py-1.5 bg-slate rounded w-fit flex gap-2 items-center">
        <span class="text-grey text-sm font-mono">{{ panel.meta }}</span>
      </div>
    </div>

    <div class="flex flex-col min-h-[22rem] sm:min-h-[30rem]">
      <div
        class="visual h-full pl-5 sm:pl-10 flex flex-col justify-center overflow-clip"
        :class="`visual-${panel.tone}`"
      >
        <div
          data-panel-window
          class="mr-5 sm:mr-10 px-5 py-6 relative bg-slate rounded-tl rounded-bl outline-1 outline-offset-[2px] outline-white/20 font-mono text-sm leading-[1.5rem] text-white"
        >
          <div data-panel-line class="text-white">{{ panel.command }}</div>
          <div class="h-4" />
          <div
            v-for="(line, index) in panel.lines"
            :key="index"
            data-panel-line
            :class="terminalToneClass(line.tone)"
          >
            {{ line.text || '\u00A0' }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
