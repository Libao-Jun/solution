# ECMAScript 6 知识指南

> 一份面向前端开发工程师的 ES6+ 功能速查与深度学习指南。
> 适用人群：从入门到精通。入门者可按「核心必会」顺序渐进；精通者可直接查阅「年度速查表」与「进阶实践」。
>
> 参考资料：
>
> - ECMA-262 规范：<https://ecma262.com/c/>
> - 阮一峰《ECMAScript 6 入门》：<https://es6.ruanyifeng.com/>

---

## 目录

1. [概念澄清：什么是“ES6”](#一概念澄清什么是es6)
2. [ECMAScript 版本演进与年度特性速查表](#二ecmascript-版本演进与年度特性速查表)
3. [ES2015（真正的 ES6）核心必会](#三es2015真正的-es6核心必会)
4. [ES2016 ~ ES2024 逐年详解](#四es2016--es2024-逐年详解)
5. [进阶与工程实践](#五进阶与工程实践)
6. [常见易错点与面试题](#六常见易错点与面试题)
7. [速查表与延伸阅读](#七速查表与延伸阅读)

---

## 一、概念澄清：什么是“ES6”

这是最容易混淆的概念，必须先讲清楚。

### 1.1 “ES6” 有两层含义

| 含义         | 范围                                                  | 说明                                                                                                                            |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **狭义 ES6** | 仅 **ES2015** 这一版                                  | 2015 年 6 月发布的第 6 版 ECMAScript，是变革最大的一版，新增了 `let/const`、箭头函数、类、模块、Promise、解构等几十项核心特性。 |
| **广义 ES6** | **ES2015 及之后所有年度版本**（ES2016/2017/…/ES2024） | 自 2015 年起 TC39 改为**每年发布一版**，社区习惯把 ES2015 之后的所有新特性统称为“ES6 / ES6+ / ES.Next”。                        |

> ⚠️ **关键区别**：虽然大家口头都说“学 ES6”，但 **每一年新增的知识点和功能是不一样的**。
>
> - 你面试时说的“ES6 解构、Promise”其实是 **ES2015** 的内容；
> - 你日常写的 `?.`（可选链）、`??`（空值合并）是 **ES2020**；
> - `Array.prototype.at(-1)` 是 **ES2022**；
> - `Object.groupBy`、`Promise.withResolvers` 是 **ES2024**。
>
> 本指南会**逐年拆开讲**，避免你把所有新语法混为一谈。

### 1.2 TC39 提案流程（为什么特性会“分批”落地）

ECMAScript 新特性不是直接写进标准的，而是要经过 TC39 委员会的 **4 个 Stage**：

| Stage   | 名称                  | 状态含义                           |
| ------- | --------------------- | ---------------------------------- |
| Stage 0 | Strawman（稻草人）    | 初步想法                           |
| Stage 1 | Proposal（提案）      | 正式提案，描述问题与使用场景       |
| Stage 2 | Draft（草案）         | 语法与语义初步确定                 |
| Stage 3 | Candidate（候选）     | 等待实现反馈，语法基本冻结         |
| Stage 4 | Finished（ finished） | 已被主流引擎实现，将进入下一版标准 |

只有进入 **Stage 4** 的特性，才会被纳入当年的 ECMAScript 正式版本。这也是为什么某些“听起来很熟”的语法（如装饰器 Decorators）长期停留在 Stage 3、迟迟不进标准的原因。

### 1.3 兼容性现实

浏览器和 Node.js 并**不是**按“年份版本”整体支持的，而是**逐特性**实现。例如：

- 现代浏览器（Chrome/Edge/Firefox/Safari 近 2~3 年版本）基本已原生支持到 **ES2023/ES2024** 的大部分特性；
- 但老项目（如仍需兼容 IE11，或低版本 WebView）则需要 **Babel + polyfill** 转译；
- Node.js 每个大版本都会跟进当年的标准特性，可用 `node --version` 对照其发布年份判断支持度。

---

## 二、ECMAScript 版本演进与年度特性速查表

下面这张表是**全指南最重要的索引**：先建立“哪年加了什么”的整体认知，后面再逐条深挖。

| 版本       | 发布年 | 年度别称        | 当年最值得记住的新特性                                                                                                                                                    |
| ---------- | ------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------------- |
| **ES1**    | 1997   | —               | 初版                                                                                                                                                                      |
| **ES3**    | 1999   | —               | 正则、`try/catch`                                                                                                                                                         |
| **ES5**    | 2009   | ES5             | `strict mode`、`JSON`、`Array.forEach/map/filter`、`Object.defineProperty`                                                                                                |
| **ES5.1**  | 2011   | ES5.1           | 小幅修订                                                                                                                                                                  |
| **ES2015** | 2015   | **ES6（狭义）** | `let/const`、箭头函数、类、模块、Promise、解构、模板字符串、Symbol、Map/Set、Proxy、Generator、Iterator                                                                   |
| **ES2016** | 2016   | ES7             | `Array.prototype.includes`、`**` 幂运算                                                                                                                                   |
| **ES2017** | 2017   | ES8             | `async/await`、`Object.values/entries`、`padStart/padEnd`、`SharedArrayBuffer/Atomics`、尾逗号                                                                            |
| **ES2018** | 2018   | ES9             | 异步迭代 `for await...of`、对象 rest/spread、`Promise.prototype.finally`、正则增强（命名捕获组/后行断言/dotAll/Unicode 属性）                                             |
| **ES2019** | 2019   | ES10            | `Array.flat/flatMap`、`Object.fromEntries`、`trimStart/trimEnd`、可选 `catch` 绑定、稳定的 `Array.sort`、`Symbol.prototype.description`                                   |
| **ES2020** | 2020   | ES11            | **可选链 `?.`**、**空值合并 `??`**、`BigInt`、`dynamic import()`、`globalThis`、`Promise.allSettled`、`String.matchAll`                                                   |
| **ES2021** | 2021   | ES12            | 逻辑赋值 `&&=`/`                                                                                                                                                          |     | =`/`??=`、数字分隔符 `1_000`、`String.replaceAll`、`Promise.any`/`AggregateError`、`WeakRef`、`FinalizationRegistry` |
| **ES2022** | 2022   | ES13            | **类公有/私有字段 `#`**、静态初始化块、顶层 `await`、`Array.prototype.at`、`Object.hasOwn`、`Error.cause`、`RegExp` `/d` 匹配索引                                         |
| **ES2023** | 2023   | ES14            | `Array.findLast/findLastIndex`、**不改变原数组的数组方法** `toSorted/toReversed/with/toSpliced`、`Array/TypedArray` 复制方法、`#!` hashbang                               |
| **ES2024** | 2024   | ES15            | `Array.fromAsync`、`Object.groupBy/Map.groupBy`、`Promise.withResolvers`、`RegExp` `/v` 标志（unicodeSets）、**Set 集合运算方法**、**Iterator Helpers（迭代器辅助方法）** |
| **ES2025** | 2025   | ES16（最新）    | `import attributes`（`import ... with`）、`RegExp.escape`、`Set` 方法稳定化等                                                                                             |

> 💡 记忆口诀：
>
> - **2015 是基石**（语法层面的革命）；
> - **2020 是日常**（你每天敲的 `?.` `??`）；
> - **2022+ 是现代化**（类字段、私有成员、不改变原数组的数组方法）。

---

## 三、ES2015（真正的 ES6）核心必会

> 这一节是“狭义 ES6”，也是面试与日常编码中占比最大、最必须扎实的部分。

### 3.1 `let` / `const` 与块级作用域

ES2015 之前只有 `var`（函数作用域 + 变量提升）。`let`/`const` 引入了**块级作用域**。

```js
// var：函数作用域，存在变量提升与可重复声明
var a = 1;
var a = 2; // OK

// let：块级作用域，不可重复声明，存在“暂时性死区”
let b = 1;
// let b = 2; // SyntaxError: 不可重复声明

// const：声明常量（绑定不可重新赋值，但对象内部属性可变）
const c = 1;
// c = 2; // TypeError: 不可重新赋值

const obj = { x: 1 };
obj.x = 2; // OK，const 锁的是“引用”不是“值”
// obj = {};      // TypeError
```

**暂时性死区（TDZ, Temporal Dead Zone）**：在 `let/const` 声明之前访问该变量会抛 `ReferenceError`。

```js
console.log(x); // ReferenceError（TDZ）
let x = 10;
```

**`typeof` 也不再安全**：

```js
typeof undeclaredVar; // "undefined"（未声明变量，安全）
typeof y; // ReferenceError（y 已用 let 声明但在 TDZ 内）
let y;
```

**工程建议**：默认用 `const`，需要重新赋值时才用 `let`，**几乎永远不要用 `var`**。

### 3.2 箭头函数（Arrow Functions）

```js
const add = (a, b) => a + b; // 单参数可省括号，单表达式可省 return
const square = (x) => x * x;
const greet = (name) => `Hello, ${name}`;
const noop = () => {}; // 无参数必须写括号
```

**核心区别（面试高频）**：

1. **没有自己的 `this`**：箭头函数的 `this` 继承自外层词法作用域（定义时的外层 `this`），无法通过 `call/apply/bind` 改变。
2. **没有 `arguments` 对象**：用 rest 参数 `...args` 代替。
3. **不能作为构造函数**：不能用 `new`。
4. **没有 `prototype` 属性**。
5. **不能用作 generator 函数**。

```js
const obj = {
  count: 0,
  // ❌ 旧写法：this 指向调用者，易出错
  bad() {
    setTimeout(function () {
      this.count++;
    }, 100);
  },
  // ✅ 箭头函数：this 继承自 obj
  good() {
    setTimeout(() => {
      this.count++;
    }, 100);
  },
};
```

### 3.3 解构赋值（Destructuring）

```js
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4]; // a=1, b=2, rest=[3,4]

// 对象解构（可重命名、可设默认值）
const { name, age = 18, gender: sex } = user;

// 嵌套解构
const {
  profile: { avatar },
} = user;

// 函数参数解构
function fn({ id, type = "default" }) {}

// 交换变量（无需临时变量）
[a, b] = [b, a];
```

**易错点**：已声明的变量用于对象解构时要加括号：

```js
let x;
({ x } = { x: 1 }); // 必须括号，否则 { 被解析为代码块
```

### 3.4 模板字符串（Template Literals）

```js
const name = "World";
const html = `
  <div>
    <h1>Hello, ${name}</h1>
    <p>${1 + 1}</p>
  </div>
`;
```

- 用反引号 `` ` `` 包裹，支持**多行字符串**与**嵌入表达式** `${}`。
- 可写**标签模板（Tagged Templates）**，用于国际化、HTML 转义、CSS-in-JS 等：

```js
function tag(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
}
tag`Hello ${name}`;
```

### 3.5 函数参数：默认值 / Rest / Spread

```js
// 默认参数（注意：默认参数有独立作用域，会形成 TDZ）
function f(x = 1, y = x * 2) {
  return y;
}

// Rest 参数（收集剩余参数为真数组，取代 arguments）
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

// 扩展运算符（展开数组/可迭代对象）
const arr = [1, 2, 3];
const copy = [...arr]; // 浅拷贝
const merged = [...arr, 4, 5]; // 合并
Math.max(...arr); // 取代 apply
```

> `...` 三点是同一个语法符号，用在**形参位置 = Rest 收集**，用在**实参/数组字面量位置 = Spread 展开**。

### 3.6 数组、对象、字符串、数值、正则的扩展

**数组新增方法**

```js
Array.from({ length: 3 }, (_, i) => i); // [0,1,2] 类数组/可迭代 → 数组
Array.of(1, 2, 3); // 取代 new Array(3) 的歧义
[1, 2, 3].find((x) => x > 1); // 2
[1, 2, 3].findIndex((x) => x > 1); // 1
[1, 2, NaN].includes(NaN); // true（弥补 indexOf 找不到 NaN）
[1, 2, 3].fill(0); // [0,0,0]
[1, 2, 3].copyWithin(0, 1); // [2,3,3]
[1, [2, [3]]].flat(Infinity); // [1,2,3]（flat 实际是 ES2019）
["a", "b"].keys(); // 迭代器 0,1
["a", "b"].entries(); // [0,'a'],[1,'b']
```

**对象新增方法**

```js
Object.assign(target, ...sources); // 浅合并（注意只复制可枚举自有属性）
Object.is(NaN, NaN); // true（比 === 更严谨，区分 +0/-0）
Object.keys / values / entries(obj); // 注意：values/entries 是 ES2017
```

**字符串新增方法**

```js
"abc".includes("b"); // true
"abc".startsWith("a"); // true
"abc".endsWith("c"); // true
"x".repeat(3); // 'xxx'
("\u{1F600}"); // 😀 支持 Unicode 码点（>0xFFFF）
```

**数值新增**

```js
Number.isInteger(1.0); // true
Number.isNaN(NaN); // true（取代全局 isNaN 的类型强制）
Number.parseInt("12px"); // 12
Number.EPSILON; // 极小常量，用于浮点比较
0b1010; // 二进制字面量 10
0o17; // 八进制字面量 15
```

### 3.7 Symbol

`Symbol` 是 ES2015 新增的第七种原始类型，表示**唯一且不可变**的值，常用于：

- 给对象添加**不会冲突的私有/元属性键**；
- 定义语言内部行为的“well-known symbols”（如 `Symbol.iterator`、`Symbol.toStringTag`）。

```js
const KEY = Symbol("description"); // 描述仅用于调试
obj[KEY] = "secret"; // 唯一键，不会被 for...in / Object.keys 枚举

// 内置 Symbol 示例：自定义迭代行为
const myIterable = {
  [Symbol.iterator]() {
    let i = 0;
    return { next: () => ({ value: i++, done: i > 3 }) };
  },
};
[...myIterable]; // [0,1,2]
```

### 3.8 集合：Map / Set / WeakMap / WeakSet

```js
// Map：键可以是任意类型（对象/原始值），有序，size 属性
const m = new Map();
m.set(obj, "value").set("k", 1);
m.get(obj); // 'value'
m.has("k"); // true
m.size;

// Set：去重，元素唯一
const s = new Set([1, 1, 2]); // {1, 2}
s.add(3).delete(1).has(2);

// WeakMap / WeakSet：键必须是对象，弱引用（不阻止 GC），不可遍历
const wm = new WeakMap();
wm.set(obj, "meta"); // obj 被回收时，条目自动消失
```

**对比 `Object` vs `Map`**：需要频繁增删键值、键非字符串、需要遍历顺序稳定时用 `Map`；简单配置对象仍可用 `Object`。

### 3.9 Proxy 与 Reflect

`Proxy` 用于**拦截/代理**对象的各种操作（get/set/delete/has/apply/construct 等）：

```js
const target = { name: "Tom" };
const proxy = new Proxy(target, {
  get(obj, key) {
    console.log("读取", key);
    return obj[key];
  },
  set(obj, key, value) {
    console.log("写入", key, value);
    obj[key] = value;
    return true;
  },
});
proxy.age = 18; // 打印“写入 age 18”
proxy.name; // 打印“读取 name”
```

`Reflect` 提供了一套**与 Proxy 陷阱一一对应**的静态方法，用于在拦截器中“默认执行原操作”：

```js
const handler = {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver); // 默认行为，避免手写 obj[key]
  },
};
```

> 典型用途：Vue 3 的响应式系统底层就是 `Proxy + Reflect`；数据校验、日志、不可变对象。

### 3.10 Promise

解决“回调地狱”的异步方案。三种状态：`pending → fulfilled / rejected`。

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("ok"), 1000);
});

p.then((value) => console.log(value))
  .catch((err) => console.error(err))
  .finally(() => console.log("done")); // finally 是 ES2018
```

**常用静态方法**：

```js
Promise.all([p1, p2, p3]); // 全部成功才成功，任一失败即失败
Promise.race([p1, p2]); // 谁先 settle 用谁
Promise.allSettled([p1, p2]); // ES2020：全部结束，结果带 status
Promise.any([p1, p2]); // ES2021：任一成功即成功
Promise.resolve(1);
Promise.reject(new Error("x"));
```

**易错点**：Promise 构造函数内的同步代码会**立即执行**；`then` 回调是**微任务（microtask）**，在下一个微任务队列执行。

### 3.11 Iterator 与 `for...of`

可迭代协议（Iterable Protocol）：任何实现了 `Symbol.iterator` 方法、返回迭代器的对象，都能用 `for...of` 遍历。

```js
const arr = [1, 2, 3];
for (const item of arr) console.log(item);

// 类数组 / 字符串 / Map / Set / NodeList 都原生可迭代
for (const [k, v] of new Map([["a", 1]])) {
}

// 自定义迭代器
function* range(n) {
  for (let i = 0; i < n; i++) yield i;
}
[...range(3)]; // [0,1,2]
```

> `for...of` 遍历**值**；`for...in` 遍历**可枚举字符串键（含原型链）**，两者用途不同。

### 3.12 Generator 函数

`function*` + `yield`，可暂停/恢复执行，是异步编程（co / redux-saga）与状态机的基础。

```js
function* gen() {
  yield 1;
  yield 2;
  return "done";
}
const g = gen();
g.next(); // { value: 1, done: false }
g.next(); // { value: 2, done: false }
g.next(); // { value: 'done', done: true }
```

### 3.13 Class 类

ES2015 的 `class` 是**基于原型的语法糖**，并非真正的类（没有私有/静态块等，后续年份补全）。

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
  static info() {
    return "Animal class";
  } // 静态方法
  get name_() {
    return this.name;
  } // getter
}

class Dog extends Animal {
  speak() {
    return super.speak() + " (bark)"; // super 调用父类
  }
}
```

> ⚠️ ES2015 的 class **没有私有字段**。私有成员要等到 **ES2022** 的 `#` 语法（见第四节）。

### 3.14 Module（ES Module, ESM）

ES2015 引入了语言级模块系统，取代了 CommonJS（`require`/`module.exports`）和 AMD。

```js
// math.js
export const PI = 3.14;
export function add(a, b) {
  return a + b;
}
export default function () {} // 默认导出

// main.js
import _default, { PI, add as plus } from "./math.js";
import * as math from "./math.js"; // 命名空间导入
```

关键特性：

- **静态结构**：`import`/`export` 必须在顶层（ES2022 才允许顶层 `await`），便于静态分析、Tree Shaking；
- **只读绑定**：导入的是**值的实时绑定**（live binding），而非值的拷贝；
- **严格模式**：ESM 自动启用严格模式；
- 浏览器通过 `<script type="module">` 使用；Node.js 用 `.mjs` 或 `package.json` 的 `"type": "module"`。

### 3.15 其他 ES2015 特性

- **二进制 / 八进制字面量**：`0b1010`、`0o17`；
- **`new.target`**：判断函数是否通过 `new` 调用；
- **`super`**：在子类构造函数中必须先于 `this` 调用 `super()`；
- **尾调用优化（TCO）**：在严格模式下，尾部递归可被优化（注意：**大多数现代引擎并未实际实现 TCO**，不要依赖它做深递归）。

---

## 四、ES2016 ~ ES2024 逐年详解

> 这一节把“广义 ES6”按年份拆开，每一年单独成节，明确**当年新增了什么**，避免和 ES2015 混淆。

### 4.1 ES2016（ES7）

| 特性                       | 用法                | 说明                                                  |
| -------------------------- | ------------------- | ----------------------------------------------------- |
| 指数运算符 `**`            | `2 ** 3 === 8`      | 右结合：`2 ** 3 ** 2 === 2 ** 9`                      |
| `Array.prototype.includes` | `[1,2].includes(2)` | 弥补 `indexOf` 无法识别 `NaN` 与严格 `===` 比较的缺陷 |

```js
// includes 能正确处理 NaN
[NaN].indexOf(NaN); // -1（找不到）
[NaN].includes(NaN); // true

// ** 与 Math.pow 等价
Math.pow(2, 10) === 2 ** 10;
```

### 4.2 ES2017（ES8）

| 特性                               | 用法                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------- |
| **`async` / `await`**              | 基于 Promise 的异步语法糖，让异步代码“看起来像同步”                         |
| `Object.values` / `Object.entries` | 取出对象的值数组 / `[键,值]` 数组                                           |
| `Object.getOwnPropertyDescriptors` | 获取完整属性描述符（配合 `Object.defineProperties` 精确拷贝 getter/setter） |
| `String.padStart` / `padEnd`       | 字符串补全（日期、编号对齐）                                                |
| 函数参数尾逗号                     | `function f(a, b,) {}` 合法                                                 |
| `SharedArrayBuffer` / `Atomics`    | 多线程共享内存与原子操作（Web Worker）                                      |

```js
// async/await：异步编程的基石
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}

// padStart 经典用例：日期补零
"5".padStart(2, "0"); // '05'
"255".padStart(4, "0"); // '0255'
```

> ⚠️ `await` 后面如果不是 Promise，会被 `Promise.resolve()` 自动包装；`async` 函数**永远返回 Promise**。

### 4.3 ES2018（ES9）

| 特性                        | 用法                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| 异步迭代 `for await...of`   | 遍历异步可迭代对象（如分页流式接口）                                                        |
| **对象 rest / spread**      | `const { a, ...rest } = obj`；`{ ...obj1, ...obj2 }`                                        |
| `Promise.prototype.finally` | 无论成功失败都执行（常用于 loading 收尾）                                                   |
| 正则增强                    | 命名捕获组 `(?<name>...)`、后行断言 `(?<=...)`、dotAll `s` 标志、Unicode 属性转义 `\p{...}` |

```js
// 对象 rest/spread（前端最常用，深合并配置）
const base = { a: 1, b: 2 };
const merged = { ...base, b: 3, c: 4 }; // {a:1,b:3,c:4}
const { b, ...others } = merged; // others = {a:1,c:4}

// finally：无论成败都关闭 loading
showLoading();
fetchData().then(render).catch(showError).finally(hideLoading);

// 命名捕获组
const {
  groups: { year },
} = /(?<year>\d{4})/.exec("2026"); // year = '2026'

// for await...of
async function readAll(streams) {
  for await (const chunk of streams) {
    console.log(chunk);
  }
}
```

### 4.4 ES2019（ES10）

| 特性                                     | 用法                                           |
| ---------------------------------------- | ---------------------------------------------- |
| `Array.prototype.flat` / `flatMap`       | 数组扁平化（可指定深度）                       |
| `Object.fromEntries`                     | `[ [k,v] ]` → 对象（与 `Object.entries` 互逆） |
| `String.prototype.trimStart` / `trimEnd` | 去除首尾空白（还有 `trimLeft/trimRight` 别名） |
| 可选 `catch` 绑定                        | `try {} catch {}` 可省略 `(e)`                 |
| 稳定的 `Array.prototype.sort`            | 排序算法稳定化（相同键保持原顺序）             |
| `Symbol.prototype.description`           | 读取 Symbol 描述 `sym.description`             |
| `JSON.stringify` 格式正确                | 正确转义 U+D800~U+DFFF 代理对                  |

```js
[1, [2, [3]]].flat(2); // [1,2,3]
[1, 2].flatMap((x) => [x, x * 2]); // [1,2,2,4]

const obj = Object.fromEntries([
  ["a", 1],
  ["b", 2],
]); // {a:1,b:2}

try {
  risky();
} catch {
  /* 不关心错误对象 */
}
```

### 4.5 ES2020（ES11）—— 日常高频

| 特性                        | 用法                                              |
| --------------------------- | ------------------------------------------------- |
| **可选链 `?.`**             | `obj?.a?.b` 安全访问嵌套属性                      |
| **空值合并 `??`**           | `a ?? b`：`a` 为 `null/undefined` 时才取 `b`      |
| `BigInt`                    | 任意精度整数，字面量加 `n`：`123n`                |
| 动态导入 `import()`         | 运行时按需加载模块，返回 Promise                  |
| `globalThis`                | 统一的全局对象（浏览器 `window` / Node `global`） |
| `Promise.allSettled`        | 等待所有 Promise 结束（无论成败）                 |
| `String.prototype.matchAll` | 返回所有正则匹配迭代器                            |
| `for-in` 顺序标准化         | 枚举顺序被正式规定                                |

```js
// ?. 链式安全访问
const city = user?.address?.city; // 任意一层为空都不会抛错
const fn = obj.method?.(); // 方法可能不存在
arr?.[0]; // 也可用于数组/可选调用

// ?? vs ||
0 || 10; // 10（|| 把 0/''/false 都当作“空”）
0 ?? 10; // 0（?? 只认 null/undefined）
null ?? "def"; // 'def'

// BigInt
const big = 9007199254740991n + 1n; // 突破 Number 安全整数上限
// 注意：BigInt 与 Number 不能直接混合运算

// 动态导入：路由懒加载
button.onclick = async () => {
  const mod = await import("./heavy-module.js");
  mod.run();
};
```

> ⚠️ `??` 不能和 `||` / `&&` **直接混用**而不加括号：`a ?? b || c` 会报语法错误，必须 `(a ?? b) || c`。

### 4.6 ES2021（ES12）

| 特性                             | 用法                                               |
| -------------------------------- | -------------------------------------------------- | --- | -------------- |
| 逻辑赋值运算符                   | `a &&= b` / `a                                     |     | = b`/`a ??= b` |
| 数字分隔符                       | `1_000_000`、`0b1010_0011` 提升可读性              |
| `String.prototype.replaceAll`    | 替换所有匹配（无需正则 `/g`）                      |
| `Promise.any` + `AggregateError` | 任一 Promise 成功即成功，全失败抛 `AggregateError` |
| `WeakRef`                        | 对对象的弱引用（不阻止 GC）                        |
| `FinalizationRegistry`           | 对象被 GC 时执行回调（清理外部资源）               |

```js
// 逻辑赋值：常用于“默认值填充”
user.settings ??= {}; // 仅当 settings 为 null/undefined 时赋值
config.debug ||= true;

// 数字分隔符
const bytes = 1_048_576; // 1048576，更易读
const bin = 0b1111_0000; // 二进制分组

// replaceAll
"aaa".replaceAll("a", "b"); // 'bbb'
"aaa".replaceAll(/a/g, "b"); // 也可传正则（必须带 g 标志）

// Promise.any：竞速取最快成功者
try {
  const first = await Promise.any([fetchA(), fetchB()]);
} catch (e) {
  if (e instanceof AggregateError) console.log(e.errors);
}
```

### 4.7 ES2022（ES13）—— 现代化关键年

| 特性                  | 用法                                                      |
| --------------------- | --------------------------------------------------------- |
| **类公有/私有字段**   | `class { x = 1; #secret = 2; }`（`#` 私有，外部不可访问） |
| **类私有方法/访问器** | `#method() {}`、`get #x() {}`                             |
| **静态初始化块**      | `static { ... }` 在类加载时执行一次                       |
| **顶层 `await`**      | 在 ES Module 顶层直接使用 `await`                         |
| `Array.prototype.at`  | `arr.at(-1)` 负数索引取末尾（告别 `arr[arr.length-1]`）   |
| `Object.hasOwn`       | 取代 `Object.prototype.hasOwnProperty.call(obj, key)`     |
| `Error.cause`         | 错误链式包装：`new Error('B', { cause: err })`            |
| `RegExp` `/d` 标志    | 匹配结果带 `indices` 数组（捕获组位置）                   |
| **`#!`（hashbang）**  | 实际 ES2023；让 JS 文件可作为可执行脚本                   |

```js
// 类字段与私有成员（真正的封装）
class Counter {
  #count = 0; // 私有字段
  increment() {
    this.#count++;
  }
  get value() {
    return this.#count;
  }
  static instances = 0;
  static {
    // 静态初始化块
    Counter.instances = 0;
  }
}
const c = new Counter();
c.increment();
console.log(c.value); // 1
// console.log(c.#count);     // SyntaxError：私有成员外部不可访问

// at：负数索引（TS/新浏览器友好）
const list = [10, 20, 30];
list.at(-1); // 30
list.at(-2); // 20

// Object.hasOwn
Object.hasOwn(obj, "key"); // true/false

// Top-level await（仅在 ESM 中）
const data = await fetch("/api").then((r) => r.json());

// Error.cause 链式错误
try {
  doSomething();
} catch (err) {
  throw new Error("处理失败", { cause: err });
}
```

### 4.8 ES2023（ES14）

| 特性                                               | 用法                                          |
| -------------------------------------------------- | --------------------------------------------- |
| `Array.prototype.findLast` / `findLastIndex`       | 从数组末尾开始查找                            |
| **不改变原数组的数组方法**（Change Array by Copy） | `toSorted`、`toReversed`、`with`、`toSpliced` |
| `Array` / `TypedArray` 复制型方法                  | 返回新数组，不修改原数组（函数式友好）        |
| `#!` hashbang 语法                                 | 文件首行 `#!/usr/bin/env node` 被语法层面认可 |

```js
const nums = [5, 10, 3, 8];

// 从末尾查找
nums.findLast((n) => n < 9); // 8
nums.findLastIndex((n) => n < 9); // 3

// 不可变数组方法（原数组不变）
const sorted = nums.toSorted((a, b) => a - b); // [3,5,8,10]
const reversed = nums.toReversed(); // [8,3,10,5]
const replaced = nums.with(1, 99); // [5,99,3,8]
const spliced = nums.toSpliced(1, 2, 99); // [5,99,8]

console.log(nums); // [5,10,3,8] 原数组始终未被修改
```

> 💡 这组方法对**不可变数据结构 / React 状态更新**极友好，再也不用 `const copy = [...arr]; copy.sort()` 了。

### 4.9 ES2024（ES15）—— 最新稳定版

| 特性                              | 用法                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Array.fromAsync`                 | 异步可迭代 → 数组（支持 `async` 迭代器）                                                                           |
| `Object.groupBy` / `Map.groupBy`  | 按回调分组（返回对象 / Map）                                                                                       |
| `Promise.withResolvers`           | 一步拿到 `promise` + `resolve` + `reject`                                                                          |
| `RegExp` `/v` 标志（unicodeSets） | 更严格的 Unicode 集合运算，支持字符类集合差/交                                                                     |
| **`Set` 集合运算方法**            | `union` / `intersection` / `difference` / `symmetricDifference` / `isSubsetOf` / `isSupersetOf` / `isDisjointFrom` |
| **Iterator Helpers**              | 迭代器上的 `map`/`filter`/`take`/`drop`/`flatMap`/`reduce`/`toArray` 等                                            |

```js
// Object.groupBy
const byType = Object.groupBy(
  [{ t: "a" }, { t: "b" }, { t: "a" }],
  (item) => item.t,
); // { a: [{t:'a'},{t:'a'}], b: [{t:'b'}] }

// Promise.withResolvers：适合把回调式 API 包成 Promise
const { promise, resolve, reject } = Promise.withResolvers();
someCallbackApi((err, val) => (err ? reject(err) : resolve(val)));
await promise;

// Set 集合运算
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
a.union(b); // Set {1,2,3,4}
a.intersection(b); // Set {2,3}
a.difference(b); // Set {1}
a.isSubsetOf(b); // false

// Iterator Helpers（惰性、链式，不立即生成数组）
[1, 2, 3, 4]
  .values()
  .map((x) => x * 2)
  .filter((x) => x > 4)
  .toArray(); // [6, 8]
```

### 4.10 ES2025（ES16，最新）

ES2025 已定稿（2025 年 6 月），主要新增：

| 特性                              | 用法                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `import attributes`               | `import data from './x.json' with { type: 'json' }`（`assert` 已被 `with` 取代） |
| `RegExp.escape`                   | 静态方法，转义正则中的特殊字符，避免注入                                         |
| `Set` 方法稳定化 + 迭代器方法补全 | 进一步补齐集合/迭代器 API                                                        |

```js
// 导入 JSON 时声明类型（模块安全）
import config from "./config.json" with { type: "json" };

// RegExp.escape：动态构造正则时防注入
const safe = RegExp.escape(userInput);
new RegExp(safe, "g");
```

> ⚠️ ES2025 仍较新，实际项目使用前请确认目标运行环境（Node 22+ / 最新浏览器）是否已支持，老环境需 Babel 插件。

---

## 五、进阶与工程实践

### 5.1 运行环境支持度判断

- **现代浏览器 + 打包工具（Vite/Webpack）**：开发态通常无需转译；生产态由工具自动按 `browserslist` 配置做语法降级。
- **Node.js**：随版本逐步原生支持，可用 `node -e "console.log(process.version)"` 对照年份。
- **老环境（IE11 / 低版本 WebView）**：必须 Babel 转译 + core-js polyfill。

### 5.2 编译/转译工具链

| 工具                      | 角色                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| **Babel**                 | 把新语法转译为旧语法；用 `@babel/preset-env` + `core-js` 自动按目标环境加 polyfill |
| **TypeScript**            | 类型层 + 自己的 `target`/`lib` 控制输出 ES 版本                                    |
| **SWC / esbuild**         | 基于 Rust/Go 的高速转译器，常用于 Vite 底层                                        |
| **core-js / polyfill.io** | 提供缺失的 API 实现（`Promise`、`Array.includes` 等）                              |
| **browserslist**          | 统一声明“要兼容哪些浏览器”，被上述工具共用                                         |

```jsonc
// .browserslistrc 示例
> 0.5%
last 2 versions
not dead
```

```jsonc
// babel.config.json 示例
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage", // 按需引入 polyfill
        "corejs": 3,
      },
    ],
  ],
}
```

### 5.3 兼容性避坑清单

1. **语法 vs API 区别对待**：
   - `let`、`arrow`、解构、`?.` 是**语法**，老环境靠 **Babel 转译**；
   - `Promise`、`Array.includes`、`Object.groupBy` 是**运行时 API**，老环境靠 **polyfill**；
   - 只转译语法、不补 polyfill，运行时会 `xxx is not a function`。
2. **`??` 与 `||` 混用**必须加括号。
3. **`import()` 动态导入**在 CommonJS 模块里需要打包工具支持，纯 Node 旧版本可能不支持。
4. **私有字段 `#`** 无法被 Babel 完全安全地降级到 ES2015 class（会有运行时开销/限制），老环境慎用。
5. **顶层 `await`** 只能出现在 ESM，且会让模块变成“异步模块”，影响加载顺序。

### 5.4 性能与最佳实践

- 优先用 `const`，减少可变状态；
- 用 `Set`/`Map` 替代手写的对象哈希表，语义更清晰、键类型更自由；
- 用 `for...of` + 迭代器处理大数据，避免一次性生成巨型数组（`Array.from` 会展开全部）；
- 不可变数组方法（`toSorted` 等）虽方便，但大数据量下比原地方法慢，性能敏感路径权衡使用；
- `Proxy` 拦截会有性能成本，热路径（如每帧、大循环）避免对大量对象套 Proxy。

---

## 六、常见易错点与面试题

1. **`var` vs `let` vs `const` 的区别？** → 作用域、提升、TDZ、可重复声明、可重新赋值。
2. **箭头函数的 `this` 是怎么确定的？** → 词法作用域继承，不能通过 `call/bind` 改。
3. **`==` 和 `===` 的区别？ES2020 的 `??` 与 `||` 又有什么区别？** → `==` 会类型转换；`??` 只认 `null/undefined`，`||` 把 `0/''/false` 当假值。
4. **`Promise` 的状态流转与微任务时机？** → pending→fulfilled/rejected；“then 回调是微任务”。
5. **`for...in` 与 `for...of` 的区别？** → 前者遍历可枚举字符串键（含原型），后者遍历可迭代对象的值。
6. **`Object.assign` 是深拷贝吗？** → 否，浅拷贝；深拷贝要用结构化克隆（现代用 `structuredClone()`，ES2021/浏览器原生）。
7. **`Map` 和 `Object` 怎么选？** → 键非字符串、需频繁增删、需 `size` 与遍历时用 `Map`。
8. **`class` 是真正的类吗？** → 是原型继承的语法糖；私有成员要 ES2022 `#`。
9. **`async/await` 和 `Promise` 的关系？** → `async/await` 是 Promise 的语法糖，`await` 暂停的是 `async` 函数执行，不阻塞主线程。
10. **如何实现数组去重？** → `new Set(arr)`（仅基本类型）；对象去重需自定义 key。
11. **`?.` 链式里某层是 `0`、`''`、`false` 会怎样？** → 不会短路，只有 `null/undefined` 才短路。
12. **`BigInt` 能直接和 `Number` 运算吗？** → 不能，需统一类型（都转或都 `BigInt`）。

---

## 七、速查表与延伸阅读

### 7.1 年度 → 必记特性 速查

| 年份   | 一句话记住                                                                        |
| ------ | --------------------------------------------------------------------------------- |
| ES2015 | let/const、箭头、类、模块、Promise、解构、模板、Symbol、Map/Set、Proxy、Iterator  |
| ES2016 | `**`、`includes`                                                                  |
| ES2017 | `async/await`、`values/entries`、`padStart`                                       |
| ES2018 | `for await`、`{...rest}`、`finally`、正则增强                                     |
| ES2019 | `flat`、`fromEntries`、`trimStart`、可选 catch                                    |
| ES2020 | `?.`、`??`、`BigInt`、`import()`、`allSettled`、`globalThis`                      |
| ES2021 | 逻辑赋值、`replaceAll`、`Promise.any`、`WeakRef`、数字分隔符                      |
| ES2022 | 类 `#` 私有字段、静态块、顶层 `await`、`at(-1)`、`hasOwn`、Error.cause            |
| ES2023 | `findLast`、`toSorted/toReversed/with/toSpliced`（不可变数组）                    |
| ES2024 | `fromAsync`、`groupBy`、`Promise.withResolvers`、`Set` 集合运算、Iterator Helpers |
| ES2025 | `import ... with`、`RegExp.escape`                                                |

### 7.2 延伸阅读

- ECMA-262 标准全文（权威）：<https://ecma262.com/c/>
- 阮一峰《ECMAScript 6 入门》（中文最佳教程）：<https://es6.ruanyifeng.com/>
- MDN Web Docs — JavaScript：<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript>
- TC39 提案进度：<https://github.com/tc39/proposals>
- ECMAScript 兼容性表（caniuse / node.green）：<https://node.green/>

---

> 📌 **总结**：所谓“ES6”是一整套持续演进的标准。真正革命性的语法地基在 **ES2015**，而 `?.`/`??`（2020）、类私有字段（2022）、不可变数组方法（2023）、Iterator Helpers（2024）等则是逐年补强的现代化能力。作为前端工程师，应**按年份分层掌握**，并在工程中结合 Babel / TypeScript / 打包工具确保目标环境兼容。
