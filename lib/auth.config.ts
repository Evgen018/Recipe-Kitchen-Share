import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

/**
 * Конфиг Auth.js БЕЗ Prisma — для Edge (middleware).
 * Не импортировать lib/prisma или что-либо с node:path.
 */
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    redirect: async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
    jwt: async ({ token, user }: { token: any; user?: any }) => {
      if (user) token.uid = user.id
      return token
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      if (session.user) session.user.id = token.uid as string
      return session
    },
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  trustHost: true,
}

/** auth() для middleware — без Prisma, годится для Edge */
export const { auth } = NextAuth(authConfig)
