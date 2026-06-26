import { ipcMain } from 'electron'
import { IPC } from '../shared/ipc'
import type { HeartMode, MorningPlan, PetState, SaveMorningInput } from '../shared/types'
import { store } from './store'
import { tracker } from './tracking/tracker'
import { getHeartReply } from './heart'
import { localDate } from './time'
import { hidePanel, movePet, sendPetState, showPanel } from './windows'

export function registerIpc(onQuit: () => void): void {
  // ---- invoke（有返回值）----
  ipcMain.handle(IPC.snapshotGet, () => ({
    qi: store.getQi(),
    morning: store.getMorning(localDate()),
    today: tracker.getDayStats()
  }))

  ipcMain.handle(IPC.observeGetToday, () => tracker.getDayStats())

  ipcMain.handle(IPC.tasksGetToday, () => store.getMorning(localDate()))

  ipcMain.handle(IPC.tasksSaveToday, (_e, input: SaveMorningInput) => {
    const date = localDate()
    const todos = (input.todos ?? [])
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 3)
      .map((text) => ({ text, done: false }))
    const plan: MorningPlan = {
      date,
      mainTask: (input.mainTask ?? '').trim(),
      todos,
      createdAt: Date.now()
    }
    store.setMorning(plan)
    return plan
  })

  ipcMain.handle(IPC.tasksToggleTodo, (_e, index: number) => {
    const plan = store.getMorning(localDate())
    if (!plan) return null
    const todo = plan.todos[index]
    if (todo) {
      todo.done = !todo.done
      store.setMorning(plan)
    }
    return plan
  })

  ipcMain.handle(IPC.qiGet, () => store.getQi())

  ipcMain.handle(IPC.meditationComplete, () => store.addQi(1))

  ipcMain.handle(IPC.heartReply, (_e, mode: HeartMode, step: number, message: string) =>
    getHeartReply(mode, step, message)
  )

  // ---- send（无返回值）----
  ipcMain.on(IPC.petMove, (_e, dx: number, dy: number) => movePet(dx, dy))
  ipcMain.on(IPC.petSetState, (_e, state: PetState) => sendPetState(state))
  ipcMain.on(IPC.petResetState, () => sendPetState('idle'))
  ipcMain.on(IPC.navOpen, (_e, route: string) => showPanel(route))
  ipcMain.on(IPC.panelHide, () => hidePanel())
  ipcMain.on(IPC.appQuit, () => onQuit())
}
