# Vue 开发规范

> 本规范综合官方文档（[Vue 3 中文文档](https://cn.vuejs.org/guide/introduction.html)、[Vue 2 风格指南](https://v2.cn.vuejs.org/v2/style-guide/)）、Vue 官方 AI Skills（vue / vue-best-practices / vue-router-best-practices）以及 antfu 应用开发约定编写，是一份**兼顾「开发指南」与「开发规范」**的团队手册。
>
> **文档定位**：既帮助**新手快速上手 Vue 开发**（照着骨架复制即可起步），也帮助**高级开发者查漏补缺、规避常见坑、写出更规范的代码**。全文同时覆盖 **Vue 2 / Vue 3** 与 **选项式 / 组合式** 两种 API 风格。
>
> 文中示例**默认以 Vue 3 + `<script setup lang="ts">` 为准**，凡涉及与 Vue 2 的差异均显式标注 `【Vue 2】` 或 `【Vue 3】`，并在「迁移清单」章节集中对比；标注 ⭐ 的章节为**高频易踩坑点**，建议优先掌握。

---

## 目录

- 0. 适用范围与版本选择
- 1. 工程化与项目脚手架（含 1.4 命名规范、1.5 目录结构、1.6 生态库）
- 2. 单文件组件（SFC）结构
- 3. 响应式系统（核心差异）
- 4. API 风格：选项式 vs 组合式（含对照表）⭐
- 5. Props 与 Emits（单向数据流）
- 6. 模板指令
- 7. 计算属性与侦听器
- 8. 组件通信模式
- 9. 插槽（Slots）
- 10. 组合式函数（Composable）
- 11. 自定义指令（Directives）
- 12. 内置组件
- 13. 路由（Vue Router 3 vs 4）
- 14. 状态管理（Vuex vs Pinia）
- 15. 插件（Plugins）
- 16. 样式规范
- 17. TypeScript 规范
- 18. 性能优化
- 19. 安全
- 20. 代码风格与命名（Vue 2 风格指南精选）
- 21. Vue 2 → Vue 3 迁移清单
- 22. 参考资料

> **如何使用本文档（按角色取用）**
> - **新手 · 快速上手路径**：按 `§0 选型 → §1.1/§1.5 脚手架与目录 → §2.1 代码组织骨架 → §4 选项式/组合式对照表 → §5/§6/§7 高频概念 → §13 路由 → §14 状态管理` 顺序通读；直接复制 §2.1 的骨架即可写出第一个规范组件。遇到差异以【Vue 3】示例为准。
> - **高级 · 查漏 / 提效 / 避坑**：直接查标注 ⭐ 的章节（`§4.3` 对照表、`§5.4` v-model 变更、`§6.1` v-if/v-for 优先级、`§13.2/§13.3` 路由坑）、`§18` 性能、`§19` 安全、`§20` 风格清单、`§21` 迁移清单；用 `【Vue 2】/【Vue 3】` 标记核对自己的版本盲点，`§1.6` 生态库用于技术选型。

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
- 状态优先 `shallowRef()` 而非 `ref()`（见 §3.4）；对象优先 `ref()` 而非 `reactive()`（见 §3.3）。
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

### 1.5 推荐目录结构

以 **Vue 3 + Vite + TypeScript + Pinia + Vue Router** 的 SPA 为例（参考 [Vue 官方文档](https://cn.vuejs.org/) 的组织建议：优先按「模块 / 功能」而非仅按「文件类型」划分）：

```
my-vue-app/
├── public/                     # 静态资源（直接拷贝，不进构建），如 favicon.ico
├── src/
│   ├── api/                    # 接口请求层（按模块分文件：user.ts、order.ts）
│   ├── assets/                 # 需构建处理的资源（图片、字体、全局样式）
│   ├── components/             # 公共 / 业务组件（SFC）
│   │   └── base/               # 基础组件（BaseButton 等，见 §1.4.6）
│   ├── composables/            # 组合式函数（useXxx.ts，见 §10）
│   ├── router/                 # 路由配置（index.ts + 路由守卫，见 §13）
│   ├── stores/                 # Pinia 状态仓库（useUserStore.ts，见 §14）
│   ├── styles/                 # 全局样式 / 变量 / mixin
│   ├── types/                  # 全局 TS 类型声明（*.d.ts、接口定义）
│   ├── utils/                  # 无状态纯工具函数（格式化、校验，见 §10.3）
│   ├── views/ 或 pages/        # 路由级页面组件（与路由表一一对应）
│   ├── layouts/                # 布局组件（含 <router-view>，如 DefaultLayout）
│   ├── plugins/                # 第三方插件注册（i18n、axios 实例等）
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 应用入口（创建 app、挂载 router/store/插件）
├── tests/                      # 单元测试 / e2e（也可放 src 内）
├── index.html                  # Vite 入口 HTML
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TS 配置
├── package.json
└── eslint.config.js            # 见 §1.3
```

**组织原则**（官方建议）：
- **优先按功能（feature）聚合**：把同一业务相关的组件、composable、api、store 放在同一目录下（如 `features/checkout/`），避免所有文件平铺在 `components/` 下难以维护。
- **公共与业务分离**：`components/` 放可复用公共组件；页面专属组件就近放在对应 `views/xxx/` 内。
- **`composables/` 与 `utils/` 严格区分**：有状态的用 composable（`use` 前缀），纯函数放 `utils/`（见 §10.3）。
- **`api/` 与 `stores/` 解耦**：store 调用 api 层，组件只依赖 store，不在组件中散落请求。

### 1.6 常用生态库

按开发链路分类，并标注 Vue 2 / Vue 3 兼容性：

**状态管理**
| 库 | 适用版本 | 说明 |
|----|---------|------|
| Pinia | Vue 3（兼容 Vue 2.7） | 官方推荐，无 mutations、TS 友好、组合式写法，见 §14 |
| Vuex | Vue 2（3.x）/ Vue 3（4.x） | 老项目存量；新项目用 Pinia |
| pinia-plugin-persistedstate | Vue 3 | 状态持久化到 localStorage |

**UI 组件库**
| 库 | 适用版本 | 特点 |
|----|---------|------|
| Element Plus | Vue 3 | 国内最常用，组件全 |
| Element UI | Vue 2 | Element Plus 的 Vue 2 版 |
| Ant Design Vue | Vue 3（4.x）/ Vue 2（1.x，已停更） | 企业中后台 |
| Naive UI | Vue 3 | TS 一等公民、主题灵活、按需加载 |
| Vuetify | Vue 3（3.x）/ Vue 2（2.x） | Material Design 风格 |
| Arco Design Vue | Vue 3 | 字节出品 |
| Vant | Vue 2 / Vue 3 | 移动端首选 |
| Quasar | Vue 3 / Vue 2 | 含构建、移动/桌面一体的全栈 UI 框架 |
| PrimeVue | Vue 3 | 丰富主题 |
| Radix Vue / Reka UI | Vue 3 | 无样式（headless）原语，配合 Tailwind 自建 |

**Hooks / 组合式函数库**
| 库 | 说明 |
|----|------|
| VueUse（`@vueuse/core`） | 最常用，数百个即用 composable（鼠标、网络、传感器、组件生命周期等） |
| VueUse Motion | 动画 composable |
| VueRequest / `useFetch` | 数据请求类（也可自写，见 §10） |

**构建 / 工程工具**
| 库 / 工具 | 说明 |
|-----------|------|
| Vite | 官方推荐构建工具，冷启快、HMR 好，见 §1.1 |
| Vue CLI | Vue 2 时代脚手架（已停止主版本更新），仅维护老项目 |
| Nuxt | 基于 Vue 3 的 SSR/SSG 全栈框架，见 §0 |
| `@vitejs/plugin-vue` | Vite 的 Vue SFC 插件（Vite 项目默认集成） |
| unplugin-auto-import / unplugin-vue-components | 自动按需导入 API 与组件，减少样板代码 |
| vite-plugin-vue-devtools | 集成 Vue DevTools |
| Vitest | 基于 Vite 的单元测试（官方推荐） |
| Webpack / Rspack | 非 Vite 的备选打包器（老项目 / 特殊需求） |

**其它常用**
- 路由：Vue Router（见 §13）
- 样式：Tailwind CSS / UnoCSS（原子化）、Sass（预处理）
- 国际化：Vue I18n
- 代码质量：ESLint + `eslint-plugin-vue`、Prettier、TypeScript

> **选型原则**：新项目默认 **Vite + Vue 3 + Pinia + Vue Router + VueUse +（按需）Element Plus / Naive UI**；移动端用 Vant；需 SSR/SEO 用 Nuxt。

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

### 2.1 `<script setup>` 代码组织顺序

组合式组件的 `<script setup>` 内代码**按统一从上到下的顺序组织**，使任何组件一眼可读、团队风格一致。约定顺序如下（箭头表示书写先后）：

```
imports（导入）
  ↓
defineOptions（组件选项：name、inheritAttrs 等）
  ↓
interface / type（局部类型声明）
  ↓
defineProps / defineEmits / defineSlots（组件契约）
  ↓
composables（useXxx 组合式函数）
  ↓
state（ref / reactive 变量定义）
  ↓
computed（计算属性）
  ↓
functions（事件处理、业务方法）
  ↓
watch / watchEffect（侦听器）
  ↓
lifecycle（onMounted、onUnmounted 等）
  ↓
defineExpose（暴露给父组件的 API，放最后，一眼看出对外接口）
```

**要点**：
- **先声明、后使用**：类型与契约（props/emits）在前，状态与逻辑在后，避免前向引用带来的阅读负担。
- **`defineExpose` 放最后**：它定义的是组件对外暴露的接口，集中放在文件末尾，阅读者无需翻找即可看到「这个组件对外提供什么」。
- **生命周期靠后**：生命周期回调通常依赖前面定义的状态 / 方法，放末尾保证依赖已就绪。

**推荐骨架（可直接复制）**：

```vue
<script setup lang="ts">
// 1. imports
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import UserCard from "./UserCard.vue";

// 2. defineOptions（需要显式组件名 / 选项时）
defineOptions({ name: "UserPanel" });

// 3. 局部类型
interface User { id: number; name: string }

// 4. 组件契约
const props = defineProps<{ id: string }>();
const emit = defineEmits<{ select: [id: string] }>();
defineSlots<{ default(props: { user: User }): unknown }>();

// 5. composables
const userStore = useUserStore();

// 6. state
const loading = ref(false);
const localName = ref("");

// 7. computed
const fullName = computed(() => `${props.id}-${localName.value}`);

// 8. functions
function onSelect() { emit("select", props.id); }

// 9. watch / watchEffect
watch(() => props.id, (id) => { loading.value = true; userStore.load(id); });

// 10. lifecycle
onMounted(() => { userStore.load(props.id); });

// 11. defineExpose（对外接口，放最后）
defineExpose({ refresh: () => userStore.load(props.id) });
</script>
```

> 对照 Options API：其顺序天然固定为 `props/emits → data → computed → watch → methods → 生命周期`，与组合式「先数据、后逻辑、再生命周期」一致，区别仅在于组合式用顶层变量、Options 用选项块。

**Vue 3 与 Vue 2 在 SFC 上的关键差异**

| 能力                        | Vue 2                         | Vue 3                                       |
| --------------------------- | ----------------------------- | ------------------------------------------- |
| `<script setup>`            | 不支持                        | **3.2+ 推荐**，编译时宏                     |
| 多根节点（Fragment）        | 不支持（必须单根）            | 支持，属性自动 fallthrough 到多根需显式绑定 |
| `<style>` 动态绑定 `v-bind` | 不支持                        | 3.2+ 支持（`v-bind(color)`）                |
| scoped 深度选择器           | `::v-deep` / `>>>` / `/deep/` | `:deep()` / `:slotted()` / `:global()`      |
| `inheritAttrs` 默认         | `true`                        | `true`，但多根时需手动 `v-bind="$attrs"`    |

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

> 注意：ref 嵌套在数组 / 对象 / 集合（如 `reactive([refA, refB])` 或 `ref([])` 内）时仍需 `.value`；模板中对顶层 ref 才自动解包。

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

### 3.5 响应式对象身份与只读

- **不要用 `===` 比较响应式对象**：`reactive()` 返回的是 Proxy，与原对象身份不同；嵌套对象每次访问可能返回新的 Proxy 包装。比较应使用唯一标识（如 `id`），必要时用 `toRaw()` 两侧取原值再比。
  ```ts
  // ❌ 永远 false
  reactive(orig) === orig;
  // ✅ 用 id
  items.find((i) => i.id === targetId);
  // ✅ 确需比对象：toRaw 两侧
  toRaw(a) === toRaw(b);
  ```
- 用 `readonly()` 包装后提供只读视图，任何写入会被告警拦截；跨组件提供数据时优先 `readonly(providedRef)`（见 §8.2）。

### 3.6 响应式批处理与 nextTick

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

## 4. API 风格：选项式（Options）vs 组合式（Composition）

### 4.1 两种风格怎么选

- **组合式 API（Composition API）**：Vue 3 **推荐**写法，配合 `<script setup>`；逻辑按「功能」聚合，类型推导好，复用靠组合式函数。Vue 2.7 也支持 `setup()`（但无 `<script setup>`）。
- **选项式 API（Options API）**：Vue 2 **默认**写法；**Vue 3 同样完整支持**（适合习惯延续 / 渐进迁移 / 教学）。逻辑按「选项类型」（`data` / `methods` / `computed` / `watch`）聚合。
- 二者可在 Vue 3 组件内**共存**：同一组件可同时写 `<script>`（选项式）与 `<script setup>`（组合式），生命周期按注册顺序执行。
- 团队应**选定一种并统一**，避免在同一组件里混用两种心智模型。

### 4.2 版本 × API 支持矩阵

| 能力                         | Vue 2            | Vue 3        |
| ---------------------------- | ---------------- | ------------ |
| Options API                  | ✅ 默认          | ✅ 支持      |
| Composition API（`setup()`） | ✅ 2.7+ 向后移植 | ✅ 支持      |
| `<script setup>` 编译宏      | ❌               | ✅ 3.2+ 推荐 |

### 4.3 选项式 ↔ 组合式 对照表（快速翻译）⭐

日常从 Options 切换到 Composition（或反之）时直接查此表：

| Options API                          | Composition API（`<script setup>`）                  |
| ------------------------------------ | ---------------------------------------------------- |
| `data() { return { x: 1 } }`         | `const x = ref(1)` 或 `const s = reactive({ x: 1 })` |
| `computed: { double() {…} }`         | `const double = computed(() => …)`                   |
| `methods: { fn() {…} }`              | 顶层 `function fn() {…}`                             |
| `watch: { x() {…} }` / `this.$watch` | `watch(x, …)` / `watchEffect(…)`                     |
| `props: {…}`                         | `defineProps<{…}>()`                                 |
| `emits: […]`                         | `defineEmits<{…}>()`                                 |
| `created()`                          | `setup()` 顶层同步代码                               |
| `mounted()`                          | `onMounted()`                                        |
| `updated()`                          | `onUpdated()`                                        |
| `beforeUnmount()`                    | `onBeforeUnmount()`                                  |
| `this.$emit(...)`                    | `emit(...)`                                          |
| `this.$refs` / `this.$el`            | `const el = ref(null)`（模板引用）                   |
| `this.$attrs`                        | `useAttrs()`                                         |
| `this.$slots`                        | `useSlots()`                                         |
| `mixins: […]`                        | 组合式函数（`useXxx()`）                             |

> **核心差异**：选项式通过 `this.xxx` 互相访问；组合式**没有 `this`**，所有状态都是顶层变量，直接引用即可。

### 4.4 Vue 3 组合式标准模板（推荐）

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

### 4.5 选项式模板（Vue 2 与 Vue 3 通用）

选项式写法在两个大版本间**基本一致**，差异只在少数全局 API / 响应式细节（见 §21）。

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

- **【Vue 2.7+】** 可在选项对象内加 `setup()` 选项，混用组合式 API（无 `<script setup>` 宏）。
- **【Vue 3】** 若需显式声明组件名 / 选项，可额外加一个 `<script>` 块，或改用 §4.6 的宏。

### 4.6 `<script setup>` 编译宏（Vue 3.3+）

除 `defineProps` / `defineEmits` / `defineModel`（见 §5）外，常用宏：

| 宏                                      | 作用                                                    |
| --------------------------------------- | ------------------------------------------------------- |
| `defineExpose({ ... })`                 | 显式暴露属性给父组件 `ref`（组件默认「封闭」）          |
| `defineOptions({ name, inheritAttrs })` | 在 `<script setup>` 内声明组件选项，无需额外 `<script>` |
| `defineSlots<{ ... }>()`                | 为作用域插槽 props 提供类型（见 §9.2）                  |
| `generic="T"`                           | 泛型组件（SFC 上 `lang="ts" generic="T"`）              |

```vue
<script setup lang="ts" generic="T">
defineOptions({ name: "DataList" });
const props = defineProps<{ items: T[]; selected: T }>();
defineExpose({ reset });
defineSlots<{ default(props: { item: T; index: number }): any }>();
</script>
```

### 4.7 生命周期

- 组合式生命周期（`onMounted` / `onUpdated` / `onUnmounted` / `onActivated` / `onDeactivated` / `onServerPrefetch` 等）**必须在 setup 期间同步注册**：在 `setTimeout`、`.then()`、或 `await` 之后注册会**永不执行**（Vue 无法关联组件实例）。
  ```ts
  // ❌ 异步后注册，永远不会触发
  async setup() { await fetch(); onMounted(() => {}) }
  // ✅ 同步注册，异步逻辑放进回调内部
  onMounted(async () => { await fetch() })
  ```
- **`onUpdated` / `updated` 里禁止做重活**：它每次重渲染后都执行，放 API 调用 / 状态修改会造成性能瓶颈甚至无限循环；派生数据用 `computed`，特定变化用 `watch`，只在其中做 DOM 同步类轻量操作。
  ```ts
  // ❌ 在 onUpdated 里改状态 → 无限循环
  onUpdated(() => {
    renderCount.value++;
  });
  // ✅ 用 computed / watch
  const sum = computed(() => nums.value.reduce((a, b) => a + b, 0));
  ```
- 同步注册规则同样适用于组合式函数：调用 `useXxx()` 必须同步发生在 setup 内。

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
2. `provide / inject`（深层祖先通信，见 §8）；
3. Pinia（跨组件 / 兄弟通信，见 §15）；
4. 事件总线（如 `mitt`，谨慎使用，难追溯）。

> 注意：绑定在 DOM 元素上的原生事件（如 `@click`）**仍然会冒泡**；只有 `emit` 的组件事件不冒泡。

### 5.3 事件命名（kebab-case 监听）

- 在 JS 中用 camelCase `emit('updateValue')`，在模板中用 kebab-case `@update-value` 监听——**Vue 3 模板内会自动转换**（`@update-value` 匹配 `emit('updateValue')`）。
- 该自动转换**仅在模板内生效**；渲染函数须用 `onUpdateValue`，编程式监听须用精确事件名。
- v-model 的更新事件用冒号而非 kebab：`update:modelValue`（不是 `update-model-value`）。

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

### 5.5 布尔 prop 的类型顺序

当 prop 同时接受 `Boolean` 与 `String` 时，**`Boolean` 必须排在 `String` 前面**，否则 `<Comp disabled />` 会被解析为空字符串 `""` 而非 `true`。

```ts
// ❌ String 在前，禁用了布尔转换：<Comp disabled /> → ""
defineProps({ disabled: [String, Boolean] });
// ✅ Boolean 在前：<Comp disabled /> → true
defineProps({ disabled: [Boolean, String] });
// ✅ 若确为纯布尔，直接用 Boolean 最清晰
defineProps({ disabled: Boolean });
```

> 注：`String` 是唯一放在 `Boolean` 前会关闭布尔转换的类型。

### 5.6 运行时校验与默认值

- 需要运行时类型校验 / 自定义 `validator` 时，使用运行时声明（`type` / `required` / `default` / `validator`）；复杂类型用 `PropType<T>`。
- **数组 / 对象默认值必须用工厂函数**：`default: () => []`，否则所有实例共享同一引用。
- Vue 3.5+ 可用响应式 props 解构默认值；更早版本用 `withDefaults()`（类型声明）或运行时 `default`。

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

### 6.4 事件修饰符

- `.once`：事件只触发一次（自动移除监听），适合一次性初始化 / 首次交互埋点 / 懒加载触发。
  ```html
  <button @click.once="trackFirst">点击一次</button>
  ```
- `.exact`：仅当精确匹配按键组合时才触发，避免误触。
  ```html
  <button @click.ctrl.exact="onClick">仅 Ctrl+点击</button>
  ```
- 鼠标按键修饰符 `.left` / `.middle` / `.right`：针对非标准输入设备 / 左撇子场景。
- **禁止 `.passive` 与 `.prevent` 同时使用**：`.passive` 向浏览器承诺不调用 `preventDefault()`，二者冲突会导致 `.prevent` 被忽略并触发浏览器告警。
  ```html
  <!-- ❌ 冲突：.prevent 被忽略 -->
  <div @scroll.passive.prevent="onScroll">
    <!-- ✅ 仅性能（被动监听） -->
    <div @scroll.passive="onScroll">
      <!-- ✅ 需要阻止默认行为 -->
      <form @submit.prevent="onSubmit"></form>
    </div>
  </div>
  ```

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
- **非响应式值（如 `Date.now()`）不要放 computed**：它只追踪响应式依赖，结果只算一次永不更新；用 `ref` + `setInterval` 代替。

### 7.2 computed 与 methods 的取舍

| 场景                     | computed          | method          |
| ------------------------ | ----------------- | --------------- |
| 派生自响应式状态         | ✅ 缓存           | ❌ 每次渲染重算 |
| 昂贵计算                 | ✅ 仅依赖变才重算 | ❌ 浪费         |
| 需传参                   | ❌                | ✅              |
| 非响应式值（如当前时间） | ❌                | ✅              |
| 用户动作触发             | ❌                | ✅              |

```vue
<!-- ❌ 方法每次渲染都重算 -->
<p>{{ getFilteredItems() }}</p>
<!-- ✅ computed 仅依赖变才重算 -->
<p>{{ filteredItems }}</p>
```

### 7.3 watch vs watchEffect

| 特性                 | `watch`              | `watchEffect`   |
| -------------------- | -------------------- | --------------- |
| 依赖声明             | 显式指定             | 自动收集        |
| 默认立即执行         | 否（需 `immediate`） | 是              |
| 获取旧值             | 支持                 | 不支持          |
| 异步依赖（await 后） | 完全追踪             | 仅首个 await 前 |
| 多源                 | 数组语法             | 自动            |

- 回调逻辑用的状态与触发源一致 → `watchEffect`。
- 需要旧值 / 懒执行 / 异步后仍有依赖 → `watch`。

### 7.4 侦听器的刷新时机（flush）

- 默认 `flush: 'pre'`：回调在**组件 DOM 更新前**执行。若在回调里读 DOM，会读到旧值。
- 需要读取更新后的 DOM → `{ flush: 'post' }` 或 `watchPostEffect()`（如自动滚动到底部）。
- **慎用 `flush: 'sync'`**：关闭批量合并，每次 mutation 都同步触发，易引发性能问题。

```ts
watch(
  count,
  () => {
    console.log(document.querySelector(".c")?.textContent); // 旧值！
  },
  { flush: "post" },
); // ✅ 读到新值
```

### 7.5 避免深层侦听（deep watch）

`{ deep: true }` 会在每次变更时遍历对象全部嵌套属性，大数据结构下开销巨大。

- 改为侦听**具体属性 / 数组长度 / 计算值**；或用 `watchEffect`（只追踪实际使用到的依赖）。
- Vue 3.5+ 可用 `deep: 2` 限制遍历深度。
- 直接侦听 `reactive` 对象等于隐式深层侦听，同理需谨慎。

```ts
// ❌ 遍历整棵树
watch(state, cb, { deep: true });
// ✅ 只盯需要的
watch(() => state.selectedUserId, cb);
watch(() => state.users.length, cb);
```

### 7.6 watchEffect 的异步依赖

`watchEffect` 仅在**首个 `await` 之前**自动收集依赖；`await` 之后的响应式访问不再被追踪。需要完整追踪时改用 `watch` 显式声明源。Vue 3.5+ 可用 `onWatcherCleanup(() => controller.abort())` 在重跑 / 卸载时清理异步请求。

---

## 8. 组件通信模式速查

| 方式               | 适用        | Vue 2 / 3 差异                          |
| ------------------ | ----------- | --------------------------------------- |
| `props` + `emit`   | 父子        | v-model 命名变更（见 §5.4）             |
| `provide / inject` | 跨层祖先    | 推荐 `InjectionKey<>` 类型化（见 §8.2） |
| Pinia / Vuex       | 全局 / 兄弟 | Pinia 取代 Vuex（见 §15）               |
| 事件总线           | 解耦组件    | 谨慎，推荐 `mitt`                       |

### 8.1 provide / inject 用 Symbol 键避免冲突

```ts
// injection-keys.ts
import type { InjectionKey, Ref } from "vue";
export const UserKey: InjectionKey<Ref<{ name: string }>> = Symbol("user");

// 提供方
provide(UserKey, userRef);
// 消费方
const user = inject(UserKey, ref({ name: "" })); // 带默认值则类型非 undefined
```

### 8.2 避免 prop drilling

当 prop 要穿过多层（≥2 层）中间组件才到达深层子组件时，改用 `provide / inject`，避免中间组件被无关 prop 污染、重构困难。

- 1~2 层浅穿透用 props 即可；深层同组件树用 provide/inject；跨无关组件树用 Pinia。
- 提供方可用 `readonly(providedRef)` 防止后代误改；需要更新则额外提供一个方法。
- 提供计算值：`provide('count', computed(() => items.value.length))` 保持响应。

### 8.3 attrs 不是响应式的

`useAttrs()` 返回的对象**始终反映最新 fallthrough 属性，但不是响应式的**，不能用 `watch` 追踪其变化。

- 需要响应式的属性 → 声明为 `prop` 再 `watch`。
- 需要在变化后做副作用 → 用 `onUpdated()` 读取最新值。
- 模板 / 事件处理器中访问 `attrs` 总是最新值（无需响应式）。

```ts
const attrs = useAttrs();
// ❌ 永不触发
watch(
  () => attrs.class,
  () => {},
);
// ✅ 用 onUpdated 读取最新
onUpdated(() => {
  console.log(attrs.class);
});
```

---

## 9. 插槽（Slots）

### 9.1 v-slot 用法

- 具名插槽用 `#name`，默认插槽用 `#default`；`v-slot` 只能用于 `<template>` 或组件（Vue 3 已移除 Vue 2 在原生元素上用 `slot` 的写法）。
- 作用域插槽：子组件 `<slot :item="item" />`，父组件 `<template #default="{ item }">`。

### 9.2 作用域插槽的类型化（Vue 3.3+）

用 `defineSlots` 为插槽 props 提供类型，否则消费方的 slot props 是 `any`，拼写错误无法被 TS 捕获。

```vue
<script setup lang="ts">
interface Item {
  id: number;
  name: string;
}
defineProps<{ items: Item[] }>();
defineSlots<{
  default(props: { item: Item; index: number }): any;
  header(props: { count: number }): any;
  empty(): any;
}>();
</script>
```

### 9.3 插槽兜底内容

给可选插槽提供合理默认值，组件更健壮：`<slot>Submit</slot>`、`<slot name="header"><h3>标题</h3></slot>`。

### 9.4 注意命名冲突

插槽 prop 名若与父组件自身作用域变量同名会产生混淆，必要时把 slot prop 命名得更具体（如 `listItem` 而非 `item`）。

---

## 10. 组合式函数（Composable）规范（Vue 3）

### 10.1 命名与返回

- 文件名 / 函数名以 `use` 前缀：`useFetch`、`useMouse`。
- 返回**普通对象（含 ref）**，不要返回 `reactive` 对象（解构会丢响应式）。
- 返回同时包含状态与动作（`{ count, increment }`）。

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

### 10.2 避免隐藏副作用

组合式函数应封装有状态逻辑，**不要藏匿影响外部状态的副作用**（内部 `inject` 隐式依赖、偷偷改 Pinia 状态、直接操作 DOM）。

- 依赖显式传入（如 `useTheme(injectedTheme)`），让调用方知晓。
- 真正需要副作用时（如 `useMouse` 注册 `mousemove`），必须在 `onUnmounted` 清理，并在注释里说明。

### 10.3 与纯工具函数区分

**不要用 `use` 前缀包裹无状态的纯函数**（格式化、校验、数学运算）——它们应作为普通工具函数放在 `utils/` 目录直接导出。

- 用 Composable：管理响应式状态、用生命周期、设侦听器、需卸载清理。
- 用 Utility：纯数据转换、无状态计算、字符串 / 数组操作、`Date.now()` 类。

```
src/
  composables/   # useAuth.ts, useFetch.ts
  utils/        # formatters.ts, validators.ts, math.ts
```

### 10.4 接受响应式输入

组合式函数若接收「可能是 ref / getter / 普通值」的输入，用 `toValue()`（Vue 3.3+）归一化，提升灵活性：

```ts
import { watchEffect, toValue, type MaybeRefOrGetter } from "vue";
export function useFetch(url: MaybeRefOrGetter<string>) {
  watchEffect(async () => {
    const res = await fetch(toValue(url)); // 支持 字符串 / ref / () => ...
  });
}
```

---

## 11. 自定义指令（Directives）

### 11.1 命名约定（`<script setup>`）

局部指令变量以 `v` 前缀 + camelCase 命名，模板中自动识别为指令（去 `v` 前缀、转 kebab-case）。

```ts
// ✅ v 前缀 + camelCase
const vFocus = { mounted: (el: HTMLElement) => el.focus() };
const vClickOutside = {
  mounted(el, binding) {
    el._h = (e: Event) => {
      if (!el.contains(e.target as Node)) binding.value(e);
    };
    document.addEventListener("click", el._h);
  },
  unmounted(el) {
    document.removeEventListener("click", el._h);
  },
};
```

```html
<input v-focus />
<div v-click-outside="close">菜单</div>
```

> Options API / 全局注册时，键名不含 `v-`（`app.directive('focus', {...})`）。

### 11.2 必须清理副作用

指令在 `mounted` 中创建的定时器、事件监听、订阅，**务必在 `unmounted` 中清理**，否则元素移除后监听 / 定时器仍存活，造成内存泄漏。多资源建议用 `WeakMap` 关联 `el` 与清理句柄，避免污染元素属性。

### 11.3 仅用于真正需要 DOM 操作的场景

能用组件 / 模板解决的问题优先用组件；指令适合聚焦、点击外部关闭、权限指令等「封装底层 DOM 行为」的场景。避免把业务逻辑塞进指令。

---

## 12. 内置组件

### 12.1 Transition / TransitionGroup

- `<Transition>` 只能包**单个**元素 / 组件，多元素需 `<Transition mode="out-in">` + key。
- `<TransitionGroup>` 子元素**必须有 key**；Vue 3 移除了默认渲染外层 `span`（需自行指定 `tag` 或容器）。
- 列表动画优先动 `transform` / `opacity`（避免触发 layout）。`.list-move` 用于重排动画。

### 12.2 Teleport

把内容传送到 `body` 等指定节点，适合模态框 / 提示。注意：传送内容的**逻辑层级不变**（props / 事件仍沿组件树），但受父级 `transform` 影响定位。Vue 3.5+ 支持 `defer` 等待目标节点出现。

### 12.3 KeepAlive

- 配合 `<component :is>` 或 `<router-view>` 缓存组件实例。
- 缓存的组件需 `name` 才能被 `include / exclude` 命中；用 `max` 限制缓存数量防止无限增长。
- 用 `onActivated` / `onDeactivated` 替代部分生命周期逻辑。

### 12.4 Suspense

用于异步组件 / `async setup`，**仍为实验性 API**，生产使用需评估稳定性。等待 `async setup()`、`<script setup>` 顶层 `await`、`defineAsyncComponent` 三类异步依赖。

### 12.5 v-once 与 v-memo（性能）

- `v-once`：内容真正静态时渲染一次后永不更新。
- `v-memo="[dep]"`，仅当依赖数组变化才重渲染该子树；`v-memo="[]"` 等价于 `v-once`。常用于大型列表中跳过无关项的重渲染。
  ```html
  <li v-for="item in list" :key="item.id" v-memo="[item.id === selectedId]">
    …
  </li>
  ```
- 注意：被 memo 的内容若自身还需响应其它状态，不要用 `v-memo`。

---

## 13. 路由（Vue Router 3 vs 4）

### 13.1 创建与注册

```ts
// Vue Router 4（Vue 3）
import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({ history: createWebHistory(), routes });

// Vue Router 3（Vue 2）
import VueRouter from "vue-router";
const router = new VueRouter({ mode: "history", routes });
```

### 13.2 导航守卫弃用 next() ⭐

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

### 13.3 路由参数变化不触发生命周期 ⭐

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

### 13.4 重定向死循环

守卫中务必**排除目标路由本身**，否则无限重定向（Vue Router 会告警但不会无限循环崩溃）：

```ts
router.beforeEach((to) => {
  if (!isAuth() && to.name !== "Login") return { name: "Login" };
});
```

### 13.5 beforeRouteEnter 无组件实例

该守卫在组件创建前执行，`this` 为 `undefined`。Options API 用 `next(vm => ...)`；组合式 API 用 `onMounted` + `onBeforeRouteUpdate` 替代。

---

## 14. 状态管理（Vuex vs Pinia）

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

## 15. 插件（Plugins）

- 插件优先用 `app.provide()` 暴露能力，而非 `app.config.globalProperties`：后者在 `<script setup>` 中**无法访问**，且需额外的类型增强（`declare module 'vue' { interface ComponentCustomProperties }`）才可被 TS 识别。
  ```ts
  // ✅ 组合式 API 友好、可类型化、可 mock
  const key: InjectionKey<I18n> = Symbol('i18n')
  export default { install(app: App, opts: I18nOptions) {
    app.provide(key, { translate: /* ... */ })
  }}
  // 组件内：const i18n = inject(key)
  ```
- 若需同时兼容 Options API，可两者都提供（`app.provide(key, x)` + `app.config.globalProperties.$x = x`）。

---

## 16. 样式规范

- 组件样式默认 `scoped`，避免全局污染。
- 深度选择器见 §2（Vue 2 `::v-deep` / Vue 3 `:deep()`）。
- 覆盖子组件根元素样式：Vue 3 下 scoped 可直接命中子根（因默认 `:deep` 放宽），如需精确控制用 `:deep()`。
- 动态主题：Vue 3 支持 `<style>` 内 `v-bind()` 绑定响应式值。
- 内联样式绑定属性名用 **camelCase**（` :style="{ backgroundColor: x }"`）。
- Teleport 传送出的内容不受源组件 `scoped` 样式影响（逻辑层级不变但 DOM 不在其内）。

---

## 17. TypeScript 规范

### 17.1 defineProps 用类型声明（推荐）

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

### 17.2 defineEmits 类型声明

```ts
const emit = defineEmits<{
  update: [value: string];
  close: [];
}>();
```

### 17.3 模板引用与组件实例类型

```ts
const el = ref<HTMLInputElement | null>(null);
const child = ref<InstanceType<typeof ChildComp> | null>(null);
```

- 通过 `defineExpose` 暴露的成员，父组件 `ref` 类型需与之对应声明。
- 作用域插槽类型见 §9.2（`defineSlots`）。

---

## 18. 性能优化

- **大型列表（>50~100 项）必须虚拟化**：`vue-virtual-scroller` 或 `@tanstack/vue-virtual`，容器需固定高度。
- 大数据 / 第三方实例用 `shallowRef` / `markRaw`（见 §3.4）。
- 昂贵的静态 / 低频更新子树用 `v-once` / `v-memo`（见 §12.5）。
- 向子组件传递**稳定引用**（避免父重渲染时生成新对象 / 新函数导致子无谓更新）。
- computed 返回对象 / 数组时注意引用稳定性（缓存），避免触发下游 effect。
- 能用 SSR / SSG 提升首屏的用 Nuxt。
- 避免深层 `watch` 与在 `onUpdated` 里做重活（见 §5.6 / §7.5）。

---

## 19. 安全

- `v-html` 仅用于可信内容，用户内容必须经 `DOMPurify` 等净化（见 §6.3）。
- 不要在前端硬编码密钥；接口鉴权走后端。
- `provide / inject` 注入的回调需校验，避免被任意消费方误用。
- 组件事件不冒泡，敏感操作不要依赖 DOM 事件冒泡做全局监听（见 §5.2）。

---

## 20. 代码风格与命名（Vue 2 风格指南精选）

按优先级（来自 [Vue 2 风格指南](https://v2.cn.vuejs.org/v2/style-guide/)）：

- **A 级（必要）**：多单词组件名；`data` 必须是个函数；`prop` 定义尽量详细（类型 / 默认值）；`v-for` 必须带 `:key`；禁止同元素 `v-if` + `v-for`；组件名大小写一致（PascalCase 或 kebab-case，自闭合用 PascalCase）。
- **B 级（强烈推荐）**：单文件组件；组件名完整单词而非缩写；`this` 上暴露的内容命名清晰；组件目录按特性组织；避免 `this.$parent`；单组件原则（功能单一）；见 §1.4 全套命名规范。
- **C 级（推荐）**：组件文件 / 基础组件（ui- 前缀）命名规范；紧密耦合组件用父级目录就近放置；自闭合组件；模板中简单表达式，复杂逻辑放 computed / methods；属性 / 事件名风格一致（attribute 用 kebab-case）。
- **D 级（谨慎使用）**：`v-if` 与 `v-for` 同元素（已禁用）、`scoped` 中的元素选择器（性能差）、`this.$refs` 在模板中、`watch` 中深度监听大量数据。

---

## 21. Vue 2 → Vue 3 迁移清单（破坏性变更速查）

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

## 22. 参考资料

- Vue 3 官方指南：https://cn.vuejs.org/guide/introduction.html
- Vue 2 风格指南：https://v2.cn.vuejs.org/v2/style-guide/
- Vue 3 迁移指南：https://v3-migration.vuejs.org/
- Vue Router：https://router.vuejs.org/
- Pinia：https://pinia.vuejs.org/
- Vue 官方 AI Skills（vue / vue-best-practices / vue-router-best-practices）：https://github.com/vuejs-ai/skills
- antfu 应用开发约定（Vue 组合式 / Vite / UnoCSS / VueUse）
