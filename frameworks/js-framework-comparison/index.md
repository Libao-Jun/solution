# JS 框架语法对比

> 本文对照 **[Component Party](https://component-party.lainbo.com/?f=react-vue3-svelte5-svelte4-vue2)** 的示例结构，逐项列出 **React 18、Vue 3、Vue 2、Svelte 5、Svelte 4** 五个框架在同一场景下的写法差异。
>
> **参考文档**
>
> | 框架            | 官方文档                                       |
> | --------------- | ---------------------------------------------- |
> | React           | <https://react.docschina.org/learn>            |
> | Vue 3           | <https://cn.vuejs.org/guide/introduction.html> |
> | Vue 2           | <https://v2.cn.vuejs.org/v2/guide/>            |
> | Svelte（5 / 4） | <https://svelte.js.cn/>                        |
>
> **约定**
>
> - 示例与 Component Party 保持一致Vue 3 使用 `<script setup>` + 组合式 API；Vue 2 使用选项式 API（`data` / `computed` / `methods`）；Svelte 5 使用 **Runes**（`$state` / `$derived` / `$effect` / `$props`），Svelte 4 使用传统语法（`export let` / `$:` / `on:click` / `createEventDispatcher`）。
> - 每个示例右上角标注**文件名**（与 Component Party 的卡片一致）。
> - 五个框架的展示顺序统一为：**React → Vue 3 → Vue 2 → Svelte 5 → Svelte 4**。

---

## 目录

- [一、全局速查表](#一全局速查表)
- [1. 响应式](#1-响应式)
  - [1.1 声明状态](#11-声明状态)
  - [1.2 更新状态](#12-更新状态)
  - [1.3 计算属性](#13-计算属性)
- [2. 模板语法](#2-模板语法)
  - [2.1 最简模板](#21-最简模板)
  - [2.2 样式](#22-样式)
  - [2.3 DOM 循环](#23-dom-循环)
  - [2.4 点击事件](#24-点击事件)
  - [2.5 DOM 引用](#25-dom-引用)
  - [2.6 条件渲染](#26-条件渲染)
- [3. 生命周期](#3-生命周期)
  - [3.1 组件加载时](#31-组件加载时)
  - [3.2 组件卸载时](#32-组件卸载时)
- [4. 组件组合](#4-组件组合)
  - [4.1 组件 Props 传参](#41-组件-props-传参)
  - [4.2 向父组件 emit 事件](#42-向父组件-emit-事件)
  - [4.3 slot 插槽](#43-slot-插槽)
  - [4.4 slot 插槽默认内容](#44-slot-插槽默认内容)
  - [4.5 上下文](#45-上下文)
- [5. 表单输入](#5-表单输入)
  - [5.1 输入框](#51-输入框)
  - [5.2 复选框](#52-复选框)
  - [5.3 单选框](#53-单选框)
  - [5.4 选择器](#54-选择器)
- [6. Web 应用特性](#6-web-应用特性)
  - [6.1 渲染应用](#61-渲染应用)
  - [6.2 fetch 获取数据](#62-fetch-获取数据)
- [附录 A：常用语法对照速查](#附录-a常用语法对照速查)
- [附录 B：响应式模型差异](#附录-b响应式模型差异)

---

## 一、全局速查表

| #   | 特性         | React 18                       | Vue 3                  | Vue 2                | Svelte 5                     | Svelte 4                     |
| --- | ------------ | ------------------------------ | ---------------------- | -------------------- | ---------------------------- | ---------------------------- |
| 1   | 声明状态     | `useState`                     | `ref()` / `reactive()` | `data()`             | `$state()`                   | `let` 变量                   |
| 2   | 更新状态     | `setState()`                   | `x.value = …`          | `this.x = …`         | 直接赋值                     | 直接赋值                     |
| 3   | 计算属性     | 普通变量 / `useMemo`           | `computed()`           | `computed: {}`       | `$derived()`                 | `$: x = …`                   |
| 4   | 最简模板     | JSX `return`                   | SFC `<template>`       | SFC `<template>`     | SFC 顶层标签                 | SFC 顶层标签                 |
| 5   | 样式         | `className` / `style={{}}`     | `<style scoped>`       | `<style scoped>`     | `<style>`（默认局部）        | `<style>`（默认局部）        |
| 6   | 列表循环     | `arr.map()`                    | `v-for`                | `v-for`              | `{#each}`                    | `{#each}`                    |
| 7   | 点击事件     | `onClick={}`                   | `@click="fn"`          | `@click="fn"`        | `onclick={}`                 | `on:click={}`                |
| 8   | DOM 引用     | `useRef` + `ref={}`            | `ref` + `ref="x"`      | `$refs.x`            | `bind:this={}`               | `bind:this={}`               |
| 9   | 条件渲染     | `&&` / 三元                    | `v-if` / `v-else-if`   | `v-if` / `v-else-if` | `{#if}{:else if}`            | `{#if}{:else if}`            |
| 10  | 组件加载时   | `useEffect(fn, [])`            | `onMounted`            | `mounted()`          | `$effect()` / `onMount`      | `onMount`                    |
| 11  | 组件卸载时   | `useEffect` 返回清理函数       | `onUnmounted`          | `beforeDestroy()`    | `$effect` 返回清理           | `onDestroy` / `onMount` 返回 |
| 12  | Props 传参   | 函数参数解构                   | `defineProps()`        | `props: {}`          | `$props()`                   | `export let`                 |
| 13  | 子 → 父通信  | 回调函数 props                 | `defineEmits` + `@evt` | `this.$emit`         | 回调函数 props               | `createEventDispatcher`      |
| 14  | 默认插槽     | `children` prop                | `<slot />`             | `<slot />`           | `{@render children()}`       | `<slot />`                   |
| 15  | 插槽默认内容 | `children \|\| 默认值`         | `<slot>默认</slot>`    | `<slot>默认</slot>`  | `{#if children}` 分支        | `<slot>默认</slot>`          |
| 16  | 上下文       | `createContext` + `useContext` | `provide` / `inject`   | `provide` / `inject` | `setContext` / `getContext`  | `setContext` / `getContext`  |
| 17  | 文本输入     | `value` + `onChange`           | `v-model`              | `v-model`            | `bind:value`                 | `bind:value`                 |
| 18  | 复选框       | `checked` + `onChange`         | `v-model`              | `v-model`            | `bind:checked`               | `bind:checked`               |
| 19  | 单选框       | `checked` + `onChange`         | `v-model`              | `v-model`            | `bind:group`                 | `bind:group`                 |
| 20  | 下拉选择     | `value` + `onChange`           | `v-model`              | `v-model`            | `bind:value`                 | `bind:value`                 |
| 21  | 应用挂载     | `createRoot().render()`        | `createApp().mount()`  | `new Vue().$mount()` | `mount(App, {})`             | `new App()`                  |
| 22  | 请求数据     | 自定义 Hook                    | 组合式函数             | mixin / 生命周期     | `.svelte.js` 模块 + `$state` | store（`writable`）          |

---

## 1. 响应式

### 1.1 声明状态

**React**（`Name.jsx`）

```jsx
import { useState } from "react";

export default function Name() {
  const [name] = useState("张三");

  return <h1>你好 {name}</h1>;
}
```

**Vue 3**（`Name.vue`）

```vue
<script setup>
import { ref } from "vue";

const name = ref("张三");
</script>

<template>
  <h1>你好 {{ name }}</h1>
</template>
```

**Vue 2**（`Name.vue`）

```vue
<script>
export default {
  data() {
    return {
      name: "张三",
    };
  },
};
</script>

<template>
  <h1>你好 {{ name }}</h1>
</template>
```

**Svelte 5**（`Name.svelte`）

```svelte
<script>
  let name = $state("张三");
</script>

<h1>你好 {name}</h1>
```

**Svelte 4**（`Name.svelte`）

```svelte
<script>
  let name = "张三";
</script>

<h1>你好 {name}</h1>
```

> **要点**
> - React 用 `useState` 显式声明并返回 `[值, setter]`；
> - Vue 3 用 `ref()`（模板自动解包，脚本内需 `.value`）；
> - Vue 2 状态必须挂在 `data()` 返回值里才能响应式；
> - Svelte 5 用 `$state()` rune，Svelte 4 普通 `let` 顶层变量即为响应式状态。

---

### 1.2 更新状态

**React**（`Name.jsx`）

```jsx
import { useEffect, useState } from "react";

export default function Name() {
  const [name, setName] = useState("张三");

  useEffect(() => {
    setName("李四");
  }, []);

  return <h1>你好 {name}</h1>;
}
```

**Vue 3**（`Name.vue`）

```vue
<script setup>
import { ref } from "vue";

const name = ref("张三");

name.value = "李四";
</script>

<template>
  <h1>你好 {{ name }}</h1>
</template>
```

**Vue 2**（`Name.vue`）

```vue
<script>
export default {
  data() {
    return {
      name: "张三",
    };
  },
  mounted() {
    this.name = "李四";
  },
};
</script>

<template>
  <h1>你好 {{ name }}</h1>
</template>
```

**Svelte 5**（`Name.svelte`）

```svelte
<script>
  let name = $state("张三");
  name = "李四";
</script>

<h1>你好 {name}</h1>
```

**Svelte 4**（`Name.svelte`）

```svelte
<script>
  let name = "张三";
  name = "李四";
</script>

<h1>你好 {name}</h1>
```

> **要点**
> - React 状态不可直接改，必须走 setter（且触发重渲染需异步）；
> - Vue 3 脚本内改 `ref` 要写 `.value`（模板中不用）；
> - Vue 2 直接 `this.x =`；
> - Svelte 直接重新赋值即可（`$state` 是代理，Svelte 4 靠编译期插桩）。

---

### 1.3 计算属性

**React**（`DoubleCount.jsx`）

```jsx
import { useState } from "react";

export default function DoubleCount() {
  const [count] = useState(10);
  const doubleCount = count * 2;

  return <div>{doubleCount}</div>;
}
```

> React 没有「计算属性」概念，派生值就是**每次渲染时重新计算的普通变量**；需要缓存时才用 `useMemo(() => count * 2, [count])`。

**Vue 3**（`DoubleCount.vue`）

```vue
<script setup>
import { ref, computed } from "vue";

const count = ref(10);
const doubleCount = computed(() => count.value * 2);
</script>

<template>
  <div>{{ doubleCount }}</div>
</template>
```

**Vue 2**（`DoubleCount.vue`）

```vue
<script>
export default {
  data() {
    return {
      count: 10,
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    },
  },
};
</script>

<template>
  <div>{{ doubleCount }}</div>
</template>
```

**Svelte 5**（`DoubleCount.svelte`）

```svelte
<script>
  let count = $state(10);
  const doubleCount = $derived(count * 2);
</script>

<div>{doubleCount}</div>
```

**Svelte 4**（`DoubleCount.svelte`）

```svelte
<script>
  let count = 10;
  $: doubleCount = count * 2;
</script>

<div>{doubleCount}</div>
```

> **要点**
> - Vue 用 `computed`（有缓存、自动追踪依赖）
> - Svelte 5 用 `$derived`（惰性求值）；
> - Svelte 4 用 `$:` 响应式声明（`$:` 后是语句，会被编译成依赖触发器）；
> - React 无内置缓存，靠 `useMemo`。

---

## 2. 模板语法

### 2.1 最简模板

**React**（`HelloWorld.jsx`）

```jsx
export default function HelloWorld() {
  return <h1>你好，世界</h1>;
}
```

**Vue 3**（`HelloWorld.vue`）

```vue
<template>
  <h1>你好，世界</h1>
</template>
```

**Vue 2**（`HelloWorld.vue`）

```vue
<template>
  <h1>你好，世界</h1>
</template>
```

**Svelte 5**（`HelloWorld.svelte`）

```svelte
<h1>你好，世界</h1>
```

**Svelte 4**（`HelloWorld.svelte`）

```svelte
<h1>你好，世界</h1>
```

> **要点**
> - React 的模板即 **JSX**，是「能写标签的 JS」，必须有一个返回值、可嵌套任意表达式；
> - Vue 用 `<template>` 包裹 HTML，Svelte 则**不需要任何包裹节点**，`.svelte` 文件顶层就是模板。

---

### 2.2 样式

**React**（`CssStyle.jsx` + `style.css`）

```jsx
import "./style.css";

export default function CssStyle() {
  return (
    <>
      <h1 className="title">我是红色的</h1>
      <button style={{ fontSize: "10rem" }}>我是一个按钮</button>
    </>
  );
}
```

```css
/* style.css */
.title {
  color: red;
}
```

**Vue 3**（`CssStyle.vue`）

```vue
<template>
  <h1 class="title">我是红色的</h1>
  <button style="font-size: 10rem">我是一个按钮</button>
</template>

<style scoped>
.title {
  color: red;
}
</style>
```

**Vue 2**（`CssStyle.vue`）

```vue
<template>
  <h1 class="title">我是红色的</h1>
  <button style="font-size: 10rem">我是一个按钮</button>
</template>

<style scoped>
.title {
  color: red;
}
</style>
```

**Svelte 5**（`CssStyle.svelte`）

```svelte
<h1 class="title">我是红色的</h1>
<button style="font-size: 10rem;">我是一个按钮</button>

<style>
  .title {
    color: red;
  }
</style>
```

**Svelte 4**（`CssStyle.svelte`）

```svelte
<h1 class="title">我是红色的</h1>
<button style="font-size: 10rem;">我是一个按钮</button>

<style>
  .title {
    color: red;
  }
</style>
```

> **要点**：
>
> - React 的 class 写作 `className`，行内样式是**对象** `style={{ fontSize: "10rem" }}`（camelCase 属性名）。
> - Vue / Svelte 直接写原生 `class` 与 `style="..."` 字符串；两者都有 `<style>` 块。
> - **样式作用域**：Vue 需显式加 `scoped` 才隔离；Svelte 的 `<style>` **默认就是组件级隔离**（编译期生成哈希 class），需要全局样式时用 `:global(...)`。

---

### 2.3 DOM 循环

**React**（`Colors.jsx`）

```jsx
export default function Colors() {
  const colors = ["红", "绿", "蓝"];
  return (
    <ul>
      {colors.map((color) => (
        <li key={color}>{color}</li>
      ))}
    </ul>
  );
}
```

**Vue 3**（`Colors.vue`）

```vue
<script setup>
const colors = ["红", "绿", "蓝"];
</script>

<template>
  <ul>
    <li v-for="color in colors" :key="color">{{ color }}</li>
  </ul>
</template>
```

**Vue 2**（`Colors.vue`）

```vue
<script>
export default {
  data() {
    return {
      colors: ["红", "绿", "蓝"],
    };
  },
};
</script>

<template>
  <ul>
    <li v-for="color in colors" :key="color">{{ color }}</li>
  </ul>
</template>
```

**Svelte 5**（`Colors.svelte`）

```svelte
<script>
  const colors = ["红", "绿", "蓝"];
</script>

<ul>
  {#each colors as color (color)}
    <li>{color}</li>
  {/each}
</ul>
```

**Svelte 4**（`Colors.svelte`）

```svelte
<script>
  const colors = ["红", "绿", "蓝"];
</script>

<ul>
  {#each colors as color}
    <li>{color}</li>
  {/each}
</ul>
```

> **要点**：
>
> - React 用 JS 原生 `.map()`，`key` 是 React 保留属性。
> - Vue 用 `v-for`，`:key` 可省略但强烈建议保留；也可 `v-for="(item, index) in list"`。
> - Svelte 用 `{#each}` 块；**Svelte 5 语法是 `{#each list as item (key)}`（key 放在括号里）**，Svelte 4 若要 keyed each 写作 `{#each list as item (item.id)}`，此处最简单场景可省略。

---

### 2.4 点击事件

**React**（`Counter.jsx`）

```jsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  function incrementCount() {
    setCount((count) => count + 1);
  }

  return (
    <>
      <p>计数器: {count}</p>
      <button onClick={incrementCount}>+1</button>
    </>
  );
}
```

**Vue 3**（`Counter.vue`）

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);

function incrementCount() {
  count.value++;
}
</script>

<template>
  <p>计数器: {{ count }}</p>
  <button @click="incrementCount">+1</button>
</template>
```

**Vue 2**（`Counter.vue`）

```vue
<script>
export default {
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    incrementCount() {
      this.count++;
    },
  },
};
</script>

<template>
  <p>计数器: {{ count }}</p>
  <button @click="incrementCount">+1</button>
</template>
```

**Svelte 5**（`Counter.svelte`）

```svelte
<script>
  let count = $state(0);

  function incrementCount() {
    count++;
  }
</script>

<p>计数器: {count}</p>
<button onclick={incrementCount}>+1</button>
```

**Svelte 4**（`Counter.svelte`）

```svelte
<script>
  let count = 0;

  function incrementCount() {
    count++;
  }
</script>

<p>计数器: {count}</p>
<button on:click={incrementCount}>+1</button>
```

> **要点**：
>
> - React：`onClick` — **驼峰**，值是函数引用（注意别写成 `onClick={fn()}`）。
> - Vue：`@click`（即 `v-on:click`），可加修饰符 `@click.stop.prevent`。
> - Svelte 5：`onclick` — **全小写**（对齐 DOM 属性名）；Svelte 4：`on:click` — 冒号指令。这是 Svelte 4 → 5 最典型的迁移点之一。

---

### 2.5 DOM 引用

**React**（`InputFocused.jsx`）

```jsx
import { useEffect, useRef } from "react";

export default function InputFocused() {
  const inputElement = useRef(null);

  useEffect(() => inputElement.current.focus(), []);

  return <input type="text" ref={inputElement} />;
}
```

**Vue 3**（`InputFocused.vue`）

```vue
<script setup>
import { ref, onMounted } from "vue";

const inputElement = ref(null);

onMounted(() => inputElement.value.focus());
</script>

<template>
  <input type="text" ref="inputElement" />
</template>
```

**Vue 2**（`InputFocused.vue`）

```vue
<script>
export default {
  mounted() {
    this.$refs.inputElement.focus();
  },
};
</script>

<template>
  <input type="text" ref="inputElement" />
</template>
```

**Svelte 5**（`InputFocused.svelte`）

```svelte
<script>
  let inputElement;

  $effect(() => {
    inputElement.focus();
  });
</script>

<input bind:this={inputElement} />
```

**Svelte 4**（`InputFocused.svelte`）

```svelte
<script>
  import { onMount } from "svelte";

  let inputElement;

  onMount(() => inputElement.focus());
</script>

<input bind:this={inputElement} />
```

> **要点**
> - React 的 `useRef` 返回一个 `{ current }` 容器；
> - Vue 3 的模板 ref 变量名**必须与 `ref="xxx"` 字符串同名**；
> - Vue 2 走 `this.$refs.xxx`；
> - Svelte 用 `bind:this={变量}`，变量在挂载后自动被赋值为 DOM 节点（5 与 4 语法一致，仅「何时执行」不同）。

---

### 2.6 条件渲染

**React**（`TrafficLight.jsx`）

```jsx
import { useState } from "react";

const TRAFFIC_LIGHTS = ["红灯", "黄灯", "绿灯"];

export default function TrafficLight() {
  const [lightIndex, setLightIndex] = useState(0);

  const light = TRAFFIC_LIGHTS[lightIndex];

  function nextLight() {
    setLightIndex((lightIndex + 1) % TRAFFIC_LIGHTS.length);
  }

  return (
    <>
      <button onClick={nextLight}>下一个灯</button>
      <p>现在亮着的是: {light}</p>
      <p>
        你应该
        {light === "红灯" && <span>停下</span>}
        {light === "黄灯" && <span>慢行</span>}
        {light === "绿灯" && <span>赶紧走</span>}
      </p>
    </>
  );
}
```

**Vue 3**（`TrafficLight.vue`）

```vue
<script setup>
import { ref, computed } from "vue";

const TRAFFIC_LIGHTS = ["红灯", "黄灯", "绿灯"];
const lightIndex = ref(0);

const light = computed(() => TRAFFIC_LIGHTS[lightIndex.value]);

function nextLight() {
  lightIndex.value = (lightIndex.value + 1) % TRAFFIC_LIGHTS.length;
}
</script>

<template>
  <button @click="nextLight">下一个灯</button>
  <p>现在亮着的是: {{ light }}</p>
  <p>
    你应该
    <span v-if="light === '红灯'">停下</span>
    <span v-else-if="light === '黄灯'">慢行</span>
    <span v-else-if="light === '绿灯'">赶紧走</span>
  </p>
</template>
```

**Vue 2**（`TrafficLight.vue`）

```vue
<script>
const TRAFFIC_LIGHTS = ["红灯", "黄灯", "绿灯"];

export default {
  data() {
    return {
      TRAFFIC_LIGHTS,
      lightIndex: 0,
    };
  },
  computed: {
    light() {
      return this.TRAFFIC_LIGHTS[this.lightIndex];
    },
  },
  methods: {
    nextLight() {
      this.lightIndex = (this.lightIndex + 1) % this.TRAFFIC_LIGHTS.length;
    },
  },
};
</script>

<template>
  <button @click="nextLight">下一个灯</button>
  <p>现在亮着的是: {{ light }}</p>
  <p>
    你应该
    <span v-if="light === '红灯'">停下</span>
    <span v-else-if="light === '黄灯'">慢行</span>
    <span v-else-if="light === '绿灯'">赶紧走</span>
  </p>
</template>
```

**Svelte 5**（`TrafficLight.svelte`）

```svelte
<script>
  const TRAFFIC_LIGHTS = ["红灯", "黄灯", "绿灯"];
  let lightIndex = $state(0);

  const light = $derived(TRAFFIC_LIGHTS[lightIndex]);

  function nextLight() {
    lightIndex = (lightIndex + 1) % TRAFFIC_LIGHTS.length;
  }
</script>

<button onclick={nextLight}>下一个灯</button>
<p>现在亮着的是: {light}</p>
<p>
  你应该
  {#if light === "红灯"}
    <span>停下</span>
  {:else if light === "黄灯"}
    <span>慢行</span>
  {:else if light === "绿灯"}
    <span>赶紧走</span>
  {/if}
</p>
```

**Svelte 4**（`TrafficLight.svelte`）

```svelte
<script>
  const TRAFFIC_LIGHTS = ["红灯", "黄灯", "绿灯"];
  let lightIndex = 0;

  $: light = TRAFFIC_LIGHTS[lightIndex];

  function nextLight() {
    lightIndex = (lightIndex + 1) % TRAFFIC_LIGHTS.length;
  }
</script>

<button on:click={nextLight}>下一个灯</button>
<p>现在亮着的是: {light}</p>
<p>
  你应该
  {#if light === "红灯"}
    <span>停下</span>
  {:else if light === "黄灯"}
    <span>慢行</span>
  {:else if light === "绿灯"}
    <span>赶紧走</span>
  {/if}
</p>
```

> **要点**：React 的条件渲染就是 JS 本身 —— `&&`、三元、`if` 提前 return；Vue 用 `v-if / v-else-if / v-else` 指令（另有 `v-show` 只切 display）；Svelte 用 `{#if} {:else if} {:else} {/if}` 块语法，注意 `{:else if}` 是**两段式**（冒号 + else）。

---

## 3. 生命周期

### 3.1 组件加载时

**React**（`PageTitle.jsx`）

```jsx
import { useState, useEffect } from "react";

export default function PageTitle() {
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    setPageTitle(document.title);
  }, []);

  return <p>页面标题: {pageTitle}</p>;
}
```

**Vue 3**（`PageTitle.vue`）

```vue
<script setup>
import { ref, onMounted } from "vue";

const pageTitle = ref("");

onMounted(() => {
  pageTitle.value = document.title;
});
</script>

<template>
  <p>页面标题: {{ pageTitle }}</p>
</template>
```

**Vue 2**（`PageTitle.vue`）

```vue
<script>
export default {
  data() {
    return {
      pageTitle: "",
    };
  },
  mounted() {
    this.pageTitle = document.title;
  },
};
</script>

<template>
  <p>页面标题: {{ pageTitle }}</p>
</template>
```

**Svelte 5**（`PageTitle.svelte`）

```svelte
<script>
  let pageTitle = $state("");
  $effect(() => {
    pageTitle = document.title;
  });
</script>

<p>页面标题: {pageTitle}</p>
```

**Svelte 4**（`PageTitle.svelte`）

```svelte
<script>
  import { onMount } from "svelte";

  let pageTitle = "";

  onMount(() => {
    pageTitle = document.title;
  });
</script>

<p>页面标题: {pageTitle}</p>
```

> **要点**：React 的 `useEffect(fn, [])`（空依赖数组）≈「挂载后执行一次」；Vue 用 `onMounted`（Vue 2 是 `mounted` 钩子）；Svelte 4 用 `onMount`（**只在浏览器端运行，SSR 时不会执行**）；Svelte 5 的 `$effect` 是「依赖变化时重新执行」的通用副作用，挂载时机等价，但要注意它会在依赖变化时重复运行。

---

### 3.2 组件卸载时

**React**（`Time.jsx`）

```jsx
import { useState, useEffect } from "react";

export default function Time() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <p>当前时间: {time}</p>;
}
```

**Vue 3**（`Time.vue`）

```vue
<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const time = ref(new Date().toLocaleTimeString());
let timer;

onMounted(() => {
  timer = setInterval(() => {
    time.value = new Date().toLocaleTimeString();
  }, 1000);
});

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <p>当前时间: {{ time }}</p>
</template>
```

**Vue 2**（`Time.vue`）

```vue
<script>
export default {
  data() {
    return {
      time: new Date().toLocaleTimeString(),
    };
  },
  mounted() {
    this.timer = setInterval(() => {
      this.time = new Date().toLocaleTimeString();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<template>
  <p>当前时间: {{ time }}</p>
</template>
```

> Vue 2 的卸载钩子是 `beforeDestroy` / `destroyed`；**Vue 3 已重命名为 `beforeUnmount` / `unmounted`**（`onUnmounted` 对应后者）。

**Svelte 5**（`Time.svelte`）

```svelte
<script>
  let time = $state(new Date().toLocaleTimeString());

  $effect(() => {
    const timer = setInterval(() => {
      time = new Date().toLocaleTimeString();
    }, 1000);

    return () => clearInterval(timer);
  });
</script>

<p>当前时间: {time}</p>
```

**Svelte 4**（`Time.svelte`）

```svelte
<script>
  import { onMount, onDestroy } from "svelte";

  let time = new Date().toLocaleTimeString();
  let timer;

  onMount(() => {
    timer = setInterval(() => {
      time = new Date().toLocaleTimeString();
    }, 1000);
  });

  onDestroy(() => clearInterval(timer));
</script>

<p>当前时间: {time}</p>
```

> Svelte 4 也可直接从 `onMount` **返回清理函数**（返回的函数会在卸载时调用）：
>
> ```svelte
> onMount(() => {
>   const timer = setInterval(tick, 1000);
>   return () => clearInterval(timer);
> });
> ```

---

## 4. 组件组合

### 4.1 组件 Props 传参

**React**（`App.jsx` + `UserProfile.jsx`）

```jsx
// App.jsx
import UserProfile from "./UserProfile.jsx";

export default function App() {
  return (
    <UserProfile
      name="张三"
      age={20}
      favouriteColors={["green", "blue", "red"]}
      isAvailable
    />
  );
}
```

```jsx
// UserProfile.jsx
export default function UserProfile({
  name,
  age,
  favouriteColors,
  isAvailable,
}) {
  return (
    <>
      <p>用户名: {name}</p>
      <p>年龄: {age}</p>
      <p>喜欢的颜色:</p>
      <ul>
        {favouriteColors.map((color) => (
          <li key={color}>{color}</li>
        ))}
      </ul>
      <p>是否可用: {isAvailable ? "是" : "否"}</p>
    </>
  );
}
```

**Vue 3**（`App.vue` + `UserProfile.vue`）

```vue
<!-- App.vue -->
<script setup>
import UserProfile from "./UserProfile.vue";
</script>

<template>
  <UserProfile
    name="张三"
    :age="20"
    :favourite-colors="['green', 'blue', 'red']"
    is-available
  />
</template>
```

```vue
<!-- UserProfile.vue -->
<script setup>
defineProps({
  name: String,
  age: Number,
  favouriteColors: Array,
  isAvailable: Boolean,
});
</script>

<template>
  <p>用户名: {{ name }}</p>
  <p>年龄: {{ age }}</p>
  <p>喜欢的颜色:</p>
  <ul>
    <li v-for="color in favouriteColors" :key="color">{{ color }}</li>
  </ul>
  <p>是否可用: {{ isAvailable ? "是" : "否" }}</p>
</template>
```

**Vue 2**（`App.vue` + `UserProfile.vue`）

```vue
<!-- App.vue -->
<script>
import UserProfile from "./UserProfile.vue";

export default {
  components: { UserProfile },
};
</script>

<template>
  <UserProfile
    name="张三"
    :age="20"
    :favourite-colors="['green', 'blue', 'red']"
    is-available
  />
</template>
```

```vue
<!-- UserProfile.vue -->
<script>
export default {
  props: {
    name: String,
    age: Number,
    favouriteColors: Array,
    isAvailable: Boolean,
  },
};
</script>

<template>
  <p>用户名: {{ name }}</p>
  <p>年龄: {{ age }}</p>
  <p>喜欢的颜色:</p>
  <ul>
    <li v-for="color in favouriteColors" :key="color">{{ color }}</li>
  </ul>
  <p>是否可用: {{ isAvailable ? "是" : "否" }}</p>
</template>
```

**Svelte 5**（`App.svelte` + `UserProfile.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import UserProfile from "./UserProfile.svelte";
</script>

<UserProfile
  name="张三"
  age={20}
  favouriteColors={["green", "blue", "red"]}
  isAvailable
/>
```

```svelte
<!-- UserProfile.svelte -->
<script>
  let { name, age, favouriteColors, isAvailable } = $props();
</script>

<p>用户名: {name}</p>
<p>年龄: {age}</p>
<p>喜欢的颜色:</p>
<ul>
  {#each favouriteColors as color}
    <li>{color}</li>
  {/each}
</ul>
<p>是否可用: {isAvailable ? "是" : "否"}</p>
```

**Svelte 4**（`App.svelte` + `UserProfile.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import UserProfile from "./UserProfile.svelte";
</script>

<UserProfile
  name="张三"
  age={20}
  favouriteColors={["green", "blue", "red"]}
  isAvailable
/>
```

```svelte
<!-- UserProfile.svelte -->
<script>
  export let name;
  export let age;
  export let favouriteColors;
  export let isAvailable;
</script>

<p>用户名: {name}</p>
<p>年龄: {age}</p>
<p>喜欢的颜色:</p>
<ul>
  {#each favouriteColors as color}
    <li>{color}</li>
  {/each}
</ul>
<p>是否可用: {isAvailable ? "是" : "否"}</p>
```

> **要点**：
>
> - Vue 传「字符串字面量」直接写 `name="张三"`，传「变量 / 数字 / 数组 / 布尔」需加 `:`（即 `v-bind`）：`:age="20"`、`is-available`（等价 `:is-available="true"`）；kebab-case 属性名会映射到 camelCase prop。
> - Svelte 5 用 `$props()` 一次性解构（可在解构时写默认值 `let { name = "默认" } = $props()`）；Svelte 4 用 `export let xxx` 逐个声明。**Svelte 5 的 `export let` 已废弃**。

---

### 4.2 向父组件 emit 事件

**React**（`App.jsx` + `AnswerButton.jsx`）

```jsx
// App.jsx
import { useState } from "react";
import AnswerButton from "./AnswerButton.jsx";

export default function App() {
  const [isHappy, setIsHappy] = useState(true);

  function onAnswerNo() {
    setIsHappy(false);
  }

  function onAnswerYes() {
    setIsHappy(true);
  }

  return (
    <>
      <p>你快乐吗?</p>
      <AnswerButton onYes={onAnswerYes} onNo={onAnswerNo} />
      <p style={{ fontSize: 50 }}>{isHappy ? "😀" : "😥"}</p>
    </>
  );
}
```

```jsx
// AnswerButton.jsx
export default function AnswerButton({ onYes, onNo }) {
  return (
    <>
      <button onClick={onYes}>是的</button>
      <button onClick={onNo}>不是</button>
    </>
  );
}
```

> React 没有「事件」机制，**就是把父组件的回调函数当作 props 传下去**。

**Vue 3**（`App.vue` + `AnswerButton.vue`）

```vue
<!-- App.vue -->
<script setup>
import { ref } from "vue";
import AnswerButton from "./AnswerButton.vue";

const isHappy = ref(true);
</script>

<template>
  <p>你快乐吗?</p>
  <AnswerButton @yes="isHappy = true" @no="isHappy = false" />
  <p style="font-size: 50px">{{ isHappy ? "😀" : "😥" }}</p>
</template>
```

```vue
<!-- AnswerButton.vue -->
<script setup>
const emit = defineEmits(["yes", "no"]);
</script>

<template>
  <button @click="emit('yes')">是的</button>
  <button @click="emit('no')">不是</button>
</template>
```

**Vue 2**（`App.vue` + `AnswerButton.vue`）

```vue
<!-- App.vue -->
<script>
import AnswerButton from "./AnswerButton.vue";

export default {
  components: { AnswerButton },
  data() {
    return {
      isHappy: true,
    };
  },
};
</script>

<template>
  <p>你快乐吗?</p>
  <AnswerButton @yes="isHappy = true" @no="isHappy = false" />
  <p style="font-size: 50px">{{ isHappy ? "😀" : "😥" }}</p>
</template>
```

```vue
<!-- AnswerButton.vue -->
<script>
export default {
  methods: {
    answerYes() {
      this.$emit("yes");
    },
    answerNo() {
      this.$emit("no");
    },
  },
};
</script>

<template>
  <button @click="answerYes">是的</button>
  <button @click="answerNo">不是</button>
</template>
```

**Svelte 5**（`App.svelte` + `AnswerButton.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import AnswerButton from "./AnswerButton.svelte";

  let isHappy = $state(true);

  function onAnswerNo() {
    isHappy = false;
  }

  function onAnswerYes() {
    isHappy = true;
  }
</script>

<p>你快乐吗?</p>
<AnswerButton onYes={onAnswerYes} onNo={onAnswerNo} />
<p style="font-size: 50px;">{isHappy ? "😀" : "😥"}</p>
```

```svelte
<!-- AnswerButton.svelte -->
<script>
  let { onYes, onNo } = $props();
</script>

<button onclick={onYes}>是的</button>
<button onclick={onNo}>不是</button>
```

> **Svelte 5 已弃用 `createEventDispatcher`**，官方推荐直接用**回调 props**（与 React 思路一致）。

**Svelte 4**（`App.svelte` + `AnswerButton.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import AnswerButton from "./AnswerButton.svelte";

  let isHappy = true;

  function onAnswerYes() {
    isHappy = true;
  }

  function onAnswerNo() {
    isHappy = false;
  }
</script>

<p>你快乐吗?</p>
<AnswerButton on:yes={onAnswerYes} on:no={onAnswerNo} />
<p style="font-size: 50px;">{isHappy ? "😀" : "😥"}</p>
```

```svelte
<!-- AnswerButton.svelte -->
<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch("yes")}>是的</button>
<button on:click={() => dispatch("no")}>不是</button>
```

---

### 4.3 slot 插槽

**React**（`App.jsx` + `FunnyButton.jsx`）

```jsx
// App.jsx
import FunnyButton from "./FunnyButton.jsx";

export default function App() {
  return <FunnyButton>点我!</FunnyButton>;
}
```

```jsx
// FunnyButton.jsx
export default function FunnyButton({ children }) {
  return <button>{children}</button>;
}
```

> React 用特殊的 `children` prop 表示「标签之间的内容」。

**Vue 3**（`App.vue` + `FunnyButton.vue`）

```vue
<!-- App.vue -->
<script setup>
import FunnyButton from "./FunnyButton.vue";
</script>

<template>
  <FunnyButton>点我!</FunnyButton>
</template>
```

```vue
<!-- FunnyButton.vue -->
<template>
  <button><slot /></button>
</template>
```

**Vue 2**（`App.vue` + `FunnyButton.vue`）

```vue
<!-- App.vue -->
<script>
import FunnyButton from "./FunnyButton.vue";

export default {
  components: { FunnyButton },
};
</script>

<template>
  <FunnyButton>点我!</FunnyButton>
</template>
```

```vue
<!-- FunnyButton.vue -->
<template>
  <button><slot /></button>
</template>
```

**Svelte 5**（`App.svelte` + `FunnyButton.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import FunnyButton from "./FunnyButton.svelte";
</script>

<FunnyButton>点我!</FunnyButton>
```

```svelte
<!-- FunnyButton.svelte -->
<script>
  let { children } = $props();
</script>

<button>{@render children()}</button>
```

> **Svelte 5 用 Snippet 取代 `<slot />`**：默认内容即为名为 `children` 的 snippet，用 `{@render children()}` 渲染。

**Svelte 4**（`App.svelte` + `FunnyButton.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import FunnyButton from "./FunnyButton.svelte";
</script>

<FunnyButton>点我!</FunnyButton>
```

```svelte
<!-- FunnyButton.svelte -->
<button><slot /></button>
```

---

### 4.4 slot 插槽默认内容

**React**（`App.jsx` + `FunnyButton.jsx`）

```jsx
// App.jsx
import FunnyButton from "./FunnyButton.jsx";

export default function App() {
  return (
    <>
      <FunnyButton />
      <FunnyButton>这是传到 slot 的内容!</FunnyButton>
    </>
  );
}
```

```jsx
// FunnyButton.jsx
export default function FunnyButton({ children }) {
  return <button>{children || "默认内容"}</button>;
}
```

**Vue 3**（`App.vue` + `FunnyButton.vue`）

```vue
<!-- App.vue -->
<script setup>
import FunnyButton from "./FunnyButton.vue";
</script>

<template>
  <FunnyButton />
  <FunnyButton>这是传到 slot 的内容!</FunnyButton>
</template>
```

```vue
<!-- FunnyButton.vue -->
<template>
  <button>
    <slot>默认内容</slot>
  </button>
</template>
```

**Vue 2**（`App.vue` + `FunnyButton.vue`）

```vue
<!-- App.vue -->
<script>
import FunnyButton from "./FunnyButton.vue";

export default {
  components: { FunnyButton },
};
</script>

<template>
  <FunnyButton />
  <FunnyButton>这是传到 slot 的内容!</FunnyButton>
</template>
```

```vue
<!-- FunnyButton.vue -->
<template>
  <button>
    <slot>默认内容</slot>
  </button>
</template>
```

**Svelte 5**（`App.svelte` + `FunnyButton.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import FunnyButton from "./FunnyButton.svelte";
</script>

<FunnyButton />
<FunnyButton>这是传到 slot 的内容!</FunnyButton>
```

```svelte
<!-- FunnyButton.svelte -->
<script>
  let { children } = $props();
</script>

<button>
  {#if children}
    {@render children()}
  {:else}
    默认内容
  {/if}
</button>
```

**Svelte 4**（`App.svelte` + `FunnyButton.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import FunnyButton from "./FunnyButton.svelte";
</script>

<FunnyButton />
<FunnyButton>这是传到 slot 的内容!</FunnyButton>
```

```svelte
<!-- FunnyButton.svelte -->
<button>
  <slot>默认内容</slot>
</button>
```

> **要点**：Vue / Svelte 4 的默认内容直接写在 `<slot>…</slot>` 内部；Svelte 5 需要显式判断 snippet 是否存在（`{#if children}`），否则 `{@render children()}` 会报错。

---

### 4.5 上下文

**React**（`App.jsx` + `UserContext.js` + `UserProfile.jsx`）

```jsx
// UserContext.js
import { createContext } from "react";

export const UserContext = createContext(null);
```

```jsx
// App.jsx
import { useState } from "react";
import UserProfile from "./UserProfile";
import { UserContext } from "./UserContext";

export default function App() {
  const [user, setUser] = useState({
    id: 1,
    username: "abcdefg",
    email: "abcdefg@example.com",
  });

  function updateUsername(newUsername) {
    setUser((userData) => ({ ...userData, username: newUsername }));
  }

  return (
    <>
      <h1>欢迎回来, {user.username}</h1>
      <UserContext.Provider value={{ ...user, updateUsername }}>
        <UserProfile />
      </UserContext.Provider>
    </>
  );
}
```

```jsx
// UserProfile.jsx
import { useContext } from "react";
import { UserContext } from "./UserContext";

export default function UserProfile() {
  const { username, email, updateUsername } = useContext(UserContext);

  return (
    <>
      <p>用户名: {username}</p>
      <p>邮箱: {email}</p>
      <button onClick={() => updateUsername("abcd1234")}>修改用户名</button>
    </>
  );
}
```

**Vue 3**（`App.vue` + `UserProfile.vue`）

```vue
<!-- App.vue -->
<script setup>
import { ref, provide } from "vue";
import UserProfile from "./UserProfile.vue";

const user = ref({
  id: 1,
  username: "abcdefg",
  email: "abcdefg@example.com",
});

provide("user", user);
</script>

<template>
  <h1>欢迎回来, {{ user.username }}</h1>
  <UserProfile />
</template>
```

```vue
<!-- UserProfile.vue -->
<script setup>
import { inject } from "vue";

const user = inject("user");
</script>

<template>
  <p>用户名: {{ user.username }}</p>
  <p>邮箱: {{ user.email }}</p>
  <button @click="user.username = 'abcd1234'">修改用户名</button>
</template>
```

**Vue 2**（`App.vue` + `UserProfile.vue`）

```vue
<!-- App.vue -->
<script>
import UserProfile from "./UserProfile.vue";

export default {
  components: { UserProfile },
  provide() {
    return {
      user: this.user,
    };
  },
  data() {
    return {
      user: {
        id: 1,
        username: "abcdefg",
        email: "abcdefg@example.com",
      },
    };
  },
};
</script>

<template>
  <h1>欢迎回来, {{ user.username }}</h1>
  <UserProfile />
</template>
```

```vue
<!-- UserProfile.vue -->
<script>
export default {
  inject: ["user"],
};
</script>

<template>
  <p>用户名: {{ user.username }}</p>
  <p>邮箱: {{ user.email }}</p>
</template>
```

> ⚠️ **Vue 2 的 `provide` 不是响应式的**：`provide` 只在初始化时求值一次，父组件后续修改不会同步给后代。要响应式需要 provide 一个**对象本身**（利用对象引用）或改用 Vuex / `Vue.observable`。Vue 3 的 `provide` 传 `ref` 则天然响应式。

**Svelte 5**（`App.svelte` + `createUserState.svelte.js` + `UserProfile.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import { setContext } from "svelte";
  import UserProfile from "./UserProfile.svelte";
  import createUserState from "./createUserState.svelte.js";

  const user = createUserState({
    id: 1,
    username: "abcdefg",
    email: "abcdefg@example.com",
  });

  setContext("user", user);
</script>

<h1>欢迎回来, {user.username}</h1>
<UserProfile />
```

```js
// createUserState.svelte.js
export default function createUserState(user) {
  let state = $state(user);

  return {
    get username() {
      return state.username;
    },
    get email() {
      return state.email;
    },
    updateUsername(newUsername) {
      state.username = newUsername;
    },
  };
}
```

```svelte
<!-- UserProfile.svelte -->
<script>
  import { getContext } from "svelte";

  const user = getContext("user");
</script>

<p>用户名: {user.username}</p>
<p>邮箱: {user.email}</p>
<button onclick={() => user.updateUsername("abcd1234")}>修改用户名</button>
```

**Svelte 4**（`App.svelte` + `createUserState.js` + `UserProfile.svelte`）

```svelte
<!-- App.svelte -->
<script>
  import { setContext } from "svelte";
  import UserProfile from "./UserProfile.svelte";
  import createUserState from "./createUserState.js";

  const user = createUserState({
    id: 1,
    username: "abcdefg",
    email: "abcdefg@example.com",
  });

  setContext("user", user);
</script>

<h1>欢迎回来, {$user.username}</h1>
<UserProfile />
```

```js
// createUserState.js —— 用 store 承载可变共享状态
import { writable } from "svelte/store";

export default function createUserState(user) {
  const { subscribe, update } = writable(user);

  return {
    subscribe,
    updateUsername(newUsername) {
      update((value) => ({ ...value, username: newUsername }));
    },
  };
}
```

```svelte
<!-- UserProfile.svelte -->
<script>
  import { getContext } from "svelte";

  const user = getContext("user");
</script>

<p>用户名: {$user.username}</p>
<p>邮箱: {$user.email}</p>
<button on:click={() => user.updateUsername("abcd1234")}>修改用户名</button>
```

> **要点**：`setContext` / `getContext` 必须在**组件初始化期间**（同步）调用；`key` 可以是任意值（习惯用字符串或 Symbol）。Svelte 5 中可变状态用 `$state` 封装即可；Svelte 4 则用 store + `$` 前缀自动订阅。

---

## 5. 表单输入

### 5.1 输入框

**React**（`InputHello.jsx`）

```jsx
import { useState } from "react";

export default function InputHello() {
  const [text, setText] = useState("你好世界");

  function handleChange(event) {
    setText(event.target.value);
  }

  return (
    <>
      <p>{text}</p>
      <input value={text} onChange={handleChange} />
    </>
  );
}
```

**Vue 3**（`InputHello.vue`）

```vue
<script setup>
import { ref } from "vue";

const text = ref("你好世界");
</script>

<template>
  <p>{{ text }}</p>
  <input v-model="text" />
</template>
```

**Vue 2**（`InputHello.vue`）

```vue
<script>
export default {
  data() {
    return {
      text: "你好世界",
    };
  },
};
</script>

<template>
  <p>{{ text }}</p>
  <input v-model="text" />
</template>
```

**Svelte 5**（`InputHello.svelte`）

```svelte
<script>
  let text = $state("你好世界");
</script>

<p>{text}</p>
<input bind:value={text} />
```

**Svelte 4**（`InputHello.svelte`）

```svelte
<script>
  let text = "你好世界";
</script>

<p>{text}</p>
<input bind:value={text} />
```

> **要点**：React 是**受控组件**，必须手动 `value` + `onChange` 双写；Vue 用 `v-model`（语法糖：`:value` + `@input`，可加 `.lazy` / `.trim` / `.number` 修饰符）；Svelte 用 `bind:value` 双向绑定。

---

### 5.2 复选框

**React**（`IsAvailable.jsx`）

```jsx
import { useState } from "react";

export default function IsAvailable() {
  const [isAvailable, setIsAvailable] = useState(false);

  function handleChange() {
    setIsAvailable(!isAvailable);
  }

  return (
    <>
      <input
        id="is-available"
        type="checkbox"
        checked={isAvailable}
        onChange={handleChange}
      />
      <label htmlFor="is-available">这是一个 checkbox</label>
    </>
  );
}
```

**Vue 3**（`IsAvailable.vue`）

```vue
<script setup>
import { ref } from "vue";

const isAvailable = ref(false);
</script>

<template>
  <input id="is-available" type="checkbox" v-model="isAvailable" />
  <label for="is-available">这是一个 checkbox</label>
</template>
```

**Vue 2**（`IsAvailable.vue`）

```vue
<script>
export default {
  data() {
    return {
      isAvailable: false,
    };
  },
};
</script>

<template>
  <input id="is-available" type="checkbox" v-model="isAvailable" />
  <label for="is-available">这是一个 checkbox</label>
</template>
```

**Svelte 5**（`IsAvailable.svelte`）

```svelte
<script>
  let isAvailable = $state(false);
</script>

<input id="is-available" type="checkbox" bind:checked={isAvailable} />
<label for="is-available">这是一个 checkbox</label>
```

**Svelte 4**（`IsAvailable.svelte`）

```svelte
<script>
  let isAvailable = false;
</script>

<input id="is-available" type="checkbox" bind:checked={isAvailable} />
<label for="is-available">这是一个 checkbox</label>
```

> **要点**：React 用 `checked` 而非 `value`，且 `label` 的关联属性是 **`htmlFor`**（DOM 里才是 `for`）；Vue / Svelte 写原生 `for`。Svelte 复选框用 `bind:checked`（不是 `bind:value`）。

---

### 5.3 单选框

**React**（`PickPill.jsx`）

```jsx
import { useState } from "react";

export default function PickPill() {
  const [picked, setPicked] = useState("red");

  function handleChange(event) {
    setPicked(event.target.value);
  }

  return (
    <>
      <div>你选择了: {picked}</div>

      <input
        id="blue-pill"
        checked={picked === "blue"}
        type="radio"
        value="blue"
        onChange={handleChange}
      />
      <label htmlFor="blue-pill">蓝色</label>

      <input
        id="red-pill"
        checked={picked === "red"}
        type="radio"
        value="red"
        onChange={handleChange}
      />
      <label htmlFor="red-pill">红色</label>
    </>
  );
}
```

**Vue 3**（`PickPill.vue`）

```vue
<script setup>
import { ref } from "vue";

const picked = ref("red");
</script>

<template>
  <div>你选择了: {{ picked }}</div>

  <input id="blue-pill" type="radio" value="blue" v-model="picked" />
  <label for="blue-pill">蓝色</label>

  <input id="red-pill" type="radio" value="red" v-model="picked" />
  <label for="red-pill">红色</label>
</template>
```

**Vue 2**（`PickPill.vue`）

```vue
<script>
export default {
  data() {
    return {
      picked: "red",
    };
  },
};
</script>

<template>
  <div>你选择了: {{ picked }}</div>

  <input id="blue-pill" type="radio" value="blue" v-model="picked" />
  <label for="blue-pill">蓝色</label>

  <input id="red-pill" type="radio" value="red" v-model="picked" />
  <label for="red-pill">红色</label>
</template>
```

**Svelte 5**（`PickPill.svelte`）

```svelte
<script>
  let picked = $state("red");
</script>

<div>你选择了: {picked}</div>

<input id="blue-pill" bind:group={picked} type="radio" value="blue" />
<label for="blue-pill">蓝色</label>

<input id="red-pill" bind:group={picked} type="radio" value="red" />
<label for="red-pill">红色</label>
```

**Svelte 4**（`PickPill.svelte`）

```svelte
<script>
  let picked = "red";
</script>

<div>你选择了: {picked}</div>

<input id="blue-pill" bind:group={picked} type="radio" value="blue" />
<label for="blue-pill">蓝色</label>

<input id="red-pill" bind:group={picked} type="radio" value="red" />
<label for="red-pill">红色</label>
```

> **要点**：单选框在 React 里要**手写 `checked={picked === "blue"}`**；Vue 的 `v-model` 会自动按 `value` 判断选中；Svelte 用 **`bind:group`**（同一组共享同一变量）。

---

### 5.4 选择器

**React**（`ColorSelect.jsx`）

```jsx
import { useState } from "react";

const colors = [
  { id: 1, text: "红" },
  { id: 2, text: "蓝" },
  { id: 3, text: "绿" },
  { id: 4, text: "灰", isDisabled: true },
];

export default function ColorSelect() {
  const [selectedColorId, setSelectedColorId] = useState(2);

  function handleChange(event) {
    setSelectedColorId(event.target.value);
  }

  return (
    <select value={selectedColorId} onChange={handleChange}>
      {colors.map((color) => (
        <option key={color.id} value={color.id} disabled={color.isDisabled}>
          {color.text}
        </option>
      ))}
    </select>
  );
}
```

**Vue 3**（`ColorSelect.vue`）

```vue
<script setup>
import { ref } from "vue";

const selectedColorId = ref(2);

const colors = [
  { id: 1, text: "红" },
  { id: 2, text: "蓝" },
  { id: 3, text: "绿" },
  { id: 4, text: "灰", isDisabled: true },
];
</script>

<template>
  <select v-model="selectedColorId">
    <option
      v-for="color in colors"
      :key="color.id"
      :value="color.id"
      :disabled="color.isDisabled"
    >
      {{ color.text }}
    </option>
  </select>
</template>
```

**Vue 2**（`ColorSelect.vue`）

```vue
<script>
export default {
  data() {
    return {
      selectedColorId: 2,
      colors: [
        { id: 1, text: "红" },
        { id: 2, text: "蓝" },
        { id: 3, text: "绿" },
        { id: 4, text: "灰", isDisabled: true },
      ],
    };
  },
};
</script>

<template>
  <select v-model="selectedColorId">
    <option
      v-for="color in colors"
      :key="color.id"
      :value="color.id"
      :disabled="color.isDisabled"
    >
      {{ color.text }}
    </option>
  </select>
</template>
```

**Svelte 5**（`ColorSelect.svelte`）

```svelte
<script>
  let selectedColorId = $state(2);

  const colors = [
    { id: 1, text: "红" },
    { id: 2, text: "蓝" },
    { id: 3, text: "绿" },
    { id: 4, text: "灰", isDisabled: true },
  ];
</script>

<select bind:value={selectedColorId}>
  {#each colors as color (color.id)}
    <option value={color.id} disabled={color.isDisabled}>
      {color.text}
    </option>
  {/each}
</select>
```

**Svelte 4**（`ColorSelect.svelte`）

```svelte
<script>
  let selectedColorId = 2;

  const colors = [
    { id: 1, text: "红" },
    { id: 2, text: "蓝" },
    { id: 3, text: "绿" },
    { id: 4, text: "灰", isDisabled: true },
  ];
</script>

<select bind:value={selectedColorId}>
  {#each colors as color}
    <option value={color.id} disabled={color.isDisabled}>
      {color.text}
    </option>
  {/each}
</select>
```

> **要点**：Vue 的 `:value="color.id"` 会保留数字类型；Svelte 的 `bind:value` 也保留类型；React 的 `event.target.value` **永远是字符串**，需要 `Number(event.target.value)` 手动转换。

---

## 6. Web 应用特性

### 6.1 渲染应用

**React**（`index.html` + `main.jsx` + `App.jsx`）

```html
<!-- index.html -->
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.jsx"></script>
  </body>
</html>
```

```jsx
// main.jsx
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const root = createRoot(document.getElementById("app"));
root.render(<App />);
```

```jsx
// App.jsx
export default function App() {
  return <h1>你好，世界</h1>;
}
```

**Vue 3**（`index.html` + `main.js` + `App.vue`）

```html
<!-- index.html -->
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js
// main.js
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

```vue
<!-- App.vue -->
<template>
  <h1>你好，世界</h1>
</template>
```

**Vue 2**（`index.html` + `main.js` + `App.vue`）

```html
<!-- index.html -->
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js
// main.js
import Vue from "vue";
import App from "./App.vue";

new Vue({
  render: (h) => h(App),
}).$mount("#app");
```

```vue
<!-- App.vue -->
<template>
  <h1>你好，世界</h1>
</template>
```

**Svelte 5**（`index.html` + `app.js` + `App.svelte`）

```html
<!-- index.html -->
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>
```

```js
// app.js
import { mount } from "svelte";
import App from "./App.svelte";

const app = mount(App, {
  target: document.getElementById("app"),
});

export default app;
```

```svelte
<!-- App.svelte -->
<h1>你好，世界</h1>
```

**Svelte 4**（`index.html` + `app.js` + `App.svelte`）

```html
<!-- index.html -->
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>
```

```js
// app.js
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
```

```svelte
<!-- App.svelte -->
<h1>你好，世界</h1>
```

> **要点（Svelte 5 的破坏性变更）**：入口从 `new App({ target })`（**类实例化**）改为 `mount(App, { target })`（**函数式调用**），需从 `"svelte"` 导入 `mount`。

---

### 6.2 fetch 获取数据

**React**（`App.jsx` + `useFetchUsers.js`）

```jsx
// App.jsx
import useFetchUsers from "./useFetchUsers";

export default function App() {
  const { isLoading, error, data: users } = useFetchUsers();

  return (
    <>
      {isLoading ? (
        <p>正在获取用户信息……</p>
      ) : error ? (
        <p>获取用户信息出错</p>
      ) : (
        users && (
          <ul>
            {users.map((user) => (
              <li key={user.login.uuid}>
                <img src={user.picture.thumbnail} alt="user" />
                <p>
                  {user.name.first} {user.name.last}
                </p>
              </li>
            ))}
          </ul>
        )
      )}
    </>
  );
}
```

```js
// useFetchUsers.js
import { useEffect, useState } from "react";

export default function useFetchUsers() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://randomuser.me/api/?results=20")
      .then((res) => res.json())
      .then((data) => setData(data.results))
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { isLoading, error, data };
}
```

**Vue 3**（`App.vue` + `useFetchUsers.js`）

```vue
<!-- App.vue -->
<script setup>
import useFetchUsers from "./useFetchUsers";

const { isLoading, error, users } = useFetchUsers();
</script>

<template>
  <p v-if="isLoading">正在获取用户信息……</p>
  <p v-else-if="error">获取用户信息出错</p>
  <ul v-else-if="users">
    <li v-for="user in users" :key="user.login.uuid">
      <img :src="user.picture.thumbnail" alt="user" />
      <p>{{ user.name.first }} {{ user.name.last }}</p>
    </li>
  </ul>
</template>
```

```js
// useFetchUsers.js
import { ref } from "vue";

export default function useFetchUsers() {
  const isLoading = ref(true);
  const error = ref(null);
  const users = ref(null);

  fetch("https://randomuser.me/api/?results=20")
    .then((res) => res.json())
    .then((data) => (users.value = data.results))
    .catch((err) => (error.value = err))
    .finally(() => (isLoading.value = false));

  return { isLoading, error, users };
}
```

**Vue 2**（`App.vue`）

```vue
<script>
export default {
  data() {
    return {
      isLoading: true,
      error: null,
      users: null,
    };
  },
  mounted() {
    fetch("https://randomuser.me/api/?results=20")
      .then((res) => res.json())
      .then((data) => (this.users = data.results))
      .catch((err) => (this.error = err))
      .finally(() => (this.isLoading = false));
  },
};
</script>

<template>
  <p v-if="isLoading">正在获取用户信息……</p>
  <p v-else-if="error">获取用户信息出错</p>
  <ul v-else-if="users">
    <li v-for="user in users" :key="user.login.uuid">
      <img :src="user.picture.thumbnail" alt="user" />
      <p>{{ user.name.first }} {{ user.name.last }}</p>
    </li>
  </ul>
</template>
```

**Svelte 5**（`App.svelte` + `useFetchUsers.svelte.js`）

```svelte
<!-- App.svelte -->
<script>
  import useFetchUsers from "./useFetchUsers.svelte.js";

  const response = useFetchUsers();
</script>

{#if response.isLoading}
  <p>正在获取用户信息……</p>
{:else if response.error}
  <p>获取用户信息出错</p>
{:else if response.users}
  <ul>
    {#each response.users as user (user.login.uuid)}
      <li>
        <img src={user.picture.thumbnail} alt="user" />
        <p>
          {user.name.first}
          {user.name.last}
        </p>
      </li>
    {/each}
  </ul>
{/if}
```

```js
// useFetchUsers.svelte.js
export default function useFetchUsers() {
  let isLoading = $state(true);
  let error = $state(null);
  let users = $state(null);

  fetch("https://randomuser.me/api/?results=20")
    .then((res) => res.json())
    .then((data) => (users = data.results))
    .catch((err) => (error = err))
    .finally(() => (isLoading = false));

  return {
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get users() {
      return users;
    },
  };
}
```

> `.svelte.js` / `.svelte.ts` 文件中使用 rune 的模块，导出对象需用 **getter** 保持响应式引用。

**Svelte 4**（`App.svelte` + `useFetchUsers.js`）

```svelte
<!-- App.svelte -->
<script>
  import useFetchUsers from "./useFetchUsers.js";

  const { isLoading, error, users } = useFetchUsers();
</script>

{#if $isLoading}
  <p>正在获取用户信息……</p>
{:else if $error}
  <p>获取用户信息出错</p>
{:else if $users}
  <ul>
    {#each $users as user}
      <li>
        <img src={user.picture.thumbnail} alt="user" />
        <p>
          {user.name.first}
          {user.name.last}
        </p>
      </li>
    {/each}
  </ul>
{/if}
```

```js
// useFetchUsers.js
import { writable } from "svelte/store";

export default function useFetchUsers() {
  const isLoading = writable(true);
  const error = writable(null);
  const users = writable(null);

  fetch("https://randomuser.me/api/?results=20")
    .then((res) => res.json())
    .then((data) => users.set(data.results))
    .catch((err) => error.set(err))
    .finally(() => isLoading.set(false));

  return { isLoading, error, users };
}
```

> **要点**：React 用**自定义 Hook**（`useEffect` + `useState`）；Vue 3 用**组合式函数**（`ref`，在 `setup` 顶层调用）；Vue 2 通常直接写在 `mounted` 里或做 mixin；Svelte 5 用 `.svelte.js` 模块 + `$state`（返回 getter 对象）；Svelte 4 用 **store**（`writable`）并在模板里以 `$store` 自动订阅。

---

## 附录 A：常用语法对照速查

| 语法点               | React                          | Vue 3                                | Vue 2                                | Svelte 5                 | Svelte 4                      |
| -------------------- | ------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------ | ----------------------------- |
| 文本插值             | `{expr}`                       | `{{ expr }}`                         | `{{ expr }}`                         | `{expr}`                 | `{expr}`                      |
| 属性绑定             | `prop={val}`                   | `:prop="val"`                        | `:prop="val"`                        | `prop={val}`             | `prop={val}`                  |
| 布尔属性             | `disabled` / `disabled={true}` | `disabled`                           | `disabled`                           | `disabled`               | `disabled`                    |
| 事件绑定             | `onClick`                      | `@click`                             | `@click`                             | `onclick`                | `on:click`                    |
| 事件修饰符           | 手动 `e.stopPropagation()`     | `@click.stop`                        | `@click.stop`                        | `onclick={e => …}`       | `on:click\|stopPropagation`   |
| 键盘事件             | `onKeyDown` + 手动判断         | `@keydown.enter`                     | `@keydown.enter`                     | `onkeydown` + 手动判断   | `on:keydown` + 手动判断       |
| class 写法           | `className="a"`                | `class="a"` / `:class`               | `class="a"` / `:class`               | `class="a"` / `class:a`  | `class="a"` / `class:a`       |
| 行内样式             | `style={{ color: "red" }}`     | `:style="{ color: 'red' }"`          | `:style="{ color: 'red' }"`          | `style="color: red"`     | `style="color: red"`          |
| 双向绑定             | 手动 `value` + `onChange`      | `v-model`                            | `v-model`                            | `bind:value`             | `bind:value`                  |
| 表单修饰符           | 手动 `trim()` / `Number()`     | `v-model.trim` / `.number` / `.lazy` | `v-model.trim` / `.number` / `.lazy` | 手动处理                 | 手动处理                      |
| 组件 ref             | `useRef`                       | `useTemplateRef` / `ref`             | `this.$refs`                         | `bind:this`              | `bind:this`                   |
| 条件块               | `cond && <X />`                | `v-if`                               | `v-if`                               | `{#if}`                  | `{#if}`                       |
| 条件显示（保留 DOM） | `style={{ display }}`          | `v-show`                             | `v-show`                             | `class:hidden`           | `class:hidden`                |
| 列表块               | `.map()`                       | `v-for`                              | `v-for`                              | `{#each}`                | `{#each}`                     |
| 列表 key             | `key={id}`                     | `:key="id"`                          | `:key="id"`                          | `{#each list as x (id)}` | `{#each list as x (x.id)}`    |
| 原始 HTML            | `dangerouslySetInnerHTML`      | `v-html`                             | `v-html`                             | `{@html}`                | `{@html}`                     |
| 模板注释             | `{/* 注释 */}`                 | `<!-- 注释 -->`                      | `<!-- 注释 -->`                      | `<!-- 注释 -->`          | `<!-- 注释 -->`               |
| 多根节点             | `<>…</>`                       | 多根 `<template>`                    | 必须单根                             | 多个顶层标签             | 多个顶层标签                  |
| 动态组件             | 条件渲染 / 变量调用            | `<component :is>`                    | `<component :is>`                    | `{#if}` 切换组件         | `<svelte:component this={}>`  |
| 具名插槽             | 传入多个 props                 | `<slot name>` + `#name`              | `<slot name>` + `slot="name"`        | snippet props            | `<slot name>` + `slot="name"` |
| 作用域插槽           | 回调 props                     | `<slot :x>` + `#default="{ x }"`     | `<slot :x>` + `slot-scope`           | `{#snippet}` 参数        | `<slot x>` + `let:x`          |
| 传送门 / 挂载他处    | `createPortal`                 | `<Teleport>`                         | —                                    | 无内置                   | 无内置                        |
| 过渡动画             | 第三方库（framer-motion）/ CSS | `<Transition>`                       | `<transition>`                       | `transition:` 指令       | `transition:` 指令            |
| 异步块               | `Suspense` / 手动              | `<Suspense>`（实验）                 | —                                    | `{#await}`               | `{#await}`                    |
| 逻辑复用             | 自定义 Hook                    | 组合式函数                           | mixin                                | 函数 + rune              | 函数 + store                  |
| 全局状态             | Context / Redux                | Pinia                                | Vuex                                 | `.svelte.js` + `$state`  | store                         |
| 组件文件后缀         | `.jsx` / `.tsx`                | `.vue`                               | `.vue`                               | `.svelte`                | `.svelte`                     |

---

## 附录 B：响应式模型差异

理解五个框架的**心智模型差异**，比记 API 更重要：

| 框架         | 模型                                | 触发更新方式                                               | 颗粒度                                      |
| ------------ | ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| **React**    | 不可变 + 快照                       | `setState` 触发**整函数组件重新执行**，再 diff Virtual DOM | 组件级（靠 `memo` / `useMemo` 手动优化）    |
| **Vue 2**    | 数据劫持（`Object.defineProperty`） | 修改 `data` 属性 → 依赖收集的 watcher 更新                 | 组件级（watch→render）                      |
| **Vue 3**    | 代理（`Proxy`）                     | 修改 `ref().value` / `reactive` 属性 → 触发副作用          | 组件级，配合编译优化（静态提升、patchFlag） |
| **Svelte 4** | **编译期插桩**（`$:` 声明）         | 直接赋值 → 编译器插入的 `$$invalidate` 标记脏位            | 语句 / 变量级                               |
| **Svelte 5** | **运行时信号（Runes / Signals）**   | 直接赋值 → `$state` 代理通知订阅者                         | **细粒度**（可精确到单个文本节点）          |

**几个容易踩的坑**

1. **React**：`useState` 的更新是**异步批处理**的，连续 `setCount(count + 1)` 只会 +1；要基于旧值必须用函数式更新 `setCount(c => c + 1)`。状态是**不可变**的，数组 / 对象要创建新引用才会触发渲染。
2. **Vue 2**：`data` 里未声明的属性**不是响应式的**；数组索引赋值 `arr[0] = x` 与 `obj.newKey = x` 也不会触发更新，需用 `Vue.set` / `$set`。Vue 3 用 `Proxy` 后这两个限制已消失。
3. **Vue 3**：解构 `reactive` 对象会**丢失响应性**，需用 `toRefs`；`ref` 在 `<script setup>` 里必须 `.value`，在 `<template>` 里自动解包。
4. **Svelte 4**：`$:` 是**编译期**的响应式声明，只能在组件顶层使用，不能放进函数体内；跨组件共享状态必须用 store。
5. **Svelte 5**：`$state` 是**深度代理**（对象 / 数组内部改动也能追踪），但**跨模块导出 `$state` 变量不允许直接重新赋值**（模块级状态需用 `.svelte.js` + getter 或 `$state.raw` 语义），这也是 4 → 5 迁移时最常见的坑。
