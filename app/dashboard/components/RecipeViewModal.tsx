'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { saveRecipe, getAvailableCategories } from '@/app/actions/recipes'

type Recipe = { id: string; title: string; content: string; visibility: string; categoryId?: string }

/** Убирает дублирование: если content начинается с title, возвращает только остаток. */
function contentWithoutLeadingTitle(content: string, title: string): string {
  if (!title?.trim() || !content) return content
  const t = title.trim()
  const c = content.trimStart()
  if (!c.startsWith(t)) return content
  return c.slice(t.length).trimStart()
}

interface RecipeViewModalProps {
  recipe: Recipe
  isOwner?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Открыть сразу в режиме правки (например, при клике по карандашу). */
  initialMode?: 'view' | 'edit'
}

export function RecipeViewModal({
  recipe,
  isOwner = false,
  open,
  onOpenChange,
  initialMode = 'view',
}: RecipeViewModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [categories, setCategories] = useState<Array<{ id: string; category: string }>>([])
  const [categoryId, setCategoryId] = useState(recipe.categoryId ?? '')
  const router = useRouter()

  useEffect(() => {
    if (!open) setMode('view')
    else setMode(initialMode === 'edit' ? 'edit' : 'view')
  }, [open, initialMode])

  useEffect(() => {
    if (open) {
      getAvailableCategories().then(setCategories)
    }
  }, [open])

  useEffect(() => {
    if (open && mode === 'edit') {
      setCategoryId(recipe.categoryId ?? '')
    }
  }, [open, mode, recipe.id, recipe.categoryId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="left-0 top-0 flex h-screen w-screen max-w-none flex-col translate-x-0 translate-y-0 gap-3 rounded-none p-4 pt-4 md:p-6 md:pt-5"
        showClose={false}
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-4">
          <DialogTitle className="text-xl md:text-2xl">
            {mode === 'view' ? recipe.title : 'Редактировать рецепт'}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {mode === 'view' && isOwner && (
              <Button
                size="sm"
                onClick={() => setMode('edit')}
                className="bg-sky-500 text-white shadow-sm hover:bg-sky-600 border-0"
              >
                Правка
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Закрыть" title="Закрыть" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="min-h-0 flex-1 overflow-auto rounded border border-slate-200 bg-slate-50/50 p-4 md:p-6">
            <div className="whitespace-pre-wrap text-slate-700">
              {contentWithoutLeadingTitle(recipe.content, recipe.title)}
            </div>
          </div>
        ) : (
          <form
            key={`edit-${recipe.id}`}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto"
            onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const res = await saveRecipe(formData)
              if (res?.ok) {
                setMode('view')
                router.refresh()
              }
            }}
          >
            <input type="hidden" name="recipeId" value={recipe.id} />
            <div className="grid gap-1 shrink-0">
              <Label htmlFor="v-title">Название</Label>
              <Input
                id="v-title"
                name="title"
                defaultValue={recipe.title}
                required
                placeholder="Название рецепта"
              />
            </div>
            <div className="grid gap-1 shrink-0">
              <Label htmlFor="v-categoryId">Категория</Label>
              <select
                id="v-categoryId"
                name="categoryId"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-1">
              <Label htmlFor="v-content" className="shrink-0">Содержание</Label>
              <Textarea
                id="v-content"
                name="content"
                defaultValue={contentWithoutLeadingTitle(recipe.content, recipe.title)}
                required
                placeholder="Описание, ингредиенты, шаги…"
                className="min-h-[180px] resize-y"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="v-isPublic"
                name="isPublic"
                value="true"
                defaultChecked={recipe.visibility === 'PUBLIC'}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="v-isPublic" className="cursor-pointer font-normal">
                Публичный (видят все)
              </Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMode('view')}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
