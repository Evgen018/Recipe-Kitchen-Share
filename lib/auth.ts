import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth.config'

/** Полный конфиг с Prisma — только для Node (API, Server Components). Не использовать в middleware (Edge). */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as any),
})
