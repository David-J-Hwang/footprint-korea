import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
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

  const visitedRegionCodes = useMemo(
    () => Array.from(new Set(visits.map((visit) => visit.region_code))),
    [visits],
  )

  const handleCreateVisitFromRegion = useCallback(
    (region: SelectedRegion) => {
      const params = new URLSearchParams({
        regionCode: region.code,
      })

      navigate(`/visits/new?${params.toString()}`)
    },
    [navigate],
  )

  useEffect(() => {
    if (!user) {
      return
    }

    let isMounted = true
    const userId = user.id

    setIsLoadingVisits(true)
    setVisitErrorMessage('')

    async function loadVisits() {
      const { data, error } = await supabase
        .from('visits')
        .select(
          'id,title,region_code,region_name,started_on,ended_on,category,memo,created_at',
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
          visits={visits}
        />
        <NaverMap
          onCreateVisit={handleCreateVisitFromRegion}
          visitedRegionCodes={visitedRegionCodes}
        />
      </main>
    </div>
  )
}

export default HomePage
