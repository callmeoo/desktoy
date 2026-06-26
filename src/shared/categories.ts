/**
 * 观时分类 — the five (+其他) buckets every foreground sample is sorted into.
 * Colors come from the 国风 palette (青玉 / 点金 / 若叶 …) defined in theme.css.
 */
export type CategoryId = 'work' | 'comm' | 'browse' | 'fun' | 'idle' | 'other'

export interface CategoryMeta {
  id: CategoryId
  /** 中文标签 */
  label: string
  /** 一句修行口吻的注解 */
  hint: string
  /** 色板取色 */
  color: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'work', label: '工作', hint: '专心修课', color: '#7FA68F' },
  { id: 'comm', label: '沟通', hint: '人间往来', color: '#C8A24E' },
  { id: 'browse', label: '浏览', hint: '云游观览', color: '#A7C2B4' },
  { id: 'fun', label: '娱乐', hint: '闲心小憩', color: '#C9CA9B' },
  { id: 'idle', label: '空闲', hint: '静坐无为', color: '#C2CBC6' },
  { id: 'other', label: '其他', hint: '尚未归类', color: '#D9D3C3' }
]

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c
    return acc
  },
  {} as Record<CategoryId, CategoryMeta>
)

export function categoryMeta(id: CategoryId): CategoryMeta {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.other
}
