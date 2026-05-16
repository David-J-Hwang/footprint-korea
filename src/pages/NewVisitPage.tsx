import AppHeader from '../components/layout/AppHeader'

function NewVisitPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 lg:py-8">
        <h1 className="text-2xl font-semibold text-stone-950">
          새 방문지 추가하기
        </h1>
      </main>
    </div>
  )
}

export default NewVisitPage
