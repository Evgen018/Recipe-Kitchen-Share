'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'

interface TableData {
  [key: string]: any
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function TableViewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const tableName = params.table as string

  const [data, setData] = useState<TableData[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TableData | null>(null)

  const fetchData = async (pageNum: number) => {
    try {
      setLoading(true)
      const dbType = searchParams.get('type') || 'local'
      const url = searchParams.get('url')
      
      const apiParams = new URLSearchParams()
      apiParams.set('type', dbType)
      if (url) apiParams.set('url', url)
      apiParams.set('page', pageNum.toString())
      apiParams.set('limit', '10')

      const response = await fetch(`/api/view-db/tables/${tableName}?${apiParams.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      setData(result.data)
      setPagination(result.pagination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(page)
  }, [page, tableName, searchParams])

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return

    try {
      const dbType = searchParams.get('type') || 'local'
      const url = searchParams.get('url')
      
      const apiParams = new URLSearchParams()
      apiParams.set('type', dbType)
      if (url) apiParams.set('url', url)
      apiParams.set('id', id)

      const response = await fetch(`/api/view-db/tables/${tableName}?${apiParams.toString()}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete')
      }

      fetchData(page)
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`)
    }
  }

  const handleCreate = async (formData: FormData) => {
    try {
      const dbType = searchParams.get('type') || 'local'
      const url = searchParams.get('url')
      
      const apiParams = new URLSearchParams()
      apiParams.set('type', dbType)
      if (url) apiParams.set('url', url)

      const body: any = {}
      formData.forEach((value, key) => {
        if (value) body[key] = value
      })

      const response = await fetch(`/api/view-db/tables/${tableName}?${apiParams.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create')
      }

      setShowCreateForm(false)
      fetchData(page)
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`)
    }
  }

  const handleUpdate = async (formData: FormData) => {
    try {
      const dbType = searchParams.get('type') || 'local'
      const url = searchParams.get('url')
      
      const apiParams = new URLSearchParams()
      apiParams.set('type', dbType)
      if (url) apiParams.set('url', url)

      const body: any = { id: editingRecord?.id }
      formData.forEach((value, key) => {
        if (value && key !== 'id') body[key] = value
      })

      const response = await fetch(`/api/view-db/tables/${tableName}?${apiParams.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update')
      }

      setEditingRecord(null)
      fetchData(page)
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`)
    }
  }

  if (loading && !data.length) {
    return (
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <p>Загрузка данных...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '2rem' }}>
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
          onClick={() => {
            const params = new URLSearchParams()
            params.set('type', searchParams.get('type') || 'local')
            const url = searchParams.get('url')
            if (url) params.set('url', url)
            router.push(`/view-db/tables?${params.toString()}`)
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Назад к таблицам
        </button>
      </div>
    )
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>📋 Таблица: {tableName}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Создать
          </button>
          <button
            onClick={() => {
              const params = new URLSearchParams()
              params.set('type', searchParams.get('type') || 'local')
              const url = searchParams.get('url')
              if (url) params.set('url', url)
              router.push(`/view-db/tables?${params.toString()}`)
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ← Назад
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Создать запись</h2>
            <form action={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {columns.map((col) => (
                <div key={col}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    {col}:
                  </label>
                  <input
                    type="text"
                    name={col}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Редактировать запись</h2>
            <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {columns.map((col) => (
                <div key={col}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    {col}:
                  </label>
                  <input
                    type="text"
                    name={col}
                    defaultValue={editingRecord[col] || ''}
                    disabled={col === 'id' || col === 'createdAt'}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: (col === 'id' || col === 'createdAt') ? '#f5f5f5' : 'white',
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    border: '1px solid #ddd',
                    fontWeight: '600',
                  }}
                >
                  {col}
                </th>
              ))}
              <th style={{ padding: '0.75rem', border: '1px solid #ddd', fontWeight: '600' }}>
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={String(row[col] || '')}
                  >
                    {String(row[col] || '')}
                  </td>
                ))}
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setEditingRecord(row)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            Страница {pagination.page} из {pagination.totalPages} (всего записей: {pagination.total})
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: page === 1 ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Назад
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: page === pagination.totalPages ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Вперед →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
