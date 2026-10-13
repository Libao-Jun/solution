<script setup lang="ts">
/**
 * 浏览器存储机制选择决策树（外层骨架）。
 *
 * 与 FrontendSecurityMindmap 一致：外层负责 SSR 可渲染的静态外框与兜底文本，
 * 真正的 @vue-flow/core 画布在浏览器端动态加载，避免 SSR 构建失败与挂载后布局跳动。
 */
import { onMounted, ref, shallowRef, type Component } from 'vue'

import '@vue-flow/core/dist/style.css'

type TreeControls = {
  zoomIn: (options?: { duration?: number }) => unknown
  zoomOut: (options?: { duration?: number }) => unknown
  fitView: (options?: { padding?: number }) => unknown
}

const TreeCanvas = shallowRef<Component | null>(null)
const canvasRef = ref<TreeControls | null>(null)

onMounted(async () => {
  TreeCanvas.value = (await import('./StorageDecisionTreeCanvas.vue')).default
})
</script>

<template>
  <div class="storage-decision-tree">
    <div class="storage-decision-tree__bar">
      <div class="storage-decision-tree__legend">
        <span class="storage-decision-tree__legend-item">
          <i class="storage-decision-tree__dot storage-decision-tree__dot--start" />
          起点
        </span>
        <span class="storage-decision-tree__legend-item">
          <i class="storage-decision-tree__dot storage-decision-tree__dot--decision" />
          判断
        </span>
        <span class="storage-decision-tree__legend-item">
          <i class="storage-decision-tree__dot storage-decision-tree__dot--result" />
          选型结果
        </span>
      </div>
      <div class="storage-decision-tree__tools">
        <button type="button" class="storage-decision-tree__btn" :disabled="!TreeCanvas" @click="canvasRef?.zoomOut()">
          缩小
        </button>
        <button type="button" class="storage-decision-tree__btn" :disabled="!TreeCanvas" @click="canvasRef?.fitView()">
          适应
        </button>
        <button type="button" class="storage-decision-tree__btn" :disabled="!TreeCanvas" @click="canvasRef?.zoomIn()">
          放大
        </button>
      </div>
    </div>

    <div class="storage-decision-tree__canvas">
      <p class="storage-decision-tree__sr">
        决策树内容：要存的数据。先问「是否需要随 HTTP 请求自动发给服务端？」——是则再问「JS 是否需要读取内容？」：不需要读取选
        HttpOnly Cookie（服务端 Set-Cookie 下发），需要读取选 Cookie（SameSite + Secure）。若不需要随请求发送，再问「是否需要索引、查询、事务或数据量大于
        5MB？」：是则继续问「是文件或超大二进制？」：是选 OPFS / File System Access，否选 IndexedDB。若不需要索引/事务/大容量，问「是否只在当前标签页会话内需要？」：是选
        sessionStorage，否则问「数据量极小且极高频读取？」：是选内存变量 + Cache Storage 兜底，否选 localStorage。
      </p>
      <component :is="TreeCanvas" v-if="TreeCanvas" ref="canvasRef" />
    </div>

    <p class="storage-decision-tree__hint">拖拽画布可平移，按钮可缩放；分支上的「是 / 否」即决策结果</p>
  </div>
</template>

<style scoped>
.storage-decision-tree {
  margin: 1.25rem 0 1.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.storage-decision-tree__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.storage-decision-tree__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.storage-decision-tree__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.storage-decision-tree__dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.storage-decision-tree__dot--start {
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
}

.storage-decision-tree__dot--decision {
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: hsl(220 58% 74%);
}

.storage-decision-tree__dot--result {
  border: 1px solid hsl(220 58% 74%);
  background: hsl(220 80% 96%);
}

.storage-decision-tree__tools {
  display: flex;
  gap: 6px;
}

.storage-decision-tree__btn {
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

.storage-decision-tree__btn:hover:not(:disabled) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}

.storage-decision-tree__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.storage-decision-tree__canvas {
  position: relative;
  height: 520px;
  background-image: radial-gradient(circle, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 22px 22px;
}

.storage-decision-tree__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.storage-decision-tree__hint {
  margin: 0;
  padding: 6px 12px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
}

@media (max-width: 768px) {
  .storage-decision-tree__canvas {
    height: 420px;
  }
}
</style>
