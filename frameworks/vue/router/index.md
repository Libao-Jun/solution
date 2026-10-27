# Vue Router 路由完全指南（Vue Router 3 与 4）

> 参考资料：
>
> - [Vue Router 3 官方文档（中文，对应 Vue 2）](https://v3.router.vuejs.org/zh/)
> - [Vue Router 4 官方文档（中文，对应 Vue 3）](https://router.vuejs.org/zh/)
> - [Vue Router 4 API 参考](https://router.vuejs.org/zh/api/)
> - [Vue 3 官方文档](https://cn.vuejs.org/)
> - [vuejs/router 源码仓库](https://github.com/vuejs/router)
> - [path-to-regexp 路径匹配语法](https://github.com/pillarjs/path-to-regexp)
>
> 面向角色：**新手**与**高级前端工程师**都适用。新手按「一 → 二 → 三 → 四」能把路由跑起来并写对页面；高级开发者可直接查「五、导航守卫」「六、参数变化与组件复用」「七、动态路由与权限」「十二、高频坑点速查表」，专治那些「代码看起来没问题、线上就是不生效」的坑。
>
> 文中示例**默认以 Vue 3 + Vue Router 4 + `<script setup lang="ts">` 为准**，凡与 Vue 2 + Vue Router 3 有差异处均显式标注 `【v3】` / `【v4】`；标注 ⭐ 的为**高频、且往往不会报错只会静默失效的坑**，建议优先精读。路由相关的基础写法在 [Vue 开发规范](/frameworks/vue/) 第 13 章有速查版，本文是它的完整展开。

### 阅读路线

- **新手路线（跑通 + 写对）**：`一、路由是什么与版本选型` → `二、路由模式与 history 部署` → `三、路由表配置详解` → `四、导航方式与跳转实践` → `八、滚动行为与页面过渡`。读完即可独立搭出多页面应用。
- **高阶路线（查漏 + 避坑）**：直接精读 `五、导航守卫完整链路`、`六、参数变化与组件复用`、`七、动态路由与权限控制`、`十一、Vue Router 3 与 4 的迁移清单`、`十二、高频坑点速查表`；日常开发遇到「守卫不生效」「页面不刷新」「刷新后 404」时按目录检索。

---

## 目录

1. [路由是什么与版本选型](#一、路由是什么与版本选型)
2. [路由模式与 history 部署](#二、路由模式与-history-部署)
3. [路由表配置详解](#三、路由表配置详解)
4. [导航方式与跳转实践](#四、导航方式与跳转实践)
5. [导航守卫完整链路](#五、导航守卫完整链路)
6. [参数变化与组件复用](#六、参数变化与组件复用)
7. [动态路由与权限控制](#七、动态路由与权限控制)
8. [滚动行为与页面过渡](#八、滚动行为与页面过渡)
9. [TypeScript 与工程化实践](#九、typescript-与工程化实践)
10. [性能与体验优化](#十、性能与体验优化)
11. [Vue Router 3 与 4 的迁移清单](#十一、vue-router-3-与-4-的迁移清单)
12. [高频坑点速查表](#十二、高频坑点速查表)
13. [最佳实践清单与 FAQ](#十三、最佳实践清单与-faq)

---

## 一、路由是什么与版本选型

### 1.1 前端路由的本质：URL 与组件树的映射

单页应用（SPA）只有一张 HTML，页面切换靠 JavaScript 完成。所谓「前端路由」，就是把 **URL 变化** 映射成 **组件树的替换**，并把这种映射登记成一张**路由表（routes）**：

```text
浏览器地址栏 → 路由匹配（路由表）→ 渲染对应的组件到 <RouterView>
```

它要做三件事，缺一不可

- 1. **监听** URL 变化（`popstate` / `hashchange`）；
- 2. **匹配** 出当前 URL 对应哪条路由记录（含 `params` / `query` / `hash`）；
- 3. **渲染** 路由对应的组件，并触发「导航」相关的生命周期与守卫。

所以路由问题永远只有三个环节：排查时先定位属于哪一环，比盲改代码快得多。

- **匹配错了**（路由表写错）
- **没触发**（守卫 / 复用 / 监听问题）
- **部署错了**（history 回退或 base 配错）。

### 1.2 版本对应关系

Vue Router 的大版本**与 Vue 的大版本强绑定**，不能混装

| Vue 版本      | 应装 Vue Router | 官方文档                                                  | 安装命令                |
| ------------- | --------------- | --------------------------------------------------------- | ----------------------- |
| Vue 3.x       | Vue Router 4.x  | [router.vuejs.org/zh](https://router.vuejs.org/zh/)       | `pnpm add vue-router@4` |
| Vue 2.7 / 2.x | Vue Router 3.x  | [v3.router.vuejs.org/zh](https://v3.router.vuejs.org/zh/) | `pnpm add vue-router@3` |

⚠️ 在 Vue 3 项目里装成 `vue-router@3` 的典型症状：`createRouter is not a function`、`app.use(router)` 后页面空白、`this.$router` 为 `undefined`。反之 Vue 2 装 4.x 会报 `Cannot read properties of undefined (reading '_router')` 一类错误。

两代 API 的核心差异先记住一张表，后文所有细节都围绕它展开

| 维度       | Vue Router 3（Vue 2）                    | Vue Router 4（Vue 3）                                                     |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| 创建       | `new VueRouter({ mode, routes })`        | `createRouter({ history, routes })`                                       |
| 模式       | `'history'` / `'hash'` / `'abstract'`    | `createWebHistory()` / `createWebHashHistory()` / `createMemoryHistory()` |
| 子路径基准 | `base: '/app/'`                          | `createWebHistory('/app/')`                                               |
| 注入       | `new Vue({ router })`                    | `app.use(router)`                                                         |
| 组件内取值 | `this.$route` / `this.$router`           | `useRoute()` / `useRouter()`                                              |
| 守卫写法   | 必须调用 `next()`                        | **返回值**（`return false / true / 路由地址`）                            |
| 通配       | `path: '*'`                              | `path: '/:pathMatch(.*)*'`                                                |
| 批量加路由 | `router.addRoutes(list)`（已废弃）       | `router.addRoute` 逐个（或 `addRoute(parentName, route)`）                |
| 编程式导航 | `push` 返回 Promise，重复导航 **reject** | `push` 重复导航 **resolve 一个 NavigationFailure**（不 reject）           |
| 当前路由   | `this.$router.currentRoute`（普通对象）  | `router.currentRoute`（**ref**，需 `.value`）                             |

### 1.3 最小可运行示例

**Vue 3 + Vue Router 4**

::: code-group

```ts [router/index.ts]
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/views/AboutView.vue"),
  },
  // 兜底 404：必须放在最后（v3 语法是 '*'，见 3.2）
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFound.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, savedPosition) => savedPosition ?? { top: 0 },
});
```

```ts [src/main.ts]
// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).mount("#app");
```

```vue [src/App.vue]
<!-- src/App.vue：RouterLink / RouterView 由插件全局注册，无需 import -->
<template>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink :to="{ name: 'about' }">关于</RouterLink>
  </nav>
  <RouterView />
</template>
```

:::

**Vue 2 + Vue Router 3**

::: code-group

```js [router/index.js]
// src/router/index.js
import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/Home.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/views/About.vue"),
    },
    { path: "*", redirect: "/404" },
  ],
});

export default router;
```

```js [src/main.js]
// src/main.js
import Vue from "vue";
import App from "./App.vue";
import router from "./router";

new Vue({ router, render: (h) => h(App) }).$mount("#app");
```

:::

### 1.4 一次导航到底发生了什么

理解这条链路，才能解释「守卫为什么没执行」「为什么 mounted 只跑一次」

```text
1. 触发导航（RouterLink 点击 / router.push / 浏览器前进后退）
2. 触发失活组件里的 beforeRouteLeave
3. 触发全局 beforeEach
4. 触发复用组件里的 beforeRouteUpdate（同一条路由记录、仅参数变化时）
5. 触发路由独享的 beforeEnter
6. 触发解析异步路由组件（懒加载的 import() 在这里才发网络请求）
7. 触发激活组件里的 beforeRouteEnter
8. 触发全局 beforeResolve
9. 触发导航被确认
10. 触发全局 afterEach
11. DOM 更新
12. beforeRouteEnter 中传给 next 的回调（拿到组件实例）
```

由这条链可以推出三个高频结论

- **第 6 步在守卫之后**
  > 想在跳转前「拦住」懒加载请求是做不到的；反过来，懒加载失败的报错发生在守卫之后，要用 `router.onError` 兜（见 5.6）。
- **第 4 步只在「同一条路由记录」内参数变化时触发**
  > `/user/1 → /user/2` 走它，`/user/1 → /order/1` 不走（见第六章）。
- **第 12 步是组件实例唯一可得的时机**
  > 这也解释了 `beforeRouteEnter` 里为什么没有 `this`（见 5.5）。

---

## 二、路由模式与 history 部署

### 2.1 三种 history 模式

| 模式  | 创建方式                 | URL 形态               | 说明                                                        |
| ----- | ------------------------ | ---------------------- | ----------------------------------------------------------- |
| HTML5 | `createWebHistory('/')`  | `example.com/user/1`   | 最美观，**需要服务端回退配置**，否则刷新 404                |
| Hash  | `createWebHashHistory()` | `example.com/#/user/1` | 不需要服务端配置，兼容性最好；URL 有 `#`，不易被分享统计    |
| 内存  | `createMemoryHistory()`  | 无（不操作地址栏）     | SSR、单元测试、非浏览器环境（小程序 / Electron 自定义容器） |

`【v3】` 对应写法：`mode: 'history' | 'hash' | 'abstract'`，且 history 模式有 `fallback: true`（浏览器不支持 history API 时自动降级 hash，现代浏览器已无意义，v4 已移除该选项）。

### 2.2 history 模式的服务器回退 ⭐

history 模式下 `example.com/user/1` 在服务端是**真实不存在**的路径，刷新或直接访问时服务器必须把请求交回 `index.html`，交给前端路由处理。**这是 history 模式最高频的线上事故来源**：本地 `vite dev` 自带回退，一切正常，一上线就 404。

**Nginx（根路径部署）**

```nginx
location / {
  root /usr/share/nginx/html;
  index index.html;
  try_files $uri $uri/ /index.html;   # 关键：找不到实体文件就回退到 index.html
}
```

**Nginx（子路径 `/app/` 部署）**

```nginx
location /app/ {
  alias /usr/share/nginx/html/app/;
  try_files $uri $uri/ /app/index.html;   # 回退地址必须带子路径前缀
}
```

**Node / Express**

```js
// 放在所有 API 路由之后，兜住其余 GET 请求
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "index.html"));
});
```

> ⚠️ 不要写 `app.get('*', ...)`：Express 5 已不接受裸 `*` 作为路径（会抛 `Missing parameter name`），用上面的中间件写法最稳。

**静态托管平台**：Vercel / Netlify 需在平台配置里显式开启 SPA 回退（`rewrites` / `/* /index.html 200`）； GitHub Pages **不支持**服务端回退，需额外把 `index.html` 复制成 `404.html`（或改用 hash 模式），否则深链接一律 404。

**检查清单**：部署后不要只点首页入口，必须**直接粘贴一个二级路径到地址栏回车**、并在该页按 F5，两者都正常才算过。

### 2.3 子路径部署与 base ⭐

路由的 `base` 是「应用挂在哪个子路径」，它必须与**构建工具的 `base`**、**服务器的 location** 三者一致，任何一处漏配都会得到 404 或白屏：

```ts
// 推荐：直接复用构建工具的 base，避免两处写死
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 由 vite.config 的 base 注入
  routes,
});
```

```ts
// 【v3】
const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});
```

三个必查点：

1. `vite.config.ts` 的 `base`（或 webpack 的 `publicPath`）与服务器子路径一致；
2. 路由 `history` 的 base 与之相同（`createWebHistory('/app/')` 结尾必须有 `/`）；
3. `RouterLink` / `router.resolve()` 生成的 `href` **会自动带 base**，所以**不要在模板里手写 `'/app' + path`**，否则会变成 `/app/app/xxx`。

> ⚠️ 站点部署在 `https://域名/solution/` 这类子路径时，`base` 写成 `/solution`（缺尾斜杠）会让 `router.resolve()` 拼出 `/solutionuser`。宁可多写一个斜杠。

### 2.4 hash 与 history 的取舍

| 维度              | history                    | hash                                  |
| ----------------- | -------------------------- | ------------------------------------- |
| URL 美观 / SEO    | 好                         | 带 `#`，部分统计工具会截断            |
| 服务端配置        | **必需**配置回退           | 不需要                                |
| 刷新深链接        | 需回退，否则 404           | 天然可用                              |
| 微信 / 老 WebView | 一般可用                   | 最稳                                  |
| 锚点定位          | `#hash` 与路由 hash 需协调 | 天然冲突（一个 `#` 既是路由又是锚点） |

**结论**

- 自有服务器 / 可控静态托管 → history；
- 无法控制服务器（如某些内嵌 H5、老后台、GitHub Pages 不想折腾 404.html）→ hash。
- ⚠️不要在同一个项目里混用两种模式。

### 2.5 特殊运行环境

- **Electron / Tauri 等桌面壳**：加载 `file://` 时 history 模式会失效（`file:///user/1` 不存在），必须用 hash 或 `createMemoryHistory()`。
- **微前端子应用**：子应用路由 base 用主应用分配的路径前缀，且**子应用销毁时要 `router.replace` 或移除监听**，否则主应用切换后子应用的 `popstate` 监听仍在响应。
- **SSR**：服务端用 `createMemoryHistory()`，客户端用 `createWebHistory()`，两边路由表必须**完全一致**（同一份导出）。

---

## 三、路由表配置详解

### 3.1 路由记录字段总表

| 字段          | 类型 / 取值                                  | 作用与注意事项                                           |
| ------------- | -------------------------------------------- | -------------------------------------------------------- |
| `path`        | `string`                                     | 必须以 `/` 开头；子路由写成相对路径（不加 `/`），见 3.3  |
| `name`        | `string`                                     | 命名路由的唯一键，**全局不可重复**；重复会被覆盖并告警   |
| `component`   | 组件 / `() => import()`                      | 懒加载写法见 10.1；父级分组路由可省略，见 3.3            |
| `components`  | `{ default, sidebar, ... }`                  | 命名视图，配合 `<RouterView name="sidebar" />`           |
| `children`    | `RouteRecordRaw[]`                           | 嵌套路由，渲染到父组件的 `<RouterView>`                  |
| `redirect`    | `string` / 路由地址对象 / `(to) => 路由地址` | 见 3.4                                                   |
| `alias`       | `string` / `string[]`                        | 别名路径，访问它与访问原路径等价（不改变 URL）           |
| `props`       | `boolean` / `object` / `(route) => object`   | 把参数解耦成组件 props，见 3.5                           |
| `meta`        | `Record<string, unknown>`                    | 自定义元信息（标题、权限、菜单），见 3.6                 |
| `beforeEnter` | 守卫函数 / 函数数组                          | 路由独享守卫，**只在进入该记录时触发**（参数变化不触发） |
| `sensitive`   | `boolean`                                    | 大小写敏感（默认 `false`）                               |
| `strict`      | `boolean`                                    | 尾斜杠严格匹配（默认 `false`，即 `/a` 与 `/a/` 等价）    |

### 3.2 动态参数与匹配语法

```ts
const routes = [
  { path: "/user/:id", component: UserView }, // 必填参数
  { path: "/post/:slug?", component: PostView }, // 可选参数（v3 / v4 都支持）
  { path: "/doc/:chapters+", component: DocsView }, // 一段或多段（+ 重复）
  { path: "/raw/:pathMatch(.*)*", component: RawView }, // 通配（可零段）
  { path: "/order/:id(\\d+)", component: OrderView }, // 自定义正则：只匹配数字
];
```

| 语法               | 含义                | v3  | v4                                  |
| ------------------ | ------------------- | --- | ----------------------------------- |
| `:id`              | 必填一段            | ✅  | ✅                                  |
| `:id?`             | 可选                | ✅  | ✅                                  |
| `:id+` / `:id*`    | 重复一段 / 零或多段 | ✅  | ✅                                  |
| `*`                | 任意路径（通配）    | ✅  | ❌ 必须改写成 `/:pathMatch(.*)*`    |
| `:id(\\d+)`        | 自定义正则          | ✅  | ✅（注意字符串里 `\\d` 要双反斜杠） |
| `/:pathMatch(.*)*` | v4 的通配写法       | ❌  | ✅                                  |

**易踩点**：

- ⭐ **`route.params` 的值永远是字符串**（哪怕路径里是数字），要比较或参与计算必须 `Number(...)`；直接 `route.params.id === 1` 永远为 `false`。
- ⭐ **通配必须能匹配「零段」**：`/:pathMatch(.*)*` 末尾的 `*` 才是关键，写成 `/:pathMatch(.*)` 时访问 `/` 匹配不到，404 兜底会失效。
- **参数会自动编解码**：路由层已经 `encodeURIComponent` 过，**不要自己再编一次**，否则中文 / 带斜杠参数会出现 `%252F` 这类双重编码。
- **同一条路径不要同时存在静态与动态冲突写法**：`/user/me` 与 `/user/:id` 同时存在时，v4 会按得分优先静态路径（见 3.7），v3 则**严格按声明顺序**，`/user/:id` 写在前面会把 `/user/me` 吃掉。

### 3.3 嵌套路由与命名视图

```ts
{
  path: '/settings',
  component: SettingsLayout,        // 布局壳：内部必须有一个 <RouterView />
  children: [
    { path: '', name: 'settings', component: SettingsHome },          // 默认子路由
    { path: 'profile', name: 'settings-profile', component: ProfileView },
    { path: 'security', name: 'settings-security', component: SecurityView },
  ],
}
```

三条规则

- 子路由 `path` **不加前导 `/`**，会自动拼成 `/settings/profile`；加了 `/` 就变成绝对路径，脱离父级。
- `path: ''` 的子路由是「父路径的默认页」，否则访问 `/settings` 时只渲染布局壳、内容区空白。
- 需要多个同级视图时用命名视图

  ```vue
  <!-- 布局组件内 -->
  <RouterView />
  <!-- 默认视图：主内容 -->
  <RouterView name="sidebar" />
  <!-- 命名视图：侧栏 -->
  ```

  ```ts
  {
    path: '/dashboard',
    components: {
      default: DashboardMain,
      sidebar: DashboardSidebar,
    },
  }
  ```

> **仅用于路径分组**的父级可以不写 `component`（例如把 `/admin/*` 统一加权限）；但**需要布局壳时必须给 `component`**，否则子路由没有被渲染的宿主 `<RouterView>`。

### 3.4 重定向与别名

```ts
{ path: '/', redirect: '/home' }                                  // 字符串
{ path: '/old', redirect: { name: 'new-page' } }                  // 命名路由（更稳，改路径不失效）
{ path: '/legacy/:id', redirect: (to) => `/new/${to.params.id}` } // 函数
{ path: '/home', alias: ['/index', '/start'], component: Home }   // 别名：URL 不变
```

- ⭐ **重定向死循环**
  > `/a → /b`、`/b → /a` 会让浏览器卡死；守卫里「未登录跳登录页」也必须排除登录页自身，否则同样死循环。
- **`redirect` 与 `alias` 的区别**
  > `redirect` 会**改变地址栏**（多一条历史记录，除非用 `replace`），`alias` 不改地址栏、只是同一页面多入口。
- **重定向不触发目标路由的 `beforeEnter`？**
  > 会触发 — 重定向产生的是一次**新的导航**，目标路由的守卫会完整走一遍。这也是「登录后跳回原页」能生效的原因。

### 3.5 props 解耦（把 `$route` 从组件里赶出去）

```ts
// 1. 布尔：把 params 直接作为 props 传入
{ path: '/user/:id', component: UserView, props: true }

// 2. 对象：传静态 props
{ path: '/promo', component: PromoView, props: { source: 'spring' } }

// 3. 函数：自己决定传什么（最灵活，推荐）
{
  path: '/search',
  component: SearchView,
  props: (route) => ({
    keyword: String(route.query.q ?? ''),
    page: Number(route.query.page ?? 1),
  }),
}
```

好处：组件只依赖 props，可单测、可复用；不必在组件里到处写 `route.params`。

> ⚠️
>
> - `props: true` **只传 `params`，不传 `query`**；
> - `query` 永远是字符串或 `null`，需要数字 / 布尔请用函数式 props 转换。

### 3.6 meta 与 meta 合并规则

```ts
{
  path: '/admin',
  meta: { requiresAuth: true, roles: ['admin'] },
  children: [
    { path: 'users', meta: { title: '用户管理' }, component: UsersView },
  ],
}
```

- `route.meta` 是**从父到子浅合并**的结果（子级同名键覆盖父级），所以子路由能读到父级的 `requiresAuth`，无需重复声明。
- `meta` 不要放**函数或组件实例**等不可序列化内容：SSR 时需要序列化到客户端，会直接报错。
- `meta` 不是「全局响应式配置」：它随 `route` 对象一起更新，守卫里读到的永远是**目标路由**的 meta。

### 3.7 路由匹配优先级 ⭐

| 版本 | 匹配规则                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------- |
| v3   | **严格按 `routes` 数组声明顺序**，先匹配到就停：`/user/:id` 写在 `/user/me` 前面就会吃掉后者                           |
| v4   | 引入**得分排序**（静态段 > 动态段 > 通配），声明顺序基本不影响结果，但仍建议「精确 → 动态 → 通配」书写，可读且便于排查 |

实战建议

- 兜底 404（`/:pathMatch(.*)*`）**永远放最后一行**，无论 v3 还是 v4。
- 不要依赖 v4 的排序来「故意制造」重叠路由，可读性差且迁移 v3 时会翻车。
- 需要「同一路径不同权限/不同布局」时，用**同名不同 `name`** 的两条记录并在守卫里重定向，而不是靠声明顺序。

---

## 四、导航方式与跳转实践

### 4.1 `RouterLink`：声明式导航

```vue
<!-- 三种 to 写法 -->
<RouterLink to="/user/1">用户</RouterLink>
<RouterLink :to="{ name: 'user', params: { id: 1 } }">用户</RouterLink>
<RouterLink
  :to="{ path: '/search', query: { q: 'vue', page: 2 } }"
>搜索</RouterLink>
```

需要自定义渲染（例如渲染成按钮、加图标）时用 `custom` + 作用域插槽，此时**必须自己调用 `navigate`**

```vue
<RouterLink v-slot="{ href, navigate, isActive }" to="/user/1" custom>
  <button :class="{ active: isActive }" @click="navigate">用户</button>
</RouterLink>
```

**激活类名**（默认值，可通过 `linkActiveClass` / `linkExactActiveClass` 全局改）

| 类名                       | 命中条件                     | 典型用途                               |
| -------------------------- | ---------------------------- | -------------------------------------- |
| `router-link-active`       | 目标路径是当前路径的**前缀** | 一级菜单高亮（`/user` 匹配 `/user/1`） |
| `router-link-exact-active` | 路径**完全相等**（含 query） | 二级 Tab 精确高亮                      |

> ⭐ 常见现象：侧边栏一级菜单「用户管理」进入详情页后**不高亮**。多数是把 `exact-active-class`（v3 的 `exact`）用在了**一级菜单**上，前缀匹配因此失效；或反过来 — 二级 Tab 忘了加精确匹配，导致同级菜单一起高亮。记住：**一级用前缀匹配（默认），二级用 exact**。

外链（`https://`）虽然 `RouterLink` 也能渲染成 `<a>` 并整页跳转，但无法附加 `target` / `rel`，建议直接用 `<a>`；`RouterLink` 的边界是「应用内路径」。

### 4.2 编程式导航

::: code-group

```ts [【v4】组合式 API]
// 【v4】组合式 API
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

await router.push({ name: "user", params: { id: 1 } });
await router.replace({ path: "/login", query: { redirect: route.fullPath } });
router.back();
router.go(-2);
```

```js [【v3】选项式 API]
// 【v3】选项式 API
this.$router.push("/user/1");
this.$router.replace("/login");
this.$router.go(-1);
```

:::

| 方法      | 作用                     | 注意                                           |
| --------- | ------------------------ | ---------------------------------------------- |
| `push`    | 新增一条历史记录         | 返回 Promise，**必须 `await`**（见下）         |
| `replace` | 替换当前历史记录         | 登录页、重定向、Tab 切换时避免「返回又跳回来」 |
| `go(n)`   | 正数前进 / 负数后退 n 步 | `go(0)` 是**刷新整页**，不是路由跳转           |
| `back()`  | 等价 `go(-1)`            | 无历史记录时不会报错，但也不会跳转             |

⭐ **`push` 是异步的**：`router.push(...)` 之后立刻读 `route.params`，拿到的仍是**旧值**（守卫、组件解析、渲染都还没完成）。要读新路由状态必须 `await router.push(...)`，或 `await nextTick()`。

### 4.3 `params` 与 `query` 的取舍 ⭐

| 维度              | `params`（路径参数）                   | `query`（查询串）                      |
| ----------------- | -------------------------------------- | -------------------------------------- |
| URL 形态          | `/user/1`                              | `/user?id=1`                           |
| 取值类型          | 字符串 / 字符串数组                    | 字符串 / 空值 / 字符串数组             |
| 必填              | 可设为必填（缺了匹配不到）             | 天然可选                               |
| 传参必须用 `name` | **是**（用 `path` 时 params 会被忽略） | 否                                     |
| 适合              | 资源标识（详情页、分类页）             | 筛选、分页、排序、搜索关键词、临时状态 |

三个必背的坑

1. ⭐ **`path` 与 `params` 同时出现时 `params` 被丢弃**

```ts
// ❌ id 不会生效，跳转到 /user 后 params 为空
router.push({ path: "/user", params: { id: 1 } });
// ✅ 用命名路由
router.push({ name: "user", params: { id: 1 } });
// ✅ 或直接拼路径（注意自行 encodeURIComponent）
router.push(`/user/${id}`);
```

2. ⭐ **`query` 的值不保证是字符串**：`?q=a&q=b` 得到数组，`?flag`（无值）得到 `null`，`?page=2`得到字符串 `'2'`。直接用 `query.page + 1` 可能得到 `'21'` 或 `NaN`：

```ts
const page = computed(() => Number(route.query.page ?? 1) || 1);
```

3. ⭐ **刷新页面后 `params` 只剩字符串、`query` 只剩字符串**：不要指望通过 `params` / `query` 传对象或组件状态（会被序列化成 `[object Object]`）。复杂状态放 Pinia / `history.state`（`router.push` 的 `state` 选项）。

### 4.4 命名路由 vs 路径字符串

- **推荐命名路由**：路径改名时只改路由表，所有 `push({ name })` 自动生效；且能避免手拼 base 与编码问题。
- **路径字符串只用于**：极简 demo、外链跳转、需要动态拼接整个路径的场景。
- `router.resolve(to)` 可以把任意 `to` 解析成 `{ href, route, location }`，用于生成分享链接、预取（见 10.2）。

### 4.5 历史栈与 `replace` 的时机

| 场景                      | 用 `push` | 用 `replace` | 原因                                     |
| ------------------------- | --------- | ------------ | ---------------------------------------- |
| 列表 → 详情               | ✅        | —            | 用户要能「返回列表」                     |
| 登录成功跳首页            | —         | ✅           | 避免返回键回到登录页                     |
| 未登录被守卫踢到登录页    | —         | ✅           | 避免「登录页 → 返回 → 又跳登录页」死循环 |
| 同一页面的 Tab / 筛选切换 | —         | ✅           | 否则历史记录爆炸，返回键要点十几次       |
| 404 兜底跳转              | —         | ✅           | 不应把错误地址留在历史栈里               |

> 守卫里返回路由地址做重定向时，vue-router 会用 `replace` 语义（不新增历史记录）；但在守卫里手动 `router.push` 则是 `push`，两者行为不同，且**守卫里 push 会打断当前导航**（见 5.8 反模式）。

### 4.6 外链、下载与 `target`

```vue
<!-- 应用内：RouterLink -->
<RouterLink to="/docs">文档</RouterLink>
<!-- 站外 / 新窗口：普通 a 标签 -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">外链</a>
<!-- 下载：交给浏览器，不要走路由 -->
<a href="/files/report.pdf" download>下载报表</a>
```

`RouterLink` 的 `to` 若以 `http` 开头会被当作外链处理，但**不会自动加 `target` / `rel`**，出于安全（`window.opener` 劫持）建议外链一律手写 `<a>` 并带 `rel="noopener noreferrer"`。

---

## 五、导航守卫完整链路

### 5.1 守卫分类

| 分类       | 具体守卫                                                      | 生效范围                           |
| ---------- | ------------------------------------------------------------- | ---------------------------------- |
| 全局       | `beforeEach` / `beforeResolve` / `afterEach`                  | 每次导航                           |
| 路由独享   | `beforeEnter`                                                 | 进入该路由记录时（参数变化不触发） |
| 组件内     | `beforeRouteEnter` / `beforeRouteUpdate` / `beforeRouteLeave` | 该组件被激活 / 复用 / 离开时       |
| 组合式 API | `onBeforeRouteUpdate` / `onBeforeRouteLeave`                  | 同上（`Enter` 无组合式版本）       |

### 5.2 全局前置守卫：`beforeEach`

**【v4】返回值写法（推荐）**

```ts
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // 1. 需要登录但没 token：重定向，并把原地址带上，登录后跳回
  if (to.meta.requiresAuth && !auth.token) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  // 2. 已登录但用户信息未加载：异步补齐（守卫支持 async）
  if (auth.token && !auth.user) {
    await auth.fetchProfile(); // 抛错会被 router.onError 捕获
  }

  // 3. 返回 undefined / true = 放行
  return true;
});
```

**返回值语义**（v4 全局守卫与路由独享守卫通用）

| 返回值                    | 结果                                           |
| ------------------------- | ---------------------------------------------- |
| `undefined` / `true`      | 放行                                           |
| `false`                   | 取消导航，URL 停在原处（地址栏已变时会被回滚） |
| 路由地址（字符串 / 对象） | 中断当前导航，跳转到新地址（会重新走一遍守卫） |
| `throw Error`             | 中断导航，触发 `router.onError`                |

**【v3】必须调用 `next()`**

```js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.state.token) {
    next({ name: "login", query: { redirect: to.fullPath } }); // 重定向
  } else {
    next(); // 放行，漏写就永远挂起
  }
});
```

> ⚠️ v4 仍然兼容 `next`（第三个参数），但它**已标记弃用**，且与返回值混用极易出现「守卫跑了两次」「导航卡住」。新代码一律用返回值；老代码迁移时**同一文件内不要两种风格混写**。

### 5.3 `beforeResolve` 与 `afterEach`

- `beforeResolve`：**所有**守卫（含组件内、路由独享）与**异步组件解析完成之后**、导航确认之前触发。适合「依赖组件已就绪」的全局逻辑，例如需要读取路由组件注册的信息。
- `afterEach`：导航已确认、DOM 更新前触发，**不能**阻止导航。典型用途：埋点、`document.title`、关闭全局 loading、滚动复位。

```ts
router.afterEach((to, from, failure) => {
  if (failure) return;
  document.title = to.meta.title ? `${to.meta.title} - 我的应用` : "我的应用";
  trackPageView(to.fullPath);
});
```

```js
// 【v3】
router.afterEach((to) => {
  document.title = to.meta.title || "我的应用";
});
```

### 5.4 路由独享 `beforeEnter` ⭐

```ts
{
  path: '/admin/:section',
  component: AdminView,
  beforeEnter: (to, from) => {
    if (!hasPermission(to.params.section)) return { name: 'forbidden' }
  },
}
```

⭐ **只在「进入这条路由记录」时触发**：`/admin/users → /admin/roles` 复用同一记录，`beforeEnter` **不会执行**。需要「参数变化也校验」时，改用组件内 `onBeforeRouteUpdate` 或 `watch`（见第六章）。这是权限控制最常见的漏网之鱼 — 用户在同一路由内改参数就能绕过校验。

### 5.5 组件内守卫

```ts
// 【v4】组合式 API
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";

// 离开前拦截（表单未保存）
onBeforeRouteLeave(() => {
  if (form.dirty && !window.confirm("离开将丢失未保存的修改，确定？"))
    return false;
});
```

```js
// 【v4】选项式 API
export default {
  beforeRouteEnter(to, from, next) {
    // 此时组件实例还不存在，this === undefined
    next((vm) => {
      vm.load(to.params.id); // 通过回调拿到实例
    });
  },
  beforeRouteUpdate(to, from) {
    this.load(to.params.id);
  },
  beforeRouteLeave(to, from) {
    // 返回 false 取消离开
  },
};
```

- ⭐ **`beforeRouteEnter` 里没有 `this`**：组件还没创建。组合式 API 没有对应的 `onBeforeRouteEnter`，改用 `onMounted` + `watch(..., { immediate: true })`。
- **`beforeRouteUpdate` 是「同一记录内参数变化」唯一的路由级回调**（组合式对应 `onBeforeRouteUpdate`），`beforeEnter` 管不到这段。
- **`beforeRouteLeave` 里不要做异步重活**：`confirm` 之外的长耗时逻辑会阻塞整个导航，用户感觉「点了没反应」。

### 5.6 守卫里的错误与 `router.onError`

守卫（含懒加载的 `import()`）抛错时，v4 会终止导航并触发

```ts
router.onError((error, to, from) => {
  // 典型：发版后旧 chunk 被删除，用户点菜单报 Loading chunk xxx failed
  if (
    /Failed to fetch dynamically imported module|Loading chunk .* failed/i.test(
      error.message,
    )
  ) {
    window.location.reload(); // 或提示「有新版本，点击刷新」
    return;
  }
  reportError(error, { to: to.fullPath, from: from.fullPath });
});
```

```js
// 【v3】
router.onError((error) => {
  if (/Loading chunk (\d+) failed/.test(error.message))
    window.location.reload();
});
```

> **发版必踩坑**：history 模式下用户停留在旧页面，发版后旧 chunk 文件名变了，再点懒加载路由就 404。上面的 `onError` + 整页刷新是最小可用兜底；更稳的做法是构建产物**保留上一版本一段时间**（`assets` 带 hash 不要覆盖清理），或接 `vite-plugin-pwa` 做更新提示。

### 5.7 导航失败与 `isNavigationFailure`

v4 里 `push` / `replace` **不会因为导航失败而 reject**，而是 `resolve` 一个 `NavigationFailure`（成功时为 `undefined`）。
这改变了 v3 时代「必须 `.catch` 掉 `NavigationDuplicated`」的习惯

```ts
import { isNavigationFailure, NavigationFailureType } from "vue-router";

const failure = await router.push({ path: "/same-path" });
if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
  // 与当前地址完全相同，被去重
}
```

| 类型         | 值  | 触发场景                                   |
| ------------ | --- | ------------------------------------------ |
| `aborted`    | 4   | 守卫返回 `false`                           |
| `cancelled`  | 8   | 导航过程中又发起了新导航（旧导航被取消）⭐ |
| `duplicated` | 16  | 目标地址与当前完全一致                     |

```js
// 【v3】重复导航会 reject，未捕获就是控制台红字
this.$router.push("/same").catch(() => {});
// 全局兜掉（不推荐长期使用，会吞掉真实错误）
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};
```

- ⭐ **`cancelled` 是最隐蔽的一类**：`await router.push(a)` 还没走完，又触发 `router.push(b)`，前一个导航直接取消，你在 `await` 后面的代码**仍会继续执行**，但页面已是 `b`。所以「跳转后立刻做业务」必须确认 `failure` 为空。
- **不要用 `.catch(() => {})` 抹平一切**：真实的路由错误（如权限接口 500）会被一起吞掉。

### 5.8 守卫反模式清单

| 反模式                                             | 后果                                                       | 正确做法                                                |
| -------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| v3 里漏写 `next()`（某分支没覆盖）                 | 导航永久挂起，白屏且无报错                                 | 所有分支都要 `next`，或改用 v4 返回值                   |
| 同一守卫里调用两次 `next()`                        | 控制台告警、导航状态错乱                                   | 每个分支只走一次                                        |
| v4 里 `next()` 与 `return` 混用                    | 守卫被重复执行 / 导航卡住                                  | 统一用返回值                                            |
| 守卫内 `router.push(...)` 而不是 `return 地址`     | 当前导航被打断，可能触发竞态 / 死循环                      | 用返回值重定向                                          |
| 组件里 `onMounted` 中 `router.beforeEach` 且不注销 | 每次进页面都注册一次，守卫越积越多，重复请求 / 内存泄漏 ⭐ | 在组件内用 `onBeforeRouteUpdate`，或 `onUnmounted` 移除 |
| 守卫里同步执行重计算（几万条数据过滤）             | 每次跳转都卡顿                                             | 结果缓存（`computed` / store），守卫只读                |
| 重定向目标不做「排除自身」判断                     | 无限重定向，白屏                                           | 加 `to.name !== 'Login'` 判断                           |

---

## 六、参数变化与组件复用

### 6.1 为什么 `mounted` 只执行一次 ⭐

Vue 复用组件实例：`/user/1 → /user/2` 命中的是**同一条路由记录**，vue-router 只更新 `route.params`，**不会销毁重建组件**。于是

- `onMounted` / `mounted` / `created` **不再执行**；
- 你在 `mounted` 里写的「按 id 请求数据」不会重跑，页面停留在 1 号用户的数据上。

这是新手 100% 会遇到、也是线上最容易被漏测的 bug（只有从列表点第二条才暴露）。

### 6.2 三种解法对比

| 方案                                        | 写法                                                      | 优点             | 缺点                                                               |
| ------------------------------------------- | --------------------------------------------------------- | ---------------- | ------------------------------------------------------------------ |
| `watch` 参数（推荐）                        | `watch(() => route.params.id, load, { immediate: true })` | 精确、不重建组件 | 首次加载与后续更新走同一入口，注意 `immediate`                     |
| `onBeforeRouteUpdate` / `beforeRouteUpdate` | 守卫里调 `load(to.params.id)`                             | 与路由耦合清晰   | 只在路由变化时触发，非路由来源的变化管不到                         |
| `<RouterView :key="route.fullPath" />`      | 强制重建组件                                              | 一行解决         | **组件状态全丢**、动画闪烁、性能差，只用于确实要「整页重置」的场景 |

```ts
const route = useRoute();
const user = ref<User | null>(null);

watch(
  () => route.params.id,
  async (id) => {
    user.value = await fetchUser(String(id));
  },
  { immediate: true }, // 首次进入也执行，替代 onMounted
);
```

> ⚠️ 不要「`onMounted` 里请求一次 + `watch` 里再请求一次」：首屏会**发两次相同请求**（见 10.5）。

### 6.3 `route` 的响应式与解构陷阱 ⭐

```ts
const route = useRoute();

// ❌ 解构后失去响应式：params 在导航时是整体替换的新对象，解构出的 id 永远是旧值
const { params, query } = route;

// ✅ 保持引用，按需读取
const id = computed(() => route.params.id);
```

`useRoute()` 返回的是**响应式对象**，但 `route.params` / `route.query` 每次导航都会被**替换成新对象**（非就地修改），因此

- 用 `watch(() => route.params.id, ...)` 而不是 `watch(route.params.id, ...)`（后者传的是字符串，Vue 会警告无效的侦听源）；
- 需要同时监听多个字段时用 `watch(() => route.fullPath, ...)`，但注意它包含 query 和 hash，任何变化都会触发；
- 选项式 API 的 `this.$route` 同理，直接 `watch: { '$route.params.id' }` 才有效。

### 6.4 `keep-alive` 与路由组件缓存 ⭐

列表页 → 详情页 → 返回列表，希望能保留滚动位置与筛选条件

```vue
<RouterView v-slot="{ Component }">
  <KeepAlive :include="['ListView', 'SearchView']">
    <component :is="Component" />
  </KeepAlive>
</RouterView>
```

三个必查点：

1. ⭐ **`include` 匹配的是「组件名」**
   > `<script setup>` 默认由**文件名**推断组件名（Vue 3.2.34+），文件名是 `ListView.vue` 才叫 `ListView`；在生产构建下文件名可能被压缩改写，**建议显式 `defineOptions({ name: 'ListView' })`**。
2. **懒加载路由的组件名**
   > 路由里写 `component: () => import('./ListView.vue')` 时，`KeepAlive` 看到的是解析后的组件，名字仍取组件自身的 `name`，与懒加载无关；但若用 `defineAsyncComponent` 包一层，要确认 `name` 没丢。
3. **缓存组件不会走 `onUnmounted`**
   > 定时器 / `addEventListener` / 轮询要在 `onDeactivated` 里暂停，`onActivated` 里恢复，否则后台页面持续消耗资源。

`KeepAlive` 与 `<RouterView :key>` 同时使用时，`key` 变化会导致组件被判定为不同实例而**绕过缓存**，务必二选一。

### 6.5 滚动位置与缓存恢复

`keep-alive` 只缓存 DOM 与状态，**不缓存滚动位置**。列表页返回后要还原滚动位置，需要

- 开启 `scrollBehavior` 返回 `savedPosition`（浏览器前进后退时有效）；
- 或用 `onDeactivated` 记录 `container.scrollTop`、`onActivated` 恢复（同一个路由被缓存时 `savedPosition` 常常拿不到）。

---

## 七、动态路由与权限控制

### 7.1 动态增删路由 API

| API                                  | 作用                             | 备注                             |
| ------------------------------------ | -------------------------------- | -------------------------------- |
| `router.addRoute(route)`             | 追加一条顶级路由（返回移除函数） | 同名路由会**覆盖**旧的           |
| `router.addRoute(parentName, route)` | 追加为某个命名路由的子路由       | 父级必须已注册                   |
| `router.removeRoute(name)`           | 按名移除                         | 也可用 `addRoute` 返回的函数移除 |
| `router.hasRoute(name)`              | 是否存在                         | 避免重复添加                     |
| `router.getRoutes()`                 | 拿到**扁平化**后的全部记录       | 用于菜单 / 面包屑 / 调试         |
| `【v3】router.addRoutes(list)`       | 批量追加                         | **已废弃**，且无法按名移除       |

⭐ **`router.options.routes` 不会被 `addRoute` 更新**：它是初始化时的原始数组，动态加的路由只在内部 matcher 里，想枚举必须用 `getRoutes()`。

### 7.2 两种权限模式

| 模式     | 做法                                                           | 优点                   | 风险                                 |
| -------- | -------------------------------------------------------------- | ---------------------- | ------------------------------------ |
| 前端过滤 | 登录后按角色从静态路由表过滤，`addRoute` 后跳转                | 实现简单、无需后端配合 | 路由表暴露在包里，权限只是「看不见」 |
| 后端下发 | 登录接口返回可访问菜单 / 路由标识，前端映射成组件后 `addRoute` | 权限单一真相源         | 需组件映射表，接口变更要同步前端     |

⭐ **前端权限不等于安全**：路由守卫只在浏览器执行，用户可以改内存、直接调接口。**所有数据接口必须在服务端鉴权**，前端路由权限只解决「不让他看到菜单」。

### 7.3 刷新丢失与注册时机 ⭐

动态路由只存在于**内存**，F5 之后 matcher 被重建，动态路由全部消失。若此时用户正好停在动态路由页面上，就会命中 404。

正确顺序（在守卫里补齐，且**必须重新触发导航**）

```ts
let routesReady = false;

router.beforeEach(async (to) => {
  if (routesReady) return true;

  const auth = useAuthStore();
  if (!auth.token) return to.meta.public ? true : { name: "login" };

  // 1. 拉取用户信息 + 可访问路由
  const menus = await auth.fetchMenus();
  // 2. 注册动态路由（同名会覆盖，注意幂等）
  menus.forEach((r) => router.hasRoute(r.name) || router.addRoute(r));
  // 3. 兜底 404 重新注册到最后（若原本就在静态表里，可跳过）
  routesReady = true;

  // 4. 关键：用 fullPath 重新走一次导航，否则 to 已按旧 matcher 解析成 404
  return to.fullPath;
});
```

- ⭐ **漏掉第 4 步的症状**：菜单点进去正常，F5 刷新变 404 白屏，或页面渲染成 NotFound。
- **`return to.fullPath` 会再走一遍守卫**，所以要有 `routesReady` 之类的幂等标记，否则死循环。
- 退出登录要 `removeRoute` 移掉动态路由，或直接 `location.reload()`（最省事也最可靠）。

### 7.4 404 兜底与注册顺序

- v3：按声明顺序匹配，兜底 `path: '*'` **必须在所有路由之后**，且动态路由 `addRoutes` 之后还要保证它仍在最后（推荐把兜底抽成常量，每次加完动态路由再 `addRoutes([notFound])`）。
- v4：按得分排序，兜底得分最低，顺序不敏感；但**同名覆盖**仍然存在，`addRoute` 时注意不要覆盖 `not-found`。
- 兜底页不要用 `redirect: '/404'` 再配一条 `/404` 路由，否则地址栏会变成 `/404`，用户不知道原本访问的是什么。直接渲染 404 组件，或把原路径放进 `query`。

### 7.5 菜单与面包屑

```ts
// 面包屑：matched 是「从根到当前」的记录数组
const breadcrumbs = computed(() =>
  route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({ title: r.meta.title as string, name: r.name })),
);
```

- `route.matched` 包含父级布局记录，过滤掉没有 `meta.title` 的即可。
- 菜单高亮用 `route.path` 前缀判断，或直接依赖 `router-link-active`（见 4.1），不要自己再维护一份「当前选中」状态 — 两份状态一定会不同步。

### 7.6 多标签页（Tab 页签）场景

后台管理常见的「打开多个页签」实现要点

- 页签数据用 `route.fullPath` 作为 key（同名路由不同参数应是两个页签）；
- `keep-alive` 的 `include` 用组件名，页签关闭时要同步从 `include` 移除，否则缓存永不释放；
- 关闭当前页签后跳转的目标要用 `replace`，否则历史栈里会留下已关闭的页签。

---

## 八、滚动行为与页面过渡

### 8.1 `scrollBehavior`

```ts
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 浏览器前进 / 后退：恢复到上次位置
    if (savedPosition) return savedPosition;
    // 锚点跳转：滚动到元素，并留出固定头部高度
    if (to.hash) return { el: to.hash, top: 80, behavior: "smooth" };
    // 其它：回到顶部
    return { top: 0 };
  },
});
```

- 返回值可以是 `{ left, top, behavior }`、`{ el, top, behavior }`、`savedPosition`、`false`（不滚动）、或 `Promise`。
- ⭐ **`savedPosition` 只在浏览器前进后退（`popstate`）时存在**，普通 `push` 永远是 `null`。所以「返回列表保持位置」在 `keep-alive` 场景常常不生效（见 6.5）。
- 锚点滚动依赖 DOM 已渲染：目标元素来自异步数据时，`el` 那一刻还不存在，需要在数据到位后手动 `scrollIntoView`。

### 8.2 自定义滚动容器 ⭐

内置 `scrollBehavior` 默认操作**窗口滚动**。若布局是「头部固定 + 内容区 `overflow-y: auto`」，页面滚动发生在内部容器上，`scrollBehavior` 会静默无效（页面看起来「不回到顶部」）。两种处理：

```ts
// 方案一：返回 Promise，导航确认后自己滚容器
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    nextTick(() => {
      document.querySelector('#app-main')?.scrollTo({ top: 0 })
      resolve(false)   // 告诉 router 不要再做窗口滚动
    })
  })
}
```

```ts
// 方案二：afterEach 里统一处理
router.afterEach(() => {
  document.querySelector("#app-main")?.scrollTo({ top: 0 });
});
```

### 8.3 `RouterView` + `Transition`

```vue
<RouterView v-slot="{ Component, route }">
  <Transition name="fade" mode="out-in">
    <component :is="Component" :key="route.path" />
  </Transition>
</RouterView>
```

- ⭐ **`<Transition>` 只接受单个根节点**：路由组件写多个根（Fragment）时过渡直接失效，控制台只有一条警告。
- `mode="out-in"` 避免新旧页面同时存在导致的高度跳动；`appear` 可让首屏也有动画。
- `:key="route.path"` 会让**参数变化也重建组件**（跳过复用），这与第六章的「复用」是互斥的取舍：要动画就舍状态，要状态就别加 key。
- `Transition` 与 `KeepAlive` 同时使用时顺序是 `<Transition><KeepAlive><component/></KeepAlive></Transition>`，反了会告警。

### 8.4 可访问性与体验细节

- **焦点管理**：路由切换后焦点仍在被销毁的链接上，键盘用户会「丢失位置」。应在 `afterEach` 后把焦点移到主标题或 `main` 容器（`tabindex="-1"` + `focus()`）。
- **标题**：`document.title` 必须在 `afterEach` 里更新（见 5.3），否则浏览器历史记录里全是一样的标题。
- **`aria-current`**：`RouterLink` 命中时默认输出 `aria-current="page"`，自定义渲染时记得自己加。
- **加载态**：懒加载 + 慢网下，点击后到组件渲染之间没有任何反馈，会让人以为「点了没反应」。见 10.4。

---

## 九、TypeScript 与工程化实践

### 9.1 路由表的类型

```ts
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/user/:id",
    name: "user",
    component: () => import("@/views/UserView.vue"),
    meta: { title: "用户详情", requiresAuth: true },
  },
];
```

用 `RouteRecordRaw` 而不是 `RouteRecordNormalized`（后者是内部规范化后的记录，字段只读且结构不同）。

### 9.2 扩展 `RouteMeta` 类型 ⭐

默认 `route.meta` 是 `Record<string | number | symbol, unknown>`，读 `route.meta.title` 只能拿到 `unknown`。在 `src/types/router.d.ts`（或任意被 `tsconfig` 包含的 `.d.ts`）里做模块扩展

```ts
// src/types/router.d.ts
import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
    keepAlive?: boolean;
  }
}
```

> ⚠️ 这个文件**必须被 `tsconfig.json` 的 `include` 覆盖**（放在 `src/` 下最稳），且 `import 'vue-router'` 不能省 — 否则声明会变成「覆盖」而不是「合并」，路由类型全变 `any`。

### 9.3 参数类型与安全读取

内置的 `route.params` 类型是 `Record<string, string | string[]>`，无法从路由表自动推断。三种做法

| 做法                           | 说明                                                       |
| ------------------------------ | ---------------------------------------------------------- |
| 手动断言（够用）               | `const id = computed(() => String(route.params.id))`       |
| `props` 函数 + 组件 props 类型 | 组件只声明 `defineProps<{ id: number }>()`，转换在路由表做 |
| 文件路由插件（进阶）           | `unplugin-vue-router` 按文件生成类型化路由表               |

无论哪种，都要处理「参数可能是数组」：`String(route.params.id)` 遇到 `['1','2']` 会得到 `'1,2'`，需要明确业务预期。

### 9.4 路由分层与目录结构

```text
src/router/
├── index.ts          # createRouter、全局守卫、scrollBehavior
├── routes/
│   ├── index.ts      # 汇总所有模块路由
│   ├── basic.ts      # 登录、404、首页
│   └── modules/      # 按业务模块拆分（user.ts、order.ts）
├── guards/
│   ├── auth.ts       # 鉴权守卫
│   └── title.ts      # 标题 / 埋点
└── types.ts          # RouteMeta 扩展与业务类型
```

要点：

- **路由表按模块拆文件**，`index.ts` 只做 `concat`，避免单文件上千行；模块内导出 `RouteRecordRaw[]`。
- **守卫也拆文件**：`guards/auth.ts` 导出 `setupAuthGuard(router)`，在 `index.ts` 里调用，便于测试与按需开关。
- 需要「自动收集模块路由」时可用 `import.meta.glob('./modules/*.ts', { eager: true })`，但**顺序不可控**，v3 的兜底路由不能依赖它。

### 9.5 环境变量与 base 一致性

| 场景           | 该改哪里                                                                  |
| -------------- | ------------------------------------------------------------------------- |
| 本地开发       | `base: '/'`，路由 `createWebHistory('/')`                                 |
| 部署到子路径   | 构建 `base: '/app/'`，路由用 `createWebHistory(import.meta.env.BASE_URL)` |
| 多环境不同前缀 | 用环境变量注入 `base`，CI 里传值；**不要在两处硬编码**                    |

### 9.6 单元测试与 E2E

```ts
import { createRouter, createMemoryHistory } from "vue-router";
import { mount } from "@vue/test-utils";

const router = createRouter({
  history: createMemoryHistory(), // 测试用内存路由，不碰 window.history
  routes,
});

await router.push("/user/1");
await router.isReady(); // 等首次导航完成，避免断言到空白
const wrapper = mount(App, { global: { plugins: [router] } });
```

- `createMemoryHistory()` 不会污染 jsdom 的 `history`，也不会触发真实滚动。
- 断言路由用 `router.currentRoute.value.fullPath`（**v4 是 ref**）。
- E2E（Playwright / Cypress）里要显式等待**导航后的目标元素**出现，而不是 `wait(1000)`；history 模式的深链接测试必须直连 URL，才能暴露服务器回退问题。

---

## 十、性能与体验优化

### 10.1 路由懒加载与分包

```ts
// ✅ 每个路由一个 chunk，首屏只加载当前页
{ path: '/report', component: () => import('@/views/ReportView.vue') }

// ❌ 全量静态 import：所有页面打进主包，首屏白白多几百 KB
import ReportView from '@/views/ReportView.vue'
{ path: '/report', component: ReportView }
```

- 布局壳、登录页、404 这类**首屏必经**的可以静态引入，其余一律懒加载。
- webpack 项目可用魔法注释命名 chunk（`/* webpackChunkName: "report" */`）；Vite 会自动按文件名命名。
- 不要把「同一模块的多个页面」拆得过碎：浏览器并发请求数有限，几十个小 chunk 反而更慢。

### 10.2 预取（prefetch）

用户 hover 菜单时提前把目标路由的 chunk 拉下来，点击即可秒开：

```ts
function prefetch(to: RouteLocationRaw) {
  const { matched } = router.resolve(to);
  matched.forEach((record) => {
    const loader = record.components?.default;
    // 懒加载路由的 component 就是一个返回 Promise 的函数
    if (typeof loader === "function")
      (loader as () => Promise<unknown>)().catch(() => {});
  });
}
```

```vue
<RouterLink
  to="/report"
  @mouseenter="prefetch('/report')"
  @focus="prefetch('/report')"
>报表</RouterLink>
```

> 注意 `router.resolve()` 在 v4 返回 `{ href, route, location }`，`matched` 在 `route` 上；`【v3】` 用 `router.resolve(to).route.matched`。

### 10.3 守卫里不要做重活

- 守卫是**串行阻塞**的：一个 `await` 200ms 的接口，会让每次跳转都白屏 200ms。
- 能并行的请求用 `Promise.all`；能缓存的用户信息 / 菜单只请求一次并存在 store。
- 不要在每个守卫里 `JSON.parse(localStorage.getItem(...))`，把它放到初始化阶段。
- 需要「加载中」提示时用全局进度条（`afterEach` 关闭），别让用户对着静止页面等。

### 10.4 路由级加载态

```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);

router.beforeEach(() => {
  loading.value = true;
});
router.afterEach(() => {
  loading.value = false;
});
router.onError(() => {
  loading.value = false;
});
</script>
```

> 组件内注册全局守卫必须保证只注册一次（应用根组件），否则会叠加（见 5.8）。更好的做法是把 loading 状态放进 Pinia，在 `router/index.ts` 里统一挂。

### 10.5 避免重复请求 ⭐

同一个数据在三个地方各请求一次，是最常见的性能浪费

| 重复来源                                                   | 处理                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| `onMounted` + `watch(..., { immediate: true })` 两处都请求 | 只保留 `watch` + `immediate`                               |
| `beforeRouteEnter` 里请求 + 组件内再请求                   | 二选一                                                     |
| `beforeEach` 拉用户信息 + 组件里再拉一次                   | 用户信息只放 store，守卫负责首次加载                       |
| 切换 Tab 重新 `mounted`（未缓存）                          | 用 `keep-alive`，或在 store 里做请求去重（in-flight 缓存） |

---

## 十一、Vue Router 3 与 4 的迁移清单

| #   | 变更点                           | Vue Router 3                          | Vue Router 4                                                        |
| --- | -------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| 1   | 创建实例                         | `new VueRouter({ ... })`              | `createRouter({ ... })`                                             |
| 2   | history 配置                     | `mode: 'history'`                     | `history: createWebHistory()`                                       |
| 3   | 子路径                           | `base: '/app/'`                       | `createWebHistory('/app/')`                                         |
| 4   | 挂载                             | `new Vue({ router })`                 | `app.use(router)`                                                   |
| 5   | 组件内访问                       | `this.$route` / `this.$router`        | `useRoute()` / `useRouter()`（Options API 仍可用 `this.$route`）    |
| 6   | 守卫返回值                       | 必须 `next()`                         | `return false / true / 路由地址`                                    |
| 7   | 通配路由                         | `path: '*'`                           | `path: '/:pathMatch(.*)*'`                                          |
| 8   | 批量添加                         | `router.addRoutes(list)`              | 逐条 `router.addRoute()`（可用 `addRoute(parent, route)`）          |
| 9   | 路由信息查询                     | `router.match(location)`              | `router.resolve(location)`                                          |
| 10  | 父 / 子记录                      | `route.parent` / `route.children`     | `route.matched`（数组，从根到当前）                                 |
| 11  | 当前路由                         | `router.currentRoute`（对象）         | `router.currentRoute`（**ref**，需 `.value`）                       |
| 12  | 重复导航                         | `push` reject `NavigationDuplicated`  | `push` resolve 一个 `NavigationFailure`（不 reject）                |
| 13  | 重定向方式                       | `next('/login')`                      | `return { name: 'login' }`（或仍用 `next`，但不推荐）               |
| 14  | `router.onReady`                 | 支持                                  | 改用 `router.isReady()`                                             |
| 15  | `fallback` 选项                  | 支持（history 不支持时降级 hash）     | 已移除                                                              |
| 16  | 滚动行为 `scrollBehavior`        | 参数 `(to, from, savedPosition)` 相同 | 返回值不变，但 `behavior` / `el` 支持更好                           |
| 17  | `router-link` 的 `tag` / `event` | 支持 `tag="li"`、`event="click"`      | **已移除**，改用 `custom` + `v-slot`                                |
| 18  | `router-link` 的 `exact`         | 支持                                  | **已移除**，改用 `exact-active-class` 或 `custom` + `isExactActive` |

**迁移步骤建议**

1. 先把 Vue 2 → Vue 3 的 `Vue.use(VueRouter)` 与 `new Vue({ router })` 换成 `createRouter` + `app.use(router)`；
2. 全局守卫统一改成返回值写法（先别动组件内守卫，它们仍可保留 `next`）；
3. 把 `path: '*'` 换成 `/:pathMatch(.*)*`，`addRoutes` 换成 `addRoute`；
4. 全量搜索 `this.$route` / `this.$router`，在组合式组件里换成 `useRoute()` / `useRouter()`；
5. 检查所有 `router.currentRoute.xxx`（v4 必须 `.currentRoute.value.xxx`）；
6. 删掉所有 `.catch(() => {})` 式的重复导航兜底，改为判断 `NavigationFailure`；
7. 逐个手测：深链接刷新、子路径部署、动态路由刷新、`router-link` 高亮、返回键行为。

> 官方另提供 Vue Router 3 → 4 的迁移文档（`v3-migration` 章节），但**版本升级重点在 Vue 本身**：Vue Router 4 只支持 Vue 3，两者必须一起升。

---

## 十二、高频坑点速查表

| #   | 症状                                                          | 根因                                                          | 处理                                                     |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | 部署后**刷新二级页面 404**，本地一切正常                      | history 模式缺服务端回退                                      | 配 `try_files $uri $uri/ /index.html`（见 2.2）          |
| 2   | 部署到子路径后**整站白屏 / 资源 404**                         | 构建 `base`、路由 `base`、服务器路径三者不一致                | 三处统一（见 2.3）                                       |
| 3   | 从列表进第二条详情，**数据还是第一条**                        | 同路由记录复用组件，`mounted` 不再执行                        | `watch(() => route.params.id, ..., { immediate: true })` |
| 4   | `router.push({ path, params })` 后 **params 为空**            | `path` 与 `params` 互斥，params 被丢弃                        | 改用 `name` + `params`（见 4.3）                         |
| 5   | 守卫**漏写某分支 `next()`**，页面卡死无报错（v3）             | 导航永远处于 pending                                          | 补全分支，或升级为返回值写法                             |
| 6   | 页面里注册的守卫**越积越多**，请求重复                        | `onMounted` 里 `router.beforeEach` 未注销                     | 组件内用 `onBeforeRouteUpdate`，或 `onUnmounted` 移除    |
| 7   | 未登录时**无限重定向 / 白屏**                                 | 守卫把登录页也重定向了                                        | 加 `to.name !== 'Login'` 判断（见 3.4）                  |
| 8   | 同一路由改参数**绕过权限校验**                                | 只写了 `beforeEnter`，参数变化不触发                          | 加 `beforeRouteUpdate` / `watch`（见 5.4）               |
| 9   | 动态路由 **F5 后 404**                                        | 动态路由只在内存，刷新丢失                                    | 守卫里重建 + `return to.fullPath` 重新导航（见 7.3）     |
| 10  | `route.params.id === 1` **永远 false**                        | params 值永远是字符串                                         | `Number(...)`（见 3.2）                                  |
| 11  | `query.page + 1` 得到 `'21'` 或 `NaN`                         | query 是字符串 / 数组 / null                                  | 用 `Number(...)` 转换并给默认值（见 4.3）                |
| 12  | 解构 `const { params } = useRoute()` 后**数据不更新**         | 解构丢失响应式引用                                            | 保持 `route` 引用，用 `computed`（见 6.3）               |
| 13  | `watch(route.params.id, ...)` **不触发**                      | 传的是字符串快照，不是 getter                                 | `watch(() => route.params.id, ...)`                      |
| 14  | `keep-alive` 的 `include` **不生效**                          | 组件名与 `include` 不匹配（生产环境文件名被改写）             | `defineOptions({ name: 'ListView' })`（见 6.4）          |
| 15  | `keep-alive` 页面**定时器不停**、内存持续增长                 | 缓存组件不走 `onUnmounted`                                    | `onDeactivated` / `onActivated` 里暂停恢复               |
| 16  | 发版后点菜单报 **Loading chunk failed**                       | 旧 chunk 被新构建删除                                         | `router.onError` + 刷新 / 保留上一版本产物（见 5.6）     |
| 17  | `scrollBehavior` 写了但**页面不回到顶部**                     | 滚动发生在自定义容器，或返回了 `false` / Promise 提前 resolve | 自滚容器或 `afterEach` 处理（见 8.2）                    |
| 18  | `<Transition>` **没有过渡效果**                               | 路由组件多根节点（Fragment）                                  | 包一层单根容器，或去掉多根                               |
| 19  | 侧边栏一级菜单进详情页**不高亮**                              | `exact` / `exact-active-class` 用反了                         | 一级用前缀匹配，二级用 exact（见 4.1）                   |
| 20  | `router.currentRoute.params` 是 **undefined**（v4）           | `currentRoute` 是 ref                                         | `.currentRoute.value.params`                             |
| 21  | 中英文参数跳转后变成 `%252F`                                  | 自己又 `encodeURIComponent` 了一次                            | 路由层已编码，不要重复编（见 3.2）                       |
| 22  | `push` 后立刻读路由**拿到旧值**                               | 导航是异步的                                                  | `await router.push(...)`（见 4.2）                       |
| 23  | 两个 `push` 抢跑，**前一个的后续逻辑仍在执行**（`cancelled`） | 导航被新导航取消，但 `await` 返回                             | 判断 `isNavigationFailure` 后再继续（见 5.7）            |
| 24  | 同名路由 `addRoute` 后**旧页面被替换**                        | 同名会被覆盖或移除                                            | 用 `hasRoute` 判重，命名保证唯一（见 7.1）               |
| 25  | 外链用 `RouterLink` 打开后**新窗口能操作原页面**              | 缺 `rel="noopener"`                                           | 外链用 `<a target="_blank" rel="noopener noreferrer">`   |
| 26  | 401 后跳登录，登录成功**返回键又回登录页**                    | 用 `push` 跳登录                                              | 守卫返回地址（replace 语义）/ 登录成功用 `replace`       |

---

## 十三、最佳实践清单与 FAQ

### 13.1 上线前自查清单

- [ ] 二级路径**直接粘贴访问 + F5 刷新**均正常（history 回退已配）。
- [ ] 子路径部署时 `base`（构建 / 路由 / 服务器）三处一致。
- [ ] 所有详情页都覆盖了「参数变化」场景（`watch` 或 `onBeforeRouteUpdate`）。
- [ ] 所有跳转参数用 `name` + `params`，没有 `path` + `params` 的写法。
- [ ] 守卫分支全部有返回值 / `next()`，无重复调用，重定向排除自身。
- [ ] 动态路由刷新可恢复，退出登录清理干净。
- [ ] `keep-alive` 的 `include` 与组件名一致，缓存页的定时器已暂停。
- [ ] `router.onError` 兜住了 chunk 加载失败。
- [ ] 懒加载生效：首屏主包里没有各业务页面。
- [ ] 404 兜底路由存在且能命中任意乱路径。
- [ ] 页面标题随路由更新，焦点在切换后回到内容区。
- [ ] 权限只做「看得见」，接口鉴权在服务端。

### 13.2 编码约定（团队可直接抄）

1. 路由文件按模块拆分，`router/index.ts` 只做组装与全局配置。
2. 路由 `name` 用「模块-动作」形式（`user-detail`、`order-list`），全局唯一。
3. 组件内**不直接使用 `this.$route` 拼接业务逻辑**，优先 `props` 函数传入。
4. 编程式导航一律 `await`，需要中断逻辑时先判断 `NavigationFailure`。
5. 守卫只做「判断 + 重定向 + 必要的用户态加载」，业务请求放组件或 store。
6. 不在组件里注册全局守卫；组件级逻辑用组合式守卫。
7. `scrollBehavior` 与布局的滚动容器必须对齐（谁滚就滚谁）。

### 13.3 FAQ

**Q1：为什么 `vite dev` 正常，打包部署后刷新就 404？**
history 模式需要服务端把未知路径回退到 `index.html`，dev server 内置了该行为，生产环境要自己配（见 2.2）。

**Q2：`router.push` 之后 `route` 为什么没变？**
导航是异步的（守卫 → 解析组件 → 确认）。`await router.push(...)` 或 `await nextTick()` 后再读。

**Q3：`keep-alive` 加了但页面状态还是丢了？**
九成是组件名与 `include` 不匹配（生产环境文件名被压缩）。显式 `defineOptions({ name })`；另外检查是否给 `RouterView` 加了会变化的 `key`。

**Q4：动态路由为什么刷新就 404？**
动态路由只存在内存里，刷新后 matcher 重建。需在守卫里重新 `addRoute`，并 `return to.fullPath` 触发重新匹配（见 7.3）。

**Q5：`beforeEnter` 写了，为什么切换同一个路由的不同 id 不校验？**
`beforeEnter` 只在该**路由记录**被进入时触发，同一记录内参数变化不算「进入」。用 `onBeforeRouteUpdate`。

**Q6：如何让 `/a/1` 和 `/a/2` 彻底重建组件？**
`<RouterView :key="route.fullPath" />`（或 `:key="route.path"`），代价是状态与动画都会重置。

**Q7：hash 模式能不能用锚点跳转？**
很别扭：`#` 已被路由占用。需要页内锚点时优先选 history 模式，并让 `scrollBehavior` 处理 `to.hash`。

**Q8：多个 `<RouterView>` 怎么用？**
命名视图：路由里写 `components: { default, sidebar }`，模板里 `<RouterView name="sidebar" />`；嵌套路由用的是「父组件里再放一个 `<RouterView>`」，两者不要混淆。

**Q9：微前端里子应用路由要注意什么？**
子应用 base 用主应用分配的路径前缀；子应用卸载时移除 `popstate` 监听、清理注册的守卫；避免两个应用同时响应同一个历史事件。

**Q10：路由守卫能替代接口鉴权吗？**
不能。守卫在浏览器执行，可被绕过；接口必须服务端鉴权，前端路由只负责「不给入口」。

### 13.4 延伸阅读

- 路由基础写法速查：[Vue 开发规范 · 第 13 章 路由（Vue Router 3 vs 4）](/frameworks/vue/)
- 页面渲染与组件复用：[Vue 开发规范 · 第 12 章 内置组件](/frameworks/vue/)
- 状态管理与登录态：[Vue 开发规范 · 第 14 章 状态管理（Vuex vs Pinia）](/frameworks/vue/)
- 前端路由与后端路由的历史与原理：[浏览器核心知识手册](/fundamentals/browser/)
- SPA 的 SEO 限制与预渲染：[SEO 全流程知识手册](/fundamentals/seo/)
