import { auth, signOut } from '@/lib/auth'
import Link from 'next/link'

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
        {session?.user && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.9rem',
                color: '#555',
              }}
              title={session.user.email ?? ''}
            >
              {session.user.name || session.user.email}
            </span>
            <Link
              href="/dashboard"
              style={{
                fontSize: '0.9rem',
                color: '#667eea',
                textDecoration: 'none',
              }}
            >
              Кабинет
            </Link>
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
          </nav>
        )}
      </div>
    </header>
  )
}
