import LoginForm from '../features/auth/components/LoginForm'

const cityTiles = [
  {
    name: '서울',
    label: '특별시',
    className: 'bg-white text-stone-950',
  },
  {
    name: '인천',
    label: '광역시',
    className: 'bg-emerald-100 text-emerald-950',
  },
  {
    name: '춘천',
    label: '강원',
    className: 'bg-white/20 text-white',
  },
  {
    name: '강릉',
    label: '강원',
    className: 'bg-sky-100 text-sky-950',
  },
  {
    name: '대전',
    label: '광역시',
    className: 'bg-white/20 text-white',
  },
  {
    name: '전주',
    label: '전북',
    className: 'bg-amber-100 text-amber-950',
  },
  {
    name: '광주',
    label: '광역시',
    className: 'bg-white/20 text-white',
  },
  {
    name: '대구',
    label: '광역시',
    className: 'bg-white/20 text-white',
  },
  {
    name: '부산',
    label: '광역시',
    className: 'bg-rose-100 text-rose-950',
  },
  {
    name: '울산',
    label: '광역시',
    className: 'bg-white/20 text-white',
  },
  {
    name: '여수',
    label: '전남',
    className: 'bg-white/20 text-white',
  },
  {
    name: '제주',
    label: '특별자치도',
    className: 'bg-lime-100 text-lime-950',
  },
]

function LoginPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:grid-cols-[1fr_420px]">
          <div className="hidden min-h-[560px] bg-[linear-gradient(135deg,#0f766e_0%,#1f7a5c_45%,#3f3428_100%)] p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-100">
                Footprint Korea
              </p>
              <h1 className="mt-5 max-w-sm text-4xl font-semibold leading-tight">
                다시 떠날 곳을 한눈에 남겨요
              </h1>
            </div>

            <div className="mt-12 rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl shadow-stone-950/20">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-emerald-100">
                  국내 주요 도시
                </p>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-emerald-50">
                  visited map
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2" aria-hidden="true">
                {cityTiles.map((city) => (
                  <div
                    className={`min-h-20 rounded-md border border-white/15 p-3 shadow-sm backdrop-blur ${city.className}`}
                    key={city.name}
                  >
                    <p className="text-lg font-semibold">{city.name}</p>
                    <p className="mt-1 text-xs font-medium opacity-70">
                      {city.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-emerald-50">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-white" />
                  방문 기록 있음
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-white/30" />
                  다음에 갈 곳
                </span>
              </div>
            </div>
          </div>

          <div className="flex min-h-[560px] items-center px-5 py-8 sm:px-10">
            <div className="w-full">
              <div className="mb-8 md:hidden">
                <p className="text-sm font-medium text-emerald-700">
                  Footprint Korea
                </p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight text-stone-950">
                  다시 떠날 곳을 한눈에 남겨요
                </h1>
              </div>

              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
