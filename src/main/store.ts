import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { MorningPlan, TrackSession } from '../shared/types'

interface StoreData {
  version: number
  qi: number
  /** 观时会话，按本地日期 YYYY-MM-DD 归档 */
  sessions: Record<string, TrackSession[]>
  /** 晨课计划，按本地日期归档 */
  morning: Record<string, MorningPlan>
}

const DEFAULT_DATA: StoreData = {
  version: 1,
  qi: 0,
  sessions: {},
  morning: {}
}

/**
 * 极简本地 JSON 存储：写入到 userData/desktoy-data.json，原子替换。
 * 数据量很小（一天的会话合并后通常几十~几百条），同步写入足够。
 */
class Store {
  private data: StoreData = structuredClone(DEFAULT_DATA)
  private file = ''
  private writeTimer: NodeJS.Timeout | null = null

  init(): void {
    const dir = app.getPath('userData')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    this.file = join(dir, 'desktoy-data.json')
    if (existsSync(this.file)) {
      try {
        const parsed = JSON.parse(readFileSync(this.file, 'utf-8')) as Partial<StoreData>
        this.data = { ...structuredClone(DEFAULT_DATA), ...parsed }
        if (!this.data.sessions) this.data.sessions = {}
        if (!this.data.morning) this.data.morning = {}
        if (typeof this.data.qi !== 'number') this.data.qi = 0
      } catch (err) {
        console.error('[store] 读取损坏，重置：', err)
        this.data = structuredClone(DEFAULT_DATA)
      }
    }
  }

  /** 合并写入，250ms 去抖后原子落盘 */
  private persist(): void {
    if (this.writeTimer) clearTimeout(this.writeTimer)
    this.writeTimer = setTimeout(() => this.flush(), 250)
  }

  flush(): void {
    if (!this.file) return
    try {
      const tmp = `${this.file}.tmp`
      writeFileSync(tmp, JSON.stringify(this.data), 'utf-8')
      renameSync(tmp, this.file)
    } catch (err) {
      console.error('[store] 写入失败：', err)
    }
  }

  // ---- 清气 ----
  getQi(): number {
    return this.data.qi
  }

  addQi(delta = 1): number {
    this.data.qi += delta
    this.persist()
    return this.data.qi
  }

  // ---- 观时 ----
  getSessions(date: string): TrackSession[] {
    return this.data.sessions[date] ?? []
  }

  setSessions(date: string, sessions: TrackSession[]): void {
    this.data.sessions[date] = sessions
    this.persist()
  }

  // ---- 晨课 ----
  getMorning(date: string): MorningPlan | null {
    return this.data.morning[date] ?? null
  }

  setMorning(plan: MorningPlan): void {
    this.data.morning[plan.date] = plan
    this.persist()
  }
}

export const store = new Store()
