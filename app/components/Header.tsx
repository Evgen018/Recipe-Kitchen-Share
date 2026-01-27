import { auth, signIn, signOut } from '@/lib/auth'
import Link from 'next/link'
import { HeaderCabinetLink } from './HeaderNav'

export async function Header() {
  const session = await auth()

  return (
    <header
      style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '0.75rem 1.5rem',
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
          gap: '1rem',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#333',
            textDecoration: 'none',
          }}
        >
          Recipe-Kitchen-Share
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {session?.user ? (
            <>
              <Link
                href="/"
                style={{
                  fontSize: '0.9rem',
                  color: '#555',
                  textDecoration: 'none',
                }}
              >
                Главная
              </Link>
              <Link
                href="/dashboard/profile"
                style={{
                  fontSize: '0.9rem',
                  color: '#555',
                  textDecoration: 'none',
                }}
              >
                Профиль
              </Link>
              <Link
                href="/dashboard"
                style={{
                  fontSize: '0.9rem',
                  color: '#555',
                  textDecoration: 'none',
                }}
              >
                Мои рецепты
              </Link>
              <span
                style={{
                  fontSize: '0.9rem',
                  color: '#555',
                }}
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
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.9rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Выход
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
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.9rem',
                  background: 'rgba(15, 158, 166, 1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Вход
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  )
}
