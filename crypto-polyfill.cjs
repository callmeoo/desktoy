'use strict'

// 兼容部分 Node 版本缺少 crypto.getRandomValues 的情况。
//
// vite 在解析配置时执行：`import crypto from 'node:crypto'; crypto.getRandomValues(...)`，
// 旧版本 Node 的 crypto 模块没有 getRandomValues 方法，导致 `electron-vite` 一启动就报
// "crypto.getRandomValues is not a function"。
//
// 该文件通过 `node --require ./crypto-polyfill.cjs` 在任何 vite 代码加载前打补丁，
// 把 webcrypto 的 getRandomValues 挂到 node:crypto 模块上。
const nodeCrypto = require('node:crypto')
const wc = nodeCrypto.webcrypto

if (wc && typeof wc.getRandomValues === 'function' && typeof nodeCrypto.getRandomValues !== 'function') {
  const getRandomValues = wc.getRandomValues.bind(wc)
  try {
    nodeCrypto.getRandomValues = getRandomValues
  } catch {
    Object.defineProperty(nodeCrypto, 'getRandomValues', {
      value: getRandomValues,
      configurable: true,
      writable: true
    })
  }
}
