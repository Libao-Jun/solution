<script setup lang="ts">
/**
 * 首页「技术栈覆盖」面板（对应参考站 home/HeroRive.vue 的视觉位置）。
 * 2026-10 重构：等距 3D 示意图 → 数据驱动的深色科技风 Bento 面板。
 *
 * ★ 为什么放弃等距图：旧实现的 22 个方块全部是手工等距坐标
 *   （railDefs / ROW_FROM / 底部两排还有容量上限），且短名映射硬编码——
 *   每新增一篇文档都要手调几何。新布局中分类卡片与文档芯片完全由
 *   ../data/topics.ts 的 categories / growthBlocks 驱动、芯片 flex-wrap 自动换行，
 *   **新增文档只需在 topics.ts 加一条 chip，本组件零改动**。
 *
 * ★ 版式：深色面板铺满 wrapper（无内边距、无圆角，与收尾的内容地图同一套设计语言）；
 *   Bento 网格 6 列：第一行 3 卡各占 2 列、第二行 2 卡各占 3 列（每行都整除，外框由
 *   section 的 border-t 延续）；卡内芯片是 flex-wrap 的链接组，不使用共享 divide 边框。
 *
 * 动效约定（见 ../animations/motion.ts）：
 * - 入场由一条 GSAP 时间线编排（ScrollTrigger 一次性触发）：背景网格/光晕淡入 →
 *   扫描线自上而下扫过一遍（一次性，非常驻循环）→ 标题组错落上浮 →
 *   卡片依次上浮 + 边框「通电」闪光回落 → 芯片弹性 pop → 计数徽标数字滚动；
 * - 内容元素的起点一律由 JS 侧 gsap.set() 生成，绝不用 CSS 先隐藏——
 *   JS / GSAP 失败时页面仍是完整静态内容；唯一 CSS 默认透明的是纯装饰扫描线；
 * - 动画结束的卡片 / 芯片 / 标题都 clearProps 掉 transform，计数徽标走对象补间不碰 DOM 结构，
 *   悬停反馈因此可以只改 color / border / background（paint 属性），不与 GSAP 抢；
 * - 常驻循环只有顶部「数据流」光带，走 CSS 且包在 prefers-reduced-motion: no-preference 里。
 */
import { withBase } from 'vitepress'
import { ref } from 'vue'

import { useMotion } from '../animations/motion'
import { categories, categoryCount, growthBlocks } from '../data/topics'

const root = ref<HTMLElement | null>(null)

useMotion(root, ({ gsap }, element) => {
  const panel = element.querySelector<HTMLElement>('[data-tech-panel]')
  const scan = element.querySelector<HTMLElement>('.tech-scan')
  const grid = element.querySelector<HTMLElement>('.tech-grid')
  const glow = element.querySelector<HTMLElement>('.tech-glow')
  const headerEls = gsap.utils.toArray<HTMLElement>('[data-tech-header] > *', element)
  const cardEls = gsap.utils.toArray<HTMLElement>('.tech-card', element)
  const chipEls = gsap.utils.toArray<HTMLElement>('.tech-chip', element)
  const countEls = gsap.utils.toArray<HTMLElement>('.tech-count', element)

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: element, start: 'top 78%', once: true },
  })

  /* 背景层：网格淡入 + 光晕自小放大淡入（纯装饰，不承载内容） */
  if (grid) {
    gsap.set(grid, { opacity: 0 })
    timeline.to(grid, { opacity: 1, duration: 1 }, 0)
  }
  if (glow) {
    gsap.set(glow, { autoAlpha: 0, scale: 0.85 })
    timeline.to(glow, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 0)
  }

  /* 扫描线：一次性自上而下扫过（装饰元素 CSS 默认透明，不承载内容） */
  if (panel && scan) {
    gsap.set(scan, { y: 0 })
    timeline.set(scan, { autoAlpha: 0.85 }, 0.2)
    timeline.to(scan, { y: panel.offsetHeight, duration: 1, ease: 'power2.inOut' }, 0.2)
    timeline.to(scan, { autoAlpha: 0, duration: 0.35 }, 0.9)
  }

  /* 标题组：错落上浮 */
  gsap.set(headerEls, { autoAlpha: 0, y: 18 })
  timeline.to(
    headerEls,
    { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.09, clearProps: 'transform' },
    0.15,
  )

  /* 卡片：依次上浮入场，随后边框「通电」闪光回落（keyframes + stagger 逐卡错开） */
  gsap.set(cardEls, { autoAlpha: 0, y: 34, scale: 0.96 })
  timeline.to(
    cardEls,
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.75,
      stagger: 0.12,
      clearProps: 'transform',
    },
    0.4,
  )
  timeline.to(
    cardEls,
    {
      keyframes: [
        { borderColor: 'rgba(167, 139, 250, 0.85)', duration: 0.18 },
        { borderColor: 'rgba(255, 255, 255, 0.1)', duration: 0.5 },
      ],
      stagger: 0.12,
      clearProps: 'borderColor',
    },
    0.65,
  )

  /* 芯片：弹性 pop（DOM 顺序天然形成「逐卡瀑布」） */
  gsap.set(chipEls, { autoAlpha: 0, y: 10, scale: 0.85 })
  timeline.to(
    chipEls,
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(1.7)',
      stagger: 0.025,
      clearProps: 'transform',
    },
    0.75,
  )

  /* 右上角计数徽标：数字滚动（对象补间 + onUpdate 回填，保留「篇 / 组」后缀） */
  countEls.forEach((el, index) => {
    const match = (el.textContent ?? '').trim().match(/^(\d+)(.*)$/)
    if (!match) {
      return
    }
    const suffix = match[2]
    const state = { value: 0 }
    timeline.to(
      state,
      {
        value: Number(match[1]),
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${Math.round(state.value)}${suffix}`
        },
      },
      0.6 + index * 0.1,
    )
  })
})
</script>

<template>
  <section ref="root" data-motion-scope class="wrapper border-t">
    <!--
      面板恒深色、文字用固定色（不用 data-theme="dark"）：
      避免它改变本区块 border-t 的主题变量，与相邻浅色区块的横线颜色不一致。
    -->
    <div data-tech-panel class="relative overflow-hidden bg-[#12131d] ring-1 ring-white/10 ring-inset">
      <!-- 背景装饰：网格底纹（边缘淡出）+ 顶部光晕 + 顶部数据流光带 + 一次性扫描线 -->
      <div class="tech-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div
        class="tech-glow pointer-events-none absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2"
        aria-hidden="true"
      ></div>
      <div class="tech-beam pointer-events-none absolute top-0 left-0 h-px w-full" aria-hidden="true"></div>
      <div class="tech-scan pointer-events-none absolute inset-x-0 top-0" aria-hidden="true"></div>

      <div class="relative flex flex-col gap-8 px-5 py-10 sm:px-10 md:py-14">
        <!-- 区块标题 -->
        <header data-tech-header class="flex flex-col gap-2">
          <p class="text-sm font-mono text-[#a78bfa]">技术栈覆盖</p>
          <h3 class="text-balance text-white">五大分类，都是仓库里的一篇文档</h3>
          <p class="max-w-2xl text-pretty text-white/60">
            共 {{ categoryCount }} 大分类，按主题归档、随仓库同步扩充。点任意标签直达对应文档。
          </p>
        </header>

        <!-- Bento 网格：第一行 3 卡各 2 列、第二行 2 卡各 3 列（每行整除 6 列） -->
        <div class="grid gap-3 lg:grid-cols-6">
          <!-- 内容分类（Web 基础 / 框架与端 / 工程化与适配） -->
          <article
            v-for="category in categories"
            :key="category.key"
            class="tech-card lg:col-span-2"
          >
            <div class="flex items-baseline justify-between gap-3">
              <h4 class="text-white">{{ category.title }}</h4>
              <span class="tech-count">{{ category.chips.length }} 篇</span>
            </div>
            <p class="text-sm text-pretty text-white/55">{{ category.details }}</p>
            <div class="mt-auto flex flex-wrap gap-2 pt-1">
              <a
                v-for="chip in category.chips"
                :key="chip.link"
                :href="withBase(chip.link)"
                class="tech-chip"
              >
                {{ chip.text }}
              </a>
            </div>
          </article>

          <!-- 学习路线 / 职业成长（数据来自 growthBlocks，链接含章节锚点） -->
          <article
            v-for="block in growthBlocks"
            :key="block.title"
            class="tech-card lg:col-span-3"
          >
            <div class="flex items-baseline justify-between gap-3">
              <h4 class="text-white">{{ block.title }}</h4>
              <span class="tech-count">{{ block.links.length }} 组</span>
            </div>
            <p class="text-sm text-pretty text-white/55">{{ block.details }}</p>
            <div class="mt-auto flex flex-wrap items-center gap-2 pt-1">
              <a
                v-for="link in block.links"
                :key="link.link"
                :href="withBase(link.link)"
                class="tech-chip"
              >
                {{ link.text }}
              </a>
              <a
                :href="withBase(block.action.link)"
                class="tech-chip tech-chip--accent"
              >
                {{ block.action.text }} →
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 网格底纹：26px 细网格 + 径向蒙版（边缘淡出，避免铺满全幅显得嘈杂） */
.tech-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%);
  mask-image: radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%);
}

/* 顶部中央的品牌色光晕 */
.tech-glow {
  background: radial-gradient(ellipse closest-side, rgba(108, 59, 255, 0.22), transparent);
}

/* 顶部「数据流」光带：常驻循环只在允许动效时开启 */
@media (prefers-reduced-motion: no-preference) {
  .tech-beam {
    background: linear-gradient(
      90deg,
      transparent 0%,
      #8b6bff 30%,
      #c4b5fd 50%,
      #8b6bff 70%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: tech-beam-flow 7s linear infinite;
  }
}

@keyframes tech-beam-flow {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

/* 一次性扫描线：CSS 默认透明（纯装饰不承载内容），入场时由 GSAP 自上而下扫过一遍 */
.tech-scan {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #8b6bff 25%,
    #e9e0ff 50%,
    #8b6bff 75%,
    transparent 100%
  );
  box-shadow:
    0 0 12px rgba(139, 107, 255, 0.8),
    0 0 36px rgba(139, 107, 255, 0.4);
  opacity: 0;
  visibility: hidden;
}

/* 分类卡：独立描边 + 间隙布局（非共享 divide 边框），悬停泛紫 + 对角刻度亮起 */
.tech-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  padding: 1.35rem 1.5rem;
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;
}

.tech-card::before,
.tech-card::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  transition: border-color 0.3s ease;
}

.tech-card::before {
  top: -1px;
  left: -1px;
  border-top: 1.5px solid transparent;
  border-left: 1.5px solid transparent;
}

.tech-card::after {
  bottom: -1px;
  right: -1px;
  border-bottom: 1.5px solid transparent;
  border-right: 1.5px solid transparent;
}

.tech-card:hover {
  border-color: rgba(139, 107, 255, 0.55);
  background: rgba(255, 255, 255, 0.05);
}

.tech-card:hover::before,
.tech-card:hover::after {
  border-color: rgba(167, 139, 250, 0.85);
}

/* 右上角计数徽标 */
.tech-count {
  flex: none;
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  color: #a78bfa;
}

/* 文档芯片：新增文档自动多一枚，flex-wrap 自适应换行 */
.tech-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.75);
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease,
    color 0.25s ease;
}

.tech-chip:hover {
  border-color: rgba(167, 139, 250, 0.7);
  background: rgba(139, 107, 255, 0.16);
  color: #ffffff;
}

/* 「查看全部」强调芯片 */
.tech-chip--accent {
  border-color: rgba(139, 107, 255, 0.45);
  color: #c4b5fd;
}

.tech-chip--accent:hover {
  border-color: rgba(167, 139, 250, 0.9);
  background: rgba(139, 107, 255, 0.28);
  color: #ffffff;
}
</style>
