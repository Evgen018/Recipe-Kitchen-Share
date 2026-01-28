import { prisma } from '@/lib/prisma'

async function getNotes() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return notes
  } catch (error) {
    console.error('Error fetching notes:', error)
    return []
  }
}

/**
 * Страница «Заметки из PostgreSQL» — скрыта из навигации.
 * Временный маршрут: /notes. Позже можно вынести в меню или убрать.
 */
export default async function NotesPage() {
  const notes = await getNotes()

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: '#333',
            textAlign: 'center',
          }}
        >
          📝 Заметки из PostgreSQL
        </h1>

        {notes.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: '#666',
              fontSize: '1.1rem',
              padding: '2rem',
            }}
          >
            Нет заметок. Запустите seed: <code>npm run db:seed</code>
          </p>
        ) : (
          <div style={{ marginTop: '2rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#444',
              }}
            >
              Всего заметок: {notes.length}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {notes.map((note) => (
                <li
                  key={note.id}
                  style={{
                    background: '#f8f9fa',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea',
                  }}
                >
                  <div
                    style={{
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      color: '#333',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {note.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    ID: {note.id}
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#999',
                      marginTop: '0.25rem',
                    }}
                  >
                    Создано: {new Date(note.createdAt).toLocaleString('ru-RU')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#e3f2fd',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#1976d2',
          }}
        >
          <strong>✅ Подключение к базе данных работает!</strong>
          <br />
          Данные успешно загружены из NeonDB (PostgreSQL)
        </div>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
          }}
        >
          <a
            href="/view-db"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '600',
            }}
          >
            🔍 Просмотр базы данных (view-db)
          </a>
        </div>
      </div>
    </main>
  )
}
