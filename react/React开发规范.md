# React 开发规范

> 本规范综合 [React 官方文档（中文）](https://zh-hans.react.dev) 的设计理念，以及 Vercel Engineering 的 React / Next.js 性能最佳实践（8 大类、40+ 条规则，按影响程度分级）。目标是让团队在编写、评审、重构 React 代码时有一致的准则，避免常见性能陷阱与反模式。

---

## 目录

1. [核心原则](#1-核心原则)
2. [React 18+ 核心特性](#2-react-18-核心特性)
3. [组件设计基础](#3-组件设计基础)
4. [状态管理](#4-状态管理)
5. [Hooks 使用规范](#5-hooks-使用规范)
6. [消除瀑布流：异步并发（CRITICAL）](#6-消除瀑布流异步并发critical)
7. [包体积优化（CRITICAL）](#7-包体积优化critical)
8. [服务端渲染与数据获取性能（HIGH）](#8-服务端渲染与数据获取性能high)
9. [客户端数据获取（MEDIUM-HIGH）](#9-客户端数据获取medium-high)
10. [避免不必要的重渲染（MEDIUM）](#10-避免不必要的重渲染medium)
11. [渲染性能（MEDIUM）](#11-渲染性能medium)
12. [JavaScript 性能（LOW-MEDIUM）](#12-javascript-性能low-medium)
13. [高级模式（LOW）](#13-高级模式low)
14. [参考链接](#14-参考链接)

---

## 1. 核心原则

来自 React 官方文档的基础心智模型，是所有规范的出发点：

- **组件是纯函数**：给定相同的 props 和 state，组件必须渲染出相同的 JSX。不要在渲染期间修改外部变量、发起请求、修改 `document`、设置定时器——这些副作用应放在 `useEffect` 或事件处理函数中。
- **单向数据流**：数据自上而下通过 props 流动。子组件不应直接修改父组件的状态，应通过回调通知父级。
- **不可变数据（Immutability）**：永远把 state / props 当作只读。更新数组/对象时创建新引用（`[...arr]`、`toSorted()`、`{...obj}`），不要原地 `push` / `sort()` / 直接赋值。这条直接决定 React 能否正确判断是否需要重渲染。
- **UI = 函数(状态)**：把界面理解为「当前状态的纯展示」。能由现有状态派生的值，就不要单独存一份状态。
- **每个列表项必须有稳定的 `key`**：用数据自身的稳定 ID，不要用数组下标（重排时会破坏状态与 DOM 的对应）。

---

## 2. React 18+ 核心特性

React 18 引入**并发渲染（Concurrent Rendering）**与一批新 API，React 19 在其上进一步扩展。本章汇总团队在使用 React 18+ 时必须遵循的规范（标注 18 / 19 适用版本）。这些特性是后续并发优化、Suspense、资源提示等章节的基础。

### 2.1 用 createRoot 启动（React 18）

应用入口统一使用 `createRoot`，旧的 `ReactDOM.render` 已废弃并将被移除。

```tsx
// ❌ 废弃
ReactDOM.render(<App />, document.getElementById('root'))

// ✅ 正确
import { createRoot } from 'react-dom/client'
createRoot(document.getElementById('root')!).render(<App />)
```

### 2.2 自动批处理（Automatic Batching，React 18）

React 18 起，**所有** state 更新都会自动批处理为一次重渲染——包括在 `Promise`、`setTimeout`、原生 DOM 事件回调里的多次 `setState`。不要假设连续 `setState` 之间会发生中间渲染。

```tsx
// React 18：以下只会触发一次重渲染（即便位于 setTimeout 中）
setTimeout(() => {
  setCount(c => c + 1)
  setFlag(f => !f)
}, 1000)
```

极少情况下需要强制同步刷新时用 `flushSync`，但会失去批处理优势，**慎用**。

### 2.3 用并发特性处理非紧急更新（React 18）

非紧急更新（筛选、路由切换、大列表渲染等）用 `useTransition` / `startTransition` / `useDeferredValue` 让出主线程给用户输入。详见第 10 章（10.5、10.6）与第 11 章（11.9）。

### 2.4 用 useId 生成唯一 ID（React 18）

不要用自增计数器、随机数、`Math.random()` 生成 id（服务端渲染会水合不匹配）。用于表单 `label` 关联、`aria-*` 等可访问性属性。

```tsx
function Form() {
  const id = useId()
  return (
    <>
      <label htmlFor={id}>姓名</label>
      <input id={id} name="name" />
    </>
  )
}
```

### 2.5 用 useSyncExternalStore 订阅外部 store（React 18）

从外部可变数据源（Redux / Zustand / 全局事件总线 / 浏览器 API）读取时，必须用 `useSyncExternalStore` 订阅，才能在并发渲染与 SSR 下保持一致性、避免「撕裂（tearing）」。不要手写 `useState + useEffect 订阅` 的脆弱模式。

```tsx
const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
```

### 2.6 useInsertionEffect 仅用于 CSS-in-JS 库（React 18）

注入 `<style>` 标签的样式库应使用 `useInsertionEffect`（在 DOM 变更前同步执行）；普通业务代码不要用。

### 2.7 理解 StrictMode 双调用（React 18，仅开发期）

`StrictMode` 会故意双调用组件函数体与 effect（setup → cleanup → setup），以暴露不纯逻辑。因此：

- 组件函数体、effect 必须**可重入、幂等**；不要在函数体内产生副作用。
- 应用级一次性初始化用「didInit 守卫」（见 13.2）。
- 仅在开发期触发，**不影响生产**；不要为消除「双调用日志」而去掉 `StrictMode`。

### 2.8 新 JSX 转换（React 17+，18 默认）

无需 `import React from 'react'` 仅为编译 JSX；需要 API 时按名导入（`import { useState } from 'react'`）。编译期由 `react/jsx-runtime` 自动注入。

### 2.9 ref 作为普通 prop（React 19）

不再需要 `forwardRef`。函数组件可直接接收 `ref` 参数，类型用 `Ref<T>`。

```tsx
// React 19
function MyInput({ ref }: { ref: Ref<HTMLInputElement> }) {
  return <input ref={ref} />
}
// 调用：<MyInput ref={inputRef} />
```

### 2.10 Actions 与表单（React 19）

可用原生 `<form action={serverAction}>`、`<button formAction={...}>`；用 `useActionState` 管理 action 状态、`useOptimistic` 做乐观更新、`useFormStatus` 在子组件中读取表单状态。Action 可返回状态并自动处理 pending / error。

```tsx
function UpdateName() {
  const [state, formAction, isPending] = useActionState(async (_prev, formData) => {
    const error = await updateName(formData.get('name'))
    return error ? { error } : { success: true }
  }, { error: null })
  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>保存</button>
    </form>
  )
}
```

### 2.11 用 use 读取 Promise 与 Context（React 19）

`use()` 可在渲染中读取 Promise（配合 `<Suspense>`）或 Context，无需 `useContext`。注意 `use` 只能于组件或 Hook 内调用，且读取的 Promise 必须稳定（用模块级或 `useMemo` 缓存），否则每次渲染都会重新请求。

```tsx
const theme = use(ThemeContext)
async function Data() {
  const data = use(fetchData()) // 配合 <Suspense>
  return <div>{data.content}</div>
}
```

### 2.12 组件内直接渲染文档元数据（React 19）

可直接在组件中渲染 `<title>`、`<meta>`、`<link>`，React 会自动提升到 `<head>`（取代 react-helmet 等库）。

### 2.13 弃用的旧生命周期

`componentWillMount` / `componentWillReceiveProps` / `componentWillUpdate` 已废弃且不安全。新代码一律用函数组件 + Hooks；迁移旧类组件用 `getDerivedStateFromProps` / `getSnapshotBeforeUpdate` 或直接重写。

> React 19 的 `<Activity>`（见 11.4）与资源提示 API（见 11.8）也是 19 特性；React 18 可用 `<Suspense>` + `React.lazy` 实现等价能力。

---

## 3. 组件设计基础

### 2.1 不要在组件内部定义组件

**影响：HIGH（每次渲染都会卸载重建子组件）**

在组件内定义组件，每次父组件渲染都会生成新的组件类型，React 会认为是不同的组件，于是卸载旧实例、挂载新实例——丢失所有内部 state、DOM、动画，并重复执行 effect。

```tsx
// ❌ 错误：每次渲染 Avatar/Stats 都是新类型，会反复 remount
function UserProfile({ user, theme }) {
  const Avatar = () => <img src={user.avatarUrl} className={theme === 'dark' ? 'avatar-dark' : 'avatar-light'} />
  return <div><Avatar /><Stats user={user} /></div>
}

// ✅ 正确：组件定义在模块顶层，通过 props 传值
function Avatar({ src, theme }: { src: string; theme: string }) {
  return <img src={src} className={theme === 'dark' ? 'avatar-dark' : 'avatar-light'} />
}
function UserProfile({ user, theme }) {
  return <div><Avatar src={user.avatarUrl} theme={theme} /></div>
}
```

常见症状：输入框每次按键丢焦点、动画意外重启、`useEffect` 每次父级渲染都重新执行、内部滚动位置归零。

### 2.2 显式条件渲染，不用 `&&` 渲染可能为 0/NaN 的值

**影响：LOW（避免渲染出 `0`、`NaN`）**

当条件值可能是 `0`、`NaN`、空字符串等 falsy 值时，`&&` 会把这些值渲染到页面上。用三元运算符显式返回 `null`。

```tsx
// ❌ count = 0 时页面渲染出 "0"
function Badge({ count }: { count: number }) {
  return <div>{count && <span className="badge">{count}</span>}</div>
}

// ✅ count = 0 时渲染空，正确
function Badge({ count }: { count: number }) {
  return <div>{count > 0 ? <span className="badge">{count}</span> : null}</div>
}
```

### 2.3 合理拆分组件，保持单一职责

每个组件只做一件事。大的渲染块拆成小组件，便于复用、测试，也为后续 memo 化和条件渲染优化提供粒度。

---

## 4. 状态管理

### 3.1 派生状态在渲染期计算，不要存进 state

**影响：MEDIUM（避免多余渲染与状态漂移）**

如果一个值能从当前的 props / state 计算出来，不要在 `useState` 里存它、也不要在 `useEffect` 里 `setState` 去同步它。直接渲染时计算即可。

```tsx
// ❌ 错误：冗余的 state + effect，且 fullName 有滞后一帧的风险
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const [fullName, setFullName] = useState('')
  useEffect(() => { setFullName(firstName + ' ' + lastName) }, [firstName, lastName])
  return <p>{fullName}</p>
}

// ✅ 正确：渲染时派生
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const fullName = firstName + ' ' + lastName
  return <p>{fullName}</p>
}
```

参考：[官方文档：你可能不需要 effect](https://zh-hans.react.dev/learn/you-might-not-need-an-effect)

### 3.2 用函数式更新 setState

**影响：MEDIUM（防止闭包陈旧与回调重复创建）**

当新 state 依赖旧 state 时，使用 `setState(prev => ...)` 形式。它能始终基于最新值更新，让 `useCallback` 的依赖数组可以省略该 state，从而得到稳定、不会陈旧的回调。

```tsx
// ❌ 错误：回调必须依赖 items，每次 items 变化都重建；且若忘了加依赖就会用陈旧值
const removeItem = useCallback((id: string) => {
  setItems(items.filter(item => item.id !== id))
}, [])

// ✅ 正确：稳定回调，永远基于最新 state
const removeItem = useCallback((id: string) => {
  setItems(curr => curr.filter(item => item.id !== id))
}, [])
```

### 3.3 useState 延迟初始化（惰性初始化）

**影响：MEDIUM（避免每次渲染都执行昂贵计算）**

初始值计算昂贵（如 `localStorage` 解析、构建索引）时，传入函数给 `useState`，它只会执行一次；直接传值则每次渲染都会执行。

```tsx
// ❌ 错误：buildSearchIndex 每次渲染都跑（即使只用一次）
const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))

// ✅ 正确：只执行一次
const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))

// localStorage 同理
const [settings, setSettings] = useState(() => {
  const stored = localStorage.getItem('settings')
  return stored ? JSON.parse(stored) : {}
})
```

简单原始值（`useState(0)`、直接引用 props）则无需函数形式。

### 3.4 用 useRef 存储瞬态 / 高频变化值

**影响：MEDIUM（高频更新避免无谓重渲染）**

当值频繁变化、且不需要触发 UI 重渲染（鼠标轨迹、定时器、瞬时标记）时，用 `useRef` 而非 `useState`。修改 `ref.current` 不会触发重渲染。需要更新 DOM 时，结合 `ref` 直接操作节点。

```tsx
// ❌ 错误：mousemove 每次都 setState → 整组件疯狂重渲染
const [lastX, setLastX] = useState(0)
useEffect(() => {
  const onMove = (e: MouseEvent) => setLastX(e.clientX)
  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)
}, [])

// ✅ 正确：用 ref，且直接改 DOM，不重渲染
const lastXRef = useRef(0)
const dotRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  const onMove = (e: MouseEvent) => {
    lastXRef.current = e.clientX
    dotRef.current?.style.setProperty('transform', `translateX(${e.clientX}px)`)
  }
  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)
}, [])
```

---

## 5. Hooks 使用规范

### 4.1 最小化 effect 依赖

**影响：LOW（减少 effect 无意义重跑）**

依赖数组里写原始值（如 `user.id`）而非整个对象（`user`）；对于派生出的布尔值，先计算再作为依赖，避免连续数值每次变化都触发。

```tsx
// ❌ 错误：user 任意字段变化都重跑
useEffect(() => { console.log(user.id) }, [user])

// ✅ 正确：仅 id 变化才重跑
useEffect(() => { console.log(user.id) }, [user.id])

// ❌ 错误：width = 767, 766, 765... 每次都跑
useEffect(() => { if (width < 768) enableMobileMode() }, [width])

// ✅ 正确：仅在「是否移动端」布尔翻转时跑
const isMobile = width < 768
useEffect(() => { if (isMobile) enableMobileMode() }, [isMobile])
```

### 4.2 交互逻辑放进事件处理器，不要建模成 state + effect

**影响：MEDIUM（避免 effect 在不相关变更时重跑、重复触发副作用）**

由用户动作（提交、点击、拖拽）触发的副作用，直接写在事件处理函数里。不要把「已提交」写成 state 再用 effect 去发起请求——会让 effect 因其他依赖变化而重复执行。

```tsx
// ❌ 错误：把动作建模成 state + effect
function Form() {
  const [submitted, setSubmitted] = useState(false)
  const theme = useContext(ThemeContext)
  useEffect(() => {
    if (submitted) { post('/api/register'); showToast('Registered', theme) }
  }, [submitted, theme])
  return <button onClick={() => setSubmitted(true)}>Submit</button>
}

// ✅ 正确：直接在处理函数里做
function Form() {
  const theme = useContext(ThemeContext)
  function handleSubmit() { post('/api/register'); showToast('Registered', theme) }
  return <button onClick={handleSubmit}>Submit</button>
}
```

参考：[官方文档：这段代码应该移到事件处理函数中吗？](https://zh-hans.react.dev/learn/removing-effect-dependencies)

### 4.3 拆分组合 hook 中的独立计算

**影响：MEDIUM（避免独立步骤被一起重算）**

一个 `useMemo` / `useEffect` 里若包含多个依赖不同的任务，拆成独立的多个。否则任一依赖变化都会让所有任务重跑。

```tsx
// ❌ 错误：改 sortOrder 时过滤也被重算
const sortedProducts = useMemo(() => {
  const filtered = products.filter(p => p.category === category)
  return filtered.toSorted((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price)
}, [products, category, sortOrder])

// ✅ 正确：过滤与排序各自独立
const filteredProducts = useMemo(
  () => products.filter(p => p.category === category),
  [products, category]
)
const sortedProducts = useMemo(
  () => filteredProducts.toSorted((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price),
  [filteredProducts, sortOrder]
)
```

### 4.4 简单表达式不要包 useMemo

**影响：LOW-MEDIUM（useMemo 自身开销可能比表达式还大）**

表达式简单（少量逻辑/算术运算符）、结果是原始类型（boolean/number/string）时，不要用 `useMemo`。比较 hook 依赖的开销可能超过表达式本身。

```tsx
// ❌ 错误
const isLoading = useMemo(() => user.isLoading || notifications.isLoading, [user.isLoading, notifications.isLoading])

// ✅ 正确
const isLoading = user.isLoading || notifications.isLoading
```

---

## 6. 消除瀑布流（异步并发）CRITICAL

**瀑布流（waterfall）是头号性能杀手**：每个串行的 `await` 都会叠加一整轮网络/IO 延迟。消除它能带来 2–10× 的提升。

### 5.1 用 Promise.all 并发独立请求

```tsx
// ❌ 串行，3 轮往返
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// ✅ 并行，1 轮往返
const [user, posts, comments] = await Promise.all([
  fetchUser(), fetchPosts(), fetchComments()
])
```

### 5.2 先判断廉价同步条件，再 await 远程/异步标记

组合「异步标记 + 廉价同步条件」（`flag && cheapCondition`）时，先判断廉价的同步条件（本地 props、请求元数据、已加载 state）。若同步条件为 false，就不必付出异步调用的代价。

```tsx
// ❌ 错误：即使 someCondition 为假也先发了 getFlag 请求
const someFlag = await getFlag()
if (someCondition && someFlag) { /* ... */ }

// ✅ 正确：先判同步条件，命中才发请求
if (someCondition) {
  const someFlag = await getFlag()
  if (someFlag) { /* ... */ }
}
```

若同步条件本身很昂贵或依赖该标记，则保持原顺序。

### 5.3 把 await 推迟到真正需要的分支

```tsx
// ❌ 错误：skipProcessing 为 true 时仍白等 userData
async function handle(skip: boolean) {
  const userData = await fetchUserData(userId)
  if (skip) return { skipped: true }
  return process(userData)
}

// ✅ 正确：只在需要的分支 fetch
async function handle(skip: boolean) {
  if (skip) return { skipped: true }
  const userData = await fetchUserData(userId)
  return process(userData)
}
```

另一个例子：先取资源，找不到就早返回，找到再取权限——避免在「资源不存在」的热路径上白取权限：

```tsx
// ✅ 正确
async function updateResource(resourceId, userId) {
  const resource = await getResource(resourceId)
  if (!resource) return { error: 'Not found' }
  const permissions = await fetchPermissions(userId)
  if (!permissions.canEdit) return { error: 'Forbidden' }
  return updateResourceData(resource, permissions)
}
```

### 5.4 依赖驱动的并行化

存在「部分依赖」时，让每个任务在最早可能的时刻启动。无额外依赖的做法：先创建所有 promise，最后再 `Promise.all`。（需要更精细的 DAG 可用 `better-all` 等工具。）

```tsx
// profile 依赖 user.id，但又想和 config 并行：
const userPromise = fetchUser()
const profilePromise = userPromise.then(user => fetchProfile(user.id))
const [user, config, profile] = await Promise.all([
  userPromise, fetchConfig(), profilePromise
])
```

### 5.5 用 Suspense 边界流式渲染

不要在一个异步组件里 `await` 数据之后再返回 JSX，导致整个页面（含侧栏/页脚）都被阻塞。把需要数据的部分包进 `<Suspense>`，让外壳先渲染、数据再流入。多个组件可共享同一个 promise（`use(promise)`），只发一次请求。

```tsx
// ✅ 外壳立即渲染，只有 DataDisplay 等待数据
function Page() {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
      <Footer />
    </div>
  )
}
async function DataDisplay() {
  const data = await fetchData()
  return <div>{data.content}</div>
}
```

**何时不用**：影响布局的关键数据、首屏 SEO 关键内容、小且快的查询（Suspense 开销不值）、需避免布局抖动（loading→content 跳动）的场景。

---

## 7. 包体积优化（CRITICAL）

减小首屏 JS 体积，直接改善可交互时间（TTI）与最大内容绘制（LCP）。

### 6.1 避免 barrel 文件（桶文件）导入

**影响：CRITICAL（200–800ms 导入成本，构建变慢）**

`import { Check, X } from 'lucide-react'` 这类会从入口文件（可能 re-export 上千个模块）加载整个库，拖慢 dev 启动与冷启动。Next.js 13.5+ 会自动把这种导入改写成直接导入；非 Next.js 项目请直接 deep import：

```tsx
// ❌ 错误：拖入整个库
import { Button, TextField } from '@mui/material'

// ✅ 正确（非 Next 项目）：只加载用到的模块
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
```

> 注意：部分库（如 `lucide-react`）的深路径未提供 `.d.ts`，直接 deep import 会得到 `any`。优先使用对应框架的 `optimizePackageImports` 等能力，或确认库对子路径导出类型后再使用。

常见受影响库：`lucide-react`、`@mui/material`、`@tabler/icons-react`、`react-icons`、`@radix-ui/react-*`、`lodash`、`date-fns`、`rxjs`、`react-use`。

### 6.2 动态导入重型组件

**影响：CRITICAL（直接影响 TTI / LCP）**

首屏不需要的大组件（如 Monaco 编辑器、图表、PDF 预览）用 `React.lazy` / `next/dynamic` 按需加载。

```tsx
import { lazy, Suspense } from 'react'
const MonacoEditor = lazy(() => import('./monaco-editor'))

function CodePanel({ code }: { code: string }) {
  return <Suspense fallback={<Skeleton />}><MonacoEditor value={code} /></Suspense>
}
```

### 6.3 条件加载 / 延迟加载非关键三方库

**影响：MEDIUM–HIGH**

分析、日志、错误上报等不阻塞交互的库，放到 hydrate 之后或功能激活时再加载。

```tsx
// 仅在编辑器功能启用时才加载对应大模块（typeof window 判断可避免 SSR 打包）
useEffect(() => {
  if (flags.editorEnabled && typeof window !== 'undefined') {
    void import('./monaco-editor').then(mod => mod.init())
  }
}, [flags.editorEnabled])
```

### 6.4 基于用户意图预加载

**影响：MEDIUM（降低感知延迟）**

在 hover/focus 大块功能按钮时，提前 `import()` 对应模块，让点击时瞬时打开。

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => { if (typeof window !== 'undefined') void import('./monaco-editor') }
  return <button onMouseEnter={preload} onFocus={preload} onClick={onClick}>Open Editor</button>
}
```

### 6.5 使用静态可分析的导入 / 文件路径

**影响：HIGH（避免过宽的打包与文件追踪）**

把真实路径写在字面量里，或用「键 → `() => import(...)`」的显式映射，而不是把路径藏在变量里动态拼接。打包器无法静态分析动态路径，只能把一大片文件都打进来，导致服务端包更大、构建更慢、冷启动更慢、内存更贵。

```tsx
// ❌ 错误：打包器不知道会导入什么
const Page = await import(PAGE_MODULES[pageName])

// ✅ 正确：每个路径都是字面量、可分析
const PAGE_MODULES = {
  home: () => import('./pages/home'),
  settings: () => import('./pages/settings'),
} as const
const Page = await PAGE_MODULES[pageName]()
```

这一原则对服务端的 `fs` 文件读取同样适用：用字面量路径（`path.join(cwd, 'content/blog')`）而非拼变量，避免打包器把过大的目录纳入文件追踪。

---

## 8. 服务端渲染与数据获取性能（HIGH）

> 本章规则主要针对 React Server Components（RSC）/ SSR / Next.js 场景。纯客户端（CSR）项目可跳过，但 **7.3 共享模块可变状态** 与 **7.5 静态 I/O 提升** 的并发安全思想对服务端渲染通用。

### 7.1 像保护 API 一样鉴权 Server Action

**影响：CRITICAL（防止未授权变更）**

带 `"use server"` 的函数和 API 路由一样是公开端点，可直接被调用。必须在每个 Action 内部校验身份与权限，不要只依赖 middleware / layout / 页面层检查。

```tsx
'use server'
import { verifySession } from '@/lib/auth'

export async function deleteUser(userId: string) {
  const session = await verifySession()
  if (!session) throw new Error('Unauthorized')
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw new Error('Cannot delete other users')
  }
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

先校验输入（如 zod），再鉴权，最后才执行变更。

### 7.2 避免 RSC Props 中重复序列化

**影响：LOW–HIGH（按数据类型）**

RSC→客户端序列化按「对象引用」去重，不是按值。同一引用只序列化一次；新建引用（`toSorted()` / `filter()` / `map()` / `{...obj}`）就会被重新序列化。因此转换应放在客户端做，服务端只传原始数据。

```tsx
// ❌ 错误：数组被序列化两次（6 个字符串而非 3 个）
<ClientList usernames={usernames} usernamesOrdered={usernames.toSorted()} />

// ✅ 正确：服务端只传一次，客户端用 useMemo 转换
// RSC: <ClientList usernames={usernames} />
// Client: const sorted = useMemo(() => [...usernames].sort(), [usernames])
```

`string[]`/`number[]` 重复序列化代价最高（整段复制）；`object[]` 仅数组结构重复，内部对象仍按引用去重。`toSorted()`/`filter()`/`map()`/`slice()`/`[...arr]`/`{...obj}` 都会产生新引用、破坏去重。例外：转换很贵且客户端不需要原始数据时，才在服务端传派生结果。

### 7.3 服务端不要用共享模块可变状态承载请求数据

**影响：HIGH（防止并发串数据与越权）**

RSC / SSR 期间，多个请求会在同一进程并发渲染。用可变模块级变量（如 `let currentUser`）在组件间传请求作用域数据时，请求 A 写入后可能被请求 B 覆盖，导致 **跨请求数据泄漏**（一个用户看到另一个用户的数据）。把请求数据作为 props 在渲染树内传递。

```tsx
// ❌ 错误：并发请求下 currentUser 会被相互覆盖
let currentUser: User | null = null
export default async function Page() {
  currentUser = await auth()
  return <Dashboard />
}

// ✅ 正确：数据随渲染树传递
export default async function Page() {
  const user = await auth()
  return <Dashboard user={user} />
}
```

安全例外：模块级只放不可变静态资源/配置、设计正确且按 key 隔离的跨请求缓存（见 8.4）、不存请求/用户可变状态的进程级单例。

### 7.4 跨请求用 LRU 缓存（React.cache 仅单请求）

**影响：HIGH（跨请求复用）**

`React.cache()` 只在单次请求内去重。对「用户连续多次操作命中同一数据」的跨请求复用，用 LRU 缓存。

```tsx
import { LRUCache } from 'lru-cache'
const cache = new LRUCache<string, any>({ max: 1000, ttl: 5 * 60 * 1000 })

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached
  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}
```

> Next.js 中 `fetch` 默认带请求内去重；`React.cache()` 主要用于 DB 查询、鉴权、重计算等非 fetch 异步工作。

### 7.5 把静态 I/O 提升到模块级

**影响：HIGH（避免每个请求重复文件/网络 I/O）**

在 route handler / server function 里加载字体、logo、配置、模板等静态资源时，把 I/O 提升到模块级——模块首次导入时执行一次，而非每次请求都执行。注意字体/网络读取应 `await` 已发起的 promise，或同步读取放到模块顶层。

```tsx
// ✅ 正确：模块级只加载一次
const fontData = fetch(new URL('./fonts/Inter.ttf', import.meta.url)).then(r => r.arrayBuffer())
const configPromise = fs.readFile('./config.json', 'utf-8').then(JSON.parse)

export async function GET() {
  const [font, config] = await Promise.all([fontData, configPromise])
  return render(font, config)
}
```

不适用：随请求/用户变化的资源、运行时会变需 TTL 的文件、会撑爆内存的大文件、不应常驻内存的敏感数据。

### 7.6 最小化 RSC 边界序列化

**影响：HIGH（减小传输体积）**

RSC/客户端边界会把所有对象属性序列化进 HTML 与后续 RSC 负载，直接决定页面体积。只传客户端真正用到的字段。

```tsx
// ❌ 错误：序列化 50 个字段，客户端只用 1 个
async function Page() {
  const user = await fetchUser() // 50 fields
  return <Profile user={user} />
}

// ✅ 正确：只传 1 个字段
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}
```

### 7.7 用组件组合实现并行数据获取

**影响：CRITICAL（消除服务端瀑布流）**

React Server Component 在树内是顺序执行的。把各自 `await` 数据的子组件提升到同一层级（或用 `children` 组合），让它们并发执行，而不是一个等另一个。

```tsx
// ❌ 错误：Sidebar 等 Page 的 fetchHeader 完成才开始
export default async function Page() {
  const header = await fetchHeader()
  return <div><div>{header}</div><Sidebar /></div>
}
async function Sidebar() { const items = await fetchSidebarItems(); return <nav>{/* ... */}</nav> }

// ✅ 正确：Header 与 Sidebar 并发
async function Header() { const data = await fetchHeader(); return <div>{data}</div> }
async function Sidebar() { const items = await fetchSidebarItems(); return <nav>{/* ... */}</nav> }
export default function Page() {
  return <div><Header /><Sidebar /></div>
}
```

### 7.8 嵌套数据并行获取

**影响：CRITICAL（消除服务端瀑布流）**

并行获取嵌套数据时，把每个 item 的依赖链包在各自的 promise 里，避免「一个慢 item 阻塞其余 item 的下一步」。

```tsx
// ❌ 错误：某个 getChat 很慢，会卡住其他 99 个 author 的获取
const chats = await Promise.all(chatIds.map(id => getChat(id)))
const chatAuthors = await Promise.all(chats.map(chat => getUser(chat.author)))

// ✅ 正确：每个 item 独立链式 getChat → getUser
const chatAuthors = await Promise.all(
  chatIds.map(id => getChat(id).then(chat => getUser(chat.author)))
)
```

### 7.9 用 React.cache 做单请求去重

**影响：MEDIUM（请求内去重）**

```tsx
import { cache } from 'react'
export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
})
```

**注意**：`React.cache()` 用 `Object.is` 浅比较缓存命中，内联对象 `{uid:1}` 每次调用都是新引用，永远不命中。必须传同一个引用，或传原始值。

### 7.10 用 after() 执行非阻塞操作

**影响：MEDIUM（更快响应）**

日志、分析、通知、缓存失效、清理等非关键副作用，用 `after()`（Next.js）安排在响应发出后再执行，不阻塞响应。

```tsx
import { after } from 'next/server'
export async function POST(request: Request) {
  await updateDatabase(request)
  after(async () => { logUserAction(/* ... */) })
  return new Response(JSON.stringify({ status: 'success' }))
}
```

---

## 9. 客户端数据获取（MEDIUM-HIGH）

### 8.1 用 SWR 等库自动去重

**影响：MEDIUM-HIGH**

同一条请求在多个组件实例间只发一次，自带缓存与重新校验。

```tsx
// ❌ 错误：每个实例各自 fetch
function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setUsers) }, [])
}

// ✅ 正确：多实例共享一个请求
import useSWR from 'swr'
function UserList() {
  const { data: users } = useSWR('/api/users', fetcher)
}
```

不可变数据用 `useSWRImmutable`；变更用 `useSWRMutation`。

### 8.2 重复事件监听要去重

**影响：LOW（N 个实例 = 1 个监听）**

全局事件（键盘、resize、scroll）应只挂一个原生监听，用模块级 `Map<string, Set<fn>>` 收集各组件回调，组件卸载且回调清空时再移除原生监听（或在 effect 内用 `useEffectEvent` 维持稳定引用，见 13.3）。

```tsx
const keyCallbacks = new Map<string, Set<() => void>>()
function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    if (!keyCallbacks.has(key)) keyCallbacks.set(key, new Set())
    keyCallbacks.get(key)!.add(callback)
    return () => {
      const set = keyCallbacks.get(key)
      if (set) { set.delete(callback); if (set.size === 0) keyCallbacks.delete(key) }
    }
  }, [key, callback])

  useSWRSubscription('global-keydown', () => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && keyCallbacks.has(e.key)) keyCallbacks.get(e.key)!.forEach(cb => cb())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
}
```

### 8.3 滚动等监听使用 passive

**影响：MEDIUM（消除滚动卡顿）**

`touchstart` / `wheel` 等不需要 `preventDefault()` 的监听，加 `{ passive: true }`，浏览器无需等待监听器判断是否阻止默认行为，可立即滚动。需要 `preventDefault()` 的自定义手势/缩放监听不要用 passive。

```tsx
useEffect(() => {
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY)
  document.addEventListener('wheel', handleWheel, { passive: true })
  return () => document.removeEventListener('wheel', handleWheel)
}, [])
```

### 8.4 localStorage 数据要版本化、最小化、try-catch 包裹

**影响：MEDIUM（防 schema 冲突、减小存储、避免异常）**

键名加版本前缀；只存 UI 真正需要的字段（不要整对象序列化，避免泄露 token/PII）；`getItem`/`setItem` 在隐私模式、配额满、被禁用时会抛异常，必须 try-catch；必要时提供 v1→v2 迁移函数。

```tsx
const VERSION = 'v2'
function saveConfig(config: { theme: string; language: string }) {
  try { localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config)) } catch {}
}
function loadConfig() {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`)
    return data ? JSON.parse(data) : null
  } catch { return null }
}
```

---

## 10. 避免不必要的重渲染（MEDIUM）

### 9.1 提取到 memo 化组件

**影响：MEDIUM（让昂贵计算可被提前 return 跳过）**

把昂贵工作放进 `memo()` 组件，父组件在「加载中」等分支可提前 return，从而完全跳过子组件的计算（而不仅是用 `useMemo` 包裹一个 JSX 变量——那样即使不渲染也会先算出来）。

```tsx
// ✅ 加载时直接返回 Skeleton，UserAvatar 的计算被跳过
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})
function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return <UserAvatar user={user} />
}
```

> 若项目启用了 **React Compiler**，无需手写 `memo()` / `useMemo()`，编译器会自动优化重渲染。

### 9.2 memo 化组件的默认非基本类型参数要提到常量

**影响：MEDIUM（恢复 memo 的缓存效果）**

`memo()` 靠严格相等比较 props。若可选参数（函数、对象、数组）有默认值，且每次渲染都生成新实例，则 memo 永远命中失败。把默认值提为模块级常量。

```tsx
// ❌ 错误：不传 onClick 时，每次渲染都是不同的 () => {}
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: { onClick?: () => void }) { /* ... */ })

// ✅ 正确：稳定默认
const NOOP = () => {};
const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: { onClick?: () => void }) { /* ... */ })
```

### 9.3 订阅派生状态，而非连续值

**影响：MEDIUM（降低重渲染频率）**

不要订阅每像素变化的连续值（如窗口宽度），而是订阅派生出的布尔（如 `isMobile`）。这样只有布尔翻转时才重渲染。

```tsx
// ❌ 错误：宽度每变一点就重渲染
const width = useWindowWidth()
const isMobile = width < 768

// ✅ 正确：只有「是否移动端」变化才重渲染
const isMobile = useMediaQuery('(max-width: 767px)')
```

### 9.4 延迟状态读取到使用点

**影响：MEDIUM（避免不必要的订阅）**

如果某动态状态（如 searchParams、localStorage 值）只在事件回调里用到，就不要订阅它——直接在回调里读取，等于不订阅、不重渲染。

```tsx
// ❌ 错误：订阅了所有 searchParams 变化，但只在点击时读一次
function ShareButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams()
  const handleShare = () => { const ref = searchParams.get('ref'); shareChat(chatId, { ref }) }
  return <button onClick={handleShare}>Share</button>
}

// ✅ 正确：点击时才读，无订阅
function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    shareChat(chatId, { ref })
  }
  return <button onClick={handleShare}>Share</button>
}
```

### 9.5 用 Transition 标记非紧急更新

**影响：MEDIUM（保持 UI 响应）**

高频、非紧急的 state 更新（如滚动位置、非受控筛选）用 `startTransition` / `useTransition` 包裹，让 React 优先处理用户输入，把非紧急更新排到空闲时。

```tsx
import { startTransition } from 'react'
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => startTransition(() => setScrollY(window.scrollY))
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

`useTransition` 还自带 `isPending` 状态，比手动 `useState` 管理 loading 更清晰、可中断、出错也能正确复位（见 11.9）。

### 9.6 用 useDeferredValue 兜底昂贵派生渲染

**影响：MEDIUM（输入保持灵敏）**

用户输入触发昂贵计算（大列表筛选、图表）时，用 `useDeferredValue` 让输入框优先更新、昂贵结果滞后渲染。

```tsx
function Search({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const filtered = useMemo(
    () => items.filter(item => fuzzyMatch(item, deferredQuery)),
    [items, deferredQuery]
  )
  const isStale = query !== deferredQuery
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.7 : 1 }}><ResultsList results={filtered} /></div>
    </>
  )
}
```

> 必须把昂贵计算放进 `useMemo` 且依赖 deferred 值，否则每次渲染仍会执行。

---

## 11. 渲染性能（MEDIUM）

### 10.1 长列表用 content-visibility

**影响：HIGH（首屏快 10×）**

对离屏容器加 `content-visibility: auto` 配合 `contain-intrinsic-size`，浏览器会跳过离屏元素的布局与绘制。

```css
.message-item { content-visibility: auto; contain-intrinsic-size: 0 80px; }
```

### 10.2 静态 JSX 提升到组件外

**影响：LOW（避免每次渲染重建）**

完全静态、不依赖 props 的 JSX（尤其大段 SVG）定义到模块顶层常量，复用同一对象引用。

```tsx
const loadingSkeleton = <div className="animate-pulse h-20 bg-gray-200" />
function Container() {
  return <div>{loading && loadingSkeleton}</div>
}
```

> React Compiler 会自动做此优化。

### 10.3 动画包一层 div，而不是直接动画 SVG

**影响：LOW（启用硬件加速）**

多数浏览器对 SVG 元素的 CSS 动画不做硬件加速。把 SVG 包进 `<div>` 再对 div 做 `transform` / `opacity` 动画，可走 GPU 加速。此原则适用于所有 CSS transform/transition（`translate`/`scale`/`rotate`）。

### 10.4 用 Activity 组件做显示/隐藏

**影响：MEDIUM（保留 state / DOM）**

频繁切换显隐、且内部昂贵的组件，用 `<Activity mode={visible ? 'visible' : 'hidden'}>` 保留其状态与 DOM，避免昂贵的重渲染与状态丢失。

```tsx
import { Activity } from 'react'
function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

### 10.5 脚本标签加 defer / async

**影响：HIGH（消除渲染阻塞）**

无 `defer`/`async` 的 `<script>` 会阻塞 HTML 解析。`defer`：并行下载、解析完执行、保持顺序；`async`：下载完立即执行、无顺序保证。依赖 DOM/其他脚本用 `defer`，独立脚本（如分析统计）用 `async`。Next.js 中优先使用 `next/script` 的 `strategy`。

### 10.6 SVG 坐标精度精简

**影响：LOW（减小体积）**

用 SVGO 等工具把路径坐标精度压到 1 位小数，显著降低 SVG 文件大小：`npx svgo --precision=1 --multipass icon.svg`。

### 10.7 服务端渲染：避免水合不一致

- **不要用 localStorage/cookie 直接在 SSR 渲染**：服务端没有这些 API，会抛错。需要「主题/偏好」等客户端数据时，用内联脚本在 hydrate 前同步写入 DOM（避免闪屏）；或在客户端 effect 中读取（会有一次闪烁，按需权衡）。
- **预期内的不一致**用 `suppressHydrationWarning` 抑制警告（如随机 ID、日期、时区格式化），但不要用它掩盖真实 bug。

### 10.8 用 React DOM 资源提示（Resource Hints）

**影响：HIGH（提前加载关键资源，减少加载时间）**

React DOM 提供一组 API，让浏览器提前准备即将用到的资源（在 Server Component 中尤其有效，可在客户端收到 HTML 前就开始加载）：

- `prefetchDNS(href)` — 预解析将连接的域名
- `preconnect(href)` — 建立连接（DNS+TCP+TLS）
- `preload(href, options)` — 预取将用到的资源（字体/样式/脚本/图片）
- `preloadModule(href)` — 预取 ES 模块
- `preinit(href, options)` — 预取并执行样式表/脚本
- `preinitModule(href)` — 预取并执行 ES 模块

```tsx
import { preconnect, prefetchDNS, preload, preinit } from 'react-dom'

// 提前连第三方 API 与解析分析域名
function App() {
  prefetchDNS('https://analytics.example.com')
  preconnect('https://api.example.com')
  return <main />
}

// 提前加载关键字体与关键样式
function RootLayout({ children }) {
  preload('/fonts/inter.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  preinit('/styles/critical.css', { as: 'style' })
  return <html><body>{children}</body></html>
}
```

### 10.9 用 useTransition 替代手写 loading 状态

**影响：LOW（减少重渲染、代码更清晰）**

非紧急异步更新用 `useTransition` 自带 `isPending`，比手动 `useState` 管 `isLoading` 更优：自动 pending 状态、出错也能正确复位、保持响应、新 transition 自动取消旧的。

```tsx
import { useTransition, useState } from 'react'
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value) // 输入立即更新
    startTransition(async () => {
      const data = await fetchResults(value)
      setResults(data)
    })
  }
  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

---

## 12. JavaScript 性能（LOW-MEDIUM）

热路径上的微优化叠加起来也很可观。

### 11.1 避免布局抖动（Layout Thrashing）

**影响：MEDIUM**

不要在修改样式的过程中穿插读取布局属性（`offsetWidth`、`getBoundingClientRect()`、`getComputedStyle()`），这会迫使浏览器同步回流。先批量写、再读一次；或优先用 CSS class 切换代替内联样式。

```tsx
// ❌ 错误：写→读→写→读，强制多次回流
function Box({ isHighlighted }) {
  useEffect(() => {
    if (ref.current && isHighlighted) {
      ref.current.style.width = '100px'
      const w = ref.current.offsetWidth // 强制布局
      ref.current.style.height = '200px'
    }
  }, [isHighlighted])
  return <div ref={ref}>Content</div>
}

// ✅ 正确：用 class 切换
function Box({ isHighlighted }) {
  return <div className={isHighlighted ? 'highlighted-box' : ''}>Content</div>
}
```

### 11.2 用 Map/Set 做 O(1) 查找

**影响：LOW-MEDIUM（O(n) → O(1)）**

反复用 `.find()` / `.includes()` 按同一 key 查找时，先建 `Map` / `Set`。1000×1000 的匹配可从 1M 次降到 2K 次。

```tsx
const userById = new Map(users.map(u => [u.id, u]))
orders.map(o => ({ ...o, user: userById.get(o.userId) }))
```

### 11.3 缓存属性访问 / 函数结果 / 存储读取

**影响：LOW-MEDIUM**

- 循环里把 `obj.a.b.c` 与 `arr.length` 提到循环外。
- 渲染期重复调用同一纯函数（如 `slugify`），用模块级 `Map` 缓存结果（比 hook 更通用，可在工具函数/事件处理器中使用）。
- `localStorage` / `sessionStorage` / `document.cookie` 是同步且昂贵的，用内存 `Map` 缓存读取，写入时同步更新缓存，并在 `storage` / `visibilitychange` 事件中失效（外部变更如其他标签页写入时需使缓存失效）。

### 11.4 合并多次数组迭代

**影响：LOW-MEDIUM**

多次 `.filter()` / `.map()` 会多次遍历。需要按同一遍历分出多组结果时，用单趟 `for` 循环。

### 11.5 数组比较先比长度

**影响：MEDIUM-HIGH**

排序/深比较/序列化前先判 `length`。长度不同必不相等，可 O(1) 提前返回，省去排序与拼接开销，且避免改动原数组。

### 11.6 函数内早返回

**影响：LOW-MEDIUM**

结果已确定时立即 `return`，跳过无关计算（如校验时发现第一个错误就返回）。

### 11.7 把 RegExp 提到模块作用域或用 useMemo

**影响：LOW-MEDIUM**

渲染期 `new RegExp` 每次都重建。固定正则提为模块常量；依赖变量（如 `query`）的用 `useMemo` 包裹。注意带 `g` 标志的正则有可变的 `lastIndex` 状态，复用时要小心。

### 11.8 用 flatMap 一次完成「映射+过滤」

**影响：LOW-MEDIUM**

`.map().filter(Boolean)` 会产生中间数组并遍历两次，改用 `.flatMap()` 单趟完成。

```tsx
const userNames = users.flatMap(user => user.isActive ? [user.name] : [])
```

### 11.9 求最值用循环而非 sort

**影响：LOW（O(n) 替代 O(n log n)）**

只求最大/最小元素时，单趟循环即可，不必对整个数组排序。小数组可用 `Math.min(...arr)` / `Math.max(...arr)`，但超大数组会因 spread 限制报错，用循环更稳。

### 11.10 用 toSorted 保持不可变

**影响：MEDIUM-HIGH（防 React state 被原地修改的 bug）**

`.sort()` 原地修改数组，会破坏 React 的不可变模型，导致状态漂移、陈旧闭包。用 `.toSorted()` 返回新数组；旧环境回退用 `[...arr].sort()`。同类不可变方法：`.toReversed()`、`.toSpliced()`、`.with()`。

```tsx
// ❌ 错误：直接修改了 users prop 数组
const sorted = useMemo(() => users.sort((a, b) => a.name.localeCompare(b.name)), [users])

// ✅ 正确：生成新数组，原数组不变
const sorted = useMemo(() => users.toSorted((a, b) => a.name.localeCompare(b.name)), [users])
```

---

## 13. 高级模式（LOW）

### 12.1 不要在依赖数组里放 Effect Event

`useEffectEvent` 返回的函数身份故意每次渲染都变化，放入 `useEffect` 依赖会导致 effect 每次渲染都重跑并触发 lint 报错。只把真正的响应式值放依赖，Effect Event 在 effect 内部调用。

```tsx
import { useEffect, useEffectEvent } from 'react'
function ChatRoom({ roomId, onConnected }) {
  const handleConnected = useEffectEvent(onConnected)
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.on('connected', handleConnected)
    connection.connect()
    return () => connection.disconnect()
  }, [roomId]) // 不含 handleConnected
}
```

### 12.2 应用级初始化只做一次

**影响：LOW-MEDIUM**

「整个应用只应初始化一次」的逻辑（加载本地存储、校验 token）不要放进组件的 `useEffect([])`——开发模式 StrictMode 下会执行两次，且组件重挂载会重跑。用模块级 `didInit` 守卫，或用入口模块顶层初始化。

```tsx
let didInit = false
function Comp() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    loadFromStorage()
    checkAuthToken()
  }, [])
  // ...
}
```

### 12.3 把事件处理函数存进 ref（或 useEffectEvent）

**影响：LOW**

传给 effect 的回调若不希望它变化导致 effect 重订阅，用 `useEffectEvent` 包裹（最新版 React）；或存进 `useRef`，在 effect 内调用 `ref.current`，依赖数组只放事件名。

```tsx
import { useEffectEvent } from 'react'
function useWindowEvent(event: string, handler: (e: any) => void) {
  const onEvent = useEffectEvent(handler)
  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

### 12.4 useEffectEvent 用于稳定回调引用

**影响：LOW（防止 effect 重跑、避免陈旧闭包）**

在回调里访问最新值，又不把这些值放进依赖数组——用 `useEffectEvent` 创建「身份稳定、永远调用最新 handler」的引用，从而既不让 effect 因回调变化而重跑，又不会拿到陈旧闭包。

```tsx
import { useEffectEvent } from 'react'
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchEvent = useEffectEvent(onSearch)
  useEffect(() => {
    const timeout = setTimeout(() => onSearchEvent(query), 300)
    return () => clearTimeout(timeout)
  }, [query]) // 不含 onSearch
}
```

---

## 14. 参考链接

- [React 官方文档（中文）](https://zh-hans.react.dev)
- [React：你可能不需要 effect](https://zh-hans.react.dev/learn/you-might-not-need-an-effect)
- [React：移除 effect 依赖](https://zh-hans.react.dev/learn/removing-effect-dependencies)
- [React Compiler](https://zh-hans.react.dev/learn/react-compiler)
- [React DOM 资源预加载 API](https://react.dev/reference/react-dom#resource-preloading-apis)
- [useTransition](https://react.dev/reference/react/useTransition)
- [useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- [React.cache](https://react.dev/reference/react/cache)
- [Vercel：Next.js package imports 优化](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [Vercel React Best Practices（本规范主要参考来源）](https://github.com/vercel/react-best-practices)

---

> **落地建议**
> - 优先处理 CRITICAL 级：消除瀑布流、减小包体积，收益最大。
> - HIGH 级里最容易踩坑的是 **服务端共享模块可变状态（8.3）** 与 **RSC 边界过度序列化（8.2 / 8.6）**，多请求并发下会直接引发数据串号等线上问题。
> - 若项目启用 **React Compiler**，可省去大量手写 `memo` / `useMemo` / 静态 JSX 提升，但函数式 `setState`、`useDeferredValue`、`startTransition`、不可变更新等仍然 Recommended。
> - 评审代码时必须拦截的反模式：
>   1. 在组件内部定义组件（3.1）
>   2. 用 `&&` 渲染可能为 0/NaN 的值（3.2）
>   3. 用 `.sort()` 原地修改 state（12.10）
>   4. 昂贵计算不 memo / 不 `useMemo`（10.1 / 10.6）
>   5. 服务端用可变模块级变量承载请求数据（8.3）
>   6. 不必要的 barrel 导入拖慢冷启动（7.1）
