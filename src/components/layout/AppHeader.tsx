import {
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { useTheme } from '../../features/theme/useTheme'
import { supabase } from '../../lib/supabaseClient'

function getDisplayName(email?: string) {
  if (!email) {
    return '사용자'
  }

  return email.split('@')[0]
}

function AppHeader() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { themeMode, toggleThemeMode } = useTheme()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const displayName = getDisplayName(user?.email)
  const isDarkMode = themeMode === 'dark'

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
    <header className="border-b border-emerald-900/20 bg-emerald-800 text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-5 sm:py-2.5">
        <Link
          className="min-w-0 rounded-md text-base font-semibold tracking-tight focus:outline-none focus:ring-4 focus:ring-white/20 sm:text-lg"
          to="/"
        >
          Footprint Korea
        </Link>

        <div className="flex min-w-0 items-center gap-3">
          <p className="hidden text-sm font-medium text-emerald-50 sm:block">
            <span className="break-all">{displayName}</span>님, 환영합니다.
          </p>
          <button
            aria-label={isDarkMode ? '라이트모드로 전환' : '다크모드로 전환'}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/20 bg-emerald-900/30 text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/20"
            onClick={toggleThemeMode}
            type="button"
          >
            {isDarkMode ? (
              <SunIcon aria-hidden="true" className="size-4" />
            ) : (
              <MoonIcon aria-hidden="true" className="size-4" />
            )}
          </button>
          <button
            className="h-8 shrink-0 cursor-pointer rounded-md border border-white/20 bg-white px-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed disabled:bg-white/50 disabled:text-emerald-950/50 sm:h-9 sm:px-4"
            disabled={isSigningOut}
            onClick={handleSignOut}
            type="button"
          >
            {isSigningOut ? '처리 중...' : '로그아웃'}
          </button>
          {errorMessage ? (
            <p
              aria-live="polite"
              className="hidden text-sm text-rose-100 md:block"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
