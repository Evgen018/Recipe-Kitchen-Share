import { auth } from '@/lib/auth'
import { listCategories } from '@/app/actions/categories'
import { AddCategoryDialog } from '../components/AddCategoryDialog'
import { Button } from '@/app/components/ui/button'

const MAX_CATEGORIES = 20

export default async function DashboardCategoriesPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const categories = await listCategories()
  const canAdd = categories.length < MAX_CATEGORIES

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-1 text-lg text-slate-600">Категории</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {categories.length} из {MAX_CATEGORIES} категорий
        </p>
        <AddCategoryDialog
          disabled={!canAdd}
          trigger={
            <Button
              className="bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-400"
              disabled={!canAdd}
            >
              + Добавить категорию
            </Button>
          }
        />
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-slate-500">
          Пока нет категорий. Добавьте первую — например, «Напитки», «Еда», «Десерт».
        </p>
      ) : (
        <ul className="mt-6 rounded-xl border border-slate-200 bg-white">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0"
            >
              <span className="font-medium text-slate-900">{c.category}</span>
              <span className="text-sm text-slate-500">
                {c.recipesCount} {c.recipesCount === 1 ? 'рецепт' : c.recipesCount < 5 ? 'рецепта' : 'рецептов'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
