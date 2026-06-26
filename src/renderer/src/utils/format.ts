/** 毫秒 → 「X 时 Y 分」/「Y 分」/「Z 秒」 */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return m > 0 ? `${h} 时 ${m} 分` : `${h} 时`
  if (m > 0) return `${m} 分`
  return `${s} 秒`
}

/** 0–1 → 百分比整数字符串 */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

/** epoch ms → HH:MM */
export function formatClock(ms: number): string {
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
