<script setup lang="ts">
/**
 * 「9.7 Flex 与 Grid 如何选型」—— @vue-flow/core 重构。
 * 内容与 fundamentals/css-css3 9.7 节原 ```mermaid flowchart TD 逐条对应，只换渲染方式、不改语义：
 *
 *   需要布局 → 是二维还是一维布局？
 *     二维：行列都要控制 → Grid     → 页面骨架 / 卡片墙 · id 区域命名 / 跨行跨列 · 响应式 auto-fit + minmax
 *     一维：一行或一列   → Flexbox → 导航栏 / 工具栏 / 按钮组 · 垂直居中 / 内容撑满底部 · 侧栏定宽 + 主区自适应
 *     Grid 与 Flexbox → 嵌套：Grid 做区域 · Flex 做区域内排布
 *
 * 构图：起点 → 判断菱形 → 两个分支（分支节点纵向居中于各自的叶子块，叶子横向排开，
 * 同 JsOverviewMap 的横向括号式）→ 汇合到实践共识节点。
 * 注意：Grid / Flexbox 各有两条出线走不同侧（叶子走右侧、共识走底部），
 * 由 DocFlowEdge 的按条 sourcePos 覆盖实现。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode, FlowTone } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

const START_W = 120
const START_H = 46
const DECISION_W = 200
const DECISION_H = 84
const BRANCH_W = 110
const BRANCH_H = 46
const LEAF_W = 200
const LEAF_H = 48
const LEAF_GAP = 20
/** 分支节点到叶子的层间距（须大于内置 smoothstep offset 的两倍 40，见 JsOverviewMap 注释） */
const COL_GAP = 44
/** 两个分支块之间的水平间距（须容纳判断 → 分支的竖直走线） */
const BRANCH_GAP = 70
/** 分支块底到共识节点的层间距（须大于 40） */
const BOTTOM_GAP = 96

type Branch = {
  id: string
  title: string
  tone: FlowTone
  /** 判断节点到分支节点的连线标签 */
  edgeLabel: string
  leaves: string[]
}

const BRANCHES: Branch[] = [
  {
    id: 'grid',
    title: 'Grid',
    tone: 'sky',
    edgeLabel: '二维：行列都要控制',
    leaves: ['页面骨架 / 卡片墙', 'id 区域命名 / 跨行跨列', '响应式 auto-fit + minmax'],
  },
  {
    id: 'flex',
    title: 'Flexbox',
    tone: 'emerald',
    edgeLabel: '一维：一行或一列',
    leaves: ['导航栏 / 工具栏 / 按钮组', '垂直居中 / 内容撑满底部', '侧栏定宽 + 主区自适应'],
  },
]

/** 叶子块高度（三行叶子 + 行距） */
const LEAVES_H = BRANCHES[0].leaves.length * LEAF_H + (BRANCHES[0].leaves.length - 1) * LEAF_GAP

// —— 横向：两个「分支块」并排，起点 / 判断 / 共识整体居中于两块之间 —— //
// ★ 一个分支块 = 分支节点 + COL_GAP + 叶子列，故第二块的起点必须从「块宽」起算，
//   若误按分支节点宽度（BRANCH_W）起算，第二个分支节点会压在前一块的叶子上。
const BLOCK_W = BRANCH_W + COL_GAP + LEAF_W
const BRANCH_X = [0, BLOCK_W + BRANCH_GAP] as const
/** 叶子在各自块内的横向起点 */
const LEAF_X = BRANCH_W + COL_GAP
const TOTAL_W = BRANCH_X[1] + BLOCK_W
const CENTER_X = TOTAL_W / 2

// —— 纵向：起点 → 判断 → 分支（居中于叶子块） → 叶子行 → 共识 —— //
const START_Y = 0
const DECISION_Y = START_H + 48
const LEAVES_Y = DECISION_Y + DECISION_H + 122
const BRANCH_Y = LEAVES_Y + LEAVES_H / 2 - BRANCH_H / 2
const CONSENSUS_Y = LEAVES_Y + LEAVES_H + BOTTOM_GAP

const nodes: DocFlowNode[] = [
  {
    id: 'start',
    x: CENTER_X - START_W / 2,
    y: START_Y,
    data: { label: '需要布局', width: START_W, height: START_H, shape: 'start', tone: 'brand' },
  },
  {
    id: 'decision',
    x: CENTER_X - DECISION_W / 2,
    y: DECISION_Y,
    data: {
      label: '是二维还是<br>一维布局？',
      width: DECISION_W,
      height: DECISION_H,
      shape: 'decision',
      tone: 'amber',
    },
  },
]

const edges: DocFlowEdge[] = [{ source: 'start', target: 'decision' }]

BRANCHES.forEach((branch, bi) => {
  const branchX = BRANCH_X[bi]
  nodes.push({
    id: branch.id,
    x: branchX,
    y: BRANCH_Y,
    data: {
      label: branch.title,
      width: BRANCH_W,
      height: BRANCH_H,
      shape: 'process',
      tone: branch.tone,
      sourcePos: 'right',
    },
  })
  edges.push({ source: 'decision', target: branch.id, label: branch.edgeLabel })

  branch.leaves.forEach((leaf, li) => {
    const id = `${branch.id}-leaf-${li}`
    nodes.push({
      id,
      x: branchX + LEAF_X,
      y: LEAVES_Y + li * (LEAF_H + LEAF_GAP),
      data: { label: leaf, width: LEAF_W, height: LEAF_H, shape: 'card', tone: branch.tone },
    })
    edges.push({ source: branch.id, target: id })
  })

  // 分支 → 共识：从分支外侧出线、绕过叶子块后再汇入（按条覆盖出入侧，
  // 避免从底部出线的水平段穿进叶子行间隙、被误读为连到叶子）
  const outer: DocFlowEdge = {
    source: branch.id,
    target: 'consensus',
    sourcePos: bi === 0 ? 'left' : 'right',
    targetPos: bi === 0 ? 'left' : 'right',
  }
  edges.push(outer)
})

nodes.push({
  id: 'consensus',
  x: CENTER_X - 160,
  y: CONSENSUS_Y,
  data: {
    label: '嵌套：Grid 做区域 · Flex 做区域内排布',
    width: 320,
    height: 56,
    shape: 'result',
    tone: 'brand',
  },
})

const legend: FlowLegendItem[] = [
  { shape: 'rect', tone: 'brand', text: '起点 / 实践共识' },
  { shape: 'diamond', tone: 'amber', text: '判断' },
  { shape: 'rect', tone: 'sky', text: 'Grid（二维）' },
  { shape: 'rect', tone: 'emerald', text: 'Flexbox（一维）' },
]

const srText =
  'Flex 与 Grid 选型决策：需要布局时先问「是二维还是一维布局？」——' +
  '二维（行列都要控制）选 Grid：适用于页面骨架 / 卡片墙、id 区域命名 / 跨行跨列、响应式 auto-fit + minmax；' +
  '一维（一行或一列）选 Flexbox：适用于导航栏 / 工具栏 / 按钮组、垂直居中 / 内容撑满底部、侧栏定宽 + 主区自适应。' +
  '实践共识：Grid 管页面骨架与二维区域，Flex 管组件内部的一维排布，二者嵌套使用是主流做法。'
</script>

<template>
  <DocFlow
    flow-id="flex-grid-choice"
    :nodes="nodes"
    :edges="edges"
    :legend="legend"
    :sr-text="srText"
    :height="680"
    :min-zoom="0.45"
    :max-zoom="1.2"
    hint="按「二维 / 一维」分流选型；连线上的标签即判断条件；拖拽画布可平移，按钮可缩放"
  />
</template>
