import { auth, signIn, signOut } from '@/lib/auth'
import type { Locale } from '@/lib/i18n'
import Link from 'next/link'
import { LangSwitcher } from './LangSwitcher'

type T = (key: string) => string

type Props = { locale: Locale; t: T }

export async function Header({ locale, t }: Props) {
  const session = await auth()

  return (
    <header
      style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '0.75rem 1rem',
        background: 'white',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            fontWeight: 700,
            color: '#333',
            textDecoration: 'none',
          }}
        >
          Recipe-Kitchen-Share
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <LangSwitcher locale={locale} />
          {session?.user ? (
            <>
              <span
                className="hidden sm:inline text-sm text-slate-600"
                title={session.user.email ?? ''}
              >
                {session.user.name || session.user.email}
              </span>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button
                  type="submit"
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.875rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {t('header.logout')}
                </button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                'use server'
                await signIn('google', { callbackUrl: '/dashboard' })
              }}
            >
              <button
                type="submit"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.875rem',
                  background: 'rgba(15, 158, 166, 1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {t('header.login')}
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  )
}
