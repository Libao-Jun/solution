# JavaScript 知识点指南

> 一份「有方向、有深度」的 JS 指南。
>
> - **零基础**：先读第 18 章「入门补读：基础语法」，把「代码写在哪、怎么输出、变量怎么声明」跑通，再回头读「学习地图」。
> - **入门者**：先读「学习地图」与每一章的「一句话定位」，快速建立全局体系。
> - **进阶者**：直接跳到「避坑 / 注意 / 规范」标注的段落，用于查漏补缺、统一团队编码标准。
>
> 参考资料：
>
> - [MDN JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
> - [javascript.js.cn](https://javascript.js.cn/)
> - [现代 JavaScript 教程](https://tutorial.javascript.ac.cn/)
> - [WinDocs · JavaScript 基础知识](https://dongmeng22.github.io/docs/basics/javascript)
> - [ECMAScript 规范（英文）](https://tc39.es/ecma262/)

---

## 目录

1. [学习地图：JS 的全貌](#_1-学习地图-js-的全貌)
2. [值与类型：一切皆值](#_2-值与类型-一切皆值)
3. [执行模型：作用域 / 闭包 / this / 原型](#_3-执行模型-作用域-闭包-this-原型)
4. [异步：事件循环与 Promise](#_4-异步-事件循环与-promise)
5. [函数式与模块化](#_5-函数式与模块化)
6. [内存、GC 与泄露](#_6-内存、gc-与泄露)
7. [浏览器与环境 API](#_7-浏览器与环境-api)
8. [现代语法与版本演进（ES2015 → ES2024）](#_8-现代语法与版本演进-es2015-→-es2024)
9. [工程化：模块、构建、TypeScript](#_9-工程化-模块、构建、typescript)
10. [常见坑点与陷阱清单](#_10-常见坑点与陷阱清单)
11. [编码规范与命名](#_11-编码规范与命名)
12. [性能优化清单](#_12-性能优化清单)
13. [查漏补缺：进阶必懂清单](#_13-查漏补缺-进阶必懂清单)
14. [高级前端工程师知识体系（JS 视角）](#_14-高级前端工程师知识体系-js-视角)
15. [高级工程师盲点清单](#_15-高级工程师盲点清单)
16. [自检：Senior 级自测题](#_16-自检-senior-级自测题)
17. [推荐资源](#_17-推荐资源)
18. [入门补读：基础语法（引入方式 / 输出 / 书写规则 / 变量与字面量）](#_18-入门补读-基础语法-引入方式-输出-书写规则-变量与字面量)
19. [运算符与表达式](#_19-运算符与表达式)
20. [流程控制：分支、循环与跳转](#_20-流程控制-分支、循环与跳转)
21. [数组与字符串：常用方法全览](#_21-数组与字符串-常用方法全览)
22. [常用内置类：Math、Date、RegExp 与 Error](#_22-常用内置类-math、date、regexp-与-error)
23. [DOM：查询、增删改与事件](#_23-dom-查询、增删改与事件)
24. [BOM：window、location、history 与 navigator](#_24-bom-window、location、history-与-navigator)
25. [JSON：序列化与数据交换](#_25-json-序列化与数据交换)
26. [创建对象与继承：从工厂函数到 class](#_26-创建对象与继承-从工厂函数到-class)

---

## 1. 学习地图：JS 的全貌

一句话定位：**JavaScript 是一门单线程、基于原型、运行时弱类型、异步非阻塞的脚本语言；其能力由「宿主环境」（浏览器 / Node / Deno / Bun）提供。**

下面这张「全貌树」把 JS 的知识域按三级铺开（图示可拖拽平移、可缩放）：

<JsOverviewMap />

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
- 展开见 [微前端从入门到精通](/engineering/micro-frontend/)：方案对比、qiankun / 无界原理与落地清单。

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

- [**MDN JavaScript**](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript) —— 权威参考，每个 API 的浏览器兼容与示例最全。
- [**javascript.js.cn**](https://javascript.js.cn/) —— 中文速查与概念梳理。
- [**现代 JavaScript 教程**](https://tutorial.javascript.ac.cn/) —— 体系化、由浅入深，适合系统学习。
- [**ECMAScript 规范（英文）**](https://tc39.es/ecma262/) —— 追本溯源看精确语义。
- [**TypeScript 官方文档**](https://www.typescriptlang.org/docs/) —— 类型工程化。
- **进阶书单**：《JavaScript 高级程序设计（红宝书）》《你不知道的 JavaScript（上/中/下）》《JavaScript 设计模式与开发实践》《Web 性能权威指南》《高性能 JavaScript》。
- **引擎与原理**：V8 官方博客（v8.dev）、web.dev / web.dev/blog（Core Web Vitals、渲染优化）、React/Vue 官方文档的「高级指引 / 渲染机制」章节。
- **实践**：在浏览器 DevTools Console 逐条验证本指南中的代码片段；用 Performance / Memory / Lighthouse 面板实地测量，胜过只读不练。

---

## 18. 入门补读：基础语法（引入方式 / 输出 / 书写规则 / 变量与字面量）

一句话定位：**动手写第一行 JS 之前，先把四件事定下来——代码写在哪、怎么看到结果、书写规则是什么、值怎么存进变量。**

> 本章只覆盖「能跑起来」的最小闭环，刻意不涉及闭包 / 原型 / 异步等进阶主题（见第 3、4 章）。已经写过项目的读者可直接跳过。

### 18.1 代码写在哪：三种引入方式

| 方式         | 写法                                 | 特点                                       | 建议                 |
| ------------ | ------------------------------------ | ------------------------------------------ | -------------------- |
| 标签属性内联 | `<button onclick="fn()">`            | 结构与行为耦合、无法缓存、CSP 不友好       | 仅演示，生产禁用     |
| 内嵌脚本     | `<script> … </script>`               | 随文档一起传输、无法单独缓存与复用         | 只放首屏关键小段代码 |
| 外部脚本     | `<script src="app.js"></script>`     | 可缓存、可复用、便于维护与代码分割         | **推荐**             |

`javascript:` 伪协议（`<a href="javascript:void(0)">`）同属内联一类，现代开发一律改用事件监听：

```js
const btn = document.querySelector("#submit");
btn.addEventListener("click", () => {
  // 处理点击
});
```

**外链脚本的两条硬规则**：

1. 写了 `src` 的 `script` **不能再写内容**，标签体内的代码会被直接忽略；两种都要用就写两个 `script` 标签。
2. 外链脚本默认**阻塞 HTML 解析**（见 7.1 渲染管线的第 1 步），`defer` / `async` 就是为解除阻塞而生的两个属性。

| 写法             | 下载             | 执行时机                                   | 多脚本顺序     | 适用场景                 |
| ---------------- | ---------------- | ------------------------------------------ | -------------- | ------------------------ |
| 无（默认）       | 同步、阻塞解析   | 下载完立即执行                             | 按文档顺序     | 极少使用                 |
| `async`          | 并行、不阻塞     | 下载完立即执行（可能在 `DOMContentLoaded` 前或后） | **不确定**     | 独立脚本（统计、广告）   |
| `defer`          | 并行、不阻塞     | 文档解析完成后、`DOMContentLoaded` 之前    | **按文档顺序** | 业务脚本（推荐）         |
| `type="module"`  | 并行、不阻塞     | 默认 `defer` 语义                          | 按文档顺序     | ESM 模块                 |

```html
<!-- 两个都可用：互不干扰 -->
<script src="analytics.js" async></script>
<script src="app.js" defer></script>
```

> 放在「`head` + `defer`」和放在「`body` 末尾」，效果基本相同；前者更利于「结构顺序 = 加载顺序」的可读性。完整专题（动态注入、`nomodule`、模块预加载）见 [脚本 Script 加载与执行指南](/fundamentals/script/)。

### 18.2 三种输出方式

| 写法                 | 输出位置                  | 说明                                             |
| -------------------- | ------------------------- | ------------------------------------------------ |
| `alert(msg)`         | 浏览器弹窗                | 会阻塞主线程，仅适合演示                         |
| `document.write(msg)` | 写入文档流（`body`）      | **文档解析完成后再调用会清空整页**，生产禁用     |
| `console.log(msg)`   | 开发者工具 Console 面板   | 日常调试首选                                     |

```js
alert("要输出的内容");
document.write("要输出的内容");
console.log("要输出的内容");
```

**避坑**：

- `document.write` 只在**解析阶段**（内嵌脚本同步写入）相对安全；页面加载完成后调用会隐式执行 `document.open()`，把整个文档替换掉。
- 调试优先用 `console` 家族：`console.table()` 打印数组 / 对象表格、`console.dir()` 查看对象结构、`console.warn()` / `console.error()` 分级、`console.count()` 计数、`console.time()` / `console.timeEnd()` 测耗时、`console.trace()` 打印调用栈。
- 上线前移除 `console.log`（见第 15 章盲点清单第 16 条）。

### 18.3 基础书写规则

| 规则                 | 说明                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| 语句以分号 `;` 结尾  | 不写时靠 **ASI（Automatic Semicolon Insertion，自动分号插入）** 补齐；ASI 经常补错，团队规范一律显式写分号 |
| 严格区分大小写       | `myVar` 与 `myvar` 是两个不同的标识符                                                       |
| 忽略多余空格与换行   | 可自由换行缩进做格式化（交给 Prettier 之类的工具统一）                                      |
| 注释                 | `// 单行注释` 与 `/* 多行注释 */`；不要用注释「注释掉」大段代码，删掉交给 git 即可            |
| 字符串引号           | 单引号 / 双引号等价；模板字符串（反引号）支持 `${}` 插值与换行                              |
| 代码块用 `{}` 包裹   | 缩进 2 空格或 4 空格，团队统一即可                                                          |

**函数声明与函数表达式的分号差异**：

```js
function functionName(arg0, arg1) {
  // 函数声明：末尾不加分号
}

const anotherName = function (arg0, arg1) {
  // 函数表达式：属于赋值语句，末尾必须加分号
};
```

**ASI 的三个经典反例**（这正是不写分号最容易踩的坑）：

```js
// 1. return 后换行：ASI 会补上分号 → 实际返回 undefined
function bad() {
  return
  { ok: true };
}

// 2. 上一行是表达式、下一行以 ( 开头：两行被合并成一次函数调用
const a = b
(function () {})() // 实际解析为 const a = b(function () {})() → 通常直接报错

// 3. 上一行是表达式、下一行以 [ 开头：两行被合并成一次属性访问
const c = d
[1, 2].forEach(() => {}) // 实际解析为 const c = d[1, 2].forEach(...)
```

严格模式（`'use strict'`）：在脚本或函数顶部写上 `"use strict";` 即开启严格解析——未声明变量赋值报错、函数中的 `this` 不再默认指向 `globalThis`、禁止 `with` 等（详见第 13 章）。**ESM 模块内部与 `class` 内部默认就是严格模式**，无需手动声明。

### 18.4 字面量与变量

| 概念             | 说明                                       | 示例                                                              |
| ---------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| 字面量（literal） | 直接写在代码里的**固定值**，本身不可改变   | `1`、`3.14`、`"hello"`、`true`、`null`、`NaN`、`[1, 2]`、`{ n: 1 }` |
| 变量（variable）  | 保存字面量的**具名容器**，值可以随时替换   | `let count = 1;`                                                  |

字面量没有语义，所以实践中几乎总是「把字面量交给变量，再用变量参与运算」：

```js
let total; // 1) 只声明，值为 undefined
total = 0; // 2) 再赋值
let price = 9.9; // 3) 声明的同时赋值
```

| 声明方式 | 作用域       | 提升行为                            | 可重复声明 | 可重新赋值 |
| -------- | ------------ | ----------------------------------- | ---------- | ---------- |
| `var`    | 函数作用域   | 提升并初始化为 `undefined`          | 可以       | 可以       |
| `let`    | 块级作用域   | 提升但处于 TDZ（暂时性死区），访问报错 | 不可以     | 可以       |
| `const`  | 块级作用域   | 同 `let`                            | 不可以     | 不可以     |

**避坑**：

- `const` 约束的是**绑定**，不是内容：`const arr = []; arr.push(1);` 合法（数组本身被修改），而 `arr = [];` 报错。
- 只声明不赋值时三者都是 `undefined`，`let a; a // undefined`。
- 现代代码默认用 `const`，确实需要重新赋值才降级为 `let`，**不要用 `var`**（原因见 3.1 作用域与提升）。

### 18.5 标识符（命名）四条规范

标识符（identifier）即「代码里可以自己命名的部分」：变量名、函数名、参数名、类名、属性名。

1. 只能由字母、数字、下划线 `_`、美元符号 `$` 组成（Unicode 字母也合法，但不推荐中文命名）。
2. **不能以数字开头**：`1a` 非法。
3. 不能是**关键字 / 保留字**：`class`、`return`、`if`、`typeof` 等（完整清单见 MDN 的[词法语法 · 关键字](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar#%E5%85%B3%E9%94%AE%E5%AD%97)）。
4. 命名风格：变量 / 函数用小驼峰 `camelCase`，类 / 构造函数用大驼峰 `PascalCase`，常量用 `UPPER_SNAKE_CASE`，布尔量加 `is` / `has` / `can` 前缀。

```js
const MAX_RETRY_COUNT = 3; // 常量
let isLoading = false; // 布尔量
function formatPrice(value) {} // 动词 + 名词
class HttpClient {} // 类名用 PascalCase
```

> 命名的完整规范（私有字段 `#name`、事件处理函数 `onXxx` / `handleXxx`、避免 `data` / `temp` 之类无意义名）见第 11 章「编码规范与命名」。

---

## 19. 运算符与表达式

一句话定位：**运算符决定「值怎么算」，而优先级与隐式转换决定「算出来是什么」——重灾区是 `+`、`==` 与 `&&` / `||` 的返回值。**

### 19.1 运算符分类与优先级

| 类别     | 运算符                                              | 说明                                 |
| -------- | --------------------------------------------------- | ------------------------------------ |
| 算术     | `+ - * / % ** ++ --`                                | `%` 是取余（结果符号随被除数）       |
| 比较     | `> < >= <= == != === !==`                           | 一律优先 `===`                       |
| 逻辑     | `&& \|\| ! ??`                                      | 短路求值、返回操作数                 |
| 位运算   | `& \| ^ ~ << >> >>>`                                | 先转 32 位有符号整数                 |
| 赋值     | `= += -= *= /= %= **= &&= \|\|= ??=`                | 逻辑赋值等价于「条件成立才赋值」     |
| 三元     | `cond ? a : b`                                      | 只有「二选一」才用，嵌套改 `if`      |
| 其他     | `?.` `??` `typeof` `instanceof` `in` `delete` `void` | `delete` 只用于对象属性              |

优先级要点（不必背全表，记住这几条即可）：

- `**` 是**右结合**：`2 ** 3 ** 2` 等于 `2 ** 9 = 512`；且一元负号不能直接作用于它——`-2 ** 2` 语法报错，需写成 `-(2 ** 2)`。
- 一元高于二元：`!a && b` 等价于 `(!a) && b`。
- 同级算术**左结合**：`a - b - c` 等价于 `(a - b) - c`。
- 位运算优先级**低于**比较：`a & b === c` 实际是 `a & (b === c)`，这是老代码里最常见的错算。
- `??` **不能与 `&&` / `||` 直接混用**（`a || b ?? c` 语法报错），必须加括号。
- 拿不准就加括号——可读性成本远低于排错成本。

### 19.2 隐式类型转换的三条规则

- **`+` 双面性**：只要任一侧是字符串（或对象转原始值是字符串）就走拼接——`1 + '2'` 得 `'12'`，`1 + 2 + '3'` 得 `'33'`，`'1' + 2 + 3` 得 `'123'`。
- **其他算术/比较先转数字**：`'6' / '2'` 得 `3`、`'abc' - 1` 得 `NaN`、`[] - 1` 得 `-1`。
- **对象转原始值**：按提示类型依次调用 `Symbol.toPrimitive` → `valueOf` → `toString`（`[]` 转 `''`、`{}` 转 `'[object Object]'`）。
- **`==` 是重灾区**：`null == undefined` 为真且**只互相相等**；而 `'' == 0`、`'0' == false`、`[] == false`、`[1] == 1` 全部为 `true`。除「判空 `x == null`」外一律用 `===`。
- **别依赖语法位置差异**：`{} + []` 写在语句首行会被解析为「代码块 + 一元 `+`」（结果 `0`），写进表达式则得 `'[object Object]'`——同一串字符结果不同，属于必须规避的写法。

### 19.3 短路：逻辑运算符返回的是「值」不是「布尔」

- `a && b`：`a` 为假值直接返回 `a`，否则返回 `b`。
- `a || b`：`a` 为真值直接返回 `a`，否则返回 `b`。
- `a ?? b`：**仅当** `a` 为 `null` / `undefined` 才返回 `b`——`0` / `''` / `false` / `NaN` 都算有效值。

```js
const input = "";
const a = input || "匿名"; // "匿名"（0 / '' 也会误落默认值）
const b = input ?? "匿名"; // ""（只有 null / undefined 才回落）
```

- 守卫式短路：`isReady && start()`、`foo && foo.bar?.()`（替代嵌套 `if`）。
- `&&` / `||` 的返回值是操作数本身，**语义上不等于布尔**；需要布尔就用 `!!x` 或 `Boolean(x)`（TypeScript 下能避免返回联合类型）。
- 逻辑赋值是「用结果回写」的语法糖：`a ||= b` 等价 `a || (a = b)`；`a &&= b`、`a ??= b` 同理。

### 19.4 位运算的实用场景

- 位运算会先把操作数转成 **32 位有符号整数**：`1 << 31` 是负数，`>>>`（无符号右移）才能得到正数；`~x` 等价 `-(x + 1)`。
- 常用技巧：`~~x` 快速取整（大数失真，超 2^31 别用）、`x & 1` 判奇偶、`x << 1` 乘 2、`x >> 1` 除 2 取整。
- **别把 `|` 当默认值**：`a | 0` 是取整不是兜底；默认值用 `??`。
- `BigInt` 与 `number` **不能混用于算术**（抛 `TypeError`），位运算要写成 `1n << 40n`。

### 避坑

- `a < b < c` 不是数学区间：等价 `(a < b) < c`，布尔值参与比较结果恒为 `false`，应写 `a < b && b < c`。
- `NaN` 与任何值比较（含自身）都为 `false`，判 NaN 用 `Number.isNaN`。
- `new Boolean(false)` 是对象，**恒为真**；包装对象（`new Number/String/Boolean`）几乎不用。
- 自增前缀/后缀语义不同：`++i` 先加后用、`i++` 先用后加，混进复杂表达式极易出错——拆成两行。
- 逗号运算符 `,` 会「丢弃前面的值」，只在极少数紧凑写法里出现，业务代码禁用。

---

## 20. 流程控制：分支、循环与跳转

一句话定位：**分支与循环本身不难，难的是「什么场景用哪种」，以及 `for` 家族在闭包与异步下的差异。**

### 20.1 分支

- **真假值表**：`false`、`0`、`-0`、`0n`、`''`、`null`、`undefined`、`NaN` 为假，**其余全真**——`[]`、`{}`、`'0'`、`' '` 都是真值。
- `if` / `else if`：从最可能命中的条件往下写；多层嵌套用**卫语句**提前 `return` 拉平：

```js
function pay(order) {
  if (!order) return; // 卫语句：先挡掉异常输入
  if (order.paid) return;
  // 主流程保持在同一缩进层级
}
```

- `switch` 用 **`===` 严格比较**（不做隐式转换），因此 `switch ('1')` 不会命中 `case 1`。
- `switch` **必须 `break` / `return`**，否则会「贯穿」执行后续 `case`；有意贯穿要写注释声明。
- `switch (true)` 技巧：把区间条件写进 `case`，可替代长 `else if` 链：

```js
switch (true) {
  case score >= 90:
    return "A";
  case score >= 60:
    return "B";
  default:
    return "C";
}
```

- 二选一用三元表达式；分支超过两类改用 `if`、映射表（对象 / `Map`）或策略函数，不要嵌套三元。

### 20.2 循环家族对照

| 写法                   | 适用对象                                   | 拿到的值       | 能否 `break` / `continue` |
| ---------------------- | ------------------------------------------ | -------------- | ------------------------- |
| `for (let i = 0; …)`   | 需要索引 / 步长 / 倒序遍历                  | 索引           | ✅                         |
| `for...of`             | 可迭代对象（数组 / 字符串 / `Map` / `Set` / 生成器） | 元素值 | ✅                         |
| `for...in`             | 对象的可枚举键（**含原型链上的键**）         | 字符串键       | ✅                         |
| `Array.prototype.forEach` | 遍历执行副作用                           | 元素值         | ❌ 无法中断                |
| `while` / `do...while` | 次数未知 / 至少执行一次                     | 条件           | ✅                         |

- **数组用 `for...of`，不要用 `for...in`**：后者会遍历到自定义属性和原型链上的可枚举属性，且索引是字符串。
- `for...of` **不能用于普通对象**（无 `Symbol.iterator`）；对象遍历用 `Object.keys` / `Object.entries` / `Object.values`。
- `forEach` 里 `return` 只相当于 `continue`（结束本次回调），**不能跳出整个循环**；需要中断换 `for...of` / `some` / `every`。
- 循环里的 `await` 是**串行**；需要并行用 `Promise.all(items.map(async (x) => …))`。
- 循环中增删数组元素时迭代器会「跳过 / 重复」，需要删除用**倒序 `for`**。
- 遍历大数组优先「先缓存 `arr.length`」或 `for...of`；`for...in` 最慢（每次都要查原型链）。

### 20.3 跳转语句与标签

- `break` 跳出当前循环，`continue` 跳过本次进入下一轮。
- 多层循环联合跳出用**标签（label）**：

```js
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i + j === 2) break outer; // 直接跳出两层
  }
}
```

- `return` 是「函数级」跳出——在 `forEach` 回调里 `return` 退不出外层函数。
- 异常也是控制流：`try / catch / finally / throw`。`finally` 除进程退出外**一定执行**，且会先于 `return` 执行（`finally` 里的 `return` 会覆盖原返回值，属禁用写法）。
- `throw` 可以抛任意值，但**只抛 `Error` 实例**（保留 `stack` 与 `message`），否则线上无法定位。

### 避坑

- `for (var i = 0; …) { setTimeout(() => console.log(i)) }` 全部打印最后一个值（`var` 是函数作用域共享同一个 `i`）——改 `let` 或传参（见第 4 章）。
- `if (x);` 多写一个分号，条件体变成空语句，后续代码无条件执行；`for (…) ;` 同理。
- `while (i--)` 与 `while (--i)` 差一次迭代：前者当 `i` 减到 `0` 时条件为假但已执行过 `i = 0` 的那轮。
- `do...while` 的 `while` 后面**必须加分号**，且至少执行一次。
- `forEach` 里写 `await` 不会等待（`await` 只作用于它所在的 `async` 函数），需改成 `for...of` + `await`。

---

## 21. 数组与字符串：常用方法全览

一句话定位：**数组方法的第一记忆点是「改不改原数组」，第二记忆点是「返回元素还是返回数组」；字符串不可变，所有「修改」都返回新串。**

### 21.1 数组：会不会改原数组（★ 最重要的一张表）

| 分类       | 方法                                                         | 是否改原数组 |
| ---------- | ------------------------------------------------------------ | ------------ |
| 增         | `push` / `unshift` / `splice`                                | ✅ 改         |
| 删         | `pop` / `shift` / `splice`                                   | ✅ 改         |
| 排序反转   | `sort` / `reverse`                                           | ✅ 改         |
| 不可变版   | `toSorted` / `toReversed` / `toSpliced` / `with`（ES2023）    | ❌ 返回新数组 |
| 查找       | `indexOf` / `lastIndexOf` / `includes` / `find` / `findIndex` / `findLast` | ❌            |
| 判断       | `some` / `every` / `Array.isArray`                            | ❌            |
| 转换       | `map` / `filter` / `flat` / `flatMap` / `concat` / `slice` / `join` / `reduce` | ❌            |
| 迭代       | `forEach` / `keys` / `values` / `entries`                     | 取决于回调    |

要点：

- **`splice` vs `slice`**：`splice(start, deleteCount, ...items)` 是「删 + 插」并改动原数组；`slice(start, end)` 是复制切片、原数组不动。名字最像、行为最不同的一对。
- **`sort` 默认按字符串比较**：`[10, 2].sort()` 得 `[10, 2]`，必须传比较器 `(a, b) => a - b`；`toSorted` 是复制后排序。
- `find` 返回**元素**（找不到 `undefined`），`filter` 返回**数组**，`some` / `every` 返回**布尔**。
- `flat(Infinity)` 拍平任意层级；`flatMap` 等价 `map(...).flat(1)`（比两次遍历省一次）。
- `reduce(fn, init)` **务必给初始值**：空数组无初始值直接抛 `TypeError`；对象累加时若省略初始值，首元素会被当作累加器，类型错乱。
- 稀疏数组：`new Array(3)`、`delete arr[1]` 会产生「空洞」，`map` / `forEach` **跳过空洞**（但 `for...of` 会得到 `undefined`）。
- 构造序列：`Array.from({ length: n }, (_, i) => i)`；`Array(3).map(...)` 无效（空洞不参与），需先 `fill`。
- 数组本质是对象：`arr['0']` 合法、`length` 可写（写小会**截断**数组）。
- 类数组（`arguments`、`NodeList`、带 `length` 的对象）不能直接调数组方法，先 `Array.from(...)` 或 `[...x]`。
- 判数组只用 `Array.isArray`；`typeof []` 返回 `'object'`。

### 21.2 字符串

- **不可变**：所有方法都返回新字符串，`str[0] = 'x'` 静默无效。
- 查询：`includes` / `startsWith` / `endsWith` / `indexOf` / `at(-1)`（支持负索引）。
- 截取：
  - `slice(start, end)`：支持负索引，**推荐**。
  - `substring(start, end)`：负值按 `0` 处理，且 `start > end` 会自动交换参数（行为反直觉）。
  - `substr(start, length)`：已废弃，不要用。
- 变换：`trim` / `trimStart` / `trimEnd` / `toUpperCase` / `toLowerCase` / `padStart` / `padEnd` / `repeat` / `replace` / `replaceAll` / `split` / `normalize`。
- 正则相关：`match` / `matchAll` / `search` / `replace`（详见 22.3）。
- 模板字符串：`${}` 插值 + 多行；标签模板（把模板交给函数处理后再输出）用于 i18n、SQL 拼接防注入、样式组件。

### 避坑

- `'abc'.length` 是 **UTF-16 码元数**，不是「字符数」：`'👍'.length === 2`；按码点切分用 `[...str]` 或 `Array.from(str)`，不要用 `split('')`。
- `replace('a', 'b')` **只替换第一处**，全局替换用 `replaceAll` 或 `/a/g`（`replaceAll` 传字符串时要求全局，传正则必须带 `g`，否则抛错）。
- 字符串排序按 UTF-16 码元：`'Z' < 'a'` 为真；中文 / 拼音 / 本地化排序用 `localeCompare` 或 `Intl.Collator`。
- 金额 / 大数不要用字符串比较排序，也不要用 `sort((a, b) => a - b)` 处理超大整数（浮点精度，见第 2 章）。

---

## 22. 常用内置类：Math、Date、RegExp 与 Error

一句话定位：**这四个内置类是「语法基本盘」里使用频率最高、也最容易出隐蔽 Bug 的一组：Date 的时区、RegExp 的状态、Math 的浮点。**

### 22.1 Math

- 常用：`abs` / `floor` / `ceil` / `round` / `trunc` / `sign` / `min` / `max` / `pow` / `sqrt` / `hypot` / `random`。
- `Math.round` 是**向 +∞ 取整**（非四舍五入）：`Math.round(-0.5)` 得 `-0`，`Math.round(-1.5)` 得 `-1`。
- 取整三兄弟：`Math.trunc(-1.9)` 得 `-1`、`Math.floor(-1.1)` 得 `-2`、`Math.ceil(-1.9)` 得 `-1`。
- `Math.random()` 返回 `[0, 1)` 的**伪随机**数，不可用于令牌 / 抽奖等安全场景——用 `crypto.getRandomValues` 或 `crypto.randomUUID()`。
- 闭区间随机整数：`Math.floor(Math.random() * (max - min + 1)) + min`。
- 浮点误差同样影响 `Math`：`0.1 + 0.2 !== 0.3`、`Math.hypot` 比手写平方和更稳。

### 22.2 Date（本项目里坑最多的一类）

- `Date` 内部只存「**UTC 毫秒时间戳**」，本身不含时区信息。
- 创建：`new Date()` / `new Date(ms)` / `new Date(y, m, d, h, mi, s, ms)`（**本地时区**）/ `new Date('ISO 字符串')`。
- **月份是 0–11**：`new Date(2024, 0, 1)` 是 1 月 1 日；`getMonth()` 返回 0–11；`getDay()` 0 表示周日。
- **字符串解析陷阱**：`new Date('2024-01-01')` 按 **UTC** 解析，东八区显示为 1 月 1 日 08:00；`new Date('2024/01/01')` 才按本地解析。**优先用数字参数或带时区的 ISO 8601**（`2024-01-01T00:00:00+08:00`）。
- 取时间戳：`Date.now()`（不建对象，最快）> `+new Date()` ≈ `date.getTime()`；字符串转戳用 `Date.parse(s)`（解析失败返回 `NaN`）。
- 格式化：用 `Intl.DateTimeFormat` 或 `toLocaleString('zh-CN', opts)`，**不要手拼年月日**（补零、时区、12/24 小时制都会出错）。
- 日期加减：`date.setDate(date.getDate() + 7)` 能自动跨月；用毫秒数 `+ 86400000` 加减在夏令时地区会偏一小时。
- **`Date` 实例是可变对象**：`setDate` / `setMonth` / `setHours` 会改自身。做时间计算前先复制：`const next = new Date(prev)`。
- 复杂时区 / 日历计算交给 `Temporal`（新标准）或 day.js / luxon / date-fns，不要手搓。

### 22.3 RegExp

- 两种写法：字面量 `/ab+c/gi`（编译期解析、性能好）与 `new RegExp('ab+c', 'gi')`（动态拼接，注意**双重转义**：字符串里 `\d` 要写 `'\\d'`）。
- 标志位：

| 标志 | 含义                                          |
| ---- | --------------------------------------------- |
| `g`  | 全局匹配（**带 `lastIndex` 状态**）           |
| `i`  | 忽略大小写                                    |
| `m`  | 多行模式，`^` / `$` 匹配每行首尾              |
| `s`  | dotAll，让 `.` 匹配换行                       |
| `u`  | Unicode 模式，正确处理码点与 `\p{...}`        |
| `y`  | 粘性匹配，从 `lastIndex` 处精确开始           |
| `v`  | ES2024 unicodeSets，`u` 的增强版              |

- 方法：`test`（有无，返回布尔）、`exec`（返回匹配数组或 `null`）、`match` / `matchAll` / `replace` / `split` / `search`。
- 捕获组：位置捕获用 `$1` / `m[1]`；**命名捕获** `(?<year>\d{4})` 取 `m.groups.year`，替换里写 `$<year>`（比位置更可读）。
- 常用语法：前瞻 `(?=)` / 负前瞻 `(?!)` / 后顾 `(?<=)`、非贪婪 `*?` / `+?`、单词边界 `\b`、字符类 `[^x]`。
- **性能红线**：嵌套量词（如 `(a+)+$`）在长输入上会触发**灾难性回溯**，直接把主线程卡死——避免嵌套量词、限制输入长度，能用字符串方法就别上正则。

### 22.4 Error 与包装对象

- 内置错误类型：`Error` / `TypeError` / `RangeError` / `SyntaxError` / `ReferenceError` / `URIError`。
- 自定义错误：

```js
class HttpError extends Error {
  constructor(message, status, options) {
    super(message, options); // options.cause 串起因果链（ES2022）
    this.name = "HttpError";
    this.status = status;
  }
}
```

- `AggregateError`：配合 `Promise.any` 一次性收集全部失败原因。
- `error.cause` 用于把「底层原始错误」挂到「业务错误」上，排查时不断链。
- 包装对象（`new Number/String/Boolean`）几乎不用；`'abc'.length` 是引擎自动装箱的结果，无需手动 `new String`。
- `Number` 实用方法：`Number.isInteger` / `isFinite` / `isNaN`（**不转换**，比全局版安全）、`parseInt(s, 10)`、`parseFloat(s)`、`toFixed(n)`（返回**字符串**且有浮点误差：`(1.005).toFixed(2)` 得 `'1.00'`）。
- `Object.is` 与 `===` 的差异只在两处：`Object.is(NaN, NaN)` 为真、`Object.is(-0, 0)` 为假（见第 2 章）。

---

## 23. DOM：查询、增删改与事件

一句话定位：**DOM 是宿主提供的「页面对象树」，操作它的代价远高于操作 JS 变量——所以「少操作、批操作、委托监听」是核心原则。**

### 23.1 查询

- `document.getElementById(id)`：最快，只按 id 找。
- `querySelector(sel)` / `querySelectorAll(sel)`：CSS 选择器语法，返回**静态** `NodeList`（后续 DOM 变化不影响已取结果）。
- `getElementsByClassName` / `getElementsByTagName`：返回**实时** `HTMLCollection`——边遍历边改 DOM 会「越遍历越多」，是经典 Bug。
- 层级与关系：`parentElement` / `children` / `firstElementChild` / `lastElementChild` / `nextElementSibling` / `previousElementSibling` / `closest(sel)`。
- `NodeList` 是**类数组**：可以用 `forEach`，**没有** `map` / `filter` → 用 `[...list]` 或 `Array.from(list)` 转真数组。
- `el.matches(sel)`：判断自身是否匹配选择器（事件委托里常用）。

### 23.2 增删改

- 创建：`document.createElement(tag)` / `createTextNode(text)` / `createDocumentFragment()`（批量插入时先塞 fragment，只在最后插入一次）。
- 插入：`append` / `prepend` / `before` / `after` / `replaceWith`（现代 API，可一次传多个节点与字符串）；旧写法 `appendChild` / `insertBefore`。
- 删除与清空：`el.remove()`；清空用 `el.replaceChildren()`（比 `innerHTML = ''` 更安全，不触发 HTML 解析）。
- 文本内容：`textContent`（安全、不解析 HTML）> `innerText`（受 CSS 影响、会触发重排）> `innerHTML`（**XSS 入口**，见 14.3）。
- **property vs attribute**：`input.value` 是「当前值」，`input.getAttribute('value')` 是「初始值」——表单校验里混用会拿到过期数据；自定义数据用 `dataset` 访问 `data-*`。
- 样式：改类优先用 `classList.add / remove / toggle / contains`；改内联用 `el.style.setProperty('--brand', '#09f')`；**批量读 → 批量写**，禁止读-写交替（布局抖动，见 14.1）。
- 表单：`form.elements` 访问控件；`submit` 事件里记得 `event.preventDefault()`（否则整页刷新）；`input.value` 永远是字符串。

### 23.3 事件机制

- 三阶段：**捕获**（由外向内，`capture: true` 才在此时触发）→ **目标** → **冒泡**（由内向外，默认）。
- 注册：`el.addEventListener(type, handler, options)`，`options` 支持：

| 选项      | 作用                                                     |
| --------- | -------------------------------------------------------- |
| `capture` | 在捕获阶段触发                                           |
| `once`    | 触发一次后自动移除                                       |
| `passive` | 声明不调 `preventDefault`，滚动等高频事件性能更好（`touchstart` / `wheel` 建议开） |
| `signal`  | 传入 `AbortController.signal`，一次 `abort()` 批量移除    |

- `event.target` 是**真正触发**的元素，`event.currentTarget` 是**绑定监听器**的元素（`this` 在普通函数里指向它）。
- **事件委托**：父容器监听 + `target.closest('.item')` 判断来源。优势：监听器数量从 N 降到 1、自动覆盖动态新增元素。

```js
list.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  handle(btn.dataset.action);
});
```

- `preventDefault()` 阻止默认行为（跳转、提交、拖拽）；`stopPropagation()` 阻止继续传播（**慎用**，会破坏委托）；`stopImmediatePropagation()` 连同级监听器一并拦截。
- **不冒泡**的事件要委托就得用捕获：`focus` / `blur`（改用冒泡的 `focusin` / `focusout`）、`mouseenter` / `mouseleave`（改用 `mouseover` / `mouseout`）、`load`。
- 移除监听器必须传**同一函数引用**：匿名函数无法移除，用命名函数或 `signal`。
- 自定义事件：`new CustomEvent('x', { detail, bubbles: true })` + `el.dispatchEvent(evt)`。
- 组件卸载 / SPA 路由切换必须清理监听器与定时器——这是内存泄漏的第一来源（见第 6 章）。

### 23.4 尺寸、位置与滚动（速查）

| API                              | 含义                                                     |
| -------------------------------- | -------------------------------------------------------- |
| `offsetWidth` / `offsetHeight`   | 含边框、不含外边距（整数取整）                           |
| `clientWidth` / `clientHeight`   | 含内边距，**不含边框与滚动条**                           |
| `scrollWidth` / `scrollHeight`   | 含溢出内容（判「是否滚动到底」用它）                     |
| `getBoundingClientRect()`        | 相对**视口**的位置与尺寸，含 `transform` 的真实结果      |
| `offsetTop` / `offsetLeft`       | 相对 `offsetParent` 的位置                               |
| `scrollTop` / `window.scrollY`   | 滚动位置；`scrollIntoView({ behavior: 'smooth' })` 滚动定位 |

- 读取以上**任一几何属性都会强制 flush 样式队列**（布局抖动，见 14.1）——循环里读写交替会让开销成倍放大。
- 判断元素是否进入视口 / 尺寸变化，用 `IntersectionObserver` / `ResizeObserver` 替代 `scroll` / `resize` 轮询（见 7.4）。

---

## 24. BOM：window、location、history 与 navigator

一句话定位：**BOM 是「浏览器窗口」的对象模型——无正式标准但各浏览器高度一致，是前端操作全局对象、地址栏、历史记录与会话能力的入口。**

### 24.1 window

- `window` 是浏览器环境下的全局对象：全局 `var` 与函数声明都会挂到它上面；跨环境统一入口是 `globalThis`（Node 中**没有** `window`）。
- 视口尺寸：`innerWidth` / `innerHeight`（含滚动条）；`document.documentElement.clientWidth` 才是不含滚动条的内容区宽度。
- 定时器：`setTimeout` / `setInterval` / `clearTimeout` / `clearInterval`；**最小延迟约 4ms**，后台标签页会被节流到 ~1s。
- 弹窗：`alert` / `confirm` / `prompt` 会**阻塞主线程**，仅调试用。
- 顶层对象关系：`window.parent` / `top` / `self` / `frames`；跨源访问会被拦截。
- `window.name` 在同一标签页跨页面跳转后仍保留，可作为简易跨域数据通道（也是隐私风险点，读取前应清空）。

### 24.2 location 与 URL 解析

| 属性                  | 说明                                       |
| --------------------- | ------------------------------------------ |
| `location.href`       | 完整 URL，**赋值即跳转**                   |
| `location.origin`     | 协议 + 域名 + 端口（同源判断基准）         |
| `location.pathname`   | 路径部分                                   |
| `location.search`     | `?` 开始的查询串                           |
| `location.hash`       | `#` 开始的锚点                             |

- 跳转方式：`assign(url)` 可回退、`replace(url)` **不可回退**、`reload()` 重载。
- 解析与构造（推荐，不要手写字符串切割）：

```js
const url = new URL("/search", location.origin);
url.searchParams.set("q", "前端");
url.searchParams.append("page", "1");
console.log(url.toString());

const params = new URLSearchParams(location.search);
console.log(params.get("q"), params.getAll("tag"));
```

- 编码：单个参数用 `encodeURIComponent` / `decodeURIComponent`；整条 URL 用 `encodeURI`。
- 锚点变化监听 `hashchange`（`history.pushState` **不会**触发它）。

### 24.3 history 与 SPA 路由

- `history.pushState(state, '', url)` / `replaceState(...)`：只改地址栏与历史栈，**不发请求**。
- `popstate` 事件在「前进 / 后退」时触发（对应 `history.back()` / `forward()` / `go(n)`）。
- `history.scrollRestoration = 'manual'` 可关闭浏览器自动滚动复位。
- SPA 路由的本质 = `pushState` 改地址 + 首屏与 `popstate` 时匹配渲染；**刷新时服务端必须配置 history fallback**（否则 404）。

### 24.4 navigator、screen 与其他

- `navigator.userAgent` **可被伪造**，不要用于能力判断；`navigator.platform` 已废弃。
- 能力检测优先于 UA 嗅探：

```js
if ("geolocation" in navigator) { /* 支持定位 */ }
const permission = await navigator.permissions.query({ name: "clipboard-write" });
```

- `navigator.clipboard` 需要**安全上下文**（HTTPS / localhost）且通常要求用户手势触发。
- `navigator.onLine` + `online` / `offline` 事件只表示「链路是否通」，不代表能访问外网。
- `navigator.sendBeacon(url, data)`：页面卸载时可靠上报，埋点首选（比同步 XHR 更不阻塞卸载）。
- `screen.width` / `height` 是屏幕尺寸，`devicePixelRatio`（DPR）用于 1px 边框与 canvas 高清适配。
- `window.matchMedia('(prefers-color-scheme: dark)')` 监听系统主题；`(prefers-reduced-motion)` 决定是否关闭动效。

### 避坑

- 移动端与桌面端事件模型不同（`touch` / `mouse`），统一用 **Pointer Events**（`pointerdown` / `pointermove` / `pointerup`）少一半兼容代码。
- `window.open` 非用户手势触发会被拦截，返回 `null`，必须判空。
- `setInterval` 长时间运行会**累积漂移**；精确计时用「时间戳差值 + 递归 `setTimeout`」自校正。
- 读取 `location.hash` 得到的是编码后的字符串，含中文要 `decodeURIComponent`。

---

## 25. JSON：序列化与数据交换

一句话定位：**JSON 是「语言无关的文本数据格式」，不是 JS 对象字面量——语法更严、能表达的类型更少。**

### 25.1 语法边界

JSON 只允许六种值：对象、数组、字符串（**只能双引号**）、数字、`true` / `false`、`null`。不允许：`undefined`、函数、`Symbol`、`BigInt`、注释、尾逗号、单引号、`NaN`、`Infinity`、循环引用（`Date` 会先被转成字符串）。

| 项             | JS 对象字面量     | JSON             |
| -------------- | ----------------- | ---------------- |
| 键的引号       | 可省略            | 必须双引号       |
| 字符串引号     | 单 / 双 / 反引号  | 只能双引号       |
| 注释、尾逗号   | 允许              | 禁止             |
| `NaN` / `Infinity` | 可存在        | 非法             |
| 函数 / `undefined` / `Symbol` | 可存在 | 非法（会被丢弃或转 `null`） |
| `BigInt`       | 可存在            | 非法（抛错）     |

### 25.2 序列化：`JSON.stringify(value, replacer, space)`

- 第二个参数 `replacer`：传**数组**表示白名单键；传**函数** `(key, value) => value` 可逐项改写（如统一转时间格式）。
- 第三个参数 `space`：缩进用（数字或字符串），只影响可读性。
- 特殊处理规则（必须记住）：
  - 对象里值为 `undefined` / 函数 / `Symbol` 的键会被**整条丢弃**；
  - 数组里这些值会变成 `null`；
  - `NaN` / `Infinity` / `-Infinity` → `null`；
  - `BigInt` → **抛 `TypeError`**（需先 `String(x)`）；
  - 对象若有 `toJSON()` 则以其返回值序列化（`Date` 内置了 `toJSON`，所以输出 ISO 字符串）。
- 循环引用抛 `TypeError`：可用 `replacer` 断环（记录已访问对象），或改用 `flatted` 之类库。
- **深拷贝别用 `JSON.parse(JSON.stringify(x))`**：丢 `undefined` / 函数 / `Symbol`、`Date` 变字符串、`Map` / `Set` 变 `{}`、原型丢失——用 `structuredClone()`（见第 2 章）。

### 25.3 反序列化：`JSON.parse(text, reviver)`

- `reviver` 可在解析过程中把字符串还原为 `Date` 等对象，但要注意它自底向上遍历所有键。
- **必须 `try / catch`**：`localStorage` 里的脏数据、接口返回的 HTML 错误页、被截断的响应体都会让裸调用抛错；一旦发生在模块顶层初始化，会导致整块功能甚至整页不可用。

```js
function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn("JSON 解析失败", error);
    return fallback;
  }
}
```

- 大 JSON 解析会**阻塞主线程**（`JSON.parse` 是同步且无流式能力）；超大响应考虑 Web Worker 解析或服务端分页。
- 解析结果**结构不可信**：字段可能缺失、类型可能漂移 → 用 `zod` / 手写类型守卫在边界校验（见 14.8、第 15 章第 1 条）。

### 25.4 实践约定

- **数组字段可能返回 `null` 而不是 `[]`**：消费前一律 `Array.isArray(x) ? x : []` 兜底（否则 `.length` / `.map` 抛错可能整树卸载，见第 15 章）。
- 区分「字段缺失」与「字段为 `null`」：缺失常表示「未传」，`null` 常表示「显式置空」，后端约定要说清。
- 大整数（订单号、雪花 ID）超过 `Number.MAX_SAFE_INTEGER` 会**静默丢精度** → 后端用字符串传输，前端按字符串或 `BigInt` 处理。
- 时间统一传 ISO 8601 带时区字符串（`2024-01-01T00:00:00.000Z`），不要传本地化格式或时间戳裸值。
- 需要注释 / 尾逗号的配置文件用 JSONC / JSON5（工具层能力，**不是标准 JSON**）。

---

## 26. 创建对象与继承：从工厂函数到 class

一句话定位：**创建对象的关键是「方法与数据放哪」，继承的关键是「原型链怎么连、构造函数怎么复用」——`class` 只是更清晰的语法糖。**

### 26.1 创建对象的五种方式

| 方式               | 写法                                              | 特点                                                     |
| ------------------ | ------------------------------------------------- | -------------------------------------------------------- |
| 字面量             | `const o = { a: 1 }`                              | 最常用、最直观                                           |
| `new Object()`     | `new Object()`                                    | 等价字面量，啰嗦，不用                                   |
| 工厂函数           | `function create(n) { return { n, run() {} } }`   | 封装创建细节、无 `new`；**方法每个实例一份，不复用**     |
| 构造函数 + 原型    | `function F(n) { this.n = n }`，方法挂 `F.prototype` | 方法复用、支持 `instanceof`、可被 `new`                  |
| `class`            | `class F { constructor() {} run() {} }`           | 语法糖，语义清晰，**必须 `new`**（否则抛错）             |

- `Object.create(proto, descriptors)`：以指定对象为原型造实例，是「干净继承」的基础。
- `Object.create(null)` 得到**无原型对象**：可当纯哈希表（没有 `toString` / `hasOwnProperty` 干扰），但也不能用这些方法。
- `class` 与构造函数的关键区别：`class` 内部默认严格模式、方法不可枚举、**调用必须 `new`**、存在 TDZ（不能先 `new` 后声明）。

### 26.2 `new` 操作符做了什么（手写实现）

1. 创建一个空对象；
2. 把它的 `[[Prototype]]` 指向 `Fn.prototype`；
3. 以该对象为 `this` 执行构造函数体；
4. 若构造函数返回**对象**则用它，否则返回步骤 1 创建的对象（返回原始值会被忽略）。

```js
function myNew(Fn, ...args) {
  const obj = Object.create(Fn.prototype);
  const ret = Fn.apply(obj, args);
  const isObject = ret !== null && (typeof ret === "object" || typeof ret === "function");
  return isObject ? ret : obj;
}
```

- `new.target` 可判断「是否被 `new` 调用」，用于兼容「忘记 `new`」的场景。
- 箭头函数没有 `prototype`，**不能作构造函数**；`class` 也不能当普通函数调用。

### 26.3 继承的演进（从原型链到 class）

| 方案           | 做法                                                                   | 问题                                            |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| 原型链继承     | `Child.prototype = new Parent()`                                       | 父类**实例属性被所有子实例共享**（引用类型互相污染）、无法向父类传参 |
| 借用构造函数   | 构造函数里 `Parent.call(this, args)`                                   | 解决传参与属性共享，但**父类方法无法复用**（每实例一份） |
| 组合继承       | 原型链 + 借用构造函数                                                   | 父构造函数被调用**两次**，原型上多一份多余属性  |
| 寄生组合继承   | `Child.prototype = Object.create(Parent.prototype)` + 补回 `constructor` | 传统最优方案（现已被 `class extends` 取代）     |
| ES6 `class extends` | `class Child extends Parent { constructor() { super(args) } }`     | 本质仍是原型链；`super()` **必须先调用**才能用 `this` |

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name); // 必须在使用 this 之前
  }

  speak() {
    return `${super.speak()} — woof`;
  }
}

console.log(new Dog("旺财") instanceof Animal); // true（沿原型链判断）
```

- `instanceof` 是「沿原型链找 `Fn.prototype`」；`Object.getPrototypeOf(obj)` 查看当前原型；`Object.create(null)` 创建的对象不在任何原型链上，`instanceof Object` 为 `false`。
- 重建原型时容易丢掉 `constructor`：`Child.prototype = Object.create(Parent.prototype)` 之后要补 `Child.prototype.constructor = Child`（`class` 由引擎自动处理）。
- `Object.setPrototypeOf` 会破坏引擎优化（隐藏类），**只在初始化时用**，不要放热路径。

### 26.4 组合优于继承

- 继承层次超过 **2–3 层**就该警惕「基类污染」：改基类影响所有子类，子类间还会互相干扰。
- 用**组合 / Mixin / 委托**替代深继承：

```js
// Mixin：横向注入能力，避免 A extends B extends C
const Serializable = (Base) =>
  class extends Base {
    toJSON() {
      return { ...this };
    }
  };

class User extends Serializable(Base) {}
```

- 行为放原型 / 类方法，数据放实例字段（见 3.4 避坑）；需要真私有用 `#field`（见 3.5），不要靠 `_` 命名约定假装私有。
- `Object.assign(Target.prototype, mixin)` 是最轻量的 Mixin 写法，但会**覆盖同名成员**，需确保命名不冲突（或用 `Symbol` 作键）。

---

> 使用建议：零基础先读第 18 章把第一行代码跑通；入门者按 `1 → 2 → 3 → 4` 顺序打地基，配合第 17 章资源练习；语法基本盘（运算符、流程控制、数组与字符串、内置类、DOM / BOM / JSON、创建对象与继承）见第 19–26 章；进阶者把第 10、11、12、13 章当作自查与团队规范基线；**高级/资深工程师**以第 14、15、16 章为能力地图，逐条对标、查漏补缺，并把第 15 章盲点清单纳入团队 Code Review 检查项。
