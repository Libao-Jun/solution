# H5 唤起 APP 与跳转应用商店下载 · 通用实现指南

> 本文是一份**与具体项目无关**的通用方案指南，适用于「在浏览器（或微信 / Safari 等外部浏览器）中打开 H5 落地页时，自动唤起已安装的 APP；若未安装则跳转到对应应用商店引导下载」这一需求的实现。
>
> 文中所有 `{{...}}` 均为**需要按自身项目替换的占位符**，请在实现时替换为你自己的真实值。

---

## 1. 需求与目标

当用户通过分享链接、二维码、广告等进入 H5 网页时：

1. **已安装 APP** → 直接唤起 APP，并携带业务参数跳转到指定页面（如邀请入桌、商品详情等）。
2. **未安装 APP** → 跳转到对应平台的应用商店（iOS → App Store，Android → Google Play 或 APK 直链）引导下载。

核心难点在于：**浏览器无法直接、可靠地「检测 APP 是否安装」**，因此所有方案都是围绕「尝试唤起 + 失败兜底」展开的。

---

## 2. 关键配置项（占位符）

实现前需先确定以下标识，全篇以占位符引用：

| 配置项 | 占位符 | 说明 |
| --- | --- | --- |
| **URL Scheme** | `{{APP_SCHEME}}` | 如 `myapp`，唤起协议为 `myapp://` |
| **Android 包名** | `{{ANDROID_PACKAGE_NAME}}` | 如 `com.example.myapp`，用于 intent 与 Google Play |
| **Universal Link 域名** | `{{UNIVERSAL_LINK_DOMAIN}}` | 如 `app.example.com`，需可托管 `apple-app-site-association` |
| **Universal Link 路径** | `{{UL_PATH}}` | 唤起后 APP 打开的落地路由，如 `splash` |
| **App Store App ID** | `{{APPLE_APP_ID}}` | 商店应用唯一 id，如 `1234567890` |
| **App Store 前缀** | `{{APP_STORE_BASE}}` | 通常为 `https://apps.apple.com/us/app/id` 或地区化路径 |
| **Google Play 前缀** | `{{PLAY_STORE_BASE}}` | 通常为 `https://play.google.com/store/apps/details?id=` |
| **APK 直链（可选）** | `{{APK_URL}}` | 非商店渠道下载地址 |
| **TestFlight（可选）** | `{{TESTFLIGHT_URL}}` | iOS 内测分发 |

建议把这些常量收敛到一个独立的配置文件（如 `src/constants/evoke.ts`），避免散落各处、难以维护。

---

## 3. 方案选型总览

| 平台 | 已安装处理 | 未安装处理 | 推荐机制 |
| --- | --- | --- | --- |
| **iOS** | Universal Link 直接拉起 | 跳 App Store | Universal Link + 安装检测兜底 |
| **Android (Chrome)** | Intent 按 scheme 拉起 | 回退应用市场 / fallback url | Chrome Intent（`S.browser_fallback_url`） |
| **Android (非 Chrome)** | 尝试 scheme | 定时器跳商店 | scheme + 定时器兜底 |

两套主流实现思路（可二选一或组合）：

- **思路 A（推荐，体验好）**：iOS 用 Universal Link，Android 用 Chrome Intent，依赖系统原生能力处理「未安装回退」，无需自己探测安装。
- **思路 B（兼容广，最通用）**：统一用 `{{APP_SCHEME}}://` 尝试唤起，配合「3s 定时器 + `visibilitychange` 兜底」跳商店。兼容性最强，但依赖是否安装的间接判断。

---

## 4. iOS 方案

### 4.1 推荐：Universal Link（思路 A）

Universal Link 是 iOS 9+ 的官方机制：一个普通的 **https 链接**在已安装 APP 时由系统直接拉起 APP，未安装时则作为普通网页打开。

```ts
const universalLink = `https://${UL_DOMAIN}/${UL_PATH}?${params}`   // 已安装 → 拉起 APP
const appStoreURL  = `${APP_STORE_BASE}${APPLE_APP_ID}?${params}`  // 未安装 → 跳商店

if (isIOS()) {
  // 若希望「未安装时直接跳商店而非打开网页」，需先检测是否安装
  const installed = await detectInstalled()
  window.location.href = installed ? universalLink : appStoreURL
}
```

- 已安装：访问 `https://{{UNIVERSAL_LINK_DOMAIN}}/{{UL_PATH}}?...` 直接拉起 APP，不弹网页。
- 未安装：Universal Link 退化为普通网页。因此若想「未安装直接去商店」，需先检测安装状态（见 4.2），否则用户会先看到网页。

### 4.2 安装检测（iframe 探测）

通过隐藏 `<iframe>` 尝试加载 scheme，300ms 后根据页面状态变化判断：

```ts
function detectInstalled(scheme: string, path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const link = `${scheme}://${path}`
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = link
    document.body.appendChild(iframe)
    setTimeout(() => {
      document.body.removeChild(iframe)
      // 唤起成功通常会触发页面隐藏 / referrer 变化 / href 变化
      resolve(document.hidden || document.referrer.includes(scheme))
    }, 300)
  })
}
```

> 该探测在系统浏览器中较可靠，但在微信 / 部分国产浏览器中 `document.hidden` 不可靠，需配合多信号兜底（见第 8 节）。

### 4.3 兼容方案：直接 scheme + 商店兜底（思路 B）

若不使用 Universal Link，也可直接访问 `{{APP_SCHEME}}://...`，再靠第 6 节的通用兜底跳商店。

---

## 5. Android 方案

### 5.1 推荐：Chrome Intent（思路 A）

Chrome 25+ 支持 Intent 语法，可在未安装时由 `S.browser_fallback_url` 精确控制回退地址（默认回退到应用市场）。

```ts
const intentLink = `intent://${UL_PATH}/#Intent;` +
  `scheme=${APP_SCHEME};` +
  `package=${ANDROID_PACKAGE_NAME};` +
  `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_BASE + ANDROID_PACKAGE_NAME)};` +
  `end;`

if (isAndroid()) {
  window.location.href = intentLink
}
```

- 已安装：按 `scheme` 唤起 APP。
- 未安装：跳转 `S.browser_fallback_url`（此处为 Google Play 详情页）；若省略该参数则系统自动打开应用市场。

### 5.2 兼容方案：scheme + 定时器兜底（思路 B）

对于非 Chrome 浏览器（或其他无法用 Intent 的场景），用 scheme 尝试唤起，并用第 6 节机制兜底跳商店。

---

## 6. 通用安装兜底机制（思路 B 核心）

当无法依赖系统回退时（如直接 scheme 唤起），采用「先唤起 + 定时器跳商店 + 页面切后台即取消」的通用模式：

```ts
let fallbackTimer: number

function openAppOrMarket() {
  const isiOS = /iPhone|iPad|iPod|IOS/i.test(navigator.userAgent)

  // 兜底：3s 后若仍未唤起成功，则跳商店
  fallbackTimer = window.setTimeout(() => {
    window.location.href = isiOS
      ? `${APP_STORE_BASE}${APPLE_APP_ID}`
      : `${PLAY_STORE_BASE}${ANDROID_PACKAGE_NAME}`
  }, 3000)

  // 尝试唤起 APP，并附带业务参数
  const params = buildParams() // 见第 7 节
  window.location.href = `${APP_SCHEME}://${UL_PATH}?${params}`

  watchVisibility()
}

// 页面被切到后台（APP 已唤起）= 成功，清除定时器避免误跳商店
function watchVisibility() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(fallbackTimer)
  })
}
```

原理：唤起成功会把当前网页切到后台 → `visibilitychange` 触发 → 清除定时器；若 3s 内未切换（未安装），定时器到点跳商店。

---

## 7. 唤起时携带参数

将落地页链接中的业务参数透传给 APP，常见字段（按自身业务调整）：

- `routeName` / `path`：APP 内目标页面
- `inviteCode` / `code`：邀请码
- `trackId`：追踪 id
- `phone`：手机号（可选）
- `source`：来源平台（iOS / Android / HarmonyOS …）

建议从 URL 解析后再拼接，缺失字段不拼：

```ts
function buildParams() {
  const q = new URLSearchParams(location.search)
  const parts: string[] = []
  const add = (k: string, v?: string) => v && parts.push(`${k}=${encodeURIComponent(v)}`)
  add('routeName', '/game')
  add('inviteCode', q.get('inviteCode') ?? undefined)
  add('trackId', q.get('trackId') ?? undefined)
  add('source', getCurrentOS())
  return parts.join('&')
}
```

---

## 8. 平台判断与兼容性

### 8.1 平台识别（通用）

```ts
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}
function isAndroid() {
  return /Android/.test(navigator.userAgent)
}
function getCurrentOS(): string {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  if (/Android/.test(ua)) return 'Android'
  if (/HarmonyOS|HONOR|HUAWEI/.test(ua)) return 'HarmonyOS'
  if (/Mac/.test(ua)) return 'macOS'
  if (/Win/.test(ua)) return 'Windows'
  return 'Unknown'
}
```

> `isIOS()` 未覆盖 iPadOS 13+ 桌面模式 UA（`Macintosh` + `Safari`），严谨场景可补充 `navigator.maxTouchPoints > 1` 判断。

### 8.2 常见兼容问题

1. **微信 / 部分国产浏览器**：会拦截 scheme、Intent 与 Universal Link。常见做法：先引导用户点击右上角「在浏览器打开」，或展示遮罩提示，再触发唤起。
2. **安装探测不可靠**：iframe + `document.hidden` 在部分 webview 中无效，可叠加 `pagehide` / `blur` 等多信号判断。
3. **Universal Link 误判**：若 `detectInstalled()` 失败，可能误跳商店或卡网页，建议加超时保护。

---

## 9. 前置依赖（native / server 侧）

H5 只能发起链接，以下能力必须在 APP 与域名侧提前配置，否则唤起失败：

### 9.1 iOS · Universal Link
- 域名 `{{UNIVERSAL_LINK_DOMAIN}}` 下托管 `apple-app-site-association`（声明 `applinks` 与对应 AppID / paths），位置为根目录或 `/.well-known/`。
- APP 工程配置 Associated Domains：`applinks:{{UNIVERSAL_LINK_DOMAIN}}`。

### 9.2 Android · Deep Link / App Links
- `AndroidManifest.xml` 中为目标 Activity 配置 `<intent-filter>`（`action=VIEW`、`category=BROWSABLE`，声明 `scheme={{APP_SCHEME}}`）。
- 如需 App Links（https 直接唤起、避免弹选择器），在 `{{UNIVERSAL_LINK_DOMAIN}}/.well-known/assetlinks.json` 声明包名与指纹。

### 9.3 商店上架
- App Store 应用 id `{{APPLE_APP_ID}}` 需已上架或可访问。
- Google Play 包名 `{{ANDROID_PACKAGE_NAME}}` 需已发布；否则 Android 走 APK 直链 `{{APK_URL}}`。

---

## 10. 完整通用代码模板（思路 A + B 组合）

```ts
// src/utils/evoke.ts （建议统一封装）
const CONFIG = {
  scheme: '{{APP_SCHEME}}',          // 不含 ://
  path: '{{UL_PATH}}',
  androidPackage: '{{ANDROID_PACKAGE_NAME}}',
  ulDomain: '{{UNIVERSAL_LINK_DOMAIN}}',
  appleAppId: '{{APPLE_APP_ID}}',
  appStoreBase: '{{APP_STORE_BASE}}',
  playStoreBase: '{{PLAY_STORE_BASE}}',
}

function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) }
function isAndroid() { return /Android/.test(navigator.userAgent) }

function getParams(): string {
  const q = new URLSearchParams(location.search)
  const p: string[] = []
  const add = (k: string, v?: string | null) => v && p.push(`${k}=${encodeURIComponent(v)}`)
  add('routeName', '/game')
  add('inviteCode', q.get('inviteCode'))
  add('trackId', q.get('trackId'))
  return p.join('&')
}

function detectInstalled(scheme: string, path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = `${scheme}://${path}`
    document.body.appendChild(iframe)
    setTimeout(() => {
      document.body.removeChild(iframe)
      resolve(document.hidden || document.referrer.includes(scheme))
    }, 300)
  })
}

/** 思路 A：iOS Universal Link + Android Intent */
export async function openAppSmart() {
  const params = getParams()
  if (isIOS()) {
    const installed = await detectInstalled(CONFIG.scheme, CONFIG.path)
    window.location.href = installed
      ? `https://${CONFIG.ulDomain}/${CONFIG.path}?${params}`
      : `${CONFIG.appStoreBase}${CONFIG.appleAppId}?${params}`
  }
  else if (isAndroid()) {
    window.location.href =
      `intent://${CONFIG.path}/#Intent;` +
      `scheme=${CONFIG.scheme};` +
      `package=${CONFIG.androidPackage};` +
      `S.browser_fallback_url=${encodeURIComponent(CONFIG.playStoreBase + CONFIG.androidPackage)};` +
      `end;`
  }
}

/** 思路 B：通用 scheme + 定时器兜底（兼容非 Chrome / 无 Universal Link 场景） */
export function openAppFallback() {
  let timer = window.setTimeout(() => {
    window.location.href = isIOS()
      ? `${CONFIG.appStoreBase}${CONFIG.appleAppId}`
      : `${CONFIG.playStoreBase}${CONFIG.androidPackage}`
  }, 3000)
  window.location.href = `${CONFIG.scheme}://${CONFIG.path}?${getParams()}`
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer)
  })
}
```

- 进入页面自动唤起：调用 `openAppSmart()`（推荐）。
- 按钮点击唤起：调用 `openAppFallback()` 或在已确认支持的环境下调用 `openAppSmart()`。

---

## 11. 最佳实践清单

1. **常量集中管理**：scheme / 包名 / store id 抽到统一配置文件，避免散落。
2. **优先思路 A**：能上 Universal Link / Intent 就用，体验更顺滑，不依赖不可靠的安装检测。
3. **必加兜底定时器**：任何直接 scheme 唤起都要配 3s 定时器 + `visibilitychange` 取消，防止未安装时卡死。
4. **微信内提示**：检测微信 UA，先引导「在浏览器打开」再唤起。
5. **参数透传安全**：业务参数 `encodeURIComponent` 编码，缺失字段不拼接。
6. **Universal Link / App Links 文件**：与 APP 端对齐 `apple-app-site-association` / `assetlinks.json`，否则唤起直接失败。
7. **iPadOS UA**：平台识别补充触摸点判断。
8. **可观测性**：对「唤起成功 / 跳商店」打点，便于分析分享转化率。

---

## 12. 方案对照速查

| 场景 | 已安装 | 未安装 | 关键代码 |
| --- | --- | --- | --- |
| iOS + Universal Link | 拉起 APP | 检测后跳 App Store | `openAppSmart()` iOS 分支 |
| Android + Chrome Intent | 按 scheme 拉起 | 跳 `S.browser_fallback_url`（商店） | `openAppSmart()` Android 分支 |
| 任意平台 + scheme 兜底 | 拉起 APP | 3s 后跳商店 | `openAppFallback()` |
| 微信内 | 引导浏览器打开 | 引导浏览器打开 | UA 判断 + 遮罩提示 |
