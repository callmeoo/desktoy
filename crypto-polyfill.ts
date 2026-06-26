import { webcrypto } from 'node:crypto'

// 部分 Node 版本未默认在全局暴露 Web Crypto，导致 vite dev server 启动时
// 抛 "crypto.getRandomValues is not a function"。这里在任何 vite 代码加载前补齐。
// 作为「副作用优先导入」，必须保持在 electron.vite.config.ts 的第一条 import。
const globalRef = globalThis as unknown as { crypto?: unknown }
if (!globalRef.crypto) {
  globalRef.crypto = webcrypto
}
