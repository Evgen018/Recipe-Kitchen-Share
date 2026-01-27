'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RecipeVisibility } from '../../prisma/generated/prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

const recipeSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  content: z.string().min(1, 'Введите содержание'),
  isPublic: z.boolean(),
  categoryId: z.string().min(1, 'Выберите категорию'),
})

/** Получить или создать категорию по названию */
async function getOrCreateCategory(categoryName: string) {
  let cat = await prisma.category.findFirst({ where: { category: categoryName } })
  if (!cat) {
    cat = await prisma.category.create({ data: { category: categoryName } })
  }
  return cat
}

/** Получить все категории (для форм рецептов и выбора). Сначала обеспечиваем наличие базовых. */
export async function getAvailableCategories() {
  const defaults = ['Напитки', 'Еда', 'Десерт']
  await Promise.all(defaults.map((name) => getOrCreateCategory(name)))
  const categories = await prisma.category.findMany({
    orderBy: { category: 'asc' },
  })
  return categories
}

/** createRecipe: проверка прав — создаём только от своего userId. */
export async function createRecipe(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Необходима авторизация' }

  const parsed = recipeSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    isPublic: formData.get('isPublic') === 'true',
    categoryId: formData.get('categoryId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? 'Ошибка валидации' }
  }

  await prisma.recipe.create({
    data: {
      ownerId: session.user.id,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      content: parsed.data.content,
      visibility: parsed.data.isPublic ? RecipeVisibility.PUBLIC : RecipeVisibility.PRIVATE,
      updatedAt: new Date(),
    },
  })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/public')
  revalidateTag('dashboard-public')
  return { ok: true }
}

/** updateRecipe: только владелец может редактировать. */
export async function updateRecipe(recipeId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Необходима авторизация' }

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
  if (!recipe) return { error: 'Рецепт не найден' }
  if (recipe.ownerId !== session.user.id) return { error: 'Нет прав на редактирование' }

  const parsed = recipeSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    isPublic: formData.get('isPublic') === 'true',
    categoryId: formData.get('categoryId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? 'Ошибка валидации' }
  }

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId,
      visibility: parsed.data.isPublic ? RecipeVisibility.PUBLIC : RecipeVisibility.PRIVATE,
      updatedAt: new Date(),
    },
  })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/public')
  revalidatePath('/dashboard/favorites')
  revalidateTag('dashboard-public')
  return { ok: true }
}

/** deleteRecipe: только владелец может удалять. */
export async function deleteRecipe(recipeId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Необходима авторизация' }

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
  if (!recipe) return { error: 'Рецепт не найден' }
  if (recipe.ownerId !== session.user.id) return { error: 'Нет прав на удаление' }

  await prisma.recipe.delete({ where: { id: recipeId } })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/public')
  revalidatePath('/dashboard/favorites')
  revalidateTag('dashboard-public')
  return { ok: true }
}

/** togglePublic: только владелец. */
export async function togglePublic(recipeId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Необходима авторизация' }

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
  if (!recipe) return { error: 'Рецепт не найден' }
  if (recipe.ownerId !== session.user.id) return { error: 'Нет прав' }

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      visibility: recipe.visibility === RecipeVisibility.PUBLIC ? RecipeVisibility.PRIVATE : RecipeVisibility.PUBLIC,
      updatedAt: new Date(),
    },
  })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/public')
  revalidatePath('/dashboard/favorites')
  revalidateTag('dashboard-public')
  return { ok: true }
}

/** saveRecipe: единая точка для формы — при наличии recipeId вызывает updateRecipe, иначе createRecipe. */
export async function saveRecipe(formData: FormData) {
  const recipeId = (formData.get('recipeId') as string) || null
  if (recipeId) return updateRecipe(recipeId, formData)
  return createRecipe(formData)
}

/** toggleFavorite: добавить/удалить из избранного для текущего пользователя. */
export async function toggleFavorite(recipeId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Необходима авторизация' }

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
  if (!recipe) return { error: 'Рецепт не найден' }

  const existing = await prisma.recipeFavorite.findUnique({
    where: { userId_recipeId: { userId: session.user.id, recipeId } },
  })
  if (existing) {
    await prisma.recipeFavorite.delete({
      where: { userId_recipeId: { userId: session.user.id, recipeId } },
    })
  } else {
    await prisma.recipeFavorite.create({
      data: { userId: session.user.id, recipeId },
    })
  }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/public')
  revalidatePath('/dashboard/favorites')
  revalidateTag('dashboard-public')
  return { ok: true }
}

/** Получить недавние публичные рецепты */
export async function getRecentRecipes(limit: number = 20) {
  const session = await auth()
  const userId = session?.user?.id

  const recipes = await prisma.recipe.findMany({
    where: {
      visibility: RecipeVisibility.PUBLIC,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
      ...(userId
        ? {
            likes: {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            },
          }
        : {}),
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  return recipes.map((recipe) => ({
    ...recipe,
    likesCount: recipe._count.likes,
    likedByMe: userId ? recipe.likes.length > 0 : false,
  }))
}

/** Получить популярные публичные рецепты (по количеству лайков) */
export async function getPopularRecipes(limit: number = 20) {
  const session = await auth()
  const userId = session?.user?.id

  // Сначала получаем все публичные рецепты с подсчетом лайков
  const recipes = await prisma.recipe.findMany({
    where: {
      visibility: RecipeVisibility.PUBLIC,
    },
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
      ...(userId
        ? {
            likes: {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            },
          }
        : {}),
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  // Сортируем по количеству лайков и берем топ
  const sortedRecipes = recipes
    .sort((a, b) => b._count.likes - a._count.likes)
    .slice(0, limit)

  return sortedRecipes.map((recipe) => ({
    ...recipe,
    likesCount: recipe._count.likes,
    likedByMe: userId ? recipe.likes.length > 0 : false,
  }))
}

