import { app } from 'electron'
import { store } from './store'
import { tracker } from './tracking/tracker'
import { registerIpc } from './ipc'
import { buildAppMenu } from './menu'
import { createPetWindow, getPetWindow, setQuitting, showPanel } from './windows'
import { localDate } from './time'

// 单实例：第二次启动时只把已有桌宠唤到前面
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!getPetWindow()) createPetWindow()
  })

  function quit(): void {
    setQuitting(true)
    app.quit()
  }

  app.whenReady().then(() => {
    store.init()
    registerIpc(quit)
    buildAppMenu()
    createPetWindow()
    tracker.start()

    // 晨课：当天第一次启动且尚未修课 → 轻轻把面板引到「晨课」
    if (!store.getMorning(localDate())) {
      setTimeout(() => showPanel('/morning'), 1000)
    }

    app.on('activate', () => {
      if (!getPetWindow()) createPetWindow()
    })
  })

  // 桌宠应用：关掉面板不退出，留桌宠陪着。退出走应用菜单 / Cmd+Q。
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('before-quit', () => {
    setQuitting(true)
    tracker.stop()
    store.flush()
  })
}
