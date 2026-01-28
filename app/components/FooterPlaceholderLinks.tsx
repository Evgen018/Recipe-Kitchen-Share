'use client'

import { useRef, useState } from 'react'
import { useTranslations } from './LocaleProvider'

const linkStyle = {
  fontSize: '0.9rem',
  color: '#666',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  font: 'inherit',
}

export function FooterPlaceholderLinks() {
  const t = useTranslations()
  const [hint, setHint] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (timerRef.current) clearTimeout(timerRef.current)
    setHint(true)
    timerRef.current = setTimeout(() => {
      setHint(false)
      timerRef.current = null
    }, 1000)
  }

  return (
    <>
      <button type="button" onClick={onClick} style={linkStyle}>
        {t('footer.contacts')}
      </button>
      <button type="button" onClick={onClick} style={linkStyle}>
        {t('footer.about')}
      </button>
      {hint && (
        <span
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '4rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.85rem',
            color: '#475569',
            whiteSpace: 'nowrap',
            zIndex: 50,
            padding: '0.35rem 0.6rem',
            background: '#f1f5f9',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {t('footer.devHint')}
        </span>
      )}
    </>
  )
}
