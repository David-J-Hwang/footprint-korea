import {
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import type { Visit } from '../visitTypes'
import { VISIT_CATEGORY_LABELS } from '../visitTypes'

type VisitListPanelProps = {
  errorMessage?: string
  isLoading?: boolean
  visits: Visit[]
}

function formatVisitDateRange(startedOn: string, endedOn: string | null) {
  if (!endedOn || endedOn === startedOn) {
    return startedOn
  }

  return `${startedOn} - ${endedOn}`
}

function handleEditVisitClick(visit: Visit) {
  alert(`${visit.title} 수정 버튼을 클릭했습니다!`)
}

function handleDeleteVisitClick(visit: Visit) {
  alert(`${visit.title} 삭제 버튼을 클릭했습니다!`)
}

function VisitListPanel({
  errorMessage,
  isLoading = false,
  visits,
}: VisitListPanelProps) {
  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
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

      {errorMessage ? (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
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
        <div className="mt-6 grid gap-3">
          {visits.map((visit) => (
            <article
              className="rounded-md border border-stone-200 bg-stone-50 p-4"
              key={visit.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {VISIT_CATEGORY_LABELS[visit.category]}
                    </span>
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
                    onClick={() => handleEditVisitClick(visit)}
                    type="button"
                  >
                    <PencilSquareIcon aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    aria-label={`${visit.title} 삭제`}
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-700/15"
                    onClick={() => handleDeleteVisitClick(visit)}
                    type="button"
                  >
                    <TrashIcon aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-stone-700">
                {formatVisitDateRange(visit.started_on, visit.ended_on)}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </aside>
  )
}

export default VisitListPanel
