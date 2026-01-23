import { auth } from '@/lib/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#333' }}>
        Личный кабинет
      </h1>
      {session?.user && (
        <div
          style={{
            background: '#f8f9fa',
            padding: '1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ margin: 0, color: '#555' }}>
            <strong>Email:</strong> {session.user.email}
          </p>
          {session.user.name && (
            <p style={{ margin: '0.5rem 0 0', color: '#555' }}>
              <strong>Имя:</strong> {session.user.name}
            </p>
          )}
        </div>
      )}
      <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          href="/my-prompts"
          style={{
            padding: '0.5rem 1rem',
            background: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
          }}
        >
          Мои промпты
        </Link>
        <Link
          href="/"
          style={{
            padding: '0.5rem 1rem',
            background: '#e9ecef',
            color: '#333',
            textDecoration: 'none',
            borderRadius: '6px',
          }}
        >
          На главную
        </Link>
      </nav>
    </main>
  )
}
