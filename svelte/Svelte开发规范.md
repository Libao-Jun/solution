# Svelte 开发规范与指南

> 适用范围：**Svelte 5（Runes 模式）** + **SvelteKit**。本规范综合 Svelte 官方文档、官方 `sveltejs/ai-tools`（MCP）与社区 `ejirocodes/agent-skills`（Svelte 5 最佳实践技能）整理，为团队提供统一的编码约定与验收口径。
>
> 参考文档：
>
> - Svelte 官方文档 <https://svelte.js.cn/docs> / <https://svelte.dev/docs>
> - Svelte MCP `sveltejs/ai-tools` <https://github.com/sveltejs/ai-tools>
> - Svelte 5 最佳实践技能 `ejirocodes/agent-skills` <https://github.com/ejirocodes/agent-skills>

---

## 1. 概述与版本基线

- 默认采用 **Svelte 5** 的 **Runes（符文）** 响应式模型，不再使用 Svelte 3/4 的 `export let`、`$:`、`<slot>`、`createEventDispatcher`、`on:click` 指令。
- 普通 `let` 声明**不再**自动具备响应性；任何需要驱动 UI 的状态必须用 `$state` 等 rune 显式声明。
- 项目统一使用 **TypeScript**（`lang="ts"`），Props 必须声明类型。
- 应用层优先使用 **SvelteKit**（基于 Vite），纯组件库可用 Vite + `svelte` 插件。

---

## 1.5 快速参考（Quick Reference）

### 主题索引（对齐 `svelte5-best-practices` 技能）

| 主题       | 何时使用                                                                | 详见     |
| ---------- | ----------------------------------------------------------------------- | -------- |
| 组件基础   | 第一个组件、动态属性、嵌套、`{:html}`、`<style>` 作用域                 | 第 3 节  |
| Runes      | `$state` / `$derived` / `$effect` / `$props` / `$bindable` / `$inspect` | 第 4 节  |
| 模板指令   | 事件、绑定、class/style、`{@attach}`、`svelte:*`、过渡、运动、生命周期  | 第 5 节  |
| Snippets   | 替代 `<slot>`、`{#snippet}`、`{@render}`                                | 第 6 节  |
| 事件与通信 | `onclick`、回调 props、Context API                                      | 第 7 节  |
| TypeScript | Props 类型、泛型组件                                                    | 第 8 节  |
| 迁移       | Svelte 4→5、store→rune、slot→snippet                                    | 第 11 节 |
| SvelteKit  | load、form actions、SSR、页面类型                                       | 第 9 节  |
| 性能       | 过度响应、细粒度、流式加载                                              | 第 10 节 |

### Rune 速查表

| Rune              | 作用                         | 示例                                   |
| ----------------- | ---------------------------- | -------------------------------------- |
| `$state`          | 响应式状态（深度代理）       | `let n = $state(0)`                    |
| `$state.raw`      | 非深度响应（仅整体替换更新） | `let o = $state.raw({})`               |
| `$state.snapshot` | 取静态快照（跨库/序列化）    | `const s = $state.snapshot(o)`         |
| `$derived`        | 派生值（无副作用）           | `let d = $derived(n * 2)`              |
| `$derived.by`     | 复杂派生逻辑                 | `let d = $derived.by(() => {...})`     |
| `$effect`         | 副作用（挂载/依赖变更）      | `$effect(() => {...; return cleanup})` |
| `$effect.pre`     | DOM 更新**前**运行           | `$effect.pre(() => {...})`             |
| `$props`          | 接收组件属性                 | `let { x = 1 } = $props()`             |
| `$bindable`       | 可双向绑定 prop              | `let { v = $bindable() } = $props()`   |
| `$inspect`        | 开发期调试（生产剔除）       | `$inspect(n)`                          |

---

## 2. 项目初始化与工具链

### 2.1 创建项目

官方推荐用 SvelteKit 脚手架（Vite 驱动）：

```bash
npx sv create myapp      # SvelteKit 官方脚手架（sv CLI）
cd myapp
npm install
npm run dev
```

> 历史命令 `npm create vite@latest` 选 `svelte` 也可仅初始化前端，但官方框架能力（路由、load、SSR）需用 SvelteKit。

### 2.2 必备工具

| 工具                                | 用途                                              |
| ----------------------------------- | ------------------------------------------------- |
| `sv`                                | 官方 CLI，创建/添加适配器/升级项目                |
| `sv check`                          | 类型与 Svelte 专属静态检查（等价 `svelte-check`） |
| Prettier + `prettier-plugin-svelte` | 官方推荐格式化（**不要用其他格式化器**）          |
| ESLint（`eslint.config.js`）        | 配合 `@typescript-eslint` 做代码规范              |
| `.editorconfig`                     | 统一缩进/换行等基础风格                           |

### 2.3 编辑器

- VS Code 安装官方 **Svelte** 扩展（`svelte.svelte-vscode`）。
- 团队统一配置 `.vscode/` 与 `.editorconfig`，保证保存即按 Prettier 格式化。

---

## 3. `.svelte` 文件结构

每个组件是一个 `.svelte` 文件，是 HTML 的超集。三大块（`<script>`、markup、`<style>`）**均为可选**。

```svelte
<script module>
  // 模块上下文：仅在整个模块首次求值（一次）时运行，非每实例运行
  export const VERSION = '1.0';   // 可导出，供外部 import
</script>

<script lang="ts">
  // 实例级逻辑：每次创建组件实例时运行
  let count = $state(0);
</script>

<!-- 标记：可在其中直接引用顶层声明的变量 -->
<button onclick={() => count++}>{count}</button>

<style>
  /* 组件作用域样式：仅作用于本组件 */
  button { color: burlywood; }
</style>
```

要点：

- `<script module>`（Svelte 4 为 `<script context="module">`）中声明的变量可被组件其它部分引用，反之不可；**不能**在此写默认导出（默认导出是组件本身）。
- `<style>` 默认 **scoped**，仅匹配本组件元素。需全局样式用 `:global(...)`。
- 顶层声明的变量/导入在模板中可直接使用。

### 3.1 入门基础（基于官方基础教程）

- **你的第一个组件**：每个组件就是一个 `.svelte` 文件；文件名用 `PascalCase.svelte`，导入后在模板以 `<Component />` 形式使用。组件会被编译成小型高效 JS 模块（非运行时虚拟 DOM）。
- **动态属性**：模板中的属性/文本用 `{}` 插值，区别于静态字符串：
  ```svelte
  <img src={src} alt={alt} />   <!-- 动态属性 -->
  <img src="/logo.png" />        <!-- 静态字符串无需 {} -->
  <h1>Hello {name}!</h1>          <!-- 文本插值 -->
  ```
- **嵌套组件**：`import Child from './Child.svelte'`，直接在模板写成对或自闭合标签 `<Child prop={x} />`。
- **样式作用域**：`<style>` 内规则仅作用于本组件；跨组件共享用全局样式表或 `:global(...)`。
- **渲染原始 HTML（{@html}）**：需直接插入 HTML 片段（如 Markdown 渲染结果）时用 `{@html expr}`：
  ```svelte
  <p>{@html `<strong>加粗</strong>`}</p>
  ```
  > ⚠️ **安全红线**：`{@html}` 插入前**不会**做任何清理（sanitize）。内容来自不可信用户输入（如评论）时必须先转义，否则导致 **XSS**。仅对完全可信的 authored 内容使用。

---

## 4. Runes（符文）核心规范

Runes 是 Svelte 5 的编译期指令，用于在组件/模块中声明响应式。

### 4.1 `$state` — 响应式状态

```svelte
<script lang="ts">
  let count = $state(0);                 // 基础类型直接修改即响应式
  count++;                               // ✅ 无需 .set()

  let todos = $state([{ done: false, text: '买菜' }]);
  todos[0].done = true;                  // ✅ 深层响应式，自动递归代理
  todos.push({ done: false, text: '做饭' }); // ✅ push 触发更新

  // 类字段中使用
  class Counter {
    count = $state(0);
  }
</script>
```

规则：

- **解构会丢失响应性**：`let { done } = todos[0];` 之后改 `todos[0].done` 不会更新 `done`（与普通 JS 一致）。需保留引用。
- 通过代理修改时**原始对象不被突变**。跨库传递（如 `structuredClone`）用 `$state.snapshot()` 取静态快照。
- `Set`/`Map`/`Date`/`URL` 等内置对象从 `svelte/reactivity` 导入响应式版本。
- 类实例默认**不会被代理**，需在类字段或构造函数中直接用 `$state`。

### 4.2 `$state.raw` — 退出深度响应

仅整体重新赋值才触发更新，避免大数组/对象的代理开销：

```ts
let person = $state.raw({ name: "Heraclitus", age: 49 });
person.age += 1; // ❌ 无效
person = { name: "Heraclitus", age: 50 }; // ✅ 整体替换才生效
```

### 4.3 `$derived` / `$derived.by` — 派生值

取代 Svelte 4 的 `$:` 响应式声明。用于计算值，**表达式内禁止副作用**。

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  let numbers = $state([1, 2, 3]);
  let total = $derived.by(() => {
    let sum = 0;
    for (const n of numbers) sum += n;
    return sum;
  });
</script>
```

规则：

- `$derived(expression)` 等价于 `$derived.by(() => expression)`。
- 同步读取的状态自动成为依赖；`await` 之后的读取也算依赖。用 `untrack()` 排除某项依赖。
- 派生值保持原值（非深度代理）。Svelte 5.25+ 允许对派生值临时重新赋值（乐观 UI），否则只读。
- 新值与旧值引用相同则跳过下游更新（push-pull 模型）。

### 4.4 `$effect` — 副作用

用于组件挂载后、依赖变更后运行**副作用**（第三方库、canvas、定时器、订阅），仅在浏览器运行，不参与 SSR。

```svelte
<script lang="ts">
  let canvas: HTMLCanvasElement;
  let color = $state('#ff3e00');

  $effect(() => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;                 // 同步读取 → 被追踪
    ctx.fillRect(0, 0, 50, 50);
    return () => { /* 清理：clearInterval / removeEventListener / unsubscribe */ };
  });
</script>
<canvas bind:this={canvas}></canvas>
```

规则：

- 函数体内**同步读取**的响应式值自动成为依赖；异步（setTimeout/await 之后）读取**不**被追踪。
- 必须返回**清理函数**释放资源，防止内存泄漏。
- **不要在 `$effect` 里更新状态去“同步”数据**——那是 `$derived` 的职责，否则易无限循环；必须更新时用 `untrack` 包裹。
- `$effect.pre()`：在 DOM 更新**之前**运行（适合滚动位置计算）。
- `$effect.tracking()`：返回当前是否在追踪上下文（库作者用，业务极少用）。
- `$effect.root()`：手动创建非追踪作用域（高级）。

### 4.5 `$props` — 组件属性

取代 `export let`。通过解构接收，支持默认值与类型：

```svelte
<script lang="ts">
  interface Props {
    name: string;
    count?: number;
    super?: string;            // 关键字/非法标识可重命名
  }
  let { name, count = 0, super: trouper = 'default' }: Props = $props();

  // 剩余属性透传
  let { a, b, ...rest } = $props();
</script>
```

注意：

- `let { x = 1 } = $props()` 的默认值**不是**响应式代理；对带默认值的 prop 做 mutation 不会触发更新。
- **不要直接变更 props**（除 `$bindable` 声明的）。普通对象直接 `obj.count++` 无效；若是父级 `$state` 代理对象则生效但会抛 `ownership_invalid_mutation` 警告。
- `$props.id()`（v5.20+）：生成组件实例唯一 ID，SSR 水合时保持一致，便于关联 `for` / `aria-labelledby`。
- 用回调 props 或 `$bindable` 进行父子通信（见第 7 节）。

### 4.6 `$bindable` — 双向绑定

只有用 `$bindable()` 标记的 prop，父组件才能用 `bind:` 双向绑定：

```svelte
<script lang="ts">
  let { value = $bindable(''), disabled = false }: { value?: string; disabled?: boolean } = $props();
</script>
<input bind:value />
```

```svelte
<!-- 父组件 -->
<Child bind:value={text} />
```

### 4.7 `$inspect` — 调试

开发环境打印状态变更日志，生产构建自动剔除：

```ts
$inspect(count); // 状态变化时打印
$inspect.with(() => ({ label: "c", value: count })); // 自定义输出
```

### 4.8 `$state.snapshot` — 快照

获取深层状态的静态副本（用于跨库传递/序列化/比较）：

```ts
import { $state } from "svelte"; // 实际为顶层 $state.snapshot
const snap = $state.snapshot(todos);
```

---

## 5. 模板语法与指令

### 5.1 事件处理（重要变更）

Svelte 5 使用**标准 HTML 属性式事件**，废弃 `on:click` 指令与事件修饰符：

```svelte
<button onclick={() => count++}>加</button>
<form onsubmit={(e) => { e.preventDefault(); submit(); }}>提交</form>
<input oninput={(e) => (value = e.currentTarget.value)} />
```

- 修饰符（`|preventDefault`、`|stopPropagation`）已移除，需在函数体内调用 `e.preventDefault()` / `e.stopPropagation()`。
- 特殊阶段：`onclickcapture`（捕获）、`ontouchstartpassive`、`ontouchmovenonpassive`。
- 若脚本中函数名与属性同名，可简写 `{onclick}`；多个处理器可用 `{...handlers}` 展开。
- 同一事件**不能**写多个同名属性，需在一个 handler 内组合。
- 事件参数显式标注 `MouseEvent` / `SubmitEvent` 等，注意 `event.target` 类型断言。

### 5.2 控制流

```svelte
{#if cond}
  <p>A</p>
{:else if other}
  <p>B</p>
{:else}
  <p>C</p>
{/if}

{#each items as item, i (item.id)}   <!-- 务必加 key 表达式提升 diff 性能 -->
  <li>{i}: {item.name}</li>
{:else}
  <p>空列表</p>
{/each}

{#await promise}
  <p>加载中…</p>
{:then data}
  <p>{data}</p>
{:catch error}
  <p>{error.message}</p>
{/await}
```

### 5.3 绑定与样式指令

```svelte
<!-- 文本 / 数字 -->
<input bind:value={text} />
<input type="number" bind:value={num} />   <!-- num 自动为 number 类型 -->
<input type="range" bind:value={n} />

<!-- 复选框 / 单选组 / 多选 -->
<input type="checkbox" bind:checked={ok} />
<input type="radio" bind:group={color} value="red" />   <!-- 同 group 共享一个值 -->
<select bind:value={choice} multiple>…</select>          <!-- 多选 → 数组 -->

<!-- 文本域 / 可编辑内容 -->
<textarea bind:value={bio}></textarea>
<div contenteditable="true" bind:innerHTML={html}></div>

<!-- 样式指令 -->
<div class:active={isActive} class:hidden={!visible}>…</div>
<div style:color={color} style:width={`${w}px`}>…</div>

<!-- 引用绑定：获取 DOM 节点或组件实例 -->
<input bind:this={el} />          <!-- 获取 DOM/组件实例引用 -->
<Widget bind:this={comp} />

<!-- 媒体元素尺寸 / 绑定 -->
<video bind:duration={d} bind:currentTime={t} bind:videoWidth={w} />
```

要点：

- `type="number"` / `type="range"` 的 `bind:value` 会将值自动转为 `number`。
- `bind:group` 用于一组 radio/checkbox 共享同一状态；`multiple` 的 `<select>` 绑定到数组。
- `bind:this` 拿到的是真实 DOM 节点（原生元素）或组件实例（需组件导出成员）。

### 5.4 附件、特殊元素与过渡

#### 5.4.1 `use:` Action（Svelte 4 风格，仍可用）

```svelte
<div use:tooltip={'提示'}>…</div>
```

自定义 action：`(node, params) => { ...; return { update, destroy } }`，适合与第三方库交互、懒加载、tooltip 等 DOM 行为增强。

#### 5.4.2 `{@attach}` 附件（Svelte 5 新语法，推荐）

Svelte 5 引入 `{@attach}` 标签统一元素级逻辑注入，比 `use:` 更简洁、天然拥抱细粒度响应式：

```svelte
<!-- 直接引用附件函数 -->
<div class="menu" {@attach trapFocus}>…</div>

<!-- 带参数需配合附件工厂 -->
<button {@attach tooltip(content)}>Hover me</button>
```

```js
// attachments.svelte.js
export function trapFocus(node) {
  // 挂载时调用，node 为 DOM 节点；运行在 effect 中，内部响应式状态会变则重跑
  const off = on(node, "keydown", handler);
  return () => off(); // 返回清理函数（卸载/重跑前执行）
}

// 附件工厂：接收参数，返回真正的附件函数
export function tooltip(content) {
  return (node) => {
    const t = tippy(node, { content });
    return t.destroy; // 工厂参数变化 → 旧附件销毁 + 新附件重建
  };
}
```

> 迁移：`use:action` → `{@attach fn}`；action 的 `{ update, destroy }` 简化为「返回单一 teardown 函数」，并自动响应内部状态变化。

#### 5.4.3 特殊元素（svelte:\*）

```svelte
<svelte:window onkeydown={onKey} bind:innerWidth={w} bind:scrollY={y} />
<svelte:document onvisibilitychange={onVis} />
<svelte:head>
  <title>页面标题</title>
  <meta name="description" content="..." />
</svelte:head>
<svelte:options runes={true} />
<svelte:boundary>
  <!-- 错误边界：捕获子树错误并显示 fallback -->
</svelte:boundary>
```

- `<svelte:window>` / `<svelte:document>`：监听 window/document 事件、绑定其属性（如 `innerWidth`、`scrollY`、`online`）。
- `<svelte:head>`：向 `<head>` 注入标题、meta、样式（常用于 SvelteKit 每页 SEO）。
- `<svelte:options>`：组件编译选项（如强制/关闭 runes 模式）。
- `<svelte:boundary>`：错误边界，捕获子树渲染/生命周期错误并显示 fallback（类似 React error boundary）。

#### 5.4.4 过渡（Transitions）

```svelte
<div transition:fade={{ duration: 200 }}>…</div>   <!-- 进出都播放 -->
<div in:fly={{ y: 20 }} out:fade>…</div>            <!-- 分别指定进入/离开 -->
<div transition:fade|global>…</div>                 <!-- global：不被 {#if} 阻断 -->
<div transition:fade onintrostart={fn} onoutroend={fn}>…</div>  <!-- 过渡事件 -->
```

- 内置过渡：`fade` / `fly` / `slide` / `scale` / `blur`（来自 `svelte/transition`）。
- 自定义过渡：用 `transition:name={params}` 配合 `svelte/transition` 的 `cubicOut` 等，或自写 CSS/JS 过渡函数 `(node, params, options) => { ... return { css, tick } }`。
- **Key 块（`{#key}`）**：在响应式值变化时重播过渡（而不仅进出 DOM 时）：
  ```svelte
  {#key message}
    <p in:typewriter={{ speed: 10 }}>{message}</p>
  {/key}
  ```
- 过渡事件：`onintrostart`/`onintroend`/`onoutrostart`/`onoutroend`。
- `|global` 修饰：元素不在 `{#if}`/`{#each}` 内也能播放过渡。

#### 5.5 运动（Motion：`svelte/motion`）

- **`tweened`**：状态按缓动函数平滑过渡到目标值（适合数值/尺寸渐变）。
  ```svelte
  <script lang="ts">
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    const size = tweened(1, { duration: 400, easing: cubicOut });
    function grow() { size.set(50); }   // 或模板中 $size = 50
  </script>
  <button onclick={grow}>放大</button>
  <div style:width="{$size}px" style:height="{$size}px"></div>
  ```
- **`spring`**：带物理弹性（stiffness/damping），适合拖拽、跟手等交互。
  ```svelte
  <script lang="ts">
    import { spring } from 'svelte/motion';
    const coords = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.25 });
    function move() { coords.set({ x: 100, y: 200 }); }
  </script>
  <div style:transform="translate({$coords.x}px, {$coords.y}px)"></div>
  ```
  > `tweened`/`spring` 返回的是 store，模板用 `$size` 自动订阅，脚本内用 `.set()`/`.get()`。

#### 5.6 生命周期

- 大多数「挂载后做某事」用 `$effect`（自动追踪依赖、返回清理函数），无需显式生命周期。
- 仍需仅挂载/卸载钩子时可用 `onMount` / `onDestroy`（来自 `svelte`）：
  ```svelte
  <script>
    import { onMount, onDestroy } from 'svelte';
    onMount(() => { /* 组件挂载后 */ return () => {/* 清理 */}; });
    onDestroy(() => { /* 组件销毁 */ });
  </script>
  ```
  > `$effect` 在 SSR 中不运行；`onMount` 回调也仅在浏览器执行。服务端初始化逻辑应放在 load（SvelteKit）或 `$state` + `browser` 守卫中。

---

## 6. Snippets（替代 `<slot>`）

Svelte 5 用 `{#snippet}` 声明、`{@render}` 渲染，取代 `<slot>`。更强大、类型安全。

```svelte
<!-- 子组件 Child.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    header?: Snippet;
    children: Snippet<[item: Item]>;   // 带参数的 snippet
  }
  let { header, children }: Props = $props();
</script>

{@render header?.()}
{#each items as item}
  {@render children?.(item)}            <!-- 可选片段必须 ?.() 空安全 -->
{/each}
```

```svelte
<!-- 父组件 -->
<Child>
  {#snippet header()}
    <h1>标题</h1>
  {/snippet}
  {#snippet children(item)}
    <li>{item.name}</li>
  {/snippet}
</Child>
```

迁移对照：

| 场景     | Svelte 4                 | Svelte 5                                                   |
| -------- | ------------------------ | ---------------------------------------------------------- |
| 默认内容 | `<slot />`               | `let { children } = $props()` + `{@render children?.()}`   |
| 具名插槽 | `<slot name="header" />` | `let { header } = $props()` + `{@render header?.()}`       |
| 插槽传参 | `let:item`               | `{#snippet children(item)}` + `{@render children?.(item)}` |
| 回退内容 | 默认 slot 内容           | `{#if children}{@render children()}{:else}默认{/if}`       |

要点：

- 可选片段必须 `?.()` 空安全，否则未传入时报错。
- snippet 可像函数一样接收参数、多次渲染、作为 prop 跨组件传递。

---

## 7. 事件处理与组件通信

### 7.1 回调 Props（替代 `createEventDispatcher`）

Svelte 5 推荐用回调 props 实现子→父通信，类型更安全：

```svelte
<!-- 子组件 -->
<script lang="ts">
  interface Props { onselect?: (item: Item) => void; }
  let { onselect }: Props = $props();
</script>
<button onclick={() => onselect?.({ id: 1 })}>选</button>
```

```svelte
<!-- 父组件 -->
<List onselect={(item) => console.log(item)} />
```

多回调用明确命名（`onconfirm` / `oncancel` / `onclose`）提升可读性。

### 7.2 Context API

`setContext` / `getContext` 必须在组件初始化阶段（顶层脚本）**同步**调用，不能放进 `$effect` 或异步回调：

```svelte
<script lang="ts">
  import { setContext, getContext } from 'svelte';
  const key = Symbol('theme');
  let theme = $state('light');
  setContext(key, {
    get current() { return theme; },          // 响应式上下文
    toggle() { theme = theme === 'light' ? 'dark' : 'light'; }
  });
  const ctx = getContext<ThemeContext>(key);
</script>
```

要点：

- 传递 `$state` 对象或带 `get` 访问器的对象，消费者才能响应式更新。
- key 优先用 `Symbol` / 唯一前缀字符串（`'myapp:user'`）避免冲突。
- 用 `hasContext('theme')` 判断存在性并提供默认值。
- Context 沿组件树向下流动，子级可 `getContext` 后再次 `setContext` 覆盖更深层后代。

---

## 8. TypeScript 规范

### 8.1 Props 类型

优先用 `interface Props` 集中定义，再解构：

```svelte
<script lang="ts">
  interface Props {
    name: string;
    count?: number;
    disabled?: boolean;
  }
  let { name, count = 0, disabled = false }: Props = $props();
</script>
```

### 8.2 继承原生 HTML 属性

用 `svelte/elements` 扩展并 `...rest` 透传：

```svelte
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  interface Props extends Omit<HTMLInputAttributes, 'value'> {
    value?: string;
  }
  let { value = $bindable(''), ...rest }: Props = $props();
</script>
<input {value} {...rest} />
```

### 8.3 Snippet 与回调类型

```ts
import type { Snippet } from "svelte";
interface Props {
  children: Snippet;
  row: Snippet<[data: Row]>;
  onsearch?: (query: string) => void;
}
```

### 8.4 泛型组件

用 `<script lang="ts" generics="T">`：

```svelte
<script lang="ts" generics="T extends { id: string | number }">
  interface Props {
    items: T[];
    children: Snippet<[item: T, index: number]>;
  }
  let { items, children }: Props = $props();
</script>
```

支持多参数 `generics="K, V"`、约束 `generics="T extends ..."`、默认类型 `generics="T = Record<string, unknown>"`。

### 8.5 可辨识联合 Props

形态多变的组件用联合类型获得类型收窄：

```ts
type Props =
  | { type: "link"; href: string }
  | { type: "button"; onclick: () => void };
```

---

## 9. SvelteKit 模式

### 9.1 Load 函数类型

| 文件              | 运行环境         | 用途                               | 禁止                      |
| ----------------- | ---------------- | ---------------------------------- | ------------------------- |
| `+page.server.ts` | 仅服务端         | 密钥、数据库连接、服务端 API       | 返回函数/类等非序列化数据 |
| `+page.ts`        | 通用（可浏览器） | 公开 API、非序列化数据、客户端缓存 | 含私密环境变量            |

- 密钥用 `import { SECRET } from '$env/static/private'`（仅 `.server`）；公开变量用 `$env/static/public`。
- `+page.server.ts` 返回值必须可序列化（JSON），不能返回 `DOMParser` 实例或箭头函数。

### 9.2 页面/布局类型

SvelteKit 自动生成 `./$types`：

```svelte
<script lang="ts">
  import type { PageProps, LayoutProps, PageServerLoad, Actions } from './$types';
  let { data, form }: PageProps = $props();   // 含表单页用 { data, form }
  let { data, children }: LayoutProps = $props();
</script>
{@render children()}
```

错误页通过 `page`（`from '$app/state'`）获取 `status` 与 `error?.message`。

### 9.3 表单 Actions

区分预期错误与意外错误：

| 场景          | 函数                          | 结果             |
| ------------- | ----------------------------- | ---------------- |
| 缺字段/格式错 | `fail(400, { error, email })` | 保留表单，可回显 |
| 未找到        | `throw error(404, ...)`       | 错误页           |
| 服务端异常    | `throw error(500, ...)`       | 错误页           |
| 需登录        | `throw redirect(303, ...)`    | 跳转             |

> 验证错误用 `fail()` 而非 `throw error(400)`，避免跳转错误页破坏体验。前端用 `use:enhance` 做渐进增强。

### 9.4 SSR 状态隔离（安全红线）

Node 服务端单例会跨请求共享，导致用户数据泄露。

- ❌ 模块级 `let currentUser = null` 或 `export const user = $state(null)`（服务端单例）。
- ✅ 用 `hooks.server.ts` 的 `handle` 写入 `event.locals.user`，load 返回 `locals.user`（每请求独立）。
- ✅ Context 传递：布局中 `setContext('user', { get current() { return data.user; } })`。
- ✅ 客户端状态用 `browser`（`from '$app/environment'`）包裹 `$state`，确保仅浏览器实例化。
- SSR 安全清单：无模块级用户变量、无全局 `$state` 在 SSR 被赋值、所有用户数据经 `locals`、所有页面数据来自 load 返回。

---

## 10. 性能最佳实践

### 10.1 避免过度响应式

| 反模式                        | 正确做法                     |
| ----------------------------- | ---------------------------- |
| 用 `$effect` 设置派生值       | 用 `$derived`                |
| effect 内循环依赖（a→b→a）    | 拆分独立 effect 或改事件处理 |
| effect 内日志导致自身依赖变更 | `untrack(() => { ... })`     |
| `$derived` 里重度计算         | 对输入防抖再用 `$derived`    |
| `$effect` 手动改 DOM 显隐     | 用 `{#if}` 或 `class:hidden` |

### 10.2 细粒度更新与跨模块状态

Runes 可在 `.svelte.js` / `.svelte.ts` 中定义**组件外共享**的细粒度响应式状态：

```ts
// counter.svelte.ts
export const counter = $state({ count: 0 });
export function increment() {
  counter.count++;
}
```

- 模块作用域不可用 `$derived`，用 getter 代替（`get filtered() { ... }`）。
- 响应式类：`count = $state(0)` + `get filtered() {...}`。
- 相关状态分组成员对象，利于细粒度更新。
- SSR 时切勿在模块顶层初始化仅浏览器可用的状态。

### 10.3 加载策略（并行 + 流式）

- ❌ 顺序 `await` 三个各 1s 接口 → 3s。
- ✅ `Promise.all([...])` → 1s（防止请求瀑布）。
- ✅ 流式：关键数据 `await`，非关键数据直接返回 `fetch(...).then(...)` 不 await，组件用 `{#await data.analytics}...{:then}...{/await}` 显示骨架屏。
- 决策：用户/主内容阻塞渲染；分析/推荐/评论可晚载或流式。

---

## 11. 迁移指南（Svelte 4 → 5）

### 11.1 语法对照

| 旧（Svelte 4）                                       | 新（Svelte 5）                                       |
| ---------------------------------------------------- | ---------------------------------------------------- |
| `export let x`                                       | `let { x } = $props()`                               |
| `export let x = 1`                                   | `let { x = 1 } = $props()`                           |
| `$: doubled = count * 2`                             | `let doubled = $derived(count * 2)`                  |
| `let x; $: x = f()`                                  | `let x = $derived(f())`                              |
| `on:click={...}`                                     | `onclick={...}`                                      |
| `<slot />`                                           | `{@render children?.()}`                             |
| `slot="header"`                                      | `let { header } = $props()` + `{@render header?.()}` |
| `createEventDispatcher`                              | 回调 props                                           |
| `import { writable } from 'svelte/store'` + `$store` | `$state` / `.svelte.ts` 共享状态                     |

### 11.2 响应式语句（`$:` → `$derived` / `$effect`）

```svelte
<!-- Svelte 4 -->
$: doubled = count * 2;            // 计算 → $derived
$: console.log(count);             // 带副作用 → $effect
$: if (cond) doSomething();         // 副作用分支 → $effect

<!-- Svelte 5 -->
let doubled = $derived(count * 2);
$effect(() => { console.log(count); });
$effect(() => { if (cond) doSomething(); });
```

> 纯计算的 `$:` 一律用 `$derived`；含订阅/打印/DOM 副作用的 `$:` 用 `$effect`。

### 11.3 Store → Rune

- **本地组件状态**：`writable` → `$state`，模板里 `$count` 自动订阅 → 直接访问变量。
  ```svelte
  <script>
    let count = $state(0);
    function increment() { count++; }
  </script>
  <button onclick={increment}>Count: {count}</button>
  ```
- **跨组件共享状态**：创建 `.svelte.ts` 模块，导出 `$state` 与修改函数（无需订阅）。
  ```ts
  // state.svelte.ts
  export const theme = $state({ current: "light" as "light" | "dark" });
  export function setTheme(t: "light" | "dark") {
    theme.current = t;
  }
  ```
- **`derived(store, fn)`** → 组件内 `$derived(fn())`。
- **自定义 store** → 响应式类（字段用 `$state`，方法改值）：
  ```ts
  // counter.svelte.ts
  class Counter {
    value = $state(0);
    increment() {
      this.value++;
    }
    decrement() {
      this.value--;
    }
    reset() {
      this.value = 0;
    }
  }
  export const counter = new Counter();
  ```
- **异步状态**：用 `$state({ data, loading, error })` 对象 + async 函数统一修改。
- **Store → Rune 速查表**：

  | Store 模式               | Rune 替代                 |
  | ------------------------ | ------------------------- |
  | `writable(value)`        | `$state(value)`           |
  | `$store`（自动订阅）     | 直接访问 `$state` 值      |
  | `store.set(x)`           | `state = x`               |
  | `store.update(fn)`       | 直接变更 / 重赋值         |
  | `derived(store, fn)`     | 组件中 `$derived(fn())`   |
  | `readable(value, start)` | `$state` + `$effect` 设置 |

- **何时仍应保留 Store**：① 与期望 Svelte store 的第三方库互操作；② 遗留代码渐进迁移期；③ 需要 `subscribe` API 的可观察模式；④ 依赖 Store 内置的 SSR 处理。其余场景优先用 runes。仍需兼容旧 store 时可用 `fromStore()` / `toStore()` 桥接。

### 11.4 自动化迁移

Svelte 官方提供迁移命令，可自动将 Svelte 4 语法转为 Svelte 5：

```bash
npx sv migrate svelte-5
```

> 该命令会直接改写源文件。执行前务必已 `git commit` 或完整备份；自动迁移可能存在边缘不兼容，需人工复核。
>
> SSR 模块级状态必须改为 `locals` 或 context 传递（见 9.4）。

---

## 12. 常见错误清单（验收红线）

> 每条均给出 ❌ 反模式与 ✅ 正确写法。

1. **`let` 忘了 `$state`** → 变量无响应性。
   ```svelte
   ❌ let count = 0; count++;        // UI 不更新
   ✅ let count = $state(0); count++; // 响应式
   ```
2. **用 `$effect` 处理派生值** → 应 `$derived`。
   ```svelte
   ❌ let doubled; $effect(() => { doubled = count * 2; });
   ✅ let doubled = $derived(count * 2);
   ```
3. **使用 `on:click` 指令** → Svelte 5 应 `onclick`（且修饰符已移除）。
   ```svelte
   ❌ <button on:click|preventDefault={fn}>      // 指令与修饰符均废弃
   ✅ <button onclick={(e) => { e.preventDefault(); fn(); }}>  // 标准属性 + 函数内处理
   ```
4. **使用 `createEventDispatcher`** → 应回调 props。
   ```svelte
   ❌ import { createEventDispatcher } from 'svelte'; const dispatch = createEventDispatcher();
      dispatch('select', item);
   ✅ let { onselect } = $props(); onselect?.(item);   // 父组件传 onselect={() => ...}
   ```
5. **使用 `<slot>`** → 应 snippets + `{@render}`。
   ```svelte
   ❌ <slot name="header" />
   ✅ let { header } = $props(); {@render header?.()}
   ```
6. **`bind:` 但 prop 未 `$bindable()`** → 子组件需 `x = $bindable()`。
   ```svelte
   ❌ let { value } = $props(); <input bind:value />   // 父组件 bind:value 不生效
   ✅ let { value = $bindable() } = $props(); <input bind:value />
   ```
7. **SSR 中设置模块级状态** → 跨请求状态泄漏；改用 `locals` 或 context。
   ```ts
   ❌ export const user = $state(null);         // 服务端单例，用户 A 数据被 B 覆盖
   ✅ // hooks.server.ts: event.locals.user = ...; load 返回 locals.user
   ```
8. **load 函数中顺序 `await`** → 应 `Promise.all` 并行（防止请求瀑布）。
   ```ts
   ❌ const a = await getA(); const b = await getB();   // 串行，耗时相加
   ✅ const [a, b] = await Promise.all([getA(), getB()]); // 并行
   ```
9. **解构 `$state` 对象后期望响应性保留** → 解构出的原始值会丢失响应性。
   ```svelte
   ❌ let { done } = todo;            // todo.done 变更，done 不更新
   ✅ todo.done = !todo.done;         // 始终通过原代理引用修改
   ```
10. **在 `$effect` 里更新状态同步数据** → 应 `$derived`（否则无限循环）。
    ```svelte
    ❌ $effect(() => { doubled = count * 2; });  // 反模式
    ✅ let doubled = $derived(count * 2);
    ```

---

## 13. AI 工具与技能集成

### 13.1 官方 Svelte MCP（`sveltejs/ai-tools`）

官方提供 MCP Server（`mcp.svelte.dev`），供 Claude/Cursor 等 AI 助手查询最新 Svelte API 与生成代码：

- 仓库 `sveltejs/ai-tools`，pnpm monorepo，含 `.agents/skills/`、`.claude-plugin/`、`.cursor-plugin/`。
- `.mcp.json` 定义端点；本地开发地址 `http://localhost:5173/mcp`（Streamable HTTP）。
- 团队引入 AI 编码时，优先加载官方技能与 `CLAUDE.md` / `.cursor-plugin` 中的规则，保证生成代码符合 Svelte 5 语法。

### 13.2 社区最佳实践技能（`ejirocodes/agent-skills`）

`agent-skills` 是结构化知识库，其中 `svelte5-best-practices` 技能提供：

- `SKILL.md`：核心模式快速参考。
- `references/`：`runes.md`、`snippets.md`、`events.md`、`typescript.md`、`migration.md`、`sveltekit.md`、`performance.md`。
- 技能结构通用约定：`SKILL.md`（入口）+ `references/*.md`（按需渐进加载）。

团队可参照该结构，将本规范沉淀为自有 agent skill，供 AI 助手渐进式调用。

---

## 14. 代码风格与 Lint 约定

- 缩进 2 空格，字符串优先单引号（`prettier` 默认），行尾无多余空格，文件末尾换行。
- 组件文件名 `PascalCase.svelte`，工具/状态文件 `kebab-case.svelte.ts`。
- 每个组件 Props 用 `interface Props` 集中声明并加 `lang="ts"`。
- 提交前运行 `sv check` + `eslint` + 格式化，CI 中强制通过。
- 使用 Prettier 官方 `prettier-plugin-svelte`，**不要**混用其它 Svelte 格式化器。
- `<script>` 顺序建议：导入 → 类型/接口 → `$props` → `$state` → `$derived` → 函数/事件 → `$effect`。

---

## 15. 快速检查清单（提交前）

- [ ] 所有响应式状态用 `$state` / `$derived`（非裸 `let`、`$:`）。
- [ ] Props 用 `$props()` 解构并声明 `interface Props`。
- [ ] 事件用 `onclick` 等属性式，无 `on:` 指令、无事件修饰符。
- [ ] 子内容用 `{#snippet}` + `{@render ...?.()}`，无 `<slot>`。
- [ ] 子→父通信用回调 props，无 `createEventDispatcher`。
- [ ] 双向绑定 prop 标记 `$bindable()`。
- [ ] 无 SSR 模块级用户状态（用 `locals` / context）。
- [ ] `sv check` 与 ESLint 通过、Prettier 已格式化。
- [ ] `{@html}` 仅用于可信内容，不可信输入已转义（防 XSS）。
- [ ] 元素级 DOM 行为优先用 `{@attach}`，不用 `use:`（或明确兼容）。

---

## 16. 参考文档

- **Svelte 官方文档（中文）**：<https://svelte.js.cn/docs>
- **Svelte 官方文档（英文）**：<https://svelte.dev/docs>
- **Svelte 基础教程（本规范主要补充来源）**：<https://svelte.js.cn/tutorial/svelte/welcome-to-svelte>
  - 入门：你的第一个组件、动态属性、样式、嵌套组件、HTML 标签
  - 响应式：状态、深层状态、派生状态、检查状态、效果、通用响应式
  - Props：声明、默认值、展开
  - 逻辑：if/else/else-if、each（带 key）、await、key 块
  - 事件：DOM 事件、内联处理、捕获、组件事件、展开事件
  - 绑定：文本/数字/复选框/选择/单选组/多选/文本域、class 与 style、媒体尺寸、组件实例
  - 类与样式、附件（attach）、过渡、运动（tweened/spring）、特殊元素
- **Svelte MCP（官方 AI 工具）**：<https://github.com/sveltejs/ai-tools>
- **Svelte 5 最佳实践技能（社区）**：<https://github.com/ejirocodes/agent-skills>
  - `svelte/skills/svelte5-best-practices/SKILL.md` 及其 `references/`（runes / snippets / events / typescript / migration / sveltekit / performance）
- **`{@attach}` 参考**：<https://svelte.js.cn/docs/svelte/svelte-attachments>
- **`{@html}` 安全（OWASP XSS）**：<https://owasp.org/www-community/attacks/xss/>
