import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'

/** POST /api/recipes/[id]/like — toggle лайк. Только публичные рецепты. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { id: recipeId } = await params
    if (!recipeId) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true, visibility: true },
    })
    if (!recipe || recipe.visibility !== 'PUBLIC') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const existing = await prisma.like.findUnique({
      where: { userId_recipeId: { userId: session.user.id, recipeId } },
    })

    if (existing) {
      await prisma.like.delete({
        where: { userId_recipeId: { userId: session.user.id, recipeId } },
      })
    } else {
      await prisma.like.create({
        data: { userId: session.user.id, recipeId },
      })
    }

    const likesCount = await prisma.like.count({ where: { recipeId } })
    const liked = !existing

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')
    revalidateTag('dashboard-public', 'max')

    return NextResponse.json({ liked, likesCount })
  } catch {
    return NextResponse.json(
      { error: 'Попробуйте позже' },
      { status: 500 }
    )
  }
}
