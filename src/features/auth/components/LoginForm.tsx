import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient'

function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage('이메일 또는 비밀번호를 확인해주세요.')
        return
      }

      navigate('/', { replace: true })
    } catch {
      setErrorMessage('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-700">로그인</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
          계정에 로그인하세요
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-stone-700"
            htmlFor="email"
          >
            이메일
          </label>
          <input
            autoComplete="email"
            className="h-12 w-full rounded-md border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
            disabled={isSubmitting}
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-stone-700"
            htmlFor="password"
          >
            비밀번호
          </label>
          <input
            autoComplete="current-password"
            className="h-12 w-full rounded-md border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
            disabled={isSubmitting}
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            required
            type="password"
            value={password}
          />
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-stone-600">
            <input
              className="size-4 accent-emerald-700"
              disabled={isSubmitting}
              type="checkbox"
            />
            로그인 유지
          </label>

          <button
            className="font-medium text-emerald-700 transition hover:text-emerald-800"
            disabled={isSubmitting}
            type="button"
          >
            비밀번호 찾기
          </button>
        </div>

        <button
          className="h-12 w-full rounded-md bg-emerald-700 px-4 text-base font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>

        {errorMessage ? (
          <p
            aria-live="polite"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}
      </form>

      <p className="mt-8 text-center text-sm text-stone-600">
        아직 계정이 없나요?{' '}
        <button
          className="font-semibold text-emerald-700 transition hover:text-emerald-800"
          type="button"
        >
          회원가입
        </button>
      </p>
    </div>
  )
}

export default LoginForm
