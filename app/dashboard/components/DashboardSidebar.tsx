'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, History, MessageSquare, Settings, Star, User, X, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard/profile', label: 'Профиль', icon: User },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentPath = usePathname() ?? ''
  const name = user.name || user.email || 'Пользователь'
  const shortName = name.includes(' ') ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : name.slice(0, 2)

  const sidebarContent = (
    <>
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
              onClick={() => setMobileMenuOpen(false)}
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
    </>
  )

  return (
    <>
      {/* Кнопка меню для мобильных */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-md md:hidden"
        aria-label="Открыть меню"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {/* Overlay для мобильных */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar для десктопа */}
      <aside
        className={cn(
          'hidden md:block w-[280px] shrink-0 rounded-xl border border-slate-200/80 bg-gradient-to-b from-sky-50 to-slate-50/80',
          'shadow-sm'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar для мобильных (выдвижное меню) */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-[280px] transform transition-transform duration-300 ease-in-out',
          'border-r border-slate-200/80 bg-gradient-to-b from-sky-50 to-slate-50/80 shadow-xl',
          'md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-800">Меню</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}
