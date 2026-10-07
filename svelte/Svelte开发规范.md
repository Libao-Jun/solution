# Svelte 开发规范与指南

> 适用范围：**Svelte 5（Runes 模式）** + **SvelteKit**。本规范综合 Svelte 官方文档、官方 `sveltejs/ai-tools`（MCP）与社区 `ejirocodes/agent-skills`（Svelte 5 最佳实践技能）整理，为团队提供统一的编码约定与验收口径。
>
> 参考文档：
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

| 工具 | 用途 |
|------|------|
| `sv` | 官方 CLI，创建/添加适配器/升级项目 |
| `sv check` | 类型与 Svelte 专属静态检查（等价 `svelte-check`） |
| Prettier + `prettier-plugin-svelte` | 官方推荐格式化（**不要用其他格式化器**） |
| ESLint（`eslint.config.js`） | 配合 `@typescript-eslint` 做代码规范 |
| `.editorconfig` | 统一缩进/换行等基础风格 |

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
let person = $state.raw({ name: 'Heraclitus', age: 49 });
person.age += 1;                          // ❌ 无效
person = { name: 'Heraclitus', age: 50 }; // ✅ 整体替换才生效
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
$inspect(count);                       // 状态变化时打印
$inspect.with(() => ({ label: 'c', value: count })); // 自定义输出
```

### 4.8 `$state.snapshot` — 快照

获取深层状态的静态副本（用于跨库传递/序列化/比较）：

```ts
import { $state } from 'svelte'; // 实际为顶层 $state.snapshot
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
<input bind:value={text} />
<input type="checkbox" bind:checked={ok} />
<select bind:value={choice}>…</select>

<div class:active={isActive} class:hidden={!visible}>…</div>
<div style:color={color} style:width={`${w}px`}>…</div>
<input bind:this={el} />          <!-- 获取 DOM/组件实例引用 -->
<Widget bind:this={comp} />
```

### 5.4 `use:` 与过渡

```svelte
<div use:tooltip={'提示'}>…</div>
<div transition:fade={{ duration: 200 }}>…</div>
```

自定义 action：`(node, params) => { ...; return { update, destroy } }`。

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

| 场景 | Svelte 4 | Svelte 5 |
|------|----------|----------|
| 默认内容 | `<slot />` | `let { children } = $props()` + `{@render children?.()}` |
| 具名插槽 | `<slot name="header" />` | `let { header } = $props()` + `{@render header?.()}` |
| 插槽传参 | `let:item` | `{#snippet children(item)}` + `{@render children?.(item)}` |
| 回退内容 | 默认 slot 内容 | `{#if children}{@render children()}{:else}默认{/if}` |

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
import type { Snippet } from 'svelte';
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
  | { type: 'link'; href: string }
  | { type: 'button'; onclick: () => void };
```

---

## 9. SvelteKit 模式

### 9.1 Load 函数类型

| 文件 | 运行环境 | 用途 | 禁止 |
|------|----------|------|------|
| `+page.server.ts` | 仅服务端 | 密钥、数据库连接、服务端 API | 返回函数/类等非序列化数据 |
| `+page.ts` | 通用（可浏览器） | 公开 API、非序列化数据、客户端缓存 | 含私密环境变量 |

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

| 场景 | 函数 | 结果 |
|------|------|------|
| 缺字段/格式错 | `fail(400, { error, email })` | 保留表单，可回显 |
| 未找到 | `throw error(404, ...)` | 错误页 |
| 服务端异常 | `throw error(500, ...)` | 错误页 |
| 需登录 | `throw redirect(303, ...)` | 跳转 |

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

| 反模式 | 正确做法 |
|--------|----------|
| 用 `$effect` 设置派生值 | 用 `$derived` |
| effect 内循环依赖（a→b→a） | 拆分独立 effect 或改事件处理 |
| effect 内日志导致自身依赖变更 | `untrack(() => { ... })` |
| `$derived` 里重度计算 | 对输入防抖再用 `$derived` |
| `$effect` 手动改 DOM 显隐 | 用 `{#if}` 或 `class:hidden` |

### 10.2 细粒度更新与跨模块状态

Runes 可在 `.svelte.js` / `.svelte.ts` 中定义**组件外共享**的细粒度响应式状态：

```ts
// counter.svelte.ts
export const counter = $state({ count: 0 });
export function increment() { counter.count++; }
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

| 旧（Svelte 4） | 新（Svelte 5） |
|----------------|----------------|
| `export let x` | `let { x } = $props()` |
| `export let x = 1` | `let { x = 1 } = $props()` |
| `$: doubled = count * 2` | `let doubled = $derived(count * 2)` |
| `let x; $: x = f()` | `let x = $derived(f())` |
| `on:click={...}` | `onclick={...}` |
| `<slot />` | `{@render children?.()}` |
| `slot="header"` | `let { header } = $props()` + `{@render header?.()}` |
| `createEventDispatcher` | 回调 props |
| `import { writable } from 'svelte/store'` + `$store` | `$state` / `.svelte.ts` 共享状态 |

- Store→Rune：组件内状态用 `$state`；跨模块状态用 `.svelte.ts` 的 `$state`；仍需兼容旧 store 时可用 `fromStore()` / `toStore()`。
- SSR 模块级状态必须改为 `locals` 或 context 传递。

---

## 12. 常见错误清单（验收红线）

1. 用 `let` 但忘了 `$state` → 变量无响应性。
2. 用 `$effect` 处理派生值 → 应 `$derived`。
3. 使用 `on:click` 指令 → Svelte 5 应 `onclick`。
4. 使用 `createEventDispatcher` → 应回调 props。
5. 使用 `<slot>` → 应 snippets + `{@render}`。
6. `bind:` 但 prop 未 `$bindable()` → 子组件需 `x = $bindable()`。
7. SSR 中设置模块级状态 → 跨请求状态泄漏。
8. load 函数中顺序 `await` → 应 `Promise.all` 并行。
9. 解构 `$state` 对象后期望响应性保留 → 解构会丢失响应性。
10. 在 `$effect` 里更新状态同步数据 → 应 `$derived`（避免无限循环）。

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
