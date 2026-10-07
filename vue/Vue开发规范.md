# Vue 开发规范

> 本规范综合官方文档（[Vue 3 中文文档](https://cn.vuejs.org/guide/introduction.html)、[Vue 2 风格指南](https://v2.cn.vuejs.org/v2/style-guide/)）、Vue 官方 AI Skills（vue / vue-best-practices / vue-router-best-practices）以及 antfu 应用开发约定编写。
>
> 文中所有示例**默认以 Vue 3 + `<script setup lang="ts">` 为准**，凡涉及与 Vue 2 的差异均显式标注 `【Vue 2】` 或 `【Vue 3】`，并在「迁移清单」章节集中对比。

---

## 0. 适用范围与版本选择

| 场景                                     | 推荐                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| 新项目                                   | **Vue 3**（最新稳定版，3.5+），搭配 Vite + `<script setup>` + TypeScript |
| 维护老项目 / 依赖仅支持 Vue 2 的第三方库 | Vue 2.7（最后一个 2.x 版本，含 Composition API 向后移植）                |
| 需要 SSR/SSG、SEO、文件路由、API 路由    | Nuxt（基于 Vue 3）                                                       |
| 纯客户端 SPA / 组件库 Playground         | Vite + Vue 3                                                             |

**核心结论**：新代码一律按 Vue 3 组合式 API 编写；Vue 2 仅用于存量维护，且应避免新增 Options API 之外的复杂模式。

---

## 1. 工程化与项目脚手架

### 1.1 创建项目

- **Vue 3**：`npm create vue@latest`（官方脚手架）或 `pnpm create vite`（选 `vue-ts` 模板）。
- **Vue 2 维护**：`vue create`（需 Vue CLI，已停止主版本更新）。

### 1.2 语言与类型

- 优先 TypeScript，组件统一 `<script setup lang="ts">`。
- 状态优先 `shallowRef()` 而非 `ref()`（见 §5.4）；对象优先 `ref()` 而非 `reactive()`（见 §5.3）。
- 样式优先 UnoCSS / Tailwind；通用工具函数优先 VueUse（`@vueuse/core`）。

### 1.3 代码检查（ESLint）

- 必须启用 `eslint-plugin-vue`，继承 `plugin:vue/vue3-recommended`（Vue 2 用 `plugin:vue/recommended`）。
- 关键强制规则：
  - `vue/no-use-v-if-with-v-for`（禁止 v-if 与 v-for 同元素）
  - `vue/multi-word-component-names`（组件名多单词）
  - `vue/require-default-prop`（非 required prop 需默认值）
  - `vue/no-mutating-props`（禁止直接修改 prop）

### 1.4 文件命名与组件命名

本节综合 [Vue 2 风格指南 · 单文件组件文件名的大小写](https://v2.cn.vuejs.org/v2/style-guide/#单文件组件文件名的大小写) 及各命名相关条目。其中的「模板 / DOM 模板」差异源于 Vue 2 时代 HTML 大小写不敏感；Vue 3 项目若全部使用 SFC / 字符串模板，可统一 PascalCase，但仍建议保持团队一致。

#### 1.4.1 单文件组件文件名大小写（优先级 B：强烈推荐）

- 文件名**要么始终是 PascalCase，要么始终是 kebab-case**，两者皆可，但**同一项目内必须保持一致**。
  - `MyComponent.vue` 或 `my-component.vue`
  - ❌ 反例：`mycomponent.vue`、`myComponent.vue`（混用 / 不规范）
- **PascalCase**：对编辑器自动补全最友好，使 JS/JSX 与模板中引用组件方式一致。
- **kebab-case**：完全可取，且能规避 Windows 等大小写不敏感文件系统下的潜在冲突。

#### 1.4.2 组件名必须为多单词（优先级 A：必要）

- 组件名应始终是**多个单词**（根组件 `App`、以及 `<transition>` / `<component>` 等 Vue 内置组件除外），避免与现有 / 未来的 HTML 单单词元素冲突。
- 例：`TodoItem`（`UserProfileCard`）。

#### 1.4.3 不同场景下的组件名大小写（优先级 B）

| 场景                       | 推荐命名                             | 说明                                                        |
| -------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| 单文件组件文件名           | PascalCase 或 kebab-case（保持一致） | 见 §1.4.1                                                   |
| 模板中（SFC / 字符串模板） | **PascalCase**                       | 易与 HTML 原生元素区分，支持自动补全                        |
| 模板中（DOM 模板）         | **kebab-case**                       | HTML 大小写不敏感，必须如此；或全局统一 kebab-case          |
| JS / JSX 中                | **PascalCase**                       | 类 / 构造函数约定；仅极简全局注册场景可用 kebab-case 字符串 |

#### 1.4.4 自闭合组件（优先级 B）

- 在 **SFC、字符串模板、JSX** 中，没有内容的组件应当**自闭合**：`<MyComponent />`。
- 在 **DOM 模板**中**永远不要自闭合**（HTML 不支持自闭合自定义元素）：`<my-component></my-component>`。

#### 1.4.5 完整单词而非缩写（优先级 B）

- 组件名倾向完整单词而非缩写（编辑器补全降低了长命名成本，且更明确）。
- 例：`StudentDashboardSettings.vue` 优于 `SdSettings.vue`。

#### 1.4.6 组件名前缀约定（优先级 B）

> Vue 2 风格指南对「基础 / 单例 / 紧密耦合」三类组件规定了前缀，便于在编辑器字母排序时归类、体现组件关系。Vue 3 项目同样建议沿用。

- **基础组件名**：展示类、无逻辑 / 无状态、只含 HTML 元素或其它基础组件（绝不含全局状态）的组件，统一以特定前缀开头（`Base` / `App` / `V` / `Ui`）。
  - 例：`BaseButton.vue`、`BaseTable.vue`、`BaseIcon.vue`、`UiCard.vue`
- **单例组件名**：每个页面只使用一次、且**永不接受任何 prop** 的组件，以 `The` 前缀命名。
  - 例：`TheHeading.vue`、`TheSidebar.vue`
  - 一旦需要加 prop，说明它其实是可复用组件，应去掉 `The`。
- **紧密耦合的组件名**：仅在某父组件场景下有意义的子组件，以**父组件名作为前缀**命名（不要靠多级嵌套目录解决）。
  - 例：`TodoList.vue` + `TodoListItem.vue` + `TodoListItemButton.vue`；`SearchSidebar.vue` + `SearchSidebarNavigation.vue`

#### 1.4.7 组件名中的单词顺序（优先级 B）

- 以**高级别（通用）的单词开头，以描述性修饰词结尾**，便于按字母排序时关系一目了然。
- 例：`SearchButtonClear.vue`、`SearchInputQuery.vue`、`SettingsCheckboxTerms.vue`。

#### 1.4.8 组合式函数 / 其它文件

- 组合式函数文件：`use` 前缀（`useFetch.ts`、`useMouse.ts`），见 §9。
- 路由 / store：`kebab-case` 或 `camelCase`，与项目一致即可，但同一项目内统一。

---

## 2. 单文件组件（SFC）结构

推荐顺序（`<script setup>` → `<template>` → `<style>`），但团队约定优先：

```vue
<script setup lang="ts">
// 依赖导入
import { ref, computed } from "vue";
// 组件导入
import UserCard from "./UserCard.vue";

// 逻辑：props / emits / 状态 / 计算属性 / 侦听 / 生命周期
const props = defineProps<{ id: string }>();
const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<template>
  <div class="wrapper">{{ doubled }}</div>
</template>

<style scoped>
.wrapper {
  padding: 8px;
}
</style>
```

**Vue 3 与 Vue 2 在 SFC 上的关键差异**

| 能力                        | Vue 2                         | Vue 3                                       |
| --------------------------- | ----------------------------- | ------------------------------------------- |
| `<script setup>`            | 不支持                        | **3.2+ 推荐**，编译时宏                     |
| 多根节点（Fragment）        | 不支持（必须单根）            | 支持，属性自动 fallthrough 到多根需显式绑定 |
| `<style>` 动态绑定 `v-bind` | 不支持                        | 3.2+ 支持（`v-bind(color)`）                |
| scoped 深度选择器           | `::v-deep` / `>>>` / `/deep/` | `:deep()` / `:slotted()` / `:global()`      |
| `inheritAttrs` 默认         | `true`                        | `true`，但多根时需手动 `v-bind="$attrs"`    |

```vue
<!-- Vue 3 深度选择器 -->
<style scoped>
.a :deep(.b) {
  color: red;
}
</style>

<!-- Vue 2 深度选择器（任选其一，推荐 ::v-deep） -->
<style scoped>
.a ::v-deep .b {
  color: red;
}
</style>
```

---

## 3. 响应式系统（核心差异）

### 3.1 实现原理

- **【Vue 2】** 基于 `Object.defineProperty` 劫持已存在的属性。
  - **无法检测**对象新增 / 删除属性（需用 `Vue.set` / `this.$set`）。
  - **无法检测**数组通过索引赋值（`arr[0] = x`）与修改 `length`。
- **【Vue 3】** 基于 `Proxy` 代理整个对象，上述限制全部消失，可检测新增 / 删除属性、数组索引与 `length`。

```js
// Vue 2 必须这样新增属性才响应式
this.$set(this.obj, "newKey", value);
// Vue 3 直接赋值即可
state.obj.newKey = value;
```

### 3.2 ref 与 .value（仅 Vue 3 组合式 API）

`ref()` 把值包成对象，脚本中访问 / 赋值**必须加 `.value`**；模板中 Vue 自动解包，**不要写 `.value`**。

```ts
import { ref } from "vue";
const count = ref(0);
count.value++; // ✅ 正确
console.log(count.value);

// ❌ 错误：直接 ++ 会丢失响应式
// count++           // 把 ref 对象当数字用
// count = 5         // 重新赋值变量，丢失响应式
```

### 3.3 优先 ref 而非 reactive

`reactive()` 仅接受对象、不可整体重新赋值、解构即丢失响应式。统一用 `ref()` 更一致、心智负担更小。

| 行为         | reactive   | ref                    |
| ------------ | ---------- | ---------------------- |
| 基本类型     | 不支持     | 支持                   |
| 整体重新赋值 | 丢失响应式 | `x.value = {...}` 保持 |
| 解构         | 丢失响应式 | 用 `.value` 无需解构   |

```ts
// 可接受：分组相关的表单状态用 reactive
const form = reactive({ name: "", email: "" });
// 若需解构，务必 toRefs
const { name, email } = toRefs(form);
```

### 3.4 大型对象 / 外部实例用 shallowRef 与 markRaw

`ref()` 对对象做深层响应式（深层 Proxy），大数据 / 第三方实例会带来性能开销。

```ts
import { shallowRef, markRaw, triggerRef } from "vue";

const users = shallowRef(await fetchUsers()); // 仅追踪 .value 替换
users.value = await fetchUsers(); // 替换触发更新

// 若就地修改后想触发：
users.value.push(x);
triggerRef(users);

const map = markRaw(new ThirdPartyMap()); // 永不响应式
```

### 3.5 响应式批处理与 nextTick

同一事件循环 tick 内的多次同步修改会被**批量合并**，侦听器 / 计算属性只看到最终值。

```ts
const count = ref(0);
watch(count, (v) => console.log(v));
count.value = 1;
count.value = 2;
count.value = 3;
// 仅输出一次：3

// 需要 DOM 更新后再操作：
import { nextTick } from "vue";
await nextTick();
// 仅在确需每次变更用 watch(..., { flush: 'sync' })，但慎用（性能差）
```

---

## 4. API 风格：Options vs Composition

### 4.1 选择

- **【Vue 3】新代码**：一律 Composition API + `<script setup>`。
- **【Vue 2】**：Options API（`data / methods / computed / watch`）。2.7 可用 `setup()` 但无 `<script setup>`。
- 二者可在 Vue 3 共存：`<script>`（Options）里仍可调用组合式函数。

### 4.2 Vue 3 Composition 标准模板

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps<{ title: string; count?: number }>();
const emit = defineEmits<{ update: [value: string] }>();
const model = defineModel<string>();

const doubled = computed(() => (props.count ?? 0) * 2);
watch(
  () => props.title,
  (v) => console.log("title:", v),
);
onMounted(() => console.log("mounted"));
</script>
```

### 4.3 Vue 2 Options 模板（维护参考）

```vue
<script>
export default {
  props: { title: String, count: Number },
  emits: ["update"],
  data() {
    return { local: 0 };
  },
  computed: {
    doubled() {
      return (this.count ?? 0) * 2;
    },
  },
  watch: {
    title(v) {
      console.log("title:", v);
    },
  },
  mounted() {
    console.log("mounted");
  },
  methods: {
    onChange() {
      this.$emit("update", "x");
    },
  },
};
</script>
```

### 4.4 用组合式函数替代 Mixin

Vue 3 不推荐使用 mixin（命名冲突、来源不清）。封装为 `use*` 组合式函数。

---

## 5. Props 与 Emits（单向数据流）

### 5.1 Props 只读，绝不修改

子组件修改 prop 会破坏单向数据流，Vue 会告警；对象 / 数组 prop 的**深层修改无告警但同样危险**。

```vue
<!-- ❌ 错误：修改 prop -->
<script setup lang="ts">
const props = defineProps<{ user: { name: string } }>();
props.user.name = "x"; // 破坏数据流
</script>

<!-- ✅ 正确：通过 emit 请求父组件修改 -->
<script setup lang="ts">
const props = defineProps<{ user: { name: string } }>();
const emit = defineEmits<{ "update:user": [user: { name: string }] }>();
function rename(n: string) {
  emit("update:user", { ...props.user, name: n });
}
</script>

<!-- ✅ 正确：需要本地可编辑副本时深拷贝 -->
const local = ref({ ...props.user }) watch(() => props.user, u => { local.value
= { ...u } }, { deep: true })
```

### 5.2 组件事件不冒泡（与 DOM 事件不同）

`emit()` 的事件**只到直接父组件**，不会像原生 DOM 事件那样向上冒泡。深层通信请使用：

1. 逐层 re-emit（1~2 层简单场景）；
2. `provide / inject`（深层祖先通信，见 §7）；
3. Pinia（跨组件 / 兄弟通信）；
4. 事件总线（如 `mitt`，谨慎使用，难追溯）。

> 注意：绑定在 DOM 元素上的原生事件（如 `@click`）**仍然会冒泡**；只有 `emit` 的组件事件不冒泡。

### 5.3 事件命名

- 模板中监听用 **kebab-case**（`@update:user`），`defineEmits` 中声明可用 camelCase 或 kebab-case，二者等价。
- 复杂 payload 在开发期做校验。

### 5.4 v-model 重大变更（Vue 2 → Vue 3）⭐

这是迁移期最易踩坑的点，旧写法在 Vue 3 会**静默失效**。

| 特性           | Vue 2                    | Vue 3               |
| -------------- | ------------------------ | ------------------- |
| 默认 prop      | `value`                  | `modelValue`        |
| 默认事件       | `input`                  | `update:modelValue` |
| 自定义名       | `model: { prop, event }` | `v-model:xxx`       |
| `.sync` 修饰符 | `v-bind:title.sync`      | `v-model:title`     |
| 多个 v-model   | 不支持                   | 支持                |

```vue
<!-- Vue 3 推荐：defineModel 自动处理 prop + emit -->
<script setup lang="ts">
const model = defineModel<string>();
</script>
<template><input v-model="model" /></template>

<!-- Vue 3 手动写法 -->
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [v: string] }>();
</script>
<template>
  <input
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>

<!-- 多个 v-model（Vue 3 新特性） -->
<UserForm v-model:first="a" v-model:last="b" />
```

---

## 6. 模板指令

### 6.1 禁止 v-if 与 v-for 同元素（优先级变更）⭐

- **Vue 2**：`v-for` 优先级高于 `v-if`。
- **Vue 3**：`v-if` 优先级高于 `v-for`，导致 `v-if` 中的循环变量未定义而报错。

```html
<!-- ❌ 两种版本都有歧义/报错风险 -->
<li v-for="u in users" v-if="u.active" :key="u.id">{{ u.name }}</li>

<!-- ✅ 用 computed 过滤 -->
<li v-for="u in activeUsers" :key="u.id">{{ u.name }}</li>

<!-- ✅ 或整体条件包 <template> -->
<template v-if="showList">
  <li v-for="u in users" :key="u.id">{{ u.name }}</li>
</template>
```

### 6.2 v-if 与 v-show 的选择

| 场景                          | 选择     | 原因                       |
| ----------------------------- | -------- | -------------------------- |
| 频繁切换（tab / 弹窗 / 下拉） | `v-show` | 仅切 CSS `display`，代价低 |
| 很少变化（鉴权 / 功能开关）   | `v-if`   | 真实销毁 / 重建，DOM 干净  |
| 初始可能为 false              | `v-if`   | 懒渲染，省初次成本         |
| 需保持组件内部状态            | `v-show` | 组件常驻不重置             |

### 6.3 v-html 安全

`v-html` 会原样插入 HTML，**绝不用于不可信 / 用户输入**，否则导致 XSS。改用文本插值 `{{ }}` 或经净化（如 `DOMPurify`）后再插入。

---

## 7. 计算属性与侦听器

### 7.1 computed 必须是纯函数

getter 中**禁止**修改其他响应式状态、发请求、操作 DOM、写 `localStorage`、设定时器。有副作用请用 `watch` 或生命周期。

```ts
// ❌ 副作用
const doubled = computed(() => {
  count.value++;
  return count.value * 2;
});

// ✅ 纯计算
const doubled = computed(() => count.value * 2);
```

- 计算属性返回**只读**，不要对其赋值（除非用 `get/set`）。
- 需要传参请改用 `computed` 返回函数（或方法），但会失去缓存。
- 排序 / 反转数组应**返回新数组**，不要原地修改原数据。

### 7.2 watch vs watchEffect

| 特性                 | `watch`              | `watchEffect`   |
| -------------------- | -------------------- | --------------- |
| 依赖声明             | 显式指定             | 自动收集        |
| 默认立即执行         | 否（需 `immediate`） | 是              |
| 获取旧值             | 支持                 | 不支持          |
| 异步依赖（await 后） | 完全追踪             | 仅首个 await 前 |
| 多源                 | 数组语法             | 自动            |

- 回调逻辑用的状态与触发源一致 → `watchEffect`。
- 需要旧值 / 懒执行 / 异步后仍有依赖 → `watch`。

### 7.3 watch 常见陷阱

- 需要旧值比较、需要 `immediate` 但逻辑复杂 → `watch`。
- 深层对象用 `{ deep: true }` 有性能开销，尽量用 getter 精确指定。
- 访问更新后的 DOM 用 `{ flush: 'post' }`（等价于 `watchPostEffect`）。

---

## 8. 组件通信模式速查

| 方式               | 适用        | Vue 2 / 3 差异                       |
| ------------------ | ----------- | ------------------------------------ |
| `props` + `emit`   | 父子        | v-model 命名变更（见 §5.4）          |
| `provide / inject` | 跨层祖先    | 推荐 `InjectionKey<>` 类型化（见下） |
| Pinia / Vuex       | 全局 / 兄弟 | Pinia 取代 Vuex（见 §12）            |
| 事件总线           | 解耦组件    | 谨慎，推荐 `mitt`                    |

**provide / inject 用 Symbol 键避免冲突（大型应用 / 组件库必用）：**

```ts
// injection-keys.ts
import type { InjectionKey, Ref } from "vue";
export const UserKey: InjectionKey<Ref<{ name: string }>> = Symbol("user");

// 提供方
provide(UserKey, userRef);
// 消费方
const user = inject(UserKey, ref({ name: "" })); // 带默认值则类型非 undefined
```

---

## 9. 组合式函数（Composable）规范（Vue 3）

- 文件名 / 函数名以 `use` 前缀：`useFetch`、`useMouse`。
- 返回**普通对象（含 ref）**，不要返回 `reactive` 对象（解构会丢响应式）。
- 返回同时包含状态与动作（`{ count, increment }`）。
- 有副作用（监听、定时器）须在 `onUnmounted` 清理。
- 隐藏副作用：不要在组合式函数里悄悄改外部状态。

```ts
export function useCounter(initial = 0) {
  const count = ref(initial);
  const double = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }
  return { count, double, increment }; // 普通对象 + ref
}
```

---

## 10. 内置组件

### 10.1 Transition / TransitionGroup

- `<Transition>` 只能包**单个**元素 / 组件，多元素需 `<Transition mode="out-in">` + key。
- `<TransitionGroup>` 子元素**必须有 key**；Vue 3 移除了默认渲染外层 `span`（需自行指定 `tag` 或容器）。
- 列表动画优先动 `transform` / `opacity`（避免触发 layout）。

### 10.2 Teleport

把内容传送到 `body` 等指定节点，适合模态框 / 提示。注意：传送内容的**逻辑层级不变**（props / 事件仍沿组件树），但受父级 `transform` 影响定位。

### 10.3 KeepAlive

- 配合 `<component :is>` 或 `<router-view>` 缓存组件实例。
- 缓存的组件需 `name` 才能被 `include / exclude` 命中。
- 用 `onActivated` / `onDeactivated` 替代部分生命周期逻辑。
- 注意缓存无限增长：必要时用 `max` 限制数量。

### 10.4 Suspense

用于异步组件 / `async setup`，**仍为实验性 API**，生产使用需评估稳定性。

---

## 11. 路由（Vue Router 3 vs 4）

### 11.1 创建与注册

```ts
// Vue Router 4（Vue 3）
import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({ history: createWebHistory(), routes });

// Vue Router 3（Vue 2）
import VueRouter from "vue-router";
const router = new VueRouter({ mode: "history", routes });
```

### 11.2 导航守卫弃用 next() ⭐

Vue Router 4 中守卫第三个参数 `next()` **已弃用**，改用返回值：

```ts
// ❌ 旧写法：易漏调用 / 多次调用导致卡死或死循环
router.beforeEach((to, from, next) => {
  if (!auth) next("/login"); // 漏掉 else 分支 → 导航挂起
});

// ✅ 新写法（返回式）
router.beforeEach((to, from) => {
  if (!auth && !to.meta.public)
    return { name: "Login", query: { redirect: to.fullPath } };
  // 返回 undefined / true = 放行；false = 取消；路由对象 = 重定向
});
```

### 11.3 路由参数变化不触发生命周期 ⭐

`/users/1` → `/users/2` 复用同一组件实例，`onMounted` / `created` **不再执行**，数据会陈旧。

```ts
// ✅ 用 watch（immediate 覆盖首屏与切换）
watch(
  () => route.params.id,
  async (id) => {
    user.value = await fetchUser(id);
  },
  { immediate: true },
);

// 或 ✅ onBeforeRouteUpdate 守卫
// 或 ✅ <router-view :key="route.fullPath" /> 强制重建（性能差，谨慎）
```

### 11.4 重定向死循环

守卫中务必**排除目标路由本身**，否则无限重定向（Vue Router 会告警但不会无限循环崩溃）：

```ts
router.beforeEach((to) => {
  if (!isAuth() && to.name !== "Login") return { name: "Login" };
});
```

### 11.5 beforeRouteEnter 无组件实例

该守卫在组件创建前执行，`this` 为 `undefined`。Options API 用 `next(vm => ...)`；组合式 API 用 `onMounted` + `onBeforeRouteUpdate` 替代。

---

## 12. 状态管理（Vuex vs Pinia）

- **新项目用 Pinia**（Vue 3 官方推荐，无 mutations、类型友好、支持组合式写法）。
- **存量 Vue 2 项目**可继续用 Vuex 3，但新模块建议 Pinia（Pinia 兼容 Vue 2）。

```ts
// Pinia store 示例（组合式写法）
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const isLogin = computed(() => !!user.value);
  function login(u: unknown) {
    user.value = u;
  }
  return { user, isLogin, login };
});
```

---

## 13. 样式规范

- 组件样式默认 `scoped`，避免全局污染。
- 深度选择器见 §2（Vue 2 `::v-deep` / Vue 3 `:deep()`）。
- 覆盖子组件根元素样式：Vue 3 下 scoped 可直接命中子根（因默认 `:deep` 放宽），如需精确控制用 `:deep()`。
- 动态主题：Vue 3 支持 `<style>` 内 `v-bind()` 绑定响应式值。
- 内联样式绑定属性名用 **camelCase**（` :style="{ backgroundColor: x }"`）。

---

## 14. TypeScript 规范

### 14.1 defineProps 用类型声明（推荐）

```ts
interface Props {
  msg?: string;
  items?: string[];
}
// Vue 3.4 及更早需 withDefaults；Vue 3.5+ 可直接解构默认值
const props = withDefaults(defineProps<Props>(), {
  msg: "hi",
  items: () => [], // 数组/对象默认值必须用工厂函数
});
```

- **切勿**同时混用运行时声明与类型声明。
- 3.5+ 支持响应式 props 解构：`const { msg = 'hi' } = defineProps<Props>()`。

### 14.2 defineEmits 类型声明

```ts
const emit = defineEmits<{
  update: [value: string];
  close: [];
}>();
```

### 14.3 模板引用与组件实例类型

```ts
const el = ref<HTMLInputElement | null>(null);
const child = ref<InstanceType<typeof ChildComp> | null>(null);
```

---

## 15. 性能优化

- **大型列表（>50~100 项）必须虚拟化**：`vue-virtual-scroller` 或 `@tanstack/vue-virtual`，容器需固定高度。
- 大数据 / 第三方实例用 `shallowRef` / `markRaw`（见 §3.4）。
- 静态内容用 `v-once`；昂贵子树用 `v-memo`。
- 向子组件传递**稳定引用**（避免父重渲染时生成新对象 / 新函数导致子无谓更新）。
- computed 返回对象 / 数组时注意引用稳定性（缓存），避免触发下游 effect。
- 能用 SSR / SSG 提升首屏的用 Nuxt。

---

## 16. 安全

- `v-html` 仅用于可信内容，用户内容必须经 `DOMPurify` 等净化（见 §6.3）。
- 不要在前端硬编码密钥；接口鉴权走后端。
- `provide / inject` 注入的回调需校验，避免被任意消费方误用。

---

## 17. 代码风格与命名（Vue 2 风格指南精选）

按优先级（来自 [Vue 2 风格指南](https://v2.cn.vuejs.org/v2/style-guide/)）：

- **A 级（必要）**：多单词组件名；`data` 必须是个函数；`prop` 定义尽量详细（类型 / 默认值）；`v-for` 必须带 `:key`；禁止同元素 `v-if` + `v-for`；组件名大小写一致（PascalCase 或 kebab-case，自闭合用 PascalCase）。
- **B 级（强烈推荐）**：单文件组件；组件名完整单词而非缩写；`this` 上暴露的内容命名清晰；组件目录按特性组织；避免 `this.$parent`；单组件原则（功能单一）。
- **C 级（推荐）**：组件文件 / 基础组件（ui- 前缀）命名规范；紧密耦合组件用父级目录就近放置；自闭合组件；模板中简单表达式，复杂逻辑放 computed / methods；属性 / 事件名风格一致（attribute 用 kebab-case）。
- **D 级（谨慎使用）**：`v-if` 与 `v-for` 同元素（已禁用）、`scoped` 中的元素选择器（性能差）、`this.$refs` 在模板中、`watch` 中深度监听大量数据。

---

## 18. Vue 2 → Vue 3 迁移清单（破坏性变更速查）

| 变更点                         | Vue 2                     | Vue 3                                  |
| ------------------------------ | ------------------------- | -------------------------------------- |
| v-model prop/event             | `value` / `input`         | `modelValue` / `update:modelValue`     |
| `.sync`                        | `v-bind.sync`             | `v-model:prop`                         |
| `v-if` / `v-for` 优先级        | `v-for` 高                | `v-if` 高                              |
| 自定义组件 `v-model` 多绑定    | 不支持                    | 支持                                   |
| 事件 `.native` 修饰符          | 支持                      | 移除（`$listeners` 并入 `$attrs`）     |
| `$listeners`                   | 存在                      | 移除，合并进 `$attrs`                  |
| 异步组件                       | `(resolve, reject) => {}` | `defineAsyncComponent(() => import())` |
| `Vue.filter`                   | 支持                      | **移除**，改用方法 / 计算属性          |
| 全局 API（`Vue.component` 等） | 全局静态                  | `app.component(...)` 应用实例          |
| 响应式新增属性                 | `Vue.set`                 | 直接赋值（Proxy）                      |
| Fragment 多根                  | 不支持                    | 支持                                   |
| 单文件组件                     | Options / 2.7 setup       | `<script setup>`                       |
| 插槽 `slot` / `slot-scope`     | 支持                      | 改用 `v-slot`（`#`）                   |
| `key` 在 `<template v-for>`    | 写在子元素                | 写在 `<template>` 上                   |

**迁移建议**：用官方 `vue/migration` 构建警告、`@vue/compat` 兼容构建包逐步切换；优先替换 v-model、事件 `.native`、filters、全局 API 与 `Vue.set` 用法。

---

## 19. 参考资料

- Vue 3 官方指南：https://cn.vuejs.org/guide/introduction.html
- Vue 2 风格指南：https://v2.cn.vuejs.org/v2/style-guide/
- Vue 3 迁移指南：https://v3-migration.vuejs.org/
- Vue Router：https://router.vuejs.org/
- Pinia：https://pinia.vuejs.org/
- Vue 官方 AI Skills（vue / vue-best-practices / vue-router-best-practices）：https://github.com/vuejs-ai/skills
- antfu 应用开发约定（Vue 组合式 / Vite / UnoCSS / VueUse）
