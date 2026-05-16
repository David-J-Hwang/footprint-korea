import {
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import type { KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Visit } from '../visitTypes'
import VisitCategoryBadge from './VisitCategoryBadge'

type VisitListPanelProps = {
  errorMessage?: string
  isLoading?: boolean
  onRequestDeleteVisit?: (visit: Visit) => void
  onSelectVisit?: (visit: Visit) => void
  selectedVisitId?: string | null
  visits: Visit[]
}

function formatVisitDateRange(startedOn: string | null, endedOn: string | null) {
  if (!startedOn && !endedOn) {
    return 'unknown'
  }

  if (!startedOn) {
    return `unknown - ${endedOn}`
  }

  if (!endedOn || endedOn === startedOn) {
    return startedOn
  }

  return `${startedOn} - ${endedOn}`
}

function VisitListPanel({
  errorMessage,
  isLoading = false,
  onRequestDeleteVisit,
  onSelectVisit,
  selectedVisitId,
  visits,
}: VisitListPanelProps) {
  const navigate = useNavigate()

  function handleEditVisitClick(visit: Visit) {
    navigate(`/visits/${visit.id}/edit`)
  }

  function handleVisitCardKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    visit: Visit,
  ) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    onSelectVisit?.(visit)
  }

  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm lg:flex lg:h-[calc(100vh-12rem)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-700">방문 기록</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">
              방문한 곳
            </h1>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {visits.length}곳
          </span>
        </div>

        <Link
          className="mt-6 flex h-11 w-full cursor-pointer items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20"
          to="/visits/new"
        >
          + 새 방문지 추가
        </Link>
      </div>

      {errorMessage ? (
        <p className="mt-6 shrink-0 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-6 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
          <p className="text-sm font-semibold text-stone-800">
            방문 기록을 불러오는 중입니다.
          </p>
        </div>
      ) : null}

      {!isLoading && visits.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
          <p className="text-sm font-semibold text-stone-800">
            아직 등록된 방문지가 없습니다.
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            방문지 생성 기능을 추가하면 이곳에 기록 목록이 표시됩니다.
          </p>
        </div>
      ) : null}

      {visits.length > 0 ? (
        <div className="mt-6 grid gap-3 lg:min-h-0 lg:flex-1 lg:auto-rows-max lg:overflow-y-auto lg:pr-3">
          {visits.map((visit) => {
            const isSelected = selectedVisitId === visit.id

            return (
              <div
                aria-label={`${visit.title} 위치 보기`}
                aria-pressed={isSelected}
                className={[
                  'block cursor-pointer rounded-md border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-emerald-700/15',
                  isSelected
                    ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                    : 'border-stone-200 bg-stone-50 hover:border-emerald-200 hover:bg-emerald-50/40',
                ].join(' ')}
                key={visit.id}
                onClick={() => onSelectVisit?.(visit)}
                onKeyDown={(event) => handleVisitCardKeyDown(event, visit)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <VisitCategoryBadge category={visit.category} />
                      <h2 className="min-w-0 text-base font-semibold text-stone-950">
                        {visit.title}
                      </h2>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">
                      {visit.region_name}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      aria-label={`${visit.title} 수정`}
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-sky-600 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-700/15"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        handleEditVisitClick(visit)
                      }}
                      type="button"
                    >
                      <PencilSquareIcon aria-hidden="true" className="size-4" />
                    </button>
                    <button
                      aria-label={`${visit.title} 삭제`}
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-700/15"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        onRequestDeleteVisit?.(visit)
                      }}
                      type="button"
                    >
                      <TrashIcon aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-stone-700">
                  {formatVisitDateRange(visit.started_on, visit.ended_on)}
                </p>
              </div>
            )
          })}
        </div>
      ) : null}
    </aside>
  )
}

export default VisitListPanel
