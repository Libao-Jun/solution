<script setup lang="ts">
/**
 * 小程序「从 0 到 1」完整上线流程图（外层骨架）。
 *
 * 与 StorageDecisionTree / FrontendSecurityMindmap 同一范式：
 * 外层负责 SSR 可渲染的静态外框、图例、工具栏与兜底文本，
 * 真正的 @vue-flow/core 画布在浏览器端动态加载，避免 SSR 构建失败与挂载后布局跳动。
 *
 * 图例分四个阶段：账号与备案（①–⑤）/ 开发与自测（⑥–⑧）/ 上传与审核（⑨–⑩）/ 发布上线（⑪），
 * 与画布里的节点配色一一对应（account / dev / review / live）。
 */
import { onMounted, ref, shallowRef, type Component } from 'vue'

import '@vue-flow/core/dist/style.css'

type FlowControls = {
  zoomIn: (options?: { duration?: number }) => unknown
  zoomOut: (options?: { duration?: number }) => unknown
  fitView: (options?: { padding?: number }) => unknown
}

const FlowCanvas = shallowRef<Component | null>(null)
const canvasRef = ref<FlowControls | null>(null)

onMounted(async () => {
  FlowCanvas.value = (await import('./MiniprogramSetupFlowCanvas.vue')).default
})
</script>

<template>
  <div class="mp-setup-flow">
    <div class="mp-setup-flow__bar">
      <div class="mp-setup-flow__legend">
        <span class="mp-setup-flow__legend-item">
          <i class="mp-setup-flow__dot mp-setup-flow__dot--account" />
          账号与备案（①–⑤）
        </span>
        <span class="mp-setup-flow__legend-item">
          <i class="mp-setup-flow__dot mp-setup-flow__dot--dev" />
          开发与自测（⑥–⑧）
        </span>
        <span class="mp-setup-flow__legend-item">
          <i class="mp-setup-flow__dot mp-setup-flow__dot--review" />
          上传与审核（⑨–⑩）
        </span>
        <span class="mp-setup-flow__legend-item">
          <i class="mp-setup-flow__dot mp-setup-flow__dot--live" />
          发布上线（⑪）
        </span>
      </div>
      <div class="mp-setup-flow__tools">
        <button type="button" class="mp-setup-flow__btn" :disabled="!FlowCanvas" @click="canvasRef?.zoomOut()">
          缩小
        </button>
        <button type="button" class="mp-setup-flow__btn" :disabled="!FlowCanvas" @click="canvasRef?.fitView()">
          适应
        </button>
        <button type="button" class="mp-setup-flow__btn" :disabled="!FlowCanvas" @click="canvasRef?.zoomIn()">
          放大
        </button>
      </div>
    </div>

    <div class="mp-setup-flow__canvas">
      <p class="mp-setup-flow__sr">
        完整流程：① 在 mp.weixin.qq.com 注册账号并选择「小程序」类型；② 填写主体信息（个人：身份证 +
        扫码；企业：营业执照 + 认证）；③ 完善小程序信息（名称 / 头像 / 简介 / 服务类目）；④ 在后台「开发 →
        开发设置」获取 AppID；⑤ 办理小程序备案（可与开发并行，发布前必须完成）；⑥ 安装微信开发者工具；⑦
        创建项目并填入 AppID、选择是否使用云开发；⑧ 编译预览（模拟器调试 + 扫码真机预览）；⑨ 上传代码（填版本号
        + 项目备注）；⑩ 提交审核（版本管理 → 开发版本 → 提交审核，附测试账号 / 功能路径 / 资质）；⑪
        发布上线（全量发布或分阶段灰度，异常可回退上一版本）。
      </p>
      <component :is="FlowCanvas" v-if="FlowCanvas" ref="canvasRef" />
    </div>

    <p class="mp-setup-flow__hint">
      三行蛇形排布：从左上角 ① 开始，逐行向右再折返；⑤ 备案可与开发并行、但发布前必须完成；拖拽画布可平移，按钮可缩放
    </p>
  </div>
</template>

<style scoped>
.mp-setup-flow {
  margin: 1.25rem 0 1.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.mp-setup-flow__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.mp-setup-flow__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.mp-setup-flow__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mp-setup-flow__dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.mp-setup-flow__dot--account {
  background: linear-gradient(135deg, #4f30e8 0%, #7b6bf5 100%);
}

.mp-setup-flow__dot--dev {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.mp-setup-flow__dot--review {
  background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%);
}

.mp-setup-flow__dot--live {
  background: linear-gradient(135deg, #047857 0%, #10b981 100%);
}

.mp-setup-flow__tools {
  display: flex;
  gap: 6px;
}

.mp-setup-flow__btn {
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

.mp-setup-flow__btn:hover:not(:disabled) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}

.mp-setup-flow__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.mp-setup-flow__canvas {
  position: relative;
  height: 400px;
  background-image: radial-gradient(circle, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 22px 22px;
}

.mp-setup-flow__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.mp-setup-flow__hint {
  margin: 0;
  padding: 6px 12px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
}

@media (max-width: 768px) {
  .mp-setup-flow__canvas {
    height: 380px;
  }
}
</style>
