# JavaScript 知识点指南

> 一份「有方向、有深度」的 JS 指南。
>
> - **入门者**：先读「学习地图」与每一章的「一句话定位」，快速建立全局体系。
> - **进阶者**：直接跳到「避坑 / 注意 / 规范」标注的段落，用于查漏补缺、统一团队编码标准。
>
> 参考：MDN JavaScript、javascript.js.cn、现代 JavaScript 教程（tutorial.javascript.ac.cn）。

---

## 目录

1. [学习地图：JS 的全貌](#1-学习地图js-的全貌)
2. [值与类型：一切皆值](#2-值与类型一切皆值)
3. [执行模型：作用域 / 闭包 / this / 原型](#3-执行模型作用域--闭包--this--原型)
4. [异步：事件循环与 Promise](#4-异步事件循环与-promise)
5. [函数式与模块化](#5-函数式与模块化)
6. [内存、GC 与泄露](#6-内存gc-与泄露)
7. [浏览器与环境 API](#7-浏览器与环境-api)
8. [现代语法与版本演进（ES2015 → ES2024）](#8-现代语法与版本演进es2015--es2024)
9. [工程化：模块、构建、TypeScript](#9-工程化模块构建typescript)
10. [常见坑点与陷阱清单](#10-常见坑点与陷阱清单)
11. [编码规范与命名](#11-编码规范与命名)
12. [性能优化清单](#12-性能优化清单)
13. [查漏补缺：进阶必懂清单](#13-查漏补缺进阶必懂清单)
14. [高级前端工程师知识体系（JS 视角）](#14-高级前端工程师知识体系js-视角)
15. [高级工程师盲点清单](#15-高级工程师盲点清单)
16. [自检：Senior 级自测题](#16-自检senior-级自测题)
17. [推荐资源](#17-推荐资源)

---

## 1. 学习地图：JS 的全貌

一句话定位：**JavaScript 是一门单线程、基于原型、运行时弱类型、异步非阻塞的脚本语言；其能力由「宿主环境」（浏览器 / Node / Deno / Bun）提供。**

```
JS 全貌
├─ 语言核心（ECMAScript 标准）
│  ├─ 语法与类型         let/const、原始类型、对象、Symbol、BigInt
│  ├─ 执行模型           作用域、闭包、this、原型链、类
│  ├─ 异步模型           事件循环、宏任务/微任务、Promise、async/await
│  └─ 现代特性           Proxy/Reflect、迭代器、生成器、可选链、空值合并
├─ 宿主环境 API（非语言本身）
│  ├─ 浏览器             DOM、BOM、Fetch、Canvas、Web Worker、Storage
│  ├─ Node.js/Deno/Bun   fs、net、process、crypto、child_process
│  └─ 跨端               小程序/WebView/IoT 等各自宿主
└─ 工程生态
   ├─ 模块系统           ESM（推荐）/ CommonJS（Node 遗留）
   ├─ 构建工具           Vite / esbuild / webpack / tsc
   └─ 类型层             TypeScript / JSDoc
```

**方向性建议**

- 入门：先把「类型、作用域/闭包、原型、事件循环、Promise」五个支柱吃透，其余都是在这之上的扩展。
- 进阶：理解「语言核心」与「宿主 API」的边界——很多你以为的「JS 能力」其实来自宿主（例如 `fetch`、`localStorage` 在纯 JS 运行时里并不存在）。

---

## 2. 值与类型：一切皆值

一句话定位：**JS 的值分「原始类型（不可变、按值比较）」与「对象类型（可变、按引用比较）」两类。**

### 原始类型（7 种）

`undefined`、`null`、`boolean`、`number`、`string`、`symbol`、`bigint`

注意：`symbol`/`bigint` 不能用 `new` 构造（否则报错）；`typeof null === 'object'` 是历史 Bug，判断空值用 `x == null`（同时匹配 `null`/`undefined`）。

### 对象类型

`Object`、`Array`、`Function`、`Date`、`Map`、`Set`、`RegExp`、`TypedArray`、以及用户自定义对象/类实例。

### 必懂要点

- **动态类型 ≠ 无类型**：类型在运行时确定，变量本身无类型，值才有类型。
- **相等比较**：
  - `==` 会做隐式类型转换（坑多），**除「判空 `== null`」外，一律用 `===`**。
  - `NaN === NaN` 为 `false`，用 `Number.isNaN()` 判断；`Object.is(-0, +0)` 为 `false`，比 `===` 更严格。
- **数字**：IEEE-754 双精度，存在 `0.1 + 0.2 !== 0.3`；大整数用 `BigInt`（后缀 `n`）；位运算一律转 32 位有符号整数。
- **不可变 vs 引用**：
  ```js
  const a = { n: 1 };
  const b = a;
  b.n = 2; // a.n 也变成 2（同一引用）
  const c = { ...a }; // 浅拷贝，仅第一层独立
  ```
- **结构化克隆**：`structuredClone()`（现代浏览器/Node 17+）做深拷贝；`JSON.parse(JSON.stringify())` 会丢 `undefined`/函数/`Symbol`/循环引用，切勿当通用深拷贝。

### 避坑

- 用 `Array.isArray(x)` 判数组，不要用 `typeof x === 'array'`（返回 `'object'`）。
- `typeof` 对未声明变量返回 `'undefined'` 而不报错；但对块级作用域 `let` 的暂时性死区（TDZ）变量访问会直接抛错。

---

## 3. 执行模型：作用域 / 闭包 / this / 原型

一句话定位：**JS 用「词法作用域 + 原型链」两条链决定「变量从哪来、方法从哪来」；用「闭包」让函数记住定义时的环境；用 `this` 指代调用上下文。**

### 3.1 作用域与提升

- `var`：函数作用域 + 变量提升（初始化为 `undefined`）。
- `let`/`const`：块级作用域 + 提升但处于 **TDZ（暂时性死区）**，访问即报错。
- **函数声明**整体提升；**函数表达式/`class`/`let/const`** 只提升声明不提升初始化。

### 3.2 闭包（Closure）

函数与其词法环境的组合；内层函数持有外层变量引用，外层作用域不会被回收。

```js
function makeCounter() {
  let n = 0;
  return () => ++n; // 记住 n
}
```

**方向**：闭包是实现「私有变量、柯里化、模块、事件回调、防抖节流」的基石。
**避坑**：闭包持有大对象会阻止 GC（常见内存泄漏来源）——不需要时手动置 `null`。

### 3.3 this（最难也最常被问）

`this` 的值 **由调用方式决定，而非定义位置**：

- 普通函数调用（非严格）→ `window`/`globalThis`；严格模式 → `undefined`。
- 方法调用 `obj.fn()` → `obj`。
- `call/apply/bind` → 显式指定。
- `new Fn()` → 新对象。
- 箭头函数 → **无自己的 this**，继承外层词法 `this`（不能作构造函数）。

**方向**：优先用箭头函数处理回调里的 `this`；需要动态 `this` 时用普通函数或显式 `bind`。

### 3.4 原型与原型链

- 每个对象有内部 `[[Prototype]]`（访问用 `Object.getPrototypeOf` / `__proto__`）。
- 属性查找：对象自身 → 沿原型链向上，直到 `null`。
- `class` 是「基于原型的语法糖」，并非真正的类继承（无副本，仍是链接）。

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return this.name;
};
class Dog extends Animal {
  bark() {
    return "woof";
  }
}
```

**避坑**：

- 不要在实例上「逐个挂方法」——方法应放在原型/`class` 上，否则每个实例都复制一份。
- `for...in` 会遍历原型链上的可枚举属性，遍历对象用 `Object.keys()` / `Object.entries()`；检查自有属性用 `Object.hasOwn(obj, key)`（替代已废弃的 `hasOwnProperty.call`）。

### 3.5 类的现代写法注意

- 类字段（class fields）是「实例自有属性」，写在原型字段外；注意公有/私有字段（`#name` 真私有，编译期不可外部访问）。
- 静态字段/方法用 `static`。
- `extends` 后子类构造函数**必须先 `super()`** 才能用 `this`，否则 TDZ 报错。

---

## 4. 异步：事件循环与 Promise

一句话定位：**JS 单线程，靠「事件循环 + 任务队列」实现并发；理解宏任务/微任务顺序，是规避绝大多数异步 Bug 的关键。**

### 4.1 事件循环（Event Loop）

```
同步代码（调用栈）
  → 清空所有 微任务（microtask：Promise.then / queueMicrotask / MutationObserver）
  → 取一个 宏任务（macrotask：setTimeout / setInterval / I/O / UI 渲染 / requestAnimationFrame）
  → 再清空微任务 → 再取宏任务 ……
```

**关键规则**：每个宏任务执行后，会先把当前所有微任务清空，才进入下一个宏任务。

### 4.2 Promise

- 三态：`pending → fulfilled / rejected`，状态不可逆。
- `.then/.catch/.finally` 返回新 Promise（可链式）。
- **永远 `return` 或 `throw`**，否则链路中断且错误被吞。
- `Promise` 一旦 settle，`.then` 回调是微任务。
- 静态方法：`Promise.all`（一拒全拒）、`Promise.allSettled`（拿到全部结果，不拒）、`Promise.race`（谁先 settle）、`Promise.any`（谁先成功）。

### 4.3 async / await

- `async` 函数永远返回 Promise；`await` 暂停函数、把后续包成微任务。
- `try/catch` 捕获 `await` 的 rejection（比 `.catch` 直观）。
- 循环里 `await` 是串行；需要并行用 `Promise.all([...map])`。

### 避坑（异步高频坑）

- `for` 循环里 `var i` + `setTimeout` 经典坑：闭包共享 `i` → 全部打印最后值；用 `let` 或传参解决。
- 忘记 `await`：函数「看起来返回了」实际返回 Promise，下游拿到的是 Promise 而非值。
- `Promise.all` 一个 reject 导致整体失败——需要「部分失败可容忍」时用 `allSettled`。
- 回调地狱：用 `async/await` 扁平化，而非层层嵌套。
- 微任务饥饿：在微任务里无限 `queueMicrotask` 会阻塞渲染（宏任务永远排不上）。
- `await null` / 非 Promise 会被 `Promise.resolve()` 包一层，仍是微任务，注意时序差异。

---

## 5. 函数式与模块化

### 5.1 函数是一等公民

函数可作参数、返回值、变量、对象属性。高阶函数（`map/filter/reduce`）、柯里化、组合是核心范式。

### 5.2 纯函数与不可变

- 纯函数：相同输入恒等输出、无副作用——易于测试与并发。
- 优先返回新对象而非修改入参：`arr.map(x => x*2)` 优于 `for` 里 push；用展开/`Object.assign`/`structuredClone` 控制变更。
- 避免「共享可变状态」——这是多数并发/异步 Bug 根源。

### 5.3 模块化（必懂）

- **ESM（推荐）**：`import` / `export`，静态、可被 Tree-Shaking、天然循环依赖更安全。
- **CommonJS（Node 遗留）**：`require` / `module.exports`，动态、运行时加载，不可被静态分析。
- 浏览器原生 ESM 用 `<script type="module">`；默认严格模式；跨域需 CORS。
- **方向**：新项目一律 ESM；`import` 静态写在顶层，不要写进 `if`；循环依赖用「延迟引用/注入」解耦。

---

## 6. 内存、GC 与泄露

一句话定位：**JS 用标记-清除 GC 自动回收；「内存泄漏」几乎都来自「本该释放的对象仍被引用」。**

### 常见泄漏源

1. **闭包持有大对象**未释放（见 3.2）。
2. **未清理的定时器/`EventListener`**：`setInterval` 忘了 `clearInterval`；组件卸载忘了 `removeEventListener`；SPA 路由切换尤其高发。
3. ** detached DOM**：从文档移除的 DOM 若仍被 JS 变量引用，无法回收。
4. **全局变量**累积（尤其非 `var/let/const` 直接赋值 `window.x = ...`）。
5. **缓存无限增长**：手写 Map/数组缓存不设上限 → 用 `WeakMap`/`WeakSet`（键为弱引用，键不可达即回收）或 LRU。

### 方向

- 用 `WeakMap` 做「对象 → 元数据」映射，避免阻止键对象回收。
- 组件/页面销毁时统一执行「清理函数」（`useEffect` 返回 cleanup、类组件 `destroy`）。
- 排查：DevTools Memory 面板拍 heap snapshot，对比找增长。

---

## 7. 浏览器与环境 API

> 注意：以下均属「宿主 API」，非语言核心。

### 7.1 DOM 与渲染

- 操作 DOM 昂贵：**批量读写**（先 `read` 再 `write`），避免 layout thrashing（读-写-读-写交替触发强制重排）。
- 用 `DocumentFragment` 或一次性 `innerHTML`/`replaceChildren` 批量插入。
- 事件委托：父节点监听、用 `event.target` 判断，减少监听器数量。
- `requestAnimationFrame` 用于动画/与帧对齐的 UI 更新；`requestIdleCallback` 做低优先级任务（兼容性一般，可降级 `setTimeout`）。

### 7.2 网络

- `fetch`：返回 Promise，默认 **不抛错于 HTTP 4xx/5xx**（需手动 `if(!res.ok) throw`），且默认不带 cookie（加 `credentials: 'include'`）。
- `fetch` 仅在**网络失败/跨域拦截**时 reject，业务错误要自己判断。
- 超时需自行用 `AbortController` + `setTimeout`（`fetch` 无原生 timeout）。
- `FormData` / `URLSearchParams` 构造请求体；`Blob`/`ArrayBuffer` 处理二进制。

### 7.3 存储

- `localStorage`：同步、~5MB、同源、字符串存储、无过期（手动管理）。
- `sessionStorage`：标签页级，关闭即清。
- `IndexedDB`：异步、容量大、结构化、支持事务（适合离线/大缓存）。
- `Cookie`：每次请求携带（有性能成本）、4KB、可设过期/HttpOnly/SameSite。
- **方向**：不在 `localStorage` 存敏感信息（XSS 可读）；大/结构化数据用 IndexedDB。

### 7.4 其他关键 API

- Web Worker / Service Worker：把重计算/网络代理移出主线程，避免卡 UI。
- `structuredClone`（深拷贝）、`crypto.getRandomValues`（安全随机数，替代 `Math.random` 用于令牌）。
- `IntersectionObserver` / `ResizeObserver`：替代轮询式的 scroll/resize 监听。

---

## 8. 现代语法与版本演进（ES2015 → ES2024）

> 方向：能用现代语法就用，可读性与安全性更好；但要确认目标运行环境支持（用 Babel/tsc 转译兜底）。

| 版本   | 必会特性 |
| ------ | --- |
| ES2015 | `let/const`、箭头函数、解构、`class`、`Promise`、模板字符串、`Map/Set`、模块化、`Symbol` |
| ES2016 | `Array.prototype.includes`、`**` 幂运算 |
| ES2017 | `async/await`、`Object.entries/values`、`padStart/padEnd` |
| ES2018 | 异步迭代 `for await`、对象/rest spread、`Promise.finally` |
| ES2019 | `Array.flat/flatMap`、`Object.fromEntries`、`trimStart/End`、可选 catch 绑定 |
| ES2020 | **可选链 `?.`**、**空值合并 `??`**、`BigInt`、`globalThis`、`Promise.allSettled`、`String.matchAll` |
| ES2021 | 逻辑赋值 `??= / \|\|= / &&=`、`String.replaceAll`、`WeakRef`/`FinalizationRegistry`、`Promise.any` |
| ES2022 | 类字段/`#` 私有、`static` 初始化块、`Object.hasOwn`、`at()`、`top-level await`（模块内）、`error.cause` |
| ES2023 | 数组 `findLast/findLastIndex`、`Array/TypedArray` 的 `toSorted/toReversed/toSpliced/with`（不改原数组）、`WeakMap` 支持 `Symbol` 键 |
| ES2024 | `Promise.withResolvers`、`Object.groupBy/Map.groupBy`、`Array.fromAsync`、正则 `v` 标志（unicodeSets）、`Atomics.waitAsync` |

### 两个最易被误用的现代特性

- **可选链 `?.`**：`a?.b?.c` 在任一环节为 `null/undefined` 时短路返回 `undefined`，不会抛错——但不要用它掩盖「本应存在的对象缺失」的逻辑错误。
- **空值合并 `??`**：仅当左侧为 `null/undefined` 才取右侧；**与 `||` 不同**（`0`/`''`/`false` 在 `??` 下被视为有效值）。不要混用：`a || b ?? c` 语法报错，需加括号。

---

## 9. 工程化：模块、构建、TypeScript

一句话定位：**现代 JS 项目的「可维护性」由工程化决定，而非语法本身。**

### 9.1 模块与打包

- 用 ESM；构建工具：**Vite（开发体验最佳，基于 esbuild/Rollup）**、**esbuild（极速）**、webpack（生态全但重）、`tsc`（类型检查/转译）。
- Tree-Shaking 依赖 ESM 静态结构 + `sideEffects: false` 声明。
- **方向**：把首屏重依赖（PDF/图表/编辑器）做「按需 `import()`」动态加载，避免拖慢首屏（黑屏/白屏常见根因）。

### 9.2 TypeScript

- 类型即文档，能在编译期拦截大量运行时错误。
- 严格模式（`strict: true`）必开：`noImplicitAny`、`strictNullChecks`（把 `null/undefined` 显式纳入类型，对应运行时 `Option→null` 的坑）。
- 优先用类型推导、精确联合类型、判别联合（discriminated unions）替代 `any`/`as`。
- **方向**：`any` 是技术债；万不得已用 `unknown` + 类型收窄，比 `any` 安全。

### 9.3 质量门禁

- Lint（ESLint）+ 格式化（Prettier）统一风格；`no-unused-vars`、`eqeqeq`、`no-floating-promises` 等规则防坑。
- 测试：Vitest/Jest（单元）+ Playwright（E2E）。
- 注意 `node_modules` 体积与「幽灵依赖」——用 pnpm 的严格 node-linker 更稳。

---

## 10. 常见坑点与陷阱清单

> 进阶者重点看这里，逐条对照自查。

1. **`==` 隐式转换**：`'' == 0` 为 `true`、`'0' == false` 为 `true`；一律 `===`（仅 `== null` 例外）。
2. **`typeof null === 'object'`**：判空用 `x == null`。
3. **浮点误差**：金额用整数分（cents）或 `BigInt`/`Decimal` 库，别直接用 `0.1+0.2` 比较。
4. **`parseInt` 的八进制坑**：`parseInt('08')` 在旧引擎为 `0`；始终传第二参基数 `parseInt(s, 10)`；或改用 `Number()`。
5. **`forEach` 无法 `break`**：需要中断用 `for...of` / `some` / `every`。
6. **`Array.prototype.sort` 默认按字符串**：`[10,2].sort()` → `[10,2]`；必须传比较器 `(a,b)=>a-b`。
7. **`map` 里用 `parseInt`**：`['1','2','3'].map(parseInt)` → `[1, NaN, NaN]`（因 `parseInt` 收到 index 作基数）；改 `[...].map(Number)`。
8. **变量提升/ TDZ**：在 `let/const/class` 声明前访问抛错。
9. **`this` 丢失**：回调/解构方法后 `this` 不再指向原对象 → 用箭头函数或 `bind`。
10. **忘记 `await` / 吞掉 Promise 错误**：未处理的 rejection 在 Node 会进程退出、浏览器报未捕获；加 `async` 却忘记 `await` 最隐蔽。
11. **定时器泄漏**：`setInterval` 不清理；SPA 路由切换未清除。
12. **`JSON` 序列化丢字段**：`undefined`/函数/`Symbol`/循环引用被忽略或报错；深拷贝别迷信它。
13. **大对象深拷贝性能**：`structuredClone` 大对象也慢，考虑按需更新而非整树克隆。
14. **`for...in` 遍历数组/原型**：数组用 `for...of` / `forEach`；对象遍历用 `Object.keys/entries`。
15. **事件监听器重复绑定**：每次渲染都 `addEventListener` 不移除 → 多次触发；用委托或 `AbortController` 一次性移除（`addEventListener(..., { signal })`）。
16. **`fetch` 的 4xx/5xx 不 reject**：业务错误需手动判断 `res.ok`。
17. **跨域/同源**：`localStorage`、`fetch`、`Cookie`、`postMessage` 都受同源/ CORS 约束。
18. **`Date` 月份从 0 开始**：`new Date(2024, 0, 1)` 是 1 月；`getMonth()` 返回 0–11。
19. **`JSON.parse` 无容错**：失败应 `try/catch`，不要裸调。
20. **严格相等与 `NaN`**：用 `Number.isNaN` / `Object.is`。

---

## 11. 编码规范与命名

> 目标：让代码「自解释、可协作、可维护」。

### 11.1 命名

- **变量/函数**：`camelCase`，动词+名词：`getUser`、`isVisible`、`formatPrice`。
- **类/构造器/类型/枚举**：`PascalCase`：`UserModel`、`HttpError`。
- **常量**：`UPPER_SNAKE_CASE`：`MAX_RETRY_COUNT`、`API_BASE_URL`。
- **布尔量**：加 `is`/`has`/`can`/`should` 前缀：`isLoading`、`hasError`、`canSubmit`。
- **私有**：约定前缀 `_`（社区习惯）或用真正的 `#` 私有字段（类内）；不要靠注释「假装私有」。
- **避免**：无意义名 `data`、`temp`、`obj`、`a/b/c`；拼音/中英混写；缩写歧义（`usr` 还是 `user`，统一）。
- **事件处理函数**：`on` 前缀或 `handle`：`onClick`、`handleSubmit`。
- **异步函数**：可加 `fetch/get` 区分，或保持动词即可（返回 Promise 本身已是契约），但**不要**用 `getXxxSync` 之类误导。

### 11.2 代码风格

- 用 `const` 优先，必须重新赋值的才 `let`，**禁止 `var`**。
- 优先 `===`；用 `?.` / `??` 替代脆弱的 `&&` 链式判空。
- 一行一职责；函数不超过 ~40 行，单一职责（SRP）。
- 复杂条件提前 `return`（卫语句），减少嵌套 `if` 金字塔。
- 用 `Object`/`Map` 替代长 `if-else` 映射表。
- 错误处理：不要空 `catch`；要么恢复、要么抛、要么记录；`try/catch` 范围尽量小。
- 注释：解释「为什么」而非「做了什么」；公共 API 用 JSDoc/`/** */` 标注类型与契约。
- 用 `switch`/`if` 时优先**早退出**；可枚举分支用对象映射比 `switch` 更易维护与 tree-shake。

### 11.3 约定俗成的最佳实践

- 配置/常量集中管理（如 `config.ts`），不要在多处硬编码魔法数字/字符串。
- 边界条件集中处理，避免在深层嵌套里散落校验。
- 模块导出「小而清晰」的 API；避免一个文件导出几十个互不相干的函数。
- 提交前过 Lint + 类型检查；把规则交给工具而非人脑。

---

## 12. 性能优化清单

1. **减少重排重绘**：批量 DOM 读写；用 `transform`/`opacity` 做动画（走合成层，不触发 layout）。
2. **防抖/节流**：`resize`/`scroll`/`input` 高频事件必加（`debounce`/`throttle`）。
3. **懒加载**：路由级 `import()`、图片 `loading="lazy"`、首屏外的重依赖延迟加载。
4. **避免闭包/大数组长期驻留**；事件与定时器及时清理。
5. **用高效数据结构**：查找多用 `Set`/`Map`（O(1)）替代数组 `includes/find`（O(n)）。
6. **Web Worker** 处理大计算，避免阻塞主线程（UI 卡顿/白屏主因之一）。
7. **`requestAnimationFrame`** 对齐帧渲染；避免 `setTimeout` 驱动动画。
8. **网络**：启用缓存与压缩、合并小请求、用 `AbortController` 取消离屏请求。
9. **内存**：用 `WeakMap`/`WeakSet` 与有限缓存；定期排查泄漏。
10. **首屏**：把重依赖（pdfjs/codemirror/图表）从入口静态 `import` 中剥离，按需 `import()`（否则入口 chunk 过大、甚至因模块初始化错误导致整窗黑屏）。

---

## 13. 查漏补缺：进阶必懂清单

> 自测：以下每点都应能讲清「是什么 + 为什么 + 坑在哪」。

- [ ] 事件循环中宏任务与微任务的执行顺序，能手工推演一段混合代码。
- [ ] `Promise` 的「值穿透」：`Promise.resolve(1).then(2).then(console.log)` 打印 1（非 2）。
- [ ] 迭代器协议（`Symbol.iterator`）与可迭代对象；`for...of` 原理。
- [ ] 生成器 `function*` / `yield` / `yield*` 与 `async function*`。
- [ ] `Proxy` / `Reflect`：响应式原理（Vue3 reactivity）、不可变包装、校验层。
- [ ] `WeakMap`/`WeakRef`/`FinalizationRegistry` 的弱引用语义与用途。
- [ ] `Symbol` 的用途：私有-ish 键、`Symbol.iterator`、`Symbol.toStringTag`、内置协作者。
- [ ] 继承链上 `instanceof` 与 `Symbol.hasInstance`；`Object.prototype.isPrototypeOf`。
- [ ] `Object.freeze`/`seal`/`preventExtensions` 的区别与「浅」冻结陷阱。
- [ ] 模块循环依赖在 ESM vs CJS 下的行为差异。
- [ ] `new` 操作符的完整执行步骤（创建对象 → 链接原型 → 绑定 this → 返回）。
- [ ] `call/apply/bind` 的实现原理与手写。
- [ ] 防抖/节流的两种实现及「前/后触发」「立即执行」变体。
- [ ] 如何用 `AbortController` 取消 `fetch`/事件。
- [ ] 严格模式（`'use strict'`）开启了哪些限制（无 `this` 绑定为 `undefined`、禁止八进制、禁止 `with` 等）。
- [ ] 跨 `iframe`/`Worker` 的 `postMessage` 与结构化克隆限制。
- [ ] 为什么 `JSON` 不能表示循环引用、`undefined`、函数、Symbol。
- [ ] SSR / 同构下「`window`/`document` 不存在」的处理。
- [ ] 源头区分「语言核心能力」与「宿主 API」——调试时少走弯路。

---

## 14. 高级前端工程师知识体系（JS 视角）

> 这一章回答「会写 JS」到「能驾驭大型前端系统」之间的差距。每个子主题都给出**底层原理 + 为什么重要 + 常见误用**。

### 14.1 浏览器渲染管线与关键渲染路径（CRP）
- 流程：HTML→DOM，CSS→CSSOM，合并→Render Tree→**Layout（重排）**→**Paint（重绘）**→**Composite（合成）**→显示。
- **重排（Reflow）**最贵（几何变化触发 Layout+Paint+Composite）；**重绘（Repaint）**次之（仅外观）；**合成（Composite）**最快（`transform`/`opacity`/`filter` 走 GPU 合成层，不触发 Layout/Paint）。
- **强制同步布局（Layout Thrashing）**：读取 `offsetHeight`/`getBoundingClientRect` 等几何属性会强制浏览器立即 flush 样式队列；读-写交替循环会被成倍放大开销。**先批量读，再批量写**。
- **层叠上下文（stacking context）**：`z-index`、`opacity<1`、`transform`、`will-change`、`position:fixed` 会创建新合成层；滥用 `will-change` 反而占满显存。
- **方向**：动画只用 `transform`/`opacity`；避免逐帧改 `top/left/width`；`will-change` 仅用于真正会变的属性且用后移除。

### 14.2 引擎内核：写「快 JS」的底层依据（以 V8 为例）
- **隐藏类（Hidden Class / Map）**：V8 为对象动态生成「形状」描述；属性增删**顺序一致**→复用同一隐藏类→属性访问经内联缓存接近 O(1)。运行时乱加属性/先建空对象再补字段会 **deopt（去优化）**。
- **内联缓存（Inline Cache）**：同一调用点类型稳定则快；多态/超态（每次传入不同类型）则慢。
- **JIT 分层**：Ignition（解释）+ TurboFan（优化编译）；类型假设失效会反优化回解释执行。
- **实践要点**：
  - 初始化时一次性定好对象形状（字段顺序固定），别运行时乱增删。
  - 函数参数保持类型稳定（别一个数一个字符串混传）。
  - 用 `obj.x = undefined` 置空替代 `delete obj.x`（`delete` 破坏隐藏类）。
  - 热路径避免频繁创建大对象/大数组字面量（加剧 GC 压力）。

### 14.3 安全：前端的第一责任
- **XSS**：反射/存储/DOM 型。防护——不把用户输入拼进 HTML（`innerHTML`、`dangerouslySetInnerHTML`）；用 `textContent`；必须渲染 HTML 时走 DOMPurify 净化；用 CSP 限制 `script-src`。
- **CSRF**：已登录态被诱导发请求。防护——`SameSite` Cookie（Lax/Strict）、CSRF Token、校验 `Origin`/`Referer`。
- **CORS**：跨域是浏览器施加的策略，服务端用响应头授权；`withCredentials` 时 `Access-Control-Allow-Origin` 不能为 `*`。区分「简单请求 vs 预检（OPTIONS）」。
- **CSP / SRI**：`Content-Security-Policy` 白名单收敛 XSS 面（避免 `unsafe-inline`）；CDN 脚本加 `integrity` + `crossorigin` 防篡改。
- **原型链污染（Prototype Pollution）**：`obj[a][b]=c` 当 `a==='__proto__'` 会污染所有对象原型。**深合并/深拷贝/解析不可信 JSON 时冻结 `__proto__`/`constructor`/`prototype`**。
- **供应链**：锁定版本、`npm audit`、警惕 `postinstall` 脚本、优先可信源。
- **敏感信息**：密钥/Token 别写进前端代码（会进产物）；鉴权 Token 优先 HttpOnly Cookie，避免被 XSS 读取。

### 14.4 网络与缓存：决定首屏与体验
- **HTTP 缓存**：`Cache-Control`（`max-age`/`no-cache`/`no-store`/`immutable`）、`ETag`/`Last-Modified` 协商缓存；理解「强缓存 vs 协商缓存」。
- **CDN 与指纹**：带 content-hash 的静态资源用 `immutable` 长缓存；HTML 用 `no-cache` 让发版即时生效。
- **HTTP/2 多路复用**：单连接并发，雪碧图/域名分片已无必要；注意应用层并发控制防队头阻塞。HTTP/3（QUIC，基于 UDP）抗丢包、0-RTT。
- **压缩**：gzip / brotli（文本 brotli 更优）；传输体积常比运行时解析更关键。
- **资源提示**：`preload`（关键资源高优先级）、`prefetch`（空闲预取下一页）、`preconnect`（提前建连）、`modulepreload`（ESM 依赖）。误用会抢首屏带宽。
- **Service Worker / PWA**：离线缓存、请求拦截；策略（cache-first/network-first/stale-while-revalidate）按资源类型区分。注意 SW 更新需 `skipWaiting`+`clients.claim` 或刷新策略，否则用户长期卡旧版。

### 14.5 性能度量：Core Web Vitals 与 RAIL
- **LCP**（最大内容渲染，<2.5s 优）：受图片/字体/服务器响应影响。
- **INP**（交互到下一帧，<200ms，已取代 FID）：与「长任务（Long Task >50ms）」强相关——用 `scheduler.yield()` / 分片 / Web Worker 拆分。
- **CLS**（累计布局偏移）：图片/广告/字体加载致跳动；用 `width/height` 或 `aspect-ratio` 预留空间，`font-display: swap` + `size-adjust` 防 FOIT/FOUT 抖动。
- **RAIL**：Response <100ms、Animation 16ms/帧、Idle <50ms 长任务、Load <1s 可交互。
- **Performance API**：`performance.now()`（亚毫秒、单调）、`mark/measure`、`Navigation Timing`（TTFB/DNS/TCP）、`Resource Timing`、`Long Tasks API`、`web-vitals` 库采集上报。
- **方向**：用真实用户监控（RUM）而非仅实验室测量；长任务拆分保流畅。

### 14.6 框架原理与常见误用（React / Vue 视角）
- **虚拟 DOM 与协调**：Diff 是 O(n) 启发式（同层、同 type）；`key` 必须稳定，用 index 作 key 会状态错乱。
- **React 渲染模型**：state 变化触发自身及子树重渲；`Context` 值变化使所有消费组件重渲→拆细 Context 或用选择器库。
- **Hooks 规则**：仅能在顶层调用（不能进 `if`/`for`）；依赖数组要全（`react-hooks/exhaustive-deps`）。
- **闭包陷阱（Stale Closure）**：事件回调捕获旧 state→用 `ref` 或把值放进依赖；这是高级 React 工程师最常见 Bug 源。
- **`useMemo`/`useCallback` 非银弹**：过度 memo 增加比较成本；仅在「引用稳定影响下游重渲/作为 effect 依赖」时才有意义。
- **并发特性**：`startTransition`/`useDeferredValue` 把非紧急更新降级保交互；`Suspense` 划分边界。
- **Vue 响应式**：`ref`/`reactive`（Proxy）；响应式丢失场景——解构丢失、直接替换数组索引/长度、Map/Set 需 reactive 包装；`shallowRef`/`markRaw` 优化。
- **SSR/SSG/CSR/水合（Hydration）**：水合 mismatch 根因多为「服务端/客户端环境差」（随机值、`Date.now()`、`window`）→用 `useEffect` 取随机值。
- **方向**：理解「框架在编译期/运行期分别做了什么」比背 API 更重要。

### 14.7 并发与多线程
- **Web Worker**：主线程外 JS 线程，**不能碰 DOM**；通信 `postMessage`（结构化克隆，大对象拷贝成本高）→用 `Transferable`（ArrayBuffer 转移所有权，零拷贝）。
- **SharedArrayBuffer + Atomics**：真正共享内存（需 COOP/COEP 跨源隔离头），用于高性能并行。
- **OffscreenCanvas**：Canvas 渲染移入 Worker，避免主线程卡顿。
- **方向**：计算密集（解析/加密/图像处理）丢给 Worker；警惕序列化开销抵消并行收益。

### 14.8 TypeScript 进阶（类型工程）
- 泛型+约束（`extends`）、条件类型（`T extends U ? X : Y`）、`infer` 推导、`keyof`/`typeof`/索引访问、映射类型、模板字面量类型。
- 工具类型：`Partial`/`Required`/`Pick`/`Omit`/`Record`/`ReturnType`/`Parameters`。
- 声明合并 / 模块增强（module augmentation）扩展第三方类型。
- 装饰器（TC39 Stage 3）：框架大量使用；注意与旧实验装饰器差异。
- `strict` 全家桶：`strictNullChecks` 治「`null` 当 `undefined`」、`noUncheckedIndexedAccess` 让数组索引返回 `T | undefined`（对应运行时越界）。
- **类型与运行时的鸿沟**：类型编译后被擦除，`instanceof`/运行时校验仍要自己写；用 **`zod`/`yup`** 做「边界校验」（API 入参、localStorage 反序列化），类型与运行时校验合一，**防「后端结构漂移导致前端崩溃」**。
- **方向**：用 `unknown` + 类型守卫收窄替代 `any`；`any` 是技术债。

### 14.9 设计模式与架构
- 高频实用：模块/单例（天然 ESM）、发布订阅（EventEmitter）、工厂、策略（映射表替代 if）、装饰器、命令、中介者（状态管理）、组合（UI 树）。
- **状态管理取舍**：局部 `useState`/`useReducer`；跨组件用 Context（别滥用）；全局复杂状态用 Redux/Zustand/Pinia——按「是否真需全局」「是否频繁变更」选型，避免把所有状态塞全局。
- **不可变更新**：用 Immer 减少手写展开；理解「引用相等」是渲染优化的基础。
- **单向数据流**：数据自上而下、事件自下而上，利于追踪与调试。

### 14.10 可观测性与错误处理
- **错误边界（Error Boundary）**：React 必须有根级 ErrorBoundary，否则单组件渲染抛错会整树卸载→整窗白/黑屏（见 §15 盲点）。Vue 用 `app.config.errorHandler` + `onErrorCaptured`。
- **全局捕获**：`window.onerror` / `unhandledrejection`；未捕获的 Promise rejection 必须兜底（防静默失败）。
- **Source Map**：生产保留 `.map`（妥善保管、勿泄露公网），错误栈才能还原源码行。
- **上报**：采样、去重、聚合；区分「首次加载失败（资源 404/网络）」与「运行时错误」。
- **方向**：把「静默全黑」变成「可见错误面板 + 可定位栈」是高级工程师基本功。

### 14.11 微前端与模块联邦（大型应用）
- 解决「多团队独立部署」：Module Federation（运行时共享依赖）、qiankun/无界（iframe/代理）。
- 难点：样式隔离、JS 沙箱、全局状态/路由协调、公共依赖去重（避免加载两份 React）。
- **方向**：先问「是否真需要微前端」；单体过早拆分是反模式。

### 14.12 无障碍（a11y）与 SEO
- 语义化 HTML（`<button>`/`<nav>`/`<main>`/`<label for>`）优于 `div+onClick`；可访问性内置且 SEO 友好。
- ARIA（`role`/`aria-*`）是补充非替代；键盘可达、焦点管理（Modal 焦点陷阱）、颜色对比度、尊重 `prefers-reduced-motion`。
- SEO：SSR/SSG、合理的标题层级、结构化数据；SPA 需预渲染或 SSR 才能被爬虫抓取。

---

## 15. 高级工程师盲点清单

> 这些是「会写但常踩、或根本没意识到的盲区」，逐条对照自查。

1. **后端结构漂移 → 前端崩溃**：后端返回 `null` 而非 `[]`，前端 `.length` 抛错整树卸载。防护——数组类返回一律 `Array.isArray(x) ? x : []` 兜底；用 `zod` 在边界校验。
2. **`Option<T>` → `null` 的判空**：消费 Rust/后端 `Option` 字段，序列化是 `null`；判空必须 `!= null`（同时兜 `null`/`undefined`），**不能只写 `!== undefined`**，否则 `null.toLowerCase()` 类错误崩溃。
3. **陈旧闭包（Stale Closure）**：回调/Effect 捕获旧 state，拿到过期值。用 `ref` 或把值放入依赖数组。
4. **`Promise` 吞错**：`.catch` 后未 `rethrow` 导致上游以为成功；`async` 函数忘记 `return`/`throw`。永远 `return` 或 `throw`。
5. **模块级副作用拖垮首屏**：在首屏静态导入页顶层 `import * as pdfjs from 'pdfjs-dist'` 等重依赖→入口 chunk 巨大、甚至模块初始化抛错→整窗黑屏。重依赖一律「用到才 `await import()`」。
6. **把不可信输入当 HTML 渲染**：XSS 头号来源。
7. **`localStorage` 存鉴权 Token / 大对象**：同步阻塞主线程、XSS 可读、大对象拖慢读取。
8. **误以为 `setTimeout(fn,0)` 立即执行**：最小延迟 4ms+，且受宏任务队列阻塞；`requestAnimationFrame` 在后台标签页被节流到 ~1fps。
9. **监听器/定时器/订阅未清理**：SPA 路由切换未 `removeEventListener`/`clearInterval`/取消订阅→内存泄漏 + 重复触发（高级工程师最常见隐患）。
10. **类数组误当数组**：`arguments`、NodeList、带 `length` 的对象不能直接解构/迭代；先 `Array.from`/`[...]`。
11. **`Proxy` 失真**：`Proxy` 包裹后 `typeof`/`instanceof` 可能失真，传给依赖这些判断的库会出错。
12. **微任务/宏任务时序误判**：`Promise.resolve().then` 先于 `setTimeout`；`await` 之后是「下一个微任务」而非同步。
13. **`Date` 时区陷阱**：`toISOString()` 是 UTC；`new Date('2024-01-01')` 按 UTC 0 点解析（东八区显示前一天）。用 `new Date(2024,0,1)` 或 luxon/day.js 显式时区。
14. **`Intl` 国际化手搓**：排序/日期/货币用 `Intl.Collator`/`DateTimeFormat`/`NumberFormat`，语言相关，别自写。
15. **过度 `any`/`as` 绕过类型**：埋雷；用 `unknown` + 收窄。
16. **生产残留 `console.log`**：泄露内部、影响性能。
17. **大列表不虚拟化**：万级数据直接 `map` 渲染卡死；用虚拟滚动（固定行高窗口化）。
18. **忽视 Source Map 与错误上报**：线上出问题无从定位。
19. **发布验证盲点**：改了 Rust/Go/新增文件却只重建了前端、或未带 `custom-protocol`/`embed` 就发布→整窗白屏；验证产物是否内嵌前端/是否含新绑定要用字节级检索。
20. **多实例/幽灵进程**：桌面端（Electron/Tauri）重复打开导致多图标/多进程；需单例锁 + 清理幽灵。
21. **忽视 a11y / 键盘可达 / `prefers-reduced-motion`**：不只是合规，是体验与法律风险的边界。
22. **`will-change`/`contain` 滥用**：合成层/包含块优化用错反而伤性能。

---

## 16. 自检：Senior 级自测题

> 能清晰讲出「是什么 + 为什么 + 坑在哪」即达标；讲不清的回到对应章节。

- [ ] 手写事件循环推演：混排 `console.log` / `setTimeout` / `Promise.then` / `queueMicrotask` / `async/await` 的执行顺序。
- [ ] 解释 `Promise.resolve(1).then(2).then(console.log)` 为何打印 `1`（值穿透）。
- [ ] 说清重排 / 重绘 / 合成的区别，并举例「哪些 CSS 属性只触发合成」。
- [ ] 解释 V8 隐藏类与内联缓存，给出「一个对象为何被去优化」的例子。
- [ ] 手写 `debounce`（带 `immediate`）与 `throttle`（leading/trailing），说明区别。
- [ ] 手写出一个 `new` 操作符 / `bind` / `call` 的实现。
- [ ] 解释 XSS/CSRF/CORS/CSP 的攻击面与防护，给出一个曾踩过的真实案例。
- [ ] 解释 `fetch` 的 4xx/5xx 不 reject、如何加超时（`AbortController`）与统一拦截。
- [ ] 说明 HTTP 强缓存 vs 协商缓存、CDN 指纹缓存策略、`preload`/`prefetch` 的取舍。
- [ ] 说清 LCP/INP/CLS 的含义与优化手段，以及如何用 `performance` API 测量长任务。
- [ ] 解释 React `key` 用 index 的后果、Context 导致的不必要重渲、陈旧闭包根因。
- [ ] 解释 Vue `reactive` 响应式丢失的常见场景（解构、索引赋值、Map/Set）。
- [ ] 说明 `Array.isArray(x) ? x : []` 兜底为何能防「后端返回 null 致整树崩溃」。
- [ ] 解释 `structuredClone` 与 `JSON` 深拷贝的边界、Transferable 零拷贝原理。
- [ ] 说明 `zod` 在「API 边界校验」中如何同时保证类型与运行时安全。
- [ ] 解释 ErrorBoundary 缺失时单组件抛错为何会「整窗白/黑屏」，以及根级兜底方案。
- [ ] 说清 SSR 水合 mismatch 的常见根因（`Date.now`/`window`/随机数）与修复。
- [ ] 解释 Module Federation / 微前端的依赖去重与样式隔离难点。

---

## 17. 推荐资源

- **MDN JavaScript**：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript —— 权威参考，每个 API 的浏览器兼容与示例最全。
- **javascript.js.cn**：https://javascript.js.cn/ —— 中文速查与概念梳理。
- **现代 JavaScript 教程**：https://tutorial.javascript.ac.cn/ —— 体系化、由浅入深，适合系统学习。
- **ECMAScript 规范（英文）**：https://tc39.es/ecma262/ —— 追本溯源看精确语义。
- **TypeScript 官方文档**：https://www.typescriptlang.org/docs/ —— 类型工程化。
- **进阶书单**：《JavaScript 高级程序设计（红宝书）》《你不知道的 JavaScript（上/中/下）》《JavaScript 设计模式与开发实践》《Web 性能权威指南》《高性能 JavaScript》。
- **引擎与原理**：V8 官方博客（v8.dev）、web.dev / web.dev/blog（Core Web Vitals、渲染优化）、React/Vue 官方文档的「高级指引 / 渲染机制」章节。
- **实践**：在浏览器 DevTools Console 逐条验证本指南中的代码片段；用 Performance / Memory / Lighthouse 面板实地测量，胜过只读不练。

---

> 使用建议：入门者按 `1 → 2 → 3 → 4` 顺序打地基，配合第 17 章资源练习；进阶者把第 10、11、12、13 章当作自查与团队规范基线；**高级/资深工程师**以第 14、15、16 章为能力地图，逐条对标、查漏补缺，并把第 15 章盲点清单纳入团队 Code Review 检查项。
