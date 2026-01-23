import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Создаем тестового пользователя для заметок
  const user = await prisma.user.upsert({
    where: { email: 'seed@example.com' },
    update: {},
    create: {
      email: 'seed@example.com',
      name: 'Seed User',
    },
  })

  // Очищаем существующие записи
  await prisma.note.deleteMany()

  // Создаем тестовые записи
  const notes = await prisma.note.createMany({
    data: [
      { title: 'Первая заметка', ownerId: user.id },
      { title: 'Вторая заметка', ownerId: user.id },
      { title: 'Третья заметка', ownerId: user.id },
    ],
  })

  console.log(`✅ Created ${notes.count} notes for user ${user.email}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
