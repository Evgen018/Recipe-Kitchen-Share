'use client'

import { MessageSquare, Pencil, Star, Trash2, Globe, Lock } from 'lucide-react'
import { useTransition } from 'react'
import {
  deleteRecipe,
  toggleFavorite,
  togglePublic,
} from '@/app/actions/recipes'
import { Button } from '@/app/components/ui/button'
import { RecipeDialog } from './RecipeDialog'
import { cn } from '@/lib/utils'

type Recipe = {
  id: string
  title: string
  content: string
  visibility: string
  ownerId: string
  favoritedBy?: { userId: string }[]
}

interface RecipeCardProps {
  recipe: Recipe
  currentUserId: string
  /** На публичной странице — скрывать кнопку удаления, если не владелец. */
  canDelete?: boolean
}

function preview(text: string, max = 120) {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : t.slice(0, max) + '…'
}

export function RecipeCard({ recipe, currentUserId, canDelete = true }: RecipeCardProps) {
  const [pending, startTransition] = useTransition()
  const isOwner = recipe.ownerId === currentUserId
  const isPublic = recipe.visibility === 'PUBLIC'
  const isFav = recipe.favoritedBy?.some((f) => f.userId === currentUserId) ?? false

  const onDelete = () => {
    if (!confirm('Удалить рецепт?')) return
    startTransition(async () => {
      await deleteRecipe(recipe.id)
    })
  }

  const onTogglePublic = () => {
    startTransition(async () => {
      await togglePublic(recipe.id)
    })
  }

  const onToggleFavorite = () => {
    startTransition(async () => {
      await toggleFavorite(recipe.id)
    })
  }

  const showDelete = canDelete && isOwner

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow',
        pending && 'opacity-70'
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{recipe.title}</h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
            {preview(recipe.content)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleFavorite}
          disabled={pending}
          className={isFav ? 'text-amber-500' : 'text-slate-400'}
          aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
        >
          <Star className={cn('h-4 w-4', isFav && 'fill-current')} />
        </Button>
        {isOwner && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onTogglePublic}
            disabled={pending}
            aria-label={isPublic ? 'Сделать приватным' : 'Опубликовать'}
            title={isPublic ? 'Публичный' : 'Приватный'}
          >
            {isPublic ? (
              <Globe className="h-4 w-4 text-slate-500" />
            ) : (
              <Lock className="h-4 w-4 text-slate-500" />
            )}
          </Button>
        )}
        {isOwner && (
          <RecipeDialog
            recipe={recipe}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Редактировать">
                <Pencil className="h-4 w-4 text-slate-500" />
              </Button>
            }
          />
        )}
        {showDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            disabled={pending}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </article>
  )
}
