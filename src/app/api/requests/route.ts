import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const masterId = searchParams.get('masterId')
    const role = searchParams.get('role')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (role === 'master' && masterId) {
      whereClause.assignedToId = parseInt(masterId)
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заявок' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientName, phone, address, problemText } = body

    if (!clientName || !phone || !address || !problemText) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    const newRequest = await prisma.request.create({
      data: {
        clientName,
        phone,
        address,
        problemText,
        status: 'new',
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании заявки' },
      { status: 500 }
    )
  }
}