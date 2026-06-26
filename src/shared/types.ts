import type { CategoryId } from './categories'

/** 观时：一段连续停留在同一应用/标题上的会话 */
export interface TrackSession {
  app: string
  title: string
  category: CategoryId
  /** epoch ms */
  start: number
  /** epoch ms */
  end: number
  durationMs: number
}

export interface CategoryTotal {
  id: CategoryId
  durationMs: number
  /** 0–1 占当日有效时长的比例 */
  ratio: number
}

export interface AppTotal {
  app: string
  category: CategoryId
  durationMs: number
}

/** 观时：某一天的汇总，供「今日观时」页展示 */
export interface DayStats {
  /** YYYY-MM-DD（本地时区） */
  date: string
  totalMs: number
  categories: CategoryTotal[]
  topApps: AppTotal[]
  /** 采样开始时间 epoch ms（用于显示「从几点起观察」） */
  since: number | null
  /** 是否疑似缺少前台窗口读取权限（多数样本读不到应用名） */
  needsPermission: boolean
}

/** 晨课：三件必做之一 */
export interface TodoItem {
  text: string
  done: boolean
}

/** 晨课：当日的修课计划 */
export interface MorningPlan {
  /** YYYY-MM-DD */
  date: string
  /** 今日主线任务 */
  mainTask: string
  /** 三件必做 */
  todos: TodoItem[]
  createdAt: number
}

export interface SaveMorningInput {
  mainTask: string
  todos: string[]
}

/** 清心：三种倾诉入口 */
export type HeartMode = 'vent' | 'calm' | 'cheer'

/** 清心：一次引导回复 */
export interface HeartReply {
  /** 小道童的话 */
  text: string
  /** 可选的快捷回应按钮 */
  options: string[]
  /** 本轮引导是否已收束 */
  done: boolean
}

/** 小道童的状态 → 决定显示哪一帧形象 */
export type PetState =
  | 'idle' // 待机打坐
  | 'meditate' // 入定
  | 'happy' // 开心
  | 'focus' // 专注
  | 'tired' // 困倦
  | 'worried' // 担心 / 安慰

/** 应用整体的轻量快照，主进程启动时回灌给界面 */
export interface AppSnapshot {
  qi: number
  morning: MorningPlan | null
  today: DayStats
}
