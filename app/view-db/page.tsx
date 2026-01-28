'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ViewDbPage() {
  const router = useRouter()
  const [dbType, setDbType] = useState<'local' | 'production'>('local')
  const [customUrl, setCustomUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('type', dbType)
    if (dbType === 'production' && customUrl) {
      params.set('url', customUrl)
    }
    router.push(`/view-db/tables?${params.toString()}`)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🔍 Просмотр базы данных</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Выберите базу данных:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="dbType"
                value="local"
                checked={dbType === 'local'}
                onChange={(e) => setDbType(e.target.value as 'local' | 'production')}
              />
              <span>Локальная БД (из .env - DATABASE_URL)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="dbType"
                value="production"
                checked={dbType === 'production'}
                onChange={(e) => setDbType(e.target.value as 'local' | 'production')}
              />
              <span>Рабочая БД (указать URL)</span>
            </label>
          </div>
        </div>

        {dbType === 'production' && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Connection String:
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="postgresql://user:password@host/database"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
              required
            />
          </div>
        )}

        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Продолжить →
        </button>
      </form>
    </div>
  )
}
