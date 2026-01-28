import { auth } from '@/lib/auth'
import Link from 'next/link'

export default async function MyPromptsPage() {
  const session = await auth()

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#333' }}>
        Мои промпты
      </h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Здесь будут отображаться ваши сохранённые промпты. Пока раздел в разработке.
      </p>
      <Link
        href="/dashboard"
        style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: '#667eea',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
        }}
      >
        ← В кабинет
      </Link>
    </main>
  )
}
