import { auth, signIn } from '@/lib/auth'

type SearchParams = { callbackUrl?: string | string[] }

export default async function Home({
  searchParams = {},
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const p = await Promise.resolve(searchParams ?? {})
  const callbackUrl = (typeof p?.callbackUrl === 'string' ? p.callbackUrl : '/dashboard') as string

  const session = await auth()

  if (session?.user) {
    return (
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1rem' }}>
            Вы уже авторизованы как {session.user.email}
          </p>
          <a
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            Перейти в кабинет
          </a>
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '380px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            marginBottom: '0.5rem',
            color: '#333',
            textAlign: 'center',
          }}
        >
          Recipe-Kitchen-Share
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '2rem',
            fontSize: '0.95rem',
          }}
        >
          Войдите, чтобы продолжить
        </p>
        <form
          action={async () => {
            'use server'
            await signIn('google', { callbackUrl })
          }}
        >
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem 1.25rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#333',
              backgroundColor: '#fff',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
              />
              <path
                fill="#34A853"
                d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
              />
              <path
                fill="#FBBC05"
                d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
              />
              <path
                fill="#EA4335"
                d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
              />
            </svg>
            Войти через Google
          </button>
        </form>
        <p
          style={{
            marginTop: '1.25rem',
            fontSize: '0.8rem',
            color: '#666',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Продолжая, вы соглашаетесь с{' '}
          <a href="/terms" style={{ color: '#666', textDecoration: 'underline' }}>
            Условиями использования
          </a>{' '}
          и{' '}
          <a href="/privacy" style={{ color: '#666', textDecoration: 'underline' }}>
            Политикой конфиденциальности
          </a>
        </p>
      </div>
    </main>
  )
}
