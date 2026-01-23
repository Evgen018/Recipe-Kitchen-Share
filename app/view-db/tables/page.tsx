'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function TablesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true)
        const dbType = searchParams.get('type') || 'local'
        const url = searchParams.get('url')
        
        const params = new URLSearchParams()
        params.set('type', dbType)
        if (url) params.set('url', url)

        const response = await fetch(`/api/view-db/tables?${params.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch tables')
        }

        setTables(data.tables)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [searchParams])

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <p>Загрузка таблиц...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>Ошибка:</strong> {error}
        </div>
        <button
          onClick={() => router.push('/view-db')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Назад
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>📊 Таблицы базы данных</h1>
        <button
          onClick={() => router.push('/view-db')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Назад
        </button>
      </div>

      {tables.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Таблицы не найдены</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tables.map((table) => {
            const params = new URLSearchParams()
            params.set('type', searchParams.get('type') || 'local')
            const url = searchParams.get('url')
            if (url) params.set('url', url)
            
            return (
              <div
                key={table}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{table}</span>
                <Link
                  href={`/view-db/tables/${table}?${params.toString()}`}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                  }}
                >
                  Открыть →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TablesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <p>Загрузка таблиц...</p>
        </div>
      }
    >
      <TablesPageContent />
    </Suspense>
  )
}
