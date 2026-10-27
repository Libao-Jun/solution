<script setup lang="ts">
/**
 * 「1.4 元素、标签、属性、内容」拆解图（外层骨架）。
 *
 * 与 DocFlow / BuildToolsFlow 同一范式：
 * - 外层只用真实 DOM 渲染工具条、无障碍口述版与操作提示，SSR 可直接输出；
 * - 真正的 @vue-flow/core 画布（HtmlElementAnatomyCanvas.vue）在浏览器端动态加载，
 *   构建期不触碰 d3-zoom。
 *
 * 旧实现是把「代码 + 箭头 + 中文标签」手写进 ```html 代码块，靠数空格对齐；
 * 而代码块内中日韩字形宽度不等于两个等宽字符，标签必然错位。本组件改为
 * 「代码 token 由 DOM 自然排布 → 实测坐标 → 画布连线」，字体无关、永不歪。
 */
import '@vue-flow/core/dist/style.css'
import { onMounted, ref, shallowRef, type Component } from 'vue'

type CanvasControls = {
  zoomIn: () => unknown
  zoomOut: () => unknown
  fitView: () => unknown
}

const Canvas = shallowRef<Component | null>(null)
const canvasRef = ref<CanvasControls | null>(null)

onMounted(async () => {
  Canvas.value = (await import('./HtmlElementAnatomyCanvas.vue')).default
})

const srText =
  '一个元素由四部分组成：开始标签、属性、内容、结束标签。' +
  '示例代码为 <a href="https://example.com" target="_blank" class="link">示例</a>：' +
  '尖括号里的 a 是标签名；href="https://example.com" 是「属性名=属性值」，一个标签可以有多个属性；' +
  'target="_blank" 与 class="link" 是另外两个属性；标签之间的「示例」是内容；' +
  '带斜杠的 </a> 是结束标签。'
</script>

<template>
  <figure class="anatomy">
    <div class="anatomy__bar">
      <span class="anatomy__title">四个组成部分</span>
      <div class="anatomy__tools">
        <button type="button" class="anatomy__btn" :disabled="!Canvas" @click="canvasRef?.zoomOut()">
          缩小
        </button>
        <button type="button" class="anatomy__btn" :disabled="!Canvas" @click="canvasRef?.fitView()">
          适应
        </button>
        <button type="button" class="anatomy__btn" :disabled="!Canvas" @click="canvasRef?.zoomIn()">
          放大
        </button>
      </div>
    </div>

    <div class="anatomy__canvas">
      <p class="anatomy__sr">{{ srText }}</p>
      <component :is="Canvas" v-if="Canvas" ref="canvasRef" />
      <p v-else class="anatomy__placeholder" aria-hidden="true">正在加载图示…</p>
    </div>

    <figcaption class="anatomy__hint">
      箭头指向的位置依次是标签名、属性、内容与结束标签；拖拽画布可平移，按钮可缩放
    </figcaption>
  </figure>
</template>

<style scoped>
.anatomy {
  margin: 1.25rem 0 1.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.anatomy__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.anatomy__title {
  color: var(--vp-c-text-2);
  font-size: 12px;
  letter-spacing: 0.02em;
}

.anatomy__tools {
  display: flex;
  gap: 6px;
}

.anatomy__btn {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.anatomy__btn:hover:not(:disabled) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}

.anatomy__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.anatomy__canvas {
  position: relative;
  height: 132px;
}

/* 口述版：仅给读屏软件，视觉上不可见 */
.anatomy__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.anatomy__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.anatomy__hint {
  margin: 0;
  padding: 6px 12px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .anatomy__canvas {
    height: 118px;
  }
}
</style>
