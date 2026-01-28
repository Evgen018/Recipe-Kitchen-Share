import { PrismaClient, RecipeVisibility } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'
import { normalizeSslMode } from '../lib/db-connection'

const connectionString = normalizeSslMode(process.env.DATABASE_URL!)
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🧪 Создание тестовых данных...')

  // 1. Создаем тестового пользователя
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Тестовый Пользователь',
    },
  })
  console.log(`✅ Пользователь создан: ${user.email} (ID: ${user.id})`)

  // 2. Создаем категорию
  const category = await prisma.category.upsert({
    where: { category: 'Основные блюда' },
    update: {},
    create: {
      category: 'Основные блюда',
    },
  })
  console.log(`✅ Категория создана: ${category.category} (ID: ${category.id})`)

  // 3. Создаем тестовый рецепт
  const recipe = await prisma.recipe.create({
    data: {
      title: 'Тестовый рецепт борща',
      content: `
        Ингредиенты:
        - Свекла 2 шт
        - Капуста 300г
        - Морковь 1 шт
        - Лук 1 шт
        - Мясо 500г
        
        Приготовление:
        1. Варим мясо
        2. Добавляем овощи
        3. Варим до готовности
      `,
      description: 'Классический рецепт борща',
      ownerId: user.id,
      categoryId: category.id,
      visibility: RecipeVisibility.PUBLIC,
      publishedAt: new Date(),
    },
  })
  console.log(`✅ Рецепт создан: ${recipe.title} (ID: ${recipe.id})`)

  // 4. Создаем тег
  const tag = await prisma.tag.upsert({
    where: { name: 'суп' },
    update: {},
    create: {
      name: 'суп',
    },
  })
  console.log(`✅ Тег создан: ${tag.name} (ID: ${tag.id})`)

  // 5. Связываем рецепт с тегом
  await prisma.recipeTag.create({
    data: {
      recipeId: recipe.id,
      tagId: tag.id,
    },
  })
  console.log(`✅ Рецепт связан с тегом`)

  // 6. Создаем голос за рецепт
  const vote = await prisma.vote.create({
    data: {
      userId: user.id,
      recipeId: recipe.id,
      value: 1,
    },
  })
  console.log(`✅ Голос создан: пользователь ${user.email} проголосовал за рецепт "${recipe.title}"`)

  // 7. Создаем заметку для пользователя
  const note = await prisma.note.create({
    data: {
      ownerId: user.id,
      title: 'Тестовая заметка',
    },
  })
  console.log(`✅ Заметка создана: ${note.title} (ID: ${note.id})`)

  console.log('\n🎉 Все тестовые данные успешно созданы!')
  console.log('\n📊 Сводка:')
  console.log(`   - Пользователь: ${user.email}`)
  console.log(`   - Рецепт: ${recipe.title} (${recipe.visibility})`)
  console.log(`   - Голос: создан`)
  console.log(`   - Тег: ${tag.name}`)
  console.log(`   - Заметка: ${note.title}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Ошибка:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
