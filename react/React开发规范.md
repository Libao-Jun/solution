# React 开发规范

> 本规范综合 [React 官方文档（中文）](https://zh-hans.react.dev) 的设计理念，以及 Vercel Engineering 的 React / Next.js 性能最佳实践（8 大类、40+ 条规则，按影响程度分级）。目标是让团队在编写、评审、重构 React 代码时有一致的准则，避免常见性能陷阱与反模式。

---

## 目录

1. [核心原则](#1-核心原则)
2. [组件设计基础](#2-组件设计基础)
3. [状态管理](#3-状态管理)
4. [Hooks 使用规范](#4-hooks-使用规范)
5. [消除瀑布流：异步并发（CRITICAL）](#5-消除瀑布流异步并发critical)
6. [包体积优化（CRITICAL）](#6-包体积优化critical)
7. [客户端数据获取（MEDIUM-HIGH）](#7-客户端数据获取medium-high)
8. [避免不必要的重渲染（MEDIUM）](#8-避免不必要的重渲染medium)
9. [渲染性能（MEDIUM）](#9-渲染性能medium)
10. [JavaScript 性能（LOW-MEDIUM）](#10-javascript-性能low-medium)
11. [高级模式（LOW）](#11-高级模式low)
12. [参考链接](#12-参考链接)

---

## 1. 核心原则

来自 React 官方文档的基础心智模型，是所有规范的出发点：

- **组件是纯函数**：给定相同的 props 和 state，组件必须渲染出相同的 JSX。不要在渲染期间修改外部变量、发起请求、修改 `document`、设置定时器——这些副作用应放在 `useEffect` 或事件处理函数中。
- **单向数据流**：数据自上而下通过 props 流动。子组件不应直接修改父组件的状态，应通过回调通知父级。
- **不可变数据（Immutability）**：永远把 state / props 当作只读。更新数组/对象时创建新引用（`[...arr]`、`toSorted()`、`{...obj}`），不要原地 `push` / `sort()` / 直接赋值。这条直接决定 React 能否正确判断是否需要重渲染。
- **UI = 函数(状态)**：把界面理解为「当前状态的纯展示」。能由现有状态派生的值，就不要单独存一份状态。
- **每个列表项必须有稳定的 `key`**：用数据自身的稳定 ID，不要用数组下标（重排时会破坏状态与 DOM 的对应）。

---

## 2. 组件设计基础

### 2.1 不要在组件内部定义组件

**影响：HIGH（每次渲染都会卸载重建子组件）**

在组件内定义组件，每次父组件渲染都会生成新的组件类型，React 会认为是不同的组件，于是卸载旧实例、挂载新实例——丢失所有内部 state、DOM、动画，并重复执行 effect。

```tsx
// ❌ 错误：每次渲染 Avatar/Stats 都是新类型，会反复 remount
function UserProfile({ user, theme }) {
  const Avatar = () => (
    <img
      src={user.avatarUrl}
      className={theme === "dark" ? "avatar-dark" : "avatar-light"}
    />
  );
  return (
    <div>
      <Avatar />
      <Stats user={user} />
    </div>
  );
}

// ✅ 正确：组件定义在模块顶层，通过 props 传值
function Avatar({ src, theme }: { src: string; theme: string }) {
  return (
    <img
      src={src}
      className={theme === "dark" ? "avatar-dark" : "avatar-light"}
    />
  );
}
function UserProfile({ user, theme }) {
  return (
    <div>
      <Avatar src={user.avatarUrl} theme={theme} />
    </div>
  );
}
```

常见症状：输入框每次按键丢焦点、动画意外重启、`useEffect` 每次父级渲染都重新执行、内部滚动位置归零。

### 2.2 显式条件渲染，不用 `&&` 渲染可能为 0/NaN 的值

**影响：LOW（避免渲染出 `0`、`NaN`）**

当条件值可能是 `0`、`NaN`、空字符串等 falsy 值时，`&&` 会把这些值渲染到页面上。用三元运算符显式返回 `null`。

```tsx
// ❌ count = 0 时页面渲染出 "0"
function Badge({ count }: { count: number }) {
  return <div>{count && <span className="badge">{count}</span>}</div>;
}

// ✅ count = 0 时渲染空，正确
function Badge({ count }: { count: number }) {
  return <div>{count > 0 ? <span className="badge">{count}</span> : null}</div>;
}
```

### 2.3 合理拆分组件，保持单一职责

每个组件只做一件事。大的渲染块拆成小组件，便于复用、测试，也为后续 memo 化和条件渲染优化提供粒度。

---

## 3. 状态管理

### 3.1 派生状态在渲染期计算，不要存进 state

**影响：MEDIUM（避免多余渲染与状态漂移）**

如果一个值能从当前的 props / state 计算出来，不要在 `useState` 里存它、也不要在 `useEffect` 里 `setState` 去同步它。直接渲染时计算即可。

```tsx
// ❌ 错误：冗余的 state + effect，且 fullName 有滞后一帧的风险
function Form() {
  const [firstName, setFirstName] = useState("First");
  const [lastName, setLastName] = useState("Last");
  const [fullName, setFullName] = useState("");
  useEffect(() => {
    setFullName(firstName + " " + lastName);
  }, [firstName, lastName]);
  return <p>{fullName}</p>;
}

// ✅ 正确：渲染时派生
function Form() {
  const [firstName, setFirstName] = useState("First");
  const [lastName, setLastName] = useState("Last");
  const fullName = firstName + " " + lastName;
  return <p>{fullName}</p>;
}
```

参考：[官方文档：你可能不需要 effect](https://zh-hans.react.dev/learn/you-might-not-need-an-effect)

### 3.2 用函数式更新 setState

**影响：MEDIUM（防止闭包陈旧与回调重复创建）**

当新 state 依赖旧 state 时，使用 `setState(prev => ...)` 形式。它能始终基于最新值更新，让 `useCallback` 的依赖数组可以省略该 state，从而得到稳定、不会陈旧的回调。

```tsx
// ❌ 错误：回调必须依赖 items，每次 items 变化都重建；且若忘了加依赖就会用陈旧值
const removeItem = useCallback((id: string) => {
  setItems(items.filter((item) => item.id !== id));
}, []);

// ✅ 正确：稳定回调，永远基于最新 state
const removeItem = useCallback((id: string) => {
  setItems((curr) => curr.filter((item) => item.id !== id));
}, []);
```

### 3.3 useState 延迟初始化（惰性初始化）

**影响：MEDIUM（避免每次渲染都执行昂贵计算）**

初始值计算昂贵（如 `localStorage` 解析、构建索引）时，传入函数给 `useState`，它只会执行一次；直接传值则每次渲染都会执行。

```tsx
// ❌ 错误：buildSearchIndex 每次渲染都跑（即使只用一次）
const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items));

// ✅ 正确：只执行一次
const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items));

// localStorage 同理
const [settings, setSettings] = useState(() => {
  const stored = localStorage.getItem("settings");
  return stored ? JSON.parse(stored) : {};
});
```

简单原始值（`useState(0)`、直接引用 props）则无需函数形式。

### 3.4 用 useRef 存储瞬态 / 高频变化值

**影响：MEDIUM（高频更新避免无谓重渲染）**

当值频繁变化、且不需要触发 UI 重渲染（鼠标轨迹、定时器、瞬时标记）时，用 `useRef` 而非 `useState`。修改 `ref.current` 不会触发重渲染。需要更新 DOM 时，结合 `ref` 直接操作节点。

```tsx
// ❌ 错误：mousemove 每次都 setState → 整组件疯狂重渲染
const [lastX, setLastX] = useState(0);
useEffect(() => {
  const onMove = (e: MouseEvent) => setLastX(e.clientX);
  window.addEventListener("mousemove", onMove);
  return () => window.removeEventListener("mousemove", onMove);
}, []);

// ✅ 正确：用 ref，且直接改 DOM，不重渲染
const lastXRef = useRef(0);
const dotRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const onMove = (e: MouseEvent) => {
    lastXRef.current = e.clientX;
    dotRef.current?.style.setProperty(
      "transform",
      `translateX(${e.clientX}px)`,
    );
  };
  window.addEventListener("mousemove", onMove);
  return () => window.removeEventListener("mousemove", onMove);
}, []);
```

---

## 4. Hooks 使用规范

### 4.1 最小化 effect 依赖

**影响：LOW（减少 effect 无意义重跑）**

依赖数组里写原始值（如 `user.id`）而非整个对象（`user`）；对于派生出的布尔值，先计算再作为依赖，避免连续数值每次变化都触发。

```tsx
// ❌ 错误：user 任意字段变化都重跑
useEffect(() => {
  console.log(user.id);
}, [user]);

// ✅ 正确：仅 id 变化才重跑
useEffect(() => {
  console.log(user.id);
}, [user.id]);

// ❌ 错误：width = 767, 766, 765... 每次都跑
useEffect(() => {
  if (width < 768) enableMobileMode();
}, [width]);

// ✅ 正确：仅在「是否移动端」布尔翻转时跑
const isMobile = width < 768;
useEffect(() => {
  if (isMobile) enableMobileMode();
}, [isMobile]);
```

### 4.2 交互逻辑放进事件处理器，不要建模成 state + effect

**影响：MEDIUM（避免 effect 在不相关变更时重跑、重复触发副作用）**

由用户动作（提交、点击、拖拽）触发的副作用，直接写在事件处理函数里。不要把「已提交」写成 state 再用 effect 去发起请求——会让 effect 因其他依赖变化而重复执行。

```tsx
// ❌ 错误：把动作建模成 state + effect
function Form() {
  const [submitted, setSubmitted] = useState(false);
  const theme = useContext(ThemeContext);
  useEffect(() => {
    if (submitted) {
      post("/api/register");
      showToast("Registered", theme);
    }
  }, [submitted, theme]);
  return <button onClick={() => setSubmitted(true)}>Submit</button>;
}

// ✅ 正确：直接在处理函数里做
function Form() {
  const theme = useContext(ThemeContext);
  function handleSubmit() {
    post("/api/register");
    showToast("Registered", theme);
  }
  return <button onClick={handleSubmit}>Submit</button>;
}
```

参考：[官方文档：这段代码应该移到事件处理函数中吗？](https://zh-hans.react.dev/learn/removing-effect-dependencies)

### 4.3 拆分组合 hook 中的独立计算

**影响：MEDIUM（避免独立步骤被一起重算）**

一个 `useMemo` / `useEffect` 里若包含多个依赖不同的任务，拆成独立的多个。否则任一依赖变化都会让所有任务重跑。

```tsx
// ❌ 错误：改 sortOrder 时过滤也被重算
const sortedProducts = useMemo(() => {
  const filtered = products.filter((p) => p.category === category);
  return filtered.toSorted((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price,
  );
}, [products, category, sortOrder]);

// ✅ 正确：过滤与排序各自独立
const filteredProducts = useMemo(
  () => products.filter((p) => p.category === category),
  [products, category],
);
const sortedProducts = useMemo(
  () =>
    filteredProducts.toSorted((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price,
    ),
  [filteredProducts, sortOrder],
);
```

### 4.4 简单表达式不要包 useMemo

**影响：LOW-MEDIUM（useMemo 自身开销可能比表达式还大）**

表达式简单（少量逻辑/算术运算符）、结果是原始类型（boolean/number/string）时，不要用 `useMemo`。比较 hook 依赖的开销可能超过表达式本身。

```tsx
// ❌ 错误
const isLoading = useMemo(
  () => user.isLoading || notifications.isLoading,
  [user.isLoading, notifications.isLoading],
);

// ✅ 正确
const isLoading = user.isLoading || notifications.isLoading;
```

---

## 5. 消除瀑布流（异步并发）CRITICAL

**瀑布流（waterfall）是头号性能杀手**：每个串行的 `await` 都会叠加一整轮网络/IO 延迟。消除它能带来 2–10× 的提升。

### 5.1 用 Promise.all 并发独立请求

```tsx
// ❌ 串行，3 轮往返
const user = await fetchUser();
const posts = await fetchPosts();
const comments = await fetchComments();

// ✅ 并行，1 轮往返
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
]);
```

### 5.2 先判断廉价同步条件，再 await 远程/异步标记

组合「异步标记 + 廉价同步条件」（`flag && cheapCondition`）时，先判断廉价的同步条件（本地 props、请求元数据、已加载 state）。若同步条件为 false，就不必付出异步调用的代价。

```tsx
// ❌ 错误：即使 someCondition 为假也先发了 getFlag 请求
const someFlag = await getFlag();
if (someCondition && someFlag) {
  /* ... */
}

// ✅ 正确：先判同步条件，命中才发请求
if (someCondition) {
  const someFlag = await getFlag();
  if (someFlag) {
    /* ... */
  }
}
```

若同步条件本身很昂贵或依赖该标记，则保持原顺序。

### 5.3 把 await 推迟到真正需要的分支

```tsx
// ❌ 错误：skipProcessing 为 true 时仍白等 userData
async function handle(skip: boolean) {
  const userData = await fetchUserData(userId);
  if (skip) return { skipped: true };
  return process(userData);
}

// ✅ 正确：只在需要的分支 fetch
async function handle(skip: boolean) {
  if (skip) return { skipped: true };
  const userData = await fetchUserData(userId);
  return process(userData);
}
```

### 5.4 依赖驱动的并行化

存在「部分依赖」时，让每个任务在最早可能的时刻启动。无额外依赖的做法：先创建所有 promise，最后再 `Promise.all`。

```tsx
// profile 依赖 user.id，但又想和 config 并行：
const userPromise = fetchUser();
const profilePromise = userPromise.then((user) => fetchProfile(user.id));
const [user, config, profile] = await Promise.all([
  userPromise,
  fetchConfig(),
  profilePromise,
]);
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
  );
}
async function DataDisplay() {
  const data = await fetchData();
  return <div>{data.content}</div>;
}
```

**何时不用**：影响布局的关键数据、首屏 SEO 关键内容、小且快的查询（Suspense 开销不值）、需避免布局抖动（loading→content 跳动）的场景。

---

## 6. 包体积优化（CRITICAL）

减小首屏 JS 体积，直接改善可交互时间（TTI）与最大内容绘制（LCP）。

### 6.1 避免 barrel 文件（桶文件）导入

**影响：CRITICAL（200–800ms 导入成本，构建变慢）**

`import { Check, X } from 'lucide-react'` 这类会从入口文件（可能 re-export 上千个模块）加载整个库，拖慢 dev 启动与冷启动。Next.js 13.5+ 会自动把这种导入改写成直接导入；非 Next.js 项目请直接 deep import：

```tsx
// ❌ 错误：拖入整个库
import { Button, TextField } from "@mui/material";

// ✅ 正确（非 Next 项目）：只加载用到的模块
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
```

> 注意：部分库（如 `lucide-react`）的深路径未提供 `.d.ts`，直接 deep import 会得到 `any`。优先使用对应框架的 `optimizePackageImports` 等能力，或确认库对子路径导出类型后再使用。

常见受影响库：`lucide-react`、`@mui/material`、`@tabler/icons-react`、`react-icons`、`@radix-ui/react-*`、`lodash`、`date-fns`、`rxjs`、`react-use`。

### 6.2 动态导入重型组件

**影响：CRITICAL（直接影响 TTI / LCP）**

首屏不需要的大组件（如 Monaco 编辑器、图表、PDF 预览）用 `React.lazy` / `next/dynamic` 按需加载。

```tsx
import { lazy, Suspense } from "react";
const MonacoEditor = lazy(() => import("./monaco-editor"));

function CodePanel({ code }: { code: string }) {
  return (
    <Suspense fallback={<Skeleton />}>
      <MonacoEditor value={code} />
    </Suspense>
  );
}
```

### 6.3 条件加载 / 延迟加载非关键三方库

**影响：MEDIUM–HIGH**

分析、日志、错误上报等不阻塞交互的库，放到 hydrate 之后或功能激活时再加载。

```tsx
// 仅在编辑器功能启用时才加载对应大模块
useEffect(() => {
  if (flags.editorEnabled && typeof window !== "undefined") {
    void import("./monaco-editor").then((mod) => mod.init());
  }
}, [flags.editorEnabled]);
```

### 6.4 基于用户意图预加载

**影响：MEDIUM（降低感知延迟）**

在 hover/focus 大块功能按钮时，提前 `import()` 对应模块，让点击时瞬时打开。

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== "undefined") void import("./monaco-editor");
  };
  return (
    <button onMouseEnter={preload} onFocus={preload} onClick={onClick}>
      Open Editor
    </button>
  );
}
```

### 6.5 使用静态可分析的导入 / 文件路径

**影响：HIGH（避免过宽的打包与文件追踪）**

把真实路径写在字面量里，或用「键 → `() => import(...)`」的显式映射，而不是把路径藏在变量里动态拼接。打包器无法静态分析动态路径，只能把一大片文件都打进来。

```tsx
// ❌ 错误：打包器不知道会导入什么
const Page = await import(PAGE_MODULES[pageName]);

// ✅ 正确：每个路径都是字面量、可分析
const PAGE_MODULES = {
  home: () => import("./pages/home"),
  settings: () => import("./pages/settings"),
} as const;
const Page = await PAGE_MODULES[pageName]();
```

---

## 7. 客户端数据获取（MEDIUM-HIGH）

### 7.1 用 SWR 等库自动去重

**影响：MEDIUM-HIGH**

同一条请求在多个组件实例间只发一次，自带缓存与重新校验。

```tsx
// ❌ 错误：每个实例各自 fetch
function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);
}

// ✅ 正确：多实例共享一个请求
import useSWR from "swr";
function UserList() {
  const { data: users } = useSWR("/api/users", fetcher);
}
```

### 7.2 重复事件监听要去重

**影响：LOW（N 个实例 = 1 个监听）**

全局事件（键盘、resize、scroll）应只挂一个原生监听，用模块级 Map/Set 把各组件回调收集起来，组件卸载且回调清空时再移除原生监听（或在 effect 内用 `useEffectEvent` 维持稳定引用，见 11.3）。

### 7.3 滚动等监听使用 passive

**影响：MEDIUM（消除滚动卡顿）**

`touchstart` / `wheel` 等不需要 `preventDefault()` 的监听，加 `{ passive: true }`，浏览器无需等待监听器判断是否阻止默认行为，可立即滚动。

```tsx
useEffect(() => {
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY);
  document.addEventListener("wheel", handleWheel, { passive: true });
  return () => document.removeEventListener("wheel", handleWheel);
}, []);
```

### 7.4 localStorage 数据要版本化、最小化、try-catch 包裹

**影响：MEDIUM（防 schema 冲突、减小存储、避免异常）**

键名加版本前缀；只存 UI 真正需要的字段（不要整对象序列化，避免泄露 token/PII）；`getItem`/`setItem` 在隐私模式、配额满、被禁用时会抛异常，必须 try-catch。

```tsx
const VERSION = "v2";
function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config));
  } catch {}
}
function loadConfig() {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
```

---

## 8. 避免不必要的重渲染（MEDIUM）

### 8.1 提取到 memo 化组件

**影响：MEDIUM（让昂贵计算可被提前 return 跳过）**

把昂贵工作放进 `memo()` 组件，父组件在「加载中」等分支可提前 return，从而完全跳过子组件的计算（而不仅是用 `useMemo` 包裹一个 JSX 变量——那样即使不渲染也会先算出来）。

```tsx
// ✅ 加载时直接返回 Skeleton，UserAvatar 的计算被跳过
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user]);
  return <Avatar id={id} />;
});
function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />;
  return <UserAvatar user={user} />;
}
```

> 若项目启用了 **React Compiler**，无需手写 `memo()` / `useMemo()`，编译器会自动优化重渲染。

### 8.2 memo 化组件的默认非基本类型参数要提到常量

**影响：MEDIUM（恢复 memo 的缓存效果）**

`memo()` 靠严格相等比较 props。若可选参数（函数、对象、数组）有默认值，且每次渲染都生成新实例，则 memo 永远命中失败。把默认值提为模块级常量。

```tsx
// ❌ 错误：不传 onClick 时，每次渲染都是不同的 () => {}
const UserAvatar = memo(function UserAvatar({
  onClick = () => {},
}: {
  onClick?: () => void;
}) {
  /* ... */
});

// ✅ 正确：稳定默认
const NOOP = () => {};
const UserAvatar = memo(function UserAvatar({
  onClick = NOOP,
}: {
  onClick?: () => void;
}) {
  /* ... */
});
```

### 8.3 订阅派生状态，而非连续值

**影响：MEDIUM（降低重渲染频率）**

不要订阅每像素变化的连续值（如窗口宽度），而是订阅派生出的布尔（如 `isMobile`）。这样只有布尔翻转时才重渲染。

```tsx
// ❌ 错误：宽度每变一点就重渲染
const width = useWindowWidth();
const isMobile = width < 768;

// ✅ 正确：只有「是否移动端」变化才重渲染
const isMobile = useMediaQuery("(max-width: 767px)");
```

### 8.4 用 Transition 标记非紧急更新

**影响：MEDIUM（保持 UI 响应）**

高频、非紧急的 state 更新（如滚动位置、非受控筛选）用 `startTransition` / `useTransition` 包裹，让 React 优先处理用户输入，把非紧急更新排到空闲时。

```tsx
import { startTransition } from "react";
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => startTransition(() => setScrollY(window.scrollY));
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
}
```

`useTransition` 还自带 `isPending` 状态，比手动 `useState` 管理 loading 更清晰、可中断、出错也能正确复位。

### 8.5 用 useDeferredValue 兜底昂贵派生渲染

**影响：MEDIUM（输入保持灵敏）**

用户输入触发昂贵计算（大列表筛选、图表）时，用 `useDeferredValue` 让输入框优先更新、昂贵结果滞后渲染。

```tsx
function Search({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => items.filter((item) => fuzzyMatch(item, deferredQuery)),
    [items, deferredQuery],
  );
  const isStale = query !== deferredQuery;
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.7 : 1 }}>
        <ResultsList results={filtered} />
      </div>
    </>
  );
}
```

> 必须把昂贵计算放进 `useMemo` 且依赖 deferred 值，否则每次渲染仍会执行。

---

## 9. 渲染性能（MEDIUM）

### 9.1 长列表用 content-visibility

**影响：HIGH（首屏快 10×）**

对离屏容器加 `content-visibility: auto` 配合 `contain-intrinsic-size`，浏览器会跳过离屏元素的布局与绘制。

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

### 9.2 静态 JSX 提升到组件外

**影响：LOW（避免每次渲染重建）**

完全静态、不依赖 props 的 JSX（尤其大段 SVG）定义到模块顶层常量，复用同一对象引用。

```tsx
const loadingSkeleton = <div className="animate-pulse h-20 bg-gray-200" />;
function Container() {
  return <div>{loading && loadingSkeleton}</div>;
}
```

> React Compiler 会自动做此优化。

### 9.3 动画包一层 div，而不是直接动画 SVG

**影响：LOW（启用硬件加速）**

多数浏览器对 SVG 元素的 CSS 动画不做硬件加速。把 SVG 包进 `<div>` 再对 div 做 `transform` / `opacity` 动画，可走 GPU 加速。

### 9.4 用 Activity 组件做显示/隐藏

**影响：MEDIUM（保留 state / DOM）**

频繁切换显隐、且内部昂贵的组件，用 `<Activity mode={visible ? 'visible' : 'hidden'}>` 保留其状态与 DOM，避免昂贵的重渲染与状态丢失。

### 9.5 脚本标签加 defer / async

**影响：HIGH（消除渲染阻塞）**

无 `defer`/`async` 的 `<script>` 会阻塞 HTML 解析。依赖 DOM 或其他脚本的用 `defer`，独立脚本（如分析统计）用 `async`。Next.js 中优先使用 `next/script` 的 `strategy`。

### 9.6 SVG 坐标精度精简

**影响：LOW（减小体积）**

用 SVGO 等工具把路径坐标精度压到 1 位小数，显著降低 SVG 文件大小。

### 9.7 服务端渲染：避免水合不一致

- **不要用 localStorage/cookie 直接在 SSR 渲染**：服务端没有这些 API，会抛错。需要「主题/偏好」等客户端数据时，用内联脚本在 hydrate 前同步写入 DOM，避免闪屏；或在客户端 effect 中读取（会有一次闪烁，按需权衡）。
- **预期内的不一致**用 `suppressHydrationWarning` 抑制警告（如随机 ID、日期、时区格式化），但不要用它掩盖真实 bug。

---

## 10. JavaScript 性能（LOW-MEDIUM）

热路径上的微优化叠加起来也很可观。

### 10.1 避免布局抖动（Layout Thrashing）

**影响：MEDIUM**

不要在修改样式的过程中穿插读取布局属性（`offsetWidth`、`getBoundingClientRect()`、`getComputedStyle()`），这会迫使浏览器同步回流。先批量写、再读一次；或优先用 CSS class 切换代替内联样式。

```tsx
// ❌ 错误：写→读→写→读，强制多次回流
function Box({ isHighlighted }) {
  useEffect(() => {
    if (ref.current && isHighlighted) {
      ref.current.style.width = "100px";
      const w = ref.current.offsetWidth; // 强制布局
      ref.current.style.height = "200px";
    }
  }, [isHighlighted]);
  return <div ref={ref}>Content</div>;
}

// ✅ 正确：用 class 切换
function Box({ isHighlighted }) {
  return <div className={isHighlighted ? "highlighted-box" : ""}>Content</div>;
}
```

### 10.2 用 Map/Set 做 O(1) 查找

**影响：LOW-MEDIUM（O(n) → O(1)）**

反复用 `.find()` / `.includes()` 按同一 key 查找时，先建 `Map` / `Set`。1000×1000 的匹配可从 1M 次降到 2K 次。

```tsx
const userById = new Map(users.map((u) => [u.id, u]));
orders.map((o) => ({ ...o, user: userById.get(o.userId) }));
```

### 10.3 缓存属性访问 / 函数结果 / 存储读取

**影响：LOW-MEDIUM**

- 循环里把 `obj.a.b.c` 与 `arr.length` 提到循环外（**10.3.1**）。
- 渲染期重复调用同一纯函数（如 `slugify`），用模块级 `Map` 缓存结果（**10.3.2**）。
- `localStorage` / `sessionStorage` / `document.cookie` 是同步且昂贵的，用内存 `Map` 缓存读取，写入时同步更新缓存，并在 `storage` / `visibilitychange` 事件中失效（**10.3.3**）。

### 10.4 合并多次数组迭代

**影响：LOW-MEDIUM**

多次 `.filter()` / `.map()` 会多次遍历。需要按同一遍历分出多组结果时，用单趟 `for` 循环。

### 10.5 数组比较先比长度

**影响：MEDIUM-HIGH**

排序/深比较/序列化前先判 `length`。长度不同必不相等，可 O(1) 提前返回，省去排序与拼接开销。

### 10.6 函数内早返回

**影响：LOW-MEDIUM**

结果已确定时立即 `return`，跳过无关计算（如校验时发现第一个错误就返回）。

### 10.7 把 RegExp 提到模块作用域或用 useMemo

**影响：LOW-MEDIUM**

渲染期 `new RegExp` 每次都重建。固定正则提为模块常量；依赖变量（如 `query`）的用 `useMemo` 包裹。注意带 `g` 标志的正则有可变的 `lastIndex` 状态，复用时要小心。

### 10.8 用 flatMap 一次完成「映射+过滤」

**影响：LOW-MEDIUM**

`.map().filter(Boolean)` 会产生中间数组并遍历两次，改用 `.flatMap()` 单趟完成。

```tsx
const userNames = users.flatMap((user) => (user.isActive ? [user.name] : []));
```

### 10.9 求最值用循环而非 sort

**影响：LOW（O(n) 替代 O(n log n)）**

只求最大/最小元素时，单趟循环即可，不必对整个数组排序。小数组可用 `Math.min(...arr)` / `Math.max(...arr)`，但超大数组会因 spread 限制报错，用循环更稳。

### 10.10 用 toSorted 保持不可变

**影响：MEDIUM-HIGH（防 React state 被原地修改的 bug）**

`.sort()` 原地修改数组，会破坏 React 的不可变模型，导致状态漂移、陈旧闭包。用 `.toSorted()` 返回新数组；旧环境回退用 `[...arr].sort()`。同类不可变方法：`.toReversed()`、`.toSpliced()`、`.with()`。

---

## 11. 高级模式（LOW）

### 11.1 不要在依赖数组里放 Effect Event

`useEffectEvent` 返回的函数身份故意每次渲染都变化，放入 `useEffect` 依赖会导致 effect 每次渲染都重跑并触发 lint 报错。只把真正的响应式值放依赖，Effect Event 在 effect 内部调用。

```tsx
import { useEffect, useEffectEvent } from "react";
function ChatRoom({ roomId, onConnected }) {
  const handleConnected = useEffectEvent(onConnected);
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on("connected", handleConnected);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // 不含 handleConnected
}
```

### 11.2 应用级初始化只做一次

**影响：LOW-MEDIUM**

「整个应用只应初始化一次」的逻辑（加载本地存储、校验 token）不要放进组件的 `useEffect([])`——开发模式 StrictMode 下会执行两次，且组件重挂载会重跑。用模块级 `didInit` 守卫，或用入口模块顶层初始化。

```tsx
let didInit = false;
function Comp() {
  useEffect(() => {
    if (didInit) return;
    didInit = true;
    loadFromStorage();
    checkAuthToken();
  }, []);
  // ...
}
```

### 11.3 把事件处理函数存进 ref（或 useEffectEvent）

**影响：LOW**

传给 effect 的回调若不希望它变化导致 effect 重订阅，用 `useEffectEvent` 包裹（最新版 React）；或存进 `useRef`，在 effect 内调用 `ref.current`，依赖数组只放事件名。

```tsx
import { useEffectEvent } from "react";
function useWindowEvent(event: string, handler: (e: any) => void) {
  const onEvent = useEffectEvent(handler);
  useEffect(() => {
    window.addEventListener(event, onEvent);
    return () => window.removeEventListener(event, onEvent);
  }, [event]);
}
```

---

## 12. 参考链接

- [React 官方文档（中文）](https://zh-hans.react.dev)
- [React：你可能不需要 effect](https://zh-hans.react.dev/learn/you-might-not-need-an-effect)
- [React：移除 effect 依赖](https://zh-hans.react.dev/learn/removing-effect-dependencies)
- [React Compiler](https://zh-hans.react.dev/learn/react-compiler)
- [Vercel：Next.js package imports 优化](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [Vercel React Best Practices（本规范主要参考来源）](https://github.com/vercel/react-best-practices)

---

> **落地建议**
>
> - 优先处理 CRITICAL 级：消除瀑布流、减小包体积，收益最大。
> - 若项目启用 **React Compiler**，可省去大量手写 `memo` / `useMemo` / 静态 JSX 提升，但函数式 `setState`、`useDeferredValue`、`startTransition`、不可变更新等仍然 Recommended。
> - 评审代码时，把「组件内定义组件」「`&&` 渲染可能为零的值」「用 `.sort()` 改 state」「昂贵计算不 memo / 不 useMemo」列为必须拦截的反模式。
