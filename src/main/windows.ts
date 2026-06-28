import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'node:path'
import { IPC } from '../shared/ipc'
import type { PetState } from '../shared/types'

const PET_WIDTH = 260
const PET_HEIGHT = 300
/** 右键浮层菜单展开时窗口的高度——给菜单留出立绘上方的空间 */
const PET_HEIGHT_EXPANDED = 500
const PANEL_WIDTH = 900
const PANEL_HEIGHT = 640

let petWin: BrowserWindow | null = null
let panelWin: BrowserWindow | null = null

/** before-quit 时置 true，让面板的 close 真正销毁而不是隐藏 */
let quitting = false
export function setQuitting(v: boolean): void {
  quitting = v
}

const RENDERER_DEV_URL = process.env['ELECTRON_RENDERER_URL']

function loadPage(win: BrowserWindow, page: 'pet' | 'panel'): void {
  if (RENDERER_DEV_URL) {
    void win.loadURL(`${RENDERER_DEV_URL}/${page}/index.html`)
  } else {
    void win.loadFile(join(__dirname, `../renderer/${page}/index.html`))
  }
}

const preloadPath = join(__dirname, '../preload/index.js')

export function createPetWindow(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay()
  const win = new BrowserWindow({
    width: PET_WIDTH,
    height: PET_HEIGHT,
    x: workArea.x + workArea.width - PET_WIDTH - 24,
    y: workArea.y + workArea.height - PET_HEIGHT - 24,
    transparent: true,
    frame: false,
    resizable: false,
    movable: true,
    maximizable: false,
    minimizable: false,
    skipTaskbar: true,
    hasShadow: false,
    fullscreenable: false,
    show: false,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true
    }
  })

  win.setAlwaysOnTop(true, 'floating')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  win.once('ready-to-show', () => win.show())
  win.on('closed', () => {
    petWin = null
  })

  loadPage(win, 'pet')
  petWin = win
  return win
}

export function createPanelWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    minWidth: 720,
    minHeight: 520,
    show: false,
    frame: false,
    backgroundColor: '#F4F1E8',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true
    }
  })

  // 关闭面板只是隐藏，桌宠仍在；真正退出由应用菜单 / Cmd+Q 触发
  win.on('close', (e) => {
    if (!quitting) {
      e.preventDefault()
      win.hide()
    }
  })
  win.on('closed', () => {
    panelWin = null
  })

  // 外部链接走系统浏览器
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  loadPage(win, 'panel')
  panelWin = win
  return win
}

export function getPetWindow(): BrowserWindow | null {
  return petWin
}

export function getPanelWindow(): BrowserWindow | null {
  return panelWin
}

/** 打开（或聚焦）主面板，并跳转到指定路由 */
export function showPanel(route = '/'): void {
  let win = panelWin
  if (!win || win.isDestroyed()) win = createPanelWindow()
  const send = (): void => win!.webContents.send(IPC.onNavigate, route)
  if (win.webContents.isLoading()) {
    win.webContents.once('did-finish-load', send)
  } else {
    send()
  }
  win.show()
  win.focus()
}

export function hidePanel(): void {
  panelWin?.hide()
}

/** 把桌宠状态推给悬浮窗 */
export function sendPetState(state: PetState): void {
  petWin?.webContents.send(IPC.onPetState, state)
}

/** 按像素增量移动悬浮窗（拖拽） */
export function movePet(dx: number, dy: number): void {
  if (!petWin) return
  const [x, y] = petWin.getPosition()
  petWin.setPosition(Math.round(x + dx), Math.round(y + dy))
}

/**
 * 右键菜单展开 / 收起时调整悬浮窗高度。
 * 平时窗口只有立绘大小，避免在桌面上拦截多余点击；展开时向上撑高、底边不动，
 * 让浮层菜单有空间显示在立绘上方。
 */
export function setPetExpanded(expanded: boolean): void {
  if (!petWin) return
  const target = expanded ? PET_HEIGHT_EXPANDED : PET_HEIGHT
  const [, height] = petWin.getSize()
  if (height === target) return
  const [x, y] = petWin.getPosition()
  const delta = target - height
  // 底边保持不动：高度增加多少，y 就上移多少
  petWin.setBounds({ x, y: y - delta, width: PET_WIDTH, height: target })
}
