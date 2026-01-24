'use client'

import { useState } from 'react'
import { saveRecipe } from '@/app/actions/recipes'
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
}

interface RecipeDialogProps {
  recipe?: Recipe | null
  trigger: React.ReactNode
}

export function RecipeDialog({ recipe, trigger }: RecipeDialogProps) {
  const [open, setOpen] = useState(false)
  const isEdit = !!recipe

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
            if (res?.ok) setOpen(false)
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
            <Label htmlFor="content">Содержание</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={recipe?.content}
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
