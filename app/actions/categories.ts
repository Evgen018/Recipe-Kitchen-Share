'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MAX_CATEGORIES = 20
const DEFAULT_NAMES = ['Напитки', 'Еда', 'Десерт']

const createCategorySchema = z.object({
  name: z.string().min(1, 'validation.nameRequired').max(100, 'validation.nameTooLong'),
})

async function ensureDefaults() {
  for (const name of DEFAULT_NAMES) {
    const exists = await prisma.category.findFirst({ where: { category: name } })
    if (!exists) await prisma.category.create({ data: { category: name } })
  }
}

/** Список всех категорий с количеством рецептов */
export async function listCategories() {
  const session = await auth()
  if (!session?.user?.id) return []

  await ensureDefaults()
  const categories = await prisma.category.findMany({
    orderBy: { category: 'asc' },
    include: { _count: { select: { recipes: true } } },
  })
  return categories.map((c) => ({ id: c.id, category: c.category, recipesCount: c._count.recipes }))
}

/** Добавить категорию. Не более 20 всего. */
export async function createCategory(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'errors.authRequired' }

  const raw = formData.get('name')
  const parsed = createCategorySchema.safeParse({ name: typeof raw === 'string' ? raw.trim() : '' })
  if (!parsed.success) {
    const key = parsed.error.flatten().fieldErrors.name?.[0]
    return { error: typeof key === 'string' ? key : 'validation.error' }
  }

  const name = parsed.data.name
  const total = await prisma.category.count()
  if (total >= MAX_CATEGORIES) return { error: 'errors.categoryLimit' }

  const existing = await prisma.category.findFirst({ where: { category: name } })
  if (existing) return { error: 'errors.categoryExists' }

  await prisma.category.create({ data: { category: name } })
  revalidatePath('/dashboard/categories')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/public')
  return { ok: true }
}
