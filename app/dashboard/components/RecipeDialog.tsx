'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveRecipe, getAvailableCategories } from '@/app/actions/recipes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'

type Recipe = {
  id: string
  title: string
  content: string
  visibility: string
  categoryId?: string
}

function contentWithoutLeadingTitle(content: string, title: string): string {
  if (!title?.trim() || !content) return content
  const t = title.trim()
  const c = content.trimStart()
  if (!c.startsWith(t)) return content
  return c.slice(t.length).trimStart()
}

interface RecipeDialogProps {
  recipe?: Recipe | null
  trigger: React.ReactNode
}

export function RecipeDialog({ recipe, trigger }: RecipeDialogProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; category: string }>>([])
  const router = useRouter()
  const isEdit = !!recipe

  useEffect(() => {
    if (open) {
      getAvailableCategories().then(setCategories)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать рецепт' : 'Новый рецепт'}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const res = await saveRecipe(formData)
            if (res?.ok) {
              setOpen(false)
              router.refresh()
            }
          }}
        >
          {isEdit && <input type="hidden" name="recipeId" value={recipe.id} />}
          <div className="grid gap-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              name="title"
              defaultValue={recipe?.title}
              required
              placeholder="Название рецепта"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="categoryId">Категория</Label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={recipe?.categoryId || ''}
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
          <div className="grid gap-2">
            <Label htmlFor="content">Содержание</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={recipe ? contentWithoutLeadingTitle(recipe.content, recipe.title) : ''}
              required
              placeholder="Описание, ингредиенты, шаги…"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              value="true"
              defaultChecked={recipe?.visibility === 'PUBLIC'}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="isPublic" className="cursor-pointer font-normal">
              Публичный (видят все)
            </Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
