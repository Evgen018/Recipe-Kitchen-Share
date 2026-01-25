'use client'

import { Pencil, Star, Trash2, Globe, Lock } from 'lucide-react'
import { useState, useTransition } from 'react'
import {
  deleteRecipe,
  toggleFavorite,
  togglePublic,
} from '@/app/actions/recipes'
import { Button } from '@/app/components/ui/button'
import { LikeButton } from './LikeButton'
import { RecipeViewModal } from './RecipeViewModal'
import { cn } from '@/lib/utils'

type Recipe = {
  id: string
  title: string
  content: string
  visibility: string
  ownerId: string
  favoritedBy?: { userId: string }[]
  _count?: { likes: number }
  likes?: { id: string }[]
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
  const [viewOpen, setViewOpen] = useState(false)
  const [openInEditMode, setOpenInEditMode] = useState(false)
  const [pending, startTransition] = useTransition()
  const isOwner = recipe.ownerId === currentUserId
  const isPublic = recipe.visibility === 'PUBLIC'
  const isFav = recipe.favoritedBy?.some((f) => f.userId === currentUserId) ?? false
  const likesCount = recipe._count?.likes ?? 0
  const hasLiked = (recipe.likes?.length ?? 0) > 0

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
      <div className="flex items-start gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleFavorite}
          disabled={pending}
          className={cn('shrink-0', isFav ? 'text-amber-500' : 'text-slate-400')}
          aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
          title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <Star className={cn('h-4 w-4', isFav && 'fill-current')} />
        </Button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => { setOpenInEditMode(false); setViewOpen(true) }}
            className="text-left font-semibold text-slate-900 cursor-pointer hover:underline hover:text-sky-600"
            title="Открыть рецепт"
          >
            {recipe.title}
          </button>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
            {preview(recipe.content)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1">
        {isPublic && (
          <LikeButton
            recipeId={recipe.id}
            initialLiked={hasLiked}
            initialCount={likesCount}
          />
        )}
        {isOwner && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onTogglePublic}
            disabled={pending}
            aria-label={isPublic ? 'Сделать приватным' : 'Опубликовать'}
            title={isPublic ? 'Сделать приватным' : 'Опубликовать (видят все)'}
          >
            {isPublic ? (
              <Globe className="h-4 w-4 text-slate-500" />
            ) : (
              <Lock className="h-4 w-4 text-slate-500" />
            )}
          </Button>
        )}
        {isOwner && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => { setOpenInEditMode(true); setViewOpen(true) }}
            aria-label="Редактировать"
            title="Редактировать рецепт"
          >
            <Pencil className="h-4 w-4 text-slate-500" />
          </Button>
        )}
        {showDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            disabled={pending}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Удалить"
            title="Удалить рецепт"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <RecipeViewModal
        recipe={{
          id: recipe.id,
          title: recipe.title,
          content: recipe.content,
          visibility: recipe.visibility,
        }}
        isOwner={isOwner}
        open={viewOpen}
        onOpenChange={setViewOpen}
        initialMode={openInEditMode ? 'edit' : 'view'}
      />
    </article>
  )
}
