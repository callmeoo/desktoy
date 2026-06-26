# 小道童 · 云游记

一只国风水墨桌面电子宠物。小道童常伴梦蝶与灵珠，陪你观时、晨课、入定、清心——
治愈，不打扰，不评判。

> MVP（桌面端）· Electron + Vite + Vue 3 + TypeScript · 主要面向 macOS

![配色：云白 / 青玉 / 墨灰 / 若叶 / 点金](https://img.shields.io/badge/%E9%85%8D%E8%89%B2-%E4%BA%91%E7%99%BD%20%C2%B7%20%E9%9D%92%E7%8E%89%20%C2%B7%20%E5%A2%A8%E7%81%B0%20%C2%B7%20%E7%82%B9%E9%87%91-9dbba9)

---

## 功能（第一阶段）

| 模块 | 说明 |
| --- | --- |
| **桌面悬浮窗** | 透明无边框、窗口置顶、可拖拽；点击小道童弹出菜单：观时 / 晨课 / 入定 / 清心。 |
| **观时** | 每 10 秒采样前台应用与窗口标题，按规则分类为 **工作 / 沟通 / 浏览 / 娱乐 / 空闲 / 其他**，今日观时页展示各分类总时长与占比。 |
| **晨课** | 当天第一次启动时弹出「早安，今日想先修哪一课？」，填写主线任务 + 三件必做，落地本地，主界面常驻展示。 |
| **入定** | 25 分钟专注计时，开始后小道童进入打坐状态，圆满后 **清气 +1**。 |
| **清心** | 三个入口：我想吐槽 / 我想冷静 / 我想被鼓励一下。第一版为固定引导文案，已预留接入 AI 的接口。 |

---

## 快速开始

需要 Node.js ≥ 18（建议 20/22）。

```bash
npm install        # 安装依赖（会自动下载对应平台的 Electron 运行时）
npm run dev         # 开发模式：悬浮窗 + 主面板，带热更新
```

打包 macOS 安装包：

```bash
npm run build:mac   # 产物在 release/（.dmg）
```

其它脚本：

```bash
npm run typecheck   # 主进程(tsc) + 渲染层(vue-tsc) 类型检查
npm run build       # 仅构建，不打包（产物在 out/）
npm run start       # 预览构建产物
```

> 在无显示器的 CI / 容器里安装时，可用 `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install`
> 跳过 Electron 二进制下载（此时只能做类型检查与构建，不能启动界面）。

### 常见问题

- **启动报 `crypto.getRandomValues is not a function`**：这是旧版本 Node 的
  `node:crypto` 缺少 `getRandomValues` 所致。项目已通过 `crypto-polyfill.cjs`
  （在 `dev` / `build` / `start` 脚本里以 `node --require` 预加载）自动兜底，无需手动处理。
  若仍遇到，建议把 Node 升级到 20 / 22 LTS（用 `node -v` 查看当前版本）。

---

## macOS 权限（观时必读）

「观时」需要读取**最前台应用名**与**窗口标题**，这通过系统的 AppleScript（`osascript`）实现，
首次使用会触发系统授权：

1. 打开 **系统设置 → 隐私与安全性 → 辅助功能**；
2. 允许本应用（开发阶段通常是 **终端 / iTerm**，或 **Electron**）。

未授权时，观时会把样本记为「其他」，并在「观时」页顶部给出温和的权限提示。

---

## 时间分类规则

分类规则集中在 [`src/main/tracking/rules.ts`](src/main/tracking/rules.ts)，全部为小写关键字匹配：

- **标题规则优先于应用规则** —— 浏览器里看 B 站算「娱乐」，看 GitHub 算「工作」。
- 命中应用名（如 `code`、`微信`、`safari`、`网易云音乐`）归入对应类别。
- 连续无操作超过 90 秒记为「空闲」（基于 `powerMonitor.getSystemIdleTime`）。
- 未命中任何规则的归入「其他」。

按需增删关键字即可，无需改动其它代码。

---

## 替换为正式美术（PNG / GIF）

当前小道童形象由 [`src/renderer/src/components/PetSprite.vue`](src/renderer/src/components/PetSprite.vue)
以**内联 SVG** 绘制，支持 6 种状态：`idle 待机`、`meditate 入定`、`happy 开心`、`focus 专注`、
`tired 困倦`、`worried 担心`。

要换成设计稿导出的真实立绘 / 动图：

1. 把图片放入 `src/renderer/src/assets/pet/`（如 `idle.png`、`meditate.gif`…）；
2. 在 `PetSprite.vue` 中按 `state` 映射到对应图片，用 `<img>` 替换内联 SVG；
3. 各状态与设计图对应关系见上表，可直接套用八态设计（待机打坐 / 挥拂尘 / 看任务清单 / 困倦打哈欠 / 开心转圈 / 安慰 / 专注陪伴 / 抱葫芦提醒休息）。

打包图标：在 `build/` 放入 `icon.icns`（或 512×512 的 `icon.png`），electron-builder 会自动使用。

---

## 架构

```
src/
├─ shared/                  # 主/预加载/渲染三端共享的类型与契约
│  ├─ categories.ts         #   观时分类（含中文标签与配色）
│  ├─ types.ts              #   领域模型
│  ├─ ipc.ts                #   IPC 通道名
│  └─ api.ts                #   window.api 契约
├─ main/                    # 主进程
│  ├─ index.ts              #   生命周期 / 单实例 / 晨课引导
│  ├─ windows.ts            #   悬浮窗 + 主面板
│  ├─ menu.ts               #   应用菜单（含快捷键）
│  ├─ ipc.ts                #   IPC 处理
│  ├─ store.ts              #   本地 JSON 持久化（userData 目录）
│  ├─ heart.ts              #   清心引导文案（预留 AI 接口）
│  └─ tracking/             #   观时
│     ├─ tracker.ts         #     10s 采样循环 + 当日汇总
│     ├─ activeWindow.ts    #     前台窗口检测（macOS / osascript）
│     ├─ classifier.ts      #     分类器
│     └─ rules.ts           #     分类规则
├─ preload/index.ts         # contextBridge 安全暴露 window.api
└─ renderer/
   ├─ pet/                  # 悬浮窗（PetApp）
   ├─ panel/                # 主面板入口
   └─ src/
      ├─ PanelApp.vue       #   外壳：顶栏 + 导航 + 路由
      ├─ router.ts
      ├─ stores/app.ts      #   Pinia：清气 / 晨课 / 今日观时
      ├─ components/        #   PetSprite（内联 SVG）/ CloudDecor
      └─ views/             #   Dashboard / Observe / Morning / Meditate / Heart
```

数据落地在 Electron 的 `userData` 目录下 `desktoy-data.json`（清气、观时会话、晨课计划），
原子写入，无外部依赖。

---

## 设计语言

- **配色**：云白 `#f4f1e8` · 青玉 `#9dbba9` · 墨灰 `#2f2f2d` · 若叶 `#c9ca9b` · 点金 `#c8a24e`
- **意象**：小道童、梦蝶、祥云、拂尘、灵珠
- **气质**：水墨治愈，宋体标题，不强迫、不评判

---

## 安全与待办

- 已开启 `contextIsolation`、关闭 `nodeIntegration`，仅加载本地打包内容。
- 当前未设置 CSP（应用只加载本地资源）。**接入 AI / 远程内容前**，应通过主进程
  `session.defaultSession.webRequest.onHeadersReceived` 注入 `Content-Security-Policy`
  响应头（避免在 `file://` 下用 `<meta>` CSP 误伤本地模块脚本）。
- 路线：清心接入 Claude API · Windows / Linux 前台窗口检测 · 八态正式立绘 · 周/月观时报表 · 客户端化。

---

小道童一念清静，一息安宁。愿与你一同修心养性。🍃
