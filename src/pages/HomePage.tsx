import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function HomePage() {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSignOut() {
    setErrorMessage('')
    setIsSigningOut(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setErrorMessage('로그아웃 중 문제가 발생했습니다.')
        return
      }

      navigate('/login', { replace: true })
    } catch {
      setErrorMessage('로그아웃 중 문제가 발생했습니다.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-950">
      <section className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">로그인에 성공했습니다.</h1>
        <button
          className="mt-8 h-12 w-full rounded-md bg-emerald-700 px-4 text-base font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={isSigningOut}
          onClick={handleSignOut}
          type="button"
        >
          {isSigningOut ? '로그아웃 중...' : '로그아웃'}
        </button>
        {errorMessage ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}
      </section>
    </main>
  )
}

export default HomePage
