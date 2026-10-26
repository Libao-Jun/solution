<script setup lang="ts">
/**
 * 「二十三、23.2 发布全流程（六步）」—— 由 ```mermaid 重构为 @vue-flow/core。
 * 内容与原 mermaid 图一一对应，只换渲染方式、不改语义：
 *
 *   ① 真机预览 → ② 上传代码 → ③ 提交审核 → ④ 审核结果
 *        ④ --通过--> ⑤ 发布上线 → ⑥ 线上验证
 *        ④ --被拒--> 整改后重新提交 →（回到 ③）
 *        小程序备案 --发布门槛(虚线)--> ⑤ 发布上线
 *
 * 构图：主列自上而下是主流程；左列是被拒后的整改支线（回路走左侧空白通道，
 * 避免与主列连线交叉）；右列是备案门槛，用虚线连到「发布上线」，强调它只是上架前提。
 * 坐标全部显式给出（不依赖 DOM 测量），节点文案/配色由数据驱动。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

/** 主列卡片：宽 / 高 / 行距（行高 + 空隙） */
const W = 210
const H = 56
const PITCH = 82
/** 主列左边界（左侧留出 250px 通道放「被拒」支线，右侧放备案门槛） */
const X = 250
/** 判定节点（菱形）高度 */
const QH = 96
/** 被拒支线（左侧）尺寸 */
const LANE_W = 200
const LANE_H = 64
/** 备案门槛（右侧）尺寸 */
const GATE_X = 510
const GATE_W = 180

/** 主列六步的纵坐标：判定节点更高，⑤ 之前多留一段空隙 */
const Y = {
  n1: 0,
  n2: PITCH,
  n3: PITCH * 2,
  n4: PITCH * 2 + H + 28,
  n5: PITCH * 2 + H + 28 + QH + 34,
  n6: PITCH * 2 + H + 28 + QH + 34 + H + 26,
}
/** ④ 判定节点的纵向中心：被拒支线与备案门槛都对齐这条线 */
const MID_Y = Y.n4 + QH / 2

const L = (t: string, d: string) => `<span class="t">${t}</span><span class="d">${d}</span>`

const nodes: DocFlowNode[] = [
  {
    id: 'n1',
    x: X,
    y: Y.n1,
    data: { label: L('① 真机预览', '开发者工具「预览」→ 扫码验证'), width: W, height: H, shape: 'card', tone: 'sky' },
  },
  {
    id: 'n2',
    x: X,
    y: Y.n2,
    data: { label: L('② 上传代码', '填版本号 + 项目备注'), width: W, height: H, shape: 'card', tone: 'amber' },
  },
  {
    id: 'n3',
    x: X,
    y: Y.n3,
    data: {
      label: L('③ 提交审核', '测试账号 / 功能路径 / 资质'),
      width: W,
      height: H,
      shape: 'card',
      tone: 'amber',
    },
  },
  {
    id: 'n4',
    x: X,
    y: Y.n4,
    data: {
      label: L('④ 审核结果', '通常 1～7 个工作日'),
      width: W,
      height: QH,
      shape: 'decision',
      tone: 'amber',
    },
  },
  {
    id: 'n5',
    x: X,
    y: Y.n5,
    data: {
      label: L('⑤ 发布上线', '全量发布 / 分阶段灰度'),
      width: W,
      height: H,
      shape: 'result',
      tone: 'emerald',
    },
  },
  {
    id: 'n6',
    x: X,
    y: Y.n6,
    data: {
      label: L('⑥ 线上验证', '抽检核心链路，异常可回退'),
      width: W,
      height: H,
      shape: 'card',
      tone: 'emerald',
    },
  },
  {
    // 被拒支线：改完回到 ③，回路走左侧空白通道
    id: 'rework',
    x: 0,
    y: MID_Y - LANE_H / 2,
    data: {
      label: L('整改后重新提交', '改完回到 ③ 再走一遍'),
      width: LANE_W,
      height: LANE_H,
      shape: 'result',
      tone: 'amber',
      targetPos: 'right',
      sourcePos: 'top',
    },
  },
  {
    // 备案门槛：只与「发布上线」有虚线连接，表达它是上架前提而非流程步骤
    id: 'gate',
    x: GATE_X,
    y: MID_Y - LANE_H / 2,
    data: {
      label: L('小程序备案', '未备案无法上架（见 2.4）'),
      width: GATE_W,
      height: LANE_H,
      shape: 'card',
      tone: 'slate',
      sourcePos: 'bottom',
    },
  },
]

const edges: DocFlowEdge[] = [
  { source: 'n1', target: 'n2', arrow: true },
  { source: 'n2', target: 'n3', arrow: true },
  { source: 'n3', target: 'n4', arrow: true },
  { source: 'n4', target: 'n5', label: '通过', arrow: true },
  { source: 'n5', target: 'n6', arrow: true },
  { source: 'n4', target: 'rework', label: '被拒', sourcePos: 'left', targetPos: 'right', arrow: true },
  { source: 'rework', target: 'n3', sourcePos: 'top', targetPos: 'left', arrow: true },
  { source: 'gate', target: 'n5', label: '发布门槛', sourcePos: 'bottom', targetPos: 'right', dashed: true, arrow: true },
]

const legend: FlowLegendItem[] = [
  { shape: 'rect', tone: 'sky', text: '真机自测' },
  { shape: 'rect', tone: 'amber', text: '上传与审核' },
  { shape: 'diamond', tone: 'amber', text: '审核结果（判定）' },
  { shape: 'rect', tone: 'emerald', text: '发布上线' },
  { shape: 'frame', tone: 'slate', text: '备案门槛（虚线）' },
]

const srText =
  '小程序发布全流程：① 真机预览，用开发者工具「预览」扫码验证；' +
  '② 上传代码，填版本号与项目备注；③ 提交审核，填可用的测试账号、功能路径与资质；' +
  '④ 审核结果，通常 1～7 个工作日——通过则进入 ⑤ 发布上线（全量发布或分阶段灰度）；' +
  '被拒则走左侧支线「整改后重新提交」，改完回到 ③ 再走一遍；' +
  '右侧「小程序备案」以虚线连到 ⑤，表示它是发布门槛：未备案无法上架；' +
  '⑥ 线上验证，抽检核心链路，异常可回退上一版本。'
</script>

<template>
  <DocFlow
    flow-id="miniprogram-release-flow"
    :nodes="nodes"
    :edges="edges"
    :legend="legend"
    :sr-text="srText"
    :height="520"
    :min-zoom="0.55"
    :max-zoom="1.2"
    hint="自上而下是主流程：④ 被拒走左侧支线，整改后回到 ③；右侧虚线是发布门槛（备案未通过无法发布，见 2.4）；拖拽画布可平移，按钮可缩放"
  />
</template>
