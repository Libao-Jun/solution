<script setup lang="ts">
/**
 * 决策树连线：smoothstep 折线 + 可自动换行的分支标签。
 *
 * 为什么不直接用边内置的 `label`：内置标签渲染成 SVG <text>（单行、不换行），
 * 而决策树的分支条件常是长句（如「否，需兼容多种比例、超宽拼接屏、有交互」），
 * 单行会横向溢出并压住相邻节点。
 * 这里改用 EdgeLabelRenderer 输出 HTML 标签，由 CSS 的 max-width 自动折行；
 * 标签随视口一起缩放/平移（EdgeLabelRenderer 会挂到 .vue-flow__edge-labels 内）。
 *
 * 标签位置取 getSmoothStepPath 返回的连线中点——对「父节点底部 → 子节点顶部」的
 * 场景，该点正好落在折线中段的水平线上，因此看起来就是「贴在连线上」。
 */
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@vue-flow/core'
import type { Position } from '@vue-flow/core'
import { computed } from 'vue'

// Vue Flow 会给边组件透传一批本组件未声明的属性（style / labelStyle / events…），
// 而本组件是多根节点（<path> + EdgeLabelRenderer），无法自动继承，故显式关闭，
// 避免开发环境刷出 "Extraneous non-props attributes" 警告。
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  /** 分支条件（HTML 片段，可用 <br> 精确控制断行） */
  data?: { label?: string }
}>()

const geometry = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    borderRadius: 12,
    // 小于相邻两行节点的间距，避免折线在行间打结
    offset: 12,
  }),
)

const path = computed(() => geometry.value[0])

const labelStyle = computed(() => ({
  transform: `translate(-50%, -50%) translate(${geometry.value[1]}px, ${geometry.value[2]}px)`,
}))
</script>

<template>
  <BaseEdge :id="id" :path="path" />
  <EdgeLabelRenderer>
    <div v-if="data?.label" class="dt-edge-label" :style="labelStyle" v-html="data.label" />
  </EdgeLabelRenderer>
</template>

<style scoped>
.dt-edge-label {
  position: absolute;
  /* 上限需小于同一行相邻两条连线中点的间距，否则两个标签会贴到一起 */
  max-width: 130px;
  padding: 2px 6px;
  border-radius: 6px;
  /* 与画布底色一致：遮挡穿过标签的连线，视觉上等同于「连线上的文字」 */
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
  pointer-events: none;
}
</style>
