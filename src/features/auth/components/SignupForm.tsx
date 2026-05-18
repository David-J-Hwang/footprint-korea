import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient'

function SignupForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상으로 입력해주세요.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      if (data.session) {
        navigate('/', { replace: true })
        return
      }

      setSuccessMessage(
        '회원가입이 완료되었습니다. 이메일 인증을 마친 뒤 로그인해주세요.',
      )
      setEmail('')
      setPassword('')
      setPasswordConfirm('')
    } catch {
      setErrorMessage(
        '회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">회원가입</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          새 계정을 만들어보세요
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
            htmlFor="signup-email"
          >
            이메일
          </label>
          <input
            autoComplete="email"
            className="h-12 w-full rounded-md border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500"
            disabled={isSubmitting}
            id="signup-email"
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
            className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
            htmlFor="signup-password"
          >
            비밀번호
          </label>
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-md border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500"
            disabled={isSubmitting}
            id="signup-password"
            minLength={6}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="6자 이상"
            required
            type="password"
            value={password}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
            htmlFor="signup-password-confirm"
          >
            비밀번호 확인
          </label>
          <input
            autoComplete="new-password"
            className="h-12 w-full rounded-md border border-stone-300 bg-white px-4 text-base text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500"
            disabled={isSubmitting}
            id="signup-password-confirm"
            minLength={6}
            name="passwordConfirm"
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="비밀번호를 한 번 더 입력"
            required
            type="password"
            value={passwordConfirm}
          />
        </div>

        <button
          className="h-12 w-full rounded-md bg-emerald-700 px-4 text-base font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '가입 중...' : '회원가입'}
        </button>

        {errorMessage ? (
          <p
            aria-live="polite"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p
            aria-live="polite"
            className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            {successMessage}
          </p>
        ) : null}
      </form>

      <p className="mt-8 text-center text-sm text-stone-600 dark:text-stone-400">
        이미 계정이 있나요?{' '}
        <Link
          className="font-semibold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
          to="/login"
        >
          로그인
        </Link>
      </p>
    </div>
  )
}

export default SignupForm
