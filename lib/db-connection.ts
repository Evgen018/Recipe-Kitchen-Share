import { PrismaClient } from '../prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

export function createPrismaClient(connectionString: string): PrismaClient {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export async function getTableNames(prisma: PrismaClient): Promise<string[]> {
  // Список моделей Prisma с их именами в БД
  const models = [
    { name: 'User', dbName: 'users' },
    { name: 'Note', dbName: 'notes' },
    { name: 'Category', dbName: 'categories' },
    { name: 'Recipe', dbName: 'recipes' },
    { name: 'Tag', dbName: 'tags' },
    { name: 'RecipeTag', dbName: 'recipe_tags' },
    { name: 'Vote', dbName: 'votes' },
  ]
  
  // Проверяем, какие таблицы существуют в БД
  const existingTables: string[] = []
  
  for (const model of models) {
    try {
      const modelName = model.name.charAt(0).toLowerCase() + model.name.slice(1)
      if (modelName in prisma && typeof (prisma as any)[modelName]?.findMany === 'function') {
        await (prisma as any)[modelName].findMany({ take: 1 })
        existingTables.push(model.name)
      }
    } catch (error) {
      // Таблица не существует или недоступна
    }
  }
  
  return existingTables
}
