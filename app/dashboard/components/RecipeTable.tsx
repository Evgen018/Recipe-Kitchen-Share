'use client'

import { Pencil, Star, Trash2, Globe, Lock, Download } from 'lucide-react'
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
import { useTranslations } from '@/app/components/LocaleProvider'

type RecipeRow = {
  id: string
  title: string
  content: string
  visibility: string
  ownerId: string
  categoryId?: string
  updatedAt: Date
  favoritedBy?: { userId: string }[]
  likes?: { id: string }[]
  category?: { category: string } | null
  _count?: { likes: number }
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
  const t = useTranslations()
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-2 md:px-4 py-2 md:py-3 font-semibold uppercase tracking-wide text-slate-500 text-xs md:text-sm">
              {t('table.title')}
            </th>
            <th className="hidden md:table-cell px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              {t('table.description')}
            </th>
            <th className="hidden lg:table-cell px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              {t('table.category')}
            </th>
            <th className="hidden lg:table-cell px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
              {t('table.updated')}
            </th>
            <th className="px-2 md:px-4 py-2 md:py-3 font-semibold uppercase tracking-wide text-slate-500 text-xs md:text-sm">
              {t('table.status')}
            </th>
            <th className="px-2 md:px-4 py-2 md:py-3 font-semibold uppercase tracking-wide text-slate-500 text-xs md:text-sm">
              {t('table.likes')}
            </th>
            <th className="px-2 md:px-4 py-2 md:py-3 font-semibold uppercase tracking-wide text-slate-500 text-xs md:text-sm">
              {t('table.actions')}
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
  const t = useTranslations()
  const [viewOpen, setViewOpen] = useState(false)
  const [openInEditMode, setOpenInEditMode] = useState(false)
  const [pending, startTransition] = useTransition()
  const isOwner = r.ownerId === currentUserId
  const isPublic = r.visibility === 'PUBLIC'
  const isFav = r.favoritedBy?.some((f) => f.userId === currentUserId) ?? false
  const likesCount = r._count?.likes ?? 0
  const hasLiked = (r.likes?.length ?? 0) > 0

  const onDelete = () => {
    if (!confirm(t('recipe.deleteConfirm'))) return
    startTransition(async () => { await deleteRecipe(r.id) })
  }
  const onTogglePublic = () => {
    startTransition(async () => { await togglePublic(r.id) })
  }
  const onToggleFavorite = () => {
    startTransition(async () => { await toggleFavorite(r.id) })
  }

  const onDownload = () => {
    const content = `${r.title}\n\n${r.content}\n\n${t('recipe.categoryLabel')}: ${r.category?.category ?? '—'}\n${t('recipe.updated')}: ${formatDate(r.updatedAt)}\n${t('recipe.status')}: ${isPublic ? t('recipe.public') : t('recipe.private')}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${r.title.replace(/[^a-zа-яё0-9]/gi, '_')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <tr
      className={cn(
        'border-b border-slate-100 last:border-0',
        pending && 'opacity-70'
      )}
    >
      <td className="px-2 md:px-4 py-2 md:py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleFavorite}
            disabled={pending}
            className={cn('shrink-0', isFav ? 'text-amber-500' : 'text-slate-400')}
            aria-label={isFav ? t('recipe.unfav') : t('recipe.fav')}
            title={isFav ? t('recipe.unfav') : t('recipe.fav')}
          >
            <Star className={cn('h-4 w-4', isFav && 'fill-current')} />
          </Button>
          <button
            type="button"
            onClick={() => { setOpenInEditMode(false); setViewOpen(true) }}
            className="text-left font-medium text-sm md:text-base text-slate-900 cursor-pointer hover:underline hover:text-sky-600"
            title={t('recipe.openRecipe')}
          >
            {r.title}
          </button>
        </div>
        <div className="mt-1 md:hidden text-xs text-slate-500">
          {r.category?.category && <span className="mr-2">{t('recipe.categoryLabel')}: {r.category.category}</span>}
          <span>{t('recipe.updated')}: {formatDate(r.updatedAt)}</span>
        </div>
        <RecipeViewModal
          recipe={{
            id: r.id,
            title: r.title,
            content: r.content,
            visibility: r.visibility,
            categoryId: r.categoryId,
          }}
          isOwner={isOwner}
          open={viewOpen}
          onOpenChange={setViewOpen}
          initialMode={openInEditMode ? 'edit' : 'view'}
        />
      </td>
      <td className="hidden md:table-cell max-w-[200px] px-4 py-3 text-slate-600 text-sm">
        {preview(r.content)}
      </td>
      <td className="hidden lg:table-cell px-4 py-3 text-slate-500 text-sm">
        {r.category?.category ?? '—'}
      </td>
      <td className="hidden lg:table-cell px-4 py-3 text-slate-600 text-sm">
        {formatDate(r.updatedAt)}
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <span
          className={cn(
            'inline-block rounded-md px-2 py-0.5 text-xs font-medium',
            isPublic ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
          )}
        >
          {isPublic ? t('recipe.public') : t('recipe.private')}
        </span>
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        {isPublic ? (
          <LikeButton
            recipeId={r.id}
            initialLiked={hasLiked}
            initialCount={likesCount}
          />
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-2 md:px-4 py-2 md:py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDownload}
            aria-label={t('recipe.download')}
            title={t('recipe.download')}
          >
            <Download className="h-4 w-4 text-slate-500" />
          </Button>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onTogglePublic}
              disabled={pending}
              aria-label={isPublic ? t('recipe.makePrivate') : t('recipe.publish')}
              title={isPublic ? t('recipe.makePrivate') : t('recipe.publishTitle')}
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
              aria-label={t('recipe.editShort')}
              title={t('recipe.edit')}
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
              aria-label={t('recipe.delete')}
              title={t('recipe.deleteTitle')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
