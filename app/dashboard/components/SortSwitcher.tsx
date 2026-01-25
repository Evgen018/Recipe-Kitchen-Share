'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Flame, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortMode = 'popular' | 'recent'

export function SortSwitcher() {
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams()
  const current = (searchParams.get('sort') || 'recent') as SortMode
  const isPopular = current === 'popular'

  function href(mode: SortMode) {
    const p = new URLSearchParams(searchParams.toString())
    if (mode === 'recent') p.delete('sort')
    else p.set('sort', mode)
    const q = p.toString()
    return q ? `${pathname}?${q}` : pathname
  }

  return (
    <div
      className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5"
      role="group"
      aria-label="Сортировка"
    >
      <Link
        href={href('popular')}
        title="По популярности"
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
          isPopular
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Flame className="h-4 w-4" />
        Популярные
      </Link>
      <Link
        href={href('recent')}
        title="Сначала новые"
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
          !isPopular
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Clock className="h-4 w-4" />
        Новые
      </Link>
    </div>
  )
}
