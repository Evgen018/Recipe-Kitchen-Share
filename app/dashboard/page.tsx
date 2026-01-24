import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/app/components/ui/button'
import { RecipeCard } from './components/RecipeCard'
import { RecipeDialog } from './components/RecipeDialog'
import { RecipeTable } from './components/RecipeTable'
import { SearchRecipes } from './components/SearchRecipes'
import { ViewToggle } from './components/ViewToggle'

const PAGE_SIZE = 10

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; view?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const { q = '', page: pageStr = '1', view = 'cards' } = await searchParams
  const page = Math.max(1, parseInt(String(pageStr), 10) || 1)
  const search = (q || '').trim()
  const isTableView = view === 'table'

  const where = {
    ownerId: session.user.id,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        favoritedBy: {
          where: { userId: session.user.id },
          select: { userId: true },
        },
        category: { select: { category: true } },
        _count: { select: { votes: true } },
      },
    }),
    prisma.recipe.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasNext = page < totalPages
  const hasPrev = page > 1

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-1 text-lg text-slate-600">Мои рецепты</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded-md bg-slate-100" />}>
            <SearchRecipes className="w-64 min-w-0" />
          </Suspense>
          <RecipeDialog recipe={null} trigger={<Button>+ Новый рецепт</Button>} />
        </div>
        <Suspense fallback={<div className="h-9 w-[180px] animate-pulse rounded-lg bg-slate-100" />}>
          <ViewToggle />
        </Suspense>
      </div>

      {recipes.length === 0 ? (
        <p className="mt-8 text-slate-500">
          У вас пока нет рецептов — создайте первый.
        </p>
      ) : isTableView ? (
        <RecipeTable
          recipes={recipes.map((r) => ({ ...r, showDelete: true }))}
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
                canDelete
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center gap-2" aria-label="Пагинация">
          {hasPrev && (
            <Link
              href={`?${new URLSearchParams({
                ...(search && { q: search }),
                page: String(page - 1),
                ...(isTableView && { view: 'table' }),
              }).toString()}`}
              className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Назад
            </Link>
          )}
          <span className="text-sm text-slate-500">
            {page} из {totalPages}
          </span>
          {hasNext && (
            <Link
              href={`?${new URLSearchParams({
                ...(search && { q: search }),
                page: String(page + 1),
                ...(isTableView && { view: 'table' }),
              }).toString()}`}
              className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Вперёд
            </Link>
          )}
        </nav>
      )}
    </>
  )
}
