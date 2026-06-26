import { execFile } from 'node:child_process'

export interface ActiveWindow {
  app: string
  title: string
  /** 本次采样是否成功读到前台应用（false 通常意味着缺少权限或不支持的平台） */
  ok: boolean
}

const EMPTY: ActiveWindow = { app: '', title: '', ok: false }

/**
 * macOS：用 AppleScript 取最前台应用名与前窗标题。
 * 读取窗口标题需要「辅助功能」权限（首次会弹系统授权框）。
 */
const MAC_SCRIPT = `
set frontAppName to ""
set windowTitle to ""
tell application "System Events"
  set frontApp to first application process whose frontmost is true
  set frontAppName to name of frontApp
  try
    set windowTitle to name of front window of frontApp
  end try
end tell
return frontAppName & "\\n" & windowTitle
`

function getActiveWindowMac(): Promise<ActiveWindow> {
  return new Promise((resolve) => {
    execFile('osascript', ['-e', MAC_SCRIPT], { timeout: 2500 }, (err, stdout) => {
      if (err) {
        resolve(EMPTY)
        return
      }
      const lines = stdout.split('\n')
      const app = (lines[0] ?? '').trim()
      const title = lines.slice(1).join(' ').trim()
      resolve({ app, title, ok: app.length > 0 })
    })
  })
}

let warnedUnsupported = false

/**
 * 跨平台入口。当前实现了 macOS；Windows/Linux 留作扩展点
 * （未来可换 get-windows / active-win，接口不变）。
 */
export function getActiveWindow(): Promise<ActiveWindow> {
  if (process.platform === 'darwin') return getActiveWindowMac()
  if (!warnedUnsupported) {
    warnedUnsupported = true
    console.warn(`[observe] 当前平台 ${process.platform} 暂未实现前台窗口检测，观时将记为「其他」。`)
  }
  return Promise.resolve(EMPTY)
}
