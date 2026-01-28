'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Ссылка «Кабинет» — не показываем, когда пользователь уже в /dashboard. */
export function HeaderCabinetLink() {
  const pathname = usePathname() ?? ''
  const isInDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  if (isInDashboard) return null

  return (
    <Link
      href="/dashboard"
      style={{
        fontSize: '0.9rem',
        color: '#667eea',
        textDecoration: 'none',
      }}
    >
      Кабинет
    </Link>
  )
}
