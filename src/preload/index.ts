import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC } from '../shared/ipc'
import type { DesktoyApi } from '../shared/api'
import type { PetState } from '../shared/types'

function subscribe(
  channel: string,
  handler: (...args: unknown[]) => void
): () => void {
  const listener = (_e: IpcRendererEvent, ...args: unknown[]): void => handler(...args)
  ipcRenderer.on(channel, listener)
  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

const api: DesktoyApi = {
  getSnapshot: () => ipcRenderer.invoke(IPC.snapshotGet),

  observe: {
    getToday: () => ipcRenderer.invoke(IPC.observeGetToday)
  },

  tasks: {
    getToday: () => ipcRenderer.invoke(IPC.tasksGetToday),
    saveToday: (input) => ipcRenderer.invoke(IPC.tasksSaveToday, input),
    toggleTodo: (index) => ipcRenderer.invoke(IPC.tasksToggleTodo, index)
  },

  qi: {
    get: () => ipcRenderer.invoke(IPC.qiGet)
  },

  meditation: {
    complete: () => ipcRenderer.invoke(IPC.meditationComplete)
  },

  heart: {
    reply: (mode, step, message) => ipcRenderer.invoke(IPC.heartReply, mode, step, message)
  },

  pet: {
    move: (dx, dy) => ipcRenderer.send(IPC.petMove, dx, dy),
    setState: (state) => ipcRenderer.send(IPC.petSetState, state),
    resetState: () => ipcRenderer.send(IPC.petResetState),
    setExpanded: (expanded) => ipcRenderer.send(IPC.petSetExpanded, expanded)
  },

  nav: {
    open: (route) => ipcRenderer.send(IPC.navOpen, route),
    hidePanel: () => ipcRenderer.send(IPC.panelHide)
  },

  app: {
    quit: () => ipcRenderer.send(IPC.appQuit)
  },

  on: {
    petState: (cb) => subscribe(IPC.onPetState, (state) => cb(state as PetState)),
    navigate: (cb) => subscribe(IPC.onNavigate, (route) => cb(route as string)),
    morningPrompt: (cb) => subscribe(IPC.onMorningPrompt, () => cb())
  }
}

contextBridge.exposeInMainWorld('api', api)
