# TypeScript 入门到精通指南

> 一份面向前端开发工程师的 TypeScript 全流程学习与速查指南。
> 适用人群：**从入门到精通**。新手可按「快速入门 → 基础类型 → 类型进阶」顺序渐进；有经验者可直接查阅「高级类型」「避坑指南」「高频速查」。
>
> 参考资料：
>
> - TypeScript 官方文档：<https://www.typescriptlang.org/docs/>
> - 阮一峰《TypeScript 教程》：<https://wangdoc.com/typescript/>

---

## 目录

1. [认识 TypeScript](#一认识-typescript)
2. [环境搭建与工程化配置](#二环境搭建与工程化配置)
3. [基础类型](#三基础类型)
4. [类型进阶：联合、交叉、接口、收窄](#四类型进阶联合交叉接口收窄)
5. [函数与泛型](#五函数与泛型)
6. [面向对象：类与装饰器](#六面向对象类与装饰器)
7. [高级类型与类型编程](#七高级类型与类型编程)
8. [模块、命名空间与声明文件](#八模块命名空间与声明文件)
9. [前端框架中的 TypeScript](#九前端框架中的-typescript)
10. [快速入门速查（新手重点）](#十快速入门速查新手重点)
11. [非新手避坑与注意事项](#十一非新手避坑与注意事项)
12. [开发高频常用知识点速查](#十二开发高频常用知识点速查)
13. [常见面试题](#十三常见面试题)
14. [延伸阅读](#十四延伸阅读)

---

## 一、认识 TypeScript

### 1.1 TypeScript 是什么

**TypeScript 是 JavaScript 的超集（Superset）**：它在 JavaScript 的语法之上，增加了一套**静态类型系统**，任何合法的 JavaScript 代码都是合法的 TypeScript 代码。

```ts
// 合法的 JS（也是合法的 TS）
function add(a, b) {
  return a + b;
}

// 加上类型后的 TS
function add(a: number, b: number): number {
  return a + b;
}
```

一句话概括差异：

| 维度         | JavaScript        | TypeScript                            |
| ------------ | ----------------- | ------------------------------------- |
| 类型检查时机 | 运行时（runtime） | **编译时（compile time）**            |
| 类型是否保留 | —                 | **编译后类型全部被擦除**，产物是纯 JS |
| 错误发现     | 跑起来才报错      | 编辑器/编译阶段就报错                 |
| 面向场景     | 脚本、灵活        | 中大型工程、团队协作、长期维护        |

### 1.2 核心心智模型：类型只在编译期存在

这是新手最容易误解、也是理解一切 TS 现象的钥匙：

> **TypeScript 的类型信息在编译后会被完全擦除（Type Erasure），运行时不存在任何类型。**

```ts
interface User {
  name: string;
}

const user = { name: "Tom" };
console.log(user instanceof User); // ❌ 编译报错：接口只存在于类型层，运行时不存在
```

因此：

- 类型**不能**参与运行时逻辑（如 `typeof` 只能用于值，不能用于类型）；
- 类型断言 `as` **不会做任何运行时转换**，只是“让编译器闭嘴”；
- 想根据类型做运行时判断，必须自己写**类型守卫**（见 4.6）。

### 1.3 结构化类型系统（"鸭子类型"）

TypeScript 采用**结构化类型（Structural Typing）**：只要两个类型的**结构兼容**，就认为它们相等——不看名字，只看“形状”。

```ts
interface Point {
  x: number;
  y: number;
}

const p = { x: 1, y: 2, z: 3 };
const q: Point = p; // ✅ 结构兼容：p 至少有 x、y（多余属性在非字面量场景是允许的）
```

这与其他语言（如 Java/C#）的**名义类型（Nominal Typing）**不同——后者需要显式声明 `implements`。理解这一点，就能解释为什么两个毫不相干的 `interface` 可以互相赋值。

### 1.4 为什么用 TypeScript

- **提前发现错误**：把运行时 bug 变成编译期报错，尤其适合重构。
- **编辑器智能提示**：自动补全、跳转定义、重命名、内联文档。
- **代码即文档**：类型签名比注释更可靠、更不易过期。
- **工程规模**：类型是团队协作与大型项目可维护性的基础设施。

### 1.5 TypeScript 与 JavaScript 的版本演进

TS 通过 `target` 编译选项决定「降级」到哪个 JS 版本，由 `lib` 决定可用的内置类型库。常见组合：

- 现代浏览器/Vite 项目：`target: "ES2020"` 甚至 `ESNext`；
- 需兼容老环境：调低 `target`，由 `tsc` 或 Babel/esbuild 降级。

---

## 二、环境搭建与工程化配置

### 2.1 安装

```bash
# 全局（仅用于体验 CLI）
npm i -g typescript

# 项目内（推荐，锁定版本）
npm i -D typescript

# 查看版本
npx tsc --version
```

### 2.2 编译与运行

```bash
# 初始化配置文件
npx tsc --init

# 编译（依据 tsconfig.json）
npx tsc

# 只做类型检查、不产出文件（CI / 提交前检查常用）
npx tsc --noEmit

# 监听模式
npx tsc --watch

# 直接运行 .ts（开发调试）
npx ts-node index.ts      # 或更快更现代：npx tsx index.ts
```

> ⚠️ **重要区别**：`tsc` 既做类型检查**又**转译成 JS；而 `esbuild`、`swc`、`babel`、`Vite` **只转译、不做类型检查**。所以用 Vite/webpack 开发时，务必额外跑一次 `tsc --noEmit`（或 `vue-tsc`）来发现类型错误，否则类型错误会“悄悄溜过”。

### 2.3 tsconfig.json 详解（工程化核心）

```jsonc
{
  "compilerOptions": {
    /* ---- 语言与输出 ---- */
    "target": "ES2020", // 编译目标 JS 版本
    "module": "ESNext", // 模块系统：ESNext / CommonJS / NodeNext
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 可用的内置类型定义
    "moduleResolution": "Bundler", // 模块解析策略（Vite/打包器用 Bundler，Node 用 NodeNext）

    /* ---- 严格性（强烈建议全开） ---- */
    "strict": true, // 总开关，开启下面所有严格选项
    "noImplicitAny": true, // 禁止隐式 any
    "strictNullChecks": true, // null/undefined 必须显式处理
    "strictFunctionTypes": true, // 函数参数逆变检查
    "strictPropertyInitialization": true, // 类属性必须初始化
    "noUncheckedIndexedAccess": true, // 索引访问结果自动加 undefined（很严格但很安全）
    "exactOptionalPropertyTypes": true,

    /* ---- 代码检查 ---- */
    "noUnusedLocals": true, // 未使用的局部变量报错
    "noUnusedParameters": true, // 未使用的参数报错
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true, // 覆写父类方法必须加 override

    /* ---- 互操作与产物 ---- */
    "esModuleInterop": true, // 兼容 CommonJS 的默认导入
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true, // 跳过 node_modules 中 d.ts 检查，加速
    "resolveJsonModule": true, // 允许 import json
    "isolatedModules": true, // 保证每个文件可独立转译（Vite/babel 必需）
    "forceConsistentCasingInFileNames": true,

    /* ---- 路径 ---- */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"], // 路径别名，需同步配置打包器
    },
    "outDir": "dist",
    "declaration": true, // 生成 .d.ts
    "sourceMap": true,
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
}
```

关键选项一句话记忆：

| 选项               | 作用                 | 建议                           |
| ------------------ | -------------------- | ------------------------------ |
| `strict`           | 严格模式总开关       | **必开**                       |
| `noImplicitAny`    | 禁止隐式 any         | **必开**                       |
| `strictNullChecks` | 空值类型检查         | **必开**，否则类型系统形同虚设 |
| `skipLibCheck`     | 跳过第三方 d.ts 检查 | 开，显著提速                   |
| `isolatedModules`  | 每个文件独立编译     | Vite/babel 场景必开            |
| `paths`            | 路径别名             | 需与打包器 alias 保持一致      |
| `noEmit`           | 只检查不输出         | 打包器项目配合使用             |

### 2.4 常见项目脚手架

```bash
# Vite
npm create vite@latest my-app -- --template react-ts   # 或 vue-ts

# Next.js
npx create-next-app@latest --ts
```

---

## 三、基础类型

### 3.1 原始类型（Primitive Types）

```ts
let isDone: boolean = false;
let age: number = 25; // 整数/浮点/NaN/Infinity 都是 number
let big: bigint = 100n; // 大整数，需 target >= ES2020
let name: string = "Tom";
let sym: symbol = Symbol("id");

// null 与 undefined（strictNullChecks 开启时是独立类型）
let n: null = null;
let u: undefined = undefined;
```

> TS 中的 `number` 不区分 int/float；所有数字（含 `NaN`、`Infinity`）都是 `number`。

### 3.2 数组与元组

```ts
let list: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3]; // 等价写法

// 只读数组
let ro: readonly number[] = [1, 2, 3];
// ro.push(4); // ❌ 报错

// 元组 Tuple：长度与每个位置的类型都固定
let tuple: [string, number] = ["Tom", 25];
tuple[0].toUpperCase(); // ✅ 知道第 0 位是 string

// 具名元组（可读性更好）
let point: [x: number, y: number] = [1, 2];

// 可选元素 + 剩余元素
let opt: [string, number?] = ["a"];
let rest: [string, ...number[]] = ["a", 1, 2, 3];

// 只读元组
let roTuple: readonly [string, number] = ["a", 1];
```

### 3.3 特殊类型：any / unknown / never / void

| 类型      | 含义                                               | 使用建议                              |
| --------- | -------------------------------------------------- | ------------------------------------- |
| `any`     | **关闭类型检查**，可任意读写、任意调用             | 尽量不用；只在迁移旧代码/临时占位时用 |
| `unknown` | **安全版 any**：什么都能赋值给它，但用之前必须收窄 | **优先用 unknown 替代 any**           |
| `never`   | 永不存在的值（抛异常/死循环/穷尽检查）             | 用于穷尽性检查、不可能的分支          |
| `void`    | 函数无返回值                                       | 作为无返回值函数的返回类型            |

```ts
// any：放弃了所有检查
let a: any = 1;
a.toFixed();
a.hello.world; // ✅ 编译通过，运行时炸

// unknown：安全，必须先判断
let x: unknown = "hello";
// x.toUpperCase();          // ❌ 报错：unknown 不能直接当 string 用
if (typeof x === "string") {
  x.toUpperCase(); // ✅ 收窄后可安全使用
}

// never：穷尽性检查的经典用法
type Shape = { kind: "circle" } | { kind: "square" };
function area(s: Shape) {
  switch (s.kind) {
    case "circle":
      return 1;
    case "square":
      return 2;
    default:
      const _exhaustive: never = s; // 若漏了分支，这里会报错
      return _exhaustive;
  }
}
```

> **最佳实践**：默认用 `unknown`，而不是 `any`。`any` 会“传染”——一旦某个值是 `any`，基于它的运算结果也全是 `any`。

### 3.4 字面量类型（Literal Types）

```ts
let dir: "up" | "down" = "up"; // 只能取这两个字符串之一
let level: 1 | 2 | 3 = 3; // 数字字面量
let flag: true = true; // 布尔字面量
```

字面量类型常配合联合类型，实现“枚举式的字符串集合”，比 `enum` 更轻量（见 11.3）。

### 3.5 枚举 enum

```ts
// 数字枚举：默认从 0 开始自增
enum Direction {
  Up, // 0
  Down, // 1
}

// 字符串枚举（推荐：可读性好、调试友好）
enum Status {
  Success = "SUCCESS",
  Fail = "FAIL",
}

// 常量枚举：编译后完全内联，不产生运行时对象
const enum Color {
  Red = "RED",
}
const c = Color.Red; // 编译后直接变成 "RED"
```

> ⚠️ 数字枚举有两个“坑”：① 反向映射（会生成 `Direction[0] === "Up"` 的运行时对象）；② 任意数字都能赋值（`let d: Direction = 99` 不报错，除非用字符串枚举）。**新项目优先考虑用 `as const` 对象 + 联合类型**（见 11.3）。

### 3.6 object / Object / {}

```ts
let a: object = {}; // ✅ 表示“非原始类型”，不含 number/string/boolean 等
let b: Object = 1; // ✅ 几乎等于 any，能接受几乎一切（不推荐）
let c: {} = 1; // ✅ 表示“非 null/undefined”，能接受数字字符串（极易误解）
```

> **避坑**：想表达「任意对象」用 `object` 或 `Record<string, unknown>`；`{}` 的含义是“任何非空值”，并不是“空对象”。

### 3.7 类型注解 vs 类型推断

```ts
let a = 1; // 推断为 number（推荐：简单值让 TS 推断）
let b: number = 1; // 显式注解

function add(x: number, y: number) {
  return x + y;
}
// 返回值自动推断为 number，无需手写

const arr = [1, 2, 3]; // 推断为 number[]
const obj = { a: 1, b: "x" }; // 推断为 { a: number; b: string }
```

**原则**：能推断出来的不要手写；**函数参数、公共 API、复杂对象**建议显式标注。

---

## 四、类型进阶：联合、交叉、接口、收窄

### 4.1 联合类型（Union）

```ts
let id: string | number;
id = "abc";
id = 123;
// id.toUpperCase();  // ❌ 报错：number 上没有该方法，需先收窄

function printId(id: string | number) {
  if (typeof id === "string")
    id.toUpperCase(); // ✅ 收窄
  else id.toFixed(2);
}
```

### 4.2 交叉类型（Intersection）

```ts
interface A {
  a: number;
}
interface B {
  b: string;
}
type C = A & B; // 同时拥有 a 和 b

const c: C = { a: 1, b: "x" };
```

> 联合 `|` 是“或”，交叉 `&` 是“且”。注意：把两个冲突类型交叉（如 `string & number`）会得到 `never`。

### 4.3 类型别名 type 与接口 interface

```ts
type Point = { x: number; y: number };
type ID = string | number; // 别名可以给联合/交叉/原始类型起名
type Fn = (a: number) => string;

interface User {
  name: string;
  age?: number; // 可选属性
  readonly id: number; // 只读属性
}
```

**interface vs type 对比**：

| 能力                           | `interface`  | `type`            |
| ------------------------------ | ------------ | ----------------- |
| 描述对象结构                   | ✅           | ✅                |
| 联合 / 交叉 / 给原始类型起别名 | ❌           | ✅                |
| 声明合并（同名自动合并）       | ✅           | ❌                |
| 扩展                           | `extends`    | 交叉 `&`          |
| 实现类                         | `implements` | 也可 `implements` |
| 性能（大项目）                 | 略优         | 略差              |

**选择建议**：描述对象/类的结构、需要被扩展或声明合并 → 用 `interface`；需要联合类型、工具类型、给复杂类型起名 → 用 `type`。

### 4.4 索引签名与 Record

```ts
// 索引签名
interface Dict {
  [key: string]: number;
}
const d: Dict = { a: 1, b: 2 };

// Record 更常用（等价写法）
const d2: Record<string, number> = { a: 1 };

// 已知固定键 + 任意其他键
interface Mixed {
  name: string;
  [key: string]: string; // 注意：其他所有属性的类型必须能赋值给 string
}
```

> ⚠️ 索引签名会让**所有**属性都得满足该类型；如果键是有限的，优先用字面量联合类型定义「映射对象」。

### 4.5 类型断言 as 与非空断言 !

```ts
const el = document.getElementById("app") as HTMLDivElement; // 断言为具体元素

// 双重断言（先 unknown 再 as）——只在真的很确定时用
const x = "hello" as unknown as number;

// 非空断言：告诉编译器“这个值一定不是 null/undefined”
const el2 = document.querySelector(".box")!;

// 明确赋值断言（类属性）
class C {
  prop!: string; // 我保证使用前会被赋值
}
```

> ⚠️ **断言是“绕过检查”，不是“类型转换”**。运行时不会做任何转换，断错了照样崩。能用类型守卫就别用 `as`。**禁止用 `as any` 来消除报错**——那只是掩盖了真正的类型问题。

### 4.6 类型收窄（Narrowing）——TS 最核心的能力之一

TypeScript 会根据运行时判断**自动把宽类型收窄为窄类型**：

```ts
function format(x: string | number | Date) {
  if (typeof x === "string") return x.trim(); // typeof 收窄
  if (x instanceof Date) return x.toISOString(); // instanceof 收窄
  return x.toFixed(2); // 剩下 number
}
```

常用收窄手段：

| 手段         | 示例                                         |
| ------------ | -------------------------------------------- |
| `typeof`     | `typeof x === "string"`                      |
| `instanceof` | `x instanceof Array`                         |
| `in`         | `"name" in obj`                              |
| 真值判断     | `if (x) { ... }`（排除 null/undefined/0/""） |
| 相等判断     | `x === "a"`                                  |
| 判别联合     | 见下                                         |
| 自定义守卫   | 见下                                         |

**判别联合（Discriminated Union）**——最实用的模式：

```ts
type Result = { ok: true; data: string } | { ok: false; error: string };

function handle(r: Result) {
  if (r.ok) {
    r.data; // ✅ 自动收窄，能访问 data
  } else {
    r.error; // ✅ 自动收窄，能访问 error
  }
}
```

**自定义类型守卫（Type Predicate）**：

```ts
function isString(v: unknown): v is string {
  return typeof v === "string";
}

// 断言函数（assertion function）
function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") throw new Error("not a string");
}
```

---

## 五、函数与泛型

### 5.1 函数类型

```ts
// 直接写类型
function add(a: number, b: number): number {
  return a + b;
}

// 函数类型表达式
type MathFn = (a: number, b: number) => number;
const sub: MathFn = (a, b) => a - b;

// 调用签名（对象带可调用性）
interface Callable {
  (x: number): number;
  desc: string;
}
```

### 5.2 参数特性

```ts
// 可选参数（必须在必选参数之后）
function f(a: number, b?: number) {}

// 默认参数（自动变可选）
function g(a: number, b = 10) {}

// 剩余参数
function h(...nums: number[]) {}

// 参数解构 + 类型
function draw({ x, y }: { x: number; y: number }) {}
```

### 5.3 函数重载（Overload）

```ts
// 重载签名
function fn(x: string): string;
function fn(x: number): number;
// 实现签名（对外不可见）
function fn(x: string | number): string | number {
  return typeof x === "string" ? x : x;
}
```

> 当同一函数对不同入参有不同返回类型时，用重载。**重载签名必须都兼容实现签名**。

### 5.4 this 类型

```ts
function handler(this: HTMLElement, e: Event) {
  this.textContent = "clicked"; // this 类型显式声明
}
element.addEventListener("click", handler);
```

### 5.5 泛型（Generics）——类型层面的“参数”

泛型让类型可以**被“传入”并复用**，而不是丢失信息。

```ts
// 泛型函数：T 是类型参数
function identity<T>(arg: T): T {
  return arg;
}

identity<string>("a"); // 显式
identity(123); // 自动推断 T = number

// 泛型约束：T 必须拥有 length 属性
function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}

// 多类型参数
function pair<K, V>(k: K, v: V): [K, V] {
  return [k, v];
}

// 默认类型参数
function create<T = string>(): T {
  return null as T;
}
```

**泛型接口 / 泛型类 / 泛型别名**：

```ts
interface Box<T> {
  value: T;
}

class Stack<T> {
  private items: T[] = [];
  push(item: T) {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
}

type ApiResponse<T> = {
  code: number;
  data: T;
  message: string;
};

// 使用
type UserResp = ApiResponse<{ id: number; name: string }>;
```

**泛型 + keyof 的经典组合**：

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Tom", age: 25 };
const name = getProp(user, "name"); // 类型为 string
// getProp(user, "email");            // ❌ 报错：不存在该键
```

---

## 六、面向对象：类与装饰器

### 6.1 基本类

```ts
class Person {
  public name: string; // 公开（默认）
  private age: number; // 仅类内部可访问
  protected gender: string; // 类内部及子类可访问
  readonly id: number; // 只读（只能在声明处或构造函数中赋值）
  static species = "human"; // 静态成员

  constructor(name: string, age: number, id: number, gender: string) {
    this.name = name;
    this.age = age;
    this.id = id;
    this.gender = gender;
  }

  get info(): string {
    return `${this.name}`;
  }
  set rename(v: string) {
    this.name = v;
  }
}
```

### 6.2 参数属性（简写）

```ts
class Person {
  // 在构造函数参数上加修饰符，自动声明并赋值
  constructor(
    public name: string,
    private age: number,
    readonly id: number,
  ) {}
}
```

### 6.3 继承与抽象类

```ts
abstract class Animal {
  abstract speak(): string; // 抽象方法，子类必须实现
  move() {
    console.log("moving");
  }
}

class Dog extends Animal {
  override speak() {
    return "woof";
  } // override 显式声明覆写（noImplicitOverride）
}

// 接口实现
interface Serializable {
  serialize(): string;
}
class Data implements Serializable {
  serialize() {
    return "";
  }
}
```

> ⚠️ `private` / `protected` 是**编译期约束**，运行时并不真正私有；要运行时私有请用 **ES2022 的 `#` 私有字段**：

```ts
class Counter {
  #count = 0; // 真正的运行时私有
  increment() {
    this.#count++;
  }
}
```

### 6.4 严格属性初始化

开启 `strictPropertyInitialization` 后，类属性必须在构造函数中初始化，否则需要：

```ts
class A {
  // 方式一：明确赋值断言
  name!: string;
  // 方式二：给默认值
  age = 0;
  // 方式三：可选
  ok?: boolean;
}
```

### 6.5 装饰器（Decorators）

装饰器是**给类/方法/属性/参数附加元编程逻辑**的语法。TS 5.0 起支持**标准 ES 装饰器**（不再需要 `experimentalDecorators`）。

```ts
// 标准装饰器（TS 5.0+ / ES 提案）
function logged<T extends (...args: any[]) => any>(
  target: T,
  context: ClassMethodDecoratorContext,
) {
  return function (this: unknown, ...args: Parameters<T>) {
    console.log(`call ${String(context.name)}`);
    return target.apply(this, args);
  };
}

class Service {
  @logged
  run() {
    /* ... */
  }
}
```

> 注意：**旧版装饰器**（`experimentalDecorators: true`）与**标准装饰器**语法/签名不同，混用会冲突。老项目（Angular、NestJS、TypeORM）多用旧版，新项目若不用框架装饰器，谨慎采用。属性装饰器、参数装饰器目前仍主要依赖旧版提案。

---

## 七、高级类型与类型编程

这一节是「精通 TypeScript」的分水岭。核心是：**类型也可以被计算**。

### 7.1 keyof（取键联合）

```ts
interface User {
  id: number;
  name: string;
}
type UserKeys = keyof User; // "id" | "name"
```

### 7.2 typeof（从值取类型）

```ts
const config = { host: "localhost", port: 8080 };
type Config = typeof config; // { host: string; port: number }

// 从数组/常量取类型
const colors = ["red", "green"] as const;
type Color = (typeof colors)[number]; // "red" | "green"
```

### 7.3 索引访问类型 T[K]

```ts
type User = { id: number; name: string };
type NameType = User["name"]; // string
type ValueType = User[keyof User]; // number | string
```

### 7.4 条件类型（Conditional Types）

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"a">; // true
type B = IsString<1>; // false
```

**分发条件类型（Distributive）**：当条件类型作用于**裸类型参数**且传入联合类型时，会分发给每个成员：

```ts
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>; // string[] | number[]
```

### 7.5 infer（在条件类型中推断类型）

```ts
// 取函数返回值类型
type MyReturn<T> = T extends (...args: any[]) => infer R ? R : never;

// 取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;
type E = ElementType<number[]>; // number

// 取 Promise 包裹的类型
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type U = Unwrap<Promise<string>>; // string

// 取函数的第一个参数类型
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any
  ? F
  : never;
```

### 7.6 映射类型（Mapped Types）

```ts
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 修饰符 +/-：去掉 readonly / ?
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Required2<T> = { [K in keyof T]-?: T[K] };

// 键名重映射（as）+ 模板字面量
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

### 7.7 模板字面量类型（Template Literal Types）

```ts
type EventName = "click" | "focus";
type HandlerName = `on${Capitalize<EventName>}`; // "onClick" | "onFocus"

// 常用内置字符串工具类型
// Uppercase / Lowercase / Capitalize / Uncapitalize
type T = Capitalize<"hello">; // "Hello"
```

### 7.8 内置工具类型（Utility Types）——日常最高频

| 工具类型                                        | 作用                | 示例结果                                       |
| ----------------------------------------------- | ------------------- | ---------------------------------------------- |
| `Partial<T>`                                    | 所有属性变可选      | `{a?: number}`                                 |
| `Required<T>`                                   | 所有属性变必选      | `{a: number}`                                  |
| `Readonly<T>`                                   | 所有属性变只读      | `{readonly a: number}`                         |
| `Pick<T, K>`                                    | 挑选若干属性        | `Pick<User, "id">`                             |
| `Omit<T, K>`                                    | 排除若干属性        | `Omit<User, "id">`                             |
| `Record<K, V>`                                  | 构造键值对象        | `Record<string, number>`                       |
| `Exclude<T, U>`                                 | 从联合中排除        | `Exclude<"a"\|"b", "a">` → `"b"`               |
| `Extract<T, U>`                                 | 从联合中提取        | `Extract<"a"\|"b", "a">` → `"a"`               |
| `NonNullable<T>`                                | 去掉 null/undefined | `NonNullable<string\|null>` → `string`         |
| `Parameters<F>`                                 | 函数参数元组        | `Parameters<(a:number)=>void>` → `[a: number]` |
| `ReturnType<F>`                                 | 函数返回值类型      | `ReturnType<()=>string>` → `string`            |
| `ConstructorParameters<C>`                      | 构造参数元组        |                                                |
| `InstanceType<C>`                               | 实例类型            |                                                |
| `Awaited<T>`                                    | 展开 Promise        | `Awaited<Promise<string>>` → `string`          |
| `ThisParameterType<F>` / `OmitThisParameter<F>` | 处理 this 参数      |                                                |
| `ThisType<T>`                                   | 指定 this 上下文    |                                                |

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

type UserPreview = Pick<User, "id" | "name">;
type UserUpdate = Partial<Omit<User, "id">>;
type UserMap = Record<string, User>;
type R = ReturnType<typeof setTimeout>; // NodeJS.Timeout | number
```

### 7.9 递归类型与类型体操

```ts
// 递归：深层 Partial
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 把联合类型转成交叉类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

// 取对象所有路径
type Paths<T> = {
  [K in keyof T]: T[K] extends object
    ? `${string & K}.${Paths<T[K]>}`
    : string & K;
}[keyof T];
```

> 类型体操能提升库的作者能力，但**业务代码不要过度炫技**——可读性优先。复杂类型可用注释或拆解成中间类型。

---

## 八、模块、命名空间与声明文件

### 8.1 模块与类型导入

```ts
// 普通导入
import { User } from "./types";

// 只导入类型（编译后会被完全删除，避免运行时副作用）
import type { User } from "./types";

// 混合导入
import { getData, type User } from "./api";

// 类型导出
export type { User };

// 默认导出 / 命名空间导入
import React from "react";
import * as utils from "./utils";
```

> **最佳实践**：`isolatedModules` 开启时，只用作类型的导入**必须**用 `import type`，否则打包器不知道该不该删除它。

### 8.2 命名空间 namespace

`namespace` 是 TS 早期的模块组织方式，现代项目**基本被 ES Module 取代**，仅在声明文件或全局脚本中见到：

```ts
namespace Validation {
  export interface StringValidator {
    isValid(s: string): boolean;
  }
}
```

### 8.3 声明文件 .d.ts

给「没有类型的 JS 库」补类型，或声明全局变量：

```ts
// types/global.d.ts
declare const __VERSION__: string;

declare module "some-untyped-lib" {
  export function doSomething(x: number): string;
}

// 扩展已有模块（模块扩充）
declare module "express" {
  interface Request {
    userId?: string;
  }
}

// 扩展全局（如 window）
declare global {
  interface Window {
    __APP__: { version: string };
  }
}
export {}; // 有 import/export 时，需此写法才能让 declare global 生效
```

安装第三方类型：

```bash
npm i -D @types/lodash @types/node
```

> `@types/node` 提供 `process`、`Buffer`、`__dirname` 等 Node 类型；React/Vue 项目常需它来给 `process.env` 提供类型。

---

## 九、前端框架中的 TypeScript

### 9.1 React

```tsx
// 函数组件 props
interface Props {
  title: string;
  count?: number;
  onChange?: (v: number) => void;
  children?: React.ReactNode;
}
const Card: React.FC<Props> = ({ title, count = 0 }) => (
  <div>
    {title}: {count}
  </div>
);

// 常用事件类型
function Input() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
  return <input onChange={handleChange} />;
}

// useState / useRef / useReducer
const [user, setUser] = useState<User | null>(null);
const inputRef = useRef<HTMLInputElement>(null);

// useReducer 判别联合
type Action = { type: "inc" } | { type: "dec"; by: number };
function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "inc":
      return state + 1;
    case "dec":
      return state - action.by;
  }
}

// 泛型组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
function List<T>({ items, renderItem }: ListProps<T>) {
  return <>{items.map(renderItem)}</>;
}
```

> ⚠️ `React.FC` 会自动带上 `children`，若组件不想要 children，建议直接用函数签名 `(props: Props) => JSX.Element`。React 18 起 `FC` 不再隐式包含 `children`（需显式声明）。

### 9.2 Vue 3

```vue
<script setup lang="ts">
import { ref, computed, reactive } from "vue";

interface User {
  id: number;
  name: string;
}

const props = defineProps<{ title: string; user?: User }>();
const emit = defineEmits<{
  (e: "change", value: number): void;
  (e: "update", user: User): void;
}>();

const count = ref(0); // Ref<number>
const user = reactive<User>({ id: 1, name: "Tom" });
const double = computed(() => count.value * 2);

// 模板引用
const inputEl = ref<HTMLInputElement | null>(null);
</script>
```

### 9.3 类型安全的 API 请求

```ts
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

interface User {
  id: number;
  name: string;
}
const user = await request<User>("/api/user/1"); // user 类型为 User
```

### 9.4 DOM 与浏览器类型

```ts
document.querySelector<HTMLInputElement>("#name")?.value;
const nodes = document.querySelectorAll<HTMLLIElement>("li"); // NodeListOf<HTMLLIElement>
window.localStorage.getItem("token"); // string | null（strictNullChecks 下必须处理 null）
```

---

## 十、快速入门速查（新手重点）

如果时间有限，先吃透这 15 条，就能应对 80% 的日常开发。

1. **类型注解**：`let x: number = 1;`——先会标注，再学推断。
2. **接口描述对象**：`interface User { id: number; name?: string }`。
3. **联合类型**：`string | number`，用 `typeof` 收窄。
4. **字面量联合替代枚举**：`type Status = "on" | "off"`。
5. **函数类型**：参数与返回都标类型；可选参数用 `?`。
6. **数组与元组**：`number[]`、`[string, number]`。
7. **泛型基础**：`function id<T>(x: T): T`，`Array<T>` / `Promise<T>`。
8. **接口/类型别名**：对象结构用 `interface`，联合/工具类型用 `type`。
9. **`unknown` 替代 `any`**：安全兜底。
10. **`as const`**：让字面量保持窄类型。
11. **`import type`**：只导入类型，避免打包体积。
12. **工具类型**：`Partial` / `Pick` / `Omit` / `Record` / `ReturnType`。
13. **`strictNullChecks`**：空值必须处理（`?.` 和 `??` 是好帮手）。
14. **类型守卫**：`typeof` / `instanceof` / `in` / `is`。
15. **`tsc --noEmit`**：提交前跑一次类型检查。

```ts
// 综合小例子
import type { User } from "./types";

type Status = "idle" | "loading" | "success" | "error";

function render(status: Status, user?: User | null) {
  switch (status) {
    case "loading":
      return "加载中…";
    case "success":
      return user?.name ?? "未知用户";
    default:
      return "";
  }
}
```

---

## 十一、非新手避坑与注意事项

这一节是**踩过坑的人才会写的内容**，请重点阅读。

### 11.1 any 会“传染”并击穿类型系统

```ts
const data: any = JSON.parse(str);
const id = data.user.id; // 一路 any，出错也查不出来
```

**替代方案**：用 `unknown` + 类型守卫/`as` 精确断言，或引入运行时校验库（zod、valibot）解析后再得到**可信类型**。

### 11.2 `as` 断言不是万能的，更不是转换

```ts
const x = "123" as number; // ❌ 编译报错（不能直接字符串→数字）
const y = "123" as unknown as number; // ✅ 编译通过，但运行时 y 仍是字符串！
```

### 11.3 枚举的坑

- 数字枚举可赋值任意数字、有反向映射、产物体积大；
- `const enum` 在 `isolatedModules` / `babel` 下可能报错（跨文件内联受限）；
- **推荐**：优先用 `as const` + 联合类型。

```ts
// 推荐写法：既有常量值，又有窄类型
const STATUS = {
  Idle: "idle",
  Loading: "loading",
} as const;
type Status = (typeof STATUS)[keyof typeof STATUS]; // "idle" | "loading"
```

### 11.4 `{}`、`object`、`Object` 别乱用

见 3.6：`{}` 表示“非 null/undefined”，而非“空对象”；`Object` 几乎等同 `any`。

### 11.5 空值严格检查带来的连锁问题

`strictNullChecks` 开启后：

```ts
const el = document.querySelector(".box");
el.innerHTML = ""; // ❌ el 可能是 null
el?.innerHTML = "..."; // ✅ 可选链
```

- `localStorage.getItem` 返回 `string | null`，用前必须判空；
- 数组访问 `arr[i]` 在 `noUncheckedIndexedAccess` 下是 `T | undefined`；
- 函数返回值记得区分“无值”与“undefined”。

### 11.6 函数参数的双变（协变/逆变）

`strictFunctionTypes` 开启后，**函数参数是逆变的**：

```ts
type Handler = (e: MouseEvent) => void;
let h: Handler = (e: Event) => {}; // ✅ 参数更宽，兼容（逆变）
// let h2: (e: Event) => void = (e: MouseEvent) => {}; // ❌ 参数更窄，不兼容
```

方法（method）参数是双变的，函数属性参数是逆变的——这是很多“为什么这里能过、那里不能过”的原因。

### 11.7 对象字面量的“多余属性检查”

```ts
interface Point {
  x: number;
  y: number;
}
const p: Point = { x: 1, y: 2, z: 3 }; // ❌ 直接字面量会被“多余属性检查”拦截
const tmp = { x: 1, y: 2, z: 3 };
const p2: Point = tmp; // ✅ 经变量中转则允许（结构兼容）
```

> 这是设计上的有意行为，用来捕获拼写错误（如 `nmae`）。

### 11.8 数组协变带来的不安全

```ts
const animals: Animal[] = [];
const dogs: Dog[] = [];
animals.push(...dogs); // ✅ 允许（数组是协变的）
animals.push(new Cat()); // 编译期没问题，但语义上“狗数组”混进了猫
```

### 11.9 索引签名的“污染”与 `noUncheckedIndexedAccess`

```ts
const dict: Record<string, number> = {};
const v = dict["missing"]; // 类型是 number，但运行时是 undefined！
```

开启 `noUncheckedIndexedAccess` 后会得到 `number | undefined`，更安全，但需要更多判空。

### 11.10 类型擦除导致的运行时错觉

- `enum`、`namespace`、带参数属性/装饰器的类会产生运行时代码，其余类型**全部消失**；
- 不能 `instanceof interface`、不能用类型做 `switch`；
- 泛型在运行时不存在，无法 `new T()` 或 `T.name`。

### 11.11 `interface` 声明合并可能“意外”发生

```ts
interface Window {
  a: number;
}
interface Window {
  b: string;
} // 自动合并为 { a; b }
```

同名 `interface` 会合并（`type` 则报重复）。这在与第三方库类型冲突时可能莫名多出属性。

### 11.12 其它高频注意点

- **`readonly` 只是编译期**：不阻止运行时改写；`readonly` 数组不等于 `Object.freeze`。
- **`never` 的分发**：`never` 参与联合会被吞掉（`never | string` = `string`）。
- **条件类型在 `any` 上会返回联合**：`IsString<any>` 可能得到 `boolean`，排查类型异常时注意。
- **`tsc` 与打包器不一致**：Vite/esbuild 只转译不检查，务必补 `tsc --noEmit`。
- **`skipLibCheck: false` 的代价**：会检查所有 `.d.ts`，慢且可能报第三方库的错。
- **不要忽略 `// @ts-ignore`**：优先 `@ts-expect-error`（当错误消失时它会报错，提醒你删掉）。

### 11.13 严格模式迁移建议

老 JS 项目迁移：

1. 先开 `allowJs` + `checkJs: false`，让 TS 与 JS 共存；
2. 逐步把文件改成 `.ts`，**从叶子模块往核心改**；
3. 打开 `strict` 之前先修 `noImplicitAny`；
4. 用 `// @ts-expect-error` 做临时标注，逐步清理；
5. 最后开 `strictNullChecks`，这是收益最大但改动最多的一步。

---

## 十二、开发高频常用知识点速查

### 12.1 常用工具类型（背下来）

```ts
(Partial < T > Required < T > Readonly < T > Pick < T, K > Omit<T, K>);
(Record < K, V > Exclude < T, U > Extract < T, U > NonNullable<T>);
Parameters < F > ReturnType < F > Awaited < T > InstanceType<C>;
```

### 12.2 高频写法片段

```ts
// 1) 只读深拷贝类型
type ReadonlyDeep<T> = { readonly [K in keyof T]: ReadonlyDeep<T[K]> };

// 2) 从常量数组取联合类型
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number]; // "admin" | "user" | "guest"

// 3) 函数返回值推断
const createUser = () => ({ id: 1, name: "Tom" });
type User = ReturnType<typeof createUser>;

// 4) 保证对象键的完整性（映射约束）
const handlers: Record<"click" | "focus", () => void> = {
  click: () => {},
  focus: () => {}, // 少一个键会报错
};

// 5) 组件/函数可传任意 props 但保留提示
type Props = { id: number } & Record<string, unknown>;

// 6) 类型安全的字符串键取值
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// 7) 收窄并处理空值
const name = (user?.profile?.name ?? "匿名").trim();

// 8) 枚举式常量对象（替代 enum）
const Direction = { Up: "up", Down: "down" } as const;
type Direction = (typeof Direction)[keyof typeof Direction];

// 9) 断言函数
function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg ?? "assertion failed");
}

// 10) 排除某属性
type WithoutId<T> = Omit<T, "id">;
```

### 12.3 类型检查与格式化工具链

```bash
tsc --noEmit        # 类型检查（CI 必跑）
vue-tsc --noEmit    # Vue 单文件组件类型检查
eslint --fix        # 配合 @typescript-eslint
prettier --write .  # 格式化
```

### 12.4 与运行时校验搭配

类型只在编译期有效，**外部数据（接口返回、localStorage、URL 参数）必须在运行时校验**：

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
});
type User = z.infer<typeof UserSchema>; // 从 Schema 反推类型

const user = UserSchema.parse(JSON.parse(raw)); // 运行时校验 + 类型安全
```

---

## 十三、常见面试题

1. **interface 与 type 的区别？** 见 4.3。
2. **any 与 unknown 的区别？** `any` 放弃检查可任意使用；`unknown` 是安全版，用前必须收窄。
3. **never 有什么用？** 表示不可能的值，用于穷尽性检查和函数抛异常返回类型。
4. **TS 是强类型还是弱类型？** 静态类型、结构化类型；不是运行时强类型。
5. **类型断言和类型转换的区别？** 断言只影响编译期，不做运行时转换。
6. **泛型约束是什么？** `T extends U`，保证类型参数满足某些结构。
7. **条件类型与 infer 的作用？** 在类型层面做分支与提取（如 `ReturnType`）。
8. **映射类型的原理？** `[K in keyof T]` 遍历键，可加 `?`/`readonly` 修饰符与 `as` 重映射。
9. **`keyof` 与 `typeof` 区别？** `keyof` 取类型的键联合；`typeof` 从**值**取类型。
10. **为什么要有 `strictNullChecks`？** 让 `null`/`undefined` 成为独立类型，强制处理空值，避免 `null` 崩溃。
11. **TS 编译后还剩什么？** 只保留被擦除后无法消除的产物（enum、namespace、装饰器辅助代码）；纯类型全部消失。
12. **如何处理第三方库没有类型？** 装 `@types/xxx`，或自写 `.d.ts`，或 `declare module`。

---

## 十四、延伸阅读

- **TypeScript 官方文档（Handbook / Reference）**：<https://www.typescriptlang.org/docs/>
- **TSConfig 参考**：<https://www.typescriptlang.org/tsconfig>
- **类型体操练习（Type Challenges）**：<https://github.com/type-challenges/type-challenges>
- **阮一峰《TypeScript 教程》**：<https://wangdoc.com/typescript/>
- **Zod（运行时校验 + 类型推断）**：<https://zod.dev>
- **@typescript-eslint**：<https://typescript-eslint.io>

---

> **一句话总结学习路径**：先把「类型注解 → 接口/联合 → 泛型 → 收窄」练熟，再用「工具类型 + keyof/infer/条件类型」打通类型编程，最后靠「strict 模式 + 运行时校验」把工程做得既灵活又安全。
