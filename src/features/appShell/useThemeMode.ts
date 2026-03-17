import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, type ThemeMode } from './appShell'

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const resolvedTheme = resolveThemeMode(themeMode)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null

    const applyTheme = () => {
      const nextTheme =
        themeMode === 'system' ? (mediaQuery?.matches ? 'dark' : 'light') : themeMode
      document.documentElement.dataset.theme = nextTheme
      document.documentElement.style.colorScheme = nextTheme
    }

    applyTheme()
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)

    if (!mediaQuery) {
      return
    }

    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void
    }

    const handleChange = () => {
      if (themeMode === 'system') {
        applyTheme()
      }
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    legacyMediaQuery.addListener?.(handleChange)
    return () => legacyMediaQuery.removeListener?.(handleChange)
  }, [themeMode])

  return {
    themeMode,
    resolvedTheme,
    setThemeMode,
  }
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
    ? storedTheme
    : 'system'
}

function resolveThemeMode(themeMode: ThemeMode): 'light' | 'dark' {
  if (themeMode === 'light' || themeMode === 'dark') {
    return themeMode
  }

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
