'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutGrid, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/app/components/LocaleProvider'

type ViewMode = 'cards' | 'table'

export function ViewToggle() {
  const t = useTranslations()
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams()
  const current = (searchParams.get('view') || 'cards') as ViewMode
  const isTable = current === 'table'

  function href(mode: ViewMode) {
    const p = new URLSearchParams(searchParams.toString())
    if (mode === 'cards') p.delete('view')
    else p.set('view', 'table')
    const q = p.toString()
    return q ? `${pathname}?${q}` : pathname
  }

  return (
    <div
      className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5"
      role="group"
      aria-label={t('view.label')}
    >
      <Link
        href={href('cards')}
        prefetch={false}
        title={t('view.cardsTitle')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
          !isTable
            ? 'bg-sky-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        {t('view.cards')}
      </Link>
      <Link
        href={href('table')}
        prefetch={false}
        title={t('view.tableTitle')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
          isTable
            ? 'bg-sky-500 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Table2 className="h-4 w-4" />
        {t('view.table')}
      </Link>
    </div>
  )
}
