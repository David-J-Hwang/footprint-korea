import {
  BuildingStorefrontIcon,
  CakeIcon,
  CameraIcon,
  GlobeAsiaAustraliaIcon,
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import type {
  ComponentType,
  SVGProps,
} from 'react'
import type { VisitCategory } from '../visitTypes'
import { VISIT_CATEGORY_LABELS } from '../visitTypes'

type VisitCategoryBadgeConfig = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  className: string
}

const VISIT_CATEGORY_BADGE_CONFIG: Record<
  VisitCategory,
  VisitCategoryBadgeConfig
> = {
  attraction: {
    Icon: CameraIcon,
    className:
      'bg-teal-50 text-teal-700 ring-teal-200/70 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20',
  },
  cafe: {
    Icon: CakeIcon,
    className:
      'bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  },
  nature: {
    Icon: GlobeAsiaAustraliaIcon,
    className:
      'bg-lime-50 text-lime-700 ring-lime-200/70 dark:bg-lime-500/10 dark:text-lime-300 dark:ring-lime-400/20',
  },
  other: {
    Icon: TagIcon,
    className:
      'bg-stone-100 text-stone-700 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700',
  },
  restaurant: {
    Icon: BuildingStorefrontIcon,
    className:
      'bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20',
  },
  shopping: {
    Icon: ShoppingBagIcon,
    className:
      'bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  },
  stay: {
    Icon: HomeIcon,
    className:
      'bg-indigo-50 text-indigo-700 ring-indigo-200/70 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20',
  },
  transport: {
    Icon: TruckIcon,
    className:
      'bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
  },
}

type VisitCategoryBadgeProps = {
  category: VisitCategory
}

function VisitCategoryBadge({ category }: VisitCategoryBadgeProps) {
  const { Icon, className } = VISIT_CATEGORY_BADGE_CONFIG[category]

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        className,
      ].join(' ')}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {VISIT_CATEGORY_LABELS[category]}
    </span>
  )
}

export default VisitCategoryBadge
