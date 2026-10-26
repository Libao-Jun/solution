# Vue 状态管理实战手册

> 参考资料：
>
> - [Pinia 官方中文文档](https://pinia.vuejs.org/zh/)
> - [Vuex 官方中文指南](https://vuex.vuejs.org/zh/guide/)
>
> 面向角色：从「刚学会组件通信」的初中级前端，到「要设计一套长期可维护数据层」的高级前端 / 前端负责人。本文把 **两套库的核心概念与概念映射、store 的选型、两种写法、逐项差异、不易发现的坑、工程规范** 放在一份文档里；新手可顺着 `一 → 二 → 三` 抄骨架起步，高级开发者可直接看 `四`（核心概念与异同）、`五`（坑点）、`六`（规范）。
>
> 文中示例默认 **Vue 3 + TypeScript + Pinia**；涉及 Vuex 4（配 Vue 3）与 Vuex 3（配 Vue 2）的差异会显式标注。标注 ⭐ 的小节是**高频踩坑点**，建议优先掌握。

---

## 目录

1. [状态管理解决什么问题](#一、状态管理解决什么问题)
2. [Pinia 快速上手](#二、pinia-快速上手)
3. [Vuex 4 的传统写法](#三、vuex-4-的传统写法)
4. [Vuex 与 Pinia 的核心概念与异同](#四、vuex-与-pinia-的核心概念与异同) ⭐
5. [不易发现的坑点](#五、不易发现的坑点) ⭐
6. [开发注意事项与工程规范](#六、开发注意事项与工程规范)
7. [常见问题速查](#七、常见问题速查)
8. [参考资料](#八、参考资料)

> **按角色取用**
>
> - **新手 · 起步路径**：`一（判断要不要 store）→ 二.1/二.2（建 store）→ 二.3（组件里读写）→ 五.1（解构丢响应性）→ 七（报错速查）`。跑通这五段就能写日常业务。
> - **高级 · 设计数据层**：先看 `四.1` 对照图 + `四.2` 速查表把概念对齐，再用 `四.3` 的五条差异定边界、`四.4` 定选型、`四.5` 迁移，最后过一遍 `五` 全部坑点与 `六` 的目录 / 类型 / 异步 / 持久化 / 性能规范。

---

## 一、状态管理解决什么问题

组件通信解决的是「谁把数据给谁」，状态管理解决的是「**同一份数据被多个不相关的地方同时读写，并需要可追踪的变更**」。二者不是替代关系：父子传 `props` 永远比塞进 store 更好。

### 1.1 该引入状态管理的信号

出现下面任意两条以上，就该考虑抽出 store，而不是继续 `provide/inject` 或事件总线：

| 信号 | 典型场景 |
| --- | --- |
| 跨层级、跨路由共享 | 登录用户信息、权限点、全局主题、多 Tab 共享的筛选条件 |
| 生命周期长于组件 | 切换路由再回来，状态要保留（草稿、分页、滚动位置） |
| 多个入口写同一份数据 | 顶部搜索框、列表页筛选、详情页面包屑改同一个 `keyword` |
| 需要审计 / 调试 | 要把「谁在什么时候改了它」看清楚，用 devtools 时间线回溯 |
| 需要被非组件代码访问 | 请求拦截器要读 token、路由守卫要读权限、埋点要读用户身份 |

反过来说，**只有一份数据、只在一个组件树里用** 的，永远优先 `ref` + `props` + `emit`。

### 1.2 不该放进 store 的状态

这是新手最容易犯的结构性错误：把所有东西都塞进 store，最后得到一个「上帝 store」——任何改动都可能影响任意页面，没人敢重构。

| 状态类型 | 正确归属 | 原因 |
| --- | --- | --- |
| 表单临时输入、弹窗开关、hover 态 | 组件本地 `ref` | 生命周期与组件一致，进 store 反而要手动清理 |
| 派生数据（总价、过滤后的列表、是否全选） | `computed` / getter | 存两份必然不同步，是最大的 bug 来源 |
| 可被 URL 还原的状态（分页、排序、Tab、搜索词） | 路由 `query` / `params` | 刷新、分享、前进后退都天然可用；进 store 刷新就丢 |
| 服务端数据的缓存与请求状态 | 数据请求库（TanStack Query / SWR / VueUse 的 `useFetch`） | store 只适合「客户端自有状态」，把服务端缓存塞进来要自己实现失效、去重、重试 |
| 一次性传递的对象（弹窗要显示的详情） | `props` / `provide` | 生命周期短，进 store 就得考虑「什么时候清空」 |

一句可执行的口径：**store 只放「客户端自有的、跨组件共享的、需要长期存在的」状态**；其余一律回归组件、路由或请求层。

---

## 二、Pinia 快速上手

本章只给最小可用骨架（先跑起来），**两套概念的全景对照见 4.1（图）与 4.2（速查表）**。

### 2.1 安装与挂载

```bash
pnpm add pinia
```

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia()) // 必须在任何 useStore() 之前完成
app.mount('#app')
```

要点：

- `app.use(createPinia())` 之后，`useXxxStore()` 才有「当前实例」可用；早于这一步调用会抛 `getActivePinia()" was called but there was no active Pinia`。
- **SSR 时必须每个请求 `createPinia()`**，不能把 pinia 放到模块级变量里复用，否则不同用户的状态会串（见 5.10）。
- 单元测试里手动激活：`setActivePinia(createPinia())`（见 6.5）。

### 2.2 选项式与组合式两种写法

Pinia 支持两种风格，同一个项目里**按文件粒度统一**即可，不要在一份 store 里混着写。

**选项式（接近 Vuex 心智，迁移成本低）**

```ts
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    history: [] as number[],
  }),
  getters: {
    double: (state) => state.count * 2,
    // 需要用到其它 getter 时不要写箭头函数，否则 this 丢失
    doubleLabel(): string {
      return `当前双倍值：${this.double}`
    },
  },
  actions: {
    increment(step = 1) {
      this.count += step
      this.history.push(this.count)
    },
  },
})
```

**组合式（推荐，和 `<script setup>` 一致，复用 composable 无成本）**

```ts
// stores/counter.ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const history = ref<number[]>([])
  const double = computed(() => count.value * 2)

  function increment(step = 1) {
    count.value += step
    history.value.push(count.value)
  }

  // ★ 必须显式返回：没返回的东西，组件拿不到，devtools 里也看不到
  return { count, history, double, increment }
})
```

两种写法的取舍：

| 维度 | 选项式 | 组合式 |
| --- | --- | --- |
| 上手成本 | 低（与 Vuex 结构一一对应） | 中（需要熟悉 `ref` / `computed`） |
| 逻辑复用 | 弱（只能靠 action 互相调用） | 强（可直接调 composable、`watch`、`effectScope`） |
| `$reset()` | ✅ 自带 | ❌ 需自己实现（见 5.9） |
| TypeScript | 推导良好 | 推导最好（等同于普通函数） |
| 适合 | 简单 CRUD、老项目改造 | 复杂业务、需要复用逻辑的新项目 |

### 2.3 组件里怎么读、怎么写

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// ✅ state / getter 要解构，必须走 storeToRefs（返回 ref，保持响应性）
const { count, double } = storeToRefs(counter)

// ✅ action 直接解构是安全的（Pinia 内部已绑定 this）
const { increment } = counter

// ✅ 不解构时可直接读写；写操作也会被 devtools 记录
function onClick() {
  counter.count++            // 单字段赋值
  counter.$patch({ count: 0 })           // 对象式：深合并
  counter.$patch((state) => {            // 函数式：适合数组 push / 条件逻辑
    state.history.push(state.count)
  })
  increment(2)
}
</script>

<template>
  <p>{{ count }} / {{ double }}</p>
  <button @click="onClick">+</button>
</template>
```

常用 API 速查：

| API | 作用 | 注意 |
| --- | --- | --- |
| `store.$patch(obj \| fn)` | 批量修改，只触发一次订阅 | 对象式是深合并；数组增删用函数式 |
| `store.$state` | 整个状态树 | 赋值走 `$patch` 语义（浅合并，未给出的键保留），不是「清空重来」 |
| `store.$reset()` | 恢复初始 state | **仅选项式 store 有**，组合式需自己写（5.9） |
| `store.$subscribe(cb, opts)` | 监听 state 变更 | 在组件内调用会随组件卸载自动移除，插件里要 `{ detached: true }` |
| `store.$onAction(cb)` | 监听 action 调用（含 `after` / `onError`） | 适合统一 loading、日志、错误上报 |
| `store.$id` | 唯一 id | 与 `defineStore` 第一个参数一致 |

### 2.4 store 之间互相调用

组合式 store 里**直接在顶部调用**另一个 store 即可，因为此时已处于 store 的 setup 上下文中：

```ts
export const useCartStore = defineStore('cart', () => {
  const user = useUserStore()          // ✅ 顶部调用没问题
  const items = ref<CartItem[]>([])

  async function checkout() {
    if (!user.isLogin) await user.ensureLogin()  // ✅ 也可以延迟到 action 里
  }

  return { items, checkout }
})
```

坑在于**循环依赖**：`cart` 顶部引用 `user`、`user` 顶部又引用 `cart`，模块加载顺序不同会得到 `undefined`。做法是「一方延迟到函数内部再取」：

```ts
async function checkout() {
  const user = useUserStore()  // ✅ 用时才取，绕开模块初始化顺序
  ...
}
```

---

## 三、Vuex 4 的传统写法

Vuex 4 是配 Vue 3 的版本（Vuex 3 只能配 Vue 2）；它仍然保留 `mutation` 这一层，所有状态变更必须经过 `commit`。本章偏用法速查，**5 个核心概念与 Pinia 的对照见 4.1（图）与 4.2（速查表）**。

### 3.1 安装与单文件仓库

```bash
pnpm add vuex
```

```ts
// store/index.ts
import { createStore } from 'vuex'

export const store = createStore({
  state: () => ({
    count: 0,
  }),
  getters: {
    double: (state) => state.count * 2,
  },
  mutations: {
    // ★ 必须同步；异步逻辑一律放 action
    SET_COUNT(state, value: number) {
      state.count = value
    },
  },
  actions: {
    async fetchCount({ commit }) {
      const value = await api.getCount()
      commit('SET_COUNT', value)   // action 里只能 commit，不能直接改 state
    },
  },
})
```

```ts
// main.ts
import { createApp } from 'vue'
import { store } from './store'
createApp(App).use(store).mount('#app')
```

Vuex 4 相比 Vuex 3 的破坏性变化里，最影响写法的是：**不再自动挂载 `this.$store`**，组件里必须用 `useStore()`。老代码从 Vue 2 迁过来时，所有 `this.$store` 都要改。

### 3.2 state、getters、mutations、actions

| 概念 | 职责 | 硬约束 |
| --- | --- | --- |
| `state` | 唯一数据源 | 必须写成函数返回对象（模块复用时尤其重要） |
| `getters` | 派生数据，带缓存 | 只读、无副作用；依赖不变就不重算 |
| `mutations` | 唯一允许改 state 的地方 | **必须同步**；命名习惯 `SET_XXX` |
| `actions` | 业务逻辑、异步、组合多个 mutation | 通过 `commit` 落地，自己不直接改 state |

四条链路的调用方式：

```ts
store.state.count        // 读 state（不要在组件里直接赋值）
store.getters.double     // 读 getter
store.commit('SET_COUNT', 10)      // 改 state
await store.dispatch('fetchCount') // 跑 action
```

### 3.3 模块与命名空间

```ts
const userModule = {
  namespaced: true,   // ★ 忘了这一行，action / mutation 会和别的模块撞名
  state: () => ({ name: '', token: '' }),
  getters: {
    isLogin: (state) => Boolean(state.token),
    // 跨模块读根状态：第 3 个参数是 rootState
    tenant: (state, getters, rootState, rootGetters) => rootState.app.tenant,
  },
  mutations: {
    SET_TOKEN(state, token: string) {
      state.token = token
    },
  },
  actions: {
    async login({ commit, dispatch, rootState }, payload: LoginForm) {
      const token = await api.login(payload, rootState.app.tenant)
      commit('SET_TOKEN', token)
      dispatch('app/refreshMenus', null, { root: true }) // ★ 跨模块必须有 root: true
    },
  },
}

export const store = createStore({
  modules: { app: appModule, user: userModule },
})
```

命名空间下的完整路径：`store.commit('user/SET_TOKEN')`、`store.dispatch('user/login')`、`store.getters['user/isLogin']`。辅助函数用 `createNamespacedHelpers('user')` 生成带前缀的 `mapState/mapActions`，比手写字符串少出错。

### 3.4 组件里的读写

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// ✅ 用 computed 建立响应式依赖
const count = computed(() => store.state.count)
const double = computed(() => store.getters.double)

// ❌ 这样拿到的是「快照」，视图不会更新
// const { count } = store.state
</script>
```

选项式组件里用映射辅助函数（**必须放进 `computed` / `methods`，放错位置等于解构丢了响应性**）：

```js
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['count']),
    ...mapGetters(['double']),
  },
  methods: {
    ...mapMutations(['SET_COUNT']),
    ...mapActions(['fetchCount']),
  },
}
```

---

## 四、Vuex 与 Pinia 的核心概念与异同

两套库各自官方文档都只给了「核心概念」清单，**清单本身就是最好的对照表**：Vuex 5 个（State / Getter / Mutation / Action / Module），Pinia 6 个（定义 Store / State / Getter / Action / 插件 / 组件外的 Store）。少的那一个 `Mutation`、多的那两个，正好解释了它们全部的行为差异。

### 4.1 一张图看懂两套概念

<StoreConceptMapping />

三条读图结论：

1. **同名即同义**：`State` / `Getter` / `Action` 在两边含义基本一致，迁移时几乎一对一搬过去。
2. **Vuex 多一层 `Mutation`，Pinia 把它并进 `Action`**——这是两者最本质的差别（见 4.3 第 1 条）。
3. **`Module` 换成「定义 Store」**：组织单位从「一棵树里的子树」变成「一个文件一个 store 实例」，「命名空间 / root 参数 / 动态注册」这一整类概念随之消失。

> 读图细节：① 两块浅蓝节点（Vuex 的「插件」「组件外使用」）官方清单里没单列，是为了和 Pinia 对齐才补的对照项；② 其余词都是概念的使用细节——Vuex 的 `mapState` / `strict`、Pinia 的 `$patch` / `$subscribe` 都属于「围绕上述概念的用法」，不用当成新概念记。

### 4.2 核心概念速查（一表读完）

| 关注点 | Vuex 4 | Pinia | 一句话记住 |
| --- | --- | --- | --- |
| 定义 / 组织 | `Module`：`modules` + `namespaced` 命名空间 | `定义 Store`：`defineStore(id, …)`，一文件一 store | 都在解决「怎么切分、怎么隔离」 |
| 状态 | `State`：模块内写成函数返回对象 | `State`：`state()` 或 `ref` / `reactive` | 唯一数据源，其余都从它派生 |
| 派生 | `Getter`：带缓存，跨模块用 `rootState` / `rootGetters` | `Getter`：或组合式里直接 `computed` | 派生值不存第二份 |
| 改状态 | `Mutation`：**必须同步**，唯一合法入口，`commit('SET_X')` | **没有 Mutation**，`Action` 里直接赋值 / `$patch` | Vuex 的 mutation 是「事务」，Pinia 认为这层是样板 |
| 业务动作 | `Action`：异步编排，`context` 里 `commit` 落地 | `Action`：同步 / 异步都行，`this` 即 store | 组件只调 action，不直接改状态 |
| 扩展 | `plugins` 选项 + `store.subscribe` | `pinia.use()` 插件 + `$subscribe` / `$onAction` | 持久化、日志、埋点都挂这里 |
| 组件外使用 | `import { store }` 单例，随处可用 | `useStore(pinia)`，或先 `setActivePinia(createPinia())` | Pinia 多一步「拿到容器」，换来 SSR / 测试隔离 |

> 表外两条隐含约定：Vuex 的 `strict: true` 把「只能 commit」变成运行时约束；Pinia 没有 strict，只能靠团队约定（见 4.3）。

### 4.3 核心异同（5 条，够用了）

| # | 差异点 | Vuex 4 | Pinia | 影响 |
| --- | --- | --- | --- | --- |
| 1 | 变更入口 | `Action` → `commit` → `Mutation`（两段式，`strict` 兜底） | `Action` 直接改（一段式，无强制） | Pinia 少一半样板；代价是「变更意图」从框架强制变成团队约定 |
| 2 | 组织方式 | 一棵树 + `namespaced` 字符串寻址（`user/SET_TOKEN`） | 一组独立 store，互调即 `useUserStore()` | Vuex 重构靠搜字符串；Pinia 靠类型系统，且天然按 import 懒加载 |
| 3 | 单例范围 | 应用级单例，所有模块状态都在里面 | pinia 容器单例 + store 惰性缓存 | Pinia 在 SSR / 单测 / 多 App 下更安全：`createPinia()` 就能重置一整套 |
| 4 | 扩展与观察 | `plugins` 选项 + `subscribe`（mutation 粒度） | `pinia.use()` + `$subscribe`（state 粒度）/ `$onAction`（能拿参数、返回值、异常） | Pinia 做统一 loading、错误上报、持久化更顺手 |
| 5 | 约束与类型 | `strict: true` 强约束；`declare module 'vuex'` 手工补类型 | 无 strict；类型由 `defineStore` 自动推导 | Pinia 类型即文档，但要靠 code review 守住「只走 action」 |

> **一句话记住**：Vuex = 「一棵树 + 事务（Mutation）」；Pinia = 「一组带缓存的响应式 store」。差别不在 API 数量，而在**谁有资格改状态、状态怎么被组织、观察者看到什么粒度**。

### 4.4 选型速查

| 维度 | Vuex 4（配 Vue 3） | Pinia |
| --- | --- | --- |
| 官方定位 | 维护模式（不再加新特性） | Vue 官方推荐的默认方案 |
| 新项目 | 不建议 | ✅ 首选 |
| 存量 Vue 2（Vuex 3） | 可继续保留 | 可渐进替换（Pinia 兼容 Vue 2） |
| 代码分割 | 需 `registerModule` 手工处理 | import 到即创建，天然分块 |
| Devtools | mutation 粒度时间线，可时间旅行 | action 时间线 + 状态快照 |
| 体积 / 运行时 | 相对更大 | 更小更轻，直接用 Vue 响应式 |
| 团队纪律要求 | 低（`strict` 兜底） | 高（无 strict，靠约定 + review） |
| 类型成本 | 要手工 `declare module` | 零成本自动推导 |

结论：**新项目一律 Pinia**；Vuex 只用于存量维护，且不建议在 Vuex 项目里新增复杂模块——把新模块写成 Pinia store 反而是更平滑的过渡。

### 4.5 从 Vuex 迁移到 Pinia

| Vuex 写法 | Pinia 对应写法 |
| --- | --- |
| `state: () => ({...})` | 选项式：`state: () => ({...})`；组合式：一组 `ref()` |
| `mutations: { SET_X(state, v) }` | 该 mutation 直接变成 `actions.setX(v) { this.x = v }` |
| `actions: { async load({ commit }) }` | `actions.load()`，内部 `this.x = await api()` |
| `getters: { double: s => s.count * 2 }` | 选项式 `getters.double`；组合式 `computed` |
| `modules.user` + `namespaced` | `stores/user.ts` 一个 `defineStore('user', ...)` |
| `mapState` / `mapGetters` | `storeToRefs(useXxxStore())` |
| `mapActions` | 直接解构 store 上的 action |
| `rootState.app.tenant` | `useAppStore().tenant` |
| `dispatch('user/login', null, { root: true })` | `useUserStore().login()` |
| `Vue.set(state.obj, 'k', v)`（Vue 2 时代） | 直接赋值（Vue 3 响应式基于 Proxy） |

迁移顺序建议：**先建 Pinia 并 `app.use`，与 Vuex 并存（新模块写 Pinia）→ 按领域逐个搬迁 → 全站切完再移除 Vuex**。一次性重写整个数据层，风险远高于收益。

---

## 五、不易发现的坑点

### 5.1 解构 store 丢掉响应性 ⭐

```ts
// ❌ 只是把数字拷了一份，之后永远不变
const { count } = useCounterStore()

// ✅ 得到 Ref<number>，模板里自动解包
const { count } = storeToRefs(useCounterStore())
```

同一类坑的其它形态：

- `watch(store.count, ...)`：`store.count` 传进去时已求值成数字，watcher 立刻拿到 `0` 且不再触发；正确写法是 `watch(() => store.count, ...)`。
- Vuex 里 `...mapState(['count'])` 放进了 `data()` 而不是 `computed` —— 编译不报错，视图就是不更新。
- `storeToRefs` 只处理 state / getter；**action 解构是安全的**，但 `$patch` / `$reset` 这类内置方法解构后也没问题（内部已绑定）。

### 5.2 直接改 state 与整体替换 ⭐

- Pinia 没有 strict 模式：**任何拿到 `store.state.xxx` 对象引用的地方都能改它**，devtools 里看不清「谁改的」。约定是「跨组件改状态一律走 action」，把 `$patch` 的裸调用限制在 store 内部。
- `store.$state = { a: 1 }` 是**浅合并**语义（未给出的键保留），不是「恢复出厂」。要重置用 `$reset()`（选项式）或自己写 reset（组合式，见 5.9）。
- `$patch({ list: newList })` 与 `$patch((s) => { s.list = newList })` 行为一致，但 `$patch` 对象式对嵌套对象是**递归深合并**，想让某个嵌套字段「整个换掉」时要确认目标位置是叶子节点，否则旧键会残留。
- Vuex 里对应的是 `store.replaceState(initialState)`，以及 Vue 2 时代「新增属性不响应」必须 `Vue.set` 的老坑（Vue 3 的 Proxy 已无此问题）。

### 5.3 `defineStore` 的 id 冲突与重复定义 ⭐

Pinia 用 **id 字符串** 作为实例缓存键（`pinia._s`）。两个文件都写了 `defineStore('user', ...)`，运行时后调用的那个拿到的是**先创建的那个实例**，于是出现「某个 store 的方法/状态凭空消失、改 A 影响 B」的诡异现象——编译期完全不报错。

规避：

- id 与文件名、hook 名一一对应（`stores/user.ts` → `defineStore('user')` → `useUserStore`）。
- 微前端 / 拆包场景尤其要加前缀（`shop:cart`、`admin:cart`）：多个子应用若共用同一个 pinia 实例，就共用同一张 id 缓存表，同 id 必然互相顶掉。
- 同一 id 的选项式与组合式混写，症状更隐蔽（拿到的实例字段对不上），务必一个 store 一个出处。

### 5.4 在 setup 之外调用 `useStore` ⭐

```ts
// stores/foo.ts —— 模块顶层
const user = useUserStore() // ❌ 此时 pinia 大概率还没 install
```

典型触发场景：

- 在 `stores/*.ts` 顶部就调用另一个 store（循环引用时还会拿到 `undefined`）。
- 在 `router/index.ts` 的 `beforeEach` 里调用，而 `app.use(pinia)` 在 `router` 之后才执行。
- axios 拦截器在模块加载期就取 store。
- SSR 里把 store 存在模块级变量，跨请求串数据。

修复：**延迟到函数内部**（action、守卫回调、拦截器回调里再调），或显式传实例 `useUserStore(pinia)`。SSR 场景永远「每请求一个 pinia」。

### 5.5 异步写在 mutation 里 ⭐

```js
mutations: {
  async LOAD(state) {           // ❌ mutation 必须同步
    state.list = await api.list() // devtools 拍快照时数据还没回来 → 时间旅行错乱
  }
}
```

Vuex 的 devtools 依赖「mutation 执行前后 state 一致」这个前提，`await` 一出现，快照就对不上，时间旅行会回放到错误的状态。**异步永远放 action，拿结果再 `commit`。**

Pinia 没有 mutation，`action` 里 `await` 完全正常；但要注意 `await` 前后 `this` 指向（用 `this.xxx` 而不是提前解构出来的旧引用）。

### 5.6 忘记 `namespaced` 或 `root` 参数

| 现象 | 原因 |
| --- | --- |
| `[vuex] unknown action type: user/login` | 模块没写 `namespaced: true`，或路径拼错（Vuex 4 里 `namespaced` 默认 `false`，没有自动命名空间） |
| 两个模块同名 mutation 互相覆盖 | 没开 `namespaced`，全局同名 |
| 跨模块 dispatch 无效但不报错 | 少了第三个参数 `{ root: true }`，请求被发到当前命名空间里找不到 |
| getter 里拿不到别的模块 | 忘了用第 3/4 个参数 `rootState` / `rootGetters`，`state` 只是本模块的 |

### 5.7 getter 里的 `this` 与副作用 ⭐

```ts
getters: {
  // ❌ 箭头函数里 this 不是 store，取不到其它 getter
  label: (state) => `${this.double}`,
  // ✅ 需要互相引用时用普通函数
  label2(): string {
    return `${this.double}`
  },
}
```

另外两条：getter **不应有副作用**（发请求、改别的状态），否则每次读都在产生变更，容易进入「getter 改 state → 触发重算 → 再改 state」的死循环；getter 也**不应返回每次都是新引用的对象**（如 `state.list.filter(...)` 再 `map` 成新数组），父组件用它当 `props` 时会因为引用变化而反复重渲染——需要稳定引用就缓存成 `Map` 或改用 `shallowRef` + 手动失效。

### 5.8 把 store 状态当 props 往下传

```vue
<!-- ❌ 子组件拿到的是 store 里那个对象的引用，改它 = 绕过 action 直接改状态 -->
<DetailPanel :user="store.user" />
```

对象 / 数组类型的 state 传下去后，子组件里 `props.user.name = 'x'` 会直接改到 store（prop 是只读的，但它是引用，改的是引用指向的内容），既没有 action 记录也难以排查。做法：

- 只传需要的字段（基本类型天然隔离）；
- 确实要传对象就传一份浅拷贝 `{ ...store.user }`，或让子组件 `emit` 事件回来改；
- 需要「双向绑定」的地方用 `v-model` + `emit`，不要在子组件里 `store.xxx = ...`。

### 5.9 持久化、`$reset` 与严格模式的代价 ⭐

**`$reset` 不是通用的**：组合式 store 没有 `$reset`，调用会得到 `store.$reset is not a function`。自己实现：

```ts
export const useFilterStore = defineStore('filter', () => {
  const keyword = ref('')
  const page = ref(1)

  function $reset() {
    keyword.value = ''
    page.value = 1
  }

  return { keyword, page, $reset }
})
```

**严格模式很贵**：`new Vuex.Store({ strict: true })` 会对整个 state 做深度 watch，状态树越大、变更越频繁，开销越明显。只在 `import.meta.env.DEV` 打开。

**持久化插件（`pinia-plugin-persistedstate` 等）的四个坑**：

1. **每次都同步写 storage**：`$subscribe` 默认对每次变更触发，高频输入会卡；应节流（如 200~500ms）或只在大颗粒 action 后写。
2. **JSON 序列化丢类型**：`Date` 变字符串、`Map/Set` 变 `{}`、`undefined` 直接消失，反序列化后类型签名还是对的，但运行时报错。要用 `serializer` 或存 ISO 字符串并在 store 里显式转换。
3. **schema 变更不做迁移**：旧结构读进新代码，常见表现是「刷新后白屏 / 某个字段 undefined」。加 `version` 字段，版本不匹配就丢弃或迁移。
4. **`localStorage` 有配额（约 5MB）**，超了抛 `QuotaExceededError`，表现为「保存失败但没人知道」。大对象别进持久化；**token、密码、身份证等敏感字段不要持久化到 `localStorage`**。

### 5.10 SSR 与测试里的单例陷阱

- **SSR**：模块级的 `const pinia = createPinia()` 会在服务端所有请求间共享，必须放进 `createApp` 的工厂函数里每请求新建；store 也必须在 `setup()` 中调用，不能在模块顶层。否则会出现「A 用户看到 B 用户的数据」这类最严重的串号 bug。
- **测试**：每个用例前 `setActivePinia(createPinia())`，否则用例间状态互相污染（测试通过与否取决于执行顺序，是最典型的 flaky 来源）。
- **多实例（微前端 / 多 App 挂载）**：一个页面挂载两个 Vue 应用时，各自 `createPinia()` 才能隔离；共享 pinia 实例时 store 也就是共享的。

---

## 六、开发注意事项与工程规范

### 6.1 目录与命名

```text
src/stores/
├── index.ts          # 统一出口（可选，便于 mock 与批量导入）
├── user.ts           # defineStore('user')  →  useUserStore
├── app.ts            # 主题 / 语言 / 侧栏开合
├── cart.ts
└── types.ts          # 跨 store 共享的类型（只放类型，不放值）
```

约定：

- 一个 store 一个文件，**按业务领域切分**，不要按「页面」切（页面会合并拆分，领域不会）。
- id 用小写 kebab 或单段命名，与文件名一致；跨子应用加前缀。
- 派生数据一律 `computed` / getter，不额外存一份。
- store 里不写 DOM 操作、不读 `window`、不依赖组件实例——否则无法在 SSR / 测试里跑。

### 6.2 类型安全

```ts
// 组合式：返回值即类型，无需额外声明
export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const isLogin = computed(() => profile.value !== null)
  return { profile, isLogin }
})
```

注意事项：

- 不要给 `defineStore` 的返回值写 `as any` / `as SomeStore`，会把推导全废掉；需要导出类型时用 `ReturnType<typeof useUserStore>`。
- 对外要暴露联合类型 / 字面量类型时，给 getter 或 `computed` **显式标注返回类型**，别让推导把 `'idle' | 'loading'` 收窄成 `string`。
- Vuex 项目里补根 State 声明，否则 `useStore()` 里所有字段都是 `unknown`：

```ts
// store/types.d.ts
import type { RootState } from './index'

declare module 'vuex' {
  interface State extends RootState {}
}
```

### 6.3 异步与请求编排

推荐的 action 模板（loading / error / 并发去重三件套）：

```ts
export const useOrderStore = defineStore('order', () => {
  const list = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let inflight: Promise<void> | null = null

  async function fetchList(force = false) {
    if (inflight && !force) return inflight // 并发去重：同一时刻只发一次
    loading.value = true
    error.value = null
    inflight = (async () => {
      try {
        list.value = await api.orders()
      } catch (e) {
        error.value = (e as Error).message
      } finally {
        loading.value = false
        inflight = null
      }
    })()
    return inflight
  }

  return { list, loading, error, fetchList }
})
```

要点：

- **action 不要吞异常**：要么写进 `error` 字段供 UI 展示，要么继续抛出交给调用方，二者选其一，别既吞又无提示。
- 组件卸载时进行中的请求要有取消手段（`AbortController`），URL 参数变化时避免「后发先至」用请求序号或直接取消上一个。
- 组件里不要在 `computed` 里调 action（副作用），也不要在 `watch` 里无 `debounce` 地触发请求。
- 需要「跨页面共享的服务端缓存 + 失效策略」时，优先用请求库，store 只做客户端状态——两套缓存同时存在必然会不一致。

### 6.4 订阅、撤销与持久化

`$onAction` 做统一埋点 / loading，`$subscribe` 做快照与撤销：

```ts
// plugins/store-logger.ts
import type { PiniaPluginContext } from 'pinia'

export function storeLogger({ store }: PiniaPluginContext) {
  store.$onAction(({ name, args, after, onError }) => {
    const start = performance.now()
    after((result) => {
      console.info(`[store] ${store.$id}.${name} 完成`, { args, result, cost: performance.now() - start })
    })
    onError((err) => {
      console.error(`[store] ${store.$id}.${name} 失败`, err)
    })
  })
}
```

```ts
// 撤销 / 重做：只在对快照体积可控的 store 上做
const snapshots: string[] = []
store.$subscribe((_mutation, state) => {
  snapshots.push(JSON.stringify(state))
  if (snapshots.length > 50) snapshots.shift()
}, { detached: true })  // detached：不随组件卸载移除
```

注意 `$subscribe` 默认是**变更后**触发；需要「能否决变更」的场景用 `{ flush: 'sync' }` 并谨慎处理，sync 模式下重入很容易死循环。

### 6.5 测试与调试

```ts
// stores/user.spec.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from './user'

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia()) // ★ 每个用例一份干净实例
  })

  it('登录后 isLogin 为 true', async () => {
    const store = useUserStore()
    await store.login({ name: 'a', password: 'b' })
    expect(store.isLogin).toBe(true)
  })
})
```

- 单测 store 不需要挂载组件；涉及 `useRouter` / `useI18n` 的 store，用 `vi.mock` 或把这些依赖从 store 里挪出去（store 不该依赖路由实例）。
- 调试三板斧：devtools 的 Pinia 面板看状态树与 action 时间线；`store.$onAction` 打点；`pinia.state.value` 打印全量状态（SSR 排查脏数据时最有用）。

### 6.6 性能清单

| 做法 | 说明 |
| --- | --- |
| 按领域拆小 store | 一个 store 状态越多，任何字段变更触发的订阅范围越大 |
| 大列表 / 只读数据用 `shallowRef`、`markRaw` | 避免深层 Proxy 化，几万条数据差距非常明显 |
| 不在 getter 里做全量重算 | 每次依赖变更都重跑 `filter + sort + map`，列表页会卡；必要时缓存或分层 |
| 组件只订阅需要的切片 | `storeToRefs` 单字段，别把整个 store 塞进 `props` 触发整体更新 |
| 避免 `watch(store)` 深监听 | 等于订阅全树，任何字段变更都回调；改成 `watch(() => store.x)` |
| 高频写入合并 | 一次 `$patch` 顶多次逐字段赋值（后者触发多次订阅与渲染） |
| 生产环境关掉严格模式 / 详细日志 | 深度 watch 与 `console` 在低端机上是真实开销 |

---

## 七、常见问题速查

| 报错 / 现象 | 原因 | 处理 |
| --- | --- | --- |
| `getActivePinia()" was called but there was no active Pinia` | `useStore()` 早于 `app.use(pinia)`，或在模块顶层调用 | 延迟到 setup / 函数内部，或 `useStore(pinia)` 显式传入 |
| `[vuex] unknown action type: xxx` | 模块未开 `namespaced`，或路径拼错、未 `registerModule` | 补 `namespaced: true`，核对完整路径 |
| `[vuex] unknown mutation type: xxx` | 同上；或忘了跨模块 `{ root: true }` | 核对前缀与 root 参数 |
| `[vuex] do not mutate vuex store state outside mutation handlers` | strict 模式下直接改了 state | 改为 `commit`，或只在 dev 开 strict |
| 改了 store，视图不动 | 解构丢了响应性；Vuex 里 `mapState` 放错位置；Vue 2 新增属性未 `Vue.set` | `storeToRefs` / `computed` / `Vue.set` |
| `store.$reset is not a function` | 组合式 store 无内置 `$reset` | 在 store 内自定义 `$reset` |
| 两个 store 行为互相串味、方法丢失 | `defineStore` id 重复 | 保证 id 全局唯一，加业务前缀 |
| 刷新后状态全没了 | 默认不持久化（预期行为） | 需要则接持久化插件，注意 5.9 的四个坑 |
| 持久化后字段类型不对 / 白屏 | JSON 序列化丢类型，或 schema 变更未迁移 | 自定义 `serializer` + `version` 迁移 |
| SSR 下偶发串号、数据串到别人页面 | pinia 实例被模块级复用 | 每请求 `createPinia()`，store 在 `setup` 内调用 |
| 测试单独跑过、一起跑失败 | 用例间共享 pinia | `beforeEach` 里 `setActivePinia(createPinia())` |
| action 里 `this` 是 `undefined` | 用了箭头函数定义 action，或解构了未绑定的方法 | action 用普通函数；Pinia 的 action 解构本身安全 |

相关主题：store 的脏数据排查常与浏览器存储相关，见 [浏览器存储](/fundamentals/browser-storage/)；列表与状态更新引起的渲染问题见 [前端性能优化知识手册](/fundamentals/front-end-performance/)；组件通信与 props 的单向数据流约束见 [Vue 开发规范](/frameworks/vue/)。

---

## 八、参考资料

官方文档：

- [Pinia 官方中文文档](https://pinia.vuejs.org/zh/)：核心概念、选项式 / 组合式写法、插件、SSR 与测试。
- [Vuex 官方中文指南](https://vuex.vuejs.org/zh/guide/)：state / getters / mutations / actions / modules 与严格模式。

延伸阅读：

- [Vue 3 官方文档 · 状态管理](https://cn.vuejs.org/guide/scaling-up/state-management.html)：什么时候需要状态管理，以及「简单场景用 `ref` 就够」的官方态度。
- [Vue 3 官方文档 · 组合式函数](https://cn.vuejs.org/guide/reusability/composables.html)：Pinia 组合式 store 的底层心智模型。
- [Pinia 官方 · 从 Vuex 迁移](https://pinia.vuejs.org/zh/cookbook/migration-vuex.html)：逐项迁移映射。
