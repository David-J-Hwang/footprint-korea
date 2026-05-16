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
    className: 'bg-teal-50 text-teal-700 ring-teal-200/70',
  },
  cafe: {
    Icon: CakeIcon,
    className: 'bg-amber-50 text-amber-700 ring-amber-200/70',
  },
  nature: {
    Icon: GlobeAsiaAustraliaIcon,
    className: 'bg-lime-50 text-lime-700 ring-lime-200/70',
  },
  other: {
    Icon: TagIcon,
    className: 'bg-stone-100 text-stone-700 ring-stone-200',
  },
  restaurant: {
    Icon: BuildingStorefrontIcon,
    className: 'bg-orange-50 text-orange-700 ring-orange-200/70',
  },
  shopping: {
    Icon: ShoppingBagIcon,
    className: 'bg-rose-50 text-rose-700 ring-rose-200/70',
  },
  stay: {
    Icon: HomeIcon,
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70',
  },
  transport: {
    Icon: TruckIcon,
    className: 'bg-sky-50 text-sky-700 ring-sky-200/70',
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
