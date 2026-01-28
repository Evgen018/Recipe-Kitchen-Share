import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLocale, getT } from '@/lib/i18n'
import { RecipeCard } from '../components/RecipeCard'
import { RecipeTable } from '../components/RecipeTable'
import { ViewToggle } from '../components/ViewToggle'

export default async function DashboardFavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const [locale, params] = await Promise.all([getLocale(), searchParams])
  const t = getT(locale)
  const { view = 'cards' } = params
  const isTableView = view === 'table'

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
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
      },
      category: { select: { category: true } },
      _count: { select: { likes: true } },
    },
  })

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
      <h2 className="mt-1 text-lg text-slate-600">{t('sidebar.favorites')}</h2>

      <div className="mt-4 flex justify-end">
        <Suspense fallback={<div className="h-9 w-[180px] animate-pulse rounded-lg bg-slate-100" />}>
          <ViewToggle />
        </Suspense>
      </div>

      {recipes.length === 0 ? (
        <p className="mt-8 text-slate-500">{t('dashboard.noFavorites')}</p>
      ) : isTableView ? (
        <RecipeTable
          recipes={recipes.map((r) => ({
            ...r,
            showDelete: r.ownerId === session.user.id,
          }))}
          currentUserId={session.user.id}
        />
      ) : (
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
