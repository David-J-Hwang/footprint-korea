export const VISIT_CATEGORIES = [
  { label: '음식점', value: 'restaurant' },
  { label: '카페', value: 'cafe' },
  { label: '숙소', value: 'stay' },
  { label: '관광지', value: 'attraction' },
  { label: '쇼핑', value: 'shopping' },
] as const

export type VisitCategory = (typeof VISIT_CATEGORIES)[number]['value']

export type Visit = {
  category: VisitCategory
  created_at: string
  ended_on: string | null
  id: string
  memo: string | null
  region_code: string
  region_name: string
  started_on: string
  title: string
}

export const VISIT_CATEGORY_LABELS = VISIT_CATEGORIES.reduce<
  Record<VisitCategory, string>
>((labels, category) => {
  labels[category.value] = category.label
  return labels
}, {} as Record<VisitCategory, string>)
