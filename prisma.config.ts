import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Добавляем uselibpqcompat=true, чтобы pg-connection-string не выводил
// "SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'".
// При sslmode=verify-full поведение SSL не меняется.
function silenceSslModeWarning(url: string): string {
  if (!url) return url
  const sep = url.includes('?') ? '&' : '?'
  return url.includes('uselibpqcompat=') ? url : `${url}${sep}uselibpqcompat=true`
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: silenceSslModeWarning(env('DATABASE_URL')),
  },
})
