import { auth, signIn } from '@/lib/auth'
import { getRecentRecipes, getPopularRecipes } from '@/app/actions/recipes'
import { PublicRecipeCard } from '@/app/components/PublicRecipeCard'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()
  
  // Если пользователь авторизован, редиректим на dashboard
  if (session?.user) {
    redirect('/dashboard')
  }
  
  const [recentRecipes, popularRecipes] = await Promise.all([
    getRecentRecipes(20),
    getPopularRecipes(20),
  ])

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Hero-секция */}
      <section
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Recipe Kitchen Share
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              marginBottom: '2rem',
              opacity: 0.9,
            }}
          >
            Делитесь своими рецептами и открывайте новые кулинарные идеи
          </p>
          {!session?.user && (
            <form
              action={async () => {
                'use server'
                await signIn('google', { callbackUrl: '/dashboard' })
              }}
            >
              <button
                type="submit"
                className="hero-button"
                style={{
                  padding: '0.875rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
              >
                Войти через Google
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Секция недавних рецептов */}
      <section
        style={{
          padding: '3rem 1.5rem',
          background: '#f9fafb',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '2rem',
              color: '#1f2937',
            }}
          >
            Недавние рецепты
          </h2>
          {recentRecipes.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {recentRecipes.map((recipe) => (
                <PublicRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Пока нет публичных рецептов
            </p>
          )}
        </div>
      </section>

      {/* Секция популярных рецептов */}
      <section
        style={{
          padding: '3rem 1.5rem',
          background: 'white',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '2rem',
              color: '#1f2937',
            }}
          >
            Популярные рецепты
          </h2>
          {popularRecipes.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {popularRecipes.map((recipe) => (
                <PublicRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Пока нет популярных рецептов
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
