import { app, Menu, type MenuItemConstructorOptions } from 'electron'
import { showPanel } from './windows'

export function buildAppMenu(): void {
  const isMac = process.platform === 'darwin'

  const macAppMenu: MenuItemConstructorOptions[] = isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }
      ]
    : []

  const petMenu: MenuItemConstructorOptions = {
    label: '小道童',
    submenu: [
      { label: '打开主面板', accelerator: 'CmdOrCtrl+1', click: () => showPanel('/') },
      { type: 'separator' },
      { label: '观时 · 今日时间', accelerator: 'CmdOrCtrl+2', click: () => showPanel('/observe') },
      { label: '晨课 · 今日修课', accelerator: 'CmdOrCtrl+3', click: () => showPanel('/morning') },
      { label: '入定 · 专注计时', accelerator: 'CmdOrCtrl+4', click: () => showPanel('/meditate') },
      { label: '清心 · 与我说说', accelerator: 'CmdOrCtrl+5', click: () => showPanel('/heart') },
      ...(isMac ? [] : ([{ type: 'separator' }, { role: 'quit' }] as MenuItemConstructorOptions[]))
    ]
  }

  const editMenu: MenuItemConstructorOptions = {
    label: '编辑',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  }

  const windowMenu: MenuItemConstructorOptions = { role: 'windowMenu' }

  const template: MenuItemConstructorOptions[] = [...macAppMenu, petMenu, editMenu, windowMenu]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
