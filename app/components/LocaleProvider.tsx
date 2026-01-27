'use client'

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { Locale } from '@/lib/i18n'

type T = (key: string) => string

type LocaleContextValue = {
  locale: Locale
  t: T
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

type Props = {
  locale: Locale
  messages: Record<string, string>
  children: ReactNode
}

export function LocaleProvider({ locale, messages, children }: Props) {
  const t = useCallback<T>(
    (key: string) => messages[key] ?? key,
    [messages]
  )
  const value = useMemo(() => ({ locale, t }), [locale, t])

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx.locale
}

export function useTranslations(): T {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useTranslations must be used within LocaleProvider')
  return ctx.t
}
