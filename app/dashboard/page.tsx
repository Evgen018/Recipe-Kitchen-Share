import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLocale, getT } from '@/lib/i18n'
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

  const [locale, params] = await Promise.all([getLocale(), searchParams])
  const t = getT(locale)
  const { q = '', page: pageStr = '1', view = 'cards' } = params
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
        likes: {
          where: { userId: session.user.id },
          select: { id: true },
        },
        category: { select: { category: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.recipe.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasNext = page < totalPages
  const hasPrev = page > 1

  return (
    <>
      <h1 className="text-xl md:text-2xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
      <h2 className="mt-1 text-base md:text-lg text-slate-600">{t('dashboard.myRecipes')}</h2>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center gap-3">
          <Suspense fallback={<div className="h-10 w-full sm:w-64 animate-pulse rounded-md bg-slate-100" />}>
            <SearchRecipes className="w-full sm:w-64 min-w-0" />
          </Suspense>
          <RecipeDialog recipe={null} trigger={<Button className="bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-400 w-full sm:w-auto">+ {t('dashboard.newRecipe')}</Button>} />
        </div>
        <Suspense fallback={<div className="h-9 w-full sm:w-[180px] animate-pulse rounded-lg bg-slate-100" />}>
          <ViewToggle />
        </Suspense>
      </div>

      {recipes.length === 0 ? (
        <p className="mt-8 text-slate-500">{t('dashboard.noRecipes')}</p>
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
        <nav className="mt-6 flex items-center gap-2" aria-label={t('pagination.ariaLabel')}>
          {hasPrev && (
            <Link
              href={`?${new URLSearchParams({
                ...(search && { q: search }),
                page: String(page - 1),
                ...(isTableView && { view: 'table' }),
              }).toString()}`}
              className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              {t('pagination.prev')}
            </Link>
          )}
          <span className="text-sm text-slate-500">
            {page} {t('pagination.of')} {totalPages}
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
              {t('pagination.next')}
            </Link>
          )}
        </nav>
      )}
    </>
  )
}
