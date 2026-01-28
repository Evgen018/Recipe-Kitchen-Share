import { redirect } from 'next/navigation'

type SearchParams = { callbackUrl?: string | string[] }

/**
 * Вход теперь на главной (/). /login перенаправляет на / с сохранением callbackUrl.
 */
export default async function LoginPage({
  searchParams = {},
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const p = await Promise.resolve(searchParams ?? {})
  const cb = typeof p?.callbackUrl === 'string' ? p.callbackUrl : ''
  const q = cb ? '?callbackUrl=' + encodeURIComponent(cb) : ''
  redirect('/' + q)
}
