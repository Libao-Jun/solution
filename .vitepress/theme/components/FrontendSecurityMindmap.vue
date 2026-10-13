<script setup lang="ts">
/**
 * 前端安全「攻防全景」思维导图（外层骨架）。
 *
 * 这一层只做三件事：画出 SSR 就能渲染的卡片外框（图例 / 工具栏 / 等尺寸画布）、
 * 提供纯文字的无障碍与爬虫兜底、在挂载后动态加载真正的流程图。
 *
 * ★ 为什么要拆成两层：真正的图用 @vue-flow/core（依赖 d3-zoom / d3-selection，需要 DOM），
 *   只能在浏览器端加载。若整块都交给 <ClientOnly>，服务端不渲染任何内容、客户端挂载后
 *   整块弹入会造成约 500px 的布局跳动；拆出这一层外壳后，首屏位置稳定、JS 关闭时也不塌陷。
 */
import { onMounted, ref, shallowRef, type Component } from 'vue'

// Vue Flow 基础样式（容器 / 平移缩放 / 边路径）。这里静态引入的是 CSS，
// 不会求值 @vue-flow/core 的 JS；提前引入可避免流程图挂载后「先裸样式再套样式」。
import '@vue-flow/core/dist/style.css'

/** 流程图画布对外暴露的视图控制方法 */
type MindmapControls = {
  zoomIn: (options?: { duration?: number }) => unknown
  zoomOut: (options?: { duration?: number }) => unknown
  fitView: (options?: { padding?: number }) => unknown
}

/** 挂载后才赋值的流程图组件（浏览器端 import） */
const MindmapCanvas = shallowRef<Component | null>(null)
const canvasRef = ref<MindmapControls | null>(null)

onMounted(async () => {
  MindmapCanvas.value = (await import('./FrontendSecurityMindmapCanvas.vue')).default
})
</script>

<template>
  <div class="mindmap">
    <div class="mindmap__bar">
      <div class="mindmap__legend">
        <span class="mindmap__legend-item">
          <i class="mindmap__dot mindmap__dot--attack" />
          典型攻击面
        </span>
        <span class="mindmap__legend-item">
          <i class="mindmap__dot mindmap__dot--defense" />
          防御机制与关键问题
        </span>
      </div>
      <div class="mindmap__tools">
        <button type="button" class="mindmap__btn" :disabled="!MindmapCanvas" @click="canvasRef?.zoomOut()">
          缩小
        </button>
        <button type="button" class="mindmap__btn" :disabled="!MindmapCanvas" @click="canvasRef?.fitView()">
          适应
        </button>
        <button type="button" class="mindmap__btn" :disabled="!MindmapCanvas" @click="canvasRef?.zoomIn()">
          放大
        </button>
      </div>
    </div>

    <div class="mindmap__canvas">
      <!-- 无 JS / 爬虫兜底：把整图内容以纯文字给出（视觉上隐藏，不占位） -->
      <p class="mindmap__sr">
        思维导图内容：中心为「前端安全：攻与防」。左侧是典型攻击面——跨站脚本攻击（XSS）、跨站请求伪造（CSRF）、点击劫持（Clickjacking）、CDN
        劫持、页面劫持、DoS 攻击、中间人攻击（MITM）。右侧是防御机制及其关键问题——内容安全策略（CSP）如何启用、有什么限制；Iframe
        有什么缺点、如何防御通过 Iframe 的攻击；HTTP 严格传输安全（HSTS）如何开启；内容安全策略（CSP）如何开启。
      </p>
      <component :is="MindmapCanvas" v-if="MindmapCanvas" ref="canvasRef" />
    </div>

    <p class="mindmap__hint">拖拽画布可平移，按钮可缩放；图内容与本章各节一一对应</p>
  </div>
</template>

<style scoped>
.mindmap {
  margin: 1.25rem 0 1.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.mindmap__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.mindmap__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.mindmap__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mindmap__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.mindmap__dot--attack {
  background: hsl(352 58% 62%);
}

.mindmap__dot--defense {
  background: hsl(162 50% 46%);
}

.mindmap__tools {
  display: flex;
  gap: 6px;
}

.mindmap__btn {
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

.mindmap__btn:hover:not(:disabled) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}

.mindmap__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* 画布：高度固定，流程图挂载前后尺寸一致，避免布局跳动 */
.mindmap__canvas {
  position: relative;
  height: 500px;
  background-image: radial-gradient(circle, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 22px 22px;
}

.mindmap__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.mindmap__hint {
  margin: 0;
  padding: 6px 12px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
}

@media (max-width: 768px) {
  .mindmap__canvas {
    height: 420px;
  }
}
</style>
