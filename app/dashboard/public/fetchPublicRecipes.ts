import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const CACHE_TAG_PUBLIC = 'dashboard-public'

type SortMode = 'recent' | 'popular'

async function fetchPublicRecipesImpl(
  userId: string,
  page: number,
  search: string,
  sort: SortMode
) {
  const PAGE_SIZE = 10
  const orderByPopular = sort === 'popular'
  const where = {
    visibility: 'PUBLIC' as const,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy: orderByPopular
        ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
        : { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        favoritedBy: {
          where: { userId },
          select: { userId: true },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        category: { select: { category: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.recipe.count({ where }),
  ])

  return { recipes, total }
}

export function getCachedPublicRecipes(
  userId: string,
  page: number,
  search: string,
  sort: SortMode
) {
  return unstable_cache(
    () => fetchPublicRecipesImpl(userId, page, search, sort),
    [CACHE_TAG_PUBLIC, userId, String(page), search, sort],
    { revalidate: 20, tags: [CACHE_TAG_PUBLIC] }
  )()
}
