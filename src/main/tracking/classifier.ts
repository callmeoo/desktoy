import type { CategoryId } from '../../shared/categories'
import { DEFAULT_RULES, type KeywordRules } from './rules'

function matchRules(
  haystack: string,
  rules: Partial<Record<CategoryId, string[]>>
): CategoryId | null {
  for (const cat of Object.keys(rules) as CategoryId[]) {
    const keywords = rules[cat]
    if (!keywords) continue
    for (const kw of keywords) {
      if (haystack.includes(kw)) return cat
    }
  }
  return null
}

/**
 * 把一次前台采样归入分类。
 * 优先看窗口标题（区分浏览器内容），再看应用名，最后落到「其他」。
 */
export function classify(
  app: string,
  title: string,
  rules: KeywordRules = DEFAULT_RULES
): CategoryId {
  const appLower = app.toLowerCase()
  const titleLower = title.toLowerCase()

  const byTitle = matchRules(titleLower, rules.titleRules)
  if (byTitle) return byTitle

  const byApp = matchRules(appLower, rules.appRules)
  if (byApp) return byApp

  return 'other'
}
