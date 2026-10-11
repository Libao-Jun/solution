<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { commandTranscripts } from '../data/terminal'
import TerminalTranscript from './TerminalTranscript.vue'

const AUTO_ADVANCE_DELAY = 1500

const activeTab = ref(commandTranscripts[0].id)
const autoPlayEnabled = ref(true)
let autoAdvanceTimeout: ReturnType<typeof setTimeout> | null = null

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const tabSequence = commandTranscripts.map((transcript) => transcript.id)

const activeTranscript = computed(
  () => commandTranscripts.find((item) => item.id === activeTab.value) ?? commandTranscripts[0],
)

const goToNextTab = () => {
  const currentIndex = tabSequence.indexOf(activeTab.value)
  const nextIndex = (currentIndex + 1) % tabSequence.length
  activeTab.value = tabSequence[nextIndex]
}

const onComplete = () => {
  if (!autoPlayEnabled.value) {
    return
  }
  if (autoAdvanceTimeout) {
    clearTimeout(autoAdvanceTimeout)
  }
  autoAdvanceTimeout = setTimeout(() => {
    goToNextTab()
  }, AUTO_ADVANCE_DELAY)
}

/** 用户点过标签页后停止自动轮播 */
const onTabChange = () => {
  autoPlayEnabled.value = false
  if (autoAdvanceTimeout) {
    clearTimeout(autoAdvanceTimeout)
    autoAdvanceTimeout = null
  }
}

onMounted(() => {
  if (!sectionRef.value) {
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isVisible.value) {
          isVisible.value = true
          observer?.disconnect()
        }
      })
    },
    { threshold: 0.2, rootMargin: '0px' },
  )
  observer.observe(sectionRef.value)
})

onUnmounted(() => {
  if (autoAdvanceTimeout) {
    clearTimeout(autoAdvanceTimeout)
  }
  observer?.disconnect()
})
</script>

<template>
  <section
    ref="sectionRef"
    class="wrapper border-t h-[40rem] bg-wine terminal-background bg-cover bg-top flex justify-center pt-6 md:pt-28 px-3 md:px-0 overflow-clip relative"
  >
    <div
      :class="[
        'self-stretch px-4 sm:px-8 py-5 sm:py-7 relative bg-[#111] rounded-tl-lg rounded-tr-lg inline-flex flex-col justify-start items-start gap-2 overflow-hidden w-full max-w-[62rem] outline-1 outline-offset-[3px] outline-white/30',
        'transition-transform duration-1000',
        isVisible ? 'translate-y-0' : 'translate-y-24',
      ]"
      style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
    >
      <TabsRoot v-if="isVisible" v-model="activeTab" @update:modelValue="onTabChange">
        <div class="w-full">
          <TerminalTranscript
            :key="activeTranscript.id"
            :transcript="activeTranscript"
            @complete="onComplete"
          />
        </div>
        <TabsList
          aria-label="commands"
          :class="[
            'absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center p-1 rounded-md border border-white/10',
            'transition-transform duration-700 delay-300',
            isVisible ? 'translate-y-0' : 'translate-y-12',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <TabsTrigger v-for="item in commandTranscripts" :key="item.id" :value="item.id">
            {{ item.label }}
          </TabsTrigger>
        </TabsList>
      </TabsRoot>
    </div>
  </section>
</template>
