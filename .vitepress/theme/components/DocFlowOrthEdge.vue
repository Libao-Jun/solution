<script setup lang="ts">
/**
 * 正交树线（rounded orthogonal edge）：父节点右侧 → 子节点左侧。
 *
 * 为什么不直接用内置的 `smoothstep`：
 * 内置折线的竖向拐点固定在「起点外 20px」处，而同一父节点的所有子连线共享同一个起点，
 * 于是多条线的竖向段都挤在同一个 x 上、离父节点只有 20px，横向段只剩几像素——
 * 折角半径与横向段互相挤压，看上去像一堆贴在一起的小方框（原「JS 全貌」树图的主要乱源）。
 *
 * 本组件改为：
 * - 竖向拐点取「起点到终点水平距离的中点」→ 同一父节点的所有连线共用一条竖向干线，
 *   多条线重叠成一条干净的「干线 + 支线」结构，而不是并排的平行线；
 * - 四角统一定半径圆角（半径还受可用横向 / 竖向长度约束），不会出现挤成一团的圆角；
 * - 起点画一个小圆点作为「分叉口」，让扇形分叉看起来是有意为之的接线柱。
 *
 * 颜色不在这里写死：由 DocFlowCanvas 给连线组加 `doc-edge--tone-*` 类，
 * 通过 --doc-hue 让描边与圆点继承所属分支的色相（明暗主题共用一套变量）。
 */
import { BaseEdge } from '@vue-flow/core'
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
}>()

/** 拐角半径上限（实际半径还会受可用线段长度约束） */
const CORNER = 12

const path = computed(() => {
  const { sourceX: sx, sourceY: sy, targetX: tx, targetY: ty } = props

  // 同一水平线上：直接一条横线，不做拐角
  if (Math.abs(ty - sy) < 1) return `M ${sx} ${sy} L ${tx} ${ty}`

  const gx = sx + (tx - sx) / 2
  const dir = ty > sy ? 1 : -1
  const r = Math.min(CORNER, Math.abs(ty - sy) / 2, Math.abs(gx - sx), Math.abs(tx - gx))

  return [
    `M ${sx} ${sy}`,
    `H ${gx - r}`,
    `Q ${gx} ${sy} ${gx} ${sy + dir * r}`,
    `V ${ty - dir * r}`,
    `Q ${gx} ${ty} ${gx + r} ${ty}`,
    `H ${tx}`,
  ].join(' ')
})
</script>

<template>
  <BaseEdge :id="id" :path="path" />
  <circle class="doc-edge__port" :cx="sourceX" :cy="sourceY" r="2.6" />
</template>
