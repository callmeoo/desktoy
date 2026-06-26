import { powerMonitor } from 'electron'
import type { AppTotal, CategoryTotal, DayStats } from '../../shared/types'
import { CATEGORIES, type CategoryId } from '../../shared/categories'
import { store } from '../store'
import { localDate } from '../time'
import { classify } from './classifier'
import { getActiveWindow } from './activeWindow'

const SAMPLE_INTERVAL_MS = 10_000
/** 连续无操作超过此秒数 → 记为「空闲」 */
const IDLE_THRESHOLD_SEC = 90
const IDLE_APP_LABEL = '空闲'
const UNKNOWN_APP_LABEL = '未知应用'

interface Sample {
  app: string
  title: string
  category: CategoryId
  ok: boolean
  idle: boolean
}

class Tracker {
  private timer: NodeJS.Timeout | null = null
  private date = localDate()
  private busy = false

  // 权限探测：当日「活跃但读不到前台」的比例偏高，多半是缺辅助功能权限
  private activeSamples = 0
  private missSamples = 0

  start(): void {
    if (this.timer) return
    // 立即采一次，之后每 10s 一次
    void this.tick()
    this.timer = setInterval(() => void this.tick(), SAMPLE_INTERVAL_MS)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private async sample(): Promise<Sample> {
    const idleSec = safeIdleSeconds()
    if (idleSec >= IDLE_THRESHOLD_SEC) {
      return { app: IDLE_APP_LABEL, title: '', category: 'idle', ok: true, idle: true }
    }
    const aw = await getActiveWindow()
    if (!aw.ok) {
      return { app: UNKNOWN_APP_LABEL, title: '', category: 'other', ok: false, idle: false }
    }
    return { app: aw.app, title: aw.title, category: classify(aw.app, aw.title), ok: true, idle: false }
  }

  private async tick(): Promise<void> {
    if (this.busy) return
    this.busy = true
    try {
      const now = Date.now()
      const date = localDate(new Date(now))
      if (date !== this.date) {
        // 跨天：重置当日计数
        this.date = date
        this.activeSamples = 0
        this.missSamples = 0
      }

      const s = await this.sample()
      if (!s.idle) {
        this.activeSamples++
        if (!s.ok) this.missSamples++
      }

      const sessions = store.getSessions(date)
      const last = sessions[sessions.length - 1]
      if (last && last.app === s.app && last.title === s.title) {
        last.end = now
        last.durationMs += SAMPLE_INTERVAL_MS
      } else {
        sessions.push({
          app: s.app,
          title: s.title,
          category: s.category,
          start: now - SAMPLE_INTERVAL_MS,
          end: now,
          durationMs: SAMPLE_INTERVAL_MS
        })
      }
      store.setSessions(date, sessions)
    } catch (err) {
      console.error('[observe] 采样失败：', err)
    } finally {
      this.busy = false
    }
  }

  private needsPermission(date: string): boolean {
    if (date !== this.date) return false
    if (process.platform !== 'darwin') return false
    return this.activeSamples >= 4 && this.missSamples / this.activeSamples > 0.7
  }

  /** 汇总某一天的观时数据 */
  getDayStats(date = localDate()): DayStats {
    const sessions = store.getSessions(date)
    const byCat = new Map<CategoryId, number>()
    const byApp = new Map<string, AppTotal>()
    let totalMs = 0
    let since: number | null = null

    for (const ses of sessions) {
      totalMs += ses.durationMs
      byCat.set(ses.category, (byCat.get(ses.category) ?? 0) + ses.durationMs)
      if (since === null || ses.start < since) since = ses.start
      if (ses.app !== IDLE_APP_LABEL) {
        const cur = byApp.get(ses.app)
        if (cur) cur.durationMs += ses.durationMs
        else byApp.set(ses.app, { app: ses.app, category: ses.category, durationMs: ses.durationMs })
      }
    }

    const categories: CategoryTotal[] = CATEGORIES.map((c) => {
      const d = byCat.get(c.id) ?? 0
      return { id: c.id, durationMs: d, ratio: totalMs > 0 ? d / totalMs : 0 }
    }).filter((c) => c.durationMs > 0)
    categories.sort((a, b) => b.durationMs - a.durationMs)

    const topApps = [...byApp.values()].sort((a, b) => b.durationMs - a.durationMs).slice(0, 8)

    return {
      date,
      totalMs,
      categories,
      topApps,
      since,
      needsPermission: this.needsPermission(date)
    }
  }
}

function safeIdleSeconds(): number {
  try {
    return powerMonitor.getSystemIdleTime()
  } catch {
    return 0
  }
}

export const tracker = new Tracker()
