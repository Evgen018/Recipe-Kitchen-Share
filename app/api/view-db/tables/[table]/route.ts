import { NextRequest, NextResponse } from 'next/server'
import { createPrismaClient } from '@/lib/db-connection'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params
    const searchParams = request.nextUrl.searchParams
    const dbType = searchParams.get('type') || 'local'
    const customUrl = searchParams.get('url')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let connectionString: string

    if (dbType === 'production' && customUrl) {
      connectionString = customUrl
    } else {
      connectionString = process.env.DATABASE_URL!
      if (!connectionString) {
        return NextResponse.json(
          { error: 'DATABASE_URL not found' },
          { status: 400 }
        )
      }
    }

    const prisma = createPrismaClient(connectionString)
    const tableName = table.toLowerCase()

    // Маппинг имен таблиц к Prisma моделям
    const modelMap: Record<string, string> = {
      user: 'user',
      note: 'note',
      category: 'category',
      recipe: 'recipe',
      tag: 'tag',
      recipetag: 'recipeTag',
      vote: 'vote',
    }

    const modelName = modelMap[tableName]
    if (!modelName) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: `Table ${table} not found` },
        { status: 404 }
      )
    }

    const model = (prisma as any)[modelName]
    if (!model || typeof model.findMany !== 'function') {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: `Model ${modelName} not available` },
        { status: 404 }
      )
    }

    // Получаем данные с пагинацией
    const [data, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      model.count(),
    ])

    await prisma.$disconnect()

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params
    const searchParams = request.nextUrl.searchParams
    const dbType = searchParams.get('type') || 'local'
    const customUrl = searchParams.get('url')
    const body = await request.json()

    let connectionString: string

    if (dbType === 'production' && customUrl) {
      connectionString = customUrl
    } else {
      connectionString = process.env.DATABASE_URL!
      if (!connectionString) {
        return NextResponse.json(
          { error: 'DATABASE_URL not found' },
          { status: 400 }
        )
      }
    }

    const prisma = createPrismaClient(connectionString)
    const tableName = table.toLowerCase()

    const modelMap: Record<string, string> = {
      user: 'user',
      note: 'note',
      category: 'category',
      recipe: 'recipe',
      tag: 'tag',
      recipetag: 'recipeTag',
      vote: 'vote',
    }

    const modelName = modelMap[tableName]
    if (!modelName) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: `Table ${table} not found` },
        { status: 404 }
      )
    }

    const model = (prisma as any)[modelName]
    const result = await model.create({ data: body })
    await prisma.$disconnect()

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params
    const searchParams = request.nextUrl.searchParams
    const dbType = searchParams.get('type') || 'local'
    const customUrl = searchParams.get('url')
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    let connectionString: string

    if (dbType === 'production' && customUrl) {
      connectionString = customUrl
    } else {
      connectionString = process.env.DATABASE_URL!
      if (!connectionString) {
        return NextResponse.json(
          { error: 'DATABASE_URL not found' },
          { status: 400 }
        )
      }
    }

    const prisma = createPrismaClient(connectionString)
    const tableName = table.toLowerCase()

    const modelMap: Record<string, string> = {
      user: 'user',
      note: 'note',
      category: 'category',
      recipe: 'recipe',
      tag: 'tag',
      recipetag: 'recipeTag',
      vote: 'vote',
    }

    const modelName = modelMap[tableName]
    if (!modelName) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: `Table ${table} not found` },
        { status: 404 }
      )
    }

    const model = (prisma as any)[modelName]
    const result = await model.update({
      where: { id },
      data,
    })
    await prisma.$disconnect()

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params
    const searchParams = request.nextUrl.searchParams
    const dbType = searchParams.get('type') || 'local'
    const customUrl = searchParams.get('url')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    let connectionString: string

    if (dbType === 'production' && customUrl) {
      connectionString = customUrl
    } else {
      connectionString = process.env.DATABASE_URL!
      if (!connectionString) {
        return NextResponse.json(
          { error: 'DATABASE_URL not found' },
          { status: 400 }
        )
      }
    }

    const prisma = createPrismaClient(connectionString)
    const tableName = table.toLowerCase()

    const modelMap: Record<string, string> = {
      user: 'user',
      note: 'note',
      category: 'category',
      recipe: 'recipe',
      tag: 'tag',
      recipetag: 'recipeTag',
      vote: 'vote',
    }

    const modelName = modelMap[tableName]
    if (!modelName) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: `Table ${table} not found` },
        { status: 404 }
      )
    }

    const model = (prisma as any)[modelName]
    await model.delete({ where: { id } })
    await prisma.$disconnect()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete record' },
      { status: 500 }
    )
  }
}
