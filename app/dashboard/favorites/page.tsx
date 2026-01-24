import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RecipeCard } from '../components/RecipeCard'

export default async function DashboardFavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const recipes = await prisma.recipe.findMany({
    where: {
      favoritedBy: { some: { userId: session.user.id } },
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      favoritedBy: {
        where: { userId: session.user.id },
        select: { userId: true },
      },
    },
  })

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-1 text-lg text-slate-600">Избранное</h2>

      {recipes.length === 0 ? (
        <p className="mt-8 text-slate-500">В избранном пока ничего нет.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {recipes.map((r) => (
            <li key={r.id}>
              <RecipeCard
                recipe={{
                  ...r,
                  favoritedBy: r.favoritedBy,
                  visibility: r.visibility,
                }}
                currentUserId={session.user.id}
                canDelete={r.ownerId === session.user.id}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
