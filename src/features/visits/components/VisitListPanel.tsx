import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import {
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Visit } from '../visitTypes'
import VisitCategoryBadge from './VisitCategoryBadge'

const VISITS_PER_PAGE = 6

type VisitListPanelProps = {
  errorMessage?: string
  isLoading?: boolean
  onRequestDeleteVisit?: (visit: Visit) => void
  onSelectVisit?: (visit: Visit) => void
  selectedVisitId?: string | null
  visits: Visit[]
}

function formatVisitDateRange(startedOn: string | null, endedOn: string | null) {
  if (!startedOn) {
    return null
  }

  if (!endedOn || endedOn === startedOn) {
    return startedOn
  }

  return `${startedOn} - ${endedOn}`
}

function getPaginationButtonClass(isDisabled: boolean) {
  return [
    'inline-flex size-9 items-center justify-center rounded-md border transition focus:outline-none focus:ring-4 focus:ring-emerald-700/15 dark:focus:ring-emerald-300/15',
    isDisabled
      ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-600'
      : 'cursor-pointer border-stone-200 bg-white text-stone-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300',
  ].join(' ')
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
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(visits.length / VISITS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (activePage - 1) * VISITS_PER_PAGE
  const pageEndIndex = pageStartIndex + VISITS_PER_PAGE
  const paginatedVisits = useMemo(
    () => visits.slice(pageStartIndex, pageEndIndex),
    [pageEndIndex, pageStartIndex, visits],
  )
  const shouldShowPagination = visits.length > VISITS_PER_PAGE

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
    <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 lg:flex lg:h-[calc(100vh-12rem)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">방문 기록</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950 dark:text-stone-50">
              방문한 곳
            </h1>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
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
        <p className="mt-6 shrink-0 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-6 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center dark:border-stone-700 dark:bg-stone-950">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            방문 기록을 불러오는 중입니다.
          </p>
        </div>
      ) : null}

      {!isLoading && visits.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center dark:border-stone-700 dark:bg-stone-950">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            아직 등록된 방문지가 없습니다.
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
            방문지 생성 기능을 추가하면 이곳에 기록 목록이 표시됩니다.
          </p>
        </div>
      ) : null}

      {visits.length > 0 ? (
        <div className="mt-6 grid gap-3 lg:min-h-0 lg:flex-1 lg:auto-rows-max lg:overflow-y-auto lg:pr-3">
          {paginatedVisits.map((visit) => {
            const isSelected = selectedVisitId === visit.id
            const visitDateText = formatVisitDateRange(
              visit.started_on,
              visit.ended_on,
            )

            return (
              <div
                aria-label={`${visit.title} 위치 보기`}
                aria-pressed={isSelected}
                className={[
                  'block cursor-pointer rounded-md border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-emerald-700/15 dark:focus:ring-emerald-300/15',
                  isSelected
                    ? 'border-emerald-300 bg-emerald-50 shadow-sm dark:border-emerald-500/50 dark:bg-emerald-500/10'
                    : 'border-stone-200 bg-stone-50 hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10',
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
                      <h2 className="min-w-0 text-base font-semibold text-stone-950 dark:text-stone-50">
                        {visit.title}
                      </h2>
                    </div>
                    <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
                      {visit.region_name}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      aria-label={`${visit.title} 수정`}
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-sky-600 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-700/15 dark:text-sky-300 dark:hover:bg-sky-500/10 dark:hover:text-sky-200"
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
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-700/15 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
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
                {visitDateText ? (
                  <p className="mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">
                    {visitDateText}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}

      {shouldShowPagination ? (
        <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-stone-200 pt-4 dark:border-stone-800">
          <button
            aria-label="이전 페이지"
            className={getPaginationButtonClass(activePage === 1)}
            disabled={activePage === 1}
            onClick={() => setCurrentPage(Math.max(1, activePage - 1))}
            type="button"
          >
            <ChevronLeftIcon aria-hidden="true" className="size-4" />
          </button>
          <p className="min-w-0 text-center text-sm font-medium text-stone-600 dark:text-stone-300">
            {activePage} / {totalPages}
            <span className="ml-2 text-xs text-stone-400 dark:text-stone-500">
              {pageStartIndex + 1}-{Math.min(pageEndIndex, visits.length)}곳
            </span>
          </p>
          <button
            aria-label="다음 페이지"
            className={getPaginationButtonClass(activePage === totalPages)}
            disabled={activePage === totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
            type="button"
          >
            <ChevronRightIcon aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}
    </aside>
  )
}

export default VisitListPanel
