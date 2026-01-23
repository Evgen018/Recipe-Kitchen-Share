import { NextRequest, NextResponse } from 'next/server'
import { createPrismaClient, getTableNames } from '@/lib/db-connection'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = searchParams.get('type') || 'local'
    const customUrl = searchParams.get('url')

    let connectionString: string

    if (dbType === 'production' && customUrl) {
      connectionString = customUrl
    } else {
      // Используем локальную БД из .env
      connectionString = process.env.DATABASE_URL!
      if (!connectionString) {
        return NextResponse.json(
          { error: 'DATABASE_URL not found in environment variables' },
          { status: 400 }
        )
      }
    }

    const prisma = createPrismaClient(connectionString)
    const tables = await getTableNames(prisma)
    await prisma.$disconnect()

    return NextResponse.json({ tables })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}
