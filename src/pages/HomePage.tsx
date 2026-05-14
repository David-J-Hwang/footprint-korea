import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-950">
      <section className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">로그인에 성공했습니다.</h1>
        <button
          className="mt-8 h-12 w-full rounded-md bg-emerald-700 px-4 text-base font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20"
          onClick={() => navigate('/login')}
          type="button"
        >
          로그아웃
        </button>
      </section>
    </main>
  )
}

export default HomePage
