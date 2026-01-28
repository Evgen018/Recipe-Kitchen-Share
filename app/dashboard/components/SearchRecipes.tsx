'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/app/components/LocaleProvider'

const DEBOUNCE_MS = 300

interface SearchRecipesProps {
  placeholder?: string
  className?: string
}

export function SearchRecipes({ placeholder, className }: SearchRecipesProps) {
  const t = useTranslations()
  const resolvedPlaceholder = placeholder ?? t('dashboard.searchPlaceholder')
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [value, setValue] = useState(q)

  useEffect(() => {
    setValue(q)
  }, [q])

  const apply = useCallback(
    (v: string) => {
      const u = new URLSearchParams(searchParams.toString())
      if (v.trim()) u.set('q', v.trim())
      else u.delete('q')
      u.delete('page')
      router.push(`?${u.toString()}`)
    },
    [router, searchParams]
  )

  // Вызывать apply только когда пользователь изменил поле относительно URL (q),
  // иначе при переходе на page=2 компонент монтируется заново и через 300ms
  // сбрасывает URL на первую страницу.
  useEffect(() => {
    const trimmedValue = value.trim()
    const trimmedQ = q.trim()
    if (trimmedValue === trimmedQ) return
    const t = setTimeout(() => apply(value), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [value, q, apply])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="pl-9"
      />
    </div>
  )
}
