import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getCachedPublicRecipes } from './fetchPublicRecipes'
import { RecipeCard } from '../components/RecipeCard'
import { RecipeTable } from '../components/RecipeTable'
import { SearchRecipes } from '../components/SearchRecipes'
import { SortSwitcher } from '../components/SortSwitcher'
import { ViewToggle } from '../components/ViewToggle'

const PAGE_SIZE = 10

export default async function DashboardPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; view?: string; sort?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const { q = '', page: pageStr = '1', view = 'cards', sort = 'recent' } = await searchParams
  const page = Math.max(1, parseInt(String(pageStr), 10) || 1)
  const search = (q || '').trim()
  const isTableView = view === 'table'
  const sortMode = sort === 'popular' ? 'popular' : 'recent'

  const { recipes, total } = await getCachedPublicRecipes(
    session.user.id,
    page,
    search,
    sortMode
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-1 text-lg text-slate-600">Публичные рецепты</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded-md bg-slate-100" />}>
          <SearchRecipes className="w-64 max-w-xs" />
        </Suspense>
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={<div className="h-9 w-[140px] animate-pulse rounded-lg bg-slate-100" />}>
            <SortSwitcher />
          </Suspense>
          <Suspense fallback={<div className="h-9 w-[180px] animate-pulse rounded-lg bg-slate-100" />}>
            <ViewToggle />
          </Suspense>
        </div>
      </div>

      {recipes.length === 0 ? (
        <p className="mt-8 text-slate-500">Пока нет публичных рецептов.</p>
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

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center gap-2" aria-label="Пагинация">
          {page > 1 && (
          <Link
            href={`?${new URLSearchParams({
              ...(search && { q: search }),
              page: String(page - 1),
              ...(isTableView && { view: 'table' }),
              ...(sort !== 'recent' && { sort }),
            }).toString()}`}
            prefetch={false}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Назад
          </Link>
          )}
          <span className="text-sm text-slate-500">
            {page} из {totalPages}
          </span>
          {page < totalPages && (
          <Link
            href={`?${new URLSearchParams({
              ...(search && { q: search }),
              page: String(page + 1),
              ...(isTableView && { view: 'table' }),
              ...(sort !== 'recent' && { sort }),
            }).toString()}`}
            prefetch={false}
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
