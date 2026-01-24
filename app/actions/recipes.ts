'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RecipeVisibility } from '../../prisma/generated/prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const recipeSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  content: z.string().min(1, 'Введите содержание'),
  isPublic: z.boolean(),
})

/** Категория по умолчанию для рецептов из личного кабинета (создаётся при необходимости). */
async function getOrCreateDefaultCategory() {
  let cat = await prisma.category.findFirst({ where: { category: 'Прочее' } })
  if (!cat) {
    cat = await prisma.category.create({ data: { category: 'Прочее' } })
  }
  return cat
}

/** createRecipe: проверка прав — создаём только от своего userId. */
export async function createRecipe(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Необходима авторизация' }

  const parsed = recipeSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    isPublic: formData.get('isPublic') === 'true',
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? 'Ошибка валидации' }
  }

  const cat = await getOrCreateDefaultCategory()
  await prisma.recipe.create({
    data: {
      ownerId: session.user.id,
      categoryId: cat.id,
      title: parsed.data.title,
      content: parsed.data.content,
      visibility: parsed.data.isPublic ? RecipeVisibility.PUBLIC : RecipeVisibility.PRIVATE,
      updatedAt: new Date(),
    },
  })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/public')
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
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? 'Ошибка валидации' }
  }

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      visibility: parsed.data.isPublic ? RecipeVisibility.PUBLIC : RecipeVisibility.PRIVATE,
      updatedAt: new Date(),
    },
  })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/public')
  revalidatePath('/dashboard/favorites')
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
  return { ok: true }
}
