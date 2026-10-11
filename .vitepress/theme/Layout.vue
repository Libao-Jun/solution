<script setup lang="ts">
import OSSHeader from '@components/oss/Header.vue'
import { VoidZeroTheme } from '@voidzero-dev/vitepress-theme'
import { useData } from 'vitepress'
import { nextTick, onUnmounted, watch } from 'vue'

import Home from './components/Home.vue'
import SiteFooter from './components/SiteFooter.vue'

const { frontmatter, isDark } = useData()
const BaseLayout = VoidZeroTheme.Layout

let homeHeaderObserver: MutationObserver | null = null

/**
 * 首页为营销布局（浅色），需要在运行时同步 data-theme，避免用户系统深色偏好影响首屏。
 */
const syncHeaderMobileMenuTheme = (header: HTMLElement | null, isHome: boolean) => {
  const mobileMenu = header?.querySelector<HTMLElement>('#mobile-menu')
  if (!mobileMenu) {
    return
  }
  if (isHome) {
    mobileMenu.setAttribute('data-theme', 'light')
  } else {
    mobileMenu.removeAttribute('data-theme')
  }
}

const setupHomeHeaderObserver = (header: HTMLElement | null, isHome: boolean) => {
  homeHeaderObserver?.disconnect()
  homeHeaderObserver = null

  if (!header || !isHome || typeof MutationObserver === 'undefined') {
    return
  }

  homeHeaderObserver = new MutationObserver(() => {
    syncHeaderMobileMenuTheme(header, isHome)
  })
  homeHeaderObserver.observe(header, { childList: true, subtree: true })
}

const syncHomeThemeOverride = async () => {
  if (typeof document === 'undefined') {
    return
  }

  const isHome = frontmatter.value?.layout === 'home'
  const root = document.documentElement

  if (isHome) {
    root.setAttribute('data-theme', 'light')
  } else {
    root.removeAttribute('data-theme')
  }

  await nextTick()

  const header = document.querySelector<HTMLElement>('.home-header') as HTMLElement | null

  setupHomeHeaderObserver(header, isHome)

  if (!header) {
    return
  }
  if (isHome) {
    header.setAttribute('data-theme', 'light')
  } else {
    header.removeAttribute('data-theme')
  }
  syncHeaderMobileMenuTheme(header, isHome)
}

watch(
  [() => frontmatter.value?.layout, () => isDark.value],
  () => {
    void syncHomeThemeOverride()
  },
  { immediate: true },
)

onUnmounted(() => {
  homeHeaderObserver?.disconnect()
  homeHeaderObserver = null
})
</script>

<template>
  <div v-if="frontmatter.layout === 'home'" class="marketing-layout">
    <OSSHeader class="home-header" />
    <Home />
    <SiteFooter />
  </div>
  <BaseLayout v-else />
</template>
