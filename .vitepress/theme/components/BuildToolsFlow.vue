<script setup lang="ts">
/**
 * 前端打包构建工具图表（外层骨架）。
 *
 * 与 StorageDecisionTree / MiniprogramSetupFlow / FrontendSecurityMindmap 同一范式：
 * 外层负责 SSR 可渲染的静态外框（图例、缩放工具栏、无障碍兜底文本），
 * 真正的 @vue-flow/core 画布在浏览器端动态加载，避免 SSR 构建失败与挂载后布局跳动。
 *
 * variant 与工程化正文的对应关系见 BuildToolsFlowCanvas.vue 头部注释：
 * pipeline = 1.2 构建流程、deps = 1.3 依赖图、ecosystem = 1.6 生态关系、decision = 11.1 选型决策树。
 */
import { computed, onMounted, ref, shallowRef, type Component } from 'vue'

import '@vue-flow/core/dist/style.css'

type Variant = 'pipeline' | 'deps' | 'ecosystem' | 'decision'

type FlowControls = {
  zoomIn: (options?: { duration?: number }) => unknown
  zoomOut: (options?: { duration?: number }) => unknown
  fitView: (options?: { padding?: number }) => unknown
}

type LegendItem = { tone: 'brand' | 'indigo' | 'sky' | 'emerald' | 'slate' | 'dash'; text: string }

const props = withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'pipeline' })

/** 每个 variant 的画布高度、图例、无障碍描述与操作提示 */
const META: Record<
  Variant,
  { height: number; legend: LegendItem[]; sr: string; hint: string }
> = {
  pipeline: {
    height: 600,
    legend: [
      { tone: 'brand', text: '起点' },
      { tone: 'indigo', text: '核心阶段' },
      { tone: 'emerald', text: '产物' },
    ],
    sr: '构建流程六阶段：源码（TS / JSX / Vue / Sass 等）→ ① 解析 Resolve，找到 import 指向哪个文件 → ② 加载 Load，读取文件原始内容 → ③ 转换 Transform，编译转译（babel / esbuild / sass）→ ④ 打包 Bundle，按依赖图拼接成 chunk → ⑤ 优化 Optimize，Tree Shaking / 压缩 / 分包 / 内联 → ⑥ 输出 Emit，写入 dist（js / css / 图片 / html）。',
    hint: '自上而下单列流水线，六阶段依次衔接；拖拽画布可平移，按钮可缩放',
  },
  deps: {
    height: 360,
    legend: [
      { tone: 'brand', text: '入口' },
      { tone: 'sky', text: '中间模块' },
      { tone: 'slate', text: '叶子模块' },
    ],
    sr: '依赖图：入口 main.ts 依赖 utils.ts 与 App.tsx；utils.ts 依赖 lib.js；App.tsx 依赖 Button.tsx 与 store.ts。构建工具顺着 import 一路找到所有被依赖的模块，串成一张有向图。',
    hint: '箭头指向被依赖的模块（从左到右 = 从入口到叶子）；拖拽画布可平移，按钮可缩放',
  },
  ecosystem: {
    height: 460,
    legend: [
      { tone: 'brand', text: 'Vite（枢纽）' },
      { tone: 'sky', text: '应用层工具' },
      { tone: 'indigo', text: '库 / 底层工具' },
      { tone: 'dash', text: '分层容器' },
    ],
    sr: '构建工具生态关系：应用开发层包含 Webpack（JS / 全能）、Vite（esbuild + Rollup）、Next.js（转向 Turbopack）；库 / 底层层包含 Rollup（纯净 ESM）、esbuild（极快引擎）、Rolldown（Rust / Vite 未来内核）。Vite 生产构建底层用 Rollup，开发态依赖预构建用 esbuild；Rolldown 是 Vite 的未来内核。Rspack 是 Webpack 配置的 Rust 提速版，独立于两个分层之外。',
    hint: '虚线框是两个分层，实线箭头 = 依赖关系；拖拽画布可平移，按钮可缩放',
  },
  decision: {
    height: 560,
    legend: [
      { tone: 'brand', text: '起点' },
      { tone: 'indigo', text: '判断' },
      { tone: 'emerald', text: '选型结果' },
    ],
    sr: '选型决策树：你要在做什么？开发一个 Web 应用（Vue / React）——新项目直接用 Vite（推荐，省心又快），已有 Webpack 大型项目想提速选 Rspack（配置基本复用）；做一个 Next.js 项目——直接用 Turbopack（next dev --turbo，默认）；发布一个 npm 库 / 组件库——想要极简选 tsup / unbuild（一行命令），想要完全控制选 Rollup；做一个小项目 / 原型 / 快速验证——Parcel（零配置）或 Vite；必须兼容 IE11 / 老系统——Webpack + Babel（配置最全）。',
    hint: '从左到右逐层收敛：起点 → 判断 → 选型结果；拖拽画布可平移，按钮可缩放',
  },
}

const meta = computed(() => META[props.variant])

const FlowCanvas = shallowRef<Component | null>(null)
const canvasRef = ref<FlowControls | null>(null)

onMounted(async () => {
  FlowCanvas.value = (await import('./BuildToolsFlowCanvas.vue')).default
})
</script>

<template>
  <div class="bt-flow">
    <div class="bt-flow__bar">
      <div class="bt-flow__legend">
        <span v-for="item in meta.legend" :key="item.text" class="bt-flow__legend-item">
          <i class="bt-flow__dot" :class="`bt-flow__dot--${item.tone}`" />
          {{ item.text }}
        </span>
      </div>
      <div class="bt-flow__tools">
        <button type="button" class="bt-flow__btn" :disabled="!FlowCanvas" @click="canvasRef?.zoomOut()">
          缩小
        </button>
        <button type="button" class="bt-flow__btn" :disabled="!FlowCanvas" @click="canvasRef?.fitView()">
          适应
        </button>
        <button type="button" class="bt-flow__btn" :disabled="!FlowCanvas" @click="canvasRef?.zoomIn()">
          放大
        </button>
      </div>
    </div>

    <div class="bt-flow__canvas" :style="{ height: `${meta.height}px` }">
      <p class="bt-flow__sr">{{ meta.sr }}</p>
      <component :is="FlowCanvas" v-if="FlowCanvas" ref="canvasRef" :variant="variant" />
    </div>

    <p class="bt-flow__hint">{{ meta.hint }}</p>
  </div>
</template>

<style scoped>
.bt-flow {
  margin: 1.25rem 0 1.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.bt-flow__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.bt-flow__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.bt-flow__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bt-flow__dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.bt-flow__dot--brand {
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
}

.bt-flow__dot--sky {
  border: 1px solid hsl(214 58% 74%);
  background: hsl(214 80% 96%);
}

.bt-flow__dot--indigo {
  border: 1px solid hsl(250 58% 74%);
  background: hsl(250 80% 96%);
}

.bt-flow__dot--emerald {
  border: 1px solid hsl(160 58% 74%);
  background: hsl(160 80% 96%);
}

.bt-flow__dot--slate {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.bt-flow__dot--dash {
  border: 1px dashed var(--vp-c-text-3);
  background: transparent;
}

.bt-flow__tools {
  display: flex;
  gap: 6px;
}

.bt-flow__btn {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.bt-flow__btn:hover:not(:disabled) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}

.bt-flow__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.bt-flow__canvas {
  position: relative;
  background-image: radial-gradient(circle, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 22px 22px;
}

.bt-flow__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.bt-flow__hint {
  margin: 0;
  padding: 6px 12px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
}

@media (max-width: 768px) {
  .bt-flow__canvas {
    max-height: 72vh;
  }
}
</style>
