'use client'

import { Pencil, Star, ThumbsUp, Trash2, Globe, Lock } from 'lucide-react'
import { useState, useTransition } from 'react'
import {
  deleteRecipe,
  toggleFavorite,
  toggleLike,
  togglePublic,
} from '@/app/actions/recipes'
import { Button } from '@/app/components/ui/button'
import { RecipeViewModal } from './RecipeViewModal'
import { cn } from '@/lib/utils'

type RecipeRow = {
  id: string
  title: string
  content: string
  visibility: string
  ownerId: string
  updatedAt: Date
  favoritedBy?: { userId: string }[]
  votes?: { id: string }[]
  category?: { category: string } | null
  _count?: { votes: number }
  /** Вычисляется на сервере: показывать ли кнопку удаления для этой строки. */
  showDelete?: boolean
}

interface RecipeTableProps {
  recipes: RecipeRow[]
  currentUserId: string
}

function preview(text: string, max = 60) {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : t.slice(0, max) + '…'
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('ru-RU')
}

export function RecipeTable({ recipes, currentUserId }: RecipeTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              Заголовок
            </th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              Описание
            </th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              Категория
            </th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              Нравится
            </th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              Обновлено
            </th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              Статус
            </th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((r) => (
            <RecipeTableRow
              key={r.id}
              recipe={r}
              currentUserId={currentUserId}
              showDelete={r.showDelete ?? false}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecipeTableRow({
  recipe: r,
  currentUserId,
  showDelete,
}: {
  recipe: RecipeRow
  currentUserId: string
  showDelete: boolean
}) {
  const [viewOpen, setViewOpen] = useState(false)
  const [openInEditMode, setOpenInEditMode] = useState(false)
  const [pending, startTransition] = useTransition()
  const isOwner = r.ownerId === currentUserId
  const isPublic = r.visibility === 'PUBLIC'
  const isFav = r.favoritedBy?.some((f) => f.userId === currentUserId) ?? false
  const likesCount = r._count?.votes ?? 0
  const hasLiked = (r.votes?.length ?? 0) > 0

  const onToggleLike = () => {
    startTransition(async () => {
      await toggleLike(r.id)
    })
  }

  const onDelete = () => {
    if (!confirm('Удалить рецепт?')) return
    startTransition(async () => { await deleteRecipe(r.id) })
  }
  const onTogglePublic = () => {
    startTransition(async () => { await togglePublic(r.id) })
  }
  const onToggleFavorite = () => {
    startTransition(async () => { await toggleFavorite(r.id) })
  }

  return (
    <tr
      className={cn(
        'border-b border-slate-100 last:border-0',
        pending && 'opacity-70'
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={() => { setOpenInEditMode(false); setViewOpen(true) }}
            className="text-left font-medium text-slate-900 cursor-pointer hover:underline hover:text-sky-600"
            title="Открыть рецепт"
          >
            {r.title}
          </button>
        </div>
        <RecipeViewModal
          recipe={{
            id: r.id,
            title: r.title,
            content: r.content,
            visibility: r.visibility,
          }}
          isOwner={isOwner}
          open={viewOpen}
          onOpenChange={setViewOpen}
          initialMode={openInEditMode ? 'edit' : 'view'}
        />
      </td>
      <td className="max-w-[200px] px-4 py-3 text-slate-600">
        {preview(r.content)}
      </td>
      <td className="px-4 py-3 text-slate-500">
        {r.category?.category ?? '—'}
      </td>
      <td className="px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleLike}
          disabled={pending}
          className={cn(
            'h-8 shrink-0 gap-1.5 px-2.5 border-slate-200 bg-white',
            hasLiked && 'border-amber-200 bg-amber-50/80 text-amber-600'
          )}
          aria-label={hasLiked ? 'Убрать «Нравится»' : 'Нравится'}
          title={hasLiked ? 'Убрать «Нравится» (дизлайк)' : 'Нравится'}
        >
          <ThumbsUp className={cn('h-4 w-4', hasLiked && 'fill-current')} />
          <span className="text-sm tabular-nums">{likesCount}</span>
        </Button>
      </td>
      <td className="px-4 py-3 text-slate-600">
        {formatDate(r.updatedAt)}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-block rounded-md px-2 py-0.5 text-xs font-medium',
            isPublic ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
          )}
        >
          {isPublic ? 'Публичный' : 'Приватный'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
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
      </td>
    </tr>
  )
}
