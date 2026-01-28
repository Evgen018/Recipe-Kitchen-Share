import { prisma } from '@/lib/prisma'
import { RecipeVisibility } from '@/prisma/generated/prisma/client'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { LikeButton } from '@/app/dashboard/components/LikeButton'
import Link from 'next/link'

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
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
    },
  })

  if (!recipe || recipe.visibility !== RecipeVisibility.PUBLIC) {
    notFound()
  }

  const likesCount = recipe._count.likes
  const likedByMe = userId ? recipe.likes.length > 0 : false

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginBottom: '2rem',
          color: '#667eea',
          textDecoration: 'none',
          fontSize: '0.9rem',
        }}
      >
        ← Назад к рецептам
      </Link>

      <article>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: '#1f2937',
          }}
        >
          {recipe.title}
        </h1>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          {recipe.category && (
            <span
              style={{
                fontSize: '0.9rem',
                color: '#6b7280',
              }}
            >
              Категория: {recipe.category.category}
            </span>
          )}
          {recipe.owner && (
            <span
              style={{
                fontSize: '0.9rem',
                color: '#6b7280',
              }}
            >
              Автор: {recipe.owner.name || recipe.owner.email}
            </span>
          )}
          <LikeButton
            recipeId={recipe.id}
            initialLiked={likedByMe}
            initialCount={likesCount}
          />
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '2rem',
            }}
          >
            {recipe.tags.map((recipeTag) => (
              <span
                key={recipeTag.tag.name}
                style={{
                  fontSize: '0.875rem',
                  padding: '0.375rem 0.75rem',
                  background: '#f3f4f6',
                  color: '#4b5563',
                  borderRadius: '6px',
                }}
              >
                {recipeTag.tag.name}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '2rem',
            lineHeight: '1.8',
            color: '#374151',
            whiteSpace: 'pre-wrap',
          }}
        >
          {recipe.content}
        </div>
      </article>
    </div>
  )
}
