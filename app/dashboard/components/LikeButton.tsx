'use client'

import { ThumbsUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/app/components/LocaleProvider'

interface LikeButtonProps {
  recipeId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({ recipeId, initialLiked, initialCount }: LikeButtonProps) {
  const t = useTranslations()
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onClick = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/recipes/${recipeId}/like`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        setError(t(typeof data?.error === 'string' ? data.error : 'errors.tryLater'))
        return
      }
      setLiked(data.liked ?? !liked)
      setCount(typeof data.likesCount === 'number' ? data.likesCount : count + (data.liked ? 1 : -1))
    } catch {
      setError(t('errors.tryLater'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={loading}
        className={cn(
          'h-8 shrink-0 gap-1.5 px-2.5 border-slate-200 bg-white',
          liked && 'border-amber-200 bg-amber-50/80 text-amber-600'
        )}
        aria-label={liked ? t('recipe.unlike') : t('recipe.like')}
        title={liked ? t('recipe.unlikeTitle') : t('recipe.like')}
      >
        <ThumbsUp className={cn('h-4 w-4', liked && 'fill-current')} />
        <span className="text-sm tabular-nums">{count}</span>
      </Button>
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </span>
  )
}
