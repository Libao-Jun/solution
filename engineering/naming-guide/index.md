# 命名规范完全指南：从 HTML 到跨语言工程实践

> 参考资料：
>
> - [命名规范 · JavaGuide](https://javaguide.cn/system-design/basis/naming.html)
> - [程序员命名规范 · 阿里云开发者社区](https://developer.aliyun.com/article/1608400)
> - [前端命名规范整理 · 博客园](https://www.cnblogs.com/karkash/p/19194224)
> - [Vue 2 风格指南 · 组件注册](https://v2.cn.vuejs.org/v2/guide/components-registration.html)
> - [前端代码命名规范 · 技术栈](https://jishuzhan.net/article/1698626148973416450)
> - [命名指南 · ordinary-coder](https://libao-jun.github.io/ordinary-coder/docs/naming-guide/)
> - [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
> - [京东前端编码规范 · React 代码风格](https://jdf2e.github.io/jdc_fe_guide/docs/react/code/)
>
> 面向角色：**刚写第一个页面的新手**（需要「照抄就对」的硬规则）、**日常做业务的中级前端**（需要跨 HTML / CSS / JS / Vue / React / Svelte 的一致约定）、**负责规范落地的高级前端与架构师**（需要跨语言映射、工具链约束与遗留系统迁移策略）。
>
> 本文把「词形（camelCase / kebab-case / …）」与「语义（名字该说什么）」拆成两层来讲：前两章建立判断标准，第三到十五章按语言与场景给出完整规则，第十六到十九章讲团队怎么把规范变成不会腐烂的约束。所有规则都区分**硬性**（可由工具强制）与**建议**（靠评审与约定），避免把个人偏好写成铁律。

---

## 目录

- [一、为什么命名值得单独讨论](#一、为什么命名值得单独讨论)
- [二、命名风格总表](#二、命名风格总表)
- [三、语义命名法](#三、语义命名法)
- [四、HTML 命名规范](#四、html-命名规范)
- [五、CSS 命名规范](#五、css-命名规范)
- [六、JavaScript 命名规范](#六、javascript-命名规范)
- [七、TypeScript 命名规范](#七、typescript-命名规范)
- [八、Vue 2 与 Vue 3 命名规范](#八、vue-2-与-vue-3-命名规范)
- [九、React 命名规范](#九、react-命名规范)
- [十、Svelte 命名规范](#十、svelte-命名规范)
- [十一、项目名称与目录命名](#十一、项目名称与目录命名)
- [十二、Java 命名规范](#十二、java-命名规范)
- [十三、Python 命名规范](#十三、python-命名规范)
- [十四、MySQL 命名规范](#十四、mysql-命名规范)
- [十五、接口与协议层命名](#十五、接口与协议层命名)
- [十六、团队落地与遗留代码治理](#十六、团队落地与遗留代码治理)
- [十七、工具链强制约束](#十七、工具链强制约束)
- [十八、反例与重命名流程](#十八、反例与重命名流程)
- [十九、分层速查与进阶路线](#十九、分层速查与进阶路线)
- [附录 A 命名风格转换对照表](#附录-a-命名风格转换对照表)
- [附录 B 交付前检查清单](#附录-b-交付前检查清单)

---

## 一、为什么命名值得单独讨论

### 1.1 名字是接口的一部分

一个名字一旦被导出、被跨模块引用、被写进 URL、写进数据库列、写进接口文档，它就从「个人习惯」变成了**契约**。契约的成本不对称：

| 名字出现的位置 | 修改成本 | 典型后果 |
| --- | --- | --- |
| 函数内局部变量 | 极低 | IDE 一键重命名 |
| 模块内私有函数 | 低 | 同文件内改完即可 |
| 跨模块导出的 API | 中 | 需要全局搜索 + 逐处确认 |
| 组件 props / 事件名 | 中高 | 调用方模板全要改，漏改是静默失效 |
| 接口字段 / 数据库列 | 高 | 前后端 + 存量数据 + 报表 + 日志全要动 |
| 已发布的 npm 包名 / URL 路径 | 极高 | 需要兼容层与版本化，旧名字可能永久存在 |

所以「先随便起，以后再改」在实践中往往只有前两类能兑现。**准确的命名要在第一次写的时候完成**，这也是本文反复强调「按场景选词形」的原因：词形可以机械替换，语义没法事后补。

### 1.2 命名的四个判据

判断一个名字好坏，不要用「我觉得顺眼」，用这四条可检验的标准：

| 判据 | 自问 | 不合格的样子 |
| --- | --- | --- |
| 准确（Accurate） | 名字是否**不多不少**地描述了它装的东西 | `data`、`info`、`result`、`list` |
| 一致（Consistent） | 同一概念在项目里是否只有一个词 | 同时存在 `user` / `member` / `account` / `customer` |
| 可检索（Greppable） | 全文搜索这个名字能否精确命中 | `const e`、`tmp`、`d`（搜出来几万条） |
| 可推断（Inferable） | 不看实现，能否推断类型、单位、副作用 | `timeout`（秒还是毫秒？）、`getUser()`（同步还是请求？） |

第四条是最容易被忽视、也最能区分水平的一条。`timeout = 3000` 在 JavaScript 里意味着毫秒，但同一个字段传到 Java 后端、写进配置文件、变成 MySQL 列之后，量纲就成了灾难源。**把单位写进名字**（`timeoutMs`）是成本最低的防御。

### 1.3 长度与作用域匹配

John Ousterhout 在《A Philosophy of Software Design》里给过一条实用准则：**变量名长度应与作用域大小成正比**。

```js
// 作用域只有三行：短名不损失信息
for (let i = 0; i < rows.length; i++) {
  sum += rows[i].amount
}

// 作用域跨几十行 / 跨文件：必须自解释
const pendingRefundTotalAmountCents = refunds
  .filter((refund) => refund.status === 'pending')
  .reduce((total, refund) => total + refund.amountCents, 0)
```

这条准则同时解释了两种常见错误：① 全局配置也叫 `cfg`、`opt`、`d`；② 三行循环里写 `currentIterationIndexForRowCollection`。**长度不是越短越好，也不是越长越好，而是与「读者需要携带多少上下文才能读懂」匹配。**

### 1.4 什么时候命名不是解法

命名规范被滥用时，会出现「用名字硬扛设计问题」的迹象。以下情况应该改结构，而不是继续加长名字：

| 症状 | 真正的解法 |
| --- | --- |
| 名字长到要换行，如 `getUserInfoAndCheckPermissionResult` | 拆成两个函数：一个取数据、一个判权限 |
| 需要 `xxxFlag` 才能区分两个布尔 | 用状态机 / 枚举代替多个布尔 |
| 参数叫 `options` 但里面有 20 个字段 | 拆分成多个语义化参数对象 |
| 类型名要写 `UserProfileResponseDataVo` | 分层对象后缀堆叠，说明层与层之间没有真正隔离 |
| 靠命名前缀区分「新 / 旧」实现 | 用模块边界、特性开关或独立包隔离 |

命名能提升可读性，但**不能替代抽象**。一个函数做了三件事，起什么名字都是错的。

---

## 二、命名风格总表

### 2.1 六种基础词形

| 词形 | 别名 / 写法 | 示例 | 典型使用场景 | 不能用的地方 |
| --- | --- | --- | --- | --- |
| `camelCase` | lowerCamelCase、小驼峰 | `userProfile` | JS / TS 变量与函数、Java 方法、Vue props | CSS 类名（大小写易丢）、MySQL |
| `PascalCase` | UpperCamelCase、大驼峰 | `UserProfile` | 类、组件、类型、Java 类、Python 类 | 普通变量（会与类混淆） |
| `snake_case` | 下划线命名 | `user_profile` | Python 变量与函数、MySQL 表与列、REST 的部分生态 | JS 标识符（合法但不合约定）、CSS 类名 |
| `kebab-case` | dash-case、lisp-case、短横线 | `user-profile` | HTML 属性值、CSS 类、文件名、URL、npm 包名 | JS 标识符（`-` 会被当减号，**语法错误**） |
| `SCREAMING_SNAKE_CASE` | UPPER_SNAKE_CASE、常量命名 | `MAX_RETRY_COUNT` | 跨语言常量、环境变量、枚举成员 | 可变变量、对象属性 |
| `flatcase` / `dot.case` | 无分隔 / 点分 | `userprofile` / `user.profile` | 少数配置键、i18n key、资源包名 | 需要词边界的场合（可读性差） |

同一个业务概念在不同技术层里的标准写法（这张表是跨端协作的「翻译器」，建议团队直接抄进规范文档）：

| 层 / 语言 | 写法 | 示例 |
| --- | --- | --- |
| JS / TS 变量 | camelCase | `lastUpdatedAt` |
| JS / TS 类型 | PascalCase | `UserProfile` |
| Vue / React / Svelte 组件 | PascalCase（文件同名） | `UserProfile.vue` |
| HTML class | kebab-case | `user-profile` |
| CSS 自定义属性 | kebab-case | `--user-profile-gap` |
| 文件名（工具 / 模块） | kebab-case | `user-profile.ts` |
| npm 包名 | kebab-case（全小写） | `@acme/user-profile` |
| URL 路径 | kebab-case + 复数 | `/user-profiles/` |
| Java 类 / 方法 | PascalCase / camelCase | `UserProfileService` / `getLastUpdatedAt` |
| Python 模块 / 变量 | snake_case | `user_profile.py` / `last_updated_at` |
| MySQL 表 / 列 | snake_case | `user_profile.last_updated_at` |
| 环境变量 | SCREAMING_SNAKE_CASE | `USER_PROFILE_TTL_SECONDS` |

> 这张表的价值在于：**改一层就要想清楚它会不会穿透到另一层**。`last_updated_at` 用 MyBatis 的 `map-underscore-to-camel-case` 自动映射成 `lastUpdatedAt`；如果团队成员在 Java 里写成 `lastUpdateTime`，那么「一个概念多个名字」的裂缝就出现了，后续每次排查都要在两种叫法之间做翻译。

### 2.2 语义前缀与后缀

词形解决「怎么连词」，前后缀解决「这个词扮演什么角色」。以下是跨语言通用、且大多数团队都值得强制的一部分：

| 前缀 / 后缀 | 语义 | 示例 |
| --- | --- | --- |
| `is` / `has` / `can` / `should` / `allow` / `need` | 布尔判定 | `isVisible`、`hasPermission`、`canRetry` |
| `on` | 事件回调（被动接收） | `onSubmit`、`onUserCreated` |
| `handle` | 事件处理器（主动实现） | `handleSubmit`、`handleRowClick` |
| `use` | Hook / 组合式函数 | `useUserProfile`、`usePagination` |
| `with` | 高阶包装（HOC / 装饰器 / 中间件） | `withAuth`、`withLoading` |
| `get` / `set` | 同步读写 | `getUser`、`setTheme` |
| `fetch` / `request` / `query` | 一定发生网络请求 | `fetchUserList`、`queryOrders` |
| `to` / `from` | 纯转换，无副作用 | `toQueryString`、`fromJSON` |
| `parse` / `format` | 解析成结构 / 格式化成展示文本 | `parseQuery`、`formatCurrency` |
| `assert` | 不满足即抛错 | `assertNever`、`assertPositive` |
| `create` / `make` | 创建并返回新对象 | `createStore`、`makeIterator` |

### 2.3 缩写词的处理

缩写是最容易产生「同仓三种写法」的地方：

| 写法 | 例子 | 评价 |
| --- | --- | --- |
| 全大写 | `HTTPRequests`、`parseURL` | Airbnb 推荐；缩写边界清楚 |
| 全小写 | `httpRequests`、`parseUrl` | 同样自洽，可读性更好 |
| 首字母大写混排 | `HttpRequests`、`ParseUrl` | .NET / Java 主流（`HttpClient`、`XmlParser`），但与上两种混用会显得随意 |

**规则**：选定一种，全仓一致即可；真正该禁止的是「同一个缩写两种写法」（`userId` 与 `userID` 并存、`apiUrl` 与 `API_URL` 混用）。

几个需要单独定调的缩写：

| 缩写 | 推荐 | 说明 |
| --- | --- | --- |
| `ID` | `userId`（JS / Java）、`user_id`（DB / Python）、`UserID`（Go） | Go 官方风格是大写 `ID`；JS 生态普遍 `Id`，跟随所在生态 |
| `URL` / `URI` | `baseUrl`、`avatarUrl` | 不要写成 `baseURL` 与 `baseUrl` 混用 |
| `API` | `apiClient`、`userApi` | 常量里写 `API_BASE_URL` 没问题 |
| `HTML` / `CSS` / `JSON` / `SQL` | `htmlContent`、`jsonBody` | 作为普通单词处理，别写成 `JSONBody` 与 `jsonBody` 混用 |
| `Msg` / `Btn` / `Img` | 尽量写全：`message`、`button`、`image` | 编辑器补全已让缩写失去「省打字」的意义 |
| `No` / `Num` / `Idx` / `Cnt` | 写全：`number`、`index`、`count` | `no` 尤其在英文语境里是歧义词（number / no） |

### 2.4 匈牙利命名法

匈牙利命名法（Hungarian Notation）由微软的 Charles Simonyi 提出，名字里的「匈牙利」指他本人的国籍。它常被误读成「加类型前缀」，实际上分两代：

**① 系统匈牙利（Systems Hungarian）—— 前缀表示类型**

```c
char *lpszName;   // lpsz = long pointer to zero-terminated string
DWORD dwFlags;    // dw = double word
BOOL bEnabled;    // b = boolean
HWND hwndMain;    // hwnd = handle to window
int arrValues[10]; // arr = array
```

这套写法在 C 时代有意义：编辑器没有类型提示、函数指针与数组在参数里退化成指针、看一眼变量名就能想起内存布局。但它是**类型的冗余表达**，一旦类型改变（`int` → `int64_t`）名字就撒谎。

**② 应用匈牙利（Apps Hungarian）—— 前缀表示语义**

```c
int rwPosition;  // rw = row（行坐标，安全，不会与列混用）
int colPosition; // col = column
int xPosition;   // x = 横坐标（不安全，可能被误当成列）
```

Joel Spolsky 在《Making Wrong Code Look Wrong》里把两者区分开：**语义前缀（rw / col / x、usd / cad）是有价值的，因为它让「错误代码看起来就是错的」；类型前缀是有害的冗余**。

**现代语言里还剩什么**：类型前缀基本绝迹（`strName`、`intCount`、`bFlag` 一律视为反例），但语义前缀以新的形式全面存活：

| 历史写法 | 现代等价 | 说明 |
| --- | --- | --- |
| `bEnabled` | `isEnabled` | 布尔语义，保留 |
| `fVisible` | `isVisible` | 同上 |
| `nCount` | `count` | 类型由语言/类型系统表达，去掉类型位 |
| `szName` | `name` | 字符串类型不需要前缀 |
| `m_name`（成员变量） | `this.name` / `#name` | 作用域由语法表达 |
| `g_config`（全局） | `config` 模块导出 | 模块边界替代全局前缀 |
| `pUser`（指针） | `user` | 类型系统表达 |
| `$el`（jQuery 对象） | `element` / `el` | 该约定只在 jQuery 时代有意义 |
| `rw` / `col` / `usd` | `rowIndex` / `columnIndex` / `amountUsd` | 语义前缀仍然正确，只是写全 |

**结论（可直接写进团队规范）**：

- ❌ 禁止类型前缀：`strName`、`intCount`、`bFlag`、`arrList`、`objData`。
- ✅ 允许并鼓励语义前缀：`is` / `has` / `can` / `on` / `handle` / `use` / `amountUsd` / `rowIndex`。
- ✅ 允许单位后缀：`timeoutMs`、`widthPx`、`sizeBytes`。
- ⚠️ `_` 前缀（约定私有）与 `$` 前缀（jQuery / Svelte runes / 某些框架）属于**框架或语言约定**，不得自定义扩展。

### 2.5 场景与风格的对应关系

| 场景 | 硬性词形 | 备注 |
| --- | --- | --- |
| JS / TS 变量、参数、函数 | camelCase | 常量见 6.1 |
| 类、构造函数、组件、类型 | PascalCase | 类名不要动词开头 |
| HTML 标签 / 属性 / `data-*` | 全小写（kebab） | HTML 大小写不敏感，写大写等价但难维护 |
| CSS 类 / id / 自定义属性 | kebab-case | CSS 类**区分大小写**，`UserCard` 与 `usercard` 是两个东西 |
| 文件名（工具、模块、样式） | kebab-case | 见 11.3 的大小写敏感陷阱 |
| 组件文件名 | PascalCase | 与组件名一致，便于 grep |
| 目录名 | kebab-case 全小写 | 见 11.2 |
| npm 包名 | kebab-case 全小写 | 大写直接发布失败 |
| 环境变量 | SCREAMING_SNAKE_CASE | 见 11.5 |
| MySQL 库 / 表 / 列 | snake_case 全小写 | 见 14.1 |
| Python 模块 / 函数 / 变量 | snake_case | 类用 PascalCase |
| Java 包 | 全小写（点分） | 包名不能用 `-` |
| URL 路径 / 查询参数 | kebab-case（路径） | 参数风格全站统一 |

---

## 三、语义命名法

### 3.1 词性决定角色

英语词性天然对应代码里的角色，用对了几乎不需要额外约定：

| 词性 | 对应角色 | 正确 | 错误 |
| --- | --- | --- | --- |
| 名词（单数） | 单个对象 / 值 | `user`、`order`、`total` | `getUser`（当变量名） |
| 名词（复数） | 集合 | `users`、`selectedIds` | `userList` 里面装 Map |
| 动词短语 | 有副作用的动作 | `saveOrder()`、`sendEmail()` | `orderSave()` |
| 动词 + 名词 | 纯函数 / 获取 | `calculateTotal()`、`buildQuery()` | `total()` |
| 形容词 / 分词 | 布尔状态 | `isActive`、`hasErrors` | `active`（可能被当成 DOM 属性） |
| 过去分词 | 已完成的结果 / 事件 | `createdAt`、`onSaved` | `saving`（进行中，别混用） |
| 现在分词 | 进行中的状态 | `isSaving`、`pendingOrders` | `save`（歧义） |

### 3.2 布尔命名

布尔值是命名事故最集中的地方，因为 `false` 有太多种含义：

```js
// ❌ 读者无法回答「flag 为 true 代表什么」
let flag = false
if (flag) { ... }

// ❌ 双重否定，需要脑内做一次逻辑取反
const isNotEmpty = list.length > 0
if (!isNotEmpty) { ... }

// ✅ 正向、可读、可直接对应 UI 状态
const isLoading = true
const hasUnsavedChanges = true
const canSubmit = isValid && !isSubmitting
```

硬性规则：

1. 必须以 `is` / `has` / `can` / `should` / `allow` / `need` / `enable` 开头（形容词裸名如 `visible`、`disabled` 容易与 DOM 属性、CSS 状态类混淆）。
2. **优先正向**：`isVisible` 优于 `isHidden`，`isEnabled` 优于 `isDisabled`；只有在「默认值是 true」且正向命名会让代码更绕时才用否定形式，并且全项目统一。
3. 禁止 `flag`、`status`、`mark`、`check` 这类无语义词。`status` 应该是枚举（`'idle' | 'loading' | 'success' | 'error'`），不是布尔。
4. 布尔不要和 `=== true` 一起出现（`if (isReady === true)`），它说明名字没起到作用。

### 3.3 集合与数量

| 名字 | 含义 | 类型 |
| --- | --- | --- |
| `users` | 用户集合 | 数组 / 列表 |
| `userList` | 同上，但强调「有序列表」 | 数组 |
| `userMap` / `userById` | 按 id 索引 | Map / 普通对象 |
| `userIdSet` / `selectedUserIds` | 去重集合 | Set / 数组 |
| `userCount` | 数量 | number |
| `userIndex` | 下标 | number |
| `currentUser` | 单个 | User |
| `currentUserId` | 单个的标识 | string / number |

三条细则：

- **复数表示集合，单数表示元素**。`for (const user of users)` 读起来像话；`for (const item of userList)` 就多了一次翻译。
- **不要把类型塞进名字**。`userArray`、`userObj`、`userStr` 属于类型前缀的变体（见 2.4）。但 `userMap`、`userIdSet` 是例外——它们表达的是**数据结构语义**（可 O(1) 查找），而数组与对象在 JS 里都是 `object`，从类型上看不出区别。
- **`list` 是弱后缀**。业务里大量 `xxxList` 其实只是在说「这是数组」，而 TypeScript 的 `User[]` 已经说了。优先让名字表达**内容**（`pendingOrders`、`expiredSessions`），而不是容器。

### 3.4 单位与量纲

跨端项目里最贵的 bug 往往不是逻辑错，而是量纲错：

| 坏名字 | 问题 | 好名字 |
| --- | --- | --- |
| `timeout` | 秒？毫秒？ | `timeoutMs`、`timeoutSeconds` |
| `size` | 字节？条数？ | `sizeBytes`、`pageSize` |
| `width` | px？rem？百分比？ | `widthPx`、`widthPercent` |
| `ratio` | 0–1 还是 0–100？ | `ratio`（约定 0–1）+ 注释，或 `percent`（0–100） |
| `price` | 元？分？ | `priceCents`（整数分）、`price` + `currency` |
| `duration` | 秒？ISO 8601？ | `durationSeconds` |
| `angle` | 弧度？角度？ | `angleRad`、`angleDeg` |

约定优于记忆：**0–1 叫 `ratio`，0–100 叫 `percent`，金额一律用最小货币单位整数（`amountCents`）**。金额用浮点数做累加是另一个独立问题（见 14.5），但命名上先把单位说清楚，能挡掉一半的沟通成本。

### 3.5 时间与时态

`createdAt` / `onCreated` / `handleCreated` / `created` 四个名字看起来都「对」，实际角色完全不同：

| 名字 | 是什么 | 类型 |
| --- | --- | --- |
| `createdAt` | 时间点（字段） | `Date` / 时间戳 |
| `createdAtMs` | 时间点（数字毫秒） | `number` |
| `createdDate` | 日期字符串（`YYYY-MM-DD`） | `string`，容易与时区混淆，慎用 |
| `onCreated` | 事件回调 prop | `(payload) => void` |
| `handleCreated` | 本组件内的事件处理函数 | `(payload) => void` |
| `created` | 布尔「是否已创建」 | `boolean`，语义弱，建议 `isCreated` |
| `createTime` | Java / 数据库常见写法 | 与 `createdAt` **必须二选一** |

**时态规则**：`xxxing` 表示进行中（`isSaving`），`xxxed` 表示已完成（`savedAt`），动词原形只用于函数名（`save`）。混用会直接导致 UI 状态判断出错。

### 3.6 对称词表

成对操作必须成对命名，否则读者要猜「这个 `open` 的逆操作是 `close` 还是 `dismiss` 还是 `hide`」：

| 正向 | 反向 | 场景 |
| --- | --- | --- |
| `add` | `remove` | 集合元素 |
| `create` | `destroy` | 生命周期 / 资源 |
| `open` | `close` | 弹窗 / 连接 / 文件 |
| `show` | `hide` | 可见性 |
| `enable` | `disable` | 能力开关 |
| `start` | `stop` | 任务 / 计时器 |
| `begin` | `end` | 区间 |
| `insert` | `delete` | 数据结构 |
| `push` | `pop` | 栈 |
| `subscribe` | `unsubscribe` | 事件流 |
| `mount` | `unmount` | 组件生命周期 |
| `encode` | `decode` | 编解码 |
| `serialize` | `deserialize` | 序列化 |
| `import` | `export` | 数据流 |
| `send` | `receive` | 消息 |
| `publish` | `subscribe` | 消息模型 |
| `lock` | `unlock` | 并发 |
| `connect` | `disconnect` | 网络 |

### 3.7 应该被淘汰的模糊词

以下词汇本身不是错，但它们**没有提供任何领域信息**，出现即意味着作者还没想清楚：

| 模糊词 | 问题 | 替代做法 |
| --- | --- | --- |
| `data` / `info` | 一切皆数据 | 写清楚是什么：`userProfile`、`orderSummary` |
| `item` / `element` / `obj` | 循环里的临时命名还行，跨函数就是噪声 | `order`、`product`、`row` |
| `tmp` / `temp` / `foo` / `bar` | 说明这是草稿 | 提交前重命名 |
| `util` / `common` / `helper` / `misc` | 无边界垃圾桶目录 | 按能力拆分：`date-format`、`url-parse` |
| `manager` / `processor` / `handler` / `service` | 只说明「有一堆方法」 | 用业务动词：`RefundCalculator`、`OrderScheduler` |
| `flag` / `status`（当布尔） | 无法推断 true 的含义 | 具名布尔或枚举 |
| `doSomething` / `process` / `handle`（单独用） | 没有宾语 | `processRefund`、`handlePaymentCallback` |
| `res` / `req` / `err` / `e` | 只在极短作用域可接受 | 函数参数写 `response` / `request` / `error` |
| `i` / `j` / `k` | 循环下标可以，其余不行 | 数组下标以外的场景具名 |

---

## 四、HTML 命名规范

### 4.1 标签与属性

```html
<!-- ✅ 标签与属性全小写；布尔属性只写名字；值统一双引号 -->
<input
  id="user-email"
  type="email"
  name="userEmail"
  autocomplete="email"
  required
  disabled
/>

<!-- ❌ 布尔属性写成字符串、属性大小写混排 -->
<INPUT ID="email" TYPE="email" required="true" DISABLED="disabled" />
```

| 规则 | 说明 |
| --- | --- |
| 标签名小写 | HTML 大小写不敏感，但大小写混排会让 grep 与 diff 变难 |
| 属性名小写 | 自定义属性必须 `data-*` 全小写（HTML 会把属性名转小写，`data-userId` 在 DOM 里变成 `data-userid`） |
| 布尔属性 | `checked`、`disabled`、`selected`、`multiple`、`novalidate` 只写名字；`disabled="false"` **仍然是禁用** |
| 属性顺序 | `class` → `id` → `name` → `data-*` → `src`/`href`/`type` → 其它（团队自定，保持一致即可） |
| 自定义元素 | 必须带连字符（`<user-card>`），否则与未来 HTML 原生标签冲突 |
| 自定义属性 | 一律 `data-*`，不发明 `my-attr` 这类非标准属性 |

### 4.2 class 与 id

```html
<header class="site-header">
  <nav class="site-nav" aria-label="主导航">
    <a class="site-nav__link site-nav__link--active" href="/docs/">文档</a>
  </nav>
</header>
<main id="main-content" class="page-content">…</main>
```

| 规则 | 说明 |
| --- | --- |
| class 用 kebab-case | `site-header` 而不是 `siteHeader`：class 值**区分大小写**，`siteHeader` 与 `siteheader` 是两个类，肉眼几乎无法区分 |
| 避免与标签同名 | `.header`、`.nav`、`.button` 太泛，容易与第三方库、浏览器扩展注入的样式冲突；加业务前缀（`.site-header`、`.c-btn`） |
| 语义而非外观 | `.alert` 优于 `.red-box`；换配色时前者不用改名 |
| id 全站唯一 | 重复 id 会导致 `label for`、`aria-*` 引用、锚点跳转全部错位 |
| id 用 kebab-case | 与 CSS / URL 锚点一致；`#main-content` 可读性远好于 `#mainContent` |
| id 慎用全局名 | 浏览器会把带 `id` 的元素挂到 `window` 的命名属性上（`id="foo"` → `window.foo`）。避免 `name`、`status`、`length`、`top`、`parent`、`self`、`location`、`document` 这类与 `window` 既有属性同名的 id |
| id 不给样式用 | `#header { }` 特异性过高（100），后续覆盖只能加 `!important`；id 只用于锚点、`for`、`aria-labelledby` 与测试定位 |

### 4.3 data 属性与 JS 钩子

`data-*` 是「HTML 与 JS 之间唯一的合法通道」，比在 class 里混 `js-` 前缀更清晰：

```html
<!-- 样式钩子、测试钩子、状态钩子三分离 -->
<button
  class="btn btn--primary"
  data-testid="submit-order"
  data-action="submit-order"
  data-state="loading"
  aria-busy="true"
>
  提交
</button>
```

| 属性 | 用途 | 是否可被样式选中 |
| --- | --- | --- |
| `class` | 只给样式用 | ✅ |
| `data-testid` | 端到端测试定位（不随文案变化） | 不建议 |
| `data-action` / `data-js-*` | 事件委托时的行为标识 | 不建议 |
| `data-state` | 组件状态（`loading` / `error` / `empty`） | 可以（比 `is-loading` 类更少污染） |
| `data-*` 任意业务数据 | 传给 JS 的初始值 | 不建议 |

**dataset 的驼峰转换**：`data-user-id` 在 JS 里是 `element.dataset.userId`，`data-userid` 则是 `dataset.userid`。定下「多词一律用连字符」就不会踩：

```js
// <div data-user-id="42" data-order-count="3">
const el = document.querySelector('[data-user-id]')
console.log(el.dataset.userId)      // "42"
console.log(el.dataset.orderCount)  // "3"
```

### 4.4 表单字段名

`name` 属性决定提交给后端的**键名**，因此它的风格必须和后端对齐，不能前端自己定一套：

| 后端技术栈 | `name` 推荐 | 说明 |
| --- | --- | --- |
| Spring Boot（Java） | `userName`（camel） | 默认按 camelCase 绑定 |
| Django / Flask（Python） | `user_name`（snake） | 与 Python 变量一致 |
| PHP / Laravel | `user_name`（snake） | 与数据库列一致 |
| Node.js（Express + JSON） | `userName`（camel） | 与前端直接互通 |

其余规则：

- `name` 不要包含空格、中文、`.`、`[]` 之外的符号；数组用 `items[]`（PHP）或 `items` 重复键（依后端而定）。
- `label` 的 `for` 必须等于控件的 `id`；`id` 建议 `<表单名>-<字段名>`（`login-user-email`），避免同页两个表单 id 冲突。
- 隐藏字段用 `name="redirectUrl"` 这类语义名，不要 `name="h1"`。

### 4.5 可访问性属性

```html
<!-- 用 aria-labelledby 指向标题，而不是重复写一遍文案 -->
<section aria-labelledby="refund-title">
  <h2 id="refund-title">退款说明</h2>
</section>

<!-- 图标按钮必须有可访问名称 -->
<button class="btn btn--icon" aria-label="关闭对话框">
  <svg aria-hidden="true">…</svg>
</button>
```

| 规则 | 说明 |
| --- | --- |
| `aria-*` 值全小写 | `aria-hidden="true"`、`aria-live="polite"` |
| 引用型属性指向 id | `aria-labelledby` / `aria-describedby` / `aria-controls` 的值是 **id**，必须真实存在 |
| `alt` 描述内容而非文件名 | 装饰图用 `alt=""`（空字符串，不是 `alt="image"`） |
| `role` 用标准值 | 自定义 `role` 无效；优先用语义标签替代 `role` |
| 不要用 `title` 当唯一说明 | 触屏无法 hover，且对读屏不友好 |

---

## 五、CSS 命名规范

### 5.1 四类方法论

| 方法论 | 核心理念 | 命名形态 | 适合 |
| --- | --- | --- | --- |
| **BEM** | 块 / 元素 / 修饰三层，用命名表达结构 | `.card__title--large` | 组件库、多人协作的全局 CSS |
| **OOCSS** | 结构与皮肤分离、容器与内容分离 | `.btn` + `.btn--primary` | 需要主题化的基础组件 |
| **SMACSS** | Base / Layout / Module / State / Theme 分层 | `.l-header`、`.is-collapsed` | 中大型站点 |
| **ITCSS** | 按特异性从低到高分层（Settings → Tools → Generic → Elements → Objects → Components → Utilities） | `.o-media`、`.c-card`、`.u-mt-8` | 与 BEM 组合使用 |
| **原子化（Tailwind）** | 不用语义类名，用工具类组合 | `flex items-center gap-2` | 快速迭代、设计系统统一 |
| **CSS Modules / scoped** | 用构建工具生成唯一类名 | `.userCard`（编译后带哈希） | 组件化项目（Vue / React） |

这几种不是互斥的。工程里最常见的组合是：**组件内用 scoped / CSS Modules，跨组件共享的部分用 BEM + 工具类**。

### 5.2 BEM 的严格用法

```html
<article class="card card--featured">
  <header class="card__header">
    <h2 class="card__title card__title--large">季度报告</h2>
  </header>
  <div class="card__body">
    <p class="card__text">…</p>
  </div>
</article>
```

```css
/* 块：独立、可复用、不依赖父级 */
.card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

/* 元素：属于块内部，用 __ 连接 */
.card__title {
  margin: 0;
  font-size: 16px;
}

/* 修饰：同一个块/元素的变体，单独成类，不与基础类写在一起 */
.card--featured {
  border-color: var(--color-brand-500);
}

.card__title--large {
  font-size: 20px;
}
```

BEM 的五条硬规则（违反任一条都会退化成「看起来像 BEM 但无法维护」）：

1. **元素不能嵌套元素**：`.card__header__title` ❌ → 要么 `.card__title`，要么把 header 抽成独立块 `.card-header__title`。
2. **修饰必须与基础类同时出现在 HTML 里**：`class="card card--featured"`，而不是只写 `card--featured`。
3. **修饰不用后代选择器表达**：`.card--featured .card__title {}` ❌ → `.card__title--featured` ✅（后者特异性稳定为 1 个类）。
4. **块不依赖标签与层级**：`.card > h2 {}` ❌，块内部结构变化就会崩。
5. **不嵌套超过两层选择器**：`.page .card .card__title span {}` ❌，特异性失控。

### 5.3 状态类与工具类

| 类型 | 前缀 | 示例 | 由谁控制 |
| --- | --- | --- | --- |
| 状态 | `is-` / `has-` | `.is-active`、`.has-error`、`.is-disabled` | JS 切换，SMACSS 的 State 层 |
| 工具 | `u-`（或直接 Tailwind） | `.u-mt-8`、`.u-truncate` | 一次性微调，不参与组件语义 |
| 布局 | `l-` | `.l-sidebar` | 页面骨架，与业务组件解耦 |
| 主题 | `theme-` | `.theme-dark` | 挂在 `html` / `body` 上 |

**JS 钩子必须与样式钩子分离**：用 `data-*` 而不是 `.js-xxx` 类，这样重构样式、改类名不会把交互一起改坏。

```js
// ✅ 行为绑定在 data-action 上，改名样式不影响逻辑
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action="toggle-menu"]')
  if (!trigger) return
  document.body.classList.toggle('is-menu-open')
})
```

### 5.4 自定义属性

```css
:root {
  /* 分类 → 名称 → 变体 → 状态 */
  --color-brand-500: #4f30e8;
  --color-text-muted: #6b7280;
  --space-2: 8px;
  --radius-md: 8px;
  --z-modal: 1000;
  --duration-fast: 120ms;
}

.card {
  /* 组件级变量：对外开放少量可覆盖的口子 */
  --card-padding: var(--space-4);
  padding: var(--card-padding);
}
```

| 规则 | 说明 |
| --- | --- |
| 一律 kebab-case | 自定义属性**区分大小写**，`--colorBrand` 与 `--colorbrand` 是两个变量 |
| 前缀表达类别 | `--color-*` / `--space-*` / `--radius-*` / `--shadow-*` / `--z-*` / `--duration-*` |
| 数值后缀用序号 | `--space-1`（4px）/ `--space-2`（8px），不要 `--space-small` 与 `--space-8px` 混用 |
| 语义优先于具体值 | `--color-danger` 优于 `--color-red`（换品牌色不用改 200 处） |
| 组件级变量加组件前缀 | `--card-padding`、`--modal-width`，避免与全局撞名 |

### 5.5 CSS Modules 与原子化

| 方案 | 命名要求 | 注意点 |
| --- | --- | --- |
| CSS Modules | 文件 `UserCard.module.css`；类名 camelCase（配 `localsConvention: 'camelCaseOnly'`） | 编译后带哈希，`styles.userCard` 比 `styles['user-card']` 更好写；导出类型用 `*.module.css.d.ts` |
| CSS-in-JS | 组件名 = 样式组件名（`StyledButton`、`CardWrapper`） | 只对「有意义的包装」建 styled 组件，否则会产出 `Div1`、`Div2` |
| Vue scoped | 类名照常用 BEM，`<style scoped>` 加哈希隔离 | `:deep()` 会突破隔离，慎用 |
| Tailwind | 不命名（工具类即原子） | 只有 `@layer components` 里的少量语义类需要命名，如 `.btn` |
| CSS Nesting | 嵌套不超过三层 | 嵌套会让「特异性」变成隐式，命名要承担更多语义 |

### 5.6 选择器层级与特异性

| 规则 | 说明 |
| --- | --- |
| 不用 id 选择器做样式 | 特异性 100，后续覆盖只能 `!important` |
| 嵌套不超过三层 | 特异性与耦合度同时上升；层数上限建议在 stylelint 里约束 |
| 少用标签选择器限定类 | `.card h2` 会把样式绑死在标签上，换 `<h3>` 就失效 |
| 用 `:where()` 降特异性 | `:where(.card) .title` 特异性为 0 + 类，便于覆盖 |
| 用 `@layer` 定顺序 | `@layer reset, base, components, utilities;` —— 层顺序决定胜负，不再靠特异性斗殴 |
| 用 `@scope` 限制作用范围 | 组件库嵌入宿主页面时，比 BEM 前缀更干净 |

---

## 六、JavaScript 命名规范

### 6.1 变量与常量

```js
// ✅ 变量：camelCase
const userName = 'Ada'
let retryCount = 0

// ✅ 真正不变的常量：SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const HTTP_TIMEOUT_MS = 10_000
const ORDER_STATUS = Object.freeze({
  Pending: 'pending',
  Paid: 'paid',
})

// ❌ 用 const 声明但语义上不是「常量」
const USER_LIST = []        // 会被 push，名字在撒谎
const CONFIG = loadConfig() // 运行期求值的配置，不算编译期常量
```

规则：

- **`const` ≠ 常量命名**。`const` 只表示「绑定不可重新赋值」，数组与对象内容仍然可变。只有**跨模块共享、值固定、语义上是配置或魔法数的**才用大写。
- **模块级私有常量用 camelCase 也可以**（`defaultTimeoutMs`），只要跨模块导出时用大写；团队选定一种即可。
- **枚举对象的键与类型层保持一致**：字符串枚举用 PascalCase 键（`ORDER_STATUS.Paid`），TS 项目补 `as const` 即得到字面量类型（见 7.3），不要 JS 用 `PAID`、TS 用 `Paid` 各写一套。
- 魔法数一律具名：`if (status === 2)` ❌ → `if (status === OrderStatus.Paid)` ✅。
- 布尔不要用否定命名（见 3.2）。

### 6.2 函数与方法

| 前缀 | 语义 | 示例 |
| --- | --- | --- |
| `get` | 同步取值，通常很便宜 | `getUserById(id)` |
| `fetch` / `request` | 一定发生 I/O（网络） | `fetchOrders()` |
| `query` | 从本地缓存 / 数据库查询 | `querySelectorAll`、`queryAccount` |
| `load` | 可能带缓存与副作用，语义较宽 | `loadUserProfile()` |
| `to` / `from` | 纯转换 | `toQueryString(params)` |
| `parse` | 解析字符串成结构 | `parseQueryString(search)` |
| `format` | 结构转展示文本 | `formatCurrency(amountCents)` |
| `is` / `has` / `can` | 返回布尔 | `isValidEmail(value)` |
| `assert` | 不满足即抛错 | `assertDefined(user)` |
| `handle` | 事件处理（有副作用） | `handleSubmit` |
| `on` | 注册回调（被动接收） | `onResize`、`onUserSaved` |
| `create` / `build` | 创建并返回新对象 | `createDebounced(fn)` |

**动词 + 宾语，不要只有动词**：

```js
// ❌ 宾语丢失，读者必须看实现才知道在做什么
function process(data) {}
function update(item) {}

// ✅ 名字自带文档
function processRefundRequest(refundRequest) {}
function updateUserPreferences(userId, preferences) {}
```

**一个函数只做一件事，名字才能短而准**。出现 `And`、`Or`、`Then` 就是拆分信号：`validateAndSaveUser` → `validateUser` + `saveUser`。

### 6.3 类与实例

```js
// ✅ 类 PascalCase + 名词
class OrderRepository {}
class PaymentGateway {}

// ✅ 实例 camelCase
const orderRepository = new OrderRepository()

// ✅ 工厂函数用 create
const session = createSession({ userId })

// ❌ 类名带动词或后缀噪声
class DoOrder {}
class OrderClass {}
class OrderManagerImpl {}
```

- 类名用**名词**：`class Parse` ❌ → `class Parser` ✅。
- 抽象类 / 基类加前缀：`BaseStore`、`AbstractValidator`。
- 缩写在类名里保持一致：`HttpClient` 或 `HTTPClient`，别两种都出现。
- 不要用 `new` 前缀或 `Cls` 后缀标注「这是个类」——语法已经写了 `new`。

### 6.4 私有成员

| 写法 | 是否真私有 | 说明 |
| --- | --- | --- |
| `#token` | ✅ 运行时真私有 | ES2022 类字段；不能从外部访问，`Object.keys` 也看不到 |
| `_token` | ❌ 仅约定 | Airbnb 明确不推荐「用前导下划线表示私有」；若团队已有大量存量代码，可保留但新代码优先 `#` |
| `private token`（TS） | ⚠️ 编译期 | 运行时仍可访问，且会被 `JSON.stringify` 序列化 |
| `Symbol('token')` | ✅ 近似私有 | 适合「不想被 for-in 枚举」的对象键 |

```ts
class TokenStore {
  #token: string | null = null

  setToken(token: string) {
    this.#token = token
  }
}
```

注意：**不要同时使用 `#` 和 `_` 表达私有**，也别在公共 API 上出现 `_` 前缀（会被误判为内部实现）。

### 6.5 事件与回调

```js
// DOM 事件：小写，多个单词用 kebab（HTML 属性名大小写不敏感）
element.dispatchEvent(new CustomEvent('user-profile-updated', { detail: user }))
element.addEventListener('user-profile-updated', onProfileUpdated)

// 组件事件（Vue / React / Svelte 都遵循这套心智）
// 回调 prop：on + 事件名
<OrderTable onRowSelect={handleRowSelect} />

// 本组件内的处理器：handle + 事件名
function handleRowSelect(rowId) {}
```

| 场景 | 命名 |
| --- | --- |
| 事件常量 | `USER_PROFILE_UPDATED`（大写下划线） |
| DOM 自定义事件 | `user-profile-updated`（kebab，全小写） |
| 事件对象 | `event` / `evt`（参数可短，作用域小） |
| 回调 prop | `onRowSelect`、`onClose` |
| 内部处理器 | `handleRowSelect`、`handleClose` |
| 订阅函数 | `subscribeToUserProfile` / `unsubscribeFromUserProfile` |

**避免与原生事件重名**：给组件定义 `onClick`、`onChange`、`onSubmit` 且同时透传给 DOM 元素时，会出现「同一名字两种语义」的混乱。建议语义化（`onConfirm`、`onValueChange`、`onFormSubmit`）。

### 6.6 异步与 Promise

```js
// ✅ 动词本身就表示异步：fetch / request / load
async function fetchUserProfile(userId) {}

// ⚠️ Async 后缀：只在同仓同时存在同步版本、必须并置时使用
function readFileSync(path) {}
function readFileAsync(path) {}
```

规则：

- 返回 Promise 的函数**不必**加 `Async` 后缀（TypeScript 的返回类型一眼可见）。
- 不要在同一个项目里既用 `xxxAsync` 又用 `fetchXxx` 表达同一件事。
- Promise 变量名不要加 `Promise` 后缀（`const userPromise = fetchUser()` 可接受，但 `const promise = ...` 无信息）。
- `await` 的结果用具名变量，别写 `const res = await ...` 后一路 `res.data.list`。

### 6.7 文件与目录

| 类型 | 命名 | 示例 |
| --- | --- | --- |
| 工具 / 模块 | kebab-case | `date-format.ts`、`url-parse.ts` |
| React / Vue / Svelte 组件 | PascalCase | `UserProfile.vue`、`OrderTable.tsx` |
| Hook / composable | `use` + PascalCase | `useUserProfile.ts` |
| 类 | PascalCase | `OrderRepository.ts` |
| 测试 | 与源文件同名 + `.test` | `date-format.test.ts`、`OrderTable.test.tsx` |
| 样式 | 与组件同名 + `.module.css` | `OrderTable.module.css` |
| 类型声明 | kebab 或固定名 | `global.d.ts`、`env.d.ts` |
| 配置 | 工具约定名 | `vite.config.ts`、`eslint.config.js`（**不可改名**） |

Airbnb 的经典建议是「文件名与默认导出名一致」：`export default class UserRepository` 放在 `UserRepository.js` 里。组件化时代沿用这条即可。

### 6.8 保留字与陷阱

```js
// ❌ 语法错误：保留字不能作变量名
const class = 'a'
const default = 1

// ✅ 但可以作对象属性名
const options = { class: 'primary', default: true }

// ❌ 遮蔽内置对象，后续调试会怀疑人生
let undefined = 1
let NaN = 0
const JSON = {}

// ⚠️ 合法但不要用：单字母与易混字符
const l = 1   // 小写 L
const O = 0   // 大写 O
const I = 1   // 大写 I
const 用户 = {}  // 中文标识符合法，但团队协作与工具链支持不一致
```

保留字速查（不能作标识符）：`break`、`case`、`catch`、`class`、`const`、`continue`、`default`、`delete`、`do`、`else`、`export`、`extends`、`finally`、`for`、`function`、`if`、`import`、`in`、`instanceof`、`let`、`new`、`return`、`super`、`switch`、`this`、`throw`、`try`、`typeof`、`var`、`void`、`while`、`with`、`yield`、`await`、`enum`、`implements`、`interface`、`package`、`private`、`protected`、`public`、`static`。

另一个陷阱：**解构时的名字**。

```js
// ❌ 解构后名字失去上下文
const { data } = await fetchUser()

// ✅ 重命名成有语义的变量
const { data: userProfile } = await fetchUser()
const { list: orderList } = response
```

---

## 七、TypeScript 命名规范

### 7.1 类型与接口

| 元素 | 词形 | 示例 |
| --- | --- | --- |
| `interface` | PascalCase，**不加 `I` 前缀** | `UserProfile`、`OrderRepository` |
| `type` 别名 | PascalCase | `UserId`、`OrderStatus` |
| 类型参数 | 单大写字母或 `T` + 名词 | `T`、`TData`、`TError` |
| 枚举 | PascalCase（成员也 PascalCase） | `OrderStatus.Paid` |
| 组件 Props | 组件名 + `Props` | `OrderTableProps` |
| 可选配置对象 | 名词 + `Options` / `Config` | `RequestOptions`、`ChartConfig` |
| 函数签名 | `Handler` / `Callback` / `Fn` | `SubmitHandler` |

```ts
// ✅ 现代 TS 约定：interface 不加 I 前缀
interface UserProfile {
  id: string
  displayName: string
}

// ✅ 用后缀表达「角色」，而不是用前缀表达「种类」
type OrderTableProps = {
  orders: Order[]
  onRowSelect: (orderId: string) => void
}

// ❌ 冗余后缀与匈牙利式前缀
interface IUserProfile {}
type UserProfileType = {}
interface UserProfileInterface {}
```

`IUser` 前缀是 C# / Java 时代的遗产，在 TS 里没有收益（编辑器里类型与值本来就分属两个命名空间）。**唯一需要 `I` 的场景**是团队存量代码已有几百个 `IXxx`，此时新代码跟随现状比强行统一更划算——一致性优先于「更正确」。

### 7.2 泛型参数

```ts
// ✅ 单参数用 T；多参数用带语义的名字
function first<T>(items: T[]): T | undefined

function mapRecord<TKey extends string, TValue, TResult>(
  record: Record<TKey, TValue>,
  transform: (value: TValue) => TResult,
): Record<TKey, TResult>

// ❌ T1 / T2 / A / B 无法表达约束关系
function merge<T1, T2>(a: T1, b: T2) {}
```

常见约定：`T`（通用类型）、`K`（键）、`V`（值）、`E`（元素 / 错误）、`R`（返回）、`P`（Props）。超过三个参数就该考虑用对象参数替代。

### 7.3 枚举与联合类型

```ts
// ✅ 方案一：as const 对象 + 联合类型（推荐，零运行时成本、可 tree-shake）
export const ORDER_STATUS = {
  Pending: 'pending',
  Paid: 'paid',
  Refunded: 'refunded',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

// ✅ 方案二：enum（需要反向映射或与后端数值对齐时）
export enum OrderStatusCode {
  Pending = 1,
  Paid = 2,
  Refunded = 3,
}
```

| 规则 | 说明 |
| --- | --- |
| 枚举类型名 PascalCase，成员 PascalCase | `OrderStatus.Paid`；不要 `order_status.PAID` 混排 |
| 字符串值用 snake 或 kebab 与后端一致 | `'pending_payment'` 还是 `'pending-payment'` 必须与接口文档一致 |
| 别用 `const enum` | `isolatedModules` / Babel / esbuild 下不支持，跨包引用会报错 |
| 联合类型优先 | 能用字符串字面量联合（`'pending'`、`'paid'`）表达就不用 `enum`，少一层运行时对象 |

### 7.4 类型工具与命名空间

| 写法 | 建议 |
| --- | --- |
| 内置工具类型 | 直接用 `Partial<T>`、`Pick<T, K>`、`Omit<T, K>`、`ReturnType<F>`，不要自己造 `OptionalAll<T>` |
| 自建工具类型 | PascalCase + 语义：`Nullable<T>`、`DeepReadonly<T>`、`Brand<T, Name>` |
| 命名空间 `namespace` | 不推荐（与 ESM 混用易产生双重身份）；用模块文件替代 |
| 类型导入 | `import type { UserProfile } from './types'`，避免运行时代码被牵连 |
| 品牌类型 | `type UserId = string & { readonly __brand: 'UserId' }`，避免 `userId` 与 `orderId` 混传 |

品牌类型（Branded Type）是高级场景里性价比很高的一招：它让「两个都是 string 但语义不同」的 ID 在编译期无法互换。

### 7.5 声明合并与全局类型

```ts
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

// global.d.ts
declare global {
  interface Window {
    __APP_VERSION__: string
  }
}

export {}
```

| 规则 | 说明 |
| --- | --- |
| 全局声明只在 `*.d.ts` | 普通 `.ts` 里 `declare global` 需要 `export {}` 才不会污染 |
| 文件名固定 | `env.d.ts`、`global.d.ts`、`shims-vue.d.ts`（框架约定） |
| 不要给全局加业务类型 | 业务类型放模块里导出，全局类型只放「确实全局」的东西 |
| `types/` 目录 | 共享类型集中放 `src/types/`，按领域拆文件（`user.ts`、`order.ts`），避免单个 `index.ts` 塞几百个类型 |

---

## 八、Vue 2 与 Vue 3 命名规范

> Vue 的完整规范（SFC 结构、响应式、迁移）见站内 [Vue 开发规范](/frameworks/vue/)，本节只聚焦命名链路：**文件名 → 注册名 → 模板标签 → props → 事件**，这条链每一环的大小写规则都不同。

### 8.1 组件名与文件名

| 规则 | 说明 |
| --- | --- |
| 组件名 PascalCase | `UserProfile`、`OrderTable` |
| 文件名与组件名一致 | `UserProfile.vue`（不要 `user-profile.vue` 与 `UserProfile.vue` 混用） |
| **多单词组件名** | 避免 `Table`、`Button` 这种单词名——Vue 2 会与 HTML 元素冲突，Vue 3 的 ESLint 规则 `vue/multi-word-component-names` 会直接报错 |
| 基础组件加前缀 | `BaseButton`、`BaseTable`、`AppIcon`；一旦加 `Base` 就不再依赖全局状态 |
| 单例组件加 `The` | `TheHeader`、`TheSidebar`（每页只用一次、不接受 props） |
| 紧耦合子组件用父名前缀 | `TodoList` → `TodoListItem`、`TodoListItemButton` |

### 8.2 全局注册与局部注册

Vue 2 的全局注册在 `main.js` 里进行，注册名与使用名**不必相同**，这正是混乱的来源：

```js
// Vue 2：注册用 PascalCase，模板里必须写 kebab-case
import UserProfile from './components/UserProfile.vue'
Vue.component('UserProfile', UserProfile)
```

```html
<!-- DOM 模板（直接写在 HTML 里）：HTML 属性大小写不敏感，必须 kebab -->
<user-profile :user-id="userId" />

<!-- 字符串模板 / SFC：PascalCase 与 kebab 都能解析 -->
<UserProfile :userId="userId" />
```

Vue 3 的写法与 Vue 2 一致，只是 API 换了：

```js
// Vue 3
import { createApp } from 'vue'
import UserProfile from './components/UserProfile.vue'

createApp(App).component('UserProfile', UserProfile).mount('#app')
```

| 规则 | 说明 |
| --- | --- |
| 注册名用 PascalCase | 与导入的组件名一致，减少一次心智转换 |
| 模板中统一 kebab-case | 与 DOM 模板兼容，且不会因编辑器格式化出大小写差异 |
| 不用 `Vue.component` 注册业务组件 | 全局注册无法 tree-shake，且来源不明确；只有基础组件库才值得全局注册 |
| 局部注册优先 | `<script setup>` 里 import 即注册，最省心 |

### 8.3 props 与 emits

```vue
<script setup lang="ts">
// ✅ 定义用 camelCase
const props = defineProps<{
  userId: string
  isExpanded?: boolean
  modelValue: string
}>()

// ✅ emits 用 camelCase 声明
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'rowSelect', rowId: string): void
}>()

emit('rowSelect', row.id)
</script>

<template>
  <!-- ✅ 模板里传 prop 用 kebab-case，Vue 会自动匹配 userId -->
  <OrderTable :user-id="userId" @row-select="handleRowSelect" />
</template>
```

| 规则 | 说明 |
| --- | --- |
| props 定义 camelCase | `userId`；模板里写 `:user-id` |
| 布尔 prop 用 `is` / `has` | `isLoading`、`hasMore`；避免 `loading`（与原生属性同名） |
| `v-model` 用 `modelValue` / `update:modelValue` | Vue 3 约定；Vue 2 是 `value` / `input` |
| 多个 `v-model` 用具名 | `v-model:visible` → prop `visible`、事件 `update:visible` |
| emits 用 camelCase 声明，kebab 监听 | `emit('rowSelect')` ↔ `@row-select`（Vue 3 自动转换） |
| 避免与原生事件重名 | `click`、`change`、`input`、`submit`、`focus` 一律加语义（`onConfirm` → `confirm` 事件） |

**Vue 2 的差异**：事件名**不会**自动做 kebab 转换，`this.$emit('rowSelect')` 必须用 `@rowSelect` 监听（或在模板里写 `@row-select` 是无效的）。Vue 2 项目里统一用 **kebab-case 事件名**（`this.$emit('row-select')`）最稳。

### 8.4 组合式函数与指令

| 元素 | 命名 | 示例 |
| --- | --- | --- |
| 组合式函数 | `use` + 名词（动词可选） | `useUserProfile`、`usePagination` |
| 文件名 | 与函数名一致 | `useUserProfile.ts` |
| 返回值 | 对象（而非长数组） | `{ user, isLoading, reload }` |
| Store（Pinia） | `useXxxStore` | `useUserStore` |
| Store id | kebab 或 camel（全仓统一） | `defineStore('user', ...)` |
| 指令变量 | `v` + PascalCase | `vFocus` → 模板 `v-focus` |
| 指令文件 | kebab-case | `focus.ts`、`click-outside.ts` |
| 插件 | `XxxPlugin` 或直接 `install` 对象 | `createI18n` |

```ts
// ✅ 组合式函数：命名与返回结构都自解释
export function usePagination(totalPages: number) {
  const currentPage = ref(1)
  const canGoNext = computed(() => currentPage.value < totalPages)

  function goToPage(page: number) {}
  function nextPage() {}

  return { currentPage, canGoNext, goToPage, nextPage }
}
```

指令在 `<script setup>` 中的命名规则：局部指令变量必须以 `v` 开头，模板中自动去掉 `v` 并转 kebab。

```ts
const vFocus = {
  mounted(el: HTMLElement) {
    el.focus()
  },
}
```

### 8.5 路由与状态模块

| 元素 | 命名 | 示例 |
| --- | --- | --- |
| 路由 path | kebab-case + 资源复数 | `/user-profiles/:userId` |
| 路由 name | PascalCase 或 kebab（全仓统一） | `UserProfile`、`user-profile` |
| 路由参数 | camelCase | `:userId`、`:orderId` |
| 页面组件 | 名词 + `View` / `Page` | `UserProfileView.vue` |
| Store 文件 | 与 store id 同名 | `stores/user.ts` |
| Store state | 名词 / 复数集合 | `users`、`currentUser` |
| Store action | 动词 | `fetchUsers`、`updateProfile` |
| Store getter（Pinia 用 computed） | 形容词 / `get` 前缀 | `activeUsers`、`getUserById` |

**注意路由 name 的大小写**：`router.push({ name: 'UserProfile' })` 里的大小写必须与定义完全一致，拼错不会报错、只会导航失败（Vue Router 4 会警告，Vue Router 3 静默失败）。全仓统一成 PascalCase 更安全。

### 8.6 一条链路的大小写对照

| 环节 | 写法 | 示例 |
| --- | --- | --- |
| 文件名 | PascalCase | `OrderTable.vue` |
| import 变量 | PascalCase | `import OrderTable from './OrderTable.vue'` |
| 注册名 | PascalCase | `components: { OrderTable }` |
| 模板标签（SFC） | PascalCase 或 kebab | `<OrderTable />` / `<order-table />` |
| 模板标签（DOM 模板） | **必须 kebab** | `<order-table />` |
| prop 定义 | camelCase | `userId` |
| prop 传递 | kebab | `:user-id="id"` |
| 事件声明 | camelCase | `emit('rowSelect')` |
| 事件监听 | kebab | `@row-select="…"` |

---

## 九、React 命名规范

### 9.1 组件与文件

```tsx
// ✅ 组件 PascalCase，文件名与组件名一致
export function OrderTable({ orders, onRowSelect }: OrderTableProps) {
  return (
    <table>
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} onSelect={onRowSelect} />
      ))}
    </table>
  )
}
```

| 规则 | 说明 |
| --- | --- |
| 组件名 PascalCase | JSX 靠首字母大写区分组件与 HTML 标签，小写会被当成字符串标签 |
| 文件名与组件名一致 | `OrderTable.tsx`；一文件一组件（同一组件的子组件可放同文件） |
| 页面组件加 `Page` | `OrderListPage.tsx`，与纯展示组件区分 |
| 容器 / 展示分离时 | `OrderListContainer` + `OrderList`（或在 hooks 里收敛逻辑，不必强行分两层） |
| 高阶组件 | `withXxx`：`withAuth(Component)`、`withErrorBoundary(...)` |
| 渲染 prop | `renderXxx`：`renderRow`、`renderEmpty` |

### 9.2 props 与回调

```tsx
interface OrderTableProps {
  orders: Order[]
  isLoading: boolean
  hasMore: boolean
  onRowSelect: (orderId: string) => void
  renderEmpty?: () => React.ReactNode
  children?: React.ReactNode
}

function OrderTable({ orders, isLoading, onRowSelect, children }: OrderTableProps) {
  function handleRowClick(orderId: string) {
    onRowSelect(orderId)   // ✅ 内部 handler 与外部回调命名区分
  }
  return <tbody>{/* … */}</tbody>
}
```

| 规则 | 说明 |
| --- | --- |
| 回调 prop 用 `on` | `onSubmit`、`onRowSelect` |
| 组件内处理器用 `handle` | `handleSubmit`、`handleRowClick` |
| 布尔 prop 用 `is` / `has` / `can` | `isLoading`、`hasMore`、`canEdit` |
| `children` 是保留名 | 不要自定义叫 `child` 或 `content` 的插槽式 prop |
| 透传剩余属性 | 命名为 `...rest` 太模糊，建议 `...inputProps` / `...rootProps` |
| 避免与 DOM 事件同名 | 组件 prop 用 `onSelect` 而不是 `onClick`，除非它就是原生点击 |

**一个高频坑**：把 `onClick` 透传给自定义组件，同时组件内部又把它绑到 `<button onClick>` 上，语义会重叠两次。用语义化名字（`onConfirm`）从根上避免。

### 9.3 Hooks

```ts
// ✅ use 前缀是硬性约定：ESLint 的 react-hooks 规则依赖它判断 Hook 调用位置
export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const isLoading = profile === null

  useEffect(() => {
    // …
  }, [userId])

  return { profile, isLoading }
}
```

| 元素 | 命名 | 示例 |
| --- | --- | --- |
| 自定义 Hook | `use` + 名词 / 动词 | `useUserProfile`、`useDebounce` |
| Hook 文件 | 与 Hook 同名 | `useUserProfile.ts` |
| 返回值 | 对象优先（超过 2 个值） | `{ profile, isLoading, reload }` |
| 状态 setter | `setXxx` | `setIsOpen` |
| Ref | `xxxRef` | `inputRef`、`containerRef` |
| Reducer action type | 大写下划线 | `'FETCH_START'`、`'FETCH_SUCCESS'` |

返回元组（`[value, setValue]`）只适合「两个值且顺序天然」的场景（对标 `useState`）；三个以上一律返回对象，否则调用方要记住顺序。

### 9.4 Context 与 Provider

```tsx
// ✅ 三段式命名：Context / Provider / 消费 Hook
const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === null) throw new Error('useUserContext 必须在 UserProvider 内使用')
  return context
}
```

| 规则 | 说明 |
| --- | --- |
| Context 变量名 = `XxxContext` | 与文件名 `UserContext.tsx` 对应 |
| Provider 组件 = `XxxProvider` | 与 Context 前缀一致，便于搜索 |
| 消费 Hook = `useXxx` / `useXxxContext` | 业务已有 `useUser` 时用 `useUserContext` 避免撞名 |
| 不直接导出 Context | 只导出 Provider + Hook，避免消费方绕过判空逻辑 |

### 9.5 目录结构

两种主流组织方式，选一种并坚持：

```text
# 方式一：按类型分层（小项目友好）
src/
├─ components/
│  ├─ OrderTable.tsx
│  └─ UserAvatar.tsx
├─ hooks/
│  └─ useUserProfile.ts
├─ pages/
│  └─ OrderListPage.tsx
└─ utils/
   └─ format-currency.ts

# 方式二：按领域分层（中大型项目友好）
src/
├─ features/
│  ├─ order/
│  │  ├─ OrderTable.tsx
│  │  ├─ useOrderList.ts
│  │  └─ order.api.ts
│  └─ user/
├─ shared/
│  ├─ ui/
│  └─ utils/
└─ pages/
```

| 规则 | 说明 |
| --- | --- |
| 目录名 kebab-case 或全小写 | `order-detail/`、`shared/` |
| 领域目录用单数 | `features/order/`（表示「订单领域」，不是「订单集合」） |
| 共享目录不要叫 `common` / `misc` | 用 `shared/ui`、`shared/utils`、`shared/api` 表达边界 |
| 测试与源文件同目录 | `OrderTable.test.tsx`；或统一放 `__tests__/`，二选一 |
| 桶文件（`index.ts`）谨慎 | 会造成循环依赖与 tree-shake 失效；只在包对外出口使用 |

---

## 十、Svelte 命名规范

### 10.1 组件与文件

| 规则 | 说明 |
| --- | --- |
| 组件名 PascalCase | `OrderTable`、`UserAvatar` |
| 文件名与组件名一致 | `OrderTable.svelte` |
| 框架路由文件是保留名 | SvelteKit 的 `+page.svelte`、`+layout.svelte`、`+error.svelte`、`+server.ts` **不可改名** |
| 路由参数目录用方括号 | `routes/orders/[orderId]/+page.svelte` |
| 私有模块用 `_` 前缀目录 | `src/routes/_components/`（SvelteKit 约定：`_` 开头目录不参与路由） |

### 10.2 props 与事件

```svelte
<!-- OrderTable.svelte -->
<script lang="ts">
  // ✅ props 用 camelCase
  export let orders: Order[] = []
  export let isLoading = false
  export let onRowSelect: ((orderId: string) => void) | undefined = undefined
</script>

<!-- ✅ 使用方也写 camelCase：Svelte 不做 kebab 转换 -->
<OrderTable orders={orders} isLoading={isLoading} onRowSelect={handleRowSelect} />
```

**这是 Svelte 与 Vue 最重要的差异**：Vue 会把 `:user-id` 自动映射到 `userId`，Svelte 不会。写 `<OrderTable is-loading={true} />` 只会传进去一个名为 `is-loading` 的无效属性，`isLoading` 仍是默认值——**静默失效**。

| 元素 | 命名 | 说明 |
| --- | --- | --- |
| props | camelCase | 声明与使用两端都写 camel |
| 事件（Svelte 4） | `createEventDispatcher` + 小写事件名 | `dispatch('rowselect')` / `dispatch('row-select')`，监听时用 `on:rowselect` |
| 回调 prop（Svelte 5） | `on` + 事件名 | `onclick`、`onsave`（Svelte 5 用回调 props 替代 `on:` 指令） |
| 事件转发 | `on:click` 不带 handler | 把原生事件往上透传 |
| 插槽 | `name` 用 kebab 或单词 | `<slot name="header" />` |

**Svelte 4 的事件名陷阱**：`on:click` 中带冒号的写法在 DOM 里大小写不敏感，自定义事件名一旦包含大写字母，监听端极易踩空。**一律全小写**，需要分词就用短横线。

### 10.3 store 与 runes

```ts
// stores/user.ts
import { writable, derived } from 'svelte/store'

export const currentUser = writable<UserProfile | null>(null)
export const isLoggedIn = derived(currentUser, ($user) => $user !== null)
```

| 元素 | 命名 | 说明 |
| --- | --- | --- |
| store 变量 | `xxx` 或 `xxxStore` | 全仓统一；`$user` 里的 `$` 是**自动订阅语法**，不是名字的一部分 |
| store 文件 | 与领域同名 | `stores/user.ts` |
| 派生 store | 形容词 / 布尔 | `isLoggedIn`、`visibleTodos` |
| 自定义 store | `createXxxStore` | `createCounterStore()` |
| runes（Svelte 5） | `$state` / `$derived` / `$effect` / `$props` / `$bindable` | **`$` 开头是保留前缀**，不要给自己变量起 `$foo` |

```svelte
<script>
  // ✅ Svelte 5 runes
  let count = $state(0)
  const doubled = $derived(count * 2)

  // ❌ 不要用 $ 前缀命名自己的变量，会与 runes / store 订阅语法冲突
  // let $custom = 1
</script>
```

### 10.4 插槽与模块上下文

| 元素 | 写法 | 说明 |
| --- | --- | --- |
| 默认插槽 | `<slot />` | 不要起名 `default` |
| 具名插槽 | `<slot name="footer" />` | 名字用 kebab 或单数名词 |
| 插槽 prop | `let:item` / `<slot item={order}>` | 名字要有领域含义，避免 `let:data` |
| 模块级导出 | `<script context="module">`（Svelte 4）/ `<script module>`（Svelte 5） | 只放常量、类型、预加载函数 |
| 预加载 | `export const load`（SvelteKit） | 保留名，不可改 |

---

## 十一、项目名称与目录命名

### 11.1 仓库与包名

| 对象 | 规则 | 示例 |
| --- | --- | --- |
| GitHub 仓库名 | kebab-case 全小写，语义完整 | `solution`、`user-center`、`design-system` |
| npm 包名 | 全小写、URL 安全、不含空格与中文 | `date-format-kit`、`@acme/ui` |
| 私有包 | 加 scope | `@acme/user-profile` |
| 应用目录（monorepo） | kebab-case | `apps/web`、`apps/admin`、`packages/ui` |
| 数据库名 | snake_case 全小写 | `user_center` |
| 域名 / 子域 | kebab 或连写（DNS 不允许 `_`） | `user-center.example.com` |

npm 包名的硬性限制（发布时会被拒绝）：不能含大写字母、空格、`~`、`)`、`(`、`'`、`!`、`*`；不能以 `.` 或 `_` 开头；长度不超过 214 字符；不能与 Node 核心模块同名（`http`、`fs`、`path`）。

**项目名与产品名可以不同**：产品叫 `iTools`，包名就必须是 `itools`。此时要在 README 里写明映射关系，避免新人在 `package.json` 里找一个不存在的名字。

### 11.2 顶层目录

```text
my-app/
├─ src/                 # 源码
│  ├─ features/         # 按领域组织
│  ├─ shared/           # 跨领域共享
│  └─ assets/           # 参与构建的静态资源
├─ public/              # 原样拷贝的静态资源
├─ scripts/             # 构建 / 校验脚本
├─ tests/               # 跨模块测试（单元测试与源码同目录时可省略）
├─ docs/                # 项目文档
└─ config/              # 可拆分的配置文件
```

| 规则 | 说明 |
| --- | --- |
| 全小写 kebab-case | `src/`、`features/`、`shared/`；不要 `Src/`、`MyComponents/` |
| 复数目录装多个同类项 | `components/`、`hooks/`、`utils/`；`src/` 是单数例外 |
| 单数目录表示领域 | `features/order/`（订单领域），`features/orders/` 会让人以为是一个集合组件 |
| 不要 `common` / `misc` / `temp` / `new` | 无边界目录最终会变成垃圾场；按能力命名（`shared/ui`、`shared/lib`） |
| 禁止空格与中文 | 空格会导致命令行、CI、部分打包器出错；中文路径在 Windows + 某些工具链下编码不稳 |
| 深度控制在 4~5 层 | 更深的目录通常说明模块边界划分失败 |

### 11.3 文件命名

| 类型 | 词形 | 示例 |
| --- | --- | --- |
| 工具 / 纯函数模块 | kebab-case | `format-currency.ts`、`parse-query.ts` |
| 组件 | PascalCase | `OrderTable.tsx` |
| 类 | PascalCase | `OrderRepository.ts` |
| Hook / composable | `use` + PascalCase | `useOrderList.ts` |
| API 层 | 领域 + `.api` | `order.api.ts`、`user.service.ts` |
| 类型 | 领域 + `.types` | `order.types.ts` |
| 样式 | 与组件同名 + `.module.css` | `OrderTable.module.css` |
| 测试 | 同源名 + `.test` / `.spec` | `order.api.test.ts` |
| 声明 | 固定名 | `env.d.ts`、`global.d.ts` |
| 文档 | kebab-case | `getting-started.md` |

**大小写敏感陷阱（很容易踩）**：macOS 与 Windows 的默认文件系统**大小写不敏感**，Linux 与 CI 容器**敏感**。在本地把 `UserCard.tsx` 改名成 `usercard.tsx`，Git 可能认为「没有变化」，推到 Linux CI 后 import 就找不到文件。规避方式：

```bash
# 需要只改大小写时，用两段式 git mv
git mv UserCard.tsx UserCard.tmp.tsx
git mv UserCard.tmp.tsx user-card.tsx
git commit -m "chore(order): 统一组件文件命名为 kebab-case"
```

### 11.4 分支与提交

| 对象 | 规则 | 示例 |
| --- | --- | --- |
| 分支 | `类型/短描述`（kebab） | `feat/user-profile`、`fix/login-timeout`、`chore/deps` |
| 分支描述 | 英文小写，不超过 5 个词 | `feat/order-export`，不要 `feat/新增订单导出功能` |
| Tag | 语义化版本 | `v1.4.0`、`v2.0.0-beta.1` |
| 提交信息 | Conventional Commits | `feat(order): 新增订单导出` |

分支名只用小写字母、数字、`-`、`/`；不要用中文、空格、大写（部分 CI / Git 服务对大小写与编码处理不一致，`Feat/Order` 与 `feat/order` 可能被当成两个分支）。

### 11.5 环境变量与配置键

```bash
# ✅ 全大写 + 下划线 + 业务前缀
VITE_API_BASE_URL=https://api.example.com
VITE_FEATURE_ORDER_EXPORT=true
DATABASE_MAX_POOL_SIZE=20
```

| 规则 | 说明 |
| --- | --- |
| 前端可见变量必须有框架前缀 | Vite：`VITE_`；Next.js：`NEXT_PUBLIC_`；CRA：`REACT_APP_`；SvelteKit：`PUBLIC_`。**没有前缀的变量不会注入前端**（也不要往里塞密钥） |
| 布尔变量以 `_ENABLED` / `_DISABLED` 结尾 | `VITE_FEATURE_ORDER_EXPORT_ENABLED=true`，避免 `VITE_ENABLE=true` 这种无法推断的名 |
| 单位写进名字 | `DATABASE_TIMEOUT_MS`、`CACHE_TTL_SECONDS` |
| 不要 `VITE_API_URL` 与 `VITE_API_BASE_URL` 并存 | 二选一，否则总有人读错 |
| 配置文件的键与代码里的字段同名 | `vite.config.ts` 里的 `server.port` 不要另造 `serverPort` |

---

## 十二、Java 命名规范

### 12.1 包与类

```java
// ✅ 包名全小写、反域名、单数
package com.acme.order.service;

// ✅ 类名 PascalCase，名词
public class OrderService {}
public abstract class AbstractOrderValidator {}
public final class OrderStatusCodes {}
```

| 元素 | 规则 | 示例 |
| --- | --- | --- |
| 包名 | 全小写，点分，反域名 | `com.acme.order`；包名不能用 `-`（非法标识符） |
| 类名 | UpperCamelCase | `OrderRepository` |
| 缩写 | 当作单词，只大写首字母 | `XmlParser`（不要 `XMLParser`）、`HttpClient` |
| 抽象类 | `Abstract` / `Base` 前缀 | `AbstractOrderValidator` |
| 工具类 | 名词 + `Utils` / `Helper` | `DateUtils`（尽量少建，优先用具名能力类） |
| 常量类 | 名词 + `Constants` | `OrderConstants` |
| 异常类 | `XxxException` | `OrderNotFoundException` |
| 测试类 | 被测类 + `Test` | `OrderServiceTest` |

### 12.2 方法与变量

```java
public class OrderService {
    // ✅ 方法：动词开头 camelCase
    public Order findOrderById(long orderId) {}
    public List<Order> listPendingOrders(int page, int pageSize) {}
    public boolean isOrderRefundable(long orderId) {}
    public void cancelOrder(long orderId, String reason) {}

    // ✅ 变量：camelCase，布尔用 is/has/can
    boolean hasPermission = false;
    int retryCount = 0;
    long timeoutMillis = 3000L;
}
```

| 规则 | 说明 |
| --- | --- |
| 方法名动词开头 | `get` / `find` / `list` / `create` / `update` / `delete` / `count` / `exists` |
| 查询前缀有语义差异 | `get`（可能为空或抛错）、`find`（可能返回 null/Optional）、`query`（复杂条件）；团队统一后不要混用 |
| 布尔方法用 `is` / `has` / `can` | `isActive()`、`hasNext()`；避免 `flag()` |
| 不写 `m_` / `_` 前缀 | 成员变量直接 camelCase，`this.` 已经区分作用域 |
| 常量全大写 | `static final int MAX_RETRY_COUNT = 3;` |
| 局部变量可短 | `for (int i = 0; ...)` 完全可接受 |

### 12.3 常量与枚举

```java
// ✅ 常量：SCREAMING_SNAKE_CASE
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_CHARSET = "UTF-8";

// ✅ 枚举：类型 PascalCase，成员全大写
public enum OrderStatus {
    PENDING_PAYMENT,
    PAID,
    REFUNDED;
}

// ⚠️ 现代写法也接受成员 PascalCase（与 TypeScript 一致），但同一项目只能选一种
public enum OrderStatus {
    PendingPayment,
    Paid,
    Refunded;
}
```

枚举成员别用 `0` / `1` 直接当业务码，除非与数据库、接口文档严格对齐（此时在注释与文档里写清映射）。

### 12.4 分层对象后缀

Java 后端最容易「一层一个名字」，同一份数据出现五个类：

| 后缀 | 含义 | 典型场景 |
| --- | --- | --- |
| `DO` / `PO` | 数据库持久化对象 | 与表一一对应，字段 = 列名转驼峰 |
| `DTO` | 跨层 / 跨服务传输对象 | Controller ↔ Service，或 RPC |
| `VO` | 视图对象 | 返回给前端的展示结构 |
| `BO` | 业务对象 | Service 内部聚合 |
| `Request` / `Response` | 接口入参 / 出参 | HTTP 层，比 `DTO` 更明确 |
| `Query` / `Param` | 查询条件 | 列表接口 |
| `Converter` / `Mapper` / `Assembler` | 对象转换 | `OrderConverter.toVo(order)` |

**建议**：不要五个后缀全用。最小可行组合是 `Entity`（持久化）+ `Request` / `Response`（HTTP）+ `Converter`（转换）。后缀存在的意义是**让人一眼知道这个对象属于哪一层**，如果层与层之间本来就没有边界，堆后缀只是自我安慰。

### 12.5 接口与实现

```java
// ✅ 接口直接叫名词，不加 I 前缀
public interface OrderRepository {
    Optional<Order> findById(long orderId);
}

// ✅ 实现类加 Impl（简单场景）或按实现方式命名
public class JdbcOrderRepository implements OrderRepository {}
public class OrderRepositoryImpl implements OrderRepository {}

// ✅ 服务接口与实现
public interface OrderService {}
public class OrderServiceImpl implements OrderService {}
```

`IOrderService` 是 C# 习惯，Java 社区主流是「接口名词、实现加 `Impl` 或技术前缀」。**不要给接口加 `Interface` 后缀**（`OrderRepositoryInterface`）。

### 12.6 测试命名

```java
@Test
void should_throw_when_order_not_found() {}

@Test
void findOrderById_returnsEmpty_whenOrderNotExists() {}

@ParameterizedTest
@ValueSource(ints = {0, -1})
void cancelOrder_rejects_nonPositiveOrderId(int orderId) {}
```

三种主流风格（选一种，全仓统一）：

| 风格 | 示例 |
| --- | --- |
| `methodName_stateUnderTest_expectedBehavior` | `cancelOrder_orderAlreadyPaid_throwsException` |
| `should_expectedBehavior_when_condition` | `should_throw_when_order_already_paid` |
| Given-When-Then（嵌套类） | `@Nested class WhenOrderIsPaid { … }` |

中文方法名（`订单已支付时取消失败`）在部分 IDE / 报告工具里可用，但不利于 grep 与 CI 日志，团队谨慎采用。

---

## 十三、Python 命名规范

### 13.1 模块与包

| 元素 | 规则 | 示例 |
| --- | --- | --- |
| 模块（`.py` 文件） | 全小写，可用下划线 | `order_service.py`、`http_client.py` |
| 包（目录） | 全小写，**尽量不用下划线** | `orders/`、`payments/` |
| 禁止 | 不能用 `-`（无法 import）、不要与标准库同名 | `json.py`、`types.py` 会遮蔽标准库 |
| 私有模块 | 单下划线前缀 | `_internal_helpers.py` |
| 测试文件 | `test_` 前缀或 `_test` 后缀 | `test_order_service.py`（pytest 默认收集 `test_*.py`） |

### 13.2 函数与变量

```python
# ✅ 函数与变量：snake_case
def get_order_by_id(order_id: int) -> Order | None:
    ...

retry_count = 0
is_active = True
order_list = fetch_orders()
```

| 规则 | 说明 |
| --- | --- |
| 函数 / 变量 / 参数 | snake_case；PEP 8 明确不要用驼峰 |
| 布尔 | `is_` / `has_` / `can_` 前缀 |
| 单字母变量 | 避免 `l`、`O`、`I`（与数字 1、0 视觉混淆）；循环里 `i` / `j` 可以 |
| 避免遮蔽内置 | `list`、`dict`、`id`、`type`、`input`、`format`、`sum`、`next` 不要当变量名 |
| 下划线占位 | 未使用的返回值用 `_`：`for _ in range(3):` |

### 13.3 类与异常

```python
# ✅ 类：CapWords（PascalCase）
class OrderService:
    ...

class OrderNotFoundException(Exception):
    ...

class RetryableMixin:
    ...
```

| 元素 | 规则 | 示例 |
| --- | --- | --- |
| 类 | PascalCase | `OrderRepository` |
| 异常 | 名词 + `Error` / `Exception` | `PaymentDeclinedError` |
| Mixin | 能力 + `Mixin` | `JsonSerializableMixin` |
| 抽象基类 | `Abstract` 前缀或 `ABC` 后缀 | `AbstractRepository`、`RepositoryABC` |
| Protocol（结构化类型） | 描述能力 | `SupportsClose`、`Readable` |

### 13.4 常量与私有

```python
# ✅ 模块级常量：全大写 + 下划线
MAX_RETRY_COUNT = 3
DEFAULT_TIMEOUT_SECONDS = 30

class OrderService:
    def __init__(self, repository: OrderRepository) -> None:
        self._repository = repository      # 约定私有
        self.__cache: dict[int, Order] = {}  # 名称改写（name mangling）

    def _build_query(self) -> str:
        ...                                # 只在本类 / 子类使用的内部方法
```

| 写法 | 语义 |
| --- | --- |
| `name` | 公开 |
| `_name` | 内部使用（约定，不强制）；`from module import *` 不会导入 |
| `__name` | 类内名称改写（`_ClassName__name`），避免子类冲突；**不是**真私有 |
| `__name__` | 魔术方法 / 特殊属性，**不要自定义** |
| `name_` | 与关键字避让：`class_`、`type_`、`id_` |

### 13.5 类型注解与别名

```python
from typing import TypeVar, Protocol

T = TypeVar("T")
K = TypeVar("K")
V = TypeVar("V")

# Python 3.12+
type UserId = int

# 3.11 及以前
from typing import TypeAlias
UserId: TypeAlias = int

class SupportsClose(Protocol):
    def close(self) -> None: ...
```

| 元素 | 规则 |
| --- | --- |
| 类型变量 | 单个大写字母或 `T` + 名词：`T`、`TResult` |
| 类型别名 | PascalCase（PEP 8：类型相关名字用 CapWords） |
| Protocol | 能力描述（`SupportsClose`）或名词（`Repository`） |
| 注解里避免 `Any` | 用具体类型或 `object` + 收窄，`Any` 会关掉检查 |

---

## 十四、MySQL 命名规范

### 14.1 库、表、字段

```sql
CREATE DATABASE user_center DEFAULT CHARACTER SET utf8mb4;

CREATE TABLE user_profile (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  display_name  VARCHAR(64)     NOT NULL,
  mobile_phone  VARCHAR(20)     DEFAULT NULL,
  is_verified   TINYINT(1)      NOT NULL DEFAULT 0,
  created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_profile_user_id (user_id)
) ENGINE = InnoDB;
```

| 规则 | 说明 |
| --- | --- |
| 库 / 表 / 字段全小写 snake_case | Linux 上 `lower_case_table_names=0` 时表名**区分大小写**，混用大小写必然在某个环境炸 |
| 表名用单数 | `user`、`order_info`（阿里巴巴 Java 开发手册要求表名不使用复数）；若团队用复数（Rails / Laravel 习惯），全库统一即可 |
| 不加 `tbl_` / `tb_` 前缀 | 表名本身就是表，前缀零信息 |
| 字段不重复表名 | `user.name` 而不是 `user.user_name`；只有与业务强相关的字段才带前缀（`user.avatar_url`） |
| 长度 ≤ 32 字符 | 超过就该考虑拆表或改结构 |
| 禁止两个下划线之间只有数字 | `user_1_2` 这类命名会让解析工具误判 |
| 不用拼音 | `yonghu` 无法被搜索、无法被同事理解；已有拼音表名要建映射文档 |

### 14.2 主键与外键

| 场景 | 命名 | 说明 |
| --- | --- | --- |
| 单表自增主键 | `id` | `BIGINT UNSIGNED AUTO_INCREMENT` |
| 业务主键 | `xxx_id` | `user_id`、`order_no`（单号不是 id，用 `no` / `code`） |
| 外键列 | `<引用表单数>_id` | `user_id` 引用 `user.id`；`order_id` 引用 `order.id` |
| 多对多关联表 | `<表 A>_<表 B>`（按字母序） | `role_user`、`order_product` |
| 关联表主键 | 复合主键或自增 `id` + 唯一索引 | 复合主键 `(order_id, product_id)` 更省空间 |

`order`、`user`、`group` 是 MySQL 保留字或半保留字，`order` 作表名必须反引号包裹。**规范建议直接避开**：用 `order_info`、`sys_user`、`user_group`，比到处写反引号稳。

### 14.3 索引与约束

```sql
-- 主键：InnoDB 固定名为 PRIMARY
PRIMARY KEY (id)

-- 唯一索引：uk_<表>_<字段>
UNIQUE KEY uk_user_profile_mobile_phone (mobile_phone)

-- 普通索引：idx_<表>_<字段>，多字段按顺序拼接
KEY idx_order_info_user_id_created_at (user_id, created_at)

-- 外键：fk_<表>_<引用表>
CONSTRAINT fk_order_info_user_id FOREIGN KEY (user_id) REFERENCES user (id)
```

| 类型 | 前缀 | 示例 |
| --- | --- | --- |
| 主键 | `PRIMARY`（MySQL 固定） | 自定义命名时常用 `pk_` |
| 唯一索引 | `uk_` | `uk_user_mobile_phone` |
| 普通索引 | `idx_` | `idx_order_created_at` |
| 外键 | `fk_` | `fk_order_user_id` |
| 检查约束 | `ck_` | `ck_order_amount_positive` |

索引名必须全局唯一（MySQL 中索引名是表内唯一，但团队规范上建议带表名，便于在慢查询日志里定位）。

### 14.4 布尔与时间

| 类型 | 命名 | 存储 |
| --- | --- | --- |
| 布尔 | `is_xxx` / `has_xxx` | `TINYINT(1)`，0 / 1 |
| 创建时间 | `created_at` | `DATETIME(3)` |
| 更新时间 | `updated_at` | `DATETIME(3)`，`ON UPDATE` |
| 删除时间（软删） | `deleted_at` | `DATETIME(3)`，NULL 表示未删 |
| 业务时间 | `<动词过去分词>_at` | `paid_at`、`shipped_at`、`refunded_at` |
| 纯日期 | `xxx_date` | `DATE` 类型，如 `birth_date` |
| 时长 | `xxx_seconds` / `xxx_ms` | 整数，带单位 |
| 时间段（开始 / 结束） | `start_at` / `end_at` | 成对出现，不要 `begin_time` + `finish_time` 混用 |

**`_at` 与 `_time` 二选一**：`created_at` 和 `create_time` 在同库并存是灾难。推荐 `_at`（与 Java / JS 的 `createdAt` 完全对齐），旧库统一 `_time` 也可，但不能混。

### 14.5 金额与精度

```sql
-- ✅ 金额用 DECIMAL，字段带币种
amount        DECIMAL(18, 2) NOT NULL,
currency      CHAR(3)        NOT NULL DEFAULT 'CNY',

-- ✅ 费率 / 折扣用高精度 DECIMAL（0–1）
discount_rate DECIMAL(8, 6)  NOT NULL DEFAULT 0,

-- ❌ FLOAT / DOUBLE 存金额，累加会出现 0.1 + 0.2 ≠ 0.3
price FLOAT
```

| 数据 | 类型 | 命名 |
| --- | --- | --- |
| 金额 | `DECIMAL(18,2)` | `amount`、`total_amount`、`unit_price` |
| 币种 | `CHAR(3)` | `currency`（ISO 4217 代码） |
| 汇率 | `DECIMAL(12,6)` | `exchange_rate` |
| 百分比 | `DECIMAL(5,2)` | `discount_percent`（0–100） |
| 比例 | `DECIMAL(8,6)` | `tax_rate`（0–1） |
| 数量 | `INT UNSIGNED` | `quantity`、`stock_count` |

命名必须能区分「元」与「分」：数据库里存最小单位时字段名写 `amount_cents`，存元时写 `amount`，**不要两种混存**。

### 14.6 保留字与大小写

MySQL 保留字（部分高频）：`order`、`group`、`desc`、`asc`、`key`、`index`、`range`、`rank`、`system`、`window`、`condition`、`interval`、`read`、`write`、`left`、`right`、`join`、`match`、`usage`、`status`（非保留但易与业务字段混淆）。

| 做法 | 评价 |
| --- | --- |
| 表名 / 列名避开保留字 | ✅ 首选：`order_info`、`user_group`、`sort_order` |
| 依赖反引号 | ⚠️ 能跑，但拼 SQL、ORM 自动生成、报表工具都可能漏写反引号 |
| 用前缀绕开 | ⚠️ `t_order` 能避开，但引入了无信息前缀 |

大小写规则再强调一次：

- **表名 / 库名**：受 `lower_case_table_names` 影响。Linux 默认 `0`（区分大小写），Windows 默认 `1`（不区分），macOS 默认 `2`（不区分但按原样存储）。**唯一安全做法：全小写**。
- **列名 / 索引名 / 别名**：始终不区分大小写，但统一小写才能让 `SELECT` 结果、ORM 映射、导出的 CSV 表头一致。

### 14.7 前后端字段映射

同一条数据要穿过四层，每层词形不同：

```text
MySQL          user_profile.updated_at        (snake_case)
   ↓  MyBatis map-underscore-to-camel-case
Java 字段       private LocalDateTime updatedAt;  (camelCase)
   ↓  Jackson 默认（或显式 PropertyNamingStrategies.SNAKE_CASE）
JSON 字段       "updatedAt" 或 "updated_at"
   ↓
前端变量        updatedAt                      (camelCase)
```

| 做法 | 说明 |
| --- | --- |
| DB 用 snake，API 用 camel | 最常见组合，前端零转换 |
| API 用 snake | Python / PHP 后端常见；前端在 API 层统一转换（`camelcase-keys`），**不要在每个组件里手动转** |
| 大小写自动转换的坑 | `userID` 转 snake 会变成 `user_i_d`（多数库按大写字母边界切）；`is_deleted` 转 camel 是 `isDeleted`，与 Java 的 `deleted` 布尔字段对不上 |
| 单一真相 | 契约以接口文档（OpenAPI / TypeScript 类型）为准，DB 列名只是实现细节；不要在前端直接猜列名 |

**布尔字段的映射陷阱**：数据库用 `is_deleted`（0/1），Java 用 `Boolean deleted`，JSON 里出现 `deleted` 还是 `isDeleted` 取决于 getter 名（Lombok 为 `Boolean` 生成的 getter 是 `getDeleted`）。开工前把这三层的名字在文档里对齐一次，比事后排查一整天划算。

---

## 十五、接口与协议层命名

### 15.1 REST 路径

```text
GET    /v1/user-profiles                 列表（分页）
GET    /v1/user-profiles/{userId}        详情
POST   /v1/user-profiles                 创建
PATCH  /v1/user-profiles/{userId}        部分更新
DELETE /v1/user-profiles/{userId}        删除
GET    /v1/user-profiles/{userId}/orders 子资源
POST   /v1/orders/{orderId}/cancel       动作（无法用资源表达时的妥协）
```

| 规则 | 说明 |
| --- | --- |
| 资源用**复数名词** | `/users` 而不是 `/user`；`/user/get` 这类 RPC 风格不要混进 REST |
| 路径用 kebab-case | `/user-profiles`；下划线在 URL 里合法但不美观，且与驼峰混用更糟 |
| 路径**不含动词** | `GET /getUser` ❌；动作用 HTTP 方法表达 |
| 层级不超过 3 层 | 再深就改成查询参数或子资源 ID |
| 版本号放最前 | `/v1/`、`/v2/`；不要 `/api/getUserV2` |
| 路径参数用 camelCase | `{userId}`；与前端变量一致，减少一次转换 |
| 末尾不加 `/` | `/users` 与 `/users/` 视为同一资源，但重定向会增加一次请求 |
| 查询参数风格全站统一 | `?page=1&pageSize=20` 或 `?page=1&page_size=20`，**不要一半一半** |

### 15.2 请求参数与响应字段

| 场景 | 推荐 | 说明 |
| --- | --- | --- |
| 分页 | `page` + `pageSize`（或 `limit` + `offset`） | 两种模型不要混用；`pageSize` 比 `size` 明确 |
| 排序 | `sortBy` + `sortOrder`（`'asc'` / `'desc'`） | 不要用 `order=1` |
| 时间 | ISO 8601 字符串 `'2026-10-27T08:00:00.000Z'` | 字段名 `createdAt`，不要时间戳与字符串混用 |
| 枚举 | 字符串常量（`'pending'`） | 可读、可扩展；数值枚举每次新增都要查表 |
| 金额 | 整数最小单位 + 币种字段 | `amountCents` + `currency`，避免浮点精度问题 |
| 布尔 | `true` / `false` | 不要 `0` / `1`（前端做真值判断时 `0` 是假、`'0'` 是真，极易出错） |
| 空集合 | `[]` 而不是 `null` | `null` 让前端必须写空值判断（见 16.3 的落地约定） |

### 15.3 事件与消息

| 场景 | 命名 | 示例 |
| --- | --- | --- |
| 领域事件 | `领域.实体.动作`（过去式） | `user.account.created`、`order.payment.refunded` |
| 消息队列 topic | kebab-case | `user-account-created`、`order-refund-requested` |
| 前端埋点 | `页面_模块_动作` | `order_list_export_click` |
| 前端事件总线 | `领域:动作` | `user:logout`、`cart:updated` |
| WebSocket 消息类型 | 大写下划线 | `ORDER_UPDATED`、`PING` |
| 定时任务 | 动词 + 名词 | `syncOrderStatusJob`、`cleanExpiredSessionsJob` |

事件名**用过去式**（`created` / `updated` / `deleted`）表达「已经发生的事实」，用命令式（`createOrder`）表达「请求对方执行」。混淆会导致重试语义出错。

### 15.4 存储键与请求头

| 对象 | 命名 | 示例 |
| --- | --- | --- |
| localStorage / sessionStorage | `应用:模块:键` | `acme:auth:token`、`acme:order:filter` |
| Cookie | 全小写 + 连字符，安全前缀 | `__Host-session-id`、`theme` |
| 自定义请求头 | `X-` + Pascal-Kebab | `X-Request-Id`、`X-Tenant-Id` |
| IndexedDB 库名 | kebab 或 snake（全仓统一） | `acme-cache` |
| 缓存 key（Redis） | `业务:实体:id` | `order:detail:10086` |
| Feature flag | `feature.模块.能力` | `feature.order.export` |

补充说明：

- Cookie 的 `__Host-` 前缀要求 `Secure` + `Path=/` + 不带 `Domain`；`__Secure-` 只要求 `Secure`。这两个前缀是浏览器强制的安全约束，不是命名癖好。
- `X-` 前缀在 RFC 6648 里已「不建议新增」，但生态里仍是事实标准（网关、日志系统都按它识别），沿用即可。
- localStorage 必须带应用前缀：同一域名下的多个子应用共用同一个存储空间，裸 `token` 会互相覆盖。

---

## 十六、团队落地与遗留代码治理

### 16.1 建立词汇表

命名不一致的根因通常不是「不会起名」，而是**团队对同一个业务概念有多个叫法**。先建一张词汇表（Ubiquitous Language），再谈规范：

| 业务概念 | 代码用词（唯一） | 禁止的同义词 |
| --- | --- | --- |
| 用户 | `user` | `member`、`account`、`customer`、`client` |
| 订单 | `order`（表名 `order_info`） | `trade`、`bill`、`purchase` |
| 退款 | `refund` | `return`、`rebate`、`payback` |
| 优惠券 | `coupon` | `voucher`、`ticket`、`card` |
| 门店 | `store` | `shop`、`branch`、`outlet` |

落地方式：

1. 词汇表放仓库（`docs/glossary.md`），并在 Code Review 里引用它。
2. 词汇表里的词**同时约束**：变量名、接口路径、数据库表、埋点、日志字段、产品文案（对外文案可以有别名，但代码里只认一个）。
3. 新增概念时先查表，再决定是否新增词条——**多数「新概念」其实是老概念的变体**。

### 16.2 遗留代码迁移策略

一次性全量重命名在真实项目里几乎必然失败（改不完、测不全、评审看不懂）。可行策略是「**冻结 + 隔离 + 渐进**」：

| 阶段 | 动作 |
| --- | --- |
| 冻结 | 老模块不再新增文件；新增能力一律开新模块，按新规范命名 |
| 隔离 | 用目录 / 包 / 命名空间把新老代码分开（`legacy/`、`@app/legacy`），避免新人误用 |
| 加护栏 | 先补 lint 规则（只对新目录生效）、补测试、补类型，再改名字 |
| 渐进 | 每次改动只重命名「本次已经碰到」的代码；`deprecated` 别名保留一个版本 |
| 收口 | 老模块迁移完成后整体删除 `legacy/`，并把 lint 规则提升为全仓 |

**只在有新测试覆盖时才做批量重命名**。名字改错不会被编译器发现（`userName` → `username` 在动态属性访问、模板字符串、埋点里都可能静默失效），测试是唯一的安全网。

### 16.3 评审口径

Code Review 时对命名只问五个问题，避免变成风格争吵：

1. **这个名字是否说谎？** 名字说 A，实现做 B，一律要求改。
2. **是否有单位 / 量纲？** 数字类型参数与字段必须能看出单位。
3. **布尔是否正向且可判定？** `flag`、`status`、双重否定一律打回。
4. **集合是否复数、单个是否单数？** 以及是否与词汇表一致。
5. **跨层是否同一个词？** DB `updated_at` ↔ Java `updatedAt` ↔ JSON `updatedAt` ↔ 前端 `updatedAt`。

另外两条工程约定，比命名本身更能减少事故：

- **数组类返回值一律 `[]`，不用 `null`**。Go 的 nil 切片会被序列化成 `null`，前端 `list.length` 会直接抛错；后端保证返回空数组，前端再用 `Array.isArray(x) ? x : []` 兜底。
- **可选字段显式声明**。Rust / Java 的 `Option<T>` 序列化成 `null` 而不是 `undefined`，前端判空必须写 `!= null`（同时覆盖 `null` 与 `undefined`），只写 `!== undefined` 会漏。

---

## 十七、工具链强制约束

规范靠人记必然衰减，**能自动化的必须自动化**。以下配置按 ESLint 9 扁平配置给出，旧版 `.eslintrc` 把 `rules` 内容原样搬过去即可。

### 17.1 ESLint

```js
// eslint.config.js
export default [
  {
    rules: {
      // 基础驼峰（对属性放宽，因为接口返回常是 snake_case）
      camelcase: ['error', { properties: 'never', ignoreDestructuring: false }],

      // 更细的命名约束（TypeScript 项目推荐）
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        { selector: 'objectLiteralProperty', format: null },
      ],
    },
  },
  {
    // React / Vue 专属
    rules: {
      'react/jsx-pascal-case': 'error',
      'vue/multi-word-component-names': 'error',
    },
  },
]
```

| 规则 | 作用 |
| --- | --- |
| `camelcase` | 拦截 `user_name` 这类 JS 变量 |
| `@typescript-eslint/naming-convention` | 按 selector 精细控制；`format: null` 相当于放行 |
| `react/jsx-pascal-case` | 防止组件名小写被当成 HTML 标签 |
| `vue/multi-word-component-names` | 强制多单词组件名 |
| `react-hooks/rules-of-hooks` | 依赖 `use` 前缀判断 Hook 调用是否合法 |
| `no-shadow` | 防止内层变量遮蔽外层同名变量（命名混乱的常见来源） |

> 注意：`naming-convention` 与 `camelcase` 同时开启时，后者可能对符合前者规则的代码报错（例如 `UPPER_CASE` 常量）。TS 项目通常**只保留 `naming-convention`**，关掉 `camelcase`。

### 17.2 Stylelint

```json
{
  "rules": {
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
    "selector-id-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "custom-property-pattern": "^[a-z][a-z0-9-]*$",
    "keyframes-name-pattern": "^[a-z][a-z0-9-]*$",
    "selector-max-id": 0,
    "max-nesting-depth": 3
  }
}
```

| 规则 | 捕获的问题 |
| --- | --- |
| `selector-class-pattern` | `userCard`（驼峰类名）、`.card__title__icon`（元素嵌套元素） |
| `selector-id-pattern` | `#mainContent` |
| `custom-property-pattern` | `--colorBrand` |
| `selector-max-id` | 用 id 写样式（特异性灾难） |
| `max-nesting-depth` | 层层嵌套导致特异性失控 |

### 17.3 自定义检查与 CI

lint 只能查「已知位置」，跨文件的命名一致性要靠脚本：

```js
// scripts/check-filenames.mjs —— 检查文件名是否全小写 kebab，组件允许 PascalCase
import { readdirSync, statSync } from 'node:fs'
import { join, extname, basename } from 'node:path'

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*(\.[a-z0-9-]+)*$/
const PASCAL = /^[A-Z][A-Za-z0-9]*(\.[a-z0-9-]+)*$/
const COMPONENT_EXT = new Set(['.vue', '.tsx', '.jsx', '.svelte'])

function walk(dir, badFiles = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (entry === 'node_modules' || entry.startsWith('.')) continue

    if (statSync(full).isDirectory()) {
      walk(full, badFiles)
      continue
    }

    const ext = extname(entry)
    const name = basename(entry)
    const ok = COMPONENT_EXT.has(ext) ? PASCAL.test(name) : KEBAB.test(name)
    if (!ok) badFiles.push(full)
  }
  return badFiles
}

const badFiles = walk('src')
if (badFiles.length > 0) {
  console.error('以下文件命名不符合规范：\n' + badFiles.join('\n'))
  process.exit(1)
}
```

CI 里按「先报错再多改」的顺序推进：

| 阶段 | 命令 | 说明 |
| --- | --- | --- |
| 1 | `eslint .` | 命名 + 语法 + 框架规则 |
| 2 | `stylelint "src/**/*.{css,vue}"` | CSS 类名与嵌套 |
| 3 | `node scripts/check-filenames.mjs` | 文件名规范 |
| 4 | `tsc --noEmit` | 重命名后类型是否一致 |
| 5 | 单测 / 构建 | 最终验证 |

提交前用 `lint-staged` 只检查改动文件，避免「全仓历史问题」阻塞开发；CI 上则做全量检查，防止绕过。

### 17.4 编辑器与脚手架

| 手段 | 作用 |
| --- | --- |
| IDE「重命名符号」（F2 / LSP） | 唯一可靠的重命名方式，能跨文件改 import、类型、模板引用 |
| 代码片段（snippet） | 把 `useXxx`、`BaseXxx` 模板固化，减少起名犹豫 |
| 脚手架模板 | `create-vue` / `create-next-app` 生成的目录结构直接作为基线 |
| 提交模板 | `.gitmessage` 里放 Conventional Commits 示例 |
| 评审清单 | PR 模板里加「命名是否符合词汇表」一栏 |

---

## 十八、反例与重命名流程

### 18.1 反例对照表

| 反例 | 改法 | 问题 |
| --- | --- | --- |
| `const d = new Date()` | `const createdAt = new Date()` | 单字母不可检索 |
| `let flag = false` | `let isSubmitting = false` | 无语义 |
| `function handle() {}` | `function handleSubmit() {}` | 无宾语 |
| `function process(data) {}` | `function processRefund(refundRequest) {}` | 动词 + 泛参数 |
| `res.data.data.list` | `response.body.items` | 层层 `data` 无法调试 |
| `status === 1` | `status === OrderStatus.Paid` | 魔法数 |
| `isNotValid` | `isInvalid` | 双重否定 |
| `timeout` | `timeoutMs` | 无量纲 |
| `user_list`（JS 变量） | `userList` | 词形错误 |
| `userList`（Map） | `userById` | 名字与结构不符 |
| `.red-text` | `.text-danger` | 外观耦合，换色即过期 |
| `.title` | `.article-title` | 过于泛化，冲突 |
| `#header { }` | `.site-header { }` | id 写样式 |
| `.card__title__icon` | `.card__title-icon` | BEM 元素嵌套元素 |
| `utils/common.js` | `utils/date-format.ts` | 无边界垃圾桶 |
| `index.js` 导出一切 | 按领域拆文件 | 循环依赖 + tree-shake 失效 |
| `UserCard.vue` 里 `props.user` 与局部 `user` 同名 | 局部改名 `currentUser` | 遮蔽（shadow） |
| 组件 prop `onClick` 透传给 DOM | `onConfirm` | 同名字两种语义 |
| 表 `order` | `order_info` | 保留字 |
| 列 `create_time` + `created_at` 并存 | 统一一种 | 同概念两名 |
| 接口 `/getUserList` | `GET /users` | RPC 风格混入 REST |
| 分支 `feature/NewOrder` | `feat/order-export` | 大写 + 无类型前缀 |
| 包名 `MyUtils` | `my-utils` | npm 不允许大写 |

### 18.2 安全重命名流程

重命名的风险不在「改」，而在「漏改」——漏改的地方通常不报错：

| 漏改点 | 后果 |
| --- | --- |
| 字符串形式的引用（`obj['userName']`、`emit('rowSelect')`） | IDE 重命名不会改，运行时静默失效 |
| 模板 / HTML 里的属性（`user-name="x"`） | 组件收到空值，用默认值兜底，看起来「没生效」 |
| 动态 import 路径（`import('./UserCard')`） | 构建报错或运行时 404 |
| 埋点 / 日志字段名 | 数据看板断裂，且很难回溯 |
| 接口字段（前端改名、后端没改） | 线上拿到 `undefined` |
| 数据库列（ORM 映射） | 查询报错或字段为 null |
| 文档 / 注释 / Storybook | 认知负担，后来者按旧名字写新代码 |
| e2e 测试选择器（`[data-testid="userName"]`） | 测试失败（这类失败是好事） |

标准步骤：

1. **摸底**：`rg -w "userName"` 全仓搜索（含 `*.vue`、`*.md`、`*.json`、`*.sql`），列出所有出现位置并分类（代码 / 字符串 / 模板 / 文档 / 接口）。
2. **建基线**：确认 `tsc --noEmit`、单测、构建三项当前都是绿的——否则改完无法判断是不是自己弄坏的。
3. **改一个概念**：一次只重命名一个词，不要顺手改格式。改完立刻跑类型检查与测试。
4. **处理跨层**：接口字段改名要分两步（先同时支持新旧字段，再删除旧字段），数据库列改名要配迁移脚本与双写过渡。
5. **保留兼容层**（对外 API）：导出旧名并标注 `@deprecated`，给一个版本的迁移期。
6. **更新文档**：词汇表、README、接口文档、埋点文档同步改。
7. **独立提交**：重命名单独一个 commit（`refactor(order): 重命名 userList 为 orderList`），方便 review 与回滚。

### 18.3 常见争议与结论

| 争议 | 结论 |
| --- | --- |
| 接口字段用 camel 还是 snake | 前端主导的项目用 camel；后端主导（Python / PHP）用 snake，并在 API 层统一转换。**关键不是选哪个，而是全站只用一个** |
| 数据库表名用单数还是复数 | 都能自洽；阿里巴巴手册用单数，Rails / Laravel 用复数。选一个，写进规范 |
| 接口是否加 `I` 前缀 | TypeScript / Java 都不加；只有 C# 生态习惯加。存量代码已有 `IXxx` 时，跟随现状 |
| 异步函数是否加 `Async` 后缀 | 默认不加（类型可见）；只有同仓存在同步版本时并置使用 |
| 缩写大写还是小写 | 全仓统一；`HttpClient`（.NET / Java）与 `HTTPClient`（Airbnb）都可，别混用 |
| 是否需要 `index.ts` 桶文件 | 只用于「包对外出口」；业务目录内不要用，会造成循环依赖与 tree-shake 失效 |
| `utils` 目录是否该存在 | 可以存在，但只能放**无业务语义的纯函数**；一旦出现 `formatUserOrder` 就该移到领域目录 |
| 中文变量名是否可用 | 语法合法，但工具链（正则、日志、国际化、某些打包器）支持不一致；禁止 |
| 文件名 kebab 还是 Pascal | 组件用 Pascal（与组件名一致），其余用 kebab；全仓统一即可 |

---

## 十九、分层速查与进阶路线

### 19.1 新手必守（照着做就不会错）

1. 变量、函数、参数：`camelCase`；类、组件、类型：`PascalCase`。
2. CSS 类、id、文件名、目录名：`kebab-case` 全小写；`snake_case` 只给 Python 与 MySQL。
3. 布尔以 `is` / `has` / `can` 开头，不用 `flag`、`status`。
4. 函数名 = 动词 + 宾语，不用 `handle`、`process` 单独成句。
5. 数字带单位：`timeoutMs`、`sizeBytes`、`priceCents`。
6. 集合用复数（`users`），单个用单数（`user`）。
7. 不用 `data`、`info`、`obj`、`tmp`、`a1`、`test1`。
8. HTML 属性全小写；布尔属性只写名字（`disabled`，不是 `disabled="true"`）。
9. `data-*` 全小写，多个单词用连字符（`data-user-id` → `dataset.userId`）。
10. `class` 只给样式用，行为钩子用 `data-action`。
11. 组件名至少两个单词（`UserCard`，不要 `Card`）。
12. props 定义 camel、模板传 kebab（Vue）；**Svelte 两端都写 camel**。
13. 回调 prop 用 `onXxx`，组件内处理器用 `handleXxx`。
14. 常量：真正不变的配置才用 `UPPER_SNAKE_CASE`。
15. 文件名与默认导出名一致；改大小写用两段式 `git mv`。

### 19.2 进阶关注（跨团队协作的断层区）

1. **跨层同词**：`updated_at`（DB）→ `updatedAt`（Java）→ `updatedAt`（JSON）→ `updatedAt`（前端），一次对齐，永久受益。
2. **词形与场景矩阵**（2.5 节）能挡住 90% 的「这个文件该叫什么」的争论。
3. **BEM 的四条硬规则**：元素不嵌套元素、修饰与基础类并存、修饰不用后代选择器、选择器不超过两层。
4. **事件命名链路**：`emit('rowSelect')` ↔ `@row-select`（Vue 3 自动转换，Vue 2 不会）↔ Svelte 全小写事件名。
5. **状态类与工具类分离**：`.is-active`（状态）、`.u-mt-8`（工具）、`[data-state]`（组件状态），三者职责不混。
6. **环境变量前缀**：`VITE_` / `NEXT_PUBLIC_` / `PUBLIC_`，没前缀就不会注入前端。
7. **`null` vs `[]`**：接口空集合返回 `[]`；前端 `Array.isArray()` 兜底；可选字段判空写 `!= null`。
8. **`index.ts` 桶文件的代价**：循环依赖、tree-shake 失效、IDE 跳转到出口而非实现。
9. **SQL 保留字**：`order`、`group`、`key`、`desc` 直接避开，比到处写反引号稳。
10. **文件名大小写**：本地不敏感、CI 敏感；只改大小写必须两段式 `git mv`。

### 19.3 高级与架构级

1. **命名即契约**：导出 API、接口字段、数据库列、URL 一旦发布，改名成本随扩散半径指数上升；把这些位置的命名纳入设计评审，而不是编码阶段随手起。
2. **领域语言（Ubiquitous Language）**：词汇表是比 lint 更根本的约束——lint 管词形，词汇表管词义。同一概念三个叫法，任何 lint 都救不了。
3. **品牌类型**：`type UserId = string & { readonly __brand: 'UserId' }` 让「都是 string 的 ID」在编译期不可互换，这是命名之外的第二道防线。
4. **语义前缀 > 类型前缀**：匈牙利命名法的正确遗产是 `is` / `has` / `row` / `col` / `usd`（让错误代码看起来就错），而不是 `str` / `int` / `b`。
5. **迁移策略优于一次重构**：冻结 → 隔离（`legacy/`）→ 加护栏（测试 + lint）→ 渐进重命名 → 收口删除，比「一个 PR 全仓改名」可靠一个数量级。
6. **自动化分层**：IDE 重命名（符号级）→ lint（文件级）→ 脚本（跨文件规则）→ CI（全量）→ 评审（语义与词汇表）。越靠前的越便宜，越靠后的越容易漏。
7. **可观测性命名**：日志字段、埋点、trace span 名与代码字段同源，否则数据看板与代码永远对不上（`order_id` / `orderId` / `orderNo` 在三个系统里各叫一个名）。
8. **命名的可测性**：能被 grep 精确命中的名字，才能被安全重构；评估一个新名字时，问一句「我能在 10 秒内找到所有引用吗」。

---

## 附录 A 命名风格转换对照表

同一业务概念（用户档案的最后更新时间）在 16 个位置的写法：

| 位置 | 写法 |
| --- | --- |
| JS 变量 | `lastUpdatedAt` |
| JS 常量 | `LAST_UPDATED_AT` |
| TS 类型 / 接口 | `UserProfile` |
| TS 泛型 | `TProfile` |
| Vue 组件文件 | `UserProfile.vue` |
| Vue prop（定义 / 模板） | `lastUpdatedAt` / `:last-updated-at` |
| Vue emit（声明 / 监听） | `emit('lastUpdated')` / `@last-updated` |
| React 组件 | `UserProfile.tsx` |
| React prop | `lastUpdatedAt` |
| Svelte 组件 / prop | `UserProfile.svelte` / `lastUpdatedAt` |
| HTML class | `user-profile__meta` |
| CSS 自定义属性 | `--user-profile-meta-gap` |
| 文件名（模块） | `user-profile.ts` |
| 目录名 | `user-profile/` |
| npm 包名 | `@acme/user-profile` |
| URL 路径 | `/v1/user-profiles/{userId}` |
| Java 类 / 方法 | `UserProfileService` / `getLastUpdatedAt()` |
| Python 模块 / 变量 | `user_profile.py` / `last_updated_at` |
| MySQL 表 / 列 | `user_profile.last_updated_at` |
| 环境变量 | `USER_PROFILE_CACHE_TTL_SECONDS` |
| 日志字段 | `user_profile.last_updated_at` 或 `lastUpdatedAt`（全链路统一一种） |
| 埋点事件 | `user_profile_update_success` |

---

## 附录 B 交付前检查清单

提交前逐项打勾（可按项目裁剪，但不要新增未定义风格）：

- [ ] 变量 / 函数 camelCase，类 / 组件 / 类型 PascalCase，常量 SCREAMING_SNAKE（真正不可变才用）。
- [ ] 布尔以 `is` / `has` / `can` / `should` 开头，无双重否定，无 `flag`。
- [ ] 数字字段 / 参数带单位（`Ms` / `Px` / `Bytes` / `Cents` / `Seconds`）。
- [ ] 集合是复数，单个是单数；Map / Set 的名字能体现结构。
- [ ] 函数名是「动词 + 宾语」，没有 `handle` / `process` 单独成句。
- [ ] 没有 `data` / `info` / `obj` / `tmp` / `flag` / `a1` / `test1` 这类模糊名。
- [ ] HTML 属性全小写，布尔属性只写名字，`data-*` 全小写且多词连字符。
- [ ] CSS 类 kebab-case，BEM 无元素嵌套元素，选择器不超过两层，未用 id 写样式。
- [ ] CSS 自定义属性 kebab-case，带类别前缀（`--color-*` / `--space-*`）。
- [ ] 组件名多单词，文件名与组件名一致；基础组件 `Base`、单例 `The`、紧耦合父前缀。
- [ ] Vue：props 定义 camel、模板 kebab；emit 定义 camel、监听 kebab（Vue 2 事件名全 kebab）。
- [ ] React：回调 prop `onXxx`、内部处理器 `handleXxx`、Hook `useXxx`、Context `XxxContext` + `XxxProvider`。
- [ ] Svelte：props 两端都写 camel（不自动转换）；事件名全小写；不给自己的变量加 `$` 前缀。
- [ ] 文件名全小写 kebab（组件 Pascal），跨平台大小写一致；只改大小写用了两段式 `git mv`。
- [ ] 目录名全小写 kebab，无 `common` / `misc` / `temp`。
- [ ] npm 包名全小写 kebab，仓库名 / 分支名语义化，分支带 `feat/` `fix/` `chore/` 前缀。
- [ ] 环境变量 SCREAMING_SNAKE + 框架前缀（`VITE_` / `NEXT_PUBLIC_` / `PUBLIC_`）。
- [ ] Java：包全小写、类 Pascal、方法 / 变量 camel、常量全大写、接口不加 `I` 前缀。
- [ ] Python：模块 / 函数 / 变量 snake、类 Pascal、常量全大写、私有用单下划线、`__` 不自造。
- [ ] MySQL：库表列全小写 snake、表名风格统一、主键 `id` / 外键 `xxx_id`、索引 `idx_` / `uk_` / `fk_`。
- [ ] 金额用 DECIMAL + 最小单位命名；时间字段 `_at` 与 `_time` 未混用；未用保留字。
- [ ] REST：资源复数、路径 kebab、无动词、版本在最前、查询参数风格全站统一。
- [ ] 跨层字段同名（DB → 后端 → JSON → 前端），布尔字段三端对齐。
- [ ] 新增文件已通过 ESLint / Stylelint / 文件名脚本检查，`tsc --noEmit` 与构建通过。

---

> 最后一条建议：**规范的目的不是消灭差异，而是把差异限制在「不影响协作」的范围内**。两个团队各自用 camel 还是 snake 都无所谓，同一个仓库里两种并存才是真问题。定规范时优先写「必须」与「禁止」，把「建议」留给评审——一份谁都记不住的规范，不如五条能自动化执行的规则。
