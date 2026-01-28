import type { Locale } from '@/lib/i18n'

type T = (key: string) => string

type Props = { locale: Locale; t: T }

export function Footer({ locale: _locale, t: _t }: Props) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop: '1px solid #e5e7eb',
        padding: '2rem 1.5rem',
        background: 'white',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: '0.9rem',
            color: '#666',
            textAlign: 'center',
          }}
        >
          Copyright © {currentYear} Recipe-Kitchen-Share
        </div>
      </div>
    </footer>
  )
}
