/**
 * 首页收尾「内容地图」的版式计算（骨架 `ClosingIllustration.vue` 与画布 `ClosingIllustrationCanvas.vue` 共用）。
 *
 * ★ 为什么单独抽一层：换用 @vue-flow/core 后节点坐标是世界坐标（px），
 *   面板容器必须按「世界尺寸的宽高比」用 aspect-ratio 撑开高度；
 *   两处若各算一份，容器比例与内容比例一旦不一致，整图就会被 fitView 缩小成 letterbox。
 *
 * 版式规则（全部随数据变化自动重算，不写死 5 张卡片）：
 * - 排数：`kind === 'category'` 的分组排在上排，`kind === 'growth'` 排在下排（空则不占行）；
 * - 每排横向：在固定可用宽度内「等分剩余空间」——gap = (可用宽 − 卡片数 × 卡宽) / (卡片数 − 1)，
 *   于是 3 张卡间距 174、2 张卡间距自动拉大到 480，且每排左右边缘对齐（与原静态图的观感一致）；
 * - 每排纵向：排高取该排最高卡片（卡高 = 42 + 条目数 × 20），同排较矮的卡片在本排内垂直居中；
 * - 面板高度 = 上留白 + 各排高度 + 排间距 + 下留白；中心节点落在最后两排之间的正中；
 * - 连线一律从中心节点出发、连到卡片「朝向中心节点那一侧」的边缘中点（线的两端都沿竖直方向进出）。
 */
import { categoryCount, contentMapGroups, docCount } from './topics'

/** 面板世界坐标宽度（高度由数据算出，见 MapLayout.height） */
export const MAP_PANEL_WIDTH = 1000
/** 卡片宽度：最长文案（「大屏 / H5 唤起」）+ 内边距 */
export const MAP_CARD_WIDTH = 132
/** 卡片高度：标题一行 + 每条目 20px（与画布 CSS 的 padding / line-height 严格对应） */
export const mapCardHeight = (leafCount: number): number => 42 + leafCount * 20
/** 中心节点尺寸 */
export const MAP_HUB = { width: 180, height: 72 } as const

/** 每排最外侧卡片的边缘到面板边的距离 */
const SIDE_PAD = 128
const PAD_TOP = 27
const PAD_BOTTOM = 37
/** 两排卡片之间的净空（中心节点居中在其中） */
const ROW_GAP = 152

/** 连线在节点的哪条边进出：top = 上边中点，bottom = 下边中点 */
export type MapSide = 'top' | 'bottom'

export interface MapCard {
  kind: 'card'
  id: string
  title: string
  leaves: string[]
  /** 左上角世界坐标 */
  x: number
  y: number
  width: number
  height: number
  /** 朝向中心节点的一侧（连线端点与端口圆点都在这一侧） */
  port: MapSide
}

export interface MapHub {
  kind: 'hub'
  id: string
  title: string
  subtitle: string
  x: number
  y: number
  width: number
  height: number
}

export interface MapEdge {
  source: string
  target: string
  sourceSide: MapSide
  targetSide: MapSide
}

export interface MapLayout {
  width: number
  height: number
  nodes: (MapCard | MapHub)[]
  edges: MapEdge[]
}

/** 一排 `count` 张卡片的中心 x：等分剩余空间，整体左右对齐 */
const rowCenterXs = (count: number): number[] => {
  if (count <= 0) {
    return []
  }
  if (count === 1) {
    return [MAP_PANEL_WIDTH / 2]
  }
  const usable = MAP_PANEL_WIDTH - SIDE_PAD * 2
  const gap = (usable - count * MAP_CARD_WIDTH) / (count - 1)
  return Array.from(
    { length: count },
    (_, index) => SIDE_PAD + MAP_CARD_WIDTH / 2 + index * (MAP_CARD_WIDTH + gap),
  )
}

const buildContentMapLayout = (): MapLayout => {
  const rows = [
    contentMapGroups.filter((group) => group.kind === 'category'),
    contentMapGroups.filter((group) => group.kind === 'growth'),
  ].filter((row) => row.length > 0)

  const rowHeights = rows.map((row) => Math.max(...row.map((group) => mapCardHeight(group.leaves.length))))
  const rowTops: number[] = []
  let cursor = PAD_TOP
  rowHeights.forEach((height) => {
    rowTops.push(cursor)
    cursor += height + ROW_GAP
  })
  /** 最后一行底部再补下留白 */
  const height = cursor - ROW_GAP + PAD_BOTTOM

  /** 中心节点：落在最后两排之间（两排时即为上下排正中间；只有一排时退化为面板中心） */
  const hubCenterY = rows.length >= 2 ? rowTops[rowTops.length - 1] - ROW_GAP / 2 : height / 2

  const nodes: (MapCard | MapHub)[] = []
  const edges: MapEdge[] = []

  rows.forEach((row, rowIndex) => {
    const rowCenterY = rowTops[rowIndex] + rowHeights[rowIndex] / 2
    /** 中心节点在本排下方 → 本排卡片朝下出线（端口在底边），反之在顶边 */
    const aboveHub = rowCenterY < hubCenterY

    rowCenterXs(row.length).forEach((centerX, index) => {
      const group = row[index]
      const cardHeight = mapCardHeight(group.leaves.length)
      const node: MapCard = {
        kind: 'card',
        id: `card-${rowIndex}-${index}`,
        title: group.title,
        leaves: [...group.leaves],
        x: centerX - MAP_CARD_WIDTH / 2,
        y: rowCenterY - cardHeight / 2,
        width: MAP_CARD_WIDTH,
        height: cardHeight,
        port: aboveHub ? 'bottom' : 'top',
      }
      nodes.push(node)
      edges.push({
        source: 'hub',
        target: node.id,
        sourceSide: aboveHub ? 'top' : 'bottom',
        targetSide: node.port,
      })
    })
  })

  nodes.push({
    kind: 'hub',
    id: 'hub',
    title: 'Solution',
    subtitle: `${categoryCount} 大分类 · ${docCount} 篇文档`,
    x: MAP_PANEL_WIDTH / 2 - MAP_HUB.width / 2,
    y: hubCenterY - MAP_HUB.height / 2,
    width: MAP_HUB.width,
    height: MAP_HUB.height,
  })

  return { width: MAP_PANEL_WIDTH, height, nodes, edges }
}

/** 版式只在模块加载时算一次（数据是静态的；改 topics.ts 里的分组即自动重排） */
export const contentMapLayout: MapLayout = buildContentMapLayout()
