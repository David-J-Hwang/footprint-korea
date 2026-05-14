import AppHeader from '../components/layout/AppHeader'

function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <section className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">로그인에 성공했습니다.</h1>
        </section>
      </main>
    </div>
  )
}

export default HomePage
