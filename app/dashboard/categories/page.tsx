import { auth } from '@/lib/auth'
import { getLocale, getT } from '@/lib/i18n'
import { listCategories } from '@/app/actions/categories'
import { AddCategoryDialog } from '../components/AddCategoryDialog'
import { Button } from '@/app/components/ui/button'

const MAX_CATEGORIES = 20

function recipeCountKey(n: number): 'categories.recipe' | 'categories.recipes2' | 'categories.recipes5' {
  if (n === 1) return 'categories.recipe'
  if (n >= 2 && n <= 4) return 'categories.recipes2'
  return 'categories.recipes5'
}

export default async function DashboardCategoriesPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [locale, categories] = await Promise.all([getLocale(), listCategories()])
  const t = getT(locale)
  const canAdd = categories.length < MAX_CATEGORIES

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
      <h2 className="mt-1 text-lg text-slate-600">{t('categories.title')}</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {categories.length} {t('categories.of')} {MAX_CATEGORIES} {t('categories.categories')}
        </p>
        <AddCategoryDialog
          disabled={!canAdd}
          trigger={
            <Button
              className="bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-400"
              disabled={!canAdd}
            >
              + {t('categories.add')}
            </Button>
          }
        />
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-slate-500">{t('categories.empty')}</p>
      ) : (
        <ul className="mt-6 rounded-xl border border-slate-200 bg-white">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0"
            >
              <span className="font-medium text-slate-900">{c.category}</span>
              <span className="text-sm text-slate-500">
                {c.recipesCount} {t(recipeCountKey(c.recipesCount))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
