import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { useAuth } from '../features/auth/useAuth'
import {
  VISIT_CATEGORIES,
  type VisitCategory,
} from '../features/visits/visitTypes'
import { supabase } from '../lib/supabaseClient'

const REGION_CODE_URL = `${import.meta.env.BASE_URL}data/regionCode.json`

type RegionCodeMap = Record<string, string>

type RegionOption = {
  code: string
  name: string
}

function toRegionOptions(regionCodeMap: RegionCodeMap) {
  return Object.entries(regionCodeMap)
    .map(([code, name]) => ({
      code,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

function NewVisitPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryRegionCode = searchParams.get('regionCode') ?? ''

  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([])
  const [title, setTitle] = useState('')
  const [regionCode, setRegionCode] = useState(queryRegionCode)
  const [startedOn, setStartedOn] = useState('')
  const [endedOn, setEndedOn] = useState('')
  const [category, setCategory] = useState<VisitCategory>('attraction')
  const [memo, setMemo] = useState('')
  const [isLoadingRegions, setIsLoadingRegions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedRegion = useMemo(
    () => regionOptions.find((region) => region.code === regionCode),
    [regionCode, regionOptions],
  )

  useEffect(() => {
    let isMounted = true

    fetch(REGION_CODE_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('행정구역 정보를 불러오지 못했습니다.')
        }

        return response.json() as Promise<RegionCodeMap>
      })
      .then((regionCodeMap) => {
        if (!isMounted) {
          return
        }

        setRegionOptions(toRegionOptions(regionCodeMap))
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : '행정구역 정보를 불러오지 못했습니다.',
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRegions(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!user) {
      setErrorMessage('로그인 정보를 확인할 수 없습니다.')
      return
    }

    if (!selectedRegion) {
      setErrorMessage('행정구역을 선택해주세요.')
      return
    }

    if (endedOn && endedOn < startedOn) {
      setErrorMessage('방문 종료일은 시작일보다 빠를 수 없습니다.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from('visits').insert({
      category,
      ended_on: endedOn || null,
      memo: memo.trim() || null,
      region_code: selectedRegion.code,
      region_name: selectedRegion.name,
      started_on: startedOn,
      title: title.trim(),
      user_id: user.id,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 lg:py-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-emerald-700">방문 기록</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">
            새 방문지 추가하기
          </h1>

          <form
            className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  방문지 이름
                </span>
                <input
                  className="h-11 rounded-md border border-stone-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15"
                  maxLength={80}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="예: 성산일출봉"
                  required
                  type="text"
                  value={title}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  행정구역
                </span>
                <select
                  className="h-11 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15"
                  disabled={isLoadingRegions}
                  onChange={(event) => setRegionCode(event.target.value)}
                  required
                  value={regionCode}
                >
                  <option value="">
                    {isLoadingRegions
                      ? '행정구역을 불러오는 중입니다'
                      : '행정구역을 선택해주세요'}
                  </option>
                  {regionOptions.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-stone-800">
                    방문 시작일
                  </span>
                  <input
                    className="h-11 rounded-md border border-stone-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15"
                    onChange={(event) => setStartedOn(event.target.value)}
                    required
                    type="date"
                    value={startedOn}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-stone-800">
                    방문 종료일
                  </span>
                  <input
                    className="h-11 rounded-md border border-stone-300 px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15"
                    min={startedOn || undefined}
                    onChange={(event) => setEndedOn(event.target.value)}
                    type="date"
                    value={endedOn}
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  방문 유형
                </span>
                <select
                  className="h-11 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15"
                  onChange={(event) =>
                    setCategory(event.target.value as VisitCategory)
                  }
                  required
                  value={category}
                >
                  {VISIT_CATEGORIES.map((visitCategory) => (
                    <option
                      key={visitCategory.value}
                      value={visitCategory.value}
                    >
                      {visitCategory.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  감상 메모
                </span>
                <textarea
                  className="min-h-36 resize-y rounded-md border border-stone-300 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15"
                  maxLength={2000}
                  onChange={(event) => setMemo(event.target.value)}
                  placeholder="방문하면서 느낀 점을 적어주세요."
                  value={memo}
                />
              </label>
            </div>

            {errorMessage ? (
              <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                className="flex h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                to="/"
              >
                취소
              </Link>
              <button
                className="h-11 cursor-pointer rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                disabled={isSubmitting || isLoadingRegions}
                type="submit"
              >
                {isSubmitting ? '저장하는 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default NewVisitPage
