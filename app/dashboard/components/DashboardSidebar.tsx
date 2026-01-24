'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, History, MessageSquare, Settings, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Мои рецепты', icon: MessageSquare },
  { href: '/dashboard/public', label: 'Публичные рецепты', icon: Globe },
  { href: '/dashboard/favorites', label: 'Избранное', icon: Star },
  { href: '/dashboard/history', label: 'История', icon: History },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
] as const

interface DashboardSidebarProps {
  user: { name?: string | null; image?: string | null; email?: string | null }
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const currentPath = usePathname() ?? ''
  const name = user.name || user.email || 'Пользователь'
  const shortName = name.includes(' ') ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : name.slice(0, 2)

  return (
    <aside
      className={cn(
        'w-[280px] shrink-0 rounded-xl border border-slate-200/80 bg-gradient-to-b from-sky-50 to-slate-50/80',
        'shadow-sm'
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-medium text-slate-600">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" width={48} height={48} className="h-12 w-12 object-cover" />
            ) : (
              shortName.toUpperCase()
            )}
          </div>
          <span className="truncate text-sm font-medium text-slate-800">{name}</span>
        </div>
      </div>
      <nav className="space-y-0.5 px-2 pb-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = currentPath === href || (href !== '/dashboard' && currentPath.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-sky-100/90 text-sky-800'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
