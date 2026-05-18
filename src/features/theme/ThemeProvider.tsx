import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ThemeContext,
  type ThemeContextValue,
  type ThemeMode,
} from './themeContext'

type ThemeProviderProps = {
  children: ReactNode
}

const THEME_STORAGE_KEY = 'footprint-korea-theme'

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedThemeMode = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedThemeMode === 'dark' || savedThemeMode === 'light') {
    return savedThemeMode
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)

  useEffect(() => {
    const isDarkMode = themeMode === 'dark'

    document.documentElement.classList.toggle('dark', isDarkMode)
    document.documentElement.style.colorScheme = themeMode
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      toggleThemeMode: () => {
        setThemeMode((currentThemeMode) =>
          currentThemeMode === 'dark' ? 'light' : 'dark',
        )
      },
    }),
    [themeMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
