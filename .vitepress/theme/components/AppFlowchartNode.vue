<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    label: string
    width?: number
    height?: number
    tone?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky' | 'orange'
    /** 连接点方向：'tb' 上下（默认，适合纵向流程），'lr' 左右（适合横向流程） */
    io?: 'tb' | 'lr'
    /** 可选：单独覆写目标/来源把手方向（优先于 io），用于「上进右出」等混合连线 */
    targetPos?: 'top' | 'bottom' | 'left' | 'right'
    sourcePos?: 'top' | 'bottom' | 'left' | 'right'
  }
}>()

const POS_MAP = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
} as const

const targetPos = computed(() =>
  props.data.targetPos ? POS_MAP[props.data.targetPos] : props.data.io === 'lr' ? Position.Left : Position.Top,
)
const sourcePos = computed(() =>
  props.data.sourcePos ? POS_MAP[props.data.sourcePos] : props.data.io === 'lr' ? Position.Right : Position.Bottom,
)
</script>

<template>
  <div
    class="flow-card"
    :class="data.tone ? `tone-${data.tone}` : 'tone-slate'"
    :style="{ width: `${data.width ?? 160}px`, height: `${data.height ?? 56}px` }"
  >
    <Handle type="target" :position="targetPos" class="flow-handle" />
    <div class="flow-card-label" v-html="data.label" />
    <Handle type="source" :position="sourcePos" class="flow-handle" />
  </div>
</template>

<style scoped>
.flow-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--flow-card-border);
  background: var(--flow-card-bg);
  color: var(--flow-card-text);
  font-size: 12px;
  line-height: 1.35;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.flow-card-label {
  width: 100%;
}
.flow-card-label :deep(br) {
  display: block;
  content: '';
  margin: 2px 0;
}
.flow-handle {
  width: 6px;
  height: 6px;
  background: transparent;
  border: none;
}

/* 色系：CSS 变量自动适配明暗模式 */
.tone-slate   { --flow-card-bg: var(--vp-c-bg);       --flow-card-border: var(--vp-c-border);       --flow-card-text: var(--vp-c-text-1); }
.tone-indigo  { --flow-card-bg: #eef2ff; --flow-card-border: #c7d2fe; --flow-card-text: #3730a3; }
.tone-emerald { --flow-card-bg: #ecfdf5; --flow-card-border: #a7f3d0; --flow-card-text: #065f46; }
.tone-amber   { --flow-card-bg: #fffbeb; --flow-card-border: #fde68a; --flow-card-text: #92400e; }
.tone-rose    { --flow-card-bg: #fff1f2; --flow-card-border: #fecdd3; --flow-card-text: #9f1239; }
.tone-violet  { --flow-card-bg: #f5f3ff; --flow-card-border: #ddd6fe; --flow-card-text: #5b21b6; }
.tone-sky     { --flow-card-bg: #f0f9ff; --flow-card-border: #bae6fd; --flow-card-text: #075985; }
.tone-orange  { --flow-card-bg: #fff7ed; --flow-card-border: #fed7aa; --flow-card-text: #9a3412; }

html.dark .tone-indigo  { --flow-card-bg: #1e1b4b; --flow-card-border: #4338ca; --flow-card-text: #c7d2fe; }
html.dark .tone-emerald { --flow-card-bg: #022c22; --flow-card-border: #059669; --flow-card-text: #a7f3d0; }
html.dark .tone-amber   { --flow-card-bg: #451a03; --flow-card-border: #d97706; --flow-card-text: #fde68a; }
html.dark .tone-rose    { --flow-card-bg: #4c0519; --flow-card-border: #be123c; --flow-card-text: #fecdd3; }
html.dark .tone-violet  { --flow-card-bg: #2e1065; --flow-card-border: #7c3aed; --flow-card-text: #ddd6fe; }
html.dark .tone-sky     { --flow-card-bg: #082f49; --flow-card-border: #0284c7; --flow-card-text: #bae6fd; }
html.dark .tone-orange  { --flow-card-bg: #431407; --flow-card-border: #ea580c; --flow-card-text: #fed7aa; }
</style>
