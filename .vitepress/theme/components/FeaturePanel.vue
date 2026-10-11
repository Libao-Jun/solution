<script setup lang="ts">
/**
 * 能力展示面板，对应参考站 home/Feature{DevBuild,Check,Test,Run,Pack}.vue：
 * 左列：mono 小标题 + h4 + 描述 + checkmark-list + 收录说明；
 * 右列：渐变视觉 + 深色代码窗（rounded-tl rounded-bl + outline 双层边框）。
 */
import type { FeaturePanel } from '../data/features'
import { terminalToneClass } from '../data/terminal'

defineProps<{ panel: FeaturePanel }>()
</script>

<template>
  <section :id="panel.id" class="wrapper border-t grid md:grid-cols-2 md:divide-x divide-nickel">
    <div class="px-5 py-6 md:p-10 flex flex-col justify-between gap-15">
      <div class="flex flex-col gap-5">
        <span class="text-grey text-xs font-mono uppercase tracking-wide">{{ panel.eyebrow }}</span>
        <h4 class="text-white text-balance">{{ panel.title }}</h4>
        <p class="text-white/70 text-base max-w-[25rem] text-pretty">{{ panel.description }}</p>
        <ul class="checkmark-list">
          <li v-for="bullet in panel.bullets" :key="bullet.text">
            <a :href="bullet.link" class="block hover:opacity-80 transition-opacity">
              <span class="text-white">{{ bullet.text }}</span>
              <span v-if="bullet.detail" class="block text-sm leading-snug text-grey">
                {{ bullet.detail }}
              </span>
            </a>
          </li>
        </ul>
      </div>
      <div class="px-3 py-1.5 bg-slate rounded w-fit flex gap-2 items-center">
        <span class="text-grey text-sm font-mono">{{ panel.meta }}</span>
      </div>
    </div>

    <div class="flex flex-col min-h-[22rem] sm:min-h-[30rem]">
      <div
        class="visual h-full pl-5 sm:pl-10 flex flex-col justify-center overflow-clip"
        :class="`visual-${panel.tone}`"
      >
        <div
          class="mr-5 sm:mr-10 px-5 py-6 relative bg-slate rounded-tl rounded-bl outline-1 outline-offset-[2px] outline-white/20 font-mono text-sm leading-[1.5rem] text-white"
        >
          <div class="text-white">{{ panel.command }}</div>
          <div class="h-4" />
          <div v-for="(line, index) in panel.lines" :key="index" :class="terminalToneClass(line.tone)">
            {{ line.text || '\u00A0' }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
