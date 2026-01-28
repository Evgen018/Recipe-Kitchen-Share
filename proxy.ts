import { auth } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAuth = !!req.auth
  const path = req.nextUrl.pathname
  const isProtected =
    path.startsWith('/dashboard') || path.startsWith('/my-prompts')

  if (isProtected && !isAuth) {
    const login = new URL('/', req.url)
    login.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/my-prompts/:path*'],
}
