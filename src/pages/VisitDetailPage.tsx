import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useAuth } from '../features/auth/useAuth'
import VisitPointMap from '../features/map/components/VisitPointMap'
import type { Visit } from '../features/visits/visitTypes'
import { VISIT_CATEGORY_LABELS } from '../features/visits/visitTypes'
import { supabase } from '../lib/supabaseClient'

type VisitDetailLocationState = {
  visitTitle?: string
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

function VisitDetailPage() {
  const { user } = useAuth()
  const { visitId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as VisitDetailLocationState | null
  const cachedVisitTitle = locationState?.visitTitle ?? ''
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingVisit, setIsDeletingVisit] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('')

  useEffect(() => {
    if (!user || !visitId) {
      return
    }

    let isMounted = true
    const userId = user.id

    async function loadVisit() {
      setIsLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('visits')
        .select(
          'id,title,region_code,region_name,started_on,ended_on,category,memo,latitude,longitude,created_at',
        )
        .eq('id', visitId)
        .eq('user_id', userId)
        .single()

      if (!isMounted) {
        return
      }

      if (error) {
        setErrorMessage(error.message)
        setIsLoading(false)
        return
      }

      setVisit(data as Visit)
      setIsLoading(false)
    }

    void loadVisit()

    return () => {
      isMounted = false
    }
  }, [user, visitId])

  const pageTitle = visit?.title ?? cachedVisitTitle

  function handleRequestDeleteVisit() {
    setIsDeleteDialogOpen(true)
    setDeleteErrorMessage('')
  }

  function handleCancelDeleteVisit() {
    if (isDeletingVisit) {
      return
    }

    setIsDeleteDialogOpen(false)
    setDeleteErrorMessage('')
  }

  async function handleConfirmDeleteVisit() {
    if (!user || !visit) {
      setDeleteErrorMessage('삭제할 방문 기록을 확인할 수 없습니다.')
      return
    }

    setIsDeletingVisit(true)
    setDeleteErrorMessage('')

    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visit.id)
      .eq('user_id', user.id)

    setIsDeletingVisit(false)

    if (error) {
      setDeleteErrorMessage(error.message)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 lg:py-8">
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
          to="/"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          뒤로가기
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(400px,1fr)_minmax(0,1.15fr)] lg:items-stretch">
          <section className="min-w-0">
            <div className="h-full rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-7 lg:min-h-[calc(100vh-8rem)]">
              <p className="text-sm font-medium text-emerald-700">방문 기록</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-950">
                {pageTitle || '방문한 곳'}
              </h1>

              {isLoading ? (
                <p className="mt-6 rounded-md bg-stone-50 px-3 py-3 text-sm font-medium text-stone-600">
                  방문 기록을 불러오는 중입니다.
                </p>
              ) : null}

              {errorMessage ? (
                <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              {visit ? (
                <div className="mt-8 grid gap-7">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      행정구역
                    </p>
                    <p className="mt-2 text-base text-stone-700">
                      {visit.region_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      방문 유형
                    </p>
                    <p className="mt-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        {VISIT_CATEGORY_LABELS[visit.category] ??
                          visit.category}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      방문 날짜
                    </p>
                    <p className="mt-2 text-base text-stone-700">
                      {formatVisitDateRange(
                        visit.started_on,
                        visit.ended_on,
                      )}
                    </p>
                  </div>

                  <div className="border-t border-stone-200 pt-6">
                    <p className="text-sm font-semibold text-stone-800">
                      감상 메모
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-stone-700">
                      {visit.memo || '메모가 없습니다.'}
                    </p>
                  </div>

                  <div className="mt-2 flex flex-col gap-3 border-t border-stone-200 pt-6 sm:flex-row">
                    <Link
                      className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-700/15"
                      to={`/visits/${visit.id}/edit`}
                    >
                      <PencilSquareIcon aria-hidden="true" className="size-4" />
                      수정
                    </Link>
                    <button
                      className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-700/15"
                      onClick={handleRequestDeleteVisit}
                      type="button"
                    >
                      <TrashIcon aria-hidden="true" className="size-4" />
                      삭제
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <VisitPointMap
            key={visit?.id ?? 'empty-visit-map'}
            latitude={visit?.latitude ?? null}
            longitude={visit?.longitude ?? null}
            title={pageTitle || '방문한 곳'}
          />
        </div>
      </main>
      <ConfirmDialog
        errorMessage={deleteErrorMessage}
        isConfirming={isDeletingVisit}
        isOpen={isDeleteDialogOpen}
        message={`${pageTitle || '선택한 방문 기록'}을 삭제하시겠습니까?`}
        onCancel={handleCancelDeleteVisit}
        onConfirm={handleConfirmDeleteVisit}
      />
    </div>
  )
}

export default VisitDetailPage
