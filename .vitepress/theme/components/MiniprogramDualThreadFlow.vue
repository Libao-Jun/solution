<script setup lang="ts">
/**
 * 「五、5.1 双线程模型」—— 由 ```mermaid 重构为 @vue-flow/core。
 * 内容与原 mermaid 图一一对应，只换渲染方式、不改语义：
 *
 *   视图层 View（多个 WebView）  ⇄ 逻辑层 AppService（单线程 JSCore/V8） ⇄ Native（微信）
 *   三层之间没有直连，全部经 Native 中转。
 *
 * 构图：三列「板块容器（panel）」承载各自的方块，容器之间只画三段「Native 中转」连线：
 * - 视图层 ⇄ 逻辑层：上箭头（事件 / API 调用）与下箭头（数据回写）各走一条行间通道，
 *   两条线高度错开，避免落成同一条水平线；
 * - 逻辑层 → Native：容器中部水平直连；
 * - 视图层 → Native：沿底部走一条长弧，对应原图那条绕到底部的箭头。
 * 坐标全部显式给出（不依赖 DOM 测量），文案与配色由数据驱动。
 */
import DocFlow from './DocFlow.vue'
import type { DocFlowEdge, DocFlowNode } from './DocFlowCanvas.vue'
import type { FlowLegendItem } from './DocFlow.vue'

/** 三列容器的左边界与宽度 */
const VIEW_X = 0
const VIEW_W = 200
const LOGIC_X = 280
const LOGIC_W = 210
const NATIVE_X = 570
const NATIVE_W = 170

/** 容器内的方块：宽 / 高 / 三行的纵坐标 */
const CARD_H = 56
const ROW_Y = [52, 134, 216]
/** 容器高度（含顶部标题行） */
const BOX_H = 300
/** 三列容器的纵向中线：取同一数值，逻辑层 → Native 的连线才是水平直线 */
const MID_Y = 150

const L = (t: string, d?: string) =>
  d ? `<span class="t">${t}</span><span class="d">${d}</span>` : `<span class="t">${t}</span>`

const nodes: DocFlowNode[] = [
  /* ---- 三个板块容器（先入数组 → 画在方块下层） ---- */
  {
    id: 'box-view',
    x: VIEW_X,
    y: 0,
    data: { label: L('视图层 View'), width: VIEW_W, height: BOX_H, shape: 'panel', tone: 'sky', labelPos: 'top' },
  },
  {
    id: 'box-logic',
    x: LOGIC_X,
    y: 0,
    data: {
      label: L('逻辑层 AppService'),
      width: LOGIC_W,
      height: BOX_H,
      shape: 'panel',
      tone: 'indigo',
      labelPos: 'top',
    },
  },
  {
    id: 'box-native',
    x: NATIVE_X,
    y: MID_Y - 75,
    data: { label: L('Native（微信）'), width: NATIVE_W, height: 150, shape: 'panel', tone: 'emerald', labelPos: 'top' },
  },

  /* ---- 视图层：多个页面 = 多个 WebView ---- */
  {
    id: 'v1',
    x: VIEW_X + 18,
    y: ROW_Y[0],
    data: { label: L('WebView / Skyline'), width: VIEW_W - 36, height: CARD_H, shape: 'card', tone: 'sky' },
  },
  {
    id: 'v2',
    x: VIEW_X + 18,
    y: ROW_Y[1],
    data: { label: L('WXML + WXSS'), width: VIEW_W - 36, height: CARD_H, shape: 'card', tone: 'sky' },
  },
  {
    id: 'v3',
    x: VIEW_X + 18,
    y: ROW_Y[2],
    data: {
      label: L('多个页面', '= 多个 WebView'),
      width: VIEW_W - 36,
      height: CARD_H,
      shape: 'card',
      tone: 'sky',
    },
  },

  /* ---- 逻辑层：单线程，全局唯一 App ---- */
  {
    id: 'l1',
    x: LOGIC_X + 18,
    y: ROW_Y[0],
    data: { label: L('JSCore / V8'), width: LOGIC_W - 36, height: CARD_H, shape: 'card', tone: 'indigo' },
  },
  {
    id: 'l2',
    x: LOGIC_X + 18,
    y: ROW_Y[1],
    data: { label: L('JS（App / Page）'), width: LOGIC_W - 36, height: CARD_H, shape: 'card', tone: 'indigo' },
  },
  {
    id: 'l3',
    x: LOGIC_X + 18,
    y: ROW_Y[2],
    data: {
      label: L('单线程，全局唯一 App'),
      width: LOGIC_W - 36,
      height: CARD_H,
      shape: 'card',
      tone: 'indigo',
    },
  },

  /* ---- Native：转发 / API 能力 ---- */
  {
    id: 'n1',
    x: NATIVE_X + 18,
    y: ROW_Y[1],
    data: {
      label: L('转发 / API 能力'),
      width: NATIVE_W - 36,
      height: CARD_H,
      shape: 'card',
      tone: 'emerald',
    },
  },
]

const edges: DocFlowEdge[] = [
  // 视图层 → 逻辑层（上通道）：事件与 API 调用。★ 必须显式指定左右出/入线侧，
  // 否则默认走「下 → 上」，连线会从方块底部爬出、绕过整个容器，图立刻变乱。
  { source: 'v1', target: 'l1', label: 'Native 中转', sourcePos: 'right', targetPos: 'left', arrow: true },
  // 逻辑层 → 视图层（下通道）：setData 数据回写
  { source: 'l2', target: 'v2', label: 'Native 中转', sourcePos: 'left', targetPos: 'right', arrow: true },
  // 逻辑层 → Native：两个容器中部水平直连
  { source: 'box-logic', target: 'box-native', label: 'Native 中转', sourcePos: 'right', targetPos: 'left', arrow: true },
  // 视图层 → Native：沿底部绕行（对应原图底部那条长箭头）
  { source: 'box-view', target: 'box-native', label: 'Native 中转', sourcePos: 'bottom', targetPos: 'bottom', arrow: true },
]

const legend: FlowLegendItem[] = [
  { shape: 'rect', tone: 'sky', text: '视图层 View（WebView）' },
  { shape: 'rect', tone: 'indigo', text: '逻辑层 AppService（单线程 JS）' },
  { shape: 'rect', tone: 'emerald', text: 'Native（微信）' },
]

const srText =
  '小程序双线程模型：左边是视图层 View，由多个页面对应的多个 WebView 组成，负责 WXML + WXSS 的渲染，运行 WebView / Skyline；' +
  '中间是逻辑层 AppService，单线程、全局唯一 App，运行 JSCore / V8，执行 JS（App / Page）；' +
  '右边是 Native（微信），提供转发 / API 能力。视图层与逻辑层之间是双向通信、且都经 Native 中转：' +
  '视图层把事件与 API 调用转给逻辑层，逻辑层把 setData 的数据回写给视图层；逻辑层与视图层也都能经 Native 转发到原生能力。' +
  '因为中间隔了一层 Native，两层通信是异步的，setData 不会同步生效。'
</script>

<template>
  <DocFlow
    flow-id="miniprogram-dual-thread-flow"
    :nodes="nodes"
    :edges="edges"
    :legend="legend"
    :sr-text="srText"
    :height="400"
    :min-zoom="0.55"
    :max-zoom="1.25"
    hint="左 = 视图层、中 = 逻辑层、右 = Native；三层之间没有直连，箭头全部经 Native 中转且是异步的；拖拽画布可平移，按钮可缩放"
  />
</template>
