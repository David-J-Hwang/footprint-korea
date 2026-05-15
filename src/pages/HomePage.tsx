import AppHeader from '../components/layout/AppHeader'
import NaverMap from '../features/map/components/NaverMap'
import VisitListPanel from '../features/visits/components/VisitListPanel'

function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-5 lg:grid-cols-[minmax(240px,1fr)_3fr] lg:py-8">
        <VisitListPanel />
        <NaverMap />
      </main>
    </div>
  )
}

export default HomePage
