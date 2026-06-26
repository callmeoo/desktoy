import type {
  AppSnapshot,
  DayStats,
  HeartMode,
  HeartReply,
  MorningPlan,
  PetState,
  SaveMorningInput
} from './types'

/** preload 通过 contextBridge 暴露到 window.api 的全部能力。 */
export interface DesktoyApi {
  /** 应用启动快照（清气 / 晨课 / 今日观时） */
  getSnapshot(): Promise<AppSnapshot>

  observe: {
    getToday(): Promise<DayStats>
  }

  tasks: {
    getToday(): Promise<MorningPlan | null>
    saveToday(input: SaveMorningInput): Promise<MorningPlan>
    toggleTodo(index: number): Promise<MorningPlan | null>
  }

  qi: {
    get(): Promise<number>
  }

  meditation: {
    /** 完成一次入定，清气 +1，返回新的清气数 */
    complete(): Promise<number>
  }

  heart: {
    /** 取得下一句引导。step 从 0 开始；message 为用户输入（第一版未接 AI，可为空） */
    reply(mode: HeartMode, step: number, message: string): Promise<HeartReply>
  }

  pet: {
    /** 拖拽：按像素增量移动悬浮窗 */
    move(dx: number, dy: number): void
    /** 切换形象状态 */
    setState(state: PetState): void
    /** 回到默认（待机）状态 */
    resetState(): void
  }

  nav: {
    /** 打开主面板并跳转到指定路由（如 /observe） */
    open(route: string): void
    /** 隐藏主面板 */
    hidePanel(): void
  }

  app: {
    quit(): void
  }

  /** 主进程 → 界面 的事件订阅，返回取消订阅函数 */
  on: {
    petState(cb: (state: PetState) => void): () => void
    navigate(cb: (route: string) => void): () => void
    morningPrompt(cb: () => void): () => void
  }
}
