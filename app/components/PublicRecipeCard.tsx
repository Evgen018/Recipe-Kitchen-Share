'use client'

import Link from 'next/link'
import { LikeButton } from '@/app/dashboard/components/LikeButton'

type Recipe = {
  id: string
  title: string
  content: string
  description?: string | null
  likesCount: number
  likedByMe: boolean
  tags?: Array<{
    tag: {
      name: string
    }
  }>
}

interface PublicRecipeCardProps {
  recipe: Recipe
}

function preview(text: string, max = 120) {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : t.slice(0, max) + '…'
}

export function PublicRecipeCard({ recipe }: PublicRecipeCardProps) {
  const description = recipe.description || preview(recipe.content, 120)

  return (
    <article
      className="recipe-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        background: 'white',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ flex: 1 }}>
        <Link
          href={`/recipes/${recipe.id}`}
          className="recipe-card-link"
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#1f2937',
            textDecoration: 'none',
            display: 'block',
            marginBottom: '0.5rem',
            transition: 'color 0.2s',
          }}
        >
          {recipe.title}
        </Link>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>
        {recipe.tags && recipe.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '0.75rem',
            }}
          >
            {recipe.tags.slice(0, 3).map((recipeTag) => (
              <span
                key={recipeTag.tag.name}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
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
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <LikeButton
          recipeId={recipe.id}
          initialLiked={recipe.likedByMe}
          initialCount={recipe.likesCount}
        />
      </div>
    </article>
  )
}
