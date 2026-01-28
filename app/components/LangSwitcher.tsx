'use client'

import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

const COOKIE_NAME = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function setLocaleCookie(value: Locale) {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

const flagStyle: CSSProperties = {
  boxSizing: 'border-box',
  padding: '0.4rem 0.75rem',
  fontSize: '0.875rem',
  width: 54,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: 6,
  cursor: 'pointer',
  background: 'transparent',
  transition: 'border-color 0.2s, background 0.2s',
  lineHeight: 1.2,
}

const activeStyle: CSSProperties = {
  ...flagStyle,
  borderColor: 'rgba(15, 158, 166, 0.8)',
  background: 'rgba(15, 158, 166, 0.08)',
}

type Props = { locale: Locale }

export function LangSwitcher({ locale }: Props) {
  const router = useRouter()

  const handleClick = (value: Locale) => {
    if (value === locale) return
    setLocaleCookie(value)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} role="group" aria-label="Выбор языка">
      <button
        type="button"
        onClick={() => handleClick('ru')}
        style={locale === 'ru' ? activeStyle : flagStyle}
        title="Русский"
        aria-label="Русский"
      >
        🇷🇺
      </button>
      <button
        type="button"
        onClick={() => handleClick('cnr')}
        style={locale === 'cnr' ? activeStyle : flagStyle}
        title="Crnogorski"
        aria-label="Crnogorski"
      >
        🇲🇪
      </button>
    </div>
  )
}
