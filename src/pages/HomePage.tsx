import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useAuth } from '../features/auth/useAuth'
import NaverMap, {
  type SelectedRegion,
} from '../features/map/components/NaverMap'
import VisitListPanel from '../features/visits/components/VisitListPanel'
import type { Visit } from '../features/visits/visitTypes'
import { supabase } from '../lib/supabaseClient'

function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoadingVisits, setIsLoadingVisits] = useState(true)
  const [visitErrorMessage, setVisitErrorMessage] = useState('')
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null)
  const [isDeletingVisit, setIsDeletingVisit] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('')

  const handleCreateVisitFromRegion = useCallback(
    (region: SelectedRegion) => {
      const params = new URLSearchParams({
        regionCode: region.code,
      })

      navigate(`/visits/new?${params.toString()}`)
    },
    [navigate],
  )

  function handleRequestDeleteVisit(visit: Visit) {
    setVisitToDelete(visit)
    setDeleteErrorMessage('')
  }

  function handleCancelDeleteVisit() {
    if (isDeletingVisit) {
      return
    }

    setVisitToDelete(null)
    setDeleteErrorMessage('')
  }

  async function handleConfirmDeleteVisit() {
    if (!user || !visitToDelete) {
      setDeleteErrorMessage('삭제할 방문 기록을 확인할 수 없습니다.')
      return
    }

    setIsDeletingVisit(true)
    setDeleteErrorMessage('')

    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitToDelete.id)
      .eq('user_id', user.id)

    setIsDeletingVisit(false)

    if (error) {
      setDeleteErrorMessage(error.message)
      return
    }

    setVisits((currentVisits) =>
      currentVisits.filter((visit) => visit.id !== visitToDelete.id),
    )
    setVisitToDelete(null)
  }

  useEffect(() => {
    if (!user) {
      return
    }

    let isMounted = true
    const userId = user.id

    async function loadVisits() {
      setIsLoadingVisits(true)
      setVisitErrorMessage('')

      const { data, error } = await supabase
        .from('visits')
        .select(
          'id,title,region_code,region_name,started_on,ended_on,category,memo,latitude,longitude,created_at',
        )
        .eq('user_id', userId)
        .order('started_on', { ascending: false })
        .order('created_at', { ascending: false })

      if (!isMounted) {
        return
      }

      if (error) {
        setVisitErrorMessage(error.message)
        setVisits([])
        setIsLoadingVisits(false)
        return
      }

      setVisits((data ?? []) as Visit[])
      setIsLoadingVisits(false)
    }

    void loadVisits()

    return () => {
      isMounted = false
    }
  }, [user])

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-5 lg:grid-cols-[minmax(240px,1fr)_3fr] lg:py-8">
        <VisitListPanel
          errorMessage={visitErrorMessage}
          isLoading={isLoadingVisits}
          onRequestDeleteVisit={handleRequestDeleteVisit}
          visits={visits}
        />
        <NaverMap
          onCreateVisit={handleCreateVisitFromRegion}
          visits={visits}
        />
      </main>
      <ConfirmDialog
        errorMessage={deleteErrorMessage}
        isConfirming={isDeletingVisit}
        isOpen={Boolean(visitToDelete)}
        message={`${
          visitToDelete?.title ?? '선택한 방문 기록'
        }을 삭제하시겠습니까?`}
        onCancel={handleCancelDeleteVisit}
        onConfirm={handleConfirmDeleteVisit}
      />
    </div>
  )
}

export default HomePage
